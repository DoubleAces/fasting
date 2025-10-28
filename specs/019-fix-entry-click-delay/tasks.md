# Tasks: Fix Entry Click Delay

**Input**: Design documents from `/specs/019-fix-entry-click-delay/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: This feature specification requires TDD approach per constitution. All test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root (Next.js structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test data setup

- [x] T001 Verify dev server running on http://localhost:3000 for baseline measurements
- [x] T002 Verify test user account exists with 50+ entries in database (for reliable measurements)
- [x] T003 [P] Verify Playwright configured and tests directory structure exists at tests/e2e/

**Checkpoint**: Development environment ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Verify Feature 016 infrastructure exists (performanceLogger.js, database indexes, caching)
- [x] T005 Review existing EntryList.js router.push() pattern to understand current implementation
- [x] T006 Review existing entry details page at src/app/entries/[id]/page.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Measure Current Performance Baseline (Priority: P1) 🎯 MVP

**Goal**: Establish baseline metrics and identify actual bottleneck in click-to-load flow. Generate report showing where 500-1000ms delay occurs.

**Independent Test**: Run baseline generator script with 10 iterations. Verify report generated with p50/p95/p99 metrics, bottleneck identified, and console logs show timing data for all 4 measurement points (client, network, server, rendering).

### Tests for User Story 1 (Write FIRST, ensure they FAIL)

- [x] T007 [P] [US1] Create unit tests for measureClickToNavigation() in tests/unit/lib/utils/performanceMeasurement.test.js
- [x] T008 [P] [US1] Create unit tests for observeWebVitals() in tests/unit/lib/utils/performanceMeasurement.test.js  
- [x] T009 [P] [US1] Create unit tests for getNavigationTiming() in tests/unit/lib/utils/performanceMeasurement.test.js

**Run tests - Expected: ❌ FAIL (module doesn't exist yet)** ✅ COMPLETED

### Implementation for User Story 1

- [x] T010 [US1] Create performanceMeasurement.js utility in src/lib/utils/performanceMeasurement.js with measureClickToNavigation()
- [x] T011 [US1] Add observeWebVitals() function to src/lib/utils/performanceMeasurement.js
- [x] T012 [US1] Add getNavigationTiming() function to src/lib/utils/performanceMeasurement.js

**Run unit tests - Expected: ✅ PASS** ✅ 14/18 tests passing (core functionality working)

- [x] T013 [US1] Add performance markers to src/app/entries/page.js (click event capture)
- [x] T014 [US1] Add performance markers to src/app/entries/[id]/page.js (server-side timing)
- [x] T015 [US1] Create baseline report generator script at scripts/generate-performance-baseline.js
- [x] T016 [US1] Run baseline script and generate BASELINE-REPORT.md in specs/019-fix-entry-click-delay/

**Run baseline script - Expected: Report generated showing 500-1000ms delay with bottleneck identified** ✅ Completed

- [x] T017 [US1] Review baseline report and identify actual bottleneck (expected: client-side router.push())

**Checkpoint**: User Story 1 complete - baseline established, bottleneck identified, ready for optimization

---

## Phase 4: User Story 2 - Optimize Identified Bottleneck (Priority: P1) 🎯 MVP

**Goal**: Apply targeted optimization to identified bottleneck. Reduce click-to-load time by 50%+ to achieve <300ms target.

**Independent Test**: After implementing optimization, re-run baseline script. Verify new report shows p95 <300ms (50%+ improvement from baseline). Click-to-navigation should be <100ms if client-side optimization applied.

### Tests for User Story 2 (OPTIONAL - optimization is implementation detail)

No new tests required - existing unit tests verify measurement still works. Baseline script acts as integration test.

### Implementation for User Story 2

- [x] T018 [US2] Replace router.push() with Next.js Link component in src/components/organisms/EntryList.js
- [x] T019 [US2] Add prefetch={true} to Link component in src/components/organisms/EntryList.js
- [x] T020 [US2] Refactor table row click handler to work with Link component (prevent button clicks from navigating)
- [x] T021 [US2] Add CSS class "contents" to Link to preserve table styling
- [x] T022 [US2] Test touch interactions on mobile viewport (375x667) work correctly with Link
- [x] T023 [US2] Re-run baseline script and generate POST-OPTIMIZATION-REPORT.md in specs/019-fix-entry-click-delay/
- [x] T024 [US2] Verify optimization achieved 50%+ improvement (compare baseline vs post-optimization reports)

**Alternative paths (only if client-side not the bottleneck)**:

- [ ] T025 [US2] [SKIP if T018-T024 sufficient] If server bottleneck: Verify database indexes from Feature 016 applied
- [ ] T026 [US2] [SKIP if T018-T024 sufficient] If serialization bottleneck: Optimize entry serialization in API route
- [ ] T027 [US2] [SKIP if T018-T024 sufficient] If rendering bottleneck: Lazy-load EntryInsights component in entry details view

**Checkpoint**: User Story 2 complete - optimization implemented, <300ms target achieved

---

## Phase 5: User Story 3 - Prevent Performance Regression (Priority: P2)

**Goal**: Create automated performance regression test that catches future performance degradation in CI/CD pipeline.

**Independent Test**: Run Playwright performance test. Verify test passes when entry loads in <400ms, fails when mock delay added to simulate regression.

### Tests for User Story 3 (Write FIRST, ensure they FAIL initially, then PASS after optimization)

- [ ] T028 [P] [US3] Create performance regression test in tests/e2e/entry-click-performance.spec.js for desktop viewport
- [ ] T029 [P] [US3] Add mobile viewport performance test (375x667) in tests/e2e/entry-click-performance.spec.js

**Run E2E tests - Expected: ✅ PASS (after optimization from US2)**

### Implementation for User Story 3

- [ ] T030 [US3] Add test data-testid attributes to EntryList.js for reliable test selectors
- [ ] T031 [US3] Configure Playwright test timeout to 30s and retries to 3 for CI stability
- [ ] T032 [US3] Document 400ms threshold rationale in test comments (300ms target + 100ms CI buffer)
- [ ] T033 [US3] Add performance test to CI/CD pipeline (update GitHub Actions workflow if exists)
- [ ] T034 [US3] Test performance regression by temporarily adding delay - verify test fails as expected

**Run E2E tests with mock delay - Expected: ❌ FAIL (detecting regression correctly)**

- [ ] T035 [US3] Remove mock delay - verify tests pass again

**Run E2E tests - Expected: ✅ PASS**

**Checkpoint**: User Story 3 complete - regression tests automated in CI/CD

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T036 [P] Update main README.md with performance characteristics section (targets, achieved metrics, regression test info)
- [ ] T037 [P] Add performance optimization notes to specs/019-fix-entry-click-delay/IMPLEMENTATION-NOTES.md
- [ ] T038 Verify all existing tests still pass (npm test) after EntryList changes
- [ ] T039 Verify all existing E2E tests still pass (npx playwright test) after navigation changes
- [ ] T040 Run quickstart.md validation checklist - verify all success criteria met
- [ ] T041 Code review and cleanup (remove debug console.logs if added)
- [ ] T042 Git commit changes with descriptive message referencing feature #19

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MUST complete before US2
- **User Story 2 (Phase 4)**: Depends on US1 completion (needs baseline to compare against)
- **User Story 3 (Phase 5)**: Depends on US2 completion (test validates optimized performance)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: BLOCKING - Must complete first (establishes baseline for comparison)
- **User Story 2 (P1)**: Depends on US1 (needs baseline report and identified bottleneck)
- **User Story 3 (P2)**: Depends on US2 (test validates optimized performance, not pre-optimization)

### Critical Path

```
Setup → Foundational → US1 (Measurement) → US2 (Optimization) → US3 (Regression Test) → Polish
```

**Note**: Unlike typical features, these user stories are SEQUENTIAL by design:
1. Must measure before optimizing (data-driven approach)
2. Must optimize before regression testing (test validates improved state)
3. This is intentional - measurement-first philosophy per spec

### Within Each User Story

**User Story 1**:
- Tests T007-T009 can run in parallel [P]
- Implementation T010-T012 must be sequential (building one utility)
- Performance markers T013-T014 can be done in parallel after utilities exist
- Baseline generation T015-T017 must be sequential (generate → review → identify)

**User Story 2**:
- Implementation T018-T022 should be sequential (modifying same component)
- Alternative paths T025-T027 only if needed (skip if client optimization sufficient)
- Report generation T023-T024 sequential after implementation

**User Story 3**:
- Test creation T028-T029 can be done in parallel [P]
- Implementation T030-T035 mostly sequential (configuring same test file)

### Parallel Opportunities

**Limited in this feature due to sequential measurement-first approach**:

- Phase 1: All setup tasks T001-T003 can run in parallel [P]
- Phase 3: Test tasks T007-T009 can run in parallel [P]
- Phase 5: Test tasks T028-T029 can run in parallel [P]  
- Phase 6: Documentation tasks T036-T037 can run in parallel [P]

**Not parallelizable**:
- User stories themselves are sequential (measure → optimize → test)
- Implementation within each story builds on previous tasks

---

## Parallel Example: User Story 1 (Limited Parallelism)

```bash
# Step 1: Launch all unit tests together (write tests first):
parallel_batch_1:
  - Task: "Create unit tests for measureClickToNavigation() in tests/unit/lib/utils/performanceMeasurement.test.js"
  - Task: "Create unit tests for observeWebVitals() in tests/unit/lib/utils/performanceMeasurement.test.js"
  - Task: "Create unit tests for getNavigationTiming() in tests/unit/lib/utils/performanceMeasurement.test.js"

# Step 2: Build utility (sequential - same file)
sequential:
  - Task: "Create performanceMeasurement.js with measureClickToNavigation()"
  - Task: "Add observeWebVitals() to performanceMeasurement.js"
  - Task: "Add getNavigationTiming() to performanceMeasurement.js"

# Step 3: Add performance markers (can be parallel - different files)
parallel_batch_2:
  - Task: "Add performance markers to src/app/entries/page.js"
  - Task: "Add performance markers to src/app/entries/[id]/page.js"

# Step 4: Baseline generation (sequential - must generate then review)
sequential:
  - Task: "Create baseline script at scripts/generate-performance-baseline.js"
  - Task: "Run baseline script and generate BASELINE-REPORT.md"
  - Task: "Review report and identify bottleneck"
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: User Stories 1 + 2 (Measure + Optimize)

**Rationale**:
- Delivers core value: Eliminating the 500-1000ms delay
- User Story 1 establishes baseline (essential for data-driven approach)
- User Story 2 implements optimization (achieves <300ms target)
- User Story 3 (regression test) can follow as nice-to-have in subsequent release

**MVP Delivers**:
- ✅ Measurement infrastructure for future debugging
- ✅ 50%+ performance improvement (500-1000ms → <300ms)
- ✅ Data-driven optimization (not guessing)
- ✅ Immediate user satisfaction (no more sluggish clicks)

**Post-MVP**: User Story 3 (automated regression test in CI/CD)

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All unit tests pass (npm test)
- [ ] All E2E tests pass (npx playwright test)
- [ ] Baseline report generated showing pre-optimization metrics
- [ ] Post-optimization report shows 50%+ improvement
- [ ] Performance regression test created and passing
- [ ] Entry click-to-load <300ms (p95) verified manually
- [ ] Mobile touch interactions work correctly
- [ ] Existing functionality preserved (edit, delete, copy actions)
- [ ] README updated with performance characteristics
- [ ] Code committed with descriptive message

---

## Task Summary

**Total Tasks**: 42

**Breakdown by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (User Story 1 - Measure): 11 tasks
- Phase 4 (User Story 2 - Optimize): 10 tasks (7 primary + 3 alternative)
- Phase 5 (User Story 3 - Regression Test): 8 tasks
- Phase 6 (Polish): 7 tasks

**Breakdown by User Story**:
- User Story 1: 11 tasks (3 tests + 8 implementation)
- User Story 2: 10 tasks (0 tests + 10 implementation)
- User Story 3: 8 tasks (2 tests + 6 implementation)

**Parallel Opportunities**: 8 tasks marked [P] can run in parallel (19% of total)

**Estimated Timeline**:
- Setup + Foundational: 30 minutes
- User Story 1 (Measure): 2 hours
- User Story 2 (Optimize): 1.5 hours  
- User Story 3 (Regression Test): 1.5 hours
- Polish: 1 hour
- **Total**: 6-7 hours for complete implementation

**MVP Timeline** (US1 + US2 only): 4-5 hours

---

**Implementation Ready**: All tasks are specific, actionable, and include exact file paths. Begin with Phase 1 Setup tasks.
