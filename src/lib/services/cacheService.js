/**
 * Cache Service
 * Service for managing Cache Storage API
 * Provides cache inspection and cleanup utilities
 */

/**
 * Get estimated size of all caches
 * Note: This is an estimation, not exact byte count
 * @returns {Promise<{ bytes: number, readable: string }>} Cache size
 * @throws {Error} If unable to estimate size
 */
export async function getCacheSize() {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { bytes: 0, readable: '0 B' };
    }

    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Estimate: Each response is roughly 5KB average
      // This is NOT accurate but gives a rough idea
      totalSize += requests.length * 5120; // 5KB per cached item
    }

    return {
      bytes: totalSize,
      readable: formatBytes(totalSize),
    };
  } catch (error) {
    console.error('[CacheService] Failed to get cache size:', error);
    throw new Error(`Failed to estimate cache size: ${error.message}`);
  }
}

/**
 * Get list of all cache names
 * @returns {Promise<string[]>} Array of cache names
 * @throws {Error} If unable to get cache keys
 */
export async function getCacheKeys() {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return [];
    }

    const cacheNames = await caches.keys();
    return cacheNames;
  } catch (error) {
    console.error('[CacheService] Failed to get cache keys:', error);
    throw new Error(`Failed to get cache keys: ${error.message}`);
  }
}

/**
 * Get detailed cache information
 * Includes cache names and item counts
 * @returns {Promise<Array<{ name: string, count: number }>>} Cache details
 * @throws {Error} If unable to get cache details
 */
export async function getCacheDetails() {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return [];
    }

    const cacheNames = await caches.keys();
    const details = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      details.push({
        name: cacheName,
        count: requests.length,
      });
    }

    return details;
  } catch (error) {
    console.error('[CacheService] Failed to get cache details:', error);
    throw new Error(`Failed to get cache details: ${error.message}`);
  }
}

/**
 * Clear all caches
 * Sends CLEAR_CACHE message to service worker
 * @returns {Promise<number>} Number of caches cleared
 * @throws {Error} If unable to clear caches
 */
export async function clearCaches() {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return 0;
    }

    const cacheNames = await caches.keys();
    let clearedCount = 0;

    // Delete all caches
    for (const cacheName of cacheNames) {
      const deleted = await caches.delete(cacheName);
      if (deleted) {
        clearedCount++;
      }
    }

    // Send message to service worker to clear its caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      });
    }

    console.log(`[CacheService] Cleared ${clearedCount} caches`);
    return clearedCount;
  } catch (error) {
    console.error('[CacheService] Failed to clear caches:', error);
    throw new Error(`Failed to clear caches: ${error.message}`);
  }
}

/**
 * Clear a specific cache by name
 * @param {string} cacheName - Name of cache to clear
 * @returns {Promise<boolean>} True if cache was cleared
 * @throws {Error} If unable to clear cache
 */
export async function clearCache(cacheName) {
  try {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }

    if (!cacheName) {
      throw new Error('Cache name is required');
    }

    const deleted = await caches.delete(cacheName);
    
    if (deleted) {
      console.log(`[CacheService] Cleared cache: ${cacheName}`);
    } else {
      console.warn(`[CacheService] Cache not found: ${cacheName}`);
    }

    return deleted;
  } catch (error) {
    console.error('[CacheService] Failed to clear cache:', error);
    throw new Error(`Failed to clear cache: ${error.message}`);
  }
}

/**
 * Check if Cache API is available
 * @returns {boolean} True if caches are supported
 */
export function isCacheAvailable() {
  return typeof window !== 'undefined' && 'caches' in window;
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default {
  getCacheSize,
  getCacheKeys,
  getCacheDetails,
  clearCaches,
  clearCache,
  isCacheAvailable,
};
