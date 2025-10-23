# Data Model: Backfill Fasting Duration Calculation

**Feature**: 009-backfill-fasting-calculation  
**Date**: October 23, 2025  
**Status**: Complete

## Overview

This feature is a bug fix that **does not introduce any new data structures or modify existing schemas**. The Entry model remains unchanged.

## Existing Data Model (No Changes)

### Entry Collection

**MongoDB Collection**: `entries`  
**Mongoose Model**: `Entry` (defined in `src/lib/models/Entry.js`)

**Relevant Fields** (for this feature):

| Field | Type | Description | Used In Cascade |
|-------|------|-------------|-----------------|
| `_id` | ObjectId | Unique entry identifier | Yes - for update query |
| `userId` | ObjectId | Reference to User | Yes - query filter |
| `date` | Date | Entry date (unique per user) | Yes - finding next entry |
| `firstMealTime` | String | HH:mm format | Yes - destination field for calculation |
| `lastMealTime` | String | HH:mm format | Yes - source field for calculation |
| `fastingDuration` | Number | Minutes (nullable) | Yes - field being updated |

**Indexes** (already exist):
- `{ userId: 1, date: -1 }` - Compound index for user entries sorted by date
- `{ userId: 1, date: 1 }` - Unique constraint ensuring one entry per user per day

## Data Flow

### Scenario: Creating Past Entry

**Initial State**:
```javascript
// Day 2 entry exists with null fasting (no previous day)
{
  _id: ObjectId('...'),
  userId: ObjectId('user123'),
  date: ISODate('2025-10-18'),
  firstMealTime: '12:00',
  lastMealTime: '20:00',
  fastingDuration: null  // ← NULL because no Day 1 existed
}
```

**User Action**: POST /api/entries
```javascript
{
  date: '2025-10-17',  // Day 1 - PAST date
  firstMealTime: '10:00',
  lastMealTime: '20:00'
}
```

**System Operations**:

1. **Create Entry** (existing behavior):
```javascript
const entry = new Entry({
  userId: session.user.id,
  date: '2025-10-17',
  firstMealTime: '10:00',
  lastMealTime: '20:00',
  fastingDuration: null  // No previous entry
});
await entry.save();
```

2. **Find Next Entry** (NEW):
```javascript
const nextEntry = await Entry.findOne({
  userId: session.user.id,
  date: { $gt: new Date('2025-10-17') }
})
.sort({ date: 1 })
.limit(1);

// Returns Day 2 entry
```

3. **Calculate Fasting** (NEW - reusing existing utility):
```javascript
const result = calculateFastingDuration(
  '20:00',              // Day 1 lastMealTime
  '12:00',              // Day 2 firstMealTime
  new Date('2025-10-17'),  // Day 1 date
  new Date('2025-10-18')   // Day 2 date
);
// result.totalMinutes = 960 (16 hours)
```

4. **Update Next Entry** (NEW):
```javascript
await Entry.findByIdAndUpdate(
  nextEntry._id,
  { fastingDuration: 960 }
);
```

**Final State**:
```javascript
// Day 1 entry (newly created)
{
  _id: ObjectId('...'),
  userId: ObjectId('user123'),
  date: ISODate('2025-10-17'),
  firstMealTime: '10:00',
  lastMealTime: '20:00',
  fastingDuration: null  // Correct - no Day 0
}

// Day 2 entry (updated)
{
  _id: ObjectId('...'),
  userId: ObjectId('user123'),
  date: ISODate('2025-10-18'),
  firstMealTime: '12:00',
  lastMealTime: '20:00',
  fastingDuration: 960  // ← UPDATED from null to 960 minutes (16h)
}
```

## Query Patterns

### Find Immediate Next Entry

**Purpose**: Locate the first entry after a newly created date

**Query**:
```javascript
const nextEntry = await Entry.findOne({
  userId: session.user.id,           // Scope to user
  date: { $gt: new Date(createdDate) }  // Greater than created date
})
.sort({ date: 1 })   // Ascending order (earliest first)
.limit(1);           // Only first result
```

**Index Usage**: Uses compound index `{ userId: 1, date: -1 }` (can scan in reverse)

**Performance**: O(log n) index scan + O(1) document retrieval

**Edge Cases**:
- **No next entry exists**: Query returns `null` → no update needed
- **Gap in dates**: Query finds first entry after gap (e.g., Day 1 → Day 5)
- **Same date**: Impossible due to unique constraint

### Update Fasting Duration

**Purpose**: Atomically update calculated fasting field

**Query**:
```javascript
await Entry.findByIdAndUpdate(
  entryId,
  { fastingDuration: totalMinutes },
  { new: false }  // Don't need returned document
);
```

**Atomicity**: Single document update (no transaction needed)

**Performance**: O(1) direct ObjectId lookup + O(1) update

## Data Validation

### Pre-Update Validation

Before updating next entry's fasting duration, verify:

```javascript
if (nextEntry && currentEntry.lastMealTime && nextEntry.firstMealTime) {
  // Safe to calculate and update
} else {
  // Skip update - missing required data
}
```

**Validation Rules**:
- Next entry must exist
- Current entry must have `lastMealTime`
- Next entry must have `firstMealTime`
- If any condition fails → set `fastingDuration: null`

### Calculation Validation

The existing `calculateFastingDuration()` utility handles:
- Invalid time formats (throws error)
- First meal before last meal (throws error)
- Valid fasting range (1 minute to 7 days)

Errors caught by try-catch in cascade logic.

## Database Consistency

### ACID Properties

**Atomicity**: Each operation is atomic
- Entry creation: Single `entry.save()`
- Fasting update: Single `findByIdAndUpdate()`

**Consistency**: Data remains consistent
- If cascade fails, entry still created (logged warning)
- User can manually trigger recalculation later (future enhancement)

**Isolation**: Per-user scoping prevents conflicts
- `userId` filter ensures user A's changes don't affect user B

**Durability**: MongoDB write concern ensures persistence

### Idempotency

Creating the same entry twice will fail due to unique index:
```javascript
{ userId: 1, date: 1 }  // Unique constraint
```

Cascade update is idempotent - recalculating same fasting duration results in same value.

## No Migration Required

**Schema**: No changes to Entry model  
**Data**: No existing data needs updating  
**Indexes**: No new indexes required  
**Validation**: No new validation rules  

This is a **behavioral change only** - existing data structures remain identical.

## Summary

| Aspect | Status |
|--------|--------|
| Schema Changes | None |
| New Collections | None |
| New Fields | None |
| Index Changes | None |
| Migration Required | No |
| Data Model Impact | Zero - behavioral fix only |
