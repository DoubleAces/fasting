# Data Model: Extended Fast Date/Time Range Display

**Feature**: Add date/time range display to extended fast confirmation prompts  
**Date**: October 26, 2025

## Overview

This feature is a pure UI enhancement with **no database schema changes** required. All necessary data already exists in the application and is available in component state. This document describes the data structures used for rendering date/time ranges.

---

## Existing Data Structures (Unchanged)

### 1. Entry Model (MongoDB/Mongoose)

**Schema**: `src/lib/models/Entry.js`

**Relevant Fields** (no changes):
```javascript
{
  date: Date,              // Entry date (ISO format in DB)
  firstMealTime: String,   // "HH:mm" format (24-hour)
  lastMealTime: String,    // "HH:mm" format (24-hour)
  extendedFastConfirmed: Boolean,  // User confirmed extended fast
  // ... other fields unchanged
}
```

**Usage**: Entry dates and meal times are queried by `/api/entries/check-previous` to detect extended fasts.

---

### 2. Gap Info Structure (API Response)

**Source**: `/api/entries/check-previous` endpoint  
**Location**: Stored in `gapInfo` component state

**Structure** (existing, no changes):
```javascript
{
  // Extended fast detection flags
  isExtendedFast: Boolean,           // Any extended fast detected (>24 hours)
  isExtendedFastFromPrevious: Boolean,  // Gap from previous entry >24h
  isExtendedFastToNext: Boolean,     // Gap to next entry >24h
  extendedFastDirection: String,     // 'from-previous' | 'to-next' | 'both' | null
  
  // Previous entry data (for "from-previous" extended fasts)
  previousEntry: {
    _id: String,           // MongoDB ObjectId
    date: String,          // ISO date string (e.g., "2025-10-22T00:00:00.000Z")
    lastMealTime: String,  // "HH:mm" format (e.g., "18:00")
  },
  
  // Next entry data (for "to-next" extended fasts, may be null)
  nextEntry: {
    _id: String,           // MongoDB ObjectId  
    date: String,          // ISO date string
    firstMealTime: String, // "HH:mm" format
  },
  
  // Fasting duration calculations (existing, used for duration display)
  fromPreviousFasting: {
    hours: Number,         // e.g., 26
    minutes: Number,       // e.g., 0
    totalMinutes: Number,  // e.g., 1560
    formatted: String,     // e.g., "26 hours" (current display)
  },
  
  toNextFasting: {
    hours: Number,
    minutes: Number,
    totalMinutes: Number,
    formatted: String,
  },
  
  // Gap detection (days between entries)
  hasPreviousEntry: Boolean,
  hasGap: Boolean,
  daysSinceLast: Number,
}
```

**Usage**: This structure is already populated and available in EntryForm component state. Feature will use `previousEntry.date`, `previousEntry.lastMealTime`, `nextEntry.date`, `nextEntry.firstMealTime` to construct date/time ranges.

---

### 3. Form Data Structure (Component State)

**Location**: `formData` state in EntryForm.js

**Relevant Fields** (existing, no changes):
```javascript
{
  date: String,              // "YYYY-MM-DD" format from DateInput
  firstMealTime: String,     // "HH:mm" format from TimeInput
  lastMealTime: String,      // "HH:mm" format from TimeInput
  extendedFastFromPreviousConfirmed: Boolean,
  extendedFastToNextConfirmed: Boolean,
  // ... other form fields
}
```

**Usage**: Current entry's date and meal times used as "end" point for "from-previous" prompts and "start" point for "to-next" prompts.

---

### 4. User Settings (Props)

**Location**: `settings` prop passed to EntryForm  
**Relevant Fields** (existing, no changes):
```javascript
{
  timeFormat: String,  // "12h" or "24h" - user's time display preference
  measurementSystem: String,  // "metric" or "imperial" (unused by this feature)
}
```

**Usage**: `settings.timeFormat` determines whether to display times in 12-hour format with AM/PM or 24-hour format.

---

## New Helper Functions (UI Layer Only)

These functions transform existing data for display purposes. They do not modify state or database.

### formatDateToDayMonth(dateString)

**Purpose**: Convert ISO date string to "22 Oct" format

**Input**: 
- `dateString`: ISO date string (e.g., "2025-10-22T00:00:00.000Z" or "2025-10-22")

**Output**: 
- String in "DD Mon" format (e.g., "22 Oct")

**Logic**:
```javascript
const formatDateToDayMonth = (dateString) => {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short' 
  });
  // Result is "Oct 22", swap to "22 Oct"
  const [month, day] = formatted.split(' ');
  return `${day} ${month}`;
};
```

**Edge Cases**:
- Always uses 'en-US' locale for consistent month abbreviations
- Two-digit day padding handled by `toLocaleDateString` options
- Works for all months (Jan, Feb, Mar, ..., Dec)

---

### formatTimeByPreference(time24h, format)

**Purpose**: Convert 24-hour time string to user's preferred format (12h or 24h)

**Input**:
- `time24h`: String in "HH:mm" format (e.g., "18:00", "09:30")
- `format`: String, either "12h" or "24h" from `settings.timeFormat`

**Output**:
- String in requested format:
  - 12h: "6:00 PM", "9:30 AM", "12:00 PM" (no leading zero per clarification)
  - 24h: "18:00", "9:30", "12:00" (no leading zero per clarification)

**Logic**:
```javascript
const formatTimeByPreference = (time24h, format) => {
  const [hours, minutes] = time24h.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0→12, 13→1, etc.
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // 24h format - no leading zero for hours per clarification
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
```

**Edge Cases**:
- Midnight (00:00): "12:00 AM" (12h) or "0:00" (24h)
- Noon (12:00): "12:00 PM" (12h) or "12:00" (24h)
- Single-digit hours: 9 displays as "9" not "09" (per clarification)
- Minutes always zero-padded: "9:05" not "9:5"

---

## Date/Time Range Construction

### "From-Previous" Extended Fast Prompt

**Data Sources**:
- Start date: `gapInfo.previousEntry.date` (ISO string)
- Start time: `gapInfo.previousEntry.lastMealTime` ("HH:mm")
- End date: `formData.date` ("YYYY-MM-DD")
- End time: `formData.firstMealTime` ("HH:mm")

**Display Logic**:
```javascript
const startDate = formatDateToDayMonth(gapInfo.previousEntry.date);
const startTime = formatTimeByPreference(gapInfo.previousEntry.lastMealTime, timeFormat);
const endDate = formatDateToDayMonth(formData.date);
const endTime = formatTimeByPreference(formData.firstMealTime, timeFormat);

const dateTimeRange = `${startDate} at ${startTime} → ${endDate} at ${endTime}`;
// Example: "22 Oct at 18:00 → 23 Oct at 20:00" (24h format)
// Example: "22 Oct at 6:00 PM → 23 Oct at 8:00 PM" (12h format)
```

**Display in Prompt**:
```
Extended fast detected (26 hours):
22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?
```

---

### "To-Next" Extended Fast Prompt

**Data Sources**:
- Start date: `formData.date` ("YYYY-MM-DD")
- Start time: `formData.lastMealTime` ("HH:mm")
- End date: `gapInfo.nextEntry.date` (ISO string, may be null)
- End time: `gapInfo.nextEntry.firstMealTime` ("HH:mm", may be null)

**Display Logic**:
```javascript
if (gapInfo.nextEntry) {
  const startDate = formatDateToDayMonth(formData.date);
  const startTime = formatTimeByPreference(formData.lastMealTime, timeFormat);
  const endDate = formatDateToDayMonth(gapInfo.nextEntry.date);
  const endTime = formatTimeByPreference(gapInfo.nextEntry.firstMealTime, timeFormat);
  
  const dateTimeRange = `${startDate} at ${startTime} → ${endDate} at ${endTime}`;
}
// If nextEntry null (shouldn't happen when to-next prompt shows), fall back to duration only
```

**Display in Prompt**:
```
Extended fast detected (48 hours):
22 Oct at 18:00 → 24 Oct at 18:00. Did you fast continuously?
```

---

## Component State Flow (No Changes to State Structure)

**Existing Flow** (unchanged):
1. User submits form → `handleSubmit()` called
2. Form validation passes → API call to `/api/entries/check-previous`
3. Response stored in `gapInfo` state
4. If `isExtendedFastFromPrevious` true → `setShowExtendedFastPrompt(true)`, `setCurrentPromptType('from-previous')`
5. Prompt renders using `gapInfo` and `formData`
6. User clicks confirm/deny → API saves entry → success callback

**Enhanced Rendering** (only change):
- Step 5: Prompt now displays **both** duration (from `gapInfo.fromPreviousFasting.formatted`) **and** date/time range (computed from `gapInfo.previousEntry` + `formData`)

---

## Data Validation (No New Validation Required)

### Existing Validation (Sufficient)

**Date Validation** (already in place):
- Dates must be in the past or today (no future dates)
- Dates stored as Date objects in database, ISO strings in API responses
- Date formatting handles all valid dates correctly

**Time Validation** (already in place):
- Times must be in "HH:mm" format (24-hour)
- lastMealTime must be after firstMealTime (same-day validation)
- Times are strings, not Date objects (no timezone issues)

**Extended Fast Detection** (already in place):
- Only prompts shown when previous/next entry data complete (no missing meal times)
- Duration calculation validates time ranges (no negative durations)

**No Additional Validation Needed**:
- Date/time formatting is display-only (does not affect data integrity)
- Invalid data cannot reach rendering (API validation prevents it)
- Fallback to duration-only display if date/time data somehow incomplete (defensive programming)

---

## Database Impact

**Schema Changes**: None  
**New Collections**: None  
**New Indexes**: None  
**Migration Required**: No

**Rationale**: All necessary data already exists in Entry documents and is already queried by `/api/entries/check-previous`. Feature only enhances how this existing data is displayed in the UI.

---

## API Impact

**New Endpoints**: None  
**Modified Endpoints**: None  
**Response Changes**: None

**Rationale**: `/api/entries/check-previous` already returns `previousEntry.date`, `previousEntry.lastMealTime`, `nextEntry.date`, `nextEntry.firstMealTime` in its response. No API changes needed.

---

## Summary

This feature requires:
- ✅ Zero database schema changes
- ✅ Zero API endpoint changes
- ✅ Zero new data structures
- ✅ Two pure UI helper functions (date/time formatting)
- ✅ Enhanced rendering logic in existing extended fast prompt

All data dependencies satisfied by existing structures. Feature is purely additive and does not modify any existing data flows or state management patterns.
