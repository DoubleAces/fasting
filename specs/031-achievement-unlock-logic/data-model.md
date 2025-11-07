# Data Model: Achievement Unlock Logic

**Feature**: 031 - Achievement Unlock Logic  
**Date**: November 6, 2025

---

## Entities

### 1. Achievement (Existing - No Changes)

**Purpose**: Defines available achievements with unlock criteria

**Source**: `src/lib/models/Achievement.js` (Feature 028)

**Key Fields**:
- `achievementId`: String (unique slug, e.g., "first-twelve")
- `translations`: Object with `en`/`es` nested objects containing `name`, `description`
- `criteria`: Mixed schema object
  - `type`: String enum (duration-milestone, streak, entry-count, goal-completion, weight-loss, custom)
  - `params`: Object (varies by type)
    - Duration: `{ minDuration: Number }` (minutes)
    - Streak: `{ streakLength: Number }` (days)
    - Entry count: `{ entryCount: Number }`
    - Goal: `{ goalsCompleted: Number }`
    - Weight: `{ poundsLost: Number }`
    - Custom: `{ customKey: String, ...additionalParams }`
- `category`: String enum (duration, streak, consistency, goals, weight-loss, health, milestones, special)
- `rarity`: String enum (common, rare, epic, legendary)
- `points`: Number (5-500 based on rarity)
- `icon`: String (emoji)
- `isActive`: Boolean (default true)
- `isSecret`: Boolean (default false)

**Relationships**:
- Referenced by UserAchievement.achievementId (String foreign key)

**Validation Rules**:
- achievementId must be kebab-case
- criteria.type must match one of supported types
- points must align with rarity (common: 5-20, rare: 25-50, epic: 75-150, legendary: 200-500)

**Indexes**:
- Unique on `achievementId`
- Compound on `(category, isActive)`

---

### 2. UserAchievement (Existing - No Changes)

**Purpose**: Tracks which achievements each user has unlocked

**Source**: `src/lib/models/UserAchievement.js` (Feature 028)

**Key Fields**:
- `userId`: ObjectId (ref: User)
- `achievementId`: String (ref: Achievement.achievementId)
- `unlockedAt`: Date (timestamp of unlock)
- `progress`: Object (stores relevant metrics at time of unlock)
  - Duration: `{ durationMinutes: Number }`
  - Streak: `{ currentStreak: Number, longestStreak: Number }`
  - Count: `{ totalEntries: Number }`
  - Goal: `{ goalsCompleted: Number }`
  - Weight: `{ poundsLost: Number, currentWeight: Number }`
- `notificationSeen`: Boolean (default false)

**Relationships**:
- Many-to-one with User (userId)
- Many-to-one with Achievement (achievementId)

**Validation Rules**:
- userId and achievementId required
- Unique combination (userId + achievementId) - prevents duplicates

**Indexes**:
- Unique compound on `(userId, achievementId)` - **Critical for idempotency**
- Compound on `(userId, unlockedAt desc)` - for recent achievements queries

**State Transitions**:
None - UserAchievement is immutable once created (achievements never revoked)

---

### 3. Entry (Existing - No Changes Needed)

**Purpose**: Stores user fasting entries

**Source**: `src/lib/models/Entry.js`

**Key Fields Used by Achievement System**:
- `userId`: ObjectId (ref: User)
- `firstMeal`: Date (when fast ended)
- `lastMeal`: Date (when fast started, typically previous day)
- `fastingDuration`: Number (minutes, calculated from meal times)
- `date`: Date (midnight UTC, represents the day of the entry)
- `goalStatus`: String enum (completed, not-completed, no-goal)
- `morningWeight`: Number (pounds, optional)
- `createdAt`: Date (when entry record was created)
- `updatedAt`: Date (when entry was last modified)

**Relationships**:
- Many-to-one with User (userId)
- Indirectly triggers UserAchievement creation via AchievementService

**Indexes**:
- Compound on `(userId, date)`
- Unique on `(userId, date)` - one entry per user per day

**Notes**:
- `fastingDuration` is the primary field for duration-based achievements
- `date` derived from meal times, not entry creation time (important for streaks)
- Multiple entries on same date not allowed (unique constraint)

---

### 4. User (Existing - Extension Required)

**Purpose**: Stores user profile data

**Source**: `src/lib/models/User.js`

**Existing Fields**:
- `_id`: ObjectId (primary key)
- `email`: String (unique)
- `name`: String
- Various auth fields...

**New Field Required**:
```javascript
achievementPoints: {
  type: Number,
  default: 0,
  min: 0
}
```

**Additional Field Used by Achievement System**:
```javascript
startingWeight: {
  type: Number,
  required: false,  // Optional - user may not track weight
  min: 1,
  max: 1000
}
```

**Relationships**:
- One-to-many with Entry (userId)
- One-to-many with UserAchievement (userId)

**State Transitions**:
- `achievementPoints` incremented atomically when achievements unlock
- `startingWeight` set by user in profile, used for weight-loss calculations

---

## Service Layer Data Structures

### AchievementService Internal Structures

#### 1. EvaluationResult (Return Type)
```javascript
{
  unlockedAchievements: [
    {
      achievementId: String,
      name: { en: String, es: String },
      description: { en: String, es: String },
      points: Number,
      rarity: String,
      icon: String,
      category: String
    }
  ],
  totalPointsEarned: Number
}
```

#### 2. QualifiedAchievements (Internal)
```javascript
{
  duration: [achievementId1, achievementId2, ...],
  streak: [achievementId3, ...],
  entryCount: [achievementId4, ...],
  goalCompletion: [achievementId5, ...],
  weightLoss: [achievementId6, ...],
  custom: [achievementId7, ...]
}
```

#### 3. Progress Snapshots (Stored in UserAchievement.progress)

**Duration Achievement**:
```javascript
{
  durationMinutes: 720,  // The duration that qualified
  entryDate: "2025-11-06T00:00:00Z"
}
```

**Streak Achievement**:
```javascript
{
  currentStreak: 7,
  longestStreak: 10,  // User's all-time longest
  startDate: "2025-10-30T00:00:00Z",
  endDate: "2025-11-06T00:00:00Z"
}
```

**Entry Count Achievement**:
```javascript
{
  totalEntries: 50,
  firstEntryDate: "2025-01-01T00:00:00Z",
  milestoneDate: "2025-11-06T00:00:00Z"
}
```

**Goal Completion Achievement**:
```javascript
{
  goalsCompleted: 25,
  totalEntries: 50,  // For context (50% completion rate)
  milestoneDate: "2025-11-06T00:00:00Z"
}
```

**Weight Loss Achievement**:
```javascript
{
  poundsLost: 15,
  startingWeight: 200,
  currentWeight: 185,
  milestoneDate: "2025-11-06T00:00:00Z"
}
```

**Custom Achievement**:
```javascript
{
  customKey: "first-morning-entry",
  firstMealTime: "2025-11-06T07:30:00Z",
  // Additional context specific to custom criteria
}
```

---

## Cache Data Structures

### SimpleCache (src/lib/utils/cache.js)

```javascript
class SimpleCache {
  // Internal structure
  cache: Map<String, {
    value: any,
    timestamp: Number  // Date.now() when cached
  }>
  
  ttl: Number  // TTL in milliseconds (default 3600000 = 1 hour)
}
```

**Cached Achievements Structure**:
```javascript
// Key: 'active'
// Value: Array<Achievement> (lean Mongoose documents)
[
  {
    achievementId: "first-twelve",
    translations: { en: {...}, es: {...} },
    criteria: { type: "duration-milestone", params: { minDuration: 720 } },
    category: "duration",
    rarity: "common",
    points: 10,
    icon: "🎯",
    isActive: true,
    isSecret: false
  },
  // ... 80 more achievements
]
```

---

## Data Flow Diagrams

### 1. Entry Save → Achievement Evaluation Flow

```
User saves entry (POST/PUT /api/entries)
  ↓
Entry.create() or Entry.findByIdAndUpdate()
  ↓
AchievementService.evaluateAndUnlock(userId, entryId)
  ↓
├─ Load cached achievements (1h TTL)
├─ Load entry data
├─ Load user data (for startingWeight, achievementPoints)
├─ Evaluate duration criteria → [qualified achievement IDs]
├─ Evaluate streak criteria → [qualified achievement IDs]
├─ Evaluate entry count criteria → [qualified achievement IDs]
├─ Evaluate goal criteria → [qualified achievement IDs]
├─ Evaluate weight criteria → [qualified achievement IDs]
├─ Evaluate custom criteria → [qualified achievement IDs]
  ↓
Merge all qualified IDs (deduplicate)
  ↓
unlockAchievements(userId, qualifiedIds)
  ↓
For each qualified ID:
  ├─ Try UserAchievement.create()
  ├─ Catch E11000 (duplicate) → skip silently
  ├─ Log errors but continue with remaining
  └─ Collect successfully created records
  ↓
Calculate totalPointsEarned
  ↓
User.findByIdAndUpdate({ $inc: { achievementPoints: totalPointsEarned } })
  ↓
Return { unlockedAchievements, totalPointsEarned }
  ↓
API response includes achievement data
  ↓
Frontend displays toast notification
```

### 2. Streak Calculation Flow

```
evaluateStreakAchievements(userId, entry)
  ↓
Query entries: Entry.find({ userId }).sort({ date: -1 }).limit(100).select('date')
  ↓
Extract array of dates: ['2025-11-06', '2025-11-05', '2025-11-04', ...]
  ↓
Calculate current streak (count consecutive dates backwards from today)
  ↓
Load streak achievements from cache
  ↓
Filter achievements where: criteria.params.streakLength <= currentStreak
  ↓
Return qualified achievement IDs
```

### 3. Weight Loss Calculation Flow

```
evaluateWeightAchievements(userId)
  ↓
Load user: User.findById(userId).select('startingWeight')
  ↓
If no startingWeight → return [] (no weight achievements possible)
  ↓
Query latest weight: Entry.findOne({ userId, morningWeight: { $exists: true } })
                           .sort({ date: -1 })
                           .select('morningWeight')
  ↓
If no weight entry found → return []
  ↓
Calculate: weightLoss = startingWeight - morningWeight
  ↓
If weightLoss <= 0 → return [] (weight gain or no change)
  ↓
Load weight-loss achievements from cache
  ↓
Filter achievements where: criteria.params.poundsLost <= weightLoss
  ↓
Return qualified achievement IDs
```

---

## Validation Rules Summary

### Achievement Unlock Validation
1. **User exists**: userId must reference valid User document
2. **Entry exists**: entryId must reference valid Entry document
3. **Entry ownership**: entry.userId must match userId parameter
4. **Achievement active**: Only evaluate achievements with isActive=true
5. **Criteria met**: Achievement criteria evaluation returns true
6. **Not already unlocked**: UserAchievement unique constraint enforces

### Data Integrity Constraints
1. **Idempotency**: Duplicate unlock attempts fail silently (E11000 handled)
2. **Atomicity**: User points updated atomically with $inc operator
3. **Immutability**: UserAchievement records never modified after creation
4. **Referential integrity**: achievementId must exist in Achievement collection (enforced by application logic, not FK)

### Performance Constraints
1. **Query limits**: Streak calculation limited to 100 most recent entries
2. **Cache TTL**: Achievement definitions cached for 1 hour maximum
3. **Timeout**: Total evaluation must complete in <200ms (target)
4. **Batch size**: No artificial limit on simultaneous unlocks (typically <10)

---

## Migration Requirements

### User Model Extension

**Migration Script** (if achievementPoints field doesn't exist):
```javascript
// migrations/004-add-achievement-points.js
async function up(db) {
  await db.collection('users').updateMany(
    { achievementPoints: { $exists: false } },
    { $set: { achievementPoints: 0 } }
  );
  console.log('Added achievementPoints field to all users');
}

async function down(db) {
  await db.collection('users').updateMany(
    {},
    { $unset: { achievementPoints: "" } }
  );
  console.log('Removed achievementPoints field from all users');
}

module.exports = { up, down };
```

**Verification Query**:
```javascript
// Check if field exists and has default value
db.users.find({ achievementPoints: { $exists: false } }).count()
// Should return 0 after migration
```

---

## Data Model Validation Complete

All entities documented with fields, relationships, indexes, and validation rules. Service layer data structures defined. Data flows mapped. Ready for contract generation (Phase 1 continued).
