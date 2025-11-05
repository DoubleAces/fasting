/**
 * Unit Tests: Achievement Evaluator Service
 * 
 * Tests for the event-driven achievement evaluation service that automatically
 * unlocks achievements when users meet criteria.
 */

import { jest } from '@jest/globals';
import {
  evaluateAchievements,
  evaluateDurationMilestone,
  evaluateStreak,
  evaluateEntryCount,
  unlockAchievement
} from '../../../src/lib/services/achievementEvaluator.js';
import Achievement from '../../../src/lib/models/Achievement.js';
import UserAchievement from '../../../src/lib/models/UserAchievement.js';
import User from '../../../src/lib/models/User.js';
import Entry from '../../../src/lib/models/Entry.js';

// Mock the models
jest.mock('../../../src/lib/models/Achievement.js');
jest.mock('../../../src/lib/models/UserAchievement.js');
jest.mock('../../../src/lib/models/User.js');
jest.mock('../../../src/lib/models/Entry.js');

describe('Achievement Evaluator Service', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateDurationMilestone', () => {
    it('should return true when user has entry meeting duration criteria', async () => {
      const criteriaParams = { hours: 16 };
      
      Entry.findOne.mockResolvedValue({
        userId: mockUserId,
        fastingDuration: 16,
        firstMealTime: new Date('2025-11-04T08:00:00Z'),
        lastMealTime: new Date('2025-11-03T16:00:00Z')
      });

      const result = await evaluateDurationMilestone(mockUserId, criteriaParams);
      
      expect(result).toBe(true);
      expect(Entry.findOne).toHaveBeenCalledWith({
        userId: mockUserId,
        fastingDuration: { $gte: 16 }
      });
    });

    it('should return false when user has no entries meeting duration criteria', async () => {
      const criteriaParams = { hours: 20 };
      
      Entry.findOne.mockResolvedValue(null);

      const result = await evaluateDurationMilestone(mockUserId, criteriaParams);
      
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const criteriaParams = { hours: 16 };
      
      Entry.findOne.mockRejectedValue(new Error('Database error'));

      const result = await evaluateDurationMilestone(mockUserId, criteriaParams);
      
      expect(result).toBe(false);
    });
  });

  describe('evaluateStreak', () => {
    it('should return true when user has consecutive entries meeting streak criteria', async () => {
      const criteriaParams = { days: 7 };
      
      // Mock 7 consecutive days of entries
      const mockEntries = Array.from({ length: 7 }, (_, i) => ({
        userId: mockUserId,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      Entry.find.mockResolvedValue(mockEntries);

      const result = await evaluateStreak(mockUserId, criteriaParams);
      
      expect(result).toBe(true);
    });

    it('should return false when user has broken streak', async () => {
      const criteriaParams = { days: 7 };
      
      // Mock only 5 consecutive days (missing days 2-3)
      const mockEntries = [
        { date: new Date(Date.now()).toISOString().split('T')[0] },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      ];
      
      Entry.find.mockResolvedValue(mockEntries);

      const result = await evaluateStreak(mockUserId, criteriaParams);
      
      expect(result).toBe(false);
    });

    it('should return false when user has insufficient entries', async () => {
      const criteriaParams = { days: 7 };
      
      Entry.find.mockResolvedValue([]);

      const result = await evaluateStreak(mockUserId, criteriaParams);
      
      expect(result).toBe(false);
    });
  });

  describe('evaluateEntryCount', () => {
    it('should return true when user has reached entry count threshold', async () => {
      const criteriaParams = { count: 3 };
      
      Entry.countDocuments.mockResolvedValue(5);

      const result = await evaluateEntryCount(mockUserId, criteriaParams);
      
      expect(result).toBe(true);
      expect(Entry.countDocuments).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should return true when user exactly meets entry count', async () => {
      const criteriaParams = { count: 10 };
      
      Entry.countDocuments.mockResolvedValue(10);

      const result = await evaluateEntryCount(mockUserId, criteriaParams);
      
      expect(result).toBe(true);
    });

    it('should return false when user has insufficient entries', async () => {
      const criteriaParams = { count: 100 };
      
      Entry.countDocuments.mockResolvedValue(50);

      const result = await evaluateEntryCount(mockUserId, criteriaParams);
      
      expect(result).toBe(false);
    });
  });

  describe('unlockAchievement', () => {
    const mockAchievementId = 'sweet-sixteen';
    const mockPoints = 10;

    it('should create UserAchievement and increment user points on successful unlock', async () => {
      Achievement.findOne.mockResolvedValue({
        achievementId: mockAchievementId,
        points: mockPoints
      });
      
      UserAchievement.findOne.mockResolvedValue(null); // No existing unlock
      UserAchievement.create.mockResolvedValue({
        userId: mockUserId,
        achievementId: mockAchievementId,
        unlockedAt: new Date()
      });
      
      User.findByIdAndUpdate.mockResolvedValue({
        _id: mockUserId,
        achievementPoints: 10
      });

      const result = await unlockAchievement(mockUserId, mockAchievementId);
      
      expect(result).toEqual({ success: true, pointsAdded: mockPoints });
      expect(UserAchievement.create).toHaveBeenCalledWith({
        userId: mockUserId,
        achievementId: mockAchievementId,
        unlockedAt: expect.any(Date),
        progress: 100,
        notificationSeen: false
      });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        { $inc: { achievementPoints: mockPoints } },
        { new: true }
      );
    });

    it('should return false when achievement already unlocked', async () => {
      Achievement.findOne.mockResolvedValue({
        achievementId: mockAchievementId,
        points: mockPoints
      });
      
      UserAchievement.findOne.mockResolvedValue({
        userId: mockUserId,
        achievementId: mockAchievementId
      }); // Already unlocked

      const result = await unlockAchievement(mockUserId, mockAchievementId);
      
      expect(result).toEqual({ success: false, reason: 'already-unlocked' });
      expect(UserAchievement.create).not.toHaveBeenCalled();
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return false when achievement does not exist', async () => {
      Achievement.findOne.mockResolvedValue(null);

      const result = await unlockAchievement(mockUserId, mockAchievementId);
      
      expect(result).toEqual({ success: false, reason: 'achievement-not-found' });
      expect(UserAchievement.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during unlock', async () => {
      Achievement.findOne.mockResolvedValue({
        achievementId: mockAchievementId,
        points: mockPoints
      });
      
      UserAchievement.findOne.mockResolvedValue(null);
      UserAchievement.create.mockRejectedValue(new Error('Database error'));

      const result = await unlockAchievement(mockUserId, mockAchievementId);
      
      expect(result).toEqual({ success: false, reason: 'error' });
    });
  });

  describe('evaluateAchievements', () => {
    const mockAchievements = [
      {
        achievementId: 'sweet-sixteen',
        criteria: { type: 'duration-milestone', params: { hours: 16 } },
        points: 10
      },
      {
        achievementId: 'getting-started',
        criteria: { type: 'entry-count', params: { count: 3 } },
        points: 5
      },
      {
        achievementId: 'week-warrior',
        criteria: { type: 'streak', params: { days: 7 } },
        points: 25
      }
    ];

    it('should evaluate all active achievements and unlock qualifying ones', async () => {
      Achievement.find.mockResolvedValue(mockAchievements);
      
      // Mock UserAchievement to show no existing unlocks
      UserAchievement.find.mockResolvedValue([]);
      
      // Mock evaluation functions
      const evaluateDurationMilestoneMock = jest.fn().mockResolvedValue(true);
      const evaluateEntryCountMock = jest.fn().mockResolvedValue(true);
      const evaluateStreakMock = jest.fn().mockResolvedValue(false);
      
      // Mock unlockAchievement
      const unlockAchievementMock = jest.fn().mockResolvedValue({ success: true, pointsAdded: 10 });

      const result = await evaluateAchievements(mockUserId);
      
      expect(Achievement.find).toHaveBeenCalledWith({ isActive: true });
      expect(result.evaluated).toBe(3);
      expect(result.unlocked).toBeGreaterThan(0);
    });

    it('should skip already unlocked achievements', async () => {
      Achievement.find.mockResolvedValue(mockAchievements);
      
      // Mock UserAchievement to show some existing unlocks
      UserAchievement.find.mockResolvedValue([
        { achievementId: 'sweet-sixteen' },
        { achievementId: 'getting-started' }
      ]);

      const result = await evaluateAchievements(mockUserId);
      
      expect(result.evaluated).toBe(3);
      expect(result.skipped).toBe(2);
    });

    it('should handle evaluation errors gracefully', async () => {
      Achievement.find.mockRejectedValue(new Error('Database error'));

      const result = await evaluateAchievements(mockUserId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should process only triggering user (not batch)', async () => {
      Achievement.find.mockResolvedValue(mockAchievements);
      UserAchievement.find.mockResolvedValue([]);

      await evaluateAchievements(mockUserId);
      
      // Verify no batch processing - only single user queried
      expect(UserAchievement.find).toHaveBeenCalledWith({ userId: mockUserId });
      expect(UserAchievement.find).toHaveBeenCalledTimes(1);
    });
  });
});
