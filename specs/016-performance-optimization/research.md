# Research: Performance Optimization Technologies & Patterns

**Feature**: 016-performance-optimization  
**Date**: October 26, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing comprehensive performance optimizations in the fasting tracker application. Research focuses on Redis caching patterns, MongoDB aggregation pipeline optimization, Next.js caching strategies, and performance monitoring approaches.

---

## 1. Redis Client Selection (ioredis vs node-redis)

### Decision: **ioredis**

### Rationale
- **Cluster support**: Better out-of-box support for Redis Cluster (future scalability)
- **Promise-based API**: Native async/await support (cleaner code)
- **Better error handling**: More granular error events and reconnection strategies
- **Pipeline support**: Efficient batching of multiple commands
- **TypeScript support**: Better type definitions
- **Active maintenance**: Regular updates and bug fixes
- **Performance**: Slightly better performance in benchmarks for our use case (simple get/set with TTL)

### Alternatives Considered

**node-redis v4**
- Pros: Official Redis client, good documentation
- Cons: More verbose API, less intuitive error handling
- **Rejected because**: ioredis provides cleaner API and better operational tooling for monitoring/debugging

**redis-om**
- Pros: ORM-like abstractions for Redis
- Cons: Adds unnecessary complexity for simple key-value caching
- **Rejected because**: Our caching needs are simple (get/set/delete with TTL), don't need ORM features

### Implementation Notes
```javascript
// Basic ioredis setup with graceful fallback
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 50, 2000); // Exponential backoff
  },
  lazyConnect: true, // Don't connect immediately
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Application continues with database fallback
});
```

---

## 2. Cache Key Naming Convention

### Decision: **Namespaced hierarchical keys with versioning**

### Rationale
- **Namespace isolation**: Prevents key collisions between features
- **Easy invalidation**: Can delete all keys for a user or type
- **Debugging friendly**: Clear structure visible in Redis CLI
- **Version support**: Allows cache schema changes without full flush

### Pattern
```
{namespace}:{version}:{entity}:{userId}[:{resourceId}]
```

### Examples
```
fasting:v1:settings:user123
fasting:v1:insights:user123:entry456
fasting:v1:streak:user123
```

### Alternatives Considered

**Flat keys** (e.g., `settings_user123`)
- Pros: Simpler
- Cons: Harder to query, no namespace isolation
- **Rejected because**: Difficult to debug and manage at scale

**Hash-based keys** (e.g., MD5 of parameters)
- Pros: Fixed length
- Cons: Not human-readable, debugging nightmare
- **Rejected because**: Developer experience and debugging are priorities

---

## 3. MongoDB Aggregation Pipeline Strategy

### Decision: **Single optimized pipeline with $facet for multiple insights**

### Rationale
- **Single round-trip**: All insights calculated in one query
- **Index utilization**: Aggregation optimizer uses indexes effectively
- **Maintainable**: Pipeline stages are self-documenting
- **Performance**: 5-10x faster than separate queries

### Pipeline Structure
```javascript
const pipeline = [
  // Stage 1: Filter to user's entries
  { $match: { userId: new ObjectId(userId) } },
  
  // Stage 2: Calculate multiple facets in parallel
  { $facet: {
    // Longest duration this month
    longestThisMonth: [
      { $match: { 
        date: { 
          $gte: startOfMonth, 
          $lte: endOfMonth 
        }
      }},
      { $sort: { fastingDuration: -1 } },
      { $limit: 1 },
      { $project: { fastingDuration: 1 } }
    ],
    
    // Historical rank
    historicalRank: [
      { $sort: { fastingDuration: -1 } },
      { $group: {
        _id: null,
        entries: { $push: { _id: '$_id', duration: '$fastingDuration' }}
      }}
    ],
    
    // Average duration
    averageDuration: [
      { $group: {
        _id: null,
        avg: { $avg: '$fastingDuration' },
        count: { $sum: 1 }
      }}
    ],
    
    // Typical breakfast time
    typicalBreakfast: [
      { $match: { endTime: { $exists: true } } },
      { $group: {
        _id: { $hour: '$endTime' },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]
  }}
];
```

### Alternatives Considered

**Separate optimized queries**
- Pros: Simpler individual queries
- Cons: 5+ round trips to database, network overhead
- **Rejected because**: Network latency compounds with multiple queries

**Map-reduce**
- Pros: More powerful for complex aggregations
- Cons: Slower than aggregation pipeline, deprecated in MongoDB 5.0+
- **Rejected because**: Aggregation pipeline is faster and officially recommended

**Client-side calculation**
- Pros: No database load
- Cons: Must fetch all entries (network overhead), CPU intensive
- **Rejected because**: 365+ entries per user would be significant data transfer

### Performance Expectations
- Current (5 queries): ~150-200ms
- Aggregation pipeline: ~30-50ms
- **Improvement**: 3-5x faster

---

## 4. Cache Invalidation Strategy

### Decision: **Synchronous invalidation on mutations with cache-aside pattern**

### Rationale
- **Data consistency**: No stale data after mutations
- **Simple mental model**: Write = invalidate cache
- **Predictable behavior**: Cache always reflects latest data after write
- **TTL safety net**: Even if invalidation fails, cache expires eventually

### Pattern: Cache-Aside (Lazy Loading)
```javascript
// Read pattern
async function getSettings(userId) {
  // 1. Check cache
  const cached = await cache.get(`fasting:v1:settings:${userId}`);
  if (cached) return JSON.parse(cached);
  
  // 2. Cache miss: fetch from DB
  const settings = await Settings.findOne({ userId });
  
  // 3. Populate cache
  await cache.setex(
    `fasting:v1:settings:${userId}`,
    3600, // 1 hour TTL
    JSON.stringify(settings)
  );
  
  return settings;
}

// Write pattern
async function updateSettings(userId, newSettings) {
  // 1. Update database
  const updated = await Settings.findOneAndUpdate(
    { userId },
    newSettings,
    { new: true }
  );
  
  // 2. Invalidate cache synchronously
  await cache.del(`fasting:v1:settings:${userId}`);
  
  return updated;
}
```

### Alternatives Considered

**Write-through caching**
- Pros: Cache always up-to-date
- Cons: Write latency increased, cache write failures block writes
- **Rejected because**: Adds complexity and write latency

**Eventual consistency (async invalidation)**
- Pros: Faster write operations
- Cons: Stale data windows, race conditions
- **Rejected because**: User-facing data must be immediately consistent

**Cache warming on write**
- Pros: Cache always populated
- Cons: Unnecessary if data not read immediately
- **Rejected because**: Lazy loading is more efficient (read-heavy workload)

### Cache Stampede Protection
```javascript
// Use single-flight pattern to prevent stampede
const inflightRequests = new Map();

async function getSettingsWithStampedeProtection(userId) {
  const key = `settings:${userId}`;
  
  // Check if request already in flight
  if (inflightRequests.has(key)) {
    return await inflightRequests.get(key);
  }
  
  // Start new request
  const promise = fetchAndCacheSettings(userId);
  inflightRequests.set(key, promise);
  
  try {
    return await promise;
  } finally {
    inflightRequests.delete(key);
  }
}
```

---

## 5. MongoDB Index Strategy

### Decision: **Compound indexes on access patterns + covering indexes**

### Rationale
- **Query optimization**: Indexes match actual query patterns
- **Index-only queries**: Covering indexes avoid document fetches
- **Balanced approach**: Not over-indexing (write performance impact)

### Index Definitions

**Entry Collection**
```javascript
// Existing: { userId: 1, date: 1 } - KEEP (used for date range queries)
// Existing: { userId: 1, date: 1 } unique - KEEP (data integrity)

// NEW: Optimize duration-based queries (insights)
{ userId: 1, fastingDuration: -1 }

// NEW: Optimize recent entries with projections
{ userId: 1, date: -1, fastingDuration: 1, endTime: 1 }
```

**Settings Collection**
```javascript
// Existing: { userId: 1 } unique - SUFFICIENT (settings are 1:1 with user)
```

### Index Build Strategy
```javascript
// Migration script: 004-add-performance-indexes.js
db.entries.createIndex(
  { userId: 1, fastingDuration: -1 },
  { background: true } // MongoDB 4.x background build (no blocking)
);

// For MongoDB 5.0+ (rolling index builds are default)
db.entries.createIndex(
  { userId: 1, date: -1, fastingDuration: 1, endTime: 1 },
  { name: 'userId_date_insights' }
);
```

### Alternatives Considered

**Full-text indexes**
- Pros: Search capability
- Cons: Unnecessary for current use case
- **Rejected because**: No text search requirements

**Wildcard indexes**
- Pros: Flexible for unpredictable queries
- Cons: Less efficient than specific indexes
- **Rejected because**: Query patterns are well-defined

**Single-field indexes**
- Pros: Simpler
- Cons: Less efficient for compound queries
- **Rejected because**: Most queries filter by userId + another field

---

## 6. Next.js Caching Strategy

### Decision: **Incremental Static Regeneration (ISR) with on-demand revalidation**

### Rationale
- **Static-like performance**: Pre-rendered pages served from cache
- **Fresh data**: Automatic revalidation after time period
- **On-demand updates**: Manual revalidation on data mutations
- **Built-in feature**: No external dependencies

### Implementation

**Entry Details Page (Server Component)**
```javascript
// app/entries/[id]/page.js
export const revalidate = 300; // Revalidate every 5 minutes

export async function generateStaticParams() {
  // Pre-render recent entries at build time
  const recentEntries = await getRecentEntries(limit: 20);
  return recentEntries.map(entry => ({ id: entry._id.toString() }));
}

async function EntryDetailsPage({ params }) {
  const entry = await getEntry(params.id); // Uses cache service
  const insights = await getInsights(entry.userId, params.id);
  
  return <EntryDetails entry={entry} insights={insights} />;
}
```

**On-Demand Revalidation**
```javascript
// app/api/entries/route.js
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  const entry = await createEntry(data);
  
  // Revalidate entry details pages
  revalidatePath(`/entries/${entry._id}`);
  revalidatePath('/entries'); // List page
  
  return Response.json(entry);
}
```

### Alternatives Considered

**Static Site Generation (SSG) only**
- Pros: Fastest possible
- Cons: Requires full rebuild for updates
- **Rejected because**: Data changes frequently (new entries daily)

**Server-Side Rendering (SSR) only**
- Pros: Always fresh data
- Cons: Slower page loads (no caching)
- **Rejected because**: Performance is primary objective

**Client-side data fetching**
- Pros: Server load reduced
- Cons: Slower perceived performance, SEO impact
- **Rejected because**: Server Components are faster

---

## 7. Performance Monitoring Approach

### Decision: **Next.js built-in metrics + custom performance logging**

### Rationale
- **Zero config**: Next.js provides Web Vitals out-of-box
- **Comprehensive**: Covers LCP, FID, CLS, TTFB
- **Extensible**: Can add custom metrics
- **Low overhead**: Efficient data collection

### Implementation

**Web Vitals Tracking**
```javascript
// app/layout.js (Root Layout)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Custom Performance Logger**
```javascript
// lib/utils/performanceLogger.js
export function logPerformance(metric) {
  console.log({
    timestamp: Date.now(),
    metric: metric.name,
    value: metric.value,
    userId: getCurrentUserId(),
    page: window.location.pathname
  });
  
  // Send to monitoring service (future: DataDog, New Relic, etc.)
}
```

**Server-Side Performance Tracking**
```javascript
// Middleware for API routes
export function withPerformanceTracking(handler) {
  return async (req, res) => {
    const start = Date.now();
    
    try {
      const result = await handler(req, res);
      const duration = Date.now() - start;
      
      if (duration > 200) {
        console.warn(`Slow API: ${req.url} took ${duration}ms`);
      }
      
      return result;
    } finally {
      const duration = Date.now() - start;
      logServerPerformance({
        endpoint: req.url,
        method: req.method,
        duration,
        status: res.statusCode
      });
    }
  };
}
```

### Alternatives Considered

**Third-party APM (New Relic, DataDog)**
- Pros: Advanced features, dashboards
- Cons: Cost, complexity, vendor lock-in
- **Deferred**: Start with built-in tools, add if needed

**Custom analytics platform**
- Pros: Full control
- Cons: Significant development effort
- **Rejected because**: Built-in tools are sufficient for MVP

**Google Analytics**
- Pros: Free, familiar
- Cons: Privacy concerns, not performance-focused
- **Rejected because**: Next.js analytics more suitable

---

## 8. Graceful Degradation Strategy

### Decision: **Try-catch wrapper with database fallback**

### Rationale
- **Reliability**: Application works even if Redis fails
- **User experience**: No errors shown to users
- **Operational simplicity**: Redis is enhancement, not critical dependency
- **Debugging**: Clear logging of cache failures

### Implementation Pattern

```javascript
// lib/services/cacheService.js
class CacheService {
  constructor() {
    this.redis = createRedisClient();
    this.enabled = true;
    
    this.redis.on('error', () => {
      this.enabled = false; // Disable caching on errors
    });
  }
  
  async get(key) {
    if (!this.enabled) return null;
    
    try {
      return await this.redis.get(key);
    } catch (err) {
      console.error('Cache read error:', err);
      return null; // Fallback to database
    }
  }
  
  async set(key, value, ttl) {
    if (!this.enabled) return; // Skip cache writes
    
    try {
      await this.redis.setex(key, ttl, value);
    } catch (err) {
      console.error('Cache write error:', err);
      // Don't throw - cache write failures are non-fatal
    }
  }
  
  async del(key) {
    if (!this.enabled) return;
    
    try {
      await this.redis.del(key);
    } catch (err) {
      console.error('Cache delete error:', err);
      // TTL will eventually expire stale data
    }
  }
}
```

### Circuit Breaker (Future Enhancement)
```javascript
// lib/services/circuitBreaker.js
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
      }, this.timeout);
    }
  }
}
```

---

## Summary of Key Decisions

| Area | Decision | Primary Rationale |
|------|----------|------------------|
| **Redis Client** | ioredis | Better API, cluster support, active maintenance |
| **Cache Keys** | Namespaced hierarchical | Easy debugging, clear invalidation patterns |
| **Aggregation** | Single $facet pipeline | Consolidates 5+ queries into 1, uses indexes |
| **Invalidation** | Synchronous cache-aside | Data consistency, simple mental model |
| **Indexes** | Compound + covering | Matches query patterns, enables index-only queries |
| **Next.js Caching** | ISR with on-demand revalidation | Static-like speed with fresh data |
| **Monitoring** | Built-in Next.js metrics | Zero config, comprehensive, low overhead |
| **Degradation** | Try-catch with DB fallback | Reliability without complexity |

---

## Implementation Priorities

Based on research findings:

**Phase 1 (Highest Impact)**
1. Add MongoDB indexes (immediate query speedup)
2. Implement cache service with graceful fallback
3. Add settings caching (highest hit rate expected)

**Phase 2 (High Impact)**
4. Refactor insights service to use aggregation pipeline
5. Add insights caching
6. Implement cache invalidation on mutations

**Phase 3 (Monitoring)**
7. Add performance logging
8. Track Core Web Vitals
9. Monitor cache hit rates

**Phase 4 (Next.js Optimization)**
10. Configure ISR for entry details pages
11. Add on-demand revalidation
12. Optimize cache headers

---

## Testing Strategy

### Unit Tests
- Cache service: get/set/delete operations, error handling
- Settings service: caching logic, fallback behavior
- Insights service: aggregation pipeline correctness
- Index usage: verify queries use indexes (explain() output)

### Integration Tests
- End-to-end cache flow: write → invalidate → read
- Redis unavailability: verify graceful fallback
- Aggregation pipeline: compare output with multi-query approach
- Performance benchmarks: measure actual speedup

### E2E Tests
- Entry details page load time (Playwright performance API)
- API response times (measure from client)
- Cache hit rate monitoring
- Core Web Vitals measurement

---

## Risk Mitigation

### Redis Unavailability
- **Mitigation**: Graceful fallback to database queries
- **Test**: Disable Redis and verify application works

### Cache Invalidation Bugs
- **Mitigation**: Conservative TTLs, comprehensive testing
- **Test**: Mutation → immediate read should show new data

### Aggregation Pipeline Complexity
- **Mitigation**: Extensive unit tests, comparison with old approach
- **Test**: Run both approaches in parallel during migration, compare results

### Index Build Impact
- **Mitigation**: Background index builds during low traffic
- **Test**: Monitor database performance during index creation

---

**Research Phase Complete** | Ready for Phase 1: Design & Contracts
