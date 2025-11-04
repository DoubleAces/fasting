/**
 * Achievement Models Integration Tests
 * Tests for Achievement and UserAchievement models with database operations
 * 
 * TDD Approach: These tests are written FIRST before implementing the models
 * They should FAIL initially (red phase), then PASS after implementation (green phase)
 */

import mongoose from 'mongoose';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import { testUsers } from '../../tests/fixtures/users.js';

// Import models
let Achievement;
let UserAchievement;
let User;

describe('Achievement Models - Integration Tests', () => {
  // Setup: Connect to test database before all tests
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Import models after database connection
    Achievement = (await import('@/lib/models/Achievement')).default;
    UserAchievement = (await import('@/lib/models/UserAchievement')).default;
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
   * T017: Achievement CRUD operations
   */
  describe('T017 - Achievement CRUD operations', () => {
    let admin;

    beforeEach(async () => {
      admin = await User.create({
        ...testUsers.adminUser,
        email: 't017-admin@test.com',
      });
    });

    it('should create a new achievement', async () => {
      const achievementData = {
        achievementId: 'crud-create',
        translations: {
          en: {
            name: 'CRUD Create Test',
            description: 'Testing achievement creation',
            shortDescription: 'Create test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      };

      const achievement = await Achievement.create(achievementData);

      expect(achievement._id).toBeDefined();
      expect(achievement.achievementId).toBe('crud-create');
      expect(achievement.createdAt).toBeDefined();
      expect(achievement.updatedAt).toBeDefined();
    });

    it('should read an achievement by ID', async () => {
      const created = await Achievement.create({
        achievementId: 'crud-read',
        translations: {
          en: {
            name: 'CRUD Read Test',
            description: 'Testing achievement read',
            shortDescription: 'Read test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      const found = await Achievement.findById(created._id);

      expect(found).toBeDefined();
      expect(found.achievementId).toBe('crud-read');
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it('should read an achievement by achievementId', async () => {
      await Achievement.create({
        achievementId: 'crud-read-slug',
        translations: {
          en: {
            name: 'CRUD Read Slug Test',
            description: 'Testing achievement read by slug',
            shortDescription: 'Read slug test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      const found = await Achievement.findOne({ achievementId: 'crud-read-slug' });

      expect(found).toBeDefined();
      expect(found.achievementId).toBe('crud-read-slug');
    });

    it('should update an achievement', async () => {
      const achievement = await Achievement.create({
        achievementId: 'crud-update',
        translations: {
          en: {
            name: 'CRUD Update Test',
            description: 'Testing achievement update',
            shortDescription: 'Update test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      // Update points
      achievement.points = 20;
      achievement.translations.en.name = 'CRUD Update Test (Updated)';
      // Mark nested object as modified for Mongoose to track changes
      achievement.markModified('translations');
      await achievement.save();

      const updated = await Achievement.findById(achievement._id);

      expect(updated.points).toBe(20);
      expect(updated.translations.en.name).toBe('CRUD Update Test (Updated)');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(achievement.createdAt.getTime());
    });

    it('should delete an achievement (hard delete)', async () => {
      const achievement = await Achievement.create({
        achievementId: 'crud-delete-hard',
        translations: {
          en: {
            name: 'CRUD Delete Test',
            description: 'Testing achievement hard delete',
            shortDescription: 'Delete test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      await Achievement.findByIdAndDelete(achievement._id);

      const found = await Achievement.findById(achievement._id);
      expect(found).toBeNull();
    });

    it('should soft delete an achievement using isActive flag', async () => {
      const achievement = await Achievement.create({
        achievementId: 'crud-delete-soft',
        translations: {
          en: {
            name: 'CRUD Soft Delete Test',
            description: 'Testing achievement soft delete',
            shortDescription: 'Soft delete test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
        isActive: true,
      });

      // Soft delete by setting isActive to false
      achievement.isActive = false;
      await achievement.save();

      const found = await Achievement.findById(achievement._id);
      expect(found).toBeDefined();
      expect(found.isActive).toBe(false);

      // Verify soft deleted achievements can be filtered out
      const activeAchievements = await Achievement.find({ isActive: true });
      expect(activeAchievements).toHaveLength(0);
    });
  });

  /**
   * T018: Querying achievements by category
   */
  describe('T018 - Query achievements by category', () => {
    let admin;

    beforeEach(async () => {
      admin = await User.create({
        ...testUsers.adminUser,
        email: 't018-admin@test.com',
      });

      // Create achievements in different categories
      const categories = ['getting-started', 'duration', 'streak', 'goal', 'weight'];
      
      for (let i = 0; i < categories.length; i++) {
        await Achievement.create({
          achievementId: `category-${categories[i]}-${i}`,
          translations: {
            en: {
              name: `${categories[i]} Achievement ${i}`,
              description: `Testing ${categories[i]} category`,
              shortDescription: `${categories[i]} ${i}`,
            },
          },
          category: categories[i],
          points: 10 * (i + 1),
          rarity: 'common',
          order: i,
          criteria: { type: 'manual', params: {} },
          createdBy: admin._id,
        });
      }
    });

    it('should query achievements by category', async () => {
      const durationAchievements = await Achievement.find({ category: 'duration' });

      expect(durationAchievements).toHaveLength(1);
      expect(durationAchievements[0].category).toBe('duration');
    });

    it('should query multiple achievements in same category', async () => {
      // Create multiple achievements in getting-started category
      await Achievement.create({
        achievementId: 'getting-started-extra-1',
        translations: {
          en: {
            name: 'Getting Started Extra 1',
            description: 'Extra getting-started achievement',
            shortDescription: 'Extra 1',
          },
        },
        category: 'getting-started',
        points: 5,
        rarity: 'common',
        order: 100,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      await Achievement.create({
        achievementId: 'getting-started-extra-2',
        translations: {
          en: {
            name: 'Getting Started Extra 2',
            description: 'Another extra getting-started achievement',
            shortDescription: 'Extra 2',
          },
        },
        category: 'getting-started',
        points: 5,
        rarity: 'common',
        order: 101,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      const gettingStartedAchievements = await Achievement.find({ category: 'getting-started' });

      expect(gettingStartedAchievements).toHaveLength(3); // 1 from beforeEach + 2 extras
    });

    it('should sort achievements by order field', async () => {
      const allAchievements = await Achievement.find({}).sort({ order: 1 });

      expect(allAchievements).toHaveLength(5);
      expect(allAchievements[0].order).toBeLessThanOrEqual(allAchievements[1].order);
      expect(allAchievements[1].order).toBeLessThanOrEqual(allAchievements[2].order);
    });

    it('should filter by category and isActive', async () => {
      // Set one achievement to inactive
      const achievement = await Achievement.findOne({ category: 'duration' });
      achievement.isActive = false;
      await achievement.save();

      // Query active achievements in duration category
      const activeDuration = await Achievement.find({ 
        category: 'duration', 
        isActive: true 
      });

      expect(activeDuration).toHaveLength(0);

      // Query all (including inactive)
      const allDuration = await Achievement.find({ category: 'duration' });
      expect(allDuration).toHaveLength(1);
      expect(allDuration[0].isActive).toBe(false);
    });
  });

  /**
   * T019: Query achievement by achievementId
   */
  describe('T019 - Query achievement by achievementId', () => {
    let admin;

    beforeEach(async () => {
      admin = await User.create({
        ...testUsers.adminUser,
        email: 't019-admin@test.com',
      });

      // Create sample achievements
      await Achievement.create({
        achievementId: 'first-fast',
        translations: {
          en: {
            name: 'First Fast',
            description: 'Complete your first fasting entry',
            shortDescription: 'First fast',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'entry-count', params: { count: 1 } },
        createdBy: admin._id,
      });

      await Achievement.create({
        achievementId: 'sweet-sixteen',
        translations: {
          en: {
            name: 'Sweet Sixteen',
            description: 'Complete a 16-hour fast',
            shortDescription: '16-hour fast',
          },
        },
        category: 'duration',
        points: 25,
        rarity: 'rare',
        order: 10,
        criteria: { type: 'duration', params: { duration: 960 } },
        createdBy: admin._id,
      });
    });

    it('should find achievement by achievementId string', async () => {
      const achievement = await Achievement.findOne({ achievementId: 'first-fast' });

      expect(achievement).toBeDefined();
      expect(achievement.achievementId).toBe('first-fast');
      expect(achievement.translations.en.name).toBe('First Fast');
    });

    it('should return null for non-existent achievementId', async () => {
      const achievement = await Achievement.findOne({ achievementId: 'non-existent' });

      expect(achievement).toBeNull();
    });

    it('should handle case-insensitive achievementId lookup (lowercase normalization)', async () => {
      // achievementId is automatically converted to lowercase by schema
      const lowercase = await Achievement.findOne({ achievementId: 'first-fast' });
      const uppercase = await Achievement.findOne({ achievementId: 'FIRST-FAST' });

      expect(lowercase).toBeDefined();
      // Both should find the same document because schema converts to lowercase
      expect(uppercase).toBeDefined();
      expect(uppercase._id.toString()).toBe(lowercase._id.toString());
    });

    it('should query multiple achievements by achievementId array', async () => {
      const achievementIds = ['first-fast', 'sweet-sixteen'];
      const achievements = await Achievement.find({ 
        achievementId: { $in: achievementIds } 
      });

      expect(achievements).toHaveLength(2);
      const ids = achievements.map(a => a.achievementId);
      expect(ids).toContain('first-fast');
      expect(ids).toContain('sweet-sixteen');
    });

    it('should use achievementId for efficient lookups (index test)', async () => {
      // Create many achievements to test index performance
      const bulkAchievements = [];
      for (let i = 0; i < 100; i++) {
        bulkAchievements.push({
          achievementId: `bulk-achievement-${i}`,
          translations: {
            en: {
              name: `Bulk Achievement ${i}`,
              description: `Testing bulk insert ${i}`,
              shortDescription: `Bulk ${i}`,
            },
          },
          category: 'special',
          points: 1,
          rarity: 'common',
          order: i,
          criteria: { type: 'manual', params: {} },
          createdBy: admin._id,
        });
      }

      await Achievement.insertMany(bulkAchievements);

      // Time the query (should be fast with index)
      const startTime = Date.now();
      const found = await Achievement.findOne({ achievementId: 'bulk-achievement-50' });
      const endTime = Date.now();

      expect(found).toBeDefined();
      expect(found.achievementId).toBe('bulk-achievement-50');
      
      // Query should complete quickly (< 100ms with index)
      const queryTime = endTime - startTime;
      expect(queryTime).toBeLessThan(100);
    });
  });

  /**
   * T039: UserAchievement unique compound index on (userId + achievementId)
   */
  describe('T039 - Unique compound index validation', () => {
    let user;
    let admin;
    let achievement;

    beforeEach(async () => {
      user = await User.create({
        ...testUsers.regularUser,
        email: 't039-user@test.com',
      });

      admin = await User.create({
        ...testUsers.adminUser,
        email: 't039-admin@test.com',
      });

      achievement = await Achievement.create({
        achievementId: 'unique-index-test',
        translations: {
          en: {
            name: 'Unique Index Test',
            description: 'Testing compound unique index',
            shortDescription: 'Index test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });
    });

    it('should enforce unique constraint on userId + achievementId', async () => {
      // Create first user achievement
      await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // Attempt to create duplicate
      const duplicate = {
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      };

      await expect(UserAchievement.create(duplicate)).rejects.toThrow();
    });

    it('should allow same achievement for different users', async () => {
      const user2 = await User.create({
        ...testUsers.regularUser,
        email: 't039-user2@test.com',
      });

      // User 1 unlocks achievement
      const userAch1 = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // User 2 unlocks same achievement (should succeed)
      const userAch2 = await UserAchievement.create({
        userId: user2._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      expect(userAch1._id).not.toEqual(userAch2._id);
      expect(userAch1.achievementId).toBe(userAch2.achievementId);
    });

    it('should allow same user to unlock different achievements', async () => {
      const achievement2 = await Achievement.create({
        achievementId: 'another-achievement',
        translations: {
          en: {
            name: 'Another Achievement',
            description: 'Another test achievement',
            shortDescription: 'Another test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 2,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });

      // User unlocks first achievement
      const userAch1 = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // Same user unlocks second achievement (should succeed)
      const userAch2 = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement2.achievementId,
        unlockedAt: new Date(),
      });

      expect(userAch1._id).not.toEqual(userAch2._id);
      expect(userAch1.achievementId).not.toBe(userAch2.achievementId);
    });
  });

  /**
   * T040: UserAchievement duplicate prevention
   */
  describe('T040 - Duplicate unlock prevention', () => {
    let user;
    let admin;

    beforeEach(async () => {
      user = await User.create({
        ...testUsers.regularUser,
        email: 't040-user@test.com',
      });

      admin = await User.create({
        ...testUsers.adminUser,
        email: 't040-admin@test.com',
      });

      await Achievement.create({
        achievementId: 'duplicate-test',
        translations: {
          en: {
            name: 'Duplicate Test',
            description: 'Testing duplicate prevention',
            shortDescription: 'Duplicate test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });
    });

    it('should prevent unlocking same achievement twice for same user', async () => {
      // First unlock
      await UserAchievement.create({
        userId: user._id,
        achievementId: 'duplicate-test',
        unlockedAt: new Date(),
      });

      // Attempt second unlock
      await expect(
        UserAchievement.create({
          userId: user._id,
          achievementId: 'duplicate-test',
          unlockedAt: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should detect duplicates even with different unlockedAt times', async () => {
      // First unlock
      await UserAchievement.create({
        userId: user._id,
        achievementId: 'duplicate-test',
        unlockedAt: new Date('2025-11-01'),
      });

      // Attempt second unlock with different date
      await expect(
        UserAchievement.create({
          userId: user._id,
          achievementId: 'duplicate-test',
          unlockedAt: new Date('2025-11-04'),
        })
      ).rejects.toThrow();
    });
  });

  /**
   * T041: Query UserAchievements by userId sorted by unlockedAt descending
   */
  describe('T041 - Query by userId with sorting', () => {
    let user;
    let admin;

    beforeEach(async () => {
      user = await User.create({
        ...testUsers.regularUser,
        email: 't041-user@test.com',
      });

      admin = await User.create({
        ...testUsers.adminUser,
        email: 't041-admin@test.com',
      });

      // Create achievements
      for (let i = 1; i <= 5; i++) {
        await Achievement.create({
          achievementId: `sort-test-${i}`,
          translations: {
            en: {
              name: `Sort Test ${i}`,
              description: `Testing sort ${i}`,
              shortDescription: `Sort ${i}`,
            },
          },
          category: 'getting-started',
          points: 10,
          rarity: 'common',
          order: i,
          criteria: { type: 'manual', params: {} },
          createdBy: admin._id,
        });
      }

      // Unlock achievements at different times
      await UserAchievement.create({
        userId: user._id,
        achievementId: 'sort-test-1',
        unlockedAt: new Date('2025-11-01'),
      });

      await UserAchievement.create({
        userId: user._id,
        achievementId: 'sort-test-2',
        unlockedAt: new Date('2025-11-03'),
      });

      await UserAchievement.create({
        userId: user._id,
        achievementId: 'sort-test-3',
        unlockedAt: new Date('2025-11-02'),
      });
    });

    it('should query all achievements for a user', async () => {
      const userAchievements = await UserAchievement.find({ userId: user._id });

      expect(userAchievements).toHaveLength(3);
    });

    it('should sort achievements by unlockedAt descending (most recent first)', async () => {
      const userAchievements = await UserAchievement.find({ userId: user._id })
        .sort({ unlockedAt: -1 });

      expect(userAchievements).toHaveLength(3);
      expect(userAchievements[0].achievementId).toBe('sort-test-2'); // Nov 3 (most recent)
      expect(userAchievements[1].achievementId).toBe('sort-test-3'); // Nov 2
      expect(userAchievements[2].achievementId).toBe('sort-test-1'); // Nov 1 (oldest)
    });

    it('should filter by userId correctly (no data leakage)', async () => {
      // Create another user
      const user2 = await User.create({
        ...testUsers.regularUser,
        email: 't041-user2@test.com',
      });

      // User 2 unlocks one achievement
      await UserAchievement.create({
        userId: user2._id,
        achievementId: 'sort-test-4',
        unlockedAt: new Date(),
      });

      // Query user 1's achievements
      const user1Achievements = await UserAchievement.find({ userId: user._id });
      expect(user1Achievements).toHaveLength(3);

      // Query user 2's achievements
      const user2Achievements = await UserAchievement.find({ userId: user2._id });
      expect(user2Achievements).toHaveLength(1);
    });
  });

  /**
   * T042: Update UserAchievement progress field
   */
  describe('T042 - Progress field updates', () => {
    let user;
    let admin;

    beforeEach(async () => {
      user = await User.create({
        ...testUsers.regularUser,
        email: 't042-user@test.com',
      });

      admin = await User.create({
        ...testUsers.adminUser,
        email: 't042-admin@test.com',
      });

      await Achievement.create({
        achievementId: 'progress-test',
        translations: {
          en: {
            name: 'Progress Test',
            description: 'Testing progress tracking',
            shortDescription: 'Progress test',
          },
        },
        category: 'streak',
        points: 50,
        rarity: 'rare',
        order: 1,
        criteria: { type: 'streak', params: { count: 30 } },
        createdBy: admin._id,
      });
    });

    it('should create achievement with initial progress', async () => {
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'progress-test',
        unlockedAt: new Date(),
        progress: 15,
      });

      expect(userAchievement.progress).toBe(15);
    });

    it('should update progress incrementally', async () => {
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'progress-test',
        unlockedAt: new Date(),
        progress: 10,
      });

      // Update progress
      userAchievement.progress = 20;
      await userAchievement.save();

      const updated = await UserAchievement.findById(userAchievement._id);
      expect(updated.progress).toBe(20);
    });

    it('should allow progress to be reset to 0', async () => {
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'progress-test',
        unlockedAt: new Date(),
        progress: 25,
      });

      // Reset progress
      userAchievement.progress = 0;
      await userAchievement.save();

      const updated = await UserAchievement.findById(userAchievement._id);
      expect(updated.progress).toBe(0);
    });

    it('should enforce minimum progress value (non-negative)', async () => {
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: 'progress-test',
        unlockedAt: new Date(),
      });

      // Attempt to set negative progress
      userAchievement.progress = -10;
      
      await expect(userAchievement.save()).rejects.toThrow();
    });
  });

  /**
   * T043: UserAchievement with string achievementId reference (weak reference pattern)
   */
  describe('T043 - String achievementId reference', () => {
    let user;
    let admin;
    let achievement;

    beforeEach(async () => {
      user = await User.create({
        ...testUsers.regularUser,
        email: 't043-user@test.com',
      });

      admin = await User.create({
        ...testUsers.adminUser,
        email: 't043-admin@test.com',
      });

      achievement = await Achievement.create({
        achievementId: 'string-ref-test',
        translations: {
          en: {
            name: 'String Reference Test',
            description: 'Testing string-based achievementId reference',
            shortDescription: 'String ref test',
          },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'manual', params: {} },
        createdBy: admin._id,
      });
    });

    it('should store achievementId as string (not ObjectId)', async () => {
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      expect(typeof userAchievement.achievementId).toBe('string');
      expect(userAchievement.achievementId).toBe('string-ref-test');
    });

    it('should allow manual join with Achievement collection', async () => {
      await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // Manual join: Find user achievement, then find achievement
      const userAch = await UserAchievement.findOne({ userId: user._id });
      const achDetails = await Achievement.findOne({ achievementId: userAch.achievementId });

      expect(achDetails).toBeDefined();
      expect(achDetails.translations.en.name).toBe('String Reference Test');
    });

    it('should maintain UserAchievement when Achievement is soft deleted', async () => {
      // User unlocks achievement
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // Soft delete achievement
      achievement.isActive = false;
      await achievement.save();

      // UserAchievement should still exist
      const userAch = await UserAchievement.findById(userAchievement._id);
      expect(userAch).toBeDefined();
      expect(userAch.achievementId).toBe('string-ref-test');

      // Achievement is soft deleted but reference remains valid
      const softDeletedAch = await Achievement.findOne({ achievementId: 'string-ref-test' });
      expect(softDeletedAch.isActive).toBe(false);
    });

    it('should allow UserAchievement to exist even if Achievement is hard deleted', async () => {
      // User unlocks achievement
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      // Hard delete achievement
      await Achievement.findByIdAndDelete(achievement._id);

      // UserAchievement should still exist (orphaned but valid)
      const userAch = await UserAchievement.findById(userAchievement._id);
      expect(userAch).toBeDefined();
      expect(userAch.achievementId).toBe('string-ref-test');

      // Attempt to join will return null
      const deletedAch = await Achievement.findOne({ achievementId: userAch.achievementId });
      expect(deletedAch).toBeNull();
    });
  });

  /**
   * T062: User Model Extensions - Achievement Fields
   */
  describe('T062 - User.preferredLanguage field', () => {
    it('should default to "en" when not provided', async () => {
      const user = await User.create({
        email: 't062-default@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Default Language User',
      });

      expect(user.preferredLanguage).toBe('en');
    });

    it('should accept valid language codes', async () => {
      const validLanguages = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'];

      for (const lang of validLanguages) {
        const user = await User.create({
          email: `t062-${lang}@test.com`,
          password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
          authMethod: 'email',
          name: `User ${lang.toUpperCase()}`,
          preferredLanguage: lang,
        });

        expect(user.preferredLanguage).toBe(lang);
      }
    });

    it('should reject invalid language code', async () => {
      await expect(
        User.create({
          email: 't062-invalid@test.com',
          password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
          authMethod: 'email',
          name: 'Invalid Language User',
          preferredLanguage: 'xx',
        })
      ).rejects.toThrow();
    });

    it('should normalize language code to lowercase', async () => {
      const user = await User.create({
        email: 't062-uppercase@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Uppercase Test',
        preferredLanguage: 'EN',
      });

      expect(user.preferredLanguage).toBe('en');
    });
  });

  /**
   * T063: User.achievementPoints field
   */
  describe('T063 - User.achievementPoints field', () => {
    it('should default to 0 when not provided', async () => {
      const user = await User.create({
        email: 't063-default@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Default Points User',
      });

      expect(user.achievementPoints).toBe(0);
    });

    it('should accept positive achievementPoints', async () => {
      const user = await User.create({
        email: 't063-positive@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Positive Points User',
        achievementPoints: 150,
      });

      expect(user.achievementPoints).toBe(150);
    });

    it('should accept zero achievementPoints', async () => {
      const user = await User.create({
        email: 't063-zero@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Zero Points User',
        achievementPoints: 0,
      });

      expect(user.achievementPoints).toBe(0);
    });

    it('should reject negative achievementPoints', async () => {
      await expect(
        User.create({
          email: 't063-negative@test.com',
          password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
          authMethod: 'email',
          name: 'Negative Points User',
          achievementPoints: -50,
        })
      ).rejects.toThrow();
    });

    it('should reject non-integer achievementPoints', async () => {
      await expect(
        User.create({
          email: 't063-decimal@test.com',
          password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
          authMethod: 'email',
          name: 'Decimal Points User',
          achievementPoints: 25.5,
        })
      ).rejects.toThrow();
    });

    it('should increment achievementPoints correctly', async () => {
      const user = await User.create({
        email: 't063-increment@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Increment User',
        achievementPoints: 50,
      });

      // Increment by 25
      user.achievementPoints += 25;
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.achievementPoints).toBe(75);
    });
  });

  /**
   * T064: User Model backward compatibility with new fields
   */
  describe('T064 - User Model backward compatibility', () => {
    it('should not break existing authentication functionality', async () => {
      const user = await User.create({
        email: 't064-compat@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Compatibility User',
        preferredLanguage: 'es',
        achievementPoints: 50,
      });

      // Verify existing fields still work
      expect(user.email).toBe('t064-compat@test.com');
      expect(user.authMethod).toBe('email');
      expect(user.name).toBe('Compatibility User');
      expect(user.termsAcceptedAt).toBeDefined();
      expect(user.isActive).toBe(true);

      // Verify new fields
      expect(user.preferredLanguage).toBe('es');
      expect(user.achievementPoints).toBe(50);
    });

    it('should work with OAuth users', async () => {
      const user = await User.create({
        email: 't064-oauth@test.com',
        authMethod: 'google',
        googleId: 'google-achievement-123',
        name: 'OAuth Achievement User',
        emailVerified: true,
        preferredLanguage: 'fr',
        achievementPoints: 200,
      });

      expect(user.authMethod).toBe('google');
      expect(user.googleId).toBe('google-achievement-123');
      expect(user.emailVerified).toBe(true);
      expect(user.preferredLanguage).toBe('fr');
      expect(user.achievementPoints).toBe(200);
    });

    it('should maintain existing User methods and fields', async () => {
      const user = await User.create({
        email: 't064-methods@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Methods Test User',
        preferredLanguage: 'de',
        achievementPoints: 100,
      });

      // Test that existing fields are unaffected
      expect(user.registrationDate).toBeDefined();
      expect(user.lastLogin).toBeDefined();
      expect(user.isActive).toBe(true);
      expect(user.isAdmin).toBe(false);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      // Test new fields coexist
      expect(user.preferredLanguage).toBe('de');
      expect(user.achievementPoints).toBe(100);
    });
  });

  /**
   * ============================================================================
   * PHASE 6: INTEGRATION & VERIFICATION
   * Cross-model workflows to ensure all three models work together
   * ============================================================================
   */

  /**
   * T069: Complete achievement workflow (Achievement → UserAchievement → User points)
   */
  describe('T069 - Complete achievement unlock workflow', () => {
    it('should complete full workflow: create achievement, unlock for user, increment points', async () => {
      // Step 1: Create admin user
      const admin = await User.create({
        email: 't069-admin@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Admin User',
        isAdmin: true,
      });

      // Step 2: Create achievement
      const achievement = await Achievement.create({
        achievementId: 'workflow-test',
        translations: {
          en: {
            name: 'Workflow Test Achievement',
            description: 'Complete workflow test',
            shortDescription: 'Workflow test',
          },
        },
        category: 'getting-started',
        points: 25,
        rarity: 'common',
        order: 1,
        criteria: {
          type: 'test-criteria',
          params: { test: true },
        },
        createdBy: admin._id,
      });

      // Step 3: Create regular user
      const user = await User.create({
        email: 't069-user@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Regular User',
        achievementPoints: 0,
      });

      expect(user.achievementPoints).toBe(0);

      // Step 4: Unlock achievement for user
      const userAchievement = await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });

      expect(userAchievement.userId.toString()).toBe(user._id.toString());
      expect(userAchievement.achievementId).toBe('workflow-test');

      // Step 5: Increment user points
      user.achievementPoints += achievement.points;
      await user.save();

      // Step 6: Verify final state
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.achievementPoints).toBe(25);

      // Verify unlock relationship
      const unlocks = await UserAchievement.find({ userId: user._id });
      expect(unlocks).toHaveLength(1);
      expect(unlocks[0].achievementId).toBe('workflow-test');
    });

    it('should handle multiple achievement unlocks with cumulative points', async () => {
      const admin = await User.create({
        email: 't069-multi-admin@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Multi Admin',
        isAdmin: true,
      });

      const user = await User.create({
        email: 't069-multi-user@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Multi User',
      });

      // Create three achievements
      const achievements = await Achievement.insertMany([
        {
          achievementId: 'multi-1',
          translations: { en: { name: 'Achievement 1', description: 'First', shortDescription: 'A1' } },
          category: 'getting-started',
          points: 10,
          rarity: 'common',
          order: 1,
          criteria: { type: 'test' },
          createdBy: admin._id,
        },
        {
          achievementId: 'multi-2',
          translations: { en: { name: 'Achievement 2', description: 'Second', shortDescription: 'A2' } },
          category: 'streak',
          points: 25,
          rarity: 'rare',
          order: 2,
          criteria: { type: 'test' },
          createdBy: admin._id,
        },
        {
          achievementId: 'multi-3',
          translations: { en: { name: 'Achievement 3', description: 'Third', shortDescription: 'A3' } },
          category: 'goal',
          points: 50,
          rarity: 'epic',
          order: 3,
          criteria: { type: 'test' },
          createdBy: admin._id,
        },
      ]);

      // Unlock all three achievements
      for (const achievement of achievements) {
        await UserAchievement.create({
          userId: user._id,
          achievementId: achievement.achievementId,
          unlockedAt: new Date(),
        });

        user.achievementPoints += achievement.points;
      }

      await user.save();

      // Verify cumulative points: 10 + 25 + 50 = 85
      const finalUser = await User.findById(user._id);
      expect(finalUser.achievementPoints).toBe(85);

      // Verify all unlocks
      const unlocks = await UserAchievement.find({ userId: user._id });
      expect(unlocks).toHaveLength(3);
    });
  });

  /**
   * T070: Manual joins between UserAchievement and Achievement
   */
  describe('T070 - Manual joins via achievementId string', () => {
    let user, admin, achievement1, achievement2;

    beforeEach(async () => {
      admin = await User.create({
        email: 't070-admin@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Join Admin',
        isAdmin: true,
      });

      user = await User.create({
        email: 't070-user@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Join User',
        preferredLanguage: 'es',
      });

      achievement1 = await Achievement.create({
        achievementId: 'join-test-1',
        translations: {
          en: { name: 'Join Test 1', description: 'First join test', shortDescription: 'JT1' },
          es: { name: 'Prueba de Unión 1', description: 'Primera prueba de unión', shortDescription: 'PU1' },
        },
        category: 'getting-started',
        points: 15,
        rarity: 'common',
        order: 1,
        criteria: { type: 'test' },
        createdBy: admin._id,
      });

      achievement2 = await Achievement.create({
        achievementId: 'join-test-2',
        translations: {
          en: { name: 'Join Test 2', description: 'Second join test', shortDescription: 'JT2' },
          es: { name: 'Prueba de Unión 2', description: 'Segunda prueba de unión', shortDescription: 'PU2' },
        },
        category: 'streak',
        points: 30,
        rarity: 'rare',
        order: 2,
        criteria: { type: 'test' },
        createdBy: admin._id,
      });

      // Unlock both achievements
      await UserAchievement.create({
        userId: user._id,
        achievementId: achievement1.achievementId,
        unlockedAt: new Date('2025-01-01'),
      });

      await UserAchievement.create({
        userId: user._id,
        achievementId: achievement2.achievementId,
        unlockedAt: new Date('2025-01-02'),
      });
    });

    it('should query user achievements and join with achievement details', async () => {
      // Step 1: Get user's unlocked achievements
      const userAchievements = await UserAchievement.find({ userId: user._id }).sort({ unlockedAt: -1 });
      expect(userAchievements).toHaveLength(2);

      // Step 2: Extract achievementIds for manual join
      const achievementIds = userAchievements.map(ua => ua.achievementId);
      expect(achievementIds).toEqual(['join-test-2', 'join-test-1']); // Sorted by unlockedAt desc

      // Step 3: Manual join - fetch achievement details
      const achievements = await Achievement.find({ achievementId: { $in: achievementIds } });
      expect(achievements).toHaveLength(2);

      // Step 4: Create a map for easy lookup
      const achievementMap = {};
      achievements.forEach(ach => {
        achievementMap[ach.achievementId] = ach;
      });

      // Step 5: Combine data
      const enrichedAchievements = userAchievements.map(ua => ({
        unlockedAt: ua.unlockedAt,
        progress: ua.progress,
        notificationSeen: ua.notificationSeen,
        achievement: achievementMap[ua.achievementId],
      }));

      expect(enrichedAchievements[0].achievement.achievementId).toBe('join-test-2');
      expect(enrichedAchievements[1].achievement.achievementId).toBe('join-test-1');
    });

    it('should select correct translation based on user language preference', async () => {
      const userAchievements = await UserAchievement.find({ userId: user._id });
      const achievementIds = userAchievements.map(ua => ua.achievementId);
      const achievements = await Achievement.find({ achievementId: { $in: achievementIds } });

      // User prefers Spanish ('es')
      const userLanguage = user.preferredLanguage;
      expect(userLanguage).toBe('es');

      const translatedAchievements = achievements.map(ach => {
        const translation = ach.translations[userLanguage] || ach.translations.en;
        return {
          achievementId: ach.achievementId,
          name: translation.name,
          description: translation.description,
          points: ach.points,
        };
      });

      // Find the first achievement
      const firstAch = translatedAchievements.find(a => a.achievementId === 'join-test-1');
      expect(firstAch.name).toBe('Prueba de Unión 1');
      expect(firstAch.description).toBe('Primera prueba de unión');
    });

    it('should fallback to English if preferred language not available', async () => {
      // Create achievement with only English translation
      const enOnlyAch = await Achievement.create({
        achievementId: 'en-only',
        translations: {
          en: { name: 'English Only', description: 'Only English available', shortDescription: 'EN' },
        },
        category: 'special',
        points: 20,
        rarity: 'rare',
        order: 10,
        criteria: { type: 'test' },
        createdBy: admin._id,
      });

      await UserAchievement.create({
        userId: user._id,
        achievementId: enOnlyAch.achievementId,
        unlockedAt: new Date(),
      });

      // User prefers Spanish but only English available
      const translation = enOnlyAch.translations[user.preferredLanguage] || enOnlyAch.translations.en;
      expect(translation.name).toBe('English Only');
    });
  });

  /**
   * T071: Achievement soft delete behavior
   */
  describe('T071 - Achievement soft delete (isActive: false)', () => {
    let user, admin, achievement;

    beforeEach(async () => {
      admin = await User.create({
        email: 't071-admin@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Soft Delete Admin',
        isAdmin: true,
      });

      user = await User.create({
        email: 't071-user@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Soft Delete User',
      });

      achievement = await Achievement.create({
        achievementId: 'soft-delete-test',
        translations: {
          en: { name: 'Soft Delete Test', description: 'Will be soft deleted', shortDescription: 'SDT' },
        },
        category: 'special',
        points: 40,
        rarity: 'epic',
        order: 1,
        criteria: { type: 'test' },
        createdBy: admin._id,
      });

      // User unlocks achievement
      await UserAchievement.create({
        userId: user._id,
        achievementId: achievement.achievementId,
        unlockedAt: new Date(),
      });
    });

    it('should preserve UserAchievement when Achievement is soft deleted', async () => {
      // Soft delete achievement
      achievement.isActive = false;
      await achievement.save();

      // UserAchievement should still exist
      const userAch = await UserAchievement.findOne({
        userId: user._id,
        achievementId: 'soft-delete-test',
      });

      expect(userAch).toBeDefined();
      expect(userAch.achievementId).toBe('soft-delete-test');

      // Achievement still exists but is inactive
      const softDeletedAch = await Achievement.findOne({ achievementId: 'soft-delete-test' });
      expect(softDeletedAch).toBeDefined();
      expect(softDeletedAch.isActive).toBe(false);
    });

    it('should allow manual join to retrieve soft deleted achievement', async () => {
      // Soft delete achievement
      achievement.isActive = false;
      await achievement.save();

      // Query user achievements (including soft deleted)
      const userAchievements = await UserAchievement.find({ userId: user._id });
      const achievementIds = userAchievements.map(ua => ua.achievementId);

      // Manual join (without isActive filter) should return soft deleted achievement
      const achievements = await Achievement.find({ achievementId: { $in: achievementIds } });
      expect(achievements).toHaveLength(1);
      expect(achievements[0].isActive).toBe(false);
    });

    it('should exclude soft deleted achievements from active achievement queries', async () => {
      // Soft delete achievement
      achievement.isActive = false;
      await achievement.save();

      // Query only active achievements
      const activeAchievements = await Achievement.find({ isActive: true });
      expect(activeAchievements).toHaveLength(0);

      // Query all achievements (including inactive)
      const allAchievements = await Achievement.find({});
      expect(allAchievements).toHaveLength(1);
      expect(allAchievements[0].isActive).toBe(false);
    });
  });

  /**
   * T072: User language preference affecting display
   */
  describe('T072 - User language preference integration', () => {
    let admin, achievement;

    beforeEach(async () => {
      admin = await User.create({
        email: 't072-admin@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Lang Admin',
        isAdmin: true,
      });

      achievement = await Achievement.create({
        achievementId: 'multilang-test',
        translations: {
          en: { name: 'First Fast', description: 'Complete your first fast', shortDescription: 'First' },
          es: { name: 'Primer Ayuno', description: 'Completa tu primer ayuno', shortDescription: 'Primero' },
          fr: { name: 'Premier Jeûne', description: 'Complétez votre premier jeûne', shortDescription: 'Premier' },
          de: { name: 'Erstes Fasten', description: 'Vervollständigen Sie Ihr erstes Fasten', shortDescription: 'Erstes' },
          pt: { name: 'Primeiro Jejum', description: 'Complete seu primeiro jejum', shortDescription: 'Primeiro' },
          ja: { name: '初めての断食', description: '初めての断食を完了', shortDescription: '初' },
          zh: { name: '首次禁食', description: '完成您的第一次禁食', shortDescription: '首次' },
        },
        category: 'getting-started',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'first-fast' },
        createdBy: admin._id,
      });
    });

    it('should display Spanish translation for Spanish-speaking user', async () => {
      const user = await User.create({
        email: 't072-es@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Spanish User',
        preferredLanguage: 'es',
      });

      const translation = achievement.translations[user.preferredLanguage];
      expect(translation.name).toBe('Primer Ayuno');
      expect(translation.description).toBe('Completa tu primer ayuno');
    });

    it('should display correct translation for all supported languages', async () => {
      const languages = {
        en: 'First Fast',
        es: 'Primer Ayuno',
        fr: 'Premier Jeûne',
        de: 'Erstes Fasten',
        pt: 'Primeiro Jejum',
        ja: '初めての断食',
        zh: '首次禁食',
      };

      for (const [lang, expectedName] of Object.entries(languages)) {
        const user = await User.create({
          email: `t072-${lang}@test.com`,
          password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
          authMethod: 'email',
          name: `${lang.toUpperCase()} User`,
          preferredLanguage: lang,
        });

        const translation = achievement.translations[user.preferredLanguage];
        expect(translation.name).toBe(expectedName);
      }
    });

    it('should handle user updating language preference', async () => {
      const user = await User.create({
        email: 't072-change@test.com',
        password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
        authMethod: 'email',
        name: 'Language Changer',
        preferredLanguage: 'en',
      });

      // Initially English
      let translation = achievement.translations[user.preferredLanguage];
      expect(translation.name).toBe('First Fast');

      // Update to French
      user.preferredLanguage = 'fr';
      await user.save();

      const updatedUser = await User.findById(user._id);
      translation = achievement.translations[updatedUser.preferredLanguage];
      expect(translation.name).toBe('Premier Jeûne');
    });
  });
});
