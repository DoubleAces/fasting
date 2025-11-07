# API Contract: POST /api/entries (Modified)

**Feature**: 032-achievement-unlock-response  
**Endpoint**: `POST /api/entries`  
**Purpose**: Create a new fasting entry and return unlocked achievements in the response

---

## Overview

This document describes the **modified behavior** of the POST /api/entries endpoint to include unlocked achievements in the response. The request format remains **unchanged** from Feature 001. Only the response format is extended.

---

## Request

### No Changes to Request Format

The request body, headers, and authentication remain **identical** to the original POST /api/entries contract from Feature 001. See existing documentation for request details.

**Quick Reference** (no changes):
- **Method**: POST
- **URL**: `/api/entries`
- **Authentication**: Required (session-based via NextAuth)
- **Content-Type**: `application/json`
- **Request Body**: Same as Feature 001 (date, lastMealTime, firstMealTime, etc.)

---

## Response

### Status Codes

| Code | Meaning | When |
|------|---------|------|
| **201 Created** | Entry created successfully | Entry saved, achievement evaluation completed (success or graceful failure) |
| **400 Bad Request** | Validation error | Invalid request body (same as Feature 001) |
| **401 Unauthorized** | Authentication required | No valid session (same as Feature 001) |
| **409 Conflict** | Duplicate entry | Entry already exists for this date (same as Feature 001) |
| **500 Internal Server Error** | Server error | Database error during entry creation (same as Feature 001) |

**Note**: Achievement evaluation errors do NOT cause 500 errors. Entry creation succeeds even if achievement evaluation fails.

### Response Body (Extended)

**Content-Type**: `application/json`

#### Success Response with Unlocked Achievements

```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-07T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "fastingDuration": 960,
  "hoursOfSleep": 7.5,
  "morningWeight": 165,
  "hungerLevel": "Low",
  "energyLevel": "High",
  "wellBeing": "Excellent",
  "foodNotes": "Had grilled chicken for first meal",
  "fastingGoal": 960,
  "goalStatus": "completed",
  "extendedFastConfirmed": false,
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T14:30:00.000Z",
  
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "description": "Complete your first 12-hour fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-07T14:30:00.000Z"
    }
  ]
}
```

#### Success Response with Multiple Achievements

```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j3",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-08T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "20:00",
  "fastingDuration": 1440,
  "createdAt": "2025-11-08T10:15:00.000Z",
  "updatedAt": "2025-11-08T10:15:00.000Z",
  
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "description": "Complete your first 12-hour fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-08T10:15:00.000Z"
    },
    {
      "achievementId": "first-twentyfour",
      "name": "First 24-Hour Fast",
      "description": "Complete your first 24-hour fast",
      "points": 25,
      "rarity": "rare",
      "category": "duration",
      "iconColor": "#3B82F6",
      "unlockedAt": "2025-11-08T10:15:00.000Z"
    }
  ]
}
```

#### Success Response with No Achievements

```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j4",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-09T00:00:00.000Z",
  "lastMealTime": "18:00",
  "firstMealTime": "08:00",
  "fastingDuration": 600,
  "createdAt": "2025-11-09T12:00:00.000Z",
  "updatedAt": "2025-11-09T12:00:00.000Z",
  
  "unlockedAchievements": []
}
```

**Note**: When no achievements are unlocked, `unlockedAchievements` is an empty array `[]`, not `null` or `undefined`.

### Response Fields

#### Existing Fields (Unchanged)

All entry fields from Feature 001 remain in the response. See Feature 001 documentation for details.

#### New Field: `unlockedAchievements`

**Type**: Array of UnlockedAchievement objects  
**Required**: Yes (always present, may be empty array)  
**Description**: List of achievements unlocked by this entry creation

**UnlockedAchievement Object Structure**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `achievementId` | String | Yes | Unique achievement identifier (slug) | `"first-twelve"` |
| `name` | String | Yes | Achievement display name (English) | `"First 12-Hour Fast"` |
| `description` | String | Yes | Full achievement description | `"Complete your first 12-hour fast"` |
| `points` | Number | Yes | Points awarded for this achievement | `10` |
| `rarity` | String | Yes | Achievement tier (affects UI styling) | `"common"`, `"rare"`, `"epic"`, `"legendary"` |
| `category` | String | Yes | Achievement category (for grouping) | `"duration"`, `"streak"`, `"goal"`, `"weight"`, `"custom"` |
| `iconColor` | String | Yes | Hex color code for UI theming | `"#10B981"` |
| `unlockedAt` | String | Yes | ISO 8601 timestamp when unlocked | `"2025-11-07T14:30:00.000Z"` |

---

## Behavior Changes

### Achievement Evaluation Trigger

**New Behavior**: After successfully creating an entry, the server automatically calls `AchievementService.evaluateAndUnlock(userId, entryId)` to check if any achievements should be unlocked.

**Evaluation Logic** (from Feature 031):
1. Query all active achievements from database (cached 1 hour)
2. Filter out already-unlocked achievements for this user
3. Run 6 evaluators in parallel:
   - Duration milestones (checks `fastingDuration`)
   - Streak milestones (checks consecutive entry dates)
   - Goal completion milestones (checks `goalStatus='completed'` count)
   - Entry count milestones (deferred to P3)
   - Weight loss milestones (deferred to P3)
   - Custom criteria (deferred to P3)
4. Deduplicate qualifying achievement IDs
5. Create UserAchievement records (batch, with E11000 duplicate handling)
6. Update user's achievementPoints atomically
7. Return unlocked achievement details for response

**Performance**: Evaluation completes in <200ms for 95% of requests (see success criteria SC-004).

### Non-Blocking Error Handling

**Critical Behavior**: Entry creation **always succeeds** even if achievement evaluation fails.

**Error Scenarios Handled**:
- AchievementService throws exception (database timeout, malformed criteria, etc.)
- Achievement data missing required fields
- Service unavailable (import fails)

**Error Response**: Entry created successfully with `unlockedAchievements: []` (empty array)

**Logging**:
- Success: `console.log('🏆 Achievements unlocked: first-twelve, streak-3-days')`
- Failure: `console.error('Achievement evaluation failed for entry 6541a2b3...: Connection timeout')`

---

## Example Requests & Responses

### Example 1: First 12-Hour Fast (Unlocks Achievement)

**Request**:
```http
POST /api/entries HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "date": "2025-11-07",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00"
}
```

**Response** (201 Created):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-07T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "fastingDuration": 960,
  "hoursOfSleep": null,
  "morningWeight": null,
  "hungerLevel": null,
  "energyLevel": null,
  "wellBeing": null,
  "foodNotes": null,
  "fastingGoal": null,
  "goalStatus": null,
  "extendedFastConfirmed": false,
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T14:30:00.000Z",
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "description": "Complete your first 12-hour fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-07T14:30:00.000Z"
    }
  ]
}
```

### Example 2: Short Fast (No Achievements)

**Request**:
```http
POST /api/entries HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "date": "2025-11-08",
  "lastMealTime": "18:00",
  "firstMealTime": "08:00"
}
```

**Response** (201 Created):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j3",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-08T00:00:00.000Z",
  "lastMealTime": "18:00",
  "firstMealTime": "08:00",
  "fastingDuration": 600,
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z",
  "unlockedAchievements": []
}
```

### Example 3: First 72-Hour Fast (Multiple Achievements)

**Request**:
```http
POST /api/entries HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "date": "2025-11-10",
  "lastMealTime": "20:00",
  "firstMealTime": "20:00",
  "fastingDuration": 4320,
  "extendedFastConfirmed": true
}
```

**Response** (201 Created):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j5",
  "date": "2025-11-10T00:00:00.000Z",
  "fastingDuration": 4320,
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-10T15:00:00.000Z"
    },
    {
      "achievementId": "first-twentyfour",
      "name": "First 24-Hour Fast",
      "points": 25,
      "rarity": "rare",
      "category": "duration",
      "iconColor": "#3B82F6",
      "unlockedAt": "2025-11-10T15:00:00.000Z"
    },
    {
      "achievementId": "first-fortyeight",
      "name": "First 48-Hour Fast",
      "points": 50,
      "rarity": "epic",
      "category": "duration",
      "iconColor": "#8B5CF6",
      "unlockedAt": "2025-11-10T15:00:00.000Z"
    },
    {
      "achievementId": "seventytwo-hour-champion",
      "name": "72-Hour Champion",
      "points": 100,
      "rarity": "legendary",
      "category": "duration",
      "iconColor": "#F59E0B",
      "unlockedAt": "2025-11-10T15:00:00.000Z"
    }
  ]
}
```

---

## Client Implementation Guide

### Parsing Response

**JavaScript/TypeScript**:
```javascript
const response = await fetch('/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(entryData)
});

const data = await response.json();

// Entry data available as usual
console.log('Entry created:', data._id);

// Check for unlocked achievements
if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
  // Show achievement notification
  data.unlockedAchievements.forEach(achievement => {
    showToast({
      title: `🏆 Achievement Unlocked!`,
      message: `${achievement.name} (+${achievement.points} points)`,
      type: 'success',
      duration: 5000
    });
  });
}
```

### TypeScript Interface

```typescript
interface UnlockedAchievement {
  achievementId: string;
  name: string;
  description: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'duration' | 'streak' | 'goal' | 'weight' | 'custom' | 'special';
  iconColor: string;
  unlockedAt: string; // ISO 8601
}

interface EntryResponse {
  _id: string;
  userId: string;
  date: string;
  lastMealTime: string;
  firstMealTime: string | null;
  fastingDuration: number | null;
  // ...other entry fields
  unlockedAchievements: UnlockedAchievement[];
}
```

### React Hook Example

```javascript
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

function useCreateEntry() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const createEntry = async (entryData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });

      const data = await response.json();

      // Show achievement notifications
      if (data.unlockedAchievements?.length > 0) {
        if (data.unlockedAchievements.length === 1) {
          const ach = data.unlockedAchievements[0];
          showToast({
            title: '🏆 Achievement Unlocked!',
            message: `${ach.name} (+${ach.points} points)`,
            type: 'success'
          });
        } else {
          const totalPoints = data.unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
          showToast({
            title: '🏆 Multiple Achievements Unlocked!',
            message: `You unlocked ${data.unlockedAchievements.length} achievements! (+${totalPoints} points)`,
            type: 'success'
          });
        }
      }

      return data;
    } catch (error) {
      showToast({ title: 'Error', message: error.message, type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createEntry, loading };
}
```

---

## Backward Compatibility

### Existing Clients

**Fully Backward Compatible**: Clients that don't expect the `unlockedAchievements` field will continue to work without modification. The new field is additive and does not replace or remove any existing fields.

**Example** (client ignoring new field):
```javascript
// Old client code still works
const response = await fetch('/api/entries', { method: 'POST', body: JSON.stringify(entryData) });
const entry = await response.json();
console.log('Entry created:', entry._id); // Still works
// entry.unlockedAchievements is ignored
```

### Migration Path

**No migration required** for existing clients. New clients can opt-in to using the `unlockedAchievements` field when ready.

---

## Testing Recommendations

### Unit Tests

```javascript
describe('POST /api/entries - Achievement Response', () => {
  it('should include unlockedAchievements in response', async () => {
    const response = await createEntry({ ...entryData, fastingDuration: 960 });
    expect(response.body.unlockedAchievements).toBeDefined();
    expect(Array.isArray(response.body.unlockedAchievements)).toBe(true);
  });

  it('should return empty array when no achievements unlocked', async () => {
    const response = await createEntry({ ...entryData, fastingDuration: 600 });
    expect(response.body.unlockedAchievements).toEqual([]);
  });

  it('should succeed even if AchievementService fails', async () => {
    jest.spyOn(AchievementService, 'evaluateAndUnlock').mockRejectedValue(new Error('DB error'));
    const response = await createEntry(entryData);
    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    expect(response.body.unlockedAchievements).toEqual([]);
  });
});
```

### Integration Tests

```javascript
describe('POST /api/entries - Achievement Integration', () => {
  it('should unlock first-twelve achievement for 12-hour fast', async () => {
    const response = await request(app)
      .post('/api/entries')
      .send({ date: '2025-11-07', lastMealTime: '20:00', firstMealTime: '12:00' });

    expect(response.status).toBe(201);
    expect(response.body.unlockedAchievements).toHaveLength(1);
    expect(response.body.unlockedAchievements[0].achievementId).toBe('first-twelve');
    expect(response.body.unlockedAchievements[0].points).toBe(10);
  });
});
```

---

## Performance Expectations

| Metric | Target | Notes |
|--------|--------|-------|
| **Total Response Time** | <500ms | Includes entry creation + achievement evaluation |
| **Achievement Evaluation** | <200ms (95th percentile) | From AchievementService call to result |
| **Response Payload Size** | <50KB typical | 1-3 achievements: ~1-1.5 KB; 10 achievements: ~3.3 KB |

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-07 | Initial contract for Feature 032 - Added `unlockedAchievements` to response |
