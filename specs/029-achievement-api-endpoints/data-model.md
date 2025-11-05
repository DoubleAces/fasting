# Data Model: Achievement API Endpoints

**Feature**: 029-achievement-api-endpoints  
**Date**: November 4, 2025  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data structures, request/response schemas, and service interfaces for the Achievement API Endpoints feature. All data models leverage existing MongoDB/Mongoose models from Feature 028 (Achievement, UserAchievement, User) and Entry model for criteria evaluation.

---

## Entities & Relationships

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ _id (ObjectId)  │
│ email           │
│ isAdmin         │
│ preferredLang   │◄─────────┐
│ achievementPts  │          │
└─────────────────┘          │
         │                   │
         │ 1:N               │ N:1
         │                   │
         ▼                   │
┌─────────────────┐    ┌─────────────────┐
│ UserAchievement │    │   Achievement   │
│─────────────────│    │─────────────────│
│ _id             │    │ achievementId   │
│ userId ────────►│    │ (unique slug)   │
│ achievementId ──┼───►│ translations    │
│ unlockedAt      │    │ badgeImage      │
│ progress        │    │ icon/iconColor  │
│ notificationSeen│    │ category        │
└─────────────────┘    │ points          │
                       │ rarity          │
         ▲             │ order           │
         │             │ criteria        │
         │ triggers    │ isActive        │
         │ evaluation  │ isSecret        │
         │             │ createdBy       │
┌─────────────────┐    └─────────────────┘
│     Entry       │
│─────────────────│
│ _id             │
│ userId          │
│ date            │
│ firstMealTime   │
│ lastMealTime    │
│ fastingDuration │
└─────────────────┘
```

**Relationships**:
1. **User → UserAchievement** (1:N): One user has many unlocked achievements
2. **Achievement → UserAchievement** (1:N): One achievement can be unlocked by many users
3. **User → Entry** (1:N): One user has many fasting entries
4. **Entry triggers evaluation** (event): Entry creation/update triggers achievement evaluation for that user

---

## API Request/Response Schemas

### 1. GET /api/achievements (List Achievements)

**Authentication**: Required (session)

**Query Parameters**:
```typescript
{
  category?: 'getting-started' | 'duration' | 'streak' | 'goal' | 'weight' | 'consistency' | 'special' | 'knowledge',
  page?: number,      // default: 1
  limit?: number,     // default: 20, max: 100
  sort?: 'order' | 'rarity' | 'points' | 'newest',  // default: 'order'
  lang?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh'  // default: user's preferredLanguage
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "achievementId": "sweet-sixteen",
        "name": "Sweet Sixteen",
        "description": "Complete your first 16-hour fast",
        "shortDescription": "First 16hr fast",
        "badgeImage": {
          "locked": "https://..../badge-locked.png",
          "unlocked": "https://..../badge-unlocked.png"
        },
        "icon": "🎯",
        "iconColor": "#4F46E5",
        "category": "duration",
        "points": 10,
        "rarity": "common",
        "order": 1,
        "criteria": {
          "type": "duration-milestone",
          "params": { "hours": 16 }
        },
        "isSecret": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Not authenticated
- **400 Bad Request**: Invalid category/sort/page/limit

---

### 2. GET /api/achievements/[id] (Achievement Details)

**Authentication**: Required (session)

**URL Parameters**:
- `id`: achievementId slug (e.g., "sweet-sixteen")

**Query Parameters**:
```typescript
{
  lang?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh'
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "achievementId": "sweet-sixteen",
    "translations": {
      "en": {
        "name": "Sweet Sixteen",
        "description": "Complete your first 16-hour fast...",
        "shortDescription": "First 16hr fast"
      },
      "es": {
        "name": "Dulce Dieciséis",
        "description": "Completa tu primer ayuno de 16 horas...",
        "shortDescription": "Primer ayuno de 16h"
      }
    },
    "badgeImage": {
      "locked": "https://..../badge-locked.png",
      "unlocked": "https://..../badge-unlocked.png"
    },
    "icon": "🎯",
    "iconColor": "#4F46E5",
    "category": "duration",
    "points": 10,
    "rarity": "common",
    "order": 1,
    "criteria": {
      "type": "duration-milestone",
      "params": { "hours": 16 }
    },
    "isActive": true,
    "isSecret": false,
    "releaseDate": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Secret Achievement Response** (if user hasn't unlocked):
```json
{
  "status": "success",
  "data": {
    "achievementId": "secret-achievement-id",
    "name": "???",
    "description": "Unlock this achievement to reveal its details",
    "shortDescription": "???",
    "icon": "❓",
    "iconColor": "#6B7280",
    "category": "special",
    "points": 50,
    "rarity": "legendary",
    "isSecret": true
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Not authenticated
- **404 Not Found**: Achievement doesn't exist or is inactive

---

### 3. GET /api/user/achievements (User's Unlocked Achievements)

**Authentication**: Required (session)

**Query Parameters**:
```typescript
{
  include?: 'progress',  // Include in-progress achievements (not yet unlocked)
  lang?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh'
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "_id": "userAchievementId",
        "achievementId": "sweet-sixteen",
        "achievement": {
          "name": "Sweet Sixteen",
          "description": "Complete your first 16-hour fast",
          "badgeImage": {
            "unlocked": "https://..../badge-unlocked.png"
          },
          "icon": "🎯",
          "iconColor": "#4F46E5",
          "category": "duration",
          "points": 10,
          "rarity": "common"
        },
        "unlockedAt": "2025-11-03T15:30:00.000Z",
        "progress": 100,
        "notificationSeen": false
      }
    ],
    "summary": {
      "totalPoints": 150,
      "totalUnlocked": 5,
      "totalAchievements": 85,
      "completionPercentage": 5.88,
      "unseenCount": 2
    }
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Not authenticated

---

### 4. POST /api/achievements/unlock (Manual Unlock)

**Authentication**: Required (admin only)

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "achievementId": "sweet-sixteen"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "userAchievement": {
      "_id": "newUserAchievementId",
      "userId": "507f1f77bcf86cd799439011",
      "achievementId": "sweet-sixteen",
      "unlockedAt": "2025-11-04T12:00:00.000Z",
      "progress": 100,
      "notificationSeen": false
    },
    "user": {
      "achievementPoints": 160,
      "pointsAdded": 10
    },
    "achievement": {
      "name": "Sweet Sixteen",
      "points": 10,
      "rarity": "common"
    }
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Not admin
- **404 Not Found**: User or achievement doesn't exist
- **409 Conflict**: Achievement already unlocked by user
- **400 Bad Request**: Invalid userId or achievementId format

---

### 5. POST /api/admin/achievements (Create Achievement)

**Authentication**: Required (admin only)

**Request Body**:
```json
{
  "achievementId": "marathon-master",
  "translations": {
    "en": {
      "name": "Marathon Master",
      "description": "Complete 30 consecutive days of fasting",
      "shortDescription": "30-day streak"
    },
    "es": {
      "name": "Maestro del Maratón",
      "description": "Completa 30 días consecutivos de ayuno",
      "shortDescription": "Racha de 30 días"
    }
  },
  "badgeImage": {
    "locked": "https://..../badge-locked.png",
    "unlocked": "https://..../badge-unlocked.png"
  },
  "icon": "🏃",
  "iconColor": "#EF4444",
  "category": "streak",
  "points": 100,
  "rarity": "epic",
  "order": 50,
  "criteria": {
    "type": "streak",
    "params": { "days": 30 }
  },
  "isActive": true,
  "isSecret": false,
  "releaseDate": "2025-12-01T00:00:00.000Z"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "_id": "newAchievementMongoId",
    "achievementId": "marathon-master",
    "translations": { /* ... */ },
    "badgeImage": { /* ... */ },
    "icon": "🏃",
    "iconColor": "#EF4444",
    "category": "streak",
    "points": 100,
    "rarity": "epic",
    "order": 50,
    "criteria": {
      "type": "streak",
      "params": { "days": 30 }
    },
    "isActive": true,
    "isSecret": false,
    "releaseDate": "2025-12-01T00:00:00.000Z",
    "createdBy": "adminUserId",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "updatedAt": "2025-11-04T12:00:00.000Z"
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Not admin
- **409 Conflict**: achievementId already exists
- **400 Bad Request**: Validation errors (missing required fields, invalid enum values)

---

## Service Interfaces

### Achievement Evaluator Service

**File**: `src/lib/services/achievementEvaluator.js`

**Main Function**:
```javascript
/**
 * Evaluate all unmet achievement criteria for a specific user
 * Called after entry creation/update events
 * 
 * @param {string} userId - MongoDB ObjectId string of user
 * @returns {Promise<EvaluationResult>}
 */
async function evaluateAchievements(userId)
```

**Return Type**:
```typescript
interface EvaluationResult {
  success: boolean;
  unlockedAchievements: Array<{
    achievementId: string;
    name: string;
    points: number;
  }>;
  totalPointsAdded: number;
  errors: string[];  // Non-blocking errors during evaluation
}
```

**Internal Functions**:

```javascript
/**
 * Check if user meets criteria for specific achievement
 * @param {Object} criteria - Achievement criteria object
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function evaluateCriteria(criteria, userId)

/**
 * Unlock achievement for user (create UserAchievement, update user points)
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement slug
 * @param {number} points - Points to award
 * @returns {Promise<Object>} Created UserAchievement document
 */
async function unlockAchievement(userId, achievementId, points)

/**
 * Evaluate duration-milestone criteria
 * @param {Object} params - { hours: number }
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function evaluateDurationMilestone(params, userId)

/**
 * Evaluate streak criteria
 * @param {Object} params - { days: number }
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function evaluateStreak(params, userId)

/**
 * Evaluate entry-count criteria
 * @param {Object} params - { count: number }
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
async function evaluateEntryCount(params, userId)
```

**Error Handling**:
- Catch and log evaluation errors without throwing
- Return errors array in result
- Don't block entry save if evaluation fails
- Retry mechanism for transient database errors (future enhancement)

---

## Database Query Patterns

### Achievement Queries

**List Active Achievements with Filters**:
```javascript
const query = {
  isActive: true,
  ...(category && { category }),
};

const achievements = await Achievement.find(query)
  .sort(sortMap[sort] || { order: 1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .select('-__v -createdBy')  // Exclude internal fields
  .lean();

const total = await Achievement.countDocuments(query);
```

**Get Single Achievement**:
```javascript
const achievement = await Achievement.findOne({
  achievementId: id,
  isActive: true
}).lean();
```

### UserAchievement Queries

**Get User's Unlocked Achievements**:
```javascript
const userAchievements = await UserAchievement.find({ userId })
  .sort({ unlockedAt: -1 })
  .lean();

// Manual join with achievements (if using string achievementId)
const achievementIds = userAchievements.map(ua => ua.achievementId);
const achievements = await Achievement.find({
  achievementId: { $in: achievementIds }
}).lean();

// Merge data
const result = userAchievements.map(ua => ({
  ...ua,
  achievement: achievements.find(a => a.achievementId === ua.achievementId)
}));
```

**Check if Achievement Already Unlocked**:
```javascript
const exists = await UserAchievement.exists({
  userId,
  achievementId
});
```

**Get Achievements Not Yet Unlocked**:
```javascript
const unlockedIds = await UserAchievement.find({ userId })
  .distinct('achievementId');

const availableAchievements = await Achievement.find({
  isActive: true,
  achievementId: { $nin: unlockedIds }
}).lean();
```

### Entry Queries (for Evaluation)

**Check Duration Milestone**:
```javascript
const entry = await Entry.findOne({
  userId,
  fastingDuration: { $gte: requiredHours * 60 }  // Convert hours to minutes
}).lean();

return !!entry;  // Boolean if any entry meets criteria
```

**Check Streak**:
```javascript
const entries = await Entry.find({ userId })
  .select('date')
  .sort({ date: -1 })
  .lean();

// Calculate consecutive days
let streak = 0;
let currentDate = new Date();
for (const entry of entries) {
  const entryDate = new Date(entry.date);
  const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0 || diffDays === 1) {
    streak++;
    currentDate = entryDate;
  } else {
    break;
  }
}

return streak >= requiredDays;
```

**Check Entry Count**:
```javascript
const count = await Entry.countDocuments({ userId });
return count >= requiredCount;
```

### Atomic Operations

**Unlock Achievement with Points Update**:
```javascript
// Create UserAchievement
const userAchievement = await UserAchievement.create({
  userId,
  achievementId,
  unlockedAt: new Date(),
  progress: 100,
  notificationSeen: false
});

// Atomic increment of user points
await User.findByIdAndUpdate(
  userId,
  { $inc: { achievementPoints: points } },
  { new: true }
);
```

---

## Validation Rules

### Request Validation

**achievementId** (string):
- Required for unlock and create endpoints
- Pattern: `/^[a-z0-9-]+$/` (lowercase alphanumeric with hyphens)
- Min length: 3, Max length: 50
- Unique across all achievements

**userId** (string):
- Must be valid MongoDB ObjectId
- Must reference existing user

**category** (enum):
- Must be one of: getting-started, duration, streak, goal, weight, consistency, special, knowledge

**rarity** (enum):
- Must be one of: common, rare, epic, legendary

**points** (number):
- Required, positive integer
- Min: 1, Max: 1000

**translations** (object):
- Must include 'en' (English) key at minimum
- Each language key must have: name (string, 3-100 chars), description (string, 10-500 chars), shortDescription (string, 3-50 chars)

**criteria** (object):
- Required: type (string), params (object)
- Type is not validated at creation (allows future types)
- Params structure depends on type (validated in evaluator)

**pagination**:
- page: Positive integer, default 1
- limit: Integer between 1 and 100, default 20

---

## State Transitions

### Achievement Lifecycle

```
[Draft] → (Admin creates) → [Active]
                              ↓
                         (Admin deactivates)
                              ↓
                           [Inactive]
```

- **Draft**: Achievement being designed (not in database yet)
- **Active**: `isActive: true`, visible to users, can be unlocked
- **Inactive**: `isActive: false`, hidden from users, cannot be unlocked (soft delete)

### UserAchievement Lifecycle

```
[Not Started] → (Criteria met) → [Unlocked] → (User views) → [Seen]
     ↑                              ↓
     └─── (Progress tracked) ──── [In Progress]
```

- **Not Started**: No UserAchievement document exists, progress: 0
- **In Progress**: UserAchievement exists with `progress` < 100 (optional for incremental achievements)
- **Unlocked**: UserAchievement exists with `progress: 100`, `unlockedAt` set, `notificationSeen: false`
- **Seen**: User has viewed unlock notification, `notificationSeen: true`

---

## Performance Considerations

### Indexes Used
- Achievement: `{ achievementId: 1 }` (unique)
- Achievement: `{ isActive: 1, category: 1, order: 1 }`
- UserAchievement: `{ userId: 1, achievementId: 1 }` (unique compound)
- UserAchievement: `{ userId: 1, unlockedAt: -1 }`
- Entry: `{ userId: 1, date: -1 }`

### Query Optimization
- Use `.lean()` for read-only queries (30-50% faster)
- Use `.select()` to project only needed fields
- Use `countDocuments()` with same query filter for accurate totals
- Use `.exists()` for boolean checks (faster than `.findOne()`)
- Use `.distinct()` to get unique values efficiently

### Caching Strategy (Future)
- Cache active achievements list (Redis, 1-hour TTL)
- Invalidate cache on admin achievement creation/update
- Cache user's unlocked achievement IDs (Redis, 5-minute TTL)
- Invalidate cache on new unlock

---

**Data Model Phase Complete** - Ready to proceed to contract generation
