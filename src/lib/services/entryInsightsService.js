/**
 * Entry Insights Service
 * 
 * Calculates personalized insights by comparing an entry to the user's historical patterns.
 * All functions operate on 30-day windows unless otherwise specified.
 */

import Entry from '@/lib/models/Entry';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';

/**
 * Calculate all insights for a given entry
 * @param {Object} entry - The entry to analyze
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} EntryInsights object per data-model.md
 */
export async function calculateInsights(entry, userId) {
  // Cannot calculate insights without duration
  if (!entry.fastingDuration) {
    return null;
  }

  try {
    // Calculate all insights in parallel where possible
    const [
      longestThisMonth,
      rankData,
      averageDuration,
      typicalTime,
      streakContribution
    ] = await Promise.all([
      isLongestThisMonth(entry, userId),
      getHistoricalRank(entry, userId),
      getAverageDuration(userId),
      getTypicalBreakfastTime(userId),
      contributesToStreak(entry, userId),
    ]);

    // Calculate comparison to average
    const comparisonToAverage = averageDuration 
      ? entry.fastingDuration - averageDuration
      : null;

    // Check if best day
    const bestDay = isBestDay(entry, averageDuration);

    return {
      isLongestThisMonth: longestThisMonth,
      rank: rankData.rank,
      totalEntries: rankData.totalCount,
      averageDuration,
      comparisonToAverage,
      typicalBreakfastTime: typicalTime,
      contributesToStreak: streakContribution,
      isBestDay: bestDay,
    };
  } catch (error) {
    console.error('Error calculating insights:', error);
    throw error;
  }
}

/**
 * Check if this entry is the longest fast in the current month
 * @param {Object} entry - The entry to check
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>}
 */
export async function isLongestThisMonth(entry, userId) {
  if (!entry.fastingDuration) {
    return false;
  }

  // Find all other entries this month
  const monthStart = startOfMonth(entry.date);
  const monthEnd = endOfMonth(entry.date);

  const otherEntries = await Entry.find({
    userId,
    date: {
      $gte: monthStart,
      $lte: monthEnd,
    },
    _id: { $ne: entry._id },
    fastingDuration: { $ne: null },
  });

  // Check if any other entry is longer (or equal with older date for tiebreaker)
  const hasLongerEntry = otherEntries.some(otherEntry => {
    if (otherEntry.fastingDuration > entry.fastingDuration) {
      return true;
    }
    // Tiebreaker: if durations equal, older entry loses
    if (otherEntry.fastingDuration === entry.fastingDuration && 
        otherEntry.date > entry.date) {
      return true;
    }
    return false;
  });

  return !hasLongerEntry;
}

/**
 * Get the historical rank of this entry (1 = longest)
 * Uses date tiebreaker when durations are identical (newer ranks higher)
 * @param {Object} entry - The entry to rank
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} { rank, totalCount }
 */
export async function getHistoricalRank(entry, userId) {
  // Count total valid entries (excluding current)
  const totalCount = await Entry.countDocuments({
    userId,
    _id: { $ne: entry._id },
    fastingDuration: { $ne: null },
  });

  if (!entry.fastingDuration) {
    return { rank: null, totalCount: totalCount + 1 };  // +1 to include current entry
  }

  // Count entries with longer duration
  const longerCount = await Entry.countDocuments({
    userId,
    _id: { $ne: entry._id },
    fastingDuration: { $gt: entry.fastingDuration },
  });

  // Count entries with same duration but newer date (tiebreaker)
  const sameDurationNewerCount = await Entry.countDocuments({
    userId,
    _id: { $ne: entry._id },
    fastingDuration: entry.fastingDuration,
    date: { $gt: entry.date },
  });

  // Rank = number of entries better than this one + 1
  const rank = longerCount + sameDurationNewerCount + 1;

  return { rank, totalCount: totalCount + 1 }; // +1 to include current entry
}

/**
 * Calculate average fasting duration from last 30 days
 * @param {string} userId - The user ID
 * @returns {Promise<number|null>} Average duration in minutes, null if <7 entries
 */
export async function getAverageDuration(userId) {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const now = new Date();

  const entries = await Entry.find({
    userId,
    date: {
      $gte: thirtyDaysAgo,
      $lte: now,
    },
    fastingDuration: { $ne: null },
  }).select('fastingDuration');

  // Need at least 7 entries for meaningful average
  if (entries.length < 7) {
    return null;
  }

  const sum = entries.reduce((acc, entry) => acc + entry.fastingDuration, 0);
  return sum / entries.length;
}

/**
 * Calculate median first meal time from last 30 days
 * @param {string} userId - The user ID
 * @returns {Promise<string|null>} Time in HH:mm format, null if <7 entries
 */
export async function getTypicalBreakfastTime(userId) {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const now = new Date();

  const entries = await Entry.find({
    userId,
    date: {
      $gte: thirtyDaysAgo,
      $lte: now,
    },
    firstMealTime: { $ne: null },
  }).select('firstMealTime');

  // Need at least 7 entries for meaningful median
  if (entries.length < 7) {
    return null;
  }

  // Convert times to minutes for sorting
  const timesInMinutes = entries.map(entry => {
    const [hours, minutes] = entry.firstMealTime.split(':').map(Number);
    return hours * 60 + minutes;
  }).sort((a, b) => a - b);

  // Calculate median
  const middleIndex = Math.floor(timesInMinutes.length / 2);
  let medianMinutes;

  if (timesInMinutes.length % 2 === 0) {
    // Even number: average the two middle values
    medianMinutes = Math.round((timesInMinutes[middleIndex - 1] + timesInMinutes[middleIndex]) / 2);
  } else {
    // Odd number: take the middle value
    medianMinutes = timesInMinutes[middleIndex];
  }

  // Convert back to HH:mm format
  const hours = Math.floor(medianMinutes / 60);
  const minutes = medianMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Check if this entry contributes to the current streak
 * @param {Object} entry - The entry to check
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>}
 */
export async function contributesToStreak(entry, userId) {
  const yesterday = subDays(entry.date, 1);

  // Check if there's an entry for yesterday
  const yesterdayEntry = await Entry.findOne({
    userId,
    date: yesterday,
  });

  return yesterdayEntry !== null;
}

/**
 * Check if this entry qualifies as a "best day"
 * Criteria: duration >= average, energyLevel = "High Energy", wellBeing = "Good", weight logged
 * @param {Object} entry - The entry to check
 * @param {number|null} averageDuration - The 30-day average duration
 * @returns {boolean}
 */
export function isBestDay(entry, averageDuration) {
  // Need all criteria
  if (!averageDuration || !entry.fastingDuration) {
    return false;
  }

  return (
    entry.fastingDuration >= averageDuration &&
    entry.energyLevel === 'High Energy' &&
    entry.wellBeing === 'Good' &&
    entry.morningWeight != null
  );
}
