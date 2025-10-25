# API Contracts: Inline Extended Fast Confirmation

**Feature**: 013-inline-fast-confirmation  
**Date**: October 25, 2025  
**Status**: No changes - using existing APIs

## Overview

This feature uses existing API endpoints without modifications. This document serves as reference for the APIs involved in the extended fast confirmation flow.

---

## API Endpoints

### 1. Check Previous Entry (Extended Fast Detection)

**Purpose**: Detect if current entry creates extended fasting periods (24+ hours) with adjacent entries

**Endpoint**: `GET /api/entries/check-previous`

**Method**: GET

**Authentication**: Required (session token)

**Query Parameters**:
```typescript
{
  date: string;           // Format: 'YYYY-MM-DD' (e.g., '2025-10-25')
  firstMealTime: string;  // Format: 'HH:mm' or ISO 8601
  lastMealTime: string;   // Format: 'HH:mm' or ISO 8601
}
```

**Success Response** (200 OK):
```typescript
{
  // Overall detection
  isExtendedFast: boolean;              // True if ANY extended fast detected
  isExtendedFastFromPrevious: boolean;  // True if 24+ hours from previous entry
  isExtendedFastToNext: boolean;        // True if 24+ hours to next entry
  
  // Duration details (if isExtendedFastFromPrevious === true)
  fromPreviousFasting?: {
    hours: number;        // e.g., 26
    minutes: number;      // e.g., 30 (total: 26h 30m)
    formatted: string;    // e.g., '26h 30m'
  };
  
  // Duration details (if isExtendedFastToNext === true)
  toNextFasting?: {
    hours: number;        // e.g., 30
    minutes: number;      // e.g., 15
    formatted: string;    // e.g., '30h 15m'
  };
  
  // Previous entry reference (if exists)
  previousEntry?: {
    _id: string;              // MongoDB ObjectId
    date: string;             // 'YYYY-MM-DD'
    lastMealTime: string;     // 'HH:mm'
    firstMealTime?: string;   // Optional (for context)
  };
  
  // Next entry reference (if exists)
  nextEntry?: {
    _id: string;              // MongoDB ObjectId
    date: string;             // 'YYYY-MM-DD'
    firstMealTime: string;    // 'HH:mm'
    lastMealTime?: string;    // Optional (for context)
  };
}
```

**Example Response**:
```json
{
  "isExtendedFast": true,
  "isExtendedFastFromPrevious": true,
  "isExtendedFastToNext": false,
  "fromPreviousFasting": {
    "hours": 26,
    "minutes": 30,
    "formatted": "26h 30m"
  },
  "previousEntry": {
    "_id": "6713f8e4b6d1d318cace7ba8",
    "date": "2025-10-23",
    "lastMealTime": "20:00"
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request** (invalid parameters):
```json
{
  "error": "Invalid date or time format"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to check previous entries"
}
```

**Usage in Feature**:
- Called when user clicks "Update Entry" button
- Response stored in `gapInfo` state
- If `isExtendedFast === true`, show inline confirmation buttons
- Duration and entry details displayed in confirmation prompt

**Rate Limiting**: None (authenticated users only)

**Caching**: None (real-time detection required)

---

### 2. Update Entry

**Purpose**: Update existing fasting entry with optional extended fast confirmation flags

**Endpoint**: `PUT /api/entries/[id]`

**Method**: PUT

**Authentication**: Required (session token)

**Path Parameters**:
```typescript
{
  id: string;  // MongoDB ObjectId of entry to update
}
```

**Request Body**:
```typescript
{
  // Required fields
  date: string;           // ISO 8601 date string
  firstMealTime: string;  // ISO 8601 datetime string
  lastMealTime: string;   // ISO 8601 datetime string
  
  // Extended fast confirmation (optional, defaults to false)
  extendedFastConfirmed?: boolean;              // User confirmed 24+ hour continuous fast
  extendedFastDenied?: boolean;                 // User denied continuous fast (ate but didn't log)
  extendedFastFromPreviousConfirmed?: boolean;  // Confirmed fast from previous entry
  extendedFastToNextDenied?: boolean;           // Denied fast to next entry
  
  // Optional tracking fields
  hoursOfSleep?: number;       // 0-24
  morningWeight?: number;      // Positive number, kg or lbs
  hungerLevel?: 'Low' | 'Medium' | 'High';
  energyLevel?: 'Low Energy' | 'Medium Energy' | 'High Energy';
  wellBeing?: 'Poor' | 'Fair' | 'Good';
  foodNotes?: string;          // Max 2000 characters
}
```

**Example Request**:
```json
{
  "date": "2025-10-25T00:00:00.000Z",
  "firstMealTime": "2025-10-25T12:00:00.000Z",
  "lastMealTime": "2025-10-25T20:00:00.000Z",
  "extendedFastConfirmed": true,
  "extendedFastFromPreviousConfirmed": true,
  "hoursOfSleep": 7.5,
  "morningWeight": 75.3,
  "hungerLevel": "Medium",
  "energyLevel": "Medium Energy",
  "wellBeing": "Good",
  "foodNotes": "Had a light breakfast"
}
```

**Success Response** (200 OK):
```typescript
{
  success: true;
  data: {
    _id: string;
    userId: string;
    date: string;  // ISO 8601
    firstMealTime: string;  // ISO 8601
    lastMealTime: string;   // ISO 8601
    fastingDuration: number;  // Minutes
    extendedFastConfirmed: boolean;
    extendedFastDenied: boolean;
    extendedFastFromPreviousConfirmed: boolean;
    extendedFastToNextDenied: boolean;
    hoursOfSleep?: number;
    morningWeight?: number;
    hungerLevel?: string;
    energyLevel?: string;
    wellBeing?: string;
    foodNotes?: string;
    createdAt: string;  // ISO 8601
    updatedAt: string;  // ISO 8601
  };
}
```

**Example Success Response**:
```json
{
  "success": true,
  "data": {
    "_id": "6713f8e4b6d1d318cace7ba9",
    "userId": "6713f8e4b6d1d318cace7ba0",
    "date": "2025-10-25T00:00:00.000Z",
    "firstMealTime": "2025-10-25T12:00:00.000Z",
    "lastMealTime": "2025-10-25T20:00:00.000Z",
    "fastingDuration": 960,
    "extendedFastConfirmed": true,
    "extendedFastDenied": false,
    "extendedFastFromPreviousConfirmed": true,
    "extendedFastToNextDenied": false,
    "hoursOfSleep": 7.5,
    "morningWeight": 75.3,
    "hungerLevel": "Medium",
    "energyLevel": "Medium Energy",
    "wellBeing": "Good",
    "foodNotes": "Had a light breakfast",
    "createdAt": "2025-10-25T08:30:00.000Z",
    "updatedAt": "2025-10-25T10:15:00.000Z"
  }
}
```

**Error Responses**:

**401 Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden** (user doesn't own entry):
```json
{
  "error": "Forbidden"
}
```

**404 Not Found**:
```json
{
  "error": "Entry not found"
}
```

**400 Bad Request** (validation error):
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "firstMealTime",
      "message": "First meal time is required"
    },
    {
      "field": "lastMealTime",
      "message": "Last meal time must be after first meal time"
    }
  ]
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to update entry"
}
```

**Usage in Feature**:
- Called by `submitForm()` function after validation passes
- Triggered by:
  - User clicking "Update Entry" button (no extended fast)
  - User clicking "Yes, confirm extended fast" (extendedFastConfirmed: true)
  - User clicking "No, I ate but didn't log" (extendedFastDenied: true)
- Response redirects user to entry details page on success
- Error response displays message above confirmation buttons

**Rate Limiting**: None (authenticated users only)

**Idempotency**: Yes (multiple identical updates result in same state)

---

## Request Flow

### Scenario 1: Non-Extended Fast (Standard Flow)

```
User edits entry → Clicks "Update Entry"
    ↓
GET /api/entries/check-previous?date=2025-10-25&firstMealTime=12:00&lastMealTime=20:00
    ↓
Response: { isExtendedFast: false }
    ↓
PUT /api/entries/6713f8e4b6d1d318cace7ba9
Body: { date, firstMealTime, lastMealTime, ... }
    ↓
Response: { success: true, data: Entry }
    ↓
Redirect to /entries/6713f8e4b6d1d318cace7ba9
```

### Scenario 2: Extended Fast (One Confirmation)

```
User edits entry → Clicks "Update Entry"
    ↓
GET /api/entries/check-previous?date=2025-10-25&firstMealTime=12:00&lastMealTime=20:00
    ↓
Response: { 
  isExtendedFast: true, 
  isExtendedFastFromPrevious: true,
  fromPreviousFasting: { hours: 26, minutes: 30, formatted: '26h 30m' },
  previousEntry: { _id: '...', date: '2025-10-23', lastMealTime: '20:00' }
}
    ↓
Show confirmation buttons inline (replace "Update Entry" button)
    ↓
User clicks "Yes, confirm extended fast"
    ↓
PUT /api/entries/6713f8e4b6d1d318cace7ba9
Body: { 
  date, firstMealTime, lastMealTime,
  extendedFastConfirmed: true,
  extendedFastFromPreviousConfirmed: true,
  ...
}
    ↓
Response: { success: true, data: Entry }
    ↓
Redirect to /entries/6713f8e4b6d1d318cace7ba9
```

### Scenario 3: Extended Fast (Two Confirmations)

```
User edits entry → Clicks "Update Entry"
    ↓
GET /api/entries/check-previous?date=2025-10-24&firstMealTime=12:00&lastMealTime=20:00
    ↓
Response: { 
  isExtendedFast: true, 
  isExtendedFastFromPrevious: true,
  isExtendedFastToNext: true,
  fromPreviousFasting: { hours: 26, minutes: 30, formatted: '26h 30m' },
  toNextFasting: { hours: 30, minutes: 15, formatted: '30h 15m' },
  previousEntry: { _id: '...', date: '2025-10-22', lastMealTime: '20:00' },
  nextEntry: { _id: '...', date: '2025-10-26', firstMealTime: '10:15' }
}
    ↓
Show first confirmation inline ("from previous" prompt)
    ↓
User clicks "Yes, confirm extended fast"
    ↓
Update state, show second confirmation inline ("to next" prompt)
    ↓
User clicks "No, I ate but didn't log"
    ↓
PUT /api/entries/6713f8e4b6d1d318cace7ba9
Body: { 
  date, firstMealTime, lastMealTime,
  extendedFastConfirmed: true,
  extendedFastFromPreviousConfirmed: true,
  extendedFastToNextDenied: true,
  ...
}
    ↓
Response: { success: true, data: Entry }
    ↓
Redirect to /entries/6713f8e4b6d1d318cace7ba9
```

---

## Security

### Authentication
- All endpoints require valid session token (NextAuth.js)
- User ID extracted from session, not from request body
- Entry ownership verified before update (userId match)

### Authorization
- Users can only update their own entries
- 403 Forbidden returned if userId doesn't match entry owner

### Input Validation
- All dates validated (not in future)
- Time values validated (firstMealTime < lastMealTime)
- String lengths enforced (foodNotes max 2000 chars)
- Enum values validated (hungerLevel, energyLevel, wellBeing)
- Boolean flags validated (extended fast confirmations)

### Rate Limiting
- None currently (low traffic application)
- Can add if abuse detected (e.g., 100 requests/minute per user)

---

## Testing Contract Compliance

### Check Previous API Tests

**Existing tests** (src/app/api/entries/check-previous/route.test.js):
- ✅ Returns empty response when no previous entry
- ✅ Detects extended fast (24+ hours)
- ✅ Calculates duration correctly
- ✅ Returns previous entry details
- ✅ Returns next entry details
- ✅ Handles multiple scenarios (from previous, to next, both)

**No new tests required** - API unchanged

### Update Entry API Tests

**Existing tests** (src/app/api/entries/[id]/route.test.js):
- ✅ Requires authentication
- ✅ Validates required fields
- ✅ Validates ownership (403 if not owner)
- ✅ Saves extended fast confirmation flags
- ✅ Returns updated entry
- ✅ Handles validation errors (400)

**No new tests required** - API unchanged

---

## Backwards Compatibility

### API Version
- No versioning (internal API, not public)
- All changes are additive (new optional fields)
- No breaking changes

### Client Compatibility
- Old clients (pre-feature): Will not send extended fast flags, defaults to false ✅
- New clients (post-feature): Send flags when detected, backwards compatible ✅
- Mixed deployment: Safe (optional fields ignored if not understood)

### Database Compatibility
- Extended fast fields already exist in schema
- Default values (false) ensure old entries remain valid
- No migration required

---

## Monitoring & Observability

### Metrics (Future Enhancement)
- Extended fast detection rate (% of entries with 24+ hour gaps)
- Confirmation vs denial rate (user behavior insights)
- Average response time for check-previous API
- Error rate for validation failures

### Logging
- API errors logged to console (server-side)
- Client errors logged to console (browser dev tools)
- No sensitive data logged (PII protected)

---

## Summary

### API Changes: None
- ✅ No new endpoints
- ✅ No modified request/response formats
- ✅ No breaking changes
- ✅ No versioning needed

### Feature Integration: Seamless
- Uses existing `/api/entries/check-previous` for detection
- Uses existing `PUT /api/entries/[id]` for updates
- Confirmation flags already supported in schema and validation
- No backend changes required for UI repositioning

### Testing Impact: Minimal
- No new API tests needed (existing coverage sufficient)
- Component tests updated for new UI behavior
- Integration tests unchanged (same API contracts)

---

## References

- **Check Previous API**: `src/app/api/entries/check-previous/route.js`
- **Update Entry API**: `src/app/api/entries/[id]/route.js`
- **Entry Model**: `src/lib/models/Entry.js`
- **Validation Schema**: `src/lib/validation/entrySchema.js`
- **API Tests**: `tests/integration/api/` (if they exist)
