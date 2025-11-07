# Technical Research: Achievement Unlock API Response

**Feature**: 032-achievement-unlock-response  
**Date**: November 7, 2025  
**Phase**: 0 - Research & Best Practices

## Overview

This feature integrates the existing AchievementService (Feature 031) with Entry API endpoints to automatically return unlocked achievements in the response when users create or update fasting entries. Research focuses on error handling patterns, response format standards, and testing strategies for extending existing API routes.

---

## Research Area 1: Non-Blocking Error Handling Patterns

### Decision: Try/Catch with Graceful Degradation

**Rationale**: 
- Entry creation/update is critical functionality that must never fail due to secondary features (achievements)
- Try/catch blocks isolate achievement evaluation errors from main request flow
- Logging errors provides debugging visibility without exposing internal details to clients
- Empty `unlockedAchievements: []` array provides consistent response structure regardless of success/failure

**Implementation Pattern**:
```javascript
// In POST/PUT handlers after entry.save()
let unlockedAchievements = [];
try {
  const result = await AchievementService.evaluateAndUnlock(userId, entry._id);
  unlockedAchievements = result.unlockedAchievements || [];
  
  if (unlockedAchievements.length > 0) {
    console.log(`🏆 Achievements unlocked: ${unlockedAchievements.map(a => a.achievementId).join(', ')}`);
  }
} catch (error) {
  console.error(`Achievement evaluation failed for entry ${entry._id}:`, error.message);
  // Continue - entry operation succeeded, achievement evaluation optional
}

return createdResponse({ 
  ...entry.toObject(), 
  unlockedAchievements 
});
```

**Alternatives Considered**:
- **Fire-and-forget async**: Rejected - no way to return achievements in response, requires polling
- **Promise.allSettled with entry save**: Rejected - increases entry save latency unnecessarily
- **Separate achievement evaluation endpoint**: Rejected - requires additional API call, delays user feedback

**Best Practices Applied**:
- Console logging with emoji prefix (`🏆`) for visibility in production logs
- Error logging includes context (entryId) for debugging
- Default to empty array (not null/undefined) for consistent client parsing
- No error propagation to client (graceful degradation)

---

## Research Area 2: API Response Format Standards

### Decision: Spread Operator Response Extension

**Rationale**:
- Preserves existing Entry API response structure (`entry.toObject()` pattern)
- Clients expecting only entry fields won't break (backward compatible)
- New `unlockedAchievements` field is additive, not breaking
- Consistent with Next.js API route response patterns using `Response.json()`

**Response Structure**:
```javascript
// POST /api/entries response (201 Created)
{
  _id: "6541a2b3c4d5e6f7g8h9i0j1",
  userId: "6541a2b3c4d5e6f7g8h9i0j2",
  date: "2025-11-07T00:00:00.000Z",
  lastMealTime: "20:00",
  firstMealTime: "12:00",
  fastingDuration: 960,
  // ...other entry fields
  unlockedAchievements: [
    {
      achievementId: "first-twelve",
      name: "First 12-Hour Fast",
      description: "Complete your first 12-hour fast",
      points: 10,
      rarity: "common",
      category: "duration",
      iconColor: "#10B981",
      unlockedAt: "2025-11-07T14:30:00.000Z"
    }
  ]
}

// PUT /api/entries/[id] response (200 OK)
// Same structure as POST

// When no achievements unlocked
{
  _id: "...",
  // ...entry fields
  unlockedAchievements: []  // Empty array, not null
}
```

**Alternatives Considered**:
- **Nested response**: `{ entry: {...}, achievements: [...] }` - Rejected - breaks existing clients expecting flat entry structure
- **Separate response fields**: `{ entry, unlocked, points }` - Rejected - overcomplicates response parsing
- **HTTP headers for achievements**: Rejected - non-standard, difficult to parse complex objects

**Best Practices Applied**:
- Use existing `createdResponse()` and `okResponse()` helpers from `errorHandler.js`
- ISO 8601 timestamps for `unlockedAt` field
- Array type for `unlockedAchievements` (always array, never null)
- Include all achievement metadata needed for UI display (no additional fetches required)

---

## Research Area 3: AchievementService Integration Contract

### Decision: Direct Service Call with Result Extraction

**Rationale**:
- AchievementService already implements all evaluation logic (Feature 031 - 60/60 tests passing)
- Service returns structured result: `{ unlockedAchievements: [...], pointsAdded: number }`
- No need to re-implement criteria evaluation in API layer
- Service handles all edge cases (E11000 duplicates, malformed criteria, concurrent unlocks)

**Service Contract** (from Feature 031):
```javascript
// AchievementService.evaluateAndUnlock(userId, entryId)
// Returns:
{
  unlockedAchievements: [
    {
      achievementId: "string",
      name: "string (from translations.en.name)",
      description: "string (from translations.en.description)", 
      points: number,
      rarity: "string (enum: common|rare|epic|legendary)",
      category: "string (enum: duration|streak|goal|...)",
      iconColor: "string (hex color)",
      unlockedAt: Date (ISO 8601 timestamp)
    }
  ],
  pointsAdded: number  // Total points awarded (sum of all unlocked achievement points)
}

// On error: throws exception (caught by try/catch in API handler)
// On no unlocks: returns { unlockedAchievements: [], pointsAdded: 0 }
```

**Integration Points**:
1. Import service: `import AchievementService from '@/lib/services/AchievementService';`
2. Call after `entry.save()` or `updatedEntry.save()`
3. Extract `unlockedAchievements` from result
4. Spread into response object
5. Catch and log any errors

**Alternatives Considered**:
- **Inline evaluation logic**: Rejected - duplicates 467 lines of tested service code
- **Event-driven webhook**: Rejected - adds complexity, delays response
- **Background job queue**: Rejected - cannot return achievements in response

**Best Practices Applied**:
- Single Responsibility Principle (service handles evaluation, API handles HTTP)
- Dependency Injection pattern (service imported and called)
- Error boundary at integration point (try/catch in API layer)

---

## Research Area 4: Testing Strategy for Extended API Responses

### Decision: Extend Existing Integration Tests + Add New Achievement Response Tests

**Rationale**:
- Existing Entry API tests verify core functionality (create/update entries)
- Need to add assertions for `unlockedAchievements` field presence and structure
- New test file focuses specifically on achievement response integration
- Test both success paths (achievements unlocked) and failure paths (service errors)

**Test Coverage Strategy**:

**1. Extend Existing Tests** (`tests/unit/api/entries-post.test.js`, `entries-put.test.js`):
```javascript
// Add to existing POST /api/entries tests
it('should include empty unlockedAchievements when no achievements qualify', async () => {
  const response = await createEntry(validEntryData);
  expect(response.body.unlockedAchievements).toBeDefined();
  expect(response.body.unlockedAchievements).toEqual([]);
});
```

**2. New Integration Test File** (`tests/integration/achievements/api-response.test.js`):
- Test POST returns achievements when 12h milestone reached
- Test PUT returns achievements when duration increased to unlock threshold
- Test POST/PUT return empty array when no achievements qualify
- Test POST/PUT succeed even when AchievementService throws error
- Test response structure matches contract (all required fields present)
- Test multiple achievements returned in single response

**Test Data Requirements**:
- Test users with varying achievement unlock states
- Test achievements at different thresholds (12h, 24h, 48h)
- Test entries with fastingDuration values crossing milestone boundaries
- Mock AchievementService errors for error handling tests

**Alternatives Considered**:
- **Only integration tests**: Rejected - unit tests faster, catch edge cases earlier
- **Snapshot tests for responses**: Rejected - too brittle, dates/IDs change
- **Contract testing tools**: Rejected - overkill for internal API, adds dependency

**Best Practices Applied**:
- Test isolation (each test creates own data, cleans up)
- Arrange-Act-Assert pattern
- Descriptive test names matching acceptance criteria
- MongoDB Memory Server for fast, isolated integration tests
- Mock service errors to test non-blocking behavior

---

## Research Area 5: Performance Monitoring & Observability

### Decision: Console Logging with Emoji Markers

**Rationale**:
- Console logs visible in Vercel deployment logs (no additional infrastructure)
- Emoji prefix (`🏆`) makes achievement events easy to grep/filter
- Error logs include context (entryId) for debugging production issues
- No performance overhead (console.log async in Node.js)

**Logging Pattern**:
```javascript
// Success log
console.log(`🏆 Achievements unlocked: ${achievementIds.join(', ')}`);
// Example output: 🏆 Achievements unlocked: first-twelve, streak-3-days

// Error log
console.error(`Achievement evaluation failed for entry ${entryId}:`, error.message);
// Example output: Achievement evaluation failed for entry 6541a2b3c4d5e6f7g8h9i0j1: Connection timeout
```

**Monitoring Strategy**:
- Grep Vercel logs for `🏆` to track unlock frequency
- Monitor error logs for `Achievement evaluation failed` pattern
- Track response time metrics (should stay <500ms including achievement evaluation)
- Use Vercel Analytics to monitor API route latency

**Alternatives Considered**:
- **Winston/Bunyan logging library**: Rejected - overkill for simple success/error logging
- **APM tool (DataDog, New Relic)**: Rejected - out of scope, adds cost
- **Custom metrics endpoint**: Rejected - premature optimization

**Best Practices Applied**:
- Structured logging (consistent format for parsing)
- Contextual information in error logs (entryId, error message)
- Non-PII data in logs (achievement IDs, not user data)
- Production-friendly (console.log works in Vercel without config)

---

## Summary of Key Decisions

| Decision Area | Choice | Primary Reason |
|---------------|--------|----------------|
| Error Handling | Try/Catch with Graceful Degradation | Entry operations must never fail due to achievements |
| Response Format | Spread Entry Object + unlockedAchievements Array | Backward compatible, additive change |
| Service Integration | Direct AchievementService.evaluateAndUnlock() Call | Reuse 60/60 tested service logic |
| Testing Strategy | Extend Existing + New Integration Tests | Balance speed and coverage |
| Observability | Console Logging with Emoji Markers | Simple, production-ready, Vercel-compatible |

---

## Open Questions & Future Research

None - All technical decisions resolved. Feature ready for Phase 1 (Design & Contracts).

---

## References

- Feature 031 Implementation: `src/lib/services/AchievementService.js`
- Feature 031 Tests: `tests/unit/services/AchievementService.test.js` (46 unit tests)
- Feature 031 Integration Tests: `tests/integration/achievements/unlock-flow.test.js` (6 tests)
- Existing Entry API: `src/app/api/entries/route.js`, `src/app/api/entries/[id]/route.js`
- Error Handler Patterns: `src/lib/api/errorHandler.js`
