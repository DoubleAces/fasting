/**
 * Dashboard Service
 * 
 * Provides dashboard-specific data aggregation functions:
 * - Streak calculation (consecutive days from most recent entry backward)
 * - Stats aggregation (streak, total fasts, average duration)
 * 
 * Performance: Uses lean queries and reuses existing entryInsightsService functions
 */

import Entry from '@/lib/models/Entry';
import { getAverageDuration } from './entryInsightsService.js';
import { differenceInCalendarDays } from 'date-fns';

/**
 * Calculate current streak
 * Counts consecutive entries with non-null fasting duration, starting from most recent backward
 * Ignores calendar gaps - only cares about consecutive completed fasts
 * @param {string} userId - User ID
 * @returns {Promise<number>} Streak count (0 if no completed fasts)
 */
export async function calculateStreak(userId) {
  // Fetch all entries with non-null fasting duration, sorted by date descending
  const entries = await Entry.find({ 
    userId,
    fastingDuration: { $ne: null }
  })
    .sort({ date: -1 })
    .select('date fastingDuration')
    .lean();

  // No completed fasts = no streak
  if (entries.length === 0) {
    return 0;
  }

  // All entries with non-null fasting duration count as streak
  // since we're only fetching completed fasts
  return entries.length;
}

/**
 * Calculate all dashboard statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} DashboardStats object
 * @property {number} currentStreak - Consecutive days from most recent entry
 * @property {number} totalFasts - Count of all entries
 * @property {number|null} averageDuration - Mean duration in minutes (null if <7 entries)
 */
/**
 * Calculate average duration from ALL user entries (not just last 30 days)
 * Dashboard-specific function per FR-013
 */
async function calculateAverageDurationAll(userId) {
  const entries = await Entry.find({
    userId,
    fastingDuration: { $ne: null },
  }).select('fastingDuration');

  console.log(`🔍 calculateAverageDurationAll: Found ${entries.length} entries with non-null duration`);
  
  // Need at least 7 completed fasts (entries with non-null duration) for meaningful average (per FR-013)
  if (entries.length < 7) {
    console.log(`⚠️  Not enough completed fasts: ${entries.length} < 7 (need entries with fastingDuration)`);
    return null;
  }

  const sum = entries.reduce((acc, entry) => acc + entry.fastingDuration, 0);
  const average = sum / entries.length;
  console.log(`✅ Average duration calculated: ${average} minutes from ${entries.length} entries`);
  return average;
}

/**
 * Calculate longest fast (personal record)
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} { duration: minutes, date: Date } or null
 */
async function calculateLongestFast(userId) {
  const entry = await Entry.findOne({
    userId,
    fastingDuration: { $ne: null },
  })
    .sort({ fastingDuration: -1 })
    .limit(1)
    .select('fastingDuration date')
    .lean();

  return entry ? { duration: entry.fastingDuration, date: entry.date } : null;
}

/**
 * Calculate consistency score (% of days with entries in last 30 days)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Percentage 0-100
 */
async function calculateConsistency(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const count = await Entry.countDocuments({
    userId,
    date: { $gte: thirtyDaysAgo },
  });

  return Math.round((count / 30) * 100);
}

/**
 * Calculate this week vs last week comparison
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { thisWeek: avg, lastWeek: avg, trend: 'up'|'down'|'stable' }
 */
async function calculateWeekComparison(userId) {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // Get this week's entries
  const thisWeekEntries = await Entry.find({
    userId,
    date: { $gte: startOfThisWeek },
    fastingDuration: { $ne: null },
  }).select('fastingDuration').lean();

  // Get last week's entries
  const lastWeekEntries = await Entry.find({
    userId,
    date: { $gte: startOfLastWeek, $lt: startOfThisWeek },
    fastingDuration: { $ne: null },
  }).select('fastingDuration').lean();

  const thisWeekAvg = thisWeekEntries.length > 0
    ? thisWeekEntries.reduce((sum, e) => sum + e.fastingDuration, 0) / thisWeekEntries.length
    : null;

  const lastWeekAvg = lastWeekEntries.length > 0
    ? lastWeekEntries.reduce((sum, e) => sum + e.fastingDuration, 0) / lastWeekEntries.length
    : null;

  let trend = 'stable';
  if (thisWeekAvg && lastWeekAvg) {
    const diff = thisWeekAvg - lastWeekAvg;
    if (diff > 30) trend = 'up'; // More than 30 minutes improvement
    else if (diff < -30) trend = 'down';
  }

  return { thisWeekAvg, lastWeekAvg, trend };
}

/**
 * Calculate this month's summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} { count: number, average: number|null }
 */
async function calculateMonthSummary(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const entries = await Entry.find({
    userId,
    date: { $gte: startOfMonth },
    fastingDuration: { $ne: null },
  }).select('fastingDuration').lean();

  const average = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.fastingDuration, 0) / entries.length
    : null;

  return { count: entries.length, average };
}

export async function calculateDashboardStats(userId) {
  // Run all calculations in parallel
  const [
    streak,
    totalFasts,
    averageDuration,
    longestFast,
    consistency,
    weekComparison,
    monthSummary,
  ] = await Promise.all([
    calculateStreak(userId),
    Entry.countDocuments({ userId }),
    calculateAverageDurationAll(userId),
    calculateLongestFast(userId),
    calculateConsistency(userId),
    calculateWeekComparison(userId),
    calculateMonthSummary(userId),
  ]);

  return {
    currentStreak: streak,
    totalFasts,
    averageDuration,
    longestFast,
    consistency,
    weekComparison,
    monthSummary,
  };
}
