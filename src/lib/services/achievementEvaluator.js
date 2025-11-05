/**
 * Achievement Evaluator Service
 * 
 * Event-driven service that automatically evaluates and unlocks achievements
 * when users create or update fasting entries.
 * 
 * Features:
 * - Single-user evaluation (triggered by specific user events)
 * - Automatic achievement unlocking based on criteria
 * - Duplicate prevention via database constraints
 * - Atomic points updates
 */

import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import User from '../models/User.js';
import Entry from '../models/Entry.js';

/**
 * Evaluate duration milestone criteria
 * Checks if user has any entry meeting the minimum fasting duration
 * 
 * @param {string} userId - User ID to evaluate
 * @param {Object} criteriaParams - { hours: number }
 * @returns {Promise<boolean>} True if criteria met
 */
export async function evaluateDurationMilestone(userId, criteriaParams) {
  try {
    const { hours } = criteriaParams;
    
    // Check if user has any entry with duration >= required hours
    const entry = await Entry.findOne({
      userId,
      fastingDuration: { $gte: hours }
    });
    
    return !!entry;
  } catch (error) {
    console.error('Error evaluating duration milestone:', error);
    return false;
  }
}

/**
 * Evaluate streak criteria
 * Checks if user has consecutive days with fasting entries
 * 
 * @param {string} userId - User ID to evaluate
 * @param {Object} criteriaParams - { days: number }
 * @returns {Promise<boolean>} True if criteria met
 */
export async function evaluateStreak(userId, criteriaParams) {
  try {
    const { days } = criteriaParams;
    
    // Get recent entries sorted by date descending
    const entries = await Entry.find({ userId })
      .sort({ date: -1 })
      .select('date')
      .lean();
    
    if (entries.length < days) {
      return false;
    }
    
    // Check for consecutive days starting from most recent
    let consecutiveDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - consecutiveDays);
      
      // Check if entry matches expected date in streak
      if (entryDate.getTime() === expectedDate.getTime()) {
        consecutiveDays++;
        
        if (consecutiveDays >= days) {
          return true;
        }
      } else if (entryDate.getTime() < expectedDate.getTime()) {
        // Gap found, streak broken
        break;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error evaluating streak:', error);
    return false;
  }
}

/**
 * Evaluate entry count criteria
 * Checks if user has reached minimum number of entries
 * 
 * @param {string} userId - User ID to evaluate
 * @param {Object} criteriaParams - { count: number }
 * @returns {Promise<boolean>} True if criteria met
 */
export async function evaluateEntryCount(userId, criteriaParams) {
  try {
    const { count } = criteriaParams;
    
    const entryCount = await Entry.countDocuments({ userId });
    
    return entryCount >= count;
  } catch (error) {
    console.error('Error evaluating entry count:', error);
    return false;
  }
}

/**
 * Unlock achievement for user
 * Creates UserAchievement record and increments user's points atomically
 * 
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID to unlock
 * @returns {Promise<Object>} { success: boolean, pointsAdded?: number, reason?: string }
 */
export async function unlockAchievement(userId, achievementId) {
  try {
    // Get achievement details
    const achievement = await Achievement.findOne({ achievementId });
    
    if (!achievement) {
      return { success: false, reason: 'achievement-not-found' };
    }
    
    // Check if already unlocked (prevent duplicates)
    const existing = await UserAchievement.findOne({
      userId,
      achievementId
    });
    
    if (existing) {
      return { success: false, reason: 'already-unlocked' };
    }
    
    // Create UserAchievement record
    await UserAchievement.create({
      userId,
      achievementId,
      unlockedAt: new Date(),
      progress: 100,
      notificationSeen: false
    });
    
    // Atomically increment user's achievement points
    await User.findByIdAndUpdate(
      userId,
      { $inc: { achievementPoints: achievement.points } },
      { new: true }
    );
    
    return { success: true, pointsAdded: achievement.points };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return { success: false, reason: 'error' };
  }
}

/**
 * Main evaluation function - evaluates all active achievements for a specific user
 * Triggered by entry creation/update events
 * 
 * @param {string} userId - User ID whose achievements to evaluate
 * @returns {Promise<Object>} Evaluation result summary
 */
export async function evaluateAchievements(userId) {
  try {
    const results = {
      success: true,
      userId,
      evaluated: 0,
      unlocked: 0,
      skipped: 0,
      unlockedAchievements: []
    };
    
    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });
    results.evaluated = achievements.length;
    
    // Get user's existing unlocked achievements
    const unlockedAchievementIds = await UserAchievement.find({ userId })
      .select('achievementId')
      .lean();
    const unlockedSet = new Set(
      unlockedAchievementIds.map(ua => ua.achievementId)
    );
    
    // Evaluate each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedSet.has(achievement.achievementId)) {
        results.skipped++;
        continue;
      }
      
      // Evaluate based on criteria type
      const { type, params } = achievement.criteria;
      let criteriaMet = false;
      
      switch (type) {
        case 'duration-milestone':
          criteriaMet = await evaluateDurationMilestone(userId, params);
          break;
        case 'streak':
          criteriaMet = await evaluateStreak(userId, params);
          break;
        case 'entry-count':
          criteriaMet = await evaluateEntryCount(userId, params);
          break;
        default:
          console.warn(`Unknown criteria type: ${type}`);
          continue;
      }
      
      // Unlock if criteria met
      if (criteriaMet) {
        const unlockResult = await unlockAchievement(userId, achievement.achievementId);
        
        if (unlockResult.success) {
          results.unlocked++;
          results.unlockedAchievements.push({
            achievementId: achievement.achievementId,
            pointsAdded: unlockResult.pointsAdded
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error evaluating achievements:', error);
    return {
      success: false,
      error: error.message,
      userId
    };
  }
}
