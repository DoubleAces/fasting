# Data Model: Live Fasting Timer

**Feature**: 017-live-fasting-timer  
**Date**: October 27, 2025  
**Status**: Complete

## Overview

This feature does NOT introduce new database entities or modify existing schemas. The live fasting timer operates entirely on the client side, deriving state from existing Entry model data. This document defines the conceptual entities and their relationships for implementation purposes.

---

## Existing Database Entities

### Entry (MongoDB Collection - No Changes)

**Source**: `src/lib/models/Entry.js`

**Fields Used by Timer**:
- `userId`: ObjectId (references User) - Identifies owner
- `date`: Date - Entry date (used to determine "today")
- `lastMealTime`: String (HH:mm format) - Fasting start time
- `firstMealTime`: String (HH:mm format, optional) - Fast break time
- `fastingDuration`: Number (minutes, optional) - Calculated when fast is complete

**Validation Rules** (existing):
- `lastMealTime` and `firstMealTime` must match HH:mm format (00:00 to 23:59)
- `date` is required
- `userId` is required

**No Schema Changes Required** ✅

---

## Client-Side Conceptual Entities

These entities exist only in client-side state and are derived/calculated from Entry data.

### 1. Active Fast

**Description**: Represents the current ongoing fasting session

**Derivation Logic**:
```javascript
function deriveActiveFast(entries, todayDate) {
  const todayEntry = entries.find(entry => 
    isSameDay(new Date(entry.date), todayDate)
  );
  
  if (!todayEntry || !todayEntry.lastMealTime) {
    return null; // No active fast
  }
  
  // Check if fast is already broken
  const tomorrowEntry = entries.find(entry =>
    isSameDay(new Date(entry.date), addDays(todayDate, 1))
  );
  
  if (todayEntry.firstMealTime || tomorrowEntry?.firstMealTime) {
    return null; // Fast already broken
  }
  
  return {
    entryId: todayEntry._id,
    startTime: todayEntry.lastMealTime,
    startDate: todayEntry.date,
    status: 'active'
  };
}
```

**Properties**:
- `entryId`: string - Reference to Entry document
- `startTime`: string (HH:mm) - Last meal time from entry
- `startDate`: Date - Entry date
- `status`: 'active' | 'completed' | 'none'

**State Location**: React component state (useFastingTimer hook)

**Lifecycle**:
1. Created when: User logs lastMealTime for today's entry
2. Active while: Today's entry has lastMealTime and no firstMealTime for today or tomorrow
3. Completed when: User logs firstMealTime (breaks fast)
4. Destroyed when: Entry is deleted or user navigates away

---

### 2. Timer State

**Description**: Computed state representing what to display to the user

**Derivation Logic**:
```javascript
function deriveTimerState(activeFast, currentTime) {
  if (!activeFast) {
    return { display: 'none' };
  }
  
  const elapsed = calculateElapsedTime(
    activeFast.startTime,
    activeFast.startDate,
    currentTime
  );
  
  return {
    display: 'active',
    elapsed: {
      hours: elapsed.hours,
      minutes: elapsed.minutes,
      totalMinutes: elapsed.totalMinutes
    },
    startTime: activeFast.startTime,
    startDate: activeFast.startDate
  };
}
```

**Properties**:
- `display`: 'active' | 'completed' | 'none'
- `elapsed`: { hours, minutes, totalMinutes } | null
- `startTime`: string (HH:mm) | null
- `startDate`: Date | null

**State Location**: React component state (useFastingTimer hook)

**Update Frequency**: Every 60 seconds via setInterval

---

### 3. Milestone

**Description**: Fasting duration threshold achievements

**Predefined Values**:
```javascript
const MILESTONES = [
  { hours: 12, label: '12-Hour Milestone', icon: '🎯' },
  { hours: 16, label: '16-Hour Milestone', icon: '⭐' },
  { hours: 20, label: '20-Hour Milestone', icon: '🏆' },
  { hours: 24, label: '24-Hour Milestone', icon: '🔥' },
  { hours: 36, label: '36-Hour Milestone', icon: '💪' },
  { hours: 48, label: '48-Hour Milestone', icon: '🚀' }
];
```

**Derivation Logic**:
```javascript
function detectMilestones(elapsedMinutes, previousMilestones) {
  const elapsedHours = elapsedMinutes / 60;
  
  const reached = MILESTONES.filter(m => elapsedHours >= m.hours);
  const latest = reached[reached.length - 1];
  const isNew = latest && !previousMilestones.includes(latest.hours);
  
  return {
    reached: reached.map(m => m.hours),
    latest: latest || null,
    isNew,
    shouldAnimate: isNew
  };
}
```

**Properties**:
- `hours`: number - Threshold in hours
- `label`: string - Display text
- `icon`: string - Visual indicator (emoji)

**State Location**: 
- Definitions: Constants (milestoneUtils.js)
- Reached milestones: React component state (array of hour values)

**Persistence**: State resets on page refresh (milestones re-detected based on current elapsed time)

---

### 4. Target Duration

**Description**: Expected fasting goal calculated from user's historical patterns

**Derivation Logic**:
```javascript
function calculateTargetDuration(entries) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const completedFasts = entries
    .filter(e => 
      e.fastingDuration && 
      new Date(e.date) >= thirtyDaysAgo
    )
    .map(e => e.fastingDuration);
  
  if (completedFasts.length < 7) {
    return null; // Insufficient data
  }
  
  // Calculate median
  const sorted = [...completedFasts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  
  return Math.round(median); // Minutes
}
```

**Properties**:
- `minutes`: number | null - Target duration in minutes
- `source`: 'median' | 'insufficient_data'
- `sampleSize`: number - Number of fasts used in calculation

**State Location**: React component state (calculated on mount and when entries change)

**Conditions for Display**:
- Requires minimum 7 completed fasts in last 30 days
- If insufficient: returns null, progress bar hidden

---

### 5. Progress

**Description**: User's advancement toward their target duration

**Derivation Logic**:
```javascript
function calculateProgress(elapsedMinutes, targetMinutes) {
  if (!targetMinutes) {
    return null; // No target available
  }
  
  const percentage = Math.min(
    Math.round((elapsedMinutes / targetMinutes) * 100),
    100
  );
  
  return {
    percentage,
    remaining: Math.max(0, targetMinutes - elapsedMinutes),
    isComplete: elapsedMinutes >= targetMinutes,
    target: targetMinutes
  };
}
```

**Properties**:
- `percentage`: number (0-100) - Progress percentage
- `remaining`: number - Minutes remaining to target
- `isComplete`: boolean - Whether target has been reached
- `target`: number - Target duration in minutes

**State Location**: Derived value (calculated in render from elapsed + target)

**Display Rules**:
- Show progress bar if target exists
- Show hint message if target is null (< 7 historical fasts)
- Cap percentage at 100% (don't show >100% for extended fasts)

---

## Entity Relationships

```
Entry (DB)
   ↓ (derives)
Active Fast (client state)
   ↓ (calculates)
Timer State (client state)
   ├─→ Elapsed Time
   ├─→ Milestones (reached)
   └─→ Progress (if target exists)

Entries[] (DB - historical)
   ↓ (calculates median)
Target Duration (client state)
   ↓ (used by)
Progress (derived value)
```

**Flow**:
1. User creates Entry with lastMealTime → Active Fast derives from Entry
2. Timer State calculates elapsed from Active Fast + current time
3. Milestones detect from elapsed time
4. Target Duration calculates from historical Entries
5. Progress derives from elapsed + target

---

## State Transitions

### Active Fast Status

```
┌─────────┐
│  none   │ ← Initial state (no today's entry)
└────┬────┘
     │ User logs lastMealTime
     ↓
┌─────────┐
│ active  │ ← Timer running
└────┬────┘
     │ User logs firstMealTime
     ↓
┌──────────┐
│completed │ ← Timer stopped
└──────────┘
     │ Entry deleted or new day
     ↓
┌─────────┐
│  none   │
└─────────┘
```

### Timer Display

```
No Entry → display: 'none'
Entry with lastMealTime only → display: 'active'
Entry with firstMealTime → display: 'completed' or 'none'
```

---

## Validation Rules

### Client-Side Validation

**Time Format**:
```javascript
function isValidTimeFormat(timeString) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}
```

**Date Validation**:
```javascript
function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
```

**Elapsed Time Validation**:
```javascript
function isValidElapsedTime(elapsed) {
  return (
    elapsed.totalMinutes >= 0 &&
    !isNaN(elapsed.hours) &&
    !isNaN(elapsed.minutes)
  );
}
```

---

## Error States

| Error Condition | Detection | Handling |
|----------------|-----------|----------|
| Invalid time format | Regex validation fails | Show error message in timer card |
| Missing entry date | entry.date is null/undefined | Hide timer, log error |
| Future start time | Calculated elapsed < 0 | Show "0h 0m" or error message |
| Calculation error | Exception during math | Catch, show error message |
| NaN results | isNaN() check fails | Show error message |

**Error Display**:
```javascript
<div className="timer-card bg-red-50 border-red-200">
  <p className="text-red-800">
    Unable to calculate fasting time. Please check your entry.
  </p>
</div>
```

---

## Performance Considerations

### Memory Footprint
- Timer state: ~100 bytes (elapsed time object)
- Milestone state: ~50 bytes (array of numbers)
- Target duration: ~20 bytes (single number)
- Progress: ~80 bytes (derived object)
- **Total**: < 1KB per timer instance

### Computation Complexity
- `calculateElapsedTime()`: O(1) - simple Date arithmetic
- `detectMilestones()`: O(6) - 6 predefined milestones
- `calculateTargetDuration()`: O(n) - where n = entries in last 30 days
- `calculateProgress()`: O(1) - simple percentage calculation

**Optimization**: Calculate target duration once on mount, recalculate only when entries array changes

---

## Testing Data Scenarios

### Test Entry Data

**Scenario 1: Active Fast**
```javascript
{
  userId: "user123",
  date: new Date(), // Today
  lastMealTime: "18:00",
  firstMealTime: null,
  fastingDuration: null
}
// Expected: Timer shows elapsed time since 18:00 today
```

**Scenario 2: Completed Fast**
```javascript
{
  userId: "user123",
  date: new Date(), // Today
  lastMealTime: "18:00",
  firstMealTime: "10:00",
  fastingDuration: 960 // 16 hours
}
// Expected: No timer displayed (fast already complete)
```

**Scenario 3: Insufficient History**
```javascript
entries = [
  { fastingDuration: 960, date: yesterday },
  { fastingDuration: 840, date: twoDaysAgo }
] // Only 2 entries
// Expected: Timer shows, no progress bar, hint message displayed
```

**Scenario 4: Sufficient History**
```javascript
entries = [
  { fastingDuration: 960, date: day1 },
  { fastingDuration: 900, date: day2 },
  { fastingDuration: 1020, date: day3 },
  { fastingDuration: 840, date: day4 },
  { fastingDuration: 960, date: day5 },
  { fastingDuration: 1080, date: day6 },
  { fastingDuration: 900, date: day7 }
] // 7 entries
// Expected: Timer shows with progress bar, target = 960 minutes (median)
```

---

## Summary

**Database Changes**: ✅ None - uses existing Entry schema  
**New Collections**: ❌ None  
**Migrations**: ❌ Not required  
**Client-Side Entities**: 5 (Active Fast, Timer State, Milestone, Target Duration, Progress)  
**State Management**: React hooks (useState, useEffect, useMemo)  
**Data Flow**: Entry (DB) → Client State → Derived Values → UI  

**Next Steps**: Generate API contracts (if needed) and quickstart.md
