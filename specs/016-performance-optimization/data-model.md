# Data Model: Performance Optimization

**Feature**: 016-performance-optimization  
**Date**: October 26, 2025  
**Status**: Complete

## Overview

This document defines the data structures and relationships for the performance optimization feature. The focus is on cache layer entities and enhanced database indexing. No changes to existing Entry or Settings schemas are required.

---

## 1. Cached Settings Entity

### Description
User settings stored in Redis cache to eliminate repeated database queries for timeFormat and measurementSystem preferences.

### Structure
```javascript
{
  // Cache Key: fasting:v1:settings:{userId}
  userId: ObjectId,           // MongoDB ObjectId as string
  timeFormat: String,          // "12h" | "24h"
  measurementSystem: String,   // "imperial" | "metric"
  _id: ObjectId,              // Settings document _id (for invalidation)
  cachedAt: Number            // Unix timestamp (for debugging)
}
```

### Cache Metadata
- **TTL**: 3600 seconds (1 hour)
- **Key Format**: `fasting:v1:settings:{userId}`
- **Storage Format**: JSON string
- **Invalidation Trigger**: Settings update via API

### Example Redis Entry
```
KEY: fasting:v1:settings:507f1f77bcf86cd799439011
VALUE: {"userId":"507f1f77bcf86cd799439011","timeFormat":"12h","measurementSystem":"imperial","_id":"507f1f77bcf86cd799439012","cachedAt":1729900000}
TTL: 3600 seconds
```

### Validation Rules
- `userId` must be valid MongoDB ObjectId string
- `timeFormat` must be "12h" or "24h"
- `measurementSystem` must be "imperial" or "metric"
- `cachedAt` must be valid Unix timestamp

### State Transitions
```
[Database] → [Cache Population] → [Cached (1 hour)]
                                     ↓
                                [Settings Update] → [Invalidation] → [Cache Empty]
                                     ↓
                                [Cache Population] (on next read)
```

---

## 2. Cached Insights Entity

### Description
Calculated entry insights stored in Redis cache to avoid expensive aggregation pipeline re-execution for unchanged data.

### Structure
```javascript
{
  // Cache Key: fasting:v1:insights:{userId}:{entryId}
  userId: ObjectId,              // MongoDB ObjectId as string
  entryId: ObjectId,             // Entry document _id
  
  // Insight fields (calculated values)
  isLongestThisMonth: Boolean,   // Is this the longest fast this month?
  rank: Number,                  // Historical rank (1 = best)
  totalEntries: Number,          // Total entries for context
  averageDuration: Number,       // Average fasting duration (hours)
  comparisonToAverage: Number,   // Difference from average (hours)
  typicalBreakfastTime: Number,  // Most common hour (0-23)
  contributesToStreak: Boolean,  // Is part of current streak?
  isBestDay: Boolean,            // Personal record flag
  
  // Metadata
  calculatedAt: Number,          // Unix timestamp
  entryDate: String              // ISO date for debugging
}
```

### Cache Metadata
- **TTL**: 1800 seconds (30 minutes)
- **Key Format**: `fasting:v1:insights:{userId}:{entryId}`
- **Storage Format**: JSON string
- **Invalidation Triggers**:
  - Entry update (this entry)
  - Entry deletion (this entry)
  - New entry creation (affects historical rank, averages)
  - Entry update for same user (affects historical rank, averages)

### Example Redis Entry
```
KEY: fasting:v1:insights:507f1f77bcf86cd799439011:507f1f77bcf86cd799439013
VALUE: {"userId":"507f1f77bcf86cd799439011","entryId":"507f1f77bcf86cd799439013","isLongestThisMonth":true,"rank":3,"totalEntries":145,"averageDuration":16.5,"comparisonToAverage":2.5,"typicalBreakfastTime":8,"contributesToStreak":true,"isBestDay":false,"calculatedAt":1729900000,"entryDate":"2025-10-26"}
TTL: 1800 seconds
```

### Validation Rules
- `userId` and `entryId` must be valid MongoDB ObjectId strings
- `rank` must be positive integer ≥ 1
- `totalEntries` must be positive integer ≥ 1
- `averageDuration` must be positive number
- `typicalBreakfastTime` must be integer 0-23
- Boolean fields must be true/false
- `calculatedAt` must be valid Unix timestamp
- `entryDate` must be ISO 8601 date string

### State Transitions
```
[Entry Created] → [Insights Calculated] → [Cached (30 min)]
                                             ↓
                                        [Entry Mutation (any user entry)] → [Invalidation] → [Cache Empty]
                                             ↓
                                        [Insights Recalculated] (on next read)
```

### Relationship to Entry Entity
- **1:1 Relationship**: Each entry has at most one cached insight
- **Cascade Invalidation**: Entry deletion invalidates insight cache
- **Dependency**: Insights depend on Entry collection aggregate data

---

## 3. Performance Metric Entity

### Description
Logged performance data for monitoring and analysis. Stored in application logs (not database).

### Structure
```javascript
{
  timestamp: Number,           // Unix timestamp
  metricType: String,          // "page-load" | "api-response" | "cache-operation"
  
  // Page Load Metrics
  page: String,                // Page identifier (e.g., "/entries/[id]")
  loadTime: Number,            // Total page load time (ms)
  queryCount: Number,          // Database queries executed
  cacheHits: Number,           // Cache hits during request
  cacheMisses: Number,         // Cache misses during request
  
  // Core Web Vitals
  lcp: Number,                 // Largest Contentful Paint (ms)
  fid: Number,                 // First Input Delay (ms)
  cls: Number,                 // Cumulative Layout Shift (score)
  ttfb: Number,                // Time to First Byte (ms)
  
  // API Metrics
  endpoint: String,            // API route (e.g., "/api/entries")
  method: String,              // HTTP method (GET, POST, etc.)
  statusCode: Number,          // HTTP status code
  responseTime: Number,        // Total response time (ms)
  
  // Cache Metrics
  operation: String,           // "get" | "set" | "delete"
  key: String,                 // Cache key (sanitized, no PII)
  success: Boolean,            // Operation success flag
  duration: Number,            // Operation duration (ms)
  
  // Context
  userId: String,              // User identifier (hashed/anonymized)
  sessionId: String            // Session identifier
}
```

### Storage
- **Format**: Structured JSON logs
- **Destination**: Console (stdout) → Log aggregation service
- **Retention**: 30 days (configurable)

### Aggregation Queries
Performance metrics enable analysis:
- P50, P95, P99 response times
- Cache hit rate percentage
- Query count trends
- Core Web Vitals compliance tracking

### Example Log Entry
```json
{
  "timestamp": 1729900000,
  "metricType": "page-load",
  "page": "/entries/507f1f77bcf86cd799439013",
  "loadTime": 387,
  "queryCount": 2,
  "cacheHits": 2,
  "cacheMisses": 0,
  "lcp": 1240,
  "fid": 45,
  "cls": 0.02,
  "userId": "hash_507f1f77bcf86cd799439011",
  "sessionId": "sess_abc123"
}
```

---

## 4. Enhanced Database Indexes

### Entry Collection Indexes

#### Existing Indexes (Keep)
```javascript
// Primary lookup by user and date
{ userId: 1, date: 1 }

// Unique constraint (one entry per user per date)
{ userId: 1, date: 1 } unique: true
```

#### New Indexes (Add)
```javascript
// Index 1: Duration-based queries (for insights)
{
  userId: 1,
  fastingDuration: -1  // Descending for "longest" queries
}
// Use Case: Finding longest fasts, historical ranking
// Query: Entry.find({ userId }).sort({ fastingDuration: -1 }).limit(1)

// Index 2: Covering index for insights aggregation
{
  userId: 1,
  date: -1,
  fastingDuration: 1,
  endTime: 1
}
// Use Case: Aggregation pipeline for insights (index-only query)
// Query: Aggregation pipeline fetching multiple insights
```

### Settings Collection Indexes

#### Existing Indexes (Sufficient)
```javascript
// Unique user settings lookup
{ userId: 1 } unique: true
```

No additional indexes needed - settings are always queried by userId only.

### Index Build Strategy

**Migration Script**: `migrations/004-add-performance-indexes.js`

```javascript
module.exports = {
  async up(db) {
    // Index 1: Duration-based
    await db.collection('entries').createIndex(
      { userId: 1, fastingDuration: -1 },
      { 
        name: 'userId_fastingDuration',
        background: true  // Non-blocking build
      }
    );
    
    // Index 2: Covering index
    await db.collection('entries').createIndex(
      { userId: 1, date: -1, fastingDuration: 1, endTime: 1 },
      { 
        name: 'userId_date_insights',
        background: true
      }
    );
    
    console.log('Performance indexes created successfully');
  },
  
  async down(db) {
    await db.collection('entries').dropIndex('userId_fastingDuration');
    await db.collection('entries').dropIndex('userId_date_insights');
    console.log('Performance indexes dropped');
  }
};
```

### Index Impact Analysis

| Index | Size Estimate | Query Speedup | Write Impact |
|-------|--------------|---------------|--------------|
| `userId_fastingDuration` | ~5MB per 10K entries | 5-10x | Minimal (~2% slower writes) |
| `userId_date_insights` | ~8MB per 10K entries | 10-20x (covering) | Minimal (~3% slower writes) |

**Trade-off Justification**: Read performance improvements (10-20x) far outweigh minor write overhead (<5%).

---

## 5. Cache Key Patterns

### Key Format Specification

```
{namespace}:{version}:{entity}:{userId}[:{resourceId}]
```

### Implemented Keys

| Entity | Key Pattern | Example | TTL |
|--------|------------|---------|-----|
| Settings | `fasting:v1:settings:{userId}` | `fasting:v1:settings:507f1f77bcf86cd799439011` | 3600s |
| Insights | `fasting:v1:insights:{userId}:{entryId}` | `fasting:v1:insights:507f1f77bcf86cd799439011:507f1f77bcf86cd799439013` | 1800s |

### Key Naming Conventions
- **Namespace**: `fasting` (application identifier)
- **Version**: `v1` (allows cache schema changes)
- **Entity**: Singular lowercase (settings, insights)
- **IDs**: MongoDB ObjectId strings (24 hex characters)

### Cache Invalidation Patterns

**Pattern 1: Single Key Invalidation**
```javascript
// Settings update → invalidate specific user
await cache.del(`fasting:v1:settings:${userId}`);
```

**Pattern 2: Wildcard Invalidation** (all insights for user)
```javascript
// Entry mutation → invalidate all user insights
const keys = await cache.keys(`fasting:v1:insights:${userId}:*`);
await cache.del(...keys);
```

**Pattern 3: Targeted Invalidation** (specific insight)
```javascript
// Single entry update → invalidate specific insight
await cache.del(`fasting:v1:insights:${userId}:${entryId}`);
```

---

## 6. Entity Relationships

### Overview Diagram
```
┌─────────────────┐
│  User (Auth)    │
└────────┬────────┘
         │ 1:1
         │
    ┌────▼───────────────────┐
    │  Settings (MongoDB)    │
    │  + Cache (Redis)       │◄──── Cache Key: fasting:v1:settings:{userId}
    └────────────────────────┘      TTL: 1 hour
         │
         │ 1:N
         │
    ┌────▼───────────────────┐
    │  Entry (MongoDB)       │
    │  + Indexes             │
    └────┬───────────────────┘
         │ 1:1
         │
    ┌────▼───────────────────┐
    │  Cached Insights       │◄──── Cache Key: fasting:v1:insights:{userId}:{entryId}
    │  (Redis)               │      TTL: 30 minutes
    └────────────────────────┘
         │
         │ (logged)
         │
    ┌────▼───────────────────┐
    │  Performance Metrics   │
    │  (Logs)                │
    └────────────────────────┘
```

### Relationship Rules

1. **Settings ↔ Cache**
   - Settings document has at most one cache entry
   - Cache invalidated on settings update
   - Cache miss triggers database read

2. **Entry ↔ Cached Insights**
   - Each entry may have cached insights
   - Entry deletion must invalidate insights
   - Entry update invalidates insights for all user entries (affects aggregates)

3. **Cache ↔ Performance Metrics**
   - All cache operations logged for monitoring
   - Cache hit/miss rates calculated from logs
   - No direct relationship (logs are write-only)

---

## 7. Data Migration

### Migration Path

**No schema migrations required** - only index additions.

### Migration Script Details

**File**: `migrations/004-add-performance-indexes.js`

**Execution**:
```bash
node scripts/run-migration.js 004-add-performance-indexes
```

**Validation**:
```javascript
// Verify indexes created
db.entries.getIndexes();

// Expected output includes:
// { userId: 1, fastingDuration: -1 }
// { userId: 1, date: -1, fastingDuration: 1, endTime: 1 }
```

**Rollback**:
```bash
# If needed
db.entries.dropIndex('userId_fastingDuration');
db.entries.dropIndex('userId_date_insights');
```

### Index Build Timing
- **Estimated Duration**: 5-10 minutes for 100K entries
- **Recommended Window**: Low-traffic hours (2-4 AM)
- **Background Build**: Yes (non-blocking)
- **Monitoring**: Track `db.currentOp()` for progress

---

## 8. Data Validation

### Cache Data Validation

```javascript
// Settings cache validation
function validateCachedSettings(data) {
  if (!data.userId || !ObjectId.isValid(data.userId)) {
    throw new Error('Invalid userId');
  }
  if (!['12h', '24h'].includes(data.timeFormat)) {
    throw new Error('Invalid timeFormat');
  }
  if (!['imperial', 'metric'].includes(data.measurementSystem)) {
    throw new Error('Invalid measurementSystem');
  }
  return true;
}

// Insights cache validation
function validateCachedInsights(data) {
  if (!ObjectId.isValid(data.userId) || !ObjectId.isValid(data.entryId)) {
    throw new Error('Invalid userId or entryId');
  }
  if (typeof data.rank !== 'number' || data.rank < 1) {
    throw new Error('Invalid rank');
  }
  if (typeof data.averageDuration !== 'number' || data.averageDuration < 0) {
    throw new Error('Invalid averageDuration');
  }
  if (data.typicalBreakfastTime < 0 || data.typicalBreakfastTime > 23) {
    throw new Error('Invalid typicalBreakfastTime');
  }
  return true;
}
```

### Index Usage Validation

```javascript
// Verify query uses index
const explain = await Entry.find({ userId, fastingDuration: { $gte: 16 } })
  .sort({ fastingDuration: -1 })
  .explain('executionStats');

console.log(explain.executionStats.executionStages.indexName);
// Expected: "userId_fastingDuration"
```

---

## Summary

### New Data Structures
1. **Cached Settings**: Redis cache for user preferences (1-hour TTL)
2. **Cached Insights**: Redis cache for calculated entry insights (30-min TTL)
3. **Performance Metrics**: Structured logs for monitoring
4. **Database Indexes**: Two new compound indexes on Entry collection

### No Schema Changes
- Entry model: No changes to fields or structure
- Settings model: No changes to fields or structure
- Only additions: Redis cache layer + MongoDB indexes

### Key Design Decisions
- **Cache-aside pattern**: Simple, reliable, graceful fallback
- **Conservative TTLs**: Balance freshness and performance
- **Synchronous invalidation**: Data consistency priority
- **Covering indexes**: Enable index-only queries for aggregations

### Testing Validation Points
- Cache hit/miss behavior
- Invalidation triggers work correctly
- Index usage verified via explain()
- Graceful fallback when Redis unavailable
- Data consistency after mutations

---

**Data Model Phase Complete** | Ready for Contract Generation
