# Feature Tasks: Live Fasting Timer

**Feature**: 017-live-fasting-timer  
**Total Tasks**: 54  
**Estimated Time**: 12-16 hours  
**Created**: October 27, 2025

## Task Summary by User Story

- **Phase 1 - Setup**: 5 tasks (0.5 hours)
- **Phase 2 - Foundational**: 7 tasks (1.5 hours)
- **User Story 1 (P1)**: 15 tasks (4-5 hours) [MVP]
- **User Story 3 (P1)**: 8 tasks (2 hours)
- **User Story 2 (P2)**: 11 tasks (3-4 hours)
- **User Story 4 (P2)**: 5 tasks (1 hour)
- **Phase 7 - Polish**: 7 tasks (1.5 hours)

## MVP Scope

**Minimum Viable Product** = Phase 1 + Phase 2 + User Story 1 (P1)

This delivers the core value: a live timer that displays when a user logs their last meal time and updates every 60 seconds.

---

## Phase 1: Setup

**Goal**: Initialize project structure and verify development environment

- [ ] T001 [P] Create component directory structure (atoms/, molecules/, organisms/ if not present) in src/components/
- [ ] T002 [P] Create utilities directory structure (lib/utils/ if not present) in src/lib/
- [ ] T003 [P] Create hooks directory (hooks/ if not present) in src/
- [ ] T004 [P] Verify date-fns installed or identify existing date utility library in package.json
- [ ] T005 [P] Create test directory structure (unit/, components/, e2e/ if not present) in tests/

---

## Phase 2: Foundational

**Goal**: Create utility modules and hooks that all user stories depend on

### Tests (TDD - Write First)

- [ ] T006 [P] Write unit tests for calculateElapsedTime(lastMealTime, now) in tests/unit/fastingTimerUtils.test.js
- [ ] T007 [P] Write unit tests for formatElapsedTime(milliseconds) in tests/unit/fastingTimerUtils.test.js
- [ ] T008 [P] Write unit tests for parseTime(timeString) in tests/unit/fastingTimerUtils.test.js

### Implementation

- [ ] T009 Implement calculateElapsedTime(lastMealTime, now) in src/lib/utils/fastingTimerUtils.js
- [ ] T010 Implement formatElapsedTime(milliseconds) returning {hours, minutes} in src/lib/utils/fastingTimerUtils.js
- [ ] T011 Implement parseTime(timeString) in src/lib/utils/fastingTimerUtils.js
- [ ] T012 Verify 80%+ code coverage for fastingTimerUtils module

---

## Phase 3: User Story 1 (P1) - Core Timer Display [MVP]

**User Story**: As a fasting user, I want to see a live timer on the entries page when I log my last meal time, so I can track my current fasting progress in real-time.

**Independent Test**: Create today's entry with lastMealTime → Timer appears and counts up every 60 seconds → Refresh page → Timer shows correct elapsed time

**Acceptance Criteria**:
- Timer appears when today's entry has lastMealTime
- Timer updates every 60 seconds
- Timer persists across page refreshes
- Timer displays "Fasting for X hours Y minutes"
- Timer positioned as dedicated card at top of entries page

### Tests (TDD - Write First)

- [ ] T013 [P] Write hook tests for useFastingTimer(lastMealTime, isActive) in tests/hooks/useFastingTimer.test.js
- [ ] T014 [P] Write component tests for TimerDisplay showing hours/minutes in tests/components/TimerDisplay.test.js
- [ ] T015 [P] Write component tests for FastingTimer integration in tests/components/FastingTimer.test.js
- [ ] T016 [P] Write component tests for FastingTimerCard wrapper in tests/components/FastingTimerCard.test.js

### Implementation

- [ ] T017 [US1] Implement useFastingTimer(lastMealTime, isActive) hook with 60s interval in src/hooks/useFastingTimer.js
- [ ] T018 [US1] Add cleanup logic to useFastingTimer to clear interval on unmount in src/hooks/useFastingTimer.js
- [ ] T019 [US1] Implement TimerDisplay component showing hours/minutes in src/components/molecules/TimerDisplay.js
- [ ] T020 [US1] Add semantic <time> element with datetime attribute to TimerDisplay in src/components/molecules/TimerDisplay.js
- [ ] T021 [US1] Implement FastingTimer container component integrating useFastingTimer and TimerDisplay in src/components/organisms/FastingTimer.js
- [ ] T022 [US1] Implement FastingTimerCard wrapper with Tailwind styling in src/components/organisms/FastingTimerCard.js
- [ ] T023 [US1] Integrate FastingTimerCard at top of entries page in src/app/entries/page.js
- [ ] T024 [US1] Add conditional rendering (only show if active fast exists) in src/app/entries/page.js

### E2E Testing

- [ ] T025 [US1] Write E2E test: Create entry with lastMealTime → Verify timer appears in tests/e2e/fasting-timer.spec.js
- [ ] T026 [US1] Write E2E test: Timer updates after 60 seconds in tests/e2e/fasting-timer.spec.js
- [ ] T027 [US1] Write E2E test: Refresh page → Timer shows correct elapsed time in tests/e2e/fasting-timer.spec.js

---

## Phase 4: User Story 3 (P1) - Timer Auto-Stop on Fast Break

**User Story**: As a fasting user, when I log my first meal time (breaking my fast), I want the timer to automatically stop, so I see my completed fast duration instead of incorrect ongoing time.

**Independent Test**: Have active fast timer running → Create tomorrow's entry with firstMealTime OR edit today's entry to add firstMealTime → Timer stops and displays "Fast Completed: X hours Y minutes"

**Acceptance Criteria**:
- Timer stops when firstMealTime logged for today
- Timer displays completed duration (not live count)
- Timer updates immediately on entry modification
- Timer disappears if today's entry deleted

### Tests (TDD - Write First)

- [ ] T028 [P] Write unit tests for isFastActive(entry) logic in tests/unit/fastingTimerUtils.test.js
- [ ] T029 [P] Write component tests for FastingTimer with completed state in tests/components/FastingTimer.test.js

### Implementation

- [ ] T030 [US3] Implement isFastActive(entry) checking for lastMealTime without firstMealTime in src/lib/utils/fastingTimerUtils.js
- [ ] T031 [US3] Update useFastingTimer to detect completed fast (isActive=false) in src/hooks/useFastingTimer.js
- [ ] T032 [US3] Update FastingTimer to show "Fast Completed: X hours Y minutes" when stopped in src/components/organisms/FastingTimer.js
- [ ] T033 [US3] Update entries page integration to detect entry changes (add/edit/delete) in src/app/entries/page.js

### E2E Testing

- [ ] T034 [US3] Write E2E test: Active timer → Add firstMealTime → Timer stops with completed duration in tests/e2e/fasting-timer.spec.js
- [ ] T035 [US3] Write E2E test: Active timer → Delete entry → Timer disappears in tests/e2e/fasting-timer.spec.js

---

## Phase 5: User Story 2 (P2) - Progress Visualization

**User Story**: As a fasting user with established history, I want to see a visual progress bar showing my progress toward my typical fasting duration, so I stay motivated and understand how close I am to my goal.

**Independent Test**: Create 10+ entries with consistent 16-hour fasting pattern → Start new fast → Verify progress bar appears showing percentage toward 16 hours → Verify milestone badge appears at 12 hours

**Acceptance Criteria**:
- Progress bar appears for users with 7+ entries in last 30 days
- Progress bar shows percentage toward median duration
- Milestone badges appear at [12, 16, 20, 24, 36, 48] hour marks
- Milestone badges have animated highlight on first appearance
- New users see hint message: "Complete more fasts to unlock progress tracking"

### Tests (TDD - Write First)

- [ ] T036 [P] Write unit tests for calculateTargetDuration(entries, minEntries=7) in tests/unit/progressUtils.test.js
- [ ] T037 [P] Write unit tests for calculateProgress(elapsed, target) in tests/unit/progressUtils.test.js
- [ ] T038 [P] Write unit tests for detectMilestones(elapsedHours, previousMilestones) in tests/unit/milestoneUtils.test.js
- [ ] T039 [P] Write component tests for ProgressBar showing percentage in tests/components/ProgressBar.test.js
- [ ] T040 [P] Write component tests for MilestoneBadge with animation in tests/components/MilestoneBadge.test.js

### Implementation

- [ ] T041 [US2] Implement calculateTargetDuration(entries) using median of last 30 days in src/lib/utils/progressUtils.js
- [ ] T042 [US2] Implement calculateProgress(elapsed, target) returning percentage and remaining in src/lib/utils/progressUtils.js
- [ ] T043 [US2] Implement detectMilestones(elapsedHours) checking [12,16,20,24,36,48] thresholds in src/lib/utils/milestoneUtils.js
- [ ] T044 [US2] Update useFastingTimer to include progress and milestone detection in src/hooks/useFastingTimer.js
- [ ] T045 [US2] Implement ProgressBar component with Tailwind progress styling in src/components/molecules/ProgressBar.js
- [ ] T046 [US2] Implement MilestoneBadge with CSS animation for highlight effect in src/components/atoms/MilestoneBadge.js
- [ ] T047 [US2] Update FastingTimer to conditionally show ProgressBar (if targetDuration exists) in src/components/organisms/FastingTimer.js
- [ ] T048 [US2] Update FastingTimer to display milestone badges in src/components/organisms/FastingTimer.js
- [ ] T049 [US2] Add hint message for new users ("Complete more fasts to unlock progress") in src/components/organisms/FastingTimer.js

### E2E Testing

- [ ] T050 [US2] Write E2E test: User with history → Progress bar appears and fills correctly in tests/e2e/fasting-timer.spec.js
- [ ] T051 [US2] Write E2E test: Timer reaches 12 hours → Milestone badge appears with animation in tests/e2e/fasting-timer.spec.js

---

## Phase 6: User Story 4 (P2) - Timer Status at Page Load

**User Story**: As a fasting user, when I open the entries page, I want the system to intelligently determine if I have an active fast, so I see the correct timer state without manual intervention.

**Independent Test**: Create various entry scenarios (today with lastMealTime only, today with both meals, no today entry, yesterday's fast) → Load entries page → Verify correct timer state for each scenario

**Acceptance Criteria**:
- Timer appears if today's entry exists with lastMealTime only
- No timer if today's entry has both firstMealTime and lastMealTime
- No timer if no entry for today
- No timer for yesterday's incomplete fasts

### Tests (TDD - Write First)

- [ ] T052 [P] Write unit tests for getActiveFast(entries, today) in tests/unit/fastingTimerUtils.test.js

### Implementation

- [ ] T053 [US4] Implement getActiveFast(entries, today) filtering for today with lastMealTime only in src/lib/utils/fastingTimerUtils.js
- [ ] T054 [US4] Update entries page to call getActiveFast on mount and entry changes in src/app/entries/page.js

### E2E Testing

- [ ] T055 [US4] Write E2E test scenarios for all page load states (active, completed, no entry, yesterday) in tests/e2e/fasting-timer.spec.js

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Ensure accessibility, performance, and code quality standards are met

- [ ] T056 Run Lighthouse accessibility audit on entries page with active timer
- [ ] T057 Fix any accessibility issues (target: WCAG 2.1 AA compliance)
- [ ] T058 Add ARIA live region with polite announcements for timer updates in src/components/molecules/TimerDisplay.js
- [ ] T059 Verify timer update performance (<100ms calculation time)
- [ ] T060 Test timer on mobile devices (320px to 768px viewport)
- [ ] T061 Run full test suite and verify 80%+ code coverage
- [ ] T062 Final code review and merge to main

---

## Dependency Graph

### Story Completion Order

```
Phase 1: Setup (5 tasks)
  ↓
Phase 2: Foundational (7 tasks) [BLOCKING - All stories depend on this]
  ↓
  ├─→ User Story 1 (P1) - Core Timer [15 tasks] [MVP]
  │     ↓
  │   User Story 3 (P1) - Auto-Stop [8 tasks] [Depends on US1]
  │
  └─→ User Story 2 (P2) - Progress [11 tasks] [Depends on Foundational]
        ↓
      User Story 4 (P2) - Page Load [5 tasks] [Can run parallel with US2]
        ↓
Phase 7: Polish (7 tasks) [After all features complete]
```

### Parallel Execution Opportunities

**Within Phase 1 (Setup)**: All 5 tasks can run in parallel (T001-T005 all marked [P])

**Within Phase 2 (Foundational Tests)**: T006, T007, T008 can run in parallel (all marked [P])

**Within User Story 1 (Tests)**: T013, T014, T015, T016 can run in parallel (all marked [P])

**Within User Story 2 (Tests)**: T036, T037, T038, T039, T040 can run in parallel (all marked [P])

**Between User Stories**:
- User Story 2 (P2) can start immediately after Phase 2 completes (does NOT depend on User Story 1)
- User Story 4 (P2) can run in parallel with User Story 2 implementation

**Implementation Order Recommendation**:
1. Phase 1 + Phase 2 (Foundational) - Sequential for learning curve
2. User Story 1 (MVP) - Complete fully for early validation
3. User Story 3 (Auto-stop) - Builds directly on User Story 1
4. User Story 2 + User Story 4 in parallel - Both independent features
5. Phase 7 (Polish) - Final pass

---

## Testing Strategy

**Test-Driven Development (TDD)**: All tests must be written BEFORE implementation

**Coverage Target**: 80%+ code coverage required per constitution

**Test Organization**:
- **Unit Tests** (3 files): Pure logic functions (calculations, formatting, parsing)
- **Component Tests** (5 files): React components in isolation with mocked dependencies
- **Hook Tests** (1 file): Custom hook behavior with React Testing Library
- **E2E Tests** (1 file): User flows from entry creation to timer display

**Test Execution**:
```bash
# Run unit tests only
npm test -- tests/unit/

# Run component tests only
npm test -- tests/components/

# Run E2E tests only
npm test -- tests/e2e/

# Run all tests with coverage
npm test -- --coverage
```

---

## Notes

- **TDD Mandatory**: Per constitution, write tests before implementation
- **Mobile-First**: Ensure timer is responsive (320px to 1920px+)
- **Accessibility**: WCAG 2.1 AA compliance required
- **Performance**: Timer update <100ms, initial render <2s
- **No Database Changes**: All data from existing Entry model
- **No API Changes**: Client-side calculations only
- **Atomic Design**: Follow atoms → molecules → organisms pattern
- **60s Updates**: Timer refreshes every 60 seconds (not real-time)
- **Bundle Size**: Keep total feature <50KB

---

## Success Metrics

- [ ] All 54 tasks completed with checkmarks
- [ ] 80%+ code coverage achieved
- [ ] All E2E tests passing
- [ ] Lighthouse accessibility score 90+
- [ ] Timer update <100ms on average device
- [ ] Mobile responsive on 320px viewport
- [ ] Zero console errors or warnings
- [ ] Code review approved
- [ ] Feature merged to main branch

---

**Ready for Implementation**: ✅ Yes  
**Next Command**: `/speckit.analyze` (after tasks complete)
