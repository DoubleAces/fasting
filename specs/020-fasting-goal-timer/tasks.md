# Tasks: Fasting Goal Timer

**Feature**: 020-fasting-goal-timer  
**Input**: Design documents from `/specs/020-fasting-goal-timer/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/post-api-entries.md, quickstart.md

**Tests**: Following TDD approach per constitution - tests written FIRST, must FAIL before implementation

**Organization**: Tasks grouped by user story to enable independent implementation and incremental delivery

## Format: `- [ ] [ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and prepare for implementation

- [x] T001 Verify Feature 017 (Live Fasting Timer) is deployed and functional - check useFastingTimer hook exports elapsedMs
- [x] T002 Verify Entry model in src/lib/models/Entry.js supports schema extensions (Mongoose version 8.19.1+)
- [x] T003 [P] Verify date-fns 4.1.0 is installed and format function available
- [x] T004 [P] Verify lucide-react is installed for CheckCircle icon
- [x] T005 Create src/contexts/ directory if it doesn't exist

**Checkpoint**: Dependencies verified, ready to begin foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Extend Entry Model (Required for US4)

- [x] T006 Add fastingGoal field to Entry schema in src/lib/models/Entry.js (type: Number, min: 1, max: 10080, default: null)
- [x] T007 Add goalStatus field to Entry schema in src/lib/models/Entry.js (type: String, enum: ['completed', 'not-completed', 'no-goal'], default: null)
- [x] T008 Write unit test for Entry model goal fields in tests/unit/lib/models/Entry.test.js - validate ranges and enums
- [x] T009 Run Entry model tests - should PASS (model extension)

### Create Session State Context (Required for US1)

- [x] T010 Write unit test for FastingGoalContext in tests/unit/contexts/FastingGoalContext.test.js - test provider, setGoal, clearGoal, localStorage sync
- [x] T011 Create FastingGoalContext.js in src/contexts/ - implement provider with goalMinutes, setAt state, localStorage integration
- [x] T011b [US1] Add localStorage error handling to FastingGoalContext - show toast notification if setItem() fails, graceful degradation to Context-only
- [x] T012 Run FastingGoalContext tests - should PASS

**Checkpoint**: Foundation complete - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set Fasting Goal (Priority: P1) 🎯 MVP

**Goal**: Users can set a goal using preset buttons (12h, 16h, 18h, 24h) or custom input with validation

**Independent Test**: User clicks "Set Fasting Goal", selects 16h preset, goal is stored in context and displayed

### Tests for User Story 1 (TDD - Write FIRST)

- [ ] T013 [P] [US1] Write component test for GoalSettingPanel in tests/unit/components/GoalSettingPanel.test.js - test preset buttons (4 scenarios)
- [ ] T014 [P] [US1] Write validation tests for custom input in tests/unit/components/GoalSettingPanel.test.js - test valid (14.5h), invalid (0, -5, 200, "abc")
- [ ] T015 [P] [US1] Write test for goal change scenario in tests/unit/components/GoalSettingPanel.test.js - change 16h to 18h
- [ ] T016 [US1] Run GoalSettingPanel tests - should FAIL (component doesn't exist yet)

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create GoalSettingPanel.js in src/components/molecules/ - implement preset buttons (12h, 16h, 18h, 24h) in 2x2 grid
- [ ] T018 [US1] Add custom input field to GoalSettingPanel.js - number input with inputMode="decimal", placeholder "Custom hours"
- [ ] T019 [US1] Implement validation logic in GoalSettingPanel.js - validateGoal function (1-168 hours, parseFloat, error states)
- [ ] T020 [US1] Add error message display to GoalSettingPanel.js - conditional render based on validation state
- [ ] T021 [US1] Connect GoalSettingPanel to FastingGoalContext - import useFastingGoal, call setGoal on button click
- [ ] T022 [US1] Style GoalSettingPanel with Tailwind - bg-white dark:bg-gray-800, rounded-lg, 44px+ touch targets, responsive grid
- [ ] T023 [US1] Run GoalSettingPanel tests - should PASS

### Integration for User Story 1

- [ ] T024 [US1] Modify FastingTimer.js in src/components/organisms/ - add conditional render for GoalSettingPanel when no goal set
- [ ] T025 [US1] Add "Set a goal to track your progress" prompt to FastingTimer.js - display when isActive && !goalMinutes
- [ ] T026 [US1] Wrap entries page with FastingGoalProvider in src/app/entries/page.js
- [ ] T027 [US1] Manual test: Set goal via preset button, verify context updated, localStorage saved

**Checkpoint US1**: Goal setting working - can set via presets or custom input, validation working, session persisted

---

## Phase 4: User Story 2 - View Progress Toward Goal (Priority: P1)

**Goal**: Users see real-time progress bar with "4h 30m / 16h 00m (28%)" format, updates every 60 seconds

**Independent Test**: User with 16h goal and 4.5h elapsed sees progress bar at 28%, percentage displayed

### Tests for User Story 2 (TDD - Write FIRST)

- [ ] T028 [P] [US2] Write test for progress calculation in tests/unit/components/GoalProgressDisplay.test.js - test 28% for 4.5h/16h
- [ ] T029 [P] [US2] Write test for >100% progress in tests/unit/components/GoalProgressDisplay.test.js - test 111% for 20h/18h, green bar
- [ ] T030 [P] [US2] Write test for progress update on timer tick in tests/unit/components/GoalProgressDisplay.test.js - mock elapsedMs change
- [ ] T031 [P] [US2] Write test for goal change recalculation in tests/unit/components/GoalProgressDisplay.test.js - 10h progress, goal 16h→18h
- [ ] T032 [US2] Run GoalProgressDisplay tests - should FAIL (component doesn't exist yet)

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create GoalProgressDisplay.js in src/components/molecules/ - accept elapsedMs, lastMealTime, date props
- [ ] T034 [US2] Implement progress calculation in GoalProgressDisplay.js - useMemo for percentage (elapsedMs / goalMs * 100)
- [ ] T035 [US2] Implement display text formatting in GoalProgressDisplay.js - "Xh Ym / Xh Ym (Z%)" format
- [ ] T036 [US2] Add progress bar UI to GoalProgressDisplay.js - div with dynamic width style, Tailwind transitions
- [ ] T037 [US2] Add percentage display to GoalProgressDisplay.js - render percentage next to progress text
- [ ] T038 [US2] Handle >100% progress in GoalProgressDisplay.js - conditional bg-green-500 vs bg-blue-500, "Goal Exceeded!" text
- [ ] T039 [US2] Add CheckCircle icon from lucide-react for exceeded goals in GoalProgressDisplay.js
- [ ] T040 [US2] Add ARIA attributes to progress bar in GoalProgressDisplay.js - role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax
- [ ] T041 [US2] Run GoalProgressDisplay tests - should PASS

### Integration for User Story 2

- [ ] T042 [US2] Modify FastingTimer.js - add conditional render for GoalProgressDisplay when goalMinutes exists
- [ ] T043 [US2] Pass elapsedMs from useFastingTimer to GoalProgressDisplay in FastingTimer.js
- [ ] T044 [US2] Pass lastMealTime and date props to GoalProgressDisplay in FastingTimer.js
- [ ] T045 [US2] Test progress updates every 60 seconds with existing timer cycle
- [ ] T046 [US2] Manual test: Set 16h goal, wait for timer updates, verify progress bar fills, percentage updates

**Checkpoint US2**: Progress visualization working - bar fills proportionally, percentage displays, >100% handled with green

---

## Phase 5: User Story 3 - See Goal Completion Time (Priority: P1)

**Goal**: Users see "Goal reached at: Oct 29, 12:00 PM" timestamp showing when goal will be met

**Independent Test**: User starts fast at 8:00 PM, sets 16h goal, sees "Goal reached at: [Tomorrow], 12:00 PM"

### Tests for User Story 3 (TDD - Write FIRST)

- [ ] T047 [P] [US3] Write test for completion time calculation in tests/unit/components/GoalProgressDisplay.test.js - verify Date math accuracy
- [ ] T048 [P] [US3] Write test for completion time formatting in tests/unit/components/GoalProgressDisplay.test.js - verify "MMM d, h:mm a" format
- [ ] T049 [P] [US3] Write test for completion time update on goal change in tests/unit/components/GoalProgressDisplay.test.js - 16h→18h changes time
- [ ] T050 [P] [US3] Write test for past completion time display in tests/unit/components/GoalProgressDisplay.test.js - >100% shows past timestamp + checkmark
- [ ] T051 [US3] Run completion time tests - should FAIL (implementation not added yet)

### Implementation for User Story 3

- [ ] T052 [US3] Add completion time calculation to GoalProgressDisplay.js - parse lastMealTime + date, add goalMinutes, create Date object
- [ ] T053 [US3] Format completion time with date-fns in GoalProgressDisplay.js - import format, use 'MMM d, h:mm a' pattern
- [ ] T054 [US3] Add completion time display to GoalProgressDisplay.js - render below progress bar with conditional text
- [ ] T055 [US3] Handle past completion time (>100%) in GoalProgressDisplay.js - show "Goal reached at:" (past tense) with checkmark
- [ ] T056 [US3] Style completion time text in GoalProgressDisplay.js - text-sm text-gray-600, font-semibold for time
- [ ] T057 [US3] Run completion time tests - should PASS

### Integration for User Story 3

- [ ] T058 [US3] Verify completion time displays below progress bar in FastingTimer.js integration
- [ ] T059 [US3] Test completion time remains static (doesn't countdown) during timer updates
- [ ] T060 [US3] Manual test: Set goal, verify completion time shown, change goal, verify time updates immediately

**Checkpoint US3**: Completion time working - absolute timestamp displayed, updates on goal change, past tense for exceeded

---

## Phase 6: User Story 4 - Goal Persistence and Analytics (Priority: P2)

**Goal**: When fast ends, save fastingGoal (minutes) and goalStatus ('completed'|'not-completed'|'no-goal') to Entry

**Independent Test**: User with 16h goal fasts for 18h, ends fast, Entry shows fastingGoal=960, goalStatus='completed'

### Tests for User Story 4 (TDD - Write FIRST)

- [ ] T061 [P] [US4] Write integration test for POST /api/entries with goal data in tests/integration/api/entries.test.js - test completed goal scenario
- [ ] T062 [P] [US4] Write integration test for POST /api/entries incomplete goal in tests/integration/api/entries.test.js - test not-completed status
- [ ] T063 [P] [US4] Write integration test for POST /api/entries no goal in tests/integration/api/entries.test.js - test no-goal status
- [ ] T064 [P] [US4] Write validation test for goal/status consistency in tests/integration/api/entries.test.js - reject goal without status
- [ ] T065 [US4] Run API integration tests - should FAIL (API doesn't accept goal fields yet)

### Implementation for User Story 4

- [ ] T066 [US4] Add fastingGoal and goalStatus to Joi validation schema in src/app/api/entries/route.js POST handler
- [ ] T067 [US4] Add business logic validation in src/app/api/entries/route.js - verify goal/status consistency rules
- [ ] T068 [US4] Extract goal fields from request body in src/app/api/entries/route.js POST handler
- [ ] T069 [US4] Pass goal fields to Entry.create() in src/app/api/entries/route.js - include fastingGoal and goalStatus
- [ ] T070 [US4] Add goal fields to response object in src/app/api/entries/route.js - include in entry JSON response
- [ ] T071 [US4] Run API integration tests - should PASS

### Client-Side Integration for User Story 4

- [ ] T072 [US4] Modify entry submission form handler to include goal data from FastingGoalContext
- [ ] T073 [US4] Calculate goalStatus on client before POST - compare fastingDuration to goalMinutes
- [ ] T074 [US4] Call clearGoal() from FastingGoalContext after successful entry creation
- [ ] T075 [US4] Handle no-goal scenario - send fastingGoal: null, goalStatus: 'no-goal' when goal not set
- [ ] T076 [US4] Test entry creation with goal - verify database document has correct fields
- [ ] T077 [US4] Test localStorage cleared after entry created - verify goal doesn't persist to next fast

**Checkpoint US4**: Persistence working - goal data saved to Entry on fast completion, localStorage cleared

---

## Phase 7: E2E Testing & Integration

**Purpose**: Validate complete user flows across all stories

- [ ] T078 [P] Write E2E test for complete goal flow in tests/e2e/fasting-goal-flow.spec.js - set goal → view progress → reach goal → end fast → verify data
- [ ] T079 [P] Write E2E test for no-goal flow in tests/e2e/fasting-goal-flow.spec.js - start fast without goal → end fast → verify no-goal status
- [ ] T080 [P] Write E2E test for goal change flow in tests/e2e/fasting-goal-flow.spec.js - set 16h → change to 18h → verify recalculation
- [ ] T081 [P] Write E2E test for goal exceeded flow in tests/e2e/fasting-goal-flow.spec.js - set 16h → fast 18h → verify green bar + exceeded indicator
- [ ] T082 [P] Write E2E test for validation edge cases in tests/e2e/fasting-goal-flow.spec.js - try invalid inputs, verify errors
- [ ] T082a [P] Write E2E test for localStorage disabled in tests/e2e/fasting-goal-flow.spec.js - disable localStorage → set goal → refresh → verify goal lost
- [ ] T082b [P] Write unit test for DST transition in tests/unit/components/GoalProgressDisplay.test.js - mock clock change → verify completion time adjusts
- [ ] T082c [P] Write unit test for fast ends before timer update in tests/unit/components/GoalProgressDisplay.test.js - verify goalStatus calculation uses final duration
- [ ] T083 [P] Write E2E test for browser refresh with goal in tests/e2e/fasting-goal-flow.spec.js - set goal → refresh → verify localStorage restore
- [ ] T084 Run all E2E tests with Playwright - should PASS
- [ ] T085 Verify no breaking changes to Feature 017 - run existing timer tests

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, accessibility, performance validation

### Documentation

- [ ] T086 [P] Add JSDoc comments to FastingGoalContext.js - document provider, hooks, state shape
- [ ] T087 [P] Add JSDoc comments to GoalSettingPanel.js - document props, validation rules
- [ ] T088 [P] Add JSDoc comments to GoalProgressDisplay.js - document props, calculations

### Accessibility

- [ ] T089 Verify keyboard navigation works for goal setting - tab through preset buttons, enter to activate
- [ ] T090 Verify screen reader announces goal setting and progress updates
- [ ] T090b Test screen reader announces custom input validation errors - verify aria-live region or aria-describedby for error messages
- [ ] T091 Test with keyboard only (no mouse) - set goal, change goal, verify announcements

### Performance Validation

- [ ] T092 Measure goal setting time - verify <10 seconds (SC-001)
- [ ] T093 Measure progress update delay - verify <1 second after timer tick (SC-002)
- [ ] T094 Measure completion time calculation accuracy - verify <1% error (SC-003)
- [ ] T095 Verify goal data persistence - 100% of entries have correct goal fields (SC-004)
- [ ] T096 Test all edge cases from spec - verify no errors or crashes (SC-005)

### Mobile Testing

- [ ] T097 Test on iOS Safari - verify touch targets, number keyboard, progress bar rendering
- [ ] T098 Test on Android Chrome - verify validation, localStorage, responsive layout
- [ ] T099 Test landscape and portrait orientations - verify layout adapts correctly

### Code Quality

- [ ] T100 Run ESLint on all new files - fix any errors
- [ ] T101 Run Prettier on all new files - ensure consistent formatting
- [ ] T102 Verify test coverage >80% - run jest --coverage
- [ ] T103 Code review checklist - verify all constitution principles followed

---

## Dependencies & Parallel Execution

### User Story Dependencies

```
Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phase 3-6)

Phase 2 (Foundational) BLOCKS all user stories:
  - Entry model extension (T006-T009) required for US4
  - FastingGoalContext (T010-T012) required for US1, US2, US3

User Story Independence:
  US1 (Set Goal) → FOUNDATION for US2, US3, US4
  US2 (Progress) → DEPENDS ON US1 (needs goal to display progress)
  US3 (Completion Time) → DEPENDS ON US1 (needs goal to calculate time)
  US4 (Persistence) → DEPENDS ON US1 (needs goal to save)

Recommended Implementation Order:
  1. Foundational (Phase 2) - COMPLETE FIRST
  2. US1 (Phase 3) - Goal setting - COMPLETE SECOND
  3. US2 + US3 (Phase 4 + 5) - CAN BE PARALLEL (both extend display)
  4. US4 (Phase 6) - Persistence - AFTER US1 working
```

### Parallel Execution Examples

**Phase 2 (Foundational) - 2 parallel tracks**:
```
Track A: Entry Model (T006-T009)
Track B: FastingGoalContext (T010-T012)
Both can run simultaneously (different files)
```

**Phase 3 (US1) - Tests vs Implementation**:
```
Track A: Write all US1 tests (T013-T016) - 4 tasks parallel
Track B: After tests written, implementation (T017-T023) - some parallel
  - T017 (create component) must complete first
  - T018-T021 can be sequential (same file)
  - T022 (styling) can be parallel once T017 done
```

**Phase 4 + 5 (US2 + US3) - Full parallelization**:
```
Track A: US2 Tests (T028-T032) → US2 Implementation (T033-T041) → US2 Integration (T042-T046)
Track B: US3 Tests (T047-T051) → US3 Implementation (T052-T057) → US3 Integration (T058-T060)
Both tracks can run fully in parallel (same component, different features)
```

**Phase 6 (US4) - API vs Client**:
```
Track A: API Tests (T061-T065) → API Implementation (T066-T071)
Track B: After API done, Client Integration (T072-T077)
```

**Phase 7 (E2E) - All parallel**:
```
All E2E tests (T078-T083) can run in parallel (different test files)
```

**Phase 8 (Polish) - Full parallelization**:
```
Track A: Documentation (T086-T088)
Track B: Accessibility (T089-T091)
Track C: Performance (T092-T096)
Track D: Mobile Testing (T097-T099)
Track E: Code Quality (T100-T103)
All tracks can run in parallel
```

---

## Implementation Strategy

### MVP (Minimum Viable Product)

**Scope**: User Story 1 only (Phase 1 + 2 + 3)
- **Tasks**: T001-T027 (27 tasks)
- **Deliverable**: Users can set fasting goals via presets or custom input
- **Value**: Foundation for all other goal features
- **Time Estimate**: 4-6 hours

### Iteration 2 (Add Progress Tracking)

**Scope**: User Story 2 + 3 (Phase 4 + 5)
- **Tasks**: T028-T060 (33 tasks)
- **Deliverable**: Users see real-time progress bar and completion timestamp
- **Value**: Complete user-facing goal experience
- **Time Estimate**: 4-6 hours

### Iteration 3 (Add Persistence)

**Scope**: User Story 4 (Phase 6)
- **Tasks**: T061-T077 (17 tasks)
- **Deliverable**: Goal data saved to database for analytics
- **Value**: Foundation for future analytics features
- **Time Estimate**: 2-3 hours

### Final Polish

**Scope**: E2E Testing + Polish (Phase 7 + 8)
- **Tasks**: T078-T103 (26 tasks)
- **Deliverable**: Production-ready feature with full test coverage
- **Value**: Quality assurance, accessibility, performance validation
- **Time Estimate**: 3-4 hours

**Total Estimated Time**: 13-19 hours

---

## Task Summary

**Total Tasks**: 107
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 8 tasks (BLOCKING) - added T011b
- **Phase 3 (US1 - Set Goal)**: 15 tasks
- **Phase 4 (US2 - Progress)**: 19 tasks
- **Phase 5 (US3 - Completion Time)**: 14 tasks
- **Phase 6 (US4 - Persistence)**: 17 tasks
- **Phase 7 (E2E Testing)**: 11 tasks - added T082a, T082b, T082c
- **Phase 8 (Polish)**: 19 tasks - added T090b

**Parallel Opportunities**: ~43 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- US1: Set goal via preset, verify context updated
- US2: View progress bar at 28% for 4.5h/16h goal
- US3: See "Goal reached at: [timestamp]" below progress
- US4: End fast, verify Entry has fastingGoal=960, goalStatus='completed'

**Suggested MVP**: Phase 1 + 2 + 3 (US1 only) = 27 tasks = Complete goal setting functionality

**TDD Compliance**: All test tasks marked to write FIRST, run (should FAIL), then implement, run again (should PASS)

---

## Validation Checklist

Before marking feature complete:

- [ ] All 107 tasks completed and checked off
- [ ] All unit tests passing (Jest)
- [ ] All integration tests passing (API endpoints)
- [ ] All E2E tests passing (Playwright)
- [ ] Test coverage >80% (constitution requirement)
- [ ] ESLint passing with no errors
- [ ] All 8 success criteria from spec.md validated
- [ ] Manual testing checklist from quickstart.md completed
- [ ] Accessibility tested (keyboard, screen reader)
- [ ] Mobile tested (iOS + Android)
- [ ] No breaking changes to Feature 017 (existing tests pass)
- [ ] Code review approved
- [ ] Documentation complete (JSDoc comments)

**Feature Status**: Ready for production deployment ✅
