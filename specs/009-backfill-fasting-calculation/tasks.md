# Tasks: Backfill Fasting Duration Calculation

**Feature**: 009-backfill-fasting-calculation  
**Branch**: `009-backfill-fasting-calculation`  
**Input**: Design documents from `/specs/009-backfill-fasting-calculation/`

**Prerequisites**: 
- ✅ plan.md (tech stack, implementation approach)
- ✅ spec.md (user stories with priorities)
- ✅ research.md (technical decisions)
- ✅ data-model.md (no schema changes)
- ✅ contracts/api-changes.md (API behavior documentation)
- ✅ quickstart.md (TDD implementation guide)

**Tests**: Following TDD approach - integration tests will be written FIRST before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (No Setup Needed)

**Purpose**: Project initialization and basic structure

**Status**: ✅ **SKIPPED** - This is a bug fix in an existing, fully configured Next.js project.

All infrastructure already exists:
- Next.js 14+ App Router configured
- MongoDB Atlas connection established
- Jest + integration testing configured
- Entry model and utilities already implemented

**Checkpoint**: No setup needed - proceed directly to foundational verification

---

## Phase 2: Foundational (Verification Only)

**Purpose**: Verify core infrastructure is ready for bug fix implementation

**⚠️ CRITICAL**: Confirm existing cascade patterns work before adding new one

- [X] T001 Verify existing POST handler location in `src/app/api/entries/route.js` (line 147: `await entry.save()`)
- [X] T002 [P] Verify `calculateFastingDuration()` utility exists in `src/lib/utils/fastingCalculator.js`
- [X] T003 [P] Verify Entry model has required fields in `src/lib/models/Entry.js` (userId, date, firstMealTime, lastMealTime, fastingDuration)
- [X] T004 [P] Verify existing PUT handler cascade logic in `src/app/api/entries/[id]/route.js` (lines 147-177) as reference pattern
- [X] T005 [P] Run existing integration tests to confirm baseline: `npm test -- tests/integration/entries.test.js`

**Checkpoint**: Foundation verified - user story implementation can begin

---

## Phase 3: User Story 1 - Backfill Fasting Calculation When Adding Past Entry (Priority: P1) 🎯 MVP

**Goal**: Fix bug where creating an entry for a previous date doesn't recalculate the next entry's fasting duration.

**Independent Test**: Create entry for Day 2 (fasting shows null), then create entry for Day 1, verify Day 2's fasting recalculated to 16 hours.

### Tests for User Story 1 (TDD Red Phase)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Add test "should recalculate next entry fasting when creating past entry" in `tests/integration/entries.test.js` at line ~450
- [X] T007 [P] [US1] Add test "should find next entry across gaps" in `tests/integration/entries.test.js` at line ~480
- [X] T008 [P] [US1] Add test "should handle middle entry creation with Day 1 and Day 3 existing" in `tests/integration/entries.test.js` at line ~510
- [X] T009 [US1] Run tests to confirm they FAIL: `npm test -- tests/integration/entries.test.js --testNamePattern="backfill"`

**Checkpoint**: All 3 tests should fail with expected behavior (next entry's fasting not recalculated)

### Implementation for User Story 1 (TDD Green Phase)

- [X] T010 [US1] Add backfill cascade logic in `src/app/api/entries/route.js` after line 147 (`await entry.save()`):
  - Find next entry: `Entry.findOne({ userId, date: { $gt: value.date } }).sort({ date: 1 }).limit(1)`
  - Calculate fasting if both meal times exist
  - Update next entry: `Entry.findByIdAndUpdate(nextEntry._id, { fastingDuration })`
  - Wrap in try-catch with console.warn for errors
- [X] T011 [US1] Add JSDoc comment above new cascade logic block explaining backfill behavior in `src/app/api/entries/route.js`
- [X] T012 [US1] Run integration tests to verify all tests PASS: `npm test -- tests/integration/entries.test.js`
- [X] T013 [US1] Run full integration suite to verify no regressions: `npm test -- tests/integration/`

**Checkpoint**: User Story 1 complete - all tests passing, no regressions

### Refactor for User Story 1 (TDD Refactor Phase)

- [X] T014 [P] [US1] Review code for readability and ensure it matches existing PUT handler pattern
- [X] T015 [P] [US1] Verify error handling is consistent with existing cascade logic (console.warn, don't fail creation)
- [X] T016 [US1] Final test run to confirm refactor didn't break anything: `npm test -- tests/integration/entries.test.js`

**Checkpoint**: User Story 1 is fully functional, tested, and follows existing patterns

---

## Phase 4: User Story 2 - Update Future Entries When Editing Past Entry (Priority: P2)

**Goal**: Verify existing PUT handler already handles this scenario (no new code needed).

**Independent Test**: Create two consecutive entries with fasting calculated, edit first entry's last meal time, verify second entry's fasting updates.

**Status**: ✅ **EXISTING FUNCTIONALITY** - PUT handler already has cascade logic (verified in research.md)

### Verification for User Story 2

- [X] T017 [US2] Review existing PUT handler cascade logic in `src/app/api/entries/[id]/route.js` lines 147-177
- [X] T018 [US2] Verify PUT handler tests exist in `tests/integration/entries.test.js` for cascade behavior
- [X] T019 [US2] Run PUT handler tests to confirm cascade works: `npm test -- tests/integration/entries.test.js --testNamePattern="PUT"`
- [X] T020 [US2] Add note in `specs/009-backfill-fasting-calculation/quickstart.md` that User Story 2 is already implemented

**Checkpoint**: User Story 2 verified as already working - no new implementation needed

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [X] T021 [P] Manual testing: Follow scenarios in `specs/009-backfill-fasting-calculation/quickstart.md` (Section "Phase 4: Manual Testing")
- [X] T022 [P] Update `specs/009-backfill-fasting-calculation/quickstart.md` with any lessons learned during implementation
- [X] T023 [P] Run ESLint to ensure no linting errors: `npm run lint`
- [X] T024 Verify all success criteria met from spec.md:
  - SC-001: Updates happen within 1 second (measure API response time)
  - SC-002: 100% calculation accuracy (verify test coverage)
  - SC-003: Random order entry works (manual test)
  - SC-004: Gaps handled correctly (test case T007)
- [X] T025 Final full test suite run: `npm test`
- [ ] T026 Create commit with descriptive message following project conventions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ SKIPPED - existing project
- **Foundational (Phase 2)**: No dependencies - verification tasks only
- **User Story 1 (Phase 3)**: Depends on Foundational verification (T001-T005)
- **User Story 2 (Phase 4)**: Independent - can start after Foundational OR after US1
- **Polish (Phase 5)**: Depends on User Story 1 completion (US2 is verification only)

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - this is the MVP
- **User Story 2 (P2)**: Independent verification task - no code dependencies on US1

### Within User Story 1 (TDD Critical Path)

1. **Tests (T006-T009)**: Write all 3 tests first, run to confirm failure
2. **Implementation (T010)**: Add cascade logic to make tests pass
3. **Verification (T011-T013)**: Run tests to confirm success
4. **Refactor (T014-T016)**: Clean up code while tests still pass

### Parallel Opportunities

**Foundational Phase (T001-T005)**: All 5 verification tasks can run in parallel

**User Story 1 Tests (T006-T008)**: All 3 test additions can be written in parallel (different test cases in same file - merge carefully)

**User Story 1 Refactor (T014-T015)**: Code review and error handling review can happen in parallel

**Polish Phase (T021-T023)**: Manual testing, documentation, and linting can run in parallel

---

## Parallel Example: User Story 1 Test Writing

```bash
# Write all 3 integration tests together:
Task T006: "Add test: should recalculate next entry fasting when creating past entry"
Task T007: "Add test: should find next entry across gaps"  
Task T008: "Add test: should handle middle entry creation"

# Then run once:
Task T009: "Run tests to confirm they FAIL"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED

1. ✅ Skip Phase 1: Setup (existing project)
2. Complete Phase 2: Foundational verification (5 tasks, ~10 minutes)
3. Complete Phase 3: User Story 1 (13 tasks following TDD)
   - Write failing tests (4 tasks, ~30 minutes)
   - Implement cascade logic (4 tasks, ~45 minutes)
   - Refactor and verify (3 tasks, ~15 minutes)
4. **STOP and VALIDATE**: Test independently, manual verification
5. Complete Phase 4: User Story 2 verification (4 tasks, ~15 minutes)
6. Complete Phase 5: Polish (6 tasks, ~30 minutes)

**Total Estimated Time**: 2.5 hours

### Checkpoint Strategy

- **After T005**: Foundation verified, ready to write tests
- **After T009**: Tests written and failing (Red phase complete)
- **After T012**: Tests passing (Green phase complete)
- **After T016**: Code refactored and clean (Refactor phase complete)
- **After T020**: Both user stories verified/complete
- **After T026**: Feature complete and ready for PR

---

## Success Metrics

**Task Count**: 26 total tasks
- Phase 1 (Setup): 0 tasks (skipped)
- Phase 2 (Foundational): 5 tasks
- Phase 3 (User Story 1): 13 tasks
- Phase 4 (User Story 2): 4 tasks
- Phase 5 (Polish): 6 tasks

**Parallel Opportunities**: 
- 5 tasks in Foundational (T001-T005)
- 3 tasks in US1 Tests (T006-T008)
- 2 tasks in US1 Refactor (T014-T015)
- 3 tasks in Polish (T021-T023)

**Independent Test Criteria**:
- **US1**: Create Day 2 entry (null fasting) → Create Day 1 entry → Verify Day 2 fasting = 16h
- **US2**: Already working - verify with existing PUT tests

**MVP Scope**: User Story 1 only (13 tasks in Phase 3)
- Delivers core bug fix
- Independently testable
- Production ready after Phase 3 completion

---

## Notes

- This is a **bug fix**, not a new feature - most infrastructure already exists
- **TDD is mandatory** per constitution - tests MUST be written first
- Only **17 lines of new code** needed in POST handler (task T010)
- **User Story 2** requires no new code - PUT handler already has cascade logic
- All tasks include specific file paths for precise execution
- **[P] markers** indicate tasks that can run in parallel (different concerns)
- **[US1]/[US2] labels** map tasks to user stories for traceability
- Follow the **Red-Green-Refactor** cycle strictly for User Story 1
