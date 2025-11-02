# Data Model

**Feature**: 025 - Entry Details Page Enhancement  
**Date**: October 31, 2025  
**Status**: Complete

## Overview

This document defines the data entities, relationships, and computed types used in the entry details page enhancement. **No database schema changes are required** - all entities are either existing or computed on-demand.

---

## Entity Definitions

### 1. Entry (Existing - No Changes)

**Source**: `src/lib/models/Entry.js`  
**Collection**: `entries`  
**Status**: ✅ Exists - No modifications

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // Reference to User
  date: Date,                    // Fast date (indexed)
  fastDuration: Number,          // Hours (e.g., 16.5)
  startTime: Date,               // Optional: Fast start timestamp
  endTime: Date,                 // Optional: Fast end timestamp
  moodLevel: Number,             // 1-5 scale
  energyLevel: Number,           // 1-5 scale
  hungerLevel: Number,           // 1-5 scale
  notes: String,                 // Optional: User notes
  createdAt: Date,               // Auto-generated
  updatedAt: Date                // Auto-generated
}
```

**Indexes** (existing):
```javascript
{ userId: 1, date: -1 }          // Compound index for user queries
{ date: 1 }                      // Date range queries
```

**Validation Rules**:
- `userId`: Required, must be valid ObjectId
- `date`: Required, must be valid Date
- `fastDuration`: Required, must be > 0
- `moodLevel`, `energyLevel`, `hungerLevel`: Optional, 1-5 range if present
- `notes`: Optional, max 500 characters

**No Changes Required**: Existing schema has all fields needed for entry details display and insights calculation.

---

### 2. User (Existing - No Changes)

**Source**: `src/lib/models/User.js`  
**Collection**: `users`  
**Status**: ✅ Exists - No modifications

**Schema** (relevant fields):
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  settings: {
    theme: String,               // 'light' | 'dark'
    timezone: String,            // IANA timezone (e.g., 'America/New_York')
    units: String,               // 'imperial' | 'metric'
    defaultFastDuration: Number  // User's typical fast (hours)
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Usage**: User settings retrieved for:
- Timezone conversion for date display
- Default fast duration for comparison calculations
- Theme preferences (if dark mode implemented in future)

**No Changes Required**: Existing settings sufficient for feature.

---

## Computed Types (Not Stored)

### 3. EntryInsights (Computed On-Demand)

**Source**: `src/lib/services/entryInsightsService.js`  
**Computed From**: Aggregation pipeline on `entries` collection  
**Cache**: 30-minute TTL in serverCacheService  
**Status**: ✅ Service exists - Minor enhancements only

**Type Definition**:
```typescript
interface EntryInsights {
  // Existing insights (from Feature 011)
  longestThisMonth: {
    duration: number,            // Longest fast this month (hours)
    date: Date                   // Date of longest fast
  } | null,
  
  rankData: {
    rankPosition: number,        // Position in all-time ranking (1 = longest)
    totalEntries: number         // Total entries for user
  },
  
  thirtyDayAverage: number,      // Average fast duration last 30 days (hours)
  
  // NEW insights (Phase 1 enhancements)
  weekendVsWeekdayPattern: {
    isWeekend: boolean,          // True if entry is Sat/Sun
    weekendAvg: number,          // Average fast duration on weekends (hours)
    weekdayAvg: number,          // Average fast duration on weekdays (hours)
    difference: number           // weekendAvg - weekdayAvg (hours)
  } | null,
  
  deviationFromTypical: {
    typicalDuration: number,     // User's median fast duration (hours)
    deviation: number,           // Difference from median (hours)
    percentage: number           // (deviation / typical) * 100
  },
  
  streakContribution: {
    isPartOfStreak: boolean,     // True if entry contributes to active streak
    currentStreak: number,       // Number of consecutive days with fasts
    streakType: string           // 'building' | 'maintaining' | 'none'
  }
}
```

**Calculation Logic**:

**weekendVsWeekdayPattern**:
```javascript
// Aggregation pipeline facet
{
  $facet: {
    weekendVsWeekday: [
      {
        $addFields: {
          isWeekend: { 
            $in: [{ $dayOfWeek: "$date" }, [1, 7]]  // Sunday = 1, Saturday = 7
          }
        }
      },
      {
        $group: {
          _id: "$isWeekend",
          avgDuration: { $avg: "$fastDuration" }
        }
      }
    ]
  }
}
```

**deviationFromTypical**:
```javascript
// Use $percentile operator for median (requires MongoDB 7.0+)
// Fallback: Use $avg if $percentile not available
{
  $facet: {
    typicalDuration: [
      {
        $group: {
          _id: null,
          median: { 
            $median: { input: "$fastDuration", method: "approximate" }
          }
        }
      }
    ]
  }
}
```

**streakContribution**:
```javascript
// Check for consecutive days leading to current entry
// Group by date, sort ascending, check for 1-day gaps
{
  $facet: {
    streakCheck: [
      { $sort: { date: -1 } },
      {
        $group: {
          _id: null,
          dates: { $push: "$date" }
        }
      }
    ]
  }
}
// Post-aggregation: Calculate consecutive days in JavaScript
```

**Cache Key**: `insights:${userId}:${entryId}`  
**TTL**: 30 minutes  
**Invalidation**: Time-based only (manual invalidation not required for historical insights)

---

### 4. ComparisonStats (Computed On-Demand)

**Source**: Computed in page.js Server Component  
**Computed From**: EntryInsights + entry data  
**Cache**: Inherited from EntryInsights cache (30-min TTL)  
**Status**: 🆕 New computed type

**Type Definition**:
```typescript
interface ComparisonStats {
  overallAverage: {
    value: number,               // All-time average fast duration (hours)
    difference: number,          // Current entry - overall average (hours)
    percentage: number,          // (difference / overall) * 100
    trend: 'up' | 'down' | 'equal'
  },
  
  thirtyDayAverage: {
    value: number,               // Last 30 days average (hours)
    difference: number,          // Current entry - 30-day average (hours)
    percentage: number,          // (difference / 30-day) * 100
    trend: 'up' | 'down' | 'equal'
  },
  
  dayOfWeekAverage: {
    dayName: string,             // 'Monday', 'Tuesday', etc.
    value: number,               // Average for this day of week (hours)
    difference: number,          // Current entry - day-of-week average (hours)
    percentage: number,          // (difference / day-of-week) * 100
    trend: 'up' | 'down' | 'equal'
  }
}
```

**Calculation Logic** (in page.js):
```javascript
// Overall average: From existing aggregation
const overallAvg = await Entry.aggregate([
  { $match: { userId: session.user.id } },
  { $group: { _id: null, avg: { $avg: "$fastDuration" } } }
]);

// 30-day average: From EntryInsights.thirtyDayAverage
const thirtyDayAvg = insights.thirtyDayAverage;

// Day-of-week average: New aggregation
const dayOfWeek = entry.date.getDay(); // 0 = Sunday, 6 = Saturday
const dayOfWeekAvg = await Entry.aggregate([
  { $match: { userId: session.user.id } },
  {
    $addFields: {
      dayOfWeek: { $dayOfWeek: "$date" }
    }
  },
  { $match: { dayOfWeek: dayOfWeek } },
  { $group: { _id: null, avg: { $avg: "$fastDuration" } } }
]);

// Calculate differences and trends
const comparisonStats = {
  overallAverage: {
    value: overallAvg,
    difference: entry.fastDuration - overallAvg,
    percentage: ((entry.fastDuration - overallAvg) / overallAvg) * 100,
    trend: entry.fastDuration > overallAvg ? 'up' : 
           entry.fastDuration < overallAvg ? 'down' : 'equal'
  },
  // ... similar for thirtyDayAverage and dayOfWeekAverage
};
```

**Not Cached Separately**: Leverages EntryInsights cache + lightweight calculations.

---

### 5. TimelineContext (Computed On-Demand)

**Source**: Computed in page.js Server Component  
**Computed From**: Adjacent entry queries  
**Cache**: None (lightweight queries)  
**Status**: 🆕 New computed type

**Type Definition**:
```typescript
interface TimelineContext {
  previousEntry: {
    id: string,
    date: Date,
    fastDuration: number,
    daysSince: number            // Days between previous and current
  } | null,
  
  nextEntry: {
    id: string,
    date: Date,
    fastDuration: number,
    daysUntil: number            // Days between current and next
  } | null
}
```

**Query Logic**:
```javascript
// Previous entry
const previousEntry = await Entry.findOne({
  userId: session.user.id,
  date: { $lt: entry.date }
})
.sort({ date: -1 })
.limit(1)
.select('_id date fastDuration')
.lean();

// Next entry
const nextEntry = await Entry.findOne({
  userId: session.user.id,
  date: { $gt: entry.date }
})
.sort({ date: 1 })
.limit(1)
.select('_id date fastDuration')
.lean();

// Calculate day gaps
const daysSince = previousEntry 
  ? Math.floor((entry.date - previousEntry.date) / (1000 * 60 * 60 * 24))
  : null;

const daysUntil = nextEntry
  ? Math.floor((nextEntry.date - entry.date) / (1000 * 60 * 60 * 24))
  : null;
```

**Performance**: 
- Uses existing `{ userId: 1, date: -1 }` compound index
- Each query returns 1 document (~5ms)
- Total overhead: ~10ms

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Request: GET /entries/[id]                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ page.js (Server Component)                                      │
│                                                                 │
│  1. Verify auth (NextAuth session)                             │
│  2. Fetch entry from MongoDB                                   │
│  3. Fetch user settings (cached, 1h TTL)                       │
│  4. Call entryInsightsService.calculateInsights()              │
│     ├─ Check cache (insights:{userId}:{entryId})               │
│     ├─ If miss: Run aggregation pipeline                       │
│     └─ Cache result (30-min TTL)                               │
│  5. Compute ComparisonStats (lightweight)                      │
│  6. Query TimelineContext (2 indexed queries)                  │
│  7. Pass props to EntryDetailsView                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ EntryDetailsView (Organism)                                     │
│                                                                 │
│  Props:                                                         │
│    - entry: Entry                                               │
│    - insights: EntryInsights                                    │
│    - comparisonStats: ComparisonStats                           │
│    - timelineContext: TimelineContext                           │
│    - userSettings: User.settings                                │
│                                                                 │
│  Renders:                                                       │
│    ├─ EntryHeader (existing)                                    │
│    ├─ CoreDataSection (existing, styled)                        │
│    ├─ WellnessMetricsSection (existing, styled)                 │
│    ├─ InsightsSection (new, uses InsightCalloutBox)             │
│    ├─ ComparisonStatsSection (new, uses ComparisonCard)         │
│    ├─ TimelineNavigationSection (new, uses TimelineNav)         │
│    └─ ActionButtonsSection (existing, enhanced styling)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Validation

### Server-Side Validation (Next.js Page)

**Entry ID Validation**:
```javascript
// In page.js
if (!mongoose.Types.ObjectId.isValid(params.id)) {
  notFound(); // Returns 404
}
```

**Authorization Check**:
```javascript
// Verify entry belongs to authenticated user
const entry = await Entry.findOne({ 
  _id: params.id, 
  userId: session.user.id 
});

if (!entry) {
  notFound(); // Returns 404 (not 403 to avoid enumeration)
}
```

**Date Validation**:
```javascript
// Entry dates should not be in future
if (entry.date > new Date()) {
  // Handle edge case: Allow same-day entries
  if (!isSameDay(entry.date, new Date())) {
    return <ErrorMessage>Future entries not supported</ErrorMessage>;
  }
}
```

### Client-Side Validation

**None Required**: All data validated server-side before rendering.

---

## Performance Considerations

### Query Optimization

**Indexed Queries Only**:
- Entry fetch: Uses `_id` (primary key)
- Previous/next entries: Uses `{ userId: 1, date: -1 }` compound index
- Insights aggregation: Uses `{ userId: 1 }` portion of compound index

**Projection** (select only needed fields):
```javascript
.select('_id date fastDuration moodLevel energyLevel hungerLevel notes startTime endTime createdAt')
```

**Lean Queries** (skip Mongoose hydration):
```javascript
.lean()  // Returns plain JavaScript objects, ~10x faster
```

### Caching Strategy

| Data Type | Cache TTL | Rationale |
|-----------|-----------|-----------|
| Entry | ISR 5 min | Infrequent updates, SEO benefit |
| EntryInsights | 30 min | Computationally expensive, acceptable staleness |
| User Settings | 1 hour | Rarely changes |
| TimelineContext | None | Lightweight queries, changes with new entries |
| ComparisonStats | None | Derived from cached insights |

### Aggregation Pipeline Optimization

**Use $facet for Parallel Aggregations**:
```javascript
db.entries.aggregate([
  { $match: { userId: ObjectId("...") } },
  {
    $facet: {
      longestThisMonth: [...],
      rankData: [...],
      weekendVsWeekday: [...],
      typicalDuration: [...],
      streakCheck: [...]
    }
  }
]);
```
**Benefit**: Single database round-trip for all insights (~350ms vs. ~1500ms for sequential queries).

---

## Edge Cases & Null Handling

### Insufficient Data Scenarios

**Case 1: First Entry (No Historical Data)**
- `weekendVsWeekdayPattern`: Return `null` (need ≥5 weekend + ≥5 weekday entries)
- `deviationFromTypical`: Return `null` (need ≥10 total entries for meaningful median)
- `streakContribution`: `{ isPartOfStreak: true, currentStreak: 1, streakType: 'building' }`
- `comparisonStats`: Return `null` for all (need ≥2 entries for comparison)

**Case 2: Single Day of Week**
- `dayOfWeekAverage`: If only 1 entry for that day, `difference = 0`, `trend = 'equal'`

**Case 3: Weekend-Only or Weekday-Only User**
- `weekendVsWeekdayPattern`: Return partial data with `null` for missing category average

### Null Checks in Components

**InsightsSection**:
```jsx
{insights.weekendVsWeekdayPattern && (
  <InsightCalloutBox
    type="info"
    icon="📊"
    message={`You fast ${insights.weekendVsWeekdayPattern.difference > 0 ? 'longer' : 'shorter'} on weekends`}
  />
)}

{!insights.weekendVsWeekdayPattern && insights.rankData.totalEntries < 10 && (
  <p className="text-gray-600">
    Keep logging to see personalized patterns! (Need 10+ entries)
  </p>
)}
```

---

## Future Extensibility

### Potential Enhancements (Out of Scope for Feature 025)

**Not Required Now** (documented for future):
- Store pre-calculated insights in database (if aggregation becomes bottleneck)
- Add `insights` field to Entry schema with TTL index
- Implement real-time insight updates via WebSockets
- Add historical insight tracking (trend over time)
- Implement custom user goals (e.g., "Fast 16h on weekdays, 18h on weekends")

**Schema Remains Unchanged**: No modifications needed for future enhancements.

---

## Summary

**Existing Entities**: 
- ✅ Entry (no changes)
- ✅ User (no changes)

**Computed Types** (not stored):
- ✅ EntryInsights (minor enhancements to existing service)
- 🆕 ComparisonStats (new, lightweight)
- 🆕 TimelineContext (new, lightweight)

**Performance**:
- Single aggregation pipeline for all insights (~350ms)
- 30-minute cache reduces recalculation by ~90%
- Indexed queries for timeline navigation (~10ms)
- ISR page cache for <1s cached page loads

**Ready for Phase 2**: All data structures defined, no schema migrations required.
