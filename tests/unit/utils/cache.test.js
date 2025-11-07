/**
 * SimpleCache Unit Tests
 * Tests for in-memory caching utility with TTL support
 */

import { SimpleCache } from '@/lib/utils/cache';

describe('SimpleCache', () => {
  let cache;

  beforeEach(() => {
    cache = new SimpleCache(100); // 100ms TTL for faster tests
  });

  afterEach(() => {
    cache.clear();
  });

  describe('get/set operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing keys', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should store complex objects', () => {
      const obj = { id: 1, name: 'Test', nested: { value: 42 } };
      cache.set('obj', obj);
      expect(cache.get('obj')).toEqual(obj);
    });

    it('should store arrays', () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set('arr', arr);
      expect(cache.get('arr')).toEqual(arr);
    });
  });

  describe('TTL expiration', () => {
    it('should return undefined for expired keys', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not expire keys before TTL', async () => {
      cache.set('key1', 'value1');
      
      // Wait less than TTL
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      expect(cache.get('key1')).toBe('value1');
    });

    it('should handle multiple keys with different timestamps', async () => {
      cache.set('key1', 'value1');
      
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      cache.set('key2', 'value2');

      // key1 should expire, key2 should still be valid
      await new Promise((resolve) => setTimeout(resolve, 75));

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('clear operation', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });

    it('should work with empty cache', () => {
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('has operation', () => {
    it('should return true for existing keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      cache.set('key1', 'value1');
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('delete operation', () => {
    it('should remove specific key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should handle deleting non-existent keys', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
    });
  });

  describe('size tracking', () => {
    it('should track cache size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.delete('key1');
      expect(cache.size()).toBe(1);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should not count expired entries', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size()).toBe(2);

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Accessing size should trigger cleanup of expired entries
      expect(cache.size()).toBe(0);
    });
  });

  describe('constructor', () => {
    it('should accept custom TTL', () => {
      const customCache = new SimpleCache(5000);
      customCache.set('key1', 'value1');
      expect(customCache.get('key1')).toBe('value1');
    });

    it('should use default TTL if not specified', () => {
      const defaultCache = new SimpleCache();
      defaultCache.set('key1', 'value1');
      expect(defaultCache.get('key1')).toBe('value1');
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      cache.set('key1', null);
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle undefined values', () => {
      cache.set('key1', undefined);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should handle empty string keys', () => {
      cache.set('', 'value1');
      expect(cache.get('')).toBe('value1');
    });

    it('should handle numeric keys', () => {
      cache.set(123, 'value1');
      expect(cache.get(123)).toBe('value1');
    });
  });
});
