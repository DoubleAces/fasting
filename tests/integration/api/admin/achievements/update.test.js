import { createMocks } from 'node-mocks-http';
import { PUT } from '@/app/api/admin/achievements/[achievementId]/route';
import { getServerSession } from 'next-auth';
import achievementAdminService from '@/lib/services/achievementAdminService';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/services/achievementAdminService');
jest.mock('@/lib/db');

describe('PUT /api/admin/achievements/[achievementId]', () => {
  const mockExistingAchievement = {
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
      params: { hours: 12 }
    },
    isActive: true,
    type: 'automatic',
    order: 1
  };

  const updateData = {
    translations: {
      en: {
        name: 'First Fast - Updated',
        description: 'Complete your first fast to earn this',
        iconUrl: '/icons/first-fast.svg'
      },
      es: {
        name: 'Primer Ayuno',
        description: 'Completa tu primer ayuno'
      }
    },
    tier: 'silver',
    points: 25,
    isActive: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  // Helper to create request with proper json() method for PUT requests
  const createPutRequest = (body = {}) => {
    const { req } = createMocks({ method: 'PUT' });
    req.json = jest.fn().mockResolvedValue(body);
    req.headers = new Map();
    req.headers.get = jest.fn((key) => {
      if (key === 'x-forwarded-for') return '192.168.1.1';
      if (key === 'user-agent') return 'Mozilla/5.0';
      return null;
    });
    return req;
  };

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 403 when user is not admin', async () => {
      getServerSession.mockResolvedValue({
        user: { id: 'user123', email: 'user@test.com', isAdmin: false }
      });

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });
  });

  describe('Successful Update', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 200 with updated achievement', async () => {
      const updatedAchievement = {
        ...mockExistingAchievement,
        ...updateData,
        updatedAt: new Date()
      };

      achievementAdminService.update.mockResolvedValue(updatedAchievement);

      const req = createPutRequest(updateData);

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement).toBeDefined();
      expect(data.achievement.translations.en.name).toBe('First Fast - Updated');
    });

    it('should call achievementAdminService.update with correct parameters', async () => {
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        ...updateData
      });

      const req = createPutRequest(updateData);

      await PUT(req, { params: { achievementId: 'first-fast' } });

      expect(achievementAdminService.update).toHaveBeenCalledWith(
        'first-fast',
        updateData,
        'admin123',
        '192.168.1.1',
        'Mozilla/5.0'
      );
    });

    it('should allow updating only specific fields', async () => {
      const partialUpdate = {
        points: 30
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        points: 30
      });

      const req = createPutRequest(partialUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement.points).toBe(30);
    });

    it('should allow adding new translations', async () => {
      const translationUpdate = {
        translations: {
          ...mockExistingAchievement.translations,
          fr: {
            name: 'Premier Jeûne',
            description: 'Complétez votre premier jeûne'
          }
        }
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        ...translationUpdate
      });

      const req = createPutRequest(translationUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement.translations.fr).toBeDefined();
    });

    it('should allow updating criteria', async () => {
      const criteriaUpdate = {
        criteria: {
          type: 'duration-milestone',
          params: { hours: 24 }
        }
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        ...criteriaUpdate
      });

      const req = createPutRequest(criteriaUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement.criteria.params.hours).toBe(24);
    });

    it('should allow changing tier', async () => {
      const tierUpdate = {
        tier: 'gold'
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        tier: 'gold'
      });

      const req = createPutRequest(tierUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement.tier).toBe('gold');
    });

    it('should allow toggling isActive', async () => {
      const statusUpdate = {
        isActive: false
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        isActive: false
      });

      const req = createPutRequest(statusUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.achievement.isActive).toBe(false);
    });
  });

  describe('Not Found', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 404 when achievement not found', async () => {
      achievementAdminService.update.mockRejectedValue({
        statusCode: 404,
        message: 'Achievement not found'
      });

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should return 400 when tier is invalid', async () => {
      const invalidUpdate = {
        tier: 'invalid-tier'
      };

      achievementAdminService.update.mockRejectedValue({
        statusCode: 400,
        message: 'Invalid tier'
      });

      const req = createPutRequest(invalidUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when criteria type is invalid', async () => {
      const invalidUpdate = {
        criteria: {
          type: 'invalid-type',
          params: {}
        }
      };

      achievementAdminService.update.mockRejectedValue({
        statusCode: 400,
        message: 'Invalid criteria type'
      });

      const req = createPutRequest(invalidUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when points is negative', async () => {
      const invalidUpdate = {
        points: -10
      };

      achievementAdminService.update.mockRejectedValue({
        statusCode: 400,
        message: 'Points must be positive'
      });

      const req = createPutRequest(invalidUpdate
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should filter out empty translations', async () => {
      const updateWithEmptyTranslations = {
        translations: {
          en: {
            name: 'Test',
            description: 'Test'
          },
          es: {
            name: '',
            description: ''
          }
        }
      };

      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        translations: {
          en: {
            name: 'Test',
            description: 'Test'
          }
        }
      });

      const req = createPutRequest(updateWithEmptyTranslations
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });

      expect(response.status).toBe(200);
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should log update action with before/after values', async () => {
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        ...updateData
      });

      const req = createPutRequest(updateData);

      await PUT(req, { params: { achievementId: 'first-fast' } });

      // Verify service was called with audit parameters
      expect(achievementAdminService.update).toHaveBeenCalledWith(
        'first-fast',
        updateData,
        'admin123',
        '192.168.1.1',
        'Mozilla/5.0'
      );
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should include rate limit headers in response', async () => {
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        ...updateData
      });

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });

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

    it('should return 500 when service throws unexpected error', async () => {
      achievementAdminService.update.mockRejectedValue(new Error('Database error'));

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 500 when database connection fails', async () => {
      connectDB.mockRejectedValue(new Error('Connection failed'));

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Concurrent Updates', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should handle concurrent update conflict', async () => {
      achievementAdminService.update.mockRejectedValue({
        statusCode: 409,
        message: 'Achievement was modified by another user'
      });

      const req = createPutRequest(updateData
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(response.status).toBe(409);
    });
  });

  describe('Field Updates', () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue({
        user: { id: 'admin123', email: 'admin@test.com', isAdmin: true }
      });
    });

    it('should allow updating category', async () => {
      const update = { category: 'Duration' };
      
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        category: 'Duration'
      });

      const req = createPutRequest(update
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.category).toBe('Duration');
    });

    it('should allow updating rarity', async () => {
      const update = {
        rarity: {
          tier: 'rare',
          score: 75
        }
      };
      
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        rarity: update.rarity
      });

      const req = createPutRequest(update
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.rarity.tier).toBe('rare');
      expect(data.achievement.rarity.score).toBe(75);
    });

    it('should allow updating order', async () => {
      const update = { order: 50 };
      
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        order: 50
      });

      const req = createPutRequest(update
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.order).toBe(50);
    });

    it('should allow updating type', async () => {
      const update = { type: 'manual-trigger' };
      
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        type: 'manual-trigger'
      });

      const req = createPutRequest(update
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.type).toBe('manual-trigger');
    });

    it('should allow updating isSecret', async () => {
      const update = { isSecret: true };
      
      achievementAdminService.update.mockResolvedValue({
        ...mockExistingAchievement,
        isSecret: true
      });

      const req = createPutRequest(update
      );

      const response = await PUT(req, { params: { achievementId: 'first-fast' } });
      const data = await response.json();

      expect(data.achievement.isSecret).toBe(true);
    });
  });
});

