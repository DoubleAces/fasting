# API Contracts: Live Fasting Timer

**Feature**: 017-live-fasting-timer  
**Date**: October 27, 2025  
**Status**: Not Applicable

## Overview

**No new API contracts are required for this feature.**

The live fasting timer is a **client-side only** feature that:
1. Uses existing Entry data fetched by the entries page
2. Performs all calculations in the browser
3. Does not require new API endpoints
4. Does not modify existing API contracts

---

## Existing API Dependencies

The timer integrates with existing API routes but does not modify them:

### GET /api/entries

**Current Contract** (unchanged):
```
GET /api/entries

Response: 200 OK
{
  "entries": [
    {
      "_id": "string",
      "userId": "string",
      "date": "ISO-8601 date string",
      "lastMealTime": "HH:mm string",
      "firstMealTime": "HH:mm string | null",
      "fastingDuration": "number | null",
      ...other fields
    }
  ]
}
```

**Usage by Timer**:
- Entries page already fetches all entries on mount
- Timer derives active fast from this existing data
- No additional fetch calls required

### POST /api/entries

**Current Contract** (unchanged):
```
POST /api/entries

Request Body:
{
  "date": "ISO-8601 date string",
  "lastMealTime": "HH:mm string",
  "firstMealTime": "HH:mm string | optional",
  ...other fields
}

Response: 201 Created
{
  "entry": { ...created entry }
}
```

**Integration with Timer**:
- When user creates entry with lastMealTime, entries page refetches
- Timer component receives new entries prop and recalculates
- No changes to POST endpoint needed

### PUT /api/entries/[id]

**Current Contract** (unchanged):
```
PUT /api/entries/:id

Request Body:
{
  "lastMealTime": "HH:mm string | optional",
  "firstMealTime": "HH:mm string | optional",
  ...other fields
}

Response: 200 OK
{
  "entry": { ...updated entry }
}
```

**Integration with Timer**:
- When user edits entry (adds firstMealTime to break fast), entries page refetches
- Timer component receives updated entries and recalculates/hides
- No changes to PUT endpoint needed

### DELETE /api/entries/[id]

**Current Contract** (unchanged):
```
DELETE /api/entries/:id

Response: 204 No Content
```

**Integration with Timer**:
- When user deletes today's entry, entries page refetches
- Timer detects no active fast and hides
- No changes to DELETE endpoint needed

---

## Client-Side Only Operations

All timer operations occur in the browser:

### Timer Calculation
```javascript
// Pure function - no API call
function calculateElapsedTime(lastMealTime, entryDate) {
  const now = new Date();
  const lastMeal = parseDateTime(lastMealTime, entryDate);
  const elapsedMs = now - lastMeal;
  
  return {
    hours: Math.floor(elapsedMs / 3600000),
    minutes: Math.floor((elapsedMs % 3600000) / 60000),
    totalMinutes: Math.floor(elapsedMs / 60000)
  };
}
```

### Milestone Detection
```javascript
// Pure function - no API call
function detectMilestones(elapsedMinutes) {
  const MILESTONES = [12, 16, 20, 24, 36, 48];
  const elapsedHours = elapsedMinutes / 60;
  
  return MILESTONES.filter(hours => elapsedHours >= hours);
}
```

### Progress Calculation
```javascript
// Uses entries from existing API - no new endpoint
function calculateTargetDuration(entries) {
  const recentFasts = entries
    .filter(e => isWithinLast30Days(e.date) && e.fastingDuration)
    .map(e => e.fastingDuration);
  
  if (recentFasts.length < 7) return null;
  
  return calculateMedian(recentFasts);
}
```

---

## Data Flow Diagram

```
┌──────────────────┐
│   Entries Page   │
│ (existing code)  │
└────────┬─────────┘
         │
         │ 1. Fetch entries (existing API)
         │
         ↓
┌──────────────────┐
│  GET /api/entries│ ← Existing endpoint, no changes
└────────┬─────────┘
         │
         │ 2. Response with entries array
         │
         ↓
┌──────────────────┐
│  Timer Component │
│  (new, client)   │
└────────┬─────────┘
         │
         │ 3. Derive active fast from entries
         │ 4. Calculate elapsed time (client-side)
         │ 5. Detect milestones (client-side)
         │ 6. Calculate progress (client-side)
         │
         ↓
┌──────────────────┐
│   Render Timer   │
│      (UI)        │
└──────────────────┘
```

---

## Why No API Changes?

1. **Existing Data Sufficient**: Entry model already contains all required fields (lastMealTime, firstMealTime, date, fastingDuration)

2. **Client-Side Calculation**: Timer logic is pure calculation - no need for server processing

3. **Real-Time Updates**: Timer updates every 60 seconds based on client clock, not server events

4. **No Persistence**: Timer state is ephemeral - recalculated from entries each time

5. **Performance**: Client-side calculation reduces server load, no additional network calls

6. **Simplicity**: Following constitution principle of YAGNI (You Aren't Gonna Need It) - no API needed

---

## Future API Considerations

**Deferred to future enhancements** (marked out-of-scope in spec):

### Push Notifications API (Future)
```
POST /api/notifications/milestones
{
  "userId": "string",
  "milestone": number,
  "timestamp": "ISO-8601"
}
```
*Not needed for MVP - visual indicators only*

### Custom Milestone Settings API (Future)
```
PUT /api/users/settings
{
  "customMilestones": [8, 14, 20]
}
```
*Not needed for MVP - using predefined milestones*

### Timer Analytics API (Future)
```
POST /api/analytics/timer-view
{
  "userId": "string",
  "duration": number,
  "milestone": number
}
```
*Not needed for MVP - no tracking per spec*

---

## Summary

✅ **No new API endpoints required**  
✅ **No modifications to existing endpoints**  
✅ **Client-side only feature**  
✅ **Uses existing Entry data**  
✅ **Follows YAGNI principle**  

**Next Steps**: Generate quickstart.md for developer onboarding
