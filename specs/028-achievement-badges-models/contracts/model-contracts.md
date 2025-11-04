# Model Contracts: Achievement & Badges Database Models

**Feature**: 028-achievement-badges-models  
**Date**: November 4, 2025  
**Purpose**: TypeScript-style interface contracts for Mongoose models

## Overview

This document defines the TypeScript-style interfaces for the three database models in this feature. These contracts serve as:
1. **Documentation** for developers using the models
2. **Type hints** for IDEs (via JSDoc)
3. **Validation reference** for test writing
4. **API design foundation** for future endpoints

**Note**: Since this feature implements database models only (no API routes), these are **Model Contracts** rather than REST/GraphQL API contracts.

---

## Achievement Model Contract

### Interface Definition

```typescript
interface IAchievement {
  // Database ID
  _id: ObjectId;
  
  // Unique identifier (slug)
  achievementId: string;  // e.g., "sweet-sixteen", "first-fast"
  
  // Multilingual content
  translations: {
    [languageCode: string]: {
      name: string;
      description: string;
      shortDescription: string;
    };
  };
  
  // Visual assets (at least one required: badgeImage OR icon)
  badgeImage?: {
    locked: string | null;    // URL to locked badge image
    unlocked: string | null;  // URL to unlocked badge image
  } | null;
  icon?: string | null;        // Emoji or unicode character
  iconColor?: string | null;   // Hex color code (e.g., "#4F46E5")
  
  // Classification
  category: AchievementCategory;
  rarity: AchievementRarity;
  
  // Gamification
  points: number;    // Points awarded on unlock
  order: number;     // Display sort order
  
  // Unlock logic
  criteria: {
    type: string;             // e.g., "duration-milestone", "streak", "entry-count"
    params: Record<string, any>;  // Flexible params object
  };
  
  // Lifecycle flags
  isActive: boolean;     // Default: true
  isSecret: boolean;     // Default: false (hidden until unlocked)
  releaseDate?: Date | null;
  
  // Audit trail
  createdBy: ObjectId;   // Reference to admin User
  createdAt: Date;
  updatedAt: Date;
}

// Enums
type AchievementCategory = 
  | 'getting-started'
  | 'duration'
  | 'streak'
  | 'goal'
  | 'weight'
  | 'consistency'
  | 'special'
  | 'knowledge';

type AchievementRarity = 
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary';

// Supported language codes
type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt';
```

### Method Signatures

```typescript
// Mongoose Model Static Methods
class AchievementModel {
  // Find achievement by slug ID
  static findByAchievementId(achievementId: string): Promise<IAchievement | null>;
  
  // Get active achievements by category
  static findByCategory(
    category: AchievementCategory, 
    activeOnly?: boolean
  ): Promise<IAchievement[]>;
  
  // Get all active achievements (excluding secrets until unlocked)
  static findAllActive(userId?: ObjectId): Promise<IAchievement[]>;
  
  // Create new achievement (admin only)
  static createAchievement(data: Partial<IAchievement>): Promise<IAchievement>;
}

// Instance Methods
interface IAchievement {
  // Get translated content for specific language (fallback to English)
  getTranslation(languageCode: LanguageCode): {
    name: string;
    description: string;
    shortDescription: string;
  };
  
  // Check if user has unlocked this achievement
  isUnlockedBy(userId: ObjectId): Promise<boolean>;
  
  // Get visual asset (prefer badgeImage, fallback to icon)
  getVisualAsset(unlocked: boolean): {
    type: 'image' | 'icon';
    value: string;
    color?: string;
  };
}
```

### Validation Rules

```typescript
// Schema validation constraints
const achievementValidation = {
  achievementId: {
    required: true,
    unique: true,
    pattern: /^[a-z0-9-]+$/,  // Lowercase alphanumeric + hyphens
    minLength: 3,
    maxLength: 50
  },
  
  translations: {
    required: true,
    minLanguages: 1,  // At least 'en' required
    requiredKeys: ['name', 'description', 'shortDescription']
  },
  
  category: {
    required: true,
    enum: ['getting-started', 'duration', 'streak', 'goal', 'weight', 'consistency', 'special', 'knowledge']
  },
  
  rarity: {
    required: true,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  points: {
    required: true,
    type: 'number',
    min: 0,
    default: 0
  },
  
  criteria: {
    required: true,
    type: 'object',
    properties: {
      type: { required: true, type: 'string' },
      params: { required: true, type: 'object' }
    }
  },
  
  createdBy: {
    required: true,
    ref: 'User'
  }
};
```

---

## UserAchievement Model Contract

### Interface Definition

```typescript
interface IUserAchievement {
  // Database ID
  _id: ObjectId;
  
  // References
  userId: ObjectId;          // Reference to User (strong)
  achievementId: string;     // String reference to Achievement.achievementId (weak)
  
  // Progress tracking
  unlockedAt: Date;          // Timestamp of unlock
  progress: number;          // 0-100 for percentages, raw count otherwise
  
  // Notification state
  notificationSeen: boolean; // Default: false
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### Method Signatures

```typescript
// Mongoose Model Static Methods
class UserAchievementModel {
  // Get all achievements for a user
  static findByUserId(
    userId: ObjectId,
    options?: {
      sort?: 'recent' | 'oldest';
      limit?: number;
      unseenOnly?: boolean;
    }
  ): Promise<IUserAchievement[]>;
  
  // Check if user has unlocked specific achievement
  static hasUnlocked(
    userId: ObjectId,
    achievementId: string
  ): Promise<boolean>;
  
  // Unlock achievement for user (idempotent)
  static unlockForUser(
    userId: ObjectId,
    achievementId: string,
    points: number
  ): Promise<IUserAchievement>;
  
  // Update progress toward achievement
  static updateProgress(
    userId: ObjectId,
    achievementId: string,
    progress: number
  ): Promise<IUserAchievement | null>;
  
  // Get unseen unlocks for user
  static getUnseenUnlocks(userId: ObjectId): Promise<IUserAchievement[]>;
  
  // Mark notification as seen
  static markNotificationSeen(
    userId: ObjectId,
    achievementId: string
  ): Promise<void>;
}

// Instance Methods
interface IUserAchievement {
  // Populate achievement details
  populateAchievement(): Promise<IUserAchievement & { achievement: IAchievement }>;
  
  // Check if unlock is recent (within last 24 hours)
  isRecentUnlock(): boolean;
  
  // Get progress percentage (normalized to 0-100)
  getProgressPercent(maxValue?: number): number;
}
```

### Validation Rules

```typescript
// Schema validation constraints
const userAchievementValidation = {
  userId: {
    required: true,
    ref: 'User'
  },
  
  achievementId: {
    required: true,
    type: 'string'
    // Note: NOT a Mongoose ref - weak reference via string
  },
  
  unlockedAt: {
    required: true,
    type: 'date',
    max: () => new Date()  // Cannot be in future
  },
  
  progress: {
    required: false,
    type: 'number',
    min: 0,
    default: 0
  },
  
  notificationSeen: {
    required: false,
    type: 'boolean',
    default: false
  }
};

// Indexes
const userAchievementIndexes = {
  uniqueUnlock: {
    fields: { userId: 1, achievementId: 1 },
    unique: true
  },
  recentAchievements: {
    fields: { userId: 1, unlockedAt: -1 }
  }
};
```

---

## User Model Extensions Contract

### Extended Interface

```typescript
// Existing User interface (partial)
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name?: string;
  // ...existing fields...
  
  // NEW FIELDS FOR ACHIEVEMENT SYSTEM
  preferredLanguage: LanguageCode | 'ja' | 'zh';  // Default: 'en'
  achievementPoints: number;                       // Default: 0
  
  // ...existing fields...
  createdAt: Date;
  updatedAt: Date;
}

type ExtendedLanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';
```

### Method Signatures

```typescript
// Extended User Model Static Methods
class UserModel {
  // Increment achievement points (additive only)
  static incrementAchievementPoints(
    userId: ObjectId,
    points: number
  ): Promise<IUser>;
  
  // Update language preference
  static setPreferredLanguage(
    userId: ObjectId,
    languageCode: ExtendedLanguageCode
  ): Promise<IUser>;
  
  // Get user with achievement stats
  static findByIdWithAchievements(
    userId: ObjectId
  ): Promise<IUser & {
    unlockedAchievements: IUserAchievement[];
    achievementCount: number;
    recentUnlocks: IUserAchievement[];
  }>;
}

// Extended Instance Methods
interface IUser {
  // Get user's unlocked achievements
  getUnlockedAchievements(limit?: number): Promise<IUserAchievement[]>;
  
  // Get achievement progress for specific achievement
  getAchievementProgress(achievementId: string): Promise<IUserAchievement | null>;
  
  // Check if user can unlock achievement (has met criteria)
  canUnlockAchievement(achievementId: string): Promise<boolean>;
}
```

### Validation Rules

```typescript
// Extended schema validation constraints
const userExtensionValidation = {
  preferredLanguage: {
    required: false,
    type: 'string',
    enum: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
    default: 'en'
  },
  
  achievementPoints: {
    required: false,
    type: 'number',
    min: 0,
    default: 0
  }
};
```

---

## Mongoose Export Pattern

All models follow this Next.js-compatible export pattern to prevent model re-registration errors:

```typescript
// Achievement.js
const Achievement = mongoose.models.Achievement || 
  mongoose.model('Achievement', achievementSchema);
export default Achievement;

// UserAchievement.js
const UserAchievement = mongoose.models.UserAchievement || 
  mongoose.model('UserAchievement', userAchievementSchema);
export default UserAchievement;

// User.js (existing model, extended)
const User = mongoose.models.User || 
  mongoose.model('User', userSchema);
export default User;
```

---

## Usage Examples

### Creating an Achievement

```javascript
import Achievement from '@/lib/models/Achievement';

const newAchievement = await Achievement.create({
  achievementId: 'sweet-sixteen',
  translations: {
    en: {
      name: 'Sweet Sixteen',
      description: 'Complete a 16-hour fast for the first time',
      shortDescription: 'First 16h fast'
    }
  },
  icon: '⏱️',
  iconColor: '#10B981',
  category: 'duration',
  points: 50,
  rarity: 'common',
  order: 10,
  criteria: {
    type: 'duration-milestone',
    params: { hours: 16 }
  },
  createdBy: adminUserId
});
```

### Unlocking an Achievement

```javascript
import UserAchievement from '@/lib/models/UserAchievement';
import User from '@/lib/models/User';

// Check if already unlocked
const existing = await UserAchievement.findOne({
  userId,
  achievementId: 'sweet-sixteen'
});

if (!existing) {
  // Create unlock record
  const unlock = await UserAchievement.create({
    userId,
    achievementId: 'sweet-sixteen',
    unlockedAt: new Date(),
    progress: 100
  });
  
  // Increment user points
  await User.findByIdAndUpdate(userId, {
    $inc: { achievementPoints: 50 }
  });
}
```

### Querying User's Achievements

```javascript
import UserAchievement from '@/lib/models/UserAchievement';
import Achievement from '@/lib/models/Achievement';

// Get recent unlocks with achievement details
const recentUnlocks = await UserAchievement
  .find({ userId })
  .sort({ unlockedAt: -1 })
  .limit(5);

// Populate achievement details (manual join via achievementId string)
const achievementIds = recentUnlocks.map(ua => ua.achievementId);
const achievements = await Achievement.find({
  achievementId: { $in: achievementIds }
});

// Merge data
const enriched = recentUnlocks.map(unlock => ({
  ...unlock.toObject(),
  achievement: achievements.find(a => a.achievementId === unlock.achievementId)
}));
```

### Getting Translated Content

```javascript
import Achievement from '@/lib/models/Achievement';
import User from '@/lib/models/User';

// Get user's preferred language
const user = await User.findById(userId);
const lang = user.preferredLanguage || 'en';

// Get achievement with translation
const achievement = await Achievement.findOne({ achievementId: 'sweet-sixteen' });
const translation = achievement.translations[lang] || achievement.translations.en;

console.log(translation.name);  // "Sweet Sixteen" or "Dulces Dieciséis"
```

---

## Error Codes

### Model-Level Errors

| Code | Description | HTTP Status | Example |
|------|-------------|-------------|---------|
| `DUPLICATE_ACHIEVEMENT_ID` | achievementId already exists | 409 Conflict | Creating achievement with existing slug |
| `DUPLICATE_UNLOCK` | User already unlocked achievement | 409 Conflict | Attempting to unlock same achievement twice |
| `INVALID_CATEGORY` | category not in enum | 400 Bad Request | category: 'invalid-category' |
| `INVALID_RARITY` | rarity not in enum | 400 Bad Request | rarity: 'super-rare' |
| `INVALID_LANGUAGE` | preferredLanguage not in enum | 400 Bad Request | preferredLanguage: 'xx' |
| `MISSING_TRANSLATION` | English translation required | 400 Bad Request | translations: { es: {...} } without 'en' |
| `NEGATIVE_POINTS` | achievementPoints cannot be negative | 400 Bad Request | achievementPoints: -10 |
| `FUTURE_UNLOCK_DATE` | unlockedAt cannot be in future | 400 Bad Request | unlockedAt: new Date('2030-01-01') |
| `USER_NOT_FOUND` | Referenced userId does not exist | 404 Not Found | userId: nonexistent ObjectId |

### Database-Level Errors

| MongoDB Error Code | Description | Handling |
|-------------------|-------------|----------|
| 11000 | Duplicate key error (unique index) | Check if achievement already unlocked |
| 121 | Document failed validation | Return validation error details to client |

---

## Type Guards (for TypeScript/JSDoc)

```typescript
// Type guard for valid achievement category
function isValidCategory(value: string): value is AchievementCategory {
  return ['getting-started', 'duration', 'streak', 'goal', 'weight', 
          'consistency', 'special', 'knowledge'].includes(value);
}

// Type guard for valid rarity
function isValidRarity(value: string): value is AchievementRarity {
  return ['common', 'rare', 'epic', 'legendary'].includes(value);
}

// Type guard for valid language code
function isValidLanguage(value: string): value is ExtendedLanguageCode {
  return ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'].includes(value);
}
```

---

## Testing Contracts

### Unit Test Requirements

Each model must have unit tests verifying:
- ✅ Valid documents save successfully
- ✅ Invalid enum values rejected
- ✅ Required fields enforced
- ✅ Default values applied
- ✅ Unique constraints enforced
- ✅ Validation messages returned

### Integration Test Requirements

Model interactions must be tested:
- ✅ UserAchievement creation increments User.achievementPoints
- ✅ Achievement deletion does not break UserAchievement queries
- ✅ User language preference change does not affect authentication
- ✅ Duplicate unlock prevented by database (not just application logic)

---

## Future API Endpoint Contracts (Out of Scope)

When API routes are implemented, these model contracts will inform endpoint design:

### Achievement Endpoints (Future)
- `GET /api/achievements` - List active achievements
- `GET /api/achievements/:id` - Get achievement details
- `POST /api/admin/achievements` - Create achievement (admin)
- `PATCH /api/admin/achievements/:id` - Update achievement (admin)

### User Achievement Endpoints (Future)
- `GET /api/user/achievements` - List user's unlocked achievements
- `GET /api/user/achievements/progress` - Get progress toward locked achievements
- `POST /api/user/achievements/:id/seen` - Mark notification as seen

**Note**: These endpoints are **out of scope** for this feature (database models only).
