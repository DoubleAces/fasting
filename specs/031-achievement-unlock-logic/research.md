# Research: Achievement Unlock Logic

**Feature**: 031 - Achievement Unlock Logic  
**Date**: November 6, 2025  
**Purpose**: Research technical decisions and best practices for automatic achievement evaluation system

---

## 1. Streak Calculation from Meal Times

### Decision
Calculate streaks based on actual fasting period dates (derived from meal timestamps), not entry creation timestamps.

### Rationale
- Users may create entries retroactively or update meal times after initial creation
- The fasting period (when the fast actually happened) is the source of truth
- Entry creation timestamp is administrative metadata, not biological data
- Allows users to correct data without breaking streak integrity

### Implementation Approach
- Extract date boundaries from `firstMeal` and `lastMeal` timestamps
- Convert to calendar dates (considering user timezone if available)
- Query entries ordered by fasting end date descending
- Count consecutive calendar dates where fasts occurred
- Multiple entries on same date count as single day for streak purposes

### Alternatives Considered
- **Entry creation timestamp**: Rejected - doesn't reflect actual fasting behavior, prevents retroactive corrections
- **Hybrid (creation within 48h of fast date)**: Rejected - adds complexity without clear benefit, still allows some gaming

---

## 2. Weight Loss Tracking Method

### Decision
Track current/most recent weight only - achievements unlock based on sustained weight loss (must maintain loss to keep achievement).

### Rationale
- Encourages sustained healthy behavior, not just temporary weight loss
- Aligns with health goals (maintaining weight loss is harder than losing)
- Simpler implementation (no historical tracking of "lowest ever" weight)
- Motivates users to maintain progress

### Implementation Approach
- Query most recent entry with `morningWeight` field populated
- Calculate: `weightLoss = user.startingWeight - entry.morningWeight`
- Compare against achievement criteria (5lb, 10lb, 25lb thresholds)
- If weight increases, user no longer qualifies for higher-tier achievements
- Re-evaluation on each entry update ensures current state accuracy

### Alternatives Considered
- **All-time lowest weight**: Rejected - allows achievements to unlock during weight regain, doesn't encourage maintenance
- **30-day rolling average**: Rejected - adds complexity, makes achievement unlock timing unpredictable for users

---

## 3. Entry Update Re-evaluation Strategy

### Decision
Evaluate achievements on both POST and PUT operations, rely on idempotent database operations (unique constraints) to prevent duplicates. Gaming mitigated by hiding locked achievements from users.

### Rationale
- User workflow involves creating entry with partial data, then updating with actual meal times
- Achievement evaluation needs complete data to be accurate
- Idempotency via unique constraint `(userId + achievementId)` handles duplicate unlock attempts safely
- Hiding locked achievements prevents users from gaming specific targets

### Implementation Approach
- Call `AchievementService.evaluateAndUnlock(userId, entryId)` after successful entry save (POST/PUT)
- Service evaluates all criteria types on every call
- UserAchievement unique constraint prevents duplicates automatically
- MongoDB E11000 errors caught and treated as success (achievement already unlocked)
- Frontend shows only progress count (19/81) and unlocked achievements, not locked ones

### Alternatives Considered
- **POST only, skip updates**: Rejected - misses actual data when users update meal times
- **Add "Complete Entry" flag**: Rejected - adds UI complexity, extra user action required
- **Achievement revocation system**: Rejected - high complexity, confusing UX, requires tracking entry→achievement links

### UI Anti-Gaming Strategy
Added to backlog (separate feature):
- Hide locked achievements from users entirely
- Show only: progress count (e.g., "19/81 unlocked") and already-unlocked achievements
- Criteria visibility only for unlocked achievements
- Prevents users from targeting specific achievements by editing entries

---

## 4. Batch Operation Atomicity

### Decision
Use sequential UserAchievement creates with unique constraint (no MongoDB transactions).

### Rationale
- MongoDB transactions require replica set configuration (adds deployment complexity)
- Transactions add ~50-100ms latency overhead
- Achievement unlocking is inherently idempotent due to unique constraint
- Partial success is acceptable (some achievements unlock even if one fails)
- Matches existing codebase patterns for similar operations

### Implementation Approach
```javascript
async function unlockAchievements(userId, achievementIds) {
  const unlocked = [];
  for (const achievementId of achievementIds) {
    try {
      const userAchievement = await UserAchievement.create({
        userId,
        achievementId,
        unlockedAt: new Date(),
        progress: { /* relevant metrics */ }
      });
      unlocked.push(userAchievement);
    } catch (error) {
      if (error.code === 11000) {
        // Already unlocked - skip silently
        continue;
      }
      // Log other errors but don't block remaining unlocks
      logger.error('Achievement unlock failed', { userId, achievementId, error });
    }
  }
  return unlocked;
}
```

### Alternatives Considered
- **MongoDB transactions**: Rejected - adds complexity, requires replica sets, performance overhead
- **Batch insertMany with ordered:false**: Rejected - harder error handling, doesn't provide granular control per achievement

---

## 5. Achievement Definition Cache Strategy

### Decision
In-memory cache with 1-hour TTL for achievement definitions.

### Rationale
- Achievement definitions change rarely (admin operations, maybe monthly)
- 1-hour staleness acceptable for new achievements (admin can wait or restart server if urgent)
- Balances performance (avoids DB query on every entry save) with freshness
- Simpler than manual invalidation or event-driven cache clearing
- Auto-healing (stale data refreshes automatically)

### Implementation Approach
```javascript
// src/lib/utils/cache.js
class SimpleCache {
  constructor(ttlMs = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttlMs;
  }
  
  async get(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }
    const value = await fetchFn();
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }
  
  clear(key) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }
}

// Usage in AchievementService
const achievementCache = new SimpleCache(3600000); // 1h TTL

async getActiveAchievements() {
  return achievementCache.get('active', async () => {
    return Achievement.find({ isActive: true }).lean();
  });
}
```

### Alternatives Considered
- **5-minute TTL**: Rejected - too frequent refreshes, minimal benefit over 1-hour
- **Manual cache invalidation**: Rejected - requires event system, admin operations need to trigger clears
- **No caching**: Rejected - adds 20-50ms per entry save, unnecessary DB load
- **Process-lifetime cache**: Rejected - too stale (requires redeploy for new achievements), though acceptable in low-traffic scenarios

---

## 6. Mongoose Query Optimization

### Best Practices Applied

#### Streak Calculation
```javascript
// Efficient: Limit results, select only needed fields, descending sort
const entries = await Entry.find({ userId })
  .sort({ date: -1 })
  .limit(100)  // Most users won't have >100-day streaks
  .select('date')
  .lean();  // Plain objects, faster
```

#### Entry Counts
```javascript
// Use countDocuments (optimized) instead of find().length
const totalEntries = await Entry.countDocuments({ userId });
const completedGoals = await Entry.countDocuments({ 
  userId, 
  goalStatus: 'completed' 
});
```

#### Weight Query
```javascript
// Single document with sort
const latestWeight = await Entry.findOne({ 
  userId, 
  morningWeight: { $exists: true } 
})
  .sort({ date: -1 })
  .select('morningWeight')
  .lean();
```

### Index Requirements
Existing indexes from Entry model (verified):
- Compound index on `(userId + date)` - supports streak queries
- Unique index on `(userId + date)` - ensures one entry per date

### Performance Targets
- <200ms total evaluation time for users with <100 entries
- Individual query targets:
  - Streak calculation: <50ms
  - Count queries: <20ms each
  - Weight query: <10ms
  - Achievement cache lookup: <5ms
  - Total budget: ~105ms for queries, ~95ms for business logic

---

## 7. Error Handling Strategy

### Decision
Non-blocking error handling - achievement evaluation failures never prevent entry saves.

### Rationale
- Entry saving is the primary user action (must succeed)
- Achievements are secondary (nice-to-have gamification)
- Graceful degradation maintains user trust
- Errors logged for debugging without disrupting UX

### Implementation Approach
```javascript
// In /api/entries route.js
try {
  const entry = await Entry.create(entryData);
  
  // Non-blocking achievement evaluation
  try {
    const unlockedAchievements = await AchievementService.evaluateAndUnlock(
      userId, 
      entry._id
    );
    return NextResponse.json({ 
      entry, 
      unlockedAchievements 
    });
  } catch (achievementError) {
    // Log error but return successful entry save
    logger.error('Achievement evaluation failed', {
      userId,
      entryId: entry._id,
      error: achievementError
    });
    return NextResponse.json({ 
      entry, 
      unlockedAchievements: [] 
    });
  }
} catch (entryError) {
  // Entry save failed - this IS a user-facing error
  return NextResponse.json(
    { error: 'Failed to save entry' },
    { status: 500 }
  );
}
```

### Logging Requirements
- Structured JSON logging (existing logger from Feature 026)
- Context: userId, entryId, criteriaType, error details
- Severity levels:
  - ERROR: Unexpected failures (database errors, null references)
  - WARN: Expected conditions (missing user.startingWeight, custom criteria not found)
  - INFO: Successful unlocks (userId, achievementIds, points earned)

---

## 8. Custom Criteria Extensibility

### Decision
Registry pattern with function mapping for custom achievement evaluators.

### Rationale
- Allows adding new custom achievements without modifying core service
- Clean separation of concerns (each custom criteria has own function)
- Easy to test individual custom evaluators
- Graceful degradation if custom key not found

### Implementation Approach
```javascript
// In AchievementService.js
const CUSTOM_EVALUATORS = {
  'first-morning-entry': evaluateFirstMorningEntry,
  'weekend-fasts': evaluateWeekendFasts,
  // Add more as needed
};

async evaluateCustomAchievements(userId, entry) {
  const achievements = await this.getActiveAchievements();
  const customAchievements = achievements.filter(
    a => a.criteria.type === 'custom'
  );
  
  const qualified = [];
  for (const achievement of customAchievements) {
    const customKey = achievement.criteria.params.customKey;
    const evaluator = CUSTOM_EVALUATORS[customKey];
    
    if (!evaluator) {
      logger.warn('Custom evaluator not found', { customKey, achievementId: achievement.achievementId });
      continue;
    }
    
    const isQualified = await evaluator(userId, entry, achievement.criteria.params);
    if (isQualified) qualified.push(achievement.achievementId);
  }
  
  return qualified;
}

// Example custom evaluator
async function evaluateFirstMorningEntry(userId, entry, params) {
  // Check if this is user's first entry with meal before 8am
  const morningHour = new Date(entry.firstMeal).getHours();
  if (morningHour >= 8) return false;
  
  const previousMorningEntries = await Entry.countDocuments({
    userId,
    firstMeal: { $exists: true },
    _id: { $ne: entry._id }
  });
  
  return previousMorningEntries === 0;
}
```

### Best Practices
- Each custom evaluator is async function: `(userId, entry, params) => Promise<boolean>`
- Evaluators should be stateless (no side effects)
- Document expected params structure in achievement seed data
- Return boolean (qualified/not qualified)

---

## 9. Testing Strategy

### Unit Tests (src/tests/unit/services/AchievementService.test.js)
- **Duration evaluation**: Test each threshold (12h, 24h, 48h, 72h)
- **Streak evaluation**: Test consecutive dates, breaks, same-day entries
- **Entry count**: Test thresholds (10, 25, 50, 100)
- **Goal completion**: Test goalStatus filtering, counts
- **Weight loss**: Test with/without startingWeight, various thresholds
- **Custom criteria**: Test registry lookup, missing evaluators
- **Batch unlocking**: Test multiple simultaneous achievements
- **Idempotency**: Test duplicate unlock attempts

### Integration Tests (src/tests/integration/achievements/unlock-flow.test.js)
- **Full POST flow**: Entry creation triggers evaluation and unlocks
- **Full PUT flow**: Entry update re-evaluates and unlocks new achievements
- **Database operations**: Verify UserAchievement records created correctly
- **Points update**: Verify user.achievementPoints incremented
- **API response**: Verify unlockedAchievements array in response
- **Error resilience**: Verify entry saves even if achievement evaluation fails
- **Concurrent operations**: Test simultaneous entry saves by same user

### Performance Tests
- **Evaluation time**: Measure with 50, 100, 200 entries (target <200ms)
- **Cache effectiveness**: Measure with/without cache (should be >10x faster)
- **Query optimization**: Profile individual queries (streak, count, weight)

### Edge Case Tests
- Missing data (no startingWeight, no entries for streak)
- Invalid data (negative duration, null dates)
- Concurrent unlocks (same achievement, same user, simultaneous requests)
- Achievement already unlocked (E11000 error handling)
- Custom criteria not implemented (warning logged, no crash)

---

## 10. API Response Format

### Decision
Return unlocked achievements as array in API response, frontend handles toast notification.

### Rationale
- Separation of concerns (backend returns data, frontend handles presentation)
- Allows frontend flexibility (toast, modal, banner, etc.)
- Consistent with existing API patterns in codebase
- Supports batch unlocking (multiple achievements in single array)

### Response Schema
```json
{
  "entry": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "firstMeal": "2025-11-06T08:00:00Z",
    "lastMeal": "2025-11-06T20:00:00Z",
    "fastingDuration": 720,
    "goalStatus": "completed",
    "morningWeight": 195
  },
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": {
        "en": "12-Hour Starter",
        "es": "Iniciador de 12 Horas"
      },
      "description": {
        "en": "Complete your first 12-hour fast",
        "es": "Completa tu primer ayuno de 12 horas"
      },
      "points": 10,
      "rarity": "common",
      "icon": "🎯",
      "category": "duration"
    }
  ],
  "totalPointsEarned": 10
}
```

### Frontend Integration
Existing toast system (Feature 021) handles display:
```javascript
// Frontend code (already exists, no changes needed)
if (response.unlockedAchievements?.length > 0) {
  const count = response.unlockedAchievements.length;
  const points = response.totalPointsEarned;
  
  if (count === 1) {
    const achievement = response.unlockedAchievements[0];
    showToast(`🎉 Achievement Unlocked: ${achievement.name.en} (+${points} points)`, 'success');
  } else {
    showToast(`🎉 You unlocked ${count} achievements! (+${points} points)`, 'success');
  }
}
```

---

## Implementation Priority

### Phase 1: Core Infrastructure
1. Create AchievementService class skeleton
2. Implement cache utility (SimpleCache)
3. Set up test files with fixtures

### Phase 2: Criteria Evaluators (TDD Order)
1. Duration evaluator (simplest, most critical)
2. Entry count evaluator (simple query)
3. Goal completion evaluator (filtered count)
4. Streak evaluator (moderate complexity)
5. Weight loss evaluator (requires user data)
6. Custom evaluator (registry pattern)

### Phase 3: Integration
1. unlockAchievements method (batch creation)
2. evaluateAndUnlock orchestrator
3. API route integration (POST/PUT)
4. Error handling and logging

### Phase 4: Optimization
1. Cache implementation
2. Query optimization
3. Performance testing
4. Load testing

---

## Dependencies Verification

### Existing Features (Verified Complete)
- ✅ Feature 028: Achievement & UserAchievement models
- ✅ Feature 029: Achievement API endpoints
- ✅ Feature 030: 81 achievements seeded with criteria
- ✅ Feature 020: Goal system (goalStatus field)
- ✅ Feature 021: Toast notification system
- ✅ Feature 026: Security logger

### Database Indexes (Verified)
- ✅ UserAchievement: Unique compound on (userId + achievementId)
- ✅ UserAchievement: Compound on (userId + unlockedAt desc)
- ✅ Entry: Compound on (userId + date)
- ✅ Entry: Unique on (userId + date)

### User Model Extension (Required)
- ⚠️ **VERIFY**: User model has `achievementPoints` field (Number, default 0)
- If missing, add to User schema before starting implementation

---

## Research Complete

All technical decisions documented with rationales and implementation approaches. No NEEDS CLARIFICATION items remaining. Ready to proceed to Phase 1: Design & Contracts.
