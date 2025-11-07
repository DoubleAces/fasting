# Tasks: Achievement Unlock API Response

**Input**: Design documents from `/specs/032-achievement-unlock-response/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal project initialization (most infrastructure already exists)

- [x] T001 Create feature branch `032-achievement-unlock-response` from master
- [x] T002 Verify AchievementService is available and passing tests (Feature 031 prerequisite)

**Checkpoint**: Branch ready, dependencies confirmed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Status**: ✅ COMPLETE - Feature 031 provides AchievementService with 60/60 tests passing

No tasks required - all foundational infrastructure exists:
- ✅ Database models (Entry, Achievement, UserAchievement)
- ✅ AchievementService.evaluateAndUnlock() method
- ✅ API route structure and error handling (withErrorHandler)
- ✅ Authentication via auth() function

**Checkpoint**: Foundation ready - user story implementation can begin immediately

---

## Phase 3: User Story 1 - Entry Creation Returns Achievement Unlocks (Priority: P1) 🎯 MVP

**Goal**: POST /api/entries returns `unlockedAchievements` array in response when achievements are earned

**Independent Test**: POST an entry with 12-hour duration, verify response includes `unlockedAchievements` array with achievement details

### Implementation for User Story 1

- [x] T003 [US1] Add AchievementService import to `src/app/api/entries/route.js`
- [x] T004 [US1] Add achievement evaluation call after `entry.save()` in POST handler in `src/app/api/entries/route.js`
- [x] T005 [US1] Wrap achievement evaluation in try/catch block with error logging in `src/app/api/entries/route.js`
- [x] T006 [US1] Add success logging with 🏆 emoji when achievements unlock in `src/app/api/entries/route.js`
- [x] T007 [US1] Modify response to spread `unlockedAchievements` array in `src/app/api/entries/route.js`
- [x] T008 [US1] Initialize `unlockedAchievements = []` before try/catch to handle error cases in `src/app/api/entries/route.js`

**Checkpoint**: POST /api/entries returns entry + unlockedAchievements, testable independently

---

## Phase 4: User Story 2 - Entry Updates Trigger Achievement Evaluation (Priority: P1)

**Goal**: PUT /api/entries/[id] re-evaluates achievements and returns newly unlocked achievements in response

**Independent Test**: Create entry with short duration, PUT an update increasing duration to 12 hours, verify response includes newly unlocked achievement

### Implementation for User Story 2

- [x] T009 [P] [US2] Add AchievementService import to `src/app/api/entries/[id]/route.js`
- [x] T010 [P] [US2] Add achievement evaluation call after `updatedEntry.save()` in PUT handler in `src/app/api/entries/[id]/route.js`
- [x] T011 [P] [US2] Wrap achievement evaluation in try/catch block with error logging in `src/app/api/entries/[id]/route.js`
- [x] T012 [P] [US2] Add success logging with 🏆 emoji when achievements unlock in `src/app/api/entries/[id]/route.js`
- [x] T013 [P] [US2] Modify response to spread `unlockedAchievements` array in `src/app/api/entries/[id]/route.js`
- [x] T014 [P] [US2] Initialize `unlockedAchievements = []` before try/catch to handle error cases in `src/app/api/entries/[id]/route.js`

**Note**: Tasks T009-T014 can run in parallel with T003-T008 (different files, no dependencies)

**Checkpoint**: PUT /api/entries/[id] returns entry + unlockedAchievements, testable independently

---

## Phase 5: User Story 3 - Non-Blocking Achievement Evaluation (Priority: P1)

**Goal**: Entry operations succeed even when achievement evaluation fails

**Independent Test**: Mock AchievementService to throw error, verify POST/PUT still returns 201/200 with entry data

### Verification for User Story 3

- [x] T015 [US3] Verify try/catch blocks correctly log errors without propagating in `src/app/api/entries/route.js`
- [x] T016 [US3] Verify try/catch blocks correctly log errors without propagating in `src/app/api/entries/[id]/route.js`
- [x] T017 [US3] Verify error logs include entry ID context for debugging in both route files
- [x] T018 [US3] Verify `unlockedAchievements` defaults to empty array when evaluation fails in both route files

**Note**: This story is primarily verified through code review of T005, T011 implementations

**Checkpoint**: Entry operations never fail due to achievement errors, verified through error path testing

---

## Phase 6: User Story 4 - Achievement Details in Response (Priority: P2)

**Goal**: Response includes complete achievement metadata (name, description, points, rarity, category, iconColor, unlockedAt)

**Independent Test**: Unlock an achievement, examine response structure, verify all 8 required fields present

### Verification for User Story 4

- [x] T019 [US4] Review AchievementService.evaluateAndUnlock() return format to confirm it includes all required fields (achievementId, name, description, points, rarity, category, iconColor, unlockedAt)
- [x] T020 [US4] Verify response structure matches data-model.md UnlockedAchievement specification in both POST and PUT handlers

**Note**: Feature 031 AchievementService already returns complete metadata - this story validates the contract

**Checkpoint**: All achievement metadata available in response without additional API calls

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests, manual verification, documentation

### Integration Tests

- [x] T021 [P] Create test file `tests/integration/achievements/api-response.test.js`
- [x] T022 [P] Write test: POST /api/entries with achievement-qualifying entry returns unlockedAchievements array in `tests/integration/achievements/api-response.test.js`
- [x] T023 [P] Write test: POST /api/entries without qualifying entry returns empty unlockedAchievements array in `tests/integration/achievements/api-response.test.js`
- [x] T024 [P] Write test: PUT /api/entries/[id] updating duration unlocks new achievement and returns it in response in `tests/integration/achievements/api-response.test.js`
- [x] T025 [P] Write test: PUT /api/entries/[id] without achievement-relevant changes returns empty array in `tests/integration/achievements/api-response.test.js`
- [x] T026 [P] Write test: POST /api/entries with AchievementService throwing error still returns 201 with entry data in `tests/integration/achievements/api-response.test.js`
- [x] T027 [P] Write test: Response structure matches UnlockedAchievement schema (8 required fields) in `tests/integration/achievements/api-response.test.js`

**Note**: All test tasks (T021-T027) can run in parallel after completing Phase 3-6 implementations

### Manual Verification

- [x] T028 Manual test: Create first 12-hour entry via API, verify response includes "first-twelve" achievement with all metadata
- [x] T029 Manual test: Update entry to 24-hour duration, verify response includes "first-twentyfour" achievement
- [x] T030 Manual test: Create entry with 6-hour duration, verify response has empty unlockedAchievements array
- [x] T031 Manual test: Check production logs for 🏆 emoji entries confirming achievement unlocks
- [x] T032 Manual test: Verify response payload size under 50KB for typical cases (3 achievements max)

### Documentation

- [x] T033 Update API documentation with new response format (if external API docs exist)
- [x] T034 Add achievement response examples to contracts/post-api-entries.md and contracts/put-api-entries-id.md (already complete ✅)
- [x] T035 Update CLAUDE.md if any new patterns or conventions introduced (already complete ✅)

**Checkpoint**: Feature complete, tested, and documented

---

## Task Dependency Graph

```
Phase 1 (Setup)
  T001 → T002 → [Foundation Ready]

Phase 2 (Foundational)
  [Already Complete - Feature 031]

Phase 3 (US1) + Phase 4 (US2) [PARALLEL EXECUTION]
  ┌─ T003 → T004 → T005 → T006 → T007 → T008 [US1 Complete]
  └─ T009 → T010 → T011 → T012 → T013 → T014 [US2 Complete]

Phase 5 (US3) [Depends on Phase 3+4]
  T015, T016, T017, T018 [Code Review & Verification]

Phase 6 (US4) [Depends on Phase 3+4]
  T019, T020 [Contract Validation]

Phase 7 (Polish) [Depends on Phase 3-6]
  T021 → [T022, T023, T024, T025, T026, T027] [All tests parallel]
  T028 → T029 → T030 → T031 → T032 [Manual tests sequential]
  T033, T034, T035 [Documentation parallel with tests]
```

---

## Parallel Execution Opportunities

### Opportunity 1: User Stories 1 & 2 Simultaneously
**Tasks**: T003-T008 (POST handler) and T009-T014 (PUT handler)  
**Reason**: Different files, no shared state  
**Benefit**: Reduce implementation time by 45 minutes (Step 1 and Step 2 from quickstart.md can be done simultaneously by 2 developers)

### Opportunity 2: Integration Tests
**Tasks**: T022, T023, T024, T025, T026, T027  
**Reason**: Independent test scenarios in same test file  
**Benefit**: Tests can be written in any order or simultaneously

### Opportunity 3: Documentation Tasks
**Tasks**: T033, T034, T035  
**Reason**: Different documentation files, no dependencies  
**Benefit**: Documentation can be updated in parallel with testing

---

## Task Checklist Summary

- **Total Tasks**: 35
- **Implementation Tasks**: 16 (T003-T018)
- **Test Tasks**: 7 (T021-T027)
- **Manual Verification**: 5 (T028-T032)
- **Documentation**: 3 (T033-T035)
- **Setup**: 2 (T001-T002)
- **Foundational**: 0 (already complete)

**Critical Path**: T001 → T002 → T003-T008 → T015-T018 → T021-T027 → T028-T032 = ~2-3 hours

**With Parallel Execution**: T001 → T002 → [T003-T008 || T009-T014] → [T015-T020] → [T021-T027 || T028-T035] = ~1.5-2 hours
