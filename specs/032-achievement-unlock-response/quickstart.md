# Quickstart Guide: Achievement Unlock API Response

**Feature**: 032-achievement-unlock-response  
**Time Estimate**: 2-3 hours (modify 2 API routes + add tests)  
**Prerequisites**: Feature 031 complete (AchievementService implemented and tested)

## Overview

This guide walks through integrating the AchievementService with Entry API endpoints to automatically return unlocked achievements in the response when users create or update fasting entries.

---

## Quick Start (3 Steps)

### Step 1: Modify POST /api/entries Handler (45 min)

**File**: `src/app/api/entries/route.js`

**Location**: Inside the POST handler, after `await entry.save()`

**Add**:
```javascript
import AchievementService from '@/lib/services/AchievementService';

export const POST = withErrorHandler(async (request) => {
  // ... existing validation and entry creation code ...
  
  await entry.save();
  
  // NEW: Evaluate achievements after entry creation
  let unlockedAchievements = [];
  try {
    const result = await AchievementService.evaluateAndUnlock(
      session.user.id, 
      entry._id
    );
    unlockedAchievements = result.unlockedAchievements || [];
    
    if (unlockedAchievements.length > 0) {
      const achievementIds = unlockedAchievements.map(a => a.achievementId).join(', ');
      console.log(`🏆 Achievements unlocked: ${achievementIds}`);
    }
  } catch (error) {
    console.error(`Achievement evaluation failed for entry ${entry._id}:`, error.message);
    // Continue - entry creation succeeded, achievement evaluation is optional
  }
  
  // Revalidate entries page
  revalidatePath('/entries');
  
  // Return entry with unlocked achievements
  return createdResponse({
    ...entry.toObject(),
    unlockedAchievements
  });
});
```

**Key Points**:
- Add import at top of file: `import AchievementService from '@/lib/services/AchievementService';`
- Place achievement evaluation AFTER `await entry.save()` (entry must exist in DB)
- Use try/catch to ensure entry creation never fails due to achievement errors
- Log success with 🏆 emoji for easy grep in production logs
- Log errors with entry ID context for debugging
- Spread `unlockedAchievements` into response object

---

### Step 2: Modify PUT /api/entries/[id] Handler (45 min)

**File**: `src/app/api/entries/[id]/route.js`

**Location**: Inside the PUT handler, after `await updatedEntry.save()`

**Add** (same pattern as POST):
```javascript
import AchievementService from '@/lib/services/AchievementService';

export const PUT = withErrorHandler(async (request, { params }) => {
  // ... existing validation and entry update code ...
  
  await updatedEntry.save();
  
  // NEW: Evaluate achievements after entry update
  let unlockedAchievements = [];
  try {
    const result = await AchievementService.evaluateAndUnlock(
      session.user.id,
      updatedEntry._id
    );
    unlockedAchievements = result.unlockedAchievements || [];
    
    if (unlockedAchievements.length > 0) {
      const achievementIds = unlockedAchievements.map(a => a.achievementId).join(', ');
      console.log(`🏆 Achievements unlocked: ${achievementIds}`);
    }
  } catch (error) {
    console.error(`Achievement evaluation failed for entry ${updatedEntry._id}:`, error.message);
    // Continue - entry update succeeded, achievement evaluation is optional
  }
  
  // Revalidate entries and entry detail pages
  revalidatePath('/entries');
  revalidatePath(`/entries/${params.id}`);
  
  // Return updated entry with unlocked achievements
  return okResponse({
    ...updatedEntry.toObject(),
    unlockedAchievements
  });
});
```

**Key Points**:
- Same pattern as POST handler (consistency)
- Use `updatedEntry._id` instead of `entry._id`
- Use `okResponse()` instead of `createdResponse()` (200 vs 201 status)
- Same error handling and logging pattern

---

### Step 3: Add Integration Tests (60 min)

**File**: `tests/integration/achievements/api-response.test.js` (new file)

**Create**:
```javascript
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import { POST } from '@/app/api/entries/route';
import { PUT } from '@/app/api/entries/[id]/route';
import Entry from '@/lib/models/Entry';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';

// Mock authentication
jest.mock('@/lib/auth');

describe('Achievement Unlock API Response Integration', () => {
  let testUser;
  let testAchievement;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
      authMethod: 'email',
      name: 'Test User',
      achievementPoints: 0
    });

    // Mock authenticated session
    auth.mockResolvedValue({
      user: {
        id: testUser._id.toString(),
        email: testUser.email
      }
    });

    // Create test achievement
    testAchievement = await Achievement.create({
      achievementId: 'first-twelve',
      translations: {
        en: {
          name: 'First 12-Hour Fast',
          description: 'Complete your first 12-hour fast',
          shortDescription: '12h fast'
        }
      },
      icon: '⏱️',
      iconColor: '#10B981',
      category: 'duration',
      points: 10,
      rarity: 'common',
      order: 10,
      criteria: {
        type: 'duration-milestone',
        params: { minDuration: 720 }
      },
      isActive: true,
      createdBy: testUser._id
    });
  });

  describe('POST /api/entries', () => {
    it('should include unlockedAchievements when entry unlocks achievement', async () => {
      const request = {
        json: async () => ({
          date: '2025-11-07',
          lastMealTime: '20:00',
          firstMealTime: '12:00',
          fastingDuration: 960
        })
      };

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.unlockedAchievements).toBeDefined();
      expect(data.unlockedAchievements).toHaveLength(1);
      expect(data.unlockedAchievements[0].achievementId).toBe('first-twelve');
      expect(data.unlockedAchievements[0].points).toBe(10);
    });

    it('should return empty array when no achievements unlocked', async () => {
      const request = {
        json: async () => ({
          date: '2025-11-07',
          lastMealTime: '18:00',
          firstMealTime: '08:00',
          fastingDuration: 600
        })
      };

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.unlockedAchievements).toEqual([]);
    });
  });

  describe('PUT /api/entries/[id]', () => {
    it('should include newly unlocked achievements when update qualifies', async () => {
      // Create entry without achievement
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 600
      });

      // Update to qualify for achievement
      const request = {
        json: async () => ({
          fastingDuration: 720
        })
      };

      const response = await PUT(request, { params: { id: entry._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.unlockedAchievements).toHaveLength(1);
      expect(data.unlockedAchievements[0].achievementId).toBe('first-twelve');
    });

    it('should return empty array when update does not unlock achievements', async () => {
      const entry = await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-07'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 600
      });

      const request = {
        json: async () => ({
          foodNotes: 'Updated notes'
        })
      };

      const response = await PUT(request, { params: { id: entry._id.toString() } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.unlockedAchievements).toEqual([]);
    });
  });
});
```

**Run Tests**:
```bash
npm test tests/integration/achievements/api-response.test.js
```

**Expected Output**: All tests passing ✅

---

## Verification Checklist

After completing the 3 steps above:

- [ ] POST handler imports AchievementService
- [ ] POST handler calls `evaluateAndUnlock()` after `entry.save()`
- [ ] POST handler uses try/catch for non-blocking error handling
- [ ] POST handler logs success with 🏆 emoji
- [ ] POST handler logs errors with entry ID context
- [ ] POST handler returns `unlockedAchievements` in response
- [ ] PUT handler has identical pattern (same 6 checks above)
- [ ] Integration tests pass (4+ tests covering POST/PUT success/empty cases)
- [ ] Manual test: Create 12h entry, see achievement in response
- [ ] Manual test: Check console logs for 🏆 emoji

---

## Manual Testing

### Test Case 1: Create Entry That Unlocks Achievement

```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "date": "2025-11-07",
    "lastMealTime": "20:00",
    "firstMealTime": "12:00",
    "fastingDuration": 960
  }'
```

**Expected Response** (201 Created):
```json
{
  "_id": "...",
  "date": "2025-11-07T00:00:00.000Z",
  "fastingDuration": 960,
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      "name": "First 12-Hour Fast",
      "points": 10,
      "rarity": "common",
      "category": "duration",
      "iconColor": "#10B981",
      "unlockedAt": "2025-11-07T..."
    }
  ]
}
```

**Check Console**: Should see `🏆 Achievements unlocked: first-twelve`

### Test Case 2: Update Entry to Unlock Achievement

```bash
curl -X PUT http://localhost:3000/api/entries/ENTRY_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "fastingDuration": 720
  }'
```

**Expected Response** (200 OK):
```json
{
  "_id": "ENTRY_ID",
  "fastingDuration": 720,
  "unlockedAchievements": [
    {
      "achievementId": "first-twelve",
      ...
    }
  ]
}
```

### Test Case 3: Create Entry Without Achievements

```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "date": "2025-11-08",
    "lastMealTime": "18:00",
    "firstMealTime": "08:00",
    "fastingDuration": 600
  }'
```

**Expected Response** (201 Created):
```json
{
  "_id": "...",
  "fastingDuration": 600,
  "unlockedAchievements": []
}
```

---

## Common Patterns

### Pattern 1: Display Achievement Toast

```javascript
// In frontend form submission handler
const response = await fetch('/api/entries', {
  method: 'POST',
  body: JSON.stringify(entryData)
});

const data = await response.json();

// Show toast for each unlocked achievement
data.unlockedAchievements?.forEach(achievement => {
  toast.success(
    `🏆 ${achievement.name} (+${achievement.points} points)`,
    { duration: 5000 }
  );
});
```

### Pattern 2: Batch Achievement Display

```javascript
// Show single notification for multiple achievements
if (data.unlockedAchievements?.length > 1) {
  const totalPoints = data.unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  toast.success(
    `🏆 You unlocked ${data.unlockedAchievements.length} achievements! (+${totalPoints} points)`,
    { duration: 7000 }
  );
} else if (data.unlockedAchievements?.length === 1) {
  const ach = data.unlockedAchievements[0];
  toast.success(`🏆 ${ach.name} (+${ach.points} points)`);
}
```

### Pattern 3: Achievement Modal

```javascript
// Show detailed modal for unlocked achievements
if (data.unlockedAchievements?.length > 0) {
  openAchievementModal({
    achievements: data.unlockedAchievements,
    onClose: () => router.refresh() // Refresh to show updated points
  });
}
```

---

## Troubleshooting

### Issue: `unlockedAchievements` is undefined

**Cause**: Achievement evaluation failed silently

**Solution**: Check console logs for error messages starting with "Achievement evaluation failed"

**Debug**:
```javascript
// In API handler, add more detailed logging
console.log('Starting achievement evaluation for user:', session.user.id);
const result = await AchievementService.evaluateAndUnlock(...);
console.log('Achievement result:', result);
```

---

### Issue: Achievement unlocked but not in response

**Cause**: Achievement evaluation succeeded but result not spread into response

**Solution**: Verify response construction:
```javascript
// Correct:
return createdResponse({
  ...entry.toObject(),
  unlockedAchievements  // Must be spread
});

// Incorrect:
return createdResponse(entry.toObject());  // Missing unlockedAchievements
```

---

### Issue: Entry creation fails after adding achievement code

**Cause**: Achievement evaluation error not caught properly

**Solution**: Ensure try/catch wraps achievement code:
```javascript
// Correct pattern:
await entry.save(); // OUTSIDE try/catch

let unlockedAchievements = [];
try {
  const result = await AchievementService.evaluateAndUnlock(...);
  unlockedAchievements = result.unlockedAchievements || [];
} catch (error) {
  // Log but don't throw
  console.error('Achievement evaluation failed:', error.message);
}

return createdResponse({ ...entry.toObject(), unlockedAchievements });
```

---

### Issue: Tests fail with "AchievementService is not defined"

**Cause**: Import missing in test setup

**Solution**: Mock or import service:
```javascript
// Option 1: Mock
jest.mock('@/lib/services/AchievementService', () => ({
  evaluateAndUnlock: jest.fn().mockResolvedValue({ unlockedAchievements: [] })
}));

// Option 2: Use real service (integration test)
import AchievementService from '@/lib/services/AchievementService';
// Ensure test database has achievement data
```

---

## Performance Tips

1. **Cache Achievement Definitions**: AchievementService already caches active achievements for 1 hour (Feature 031)
2. **Monitor Response Times**: Use Vercel Analytics to track `/api/entries` latency
3. **Grep Production Logs**: Search for `🏆` to monitor unlock frequency and identify performance issues
4. **Alert on Errors**: Monitor logs for "Achievement evaluation failed" pattern to catch database issues

---

## Next Steps

After completing this feature:

1. **Frontend Integration**: Wire `unlockedAchievements` to toast notifications (Feature 021)
2. **Achievement Detail Modal**: Create UI to display achievement details when unlocked
3. **User Dashboard**: Show recently unlocked achievements on dashboard
4. **Analytics**: Track which achievements are most frequently unlocked

---

## References

- **Feature 031**: AchievementService implementation and tests
- **Feature 001**: Original Entry API implementation
- **Feature 021**: Toast notification system (for frontend integration)
- **API Contracts**: See `contracts/post-api-entries.md` and `contracts/put-api-entries-id.md`
