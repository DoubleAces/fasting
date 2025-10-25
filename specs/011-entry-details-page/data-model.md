# Data Model: Entry Details Page

**Date**: October 24, 2025  
**Feature**: Entry Details Page  
**Phase**: 1 - Design & Contracts

## Entities

### Entry (Existing Model - No Changes)

**Source**: `src/lib/models/Entry.js`  
**Collection**: `entries`

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  userId: ObjectId,                 // Reference to User (indexed)
  date: Date,                       // Entry date (unique per user, indexed)
  firstMealTime: String,            // "HH:mm" format (24-hour)
  lastMealTime: String,             // "HH:mm" format (24-hour)
  fastingDuration: Number | null,   // Minutes (null if no previous entry)
  extendedFastConfirmed: Boolean,   // User confirmed gap >24h
  hoursOfSleep: Number,             // 0-24
  morningWeight: Number | null,     // kg or lbs (optional)
  hungerLevel: String | null,       // "Low" | "Medium" | "High"
  energyLevel: String | null,       // "Low Energy" | "Medium Energy" | "High Energy"
  wellBeing: String | null,         // "Poor" | "Fair" | "Good"
  foodNotes: String | null,         // Max 2000 characters
  createdAt: Date,                  // Auto-generated
  updatedAt: Date,                  // Auto-updated
}
```

**Indexes**:
- `{ userId: 1, date: -1 }` - List entries by user (descending date)
- `{ userId: 1, date: 1 }` - Unique constraint (one entry per day per user)

**Validation Rules** (Joi schema):
- `date`: Required, valid Date
- `firstMealTime`: Required, HH:mm format
- `lastMealTime`: Required, HH:mm format
- `fastingDuration`: Number >= 0 or null
- `hoursOfSleep`: 0-24 range
- `morningWeight`: Number > 0 or null
- `foodNotes`: Max 2000 characters

---

### User (Existing Model - No Changes)

**Source**: `src/lib/models/User.js`  
**Collection**: `users`

**Relevant Fields for Entry Details**:
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  // ... other auth fields
}
```

---

### Settings (Existing Model - No Changes)

**Source**: `src/lib/models/Settings.js`  
**Collection**: `settings`

**Relevant Fields for Entry Details**:
```javascript
{
  userId: ObjectId,                 // Reference to User
  timeFormat: String,               // "12h" | "24h"
  measurementSystem: String,        // "metric" | "imperial"
  // ... other preference fields
}
```

---

## Computed/Derived Data

### EntryInsights (Transient - Not Stored)

**Computed by**: `src/lib/services/entryInsightsService.js`  
**Lifetime**: Request-scoped (calculated on-demand)

```javascript
{
  // Current entry reference
  entryId: String,
  entryDate: Date,
  entryDuration: Number,            // Minutes
  
  // Comparative insights
  isLongestThisMonth: Boolean,      // Longest fast in current month
  historicalRank: Number,           // Position in all-time fasting history (1 = longest)
  totalEntriesCount: Number,        // Total entries for context ("Your 5th of 127 fasts")
  
  // Statistical comparisons (30-day window)
  averageDuration30Days: Number | null,    // Minutes (null if <7 entries)
  durationDifference: Number | null,       // current - average (signed, minutes)
  durationPercentile: Number | null,       // 0-100 (where this entry falls)
  typicalBreakfastTime: String | null,     // "HH:mm" median (null if <7 entries)
  
  // Streak information
  contributesToStreak: Boolean,     // Is part of current consecutive streak
  currentStreakLength: Number,      // Days of current streak
  streakBroken: Boolean,            // True if this entry breaks a streak
  
  // Best day badge
  isBestDay: Boolean,               // Meets all criteria for "best day" badge
  bestDayCriteria: {
    meetsAverageDuration: Boolean,  // >= 30-day average
    hasHighEnergy: Boolean,         // energyLevel === "High Energy"
    hasGoodWellbeing: Boolean,      // wellBeing === "Good"
    hasWeightLogged: Boolean,       // morningWeight !== null
  },
  
  // Data sufficiency
  hasSufficientData: Boolean,       // >= 7 entries for meaningful insights
  entriesCountForInsights: Number,  // Entries in 30-day window
}
```

**Calculation Requirements**:
- Query entries for userId within date ranges (30 days, current month, all-time)
- Use MongoDB aggregation for efficiency (group, sort, limit operations)
- Handle null/missing data gracefully (show "N/A" with explanation)
- Calculate in parallel with entry fetch to minimize latency

---

## Data Flow

### Page Load Sequence

```
1. User clicks entry from /entries list
   ↓
2. Navigate to /entries/[id]
   ↓
3. Server Component: auth() session check
   ↓
4. Server Component: Entry.findById(id)
   ↓
5. Authorization check: entry.userId === session.user.id
   ↓
6. [PARALLEL]
   ├─ Fetch Settings.findOne({ userId })
   └─ Calculate EntryInsights (30-day window queries)
   ↓
7. Render page with all data
```

**Error Paths**:
- No session → Redirect to /login (middleware handles)
- Entry not found → 404 page
- Unauthorized (wrong user) → Redirect to /entries?error=unauthorized
- Database error → Error page with retry option

---

## Validation & Business Rules

### Entry Ownership Validation

```javascript
// Rule: Users can only view their own entries
if (entry.userId.toString() !== session.user.id) {
  // Redirect or 403 error
}
```

### Insights Data Sufficiency

```javascript
// Rule: Require >= 7 entries for comparative insights
const entriesCount = await Entry.countDocuments({
  userId: session.user.id,
});

if (entriesCount < 7) {
  insights.hasSufficientData = false;
  insights.message = "Create at least 7 entries to see patterns";
}
```

### Extended Fast Highlighting

```javascript
// Rule: Highlight fasts >24 hours (1440 minutes)
if (entry.fastingDuration !== null && entry.fastingDuration > 1440) {
  displayExtendedFastBadge = true;
}
```

### Ranking Tie-Breaking

```javascript
// Rule: When durations are identical, newer entry ranks higher
const ranking = await Entry.aggregate([
  { $match: { userId: userId } },
  { $sort: { 
      fastingDuration: -1,  // Primary: duration descending
      date: -1              // Tie-breaker: date descending (newer first)
    } 
  },
  // Find current entry position in sorted list
]);
```

### Best Day Badge Logic

```javascript
// Rule: All 4 criteria must be met
const isBestDay = (
  entry.fastingDuration >= insights.averageDuration30Days &&
  entry.energyLevel === "High Energy" &&
  entry.wellBeing === "Good" &&
  entry.morningWeight !== null
);
```

---

## State Transitions

### Entry Lifecycle (No Changes)

Entry details page is **read-only**. No state transitions occur on this page.

Actions that modify state navigate away:
- **Edit** → Navigate to `/entries/edit/[id]` (separate form)
- **Delete** → Remove entry → Redirect to `/entries`
- **Copy to Today** → Navigate to `/entries/new?template=[id]`

---

## Performance Considerations

### Query Optimization

```javascript
// Efficient insights queries
// 1. Index usage: { userId: 1, date: -1 }
// 2. Project only needed fields
// 3. Limit date range to reduce scan

// Example: 30-day average
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const insights = await Entry.aggregate([
  { 
    $match: { 
      userId: userId, 
      date: { $gte: thirtyDaysAgo },
      fastingDuration: { $ne: null }
    } 
  },
  { 
    $group: {
      _id: null,
      avgDuration: { $avg: "$fastingDuration" },
      count: { $sum: 1 }
    }
  }
]);
```

### Caching Strategy

- **Entry data**: Cache at CDN edge (stale-while-revalidate)
- **Insights calculations**: Consider Redis cache (key: `insights:${userId}:${entryId}`, TTL: 1 hour)
- **User settings**: Cache in session (rarely changes)

### Data Transfer Optimization

- Server Components reduce client-side data transfer (no JSON download)
- Only send rendered HTML to client
- Client Components receive minimal props (display strings, not raw data)

---

## Schema Migrations

**No migrations needed** - Using existing Entry, User, Settings models without changes.

Future considerations:
- If insights calculation becomes frequent bottleneck, consider materialized view or denormalization
- If "best day" badge is expanded with custom criteria, may need new Settings fields

---

## Next Phase

Phase 1 continues with:
- API contracts (routes and methods)
- Quickstart guide
- Update agent context
