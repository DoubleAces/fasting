# API Endpoint Modifications

**Feature**: 031 - Achievement Unlock Logic  
**Endpoints Modified**: POST /api/entries, PUT /api/entries/[id]  
**Location**: `src/app/api/entries/route.js`

---

## POST /api/entries

**Purpose**: Create new fasting entry and evaluate achievements

### Request

**Method**: POST  
**Path**: `/api/entries`  
**Authentication**: Required (NextAuth session)  
**Content-Type**: `application/json`

**Body Schema**:
```json
{
  "firstMeal": "2025-11-06T08:00:00Z",
  "lastMeal": "2025-11-05T20:00:00Z",
  "fastingDuration": 720,
  "goalStatus": "completed",
  "morningWeight": 195,
  "energyLevel": 4,
  "wellBeing": 5,
  "foodNotes": "Eggs and avocado for breakfast"
}
```

### Response

**Success (200 OK)**:
```json
{
  "entry": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "firstMeal": "2025-11-06T08:00:00Z",
    "lastMeal": "2025-11-05T20:00:00Z",
    "fastingDuration": 720,
    "date": "2025-11-06T00:00:00Z",
    "goalStatus": "completed",
    "morningWeight": 195,
    "energyLevel": 4,
    "wellBeing": 5,
    "foodNotes": "Eggs and avocado for breakfast",
    "createdAt": "2025-11-06T08:05:00Z",
    "updatedAt": "2025-11-06T08:05:00Z"
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

**Achievement Evaluation Failed (200 OK - Entry Still Saved)**:
```json
{
  "entry": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    // ...entry fields
  },
  "unlockedAchievements": [],
  "totalPointsEarned": 0
}
```

**Entry Save Failed (500 Internal Server Error)**:
```json
{
  "error": "Failed to save entry",
  "details": "Duplicate entry for date"
}
```

**Unauthorized (401)**:
```json
{
  "error": "Unauthorized - Please sign in"
}
```

### Implementation Changes

**Before** (existing code):
```javascript
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const entryData = await request.json();
    
    const entry = await Entry.create({
      ...entryData,
      userId
    });
    
    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
```

**After** (with achievement integration):
```javascript
import AchievementService from '@/lib/services/AchievementService';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const entryData = await request.json();
    
    const entry = await Entry.create({
      ...entryData,
      userId
    });
    
    // NEW: Evaluate achievements (non-blocking)
    let unlockedAchievements = [];
    let totalPointsEarned = 0;
    
    try {
      const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
      unlockedAchievements = result.unlockedAchievements;
      totalPointsEarned = result.totalPointsEarned;
    } catch (achievementError) {
      // Log error but don't block entry save
      logger.error('Achievement evaluation failed', {
        userId,
        entryId: entry._id,
        error: achievementError.message,
        stack: achievementError.stack
      });
      // Continue with empty achievements array
    }
    
    return NextResponse.json({
      entry,
      unlockedAchievements,
      totalPointsEarned
    });
  } catch (error) {
    logger.error('Entry save failed', { userId, error: error.message });
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
```

---

## PUT /api/entries/[id]

**Purpose**: Update existing fasting entry and re-evaluate achievements

### Request

**Method**: PUT  
**Path**: `/api/entries/[id]`  
**Authentication**: Required (NextAuth session)  
**Content-Type**: `application/json`

**Path Parameters**:
- `id`: Entry MongoDB ObjectId (string)

**Body Schema** (partial updates allowed):
```json
{
  "firstMeal": "2025-11-06T08:00:00Z",
  "lastMeal": "2025-11-05T20:00:00Z",
  "fastingDuration": 1440,
  "goalStatus": "completed",
  "morningWeight": 194
}
```

### Response

**Success (200 OK)**:
```json
{
  "entry": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "firstMeal": "2025-11-06T08:00:00Z",
    "lastMeal": "2025-11-05T20:00:00Z",
    "fastingDuration": 1440,
    "date": "2025-11-06T00:00:00Z",
    "goalStatus": "completed",
    "morningWeight": 194,
    "createdAt": "2025-11-06T08:05:00Z",
    "updatedAt": "2025-11-06T10:30:00Z"
  },
  "unlockedAchievements": [
    {
      "achievementId": "first-twentyfour",
      "name": {
        "en": "24-Hour Warrior",
        "es": "Guerrero de 24 Horas"
      },
      "description": {
        "en": "Complete your first 24-hour fast",
        "es": "Completa tu primer ayuno de 24 horas"
      },
      "points": 25,
      "rarity": "rare",
      "icon": "⚔️",
      "category": "duration"
    }
  ],
  "totalPointsEarned": 25
}
```

**Entry Not Found (404)**:
```json
{
  "error": "Entry not found"
}
```

**Forbidden (403) - Entry belongs to different user**:
```json
{
  "error": "Forbidden - Cannot modify another user's entry"
}
```

### Implementation Changes

**Before** (existing code):
```javascript
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const userId = session.user.id;
    const updateData = await request.json();
    
    // Verify ownership
    const existingEntry = await Entry.findById(id);
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    if (existingEntry.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const entry = await Entry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
```

**After** (with achievement integration):
```javascript
import AchievementService from '@/lib/services/AchievementService';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const userId = session.user.id;
    const updateData = await request.json();
    
    // Verify ownership
    const existingEntry = await Entry.findById(id);
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    if (existingEntry.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const entry = await Entry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // NEW: Re-evaluate achievements (non-blocking)
    let unlockedAchievements = [];
    let totalPointsEarned = 0;
    
    try {
      const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
      unlockedAchievements = result.unlockedAchievements;
      totalPointsEarned = result.totalPointsEarned;
    } catch (achievementError) {
      // Log error but don't block entry update
      logger.error('Achievement evaluation failed', {
        userId,
        entryId: entry._id,
        error: achievementError.message,
        stack: achievementError.stack
      });
      // Continue with empty achievements array
    }
    
    return NextResponse.json({
      entry,
      unlockedAchievements,
      totalPointsEarned
    });
  } catch (error) {
    logger.error('Entry update failed', { userId, entryId: id, error: error.message });
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
```

---

## Backward Compatibility

### Frontend Compatibility
**Existing clients** that don't handle `unlockedAchievements` field:
- ✅ **Compatible** - Field is additive, not breaking
- ✅ Existing code can ignore the field
- ✅ Entry save/update still works identically

**Updated clients** that handle achievements:
```javascript
// After entry save/update
const response = await fetch('/api/entries', {
  method: 'POST',
  body: JSON.stringify(entryData)
});

const result = await response.json();

// New: Handle achievements
if (result.unlockedAchievements?.length > 0) {
  const count = result.unlockedAchievements.length;
  const points = result.totalPointsEarned;
  
  if (count === 1) {
    const achievement = result.unlockedAchievements[0];
    showToast(`🎉 Achievement Unlocked: ${achievement.name.en} (+${points} points)`, 'success');
  } else {
    showToast(`🎉 You unlocked ${count} achievements! (+${points} points)`, 'success');
  }
}
```

---

## Performance Impact

### Latency Analysis

**Before** (without achievements):
- Entry save: ~50-100ms
- Total response time: ~50-100ms

**After** (with achievements):
- Entry save: ~50-100ms (unchanged)
- Achievement evaluation: ~100-150ms (target <200ms)
- Total response time: ~150-250ms

**Acceptable because**:
- Entry save not blocked (happens first)
- User perceives entry save as complete
- Achievement notification is delightful surprise
- < 250ms still feels instant to users

### Database Load

**Additional queries per entry save**:
1. Achievement cache lookup (1st call only, then cached 1h): +1 query
2. Streak calculation: +1 query (limit 100 entries)
3. Entry count: +1 query
4. Goal count: +1 query
5. Weight query: +1 query
6. UserAchievement creates: +k queries (k = unlocked, typically 1-3)

**Total**: ~6-9 additional queries per entry save

**Mitigation**:
- Achievement cache reduces to ~5-8 queries after 1st call
- Queries are indexed and fast (<20ms each)
- No N+1 patterns
- Acceptable overhead for gamification value

---

## Monitoring & Observability

### Metrics to Track
- `achievement_evaluation_duration_ms` - Histogram
- `achievement_unlock_count` - Counter (by achievementId)
- `achievement_evaluation_errors` - Counter (by error type)
- `achievement_cache_hits` - Counter
- `achievement_cache_misses` - Counter

### Logs to Review
```javascript
// Info: Successful unlock
logger.info('Achievements unlocked', {
  userId,
  entryId,
  achievementIds: ['first-twelve', 'ten-entries-logged'],
  totalPoints: 35,
  duration: 120  // ms
});

// Warn: Missing data
logger.warn('Cannot evaluate weight achievements - no starting weight', {
  userId,
  entryId
});

// Error: Evaluation failed
logger.error('Achievement evaluation failed', {
  userId,
  entryId,
  phase: 'streak-evaluation',
  error: error.message,
  stack: error.stack
});
```

---

## Testing Strategy

### API Integration Tests

```javascript
describe('POST /api/entries with achievements', () => {
  it('should unlock duration achievement for 12-hour fast', async () => {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
      body: JSON.stringify({
        firstMeal: '2025-11-06T08:00:00Z',
        lastMeal: '2025-11-05T20:00:00Z',
        fastingDuration: 720
      })
    });
    
    const result = await response.json();
    
    expect(response.status).toBe(200);
    expect(result.entry).toBeDefined();
    expect(result.unlockedAchievements).toHaveLength(1);
    expect(result.unlockedAchievements[0].achievementId).toBe('first-twelve');
    expect(result.totalPointsEarned).toBe(10);
  });
  
  it('should save entry even if achievement evaluation fails', async () => {
    // Mock AchievementService to throw error
    jest.spyOn(AchievementService, 'evaluateAndUnlock').mockRejectedValue(new Error('DB error'));
    
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Cookie': sessionCookie },
      body: JSON.stringify({ /* entry data */ })
    });
    
    const result = await response.json();
    
    expect(response.status).toBe(200);
    expect(result.entry).toBeDefined();
    expect(result.unlockedAchievements).toEqual([]);
    expect(result.totalPointsEarned).toBe(0);
  });
});

describe('PUT /api/entries/[id] with achievements', () => {
  it('should unlock new achievement when duration increased', async () => {
    const entryId = await createTestEntry({ fastingDuration: 720 }); // 12h
    
    const response = await fetch(`/api/entries/${entryId}`, {
      method: 'PUT',
      headers: { 'Cookie': sessionCookie },
      body: JSON.stringify({ fastingDuration: 1440 }) // Update to 24h
    });
    
    const result = await response.json();
    
    expect(result.unlockedAchievements).toContainEqual(
      expect.objectContaining({ achievementId: 'first-twentyfour' })
    );
  });
});
```

---

## Rollout Plan

### Phase 1: Deployment
1. Deploy AchievementService code
2. Deploy API endpoint modifications
3. Monitor logs for errors
4. Verify achievements unlocking correctly

### Phase 2: Frontend Update (Optional)
1. Update frontend to handle `unlockedAchievements` field
2. Show toast notifications
3. A/B test notification styles

### Phase 3: Monitoring
1. Track evaluation latency
2. Monitor error rates
3. Check user engagement with achievements

---

## Contract Version

**v1.0.0** (November 6, 2025)
- Initial API modification contract
- POST /api/entries integration
- PUT /api/entries/[id] integration
- Non-blocking error handling
- Backward compatible response format
