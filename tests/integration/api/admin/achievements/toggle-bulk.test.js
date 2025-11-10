import { createMocks } from 'node-mocks-http';
import { PATCH } from '@/app/api/admin/achievements/[achievementId]/toggle-active/route';
import { POST as bulkActivateHandler } from '@/app/api/admin/achievements/bulk/activate/route';
import { POST as bulkDeactivateHandler } from '@/app/api/admin/achievements/bulk/deactivate/route';
import { getServerSession } from 'next-auth';
import achievementAdminService from '@/lib/services/achievementAdminService';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/services/achievementAdminService');
jest.mock('@/lib/db');

describe('Achievement Toggle and Bulk Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('PATCH /api/admin/achievements/[achievementId]/toggle-active', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        getServerSession.mockResolvedValue(null);

        const { req } = createMocks({ method: 'PATCH' });

        const response = await PATCH(req, { params: { achievementId: 'first-fast' } });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication required');
      });

      it('should return 403 when user is not admin', async () => {
        getServerSession.mockResolvedValue({
          user: { id: 'user123', email: 'user@test.com', isAdmin: false }
        });

        const { req } = createMocks({ method: 'PATCH' });

        const response = await PATCH(req, { params: { achievementId: 'first-fast' } });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Admin access required');
      });
    });

    describe('Toggle Active Status', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should toggle achievement from active to inactive', async () => {
        achievementAdminService.toggleActive.mockResolvedValue({
          achievementId: 'first-fast',
          isActive: false
        });

        const { req } = createMocks({
          method: 'PATCH',
          headers: {
            'x-forwarded-for': '192.168.1.1',
            'user-agent': 'Mozilla/5.0'
          }
        });

        const response = await PATCH(req, { params: { achievementId: 'first-fast' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.achievement.isActive).toBe(false);
        expect(data.message).toContain('deactivated');
      });

      it('should toggle achievement from inactive to active', async () => {
        achievementAdminService.toggleActive.mockResolvedValue({
          achievementId: 'first-fast',
          isActive: true
        });

        const { req } = createMocks({ method: 'PATCH' });

        const response = await PATCH(req, { params: { achievementId: 'first-fast' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.achievement.isActive).toBe(true);
        expect(data.message).toContain('activated');
      });

      it('should call achievementAdminService.toggleActive with correct parameters', async () => {
        achievementAdminService.toggleActive.mockResolvedValue({
          achievementId: 'first-fast',
          isActive: false
        });

        const { req } = createMocks({
          method: 'PATCH',
          headers: {
            'x-forwarded-for': '192.168.1.1',
            'user-agent': 'Mozilla/5.0'
          }
        });

        await PATCH(req, { params: { achievementId: 'first-fast' } });

        expect(achievementAdminService.toggleActive).toHaveBeenCalledWith(
          'first-fast',
          'admin123',
          '192.168.1.1',
          'Mozilla/5.0'
        );
      });

      it('should return 404 when achievement not found', async () => {
        achievementAdminService.toggleActive.mockRejectedValue({
          statusCode: 404,
          message: 'Achievement not found'
        });

        const { req } = createMocks({ method: 'PATCH' });

        const response = await PATCH(req, { params: { achievementId: 'nonexistent' } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toContain('not found');
      });
    });

    describe('Rate Limiting', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should include rate limit headers', async () => {
        achievementAdminService.toggleActive.mockResolvedValue({
          achievementId: 'first-fast',
          isActive: false
        });

        const { req } = createMocks({ method: 'PATCH' });

        const response = await PATCH(req, { params: { achievementId: 'first-fast' } });

        expect(
          response.headers.has('x-ratelimit-limit') || 
          response.headers.has('X-RateLimit-Limit')
        ).toBe(true);
      });
    });
  });

  describe('POST /api/admin/achievements/bulk/activate', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        getServerSession.mockResolvedValue(null);

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast', 'week-warrior'] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication required');
      });

      it('should return 403 when user is not admin', async () => {
        getServerSession.mockResolvedValue({
          user: { id: 'user123', email: 'user@test.com', isAdmin: false }
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast'] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Admin access required');
      });
    });

    describe('Bulk Activate', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should activate multiple achievements', async () => {
        achievementAdminService.bulkActivate.mockResolvedValue({
          modifiedCount: 3,
          achievementIds: ['first-fast', 'week-warrior', 'month-master']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast', 'week-warrior', 'month-master'] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(3);
        expect(data.message).toContain('3 achievements activated');
      });

      it('should return 400 when achievementIds is missing', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: {}
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('achievementIds');
      });

      it('should return 400 when achievementIds is not an array', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: 'not-an-array' }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('array');
      });

      it('should return 400 when achievementIds array is empty', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: [] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('empty');
      });

      it('should return 400 when achievementIds exceeds limit of 50', async () => {
        const tooManyIds = Array(51).fill('achievement-id');

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: tooManyIds }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('50');
      });

      it('should handle partial success', async () => {
        achievementAdminService.bulkActivate.mockResolvedValue({
          modifiedCount: 2,
          achievementIds: ['first-fast', 'week-warrior']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast', 'week-warrior', 'nonexistent'] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(2);
      });

      it('should call achievementAdminService.bulkActivate with correct parameters', async () => {
        achievementAdminService.bulkActivate.mockResolvedValue({
          modifiedCount: 2,
          achievementIds: ['first-fast', 'week-warrior']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast', 'week-warrior'] },
          headers: {
            'x-forwarded-for': '192.168.1.1',
            'user-agent': 'Mozilla/5.0'
          }
        });

        await bulkActivate(req);

        expect(achievementAdminService.bulkActivate).toHaveBeenCalledWith(
          ['first-fast', 'week-warrior'],
          'admin123',
          '192.168.1.1',
          'Mozilla/5.0'
        );
      });
    });
  });

  describe('POST /api/admin/achievements/bulk/deactivate', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        getServerSession.mockResolvedValue(null);

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast'] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication required');
      });

      it('should return 403 when user is not admin', async () => {
        getServerSession.mockResolvedValue({
          user: { id: 'user123', email: 'user@test.com', isAdmin: false }
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['first-fast'] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Admin access required');
      });
    });

    describe('Bulk Deactivate', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should deactivate multiple achievements', async () => {
        achievementAdminService.bulkDeactivate.mockResolvedValue({
          modifiedCount: 5,
          achievementIds: ['id1', 'id2', 'id3', 'id4', 'id5']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1', 'id2', 'id3', 'id4', 'id5'] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(5);
        expect(data.message).toContain('5 achievements deactivated');
      });

      it('should return 400 when achievementIds is missing', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: {}
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('achievementIds');
      });

      it('should return 400 when achievementIds is not an array', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: 'first-fast' }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
      });

      it('should return 400 when achievementIds array is empty', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: [] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
      });

      it('should return 400 when achievementIds exceeds limit of 50', async () => {
        const tooManyIds = Array(51).fill('id');

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: tooManyIds }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('50');
      });

      it('should call achievementAdminService.bulkDeactivate with correct parameters', async () => {
        achievementAdminService.bulkDeactivate.mockResolvedValue({
          modifiedCount: 3,
          achievementIds: ['id1', 'id2', 'id3']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1', 'id2', 'id3'] },
          headers: {
            'x-forwarded-for': '192.168.1.1',
            'user-agent': 'Mozilla/5.0'
          }
        });

        await bulkDeactivate(req);

        expect(achievementAdminService.bulkDeactivate).toHaveBeenCalledWith(
          ['id1', 'id2', 'id3'],
          'admin123',
          '192.168.1.1',
          'Mozilla/5.0'
        );
      });

      it('should handle case when no achievements modified', async () => {
        achievementAdminService.bulkDeactivate.mockResolvedValue({
          modifiedCount: 0,
          achievementIds: []
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['nonexistent1', 'nonexistent2'] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.count).toBe(0);
      });
    });

    describe('Rate Limiting', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should include rate limit headers for bulk activate', async () => {
        achievementAdminService.bulkActivate.mockResolvedValue({
          modifiedCount: 2,
          achievementIds: ['id1', 'id2']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1', 'id2'] }
        });

        const response = await bulkActivate(req);

        expect(
          response.headers.has('x-ratelimit-limit') || 
          response.headers.has('X-RateLimit-Limit')
        ).toBe(true);
      });

      it('should include rate limit headers for bulk deactivate', async () => {
        achievementAdminService.bulkDeactivate.mockResolvedValue({
          modifiedCount: 2,
          achievementIds: ['id1', 'id2']
        });

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1', 'id2'] }
        });

        const response = await bulkDeactivate(req);

        expect(
          response.headers.has('x-ratelimit-limit') || 
          response.headers.has('X-RateLimit-Limit')
        ).toBe(true);
      });
    });

    describe('Error Handling', () => {
      beforeEach(() => {
        getServerSession.mockResolvedValue({
          user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
        });
      });

      it('should return 500 when bulkActivate service throws error', async () => {
        achievementAdminService.bulkActivate.mockRejectedValue(
          new Error('Database error')
        );

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1'] }
        });

        const response = await bulkActivate(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });

      it('should return 500 when bulkDeactivate service throws error', async () => {
        achievementAdminService.bulkDeactivate.mockRejectedValue(
          new Error('Database error')
        );

        const { req } = createMocks({
          method: 'POST',
          body: { achievementIds: ['id1'] }
        });

        const response = await bulkDeactivate(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBeDefined();
      });
    });
  });
});
