# Quickstart Guide: Achievement API Endpoints

**Feature**: 029-achievement-api-endpoints  
**Date**: November 4, 2025  
**For**: Developers implementing or testing the Achievement API

## Overview

This guide provides quick examples for using the Achievement API endpoints, testing them, and integrating the event-driven evaluation service.

---

## Prerequisites

1. **Feature 028 Complete**: Achievement, UserAchievement, User models exist in `src/lib/models/`
2. **Database Setup**: MongoDB with seeded achievements (see [Seeding Test Data](#seeding-test-data))
3. **Authentication**: NextAuth configured with test users (regular + admin)
4. **Environment**: Development server running (`npm run dev`)

---

## API Endpoint Examples

### 1. Browse Achievements (Authenticated)

**Request**:
```bash
curl http://localhost:3000/api/achievements \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**With Filters**:
```bash
curl "http://localhost:3000/api/achievements?category=duration&page=1&limit=10&sort=points" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "achievementId": "sweet-sixteen",
        "name": "Sweet Sixteen",
        "description": "Complete your first 16-hour fast",
        "shortDescription": "First 16hr fast",
        "icon": "🎯",
        "iconColor": "#4F46E5",
        "category": "duration",
        "points": 10,
        "rarity": "common",
        "order": 1,
        "criteria": {
          "type": "duration-milestone",
          "params": { "hours": 16 }
        },
        "isSecret": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 85,
      "totalPages": 9,
      "hasMore": true
    }
  }
}
```

---

### 2. Get Single Achievement Details

**Request**:
```bash
curl http://localhost:3000/api/achievements/sweet-sixteen \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "achievementId": "sweet-sixteen",
    "translations": {
      "en": {
        "name": "Sweet Sixteen",
        "description": "Complete your first 16-hour fast...",
        "shortDescription": "First 16hr fast"
      },
      "es": {
        "name": "Dulce Dieciséis",
        "description": "Completa tu primer ayuno de 16 horas...",
        "shortDescription": "Primer ayuno de 16h"
      }
    },
    "badgeImage": {
      "locked": "https://example.com/badge-locked.png",
      "unlocked": "https://example.com/badge-unlocked.png"
    },
    "icon": "🎯",
    "iconColor": "#4F46E5",
    "category": "duration",
    "points": 10,
    "rarity": "common",
    "order": 1,
    "criteria": {
      "type": "duration-milestone",
      "params": { "hours": 16 }
    },
    "isActive": true,
    "isSecret": false
  }
}
```

---

### 3. Get User's Unlocked Achievements

**Request**:
```bash
curl http://localhost:3000/api/user/achievements \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "achievements": [
      {
        "_id": "673abc123def456789",
        "achievementId": "sweet-sixteen",
        "achievement": {
          "name": "Sweet Sixteen",
          "description": "Complete your first 16-hour fast",
          "icon": "🎯",
          "iconColor": "#4F46E5",
          "category": "duration",
          "points": 10,
          "rarity": "common"
        },
        "unlockedAt": "2025-11-03T15:30:00.000Z",
        "progress": 100,
        "notificationSeen": false
      }
    ],
    "summary": {
      "totalPoints": 150,
      "totalUnlocked": 5,
      "totalAchievements": 85,
      "completionPercentage": 5.88,
      "unseenCount": 2
    }
  }
}
```

---

### 4. Manual Achievement Unlock (Admin Only)

**Request**:
```bash
curl -X POST http://localhost:3000/api/achievements/unlock \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "achievementId": "sweet-sixteen"
  }'
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "userAchievement": {
      "_id": "673abc999def111222",
      "userId": "507f1f77bcf86cd799439011",
      "achievementId": "sweet-sixteen",
      "unlockedAt": "2025-11-04T12:00:00.000Z",
      "progress": 100,
      "notificationSeen": false
    },
    "user": {
      "achievementPoints": 160,
      "pointsAdded": 10
    },
    "achievement": {
      "name": "Sweet Sixteen",
      "points": 10,
      "rarity": "common"
    }
  }
}
```

---

### 5. Create New Achievement (Admin Only)

**Request**:
```bash
curl -X POST http://localhost:3000/api/admin/achievements \
  -H "Cookie: next-auth.session-token=ADMIN_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "achievementId": "marathon-master",
    "translations": {
      "en": {
        "name": "Marathon Master",
        "description": "Complete 30 consecutive days of fasting",
        "shortDescription": "30-day streak"
      }
    },
    "icon": "🏃",
    "iconColor": "#EF4444",
    "category": "streak",
    "points": 100,
    "rarity": "epic",
    "order": 50,
    "criteria": {
      "type": "streak",
      "params": { "days": 30 }
    },
    "isActive": true,
    "isSecret": false
  }'
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "_id": "673abc777def333444",
    "achievementId": "marathon-master",
    "translations": { /* ... */ },
    "icon": "🏃",
    "iconColor": "#EF4444",
    "category": "streak",
    "points": 100,
    "rarity": "epic",
    "order": 50,
    "criteria": {
      "type": "streak",
      "params": { "days": 30 }
    },
    "isActive": true,
    "isSecret": false,
    "createdBy": "adminUserId",
    "createdAt": "2025-11-04T12:00:00.000Z",
    "updatedAt": "2025-11-04T12:00:00.000Z"
  }
}
```

---

## Event-Driven Evaluation Service

### Integration with Entry Mutations

**File**: `src/app/api/entries/route.js` (POST handler)

```javascript
import { evaluateAchievements } from '@/lib/services/achievementEvaluator';

export const POST = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();
  
  const data = await request.json();
  
  // Create entry (existing logic)
  const entry = await Entry.create({
    userId: session.user.id,
    ...data
  });
  
  // Trigger achievement evaluation (non-blocking)
  try {
    const result = await evaluateAchievements(session.user.id);
    console.log(`Evaluated achievements for user ${session.user.id}:`, result);
  } catch (error) {
    console.error('Achievement evaluation failed:', error);
    // Don't block entry creation if evaluation fails
  }
  
  return okResponse(entry, 201);
});
```

### Standalone Evaluation Call

```javascript
import { evaluateAchievements } from '@/lib/services/achievementEvaluator';

// Evaluate achievements for specific user
const result = await evaluateAchievements('507f1f77bcf86cd799439011');

console.log('Newly unlocked achievements:', result.unlockedAchievements);
console.log('Total points added:', result.totalPointsAdded);
console.log('Errors:', result.errors);
```

---

## Testing Guide

### Unit Tests (Achievement Evaluator)

**File**: `tests/unit/services/achievementEvaluator.test.js`

```javascript
import { evaluateAchievements, evaluateCriteria } from '@/lib/services/achievementEvaluator';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import Entry from '@/lib/models/Entry';
import User from '@/lib/models/User';

// Mock database models
jest.mock('@/lib/models/Achievement');
jest.mock('@/lib/models/UserAchievement');
jest.mock('@/lib/models/Entry');
jest.mock('@/lib/models/User');

describe('Achievement Evaluator', () => {
  describe('evaluateDurationMilestone', () => {
    it('should return true when user has entry meeting duration', async () => {
      Entry.findOne.mockResolvedValue({
        userId: 'user123',
        fastingDuration: 960  // 16 hours
      });
      
      const result = await evaluateCriteria(
        { type: 'duration-milestone', params: { hours: 16 } },
        'user123'
      );
      
      expect(result).toBe(true);
    });
    
    it('should return false when no entry meets duration', async () => {
      Entry.findOne.mockResolvedValue(null);
      
      const result = await evaluateCriteria(
        { type: 'duration-milestone', params: { hours: 16 } },
        'user123'
      );
      
      expect(result).toBe(false);
    });
  });
  
  describe('evaluateAchievements', () => {
    it('should unlock achievement when criteria met', async () => {
      Achievement.find.mockResolvedValue([
        {
          achievementId: 'test-achievement',
          criteria: { type: 'entry-count', params: { count: 3 } },
          points: 10
        }
      ]);
      
      UserAchievement.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue([])
      });
      
      Entry.countDocuments.mockResolvedValue(5);
      
      UserAchievement.create.mockResolvedValue({
        userId: 'user123',
        achievementId: 'test-achievement'
      });
      
      User.findByIdAndUpdate.mockResolvedValue({
        achievementPoints: 10
      });
      
      const result = await evaluateAchievements('user123');
      
      expect(result.success).toBe(true);
      expect(result.unlockedAchievements).toHaveLength(1);
      expect(result.totalPointsAdded).toBe(10);
    });
  });
});
```

### Integration Tests (API Routes)

**File**: `tests/integration/api/achievements-list.test.js`

```javascript
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/achievements/route';
import Achievement from '@/lib/models/Achievement';
import { connectDB, closeDB, clearDB } from '@/tests/helpers/db';

// Mock NextAuth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

import { auth } from '@/lib/auth';

describe('GET /api/achievements', () => {
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    await closeDB();
  });
  
  beforeEach(async () => {
    await clearDB();
    
    // Seed test achievements
    await Achievement.create([
      {
        achievementId: 'test-1',
        translations: {
          en: { name: 'Test 1', description: 'Test', shortDescription: 'T1' }
        },
        category: 'duration',
        points: 10,
        rarity: 'common',
        order: 1,
        criteria: { type: 'test', params: {} },
        isActive: true
      },
      {
        achievementId: 'test-2',
        translations: {
          en: { name: 'Test 2', description: 'Test', shortDescription: 'T2' }
        },
        category: 'streak',
        points: 20,
        rarity: 'rare',
        order: 2,
        criteria: { type: 'test', params: {} },
        isActive: true
      }
    ]);
  });
  
  it('should return 401 if not authenticated', async () => {
    auth.mockResolvedValue(null);
    
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.status).toBe('error');
  });
  
  it('should return all achievements when authenticated', async () => {
    auth.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    });
    
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data.achievements).toHaveLength(2);
    expect(data.data.pagination.total).toBe(2);
  });
  
  it('should filter by category', async () => {
    auth.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' }
    });
    
    const { req } = createMocks({
      method: 'GET',
      query: { category: 'duration' }
    });
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data.achievements).toHaveLength(1);
    expect(data.data.achievements[0].category).toBe('duration');
  });
});
```

### E2E Tests (Playwright)

**File**: `tests/e2e/achievements/browse-achievements.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Browse Achievements', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should display achievements list', async ({ page }) => {
    await page.goto('/achievements');
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('Achievements');
    
    // Check achievements render
    const achievements = page.locator('[data-testid="achievement-card"]');
    await expect(achievements).toHaveCount(await achievements.count());
  });
  
  test('should filter achievements by category', async ({ page }) => {
    await page.goto('/achievements');
    
    // Select duration category
    await page.click('[data-testid="category-filter"]');
    await page.click('text=Duration');
    
    // Check filtered results
    const achievements = page.locator('[data-testid="achievement-card"]');
    await expect(achievements.first()).toContainText('Sweet Sixteen');
  });
  
  test('should show achievement details on click', async ({ page }) => {
    await page.goto('/achievements');
    
    // Click first achievement
    await page.click('[data-testid="achievement-card"]:first-child');
    
    // Check modal/detail view
    await expect(page.locator('[data-testid="achievement-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-description"]')).toBeVisible();
  });
});
```

---

## Seeding Test Data

### Create Seed Script

**File**: `scripts/seed-achievements.js`

```javascript
import Achievement from '../src/lib/models/Achievement.js';
import { connectDB } from '../src/lib/mongodb.js';

const achievements = [
  {
    achievementId: 'sweet-sixteen',
    translations: {
      en: {
        name: 'Sweet Sixteen',
        description: 'Complete your first 16-hour fast',
        shortDescription: 'First 16hr fast'
      },
      es: {
        name: 'Dulce Dieciséis',
        description: 'Completa tu primer ayuno de 16 horas',
        shortDescription: 'Primer ayuno de 16h'
      }
    },
    icon: '🎯',
    iconColor: '#4F46E5',
    category: 'duration',
    points: 10,
    rarity: 'common',
    order: 1,
    criteria: { type: 'duration-milestone', params: { hours: 16 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'getting-started',
    translations: {
      en: {
        name: 'Getting Started',
        description: 'Complete your first 3 fasting entries',
        shortDescription: '3 entries'
      }
    },
    icon: '🌱',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 5,
    rarity: 'common',
    order: 0,
    criteria: { type: 'entry-count', params: { count: 3 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'week-warrior',
    translations: {
      en: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day fasting streak',
        shortDescription: '7-day streak'
      }
    },
    icon: '🔥',
    iconColor: '#F59E0B',
    category: 'streak',
    points: 25,
    rarity: 'rare',
    order: 10,
    criteria: { type: 'streak', params: { days: 7 } },
    isActive: true,
    isSecret: false
  }
];

async function seed() {
  await connectDB();
  
  console.log('Clearing existing achievements...');
  await Achievement.deleteMany({});
  
  console.log('Seeding achievements...');
  await Achievement.insertMany(achievements);
  
  console.log(`✅ Seeded ${achievements.length} achievements`);
  process.exit(0);
}

seed().catch(console.error);
```

**Run**:
```bash
node scripts/seed-achievements.js
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**403 Forbidden** (Non-admin accessing admin route):
```json
{
  "status": "error",
  "message": "Admin access required"
}
```

**404 Not Found**:
```json
{
  "status": "error",
  "message": "Achievement not found"
}
```

**409 Conflict** (Duplicate unlock):
```json
{
  "status": "error",
  "message": "Achievement already unlocked"
}
```

**400 Bad Request** (Validation error):
```json
{
  "status": "error",
  "message": "Invalid category. Must be one of: getting-started, duration, streak, goal, weight, consistency, special, knowledge"
}
```

---

## Performance Benchmarks

### Expected Response Times (Success Criteria)

| Endpoint | Target | Measured |
|----------|--------|----------|
| GET `/api/achievements` (100 items) | <200ms | _TBD_ |
| GET `/api/achievements?category=X` | <150ms | _TBD_ |
| GET `/api/achievements/[id]` | <100ms | _TBD_ |
| GET `/api/user/achievements` | <200ms | _TBD_ |
| POST `/api/achievements/unlock` | <300ms | _TBD_ |
| POST `/api/admin/achievements` | <250ms | _TBD_ |
| `evaluateAchievements(userId)` | <500ms | _TBD_ |

**Note**: Fill in "Measured" column during implementation testing.

---

## Troubleshooting

### Issue: 401 Unauthorized even when logged in

**Solution**: Check session cookie name matches NextAuth configuration. Default is `next-auth.session-token` but may differ if custom configuration.

### Issue: Evaluation not triggering after entry creation

**Solution**: Verify `evaluateAchievements()` is called in entry POST/PUT handlers. Check console logs for evaluation errors.

### Issue: Achievement already unlocked error when it shouldn't be

**Solution**: Check for duplicate UserAchievement documents. MongoDB unique index should prevent this, but verify index exists: `db.userachievements.getIndexes()`

### Issue: Secret achievements not masking properly

**Solution**: Verify user hasn't unlocked the achievement. Check `isSecret` field in achievement document.

---

## Next Steps

1. ✅ Review this quickstart guide
2. ⏭️ Implement API route handlers (Phase 2)
3. ⏭️ Implement evaluation service (Phase 2)
4. ⏭️ Write tests (TDD - before implementation)
5. ⏭️ Integration testing with Postman/curl
6. ⏭️ E2E testing with Playwright
7. ⏭️ Performance testing and optimization

**Ready to proceed to `/speckit.tasks` for detailed task breakdown!**
