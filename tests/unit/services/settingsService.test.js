/**
 * Unit Tests - SettingsService
 * 
 * Tests for user settings caching service:
 * - Cache hit/miss scenarios
 * - Fallback to database on cache miss
 * - Cache invalidation on updates
 * - TTL expiration handling
 */

const { getCacheService } = require('../../../src/lib/services/serverCacheService');

// Mock Settings model before requiring SettingsService
jest.mock('../../../src/lib/models/Settings', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
}));

const Settings = require('../../../src/lib/models/Settings');
const { SettingsService } = require('../../../src/lib/services/settingsService');

describe('SettingsService', () => {
  let settingsService;
  let cacheService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get cache service instance
    cacheService = getCacheService();
    
    // Clear cache before each test
    console.log('[TEST] Cache keys before flush:', cacheService.getStats().keys);
    if (cacheService.isEnabled()) {
      cacheService.flushAll();
    }
    console.log('[TEST] Cache keys after flush:', cacheService.getStats().keys);
    
    // Create fresh SettingsService instance with mocked Settings
    settingsService = new SettingsService(Settings);
  });

  afterAll(() => {
    if (cacheService) {
      cacheService.close();
    }
  });

  describe('getSettings()', () => {
    const userId = 'user123';
    const mockSettings = {
      _id: 'settings123',
      userId,
      fastingGoalHours: 16,
      weeklyGoal: 5,
      notificationsEnabled: true,
      theme: 'light',
      toObject: function() { return { ...this }; }
    };

    test('should fetch settings from database on cache miss', async () => {
      // Mock database response
      Settings.findOne.mockResolvedValue(mockSettings);
      
      console.log('Cache enabled?', cacheService.isEnabled());
      console.log('Cache keys before getSettings:', cacheService.getStats().keys);

      const result = await settingsService.getSettings(userId);
      
      console.log('Result:', result);
      console.log('Cache keys after getSettings:', cacheService.getStats().keys);
      console.log('Mock was called?', Settings.findOne.mock.calls.length > 0);

      expect(Settings.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toMatchObject({
        userId,
        fastingGoalHours: 16,
        weeklyGoal: 5,
      });
    });

    test('should cache settings after database fetch', async () => {
      Settings.findOne.mockResolvedValue(mockSettings);

      // First call - cache miss
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(1);

      // Second call - should hit cache
      const result = await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(1); // Not called again
      expect(result).toMatchObject({
        userId,
        fastingGoalHours: 16,
      });
    });

    test('should serve settings from cache on subsequent calls', async () => {
      Settings.findOne.mockResolvedValue(mockSettings);

      // Prime cache
      await settingsService.getSettings(userId);

      // Multiple calls should hit cache
      await settingsService.getSettings(userId);
      await settingsService.getSettings(userId);
      await settingsService.getSettings(userId);

      // Database called only once
      expect(Settings.findOne).toHaveBeenCalledTimes(1);
    });

    test('should return null when settings not found', async () => {
      Settings.findOne.mockResolvedValue(null);

      const result = await settingsService.getSettings(userId);

      expect(result).toBeNull();
      expect(Settings.findOne).toHaveBeenCalledWith({ userId });
    });

    test('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      Settings.findOne.mockRejectedValue(dbError);

      await expect(settingsService.getSettings(userId)).rejects.toThrow('Database connection failed');
    });

    test('should use different cache keys for different users', async () => {
      const user1Settings = { ...mockSettings, userId: 'user1' };
      const user2Settings = { ...mockSettings, userId: 'user2', fastingGoalHours: 18 };

      Settings.findOne
        .mockResolvedValueOnce(user1Settings)
        .mockResolvedValueOnce(user2Settings);

      const result1 = await settingsService.getSettings('user1');
      const result2 = await settingsService.getSettings('user2');

      expect(result1.userId).toBe('user1');
      expect(result2.userId).toBe('user2');
      expect(result2.fastingGoalHours).toBe(18);
      expect(Settings.findOne).toHaveBeenCalledTimes(2);
    });

    test('should respect cache TTL expiration', async () => {
      // Mock short TTL for testing
      const originalTTL = process.env.CACHE_TTL_SETTINGS;
      process.env.CACHE_TTL_SETTINGS = '1'; // 1 second

      Settings.findOne.mockResolvedValue(mockSettings);

      // First call
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Second call - cache expired, should fetch again
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(2);

      // Restore original TTL
      process.env.CACHE_TTL_SETTINGS = originalTTL;
    }, 3000);
  });

  describe('updateSettings()', () => {
    const userId = 'user123';
    const updates = {
      fastingGoalHours: 18,
      weeklyGoal: 6,
    };
    const updatedSettings = {
      _id: 'settings123',
      userId,
      ...updates,
      toObject: function() { return { ...this }; }
    };

    test('should update settings in database', async () => {
      Settings.findOneAndUpdate.mockResolvedValue(updatedSettings);

      const result = await settingsService.updateSettings(userId, updates);

      expect(Settings.findOneAndUpdate).toHaveBeenCalledWith(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      );
      expect(result).toMatchObject({
        userId,
        fastingGoalHours: 18,
        weeklyGoal: 6,
      });
    });

    test('should invalidate cache after update', async () => {
      const initialSettings = {
        userId,
        fastingGoalHours: 16,
        toObject: function() { return { ...this }; }
      };

      // Prime cache with initial settings
      Settings.findOne.mockResolvedValue(initialSettings);
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(1);

      // Update settings
      Settings.findOneAndUpdate.mockResolvedValue(updatedSettings);
      await settingsService.updateSettings(userId, updates);

      // Next getSettings should fetch from database (cache invalidated)
      Settings.findOne.mockResolvedValue(updatedSettings);
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(2); // Called again
    });

    test('should handle update errors gracefully', async () => {
      const dbError = new Error('Update failed');
      Settings.findOneAndUpdate.mockRejectedValue(dbError);

      await expect(settingsService.updateSettings(userId, updates)).rejects.toThrow('Update failed');
    });
  });

  describe('createSettings()', () => {
    const userId = 'user123';
    const settingsData = {
      userId,
      fastingGoalHours: 16,
      weeklyGoal: 5,
      notificationsEnabled: true,
    };
    const createdSettings = {
      _id: 'settings123',
      ...settingsData,
      toObject: function() { return { ...this }; }
    };

    test('should create new settings in database', async () => {
      Settings.create.mockResolvedValue(createdSettings);

      const result = await settingsService.createSettings(settingsData);

      expect(Settings.create).toHaveBeenCalledWith(settingsData);
      expect(result).toMatchObject({
        userId,
        fastingGoalHours: 16,
      });
    });

    test('should cache newly created settings', async () => {
      Settings.create.mockResolvedValue(createdSettings);

      await settingsService.createSettings(settingsData);

      // Should hit cache on next get
      Settings.findOne.mockResolvedValue(createdSettings);
      await settingsService.getSettings(userId);
      
      // findOne should not be called (cached from create)
      expect(Settings.findOne).not.toHaveBeenCalled();
    });

    test('should handle creation errors gracefully', async () => {
      const dbError = new Error('Creation failed');
      Settings.create.mockRejectedValue(dbError);

      await expect(settingsService.createSettings(settingsData)).rejects.toThrow('Creation failed');
    });
  });

  describe('invalidateCache()', () => {
    const userId = 'user123';
    const mockSettings = {
      userId,
      fastingGoalHours: 16,
      toObject: function() { return { ...this }; }
    };

    test('should clear cache for specific user', async () => {
      // Prime cache
      Settings.findOne.mockResolvedValue(mockSettings);
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(1);

      // Invalidate cache
      settingsService.invalidateCache(userId);

      // Next call should fetch from database
      await settingsService.getSettings(userId);
      expect(Settings.findOne).toHaveBeenCalledTimes(2);
    });

    test('should only invalidate specified user cache', async () => {
      const user1Settings = { ...mockSettings, userId: 'user1' };
      const user2Settings = { ...mockSettings, userId: 'user2' };

      Settings.findOne
        .mockResolvedValueOnce(user1Settings)
        .mockResolvedValueOnce(user2Settings);

      // Prime both caches
      await settingsService.getSettings('user1');
      await settingsService.getSettings('user2');
      expect(Settings.findOne).toHaveBeenCalledTimes(2);

      // Invalidate only user1
      settingsService.invalidateCache('user1');

      // user1 should fetch from DB, user2 should hit cache
      Settings.findOne.mockResolvedValueOnce(user1Settings);
      await settingsService.getSettings('user1');
      await settingsService.getSettings('user2');
      
      // user1 fetched again (3 total), user2 from cache (still 2)
      expect(Settings.findOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cache statistics', () => {
    test('should track cache hits and misses', async () => {
      const userId = 'user123';
      const mockSettings = {
        userId,
        fastingGoalHours: 16,
        toObject: function() { return { ...this }; }
      };

      Settings.findOne.mockResolvedValue(mockSettings);

      // First call - miss
      await settingsService.getSettings(userId);
      
      // Multiple hits
      await settingsService.getSettings(userId);
      await settingsService.getSettings(userId);

      const stats = cacheService.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
    });
  });
});
