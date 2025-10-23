# API Contract: Backfill Fasting Duration Calculation

**Feature**: 009-backfill-fasting-calculation  
**Date**: October 23, 2025  

## Overview

This feature modifies the behavior of an existing API endpoint. The contract (request/response format) **remains unchanged** - only the side effects are enhanced.

## Modified Endpoint

### POST /api/entries

**Purpose**: Create a new daily fasting entry

**Authentication**: Required (session-based via NextAuth)

**Changes**: After creating an entry, the system now also updates the immediate next entry's fasting duration if one exists.

#### Request

**Method**: `POST`  
**Path**: `/api/entries`  
**Content-Type**: `application/json`

**Request Body** (UNCHANGED):
```json
{
  "date": "2025-10-17",
  "firstMealTime": "12:00",
  "lastMealTime": "20:00",
  "hoursOfSleep": 7.5,
  "morningWeight": 75.5,
  "hungerLevel": "Medium",
  "energyLevel": "High Energy",
  "wellBeing": "Good",
  "foodNotes": "Oatmeal for breakfast",
  "extendedFastConfirmed": false
}
```

**Required Fields**:
- `date` - ISO date string (YYYY-MM-DD)
- `firstMealTime` - Time in HH:mm format
- `lastMealTime` - Time in HH:mm format

**Optional Fields**:
- `hoursOfSleep` - Number (0-24)
- `morningWeight` - Number (kg)
- `hungerLevel` - Enum: "Low" | "Medium" | "High"
- `energyLevel` - Enum: "Low Energy" | "Medium Energy" | "High Energy"
- `wellBeing` - Enum: "Poor" | "Fair" | "Good"
- `foodNotes` - String (max 2000 chars)
- `extendedFastConfirmed` - Boolean

#### Response

**Success Response** (201 Created) - UNCHANGED:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "date": "2025-10-17T00:00:00.000Z",
  "firstMealTime": "12:00",
  "lastMealTime": "20:00",
  "fastingDuration": null,
  "hoursOfSleep": 7.5,
  "morningWeight": 75.5,
  "hungerLevel": "Medium",
  "energyLevel": "High Energy",
  "wellBeing": "Good",
  "foodNotes": "Oatmeal for breakfast",
  "extendedFastConfirmed": false,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "updatedAt": "2025-10-17T10:30:00.000Z"
}
```

**Error Responses** (UNCHANGED):

**400 Bad Request** - Validation error:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "firstMealTime",
      "message": "First meal time must be in HH:mm format"
    }
  ]
}
```

**401 Unauthorized** - Not authenticated:
```json
{
  "error": "Authentication required"
}
```

**409 Conflict** - Duplicate entry:
```json
{
  "error": "An entry for this date already exists"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "error": "Internal server error",
  "message": "Could not create entry"
}
```

## Side Effect Changes

### NEW Behavior: Cascade Update

After successfully creating an entry, the system now performs an additional operation:

**Action**: Find and update the immediate next entry's fasting duration

**Pseudo-code**:
```
1. Create entry (existing behavior)
2. IF entry.lastMealTime exists:
   a. Find next entry: Entry.findOne({ userId, date: { $gt: entryDate } }).sort({ date: 1 }).limit(1)
   b. IF next entry exists AND next entry.firstMealTime exists:
      - Calculate fasting duration between entry.lastMealTime and nextEntry.firstMealTime
      - Update nextEntry.fastingDuration = calculated value
   c. ELSE:
      - No update needed
3. Return created entry (unchanged response)
```

**Important Notes**:
- This operation is **silent** from the API client's perspective
- The response **does not** include the updated next entry
- If cascade update fails, entry creation still succeeds (logged server-side)
- Client must refetch entries to see updated fasting durations

### Example Scenario

**Initial State**: User has entry for Oct 18 with `fastingDuration: null`

**API Call**:
```bash
POST /api/entries
{
  "date": "2025-10-17",
  "firstMealTime": "10:00",
  "lastMealTime": "20:00"
}
```

**Response** (201):
```json
{
  "_id": "...",
  "date": "2025-10-17T00:00:00.000Z",
  "firstMealTime": "10:00",
  "lastMealTime": "20:00",
  "fastingDuration": null,  // Correct - no previous entry
  // ... other fields
}
```

**Side Effect** (not in response):
- Oct 18 entry's `fastingDuration` updated from `null` to `960` (16 hours)

**To See Update**: Client must GET /api/entries to fetch updated Oct 18 entry

## No Other Endpoints Modified

All other API endpoints remain unchanged:
- `GET /api/entries` - No changes
- `GET /api/entries/[id]` - No changes
- `PUT /api/entries/[id]` - No changes (already has cascade logic)
- `DELETE /api/entries/[id]` - No changes (already has cascade logic)
- `GET /api/settings` - No changes
- `PUT /api/settings` - No changes

## Backward Compatibility

**✅ Fully Backward Compatible**

- Request format unchanged
- Response format unchanged
- Error responses unchanged
- Only side effect behavior enhanced
- Existing clients require no modifications
- No breaking changes

## Testing Contract

### Test Cases for Modified Behavior

**Test 1: Verify Cascade Happens**
```javascript
// 1. Create entry for Day 2
POST /api/entries { date: '2025-10-18', firstMealTime: '12:00', lastMealTime: '20:00' }
// Assert: Response shows fastingDuration: null

// 2. Create entry for Day 1
POST /api/entries { date: '2025-10-17', firstMealTime: '10:00', lastMealTime: '20:00' }
// Assert: Response shows Day 1 with fastingDuration: null

// 3. Fetch Day 2 entry
GET /api/entries (or filter for Oct 18)
// Assert: Day 2 now has fastingDuration: 960 (16 hours)
```

**Test 2: Verify Gap Handling**
```javascript
// Setup: Create Day 1 and Day 5
// Action: Create Day 2
// Assert: Day 5's fasting NOT recalculated (gap too large for immediate next)
```

**Test 3: Verify No Regression**
```javascript
// Test all existing POST /api/entries test cases
// Assert: All pass with no changes to request/response
```

## Summary

| Aspect | Status |
|--------|--------|
| Request Format | Unchanged |
| Response Format | Unchanged |
| HTTP Status Codes | Unchanged |
| Error Messages | Unchanged |
| Authentication | Unchanged |
| Side Effects | Enhanced (cascade update added) |
| Breaking Changes | None |
| Client Updates Required | None |
