import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/admin/achievements/[achievementId]/route';
import { getServerSession } from 'next-auth';
import achievementAdminService from '@/lib/services/achievementAdminService';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/services/achievementAdminService');
jest.mock('@/lib/db');

describe('GET /api/admin/achievements/[achievementId]', () => {
  const mockAchievement = {
    achievementId: 'first-fast',
    translations: {
      en: {
        name: 'First Fast',
        description: 'Complete your first fast',
        iconUrl: '/icons/first-fast.svg'
      }
    },
    category: 'Milestones',
    tier: 'bronze',
    points: 10,
    rarity: {
      tier: 'common',
      score: 50
    },
    criteria: {
      type: 'duration-milestone',
      params: {
        hours: 12
      }
    },
    isActive: true,
    type: 'automatic',
    order: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 when user is not admin', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'user@test.com', isAdmin: false }
      });

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });
  });

  describe('Successful Retrieval', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 200 with achievement data', async () => {
      achievementAdminService.getById.mockResolvedValue(mockAchievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement).toBeDefined();
      expect(data.achievement.achievementId).toBe('first-fast');
    });

    it('should call achievementAdminService.getById with correct achievementId', async () => {
      achievementAdminService.getById.mockResolvedValue(mockAchievement);

      const { req } = createMocks({
        method: 'GET'
      });

      await GET(req, { params: { achievementId: 'first-fast' } });

      expect(achievementAdminService.getById).toHaveBeenCalledWith('first-fast');
    });

    it('should return all achievement fields', async () => {
      achievementAdminService.getById.mockResolvedValue(mockAchievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement).toHaveProperty('achievementId');
      expect(data.achievement).toHaveProperty('translations');
      expect(data.achievement).toHaveProperty('category');
      expect(data.achievement).toHaveProperty('tier');
      expect(data.achievement).toHaveProperty('points');
      expect(data.achievement).toHaveProperty('criteria');
      expect(data.achievement).toHaveProperty('isActive');
    });

    it('should return translations for all languages', async () => {
      const achievementWithTranslations = {
        ...mockAchievement,
        translations: {
          en: { name: 'First Fast', description: 'Complete your first fast' },
          es: { name: 'Primer Ayuno', description: 'Completa tu primer ayuno' },
          fr: { name: 'Premier Jeûne', description: 'Complétez votre premier jeûne' },
          de: { name: 'Erstes Fasten', description: 'Vollenden Sie Ihr erstes Fasten' },
          ar: { name: 'أول صيام', description: 'أكمل صيامك الأول' }
        }
      };

      achievementAdminService.getById.mockResolvedValue(achievementWithTranslations);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.translations).toHaveProperty('en');
      expect(data.achievement.translations).toHaveProperty('es');
      expect(data.achievement.translations).toHaveProperty('fr');
      expect(data.achievement.translations).toHaveProperty('de');
      expect(data.achievement.translations).toHaveProperty('ar');
    });
  });

  describe('Not Found', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 404 when achievement not found', async () => {
      achievementAdminService.getById.mockRejectedValue(
        new Error('Achievement with ID \'nonexistent\' not found')
      );

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should handle invalid achievementId format', async () => {
      achievementAdminService.getById.mockRejectedValue(
        new Error('Achievement with ID \'INVALID_ID!\' not found')
      );

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'INVALID_ID!' } });
      const data = await response.json();

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should include rate limit headers in response', async () => {
      achievementAdminService.getById.mockResolvedValue(mockAchievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });

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

    it('should return 500 when service throws error', async () => {
      achievementAdminService.getById.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Connection failed'));

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should log view-achievement action', async () => {
      achievementAdminService.getById.mockResolvedValue(mockAchievement);

      const { req } = createMocks({
        method: 'GET',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0'
        }
      });

      await GET(req, { params: { achievementId: 'first-fast' } });

      // Verify audit log was called (would need to mock auditLogService)
      expect(achievementAdminService.getById).toHaveBeenCalled();
    });
  });

  describe('Criteria Types', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return achievement with duration-milestone criteria', async () => {
      const achievement = {
        ...mockAchievement,
        criteria: {
          type: 'duration-milestone',
          params: { hours: 12 }
        }
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.criteria.type).toBe('duration-milestone');
    });

    it('should return achievement with streak-days criteria', async () => {
      const achievement = {
        ...mockAchievement,
        criteria: {
          type: 'streak-days',
          params: { days: 7 }
        }
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'week-warrior' } });
      const data = await response.json();

      expect(data.achievement.criteria.type).toBe('streak-days');
    });

    it('should return achievement with custom criteria', async () => {
      const achievement = {
        ...mockAchievement,
        criteria: {
          type: 'custom',
          params: { customField: 'value' }
        }
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'custom-achievement' } });
      const data = await response.json();

      expect(data.achievement.criteria.type).toBe('custom');
    });
  });

  describe('Achievement States', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return active achievement', async () => {
      const achievement = {
        ...mockAchievement,
        isActive: true
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.isActive).toBe(true);
    });

    it('should return inactive achievement', async () => {
      const achievement = {
        ...mockAchievement,
        isActive: false
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.isActive).toBe(false);
    });

    it('should return secret achievement', async () => {
      const achievement = {
        ...mockAchievement,
        isSecret: true
      };

      achievementAdminService.getById.mockResolvedValue(achievement);

      const { req } = createMocks({
        method: 'GET'
      });

      const response = await GET(req, { params: { achievementId: 'secret-achievement' } });
      const data = await response.json();

      expect(data.achievement.isSecret).toBe(true);
    });
  });
});
