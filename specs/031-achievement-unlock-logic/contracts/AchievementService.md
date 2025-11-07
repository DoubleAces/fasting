# AchievementService API Contract

**Feature**: 031 - Achievement Unlock Logic  
**Service**: AchievementService  
**Language**: JavaScript (ES6+)  
**Location**: `src/lib/services/AchievementService.js`

---

## Class Interface

```javascript
class AchievementService {
  /**
   * Main entry point - evaluates all achievement criteria and unlocks eligible achievements
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @param {string|ObjectId} entryId - Entry's MongoDB ObjectId
   * @returns {Promise<EvaluationResult>}
   * @throws {Error} If userId or entryId invalid
   * 
   * @example
   * const result = await AchievementService.evaluateAndUnlock(userId, entryId);
   * // Returns: { unlockedAchievements: [...], totalPointsEarned: 25 }
   */
  static async evaluateAndUnlock(userId, entryId);

  /**
   * Evaluates duration-based achievements (12h, 24h, 48h, 72h milestones)
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @param {Object} entry - Entry document with fastingDuration field
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateDurationAchievements(userId, entry);
   * // Returns: ['first-twelve', 'first-twentyfour']
   */
  static async evaluateDurationAchievements(userId, entry);

  /**
   * Evaluates streak-based achievements (3, 7, 14, 30, 60, 90 day streaks)
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @param {Object} entry - Entry document (date used for streak calculation)
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateStreakAchievements(userId, entry);
   * // Returns: ['three-day-streak', 'seven-day-dedication']
   */
  static async evaluateStreakAchievements(userId, entry);

  /**
   * Evaluates entry count achievements (10, 25, 50, 100 total entries)
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateEntryCountAchievements(userId);
   * // Returns: ['ten-entries-logged']
   */
  static async evaluateEntryCountAchievements(userId);

  /**
   * Evaluates goal completion achievements (10, 25, 50, 100 completed goals)
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateGoalAchievements(userId);
   * // Returns: ['ten-goals-reached']
   */
  static async evaluateGoalAchievements(userId);

  /**
   * Evaluates weight loss achievements (5, 10, 25, 50, 75 pounds lost)
   * Requires user.startingWeight to be set
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateWeightAchievements(userId);
   * // Returns: ['five-pounds', 'ten-pounds']
   */
  static async evaluateWeightAchievements(userId);

  /**
   * Evaluates custom achievement criteria using registry pattern
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @param {Object} entry - Entry document
   * @returns {Promise<string[]>} Array of qualified achievement IDs
   * 
   * @example
   * const qualified = await AchievementService.evaluateCustomAchievements(userId, entry);
   * // Returns: ['early-bird']
   */
  static async evaluateCustomAchievements(userId, entry);

  /**
   * Creates UserAchievement records for qualified achievements and updates user points
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @param {string[]} achievementIds - Array of achievement IDs to unlock
   * @returns {Promise<UserAchievement[]>} Array of created UserAchievement documents
   * 
   * @example
   * const unlocked = await AchievementService.unlockAchievements(userId, ['first-twelve']);
   * // Returns: [{ userId, achievementId: 'first-twelve', unlockedAt, progress }]
   */
  static async unlockAchievements(userId, achievementIds);

  /**
   * Retrieves cached active achievements (1-hour TTL)
   * 
   * @returns {Promise<Achievement[]>} Array of active achievement documents
   * @private
   * 
   * @example
   * const achievements = await AchievementService.getActiveAchievements();
   * // Returns: [{ achievementId, criteria, points, ... }]
   */
  static async getActiveAchievements();

  /**
   * Calculates current streak length for user
   * 
   * @param {string|ObjectId} userId - User's MongoDB ObjectId
   * @returns {Promise<number>} Current streak length in days
   * @private
   * 
   * @example
   * const streak = await AchievementService.calculateStreak(userId);
   * // Returns: 7
   */
  static async calculateStreak(userId);
}
```

---

## Type Definitions

### EvaluationResult
```javascript
{
  unlockedAchievements: Array<{
    achievementId: string,
    name: {
      en: string,
      es: string
    },
    description: {
      en: string,
      es: string
    },
    points: number,
    rarity: 'common' | 'rare' | 'epic' | 'legendary',
    icon: string,
    category: string
  }>,
  totalPointsEarned: number
}
```

### Achievement (from database)
```javascript
{
  achievementId: string,
  translations: {
    en: { name: string, description: string },
    es: { name: string, description: string }
  },
  criteria: {
    type: 'duration-milestone' | 'streak' | 'entry-count' | 'goal-completion' | 'weight-loss' | 'custom',
    params: {
      minDuration?: number,        // Minutes (for duration)
      streakLength?: number,        // Days (for streak)
      entryCount?: number,          // Count (for entry-count)
      goalsCompleted?: number,      // Count (for goal-completion)
      poundsLost?: number,          // Pounds (for weight-loss)
      customKey?: string,           // Registry key (for custom)
      [key: string]: any            // Additional params for custom criteria
    }
  },
  category: string,
  rarity: string,
  points: number,
  icon: string,
  isActive: boolean,
  isSecret: boolean
}
```

### UserAchievement (from database)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  achievementId: string,
  unlockedAt: Date,
  progress: {
    // Varies by achievement type (see data-model.md for details)
    [key: string]: any
  },
  notificationSeen: boolean
}
```

### Entry (from database)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  firstMeal: Date,
  lastMeal: Date,
  fastingDuration: number,      // Minutes
  date: Date,                   // Midnight UTC
  goalStatus: 'completed' | 'not-completed' | 'no-goal',
  morningWeight?: number,       // Pounds (optional)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

### Expected Errors (Caught and Handled)

#### E11000 Duplicate Key Error
```javascript
// When achievement already unlocked
catch (error) {
  if (error.code === 11000) {
    // Silent skip - achievement already exists
    continue;
  }
}
```

#### Missing Data Warnings
```javascript
// When user.startingWeight not set for weight achievements
if (!user.startingWeight) {
  logger.warn('Cannot evaluate weight achievements - no starting weight', { userId });
  return [];
}
```

#### Custom Evaluator Not Found
```javascript
// When custom criteria references unknown customKey
if (!CUSTOM_EVALUATORS[customKey]) {
  logger.warn('Custom evaluator not found', { customKey, achievementId });
  continue;
}
```

### Unexpected Errors (Logged and Propagated)

```javascript
// Database errors, null references, etc.
catch (error) {
  logger.error('Achievement evaluation failed', {
    userId,
    entryId,
    phase: 'duration-evaluation',
    error: error.message,
    stack: error.stack
  });
  throw error;  // Propagate to API layer
}
```

---

## Performance Characteristics

### Time Complexity
- **evaluateAndUnlock()**: O(n) where n = number of user's entries (limited to 100 for streak)
- **evaluateDurationAchievements()**: O(m) where m = number of duration achievements (~15)
- **evaluateStreakAchievements()**: O(n) where n = number of entries (limited to 100)
- **evaluateEntryCountAchievements()**: O(1) - single count query
- **evaluateGoalAchievements()**: O(1) - single count query
- **evaluateWeightAchievements()**: O(1) - single findOne query
- **unlockAchievements()**: O(k) where k = number of achievements to unlock (typically <10)

### Space Complexity
- **Achievement cache**: O(81) - all achievement definitions (~100KB)
- **Entry query results**: O(100) - limited to 100 most recent entries
- **Qualified IDs collection**: O(k) where k = unlocked achievements (typically <10)

### Performance Targets
- **Total evaluation time**: <200ms for users with <100 entries
- **Cache hit rate**: >95% for achievement definitions
- **Database queries**: Maximum 6 per evaluation (1 per criteria type)

---

## Usage Examples

### Example 1: Basic Entry Save Integration
```javascript
// In /api/entries route.js (POST handler)
import AchievementService from '@/lib/services/AchievementService';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session.user.id;
    const entryData = await request.json();
    
    // Save entry
    const entry = await Entry.create({
      ...entryData,
      userId
    });
    
    // Evaluate achievements (non-blocking)
    try {
      const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
      
      return NextResponse.json({
        entry,
        unlockedAchievements: result.unlockedAchievements,
        totalPointsEarned: result.totalPointsEarned
      });
    } catch (achievementError) {
      // Log but don't block entry save
      logger.error('Achievement evaluation failed', { userId, entryId: entry._id, achievementError });
      
      return NextResponse.json({
        entry,
        unlockedAchievements: [],
        totalPointsEarned: 0
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
```

### Example 2: Manual Achievement Evaluation (Admin/Debug)
```javascript
// scripts/evaluate-achievements.js
import AchievementService from '@/lib/services/AchievementService';
import Entry from '@/lib/models/Entry';

async function evaluateUserAchievements(userId) {
  const entries = await Entry.find({ userId }).sort({ date: -1 });
  
  for (const entry of entries) {
    try {
      const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
      
      if (result.unlockedAchievements.length > 0) {
        console.log(`Unlocked ${result.unlockedAchievements.length} achievements for entry ${entry._id}`);
        console.log(result.unlockedAchievements.map(a => a.achievementId));
      }
    } catch (error) {
      console.error(`Failed to evaluate entry ${entry._id}:`, error.message);
    }
  }
}
```

### Example 3: Testing Individual Evaluator
```javascript
// tests/unit/services/AchievementService.test.js
import AchievementService from '@/lib/services/AchievementService';

describe('Duration Achievements', () => {
  it('should unlock first-twelve achievement for 12-hour fast', async () => {
    const entry = {
      userId: testUserId,
      fastingDuration: 720,  // 12 hours in minutes
      date: new Date()
    };
    
    const qualified = await AchievementService.evaluateDurationAchievements(testUserId, entry);
    
    expect(qualified).toContain('first-twelve');
  });
  
  it('should unlock multiple achievements for 72-hour fast', async () => {
    const entry = {
      userId: testUserId,
      fastingDuration: 4320,  // 72 hours
      date: new Date()
    };
    
    const qualified = await AchievementService.evaluateDurationAchievements(testUserId, entry);
    
    expect(qualified).toContain('first-twelve');
    expect(qualified).toContain('first-twentyfour');
    expect(qualified).toContain('first-fortyeight');
    expect(qualified).toContain('seventytwo-hour-champion');
  });
});
```

---

## Dependencies

### External Libraries
- **mongoose**: MongoDB ODM for model interactions
- **mongodb**: Native driver (via Mongoose)

### Internal Dependencies
- **@/lib/models/Achievement**: Achievement model
- **@/lib/models/UserAchievement**: UserAchievement model
- **@/lib/models/Entry**: Entry model
- **@/lib/models/User**: User model
- **@/lib/utils/cache**: SimpleCache utility (1h TTL)
- **@/lib/utils/logger**: Security logger (Feature 026)

### Configuration
No environment variables needed (uses existing database connection).

---

## Testing Contract

### Unit Test Coverage Requirements
- ✅ Each evaluator method (6 criteria types)
- ✅ Edge cases (missing data, invalid data, boundary values)
- ✅ Idempotency (duplicate unlock attempts)
- ✅ Cache behavior (hit/miss scenarios)
- ✅ Error handling (E11000, missing fields, null values)

### Integration Test Requirements
- ✅ Full evaluateAndUnlock flow with real database
- ✅ UserAchievement record creation
- ✅ User points update
- ✅ API response format
- ✅ Concurrent unlock attempts

### Performance Test Requirements
- ✅ <200ms evaluation time with 50, 100, 200 entries
- ✅ Cache effectiveness measurement
- ✅ Query profiling

---

## Version History

**v1.0.0** (November 6, 2025)
- Initial contract definition
- 6 criteria evaluators
- Batch unlocking support
- 1-hour cache TTL
- Idempotent operations
