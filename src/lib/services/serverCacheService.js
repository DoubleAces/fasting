/**
 * ServerCacheService - In-Memory Caching Layer
 * 
 * Provides a simple, efficient caching layer using node-cache for storing
 * frequently accessed data (settings, insights) to reduce database load.
 * 
 * Features:
 * - TTL-based expiration
 * - Pattern-based key deletion
 * - Cache statistics tracking
 * - Graceful error handling
 * 
 * Usage:
 * ```js
 * const { getCacheService } = require('./serverCacheService');
 * const cache = getCacheService();
 * await cache.set('key', value, 3600); // 1 hour TTL
 * const data = await cache.get('key');
 * ```
 */

const NodeCache = require('node-cache');

class ServerCacheService {
  /**
   * Creates a new ServerCacheService instance
   * @param {Object} options - Cache configuration options
   * @param {number} options.stdTTL - Default TTL in seconds (default: 3600)
   * @param {number} options.checkperiod - Automatic delete check interval in seconds (default: 600)
   * @param {boolean} options.useClones - Clone variables on get/set (default: false for performance)
   */
  constructor(options = {}) {
    const defaultOptions = {
      stdTTL: parseInt(process.env.CACHE_TTL_SETTINGS) || 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Don't clone for better performance
    };

    this.cache = new NodeCache({ ...defaultOptions, ...options });
    this.enabled = true;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null if not found/expired
   */
  async get(key) {
    try {
      const value = this.cache.get(key);
      return value === undefined ? null : value;
    } catch (error) {
      console.error(`[ServerCacheService] Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds (optional, uses default if not provided)
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async set(key, value, ttl) {
    try {
      if (!key) {
        return false;
      }

      const success = ttl !== undefined
        ? this.cache.set(key, value, ttl)
        : this.cache.set(key, value);

      return success;
    } catch (error) {
      console.error(`[ServerCacheService] Error setting key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key to delete
   * @returns {Promise<boolean>} True if key was deleted, false if not found
   */
  async del(key) {
    try {
      const deleted = this.cache.del(key);
      return deleted > 0;
    } catch (error) {
      console.error(`[ServerCacheService] Error deleting key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (supports * wildcard)
   * @returns {Promise<number>} Number of keys deleted
   */
  async delPattern(pattern) {
    try {
      const keys = this.cache.keys();
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const matchingKeys = keys.filter(key => regex.test(key));
      
      if (matchingKeys.length === 0) {
        return 0;
      }

      const deleted = this.cache.del(matchingKeys);
      return deleted;
    } catch (error) {
      console.error(`[ServerCacheService] Error deleting pattern "${pattern}":`, error);
      return 0;
    }
  }

  /**
   * Check if caching is enabled
   * @returns {boolean} True if cache is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats (keys, hits, misses, ksize, vsize)
   */
  getStats() {
    try {
      return this.cache.getStats();
    } catch (error) {
      console.error('[ServerCacheService] Error getting stats:', error);
      return {
        keys: 0,
        hits: 0,
        misses: 0,
        ksize: 0,
        vsize: 0,
      };
    }
  }

  /**
   * Close the cache and clean up
   */
  close() {
    try {
      this.cache.close();
    } catch (error) {
      console.error('[ServerCacheService] Error closing cache:', error);
    }
  }

  /**
   * Flush all keys from cache
   */
  flushAll() {
    try {
      this.cache.flushAll();
    } catch (error) {
      console.error('[ServerCacheService] Error flushing cache:', error);
    }
  }
}

// Export singleton instance
let cacheInstance;

/**
 * Get the global ServerCacheService instance
 * @returns {ServerCacheService} Singleton cache instance
 */
function getCacheService() {
  if (!cacheInstance) {
    cacheInstance = new ServerCacheService();
  }
  return cacheInstance;
}

module.exports = ServerCacheService;
module.exports.getCacheService = getCacheService;
