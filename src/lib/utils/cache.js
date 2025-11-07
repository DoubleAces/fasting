/**
 * SimpleCache - In-Memory Cache Utility with TTL
 * 
 * A lightweight caching mechanism for storing frequently accessed data
 * with automatic Time-To-Live (TTL) expiration.
 * 
 * Features:
 * - Map-based storage for O(1) lookups
 * - Configurable TTL per cache instance
 * - Automatic expiration checking on access
 * - Type-safe for any serializable value
 * 
 * Usage:
 * ```js
 * import { SimpleCache } from '@/lib/utils/cache';
 * 
 * const cache = new SimpleCache(3600000); // 1 hour TTL
 * 
 * // Store data
 * cache.set('achievements', achievementsList);
 * 
 * // Retrieve data
 * const achievements = cache.get('achievements');
 * 
 * // Check if key exists and is not expired
 * if (cache.has('achievements')) {
 *   // Use cached data
 * }
 * 
 * // Clear all cache
 * cache.clear();
 * ```
 * 
 * @example Achievement Caching
 * ```js
 * const achievementCache = new SimpleCache(3600000); // 1 hour
 * 
 * async function getActiveAchievements() {
 *   if (achievementCache.has('active')) {
 *     return achievementCache.get('active');
 *   }
 *   
 *   const achievements = await Achievement.find({ isActive: true });
 *   achievementCache.set('active', achievements);
 *   return achievements;
 * }
 * ```
 */

export class SimpleCache {
  /**
   * Create a new cache instance
   * @param {number} ttl - Time-to-live in milliseconds (default: 3600000 = 1 hour)
   */
  constructor(ttl = 3600000) {
    this.ttl = ttl;
    this.cache = new Map();
  }

  /**
   * Store a value in the cache with current timestamp
   * @param {string|number} key - Cache key
   * @param {*} value - Value to cache (any serializable type)
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieve a value from the cache if it exists and hasn't expired
   * @param {string|number} key - Cache key
   * @returns {*} Cached value or undefined if not found or expired
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Check if a key exists in cache and hasn't expired
   * @param {string|number} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a specific key from cache
   * @param {string|number} key - Cache key to remove
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get the number of entries in cache
   * Automatically removes expired entries before counting
   * @returns {number} Number of non-expired entries in cache
   */
  size() {
    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }

  /**
   * Get all keys in cache (including expired ones)
   * @returns {string[]} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}
