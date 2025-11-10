# Data Model Specification

**Feature**: 035 Admin Achievement Management UI  
**Date**: 2025-01-09  
**Phase**: 1 (Design Artifacts)

---

## Overview

This feature extends existing Achievement and UserAchievement models from Feature 028 with a new AdminAuditLog model for audit trail tracking. No modifications to existing models are required.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│   Achievement       │
│  (Feature 028)      │
│─────────────────────│
│ _id: ObjectId   [PK]│
│ achievementId: str  │◄────┐
│ category: enum      │     │
│ type: enum          │     │
│ tier: enum          │     │
│ isActive: bool      │     │
│ createdAt: Date     │     │
│ updatedAt: Date     │     │
│ createdBy: ObjectId │     │
│ rarity: object      │     │
│ criteria: object    │     │
│ translations: obj   │     │
└─────────────────────┘     │
                            │ (references)
┌─────────────────────┐     │
│  UserAchievement    │     │
│  (Feature 028)      │     │
│─────────────────────│     │
│ _id: ObjectId   [PK]│     │
│ userId: ObjectId    │     │
│ achievementId: str  │─────┘
│ unlockedAt: Date    │
│ progress: object    │
└─────────────────────┘

┌─────────────────────┐
│  AdminAuditLog      │
│  (NEW)              │
│─────────────────────│
│ _id: ObjectId   [PK]│
│ timestamp: Date [IX]│ ◄── TTL index (90 days)
│ userId: ObjectId    │
│ action: enum        │
│ resource: enum      │
│ resourceId: string  │
│ changes: object     │
│ ipAddress: string   │
│ userAgent: string   │
└─────────────────────┘
```

---

## Models

### 1. Achievement (Existing - No Changes)

**Source**: `src/lib/models/Achievement.js` (Feature 028)  
**Purpose**: Core achievement definition with multilingual support

#### Schema

```javascript
{
  // Core identifiers
  achievementId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    // Generated from name.en using slug format
    // Example: "first-fast" from "Complete Your First Fast"
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['getting-started', 'duration', 'streak', 'goal', 'weight', 'consistency', 'special', 'knowledge'],
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['automatic', 'manual-trigger', 'admin-granted'],
    required: true,
    default: 'automatic'
  },
  
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: true,
    index: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true  // Filter by active in list views
  },
  
  isSecret: {
    type: Boolean,
    required: true,
    default: false
    // Secret achievements don't appear in lists until unlocked
  },
  
  releaseDate: {
    type: Date,
    // Optional scheduled release date for future achievements
  },
  
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Rarity configuration
  rarity: {
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    earnedByPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastCalculated: {
      type: Date
    }
  },
  
  // Unlock criteria
  criteria: {
    type: {
      type: String,
      enum: ['duration-milestone', 'streak', 'goal-completion', 'entry-count', 'weight-milestone', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  
  // Multilingual content
  translations: {
    en: {
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      iconUrl: { type: String, required: true }
    },
    es: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      iconUrl: { type: String }
    },
    fr: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      iconUrl: { type: String }
    },
    de: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      iconUrl: { type: String }
    },
    ar: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      iconUrl: { type: String }
    }
  }
}
```

#### Indexes

```javascript
// Existing indexes (Feature 028)
{ achievementId: 1 } // unique
{ category: 1, isActive: 1 }
{ tier: 1 }
{ 'rarity.score': -1 }

// Queries this feature uses:
// - Find all achievements (paginated, filtered, sorted)
// - Find by achievementId (edit form)
// - Count by category (analytics)
// - Count by tier (analytics)
// - Count by isActive (analytics)
```

#### Validation Rules

- **achievementId**: Must be unique, lowercase, no spaces
- **translations.en**: Required (fallback language)
- **translations.[es|fr|de|ar]**: Optional, but name + description + iconUrl must all be present or all be absent
- **criteria.value**: Must be positive integer
- **rarity.score**: 1-100 range enforced

#### State Transitions

```
[Draft] ──(create)──> [Active: isActive=true]
                            │
                            │ (deactivate)
                            ▼
                      [Inactive: isActive=false]
                            │
                            │ (activate)
                            ▼
                      [Active: isActive=true]
                            │
                            │ (delete - cascade)
                            ▼
                      [Deleted] + All UserAchievements deleted
```

---

### 2. UserAchievement (Existing - No Changes)

**Source**: `src/lib/models/UserAchievement.js` (Feature 028)  
**Purpose**: Tracks user progress and unlocks

#### Schema

```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  achievementId: {
    type: String,  // References Achievement.achievementId
    required: true,
    index: true
  },
  
  unlockedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}
```

#### Indexes

```javascript
// Compound indexes (Feature 028)
{ userId: 1, achievementId: 1 } // unique
{ userId: 1, unlockedAt: -1 }

// Queries this feature uses:
// - Count unlocks per achievement (analytics)
// - Delete all for achievement (cascade delete)
```

#### Cascade Delete Behavior

When an achievement is deleted via admin UI (FR-066):
```javascript
// Delete flow:
1. Admin confirms deletion (warning: "X users have unlocked this")
2. DELETE /api/admin/achievements/[achievementId]
3. achievementAdminService.deleteAchievement()
4. UserAchievement.deleteMany({ achievementId })  // Cascade
5. Achievement.findByIdAndDelete()
6. auditLogService.log({ action: 'delete', resourceId, changes: { usersAffected: X } })
```

---

### 3. AdminAuditLog (NEW)

**Source**: `src/lib/models/AdminAuditLog.js` (NEW - This feature)  
**Purpose**: Track all admin actions for compliance and debugging

#### Schema

```javascript
const adminAuditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
    expires: 7776000  // TTL: 90 days (90 * 24 * 60 * 60 seconds)
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  action: {
    type: String,
    enum: [
      'create',
      'update',
      'delete',
      'activate',
      'deactivate',
      'bulk-activate',
      'bulk-deactivate',
      'csv-import',
      'csv-export',
      'view-analytics'
    ],
    required: true,
    index: true
  },
  
  resource: {
    type: String,
    enum: ['achievement', 'translation'],
    required: true
  },
  
  resourceId: {
    type: String,  // achievementId or batch identifier
    required: true,
    index: true
  },
  
  changes: {
    type: mongoose.Schema.Types.Mixed,
    // Structure depends on action:
    // - create: { new: {...achievementData} }
    // - update: { before: {...}, after: {...}, fields: ['name', 'tier'] }
    // - delete: { deleted: {...achievementData}, usersAffected: 123 }
    // - activate/deactivate: { isActive: true/false }
    // - bulk: { achievementIds: [...], count: 5 }
    // - csv-import: { rowsProcessed: 50, errors: [...] }
    // - csv-export: { achievementsCount: 81, format: 'csv' }
  },
  
  ipAddress: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  }
}, {
  collection: 'adminauditlogs',
  timestamps: false  // Using custom timestamp field with TTL
});
```

#### Indexes

```javascript
// Primary index (TTL for auto-deletion)
{ timestamp: 1 } // expires: 90 days

// Query indexes
{ userId: 1, timestamp: -1 }  // Admin activity history
{ action: 1, timestamp: -1 }  // Filter by action type
{ resourceId: 1, timestamp: -1 }  // Achievement history
```

#### TTL Behavior

MongoDB automatically deletes documents 90 days after `timestamp`:
```
timestamp: 2025-01-09T00:00:00Z
expires: 90 days = 7776000 seconds
deletion: 2025-04-09T00:00:00Z (automatic)
```

**Clarification Q3 Answer (B)**: After 90 days, logs move to cold storage (future feature), then deleted after 2 years total.

#### Usage Examples

**Create Achievement**:
```javascript
{
  timestamp: new Date(),
  userId: ObjectId("...admin-user..."),
  action: 'create',
  resource: 'achievement',
  resourceId: 'first-fast',
  changes: {
    new: {
      achievementId: 'first-fast',
      category: 'fasting',
      tier: 'bronze',
      translations: { en: { name: 'First Fast', ... } }
    }
  },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
}
```

**Update Achievement**:
```javascript
{
  action: 'update',
  resourceId: 'first-fast',
  changes: {
    before: { tier: 'bronze', 'translations.en.name': 'First Fast' },
    after: { tier: 'silver', 'translations.en.name': 'Complete Your First Fast' },
    fields: ['tier', 'translations.en.name']
  }
}
```

**Bulk Deactivate**:
```javascript
{
  action: 'bulk-deactivate',
  resource: 'achievement',
  resourceId: 'bulk-2025-01-09-001',  // Batch identifier
  changes: {
    achievementIds: ['first-fast', 'week-warrior', 'month-master'],
    count: 3
  }
}
```

**Delete with Cascade**:
```javascript
{
  action: 'delete',
  resourceId: 'deprecated-achievement',
  changes: {
    deleted: { achievementId: 'deprecated-achievement', ... },
    usersAffected: 47  // Count of UserAchievements deleted
  }
}
```

---

## Data Migration

**None required**. All models are either:
- **Existing** (Achievement, UserAchievement from Feature 028)
- **New with no dependencies** (AdminAuditLog)

### Initial Setup

```javascript
// Run after deployment (seeds handled separately)
// Create AdminAuditLog collection with TTL index
await mongoose.connection.db.createCollection('adminauditlogs');
await AdminAuditLog.collection.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
);
```

---

## Performance Considerations

### Query Optimization

**Achievement List** (FR-001, FR-003):
```javascript
// Use compound index: { category: 1, isActive: 1 }
Achievement.find({ category: 'fasting', isActive: true })
  .sort({ 'rarity.score': -1 })
  .skip(page * limit)
  .limit(limit)
  .lean();  // Read-only, faster
```

**Analytics Aggregations** (FR-053 to FR-061):
```javascript
// Use existing indexes, no full table scans
Achievement.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$category', count: { $sum: 1 } } }
]);

UserAchievement.aggregate([
  { $group: { _id: '$achievementId', unlocks: { $sum: 1 } } },
  { $sort: { unlocks: -1 } },
  { $limit: 10 }
]);
```

### Audit Log Retention

TTL index automatically manages deletion:
- No manual cleanup scripts needed
- Low storage overhead (90-day window)
- Queries limited to recent history (use `timestamp` filter)

---

## Validation Summary

| Model | Validation Layer | Rules |
|-------|-----------------|-------|
| Achievement | Mongoose + React Hook Form | Required fields, enum values, translations consistency, achievementId uniqueness |
| UserAchievement | Mongoose (no admin changes) | Foreign key integrity via references |
| AdminAuditLog | Mongoose + auditLogService | Required fields, IP/userAgent capture, changes object structure |

---

## Next Steps

1. **Implement Models**: Create `AdminAuditLog.js` model file
2. **Write Tests**: Unit tests for model validation, indexes, TTL behavior
3. **Generate Contracts**: API endpoint specs referencing these schemas
4. **Seed Data**: Existing 81+ achievements from Feature 028 (no changes needed)
