# Quickstart Guide: Achievement Unlock Logic

**Feature**: 031 - Achievement Unlock Logic  
**For**: Developers implementing or extending the achievement system

---

## Prerequisites

✅ **Completed Features**:
- Feature 028: Achievement & UserAchievement models
- Feature 029: Achievement API endpoints
- Feature 030: 81 achievements seeded
- Feature 020: Goal system (goalStatus field)
- Feature 021: Toast notification system
- Feature 026: Security logger

✅ **Development Environment**:
- Node.js 18+ installed
- MongoDB running locally or connection string available
- Next.js development server running (`npm run dev`)

✅ **Knowledge Requirements**:
- JavaScript/ES6+ syntax
- Mongoose ODM basics
- Next.js API routes
- Jest testing framework

---

## 5-Minute Setup

### 1. Verify User Model Extension

Check if `achievementPoints` field exists:

```bash
node
```

```javascript
const mongoose = require('mongoose');
const User = require('./src/lib/models/User');

// Connect to your database
await mongoose.connect(process.env.MONGODB_URI);

// Check schema
console.log(User.schema.paths.achievementPoints);
// Should output: { type: Number, default: 0, ... }
```

**If missing**, add to User schema:
```javascript
// src/lib/models/User.js
achievementPoints: {
  type: Number,
  default: 0,
  min: 0
}
```

### 2. Create Service Directory

```bash
mkdir -p src/lib/services
mkdir -p src/lib/utils
```

### 3. Create Test Directories

```bash
mkdir -p tests/unit/services
mkdir -p tests/integration/achievements
```

### 4. Install Dependencies (if needed)

```bash
npm install  # Mongoose should already be installed
```

---

## Implementation Checklist

### Phase 1: Infrastructure ✅ (30 minutes)

- [ ] Create `src/lib/utils/cache.js` (SimpleCache class)
  - [ ] Write unit tests for cache (hit/miss/expiry)
  - [ ] Run tests: `npm test -- cache.test.js`
  
- [ ] Create `src/lib/services/AchievementService.js` (skeleton)
  - [ ] Static class with method stubs
  - [ ] Import models (Achievement, UserAchievement, Entry, User)
  - [ ] Import cache utility

### Phase 2: Duration Evaluator ✅ (45 minutes - TDD)

- [ ] Write test: `tests/unit/services/AchievementService.test.js`
  ```javascript
  describe('evaluateDurationAchievements', () => {
    it('should unlock first-twelve for 12-hour fast', async () => {
      const entry = { fastingDuration: 720 };
      const qualified = await AchievementService.evaluateDurationAchievements(userId, entry);
      expect(qualified).toContain('first-twelve');
    });
  });
  ```
  
- [ ] Run test (should fail): `npm test -- AchievementService.test.js`

- [ ] Implement `evaluateDurationAchievements()`:
  ```javascript
  static async evaluateDurationAchievements(userId, entry) {
    const achievements = await this.getActiveAchievements();
    const durationAchievements = achievements.filter(
      a => a.criteria.type === 'duration-milestone'
    );
    
    return durationAchievements
      .filter(a => entry.fastingDuration >= a.criteria.params.minDuration)
      .map(a => a.achievementId);
  }
  ```

- [ ] Run test (should pass): `npm test -- AchievementService.test.js`

- [ ] Add edge case tests (null duration, negative, boundary values)

### Phase 3: Entry Count Evaluator ✅ (30 minutes - TDD)

- [ ] Write test for entry count
- [ ] Run test (should fail)
- [ ] Implement `evaluateEntryCountAchievements()`
- [ ] Run test (should pass)

### Phase 4: Goal Completion Evaluator ✅ (30 minutes - TDD)

- [ ] Write test for goal completion
- [ ] Run test (should fail)
- [ ] Implement `evaluateGoalAchievements()`
- [ ] Run test (should pass)

### Phase 5: Streak Evaluator ✅ (60 minutes - TDD)

- [ ] Write helper: `calculateStreak(userId)`
- [ ] Write tests for streak calculation (consecutive dates, breaks)
- [ ] Implement `evaluateStreakAchievements()`
- [ ] Run tests

### Phase 6: Weight Loss Evaluator ✅ (45 minutes - TDD)

- [ ] Write tests (with/without startingWeight)
- [ ] Implement `evaluateWeightAchievements()`
- [ ] Run tests

### Phase 7: Custom Evaluator ✅ (60 minutes - TDD)

- [ ] Create registry: `CUSTOM_EVALUATORS = {}`
- [ ] Implement first custom evaluator (e.g., first-morning-entry)
- [ ] Write tests
- [ ] Implement `evaluateCustomAchievements()`
- [ ] Run tests

### Phase 8: Batch Unlocking ✅ (45 minutes - TDD)

- [ ] Write test for `unlockAchievements()`
- [ ] Implement batch creation with E11000 handling
- [ ] Test idempotency (duplicate unlock attempts)
- [ ] Test user points update

### Phase 9: Main Orchestrator ✅ (30 minutes - TDD)

- [ ] Implement `evaluateAndUnlock(userId, entryId)`
- [ ] Call all 6 evaluators
- [ ] Merge qualified IDs
- [ ] Call `unlockAchievements()`
- [ ] Return formatted result

### Phase 10: API Integration ✅ (30 minutes)

- [ ] Modify `src/app/api/entries/route.js` (POST handler)
- [ ] Add try/catch for achievement evaluation
- [ ] Add logging
- [ ] Test manually with Postman/curl
- [ ] Write integration test

- [ ] Modify PUT handler similarly
- [ ] Test entry updates unlock new achievements

### Phase 11: Integration Tests ✅ (60 minutes)

- [ ] Write full flow test (entry save → achievement unlock)
- [ ] Test concurrent unlocks
- [ ] Test error resilience (entry saves even if evaluation fails)
- [ ] Test performance (<200ms target)

---

## Quick Reference: Key Files

```
src/
├── lib/
│   ├── services/
│   │   └── AchievementService.js       # Main service (you create)
│   ├── utils/
│   │   └── cache.js                    # Cache utility (you create)
│   └── models/
│       ├── Achievement.js              # Existing
│       ├── UserAchievement.js          # Existing
│       ├── Entry.js                    # Existing
│       └── User.js                     # Extend with achievementPoints
├── app/
│   └── api/
│       └── entries/
│           └── route.js                # Modify POST/PUT handlers

tests/
├── unit/
│   └── services/
│       └── AchievementService.test.js  # Unit tests (you create)
└── integration/
    └── achievements/
        └── unlock-flow.test.js         # Integration tests (you create)
```

---

## Common Patterns

### Pattern 1: Criteria Evaluator Template

```javascript
static async evaluate[Type]Achievements(userId, entry) {
  // 1. Get cached achievements
  const achievements = await this.getActiveAchievements();
  
  // 2. Filter by criteria type
  const relevantAchievements = achievements.filter(
    a => a.criteria.type === '[type]'
  );
  
  // 3. Query user data (if needed)
  const userData = await [fetchUserData](userId);
  
  // 4. Check qualification
  const qualified = relevantAchievements.filter(achievement => {
    const params = achievement.criteria.params;
    return [qualificationLogic](userData, params);
  });
  
  // 5. Return achievement IDs
  return qualified.map(a => a.achievementId);
}
```

### Pattern 2: Idempotent Database Operation

```javascript
try {
  await UserAchievement.create({ userId, achievementId, ... });
} catch (error) {
  if (error.code === 11000) {
    // Duplicate - already unlocked, skip silently
    continue;
  }
  throw error;  // Other errors propagate
}
```

### Pattern 3: Non-Blocking API Integration

```javascript
// In API route
const entry = await Entry.create(entryData);

let unlockedAchievements = [];
let totalPointsEarned = 0;

try {
  const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
  unlockedAchievements = result.unlockedAchievements;
  totalPointsEarned = result.totalPointsEarned;
} catch (achievementError) {
  logger.error('Achievement evaluation failed', { userId, entryId: entry._id, achievementError });
  // Continue - don't block entry save
}

return NextResponse.json({ entry, unlockedAchievements, totalPointsEarned });
```

---

## Testing Shortcuts

### Run Specific Test Suite
```bash
npm test -- AchievementService.test.js
npm test -- unlock-flow.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch AchievementService.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage AchievementService.test.js
```

### Test Single Method
```bash
npm test -- -t "evaluateDurationAchievements"
```

---

## Debugging Tips

### 1. Enable Verbose Logging

```javascript
// In AchievementService.js
import logger from '@/lib/utils/logger';

// Add at start of each evaluator
logger.debug('Evaluating duration achievements', { userId, entryDuration: entry.fastingDuration });

// Add at end
logger.debug('Duration achievements qualified', { userId, qualified });
```

### 2. Test Achievement Cache

```javascript
// In node REPL or test
const AchievementService = require('./src/lib/services/AchievementService');

const achievements = await AchievementService.getActiveAchievements();
console.log(`Loaded ${achievements.length} achievements`);
console.log('Duration achievements:', achievements.filter(a => a.criteria.type === 'duration-milestone').length);
```

### 3. Manual Achievement Unlock

```javascript
// scripts/test-unlock.js
import AchievementService from '@/lib/services/AchievementService';
import Entry from '@/lib/models/Entry';

const userId = '507f191e810c19729de860ea';
const entry = await Entry.findOne({ userId }).sort({ date: -1 });

const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
console.log('Unlocked:', result.unlockedAchievements.map(a => a.achievementId));
console.log('Points earned:', result.totalPointsEarned);
```

### 4. Check Duplicate Unlocks

```bash
# MongoDB query
db.userachievements.find({ userId: ObjectId("507f191e810c19729de860ea") })
  .sort({ unlockedAt: -1 })
  .limit(10);

# Check for duplicates
db.userachievements.aggregate([
  { $group: { _id: { userId: "$userId", achievementId: "$achievementId" }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]);
// Should return empty array (no duplicates)
```

---

## Performance Benchmarking

### Measure Evaluation Time

```javascript
// In test or script
const start = Date.now();
await AchievementService.evaluateAndUnlock(userId, entryId);
const duration = Date.now() - start;

console.log(`Evaluation took ${duration}ms`);
// Target: <200ms
```

### Profile Database Queries

```javascript
// Enable Mongoose query logging
mongoose.set('debug', true);

// Run evaluation
await AchievementService.evaluateAndUnlock(userId, entryId);

// Check console for query times
// Example output:
// Mongoose: entries.find({ userId: ... }) [20ms]
// Mongoose: userachievements.create({ ... }) [5ms]
```

### Measure Cache Effectiveness

```javascript
let cacheHits = 0;
let cacheMisses = 0;

// Modify SimpleCache.get() to track hits/misses
// Then run multiple evaluations
for (let i = 0; i < 10; i++) {
  await AchievementService.evaluateAndUnlock(userId, entryId);
}

console.log(`Cache hit rate: ${(cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1)}%`);
// Target: >95% after first call
```

---

## Common Issues & Solutions

### Issue 1: "Cannot read property 'fastingDuration' of null"
**Cause**: Entry not found  
**Solution**: Add null check in evaluateAndUnlock
```javascript
const entry = await Entry.findById(entryId);
if (!entry) throw new Error('Entry not found');
```

### Issue 2: "E11000 duplicate key error"
**Cause**: Achievement already unlocked (expected)  
**Solution**: Already handled in unlockAchievements (catch E11000)

### Issue 3: Tests fail with "MongooseError: Operation buffering timed out"
**Cause**: MongoDB not connected in test environment  
**Solution**: Use MongoDB Memory Server
```javascript
// tests/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Issue 4: Achievement cache not refreshing
**Cause**: TTL not expired, need manual refresh  
**Solution**: Clear cache in admin operation
```javascript
// In admin achievement update handler
achievementCache.clear('active');
```

### Issue 5: Streak calculation incorrect across month boundaries
**Cause**: Date comparison logic  
**Solution**: Use date strings (YYYY-MM-DD format) for comparison
```javascript
const dateStr = entry.date.toISOString().split('T')[0];  // "2025-11-06"
```

---

## Next Steps After Implementation

1. **Deploy to staging environment**
   - Monitor logs for errors
   - Test with real user data
   - Verify performance (<200ms)

2. **Update frontend** (separate task)
   - Handle `unlockedAchievements` in API responses
   - Show toast notifications
   - Test user experience

3. **Add monitoring** (optional)
   - Track achievement unlock rates
   - Monitor evaluation latency
   - Alert on high error rates

4. **Backlog items** (future features)
   - Hide locked achievements from UI (already added to backlog)
   - Achievement criteria visibility for unlocked achievements
   - Admin UI for managing achievements
   - Progress tracking UI ("X% to next achievement")

---

## Resources

- **Spec**: `specs/031-achievement-unlock-logic/spec.md`
- **Research**: `specs/031-achievement-unlock-logic/research.md`
- **Data Model**: `specs/031-achievement-unlock-logic/data-model.md`
- **Service Contract**: `specs/031-achievement-unlock-logic/contracts/AchievementService.md`
- **API Contract**: `specs/031-achievement-unlock-logic/contracts/api-endpoints.md`

---

## Get Help

- **Clarification needed?** Review `spec.md` Clarifications section
- **Technical decisions?** Check `research.md`
- **API questions?** See `contracts/api-endpoints.md`
- **Model questions?** See `data-model.md`

---

**Estimated Total Time**: 8-10 hours (with TDD approach)

**Ready to start?** Begin with Phase 1: Create cache utility and run first test! 🚀
