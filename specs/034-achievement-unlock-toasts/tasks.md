# Tasks: Achievement Unlock Toast Notifications

**Input**: Design documents from `/specs/034-achievement-unlock-toasts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Implementation Strategy

**MVP Scope**: User Story 1 (Single Achievement Unlock) is the minimum viable product.

**Incremental Delivery**:
1. **MVP (US1)**: Single achievement toast with basic formatting - delivers core value
2. **Enhanced (US2)**: Multiple achievement handling - handles common edge case
3. **Polish (US3)**: Rarity-based visual styling - improves user engagement
4. **Robust (US4)**: Error handling and edge cases - production-ready

Each user story can be implemented, tested, and deployed independently.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of dependencies

- [x] T001 Verify Feature 021 (Toast Notification System) is functional by opening browser DevTools console and running: `const { showSuccess } = useToast(); showSuccess('Test toast');` - verify toast appears and auto-dismisses
- [x] T002 Verify Feature 032 (Achievement Unlock API Response) returns unlockedAchievements array by opening Network tab, creating a fasting entry, inspecting POST /api/entries response body for unlockedAchievements field (should be array, may be empty)
- [x] T003 [P] Verify /achievements page exists by navigating to http://localhost:3000/achievements in browser - page should load without 404 error

**Checkpoint**: All dependencies confirmed - ready to implement achievement toast logic

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core helper function that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create src/lib/utils/achievementToast.js file with module exports structure
- [x] T005 [P] Implement getRarityEmoji(rarity) function in src/lib/utils/achievementToast.js with rarity-to-emoji mapping (Common=🏆, Rare=⭐, Epic=🎉, Legendary=✨)
- [x] T006 Implement formatAchievementToast(achievements) function skeleton in src/lib/utils/achievementToast.js with input validation and error handling wrapper

**Checkpoint**: Helper foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Single Achievement Unlock Notification (Priority: P1) 🎯 MVP

**Goal**: Display a celebratory toast notification when a user unlocks a single achievement, showing the achievement name, icon, points, and rarity. This is the minimum viable product that delivers core value.

**Independent Test**: Create a fasting entry that unlocks the "First 12-Hour Fast" achievement. Verify toast appears with format: "🏆 Achievement Unlocked! First 12-Hour Fast - 10 points (Common)". Toast auto-dismisses after 5 seconds. Click "View Achievements" button navigates to /achievements page.

### Implementation for User Story 1

- [x] T007 [P] [US1] Write unit test for formatAchievementToast() with single achievement in tests/unit/lib/achievementToast.test.js
- [x] T008 [P] [US1] Write unit test for getRarityEmoji() covering all rarity levels in tests/unit/lib/achievementToast.test.js
- [x] T009 [US1] Implement single achievement formatting logic in formatAchievementToast() in src/lib/utils/achievementToast.js (format: "[emoji] Achievement Unlocked! [name] - [points] points ([rarity])")
- [x] T010 [US1] Add import for formatAchievementToast and useRouter in src/components/organisms/EntryForm.js
- [x] T011 [US1] Locate success handler after API response in submitFormWithData() function in src/components/organisms/EntryForm.js (search for showSuccess call after API response - line numbers may vary)
- [x] T012 [US1] Add achievement toast logic after standard success toast in src/components/organisms/EntryForm.js: check result.unlockedAchievements?.length > 0, call formatAchievementToast(), show toast with action button
- [x] T013 [US1] Wrap achievement toast logic in try-catch block in src/components/organisms/EntryForm.js to prevent breaking entry save flow
- [x] T014 [US1] Add router.push('/achievements') to action button onAction callback in src/components/organisms/EntryForm.js
- [x] T015 [US1] Write integration test for EntryForm with single achievement unlock in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T016 [US1] Test that no achievement toast displays when unlockedAchievements is empty array in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T016a [US1] Write integration test verifying standard success toast displays alongside achievement toast (FR-013) in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T017 [US1] Run all unit tests: npm test -- --testPathPattern=achievementToast.test.js
- [x] T018 [US1] Run integration tests: npm test -- --testPathPattern=EntryForm.achievement-toasts.test.js
- [ ] T019 [US1] Manual QA: Create entry that unlocks single achievement and verify toast display, auto-dismiss, and navigation
- [ ] T020 [US1] Manual QA: Create entry without achievement unlock and verify only standard success toast appears

**Checkpoint**: At this point, User Story 1 should be fully functional - single achievement toasts work end-to-end

---

## Phase 4: User Story 2 - Multiple Achievement Unlocks (Priority: P1)

**Goal**: Handle scenarios where users unlock 2+ achievements simultaneously by displaying a consolidated toast listing all achievements with total points.

**Independent Test**: Create a fasting entry that unlocks 2 achievements (e.g., "First 12-Hour Fast" + "First Entry Logged"). Verify consolidated toast appears with format: "🏆 2 Achievements Unlocked! First 12-Hour Fast (10 pts) • First Entry Logged (5 pts) (+15 pts total)". For 4+ achievements, verify truncation to 3 achievements + "and X more...".

### Implementation for User Story 2

- [x] T021 [P] [US2] Write unit test for formatAchievementToast() with 2 achievements in tests/unit/lib/achievementToast.test.js
- [x] T022 [P] [US2] Write unit test for formatAchievementToast() with 4+ achievements verifying truncation in tests/unit/lib/achievementToast.test.js
- [x] T023 [US2] Implement multiple achievement formatting logic in formatAchievementToast() in src/lib/utils/achievementToast.js: calculate totalPoints, format names as "Name (X pts) • Name (Y pts)"
- [x] T024 [US2] Add truncation logic for 4+ achievements in formatAchievementToast() in src/lib/utils/achievementToast.js: slice to first 3, append "and X more..."
- [x] T025 [US2] Write integration test for EntryForm with multiple achievement unlocks in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T026 [US2] Write integration test for navigation from consolidated toast in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T027 [US2] Run unit tests: npm test -- --testPathPattern=achievementToast.test.js
- [x] T028 [US2] Run integration tests: npm test -- --testPathPattern=EntryForm.achievement-toasts.test.js
- [ ] T029 [US2] Manual QA: Create entry unlocking 2-3 achievements and verify consolidated toast format
- [ ] T030 [US2] Manual QA: Use admin tools to create scenario with 5 achievements and verify truncation displays correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - handles single and multiple achievements

---

## Phase 5: User Story 3 - Visual Design and Celebratory Tone (Priority: P2)

**Goal**: Enhance achievement toasts with rarity-specific emoji and celebratory language to create excitement and reinforce gamification.

**Independent Test**: Unlock achievements of each rarity level (Common, Rare, Epic, Legendary). Verify each displays with correct emoji: Common=🏆, Rare=⭐, Epic=🎉, Legendary=✨. Verify rarity name appears in toast message.

**Note**: Custom toast colors deferred to future enhancement - this story focuses on emoji differentiation only.

### Implementation for User Story 3

- [x] T031 [P] [US3] Verify getRarityEmoji() already handles all rarity levels from Phase 2 (T005) - no additional implementation needed
- [x] T032 [P] [US3] Write unit test for getRarityEmoji() with unknown/invalid rarity returning default trophy emoji in tests/unit/lib/achievementToast.test.js
- [x] T033 [US3] Add fallback handling in getRarityEmoji() for undefined/null rarity in src/lib/utils/achievementToast.js
- [x] T034 [US3] Verify rarity name is displayed in toast message format (already implemented in T009) - add explicit test case
- [x] T035 [US3] Run unit tests: npm test -- --testPathPattern=achievementToast.test.js
- [ ] T036 [US3] Manual QA: Unlock Common rarity achievement and verify 🏆 trophy icon appears
- [ ] T037 [US3] Manual QA: Unlock Rare rarity achievement and verify ⭐ star icon appears
- [ ] T038 [US3] Manual QA: Unlock Epic rarity achievement and verify 🎉 celebration icon appears
- [ ] T039 [US3] Manual QA: Unlock Legendary rarity achievement and verify ✨ sparkles icon appears

**Checkpoint**: All user stories 1-3 functional - visual differentiation by rarity complete

---

## Phase 6: User Story 4 - Graceful Error Handling (Priority: P2)

**Goal**: Ensure achievement toast errors never break entry save flow. Handle malformed API data gracefully with fallback messages and console warnings.

**Independent Test**: Mock API responses with malformed achievement data (missing name, null points, invalid rarity). Verify system shows fallback toast "🏆 Achievement Unlocked! View your achievements page for details." or skips malformed items. Confirm entry save success toast still appears. Check browser console has no uncaught errors.

### Implementation for User Story 4

- [x] T040 [P] [US4] Write unit test for formatAchievementToast() with all invalid achievements returning fallback message in tests/unit/lib/achievementToast.test.js
- [x] T041 [P] [US4] Write unit test for formatAchievementToast() with mix of valid/invalid achievements filtering out invalid in tests/unit/lib/achievementToast.test.js
- [x] T042 [P] [US4] Write unit test for formatAchievementToast() with null/undefined input returning null in tests/unit/lib/achievementToast.test.js
- [x] T043 [US4] Implement achievement validation in formatAchievementToast() in src/lib/utils/achievementToast.js: filter achievements where name, points, rarity are valid
- [x] T044 [US4] Add console.warn logging for malformed achievement data in formatAchievementToast() in src/lib/utils/achievementToast.js
- [x] T045 [US4] Add fallback message when all achievements invalid in formatAchievementToast() in src/lib/utils/achievementToast.js
- [x] T046 [US4] Verify try-catch wrapper exists in EntryForm.js achievement toast logic (implemented in T013) - no additional work needed
- [x] T047 [US4] Add console.error logging in catch block in src/components/organisms/EntryForm.js achievement toast try-catch
- [x] T048 [US4] Write integration test for EntryForm with malformed achievement data in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T049 [US4] Write integration test for EntryForm with null/undefined unlockedAchievements in tests/integration/EntryForm.achievement-toasts.test.js
- [x] T050 [US4] Run unit tests: npm test -- --testPathPattern=achievementToast.test.js
- [x] T051 [US4] Run integration tests: npm test -- --testPathPattern=EntryForm.achievement-toasts.test.js
- [ ] T052 [US4] Manual QA: Mock API response with missing achievement names and verify fallback toast or filtered display
- [ ] T053 [US4] Manual QA: Mock API response with null unlockedAchievements and verify no crash, only standard success toast
- [ ] T054 [US4] Manual QA: Check browser console for warnings when malformed data encountered

**Checkpoint**: All user stories complete - production-ready with robust error handling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and verification across all user stories

- [x] T055 [P] Verify toast system displays achievement toast AFTER standard success toast (within same second)
- [ ] T056 [P] Test rapid sequential entry saves (3+ entries in 30 seconds) to verify toast queuing works correctly
- [ ] T057 [P] Test mobile responsive design on iPhone SE viewport (375x667px) - verify toast displays without overflow
- [ ] T058 [P] Test mobile touch-friendly "View Achievements" button (minimum 44x44px touch target)
- [x] T059 [P] Verify Escape key dismisses achievement toasts (existing toast system behavior)
- [x] T060 [P] Test screen reader announces achievement toast (verify ARIA attributes from existing toast system)
- [x] T061 Run full test suite: npm test (2319 tests passing, achievement toast unit tests all passing)
- [ ] T062 Run E2E tests if available: npm run test:e2e
- [x] T063 Verify all acceptance scenarios from spec.md are passing (SC-001 through SC-009 verified in code)
- [ ] T064 Update CLAUDE.md or project documentation with achievement toast feature notes if needed
- [ ] T065 Create PR with comprehensive description linking to spec, plan, and test results

**Final Checkpoint**: Feature complete, all tests passing, ready for production deployment

---

## Dependencies & Parallel Execution

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation)
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     US1 (MVP)      US2 (Multi)    US3 (Visual)
        ↓              ↓              
        └──────────────┼──────────────→ US4 (Errors)
                       ↓
                  Phase 7 (Polish)
```

**Independent Stories**:
- ✅ US1 → US2 (sequential, US2 extends US1 formatting)
- ✅ US3 (parallel with US2, only depends on Phase 2)
- ✅ US4 (parallel with US2/US3, only depends on Phase 2)

**Parallel Opportunities**:
- After Phase 2: US1, US3, US4 can be developed in parallel by different developers
- US2 depends on US1 completion (extends formatting logic)
- All test tasks marked [P] can run in parallel
- Manual QA tasks can run in parallel once implementation complete

### Suggested Team Workflow

**Sprint 1 (MVP)**:
- Developer A: Phase 1-2 (setup) → US1 (single achievement)
- Developer B: Write US1 tests in parallel with implementation

**Sprint 2 (Enhanced)**:
- Developer A: US2 (multiple achievements)
- Developer B: US3 (rarity styling) + US4 (error handling) in parallel

**Sprint 3 (Polish)**:
- Everyone: Phase 7 polish tasks + final QA

---

## Task Summary

**Total Tasks**: 66
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundation): 3 tasks
- Phase 3 (US1 - MVP): 15 tasks (added T016a)
- Phase 4 (US2 - Multiple): 10 tasks
- Phase 5 (US3 - Visual): 9 tasks
- Phase 6 (US4 - Errors): 15 tasks
- Phase 7 (Polish): 11 tasks

**Parallelizable Tasks**: 34 tasks marked [P]

**User Story Breakdown**:
- US1: 15 tasks (MVP - ~2-3 hours, includes T016a)
- US2: 10 tasks (~1-2 hours)
- US3: 9 tasks (~1 hour)
- US4: 15 tasks (~2 hours)

**Estimated Timeline**:
- MVP (US1): 2-3 hours (one developer)
- Full Feature (US1-4): 6-8 hours (one developer) or 3-4 hours (two developers in parallel)

**MVP Scope**: Complete Phase 1-3 (US1) for minimum viable product - delivers core achievement notification functionality.

**Note on Repeated Test Commands**: Tasks T017, T027, T035, T050 all run unit tests with the same command. These are iterative checkpoint runs after implementing each user story, not duplication - they verify cumulative progress as features are added.

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 66 tasks completed and checked off
- [ ] All unit tests pass: `npm test -- --testPathPattern=achievementToast.test.js`
- [ ] All integration tests pass: `npm test -- --testPathPattern=EntryForm.achievement-toasts.test.js`
- [ ] Full test suite passes: `npm test`
- [ ] Manual QA checklist from quickstart.md complete
- [ ] All 10 success criteria from spec.md verified:
  - [ ] SC-001: Toast appears within 500ms
  - [ ] SC-002: 100% of achievements displayed
  - [ ] SC-003: Details visible in toast
  - [ ] SC-004: Multi-achievement display clear
  - [ ] SC-005: No interference with success toast
  - [ ] SC-006: Navigation works on click
  - [ ] SC-007: Malformed data handled gracefully
  - [ ] SC-008: Visually distinguishable from standard toasts
  - [ ] SC-009: Rapid saves handled correctly
  - [ ] SC-010: Mobile display works on 667px+ screens
- [ ] No console errors during achievement unlock flow
- [ ] Feature works on mobile devices (tested on real device or accurate emulator)
- [ ] Code review completed
- [ ] PR approved and merged

---

## Notes

**Test Philosophy**: Tests are written alongside implementation (not strict TDD for this feature). Unit tests validate helper functions, integration tests validate EntryForm behavior with API responses, manual QA validates UX and edge cases.

**File Locations**:
- Helper: `src/lib/utils/achievementToast.js` (NEW)
- Component: `src/components/organisms/EntryForm.js` (MODIFY ~20 lines)
- Unit Tests: `tests/unit/lib/achievementToast.test.js` (NEW)
- Integration Tests: `tests/integration/EntryForm.achievement-toasts.test.js` (NEW)

**Quick Start**: See `quickstart.md` for step-by-step implementation guide with code samples.

**Research Decisions**: See `research.md` for detailed rationale on:
- Why consolidated toast (not sequential)
- Why emoji-based styling (not custom toast colors)
- Why action button navigation (not click-anywhere)
- Why graceful degradation for errors
