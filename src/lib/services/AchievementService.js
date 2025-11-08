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
      // Duration evaluator (duration-milestone achievements)
      this.evaluateDurationAchievements(userId, entryId),
      
      // Streak evaluator (streak-milestone achievements)
      this.evaluateStreakAchievements(userId),
      
      // Entry count evaluator (entry-count achievements)
      this.evaluateEntryCountAchievements(userId),
      
      // Goal evaluator (goal-completion achievements)
      this.evaluateGoalAchievements(userId),
      
      // Weight evaluator (weight-loss achievements)
      this.evaluateWeightAchievements(userId),
      
      // Custom evaluator (custom achievements: goals, time-based, patterns, meta)
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
      // Support both minDuration (minutes) and hours params
      const minDuration = ach.criteria?.params?.minDuration;
      const hours = ach.criteria?.params?.hours;
      
      let thresholdMinutes;
      if (typeof minDuration === 'number') {
        thresholdMinutes = minDuration;
      } else if (typeof hours === 'number') {
        thresholdMinutes = hours * 60; // Convert hours to minutes
      } else {
        return false; // Invalid criteria
      }

      return entry.fastingDuration >= thresholdMinutes;
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

    // Filter to streak achievements (both "streak" and "streak-milestone" types)
    const streakAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'streak' || ach.criteria?.type === 'streak-milestone'
    );

    // Check which achievements are already unlocked by this user
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: streakAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where current streak >= threshold
    const qualifiedAchievements = streakAchievements.filter((ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      // Check if current streak meets or exceeds threshold
      // Support both params.count and params.days
      const requiredCount = ach.criteria?.params?.count || ach.criteria?.params?.days;
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
    // Count total entries for this user
    const totalEntries = await Entry.countDocuments({ userId });

    // If no entries, return empty array
    if (totalEntries === 0) {
      return [];
    }

    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to entry-count achievements only
    const entryCountAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'entry-count'
    );

    // Check which achievements are already unlocked by this user
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: entryCountAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where entry count >= required count
    const qualifiedAchievements = entryCountAchievements.filter((ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      // Check if entry count meets or exceeds threshold
      const requiredCount = ach.criteria?.params?.count;
      if (typeof requiredCount !== 'number') {
        return false; // Invalid criteria
      }

      return totalEntries >= requiredCount;
    });

    // Return array of qualifying achievement IDs
    return qualifiedAchievements.map((ach) => ach.achievementId);
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
    // Find all entries with weight data for this user
    const entriesWithWeight = await Entry.find({
      userId,
      morningWeight: { $exists: true, $ne: null },
    })
      .select('morningWeight date')
      .sort({ date: 1 }) // Oldest first
      .lean();

    // If fewer than 2 weight entries, can't calculate loss
    if (entriesWithWeight.length < 2) {
      return [];
    }

    // Calculate weight loss: starting weight - current weight
    const startingWeight = entriesWithWeight[0].morningWeight;
    const currentWeight = entriesWithWeight[entriesWithWeight.length - 1].morningWeight;
    const weightLoss = startingWeight - currentWeight;

    // If no weight loss (or weight gain), return empty
    if (weightLoss <= 0) {
      return [];
    }

    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to custom achievements with weight-related requirements
    const weightAchievements = activeAchievements.filter((ach) => {
      if (ach.criteria?.type !== 'custom') return false;
      const req = ach.criteria?.params?.requirement;
      return req && req.match(/^(lose\d+Pounds|logFirstWeight)$/);
    });

    // Check which achievements are already unlocked
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: weightAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Find achievements where weight loss meets threshold
    const qualifiedAchievements = weightAchievements.filter((ach) => {
      if (unlockedSet.has(ach.achievementId)) {
        return false;
      }

      const requirement = ach.criteria?.params?.requirement;

      // logFirstWeight: just need 1+ weight entries
      if (requirement === 'logFirstWeight') {
        return entriesWithWeight.length >= 1;
      }

      // lose5Pounds, lose10Pounds, etc.
      const match = requirement.match(/^lose(\d+)Pounds$/);
      if (match) {
        const targetLoss = parseInt(match[1]);
        return weightLoss >= targetLoss;
      }

      return false;
    });

    return qualifiedAchievements.map((ach) => ach.achievementId);
  }

  /**
   * Evaluate custom achievements
   * Dispatches to custom evaluation functions based on requirement
   * 
   * @param {string} userId - User ObjectId
   * @param {Object} entry - Entry document
   * @returns {Promise<string[]>} Array of qualifying achievement IDs
   */
  static async evaluateCustomAchievements(userId, entry) {
    // Get active achievements from cache
    const activeAchievements = await this.getActiveAchievements();

    // Filter to custom achievements only
    const customAchievements = activeAchievements.filter(
      (ach) => ach.criteria?.type === 'custom'
    );

    // Check which achievements are already unlocked
    const unlockedIds = await UserAchievement.find({
      userId,
      achievementId: { $in: customAchievements.map((a) => a.achievementId) },
    })
      .distinct('achievementId')
      .lean();

    const unlockedSet = new Set(unlockedIds);

    // Evaluate each custom achievement
    const evaluationPromises = customAchievements.map(async (ach) => {
      // Skip if already unlocked
      if (unlockedSet.has(ach.achievementId)) {
        return null;
      }

      const requirement = ach.criteria?.params?.requirement;
      if (!requirement) {
        return null;
      }

      // Evaluate based on requirement type
      const isQualified = await this.evaluateCustomRequirement(userId, requirement, entry);
      return isQualified ? ach.achievementId : null;
    });

    const results = await Promise.all(evaluationPromises);
    return results.filter((id) => id !== null);
  }

  /**
   * Evaluate a single custom requirement
   * 
   * @param {string} userId - User ObjectId
   * @param {string} requirement - Requirement string (e.g., "completeThreeGoals")
   * @param {Object} entry - Current entry being evaluated
   * @returns {Promise<boolean>} Whether the requirement is met
   */
  static async evaluateCustomRequirement(userId, requirement, entry) {
    // Goal-related achievements
    if (requirement === 'setFirstGoal') {
      // Check if any entry has a goal set (fastingGoal field, not goalDuration)
      const entryWithGoal = await Entry.findOne({
        userId,
        fastingGoal: { $exists: true, $ne: null },
      }).lean();
      return !!entryWithGoal;
    }

    if (requirement === 'completeFirstGoal') {
      const completedGoals = await Entry.countDocuments({
        userId,
        goalStatus: 'completed',
      });
      return completedGoals >= 1;
    }

    if (requirement === 'completeThreeGoals') {
      const completedGoals = await Entry.countDocuments({
        userId,
        goalStatus: 'completed',
      });
      return completedGoals >= 3;
    }

    if (requirement === 'completeFiveGoals') {
      const completedGoals = await Entry.countDocuments({
        userId,
        goalStatus: 'completed',
      });
      return completedGoals >= 5;
    }

    if (requirement === 'completeTenGoals') {
      const completedGoals = await Entry.countDocuments({
        userId,
        goalStatus: 'completed',
      });
      return completedGoals >= 10;
    }

    if (requirement === 'completeTwentyfiveGoals') {
      const completedGoals = await Entry.countDocuments({
        userId,
        goalStatus: 'completed',
      });
      return completedGoals >= 25;
    }

    if (requirement === 'complete20HourGoal') {
      // Check if any entry has completed a 20+ hour goal
      const entry20Hour = await Entry.findOne({
        userId,
        goalStatus: 'completed',
        fastingGoal: { $gte: 20 * 60 }, // 20 hours in minutes
      }).lean();
      return !!entry20Hour;
    }

    if (requirement === 'perfectMonthGoals') {
      // Check if user has completed goals for 30 consecutive days
      const entries = await Entry.find({
        userId,
        goalStatus: 'completed',
      })
        .select('date')
        .sort({ date: 1 })
        .lean();

      if (entries.length < 30) return false;

      // Check for 30 consecutive days
      for (let i = 0; i <= entries.length - 30; i++) {
        let consecutive = true;
        for (let j = 1; j < 30; j++) {
          const prevDate = new Date(entries[i + j - 1].date);
          const currDate = new Date(entries[i + j].date);
          const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
          if (dayDiff !== 1) {
            consecutive = false;
            break;
          }
        }
        if (consecutive) return true;
      }
      return false;
    }

    // Weight-related achievements are handled by evaluateWeightAchievements
    if (requirement.match(/^(lose\d+Pounds|logFirstWeight)$/)) {
      return false; // Skip, handled elsewhere
    }

    // Time-based achievements - check meal times and dates
    // tenEarlyStarts: Start 10 fasts before 6 AM
    if (requirement === 'tenEarlyStarts') {
      const earlyStarts = entries.filter((entry) => {
        if (!entry.lastMealTime) return false;
        const [hours] = entry.lastMealTime.split(':').map(Number);
        return hours < 6;
      });
      return earlyStarts.length >= 10;
    }

    // tenLateStarts: Start 10 fasts after 10 PM (22:00)
    if (requirement === 'tenLateStarts') {
      const lateStarts = entries.filter((entry) => {
        if (!entry.lastMealTime) return false;
        const [hours] = entry.lastMealTime.split(':').map(Number);
        return hours >= 22;
      });
      return lateStarts.length >= 10;
    }

    // startAtMidnight: Start a fast exactly at midnight (00:00)
    if (requirement === 'startAtMidnight') {
      return entries.some((entry) => entry.lastMealTime === '00:00');
    }

    // endAtSunrise: End a fast at sunrise (5-7 AM)
    if (requirement === 'endAtSunrise') {
      return entries.some((entry) => {
        if (!entry.firstMealTime) return false;
        const [hours] = entry.firstMealTime.split(':').map(Number);
        return hours >= 5 && hours < 7;
      });
    }

    // comebackAfter30Days: Return to fasting after a 30+ day break
    if (requirement === 'comebackAfter30Days') {
      const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 1; i < sortedEntries.length; i++) {
        const prevDate = new Date(sortedEntries[i - 1].date);
        const currDate = new Date(sortedEntries[i].date);
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 30) return true;
      }
      return false;
    }

    // twoMidnightFast: Complete a 48+ hour fast that spans two midnights
    if (requirement === 'twoMidnightFast') {
      return entries.some((entry) => {
        // Must have completed the fast (firstMealTime present)
        if (!entry.firstMealTime || !entry.fastingDuration) return false;
        
        // Fast must be at least 48 hours (2880 minutes)
        if (entry.fastingDuration < 2880) return false;
        
        // A 48+ hour fast always spans at least two midnights
        return true;
      });
    }

    // Entry pattern achievements
    if (
      requirement.match(
        /^(perfectWeek|perfectMonth|monthlyMilestones|quarterlyChampion|yearlyLegend)$/
      )
    ) {
      return false; // TODO: Implement pattern-based achievements
    }

    // Meta achievements
    if (
      requirement.match(
        /^(allRounder|completionist|masterFaster|faqExplorer|knowledgeSeeker|scienceScholar|fastingEncyclopedia)$/
      )
    ) {
      return false; // TODO: Implement meta achievements
    }

    // Profile/UI achievements
    if (
      requirement.match(
        /^(profilePerfectionist|socialSharer|motivationalNote|methodMaster|safetyFirst|hydrationHero|autophagyAware)$/
      )
    ) {
      return false; // TODO: Implement UI-based achievements
    }

    // Special date achievements
    if (
      requirement.match(
        /^(newYearResolution|birthdayFaster|holidayDedication|luckyThirteen|secretHunter|comebackChampion)$/
      )
    ) {
      return false; // TODO: Implement special date achievements
    }

    // Unknown requirement - log warning and return false
    console.warn(`⚠️ Unknown custom achievement requirement: ${requirement}`);
    return false;
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
