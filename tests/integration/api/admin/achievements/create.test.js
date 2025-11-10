/**
 * Integration Tests - POST /api/admin/achievements
 * 
 * Contract tests for achievement creation endpoint
 */

import { POST } from '@/app/api/admin/achievements/route';
import connectDB from '@/lib/mongodb';
import Achievement from '@/lib/models/Achievement';
import User from '@/lib/models/User';
import AdminAuditLog from '@/lib/models/AdminAuditLog';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db');
jest.mock('@/lib/models/Achievement');
jest.mock('@/lib/models/User');
jest.mock('@/lib/models/AdminAuditLog');

describe('POST /api/admin/achievements - Create Achievement', () => {
  let mockAdminUser;
  let mockNonAdminUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdminUser = {
      id: 'admin123',
      email: 'admin@test.com',
      isAdmin: true
    };

    mockNonAdminUser = {
      id: 'user123',
      email: 'user@test.com',
      isAdmin: false
    };

    connectDB.mockResolvedValue(true);
  });

  describe('Authentication & Authorization', () => {
    it('should return 401 if user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 if user is not an admin', async () => {
      getServerSession.mockResolvedValue({ user: mockNonAdminUser });

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Admin');
    });
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({ user: mockAdminUser });
    });

    it('should return 400 if request body is invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid JSON');
    });

    it('should return 400 if achievementId is missing', async () => {
      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          translations: { en: { name: 'Test', description: 'Test' } },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('achievementId is required');
    });

    it('should return 400 if achievementId has invalid format', async () => {
      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievementId: 'Invalid ID With Spaces!',
          translations: { en: { name: 'Test', description: 'Test' } },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain(expect.stringContaining('lowercase letters, numbers, and hyphens'));
    });

    it('should return 400 if English translation is missing', async () => {
      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievementId: 'test-achievement',
          translations: { es: { name: 'Prueba', description: 'Prueba' } },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain(expect.stringContaining('English'));
    });

    it('should return 400 if category is invalid', async () => {
      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievementId: 'test-achievement',
          translations: { en: { name: 'Test', description: 'Test' } },
          category: 'invalid-category',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Duplicate Detection', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({ user: mockAdminUser });
    });

    it('should return 409 if achievementId already exists', async () => {
      Achievement.findOne.mockResolvedValue({
        _id: 'existing123',
        achievementId: 'first-fast',
        translations: { en: { name: 'First Fast' } }
      });

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          achievementId: 'first-fast',
          translations: { en: { name: 'First Fast', description: 'Complete first fast' } },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already exists');
      expect(Achievement.findOne).toHaveBeenCalledWith({ achievementId: 'first-fast' });
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({ user: mockAdminUser });
      Achievement.findOne.mockResolvedValue(null); // No duplicate
    });

    it('should create achievement with required fields only', async () => {
      const mockCreatedAchievement = {
        _id: 'new123',
        achievementId: 'test-achievement',
        translations: { en: { name: 'Test Achievement', description: 'Test description' } },
        category: 'getting-started',
        tier: 'bronze',
        criteria: { type: 'duration-milestone', params: { value: 12 } },
        rarity: { score: 10 },
        points: 10,
        order: 999,
        isActive: true,
        isSecret: false,
        type: 'automatic',
        createdAt: new Date()
      };

      Achievement.create.mockResolvedValue(mockCreatedAchievement);
      AdminAuditLog.create.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser'
        },
        body: JSON.stringify({
          achievementId: 'test-achievement',
          translations: { 
            en: { name: 'Test Achievement', description: 'Test description', iconUrl: '🎯' }
          },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toContain('created successfully');
      expect(data.achievement).toBeDefined();
      expect(data.achievement.achievementId).toBe('test-achievement');
      expect(Achievement.create).toHaveBeenCalledWith(expect.objectContaining({
        achievementId: 'test-achievement',
        category: 'getting-started',
        tier: 'bronze',
        rarity: { score: 10 },
        points: 10
      }));
    });

    it('should create achievement with all optional fields', async () => {
      const mockCreatedAchievement = {
        _id: 'new456',
        achievementId: 'advanced-achievement',
        translations: {
          en: { name: 'Advanced', description: 'Advanced achievement', iconUrl: '🏆' },
          es: { name: 'Avanzado', description: 'Logro avanzado' }
        },
        category: 'streak',
        tier: 'gold',
        criteria: { type: 'streak-days', params: { value: 30 } },
        rarity: { score: 50 },
        points: 50,
        order: 100,
        isActive: false,
        isSecret: true,
        type: 'manual',
        icon: '🏆',
        createdAt: new Date()
      };

      Achievement.create.mockResolvedValue(mockCreatedAchievement);
      AdminAuditLog.create.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser'
        },
        body: JSON.stringify({
          achievementId: 'advanced-achievement',
          translations: {
            en: { name: 'Advanced', description: 'Advanced achievement', iconUrl: '🏆' },
            es: { name: 'Avanzado', description: 'Logro avanzado' }
          },
          category: 'streak',
          tier: 'gold',
          criteria: { type: 'streak-days', value: 30 },
          rarity: { score: 50 },
          order: 100,
          isActive: false,
          isSecret: true,
          type: 'manual'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(Achievement.create).toHaveBeenCalledWith(expect.objectContaining({
        order: 100,
        isActive: false,
        isSecret: true,
        type: 'manual',
        icon: '🏆'
      }));
    });

    it('should log creation action to audit log', async () => {
      const mockCreatedAchievement = {
        _id: 'new789',
        achievementId: 'audit-test',
        translations: { en: { name: 'Audit Test', description: 'Test' } },
        category: 'getting-started',
        tier: 'bronze',
        criteria: { type: 'duration-milestone', params: { value: 12 } },
        rarity: { score: 10 },
        points: 10,
        createdAt: new Date()
      };

      Achievement.create.mockResolvedValue(mockCreatedAchievement);
      AdminAuditLog.create.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/admin/achievements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Test Browser'
        },
        body: JSON.stringify({
          achievementId: 'audit-test',
          translations: { en: { name: 'Audit Test', description: 'Test' } },
          category: 'getting-started',
          tier: 'bronze',
          criteria: { type: 'duration-milestone', value: 12 },
          rarity: { score: 10 }
        })
      });

      await POST(request);

      expect(AdminAuditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'admin123',
        action: 'create-achievement',
        resource: 'achievement',
        resourceId: 'audit-test',
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser',
        changes: expect.objectContaining({
          created: expect.objectContaining({
            name: 'Audit Test',
            category: 'getting-started',
            tier: 'bronze',
            points: 10
          })
        })
      }));
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({ user: mockAdminUser });
      Achievement.findOne.mockResolvedValue(null);
      Achievement.create.mockResolvedValue({
        _id: 'test',
        achievementId: 'test',
        translations: { en: { name: 'Test', description: 'Test' } }
      });
      AdminAuditLog.create.mockResolvedValue({});
    });

    it('should enforce rate limiting after 100 requests', async () => {
      // Make 101 requests
      for (let i = 0; i < 101; i++) {
        const request = new Request('http://localhost:3000/api/admin/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievementId: `test-${i}`,
            translations: { en: { name: `Test ${i}`, description: 'Test' } },
            category: 'getting-started',
            tier: 'bronze',
            criteria: { type: 'duration-milestone', value: 12 },
            rarity: { score: 10 }
          })
        });

        const response = await POST(request);

        if (i >= 100) {
          expect(response.status).toBe(429);
          const data = await response.json();
          expect(data.error).toContain('Too Many Requests');
          expect(response.headers.get('Retry-After')).toBeTruthy();
        }
      }
    });
  });
});
