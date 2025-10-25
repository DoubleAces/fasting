# API Contracts: Entry Details Page

**Date**: October 24, 2025  
**Feature**: Entry Details Page  
**Phase**: 1 - Design & Contracts

## Overview

Entry Details page primarily uses Next.js Server Components for data fetching (direct database queries) rather than API routes. However, actions (delete, copy) require API endpoints.

---

## Existing API Routes (Reused)

### GET /api/entries/[id]

**Purpose**: Fetch single entry by ID  
**Source**: `src/app/api/entries/[id]/route.js` (EXISTING)  
**Used By**: Not directly used by Entry Details page (Server Component queries DB directly), but may be used for client-side refreshes

**Request**:
```http
GET /api/entries/673abc123def456789012345
Authorization: Bearer {session-token}
```

**Response (Success - 200)**:
```json
{
  "entry": {
    "_id": "673abc123def456789012345",
    "userId": "671def456abc789012345678",
    "date": "2025-10-20T00:00:00.000Z",
    "dateString": "2025-10-20",
    "firstMealTime": "12:30",
    "lastMealTime": "20:00",
    "fastingDuration": 990,
    "fastingDurationFormatted": "16h 30m",
    "extendedFastConfirmed": false,
    "hoursOfSleep": 7.5,
    "morningWeight": 75.2,
    "hungerLevel": "Medium",
    "energyLevel": "High Energy",
    "wellBeing": "Good",
    "foodNotes": "Had salad for lunch, pasta for dinner",
    "createdAt": "2025-10-20T08:15:00.000Z",
    "updatedAt": "2025-10-20T08:15:00.000Z"
  }
}
```

**Response (Not Found - 404)**:
```json
{
  "error": "Entry not found"
}
```

**Response (Unauthorized - 403)**:
```json
{
  "error": "Not authorized to access this entry"
}
```

---

### DELETE /api/entries/[id]

**Purpose**: Delete entry with optional extended fast handling  
**Source**: `src/app/api/entries/[id]/route.js` (EXISTING)  
**Used By**: Entry Details page delete action

**Request**:
```http
DELETE /api/entries/673abc123def456789012345?createExtendedFast=false
Authorization: Bearer {session-token}
```

**Query Parameters**:
- `createExtendedFast` (optional): `true` | `false` - Whether to create extended fast entry when deletion creates gap
- `checkOnly` (optional): `true` - Only check impact, don't delete (used by modal to show warnings)

**Response (Success - 200)**:
```json
{
  "message": "Entry deleted successfully",
  "deletedEntry": {
    "_id": "673abc123def456789012345",
    "date": "2025-10-20T00:00:00.000Z"
  },
  "extendedFastCreated": false
}
```

**Response (Check Only - 200)**:
```json
{
  "extendedFastCreated": true,
  "extendedFastInfo": {
    "previousEntry": "2025-10-18",
    "nextEntry": "2025-10-22",
    "gapHours": 72
  }
}
```

---

## New API Requirements

### POST /api/entries (Copy to Today)

**Purpose**: Create new entry from template (copy meal times from existing entry)  
**Source**: `src/app/api/entries/route.js` (MODIFY EXISTING)  
**Used By**: Entry Details page "Copy to Today" action

**Request**:
```http
POST /api/entries
Authorization: Bearer {session-token}
Content-Type: application/json

{
  "date": "2025-10-24",
  "firstMealTime": "12:30",
  "lastMealTime": "20:00",
  "hoursOfSleep": null,
  "morningWeight": null,
  "hungerLevel": null,
  "energyLevel": null,
  "wellBeing": null,
  "foodNotes": "",
  "templateSource": "673abc123def456789012345"
}
```

**Notes**:
- `templateSource` (optional): ID of entry being copied (for audit/analytics)
- Only meal times are pre-filled; health metrics left null for user to fill
- Date must be today's date
- Validates no existing entry for this date

**Response (Success - 201)**:
```json
{
  "message": "Entry created successfully",
  "entry": {
    "_id": "674bcd234efa567890123456",
    "date": "2025-10-24T00:00:00.000Z",
    "firstMealTime": "12:30",
    "lastMealTime": "20:00",
    // ... other fields
  }
}
```

**Response (Duplicate - 409)**:
```json
{
  "error": "Entry already exists for this date",
  "existingEntryId": "674bcd234efa567890123456"
}
```

---

## Client-Side API Calls

### Delete Entry Flow

```javascript
// In EntryActions component (Client Component)
const handleDelete = async () => {
  try {
    // Step 1: Check impact
    const checkRes = await fetch(`/api/entries/${entryId}?checkOnly=true`, {
      method: 'DELETE',
    });
    const checkData = await checkRes.json();
    
    // Step 2: Show confirmation modal with impact info
    setDeleteModal({
      isOpen: true,
      extendedFastInfo: checkData.extendedFastInfo,
    });
    
  } catch (error) {
    // Show inline error, allow retry
    setError(error.message);
  }
};

const handleConfirmDelete = async ({ createExtendedFast }) => {
  try {
    // Step 3: Actual deletion
    const url = `/api/entries/${entryId}?createExtendedFast=${createExtendedFast}`;
    const res = await fetch(url, { method: 'DELETE' });
    
    if (!res.ok) throw new Error('Delete failed');
    
    // Step 4: Navigate away
    router.push('/entries?message=deleted');
    
  } catch (error) {
    // Inline error, modal stays open, allow retry
    setError(error.message);
  }
};
```

### Copy to Today Flow

```javascript
// In EntryActions component (Client Component)
const handleCopyToToday = async () => {
  try {
    // Step 1: Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Step 2: Check if entry exists for today
    const checkRes = await fetch(`/api/entries?date=${today}`);
    const checkData = await checkRes.json();
    
    if (checkData.exists) {
      setError('You already have an entry for today');
      return;
    }
    
    // Step 3: Create new entry with template
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        firstMealTime: currentEntry.firstMealTime,
        lastMealTime: currentEntry.lastMealTime,
        hoursOfSleep: null,
        morningWeight: null,
        hungerLevel: null,
        energyLevel: null,
        wellBeing: null,
        foodNotes: '',
        templateSource: currentEntry._id,
      }),
    });
    
    if (!res.ok) throw new Error('Copy failed');
    
    const data = await res.json();
    
    // Step 4: Navigate to new entry details
    router.push(`/entries/${data.entry._id}?message=copied`);
    
  } catch (error) {
    // Inline error, allow retry
    setError(error.message);
  }
};
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional info
}
```

### Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User doesn't own this entry
- `NOT_FOUND`: Entry doesn't exist
- `CONFLICT`: Duplicate entry (for same date)
- `VALIDATION_ERROR`: Invalid input data
- `SERVER_ERROR`: Unexpected server error

### Client-Side Error Handling

```javascript
// Error display component
{error && (
  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
    <p className="text-red-800 text-sm">{error}</p>
    <button 
      onClick={retryAction}
      className="mt-2 text-red-600 underline text-sm"
    >
      Try Again
    </button>
  </div>
)}
```

---

## Authentication & Authorization

### Session Validation

All API routes require authentication:

```javascript
// In API route handler
import { auth } from '@/auth';

export async function DELETE(request, { params }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... verify entry ownership
}
```

### Entry Ownership Check

```javascript
const entry = await Entry.findById(params.id);

if (!entry) {
  return Response.json(
    { error: 'Entry not found' },
    { status: 404 }
  );
}

if (entry.userId.toString() !== session.user.id) {
  return Response.json(
    { error: 'Forbidden - not your entry' },
    { status: 403 }
  );
}
```

---

## Rate Limiting & Security

### CSRF Protection

- Next.js API routes automatically handle CSRF for same-origin requests
- Session cookies are HttpOnly and Secure

### Input Validation

- Use Joi schemas for all request body validation
- Sanitize user input (especially foodNotes) to prevent XSS
- Validate date formats strictly

### Rate Limiting

- Consider implementing rate limiting for delete/copy actions (e.g., max 10 per minute per user)
- Use existing middleware or add to API route handlers

---

## Next Steps

1. Review existing API routes for compatibility
2. Implement client-side fetch logic in components
3. Add error handling with retry UX
4. Test authorization edge cases
5. Create quickstart guide for developers
