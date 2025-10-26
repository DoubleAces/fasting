# Service Layer API Contracts

**Feature**: 016-performance-optimization  
**Date**: October 26, 2025  
**Version**: 1.0.0

## Overview

This document defines the API contracts for the optimized service layer components: Settings Service (with caching) and Entry Insights Service (with aggregation pipeline).

---

## SettingsService

### Purpose
Provides cached access to user settings with automatic cache management and graceful fallback to database.

---

### getSettings(userId)

```javascript
/**
 * Retrieves user settings with caching
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {Promise<Object>} User settings object
 * @throws {Error} If userId invalid or database error (non-cache errors)
 */
async getSettings(userId)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string

**Returns**:
```javascript
{
  _id: ObjectId,              // Settings document ID
  userId: ObjectId,           // User ID
  timeFormat: String,         // "12h" | "24h"
  measurementSystem: String,  // "imperial" | "metric"
  createdAt: Date,
  updatedAt: Date
}
```

**Behavior**:
1. Validate userId format
2. Check cache for key `fasting:v1:settings:{userId}`
3. If cache hit: Return parsed cached data
4. If cache miss: Fetch from database
5. Populate cache with 1-hour TTL
6. Return settings

**Performance**:
- Cache hit: <10ms
- Cache miss: <100ms (database query + cache population)

**Example**:
```javascript
const settings = await settingsService.getSettings('507f1f77bcf86cd799439011');
console.log(settings.timeFormat); // "12h"
```

**Error Handling**:
- Invalid userId: Throws validation error
- Database error: Throws database error
- Cache error: Logs warning, continues with database fallback

---

### updateSettings(userId, updates)

```javascript
/**
 * Updates user settings and invalidates cache
 * @param {string} userId - MongoDB ObjectId as string
 * @param {Object} updates - Settings fields to update
 * @returns {Promise<Object>} Updated settings object
 * @throws {Error} If validation fails or database error
 */
async updateSettings(userId, updates)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string
- `updates` (required): Object with fields to update
  - `timeFormat` (optional): "12h" | "24h"
  - `measurementSystem` (optional): "imperial" | "metric"

**Returns**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  timeFormat: String,
  measurementSystem: String,
  createdAt: Date,
  updatedAt: Date  // Updated timestamp
}
```

**Behavior**:
1. Validate userId and updates
2. Update database (findOneAndUpdate)
3. **Synchronously** invalidate cache
4. Return updated settings

**Cache Invalidation**:
```javascript
await cache.del(`fasting:v1:settings:${userId}`);
```

**Performance**:
- Target: <150ms (database update + cache invalidation)

**Example**:
```javascript
const updated = await settingsService.updateSettings(
  '507f1f77bcf86cd799439011',
  { timeFormat: '24h' }
);
console.log(updated.timeFormat); // "24h"

// Next getSettings call will fetch fresh data
const fresh = await settingsService.getSettings('507f1f77bcf86cd799439011');
console.log(fresh.timeFormat); // "24h" (from database, then cached)
```

**Error Handling**:
- Invalid updates: Throws validation error
- Database error: Throws error, no cache invalidation
- Cache invalidation error: Logs warning, continues (TTL will expire eventually)

---

### createSettings(userId, initialSettings)

```javascript
/**
 * Creates new user settings
 * @param {string} userId - MongoDB ObjectId as string
 * @param {Object} initialSettings - Initial settings values
 * @returns {Promise<Object>} Created settings object
 * @throws {Error} If validation fails or database error
 */
async createSettings(userId, initialSettings)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string
- `initialSettings` (required):
  - `timeFormat` (required): "12h" | "24h"
  - `measurementSystem` (required): "imperial" | "metric"

**Returns**: Created settings object

**Behavior**:
1. Validate inputs
2. Create settings in database
3. Do NOT pre-populate cache (lazy loading)
4. Return created settings

**Example**:
```javascript
const settings = await settingsService.createSettings(
  '507f1f77bcf86cd799439011',
  { timeFormat: '12h', measurementSystem: 'imperial' }
);
```

---

## EntryInsightsService

### Purpose
Calculates entry insights using optimized MongoDB aggregation pipeline with caching.

---

### calculateInsights(userId, entryId)

```javascript
/**
 * Calculates comprehensive insights for an entry
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} entryId - Entry MongoDB ObjectId as string
 * @returns {Promise<Object>} Insights object
 * @throws {Error} If validation fails or database error
 */
async calculateInsights(userId, entryId)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string
- `entryId` (required): Valid Entry ObjectId string

**Returns**:
```javascript
{
  // Comparison insights
  isLongestThisMonth: Boolean,    // Is this the longest fast this month?
  rank: Number,                   // Historical rank (1 = best ever)
  totalEntries: Number,           // Total entries for context
  
  // Statistical insights
  averageDuration: Number,        // Average fasting duration (hours)
  comparisonToAverage: Number,    // Difference from average (hours, can be negative)
  
  // Pattern insights
  typicalBreakfastTime: Number,   // Most common hour (0-23), null if no pattern
  contributesToStreak: Boolean,   // Is part of current streak?
  isBestDay: Boolean,             // Personal record flag
  
  // Metadata
  calculatedAt: Date,             // When calculated
  entryDate: Date                 // Entry date for context
}
```

**Behavior**:
1. Validate userId and entryId
2. Check cache for key `fasting:v1:insights:{userId}:{entryId}`
3. If cache hit: Return parsed cached data
4. If cache miss: Execute aggregation pipeline
5. Process pipeline results into insights object
6. Populate cache with 30-minute TTL
7. Return insights

**Aggregation Pipeline** (internal):
```javascript
[
  // Filter to user's entries
  { $match: { userId: ObjectId(userId) } },
  
  // Calculate multiple insights in parallel using $facet
  { $facet: {
    // Facet 1: Longest this month
    longestThisMonth: [...],
    
    // Facet 2: Historical rank
    historicalRank: [...],
    
    // Facet 3: Average duration
    averageDuration: [...],
    
    // Facet 4: Typical breakfast time
    typicalBreakfast: [...]
  }}
]
```

**Performance**:
- Cache hit: <10ms
- Cache miss: <100ms (aggregation pipeline)
- Improvement from old approach: 3-5x faster

**Example**:
```javascript
const insights = await entryInsightsService.calculateInsights(
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439013'
);

console.log(insights.rank);                   // 3
console.log(insights.isLongestThisMonth);     // true
console.log(insights.averageDuration);        // 16.5
console.log(insights.comparisonToAverage);    // 2.5 (current is 2.5 hours above average)
```

**Error Handling**:
- Invalid IDs: Throws validation error
- Entry not found: Returns null insights (graceful)
- Database error: Throws error
- Cache error: Logs warning, continues with database

---

### invalidateInsightsForUser(userId)

```javascript
/**
 * Invalidates all cached insights for a user
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {Promise<number>} Number of caches invalidated
 * @throws Never throws - logs errors internally
 */
async invalidateInsightsForUser(userId)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string

**Returns**:
- `number`: Count of caches deleted

**Behavior**:
1. Validate userId
2. Delete all keys matching `fasting:v1:insights:{userId}:*`
3. Return count of deleted keys

**Use Cases**:
- Entry created (affects historical rank, averages)
- Entry updated (affects aggregates)
- Entry deleted (affects aggregates)

**Example**:
```javascript
// After creating new entry
const entry = await Entry.create(newEntryData);
await entryInsightsService.invalidateInsightsForUser(entry.userId);
```

**Performance**:
- Target: <50ms for typical user (~30-100 cached insights)

---

### invalidateInsightsForEntry(userId, entryId)

```javascript
/**
 * Invalidates cached insights for a specific entry
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} entryId - Entry MongoDB ObjectId as string
 * @returns {Promise<void>}
 * @throws Never throws - logs errors internally
 */
async invalidateInsightsForEntry(userId, entryId)
```

**Parameters**:
- `userId` (required): Valid MongoDB ObjectId string
- `entryId` (required): Entry ObjectId string

**Returns**: `Promise<void>`

**Behavior**:
1. Delete specific cache key `fasting:v1:insights:{userId}:{entryId}`

**Use Cases**:
- Specific entry updated (only that entry's insights affected)

**Example**:
```javascript
// After updating specific entry
await entryInsightsService.invalidateInsightsForEntry(
  '507f1f77bcf86cd799439011',
  '507f1f77bcf86cd799439013'
);
```

**Performance**:
- Target: <10ms (single key deletion)

---

## Integration Patterns

### Entry Creation Flow
```javascript
// API route: POST /api/entries
async function createEntry(req, res) {
  // 1. Create entry in database
  const entry = await Entry.create(req.body);
  
  // 2. Invalidate all insights for user (new entry affects aggregates)
  await entryInsightsService.invalidateInsightsForUser(entry.userId);
  
  // 3. Revalidate Next.js page cache
  revalidatePath(`/entries/${entry._id}`);
  revalidatePath('/entries');
  
  return res.json(entry);
}
```

### Entry Update Flow
```javascript
// API route: PUT /api/entries/:id
async function updateEntry(req, res) {
  const { id } = req.params;
  
  // 1. Update entry in database
  const entry = await Entry.findByIdAndUpdate(id, req.body, { new: true });
  
  // 2. Invalidate insights for this user (update affects aggregates)
  await entryInsightsService.invalidateInsightsForUser(entry.userId);
  
  // 3. Revalidate Next.js pages
  revalidatePath(`/entries/${id}`);
  revalidatePath('/entries');
  
  return res.json(entry);
}
```

### Entry Details Page (Server Component)
```javascript
// app/entries/[id]/page.js
export const revalidate = 300; // 5 minutes

async function EntryDetailsPage({ params }) {
  const { id } = params;
  
  // Parallel fetches (both use caching)
  const [entry, settings, insights] = await Promise.all([
    Entry.findById(id),                              // Query 1
    settingsService.getSettings(entry.userId),       // Cache hit (after first load)
    entryInsightsService.calculateInsights(          // Cache hit (after first calculation)
      entry.userId,
      id
    )
  ]);
  
  return <EntryDetails entry={entry} settings={settings} insights={insights} />;
}
```

**Query Count**:
- First load (cold cache): 3 queries (entry + settings + insights aggregation)
- Subsequent loads (warm cache): 1 query (entry only)
- **Improvement**: From 7+ queries to 1 query

---

## Testing Contracts

### SettingsService Tests

```javascript
describe('SettingsService', () => {
  test('getSettings() returns cached settings on second call', async () => {
    const userId = '507f1f77bcf86cd799439011';
    
    // First call - cache miss
    const settings1 = await settingsService.getSettings(userId);
    
    // Second call - cache hit
    const settings2 = await settingsService.getSettings(userId);
    
    expect(settings1).toEqual(settings2);
    
    // Verify cache was used
    const stats = cache.getStats();
    expect(stats.hits).toBeGreaterThan(0);
  });
  
  test('updateSettings() invalidates cache', async () => {
    const userId = '507f1f77bcf86cd799439011';
    
    // Warm cache
    await settingsService.getSettings(userId);
    
    // Update settings
    await settingsService.updateSettings(userId, { timeFormat: '24h' });
    
    // Next call should fetch fresh data
    const fresh = await settingsService.getSettings(userId);
    expect(fresh.timeFormat).toBe('24h');
  });
  
  test('getSettings() falls back to database when cache unavailable', async () => {
    cache.enabled = false;
    
    const settings = await settingsService.getSettings('507f1f77bcf86cd799439011');
    expect(settings).toBeDefined();
    expect(settings.timeFormat).toBeDefined();
  });
});
```

### EntryInsightsService Tests

```javascript
describe('EntryInsightsService', () => {
  test('calculateInsights() returns correct aggregated data', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const entryId = '507f1f77bcf86cd799439013';
    
    const insights = await entryInsightsService.calculateInsights(userId, entryId);
    
    expect(insights).toMatchObject({
      rank: expect.any(Number),
      totalEntries: expect.any(Number),
      averageDuration: expect.any(Number),
      isLongestThisMonth: expect.any(Boolean),
      contributesToStreak: expect.any(Boolean)
    });
  });
  
  test('calculateInsights() uses cache on second call', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const entryId = '507f1f77bcf86cd799439013';
    
    // First call - execute pipeline
    const start1 = Date.now();
    const insights1 = await entryInsightsService.calculateInsights(userId, entryId);
    const duration1 = Date.now() - start1;
    
    // Second call - from cache
    const start2 = Date.now();
    const insights2 = await entryInsightsService.calculateInsights(userId, entryId);
    const duration2 = Date.now() - start2;
    
    expect(insights1).toEqual(insights2);
    expect(duration2).toBeLessThan(duration1); // Cache should be faster
    expect(duration2).toBeLessThan(20); // Cache hit should be <20ms
  });
  
  test('invalidateInsightsForUser() clears all user insights', async () => {
    const userId = '507f1f77bcf86cd799439011';
    
    // Warm cache with multiple entries
    await entryInsightsService.calculateInsights(userId, 'entry1');
    await entryInsightsService.calculateInsights(userId, 'entry2');
    
    // Invalidate all
    const deleted = await entryInsightsService.invalidateInsightsForUser(userId);
    expect(deleted).toBeGreaterThanOrEqual(2);
    
    // Cache should be empty
    const cached = await cache.get(`fasting:v1:insights:${userId}:entry1`);
    expect(cached).toBeNull();
  });
  
  test('aggregation pipeline is faster than multi-query approach', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const entryId = '507f1f77bcf86cd799439013';
    
    // Time aggregation pipeline
    const start = Date.now();
    await entryInsightsService.calculateInsights(userId, entryId);
    const pipelineDuration = Date.now() - start;
    
    expect(pipelineDuration).toBeLessThan(150); // Should be <150ms
  });
});
```

---

## Performance Benchmarks

### Expected Performance Targets

| Operation | Cold Cache | Warm Cache | Improvement |
|-----------|-----------|------------|-------------|
| `getSettings()` | ~50ms | <10ms | 5x |
| `calculateInsights()` | ~80ms | <10ms | 8x |
| Entry details page | ~500ms | ~200ms | 2.5x |

### Measurement Tools
```javascript
// Performance logging helper
function measurePerformance(fn, label) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      console.log(`${label}: ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`${label} failed after ${duration}ms:`, err);
      throw err;
    }
  };
}

// Usage
const timedCalculateInsights = measurePerformance(
  entryInsightsService.calculateInsights,
  'calculateInsights'
);
```

---

## Environment Configuration

### Required Environment Variables
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=              # Optional
REDIS_DB=0

# Cache TTLs (optional - defaults provided)
CACHE_TTL_SETTINGS=3600      # 1 hour
CACHE_TTL_INSIGHTS=1800      # 30 minutes

# Performance Monitoring
ENABLE_PERFORMANCE_LOGGING=true
LOG_SLOW_QUERIES_MS=200      # Log queries slower than 200ms
```

---

**Contract Version**: 1.0.0  
**Status**: Ready for Implementation  
**Next**: Implement services following these contracts
