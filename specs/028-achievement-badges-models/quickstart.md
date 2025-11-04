# Quickstart Guide: Achievement & Badges Database Models

**Feature**: 028-achievement-badges-models  
**Date**: November 4, 2025  
**Audience**: Developers implementing or using the Achievement models

## Overview

This guide helps you quickly understand and use the Achievement & Badges database models in the Fasting Tracker application. By the end of this guide, you'll be able to:

1. Import and use the three models (Achievement, UserAchievement, User)
2. Create achievement definitions
3. Track user progress and unlocks
4. Query achievements with proper translations
5. Run tests to verify model behavior

**Time to Complete**: 15 minutes

---

## Prerequisites

Before starting, ensure you have:

- ✅ MongoDB connection configured (`src/lib/mongodb.js`)
- ✅ Mongoose installed (check `package.json`)
- ✅ Node.js environment with access to the repository
- ✅ Basic understanding of Mongoose schemas and models

---

## Quick Reference

### Model Locations

```
src/lib/models/
├── Achievement.js          # NEW - Badge definitions with translations
├── UserAchievement.js      # NEW - User progress tracking
└── User.js                 # EXTENDED - Added language and points fields
```

### Import Statements

```javascript
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import User from '@/lib/models/User';
```

### Key Concepts

- **Achievement**: Template for a badge (e.g., "Complete 16-hour fast")
- **UserAchievement**: Record that User X unlocked Achievement Y on Date Z
- **Weak Reference**: UserAchievement uses string achievementId (not ObjectId) for flexibility

---

## 1. Creating Your First Achievement

### Example: "First Fast" Achievement

```javascript
import Achievement from '@/lib/models/Achievement';
import dbConnect from '@/lib/mongodb';

// Ensure database connection
await dbConnect();

// Create achievement
const firstFast = await Achievement.create({
  achievementId: 'first-fast',
  translations: {
    en: {
      name: 'First Fast',
      description: 'Log your first fasting entry',
      shortDescription: 'First entry'
    },
    es: {
      name: 'Primer Ayuno',
      description: 'Registra tu primera entrada de ayuno',
      shortDescription: 'Primera entrada'
    }
  },
  icon: '🎉',
  iconColor: '#F59E0B',
  category: 'getting-started',
  points: 10,
  rarity: 'common',
  order: 1,
  criteria: {
    type: 'entry-count',
    params: { count: 1 }
  },
  isActive: true,
  isSecret: false,
  createdBy: adminUserId  // ObjectId of admin user
});

console.log('Created achievement:', firstFast.achievementId);
```

### Required Fields Checklist

- ✅ `achievementId` - Unique lowercase slug (e.g., 'first-fast')
- ✅ `translations.en` - English name, description, shortDescription
- ✅ `category` - One of: getting-started, duration, streak, goal, weight, consistency, special, knowledge
- ✅ `rarity` - One of: common, rare, epic, legendary
- ✅ `points` - Number (gamification score)
- ✅ `order` - Display sort order
- ✅ `criteria` - Object with `type` (string) and `params` (object)
- ✅ `createdBy` - ObjectId of admin user

### Visual Assets (Choose One)

**Option A: Badge Images**
```javascript
badgeImage: {
  locked: 'https://storage.example.com/badges/first-fast-locked.png',
  unlocked: 'https://storage.example.com/badges/first-fast-unlocked.png'
}
```

**Option B: Emoji Icon (Simpler)**
```javascript
icon: '🎉',
iconColor: '#F59E0B'  // Hex color for background
```

---

## 2. Unlocking an Achievement for a User

### Basic Unlock Flow

```javascript
import UserAchievement from '@/lib/models/UserAchievement';
import User from '@/lib/models/User';

async function unlockAchievement(userId, achievementId, points) {
  // Step 1: Check if already unlocked
  const existing = await UserAchievement.findOne({
    userId,
    achievementId
  });
  
  if (existing) {
    console.log('Achievement already unlocked');
    return existing;
  }
  
  // Step 2: Create unlock record
  const unlock = await UserAchievement.create({
    userId,
    achievementId,
    unlockedAt: new Date(),
    progress: 100,
    notificationSeen: false
  });
  
  // Step 3: Increment user's achievement points
  await User.findByIdAndUpdate(userId, {
    $inc: { achievementPoints: points }
  });
  
  console.log(`Unlocked ${achievementId} for user ${userId}`);
  return unlock;
}

// Usage
await unlockAchievement(userId, 'first-fast', 10);
```

### Error Handling

```javascript
try {
  await unlockAchievement(userId, 'first-fast', 10);
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error - already unlocked (race condition)
    console.log('Achievement already unlocked (duplicate key error)');
  } else {
    throw error;
  }
}
```

---

## 3. Querying Achievements

### Get All Active Achievements

```javascript
import Achievement from '@/lib/models/Achievement';

// Get all active, non-secret achievements
const achievements = await Achievement.find({
  isActive: true,
  isSecret: false
}).sort({ order: 1 });

console.log(`Found ${achievements.length} achievements`);
```

### Filter by Category

```javascript
// Get all duration milestone achievements
const durationAchievements = await Achievement.find({
  category: 'duration',
  isActive: true
}).sort({ order: 1 });
```

### Get Single Achievement

```javascript
// Find by slug ID
const achievement = await Achievement.findOne({
  achievementId: 'sweet-sixteen'
});

if (achievement) {
  console.log('Found:', achievement.translations.en.name);
}
```

---

## 4. Getting User's Achievements

### Recent Unlocks

```javascript
import UserAchievement from '@/lib/models/UserAchievement';

// Get user's 5 most recent unlocks
const recentUnlocks = await UserAchievement
  .find({ userId })
  .sort({ unlockedAt: -1 })
  .limit(5);

console.log(`User has ${recentUnlocks.length} recent unlocks`);
```

### With Achievement Details (Manual Join)

```javascript
// Step 1: Get user's unlocks
const unlocks = await UserAchievement.find({ userId });

// Step 2: Get achievement details
const achievementIds = unlocks.map(u => u.achievementId);
const achievements = await Achievement.find({
  achievementId: { $in: achievementIds }
});

// Step 3: Merge data
const enriched = unlocks.map(unlock => {
  const achievement = achievements.find(
    a => a.achievementId === unlock.achievementId
  );
  return {
    ...unlock.toObject(),
    achievement: achievement ? achievement.toObject() : null
  };
});

console.log('Unlocks with details:', enriched);
```

### Check If User Has Unlocked Specific Achievement

```javascript
const hasUnlocked = await UserAchievement.exists({
  userId,
  achievementId: 'first-fast'
});

if (hasUnlocked) {
  console.log('User has unlocked this achievement');
}
```

---

## 5. Working with Translations

### Get Achievement in User's Preferred Language

```javascript
import User from '@/lib/models/User';
import Achievement from '@/lib/models/Achievement';

async function getAchievementForUser(userId, achievementId) {
  // Get user's language preference
  const user = await User.findById(userId);
  const lang = user?.preferredLanguage || 'en';
  
  // Get achievement
  const achievement = await Achievement.findOne({ achievementId });
  if (!achievement) return null;
  
  // Get translation (fallback to English if not available)
  const translation = achievement.translations[lang] || 
                      achievement.translations.en;
  
  return {
    ...achievement.toObject(),
    localizedName: translation.name,
    localizedDescription: translation.description,
    localizedShort: translation.shortDescription
  };
}

// Usage
const localizedAchievement = await getAchievementForUser(
  userId, 
  'first-fast'
);
console.log(localizedAchievement.localizedName);  // "First Fast" or "Primer Ayuno"
```

### Update User's Language Preference

```javascript
// Set user's preferred language to Spanish
await User.findByIdAndUpdate(userId, {
  preferredLanguage: 'es'
});
```

**Supported Languages**: en, es, fr, de, pt, ja, zh

---

## 6. Tracking Progress (Incremental Achievements)

### Example: Streak Achievement (30 Days)

```javascript
async function updateStreakProgress(userId, currentStreak) {
  const achievementId = 'streak-master-30';
  
  // Check if already unlocked
  const unlock = await UserAchievement.findOne({
    userId,
    achievementId
  });
  
  if (unlock && unlock.unlockedAt) {
    // Already unlocked
    return unlock;
  }
  
  if (currentStreak >= 30) {
    // Unlock achievement
    return unlockAchievement(userId, achievementId, 200);
  } else {
    // Update progress
    return UserAchievement.findOneAndUpdate(
      { userId, achievementId },
      { 
        progress: currentStreak,
        $setOnInsert: { 
          notificationSeen: false 
        }
      },
      { upsert: true, new: true }
    );
  }
}

// Usage
await updateStreakProgress(userId, 15);  // 15 days so far
```

---

## 7. Testing Your Implementation

### Unit Test Example

```javascript
// tests/unit/models/Achievement.test.js
import Achievement from '@/lib/models/Achievement';
import dbConnect from '@/lib/mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Achievement Model', () => {
  let mongoServer;
  
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await dbConnect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoServer.stop();
  });
  
  test('creates achievement with valid data', async () => {
    const achievement = await Achievement.create({
      achievementId: 'test-achievement',
      translations: {
        en: {
          name: 'Test',
          description: 'Test achievement',
          shortDescription: 'Test'
        }
      },
      icon: '🧪',
      iconColor: '#000000',
      category: 'special',
      points: 10,
      rarity: 'common',
      order: 1,
      criteria: {
        type: 'test',
        params: {}
      },
      createdBy: new mongoose.Types.ObjectId()
    });
    
    expect(achievement.achievementId).toBe('test-achievement');
    expect(achievement.translations.en.name).toBe('Test');
  });
  
  test('rejects achievement with invalid category', async () => {
    await expect(Achievement.create({
      achievementId: 'invalid-cat',
      category: 'invalid-category',
      // ...other required fields...
    })).rejects.toThrow();
  });
});
```

### Integration Test Example

```javascript
// tests/integration/achievement-models.test.js
test('unlocking achievement increments user points', async () => {
  // Create user
  const user = await User.create({
    email: 'test@example.com',
    password: 'hashedpassword',
    achievementPoints: 0
  });
  
  // Create achievement
  const achievement = await Achievement.create({
    achievementId: 'test-unlock',
    points: 50,
    // ...other required fields...
  });
  
  // Unlock achievement
  await UserAchievement.create({
    userId: user._id,
    achievementId: 'test-unlock',
    unlockedAt: new Date(),
    progress: 100
  });
  
  // Increment points
  await User.findByIdAndUpdate(user._id, {
    $inc: { achievementPoints: 50 }
  });
  
  // Verify
  const updatedUser = await User.findById(user._id);
  expect(updatedUser.achievementPoints).toBe(50);
});
```

---

## 8. Common Patterns

### Pattern: Check and Unlock

```javascript
async function checkAndUnlock(userId, achievementId, points) {
  const existing = await UserAchievement.exists({ userId, achievementId });
  if (!existing) {
    await unlockAchievement(userId, achievementId, points);
    return true;  // Newly unlocked
  }
  return false;  // Already unlocked
}
```

### Pattern: Batch Query Achievements

```javascript
async function getUserAchievementProgress(userId) {
  // Get all unlocks
  const unlocks = await UserAchievement.find({ userId });
  
  // Get all achievements
  const allAchievements = await Achievement.find({ isActive: true });
  
  // Build progress map
  const unlockedIds = new Set(unlocks.map(u => u.achievementId));
  
  return allAchievements.map(achievement => ({
    achievementId: achievement.achievementId,
    name: achievement.translations.en.name,
    category: achievement.category,
    points: achievement.points,
    isUnlocked: unlockedIds.has(achievement.achievementId),
    unlock: unlocks.find(u => u.achievementId === achievement.achievementId)
  }));
}
```

### Pattern: Get Leaderboard (Top Users by Points)

```javascript
async function getLeaderboard(limit = 10) {
  return User.find()
    .select('name achievementPoints')
    .sort({ achievementPoints: -1 })
    .limit(limit);
}
```

---

## 9. Performance Tips

### Use Compound Index for Uniqueness

The unique compound index `(userId + achievementId)` automatically prevents duplicates:

```javascript
// No need for application-level checks - database enforces uniqueness
try {
  await UserAchievement.create({ userId, achievementId, ...otherFields });
} catch (error) {
  if (error.code === 11000) {
    // Duplicate - already unlocked
  }
}
```

### Use Descending Index for Recent Queries

The descending index `(userId + unlockedAt desc)` optimizes recent unlock queries:

```javascript
// This query uses the index - very fast
const recent = await UserAchievement
  .find({ userId })
  .sort({ unlockedAt: -1 })
  .limit(5);
```

### Batch Queries to Avoid N+1

❌ **Bad** (N+1 queries):
```javascript
for (const unlock of unlocks) {
  const achievement = await Achievement.findOne({ 
    achievementId: unlock.achievementId 
  });
  // Process achievement
}
```

✅ **Good** (2 queries total):
```javascript
const achievementIds = unlocks.map(u => u.achievementId);
const achievements = await Achievement.find({
  achievementId: { $in: achievementIds }
});
// Process in memory
```

---

## 10. Troubleshooting

### Issue: "Model already registered" Error

**Cause**: Next.js hot reload re-registering Mongoose models

**Solution**: Models use this pattern to prevent errors:
```javascript
const Achievement = mongoose.models.Achievement || 
  mongoose.model('Achievement', achievementSchema);
```

If you still see errors, restart your Next.js dev server.

---

### Issue: Duplicate Key Error (11000)

**Cause**: Attempting to unlock same achievement twice for a user

**Solution**: This is expected - handle gracefully:
```javascript
try {
  await UserAchievement.create({ userId, achievementId, ...fields });
} catch (error) {
  if (error.code === 11000) {
    console.log('Already unlocked - this is fine');
  } else {
    throw error;
  }
}
```

---

### Issue: Achievement Not Found After Unlock

**Cause**: Achievement deleted or achievementId mismatch

**Solution**: UserAchievement uses weak string reference (intentional design):
```javascript
const achievement = await Achievement.findOne({ 
  achievementId: unlock.achievementId 
});

if (!achievement) {
  console.log('Achievement definition deleted - show generic badge');
}
```

---

### Issue: User Points Not Updating

**Cause**: Forgetting to increment User.achievementPoints after unlock

**Solution**: Always increment after creating UserAchievement:
```javascript
await UserAchievement.create({ userId, achievementId, ... });
await User.findByIdAndUpdate(userId, { 
  $inc: { achievementPoints: points } 
});
```

---

## 11. Next Steps

Now that you understand the models, you can:

1. **Implement unlock logic** in your application code (e.g., after user logs entry, check criteria)
2. **Create API endpoints** for fetching achievements and user progress (future feature)
3. **Build frontend components** to display badges and progress bars (future feature)
4. **Add admin UI** for creating and managing achievements (future feature)
5. **Seed initial achievements** via migration script (separate task)

---

## Additional Resources

- **Specification**: [spec.md](./spec.md) - Complete feature requirements
- **Data Model**: [data-model.md](./data-model.md) - Detailed entity relationships
- **Contracts**: [contracts/model-contracts.md](./contracts/model-contracts.md) - TypeScript interfaces
- **Research**: [research.md](./research.md) - Design decisions and rationale

---

## Quick Command Reference

```bash
# Run tests
npm test -- Achievement.test.js

# Run integration tests
npm test -- achievement-models.test.js

# Check MongoDB indexes (in mongo shell)
db.userachievements.getIndexes()

# View all achievements
db.achievements.find().pretty()
```

---

**Questions or issues?** Check the [data-model.md](./data-model.md) for detailed schema specifications or review the [research.md](./research.md) for design rationale.
