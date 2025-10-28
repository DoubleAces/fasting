# Data Model: Fasting Goal Timer

**Feature**: 020-fasting-goal-timer  
**Date**: October 28, 2025  
**Purpose**: Define entities, fields, relationships, and validation rules

## Overview

This feature extends the existing Entry model and introduces session-based state management for fasting goals. No new database collections required.

## Entities

### 1. Entry Model (Extended)

**Purpose**: Represents a daily fasting entry. Extended with goal tracking fields.

**Collection**: `entries` (existing)

**Schema Changes**:

```javascript
// Add to existing entrySchema in src/lib/models/Entry.js

// Fasting goal fields (new as of Feature 020)
fastingGoal: {
  type: Number,
  min: [1, 'Fasting goal must be at least 1 minute'],
  max: [10080, 'Fasting goal cannot exceed 168 hours (7 days)'],
  default: null,
  // Stores goal duration in MINUTES (not hours)
  // null = no goal was set for this fast
},

goalStatus: {
  type: String,
  enum: {
    values: ['completed', 'not-completed', 'no-goal'],
    message: 'Goal status must be completed, not-completed, or no-goal'
  },
  default: null,
  // 'completed' = fasting duration >= goal
  // 'not-completed' = fasting duration < goal (ended fast early)
  // 'no-goal' = no goal was set during this fast
  // null = legacy entry (before Feature 020)
},
```

**Field Details**:

| Field | Type | Required | Validation | Default | Description |
|-------|------|----------|------------|---------|-------------|
| `fastingGoal` | Number | No | 1-10080 | null | Goal duration in minutes. Range: 1 hour to 168 hours (7 days). |
| `goalStatus` | String | No | Enum | null | Outcome: 'completed', 'not-completed', or 'no-goal'. |

**Indexes**: No new indexes required (optional fields, low cardinality)

**Migration**: None required - fields are optional with default: null

**Backward Compatibility**: ✅ Existing entries remain valid. Queries can filter with `{ goalStatus: { $exists: true } }` for goal-enabled entries.

**Example Documents**:

```javascript
// Entry with completed goal
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: ISODate("2025-10-28"),
  firstMealTime: "12:00",
  lastMealTime: "20:00",
  fastingDuration: 960, // 16 hours
  fastingGoal: 960,     // 16 hour goal
  goalStatus: "completed",
  // ...other fields
}

// Entry with exceeded goal
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: ISODate("2025-10-29"),
  firstMealTime: "14:00",
  lastMealTime: "22:00",
  fastingDuration: 1080, // 18 hours
  fastingGoal: 960,      // 16 hour goal
  goalStatus: "completed", // Still "completed" even though exceeded
  // ...other fields
}

// Entry with incomplete goal (ended fast early)
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: ISODate("2025-10-30"),
  firstMealTime: "10:00",
  lastMealTime: "19:00",
  fastingDuration: 840, // 14 hours
  fastingGoal: 960,     // 16 hour goal
  goalStatus: "not-completed",
  // ...other fields
}

// Entry with no goal set
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: ISODate("2025-10-31"),
  firstMealTime: "13:00",
  lastMealTime: "21:00",
  fastingDuration: 960, // 16 hours
  fastingGoal: null,
  goalStatus: "no-goal",
  // ...other fields
}

// Legacy entry (before Feature 020)
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  date: ISODate("2025-09-15"),
  firstMealTime: "12:00",
  lastMealTime: "20:00",
  fastingDuration: 960,
  // fastingGoal: undefined (not present)
  // goalStatus: undefined (not present)
  // ...other fields
}
```

---

### 2. Fasting Goal (Session State)

**Purpose**: Represents the user's current fasting goal during an active fast. Exists only in memory (React Context + localStorage).

**Storage**: React Context API + localStorage backup

**Lifecycle**: 
- Created: When user sets goal during active fast
- Updated: When user changes goal mid-fast
- Destroyed: When fast ends and data is saved to Entry document

**Structure**:

```typescript
interface FastingGoal {
  goalMinutes: number | null;  // Goal duration in minutes (null = no goal set)
  setAt: Date | null;           // Timestamp when goal was set (for analytics)
}
```

**State Management**:

```javascript
// React Context
const FastingGoalContext = createContext({
  goalMinutes: null,
  setAt: null,
  setGoal: (minutes) => {},
  clearGoal: () => {},
});

// localStorage key
const STORAGE_KEY = 'fasting-goal-session';

// Storage format
{
  goalMinutes: 960,               // 16 hours
  setAt: "2025-10-28T20:00:00Z"  // ISO string
}
```

**Validation Rules**:
- `goalMinutes`: 60-10080 (1 hour to 168 hours)
- `setAt`: Valid ISO date string
- Clear on fast completion (localStorage.removeItem)

**Persistence Strategy**:
1. User sets goal → Save to Context + localStorage
2. Page refresh → Load from localStorage → Restore to Context
3. Fast ends → Read from Context → Save to Entry → Clear localStorage

---

### 3. Progress State (Computed State)

**Purpose**: Represents real-time progress toward goal. Not persisted - calculated on every render.

**Storage**: None (computed in React component/hook)

**Structure**:

```typescript
interface ProgressState {
  elapsedMs: number;              // Time elapsed in milliseconds
  goalMs: number;                 // Goal duration in milliseconds
  percentage: number;             // Progress percentage (0-100+)
  isExceeded: boolean;            // true if percentage >= 100
  completionTime: Date;           // Absolute timestamp when goal will be reached
  displayText: string;            // e.g., "4h 30m / 16h 00m (28%)"
}
```

**Calculation Logic**:

```javascript
// In useGoalProgress hook or component
const calculateProgress = (lastMealTime, date, goalMinutes, currentTime) => {
  // Parse start time
  const [hours, minutes] = lastMealTime.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0, 0);
  
  // Calculate elapsed
  const elapsedMs = currentTime - startTime;
  const goalMs = goalMinutes * 60 * 1000;
  
  // Calculate percentage
  const percentage = (elapsedMs / goalMs) * 100;
  
  // Calculate completion time
  const completionTime = new Date(startTime.getTime() + goalMs);
  
  // Format display text
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const goalHours = Math.floor(goalMinutes / 60);
  const goalMins = goalMinutes % 60;
  
  const displayText = `${elapsedHours}h ${elapsedMins}m / ${goalHours}h ${goalMins}m (${Math.round(percentage)}%)`;
  
  return {
    elapsedMs,
    goalMs,
    percentage,
    isExceeded: percentage >= 100,
    completionTime,
    displayText
  };
};
```

**Update Frequency**: Every 60 seconds (synced with useFastingTimer hook)

---

## Relationships

```
User (1) ----< (N) Entry
                     |
                     +-- fastingGoal: Number
                     +-- goalStatus: String
                     
Entry (active) <--(reads from)-- FastingGoal (session state)
                                       |
                                       +-- stored in React Context
                                       +-- backed by localStorage
                                       
FastingGoal (session) --(calculates)--> ProgressState (computed)
         +                                     |
         |                                     +-- derived from elapsedMs
         |                                     +-- recalculated every 60s
         |
         +--(persisted to)--> Entry (on fast completion)
```

**Key Points**:
- FastingGoal exists only during active fast (ephemeral)
- ProgressState is computed real-time (never stored)
- Entry is the source of truth for historical goal data

---

## State Transitions

### Goal Status State Machine

```
No Goal Set                    Goal Set                  Goal Reached               Fast Ended
                                                         (>= target)
   [null]  ------> [Active Goal] ------> [Progress 100%+] ------> [Entry saved]
               (user sets goal)      (time passes)         (user ends fast)
                                                                      |
                                                                      v
                                         +-------------------> goalStatus: 'completed'
                                         |                     fastingGoal: 960
                                         |
                                         +-------------------> (if ended early)
                                                               goalStatus: 'not-completed'
                                                               fastingGoal: 960
```

### Session State Lifecycle

```
Page Load
   |
   +--[Has localStorage goal?]
           |
           +--YES--> Restore to Context --> Display progress
           |
           +--NO---> goalMinutes: null --> Show "Set Goal" prompt
                                                |
                                                v
                                        User clicks "Set Goal"
                                                |
                                                v
                                        Goal saved to Context + localStorage
                                                |
                                                v
                                        Progress displayed (updates every 60s)
                                                |
                                                v
                                        User ends fast
                                                |
                                                v
                                        Goal saved to Entry + localStorage cleared
```

---

## Validation Rules

### Client-Side Validation

**Goal Input**:
```javascript
const validateGoal = (input) => {
  const hours = parseFloat(input);
  
  if (isNaN(hours)) return { valid: false, error: 'Please enter a valid number' };
  if (hours < 1) return { valid: false, error: 'Goal must be at least 1 hour' };
  if (hours > 168) return { valid: false, error: 'Goal cannot exceed 168 hours (7 days)' };
  if (!Number.isFinite(hours)) return { valid: false, error: 'Invalid number' };
  
  const minutes = Math.round(hours * 60);
  return { valid: true, minutes };
};
```

### Server-Side Validation

**API Endpoint (POST /api/entries)**:
```javascript
// In request body validation
const schema = Joi.object({
  // ...existing fields
  fastingGoal: Joi.number().min(1).max(10080).allow(null).optional(),
  goalStatus: Joi.string().valid('completed', 'not-completed', 'no-goal').allow(null).optional(),
  // ...
});

// Business logic validation
if (fastingGoal !== null && goalStatus === null) {
  return res.status(400).json({ error: 'goalStatus required when fastingGoal provided' });
}

if (fastingGoal === null && goalStatus !== null && goalStatus !== 'no-goal') {
  return res.status(400).json({ error: 'goalStatus must be no-goal when fastingGoal is null' });
}
```

**Mongoose Model Validation** (already defined above):
- `fastingGoal`: min: 1, max: 10080
- `goalStatus`: enum: ['completed', 'not-completed', 'no-goal']

---

## Query Patterns

### Common Queries

**Get user's entries with goals**:
```javascript
const entriesWithGoals = await Entry.find({
  userId: userId,
  goalStatus: { $in: ['completed', 'not-completed'] }
}).sort({ date: -1 });
```

**Calculate goal completion rate**:
```javascript
const stats = await Entry.aggregate([
  { $match: { 
      userId: ObjectId(userId),
      goalStatus: { $in: ['completed', 'not-completed'] }
  }},
  { $group: {
      _id: null,
      total: { $sum: 1 },
      completed: {
        $sum: { $cond: [{ $eq: ['$goalStatus', 'completed'] }, 1, 0] }
      }
  }},
  { $project: {
      completionRate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] }
  }}
]);
```

**Get entries without goals (legacy + no-goal)**:
```javascript
const entriesWithoutGoals = await Entry.find({
  userId: userId,
  $or: [
    { goalStatus: 'no-goal' },
    { goalStatus: null },
    { goalStatus: { $exists: false } }
  ]
});
```

---

## Error Handling

### Data Integrity Errors

| Error Scenario | Handling |
|----------------|----------|
| **goalStatus without fastingGoal** | Server validation rejects (400) |
| **fastingGoal out of range** | Mongoose validation error (400) |
| **Invalid goalStatus enum** | Mongoose validation error (400) |
| **null goalStatus with non-null fastingGoal** | Server validation rejects (400) |

### Session State Errors

| Error Scenario | Handling |
|----------------|----------|
| **localStorage quota exceeded** | Fallback to Context-only (lost on refresh) |
| **localStorage corrupted data** | Clear localStorage, reset to null goal |
| **Fast ended but localStorage not cleared** | Clear on next page load (defensive check) |

---

## Performance Considerations

### Database

- **No new indexes**: Optional fields with low cardinality don't require indexes
- **Sparse index (future)**: If analytics queries slow, add sparse index on goalStatus
- **Write performance**: No impact - optional fields add negligible overhead

### Session State

- **Memory footprint**: ~100 bytes per goal (2 numbers + 1 date)
- **localStorage**: <1KB per goal, negligible impact
- **Computation**: Progress calculation O(1), <1ms per update

### Rendering

- **Re-renders**: Only on timer tick (every 60s) or goal change (user action)
- **Memoization**: useMemo prevents unnecessary recalculations
- **Context optimization**: Use separate contexts if performance issues arise

---

## Migration Plan

**Phase 1 (Feature 020 Launch)**: 
- Deploy schema changes (additive, no migration script)
- Existing entries remain untouched (fastingGoal: undefined, goalStatus: undefined)
- New entries may have goal fields populated

**Phase 2 (Future - if needed)**:
- Optional: Backfill legacy entries with `goalStatus: null` for query consistency
- Only if analytics queries require it

**No Breaking Changes**: All changes are additive and backward-compatible

---

## Testing Data Requirements

### Test Fixtures

```javascript
// Entry with completed goal
{
  userId: testUserId,
  date: new Date('2025-10-28'),
  lastMealTime: '20:00',
  firstMealTime: '12:00',
  fastingDuration: 960,
  fastingGoal: 960,
  goalStatus: 'completed'
}

// Entry with exceeded goal
{
  userId: testUserId,
  date: new Date('2025-10-29'),
  lastMealTime: '20:00',
  firstMealTime: '14:00',
  fastingDuration: 1080,
  fastingGoal: 960,
  goalStatus: 'completed'
}

// Entry with incomplete goal
{
  userId: testUserId,
  date: new Date('2025-10-30'),
  lastMealTime: '19:00',
  firstMealTime: '10:00',
  fastingDuration: 840,
  fastingGoal: 960,
  goalStatus: 'not-completed'
}

// Entry with no goal
{
  userId: testUserId,
  date: new Date('2025-10-31'),
  lastMealTime: '21:00',
  firstMealTime: '13:00',
  fastingDuration: 960,
  fastingGoal: null,
  goalStatus: 'no-goal'
}
```

---

## Summary

**Modified Entities**: 1 (Entry model - 2 optional fields added)  
**New Entities**: 2 (FastingGoal session state, ProgressState computed state)  
**Migration Required**: No  
**Backward Compatibility**: 100%  
**Performance Impact**: Negligible
