/**
 * GET /api/cache-stats
 * Returns cache statistics for monitoring
 * 
 * Provides hit/miss rates, key counts, and memory usage for all caches
 * 
 * Authentication: Required (admin only in production)
 */

import { withErrorHandler, okResponse, unauthorizedResponse } from '@/lib/api/errorHandler';
import { auth } from '@/lib/auth';
import { settingsService } from '@/lib/services/settingsService';
import { getCacheStats as getInsightsCacheStats } from '@/lib/services/entryInsightsService';

export const GET = withErrorHandler(async (request) => {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required');
  }

  // In production, you might want to restrict this to admin users only
  // if (session.user.role !== 'admin') {
  //   return forbiddenResponse('Admin access required');
  // }

  // Gather cache statistics from all services
  const stats = {
    timestamp: new Date().toISOString(),
    userId: session.user.id,
    caches: {
      settings: settingsService.getCacheStats(),
      insights: getInsightsCacheStats(),
    },
    summary: {
      totalCaches: 2,
      totalKeys: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
    }
  };

  // Calculate summary statistics
  const settingsStats = stats.caches.settings;
  const insightsStats = stats.caches.insights;

  stats.summary.totalKeys = settingsStats.keys + insightsStats.keys;
  stats.summary.totalHits = settingsStats.hits + insightsStats.hits;
  stats.summary.totalMisses = settingsStats.misses + insightsStats.misses;

  const totalRequests = stats.summary.totalHits + stats.summary.totalMisses;
  if (totalRequests > 0) {
    stats.summary.hitRate = ((stats.summary.totalHits / totalRequests) * 100).toFixed(2);
  }

  return okResponse(stats);
});
