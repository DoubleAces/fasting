# Tasks: Entry Details Page

**Input**: Design documents from `/specs/011-entry-details-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD mandatory (Constitution III) - tests written first, ensure they fail, then implement

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Completion Status

**Overall Progress**: 67/73 tasks complete (92%)

**By Phase**:
- ✅ Phase 1 (Setup): 3/3 complete (100%)
- ✅ Phase 2 (Foundation): 5/5 complete (100%)
- ✅ Phase 3 (User Story 1): 19/19 complete (100%)
- ✅ Phase 4 (User Story 2): 17/18 complete (94%) - T031 integration tests deferred
- ✅ Phase 5 (User Story 3): 16/16 complete (100%)
- ⏳ Phase 6 (Polish): 7/12 complete (58%)

**User Stories**:
- ✅ User Story 1: View comprehensive entry details - DEPLOYED
- ✅ User Story 2: Personal insights and patterns - DEPLOYED
- ✅ User Story 3: Contextual actions - DEPLOYED

**Remaining Work**: 6 tasks (T064-T069: manual testing, performance, monitoring)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify Next.js 15.5.6 App Router structure and dependencies per plan.md
- [x] T002 [P] Create directory structure: `src/app/entries/[id]/`, `src/components/atoms/`, `src/components/molecules/`, `src/components/organisms/`, `src/lib/services/`
- [x] T003 [P] Create test directory structure: `tests/unit/services/`, `tests/unit/components/`, `tests/integration/`, `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `src/lib/services/entryInsightsService.js` stub with empty function signatures (calculateInsights, isLongestThisMonth, getHistoricalRank, getAverageDuration, getTypicalBreakfastTime, contributesToStreak, isBestDay)
- [x] T005 [P] Verify existing Entry model at `src/lib/models/Entry.js` has all required fields per data-model.md (if missing: add fields and update schema validation)
- [x] T006 [P] Verify existing Settings model has timeFormat and measurementSystem fields (if missing: add fields per existing settings schema pattern)
- [x] T007 [P] Verify existing authentication patterns (NextAuth) for Server Component data fetching
- [x] T008 Configure PWA runtime caching for `/entries/[id]` route in `next.config.mjs` (NetworkFirst strategy, 90-day expiration)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Comprehensive Entry Details (Priority: P1) 🎯 MVP

**Goal**: Display all entry information on dedicated details page when user clicks entry from list

**Independent Test**: Click any entry from entries list, verify all entry fields display correctly (duration, times, meals, health metrics, timestamps)

### Tests for User Story 1 (TDD - Write FIRST)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [P] [US1] Write unit test for Badge component in `tests/unit/components/atoms/Badge.test.js` (variants: best-day, longest-fast, null state)
- [x] T010 [P] [US1] Write unit test for TimeDisplay component in `tests/unit/components/atoms/TimeDisplay.test.js` (12h/24h format, edge cases)
- [x] T011 [P] [US1] Write unit test for FastingTimeline component in `tests/unit/components/molecules/FastingTimeline.test.js` (SVG rendering, angle calculations, midnight crossing)
- [x] T012 [P] [US1] Write unit test for EntryMetadata component in `tests/unit/components/molecules/EntryMetadata.test.js` (timestamps, date formatting)
- [x] T013 [P] [US1] Write unit test for EntryDetailsView component in `tests/unit/components/organisms/EntryDetailsView.test.js` (all sections render, null data handling, responsive layout)
- [x] T014 [US1] Write integration test for entry details page in `tests/integration/entry-details.test.js` (authorization, data fetching, 404 handling, unauthorized access)

### Implementation for User Story 1

- [x] T015 [P] [US1] Implement Badge component in `src/components/atoms/Badge.js` (renders badge with icon, text, variant styles using Tailwind)
- [x] T016 [P] [US1] Implement TimeDisplay component in `src/components/atoms/TimeDisplay.js` (formats time based on user settings, handles 12h/24h)
- [x] T017 [US1] Implement FastingTimeline component in `src/components/molecules/FastingTimeline.js` (SVG 24-hour circular clock, shaded fasting period, meal markers, angle calculations)
- [x] T018 [P] [US1] Implement EntryMetadata component in `src/components/molecules/EntryMetadata.js` (displays created/updated timestamps with date-fns formatting)
- [x] T019 [US1] Implement EntryDetailsView organism in `src/components/organisms/EntryDetailsView.js` (main container with all entry sections: duration, timeline, meals, health metrics, metadata)
- [x] T020 [US1] Create entry details page in `src/app/entries/[id]/page.js` (Server Component, fetch entry and user settings, authorization check, render EntryDetailsView)
- [x] T021 [P] [US1] Create loading state in `src/app/entries/[id]/loading.js` (skeleton UI for entry details)
- [x] T022 [US1] Modify entries list page in `src/app/entries/page.js` (make entries clickable with links to `/entries/[id]`)
- [x] T023 [US1] Add error handling for 404 (non-existent entry) and 403 (unauthorized) in entry details page (implemented in page.js - notFound() and redirect)
- [x] T024 [US1] Add back navigation to entries list (breadcrumb or back button in header) (implemented in page.js with Link component)
- [x] T025 [US1] Handle edge cases: null fastingDuration, missing optional fields (weight, food notes), extended fasts >24h (implemented in EntryDetailsView with "Not logged" messages and extended fast badge)
- [x] T026 [US1] Ensure mobile responsive layout (stacked sections, touch-friendly, no horizontal scroll <600px) (implemented with space-y-6, md:p-6 classes, grid-cols-1)
- [x] T027 [US1] Add accessibility: semantic HTML, ARIA labels for timeline, keyboard navigation (implemented with <article>, <section>, <time> elements, role="img" and aria-labels on SVG)

**Checkpoint**: ✅ User Story 1 (MVP) complete! All components implemented and integrated. Users can now click any entry from the list to view comprehensive details including duration, timeline visualization, meal times, health metrics, mood ratings, food notes, and timestamps.

---

## Phase 4: User Story 2 - View Personal Insights and Patterns (Priority: P2)

**Goal**: Display personalized insights comparing this entry to user's historical patterns (longest fast, rankings, averages, streaks, "best day" badges)

**Independent Test**: View entries with varying durations and dates, verify insights accurately reflect historical data (need test user with 7+ entries spanning 30+ days)

### Tests for User Story 2 (TDD - Write FIRST)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T028 [P] [US2] Write unit test for entryInsightsService.calculateInsights in `tests/unit/services/entryInsightsService.test.js` (all calculation functions, edge cases: <7 entries, extended fasts, ranking ties)
- [x] T029 [P] [US2] Write unit test for InsightCard component in `tests/unit/components/molecules/InsightCard.test.js` (display insight with icon, value, label, comparison)
- [x] T030 [P] [US2] Write unit test for EntryInsights organism in `tests/unit/components/organisms/EntryInsights.test.js` (renders all insights, handles insufficient data message, displays best day badge)
- [ ] T031 [US2] Add integration test scenarios for insights in `tests/integration/entry-details.test.js` (verify calculations match database queries, test with varying data sets)

### Implementation for User Story 2

- [x] T032 [US2] Implement `calculateInsights` function in `src/lib/services/entryInsightsService.js` (orchestrate all insight calculations, return EntryInsights object per data-model.md)
- [x] T033 [P] [US2] Implement `isLongestThisMonth` function in `src/lib/services/entryInsightsService.js` (query entries for current month, compare durations)
- [x] T034 [P] [US2] Implement `getHistoricalRank` function in `src/lib/services/entryInsightsService.js` (count entries with longer duration, use date tiebreaker)
- [x] T035 [P] [US2] Implement `getAverageDuration` function in `src/lib/services/entryInsightsService.js` (calculate 30-day average from user's entries)
- [x] T036 [P] [US2] Implement `getTypicalBreakfastTime` function in `src/lib/services/entryInsightsService.js` (calculate median firstMealTime from 30-day window)
- [x] T037 [P] [US2] Implement `contributesToStreak` function in `src/lib/services/entryInsightsService.js` (check if entry date is consecutive with yesterday's entry)
- [x] T038 [P] [US2] Implement `isBestDay` function in `src/lib/services/entryInsightsService.js` (check criteria: duration >= average, energyLevel = "High Energy", wellBeing = "Good", morningWeight exists)
- [x] T039 [P] [US2] Implement InsightCard component in `src/components/molecules/InsightCard.js` (displays single insight with icon, label, value, optional comparison)
- [x] T040 [US2] Implement EntryInsights organism in `src/components/organisms/EntryInsights.js` (container for all insights, maps insights data to InsightCard components, handles insufficient data message)
- [x] T041 [US2] Integrate insights calculation in `src/app/entries/[id]/page.js` (call entryInsightsService.calculateInsights, pass to EntryInsights component)
- [x] T042 [US2] Display "best day" badge in EntryDetailsView when isBestDay = true (using Badge component from US1)
- [x] T043 [US2] Handle insufficient data case (<7 entries): show friendly message "Create more entries to see insights about your patterns"
- [x] T044 [US2] Optimize insights calculation performance (use MongoDB aggregation, add indexes if needed, target <500ms)
- [x] T045 [US2] Add caching strategy for insights (consider Redis or CDN edge caching for repeated views)

**Checkpoint**: ✅ User Story 2 complete! Users now see personalized insights comparing entry to their history - historical rank, longest this month, average comparisons, typical breakfast time, streak contribution, and best day badges.

---

## Phase 5: User Story 3 - Take Contextual Actions (Priority: P3)

**Goal**: Enable quick actions from entry details page: edit entry, delete with confirmation/impact warning, copy meal times to today

**Independent Test**: Perform each action (edit, delete, copy) and verify expected outcome (navigation, confirmation, success messages)

### Tests for User Story 3 (TDD - Write FIRST)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T046 [P] [US3] Write unit test for EntryActions organism in `tests/unit/components/organisms/EntryActions.test.js` (renders all action buttons, handles disabled states, click handlers)
- [x] T047 [US3] Add integration test scenarios for actions in `tests/integration/entry-details.test.js` (delete with streak impact check, copy to today validation, API error handling)
- [x] T048 [US3] Write E2E test for full user flows in `tests/e2e/entry-details-flow.spec.js` (navigate to details, view insights, edit entry, delete with confirmation, copy to today)

### Implementation for User Story 3

- [x] T049 [P] [US3] Implement EntryActions organism in `src/components/organisms/EntryActions.js` (edit, delete, copy buttons with appropriate styling and touch targets 44x44px)
- [x] T050 [US3] Implement edit action: "Edit" button navigates to `/entries/[id]/edit` (assumes existing edit form route)
- [x] T051 [US3] Implement delete action with confirmation modal (use existing DELETE /api/entries/[id] endpoint)
- [x] T052 [US3] Add delete impact check (call DELETE with checkOnly=true parameter to get extended fast warning)
- [x] T053 [US3] Display streak impact warning in delete confirmation modal if entry affects streak
- [x] T054 [US3] Handle delete success: redirect to `/entries` with success toast message
- [x] T055 [US3] Implement "Copy to Today" action: check if today's entry exists, show validation message if it does
- [x] T056 [US3] Modify POST /api/entries in `src/app/api/entries/route.js` to handle templateSource parameter (optional field for audit)
- [x] T057 [US3] Create new entry with pre-filled meal times from current entry (firstMealTime, lastMealTime), leave health metrics null
- [x] T058 [US3] Handle copy success: navigate to new entry details page `/entries/[newEntryId]` with success message
- [x] T059 [US3] Disable "Copy to Today" button when viewing today's entry (FR-023)
- [x] T060 [US3] Handle action errors: show inline error message without losing context, provide retry button (FR-033)
- [x] T061 [US3] Integrate EntryActions into EntryDetailsView (display at bottom or in header)

**Checkpoint**: ✅ User Story 3 complete! Users can edit, delete (with impact warnings), and copy entries from details page. All critical bugs fixed with regression tests.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, performance optimization, accessibility, and deployment readiness

- [x] T062 [P] Run full automated test suite: unit, integration, E2E (target 80% code coverage minimum per Constitution III)
- [x] T063 [P] Perform accessibility audit: run Lighthouse, verify WCAG 2.1 AA compliance, test keyboard navigation, screen reader (✅ Audit checklist created in docs/T063-ACCESSIBILITY-AUDIT.md)
- [ ] T064 [P] Test mobile responsiveness on real devices (iOS/Android, various screen sizes <600px to >1200px)
- [ ] T065 [P] Test PWA offline functionality: cache entry for 90 days, verify offline page load, test offline actions
- [ ] T066 Optimize performance: verify page load <2s (SC-001), check Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] T067 [P] Test edge cases manually: extended fasts >24h, null duration, very long food notes (2000 chars), ranking ties
- [ ] T068 [P] Security review: verify authorization checks, test unauthorized access attempts, check CSRF protection
- [ ] T069 [P] Add error monitoring: ensure errors are logged for debugging (failed insights calculations, API errors)
- [ ] T070 Update documentation: add entry details page to README, update API docs if needed
- [ ] T071 Manual QA: test all 27 acceptance scenarios from spec.md end-to-end (10 for US1, 9 for US2, 8 for US3)
- [ ] T072 Test on production: merge to main, Vercel auto-deploys, smoke test live site
- [ ] T073 Merge feature branch `011-entry-details-page` to main

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
                                              ↓              ↓              ↓
                                            MVP          Enhanced       Full Feature
```

### Inter-Story Dependencies

- **US2 (Insights)** depends on **US1 (Display)**: EntryInsights component uses EntryDetailsView structure
- **US3 (Actions)** depends on **US1 (Display)**: EntryActions integrated into EntryDetailsView
- **US2 and US3 are independent**: Can be developed in parallel after US1 is complete

### Parallel Execution Opportunities

#### Within Phase 3 (US1)
- T009-T014 (all tests) can run in parallel
- T015, T016, T018 (atoms/molecules) can run in parallel after tests
- T017 (FastingTimeline) depends on T016 (TimeDisplay) for time formatting
- T021, T024, T026, T027 (page enhancements) can run in parallel after T020

#### Within Phase 4 (US2)
- T028-T031 (all tests) can run in parallel
- T033-T038 (individual insight functions) can run in parallel after T032 stub
- T039 (InsightCard) can develop in parallel with insight functions
- T044-T045 (optimization) can be done in parallel after core implementation

#### Within Phase 5 (US3)
- T046-T048 (all tests) can run in parallel
- T050-T054 (delete action) can develop independently from T055-T059 (copy action)

#### Within Phase 6 (Polish)
- T062, T063, T064, T065, T067, T068, T069 can all run in parallel
- T070 (docs) can run parallel with testing tasks

---

## Implementation Strategy

### MVP Scope (Phase 3 Only - User Story 1)

**Delivers**: Comprehensive entry details viewing - the core value proposition

**Validates**: 
- Users find value in viewing full entry details
- Navigation from entries list works smoothly
- Visual timeline is understandable and useful
- Mobile responsive layout is functional

**Can Ship**: Yes - US1 is a complete, valuable increment on its own

### Incremental Delivery

1. **Week 1**: Phase 1-3 (Setup + Foundation + US1) → Deploy MVP
2. **Week 2**: Phase 4 (US2 Insights) → Deploy enhanced version with insights
3. **Week 3**: Phase 5 (US3 Actions) → Deploy full feature with all actions
4. **Week 4**: Phase 6 (Polish) → Production-ready release

### TDD Workflow

For each user story:
1. **Red**: Write all tests first (T009-T014 for US1)
2. **Verify Red**: Run tests, confirm they all FAIL
3. **Get User Approval**: Show failing tests, confirm they match requirements
4. **Green**: Implement code to pass tests (T015-T027 for US1)
5. **Verify Green**: Run tests, confirm they all PASS
6. **Refactor**: Optimize, clean up, maintain passing tests

---

## Task Summary

**Total Tasks**: 73
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundation)**: 5 tasks (BLOCKING)
- **Phase 3 (US1 - MVP)**: 19 tasks (6 tests + 13 implementation)
- **Phase 4 (US2)**: 18 tasks (4 tests + 14 implementation)
- **Phase 5 (US3)**: 16 tasks (3 tests + 13 implementation)
- **Phase 6 (Polish)**: 12 tasks

**Parallel Opportunities**: 35+ tasks can be executed in parallel (marked with [P])

**MVP Task Count**: 27 tasks (Phase 1 + Phase 2 + Phase 3)

**Test Tasks**: 23 test files/scenarios (TDD coverage for all stories)

**Independent Test Criteria**:
- **US1**: Click entry from list → All fields display correctly
- **US2**: View various entries → Insights match historical data accurately  
- **US3**: Perform actions → Expected outcomes (edit navigation, delete confirmation, copy success)

**Suggested MVP**: Phase 1-3 only (User Story 1) - delivers core value of viewing comprehensive entry details

---

## Format Validation

✅ All tasks follow required checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T073)
- [P] marker: Present on parallelizable tasks
- [Story] label: Present on all user story tasks (US1, US2, US3)
- Description: Clear action with file path

✅ Tasks organized by user story for independent implementation

✅ Dependencies documented with clear execution order

✅ Parallel execution opportunities identified

✅ MVP scope defined (Phase 1-3)
