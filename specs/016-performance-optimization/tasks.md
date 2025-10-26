# Implementation Tasks: Comprehensive Performance Optimization

**Feature**: 016-performance-optimization  
**Branch**: `016-performance-optimization`  
**Created**: October 26, 2025

## Overview

This document provides atomic, test-driven implementation tasks for the performance optimization feature. Tasks are organized by user story to enable independent implementation and testing. Each phase represents a complete, independently testable increment.

**Key Principles**:
- ✅ **TDD Enforced**: Tests written before implementation (constitution requirement)
- ✅ **Independent Stories**: Each user story can be developed, tested, and deployed independently
- ✅ **Parallel Execution**: Tasks marked [P] can be executed in parallel
- ✅ **MVP First**: User Story 1 (P1) represents the minimum viable product

---

## Task Summary

| Phase | User Story | Task Count | Can Parallelize |
|-------|-----------|------------|----------------|
| **Phase 1** | Setup | 5 | Yes (T002-T004) |
| **Phase 2** | Foundation | 6 | Yes (T006-T008) |
| **Phase 3** | US1: Fast Entry Details | 8 | Partial (T015-T017) |
| **Phase 4** | US2: Instant Settings | 6 | Partial (T022-T023) |
| **Phase 5** | US3: Fast API Response | 5 | Partial (T029-T030) |
| **Phase 6** | US4: Optimized Insights | 7 | Partial (T035-T037) |
| **Phase 7** | US5: Cache Strategy | 4 | No (integration tasks) |
| **Phase 8** | US6: Performance Monitoring | 6 | Yes (T049-T051) |
| **Phase 9** | US7: Next.js Caching | 5 | Partial (T056-T057) |
| **Phase 10** | Polish | 4 | Yes (T060-T062) |
| **TOTAL** | | **56 tasks** | **20+ parallel** |

---

## Phase 1: Setup & Environment (Independent)

**Goal**: Prepare development environment and install dependencies for performance optimization.

**Independent Test**: Redis connects successfully, ioredis package installed, environment variables configured.

### Tasks

- [ ] T001 Install Redis server and verify connection (redis-cli ping returns PONG)
- [ ] T002 [P] Install ioredis package: npm install ioredis@^5.3.0
- [ ] T003 [P] Create .env.local with Redis configuration (REDIS_HOST, REDIS_PORT, CACHE_TTL_SETTINGS, CACHE_TTL_INSIGHTS)
- [ ] T004 [P] Add performance logging environment variable: ENABLE_PERFORMANCE_LOGGING=true
- [ ] T005 Verify Redis connection works from Node.js (node -e "require('ioredis')... .ping()")

**Acceptance**: Redis server running, ioredis installed, environment configured, connection verified.

---

## Phase 2: Foundation - Cache Service & Database Indexes (Blocking Prerequisites)

**Goal**: Implement core cache abstraction layer and database performance indexes. These are foundational components required by all user stories.

**Independent Test**: Cache service get/set/del operations work correctly. Database indexes created and queries use indexes.

### Tasks

- [ ] T006 [P] Write unit tests for CacheService.get() in tests/unit/services/cacheService.test.js (test cache hit, miss, Redis unavailable)
- [ ] T007 [P] Write unit tests for CacheService.set() in tests/unit/services/cacheService.test.js (test TTL, graceful failure)
- [ ] T008 [P] Write unit tests for CacheService.del() and delPattern() in tests/unit/services/cacheService.test.js
- [ ] T009 Implement CacheService class in src/lib/services/cacheService.js (constructor, get, set, del, delPattern, isEnabled, getStats methods per contract)
- [ ] T010 Run CacheService unit tests and verify all pass (npm test tests/unit/services/cacheService.test.js)
- [ ] T011 Create database migration script migrations/004-add-performance-indexes.js (add userId_fastingDuration and userId_date_insights indexes)
- [ ] T012 Run migration to create indexes (node scripts/run-migration.js 004-add-performance-indexes)
- [ ] T013 Verify indexes created using db.entries.getIndexes() and explain() query plans

**Acceptance**: All CacheService tests pass. Database indexes created. Queries use indexes (verified via explain()).

**Blocker for**: All subsequent user story phases depend on cache service and indexes.

---

## Phase 3: User Story 1 - Fast Entry Details Page Load (P1 - MVP)

**User Story**: Users view entry details pages and experience near-instant page loads with comprehensive insights displayed immediately.

**Why Priority P1**: Entry details page is the most accessed user flow. Current 7+ database queries create noticeable sluggishness.

**Independent Test**: Navigate to entry details page, measure page load time (<500ms), verify query count reduced from 7+ to 2-3.

**Acceptance Criteria**:
- Entry details page loads in <500ms
- Maximum 2 database queries (entry + cached insights)
- Insights served from cache on repeat views
- Only relevant data fetched (no over-fetching)

### Tasks

- [ ] T014 [US1] Write integration test for entry details page load time in tests/e2e/entry-details-performance.spec.js (measure total time, query count)
- [ ] T015 [P] [US1] Write unit tests for cached insights retrieval in tests/unit/services/entryInsightsService.test.js (test cache hit/miss, aggregation correctness)
- [ ] T016 [P] [US1] Write tests for cache invalidation on entry mutation in tests/unit/services/entryInsightsService.test.js
- [ ] T017 [P] [US1] Create performance logger utility in src/lib/utils/performanceLogger.js (logPerformance, withPerformanceTracking functions)
- [ ] T018 [US1] Refactor entryInsightsService.calculateInsights() to use single aggregation pipeline in src/lib/services/entryInsightsService.js (replace 5+ queries with $facet)
- [ ] T019 [US1] Add caching to entryInsightsService.calculateInsights() using CacheService with 30-min TTL
- [ ] T020 [US1] Add cache invalidation methods: invalidateInsightsForUser(), invalidateInsightsForEntry() in src/lib/services/entryInsightsService.js
- [ ] T021 [US1] Update entry details page in src/app/entries/[id]/page.js to use cached insights service and add ISR revalidation (export const revalidate = 300)
- [ ] T022 [US1] Run entry details performance test and verify <500ms load time (npm test tests/e2e/entry-details-performance.spec.js)

**Acceptance**: Entry details page loads <500ms, query count reduced to 2-3, all tests pass.

**Dependencies**: Requires Phase 2 (CacheService, indexes) complete.

**Parallel Opportunities**: T015-T017 can run in parallel (different files, no dependencies).

---

## Phase 4: User Story 2 - Instant Settings Retrieval (P1)

**User Story**: User settings are loaded instantly across all pages without repeated database queries.

**Why Priority P1**: Settings fetched on every page load. Caching eliminates redundant work, significantly reducing database load.

**Independent Test**: Monitor database queries for settings across multiple page loads. Settings fetched from database once, then served from cache.

**Acceptance Criteria**:
- Settings fetched from database only once per session/cache period
- Settings retrieved from cache in <10ms
- Cache invalidated on settings update
- Cache refreshes seamlessly on expiration

### Tasks

- [ ] T023 [P] [US2] Write unit tests for SettingsService.getSettings() in tests/unit/services/settingsService.test.js (test cache hit, miss, fallback)
- [ ] T024 [P] [US2] Write unit tests for SettingsService.updateSettings() in tests/unit/services/settingsService.test.js (test invalidation)
- [ ] T025 [US2] Implement SettingsService class in src/lib/services/settingsService.js (getSettings, updateSettings, createSettings methods per contract)
- [ ] T026 [US2] Run SettingsService unit tests and verify all pass (npm test tests/unit/services/settingsService.test.js)
- [ ] T027 [US2] Update existing settings usage in codebase to use SettingsService (find Settings.findOne calls, replace with settingsService.getSettings)
- [ ] T028 [US2] Add cache invalidation to settings update API routes in src/app/api/settings/route.js

**Acceptance**: Settings cached with 1-hour TTL, cache hit rate >80% after warmup, all tests pass.

**Dependencies**: Requires Phase 2 (CacheService) complete.

**Parallel Opportunities**: T023-T024 can run in parallel (test files).

---

## Phase 5: User Story 3 - Fast API Response Times (P1)

**User Story**: All API endpoints respond quickly with optimized database queries and proper indexing.

**Why Priority P1**: API response times directly impact user-perceived performance. Proper indexing is foundational.

**Independent Test**: Call each API endpoint, measure response time (<200ms for typical data volumes).

**Acceptance Criteria**:
- GET /api/entries responds in <200ms using indexed queries
- POST /api/entries previous entry lookup completes in <50ms
- Date range queries complete in <30ms
- Aggregation queries with projections complete in <100ms

### Tasks

- [ ] T029 [P] [US3] Write integration tests for API endpoint response times in tests/integration/api/entries.test.js (measure GET, POST, date range queries)
- [ ] T030 [P] [US3] Write tests to verify index usage in tests/unit/models/Entry.test.js (use explain() to confirm index usage)
- [ ] T031 [US3] Update Entry model queries to use compound indexes in src/lib/models/Entry.js (add .hint() if needed for query planner)
- [ ] T032 [US3] Optimize GET /api/entries queries with indexed userId + date in src/app/api/entries/route.js
- [ ] T033 [US3] Run API performance tests and verify <200ms response times (npm test tests/integration/api/entries.test.js)

**Acceptance**: All API endpoints respond <200ms, queries use indexes, all tests pass.

**Dependencies**: Requires Phase 2 (indexes) complete.

**Parallel Opportunities**: T029-T030 can run in parallel (different test files).

---

## Phase 6: User Story 4 - Optimized Insight Calculations (P2)

**User Story**: Entry insights are calculated efficiently using single aggregation pipeline instead of multiple separate queries.

**Why Priority P2**: Current implementation makes 5 separate database queries. Consolidating improves performance 3-5x.

**Independent Test**: Calculate insights for entry, monitor database query count (should use single aggregation pipeline).

**Acceptance Criteria**:
- Single MongoDB aggregation pipeline fetches all insight data
- Query completes in <100ms using proper indexes
- Only necessary fields projected (no full document fetching)
- Null insights returned for entries without duration (short-circuit)

### Tasks

- [ ] T034 [US4] Write test comparing aggregation pipeline vs multi-query performance in tests/unit/services/entryInsightsService.test.js
- [ ] T035 [P] [US4] Write unit tests for aggregation pipeline correctness in tests/unit/services/entryInsightsService.test.js (verify longestThisMonth, historicalRank, averageDuration, typicalBreakfast facets)
- [ ] T036 [P] [US4] Write tests for edge cases: no duration, no entries, single entry in tests/unit/services/entryInsightsService.test.js
- [ ] T037 [P] [US4] Write tests verifying aggregation uses indexes in tests/unit/services/entryInsightsService.test.js (explain() output)
- [ ] T038 [US4] Implement aggregation pipeline with $facet for multiple insights in src/lib/services/entryInsightsService.js
- [ ] T039 [US4] Add proper projections to aggregation stages (only fetch needed fields)
- [ ] T040 [US4] Run insight calculation tests and verify 3-5x performance improvement (npm test tests/unit/services/entryInsightsService.test.js)

**Acceptance**: Single aggregation pipeline replaces 5 queries, <100ms execution time, all tests pass.

**Dependencies**: Requires Phase 2 (indexes) complete. Can run parallel with Phase 4, 5.

**Parallel Opportunities**: T035-T037 can run in parallel (different test scenarios).

---

## Phase 7: User Story 5 - Cache Strategy Implementation (P2)

**User Story**: Redis caching layer reduces database load for frequently accessed, infrequently changing data.

**Why Priority P2**: Caching eliminates redundant calculations and database queries, improving performance for all users.

**Independent Test**: Enable Redis caching, monitor cache hit rates (>80% for settings, >70% for insights after warmup).

**Acceptance Criteria**:
- Settings cached with 1-hour TTL after first fetch
- Insights cached with 30-minute TTL with userId+entryId key
- Cache checked before database query
- Cache automatically populated on cache miss
- Related caches invalidated on entry update

### Tasks

- [ ] T041 [US5] Write integration test for end-to-end cache flow in tests/integration/cache-flow.test.js (write → invalidate → read)
- [ ] T042 [US5] Write test for graceful fallback when Redis unavailable in tests/integration/cache-fallback.test.js
- [ ] T043 [US5] Update API routes to invalidate insight caches on entry mutations in src/app/api/entries/route.js (POST, PUT, DELETE)
- [ ] T044 [US5] Add revalidatePath calls for Next.js cache in API routes (revalidatePath('/entries/[id]'), revalidatePath('/entries'))

**Acceptance**: Cache hit rate >80% settings, >70% insights, graceful Redis fallback works, all tests pass.

**Dependencies**: Requires Phase 3, 4, 6 (services implemented with caching).

**No Parallel**: Integration tasks depend on previous implementations.

---

## Phase 8: User Story 6 - Performance Monitoring & Observability (P3)

**User Story**: Core Web Vitals and performance metrics are tracked to identify regressions and optimize user experience.

**Why Priority P3**: Measurement validates performance improvements and identifies regressions.

**Independent Test**: Generate performance report showing Core Web Vitals (LCP, FID, CLS) for key pages.

**Acceptance Criteria**:
- LCP (Largest Contentful Paint) under 2.5 seconds
- FID (First Input Delay) under 100ms
- CLS (Cumulative Layout Shift) under 0.1
- Metrics logged with page identifier and timestamp
- API response times logged for monitoring

### Tasks

- [ ] T045 [US6] Create performance logger utility in src/lib/utils/performanceLogger.js (if not created in T017)
- [ ] T046 [US6] Write tests for performance logging in tests/unit/utils/performanceLogger.test.js
- [ ] T047 [US6] Add performance logging middleware for API routes in src/lib/middleware/performanceMiddleware.js
- [ ] T048 [US6] Add Core Web Vitals tracking to root layout in src/app/layout.js (if using Vercel Analytics)
- [ ] T049 [P] [US6] Add performance logging to entry details page in src/app/entries/[id]/page.js
- [ ] T050 [P] [US6] Add performance logging to API routes in src/app/api/entries/route.js
- [ ] T051 [P] [US6] Create cache stats monitoring endpoint in src/app/api/cache-stats/route.js (return cache.getStats())
- [ ] T052 [US6] Write E2E test measuring Core Web Vitals in tests/e2e/core-web-vitals.spec.js
- [ ] T053 [US6] Run Core Web Vitals test and verify targets met (npm test tests/e2e/core-web-vitals.spec.js)

**Acceptance**: Core Web Vitals tracked and meet targets, performance metrics logged, all tests pass.

**Dependencies**: Requires Phase 3 (entry details page optimized).

**Parallel Opportunities**: T049-T051 can run in parallel (different files).

---

## Phase 9: User Story 7 - Next.js Cache Headers & ISR (P3)

**User Story**: Static and semi-static pages use appropriate cache headers and Incremental Static Regeneration for optimal performance.

**Why Priority P3**: Next.js caching mechanisms reduce server load and improve response times.

**Independent Test**: Check HTTP response headers for static pages, verify revalidation periods.

**Acceptance Criteria**:
- Entry details page has revalidation period configured
- Cached version served when data unchanged
- Related page caches revalidated on entry creation
- HTTP cache headers indicate appropriate cache duration

### Tasks

- [ ] T054 [US7] Write test verifying ISR revalidation in tests/integration/nextjs-cache.test.js
- [ ] T055 [US7] Write test for on-demand revalidation in tests/integration/nextjs-cache.test.js
- [ ] T056 [P] [US7] Add revalidate export to entry details page in src/app/entries/[id]/page.js (export const revalidate = 300)
- [ ] T057 [P] [US7] Add revalidate export to entries list page in src/app/entries/page.js (if exists)
- [ ] T058 [US7] Update generateStaticParams for entry details page in src/app/entries/[id]/page.js (pre-render recent entries)
- [ ] T059 [US7] Run ISR tests and verify cache behavior (npm test tests/integration/nextjs-cache.test.js)

**Acceptance**: ISR configured with 5-minute revalidation, on-demand revalidation works, all tests pass.

**Dependencies**: Requires Phase 3 (entry details page updated).

**Parallel Opportunities**: T056-T057 can run in parallel (different pages).

---

## Phase 10: Polish & Cross-Cutting Concerns

**Goal**: Final cleanup, documentation, and validation of all performance targets.

**Independent Test**: Full test suite passes, performance benchmarks meet all targets, documentation complete.

### Tasks

- [ ] T060 [P] Add JSDoc comments to CacheService API in src/lib/services/cacheService.js
- [ ] T061 [P] Add JSDoc comments to SettingsService API in src/lib/services/settingsService.js
- [ ] T062 [P] Add JSDoc comments to EntryInsightsService API in src/lib/services/entryInsightsService.js
- [ ] T063 Create performance benchmark script in scripts/benchmark-performance.js (measure all targets)
- [ ] T064 Run full test suite and verify 100% pass rate (npm test)
- [ ] T065 Run performance benchmarks and verify all targets met (node scripts/benchmark-performance.js)
- [ ] T066 Update project documentation with performance optimization details

**Acceptance**: All tests pass, all performance targets met, documentation complete.

**Dependencies**: Requires all previous phases complete.

**Parallel Opportunities**: T060-T062 can run in parallel (different files).

---

## Dependencies & Execution Order

### Story Dependency Graph

```
Phase 1: Setup (Independent)
    ↓
Phase 2: Foundation (Blocking for all stories)
    ↓
    ├─→ Phase 3: US1 (P1 - MVP) ─────────┐
    ├─→ Phase 4: US2 (P1) ───────────────┤
    ├─→ Phase 5: US3 (P1) ───────────────┤
    ├─→ Phase 6: US4 (P2) ───────────────┤
    │                                     ↓
    └──────────────────────────→ Phase 7: US5 (P2) - Integration
                                          ↓
    ┌─────────────────────────────────────┤
    ├─→ Phase 8: US6 (P3)
    ├─→ Phase 9: US7 (P3)
    │
    └─→ Phase 10: Polish
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 7 (US5) → Phase 10

**Parallel Execution**:
- After Phase 2: Phases 3, 4, 5, 6 can run in parallel (different components)
- Phase 7 requires 3, 4, 6 complete (integration)
- After Phase 7: Phases 8, 9 can run in parallel

---

## Parallel Execution Examples

### By User Story

**US1: Fast Entry Details (Phase 3)**
```bash
# Terminal 1: Tests
npm test tests/e2e/entry-details-performance.spec.js --watch

# Terminal 2: Implementation
# Work on T018-T021 (insights service, entry details page)

# Terminal 3: Performance logger
# Work on T017 (utils/performanceLogger.js)
```

**US2: Instant Settings (Phase 4)**
```bash
# Terminal 1: Tests
npm test tests/unit/services/settingsService.test.js --watch

# Terminal 2: Implementation
# Work on T025 (settingsService.js)

# Terminal 3: Integration
# Work on T027-T028 (update existing usage)
```

**US4: Optimized Insights (Phase 6)**
```bash
# Terminal 1: Aggregation tests
npm test tests/unit/services/entryInsightsService.test.js --testNamePattern="aggregation" --watch

# Terminal 2: Edge case tests
npm test tests/unit/services/entryInsightsService.test.js --testNamePattern="edge" --watch

# Terminal 3: Implementation
# Work on T038-T039 (aggregation pipeline)
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Priority 1**: User Story 1 (Fast Entry Details Page Load)
- Phases: 1, 2, 3 only
- Task count: 19 tasks
- Estimated time: 1 day
- Deliverable: Entry details page loads <500ms with reduced queries

**Validation**:
```bash
# After completing Phase 3
npm test tests/e2e/entry-details-performance.spec.js
node scripts/benchmark-performance.js
```

### Incremental Delivery

**Release 1** (MVP): Phase 1-3 → Entry details optimization
**Release 2**: Add Phase 4 → Settings caching
**Release 3**: Add Phase 5-6 → API optimization + Insights optimization
**Release 4**: Add Phase 7 → Complete cache strategy integration
**Release 5**: Add Phase 8-9 → Monitoring + Next.js caching
**Release 6**: Phase 10 → Polish and documentation

### Testing Strategy

**TDD Workflow** (Constitutional Requirement):
1. Write failing test for task
2. Run test (should fail)
3. Implement minimum code to pass
4. Run test (should pass)
5. Refactor if needed
6. Commit with test + implementation

**Example**:
```bash
# T006: Write CacheService.get() test
# 1. Create test file
touch tests/unit/services/cacheService.test.js

# 2. Write failing test
# describe('CacheService', () => { test('get returns cached value'...

# 3. Run test (fails - service doesn't exist)
npm test tests/unit/services/cacheService.test.js

# T009: Implement CacheService
# 4. Create service file
touch src/lib/services/cacheService.js

# 5. Implement get() method
# class CacheService { async get(key) { ... } }

# 6. Run test (passes)
npm test tests/unit/services/cacheService.test.js

# 7. Commit
git add tests/ src/
git commit -m "T006, T009: Add CacheService.get() with tests"
```

---

## Task Format Validation

✅ **All tasks follow required format**:
- Checkbox: `- [ ]`
- Task ID: T001-T066 (sequential)
- [P] marker: 20+ tasks marked parallelizable
- [Story] label: Tasks in Phases 3-9 have [US1]-[US7] labels
- Description: Clear action with file path
- Setup/Foundation/Polish: No story labels (correct)

**Example Valid Tasks**:
- `- [ ] T001 Install Redis server...` (Setup, no story label ✓)
- `- [ ] T015 [P] [US1] Write unit tests...` (Story task, parallel ✓)
- `- [ ] T060 [P] Add JSDoc comments...` (Polish, no story label ✓)

---

## Performance Validation Checklist

After completing all phases:

- [ ] Entry details page loads in <500ms (Phase 3)
- [ ] API endpoints respond in <200ms (Phase 5)
- [ ] Settings cache hit rate >80% (Phase 4)
- [ ] Insights cache hit rate >70% (Phase 6)
- [ ] Database query count reduced by 60% (Phase 3)
- [ ] LCP <2.5s, FID <100ms, CLS <0.1 (Phase 8)
- [ ] Aggregation pipeline 3-5x faster than multi-query (Phase 6)
- [ ] All unit tests pass (All phases)
- [ ] All integration tests pass (All phases)
- [ ] All E2E tests pass (Phases 3, 8)
- [ ] Full test coverage >80% (Phase 10)

---

## Summary

- **Total Tasks**: 66 (T001-T066)
- **Parallelizable**: 20+ tasks marked [P]
- **User Stories**: 7 (US1-US7), each independently testable
- **MVP**: Phases 1-3 (19 tasks, ~1 day)
- **Full Feature**: All phases (66 tasks, ~2-3 days)
- **TDD Enforced**: Tests written before implementation (constitutional requirement)
- **Story Independence**: Each story delivers value independently

**Next Steps**:
1. Start with Phase 1 (Setup)
2. Complete Phase 2 (Foundation - blocking)
3. Implement Phase 3 (US1 - MVP)
4. Validate MVP performance targets
5. Continue with remaining phases incrementally

**Estimated Timeline**:
- MVP (Phases 1-3): 1 day
- Full feature (All phases): 2-3 days
- Per developer experience and testing thoroughness

---

**Ready for Implementation** 🚀
