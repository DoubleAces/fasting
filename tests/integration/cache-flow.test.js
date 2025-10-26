/**
 * Integration Tests for Cache Flow
 * 
 * Tests the end-to-end cache flow: write → invalidate → read
 * Validates that caches are properly invalidated when data changes.
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Entry from '../../src/lib/models/Entry.js';
import Settings from '../../src/lib/models/Settings.js';

let mongoServer;
let settingsService;
let entryInsightsService;

beforeAll(async () => {
  // Import CommonJS services dynamically
  const settingsModule = await import('../../src/lib/services/settingsService.js');
  const insightsModule = await import('../../src/lib/services/entryInsightsService.js');
  
  settingsService = settingsModule.settingsService;
  entryInsightsService = insightsModule.entryInsightsService;

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Entry.deleteMany({});
  await Settings.deleteMany({});
  
  // Clear settings caches before each test
  if (settingsService && settingsService.invalidateAllCaches) {
    settingsService.invalidateAllCaches();
  }
});

describe('Cache Flow Integration', () => {
  const testUserId = new mongoose.Types.ObjectId();

  describe('Settings Cache Flow', () => {
    test('should cache settings on first read and serve from cache on second read', async () => {
      // Create settings
      const settings = await Settings.create({
        userId: testUserId,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      // First read - should hit database
      const start1 = Date.now();
      const result1 = await settingsService.getSettings(testUserId);
      const time1 = Date.now() - start1;

      expect(result1).toBeDefined();
      expect(result1.targetFastingHours).toBe(16);

      // Second read - should hit cache (much faster)
      const start2 = Date.now();
      const result2 = await settingsService.getSettings(testUserId);
      const time2 = Date.now() - start2;

      expect(result2).toBeDefined();
      expect(result2.targetFastingHours).toBe(16);
      
      // Cache hit should be faster (usually <10ms)
      expect(time2).toBeLessThan(time1);
    });

    test('should invalidate cache on settings update', async () => {
      // Create settings
      await Settings.create({
        userId: testUserId,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      // First read - populate cache
      const result1 = await settingsService.getSettings(testUserId);
      expect(result1.targetFastingHours).toBe(16);

      // Update settings - should invalidate cache
      await settingsService.updateSettings(testUserId, {
        targetFastingHours: 18
      });

      // Read again - should get updated value
      const result2 = await settingsService.getSettings(testUserId);
      expect(result2.targetFastingHours).toBe(18);
    });

    test('should maintain separate caches for different users', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      // Create settings for both users
      await Settings.create({
        userId: userId1,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      await Settings.create({
        userId: userId2,
        targetFastingHours: 18,
        weeklyFastingGoal: 6
      });

      // Get settings for both users
      const settings1 = await settingsService.getSettings(userId1);
      const settings2 = await settingsService.getSettings(userId2);

      expect(settings1.targetFastingHours).toBe(16);
      expect(settings2.targetFastingHours).toBe(18);

      // Update user1's settings
      await settingsService.updateSettings(userId1, {
        targetFastingHours: 20
      });

      // User1's cache should be invalidated, user2's should not
      const updated1 = await settingsService.getSettings(userId1);
      const cached2 = await settingsService.getSettings(userId2);

      expect(updated1.targetFastingHours).toBe(20);
      expect(cached2.targetFastingHours).toBe(18); // Still cached
    });
  });

  describe('Entry Insights Cache Flow', () => {
    test('should cache insights on first calculation', async () => {
      // Create entries for insights
      const entries = [
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '18:00',
          firstMealTime: '18:00',
          lastMealTime: '08:00',
          fastingDuration: 18
        }
      ];
      await Entry.insertMany(entries);

      const currentEntry = entries[1];

      // First calculation - should hit database
      const start1 = Date.now();
      const insights1 = await entryInsightsService.getEntryInsights(
        testUserId,
        currentEntry._id
      );
      const time1 = Date.now() - start1;

      expect(insights1).toBeDefined();

      // Second calculation - should hit cache
      const start2 = Date.now();
      const insights2 = await entryInsightsService.getEntryInsights(
        testUserId,
        currentEntry._id
      );
      const time2 = Date.now() - start2;

      expect(insights2).toBeDefined();
      
      // Cache hit should be much faster
      expect(time2).toBeLessThan(time1);
      expect(time2).toBeLessThan(10);
    });

    test('should invalidate insights cache on entry update', async () => {
      // Create entries
      const entry = await Entry.create({
        userId: testUserId,
        date: new Date(2024, 0, 1),
        startTime: '08:00',
        endTime: '16:00',
        firstMealTime: '16:00',
        lastMealTime: '08:00',
        fastingDuration: 16
      });

      // Calculate insights - populate cache
      const insights1 = await entryInsightsService.getEntryInsights(
        testUserId,
        entry._id
      );
      expect(insights1).toBeDefined();

      // Invalidate cache
      await entryInsightsService.invalidateInsightsForEntry(testUserId, entry._id);

      // Update entry to create new data
      await Entry.findByIdAndUpdate(entry._id, {
        fastingDuration: 18
      });

      // Get insights again - should recalculate
      const insights2 = await entryInsightsService.getEntryInsights(
        testUserId,
        entry._id
      );
      
      expect(insights2).toBeDefined();
    });

    test('should handle cache invalidation for all user entries', async () => {
      // Create multiple entries
      const entries = await Entry.insertMany([
        {
          userId: testUserId,
          date: new Date(2024, 0, 1),
          startTime: '08:00',
          endTime: '16:00',
          firstMealTime: '16:00',
          lastMealTime: '08:00',
          fastingDuration: 16
        },
        {
          userId: testUserId,
          date: new Date(2024, 0, 2),
          startTime: '08:00',
          endTime: '18:00',
          firstMealTime: '18:00',
          lastMealTime: '08:00',
          fastingDuration: 18
        }
      ]);

      // Calculate insights for both - populate caches
      await entryInsightsService.getEntryInsights(testUserId, entries[0]._id);
      await entryInsightsService.getEntryInsights(testUserId, entries[1]._id);

      // Invalidate all user caches
      await entryInsightsService.invalidateInsightsForUser(testUserId);

      // Both should need recalculation (no errors thrown)
      const insights1 = await entryInsightsService.getEntryInsights(testUserId, entries[0]._id);
      const insights2 = await entryInsightsService.getEntryInsights(testUserId, entries[1]._id);

      expect(insights1).toBeDefined();
      expect(insights2).toBeDefined();
    });
  });

  describe('Cache Statistics', () => {
    test('should track cache hit and miss statistics', async () => {
      // Create settings
      await Settings.create({
        userId: testUserId,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      // Clear stats
      if (settingsService.invalidateAllCaches) {
        settingsService.invalidateAllCaches();
      }

      // First call - cache miss
      await settingsService.getSettings(testUserId);

      // Second call - cache hit
      await settingsService.getSettings(testUserId);

      const stats = settingsService.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats.keys).toBeGreaterThan(0);
    });

    test('should provide separate stats for settings cache', async () => {
      // Get stats for settings service
      const settingsStats = settingsService.getCacheStats();

      expect(settingsStats).toBeDefined();
      
      // Should have keys property
      expect(settingsStats).toHaveProperty('keys');
    });
  });

  describe('Cache Performance Under Load', () => {
    test('should maintain cache performance with multiple concurrent reads', async () => {
      // Create settings
      await Settings.create({
        userId: testUserId,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      // First read to populate cache
      await settingsService.getSettings(testUserId);

      // Make 100 concurrent reads
      const start = Date.now();
      const promises = Array.from({ length: 100 }, () =>
        settingsService.getSettings(testUserId)
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - start;

      // All should succeed
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result.targetFastingHours).toBe(16);
      });

      // Average time should be fast (cached reads)
      const avgTime = totalTime / 100;
      expect(avgTime).toBeLessThan(5); // <5ms per cached read
    });

    test('should handle cache miss and concurrent population gracefully', async () => {
      // Create settings
      await Settings.create({
        userId: testUserId,
        targetFastingHours: 16,
        weeklyFastingGoal: 5
      });

      // Make 10 concurrent reads without pre-populating cache
      const promises = Array.from({ length: 10 }, () =>
        settingsService.getSettings(testUserId)
      );
      
      const results = await Promise.all(promises);

      // All should succeed and return same data
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.targetFastingHours).toBe(16);
      });
    });
  });
});
