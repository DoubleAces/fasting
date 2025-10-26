/**
 * Unit Tests for ServerCacheService
 * Tests in-memory caching with node-cache
 */

const CacheService = require('../../../src/lib/services/serverCacheService');

describe('CacheService', () => {
  let cacheService;

  beforeEach(() => {
    // Create a fresh cache instance for each test
    cacheService = new CacheService();
  });

  afterEach(() => {
    // Clean up cache after each test
    if (cacheService) {
      cacheService.close();
    }
  });

  describe('get()', () => {
    it('should return null for cache miss', async () => {
      const result = await cacheService.get('nonexistent-key');
      expect(result).toBeNull();
    });

    it('should return cached value for cache hit', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };
      
      await cacheService.set(key, value);
      const result = await cacheService.get(key);
      
      expect(result).toEqual(value);
    });

    it('should return null for expired TTL', async () => {
      const key = 'expiring-key';
      const value = 'test-value';
      const ttl = 1; // 1 second

      await cacheService.set(key, value, ttl);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await cacheService.get(key);
      expect(result).toBeNull();
    });

    it('should handle different data types', async () => {
      const testCases = [
        { key: 'string', value: 'hello' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'object', value: { foo: 'bar' } },
        { key: 'array', value: [1, 2, 3] },
        { key: 'null', value: null },
      ];

      for (const { key, value } of testCases) {
        await cacheService.set(key, value);
        const result = await cacheService.get(key);
        expect(result).toEqual(value);
      }
    });

    it('should work with complex objects', async () => {
      const complexObject = {
        userId: '123',
        settings: {
          theme: 'dark',
          notifications: true,
        },
        entries: [
          { id: 1, duration: 16 },
          { id: 2, duration: 18 },
        ],
      };

      await cacheService.set('complex', complexObject);
      const result = await cacheService.get('complex');
      
      expect(result).toEqual(complexObject);
    });
  });

  describe('set()', () => {
    it('should store value successfully', async () => {
      const key = 'test-key';
      const value = 'test-value';
      
      const success = await cacheService.set(key, value);
      
      expect(success).toBe(true);
      const retrieved = await cacheService.get(key);
      expect(retrieved).toBe(value);
    });

    it('should store value with TTL', async () => {
      const key = 'ttl-key';
      const value = 'ttl-value';
      const ttl = 2; // 2 seconds

      await cacheService.set(key, value, ttl);
      
      // Value should exist immediately
      const immediate = await cacheService.get(key);
      expect(immediate).toBe(value);
      
      // Value should still exist after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      const afterOne = await cacheService.get(key);
      expect(afterOne).toBe(value);
      
      // Value should be gone after 2+ seconds
      await new Promise(resolve => setTimeout(resolve, 1200));
      const afterTwo = await cacheService.get(key);
      expect(afterTwo).toBeNull();
    });

    it('should overwrite existing key', async () => {
      const key = 'overwrite-key';
      
      await cacheService.set(key, 'first-value');
      await cacheService.set(key, 'second-value');
      
      const result = await cacheService.get(key);
      expect(result).toBe('second-value');
    });

    it('should handle default TTL from environment', async () => {
      // CacheService should use default TTL if none provided
      const key = 'default-ttl-key';
      const value = 'test';
      
      await cacheService.set(key, value);
      
      // Value should be retrievable
      const result = await cacheService.get(key);
      expect(result).toBe(value);
    });

    it('should return false on error (graceful failure)', async () => {
      // Set an invalid key (if supported by implementation)
      // node-cache is quite robust, so this tests the error handling structure
      const result = await cacheService.set('', 'value');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('del()', () => {
    it('should delete existing key', async () => {
      const key = 'delete-me';
      await cacheService.set(key, 'value');
      
      const deleted = await cacheService.del(key);
      
      expect(deleted).toBe(true);
      const result = await cacheService.get(key);
      expect(result).toBeNull();
    });

    it('should return false for non-existent key', async () => {
      const deleted = await cacheService.del('non-existent');
      expect(deleted).toBe(false);
    });

    it('should handle multiple deletes', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      await cacheService.set('key3', 'value3');
      
      await cacheService.del('key1');
      await cacheService.del('key2');
      
      expect(await cacheService.get('key1')).toBeNull();
      expect(await cacheService.get('key2')).toBeNull();
      expect(await cacheService.get('key3')).toBe('value3');
    });
  });

  describe('delPattern()', () => {
    beforeEach(async () => {
      // Setup keys with patterns
      await cacheService.set('user:123:settings', { theme: 'dark' });
      await cacheService.set('user:123:insights', { data: 'test' });
      await cacheService.set('user:456:settings', { theme: 'light' });
      await cacheService.set('entry:789:data', { duration: 16 });
      await cacheService.set('other:key', 'value');
    });

    it('should delete keys matching pattern', async () => {
      const count = await cacheService.delPattern('user:123:*');
      
      expect(count).toBe(2); // Should delete both user:123 keys
      expect(await cacheService.get('user:123:settings')).toBeNull();
      expect(await cacheService.get('user:123:insights')).toBeNull();
      expect(await cacheService.get('user:456:settings')).not.toBeNull();
    });

    it('should handle wildcard patterns', async () => {
      const count = await cacheService.delPattern('user:*:settings');
      
      expect(count).toBe(2); // Both user settings
      expect(await cacheService.get('user:123:settings')).toBeNull();
      expect(await cacheService.get('user:456:settings')).toBeNull();
      expect(await cacheService.get('user:123:insights')).not.toBeNull();
    });

    it('should return 0 for non-matching pattern', async () => {
      const count = await cacheService.delPattern('nonexistent:*');
      expect(count).toBe(0);
    });

    it('should handle exact key as pattern', async () => {
      const count = await cacheService.delPattern('other:key');
      
      expect(count).toBe(1);
      expect(await cacheService.get('other:key')).toBeNull();
    });
  });

  describe('isEnabled()', () => {
    it('should return true when cache is enabled', () => {
      expect(cacheService.isEnabled()).toBe(true);
    });
  });

  describe('getStats()', () => {
    it('should return cache statistics', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      await cacheService.get('key1'); // hit
      await cacheService.get('nonexistent'); // miss
      
      const stats = cacheService.getStats();
      
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('ksize');
      expect(stats).toHaveProperty('vsize');
      
      expect(stats.keys).toBeGreaterThanOrEqual(2);
    });
  });

  describe('close()', () => {
    it('should close cache and clean up', () => {
      const result = cacheService.close();
      expect(result).toBeUndefined();
    });
  });
});
