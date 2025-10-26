# Quickstart: Performance Optimization Implementation

**Feature**: 016-performance-optimization  
**Date**: October 26, 2025  
**Estimated Duration**: 2-3 days

## Overview

This guide provides a step-by-step implementation path for the performance optimization feature. Follow these steps in order for the smoothest implementation experience.

---

## Prerequisites

### Required Knowledge
- JavaScript/Node.js ES6+
- Next.js App Router and Server Components
- MongoDB and Mongoose ODM
- Redis basics (cache operations)
- Jest testing framework

### Required Tools
- Node.js 18+ installed
- MongoDB 4.0+ running
- Redis 6+ installed (local or Docker)
- Git for version control

### Environment Setup

**1. Install Redis locally**

**Windows (via Chocolatey):**
```powershell
choco install redis-64
redis-server
```

**macOS (via Homebrew):**
```bash
brew install redis
brew services start redis
```

**Docker (all platforms):**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**2. Verify Redis connection**
```bash
redis-cli ping
# Expected: PONG
```

**3. Install ioredis package**
```bash
npm install ioredis@^5.3.0
```

**4. Set environment variables**

Create or update `.env.local`:
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL_SETTINGS=3600
CACHE_TTL_INSIGHTS=1800
ENABLE_PERFORMANCE_LOGGING=true
```

---

## Implementation Roadmap

### Phase 1: Foundation (Day 1, Morning)
1. Create cache service
2. Add database indexes
3. Write cache service tests

### Phase 2: Settings Caching (Day 1, Afternoon)
4. Create settings service
5. Write settings service tests
6. Update existing settings usage

### Phase 3: Insights Optimization (Day 2, Morning)
7. Refactor insights service with aggregation pipeline
8. Write insights tests
9. Add insights caching

### Phase 4: Integration (Day 2, Afternoon)
10. Update entry details page
11. Update API routes with cache invalidation
12. Add performance monitoring

### Phase 5: Validation (Day 3)
13. Run full test suite
14. Performance benchmarking
15. Documentation updates

---

## Step-by-Step Implementation

### Step 1: Create Cache Service (30 min)

**File**: `src/lib/services/cacheService.js`

```javascript
const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.enabled = true;
    this.stats = { hits: 0, misses: 0, errors: 0 };
    
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 50, 2000);
        },
        lazyConnect: true,
      });
      
      this.redis.on('error', (err) => {
        console.error('Redis error:', err.message);
        this.enabled = false;
      });
      
      this.redis.on('connect', () => {
        console.log('Redis connected');
        this.enabled = true;
      });
    } catch (err) {
      console.error('Failed to initialize Redis:', err);
      this.enabled = false;
    }
  }
  
  async get(key) {
    if (!this.enabled) return null;
    
    try {
      const value = await this.redis.get(key);
      if (value) this.stats.hits++;
      else this.stats.misses++;
      return value;
    } catch (err) {
      console.error('Cache get error:', err);
      this.stats.errors++;
      return null;
    }
  }
  
  async set(key, value, ttl) {
    if (!this.enabled) return;
    
    try {
      await this.redis.setex(key, ttl, value);
    } catch (err) {
      console.error('Cache set error:', err);
      this.stats.errors++;
    }
  }
  
  async del(key) {
    if (!this.enabled) return;
    
    try {
      await this.redis.del(key);
    } catch (err) {
      console.error('Cache del error:', err);
      this.stats.errors++;
    }
  }
  
  async delPattern(pattern) {
    if (!this.enabled) return 0;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      await this.redis.del(...keys);
      return keys.length;
    } catch (err) {
      console.error('Cache delPattern error:', err);
      this.stats.errors++;
      return 0;
    }
  }
  
  isEnabled() {
    return this.enabled;
  }
  
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0
    };
  }
}

// Singleton instance
let instance;
module.exports = function getCacheService() {
  if (!instance) {
    instance = new CacheService();
  }
  return instance;
};
```

**Verify**: Run `node -e "require('./src/lib/services/cacheService')()"` - should connect to Redis

---

### Step 2: Add Database Indexes (20 min)

**File**: `migrations/004-add-performance-indexes.js`

```javascript
const mongoose = require('mongoose');
const { connectDB } = require('../src/lib/db');

module.exports = {
  async up() {
    await connectDB();
    const db = mongoose.connection.db;
    
    console.log('Creating performance indexes...');
    
    // Index 1: Duration-based queries
    await db.collection('entries').createIndex(
      { userId: 1, fastingDuration: -1 },
      { name: 'userId_fastingDuration', background: true }
    );
    console.log('✓ Created userId_fastingDuration index');
    
    // Index 2: Covering index for insights
    await db.collection('entries').createIndex(
      { userId: 1, date: -1, fastingDuration: 1, endTime: 1 },
      { name: 'userId_date_insights', background: true }
    );
    console.log('✓ Created userId_date_insights index');
    
    console.log('Performance indexes created successfully');
  },
  
  async down() {
    await connectDB();
    const db = mongoose.connection.db;
    
    await db.collection('entries').dropIndex('userId_fastingDuration');
    await db.collection('entries').dropIndex('userId_date_insights');
    console.log('Performance indexes dropped');
  }
};
```

**Run migration**:
```bash
node scripts/run-migration.js 004-add-performance-indexes
```

**Verify indexes**:
```bash
node -e "
  const mongoose = require('mongoose');
  require('./src/lib/db').connectDB().then(() => {
    mongoose.connection.db.collection('entries').getIndexes().then(console.log);
  });
"
```

---

### Step 3: Write Cache Service Tests (45 min)

**File**: `tests/unit/services/cacheService.test.js`

```javascript
const getCacheService = require('../../../src/lib/services/cacheService');

describe('CacheService', () => {
  let cache;
  
  beforeEach(() => {
    cache = getCacheService();
  });
  
  afterEach(async () => {
    // Clean up test keys
    await cache.delPattern('test:*');
  });
  
  describe('get/set operations', () => {
    test('set and get returns cached value', async () => {
      await cache.set('test:key1', 'value1', 60);
      const result = await cache.get('test:key1');
      expect(result).toBe('value1');
    });
    
    test('get returns null for non-existent key', async () => {
      const result = await cache.get('test:nonexistent');
      expect(result).toBeNull();
    });
    
    test('cached value expires after TTL', async () => {
      await cache.set('test:expiring', 'value', 1); // 1 second TTL
      
      const immediate = await cache.get('test:expiring');
      expect(immediate).toBe('value');
      
      // Wait 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const expired = await cache.get('test:expiring');
      expect(expired).toBeNull();
    }, 10000);
  });
  
  describe('delete operations', () => {
    test('del removes key from cache', async () => {
      await cache.set('test:key2', 'value2', 60);
      await cache.del('test:key2');
      const result = await cache.get('test:key2');
      expect(result).toBeNull();
    });
    
    test('delPattern removes all matching keys', async () => {
      await cache.set('test:user1:entry1', 'a', 60);
      await cache.set('test:user1:entry2', 'b', 60);
      await cache.set('test:user2:entry1', 'c', 60);
      
      const deleted = await cache.delPattern('test:user1:*');
      expect(deleted).toBe(2);
      
      const remaining = await cache.get('test:user2:entry1');
      expect(remaining).toBe('c');
    });
  });
  
  describe('stats tracking', () => {
    test('tracks cache hits and misses', async () => {
      await cache.set('test:stats', 'value', 60);
      
      await cache.get('test:stats'); // hit
      await cache.get('test:miss'); // miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });
  
  describe('graceful degradation', () => {
    test('operations succeed when Redis unavailable', async () => {
      cache.enabled = false;
      
      await expect(cache.get('test:key')).resolves.toBeNull();
      await expect(cache.set('test:key', 'value', 60)).resolves.toBeUndefined();
      await expect(cache.del('test:key')).resolves.toBeUndefined();
    });
  });
});
```

**Run tests**:
```bash
npm test tests/unit/services/cacheService.test.js
```

---

### Step 4: Create Settings Service (45 min)

**File**: `src/lib/services/settingsService.js`

```javascript
const Settings = require('../models/Settings');
const getCacheService = require('./cacheService');

const CACHE_KEY_PREFIX = 'fasting:v1:settings';
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SETTINGS || '3600');

class SettingsService {
  constructor() {
    this.cache = getCacheService();
  }
  
  async getSettings(userId) {
    const cacheKey = `${CACHE_KEY_PREFIX}:${userId}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch from database
    const settings = await Settings.findOne({ userId }).lean();
    
    if (settings) {
      // Populate cache
      await this.cache.set(cacheKey, JSON.stringify(settings), CACHE_TTL);
    }
    
    return settings;
  }
  
  async updateSettings(userId, updates) {
    // Update database
    const updated = await Settings.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true }
    ).lean();
    
    // Invalidate cache
    const cacheKey = `${CACHE_KEY_PREFIX}:${userId}`;
    await this.cache.del(cacheKey);
    
    return updated;
  }
  
  async createSettings(userId, initialSettings) {
    const settings = await Settings.create({
      userId,
      ...initialSettings
    });
    
    return settings.toObject();
  }
}

// Singleton instance
let instance;
module.exports = function getSettingsService() {
  if (!instance) {
    instance = new SettingsService();
  }
  return instance;
};
```

---

### Step 5: Refactor Insights Service (2-3 hours)

**File**: `src/lib/services/entryInsightsService.js` (refactored)

This is the most complex step. Key changes:
1. Replace 5 separate queries with single aggregation pipeline
2. Add caching with invalidation
3. Maintain backward-compatible API

**See**: `contracts/service-api.md` for full implementation details

**Key aggregation pipeline structure**:
```javascript
const pipeline = [
  { $match: { userId: mongoose.Types.ObjectId(userId) } },
  { $facet: {
    longestThisMonth: [/* ... */],
    historicalRank: [/* ... */],
    averageDuration: [/* ... */],
    typicalBreakfast: [/* ... */]
  }}
];
```

---

### Step 6: Update Entry Details Page (30 min)

**File**: `src/app/entries/[id]/page.js`

**Before**:
```javascript
async function EntryDetailsPage({ params }) {
  const entry = await Entry.findById(params.id);
  const settings = await Settings.findOne({ userId: entry.userId });
  const insights = await calculateInsights(entry.userId, params.id); // 5 queries
  
  // Total: 7+ queries
}
```

**After**:
```javascript
const getSettingsService = require('@/lib/services/settingsService');
const getEntryInsightsService = require('@/lib/services/entryInsightsService');

export const revalidate = 300; // 5 minutes

async function EntryDetailsPage({ params }) {
  const settingsService = getSettingsService();
  const insightsService = getEntryInsightsService();
  
  // Fetch entry
  const entry = await Entry.findById(params.id).lean();
  
  // Parallel fetches with caching
  const [settings, insights] = await Promise.all([
    settingsService.getSettings(entry.userId),      // Cached
    insightsService.calculateInsights(entry.userId, params.id) // Cached
  ]);
  
  // Total: 1 query (entry) + 2 cache hits = 3 queries first time, 1 query after
  
  return <EntryDetails entry={entry} settings={settings} insights={insights} />;
}
```

---

### Step 7: Update API Routes with Cache Invalidation (45 min)

**File**: `src/app/api/entries/route.js` (POST)

```javascript
import { revalidatePath } from 'next/cache';
const getEntryInsightsService = require('@/lib/services/entryInsightsService');

export async function POST(request) {
  const data = await request.json();
  const insightsService = getEntryInsightsService();
  
  // Create entry
  const entry = await Entry.create(data);
  
  // Invalidate all insights for user (new entry affects aggregates)
  await insightsService.invalidateInsightsForUser(entry.userId);
  
  // Revalidate Next.js pages
  revalidatePath(`/entries/${entry._id}`);
  revalidatePath('/entries');
  
  return Response.json(entry);
}
```

**Similarly update**:
- `PUT /api/entries/:id` (invalidate user insights)
- `DELETE /api/entries/:id` (invalidate user insights)
- `PUT /api/settings` (handled by settingsService)

---

### Step 8: Add Performance Monitoring (30 min)

**File**: `src/lib/utils/performanceLogger.js`

```javascript
export function logPerformance(metric) {
  if (process.env.ENABLE_PERFORMANCE_LOGGING !== 'true') return;
  
  const log = {
    timestamp: Date.now(),
    metric: metric.name,
    value: metric.value,
    page: metric.page || 'unknown',
    userId: metric.userId || 'anonymous'
  };
  
  console.log('[PERFORMANCE]', JSON.stringify(log));
  
  // Warn on slow operations
  if (metric.name === 'page-load' && metric.value > 500) {
    console.warn(`Slow page load: ${metric.page} took ${metric.value}ms`);
  }
}

export function withPerformanceTracking(fn, label) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      
      logPerformance({
        name: label,
        value: duration
      });
      
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`${label} failed after ${duration}ms:`, err);
      throw err;
    }
  };
}
```

---

### Step 9: Run Full Test Suite (1 hour)

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- tests/unit/services
npm test -- tests/integration

# Generate coverage report
npm test -- --coverage
```

**Target Coverage**: 80%+ for new code

---

### Step 10: Performance Benchmarking (1 hour)

Create benchmark script:

**File**: `scripts/benchmark-performance.js`

```javascript
const mongoose = require('mongoose');
const { connectDB } = require('../src/lib/db');
const getSettingsService = require('../src/lib/services/settingsService');
const getEntryInsightsService = require('../src/lib/services/entryInsightsService');
const getCacheService = require('../src/lib/services/cacheService');

async function benchmark() {
  await connectDB();
  
  const settingsService = getSettingsService();
  const insightsService = getEntryInsightsService();
  const cache = getCacheService();
  
  const testUserId = '507f1f77bcf86cd799439011'; // Replace with real user
  const testEntryId = '507f1f77bcf86cd799439013'; // Replace with real entry
  
  console.log('Starting performance benchmark...\n');
  
  // Clear cache
  await cache.delPattern('fasting:*');
  
  // Benchmark 1: Settings retrieval (cold cache)
  console.log('1. Settings retrieval (cold cache):');
  let start = Date.now();
  await settingsService.getSettings(testUserId);
  console.log(`   ${Date.now() - start}ms\n`);
  
  // Benchmark 2: Settings retrieval (warm cache)
  console.log('2. Settings retrieval (warm cache):');
  start = Date.now();
  await settingsService.getSettings(testUserId);
  console.log(`   ${Date.now() - start}ms\n`);
  
  // Benchmark 3: Insights calculation (cold cache)
  console.log('3. Insights calculation (cold cache):');
  start = Date.now();
  await insightsService.calculateInsights(testUserId, testEntryId);
  console.log(`   ${Date.now() - start}ms\n`);
  
  // Benchmark 4: Insights calculation (warm cache)
  console.log('4. Insights calculation (warm cache):');
  start = Date.now();
  await insightsService.calculateInsights(testUserId, testEntryId);
  console.log(`   ${Date.now() - start}ms\n`);
  
  // Cache stats
  const stats = cache.getStats();
  console.log('Cache Statistics:');
  console.log(`  Hits: ${stats.hits}`);
  console.log(`  Misses: ${stats.misses}`);
  console.log(`  Hit Rate: ${stats.hitRate.toFixed(2)}%`);
  
  await mongoose.disconnect();
}

benchmark().catch(console.error);
```

**Run benchmark**:
```bash
node scripts/benchmark-performance.js
```

**Expected Results**:
- Settings (cold): <100ms
- Settings (warm): <10ms
- Insights (cold): <150ms
- Insights (warm): <10ms

---

## Validation Checklist

### Functional Tests
- [ ] Settings caching works correctly
- [ ] Insights caching works correctly
- [ ] Cache invalidation triggers properly
- [ ] Graceful fallback when Redis unavailable
- [ ] All unit tests pass
- [ ] All integration tests pass

### Performance Tests
- [ ] Entry details page loads in <500ms
- [ ] API endpoints respond in <200ms
- [ ] Settings cache hit rate >80%
- [ ] Insights cache hit rate >70%
- [ ] Database query count reduced by 60%+

### Database Tests
- [ ] Indexes created successfully
- [ ] Queries use indexes (verify with .explain())
- [ ] Index usage improves query performance

### Operational Tests
- [ ] Redis connection errors handled gracefully
- [ ] Application works without Redis
- [ ] Cache invalidation doesn't cause errors
- [ ] Performance logging works correctly

---

## Troubleshooting

### Redis Connection Issues

**Problem**: "ECONNREFUSED" error
**Solution**:
```bash
# Check Redis is running
redis-cli ping

# Start Redis
# Windows: redis-server
# macOS: brew services start redis
# Docker: docker start <redis-container>
```

### Cache Not Populating

**Problem**: Cache always misses
**Solution**:
- Check Redis connection: `cache.isEnabled()`
- Verify cache keys: `redis-cli KEYS fasting:*`
- Check TTL values are positive
- Review logs for cache errors

### Slow Query Performance

**Problem**: Queries still slow after indexes
**Solution**:
```javascript
// Check if index is being used
const explain = await Entry.find({ userId, fastingDuration: { $gte: 16 } })
  .sort({ fastingDuration: -1 })
  .explain('executionStats');

console.log(explain.executionStats.executionStages.indexName);
// Should show: "userId_fastingDuration"
```

### Tests Failing

**Problem**: Tests timeout or fail
**Solution**:
- Ensure Redis is running for tests
- Increase Jest timeout: `jest.setTimeout(10000)`
- Clear test cache: `await cache.delPattern('test:*')`

---

## Next Steps

After completing this quickstart:

1. **Monitor Performance**: Track metrics in production
2. **Iterate on Cache TTLs**: Adjust based on actual usage patterns
3. **Expand Caching**: Consider caching other frequently accessed data
4. **Add Circuit Breaker**: Implement for production resilience
5. **Set Up Alerts**: Monitor cache hit rates and query performance

---

## Additional Resources

- **Research Document**: `research.md` - Detailed technology decisions
- **Data Model**: `data-model.md` - Cache entity structures
- **API Contracts**: `contracts/` - Detailed API specifications
- **Feature Spec**: `spec.md` - Original requirements

---

**Quickstart Complete!** 🚀

You now have a fully optimized, cached application with:
- ✅ 60% fewer database queries
- ✅ Sub-500ms page loads
- ✅ Sub-200ms API responses
- ✅ Graceful Redis fallback
- ✅ Comprehensive test coverage

**Estimated total implementation time**: 2-3 days for experienced developer.
