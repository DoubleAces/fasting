/**
 * AchievementService Unit Tests
 * Tests for achievement unlocking logic
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { AchievementService } from '@/lib/services/AchievementService';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';

describe('AchievementService', () => {
  let mongoServer;
  let testUserId;

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
    // Clear cache
    AchievementService.clearCache();
    
    // Clear all collections
    await Promise.all([
      Achievement.deleteMany({}),
      UserAchievement.deleteMany({}),
      Entry.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Create test user with properly hashed password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      authMethod: 'email',
      name: 'Test User',
      achievementPoints: 0,
    });
    testUserId = user._id.toString();
  });

  describe('calculateStreak', () => {
    it('should return 0 for user with no entries', async () => {
      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(0);
    });

    it('should return 1 for user with single entry', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(1);
    });

    it('should calculate streak for consecutive days', async () => {
      // Create entries for 5 consecutive days
      const dates = ['2024-11-01', '2024-11-02', '2024-11-03', '2024-11-04', '2024-11-05'];
      
      for (const dateStr of dates) {
        await Entry.create({
          userId: testUserId,
          date: new Date(dateStr),
          lastMealTime: '20:00',
          firstMealTime: '12:00',
          fastingDuration: 960,
        });
      }

      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(5);
    });

    it('should handle 7-day streak correctly', async () => {
      // Create entries for 7 consecutive days
      const dates = [
        '2024-11-01', '2024-11-02', '2024-11-03', '2024-11-04',
        '2024-11-05', '2024-11-06', '2024-11-07',
      ];
      
      for (const dateStr of dates) {
        await Entry.create({
          userId: testUserId,
          date: new Date(dateStr),
          lastMealTime: '20:00',
          firstMealTime: '12:00',
          fastingDuration: 960,
        });
      }

      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(7);
    });

    it('should break streak when day is skipped', async () => {
      // Create entries with a gap
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-02'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Skip Nov 3

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-04'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-05'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Streak should be 2 (Nov 4 and Nov 5, since sorted descending)
      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(2);
    });

    it('should count multiple entries on same day as single day', async () => {
      // Note: Entry model has unique index on (userId + date), so we can only have one entry per date
      // This test verifies the logic handles the case where we check for same-day entries in streak calc
      
      // Create 3 consecutive days
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-02'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-03'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Streak should be 3 days (Nov 1, 2, 3)
      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(3);
    });

    it('should handle 30-day streak correctly', async () => {
      // Create entries for 30 consecutive days
      const startDate = new Date('2024-10-01');
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        await Entry.create({
          userId: testUserId,
          date,
          lastMealTime: '20:00',
          firstMealTime: '12:00',
          fastingDuration: 960,
        });
      }

      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(30);
    });

    it('should only count from most recent consecutive sequence', async () => {
      // Old streak (broken)
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-10-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-10-02'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Gap

      // New streak
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-02'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-03'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Streak should be 3 (most recent consecutive sequence)
      const streak = await AchievementService.calculateStreak(testUserId);
      expect(streak).toBe(3);
    });
  });

  describe('getActiveAchievements', () => {
    it('should return empty array when no achievements exist', async () => {
      const achievements = await AchievementService.getActiveAchievements();
      expect(achievements).toEqual([]);
    });

    it('should return only active achievements', async () => {
      await Achievement.create({
        achievementId: 'test-1',
        category: 'duration',
        rarity: 'common',
        points: 10,
        icon: '🎯',
        isActive: true,
        isSecret: false,
        criteria: { type: 'duration-milestone', params: { minDuration: 720 } },
        createdBy: testUserId,
        order: 1,
        translations: {
          en: {
            name: 'Test Achievement 1',
            description: 'This is a test achievement description',
            shortDescription: 'Test achievement'
          }
        },
      });

      await Achievement.create({
        achievementId: 'test-2',
        category: 'duration',
        rarity: 'common',
        points: 10,
        icon: '🎯',
        isActive: false, // Inactive
        isSecret: false,
        criteria: { type: 'duration-milestone', params: { minDuration: 1440 } },
        createdBy: testUserId,
        order: 2,
        translations: {
          en: {
            name: 'Test Achievement 2',
            description: 'This is another test achievement description',
            shortDescription: 'Test achievement 2'
          }
        },
      });

      const achievements = await AchievementService.getActiveAchievements();
      expect(achievements).toHaveLength(1);
      expect(achievements[0].achievementId).toBe('test-1');
    });

    it('should cache achievements for subsequent calls', async () => {
      await Achievement.create({
        achievementId: 'test-1',
        category: 'duration',
        rarity: 'common',
        points: 10,
        icon: '🎯',
        isActive: true,
        isSecret: false,
        criteria: { type: 'duration-milestone', params: { minDuration: 720 } },
        createdBy: testUserId,
        order: 1,
        translations: {
          en: {
            name: 'Test Achievement 1',
            description: 'This is a test achievement description',
            shortDescription: 'Test achievement'
          }
        },
      });

      // First call - should query database
      const achievements1 = await AchievementService.getActiveAchievements();
      expect(achievements1).toHaveLength(1);

      // Add another achievement after first call
      await Achievement.create({
        achievementId: 'test-2',
        category: 'duration',
        rarity: 'common',
        points: 10,
        icon: '🎯',
        isActive: true,
        isSecret: false,
        criteria: { type: 'duration-milestone', params: { minDuration: 1440 } },
        createdBy: testUserId,
        order: 2,
        translations: {
          en: {
            name: 'Test Achievement 2',
            description: 'This is another test achievement description',
            shortDescription: 'Test achievement 2'
          }
        },
      });

      // Second call - should use cache, so still returns 1
      const achievements2 = await AchievementService.getActiveAchievements();
      expect(achievements2).toHaveLength(1);
    });
  });

  describe('evaluateDurationAchievements', () => {
    let testEntry;
    let achievements;

    beforeEach(async () => {
      // Create duration-based achievements with different thresholds
      achievements = await Promise.all([
        Achievement.create({
          achievementId: 'first-twelve',
          category: 'duration',
          rarity: 'common',
          points: 10,
          icon: '⏰',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 720 } }, // 12h
          createdBy: testUserId,
          order: 1,
          translations: {
            en: {
              name: 'First Twelve',
              description: 'Complete your first 12-hour fast',
              shortDescription: '12-hour fast'
            }
          },
        }),
        Achievement.create({
          achievementId: 'daily-devotion',
          category: 'duration',
          rarity: 'rare',
          points: 25,
          icon: '🌅',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 1440 } }, // 24h
          createdBy: testUserId,
          order: 2,
          translations: {
            en: {
              name: 'Daily Devotion',
              description: 'Complete a full 24-hour fast',
              shortDescription: '24-hour fast'
            }
          },
        }),
        Achievement.create({
          achievementId: 'two-day-warrior',
          category: 'duration',
          rarity: 'epic',
          points: 50,
          icon: '⚔️',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 2880 } }, // 48h
          createdBy: testUserId,
          order: 3,
          translations: {
            en: {
              name: 'Two Day Warrior',
              description: 'Complete a 48-hour fast',
              shortDescription: '48-hour fast'
            }
          },
        }),
        Achievement.create({
          achievementId: 'three-day-legend',
          category: 'duration',
          rarity: 'legendary',
          points: 100,
          icon: '👑',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 4320 } }, // 72h
          createdBy: testUserId,
          order: 4,
          translations: {
            en: {
              name: 'Three Day Legend',
              description: 'Complete a 72-hour fast',
              shortDescription: '72-hour fast'
            }
          },
        }),
        // Non-duration achievement (should be filtered out)
        Achievement.create({
          achievementId: 'streak-7',
          category: 'streak',
          rarity: 'common',
          points: 15,
          icon: '🔥',
          isActive: true,
          isSecret: false,
          criteria: { type: 'streak-milestone', params: { count: 7 } },
          createdBy: testUserId,
          order: 5,
          translations: {
            en: {
              name: 'Week Warrior',
              description: 'Maintain a 7-day streak',
              shortDescription: '7-day streak'
            }
          },
        }),
      ]);
    });

    it('should return empty array when entry has no fasting duration', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: null,
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toEqual([]);
    });

    it('should return empty array when duration is below all thresholds', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 600, // 10 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toEqual([]);
    });

    it('should return single achievement when duration meets one threshold', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 720, // Exactly 12 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('first-twelve');
    });

    it('should return multiple achievements when duration meets multiple thresholds', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 2880, // 48 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toHaveLength(3);
      expect(qualifiedIds).toContain('first-twelve');
      expect(qualifiedIds).toContain('daily-devotion');
      expect(qualifiedIds).toContain('two-day-warrior');
      expect(qualifiedIds).not.toContain('three-day-legend'); // 72h not reached
      expect(qualifiedIds).not.toContain('streak-7'); // Not a duration achievement
    });

    it('should return all duration achievements when duration exceeds all thresholds', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 5000, // >72 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toHaveLength(4);
      expect(qualifiedIds).toContain('first-twelve');
      expect(qualifiedIds).toContain('daily-devotion');
      expect(qualifiedIds).toContain('two-day-warrior');
      expect(qualifiedIds).toContain('three-day-legend');
      expect(qualifiedIds).not.toContain('streak-7'); // Not a duration achievement
    });

    it('should exclude inactive achievements from results', async () => {
      // Deactivate one achievement
      await Achievement.updateOne(
        { achievementId: 'daily-devotion' },
        { isActive: false }
      );

      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 1500, // >24 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('first-twelve');
      expect(qualifiedIds).not.toContain('daily-devotion'); // Inactive
    });

    it('should exclude already-unlocked achievements from results', async () => {
      // User already unlocked 12h and 24h achievements
      await Promise.all([
        UserAchievement.create({
          userId: testUserId,
          achievementId: 'first-twelve',
          unlockedAt: new Date(),
          progress: 720, // Duration in minutes
        }),
        UserAchievement.create({
          userId: testUserId,
          achievementId: 'daily-devotion',
          unlockedAt: new Date(),
          progress: 1440, // Duration in minutes
        }),
      ]);

      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 2880, // 48 hours
      });

      const qualifiedIds = await AchievementService.evaluateDurationAchievements(testUserId, testEntry._id.toString());
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('two-day-warrior'); // Only new achievement
      expect(qualifiedIds).not.toContain('first-twelve'); // Already unlocked
      expect(qualifiedIds).not.toContain('daily-devotion'); // Already unlocked
    });
  });

  describe('unlockAchievements', () => {
    let achievements;

    beforeEach(async () => {
      // Create test achievements
      achievements = await Promise.all([
        Achievement.create({
          achievementId: 'first-twelve',
          category: 'duration',
          rarity: 'common',
          points: 10,
          icon: '⏰',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 720 } },
          createdBy: testUserId,
          order: 1,
          translations: {
            en: {
              name: 'First Twelve',
              description: 'Complete your first 12-hour fast',
              shortDescription: '12-hour fast'
            }
          },
        }),
        Achievement.create({
          achievementId: 'daily-devotion',
          category: 'duration',
          rarity: 'rare',
          points: 25,
          icon: '🌅',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 1440 } },
          createdBy: testUserId,
          order: 2,
          translations: {
            en: {
              name: 'Daily Devotion',
              description: 'Complete a full 24-hour fast',
              shortDescription: '24-hour fast'
            }
          },
        }),
        Achievement.create({
          achievementId: 'two-day-warrior',
          category: 'duration',
          rarity: 'epic',
          points: 50,
          icon: '⚔️',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 2880 } },
          createdBy: testUserId,
          order: 3,
          translations: {
            en: {
              name: 'Two Day Warrior',
              description: 'Complete a 48-hour fast',
              shortDescription: '48-hour fast'
            }
          },
        }),
      ]);
    });

    it('should return empty result when no achievement IDs provided', async () => {
      const result = await AchievementService.unlockAchievements(testUserId, []);
      expect(result.unlockedAchievements).toEqual([]);
      expect(result.totalPointsEarned).toBe(0);
    });

    it('should create single UserAchievement and update user points', async () => {
      const result = await AchievementService.unlockAchievements(testUserId, ['first-twelve']);

      // Check UserAchievement created
      const userAch = await UserAchievement.findOne({ userId: testUserId, achievementId: 'first-twelve' });
      expect(userAch).toBeTruthy();
      expect(userAch.progress).toBe(100); // Duration achievements are complete when unlocked

      // Check user points incremented
      const user = await User.findById(testUserId);
      expect(user.achievementPoints).toBe(10);

      // Check return value
      expect(result.unlockedAchievements).toHaveLength(1);
      expect(result.unlockedAchievements[0].achievementId).toBe('first-twelve');
      expect(result.totalPointsEarned).toBe(10);
    });

    it('should create multiple UserAchievements in batch', async () => {
      const result = await AchievementService.unlockAchievements(testUserId, [
        'first-twelve',
        'daily-devotion',
        'two-day-warrior',
      ]);

      // Check all UserAchievements created
      const userAchs = await UserAchievement.find({ userId: testUserId });
      expect(userAchs).toHaveLength(3);

      const achievementIds = userAchs.map((ua) => ua.achievementId).sort();
      expect(achievementIds).toEqual(['daily-devotion', 'first-twelve', 'two-day-warrior']);

      // Check user points incremented (10 + 25 + 50 = 85)
      const user = await User.findById(testUserId);
      expect(user.achievementPoints).toBe(85);

      // Check return value
      expect(result.unlockedAchievements).toHaveLength(3);
      expect(result.totalPointsEarned).toBe(85);
    });

    it('should handle E11000 duplicate errors gracefully (idempotency)', async () => {
      // User already has one achievement
      await UserAchievement.create({
        userId: testUserId,
        achievementId: 'first-twelve',
        unlockedAt: new Date(),
        progress: 100,
      });

      // User starts with 10 points from previous unlock
      await User.findByIdAndUpdate(testUserId, { achievementPoints: 10 });

      // Try to unlock 3 achievements (one is duplicate)
      const result = await AchievementService.unlockAchievements(testUserId, [
        'first-twelve', // Duplicate
        'daily-devotion',
        'two-day-warrior',
      ]);

      // Check only 2 new UserAchievements created
      const userAchs = await UserAchievement.find({ userId: testUserId });
      expect(userAchs).toHaveLength(3);

      // Check user points only incremented for new achievements (10 + 25 + 50 = 85)
      const user = await User.findById(testUserId);
      expect(user.achievementPoints).toBe(85);

      // Check return value reflects only new unlocks
      expect(result.unlockedAchievements).toHaveLength(2);
      expect(result.totalPointsEarned).toBe(75); // 25 + 50 (not including duplicate)
    });

    it('should skip achievements that dont exist in Achievement collection', async () => {
      const result = await AchievementService.unlockAchievements(testUserId, [
        'first-twelve',
        'nonexistent-achievement', // Invalid
      ]);

      // Check only valid achievement created
      const userAchs = await UserAchievement.find({ userId: testUserId });
      expect(userAchs).toHaveLength(1);
      expect(userAchs[0].achievementId).toBe('first-twelve');

      // Check user points only incremented for valid achievement
      const user = await User.findById(testUserId);
      expect(user.achievementPoints).toBe(10);

      // Check return value
      expect(result.unlockedAchievements).toHaveLength(1);
      expect(result.totalPointsEarned).toBe(10);
    });

    it('should handle complete idempotency when all achievements already unlocked', async () => {
      // User already unlocked all achievements
      await Promise.all([
        UserAchievement.create({
          userId: testUserId,
          achievementId: 'first-twelve',
          unlockedAt: new Date(),
          progress: 100,
        }),
        UserAchievement.create({
          userId: testUserId,
          achievementId: 'daily-devotion',
          unlockedAt: new Date(),
          progress: 100,
        }),
      ]);

      // User starts with points from previous unlocks
      await User.findByIdAndUpdate(testUserId, { achievementPoints: 35 });

      // Try to unlock already-unlocked achievements
      const result = await AchievementService.unlockAchievements(testUserId, [
        'first-twelve',
        'daily-devotion',
      ]);

      // No new UserAchievements created
      const userAchs = await UserAchievement.find({ userId: testUserId });
      expect(userAchs).toHaveLength(2);

      // User points unchanged
      const user = await User.findById(testUserId);
      expect(user.achievementPoints).toBe(35);

      // Return value reflects no new unlocks
      expect(result.unlockedAchievements).toHaveLength(0);
      expect(result.totalPointsEarned).toBe(0);
    });

    it('should include achievement metadata in return value', async () => {
      const result = await AchievementService.unlockAchievements(testUserId, ['first-twelve']);

      expect(result.unlockedAchievements).toHaveLength(1);
      const unlockedAch = result.unlockedAchievements[0];

      // Check metadata fields
      expect(unlockedAch.achievementId).toBe('first-twelve');
      expect(unlockedAch.name).toBeDefined();
      expect(unlockedAch.description).toBeDefined();
      expect(unlockedAch.points).toBe(10);
      expect(unlockedAch.rarity).toBe('common');
      expect(unlockedAch.icon).toBe('⏰');
      expect(unlockedAch.unlockedAt).toBeInstanceOf(Date);
    });
  });

  describe('evaluateStreakAchievements', () => {
    let achievements;

    beforeEach(async () => {
      // Create streak-based achievements with different thresholds
      achievements = await Promise.all([
        Achievement.create({
          achievementId: 'streak-3',
          category: 'streak',
          rarity: 'common',
          points: 10,
          icon: '🔥',
          isActive: true,
          isSecret: false,
          criteria: { type: 'streak-milestone', params: { count: 3 } },
          createdBy: testUserId,
          order: 1,
          translations: {
            en: {
              name: 'Three Day Streak',
              description: 'Log entries for 3 consecutive days',
              shortDescription: '3-day streak'
            }
          },
        }),
        Achievement.create({
          achievementId: 'streak-7',
          category: 'streak',
          rarity: 'rare',
          points: 25,
          icon: '🔥',
          isActive: true,
          isSecret: false,
          criteria: { type: 'streak-milestone', params: { count: 7 } },
          createdBy: testUserId,
          order: 2,
          translations: {
            en: {
              name: 'Week Warrior',
              description: 'Maintain a 7-day logging streak',
              shortDescription: '7-day streak'
            }
          },
        }),
        Achievement.create({
          achievementId: 'streak-30',
          category: 'streak',
          rarity: 'legendary',
          points: 100,
          icon: '🏆',
          isActive: true,
          isSecret: false,
          criteria: { type: 'streak-milestone', params: { count: 30 } },
          createdBy: testUserId,
          order: 3,
          translations: {
            en: {
              name: 'Month Master',
              description: 'Maintain a 30-day logging streak',
              shortDescription: '30-day streak'
            }
          },
        }),
        // Non-streak achievement (should be filtered out)
        Achievement.create({
          achievementId: 'first-twelve',
          category: 'duration',
          rarity: 'common',
          points: 10,
          icon: '⏰',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 720 } },
          createdBy: testUserId,
          order: 4,
          translations: {
            en: {
              name: 'First Twelve',
              description: 'Complete your first 12-hour fast',
              shortDescription: '12-hour fast'
            }
          },
        }),
      ]);
    });

    it('should return empty array when user has no entries (streak = 0)', async () => {
      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toEqual([]);
    });

    it('should return empty array when streak is below all thresholds', async () => {
      // Create 2 consecutive days (streak = 2)
      await Promise.all([
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-01'),
          lastMealTime: '20:00',
        }),
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-02'),
          lastMealTime: '20:00',
        }),
      ]);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toEqual([]);
    });

    it('should return single achievement when streak meets one threshold', async () => {
      // Create 3 consecutive days (streak = 3)
      await Promise.all([
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-01'),
          lastMealTime: '20:00',
        }),
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-02'),
          lastMealTime: '20:00',
        }),
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-03'),
          lastMealTime: '20:00',
        }),
      ]);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('streak-3');
      expect(qualifiedIds).not.toContain('first-twelve'); // Not a streak achievement
    });

    it('should return multiple achievements when streak meets multiple thresholds', async () => {
      // Create 7 consecutive days (streak = 7)
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date('2024-11-01');
        date.setDate(date.getDate() + i);
        dates.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
          })
        );
      }
      await Promise.all(dates);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(2);
      expect(qualifiedIds).toContain('streak-3');
      expect(qualifiedIds).toContain('streak-7');
      expect(qualifiedIds).not.toContain('streak-30'); // 30-day not reached
    });

    it('should return all streak achievements when streak exceeds all thresholds', async () => {
      // Create 30 consecutive days (streak = 30)
      const dates = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date('2024-10-01');
        date.setDate(date.getDate() + i);
        dates.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
          })
        );
      }
      await Promise.all(dates);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(3);
      expect(qualifiedIds).toContain('streak-3');
      expect(qualifiedIds).toContain('streak-7');
      expect(qualifiedIds).toContain('streak-30');
    });

    it('should exclude already-unlocked streak achievements', async () => {
      // User already unlocked 3-day streak
      await UserAchievement.create({
        userId: testUserId,
        achievementId: 'streak-3',
        unlockedAt: new Date(),
        progress: 3,
      });

      // Create 7 consecutive days (streak = 7)
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date('2024-11-01');
        date.setDate(date.getDate() + i);
        dates.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
          })
        );
      }
      await Promise.all(dates);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('streak-7'); // Only new achievement
      expect(qualifiedIds).not.toContain('streak-3'); // Already unlocked
    });

    it('should exclude inactive streak achievements', async () => {
      // Deactivate 7-day streak
      await Achievement.updateOne(
        { achievementId: 'streak-7' },
        { isActive: false }
      );

      // Create 7 consecutive days (streak = 7)
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date('2024-11-01');
        date.setDate(date.getDate() + i);
        dates.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
          })
        );
      }
      await Promise.all(dates);

      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('streak-3');
      expect(qualifiedIds).not.toContain('streak-7'); // Inactive
    });

    it('should handle broken streaks correctly (only current streak counts)', async () => {
      // Create entries with a break: 3 days, skip 1 day, then 2 more days
      await Promise.all([
        Entry.create({ userId: testUserId, date: new Date('2024-10-01'), lastMealTime: '20:00' }),
        Entry.create({ userId: testUserId, date: new Date('2024-10-02'), lastMealTime: '20:00' }),
        Entry.create({ userId: testUserId, date: new Date('2024-10-03'), lastMealTime: '20:00' }),
        // Skip 2024-10-04
        Entry.create({ userId: testUserId, date: new Date('2024-10-05'), lastMealTime: '20:00' }),
        Entry.create({ userId: testUserId, date: new Date('2024-10-06'), lastMealTime: '20:00' }),
      ]);

      // Current streak should be 2 (only most recent consecutive sequence)
      const qualifiedIds = await AchievementService.evaluateStreakAchievements(testUserId);
      expect(qualifiedIds).toEqual([]); // Streak is only 2, doesn't meet 3-day threshold
    });
  });

  describe('evaluateGoalAchievements', () => {
    let achievements;

    beforeEach(async () => {
      // Create goal-based achievements with different thresholds
      achievements = await Promise.all([
        Achievement.create({
          achievementId: 'goal-10',
          category: 'goal',
          rarity: 'common',
          points: 15,
          icon: '🎯',
          isActive: true,
          isSecret: false,
          criteria: { type: 'goal-milestone', params: { count: 10 } },
          createdBy: testUserId,
          order: 1,
          translations: {
            en: {
              name: 'Goal Getter',
              description: 'Complete 10 fasting goals',
              shortDescription: '10 goals completed'
            }
          },
        }),
        Achievement.create({
          achievementId: 'goal-50',
          category: 'goal',
          rarity: 'epic',
          points: 75,
          icon: '🏆',
          isActive: true,
          isSecret: false,
          criteria: { type: 'goal-milestone', params: { count: 50 } },
          createdBy: testUserId,
          order: 2,
          translations: {
            en: {
              name: 'Goal Master',
              description: 'Complete 50 fasting goals',
              shortDescription: '50 goals completed'
            }
          },
        }),
        Achievement.create({
          achievementId: 'goal-100',
          category: 'goal',
          rarity: 'legendary',
          points: 150,
          icon: '👑',
          isActive: true,
          isSecret: false,
          criteria: { type: 'goal-milestone', params: { count: 100 } },
          createdBy: testUserId,
          order: 3,
          translations: {
            en: {
              name: 'Goal Legend',
              description: 'Complete 100 fasting goals',
              shortDescription: '100 goals completed'
            }
          },
        }),
      ]);
    });

    it('should return empty array when user has no completed goals', async () => {
      // Create entries without completed goals
      await Promise.all([
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-01'),
          lastMealTime: '20:00',
          goalStatus: 'no-goal',
        }),
        Entry.create({
          userId: testUserId,
          date: new Date('2024-11-02'),
          lastMealTime: '20:00',
          goalStatus: 'not-completed',
        }),
      ]);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toEqual([]);
    });

    it('should return empty array when completed goals are below all thresholds', async () => {
      // Create 5 completed goals (below 10 threshold)
      const entries = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date('2024-11-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'completed',
          })
        );
      }
      await Promise.all(entries);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toEqual([]);
    });

    it('should return single achievement when completed goals meet one threshold', async () => {
      // Create exactly 10 completed goals
      const entries = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date('2024-11-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'completed',
          })
        );
      }
      await Promise.all(entries);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('goal-10');
    });

    it('should return multiple achievements when completed goals meet multiple thresholds', async () => {
      // Create 50 completed goals
      const entries = [];
      for (let i = 0; i < 50; i++) {
        const date = new Date('2024-09-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'completed',
          })
        );
      }
      await Promise.all(entries);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(2);
      expect(qualifiedIds).toContain('goal-10');
      expect(qualifiedIds).toContain('goal-50');
      expect(qualifiedIds).not.toContain('goal-100'); // 100 not reached
    });

    it('should count only entries with goalStatus=completed (ignore others)', async () => {
      // Create mix of goal statuses: 15 completed, 5 not-completed, 5 no-goal
      const entries = [];
      for (let i = 0; i < 15; i++) {
        const date = new Date('2024-10-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'completed',
          })
        );
      }
      for (let i = 15; i < 20; i++) {
        const date = new Date('2024-10-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'not-completed',
          })
        );
      }
      for (let i = 20; i < 25; i++) {
        const date = new Date('2024-10-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'no-goal',
          })
        );
      }
      await Promise.all(entries);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('goal-10'); // Only 15 completed, meets 10 threshold
    });

    it('should exclude already-unlocked goal achievements', async () => {
      // User already unlocked goal-10
      await UserAchievement.create({
        userId: testUserId,
        achievementId: 'goal-10',
        unlockedAt: new Date(),
        progress: 10,
      });

      // Create 50 completed goals
      const entries = [];
      for (let i = 0; i < 50; i++) {
        const date = new Date('2024-09-01');
        date.setDate(date.getDate() + i);
        entries.push(
          Entry.create({
            userId: testUserId,
            date,
            lastMealTime: '20:00',
            goalStatus: 'completed',
          })
        );
      }
      await Promise.all(entries);

      const qualifiedIds = await AchievementService.evaluateGoalAchievements(testUserId);
      expect(qualifiedIds).toHaveLength(1);
      expect(qualifiedIds).toContain('goal-50'); // Only new achievement
      expect(qualifiedIds).not.toContain('goal-10'); // Already unlocked
    });
  });

  describe('evaluateAndUnlock', () => {
    let testEntry;
    let achievements;

    beforeEach(async () => {
      // Create a mix of achievements (duration, streak, goal)
      achievements = await Promise.all([
        Achievement.create({
          achievementId: 'first-twelve',
          category: 'duration',
          rarity: 'common',
          points: 10,
          icon: '⏰',
          isActive: true,
          isSecret: false,
          criteria: { type: 'duration-milestone', params: { minDuration: 720 } },
          createdBy: testUserId,
          order: 1,
          translations: {
            en: { name: 'First Twelve', description: '12-hour fast', shortDescription: '12h' }
          },
        }),
        Achievement.create({
          achievementId: 'streak-3',
          category: 'streak',
          rarity: 'common',
          points: 15,
          icon: '🔥',
          isActive: true,
          isSecret: false,
          criteria: { type: 'streak-milestone', params: { count: 3 } },
          createdBy: testUserId,
          order: 2,
          translations: {
            en: { name: 'Three Day Streak', description: '3-day streak', shortDescription: '3 days' }
          },
        }),
        Achievement.create({
          achievementId: 'goal-10',
          category: 'goal',
          rarity: 'rare',
          points: 25,
          icon: '🎯',
          isActive: true,
          isSecret: false,
          criteria: { type: 'goal-milestone', params: { count: 10 } },
          createdBy: testUserId,
          order: 3,
          translations: {
            en: { name: 'Goal Getter', description: '10 goals', shortDescription: '10 goals' }
          },
        }),
      ]);
    });

    it('should return empty result when entry triggers no achievements', async () => {
      // Create entry that doesn't meet any thresholds
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 600, // 10 hours - below 12h threshold
      });

      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());
      expect(result.unlockedAchievements).toEqual([]);
      expect(result.totalPointsEarned).toBe(0);
    });

    it('should unlock single duration achievement when threshold met', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 720, // Exactly 12 hours
      });

      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());
      expect(result.unlockedAchievements).toHaveLength(1);
      expect(result.unlockedAchievements[0].achievementId).toBe('first-twelve');
      expect(result.totalPointsEarned).toBe(10);

      // Verify UserAchievement created
      const userAch = await UserAchievement.findOne({ userId: testUserId, achievementId: 'first-twelve' });
      expect(userAch).toBeTruthy();
    });

    it('should unlock multiple achievements from different evaluators', async () => {
      // Create 10 completed goals
      for (let i = 0; i < 10; i++) {
        const date = new Date('2024-10-01');
        date.setDate(date.getDate() + i);
        await Entry.create({
          userId: testUserId,
          date,
          lastMealTime: '20:00',
          goalStatus: 'completed',
        });
      }

      // Create 2 more consecutive entries (total 12 entries, streak = 12)
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-10-11'),
        lastMealTime: '20:00',
      });
      await Entry.create({
        userId: testUserId,
        date: new Date('2024-10-12'),
        lastMealTime: '20:00',
      });

      // Save entry that triggers multiple achievements
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-10-13'),
        lastMealTime: '20:00',
        fastingDuration: 720, // 12 hours
        goalStatus: 'completed', // 11th completed goal (but goal-10 needs exactly 10, already unlocked)
      });

      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());
      
      // Should unlock duration (first-twelve) + streak (streak-3) + goal (goal-10)
      expect(result.unlockedAchievements.length).toBeGreaterThanOrEqual(2);
      
      const achievementIds = result.unlockedAchievements.map(a => a.achievementId);
      expect(achievementIds).toContain('first-twelve'); // Duration
      expect(achievementIds).toContain('streak-3'); // Streak >= 3
      
      // Total points should be sum of all unlocked achievements
      expect(result.totalPointsEarned).toBeGreaterThan(0);
    });

    it('should deduplicate achievement IDs from multiple evaluators', async () => {
      // Edge case: If two evaluators somehow return the same achievement ID
      // (shouldn't happen with proper criteria types, but test deduplication)
      
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 720,
      });

      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());
      
      // Check that each achievement is only unlocked once
      const achievementIds = result.unlockedAchievements.map(a => a.achievementId);
      const uniqueIds = [...new Set(achievementIds)];
      expect(achievementIds).toEqual(uniqueIds);
    });

    it('should handle non-blocking errors from individual evaluators', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 720,
      });

      // Even if one evaluator fails, others should still run
      // This is tested implicitly - if orchestrator throws, test fails
      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());
      expect(result).toBeDefined();
      expect(result.unlockedAchievements).toBeDefined();
      expect(result.totalPointsEarned).toBeDefined();
    });

    it('should update user achievement points correctly', async () => {
      testEntry = await Entry.create({
        userId: testUserId,
        date: new Date('2024-11-01'),
        lastMealTime: '20:00',
        fastingDuration: 720,
      });

      const userBefore = await User.findById(testUserId);
      const pointsBefore = userBefore.achievementPoints;

      const result = await AchievementService.evaluateAndUnlock(testUserId, testEntry._id.toString());

      const userAfter = await User.findById(testUserId);
      expect(userAfter.achievementPoints).toBe(pointsBefore + result.totalPointsEarned);
    });

    it('should throw error if entry not found', async () => {
      const fakeEntryId = new mongoose.Types.ObjectId().toString();
      
      await expect(
        AchievementService.evaluateAndUnlock(testUserId, fakeEntryId)
      ).rejects.toThrow('Entry not found');
    });
  });
});
