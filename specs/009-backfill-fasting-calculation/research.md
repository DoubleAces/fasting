# Research & Technical Decisions: Backfill Fasting Duration Calculation

**Feature**: 009-backfill-fasting-calculation  
**Date**: October 23, 2025  
**Status**: Complete

## Overview

This research document analyzes the existing fasting calculation logic and determines the best approach to fix the backfill bug where creating past entries doesn't trigger recalculation of future entries.

## 1. Existing Cascade Update Patterns

### Decision

Reuse the existing cascade update pattern already implemented in PUT and DELETE handlers.

### Rationale

The codebase already has working cascade logic in two places:

**PUT Handler** (`src/app/api/entries/[id]/route.js` lines 147-177):
```javascript
// Recalculate next day's fasting duration if last meal time changed
if (dateChanged || lastMealChanged) {
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateFormatted = formatDate(nextDate);
  
  const nextEntry = await Entry.findOne({
    userId: session.user.id,
    date: new Date(nextDateFormatted)
  });

  if (nextEntry && value.lastMealTime && nextEntry.firstMealTime) {
    const result = calculateFastingDuration(
      value.lastMealTime,
      nextEntry.firstMealTime,
      value.date,
      nextEntry.date
    );
    
    await Entry.findByIdAndUpdate(
      nextEntry._id,
      { fastingDuration: result.totalMinutes }
    );
  }
}
```

**DELETE Handler** (`src/app/api/entries/[id]/route.js` lines 216-258):
```javascript
// Find next day's entry
const nextEntry = await Entry.findOne({
  userId: session.user.id,
  date: new Date(nextDateFormatted)
});

if (nextEntry) {
  // Find the new previous day entry
  const newPreviousEntry = await Entry.findOne({
    userId: session.user.id,
    date: new Date(previousDateFormatted)
  });

  let newFastingDuration = null;
  if (newPreviousEntry && newPreviousEntry.lastMealTime && nextEntry.firstMealTime) {
    const result = calculateFastingDuration(
      newPreviousEntry.lastMealTime,
      nextEntry.firstMealTime,
      newPreviousEntry.date,
      nextEntry.date
    );
    newFastingDuration = result.totalMinutes;
  }

  await Entry.findByIdAndUpdate(
    nextEntry._id,
    { fastingDuration: newFastingDuration }
  );
}
```

### Alternatives Considered

1. **Multi-level cascade**: Update ALL future entries
   - **Rejected**: Out of scope per spec (FR-007), would require recursive updates, performance concerns
   
2. **Batch update with aggregation pipeline**: Update multiple entries in one query
   - **Rejected**: Only need to update immediate next entry, single update is simpler and matches existing pattern
   
3. **Background job/queue**: Async calculation
   - **Rejected**: Overkill for single entry update, adds complexity, user expects immediate update per spec (SC-001: within 1 second)

## 2. Query Strategy for Finding Next Entry

### Decision

Use `Entry.findOne()` with `date: { $gt: newEntryDate }` and `.sort({ date: 1 }).limit(1)` to find the immediate next entry.

### Rationale

**Efficient Query Pattern**:
```javascript
const nextEntry = await Entry.findOne({
  userId: session.user.id,
  date: { $gt: new Date(value.date) }
})
.sort({ date: 1 })
.limit(1);
```

**Advantages**:
- Uses existing compound index `{ userId: 1, date: -1 }` efficiently
- Returns only the immediate next entry (not all future entries)
- Handles gaps in data naturally (e.g., Day 1 and Day 5 exist, Day 2 created → finds Day 5)
- Consistent with MongoDB best practices

**Performance**:
- Index scan: O(log n) to find first matching document
- Single document retrieval
- No full collection scan required

### Alternatives Considered

1. **Exact date calculation** (like existing PUT handler):
   ```javascript
   const nextDate = new Date(currentDate);
   nextDate.setDate(nextDate.getDate() + 1);
   const nextEntry = await Entry.findOne({ date: nextDate });
   ```
   - **Rejected**: Only works for consecutive days, doesn't handle gaps (Day 1 → Day 3)

2. **Aggregation pipeline**: Use `$match` and `$sort` in aggregation
   - **Rejected**: Overkill for simple query, Mongoose findOne is simpler and equally efficient

## 3. Error Handling Strategy

### Decision

Use try-catch wrapper around cascade logic with console.warn, don't fail the entry creation if cascade update fails.

### Rationale

**Pattern from existing code**:
```javascript
try {
  // Cascade update logic
} catch (calcError) {
  console.warn('Could not update next day fasting duration:', calcError.message);
}
// Continue - entry creation succeeds even if cascade fails
```

**Reasoning**:
- User's primary action (creating entry) should succeed
- Cascade update is a "nice to have" optimization
- Data can be recalculated later if needed
- Prevents cascade errors from blocking user workflow
- Matches existing error handling in PUT and DELETE handlers

### Alternatives Considered

1. **Fail entire transaction**: Rollback entry creation if cascade fails
   - **Rejected**: Too strict, punishes user for system error, creates bad UX

2. **Silent failure**: No logging
   - **Rejected**: Need visibility for debugging, console.warn provides useful troubleshooting info

## 4. Integration Test Strategy

### Decision

Add new test cases to existing `tests/integration/entries.test.js` file following established patterns.

### Test Cases Required

**1. Backfill Basic Scenario** (Priority: P1):
```javascript
it('should recalculate next entry fasting when creating past entry', async () => {
  // 1. Create entry for Day 2 (no fasting)
  const day2 = await Entry.create({
    userId: testUserId,
    date: new Date('2025-10-18'),
    firstMealTime: '12:00',
    lastMealTime: '20:00'
  });
  expect(day2.fastingDuration).toBeNull();

  // 2. Create entry for Day 1
  await POST({
    date: '2025-10-17',
    firstMealTime: '10:00',
    lastMealTime: '20:00'
  });

  // 3. Verify Day 2 fasting recalculated
  const updated = await Entry.findById(day2._id);
  expect(updated.fastingDuration).toBe(960); // 16 hours
});
```

**2. Gap Handling** (Priority: P1):
```javascript
it('should find next entry across gaps', async () => {
  // Day 1 and Day 5 exist, create Day 2
  // Verify Day 5's fasting NOT recalculated (too far)
});
```

**3. Middle Entry** (Priority: P2):
```javascript
it('should update immediate next when creating middle entry', async () => {
  // Day 1 and Day 3 exist
  // Create Day 2
  // Verify Day 3 recalculated, Day 1 unchanged
});
```

**4. Missing Data** (Priority: P2):
```javascript
it('should set null when previous entry has no lastMealTime', async () => {
  // Create past entry without lastMealTime
  // Verify next entry fasting remains null
});
```

### Rationale

- Covers all acceptance scenarios from spec
- Follows existing test patterns in the file
- Uses TDD approach: write tests first, implement after
- Integration tests verify end-to-end behavior including database

### Alternatives Considered

1. **Unit tests**: Test cascade logic in isolation
   - **Rejected**: This is integration behavior (DB queries), not pure function logic

2. **E2E tests**: Playwright browser tests
   - **Rejected**: Overkill for API behavior, integration tests sufficient

## 5. Code Location and Modification Scope

### Decision

Modify POST handler in `src/app/api/entries/route.js` at line 147 (after `entry.save()`).

### Rationale

**Exact insertion point**:
```javascript
await entry.save();  // Line 147

// ADD NEW CODE HERE:
// Try to update next entry's fasting duration
try {
  const nextEntry = await Entry.findOne({
    userId: session.user.id,
    date: { $gt: new Date(value.date) }
  })
  .sort({ date: 1 })
  .limit(1);

  if (nextEntry && value.lastMealTime && nextEntry.firstMealTime) {
    const result = calculateFastingDuration(
      value.lastMealTime,
      nextEntry.firstMealTime,
      value.date,
      nextEntry.date
    );
    
    await Entry.findByIdAndUpdate(
      nextEntry._id,
      { fastingDuration: result.totalMinutes }
    );
  }
} catch (calcError) {
  console.warn('Could not update next day fasting duration:', calcError.message);
}

return createdResponse(entry);  // Line 149
```

**Why this location**:
- Entry already saved to database (has valid ._id)
- All imports already available (`Entry`, `calculateFastingDuration`, `formatDate`)
- Before response sent to client
- Mirrors PUT handler cascade location

### Alternatives Considered

1. **Mongoose middleware** (pre-save hook):
   - **Rejected**: Would require model changes, harder to test, less explicit

2. **Separate utility function**: Extract cascade logic to shared function
   - **Rejected**: Only 3 usages (POST, PUT, DELETE), not enough duplication to warrant abstraction yet

## Summary

| Decision Area | Chosen Approach | Key Reason |
|---------------|----------------|------------|
| Cascade Pattern | Reuse existing PUT/DELETE pattern | Proven, tested, consistent |
| Query Strategy | `findOne({ date: { $gt: ... } }).sort().limit(1)` | Handles gaps, uses index efficiently |
| Error Handling | try-catch with console.warn, don't fail creation | Matches existing pattern, better UX |
| Testing | Integration tests in existing file | End-to-end validation, follows TDD |
| Code Location | POST handler after `entry.save()` | Logical flow, matches PUT handler |

**No open questions remain** - All technical decisions made and justified.
