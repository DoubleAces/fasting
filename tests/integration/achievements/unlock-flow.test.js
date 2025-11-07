/**
 * Integration Tests for Achievement Unlock Flow
 * 
 * Tests the full end-to-end flow:
 * POST /api/entries → evaluateAndUnlock → UserAchievement created → User points updated → response format
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

describe('Achievement Unlock Integration Tests', () => {
  let mongoServer;
  let testUser;
  let durationAchievement;

  // Helper function to create test entry with required fields
  const createTestEntry = (overrides = {}) => {
    const defaults = {
      userId: testUser._id,
      lastMealTime: '18:00',
      firstMealTime: '12:00',
      fastingDuration: 1080, // 18 hours in minutes
      goalDuration: 16,
      goalStatus: 'completed'
    };
    return Entry.create({ ...defaults, ...overrides });
  };

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});
    
    // Clear service cache
    AchievementService.clearCache();

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      acceptedTerms: true,
      acceptedPrivacy: true,
      points: 0
    });

    // Create test achievement with all required fields
    durationAchievement = await Achievement.create({
      achievementId: 'first-16h-fast',
      translations: {
        en: {
          name: 'First 16-Hour Fast',
          description: 'Complete your first 16-hour fast',
          shortDescription: '16h fast'
        }
      },
      iconUrl: '/icons/16h.svg',
      category: 'duration',
      points: 50,
      rarity: 'common',
      order: 1,
      criteria: {
        type: 'duration-milestone',
        params: { minDuration: 960 } // 16 hours in minutes
      },
      isActive: true,
      createdBy: testUser._id
    });
  });

  describe('POST /api/entries - Full Achievement Unlock Flow', () => {
    it('should unlock achievement, create UserAchievement, update points, and return in response', async () => {
      // Create entry that meets achievement criteria (18 hours)
      const entry = await createTestEntry({
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z')
      });

      // Call the service (simulating what POST /api/entries does)
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Verify result structure
      expect(result).toMatchObject({
        unlockedAchievements: expect.arrayContaining([
          expect.objectContaining({
            achievementId: 'first-16h-fast',
            name: 'First 16-Hour Fast',
            description: 'Complete your first 16-hour fast',
            points: 50,
            unlockedAt: expect.any(Date)
          })
        ]),
        totalPointsEarned: 50
      });

      // Verify UserAchievement was created in database
      const userAchievement = await UserAchievement.findOne({
        userId: testUser._id,
        achievementId: durationAchievement.achievementId
      });

      expect(userAchievement).toBeTruthy();
      expect(userAchievement.unlockedAt).toBeInstanceOf(Date);
      expect(userAchievement.progress).toBe(100);

      // Verify user points were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(50);
    });

    it('should handle multiple achievements unlocked simultaneously', async () => {
      // Create second achievement with lower threshold
      const secondAchievement = await Achievement.create({
        achievementId: 'first-12h-fast',
        translations: {
          en: {
            name: 'First 12-Hour Fast',
            description: 'Complete your first 12-hour fast',
            shortDescription: '12h fast'
          }
        },
        iconUrl: '/icons/12h.svg',
        category: 'duration',
        points: 25,
        rarity: 'common',
        order: 2,
        criteria: {
          type: 'duration-milestone',
          params: { minDuration: 720 } // 12 hours in minutes
        },
        isActive: true,
        createdBy: testUser._id
      });

      // Clear cache to pick up new achievement
      AchievementService.clearCache();

      // Create entry that meets both criteria (18 hours)
      const entry = await createTestEntry({
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z')
      });

      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Verify both achievements unlocked
      expect(result.unlockedAchievements).toHaveLength(2);
      
      const achievementKeys = result.unlockedAchievements.map(a => a.achievementId).sort();
      expect(achievementKeys).toEqual(['first-12h-fast', 'first-16h-fast']);

      // Verify both UserAchievements created
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      expect(userAchievements).toHaveLength(2);

      // Verify total points awarded (25 + 50 = 75)
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(75);
    });

    it('should not unlock same achievement twice (idempotency)', async () => {
      // Create first entry and unlock achievement
      const firstEntry = await createTestEntry({
        date: new Date('2025-11-06'),
        startTime: new Date('2025-11-05T18:00:00Z'),
        endTime: new Date('2025-11-06T12:00:00Z')
      });

      await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        firstEntry._id.toString()
      );

      // Verify achievement unlocked and points awarded
      let updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(50);

      // Create second entry that also meets criteria
      const secondEntry = await createTestEntry({
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-06T18:00:00Z'),
        endTime: new Date('2025-11-07T12:00:00Z')
      });

      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        secondEntry._id.toString()
      );

      // Verify no achievements unlocked (already unlocked)
      expect(result.unlockedAchievements).toHaveLength(0);

      // Verify points not awarded again
      updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(50); // Still 50, not 100

      // Verify only one UserAchievement record exists
      const userAchievements = await UserAchievement.find({
        userId: testUser._id,
        achievementId: durationAchievement.achievementId
      });
      expect(userAchievements).toHaveLength(1);
    });

    it('should return empty array when no achievements are unlocked', async () => {
      // Create entry that doesn't meet criteria (only 8 hours)
      const entry = await createTestEntry({
        date: new Date('2025-11-07'),
        startTime: new Date('2025-11-07T02:00:00Z'),
        endTime: new Date('2025-11-07T10:00:00Z'),
        lastMealTime: '02:00',
        firstMealTime: '10:00',
        fastingDuration: 480, // 8 hours in minutes
        goalStatus: 'not-completed'
      });

      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entry._id.toString()
      );

      // Verify result structure with empty array
      expect(result).toMatchObject({
        unlockedAchievements: [],
        totalPointsEarned: 0
      });

      // Verify no UserAchievements created
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      expect(userAchievements).toHaveLength(0);

      // Verify points unchanged
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(0);
    });
  });

  describe('Streak Achievement Integration', () => {
    it('should unlock streak achievements on consecutive entries', async () => {
      // Create 3-day streak achievement
      const streakAchievement = await Achievement.create({
        achievementId: '3-day-streak',
        translations: {
          en: {
            name: '3-Day Streak',
            description: 'Complete fasts for 3 consecutive days',
            shortDescription: '3 days'
          }
        },
        iconUrl: '/icons/streak-3.svg',
        category: 'consistency',
        points: 30,
        rarity: 'common',
        order: 3,
        criteria: {
          type: 'streak-milestone',
          params: { count: 3 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      AchievementService.clearCache();

      // Create 3 consecutive entries
      const entries = [];
      for (let i = 0; i < 3; i++) {
        const date = new Date('2025-11-05');
        date.setDate(date.getDate() + i);
        
        const entry = await createTestEntry({
          date,
          startTime: new Date(date.getTime() - 18 * 60 * 60 * 1000),
          endTime: date
        });
        entries.push(entry);
      }

      // Evaluate after third entry (should unlock streak)
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entries[2]._id.toString()
      );

      // Verify streak achievement unlocked (also unlocks duration achievement since entries are 18h)
      expect(result.unlockedAchievements).toHaveLength(2);
      
      const achievementIds = result.unlockedAchievements.map(a => a.achievementId).sort();
      expect(achievementIds).toContain('3-day-streak');
      expect(achievementIds).toContain('first-16h-fast');

      // Verify UserAchievement created with proper progress
      const userAchievement = await UserAchievement.findOne({
        userId: testUser._id,
        achievementId: streakAchievement.achievementId
      });

      expect(userAchievement).toBeTruthy();
      expect(userAchievement.progress).toBe(100);
      expect(userAchievement.unlockedAt).toBeInstanceOf(Date);

      // Verify points awarded (30 + 50 = 80 total)
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(80);
    });
  });

  describe('Goal Achievement Integration', () => {
    it('should unlock goal achievements after reaching threshold', async () => {
      // Create 10-goal achievement
      const goalAchievement = await Achievement.create({
        achievementId: '10-goals-completed',
        translations: {
          en: {
            name: '10 Goals Completed',
            description: 'Successfully complete 10 fasting goals',
            shortDescription: '10 goals'
          }
        },
        iconUrl: '/icons/goal-10.svg',
        category: 'goal',
        points: 40,
        rarity: 'common',
        order: 4,
        criteria: {
          type: 'goal-milestone',
          params: { count: 10 }
        },
        isActive: true,
        createdBy: testUser._id
      });

      AchievementService.clearCache();

      // Create 10 entries with completed goals
      const entries = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date('2025-10-28');
        date.setDate(date.getDate() + i);
        
        const entry = await createTestEntry({
          date,
          startTime: new Date(date.getTime() - 18 * 60 * 60 * 1000),
          endTime: date
        });
        entries.push(entry);
      }

      // Evaluate after 10th entry (should unlock goal achievement)
      const result = await AchievementService.evaluateAndUnlock(
        testUser._id.toString(),
        entries[9]._id.toString()
      );

      // Verify goal achievement unlocked (also unlocks duration achievement since entries are 18h)
      expect(result.unlockedAchievements).toHaveLength(2);
      
      const achievementIds = result.unlockedAchievements.map(a => a.achievementId).sort();
      expect(achievementIds).toContain('10-goals-completed');
      expect(achievementIds).toContain('first-16h-fast');

      // Verify UserAchievement created
      const userAchievement = await UserAchievement.findOne({
        userId: testUser._id,
        achievementId: goalAchievement.achievementId
      });

      expect(userAchievement).toBeTruthy();
      expect(userAchievement.progress).toBe(100);
      expect(userAchievement.unlockedAt).toBeInstanceOf(Date);

      // Verify points awarded (40 + 50 = 90 total)
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.achievementPoints).toBe(90);
    });
  });
});
