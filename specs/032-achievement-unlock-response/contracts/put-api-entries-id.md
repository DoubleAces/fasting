# API Contract: PUT /api/entries/[id] (Modified)

**Feature**: 032-achievement-unlock-response  
**Endpoint**: `PUT /api/entries/[id]`  
**Purpose**: Update an existing fasting entry and return newly unlocked achievements in the response

---

## Overview

This document describes the **modified behavior** of the PUT /api/entries/[id] endpoint to include unlocked achievements in the response. The request format remains **unchanged** from Feature 001. Only the response format is extended.

---

## Request

### No Changes to Request Format

The request body, headers, authentication, and URL parameters remain **identical** to the original PUT /api/entries/[id] contract from Feature 001.

**Quick Reference** (no changes):
- **Method**: PUT
- **URL**: `/api/entries/:id` (where `:id` is MongoDB ObjectId)
- **Authentication**: Required (session-based via NextAuth)
- **Content-Type**: `application/json`
- **Request Body**: Same as Feature 001 (date, lastMealTime, firstMealTime, etc.)

---

## Response

### Status Codes

| Code | Meaning | When |
|------|---------|------|
| **200 OK** | Entry updated successfully | Entry saved, achievement evaluation completed (success or graceful failure) |
| **400 Bad Request** | Validation error | Invalid request body (same as Feature 001) |
| **401 Unauthorized** | Authentication required | No valid session (same as Feature 001) |
| **404 Not Found** | Entry not found | No entry with this ID for this user (same as Feature 001) |
| **500 Internal Server Error** | Server error | Database error during entry update (same as Feature 001) |

**Note**: Achievement evaluation errors do NOT cause 500 errors. Entry update succeeds even if achievement evaluation fails.

### Response Body (Extended)

**Content-Type**: `application/json`

#### Success Response with Newly Unlocked Achievements

```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-07T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "fastingDuration": 1440,
  "hoursOfSleep": 7.5,
  "morningWeight": 165,
  "hungerLevel": "Low",
  "energyLevel": "High",
  "wellBeing": "Excellent",
  "foodNotes": "Updated meal notes",
  "fastingGoal": 960,
  "goalStatus": "completed",
  "extendedFastConfirmed": false,
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T16:45:00.000Z",
  
  "unlockedAchievements": [
    {
      "achievementId": "first-twentyfour",
      "name": "First 24-Hour Fast",
      "description": "Complete your first 24-hour fast",
      "points": 25,
      "rarity": "rare",
      "category": "duration",
      "iconColor": "#3B82F6",
      "unlockedAt": "2025-11-07T16:45:00.000Z"
    }
  ]
}
```

#### Success Response with No New Achievements

```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-07T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "12:00",
  "fastingDuration": 960,
  "foodNotes": "Updated notes only",
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T16:50:00.000Z",
  
  "unlockedAchievements": []
}
```

**Note**: `unlockedAchievements` only includes **newly unlocked** achievements from this update. Already-unlocked achievements are not repeated.

---

## Behavior Changes

### Achievement Re-Evaluation on Update

**New Behavior**: After successfully updating an entry, the server automatically calls `AchievementService.evaluateAndUnlock(userId, entryId)` to check if the update qualifies for new achievement unlocks.

**Why Re-Evaluate?**:
- User may increase `fastingDuration` (e.g., 10h → 12h) to cross milestone threshold
- User may add `firstMealTime` to complete an active fast
- User may change `goalStatus` to 'completed', triggering goal-based achievements
- Streak achievements may unlock if user adds missing entry dates

**Idempotency**: Already-unlocked achievements will NOT be unlocked again (E11000 duplicate key prevention). The response only includes newly unlocked achievements from this specific update.

### Update Scenarios

#### Scenario 1: Duration Increase Unlocks Achievement

**Initial State**:
- Entry exists with `fastingDuration: 600` (10 hours)
- User has not unlocked "first-twelve" achievement

**User Updates**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j1
{
  "fastingDuration": 720
}
```

**Result**: Entry updated to 720 minutes (12 hours), "first-twelve" achievement unlocked

**Response**:
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "fastingDuration": 720,
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-07T16:45:00.000Z"
    }
  ]
}
```

#### Scenario 2: Non-Achievement Fields Updated

**User Updates**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j1
{
  "foodNotes": "Updated meal description",
  "hungerLevel": "Medium"
}
```

**Result**: Entry updated, but no achievement-relevant fields changed

**Response**:
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "foodNotes": "Updated meal description",
  "hungerLevel": "Medium",
  "unlockedAchievements": []
}
```

**Note**: Achievement evaluation still runs (to check streak/goal counts that depend on entry existence), but returns empty array since no new achievements qualify.

#### Scenario 3: Already-Unlocked Achievement (Idempotent)

**Initial State**:
- Entry exists with `fastingDuration: 720` (12 hours)
- User already unlocked "first-twelve" achievement previously

**User Updates**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j1
{
  "fastingDuration": 960
}
```

**Result**: Entry updated, but "first-twelve" already unlocked (not duplicated)

**Response**:
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "fastingDuration": 960,
  "unlockedAchievements": []
}
```

**Note**: Even though fastingDuration still meets "first-twelve" criteria, the achievement is not re-unlocked (E11000 prevents duplicate UserAchievement records).

### Non-Blocking Error Handling

**Critical Behavior**: Entry update **always succeeds** even if achievement evaluation fails.

**Error Scenarios Handled** (same as POST):
- AchievementService throws exception
- Achievement data missing required fields
- Service unavailable

**Error Response**: Entry updated successfully with `unlockedAchievements: []`

**Logging**:
- Success: `console.log('🏆 Achievements unlocked: first-twentyfour')`
- Failure: `console.error('Achievement evaluation failed for entry 6541a2b3...: Database timeout')`

---

## Example Requests & Responses

### Example 1: Increase Duration to Unlock 24h Achievement

**Request**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j1 HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "fastingDuration": 1440,
  "firstMealTime": "20:00"
}
```

**Response** (200 OK):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j1",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-07T00:00:00.000Z",
  "lastMealTime": "20:00",
  "firstMealTime": "20:00",
  "fastingDuration": 1440,
  "createdAt": "2025-11-07T14:30:00.000Z",
  "updatedAt": "2025-11-07T17:00:00.000Z",
  "unlockedAchievements": [
    {
      "achievementId": "first-twentyfour",
      "name": "First 24-Hour Fast",
      "description": "Complete your first 24-hour fast",
      "points": 25,
      "rarity": "rare",
      "category": "duration",
      "iconColor": "#3B82F6",
      "unlockedAt": "2025-11-07T17:00:00.000Z"
    }
  ]
}
```

### Example 2: Update Notes Only (No Achievements)

**Request**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j2 HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "foodNotes": "Corrected meal description",
  "hungerLevel": "Low"
}
```

**Response** (200 OK):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j2",
  "userId": "6541a2b3c4d5e6f7g8h9i0j2",
  "date": "2025-11-08T00:00:00.000Z",
  "lastMealTime": "18:00",
  "firstMealTime": "08:00",
  "fastingDuration": 600,
  "foodNotes": "Corrected meal description",
  "hungerLevel": "Low",
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T11:30:00.000Z",
  "unlockedAchievements": []
}
```

### Example 3: Complete Goal to Unlock Goal Achievement

**Request**:
```http
PUT /api/entries/6541a2b3c4d5e6f7g8h9i0j3 HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "goalStatus": "completed"
}
```

**Response** (200 OK - assuming this is user's 10th completed goal):
```json
{
  "_id": "6541a2b3c4d5e6f7g8h9i0j3",
  "date": "2025-11-09T00:00:00.000Z",
  "fastingGoal": 960,
  "goalStatus": "completed",
  "updatedAt": "2025-11-09T12:00:00.000Z",
  "unlockedAchievements": [
    {
      "achievementId": "ten-goals-reached",
      "name": "Ten Goals Reached",
      "description": "Complete 10 fasting goals",
      "points": 50,
      "rarity": "epic",
      "category": "goal",
      "iconColor": "#8B5CF6",
      "unlockedAt": "2025-11-09T12:00:00.000Z"
    }
  ]
}
```

---

## Client Implementation Guide

### Parsing Response

**JavaScript/TypeScript** (same as POST):
```javascript
const response = await fetch(`/api/entries/${entryId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});

const data = await response.json();

// Entry data updated
console.log('Entry updated:', data._id);

// Check for newly unlocked achievements
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

### React Hook Example

```javascript
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

function useUpdateEntry() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const updateEntry = async (entryId, updateData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      // Show achievement notifications for newly unlocked achievements
      if (data.unlockedAchievements?.length > 0) {
        data.unlockedAchievements.forEach(ach => {
          showToast({
            title: '🏆 New Achievement!',
            message: `${ach.name} (+${ach.points} points)`,
            type: 'success'
          });
        });
      }

      return data;
    } catch (error) {
      showToast({ title: 'Error', message: error.message, type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateEntry, loading };
}
```

---

## Differences from POST Endpoint

| Aspect | POST /api/entries | PUT /api/entries/[id] |
|--------|-------------------|------------------------|
| **Status Code** | 201 Created | 200 OK |
| **When Called** | Creating new entry | Updating existing entry |
| **ID in URL** | No | Yes (`:id` parameter) |
| **Achievement Trigger** | After `entry.save()` | After `updatedEntry.save()` |
| **Typical Unlock Count** | May unlock multiple (first entry) | Usually 0-1 (update rarely crosses thresholds) |
| **Idempotency** | Duplicate date returns 409 Conflict | Duplicate achievementId returns empty array |

---

## Backward Compatibility

### Existing Clients

**Fully Backward Compatible** (same as POST):
- All existing entry fields preserved
- New `unlockedAchievements` field is additive
- Clients ignoring the field continue to work

### Migration Path

**No migration required** for existing clients.

---

## Testing Recommendations

### Unit Tests

```javascript
describe('PUT /api/entries/[id] - Achievement Response', () => {
  it('should include unlockedAchievements in response', async () => {
    const entry = await Entry.create({ ...entryData, fastingDuration: 600 });
    const response = await updateEntry(entry._id, { fastingDuration: 720 });
    expect(response.body.unlockedAchievements).toBeDefined();
    expect(Array.isArray(response.body.unlockedAchievements)).toBe(true);
  });

  it('should return empty array when update does not unlock achievements', async () => {
    const entry = await Entry.create(entryData);
    const response = await updateEntry(entry._id, { foodNotes: 'Updated' });
    expect(response.body.unlockedAchievements).toEqual([]);
  });

  it('should succeed even if AchievementService fails', async () => {
    jest.spyOn(AchievementService, 'evaluateAndUnlock').mockRejectedValue(new Error('DB error'));
    const entry = await Entry.create(entryData);
    const response = await updateEntry(entry._id, { fastingDuration: 720 });
    expect(response.status).toBe(200);
    expect(response.body._id).toBeDefined();
    expect(response.body.unlockedAchievements).toEqual([]);
  });
});
```

### Integration Tests

```javascript
describe('PUT /api/entries/[id] - Achievement Integration', () => {
  it('should unlock achievement when duration increased to threshold', async () => {
    const entry = await Entry.create({ 
      userId, 
      date: new Date(), 
      lastMealTime: '20:00',
      firstMealTime: '12:00',
      fastingDuration: 600 
    });

    const response = await request(app)
      .put(`/api/entries/${entry._id}`)
      .send({ fastingDuration: 720 });

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toHaveLength(1);
    expect(response.body.unlockedAchievements[0].achievementId).toBe('first-twelve');
  });

  it('should not re-unlock already-unlocked achievement (idempotent)', async () => {
    // User already has "first-twelve" achievement
    await UserAchievement.create({ userId, achievementId: 'first-twelve', unlockedAt: new Date() });
    
    const entry = await Entry.create({ userId, date: new Date(), fastingDuration: 720 });
    const response = await request(app)
      .put(`/api/entries/${entry._id}`)
      .send({ fastingDuration: 960 });

    expect(response.status).toBe(200);
    expect(response.body.unlockedAchievements).toEqual([]); // Not re-unlocked
  });
});
```

---

## Performance Expectations

| Metric | Target | Notes |
|--------|--------|-------|
| **Total Response Time** | <500ms | Includes entry update + achievement evaluation |
| **Achievement Evaluation** | <200ms (95th percentile) | From AchievementService call to result |
| **Response Payload Size** | <50KB typical | Usually 0-1 achievements per update (~1 KB) |

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-07 | Initial contract for Feature 032 - Added `unlockedAchievements` to response |
