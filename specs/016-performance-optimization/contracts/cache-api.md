# Cache Service API Contract

**Feature**: 016-performance-optimization  
**Date**: October 26, 2025  
**Version**: 1.0.0

## Overview

This document defines the API contract for the Redis cache service layer. The cache service provides a unified interface for caching operations with graceful degradation when Redis is unavailable.

---

## CacheService Class

### Constructor

```javascript
/**
 * Creates a new CacheService instance
 * @constructor
 */
constructor()
```

**Behavior**:
- Initializes Redis client connection
- Sets up error handlers for graceful degradation
- Enables/disables caching based on Redis availability

**Side Effects**:
- Establishes Redis connection (async, non-blocking)
- Logs connection status

---

### get(key)

```javascript
/**
 * Retrieves a value from the cache
 * @param {string} key - Cache key to retrieve
 * @returns {Promise<string|null>} Cached value as string, or null if not found/error
 * @throws Never throws - returns null on error
 */
async get(key)
```

**Parameters**:
- `key` (required): String cache key following pattern `namespace:version:entity:userId[:resourceId]`

**Returns**:
- `string`: Cached value if found
- `null`: If key not found, Redis unavailable, or error occurred

**Behavior**:
- Checks if caching is enabled
- Returns null immediately if caching disabled
- Attempts to fetch value from Redis
- Logs errors but doesn't throw
- Returns null on any error (graceful fallback)

**Examples**:
```javascript
// Success case
const settings = await cache.get('fasting:v1:settings:507f1f77bcf86cd799439011');
// Returns: '{"userId":"507f1f77bcf86cd799439011","timeFormat":"12h",...}'

// Cache miss
const insights = await cache.get('fasting:v1:insights:user123:entry456');
// Returns: null

// Redis unavailable
const data = await cache.get('fasting:v1:settings:user123');
// Returns: null (logs error internally)
```

**Performance**:
- Target: <5ms for cache hit
- Timeout: 100ms maximum before returning null

---

### set(key, value, ttl)

```javascript
/**
 * Stores a value in the cache with TTL
 * @param {string} key - Cache key
 * @param {string} value - Value to store (must be string, use JSON.stringify for objects)
 * @param {number} ttl - Time-to-live in seconds
 * @returns {Promise<void>}
 * @throws Never throws - logs errors internally
 */
async set(key, value, ttl)
```

**Parameters**:
- `key` (required): String cache key
- `value` (required): String value to cache (caller must JSON.stringify objects)
- `ttl` (required): Integer time-to-live in seconds (1-86400)

**Returns**:
- `Promise<void>`: Resolves when complete (or immediately if Redis unavailable)

**Behavior**:
- Checks if caching is enabled
- Returns immediately if caching disabled (no-op)
- Stores value with TTL in Redis using SETEX
- Logs errors but doesn't throw
- Non-blocking: doesn't wait for confirmation

**Examples**:
```javascript
// Cache settings (1 hour TTL)
await cache.set(
  'fasting:v1:settings:507f1f77bcf86cd799439011',
  JSON.stringify({ userId: '507f1f77bcf86cd799439011', timeFormat: '12h' }),
  3600
);

// Cache insights (30 min TTL)
await cache.set(
  'fasting:v1:insights:user123:entry456',
  JSON.stringify({ rank: 1, averageDuration: 16.5 }),
  1800
);
```

**Performance**:
- Target: <10ms for cache write
- Non-blocking: doesn't wait for confirmation
- Fire-and-forget: write failures don't block caller

**Validation**:
- `ttl` must be positive integer
- `value` must be string (validation error if not)
- `key` must be non-empty string

---

### del(key)

```javascript
/**
 * Deletes a value from the cache
 * @param {string} key - Cache key to delete
 * @returns {Promise<void>}
 * @throws Never throws - logs errors internally
 */
async del(key)
```

**Parameters**:
- `key` (required): String cache key to delete

**Returns**:
- `Promise<void>`: Resolves when complete (or immediately if Redis unavailable)

**Behavior**:
- Checks if caching is enabled
- Returns immediately if caching disabled (no-op)
- Deletes key from Redis using DEL
- Logs errors but doesn't throw
- Idempotent: safe to call even if key doesn't exist

**Examples**:
```javascript
// Invalidate settings cache
await cache.del('fasting:v1:settings:507f1f77bcf86cd799439011');

// Invalidate specific insight
await cache.del('fasting:v1:insights:user123:entry456');
```

**Performance**:
- Target: <5ms for cache deletion
- Non-blocking: doesn't wait for confirmation

---

### delPattern(pattern)

```javascript
/**
 * Deletes all keys matching a pattern
 * @param {string} pattern - Redis key pattern (supports * wildcard)
 * @returns {Promise<number>} Number of keys deleted
 * @throws Never throws - returns 0 on error
 */
async delPattern(pattern)
```

**Parameters**:
- `pattern` (required): Redis key pattern with wildcards (e.g., `fasting:v1:insights:user123:*`)

**Returns**:
- `number`: Count of keys deleted (0 if none found or error)

**Behavior**:
- Checks if caching is enabled
- Returns 0 immediately if caching disabled
- Finds all keys matching pattern using SCAN (not KEYS - production safe)
- Deletes matched keys in batches
- Logs errors but doesn't throw

**Examples**:
```javascript
// Invalidate all insights for a user
const deleted = await cache.delPattern('fasting:v1:insights:507f1f77bcf86cd799439011:*');
console.log(`Deleted ${deleted} insight caches`);

// Invalidate all settings (admin operation)
const deleted = await cache.delPattern('fasting:v1:settings:*');
```

**Performance**:
- Target: <50ms for <100 keys
- Uses SCAN for production safety (doesn't block Redis)

**Warning**: Use sparingly - pattern matching can be expensive for large key sets.

---

### isEnabled()

```javascript
/**
 * Checks if caching is currently enabled
 * @returns {boolean} True if Redis is available and caching enabled
 */
isEnabled()
```

**Returns**:
- `boolean`: True if caching is operational, false otherwise

**Use Cases**:
- Health checks
- Debugging
- Conditional logic (though methods handle this internally)

**Example**:
```javascript
if (cache.isEnabled()) {
  console.log('Cache is operational');
} else {
  console.log('Cache is disabled - using database fallback');
}
```

---

### getStats()

```javascript
/**
 * Returns cache operation statistics
 * @returns {Object} Statistics object
 */
getStats()
```

**Returns**:
```javascript
{
  hits: number,        // Total cache hits
  misses: number,      // Total cache misses
  errors: number,      // Total errors encountered
  hitRate: number,     // Hit rate percentage (0-100)
  enabled: boolean     // Current enabled status
}
```

**Use Cases**:
- Performance monitoring
- Cache effectiveness analysis
- Debugging cache issues

**Example**:
```javascript
const stats = cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`);
console.log(`Total operations: ${stats.hits + stats.misses}`);
```

---

## Error Handling

### Philosophy
**Fail Open**: Cache failures should never break application functionality. All methods are designed to gracefully degrade.

### Error States

| State | Behavior | Recovery |
|-------|----------|----------|
| **Redis Unavailable** | Methods return null/void, caching disabled | Auto-retry connection every 5 seconds |
| **Connection Timeout** | Operation returns null/void after 100ms | Logged, caching disabled temporarily |
| **Invalid Key Format** | Validation error logged, operation continues | None needed (invalid keys ignored) |
| **Memory Full** | Write operations fail silently | Redis LRU eviction handles cleanup |
| **Network Error** | Operation fails, caching disabled | Connection retry logic |

### Error Logging

All errors logged with context:
```javascript
{
  timestamp: Date.now(),
  error: 'Redis connection timeout',
  operation: 'get',
  key: 'fasting:v1:settings:507f1f77bcf86cd799439011',
  duration: 105
}
```

---

## Performance Characteristics

### Latency Targets

| Operation | Target | P95 | Timeout |
|-----------|--------|-----|---------|
| `get()` | <5ms | <10ms | 100ms |
| `set()` | <10ms | <20ms | 100ms |
| `del()` | <5ms | <10ms | 100ms |
| `delPattern()` | <50ms | <100ms | 500ms |

### Throughput
- Expected: 10,000+ ops/sec (Redis default)
- Application load: ~100 ops/sec (typical)
- Headroom: 100x capacity

### Memory Usage
- Estimated per user: ~1KB (settings) + ~5KB (insights) = ~6KB
- For 1000 users: ~6MB total
- Redis allocation: 100MB minimum recommended

---

## Cache Key Standards

### Format
```
{namespace}:{version}:{entity}:{userId}[:{resourceId}]
```

### Components
- **namespace**: `fasting` (fixed)
- **version**: `v1` (increment when cache schema changes)
- **entity**: Singular lowercase entity name (`settings`, `insights`)
- **userId**: MongoDB ObjectId as string (24 hex chars)
- **resourceId**: Optional - specific resource identifier (entryId, etc.)

### Examples
```
fasting:v1:settings:507f1f77bcf86cd799439011
fasting:v1:insights:507f1f77bcf86cd799439011:507f1f77bcf86cd799439013
```

### Validation
- Total key length: <200 characters
- No spaces or special characters except `:` separator
- IDs must be valid MongoDB ObjectIds (24 hex characters)

---

## Thread Safety

### Concurrent Access
- Redis operations are atomic at the command level
- Multiple simultaneous `get()` calls are safe
- Race conditions possible between read-modify-write sequences

### Cache Stampede Protection
Not handled at service level - caller responsibility:
```javascript
// Example: Single-flight pattern
const inflightRequests = new Map();

async function getCachedDataWithStampede(key, fetchFn) {
  if (inflightRequests.has(key)) {
    return await inflightRequests.get(key);
  }
  
  const promise = (async () => {
    const cached = await cache.get(key);
    if (cached) return JSON.parse(cached);
    
    const fresh = await fetchFn();
    await cache.set(key, JSON.stringify(fresh), 3600);
    return fresh;
  })();
  
  inflightRequests.set(key, promise);
  try {
    return await promise;
  } finally {
    inflightRequests.delete(key);
  }
}
```

---

## Testing Contract

### Unit Test Requirements

```javascript
describe('CacheService', () => {
  test('get() returns cached value when available', async () => {
    await cache.set('test:key', 'value', 60);
    const result = await cache.get('test:key');
    expect(result).toBe('value');
  });
  
  test('get() returns null when key not found', async () => {
    const result = await cache.get('nonexistent:key');
    expect(result).toBeNull();
  });
  
  test('get() returns null when Redis unavailable', async () => {
    cache.enabled = false;
    const result = await cache.get('test:key');
    expect(result).toBeNull();
  });
  
  test('set() stores value with TTL', async () => {
    await cache.set('test:key', 'value', 60);
    const result = await cache.get('test:key');
    expect(result).toBe('value');
    
    // Verify TTL
    const ttl = await redis.ttl('test:key');
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
  });
  
  test('del() removes key from cache', async () => {
    await cache.set('test:key', 'value', 60);
    await cache.del('test:key');
    const result = await cache.get('test:key');
    expect(result).toBeNull();
  });
  
  test('delPattern() removes all matching keys', async () => {
    await cache.set('test:user:1', 'a', 60);
    await cache.set('test:user:2', 'b', 60);
    const deleted = await cache.delPattern('test:user:*');
    expect(deleted).toBe(2);
  });
  
  test('operations succeed when Redis unavailable (graceful degradation)', async () => {
    // Disable Redis
    await redis.disconnect();
    
    // All operations should complete without throwing
    await expect(cache.get('test:key')).resolves.toBeNull();
    await expect(cache.set('test:key', 'value', 60)).resolves.toBeUndefined();
    await expect(cache.del('test:key')).resolves.toBeUndefined();
  });
});
```

### Integration Test Requirements
- Test with real Redis instance
- Verify TTL expiration behavior
- Test concurrent access patterns
- Measure actual performance metrics

---

## Dependencies

### Required
- **ioredis**: ^5.3.0 (Redis client)
- **Node.js**: >=18.0.0

### Environment Variables
```
REDIS_HOST=localhost          # Redis server host
REDIS_PORT=6379               # Redis server port
REDIS_PASSWORD=               # Optional password
REDIS_DB=0                    # Database number (0-15)
REDIS_TLS=false               # Enable TLS connection
REDIS_CONNECT_TIMEOUT=5000    # Connection timeout (ms)
```

---

## Usage Examples

### Basic Usage
```javascript
const CacheService = require('./lib/services/cacheService');
const cache = new CacheService();

// Store data
await cache.set('fasting:v1:settings:user123', JSON.stringify({ timeFormat: '12h' }), 3600);

// Retrieve data
const cached = await cache.get('fasting:v1:settings:user123');
const settings = cached ? JSON.parse(cached) : null;

// Invalidate
await cache.del('fasting:v1:settings:user123');
```

### With Graceful Fallback
```javascript
async function getSettings(userId) {
  const key = `fasting:v1:settings:${userId}`;
  
  // Try cache first
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  
  // Cache miss or Redis unavailable - fetch from database
  const settings = await Settings.findOne({ userId });
  
  // Populate cache for next time (fire-and-forget)
  cache.set(key, JSON.stringify(settings), 3600);
  
  return settings;
}
```

### Batch Invalidation
```javascript
async function invalidateUserInsights(userId) {
  const pattern = `fasting:v1:insights:${userId}:*`;
  const deleted = await cache.delPattern(pattern);
  console.log(`Invalidated ${deleted} insight caches for user ${userId}`);
}
```

---

**Contract Version**: 1.0.0  
**Status**: Ready for Implementation  
**Next**: Implement `src/lib/services/cacheService.js` following this contract
