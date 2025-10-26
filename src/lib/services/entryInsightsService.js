/**
 * Entry Insights Service
 * 
 * Calculates personalized insights by comparing an entry to the user's historical patterns.
 * All functions operate on 30-day windows unless otherwise specified.
 * 
 * Performance Optimized: Uses single aggregation pipeline with $facet to fetch all data
 * in one query instead of 5+ separate queries.
 * 
 * Caching: Results cached for 30 minutes to reduce database load.
 */

import Entry from '@/lib/models/Entry';
import { startOfMonth, endOfMonth, subDays } from 'date-fns';
import { getCacheService } from './serverCacheService.js';

// Get cache service instance
const cache = getCacheService();

// Cache TTL from environment or default to 30 minutes (1800 seconds)
const INSIGHTS_CACHE_TTL = parseInt(process.env.CACHE_TTL_INSIGHTS) || 1800;

/**
 * Generate cache key for insights
 * @param {string} userId - User ID
 * @param {string} entryId - Entry ID
 * @returns {string} Cache key
 */
function getInsightsCacheKey(userId, entryId) {
  return `insights:${userId}:${entryId}`;
}

/**
 * Calculate all insights for a given entry using optimized aggregation pipeline
 * Results are cached for 30 minutes
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
    // Check cache first
    const cacheKey = getInsightsCacheKey(userId, entry._id.toString());
    const cachedInsights = await cache.get(cacheKey);
    
    if (cachedInsights) {
      console.log(`[Insights] Cache HIT for entry ${entry._id}`);
      return cachedInsights;
    }

    console.log(`[Insights] Cache MISS for entry ${entry._id} - calculating...`);

    // Use single aggregation pipeline with $facet to fetch all insights in one query
    const insights = await calculateInsightsOptimized(entry, userId);
    
    // Cache the results
    await cache.set(cacheKey, insights, INSIGHTS_CACHE_TTL);
    console.log(`[Insights] Cached insights for entry ${entry._id} (TTL: ${INSIGHTS_CACHE_TTL}s)`);
    
    return insights;
  } catch (error) {
    console.error('Error calculating insights:', error);
    throw error;
  }
}

/**
 * Optimized insights calculation using single aggregation pipeline
 * Replaces 5+ separate queries with one $facet aggregation
 * @param {Object} entry - The entry to analyze
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} EntryInsights object
 */
async function calculateInsightsOptimized(entry, userId) {
  const monthStart = startOfMonth(entry.date);
  const monthEnd = endOfMonth(entry.date);
  const thirtyDaysAgo = subDays(new Date(), 30);
  const now = new Date();
  const yesterday = subDays(entry.date, 1);

  // Single aggregation pipeline using $facet to calculate multiple insights in parallel
  const result = await Entry.aggregate([
    {
      // Match all user entries (we'll filter further in each facet)
      $match: {
        userId: entry.userId,
      }
    },
    {
      // Calculate multiple insights in parallel
      $facet: {
        // Facet 1: Longest this month check
        longestThisMonth: [
          {
            $match: {
              date: { $gte: monthStart, $lte: monthEnd },
              fastingDuration: { $ne: null },
            }
          },
          {
            $group: {
              _id: null,
              maxDuration: { $max: '$fastingDuration' },
              entries: {
                $push: {
                  id: '$_id',
                  duration: '$fastingDuration',
                  date: '$date',
                }
              }
            }
          }
        ],
        
        // Facet 2: Historical rank data
        rankData: [
          {
            $match: {
              fastingDuration: { $ne: null },
            }
          },
          {
            $group: {
              _id: null,
              totalCount: { $sum: 1 },
              longerCount: {
                $sum: {
                  $cond: [
                    { $gt: ['$fastingDuration', entry.fastingDuration] },
                    1,
                    0
                  ]
                }
              },
              sameDurationNewerCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$fastingDuration', entry.fastingDuration] },
                        { $gt: ['$date', entry.date] },
                        { $ne: ['$_id', entry._id] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ],
        
        // Facet 3: Average duration (last 30 days)
        averageDuration: [
          {
            $match: {
              date: { $gte: thirtyDaysAgo, $lte: now },
              fastingDuration: { $ne: null },
            }
          },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: '$fastingDuration' },
              count: { $sum: 1 },
            }
          }
        ],
        
        // Facet 4: Typical breakfast time (last 30 days)
        typicalBreakfastTime: [
          {
            $match: {
              date: { $gte: thirtyDaysAgo, $lte: now },
              firstMealTime: { $ne: null },
            }
          },
          {
            $project: {
              firstMealTime: 1,
              // Convert HH:mm to minutes for sorting
              minutesFromMidnight: {
                $add: [
                  {
                    $multiply: [
                      { $toInt: { $substr: ['$firstMealTime', 0, 2] } },
                      60
                    ]
                  },
                  { $toInt: { $substr: ['$firstMealTime', 3, 2] } }
                ]
              }
            }
          },
          {
            $sort: { minutesFromMidnight: 1 }
          },
          {
            $group: {
              _id: null,
              times: { $push: '$minutesFromMidnight' },
              count: { $sum: 1 },
            }
          }
        ],
        
        // Facet 5: Streak contribution (yesterday's entry)
        streakCheck: [
          {
            $match: {
              date: yesterday,
            }
          },
          {
            $limit: 1
          }
        ]
      }
    }
  ]);

  // Extract data from facets
  const facets = result[0];
  
  // Process longest this month
  const longestData = facets.longestThisMonth[0];
  const isLongestThisMonth = longestData ? 
    (entry.fastingDuration >= longestData.maxDuration) : true;

  // Process rank data
  const rankInfo = facets.rankData[0];
  const rank = rankInfo ? 
    (rankInfo.longerCount + rankInfo.sameDurationNewerCount + 1) : 1;
  const totalEntries = rankInfo ? rankInfo.totalCount : 1;

  // Process average duration
  const avgData = facets.averageDuration[0];
  const averageDuration = (avgData && avgData.count >= 7) ? 
    avgData.avgDuration : null;
  
  const comparisonToAverage = averageDuration ? 
    entry.fastingDuration - averageDuration : null;

  // Process typical breakfast time
  const timeData = facets.typicalBreakfastTime[0];
  let typicalBreakfastTime = null;
  if (timeData && timeData.count >= 7) {
    const times = timeData.times;
    const middleIndex = Math.floor(times.length / 2);
    let medianMinutes;
    
    if (times.length % 2 === 0) {
      medianMinutes = Math.round((times[middleIndex - 1] + times[middleIndex]) / 2);
    } else {
      medianMinutes = times[middleIndex];
    }
    
    const hours = Math.floor(medianMinutes / 60);
    const minutes = medianMinutes % 60;
    typicalBreakfastTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Process streak contribution
  const contributesToStreak = facets.streakCheck.length > 0;

  // Calculate best day
  const isBestDayResult = isBestDay(entry, averageDuration);

  return {
    isLongestThisMonth,
    rank,
    totalEntries,
    averageDuration,
    comparisonToAverage,
    typicalBreakfastTime,
    contributesToStreak,
    isBestDay: isBestDayResult,
  };
}

/**
 * ============================================================================
 * CACHE INVALIDATION METHODS
 * ============================================================================
 */

/**
 * Invalidate insights cache for a specific entry
 * Call this when an entry is updated or deleted
 * @param {string} userId - User ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<boolean>} True if cache was invalidated
 */
export async function invalidateInsightsForEntry(userId, entryId) {
  const cacheKey = getInsightsCacheKey(userId, entryId);
  const deleted = await cache.del(cacheKey);
  
  if (deleted) {
    console.log(`[Insights] Invalidated cache for entry ${entryId}`);
  }
  
  return deleted;
}

/**
 * Invalidate all insights caches for a user
 * Call this when user's historical data changes significantly
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of cache keys invalidated
 */
export async function invalidateInsightsForUser(userId) {
  const pattern = `insights:${userId}:*`;
  const count = await cache.delPattern(pattern);
  
  if (count > 0) {
    console.log(`[Insights] Invalidated ${count} cache entries for user ${userId}`);
  }
  
  return count;
}

/**
 * Invalidate insights cache for multiple entries
 * Useful when bulk operations affect multiple entries
 * @param {string} userId - User ID
 * @param {string[]} entryIds - Array of entry IDs
 * @returns {Promise<number>} Number of caches invalidated
 */
export async function invalidateInsightsForEntries(userId, entryIds) {
  let count = 0;
  
  for (const entryId of entryIds) {
    const deleted = await invalidateInsightsForEntry(userId, entryId);
    if (deleted) count++;
  }
  
  if (count > 0) {
    console.log(`[Insights] Invalidated ${count} cache entries for user ${userId}`);
  }
  
  return count;
}

/**
 * ============================================================================
 * LEGACY FUNCTIONS - Kept for backwards compatibility and testing
 * These are replaced by the optimized aggregation pipeline above
 * ============================================================================
 */

/**
 * Check if this entry is the longest fast in the current month
 * @deprecated Use calculateInsightsOptimized() instead for better performance
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
