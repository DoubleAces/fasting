# Tasks: Biological Fasting Stages Timeline

**Input**: Design documents from `/specs/026-biological-fasting-stages/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Included - Feature requires TDD approach per Constitution III (80% coverage minimum)

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test fixtures for all user stories

- [X] T001 Create test directory structure: `tests/unit/lib/constants/`, `tests/unit/lib/utils/`, `tests/unit/hooks/`, `tests/components/atoms/`, `tests/components/molecules/`, `tests/components/organisms/`, `tests/integration/`
- [X] T002 [P] Create shared test fixtures in `tests/fixtures/fastingStagesFixtures.js` with testElapsedTimes and expectedStageIndices constants
- [X] T003 [P] Create source directory structure: `src/lib/constants/`, `src/lib/utils/`, `src/hooks/`, `src/components/atoms/`, `src/components/molecules/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core stage configuration and calculation logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (TDD - Write These First)

- [X] T004 [P] Write unit tests for FASTING_STAGES configuration in `tests/unit/lib/constants/fastingStages.test.js` (5 tests: exactly 8 stages, starts at 0, non-overlapping ranges, last stage unbounded, all required fields present)
- [X] T005 [P] Write unit tests for calculateTimelineState in `tests/unit/lib/utils/stageUtils.test.js` (10-12 tests: fed state calculation, progress within stage, exact boundary transitions, all 8 boundaries, 72+ hour handling, invalid input handling, stagesCompleted/stagesUpcoming population)
- [X] T006 [P] Write unit tests for useStageCalculation hook in `tests/unit/hooks/useStageCalculation.test.js` (5-8 tests: null input handling, valid calculation, memoization preservation, recalculation on change)

### Implementation (After Tests Fail)

- [X] T007 [P] Implement 8 fasting stages configuration in `src/lib/constants/fastingStages.js` with scientifically accurate descriptions, biological processes, and sources (Fed State 0-4hr, Early Fasting 4-8hr, Glycogen Depletion 8-12hr, Early Ketosis 12-16hr, Full Ketosis 16-24hr, Autophagy Activation 24-48hr, Deep Autophagy 48-72hr, Extended Fasting 72+hr)
- [X] T008 Implement calculateTimelineState function in `src/lib/utils/stageUtils.js` with stage boundary detection, progress calculation, and edge case handling (null inputs, exact boundaries, 72+ hours)
- [X] T009 Implement useStageCalculation hook in `src/hooks/useStageCalculation.js` with useMemo optimization and null handling

**Checkpoint**: ✅ Foundation ready - 35 foundational tests passing (5 config + 20 utils + 10 hook)

---

## Phase 3: User Story 1 - View Current Fasting Stage with Biological Context (Priority: P1) 🎯 MVP

**Goal**: Display vertical timeline with 8 biological stages, highlight current stage prominently, show completed stages lighter above and upcoming stages lighter below, display hour milestones and scientific descriptions

**Independent Test**: Create an active fast (e.g., 14 hours), verify timeline displays with 12-16hr stage highlighted, stages before 12hr lighter (completed), stages after 16hr lighter (upcoming), all stages show hour ranges and biological descriptions

### Tests for User Story 1 (TDD - Write These First)

- [X] T010 [P] [US1] Write unit tests for StageProgressBar in `tests/components/atoms/StageProgressBar.test.js` (3 tests: 0% progress, 50% progress, 100% progress with aria-valuenow validation)
- [X] T011 [P] [US1] Write unit tests for StageCard in `tests/components/molecules/StageCard.test.js` (4 tests: renders title and description, highlights current stage, shows progress bar when current, hides progress bar when not current)
- [X] T012 [P] [US1] Write unit tests for BiologicalStagesTimeline in `tests/components/organisms/BiologicalStagesTimeline.test.js` (4-6 tests: renders all 8 stages, highlights current stage, returns null when elapsedMs is null, scrollIntoView called on mount)
- [X] T013 [P] [US1] Write E2E test for 14-hour fast scenario in `tests/e2e/biological-stages-timeline.spec.js` (US1-AS1: verify Early Ketosis stage highlighted with progress bar visible)

### Implementation for User Story 1 (After Tests Fail)

- [X] T014 [P] [US1] Create StageProgressBar atom component in `src/components/atoms/StageProgressBar.js` with gradient progress bar, ARIA attributes (role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax), and percentage calculation
- [X] T015 [P] [US1] Create StageCard molecule component in `src/components/molecules/StageCard.js` with conditional styling (darker bg + 2px purple border when current, lighter bg + 1px border when not), hour range display, biological processes list, and StageProgressBar integration
- [X] T016 [US1] Create BiologicalStagesTimeline organism component in `src/components/organisms/BiologicalStagesTimeline.js` with useStageCalculation hook, map over FASTING_STAGES, render StageCard for each stage, null handling when no active fast
- [X] T017 [US1] Integrate BiologicalStagesTimeline into FastingTimer in `src/components/organisms/FastingTimer.js` by adding timeline as child component below existing timer display, passing elapsedMs prop, conditional rendering when isActive

**Checkpoint**: ✅ User Story 1 MVP Complete - 46 tests passing (35 foundational + 11 component). Timeline integrated into FastingTimer and displays all 8 biological stages with current stage highlighting.

---

## Phase 4: User Story 2 - Track Progress Within Current Stage (Priority: P1) 🎯 MVP

**Goal**: Display visual progress indicator within current stage showing hours progressed and percentage completion (e.g., "2 hours into this stage" or "50% through this stage")

**Independent Test**: Create 14hr fast (50% through 12-16hr stage), verify progress bar shows ~50% and text indicator shows hours into stage

### Tests for User Story 2 (TDD - Write These First)

- [X] T018 [P] [US2] Write E2E test for progress bar at 50% in `tests/e2e/biological-stages-timeline.spec.js` (US2-AS2: verify 14hr fast shows progress bar at ~50% with aria-valuenow="50")
- [X] T019 [P] [US2] Write integration test for progress updates in `tests/integration/FastingTimerWithTimeline.test.js` (verify progress bar updates when elapsed time changes, verify progress calculation accuracy within 1%)

### Implementation for User Story 2 (After Tests Fail)

- [X] T020 [US2] Add progress text indicator to StageCard in `src/components/molecules/StageCard.js` displaying "X hours into this stage" below progress bar (calculate from timelineState.hoursIntoStage)
- [X] T021 [US2] Add progress percentage display to StageCard showing "X% through this stage" using timelineState.progressWithinStage * 100
- [X] T022 [US2] Enhance StageProgressBar in `src/components/atoms/StageProgressBar.js` with smooth transition animation (transition-all duration-1000) for progress updates

**Checkpoint**: Run `npx playwright test tests/e2e/biological-stages-timeline.spec.js` to verify User Story 2 E2E test passes. Manually verify progress indicator updates every 60 seconds during active fast.

---

## Phase 5: User Story 3 - Scroll Through Full Timeline with Current Stage Visible (Priority: P2)

**Goal**: Make timeline scrollable to accommodate all 8 stages, auto-position to show current stage on page load, maintain visual emphasis on current stage during scroll

**Independent Test**: Create 20hr fast (Full Ketosis stage), verify timeline auto-scrolls to show Full Ketosis stage centered/visible, manually scroll up to see completed stages (Fed State, Early Fasting, etc.), verify current stage remains highlighted

### Tests for User Story 3 (TDD - Write These First)

- [X] T023 [P] [US3] Write E2E test for auto-scroll behavior in `tests/e2e/biological-stages-timeline.spec.js` (US3-AS1: verify current stage is visible in viewport after page load without manual scrolling) - SKIPPED: Auto-scroll already tested in Phase 3
- [X] T024 [P] [US3] Write component test for scroll preservation in `tests/components/organisms/BiologicalStagesTimeline.test.js` (verify scrollIntoView called once on mount, not on every timer update) - SKIPPED: Already covered by existing tests

### Implementation for User Story 3 (After Tests Fail)

- [X] T025 [US3] Add scroll behavior to BiologicalStagesTimeline in `src/components/organisms/BiologicalStagesTimeline.js` using useRef for current stage element, useEffect with scrollIntoView({ behavior: 'smooth', block: 'center' }), hasScrolled ref to prevent repeated scrolling - COMPLETED in Phase 3
- [X] T026 [US3] Add prefers-reduced-motion support to scroll behavior checking `window.matchMedia('(prefers-reduced-motion: reduce)')` and using 'auto' instead of 'smooth' - COMPLETED in Phase 3
- [X] T027 [US3] Add scrollable container styling to BiologicalStagesTimeline with `max-h-[600px] overflow-y-auto` classes and custom-scrollbar styling - SKIPPED: Not needed, 7 compact stages fit on screen
- [X] T028 [US3] Add custom scrollbar styles to `src/styles/globals.css` with webkit-scrollbar styling (8px width, purple-pink gradient thumb, transparent track) - SKIPPED: Not needed, no scroll container

**Checkpoint**: ✅ Phase 5 Complete - Auto-scroll behavior already implemented in Phase 3. Scrollable container deemed unnecessary for compact 7-stage design.

---

## Phase 6: User Story 4 - Understand Stage Transitions and Milestones (Priority: P3)

**Goal**: Display clear stage boundaries with hour ranges, show visual feedback when transitioning between stages, make milestone achievements obvious

**Independent Test**: Simulate fast at 11.9 hours (near boundary), wait for transition to 12.1 hours, verify highlighting shifts from Glycogen Depletion to Early Ketosis stage with previous stage becoming lighter

### Tests for User Story 4 (TDD - Write These First)

- [X] T029 [P] [US4] Write E2E test for stage transition in `tests/e2e/biological-stages-timeline.spec.js` (US4-AS1: verify stage highlighting shifts when crossing 16hr boundary from Early Ketosis to Full Ketosis) - 2 test scenarios added
- [X] T030 [P] [US4] Write unit test for exact boundary handling in `tests/unit/lib/utils/stageUtils.test.js` (verify user at exactly 12.0 hours enters next stage with progressWithinStage = 0) - Already covered by existing boundary tests

### Implementation for User Story 4 (After Tests Fail)

- [X] T031 [US4] Add stage boundary visual separators to StageCard in `src/components/molecules/StageCard.js` with border-b border-purple-500/10 between cards
- [X] T032 [US4] Enhance hour range display in StageCard to show clear boundaries with prominent typography (text-sm font-semibold text-purple-600 for current stage)
- [X] T033 [US4] Add milestone achievement indicator to completed stages in StageCard with green checkmark (✓) for stages before currentStageIndex
- [X] T034 [US4] Add transition explanation to stage descriptions - SKIPPED: Descriptions already clear and minimal per user preference

**Checkpoint**: ✅ Phase 6 Complete - Visual separators, enhanced hour range styling, and milestone checkmarks implemented. 12 component tests passing. E2E tests ready for Playwright execution.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, accessibility, performance, documentation

- [ ] T035 [P] Add accessibility enhancements: semantic HTML (`<ol>` for timeline, `<article>` for stages), ARIA labels (aria-current="true" for current stage), keyboard navigation support
- [ ] T036 [P] Add performance optimizations: React.memo for StageCard with custom comparison function (only re-render if isCurrent or progress changes), useMemo in useStageCalculation
- [ ] T037 [P] Write E2E test for 72+ hour fast in `tests/e2e/biological-stages-timeline.spec.js` (US1-AS5: verify Extended Fasting stage highlighted showing 72+ hours)
- [ ] T038 [P] Write E2E test for sub-1-hour fast edge case (verify Fed State stage shown as current with minimal progress)
- [ ] T039 [P] Add error handling for missing stage configuration: console.error in stageUtils.js if FASTING_STAGES is empty, fallback message in BiologicalStagesTimeline
- [ ] T039b [P] Write E2E test for stage data load error in `tests/e2e/biological-stages-timeline.spec.js` (verify fallback error message "Unable to load fasting stages. Please refresh the page." displayed when stage configuration fails to load)
- [ ] T040 Add color contrast validation: ensure all text meets WCAG AA standards (4.5:1 minimum), test with accessibility tools
- [ ] T041 Add mobile touch optimization: ensure timeline scrolls smoothly on touch devices, verify 44px minimum tap targets for future interactive elements
- [ ] T042 Verify CLAUDE.md contains Feature 026 tech stack entry (JavaScript ES6+, React 19.1.0, Next.js 15.5.6, client-side timeline); add if missing
- [ ] T043 [P] Run full test suite with coverage: `npm test -- --coverage` and verify 80%+ coverage on all new files (fastingStages.js, stageUtils.js, useStageCalculation.js, all components)
- [ ] T044 Run Lighthouse audit on dashboard page with active fast: verify Performance >90, Accessibility 100, no regressions from baseline
- [ ] T045 Follow quickstart.md validation steps: manual testing on 3+ devices (iPhone SE, iPad, Desktop), verify all success criteria SC-001 through SC-010 met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion - MVP foundation
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) and User Story 1 completion (extends StageCard/StageProgressBar)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) and User Story 1 completion (adds scroll to BiologicalStagesTimeline)
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) and User Story 1 completion (enhances StageCard visuals)
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core MVP - Must complete first. Depends only on Foundational (Phase 2)
- **User Story 2 (P1)**: Extends User Story 1 components. Can start after US1 component files created (T014-T017)
- **User Story 3 (P2)**: Adds scroll to User Story 1 timeline. Can start after US1 BiologicalStagesTimeline created (T016)
- **User Story 4 (P3)**: Enhances User Story 1 visuals. Can start after US1 StageCard created (T015)

**Note**: User Stories 2, 3, 4 all extend User Story 1 components but modify different aspects:
- US2: Modifies StageProgressBar and StageCard (progress text)
- US3: Modifies BiologicalStagesTimeline (scroll behavior)
- US4: Modifies StageCard (boundaries, milestones)

### Within Each Phase

**Phase 2 (Foundational)**:
1. Tests first: T004, T005, T006 can run in parallel
2. After tests fail: T007, T008 can run in parallel (different files)
3. After T007, T008 pass tests: T009 (depends on T008)

**Phase 3 (User Story 1)**:
1. Tests first: T010, T011, T012, T013 can run in parallel
2. After tests fail: T014, T015 can run in parallel (different files)
3. After T014, T015 pass tests: T016 (depends on T014, T015)
4. After T016 passes tests: T017 (modifies existing FastingTimer)

**Phase 4 (User Story 2)**:
1. Tests first: T018, T019 can run in parallel
2. After tests fail: T020, T021, T022 modify existing components (sequential)

**Phase 5 (User Story 3)**:
1. Tests first: T023, T024 can run in parallel
2. After tests fail: T025, T026, T027 modify BiologicalStagesTimeline (sequential), T028 modifies globals.css (parallel)

**Phase 6 (User Story 4)**:
1. Tests first: T029, T030 can run in parallel
2. After tests fail: T031, T032, T033, T034 modify StageCard (sequential)

**Phase 7 (Polish)**:
- All tasks T035-T041 can run in parallel (different concerns)
- T042 is a verification task (check CLAUDE.md)
- T043, T044, T045 are validation tasks (run after all implementation)

### Parallel Opportunities

- **Setup (Phase 1)**: T002, T003 in parallel
- **Foundational tests**: T004, T005, T006 in parallel
- **Foundational implementation**: T007, T008 in parallel
- **User Story 1 tests**: T010, T011, T012, T013 in parallel
- **User Story 1 atoms/molecules**: T014, T015 in parallel
- **User Story 2 tests**: T018, T019 in parallel
- **User Story 3 tests**: T023, T024 in parallel
- **User Story 3 CSS**: T028 parallel with T025-T027
- **User Story 4 tests**: T029, T030 in parallel
- **Polish**: T035, T036, T037, T038, T039, T039b, T040, T041, T042 in parallel

### Parallel Team Strategy

With multiple developers (after Foundational Phase 2 complete):

**Developer A**: User Story 1 (T010-T017) → MVP complete
**Developer B**: User Story 2 (T018-T022) → After Dev A creates StageCard/StageProgressBar
**Developer C**: User Story 3 (T023-T028) → After Dev A creates BiologicalStagesTimeline
**Developer D**: User Story 4 (T029-T034) → After Dev A creates StageCard

Or sequentially for solo developer: Phase 2 → US1 → US2 → US3 → US4 → Polish

---

## Parallel Example: Foundational Phase

```bash
# Terminal 1: Write stage configuration tests
npm test -- --watch tests/unit/lib/constants/fastingStages.test.js

# Terminal 2: Write stage calculation tests (parallel)
npm test -- --watch tests/unit/lib/utils/stageUtils.test.js

# Terminal 3: Write hook tests (parallel)
npm test -- --watch tests/unit/hooks/useStageCalculation.test.js

# After all tests written and failing:

# Terminal 1: Implement stage configuration
# Edit src/lib/constants/fastingStages.js

# Terminal 2: Implement stage calculations (parallel - different file)
# Edit src/lib/utils/stageUtils.js
```

## Parallel Example: User Story 1 Implementation

```bash
# After all US1 tests written and failing:

# Terminal 1: Create StageProgressBar atom
# Edit src/components/atoms/StageProgressBar.js

# Terminal 2: Create StageCard molecule (parallel - different file)
# Edit src/components/molecules/StageCard.js

# After both components pass tests:

# Terminal 3: Create BiologicalStagesTimeline organism
# Edit src/components/organisms/BiologicalStagesTimeline.js (depends on T014, T015)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) → 30 minutes
2. Complete Phase 2: Foundational (T004-T009) → 3-4 hours
3. **VALIDATE**: Run `npm test -- tests/unit/` → all 20-25 tests passing
4. Complete Phase 3: User Story 1 (T010-T017) → 4-5 hours
5. **VALIDATE**: Run `npm test -- tests/components/` and E2E test → US1 tests passing
6. **STOP and DEMO**: Timeline displays all 8 stages, current stage highlighted, biological descriptions visible
7. Deploy MVP if ready (US1 provides core educational value)

**Total MVP Time**: 8-10 hours

### Incremental Delivery (All User Stories)

1. Complete Setup + Foundational → Foundation ready (4-5 hours)
2. Add User Story 1 → Test independently → Deploy/Demo MVP (4-5 hours)
3. Add User Story 2 → Test independently → Deploy (2-3 hours)
4. Add User Story 3 → Test independently → Deploy (3-4 hours)
5. Add User Story 4 → Test independently → Deploy (3-4 hours)
6. Polish Phase → Final validation → Deploy (2-3 hours)

**Total Time**: 18-24 hours (matches quickstart.md estimate of 16-20 hours)

### Recommended Approach

**Week 1**: Setup + Foundational + US1 → MVP deployed showing biological stages timeline
**Week 2**: US2 + US3 → Enhanced with progress tracking and scroll behavior
**Week 3**: US4 + Polish → Final features and validation

Each user story adds incremental value:
- **US1**: Core timeline with stage highlighting (MVP)
- **US2**: Progress indicators within stages (enhanced tracking)
- **US3**: Scroll behavior and mobile optimization (UX polish)
- **US4**: Visual transitions and milestones (engagement)

---

## Checkpoint Validations

### After Phase 2 (Foundational)
```bash
npm test -- tests/unit/
# Expected: 20-25 tests passing (5 config + 10-12 utils + 5-8 hook)
# Coverage: 80%+ on fastingStages.js, stageUtils.js, useStageCalculation.js
```

### After Phase 3 (User Story 1)
```bash
npm test -- tests/components/
# Expected: 11-13 tests passing (3 StageProgressBar + 4 StageCard + 4-6 BiologicalStagesTimeline)

npx playwright test tests/e2e/biological-stages-timeline.spec.js
# Expected: 1 E2E test passing (US1-AS1: 14hr fast scenario)

npm run dev
# Manual: Navigate to dashboard, start fast, verify timeline displays
```

### After Phase 4 (User Story 2)
```bash
npx playwright test tests/e2e/biological-stages-timeline.spec.js
# Expected: 2 E2E tests passing (US1-AS1, US2-AS2)

npm test -- tests/integration/
# Expected: 5 integration tests passing (progress updates)
```

### After Phase 5 (User Story 3)
```bash
npx playwright test tests/e2e/biological-stages-timeline.spec.js
# Expected: 3 E2E tests passing (US1-AS1, US2-AS2, US3-AS1)

# Manual: Test scroll on mobile (320px), tablet (768px), desktop (1024px)
```

### After Phase 6 (User Story 4)
```bash
npx playwright test tests/e2e/biological-stages-timeline.spec.js
# Expected: 4 E2E tests passing (US1-AS1, US2-AS2, US3-AS1, US4-AS1)
```

### After Phase 7 (Polish)
```bash
npm test -- --coverage
# Expected: 39-48 total tests passing, 80%+ coverage

npx playwright test
# Expected: All 6 E2E scenarios passing (including US1-AS5: 72+hr fast, T039b: error fallback)

# Lighthouse audit (Performance >90, Accessibility 100)
# Manual testing on 3+ devices
```

---

## Notes

- **TDD Workflow**: ALL test tasks marked "Write tests" must be completed and FAIL before implementation tasks
- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1, US2, US3, US4)
- **File paths**: All paths are explicit and absolute from repository root
- **Constitution compliance**: 80% test coverage mandatory (Constitution III), mobile-first design (Constitution II)
- **Independence**: Each user story can be tested and deployed independently after foundational phase
- **Scientific accuracy**: Stage descriptions verified against minimum 3 sources (FR-004, SC-003)
- **Zero database changes**: All calculations client-side, no API modifications (per plan.md)
- **Commit strategy**: Commit after each task or logical group (e.g., after T009, after T017, after T022)
- **Stop points**: Validate at each checkpoint before proceeding to next phase

---

## Success Metrics

**Coverage Target**: 80% minimum (Constitution III)
- Unit tests: 20-25 tests → fastingStages.js, stageUtils.js, useStageCalculation.js
- Component tests: 11-13 tests → StageProgressBar, StageCard, BiologicalStagesTimeline
- Integration tests: 5 tests → FastingTimer integration
- E2E tests: 5 tests → Full user journeys

**Total Estimated Tests**: 42-49 tests (exceeds quickstart.md estimate of 35-45, includes T039b for error fallback)

**Performance Targets**:
- Timeline render: <500ms initial load (SC-009)
- Stage updates: 60-second interval (SC-004)
- Progress accuracy: ±1% (SC-006)
- Lighthouse Performance: >90
- Lighthouse Accessibility: 100

**Deliverable**: Fully functional biological fasting stages timeline integrated into existing fasting timer, showing 8 scientifically accurate stages with current stage highlighting, progress tracking, scroll behavior, and stage transitions.
