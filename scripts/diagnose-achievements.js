/**
 * Achievement Diagnostic Script
 * 
 * Analyzes a user's entries and achievements to diagnose why certain
 * achievements may not be unlocked when they should be.
 * 
 * Usage:
 *   node scripts/diagnose-achievements.js <userId>
 * 
 * Example:
 *   node scripts/diagnose-achievements.js 507f1f77bcf86cd799439011
 * 
 * Output:
 * - User statistics (total entries, fasts, streaks, etc.)
 * - Currently unlocked achievements
 * - Achievements that SHOULD be unlocked based on current data
 * - Achievements within reach (close to unlocking)
 */

import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/lib/db.js';
import Entry from '../src/lib/models/Entry.js';
import User from '../src/lib/models/User.js';
import Achievement from '../src/lib/models/Achievement.js';
import UserAchievement from '../src/lib/models/UserAchievement.js';
import { calculateStreak } from '../src/lib/services/AchievementService.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Calculate user statistics
 */
async function calculateUserStats(userId) {
  const entries = await Entry.find({ userId }).sort({ date: 1 }).lean();
  
  // Total entries
  const totalEntries = entries.length;
  
  // Fasting durations
  const fastingDurations = entries
    .filter(e => e.fastingTime)
    .map(e => {
      // Parse "17h 20m" format
      const match = e.fastingTime.match(/(\d+)h(?:\s*(\d+)m)?/);
      if (!match) return 0;
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      return hours + (minutes / 60);
    });
  
  const longestFast = Math.max(...fastingDurations, 0);
  const averageFast = fastingDurations.length > 0
    ? fastingDurations.reduce((a, b) => a + b, 0) / fastingDurations.length
    : 0;
  
  // Count fasts by duration threshold
  const fastsOver16h = fastingDurations.filter(d => d >= 16).length;
  const fastsOver18h = fastingDurations.filter(d => d >= 18).length;
  const fastsOver24h = fastingDurations.filter(d => d >= 24).length;
  const fastsOver36h = fastingDurations.filter(d => d >= 36).length;
  const fastsOver48h = fastingDurations.filter(d => d >= 48).length;
  const fastsOver72h = fastingDurations.filter(d => d >= 72).length;
  
  // Calculate streak
  const streakResult = await calculateStreak(userId);
  
  // Count completed goals
  const completedGoals = entries.filter(e => e.goalCompleted === true).length;
  
  return {
    totalEntries,
    fastingDurations,
    longestFast,
    averageFast,
    fastsOver16h,
    fastsOver18h,
    fastsOver24h,
    fastsOver36h,
    fastsOver48h,
    fastsOver72h,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    completedGoals,
  };
}

/**
 * Check which achievements should be unlocked
 */
function checkAchievementEligibility(stats, allAchievements) {
  const eligible = [];
  const closeToUnlocking = [];
  
  allAchievements.forEach(achievement => {
    const criteria = achievement.criteria;
    let isEligible = false;
    let progress = null;
    
    switch (criteria.type) {
      case 'duration-milestone':
        const hours = criteria.durationHours;
        let qualifyingFasts = 0;
        if (hours >= 72) qualifyingFasts = stats.fastsOver72h;
        else if (hours >= 48) qualifyingFasts = stats.fastsOver48h;
        else if (hours >= 36) qualifyingFasts = stats.fastsOver36h;
        else if (hours >= 24) qualifyingFasts = stats.fastsOver24h;
        else if (hours >= 18) qualifyingFasts = stats.fastsOver18h;
        else if (hours >= 16) qualifyingFasts = stats.fastsOver16h;
        
        isEligible = qualifyingFasts >= (criteria.requiredCount || 1);
        progress = `${qualifyingFasts}/${criteria.requiredCount || 1} fasts of ${hours}+ hours`;
        
        // Close to unlocking = within 2 of target
        if (!isEligible && qualifyingFasts >= (criteria.requiredCount || 1) - 2) {
          closeToUnlocking.push({ achievement, progress });
        }
        break;
        
      case 'streak':
        const targetStreak = criteria.consecutiveDays;
        const currentStreak = stats.currentStreak;
        const longestStreak = stats.longestStreak;
        
        isEligible = longestStreak >= targetStreak;
        progress = `Current: ${currentStreak} days, Longest: ${longestStreak} days (need ${targetStreak})`;
        
        if (!isEligible && longestStreak >= targetStreak - 3) {
          closeToUnlocking.push({ achievement, progress });
        }
        break;
        
      case 'entry-count':
        isEligible = stats.totalEntries >= criteria.requiredCount;
        progress = `${stats.totalEntries}/${criteria.requiredCount} entries`;
        
        if (!isEligible && stats.totalEntries >= criteria.requiredCount - 5) {
          closeToUnlocking.push({ achievement, progress });
        }
        break;
        
      case 'goal-completion':
        isEligible = stats.completedGoals >= criteria.requiredCount;
        progress = `${stats.completedGoals}/${criteria.requiredCount} goals completed`;
        
        if (!isEligible && stats.completedGoals >= criteria.requiredCount - 2) {
          closeToUnlocking.push({ achievement, progress });
        }
        break;
        
      // Weight and custom not implemented yet
      case 'weight-loss':
      case 'custom':
        progress = 'Not yet implemented';
        break;
    }
    
    if (isEligible) {
      eligible.push({ achievement, progress });
    }
  });
  
  return { eligible, closeToUnlocking };
}

/**
 * Main execution
 */
async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Error: userId required');
    console.error('Usage: node scripts/diagnose-achievements.js <userId>');
    process.exit(1);
  }
  
  console.log('🔍 Achievement Diagnostic Tool\n');
  console.log(`User ID: ${userId}\n`);
  
  try {
    // Connect to database
    await connectDB();
    
    // Get user
    const user = await User.findById(userId).select('email name');
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    console.log(`User: ${user.email || user.name}\n`);
    
    // Calculate statistics
    console.log('📊 Calculating user statistics...');
    const stats = await calculateUserStats(userId);
    
    console.log('\n' + '='.repeat(60));
    console.log('USER STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total Entries:          ${stats.totalEntries}`);
    console.log(`Longest Fast:           ${stats.longestFast.toFixed(1)}h`);
    console.log(`Average Fast:           ${stats.averageFast.toFixed(1)}h`);
    console.log(`Current Streak:         ${stats.currentStreak} days 🔥`);
    console.log(`Longest Streak:         ${stats.longestStreak} days`);
    console.log(`Completed Goals:        ${stats.completedGoals}`);
    console.log('');
    console.log('Fasts by Duration:');
    console.log(`  16+ hours:            ${stats.fastsOver16h}`);
    console.log(`  18+ hours:            ${stats.fastsOver18h}`);
    console.log(`  24+ hours:            ${stats.fastsOver24h}`);
    console.log(`  36+ hours:            ${stats.fastsOver36h}`);
    console.log(`  48+ hours:            ${stats.fastsOver48h}`);
    console.log(`  72+ hours:            ${stats.fastsOver72h}`);
    
    // Get unlocked achievements
    const unlockedAchievements = await UserAchievement.find({ userId })
      .populate('achievementId')
      .sort({ unlockedAt: -1 })
      .lean();
    
    console.log('\n' + '='.repeat(60));
    console.log(`UNLOCKED ACHIEVEMENTS (${unlockedAchievements.length})`);
    console.log('='.repeat(60));
    if (unlockedAchievements.length === 0) {
      console.log('None unlocked yet');
    } else {
      unlockedAchievements.forEach(ua => {
        const ach = ua.achievementId;
        console.log(`🏆 ${ach.translations.en.name} (+${ach.points} pts)`);
        console.log(`   ${ach.translations.en.description}`);
        console.log(`   Unlocked: ${new Date(ua.unlockedAt).toLocaleDateString()}`);
      });
    }
    
    // Get all achievements
    const allAchievements = await Achievement.find({}).lean();
    
    // Check eligibility
    const { eligible, closeToUnlocking } = checkAchievementEligibility(stats, allAchievements);
    
    // Filter out already unlocked
    const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievementId._id.toString()));
    const shouldBeUnlocked = eligible.filter(e => !unlockedIds.has(e.achievement._id.toString()));
    
    console.log('\n' + '='.repeat(60));
    console.log(`SHOULD BE UNLOCKED (${shouldBeUnlocked.length})`);
    console.log('='.repeat(60));
    if (shouldBeUnlocked.length === 0) {
      console.log('✅ All eligible achievements are already unlocked!');
    } else {
      console.log('⚠️  These achievements should be unlocked based on your data:\n');
      shouldBeUnlocked.forEach(({ achievement, progress }) => {
        console.log(`❌ ${achievement.translations.en.name} (+${achievement.points} pts)`);
        console.log(`   ${achievement.translations.en.description}`);
        console.log(`   Progress: ${progress}`);
        console.log('');
      });
      console.log('💡 Run: node scripts/backfill-achievements.js ' + userId);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`CLOSE TO UNLOCKING (${closeToUnlocking.length})`);
    console.log('='.repeat(60));
    if (closeToUnlocking.length === 0) {
      console.log('None within reach');
    } else {
      closeToUnlocking.forEach(({ achievement, progress }) => {
        console.log(`🎯 ${achievement.translations.en.name} (+${achievement.points} pts)`);
        console.log(`   Progress: ${progress}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
