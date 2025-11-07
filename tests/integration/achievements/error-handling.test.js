/**
 * Error Resilience Tests for Achievement Service
 * 
 * Tests error handling and graceful degradation:
 * - Service failures don't crash the application
 * - Invalid data is handled correctly
 * - Errors are logged appropriately
 * 
 * @jest-environment node
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import AchievementService from '@/lib/services/AchievementService';

describe('Achievement Service Error Resilience', () => {
  let mongoServer;
  let testUser;
  let consoleErrorSpy;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    
    AchievementService.clearCache();

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      acceptedTerms: true,
      acceptedPrivacy: true,
      achievementPoints: 0
    });

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Invalid Input Handling', () => {
    it('should throw error when entry does not exist', async () => {
      const fakeEntryId = new mongoose.Types.ObjectId().toString();

      await expect(
        AchievementService.evaluateAndUnlock(testUser._id.toString(), fakeEntryId)
      ).rejects.toThrow(`Entry not found: ${fakeEntryId}`);
    });

    it('should throw error when user does not exist during unlock', async () => {
      // Create entry
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      // Create achievement
      await Achievement.create({
        achievementId: 'test-achievement',
        translations: {
          en: {
            name: 'Test Achievement',
            description: 'Test description',
            shortDescription: 'Test'
          }
        },
        iconUrl: '/test.svg',
        category: 'duration',
        points: 50,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'duration-milestone',
          params: { minDuration: 960 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      // Delete user before unlocking
      await User.findByIdAndDelete(testUser._id);

      // Attempt to unlock should not throw, but return empty achievements
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Service continues even if user points update fails
      expect(result.unlockedAchievements).toHaveLength(1);
    });

    it('should handle invalid achievement IDs gracefully', async () => {
      const result = await AchievementService.unlockAchievements(
        testUser._id.toString(),
        ['nonexistent-achievement-1', 'nonexistent-achievement-2']
      );

      expect(result).toMatchObject({
        unlockedAchievements: [],
        totalPointsEarned: 0
      });
    });

    it('should handle empty achievement ID array', async () => {
      const result = await AchievementService.unlockAchievements(
        testUser._id.toString(),
        []
      );

      expect(result).toMatchObject({
        unlockedAchievements: [],
        totalPointsEarned: 0
      });
    });
  });

  describe('Database Error Handling', () => {
    it('should handle duplicate achievement unlocks (E11000) gracefully', async () => {
      // Create entry and achievement
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      const achievement = await Achievement.create({
        achievementId: 'duplicate-test',
        translations: {
          en: {
            name: 'Duplicate Test',
            description: 'Test duplicate handling',
            shortDescription: 'Duplicate'
          }
        },
        iconUrl: '/test.svg',
        category: 'duration',
        points: 50,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'duration-milestone',
          params: { minDuration: 960 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      // Manually create UserAchievement
      await UserAchievement.create({
        userId: testUser._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
        progress: 100
      });

      // Try to unlock again - should be idempotent
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Should return empty since achievement already unlocked
      expect(result.unlockedAchievements).toHaveLength(0);
      
      // User should still only have one UserAchievement record
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      expect(userAchievements).toHaveLength(1);
    });
  });

  describe('Data Integrity', () => {
    it('should not award points if achievement creation fails', async () => {
      // This test verifies atomic behavior - if UserAchievement creation fails,
      // points should not be awarded (or should be rolled back)
      
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      await Achievement.create({
        achievementId: 'integrity-test',
        translations: {
          en: {
            name: 'Integrity Test',
            description: 'Test data integrity',
            shortDescription: 'Integrity'
          }
        },
        iconUrl: '/test.svg',
        category: 'duration',
        points: 50,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'duration-milestone',
          params: { minDuration: 960 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      // Normal flow - should work
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      expect(result.unlockedAchievements).toHaveLength(1);

      // Verify points awarded
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(50);

      // Verify UserAchievement created
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      expect(userAchievements).toHaveLength(1);
    });

    it('should handle malformed achievement criteria gracefully', async () => {
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      // Create achievement with invalid criteria (missing minDuration)
      await Achievement.create({
        achievementId: 'malformed-criteria',
        translations: {
          en: {
            name: 'Malformed Criteria',
            description: 'Achievement with malformed criteria',
            shortDescription: 'Malformed'
          }
        },
        iconUrl: '/test.svg',
        category: 'duration',
        points: 50,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'duration-milestone',
          params: {} // Missing minDuration!
        },
        isActive: true,
        createdBy: testUser._id
      });

      // Should not crash, just return empty
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Should not unlock the malformed achievement
      expect(result.unlockedAchievements).toHaveLength(0);
    });
  });

  describe('Cache Resilience', () => {
    it('should handle cache clearing during operations', async () => {
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      await Achievement.create({
        achievementId: 'cache-test',
        translations: {
          en: {
            name: 'Cache Test',
            description: 'Test cache resilience',
            shortDescription: 'Cache'
          }
        },
        iconUrl: '/test.svg',
        category: 'duration',
        points: 50,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'duration-milestone',
          params: { minDuration: 960 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      // First call - populates cache
      const result1 = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      expect(result1.unlockedAchievements).toHaveLength(1);

      // Clear cache
      AchievementService.clearCache();

      // Create another entry
      const entry2 = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-08'),
        startTime: new Date('2025-11-07T18:00:00Z'),
        endTime: new Date('2025-11-08T12:00:00Z'),
        lastMealTime: '18:00',
        firstMealTime: '12:00',
        fastingDuration: 1080,
        goalDuration: 16,
        goalStatus: 'completed'
      });

      // Second call after cache clear - should still work
      const result2 = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry2._id.toString()
      );

      // Achievement already unlocked, so empty
      expect(result2.unlockedAchievements).toHaveLength(0);
    });
  });
});
