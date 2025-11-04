/**
 * UserAchievement Model Unit Tests
 * Tests for UserAchievement schema validation, constraints, and compound indexes
 * 
 * TDD Approach: These tests are written FIRST before implementing the UserAchievement model
 * They should FAIL initially (red phase), then PASS after implementation (green phase)
 */

import mongoose from 'mongoose';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import { testUsers } from '../../../tests/fixtures/users.js';

// Import models (UserAchievement will be created)
let UserAchievement;
let Achievement;
let User;

describe('UserAchievement Model - Unit Tests', () => {
  // Setup: Connect to test database before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Import models after database connection
    UserAchievement = (await import('@/lib/models/UserAchievement')).default;
    Achievement = (await import('@/lib/models/Achievement')).default;
    User = (await import('@/lib/models/User')).default;
  });

  // Cleanup: Clean database before each test
  beforeEach(async () => {
    await cleanTestDatabase();
  });

  // Teardown: Disconnect from database after all tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  /**
   * T035: UserAchievement schema validation with valid data
   */
  describe('T035 - Schema validation with valid data', () => {
    it('should create a user achievement with all required fields', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t035@test.com',
      });

      const validUserAchievement = {
        userId: user._id,
        achievementId: 'first-fast',
        unlockedAt: new Date(),
      };

      const userAchievement = await UserAchievement.create(validUserAchievement);

      expect(userAchievement).toBeDefined();
      expect(userAchievement.userId.toString()).toBe(user._id.toString());
      expect(userAchievement.achievementId).toBe('first-fast');
      expect(userAchievement.unlockedAt).toBeInstanceOf(Date);
    });

    it('should create user achievement with optional fields', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t035-optional@test.com',
      });

      const userAchievementWithOptionals = {
        userId: user._id,
        achievementId: 'sweet-sixteen',
        unlockedAt: new Date('2025-11-01'),
        progress: 75,
        notificationSeen: true,
      };

      const userAchievement = await UserAchievement.create(userAchievementWithOptionals);

      expect(userAchievement.progress).toBe(75);
      expect(userAchievement.notificationSeen).toBe(true);
      expect(userAchievement.unlockedAt).toEqual(new Date('2025-11-01'));
    });
  });

  /**
   * T036: UserAchievement required fields validation
   */
  describe('T036 - Required fields validation', () => {
    it('should require userId', async () => {
      const missingUserId = {
        // userId missing
        achievementId: 'first-fast',
        unlockedAt: new Date(),
      };

      await expect(UserAchievement.create(missingUserId)).rejects.toThrow();
    });

    it('should require achievementId', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t036-achievementid@test.com',
      });

      const missingAchievementId = {
        userId: user._id,
        // achievementId missing
        unlockedAt: new Date(),
      };

      await expect(UserAchievement.create(missingAchievementId)).rejects.toThrow();
    });

    it('should require unlockedAt', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t036-unlockedat@test.com',
      });

      const missingUnlockedAt = {
        userId: user._id,
        achievementId: 'first-fast',
        // unlockedAt missing
      };

      await expect(UserAchievement.create(missingUnlockedAt)).rejects.toThrow();
    });
  });

  /**
   * T037: UserAchievement default values validation
   */
  describe('T037 - Default values validation', () => {
    it('should set progress default to 0', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t037-progress@test.com',
      });

      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'first-fast',
        unlockedAt: new Date(),
        // progress not provided
      });

      expect(userAchievement.progress).toBe(0);
    });

    it('should set notificationSeen default to false', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t037-notification@test.com',
      });

      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'first-fast',
        unlockedAt: new Date(),
        // notificationSeen not provided
      });

      expect(userAchievement.notificationSeen).toBe(false);
    });

    it('should allow overriding defaults', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t037-override@test.com',
      });

      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'first-fast',
        unlockedAt: new Date(),
        progress: 50,
        notificationSeen: true,
      });

      expect(userAchievement.progress).toBe(50);
      expect(userAchievement.notificationSeen).toBe(true);
    });
  });

  /**
   * T038: UserAchievement timestamps validation
   */
  describe('T038 - Timestamps validation', () => {
    it('should automatically set createdAt and updatedAt on creation', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t038@test.com',
      });

      const beforeCreate = new Date();

      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'timestamp-test',
        unlockedAt: new Date(),
      });

      const afterCreate = new Date();

      expect(userAchievement.createdAt).toBeDefined();
      expect(userAchievement.updatedAt).toBeDefined();
      expect(userAchievement.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(userAchievement.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update updatedAt on modification', async () => {
      const user = await User.create({
        ...testUsers.regularUser,
        email: 'user-t038-update@test.com',
      });

      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'timestamp-update-test',
        unlockedAt: new Date(),
      });

      const originalUpdatedAt = userAchievement.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update progress
      userAchievement.progress = 25;
      await userAchievement.save();

      expect(userAchievement.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
