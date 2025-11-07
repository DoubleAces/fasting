/**
 * AchievementService - Achievement Unlocking Logic
 * 
 * Automatically evaluates user entries against achievement criteria and creates
 * UserAchievement records when conditions are met.
 * 
 * Features:
 * - 6 criteria evaluators: duration, streak, entry-count, goal, weight, custom
 * - Batch unlocking for multiple simultaneous achievements
 * - Idempotent operations (unique constraint handles duplicates)
 * - In-memory caching of achievement definitions (1-hour TTL)
 * - Non-blocking error handling (achievement failures don't prevent entry saves)
 * - Performance target: <200ms evaluation time
 * 
 * Architecture:
 * - One evaluator method per criteria type
 * - Main orchestrator: evaluateAndUnlock()
 * - Batch creator: unlockAchievements()
 * - Helper methods: calculateStreak()
 * 
 * Usage:
 * ```js
 * import { AchievementService } from '@/lib/services/AchievementService';
 * 
 * // After entry save
 * const result = await AchievementService.evaluateAndUnlock(userId, entryId);
 * // Returns: { unlockedAchievements: [...], totalPointsEarned: 150 }
 * ```
 */

import { SimpleCache } from '@/lib/utils/cache';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';

// Cache for achievement definitions (1-hour TTL)
const achievementCache = new SimpleCache(3600000);

/**
 * Custom evaluator registry
 * Maps customKey to evaluation functions
 */
const CUSTOM_EVALUATORS = {
  // Will be populated as custom evaluators are implemented
};

export class AchievementService {
  /**
   * Clear the achievement cache (for testing)
   */
  static clearCache() {
    achievementCache.clear();
  }

  /**
   * Main entry point - Evaluate all criteria and unlock achievements
   * Called after entry save (POST/PUT /api/entries)
   * 
   * @param {string} userId - User ObjectId
   * @param {string} entryId - Entry ObjectId string
   * @returns {Promise<{unlockedAchievements: Array, totalPointsEarned: number}>}
   */
  static async evaluateAndUnlock(userId, entryId) {
    // Load entry to verify it exists
    const entry = await Entry.findById(entryId);
    if (!entry) {
      throw new Error(`Entry not found: ${entryId}`);
    }

    // Collect achievement IDs from all evaluators
    const achievementIdSets = await Promise.all([
      // Duration evaluator (requires entry)
      this.evaluateDurationAchievements(userId, entryId),
      
      // Streak evaluator (calculates from all user entries)
      this.evaluateStreakAchievements(userId),
      
      // Entry count evaluator (stub - returns empty)
      this.evaluateEntryCountAchievements(userId),
      
      // Goal evaluator (counts completed goals)
      this.evaluateGoalAchievements(userId),
      
      // Weight evaluator (stub - returns empty)
      this.evaluateWeightAchievements(userId),
      
      // Custom evaluator (stub - returns empty)
      this.evaluateCustomAchievements(userId, entry),
    ]);

    // Flatten and deduplicate achievement IDs
    const allAchievementIds = achievementIdSets.flat();
    const uniqueAchievementIds = [...new Set(allAchievementIds)];

    // If no achievements qualified, return empty result
    if (uniqueAchievementIds.length === 0) {
      return { unlockedAchievements: [], totalPointsEarned: 0 };
    }

    // Batch unlock achievements
    const result = await this.unlockAchievements(userId, uniqueAchievementIds);

    return result;
  }

  /**
   * Evaluate duration-milestone achievements
   * Checks if entry.fastingDuration qualifies for any duration-based achievements
   * 
   * @param {string} userId - User ObjectId
   * @param {string} entryId - Entry ObjectId string
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateDurationAchievements(userId, entryId) {
    // Load entry
    const entry = await Entry.findById(entryId);
    if (!entry) {
      throw new Error(`Entry not found: ${entryId}`);
    }

    // If no fasting duration, return empty array
    if (!entry.fastingDuration || entry.fastingDuration <= 0) {
      return [];
    }

    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to duration-milestone achievements only
    const durationAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'duration-milestone'
    );

    // Check which achievements are already unlocked by this user
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: durationAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where duration >= minDuration threshold
    const qualifiedAchievements = durationAchievements.filter((ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      // Check if entry duration meets or exceeds threshold
      const minDuration = ach.criteria?.params?.minDuration;
      if (typeof minDuration !== 'number') {
        return false; // Invalid criteria
      }

      return entry.fastingDuration >= minDuration;
    });

    // Return array of qualifying achievement IDs
    return qualifiedAchievements.map((ach) => ach.achievementId);
  }

  /**
   * Evaluate streak achievements
   * Counts consecutive days and checks against streak criteria
   * 
   * @param {string} userId - User ObjectId
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateStreakAchievements(userId) {
    // Calculate current streak length
    const currentStreak = await this.calculateStreak(userId);

    // If no streak, return empty array
    if (currentStreak === 0) {
      return [];
    }

    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to streak-milestone achievements only
    const streakAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'streak-milestone'
    );

    // Check which achievements are already unlocked by this user
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: streakAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where current streak >= count threshold
    const qualifiedAchievements = streakAchievements.filter((ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      // Check if current streak meets or exceeds threshold
      const requiredCount = ach.criteria?.params?.count;
      if (typeof requiredCount !== 'number') {
        return false; // Invalid criteria
      }

      return currentStreak >= requiredCount;
    });

    // Return array of qualifying achievement IDs
    return qualifiedAchievements.map((ach) => ach.achievementId);
  }

  /**
   * Evaluate entry-count achievements
   * Counts total entries and checks against entry-count criteria
   * 
   * @param {string} userId - User ObjectId
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateEntryCountAchievements(userId) {
    // TODO: Implement entry-count evaluator
    return [];
  }

  /**
   * Evaluate goal-completion achievements
   * Counts entries with goalStatus='completed' and checks against goal criteria
   * 
   * @param {string} userId - User ObjectId
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateGoalAchievements(userId) {
    // Count entries with completed goals
    const completedGoalsCount = await Entry.countDocuments({
      userId,
      goalStatus: 'completed',
    });

    // If no completed goals, return empty array
    if (completedGoalsCount === 0) {
      return [];
    }

    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to goal-milestone achievements only
    const goalAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'goal-milestone'
    );

    // Check which achievements are already unlocked by this user
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: goalAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where completed goals >= count threshold
    const qualifiedAchievements = goalAchievements.filter((ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      // Check if completed goals meet or exceed threshold
      const requiredCount = ach.criteria?.params?.count;
      if (typeof requiredCount !== 'number') {
        return false; // Invalid criteria
      }

      return completedGoalsCount >= requiredCount;
    });

    // Return array of qualifying achievement IDs
    return qualifiedAchievements.map((ach) => ach.achievementId);
  }

  /**
   * Evaluate weight-loss achievements
   * Calculates weight loss from starting weight and checks against weight criteria
   * 
   * @param {string} userId - User ObjectId
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateWeightAchievements(userId) {
    // TODO: Implement weight evaluator
    return [];
  }

  /**
   * Evaluate custom achievements
   * Dispatches to custom evaluation functions based on customKey
   * 
   * @param {string} userId - User ObjectId
   * @param {Object} entry - Entry document
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateCustomAchievements(userId, entry) {
    // TODO: Implement custom evaluator dispatcher
    return [];
  }

  /**
   * Batch create UserAchievement records and update user points
   * Handles E11000 duplicate key errors silently (idempotent)
   * 
   * @param {string} userId - User ObjectId
   * @param {string[]} achievementIds - Array of achievement IDs to unlock
   * @returns {Promise<{unlockedAchievements: Array, totalPointsEarned: number}>}
   */
  static async unlockAchievements(userId, achievementIds) {
    // Return empty result if no achievement IDs provided
    if (!achievementIds || achievementIds.length === 0) {
      return { unlockedAchievements: [], totalPointsEarned: 0 };
    }

    // Load achievement definitions for metadata
    const achievements = await Achievement.find({
      achievementId: { $in: achievementIds },
    }).lean();

    // Create map for quick lookup
    const achievementMap = new Map();
    achievements.forEach((ach) => {
      achievementMap.set(ach.achievementId, ach);
    });

    const unlockedAchievements = [];
    let totalPointsEarned = 0;

    // Sequential creation to handle E11000 errors individually
    for (const achievementId of achievementIds) {
      const achievement = achievementMap.get(achievementId);

      // Skip if achievement doesn't exist
      if (!achievement) {
        continue;
      }

      try {
        // Create UserAchievement record
        const userAchievement = await UserAchievement.create({
          userId,
          achievementId,
          unlockedAt: new Date(),
          progress: 100, // Duration/instant achievements are 100% complete
        });

        // Increment user's achievement points atomically
        await User.findByIdAndUpdate(userId, {
          $inc: { achievementPoints: achievement.points },
        });

        // Add to results with metadata
        unlockedAchievements.push({
          achievementId: achievement.achievementId,
          name: achievement.translations?.en?.name || achievement.achievementId,
          description: achievement.translations?.en?.description || '',
          points: achievement.points,
          rarity: achievement.rarity,
          category: achievement.category,
          icon: achievement.icon,
          iconColor: achievement.iconColor,
          unlockedAt: userAchievement.unlockedAt,
        });

        totalPointsEarned += achievement.points;
      } catch (error) {
        // E11000 duplicate key error - user already has this achievement
        if (error.code === 11000) {
          // Silently skip duplicates (idempotent operation)
          continue;
        }

        // Re-throw other errors
        throw error;
      }
    }

    return {
      unlockedAchievements,
      totalPointsEarned,
    };
  }

  /**
   * Get active achievements from cache or database
   * Caches results for 1 hour
   * 
   * @returns {Promise<Array>} Array of active achievement documents
   */
  static async getActiveAchievements() {
    // Check cache first
    if (achievementCache.has('active')) {
      return achievementCache.get('active');
    }

    // Query database
    const achievements = await Achievement.find({ isActive: true }).lean();
    
    // Store in cache
    achievementCache.set('active', achievements);
    
    return achievements;
  }

  /**
   * Calculate current streak length
   * Queries entries ordered by date descending and counts consecutive days
   * Uses actual fasting period dates (meal times), not entry creation timestamp
   * 
   * @param {string} userId - User ObjectId
   * @returns {Promise<number>} Current streak length in days
   */
  static async calculateStreak(userId) {
    // Query entries ordered by date descending (most recent first)
    const entries = await Entry.find({ userId })
      .sort({ date: -1 })
      .limit(100) // Reasonable limit for streak calculation
      .select('date')
      .lean();

    if (entries.length === 0) {
      return 0;
    }

    let streak = 1; // Start with the most recent entry
    
    // Iterate through entries to count consecutive days
    for (let i = 0; i < entries.length - 1; i++) {
      const currentDate = new Date(entries[i].date);
      const previousDate = new Date(entries[i + 1].date);

      // Calculate day difference
      const dayDiff = Math.floor(
        (currentDate - previousDate) / (1000 * 60 * 60 * 24)
      );

      // If exactly 1 day apart, continue streak
      if (dayDiff === 1) {
        streak++;
      }
      // If same day (multiple entries), continue without incrementing
      else if (dayDiff === 0) {
        continue;
      }
      // If more than 1 day apart, streak is broken
      else {
        break;
      }
    }

    return streak;
  }
}

export default AchievementService;
