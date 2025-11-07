# Data Model: Achievement Unlock API Response

**Feature**: 032-achievement-unlock-response  
**Date**: November 7, 2025  
**Status**: Design

## Overview

This feature does NOT introduce new database schemas or modify existing models. It extends the API response format for Entry endpoints to include unlocked achievement data. All database models (Entry, Achievement, UserAchievement) remain unchanged from their definitions in Features 001, 028, and 031.

---

## Entities

### No New Entities

This feature is purely an API integration layer. All entities are existing:

- **Entry** (Feature 001): MongoDB document representing fasting entries - NO CHANGES
- **Achievement** (Feature 028): MongoDB document storing achievement definitions - NO CHANGES  
- **UserAchievement** (Feature 031): MongoDB document tracking unlocked achievements - NO CHANGES

---

## Response Objects (Transient, Not Persisted)

### UnlockedAchievement Response Object

**Purpose**: Transient JavaScript object included in API responses when achievements are unlocked. Not stored in database.

**Structure**:
```javascript
{
  achievementId: String,       // Achievement identifier (e.g., "first-twelve")
  name: String,                // Display name (e.g., "First 12-Hour Fast")
  description: String,         // Full description text
  points: Number,              // Points awarded (e.g., 10)
  rarity: String,              // Enum: "common" | "rare" | "epic" | "legendary"
  category: String,            // Enum: "duration" | "streak" | "goal" | "weight" | "custom"
  iconColor: String,           // Hex color code (e.g., "#10B981")
  unlockedAt: String           // ISO 8601 timestamp (e.g., "2025-11-07T14:30:00.000Z")
}
```

**Field Details**:

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `achievementId` | String | Yes | Achievement.achievementId | Unique identifier (slug format) |
| `name` | String | Yes | Achievement.translations.en.name | English translation by default |
| `description` | String | Yes | Achievement.translations.en.description | Full description text |
| `points` | Number | Yes | Achievement.points | Points awarded (10-100 range) |
| `rarity` | String | Yes | Achievement.rarity | Display tier (affects UI styling) |
| `category` | String | Yes | Achievement.category | Groups related achievements |
| `iconColor` | String | Yes | Achievement.iconColor | Hex color for UI theming |
| `unlockedAt` | String | Yes | UserAchievement.unlockedAt | ISO 8601 timestamp when unlocked |

**Construction Logic**:
```javascript
// In AchievementService.evaluateAndUnlock() return value
const unlockedAchievements = userAchievements.map(ua => {
  const achievement = achievements.find(a => a.achievementId === ua.achievementId);
  return {
    achievementId: achievement.achievementId,
    name: achievement.translations.en.name,
    description: achievement.translations.en.description,
    points: achievement.points,
    rarity: achievement.rarity,
    category: achievement.category,
    iconColor: achievement.iconColor,
    unlockedAt: ua.unlockedAt.toISOString()
  };
});
```

**Validation Rules**:
- All fields must be present (no nulls) - if achievement data malformed, exclude from array
- `rarity` must be one of: "common", "rare", "epic", "legendary"
- `category` must be one of: "duration", "streak", "goal", "weight", "custom", "special"
- `iconColor` must be valid hex color (e.g., "#10B981")
- `unlockedAt` must be ISO 8601 formatted string

---

## API Response Formats

### POST /api/entries Response (Extended)

**Status Code**: 201 Created

**Response Body**:
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

**When No Achievements Unlocked**:
```json
{
  "_id": "...",
  "...": "...entry fields...",
  "unlockedAchievements": []
}
```

**When Achievement Evaluation Fails**:
```json
{
  "_id": "...",
  "...": "...entry fields...",
  "unlockedAchievements": []
}
```

### PUT /api/entries/[id] Response (Extended)

**Status Code**: 200 OK

**Response Body**: Same structure as POST response (includes updated entry fields + `unlockedAchievements`)

---

## Data Flow

### Entry Creation Flow (POST)

```
1. Client POST /api/entries
   └─> Request body: { date, lastMealTime, firstMealTime, ... }

2. API Route Handler (route.js)
   ├─> Validate request body (Joi schema)
   ├─> Create Entry document
   ├─> entry.save()
   └─> ✅ Entry saved to database

3. Achievement Evaluation (try/catch block)
   ├─> Call AchievementService.evaluateAndUnlock(userId, entry._id)
   ├─> Service queries Achievement, Entry, UserAchievement collections
   ├─> Service creates UserAchievement records (if qualified)
   ├─> Service updates User.achievementPoints (atomic increment)
   └─> Service returns { unlockedAchievements: [...], pointsAdded: N }
   
4. Error Handling
   ├─> If service throws error: catch, log, set unlockedAchievements = []
   └─> If service succeeds: extract unlockedAchievements from result

5. Response Construction
   └─> createdResponse({ ...entry.toObject(), unlockedAchievements })
```

### Entry Update Flow (PUT)

```
1. Client PUT /api/entries/[id]
   └─> Request body: { date, fastingDuration, ... }

2. API Route Handler ([id]/route.js)
   ├─> Validate request body (Joi schema)
   ├─> Find Entry by ID and userId
   ├─> Update Entry fields
   ├─> updatedEntry.save()
   └─> ✅ Entry updated in database

3. Achievement Evaluation (try/catch block)
   └─> [Same flow as POST above]

4. Response Construction
   └─> okResponse({ ...updatedEntry.toObject(), unlockedAchievements })
```

---

## Database Impact

### No Schema Changes

- **Entry Model**: No changes to schema or indexes
- **Achievement Model**: No changes (read-only queries)
- **UserAchievement Model**: No changes (created by AchievementService)
- **User Model**: No changes (achievementPoints updated by AchievementService)

### Query Patterns (Existing)

All database queries performed by `AchievementService.evaluateAndUnlock()` (Feature 031):

1. **Achievement Definitions**: `Achievement.find({ isActive: true }).lean()` (cached 1 hour)
2. **User Entries**: `Entry.find({ userId }).sort({ date: 1 }).lean()` (for streak/goal evaluation)
3. **Existing Unlocks**: `UserAchievement.find({ userId }).distinct('achievementId')`
4. **Create Unlock**: `UserAchievement.create({ userId, achievementId, unlockedAt })` (with E11000 handling)
5. **Update Points**: `User.findByIdAndUpdate(userId, { $inc: { achievementPoints: points } })`

**No additional queries introduced by this feature.**

---

## Performance Considerations

### Response Size

**Typical Case** (1-3 achievements):
- Entry object: ~500-800 bytes
- Each achievement: ~200-250 bytes
- **Total**: ~1-1.5 KB per response

**Maximum Case** (10+ achievements, e.g., first 72h fast):
- Entry object: ~800 bytes
- 10 achievements: ~2.5 KB
- **Total**: ~3.3 KB per response

**Well within 50KB target** specified in success criteria.

### Serialization

- Uses `entry.toObject()` for efficient Mongoose → plain object conversion
- `unlockedAchievements` array constructed from lean queries (no Mongoose overhead)
- `JSON.stringify()` handles serialization (built-in Node.js, fast)

---

## Validation Summary

### Request Validation

**No changes** - Entry API request validation remains unchanged (uses existing `entrySchema.js`)

### Response Validation

**Client-Side** (recommended):
```javascript
// TypeScript interface (for frontend reference)
interface UnlockedAchievement {
  achievementId: string;
  name: string;
  description: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'duration' | 'streak' | 'goal' | 'weight' | 'custom' | 'special';
  iconColor: string; // Hex color
  unlockedAt: string; // ISO 8601
}

interface EntryWithAchievements extends Entry {
  unlockedAchievements: UnlockedAchievement[];
}
```

**Runtime Checks** (in AchievementService):
- Exclude achievements with missing required fields from response array
- Default to empty array if service fails (graceful degradation)

---

## Testing Data Requirements

### Test Fixtures

**Achievement Definitions** (existing from Feature 030):
```javascript
{
  achievementId: 'first-twelve',
  translations: { en: { name: 'First 12-Hour Fast', description: '...', shortDescription: '...' } },
  points: 10,
  rarity: 'common',
  category: 'duration',
  iconColor: '#10B981',
  criteria: { type: 'duration-milestone', params: { minDuration: 720 } }
}
```

**Test Entries** (trigger unlocks):
```javascript
// Entry that unlocks "first-twelve"
{ date: '2025-11-07', lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 960 }

// Entry that unlocks multiple (12h, 24h milestones)
{ date: '2025-11-08', lastMealTime: '20:00', firstMealTime: '20:00', fastingDuration: 1440 }
```

**Mock Error Scenarios**:
```javascript
// Mock AchievementService to throw error
jest.spyOn(AchievementService, 'evaluateAndUnlock').mockRejectedValue(new Error('Database timeout'));
```

---

## Migration Requirements

**None** - This feature does not require database migrations. All changes are in API response format only.

---

## Backward Compatibility

### Existing Clients

**Fully Backward Compatible**:
- Response includes all existing entry fields (no removals)
- New `unlockedAchievements` field is additive
- Clients ignoring the new field will continue to work
- No breaking changes to request format or validation

### Deprecation

**None** - No deprecated fields or endpoints.

---

## Glossary

| Term | Definition |
|------|------------|
| **UnlockedAchievement** | Transient response object containing achievement metadata (not a database model) |
| **Achievement Evaluation** | Process of checking user entries against achievement criteria to determine unlocks |
| **Non-Blocking** | Achievement evaluation errors do not prevent entry save operations from succeeding |
| **Graceful Degradation** | System returns valid response (empty achievements array) even when achievement service fails |
| **Idempotent Unlock** | Calling unlock logic multiple times for same achievement does not create duplicates (E11000 handling) |
