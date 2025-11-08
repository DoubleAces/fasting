# Data Model: Admin Achievement Backfill

**Feature**: 033-admin-achievement-backfill  
**Date**: November 7, 2025  
**Phase**: 1 (Design & Contracts)

## Overview

This feature does not introduce new database collections or persistent models. All data structures are ephemeral (request/response payloads) or leverage existing models from Features 028-032 (Achievement System) and Feature 006 (Admin User Management).

---

## Existing Models (Unchanged)

### Entry
**Collection**: `entries`  
**Source**: `src/lib/models/Entry.js`  
**Usage**: Read-only access to fetch all entries for target user in chronological order

**Relevant Fields**:
- `_id`: ObjectId (primary key, passed to AchievementService.evaluateAndUnlock)
- `userId`: ObjectId (foreign key to users collection, used for filtering)
- `date`: Date (used for chronological sorting)
- `fastingTime`: String (e.g., "17h 20m", used by achievement evaluators)
- `goalCompleted`: Boolean (used by goal achievement evaluator)
- `morningWeight`: Number (used by weight achievement evaluator)

**Query Pattern**:
```javascript
const entries = await Entry.find({ userId })
  .sort({ date: 1 }) // Chronological: oldest to newest
  .select('_id date fastingTime')
  .lean();
```

---

### Achievement
**Collection**: `achievements`  
**Source**: `src/lib/models/Achievement.js`  
**Usage**: Read-only access via AchievementService (cached, no direct queries in this feature)

**Relevant Fields**:
- `_id`: ObjectId (primary key)
- `criteria`: Object (duration, streak, entry-count, etc.)
- `points`: Number (added to totalPointsEarned in response)
- `translations.en.name`: String (returned in unlockedAchievements array)
- `translations.en.description`: String (returned in unlockedAchievements array)

---

### UserAchievement
**Collection**: `userachievements`  
**Source**: `src/lib/models/UserAchievement.js`  
**Usage**: Created by AchievementService.evaluateAndUnlock (write-only from this feature's perspective)

**Relevant Fields**:
- `userId`: ObjectId (target user)
- `achievementId`: ObjectId (reference to Achievement)
- `unlockedAt`: Date (timestamp of unlock)
- `progress`: Object (e.g., { currentStreak: 7 })

**Unique Constraint**: `{ userId, achievementId }` prevents duplicates (idempotency mechanism)

---

### User
**Collection**: `users`  
**Source**: `src/lib/models/User.js`  
**Usage**: Read-only verification that target user exists, access control for requesting admin

**Relevant Fields**:
- `_id`: ObjectId (primary key, matches userId parameter)
- `email`: String (used in audit logs)
- `isAdmin`: Boolean (verified for requesting user in API endpoint)

---

## Ephemeral Data Structures

### BackfillRequest (API Request)

**Format**: HTTP POST to `/api/admin/users/[userId]/backfill-achievements`

**Route Parameters**:
```typescript
{
  userId: string // ObjectId as string from URL path parameter
}
```

**Request Headers**:
```typescript
{
  'Content-Type': 'application/json' // Standard JSON
  // Note: No request body needed
}
```

**Authentication**: Validated via `auth()` function (NextAuth session)

**Validation Rules**:
- `userId` must be valid MongoDB ObjectId format (24-character hex string)
- Requesting user must have `isAdmin: true` in session
- Target user must exist in database (404 if not found)

---

### BackfillResult (API Response)

**Format**: JSON response with aggregate statistics

**Success Response** (HTTP 200):
```typescript
{
  success: true,
  entriesProcessed: number,       // Total entries evaluated (0-500+)
  achievementsUnlocked: number,   // Newly created UserAchievements (0-N)
  pointsEarned: number,           // Sum of points from unlocked achievements
  achievements: Array<{           // Optional: detailed list of unlocked achievements
    achievementId: string,        // ObjectId as string
    name: string,                 // translations.en.name
    description: string,          // translations.en.description
    points: number,               // Points value
    unlockedAt: string            // ISO 8601 timestamp
  }>
}
```

**Example Success Response** (typical case):
```json
{
  "success": true,
  "entriesProcessed": 127,
  "achievementsUnlocked": 8,
  "pointsEarned": 150,
  "achievements": [
    {
      "achievementId": "673d4e8a9b1c2d3e4f5a6b7c",
      "name": "Sweet Sixteen",
      "description": "Complete your first 16-hour fast",
      "points": 15,
      "unlockedAt": "2025-11-07T14:32:10.123Z"
    }
    // ... 7 more achievements
  ]
}
```

**Example Success Response** (no new achievements):
```json
{
  "success": true,
  "entriesProcessed": 50,
  "achievementsUnlocked": 0,
  "pointsEarned": 0,
  "achievements": []
}
```

**Example Success Response** (zero entries):
```json
{
  "success": true,
  "entriesProcessed": 0,
  "achievementsUnlocked": 0,
  "pointsEarned": 0,
  "achievements": []
}
```

**Error Response** (HTTP 401 Unauthorized):
```json
{
  "error": "Authentication required"
}
```

**Error Response** (HTTP 403 Forbidden):
```json
{
  "error": "Admin access required"
}
```

**Error Response** (HTTP 404 Not Found):
```json
{
  "error": "User not found"
}
```

**Error Response** (HTTP 500 Internal Server Error):
```json
{
  "error": "Failed to backfill achievements"
}
```

---

## Client Component State

### BackfillAchievementsButton State

**Component**: `src/app/admin/users/components/BackfillAchievementsButton.js`

**Local State** (useState):
```typescript
{
  isLoading: boolean // True during API call, false otherwise
}
```

**Props** (passed from parent UserRow):
```typescript
{
  userId: string,                    // Target user ObjectId
  userName: string,                  // Display name for aria-label
  onBackfillSuccess?: () => void     // Optional callback after successful backfill
}
```

**State Transitions**:
1. **Initial**: `isLoading: false`, button enabled
2. **Click**: Set `isLoading: true`, button disabled, show spinner
3. **Success**: Set `isLoading: false`, button enabled, show success toast
4. **Error**: Set `isLoading: false`, button enabled, show error toast

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Administrator clicks "Backfill Achievements" button             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ BackfillAchievementsButton Component                            │
│ - Set isLoading: true                                           │
│ - POST /api/admin/users/[userId]/backfill-achievements          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ API Route Handler                                               │
│ 1. Authenticate via auth()                                      │
│ 2. Verify isAdmin: true (403 if false)                          │
│ 3. Find User by userId (404 if not found)                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ Fetch Entries                                                   │
│ Entry.find({ userId }).sort({ date: 1 }).select('_id date')    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ Sequential Evaluation Loop                                      │
│ for (const entry of entries) {                                  │
│   result = await AchievementService.evaluateAndUnlock(          │
│     userId, entry._id                                           │
│   )                                                             │
│   totalAchievements += result.unlockedAchievements.length       │
│   totalPoints += result.totalPointsEarned                       │
│ }                                                               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ AchievementService.evaluateAndUnlock (per entry)               │
│ 1. Load entry from database                                    │
│ 2. Evaluate 6 criteria (duration, streak, count, goal, etc.)   │
│ 3. Collect qualifying achievement IDs                          │
│ 4. Create UserAchievement records (unique constraint handles)  │
│ 5. Return { unlockedAchievements: [...], totalPointsEarned }   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ Return Response                                                 │
│ { entriesProcessed, achievementsUnlocked, pointsEarned }       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ BackfillAchievementsButton Component                            │
│ - Set isLoading: false                                          │
│ - Show toast: "✅ Processed N entries, unlocked M achievements" │
│ - Call onBackfillSuccess() callback                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### Database Queries

**Entry Fetch** (once per backfill):
```javascript
Entry.find({ userId }).sort({ date: 1 }).select('_id date fastingTime')
// Index: { userId: 1, date: 1 } (existing from Feature 009)
// Performance: O(log N) + O(M) where M = number of user entries
// Expected: <100ms for 500 entries
```

**Achievement Evaluation** (per entry):
```javascript
AchievementService.evaluateAndUnlock(userId, entryId)
// Uses cached achievement definitions (1-hour TTL)
// Multiple queries per evaluation:
//   - Entry.findById(entryId)
//   - Entry.find({ userId }) for streak calculation
//   - Achievement.find({}) - cached
//   - UserAchievement.insertMany() - with unique constraint
// Expected: <200ms per entry (dominated by cache hits)
```

### Memory Usage

**Estimated Memory per Backfill**:
- Entry list: ~500 entries × 100 bytes = 50 KB
- Achievement definitions (cached): ~100 achievements × 500 bytes = 50 KB
- Result aggregation: ~50 achievements × 200 bytes = 10 KB
- **Total**: <200 KB per operation (negligible)

### Scalability

**Concurrent Operations**:
- Multiple admins can trigger backfills simultaneously
- Each operation is independent (reads own user's entries)
- Unique constraint prevents duplicate UserAchievements
- No database locks or transactions required

**Large Datasets**:
- 500 entries × 200ms = 100 seconds (worst case)
- Typical 50-150 entries = 10-30 seconds
- 95th percentile target: <10 seconds (requires <50 entries or faster evaluation)

---

## Validation Rules

### Input Validation

**userId Parameter**:
- MUST be 24-character hexadecimal string (MongoDB ObjectId format)
- MUST reference existing user in database (404 if not found)
- No additional validation (any valid user can be backfilled, including admins)

### Authorization Rules

**Admin Access**:
- Requesting user MUST have `isAdmin: true` in session
- No self-restriction (admins CAN backfill their own achievements)
- Non-admin users receive 403 Forbidden

### Business Rules

**Idempotency**:
- Running backfill multiple times is safe (no duplicates created)
- Unique constraint on `{ userId, achievementId }` enforced at database level
- Second run returns `achievementsUnlocked: 0` (all already exist)

**Entry Processing Order**:
- MUST process entries in chronological order (oldest to newest)
- Required for accurate streak calculation (consecutive days depend on order)

---

## Summary

This feature introduces **zero new database models**. All data structures are:
- **Ephemeral**: Request/response payloads, client component state
- **Existing**: Leverage Entry, Achievement, UserAchievement, User models from Features 006, 028-032

**Key Design Principles**:
1. Read-only on Entry and User models
2. Write-only on UserAchievement (via AchievementService)
3. Idempotent operation (safe to repeat)
4. No transactions required (sequential creates with unique constraints)
5. Simple aggregation (count achievements, sum points)
