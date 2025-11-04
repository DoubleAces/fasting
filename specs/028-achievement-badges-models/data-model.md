# Data Model: Achievement & Badges System

**Feature**: 028-achievement-badges-models  
**Date**: November 4, 2025  
**Phase**: 1 - Data Model Design

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ _id: ObjectId (PK)  │◄─────────┐
│ email: String       │          │
│ password: String    │          │
│ name: String        │          │
│ ...existing fields  │          │
│                     │          │
│ NEW FIELDS:         │          │
│ preferredLanguage   │          │
│ achievementPoints   │          │
└─────────────────────┘          │
                                 │
                                 │ userId (ref)
┌─────────────────────────────┐  │
│     Achievement             │  │
│─────────────────────────────│  │
│ _id: ObjectId (auto)        │  │
│ achievementId: String (PK)  │──┐
│ translations: Object        │  │
│ badgeImage: Object          │  │
│ icon: String                │  │
│ iconColor: String           │  │
│ category: String (enum)     │  │
│ points: Number              │  │
│ rarity: String (enum)       │  │
│ order: Number               │  │
│ criteria: Object            │  │
│ isActive: Boolean           │  │
│ isSecret: Boolean           │  │
│ releaseDate: Date           │  │
│ createdBy: ObjectId (ref)   │──┼─────────┐
│ createdAt: Date             │  │         │
│ updatedAt: Date             │  │         │
└─────────────────────────────┘  │         │
                                 │         │
           achievementId (string)│         │
                                 │         │
┌─────────────────────────────┐  │         │
│   UserAchievement           │  │         │
│─────────────────────────────│  │         │
│ _id: ObjectId (auto)        │  │         │
│ userId: ObjectId (ref)      │──┼─────────┤
│ achievementId: String       │◄─┘         │
│ unlockedAt: Date            │            │
│ progress: Number            │            │
│ notificationSeen: Boolean   │            │
│ createdAt: Date             │            │
│ updatedAt: Date             │            │
└─────────────────────────────┘            │
                                           │
    Compound Unique Index:                 │
    (userId + achievementId)               │
                                           │
    Performance Index:                     │
    (userId + unlockedAt DESC)             │
                                           │
                                createdBy (ref)
```

**Relationship Types**:
- User → UserAchievement: One-to-Many (one user has many unlocked achievements)
- Achievement → UserAchievement: One-to-Many (one achievement unlocked by many users)
- User → Achievement: One-to-Many (one admin creates many achievements via createdBy)
- UserAchievement → Achievement: **String reference** (not ObjectId) via achievementId slug

**Key Design Note**: UserAchievement uses string-based achievementId (not ObjectId ref) to support Achievement soft deletes without orphaning user progress records.

---

## Entity Specifications

### 1. Achievement

**Purpose**: Stores badge/achievement definitions with multilingual metadata, unlock criteria, and visual assets.

**Schema**:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `_id` | ObjectId | Auto-generated | - | MongoDB primary key |
| `achievementId` | String | Required, Unique, lowercase | - | Human-readable slug (e.g., 'sweet-sixteen', 'first-fast') |
| `translations` | Object | Required, nested | - | Multilingual names/descriptions (see structure below) |
| `badgeImage` | Object | Optional | null | URLs for locked/unlocked badge images |
| `badgeImage.locked` | String | Optional | null | URL to locked (grayed) badge image |
| `badgeImage.unlocked` | String | Optional | null | URL to unlocked (colored) badge image |
| `icon` | String | Optional | null | Emoji or unicode character (alternative to badgeImage) |
| `iconColor` | String | Optional | null | Hex color code for icon background (e.g., '#4F46E5') |
| `category` | String (Enum) | Required | - | One of: 'getting-started', 'duration', 'streak', 'goal', 'weight', 'consistency', 'special', 'knowledge' |
| `points` | Number | Required | 0 | Gamification points awarded when unlocked |
| `rarity` | String (Enum) | Required | 'common' | One of: 'common', 'rare', 'epic', 'legendary' |
| `order` | Number | Required | 0 | Display sort order (lower numbers shown first) |
| `criteria` | Object | Required, nested | - | Unlock criteria (see structure below) |
| `criteria.type` | String | Required | - | Criteria type identifier (e.g., 'duration-milestone', 'streak', 'entry-count') |
| `criteria.params` | Mixed | Required | - | Type-specific parameters (flexible schema) |
| `isActive` | Boolean | Optional | true | Whether achievement is currently available |
| `isSecret` | Boolean | Optional | false | Whether achievement is hidden until unlocked |
| `releaseDate` | Date | Optional | null | Date achievement becomes available (for timed releases) |
| `createdBy` | ObjectId | Required | - | Reference to admin User who created achievement |
| `createdAt` | Date | Auto-generated | - | Timestamp of creation |
| `updatedAt` | Date | Auto-generated | - | Timestamp of last update |

**Translations Object Structure**:
```javascript
translations: {
  en: {
    name: String,              // Required for 'en', optional for others
    description: String,       // Required for 'en', optional for others
    shortDescription: String   // Required for 'en', optional for others
  },
  es: { name, description, shortDescription },  // Optional
  fr: { name, description, shortDescription },  // Optional
  de: { name, description, shortDescription },  // Optional
  pt: { name, description, shortDescription }   // Optional
}
```

**Criteria Object Examples**:
```javascript
// Duration milestone (16-hour fast)
criteria: {
  type: 'duration-milestone',
  params: { hours: 16 }
}

// Streak achievement (7-day streak)
criteria: {
  type: 'streak',
  params: { days: 7 }
}

// Entry count (100 logged entries)
criteria: {
  type: 'entry-count',
  params: { count: 100 }
}

// Goal achievement (50 goals met)
criteria: {
  type: 'goal-completion',
  params: { goalType: 'any', count: 50 }
}
```

**Indexes**:
- `achievementId`: Unique index (implicit from unique constraint)
- `category`: Consider adding if >1000 achievements for category filtering

**Validation Rules**:
- achievementId: lowercase, no spaces, alphanumeric + hyphens only (validated in application)
- translations.en: Required (at minimum), other languages optional
- badgeImage OR icon: At least one must be provided (validated in application)
- category: Must be one of 8 predefined values
- rarity: Must be one of 4 predefined values
- points: Non-negative integer
- order: Integer (can be negative for special ordering)

**State Transitions**:
- Created (isActive: false) → Published (isActive: true, releaseDate set)
- Published → Retired (isActive: false)
- Visible → Secret (isSecret: true) for hidden achievements
- Secret → Revealed (isSecret: false) after first unlock or admin decision

---

### 2. UserAchievement

**Purpose**: Tracks which achievements users have unlocked and their progress toward incomplete achievements.

**Schema**:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `_id` | ObjectId | Auto-generated | - | MongoDB primary key |
| `userId` | ObjectId | Required, ref: User | - | User who unlocked/progressed achievement |
| `achievementId` | String | Required | - | String reference to Achievement.achievementId (NOT ObjectId) |
| `unlockedAt` | Date | Required | - | Timestamp when achievement was unlocked |
| `progress` | Number | Optional | 0 | Incremental progress (0-100 for %, raw count otherwise) |
| `notificationSeen` | Boolean | Optional | false | Whether user has seen unlock notification |
| `createdAt` | Date | Auto-generated | - | Timestamp of creation |
| `updatedAt` | Date | Auto-generated | - | Timestamp of last update |

**Indexes**:
- `{ userId: 1, achievementId: 1 }`: **Unique compound index** (prevents duplicate unlocks)
- `{ userId: 1, unlockedAt: -1 }`: **Descending index** (optimizes "recent achievements" queries)

**Validation Rules**:
- userId: Must exist in User collection (referential integrity via Mongoose)
- achievementId: Must match an Achievement.achievementId (validated in application, not foreign key)
- unlockedAt: Cannot be in the future
- progress: Non-negative number (0 ≤ progress)
- notificationSeen: Boolean only

**State Transitions**:
- In Progress (progress < 100, unlockedAt: null) → Unlocked (progress: 100, unlockedAt: Date)
- Unlocked Unseen (notificationSeen: false) → Seen (notificationSeen: true)
- Progress increment: progress increases but unlockedAt remains null until completion

**Query Patterns**:
1. **Recent unlocks**: `UserAchievement.find({ userId }).sort({ unlockedAt: -1 }).limit(5)`
2. **Check unlock status**: `UserAchievement.findOne({ userId, achievementId })`
3. **In-progress achievements**: `UserAchievement.find({ userId, unlockedAt: null })`
4. **Unseen notifications**: `UserAchievement.find({ userId, notificationSeen: false })`

---

### 3. User (Extended)

**Purpose**: Existing authentication and profile model, extended with gamification and language preference fields.

**New Fields Only**:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `preferredLanguage` | String (Enum) | Optional | 'en' | User's preferred language for achievement display |
| `achievementPoints` | Number | Optional | 0 | Total points earned from unlocked achievements |

**Enum Values for preferredLanguage**:
- 'en' (English)
- 'es' (Spanish)
- 'fr' (French)
- 'de' (German)
- 'pt' (Portuguese)
- 'ja' (Japanese)
- 'zh' (Chinese)

**Validation Rules**:
- preferredLanguage: Must be one of 7 supported languages
- achievementPoints: Non-negative integer (cannot decrease)

**Integration Notes**:
- **No breaking changes**: Existing User authentication, session, and profile methods unaffected
- **Default values**: New fields auto-populate on existing documents (Mongoose feature)
- **Indexes**: No new indexes required (points not queried in isolation, language is user preference)

**State Transitions**:
- User creation: preferredLanguage='en', achievementPoints=0
- Language change: User updates preferredLanguage via profile settings
- Points increment: achievementPoints += achievement.points when UserAchievement created
- Points never decrease (no rollback logic required)

---

## Data Integrity Rules

### Referential Integrity
1. **UserAchievement.userId → User._id**: Strong reference (Mongoose ref, enforced on write)
2. **UserAchievement.achievementId → Achievement.achievementId**: Weak reference (string, not enforced)
   - **Rationale**: Allows Achievement soft deletes without orphaning UserAchievement records
   - **Trade-off**: Application must handle missing achievements in queries (join with null check)
3. **Achievement.createdBy → User._id**: Strong reference (Mongoose ref, enforced on write)

### Uniqueness Constraints
1. **Achievement.achievementId**: Globally unique across all achievements
2. **UserAchievement (userId + achievementId)**: Compound unique (one unlock per user per achievement)
3. **User.email**: Existing constraint (unaffected by new fields)

### Cascading Behavior
- **User deleted**: UserAchievement documents remain (orphaned userId, historical data preserved)
- **Achievement soft-deleted** (isActive: false): UserAchievement documents unaffected
- **Achievement hard-deleted**: UserAchievement.achievementId becomes dangling reference (acceptable, rare event)

### Consistency Rules
1. **Achievement Points Accumulation**: User.achievementPoints = SUM(UserAchievement.achievement.points for userId)
   - **Enforcement**: Application-level (increment on unlock, no decrement)
   - **Recalculation**: Admin script if needed (not automated)
2. **Progress Range**: 0 ≤ UserAchievement.progress (no upper bound enforced, interpretation varies by criteria type)
3. **Unlock Date**: UserAchievement.unlockedAt ≤ NOW() (cannot unlock achievements in the future)

---

## Sample Data

### Achievement Example: "Sweet Sixteen" (16-Hour Fast)

```javascript
{
  _id: ObjectId("..."),
  achievementId: "sweet-sixteen",
  translations: {
    en: {
      name: "Sweet Sixteen",
      description: "Complete a 16-hour fast for the first time",
      shortDescription: "First 16h fast"
    },
    es: {
      name: "Dulces Dieciséis",
      description: "Completa un ayuno de 16 horas por primera vez",
      shortDescription: "Primer ayuno 16h"
    }
  },
  badgeImage: {
    locked: "https://storage.example.com/badges/sweet-sixteen-locked.png",
    unlocked: "https://storage.example.com/badges/sweet-sixteen-unlocked.png"
  },
  icon: "⏱️",
  iconColor: "#10B981",
  category: "duration",
  points: 50,
  rarity: "common",
  order: 10,
  criteria: {
    type: "duration-milestone",
    params: { hours: 16 }
  },
  isActive: true,
  isSecret: false,
  releaseDate: new Date("2025-01-01"),
  createdBy: ObjectId("...admin_user_id..."),
  createdAt: new Date("2024-12-15"),
  updatedAt: new Date("2024-12-15")
}
```

### UserAchievement Example: User Unlocks "Sweet Sixteen"

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("...user_id..."),
  achievementId: "sweet-sixteen",
  unlockedAt: new Date("2025-11-04T08:30:00Z"),
  progress: 100,
  notificationSeen: false,
  createdAt: new Date("2025-11-04T08:30:00Z"),
  updatedAt: new Date("2025-11-04T08:30:00Z")
}
```

### User Example: Extended Fields

```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  // ...existing fields...
  preferredLanguage: "es",
  achievementPoints: 150,  // Sum of unlocked achievement points
  // ...existing fields...
}
```

---

## Migration Considerations

### For Existing Users
- **preferredLanguage**: Auto-defaults to 'en' on first read (no migration script needed)
- **achievementPoints**: Auto-defaults to 0 on first read (no migration script needed)
- **Mongoose Behavior**: Default values applied by Mongoose when field is undefined

### For New Collections
- **Achievement**: Empty collection, seeded via admin UI or migration script (out of scope)
- **UserAchievement**: Empty collection, populated as users unlock achievements

### Rollback Strategy
If feature needs to be rolled back:
1. Remove UserAchievement and Achievement collections (or mark all isActive: false)
2. Keep User.preferredLanguage and User.achievementPoints fields (harmless if unused)
3. No code changes required to existing authentication/profile features

---

## Performance Characteristics

### Expected Query Performance
- **Category filter**: O(log n) with category index if added, O(n) scan acceptable for <100 docs
- **User achievement lookup**: O(1) with compound unique index on (userId + achievementId)
- **Recent achievements**: O(log n) with descending index on (userId + unlockedAt)
- **Achievement by ID**: O(1) with unique index on achievementId

### Storage Estimates
- **Achievement**: ~2 KB per document × 100 documents = 200 KB
- **UserAchievement**: ~200 bytes per document × 10,000 per 100 users = 2 MB
- **User extension**: +50 bytes per user × 10,000 users = 500 KB
- **Total**: <3 MB for expected scale (negligible)

### Write Performance
- **Achievement creation**: Infrequent (admin-only), no optimization needed
- **UserAchievement unlock**: Occasional (per user milestone), compound index adds ~1ms write latency (acceptable)
- **Points increment**: Occasional (on unlock), single field update = fast

### Read/Write Ratio
- **Achievement**: 99% reads (admin creates, users query frequently)
- **UserAchievement**: 80% reads, 20% writes (unlock + progress updates)
- **User**: 95% reads (language preference rarely changes, points increment on unlocks)

**Conclusion**: Read-heavy workload, indexes optimized for reads, minimal write latency impact

---

## Validation Summary

### Schema-Level Validation (Mongoose)
- Required fields enforced by Mongoose
- Enum values validated by Mongoose
- Default values applied by Mongoose
- Timestamps auto-managed by Mongoose

### Application-Level Validation
- achievementId slug format (lowercase, alphanumeric + hyphens)
- translations.en presence (at least English required)
- badgeImage OR icon presence (at least one visual asset)
- criteria.params structure (varies by criteria.type)
- Achievement existence when creating UserAchievement (weak reference)

### Database-Level Constraints
- Unique index on Achievement.achievementId
- Compound unique index on UserAchievement (userId + achievementId)
- ObjectId validity for User references

---

## Testing Checklist

### Unit Tests (Schema Validation)
- [ ] Achievement with all required fields saves successfully
- [ ] Achievement without achievementId fails validation
- [ ] Achievement with invalid category enum fails validation
- [ ] UserAchievement with duplicate (userId + achievementId) fails unique constraint
- [ ] User with invalid preferredLanguage enum fails validation
- [ ] User with negative achievementPoints fails validation

### Integration Tests (Database Operations)
- [ ] Create Achievement → query by achievementId returns document with translations
- [ ] Create 2 UserAchievements for same user → both save successfully (different achievementIds)
- [ ] Create duplicate UserAchievement → MongoDB rejects with duplicate key error
- [ ] Update User.preferredLanguage → saves without affecting password or email
- [ ] Query UserAchievements sorted by unlockedAt desc → returns in correct order

### Acceptance Tests (from spec.md)
- [ ] User Story 1, Scenario 1: Achievement with English translations saves with nested object
- [ ] User Story 1, Scenario 2: Achievement criteria object persists with correct structure
- [ ] User Story 2, Scenario 2: Duplicate unlock prevented by unique compound index
- [ ] User Story 3, Scenario 4: New user has preferredLanguage='en' and achievementPoints=0

---

## Future Enhancements (Out of Scope)

- **Achievement versioning**: Track changes to achievement definitions over time
- **UserAchievement history**: Store unlock history (multiple unlocks for repeatable achievements)
- **Leaderboard queries**: Aggregate functions for top achievementPoints users (requires new indexes)
- **Multi-tier achievements**: Parent-child relationships for achievement series (e.g., "Fasting Master" unlocks after 5 duration achievements)
- **Conditional achievements**: Prerequisites (unlock A before B becomes visible)

**Note**: These enhancements would require schema changes and additional indexes, deferred to future features.
