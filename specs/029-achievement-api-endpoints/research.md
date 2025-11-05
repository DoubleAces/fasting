# Research: Achievement API Endpoints

**Feature**: 029-achievement-api-endpoints  
**Date**: November 4, 2025  
**Phase**: 0 - Research & Best Practices

## Overview

This document consolidates research findings for implementing 6 REST API endpoints and an event-driven achievement evaluation service. Research focuses on Next.js API route patterns, authentication strategies, event-driven architecture for achievement unlocks, and performance optimization techniques.

---

## Research Area 1: Next.js API Route Patterns

### Decision: Use App Router API Routes with Edge Runtime Compatibility

**Rationale**: 
- Project already uses Next.js 15.x App Router (evident from `src/app/api/entries/[id]/route.js`)
- Existing codebase has established patterns with `withErrorHandler` wrapper and response helpers
- Edge Runtime compatibility required for Vercel deployment and optimal performance
- File-based routing provides clear endpoint organization

**Best Practices Applied**:
1. **Export named HTTP method functions** (GET, POST, PUT, DELETE) from `route.js` files
2. **Wrap all handlers with `withErrorHandler`** for consistent error handling
3. **Use response helpers** (`okResponse`, `unauthorizedResponse`, `forbiddenResponse`, `notFoundResponse`, `errorResponse`) for standard JSON format
4. **Validate authentication via `auth()` function** from `@/lib/auth` at the start of each handler
5. **Edge Runtime compatible**: Use `getToken()` instead of `getServerSession()` in middleware contexts

**Example Pattern** (from existing `src/app/api/entries/[id]/route.js`):
```javascript
import { auth } from '@/lib/auth';
import { withErrorHandler } from '@/lib/api-helpers';
import { okResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-helpers';

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user?.id) return unauthorizedResponse();
  
  // Handler logic
  
  return okResponse(data);
});
```

**Alternatives Considered**:
- **Pages Router API routes**: Rejected - project uses App Router
- **Server Actions**: Rejected - REST API needed for potential future mobile app integration
- **GraphQL**: Rejected - REST simpler for CRUD operations, no complex query requirements

---

## Research Area 2: Authentication & Authorization

### Decision: NextAuth Session with Role-Based Access Control

**Rationale**:
- Project uses NextAuth (Auth.js) with session-based authentication
- Session includes `user.id`, `user.email`, and `user.isAdmin` fields (confirmed from existing middleware)
- Admin routes require `isAdmin` flag check for authorization
- All achievement endpoints require authentication (member-only feature per clarification)

**Best Practices Applied**:
1. **Session validation**: Call `await auth()` at start of every endpoint
2. **Return 401 for missing session**: `if (!session?.user?.id) return unauthorizedResponse();`
3. **Admin check for privileged routes**: `if (!session.user.isAdmin) return forbiddenResponse();`
4. **User isolation**: Compare `userId` from database records with `session.user.id`
5. **Edge Runtime compatible**: Use `getToken()` from `next-auth/jwt` in middleware (not in route handlers)

**Security Measures**:
- Session tokens verified server-side on every request
- No client-side user role spoofing possible
- MongoDB unique indexes prevent duplicate unlocks
- Secret achievements masked until user unlocks them
- Generic error messages (no information leakage)

**Alternatives Considered**:
- **JWT tokens in headers**: Rejected - session-based auth already implemented
- **API keys**: Rejected - user-specific authentication needed
- **OAuth only (no sessions)**: Rejected - server-side sessions provide better security for sensitive data

---

## Research Area 3: Event-Driven Achievement Evaluation

### Decision: Hook-Based Evaluation on Entry Mutations

**Rationale**:
- Clarification confirmed: Trigger evaluation on entry creation/update events (not cron/batch)
- Provides immediate feedback when users complete activities
- Most efficient approach - evaluates only triggering user
- Aligns with event-driven architecture best practices

**Implementation Strategy**:
1. **Create `achievementEvaluator.js` service** in `src/lib/services/`
2. **Export `evaluateAchievements(userId)` function** that:
   - Fetches all active achievements from database
   - Checks user's Entry records against achievement criteria
   - Detects newly met criteria (not already unlocked)
   - Creates UserAchievement records for new unlocks
   - Increments user's achievementPoints atomically
3. **Call evaluator from entry mutation hooks**:
   - After successful entry creation (POST `/api/entries`)
   - After successful entry update (PUT `/api/entries/[id]`)
   - Handle evaluation errors gracefully (log but don't block entry save)

**Evaluation Logic by Criteria Type**:
- **duration-milestone**: Query Entry for triggering user, calculate `fastingDuration` from `firstMealTime` and `lastMealTime`, check if meets or exceeds `params.hours`
- **streak**: Count consecutive days with Entry records, compare to `params.days`
- **entry-count**: Count total Entry records for user, compare to `params.count`
- **Future extensibility**: Criteria type string allows new types without schema changes

**Performance Optimization**:
- Fetch achievements once, cache in memory for request duration
- Query only triggering user's UserAchievements (not all users)
- Use MongoDB `$nin` operator to filter already unlocked achievements
- Batch create UserAchievement records if multiple criteria met
- Use atomic `$inc` for user points update

**Alternatives Considered**:
- **Cron job (hourly/daily)**: Rejected - delayed feedback, processes users with no activity
- **Queue-based (Redis/BullMQ)**: Rejected - adds infrastructure complexity, overkill for current scale
- **Real-time WebSocket push**: Deferred to future phase (clarification confirmed fetch-only for now)

---

## Research Area 4: Database Query Patterns

### Decision: Mongoose with Compound Indexes and Aggregation

**Rationale**:
- Project uses Mongoose ODM (confirmed from Feature 028 models)
- Compound indexes already defined for optimal query performance
- Aggregation pipelines enable complex queries (e.g., joining UserAchievement with Achievement details)

**Query Patterns**:

**1. GET `/api/achievements` (List with Filters)**
```javascript
Achievement.find({
  isActive: true,
  ...(category && { category }), // Optional filter
  ...(isSecret && { isSecret: false }) // Hide secrets for anonymous browsing (if allowed)
})
.sort(sortMap[sort] || { order: 1 }) // Default sort by order field
.skip((page - 1) * limit)
.limit(limit)
.lean(); // Plain JavaScript objects (no Mongoose document overhead)
```

**2. GET `/api/user/achievements` (User's Unlocks with Details)**
```javascript
UserAchievement.find({ userId: session.user.id })
.sort({ unlockedAt: -1 })
.populate('achievementId') // If using ObjectId reference
// OR manual join if using string achievementId
.lean();
```

**3. Achievement Evaluation (Check Criteria)**
```javascript
// Get achievements user hasn't unlocked yet
const unlockedIds = await UserAchievement.find({ userId }).distinct('achievementId');
const achievements = await Achievement.find({
  isActive: true,
  achievementId: { $nin: unlockedIds }
}).lean();

// Evaluate each achievement's criteria against user data
for (const achievement of achievements) {
  const meets = await evaluateCriteria(achievement.criteria, userId);
  if (meets) {
    await unlockAchievement(userId, achievement.achievementId, achievement.points);
  }
}
```

**Index Usage**:
- Achievement: `{ isActive: 1, category: 1 }` for filtered lists
- Achievement: `{ achievementId: 1 }` unique for lookups
- UserAchievement: `{ userId: 1, achievementId: 1 }` unique compound for duplicate prevention
- UserAchievement: `{ userId: 1, unlockedAt: -1 }` for recent unlocks query

**Alternatives Considered**:
- **Raw MongoDB queries**: Rejected - Mongoose provides schema validation and cleaner syntax
- **GraphQL with DataLoader**: Rejected - REST sufficient for current needs
- **Separate microservice**: Rejected - monolithic Next.js app adequate for current scale

---

## Research Area 5: Response Formatting & Error Handling

### Decision: Consistent JSON Response Format with Status Codes

**Rationale**:
- Existing project has `api-helpers.js` with response helper functions
- Consistent response format improves client-side error handling
- HTTP status codes follow REST conventions

**Response Format**:
```javascript
// Success (200, 201)
{
  status: 'success',
  data: { ... }
}

// Error (400, 401, 403, 404, 409, 500)
{
  status: 'error',
  message: 'Human-readable error message',
  code: 'ERROR_CODE' // Optional machine-readable code
}
```

**Status Code Mapping**:
- **200 OK**: Successful GET requests
- **201 Created**: Successful POST requests creating resources
- **400 Bad Request**: Invalid input, validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but insufficient permissions (non-admin accessing admin route)
- **404 Not Found**: Resource doesn't exist (achievement not found, user not found)
- **409 Conflict**: Duplicate operation (achievement already unlocked, achievementId already exists)
- **500 Internal Server Error**: Unexpected server errors (database connection failures, unhandled exceptions)

**Error Handling Strategy**:
1. **Wrap all handlers with `withErrorHandler`**: Catches unhandled exceptions, returns 500
2. **Validate inputs early**: Check required fields, enum values, format constraints
3. **Return specific error responses**: Use appropriate status code and message
4. **Log errors server-side**: Use `console.error()` or logging service (future enhancement)
5. **Don't leak sensitive info**: Generic messages for security errors

**Alternatives Considered**:
- **Problem Details (RFC 7807)**: Rejected - existing project uses simpler format
- **GraphQL-style errors array**: Rejected - not using GraphQL
- **Custom error classes**: Rejected - response helpers sufficient for current complexity

---

## Research Area 6: Pagination & Filtering

### Decision: Query Parameter-Based Pagination with Cursor Support Ready

**Rationale**:
- Simple offset-based pagination adequate for current scale (80+ achievements)
- Query parameters provide flexible filtering
- Cursor-based pagination can be added later if needed (indexes already support it)

**Pagination Parameters**:
- `page`: Page number (default 1, 1-indexed)
- `limit`: Results per page (default 20, max 100)
- **Response includes metadata**:
  ```javascript
  {
    status: 'success',
    data: {
      achievements: [...],
      pagination: {
        page: 1,
        limit: 20,
        total: 85,
        totalPages: 5,
        hasMore: true
      }
    }
  }
  ```

**Filtering Parameters**:
- `category`: Enum value (getting-started, duration, streak, goal, weight, consistency, special, knowledge)
- `sort`: Enum value (order, rarity, points, newest)
- `lang`: Language code for translations (en, es, fr, de, pt, ja, zh)

**Validation**:
- Validate `page` is positive integer
- Validate `limit` is between 1 and 100
- Validate `category` matches enum values
- Validate `sort` matches allowed values
- Return 400 Bad Request for invalid parameters

**Alternatives Considered**:
- **Cursor-based pagination**: Deferred - offset adequate for current scale, indexes support future migration
- **GraphQL with relay-style connections**: Rejected - REST simpler
- **Infinite scroll without pagination**: Rejected - pagination enables bookmarking and direct access to pages

---

## Research Area 7: Testing Strategies

### Decision: Three-Layer Testing Approach (Unit → Integration → E2E)

**Rationale**:
- Constitution mandates TDD with 80% coverage
- Multiple test layers ensure correctness at different granularities
- Existing project uses Jest + React Testing Library + Playwright

**Test Layers**:

**1. Unit Tests** (`tests/unit/services/achievementEvaluator.test.js`)
- Test evaluation logic in isolation
- Mock database calls
- Test criteria checking functions
- Test unlock logic with various scenarios
- Test duplicate prevention logic

**2. Integration Tests** (`tests/integration/api/*.test.js`)
- Test API routes with real database (test DB)
- Test authentication and authorization
- Test database operations (create, read, query)
- Test error responses
- Test pagination and filtering
- Mock NextAuth session

**3. E2E Tests** (`tests/e2e/achievements/*.spec.js`)
- Test complete user flows with Playwright
- Test browsing achievements as authenticated user
- Test automatic unlock when creating entry
- Test admin creating new achievement
- Test UI interactions (future, when frontend exists)

**Test Data Setup**:
- Seed test achievements in beforeEach
- Create test users (regular + admin)
- Clean up test data in afterEach
- Use deterministic test data (not random)

**Alternatives Considered**:
- **Only E2E tests**: Rejected - slow, hard to debug, doesn't meet coverage requirements
- **Only unit tests**: Rejected - doesn't test integration points or real database behavior
- **Contract testing**: Deferred - beneficial for future microservices but overkill for monolith

---

## Research Area 8: Performance Optimization Techniques

### Decision: Multi-Level Caching and Query Optimization

**Rationale**:
- Success criteria require <200ms for list queries, <500ms for evaluation
- Achievement data rarely changes (admin-created)
- User-specific data (unlocks) changes frequently but scoped to individual users

**Optimization Strategies**:

**1. Database Level**
- **Compound indexes**: Already defined in Feature 028
- **Lean queries**: Use `.lean()` to return plain objects (no Mongoose overhead)
- **Projection**: Select only needed fields (`select()` method)
- **Aggregation pipelines**: Efficient joins for user achievements + details

**2. Query Level**
- **Batch operations**: Create multiple UserAchievements in single `insertMany()`
- **Atomic updates**: Use `$inc` for user points (no read-modify-write race)
- **$nin operator**: Filter already unlocked achievements efficiently
- **Limit result sets**: Enforce max pagination limit (100)

**3. Application Level**
- **Request-scoped caching**: Store fetched achievements in variable for evaluation loop
- **Early returns**: Check authentication before database queries
- **Conditional queries**: Only query when filters applied
- **Parallel execution**: Use `Promise.all()` for independent queries (when safe)

**4. Future Enhancements** (Out of Scope for Phase 2)
- **Redis caching**: Cache active achievements list (rarely changes)
- **Edge caching**: Cache public achievement list at CDN (if anonymous access added)
- **Incremental evaluation**: Track last evaluated criteria version (avoid re-checking all)

**Performance Monitoring**:
- Log slow queries (>500ms) for investigation
- Track endpoint response times in production
- Monitor database connection pool utilization
- Set up alerts for p95 latency > targets

**Alternatives Considered**:
- **Materialized views**: Rejected - MongoDB doesn't support, added complexity
- **Full-text search (Elasticsearch)**: Rejected - simple filtering sufficient
- **Separate read replicas**: Deferred - single database adequate for current scale

---

## Summary of Key Decisions

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| API Pattern | Next.js App Router routes with `withErrorHandler` | Follows existing project patterns, Edge Runtime compatible |
| Authentication | NextAuth session with `auth()` validation | Already implemented, secure, session includes `isAdmin` |
| Evaluation Trigger | Event-driven on entry create/update | Immediate feedback, efficient (only triggering user) |
| Database | Mongoose with compound indexes | Existing ODM, indexes optimize queries |
| Response Format | Consistent JSON with status codes | Existing pattern, client-friendly |
| Pagination | Query parameter offset-based | Simple, adequate for scale, cursor-ready indexes |
| Testing | Unit + Integration + E2E | Constitution mandates 80% coverage, multiple layers ensure quality |
| Performance | Database indexes + lean queries + atomic updates | Meets <200ms, <500ms targets |

---

## Open Questions & Future Research

*None remaining - all technical decisions resolved based on existing project patterns and clarifications.*

**Future Enhancements** (Post-MVP):
1. Real-time WebSocket push for unlock notifications (deferred per clarification)
2. Redis caching for achievement list (if scale increases)
3. Advanced criteria types (weight goals, consistency patterns)
4. Achievement recommendation engine (suggest next achievements to pursue)
5. Social features (compare progress with friends, global leaderboards)

---

**Research Phase Complete** - Ready to proceed to Phase 1 (Design & Contracts)
