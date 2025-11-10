import achievementAdminService from '@/lib/services/achievementAdminService';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import connectDB from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('@/lib/models/Achievement');
jest.mock('@/lib/models/UserAchievement');
jest.mock('@/lib/services/auditLogService');

describe('achievementAdminService.list()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  const mockAchievements = [
    {
      achievementId: 'first-fast',
      translations: {
        en: { name: 'First Fast', description: 'Complete your first fast' }
      },
      category: 'Milestones',
      tier: 'bronze',
      isActive: true,
      order: 1,
      toObject: function() { return this; }
    },
    {
      achievementId: 'week-warrior',
      translations: {
        en: { name: 'Week Warrior', description: 'Fast for 7 days' }
      },
      category: 'Duration',
      tier: 'silver',
      isActive: false,
      order: 2,
      toObject: function() { return this; }
    }
  ];

  describe('Pagination', () => {
    it('should return paginated results with default page size 20', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(81);
      UserAchievement.aggregate.mockResolvedValue([
        { _id: 'first-fast', count: 150 },
        { _id: 'week-warrior', count: 45 }
      ]);

      const result = await achievementAdminService.list({ page: 1 });

      expect(result.achievements).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(20);
      expect(result.pagination.totalCount).toBe(81);
      expect(result.pagination.totalPages).toBe(5);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
    });

    it('should handle page 2 with correct skip value', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(81);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ page: 2 });

      expect(mockQuery.skip).toHaveBeenCalledWith(20);
    });

    it('should handle custom page size', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(81);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ page: 1, pageSize: 50 });

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
    });
  });

  describe('Search', () => {
    it('should search by achievement name', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[0]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ search: 'First' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'translations.en.name': expect.objectContaining({ $regex: /first/i })
        })
      );
    });

    it('should be case-insensitive search', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[0]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ search: 'FIRST FAST' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'translations.en.name': expect.objectContaining({ $regex: /first fast/i })
        })
      );
    });
  });

  describe('Filtering', () => {
    it('should filter by status (active)', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[0]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ status: 'active' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true })
      );
    });

    it('should filter by status (inactive)', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[1]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ status: 'inactive' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false })
      );
    });

    it('should filter by category', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[0]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ category: 'Milestones' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Milestones' })
      );
    });

    it('should filter by tier', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockAchievements[1]])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(1);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ tier: 'silver' });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({ tier: 'silver' })
      );
    });

    it('should combine multiple filters', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(0);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({
        status: 'active',
        category: 'Milestones',
        tier: 'bronze'
      });

      expect(Achievement.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          category: 'Milestones',
          tier: 'bronze'
        })
      );
    });
  });

  describe('Sorting', () => {
    it('should sort by default order (order asc, name asc)', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({});

      expect(mockQuery.sort).toHaveBeenCalledWith({ order: 1, 'translations.en.name': 1 });
    });

    it('should sort by name ascending', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ sortBy: 'name', sortOrder: 'asc' });

      expect(mockQuery.sort).toHaveBeenCalledWith({ 'translations.en.name': 1 });
    });

    it('should sort by tier descending', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({ sortBy: 'tier', sortOrder: 'desc' });

      expect(mockQuery.sort).toHaveBeenCalledWith({ tier: -1 });
    });
  });

  describe('Unlock Count Aggregation', () => {
    it('should include unlock counts for achievements', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([
        { _id: 'first-fast', count: 150 },
        { _id: 'week-warrior', count: 45 }
      ]);

      const result = await achievementAdminService.list({});

      expect(result.achievements[0].unlockCount).toBe(150);
      expect(result.achievements[1].unlockCount).toBe(45);
    });

    it('should set unlockCount to 0 for achievements with no unlocks', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([
        { _id: 'first-fast', count: 150 }
      ]);

      const result = await achievementAdminService.list({});

      expect(result.achievements[0].unlockCount).toBe(150);
      expect(result.achievements[1].unlockCount).toBe(0);
    });

    it('should call UserAchievement.aggregate with correct pipeline', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockAchievements)
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(2);
      UserAchievement.aggregate.mockResolvedValue([]);

      await achievementAdminService.list({});

      expect(UserAchievement.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: '$achievementId',
            count: { $sum: 1 }
          }
        }
      ]);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when database connection fails', async () => {
      Achievement.find.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(achievementAdminService.list({})).rejects.toThrow('Database connection failed');
    });

    it('should handle empty results gracefully', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Achievement.find.mockReturnValue(mockQuery);
      Achievement.countDocuments.mockResolvedValue(0);
      UserAchievement.aggregate.mockResolvedValue([]);

      const result = await achievementAdminService.list({});

      expect(result.achievements).toEqual([]);
      expect(result.pagination.totalCount).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
