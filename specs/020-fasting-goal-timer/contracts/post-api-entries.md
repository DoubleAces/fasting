# API Contract: POST /api/entries (Modified)

**Feature**: 020-fasting-goal-timer  
**Modification**: Adds optional goal fields to existing entry creation endpoint  
**Version**: 1.1.0 (was 1.0.0 before Feature 020)

## Overview

Existing endpoint modified to accept and persist fasting goal data when user completes a fast.

## Endpoint

```
POST /api/entries
```

## Authentication

**Required**: Yes (NextAuth session)

**Session Data Required**:
- `session.user.id` - User ID for entry ownership

## Request

### Headers

```
Content-Type: application/json
Cookie: next-auth.session-token=<token>
```

### Body

```json
{
  "date": "2025-10-28",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "hoursOfSleep": 7.5,
  "morningWeight": 180.5,
  "hungerLevel": "Low",
  "energyLevel": "High Energy",
  "wellBeing": "Good",
  "foodNotes": "Salad for lunch, chicken for dinner",
  
  // NEW FIELDS (Feature 020)
  "fastingGoal": 960,
  "goalStatus": "completed"
}
```

### Body Schema

```typescript
interface CreateEntryRequest {
  // Existing required fields
  date: string;                    // YYYY-MM-DD format
  lastMealTime: string;            // HH:mm format (24-hour)
  firstMealTime: string;           // HH:mm format (24-hour)
  
  // Existing optional fields
  hoursOfSleep?: number;           // 0-24
  morningWeight?: number;          // > 0
  hungerLevel?: 'Low' | 'Medium' | 'High';
  energyLevel?: 'Low Energy' | 'Medium Energy' | 'High Energy';
  wellBeing?: 'Poor' | 'Fair' | 'Good';
  foodNotes?: string;              // Max 2000 chars
  
  // NEW optional fields (Feature 020)
  fastingGoal?: number | null;     // Minutes: 1-10080 (1h to 168h)
  goalStatus?: 'completed' | 'not-completed' | 'no-goal' | null;
}
```

### Field Validation (New Fields Only)

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| `fastingGoal` | number \| null | No | 1-10080 (minutes) | null |
| `goalStatus` | string \| null | No | Enum: 'completed', 'not-completed', 'no-goal' | null |

**Business Rules**:
1. If `fastingGoal` is provided (not null), `goalStatus` must be provided
2. If `fastingGoal` is null, `goalStatus` must be 'no-goal' or null
3. `goalStatus` 'completed' or 'not-completed' requires non-null `fastingGoal`

### Example Requests

**With completed goal**:
```json
{
  "date": "2025-10-28",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "fastingGoal": 960,
  "goalStatus": "completed"
}
```

**With incomplete goal** (ended fast early):
```json
{
  "date": "2025-10-29",
  "lastMealTime": "19:00",
  "firstMealTime": "10:00",
  "fastingGoal": 960,
  "goalStatus": "not-completed"
}
```

**Without goal**:
```json
{
  "date": "2025-10-30",
  "lastMealTime": "21:00",
  "firstMealTime": "13:00",
  "fastingGoal": null,
  "goalStatus": "no-goal"
}
```

**Legacy format** (goal fields omitted):
```json
{
  "date": "2025-10-31",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00"
}
```

## Response

### Success (201 Created)

```json
{
  "success": true,
  "entry": {
    "_id": "6540a1b2c3d4e5f6a7b8c9d0",
    "userId": "6540a1b2c3d4e5f6a7b8c9d1",
    "date": "2025-10-28T00:00:00.000Z",
    "dateString": "2025-10-28",
    "lastMealTime": "20:00",
    "firstMealTime": "12:00",
    "fastingDuration": 960,
    "fastingGoal": 960,
    "goalStatus": "completed",
    "hoursOfSleep": null,
    "morningWeight": null,
    "hungerLevel": null,
    "energyLevel": null,
    "wellBeing": null,
    "foodNotes": null,
    "createdAt": "2025-10-28T22:30:00.000Z",
    "updatedAt": "2025-10-28T22:30:00.000Z"
  }
}
```

### Response Schema

```typescript
interface CreateEntryResponse {
  success: true;
  entry: {
    _id: string;
    userId: string;
    date: string;                  // ISO 8601
    dateString: string;            // YYYY-MM-DD
    lastMealTime: string;          // HH:mm
    firstMealTime: string;         // HH:mm
    fastingDuration: number | null;
    
    // NEW fields
    fastingGoal: number | null;
    goalStatus: 'completed' | 'not-completed' | 'no-goal' | null;
    
    hoursOfSleep: number | null;
    morningWeight: number | null;
    hungerLevel: string | null;
    energyLevel: string | null;
    wellBeing: string | null;
    foodNotes: string | null;
    createdAt: string;             // ISO 8601
    updatedAt: string;             // ISO 8601
  };
}
```

## Error Responses

### 400 Bad Request - Invalid Goal Value

```json
{
  "error": "Validation Error",
  "details": "Fasting goal must be between 1 and 10080 minutes"
}
```

### 400 Bad Request - Invalid Goal Status

```json
{
  "error": "Validation Error",
  "details": "Goal status must be completed, not-completed, or no-goal"
}
```

### 400 Bad Request - Goal/Status Mismatch

```json
{
  "error": "Validation Error",
  "details": "goalStatus is required when fastingGoal is provided"
}
```

**Or**:

```json
{
  "error": "Validation Error",
  "details": "fastingGoal is required when goalStatus is completed or not-completed"
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 409 Conflict - Duplicate Entry

```json
{
  "error": "An entry for this date already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create entry",
  "message": "Internal server error message"
}
```

## Backward Compatibility

**100% Compatible** - All goal fields are optional. Clients not aware of Feature 020 can:
- Omit `fastingGoal` and `goalStatus` entirely (treated as null)
- Send `null` explicitly for both fields
- Ignore goal fields in response

**No Breaking Changes** - Existing entry creation logic unchanged when goal fields not provided.

## Implementation Notes

### Server-Side Logic

```javascript
// In POST /api/entries handler
const { fastingGoal, goalStatus, ...otherFields } = req.body;

// Validation
if (fastingGoal !== null && fastingGoal !== undefined) {
  if (goalStatus === null || goalStatus === undefined) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: 'goalStatus is required when fastingGoal is provided'
    });
  }
  
  if (fastingGoal < 1 || fastingGoal > 10080) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: 'Fasting goal must be between 1 and 10080 minutes'
    });
  }
}

if (goalStatus === 'completed' || goalStatus === 'not-completed') {
  if (fastingGoal === null || fastingGoal === undefined) {
    return res.status(400).json({ 
      error: 'Validation Error',
      details: 'fastingGoal is required when goalStatus is completed or not-completed'
    });
  }
}

// Create entry with goal data
const entry = new Entry({
  userId: session.user.id,
  ...otherFields,
  fastingGoal: fastingGoal ?? null,
  goalStatus: goalStatus ?? null
});

await entry.save();
```

### Client-Side Usage

```javascript
// With goal
const response = await fetch('/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2025-10-28',
    lastMealTime: '20:00',
    firstMealTime: '12:00',
    fastingGoal: 960,      // From FastingGoalContext
    goalStatus: 'completed' // Calculated: duration >= goal
  })
});

// Without goal
const response = await fetch('/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2025-10-28',
    lastMealTime: '20:00',
    firstMealTime: '12:00',
    fastingGoal: null,
    goalStatus: 'no-goal'
  })
});
```

## Testing

### Test Cases

1. **Create entry with completed goal**
   - Request: `fastingGoal: 960, goalStatus: 'completed'`
   - Expected: 201, entry saved with goal data

2. **Create entry with incomplete goal**
   - Request: `fastingGoal: 960, goalStatus: 'not-completed'`
   - Expected: 201, entry saved with goal data

3. **Create entry with no goal**
   - Request: `fastingGoal: null, goalStatus: 'no-goal'`
   - Expected: 201, entry saved with null goal

4. **Create entry without goal fields** (legacy)
   - Request: No `fastingGoal` or `goalStatus` fields
   - Expected: 201, entry saved with null goal fields

5. **Reject invalid goal range**
   - Request: `fastingGoal: 0`
   - Expected: 400 validation error

6. **Reject goal without status**
   - Request: `fastingGoal: 960, goalStatus: null`
   - Expected: 400 validation error

7. **Reject completed status without goal**
   - Request: `fastingGoal: null, goalStatus: 'completed'`
   - Expected: 400 validation error

## Performance

- **No significant impact** - Optional fields add <10ms to request processing
- **Database write** - Same as existing entry creation (single document)
- **Validation overhead** - <1ms for goal field checks

## Security

- **No new security concerns** - Goal data is user-specific, follows same auth as existing fields
- **Input validation** - Range checks prevent invalid data
- **No PII** - Goal data is non-sensitive health tracking information

## Future Considerations

**Potential enhancements** (out of scope for Feature 020):
- GET /api/entries/[id]/goal-analytics - Aggregate goal completion stats
- PATCH /api/entries/[id] - Update goal data (currently not needed)
- GET /api/entries?hasGoal=true - Filter entries by goal presence
