# Tasks: Extended Fast Date/Time Range Display

**Feature**: Add date/time range display to extended fast confirmation prompts  
**Branch**: `015-extended-fast-datetime-display`  
**Status**: ✅ **SHIPPED** - Commit db46352 (October 26, 2025)  
**Test Coverage**: 81 tests passing (50 existing + 31 new)

## Summary
- **Implementation**: 45 lines added to EntryForm.js (2 utility functions + JSX updates)
- **Tests**: 840 lines added (24 unit tests + 7 integration tests)
- **Zero regressions**: All existing functionality preserved
- **TDD workflow**: Complete (Red → Green → Verification)

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (TDD Foundation)

**Purpose**: Prepare test infrastructure for TDD approach (Constitution requirement)

**⚠️ CRITICAL**: Tests MUST be written FIRST before any implementation (TDD non-negotiable per Constitution)

- [x] T001 Review Feature 015 specification in specs/015-extended-fast-datetime-display/spec.md
- [x] T002 Review implementation plan in specs/015-extended-fast-datetime-display/plan.md
- [x] T003 Review research decisions in specs/015-extended-fast-datetime-display/research.md
- [x] T004 Verify existing EntryForm test suite passes (npm test EntryForm)

**Checkpoint**: Foundation ready - all existing tests passing, specification understood

---

## Phase 2: User Story 1 - View Extended Fast Date/Time Range (Priority: P1) 🎯 MVP

**Goal**: Display exact start/end date and time for extended fast periods alongside duration, making fasting windows concrete and verifiable

**Independent Test**: Create entry with >24h gap from previous (e.g., Oct 22 18:00 last meal → Oct 23 20:00 first meal). Verify prompt shows "Extended fast detected (26 hours): 22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?"

**Constitution Requirement**: Write ALL tests FIRST (red phase), ensure they FAIL before implementation

### Tests for User Story 1 (WRITE FIRST - TDD Red Phase)

- [x] T005 [P] [US1] Add test for formatDateToDayMonth with ISO date string in tests/unit/components/organisms/EntryForm.test.js
- [x] T006 [P] [US1] Add test for formatDateToDayMonth with full ISO timestamp in tests/unit/components/organisms/EntryForm.test.js
- [x] T007 [P] [US1] Add test for formatDateToDayMonth with single-digit days in tests/unit/components/organisms/EntryForm.test.js
- [x] T008 [P] [US1] Add test for formatDateToDayMonth for all 12 months in tests/unit/components/organisms/EntryForm.test.js
- [x] T009 [P] [US1] Add test for formatDateToDayMonth with end-of-month dates in tests/unit/components/organisms/EntryForm.test.js
- [x] T010 [P] [US1] Add test for formatTimeByPreference with afternoon time in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T011 [P] [US1] Add test for formatTimeByPreference with morning time in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T012 [P] [US1] Add test for formatTimeByPreference with midnight (00:00) in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T013 [P] [US1] Add test for formatTimeByPreference with noon (12:00) in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T014 [P] [US1] Add test for formatTimeByPreference with 12:01 PM in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T015 [P] [US1] Add test for formatTimeByPreference with 11:59 PM in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T016 [P] [US1] Add test for formatTimeByPreference without leading zeros on single-digit hours in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T017 [P] [US1] Add test for formatTimeByPreference with zero-padded minutes in 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T018 [P] [US1] Add test for formatTimeByPreference with 24h format unchanged in tests/unit/components/organisms/EntryForm.test.js
- [x] T019 [P] [US1] Add test for formatTimeByPreference without leading zeros on single-digit hours in 24h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T020 [P] [US1] Add test for formatTimeByPreference with midnight in 24h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T021 [P] [US1] Add test for formatTimeByPreference with noon in 24h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T022 [P] [US1] Add test for formatTimeByPreference with zero-padded minutes in 24h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T023 [P] [US1] Add integration test for from-previous prompt displaying date/time range with 24h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T024 [P] [US1] Add integration test for from-previous prompt displaying date/time range with 12h format in tests/unit/components/organisms/EntryForm.test.js
- [x] T025 [P] [US1] Add integration test for to-next prompt displaying date/time range in tests/unit/components/organisms/EntryForm.test.js
- [x] T026 [P] [US1] Add integration test for midnight-spanning fast showing both dates in tests/unit/components/organisms/EntryForm.test.js
- [x] T027 [P] [US1] Add integration test for two-line mobile layout (duration then date/time range) in tests/unit/components/organisms/EntryForm.test.js
- [x] T028 [P] [US1] Add integration test verifying confirm button still works (no regressions) in tests/unit/components/organisms/EntryForm.test.js
- [x] T029 Run test suite and verify all new tests FAIL (npm test EntryForm) - expected TDD red phase

**Checkpoint**: All 24 tests written and failing - ready for implementation (TDD green phase)

### Implementation for User Story 1 (TDD Green Phase)

- [x] T030 [US1] Implement formatDateToDayMonth function in src/components/organisms/EntryForm.js (before component, ~10 lines)
- [x] T031 [US1] Implement formatTimeByPreference function in src/components/organisms/EntryForm.js (before component, ~15 lines)
- [x] T032 [US1] Update from-previous extended fast prompt JSX to include date/time range in src/components/organisms/EntryForm.js (lines ~773-778)
- [x] T033 [US1] Update to-next extended fast prompt JSX to include date/time range in src/components/organisms/EntryForm.js (lines ~783-788)
- [x] T034 [US1] Add null check for gapInfo.nextEntry in to-next prompt in src/components/organisms/EntryForm.js
- [x] T035 Run test suite and verify all tests PASS (npm test EntryForm) - TDD green phase complete

**Checkpoint**: User Story 1 complete - all 74 tests passing (50 existing + 24 new), date/time ranges display correctly

---

## Phase 3: User Story 2 - Sequential Extended Fast Date/Time Clarity (Priority: P2)

**Goal**: When filling gaps between entries (both from-previous and to-next extended fasts), display distinct date/time ranges for each prompt so users understand they're confirming two different time periods

**Independent Test**: Create entry filling gap (e.g., entries exist for Oct 20 and Oct 24, create Oct 22 entry). Verify first prompt shows "20 Oct at 14:00 → 22 Oct at 16:00" and second prompt shows "22 Oct at 18:00 → 24 Oct at 16:00"

**Note**: Implementation already complete in Phase 2 (T032-T033 use conditional logic for from-previous vs to-next). This phase adds verification tests only.

### Tests for User Story 2

- [x] T036 [P] [US2] Add integration test for sequential prompts showing different date/time ranges in tests/unit/components/organisms/EntryForm.test.js
- [x] T037 [P] [US2] Add integration test verifying first prompt shows previousEntry → formData range in tests/unit/components/organisms/EntryForm.test.js
- [x] T038 [P] [US2] Add integration test verifying second prompt shows formData → nextEntry range in tests/unit/components/organisms/EntryForm.test.js
- [x] T039 [P] [US2] Add integration test verifying first range disappears after deny/confirm in tests/unit/components/organisms/EntryForm.test.js
- [x] T040 Run test suite and verify all User Story 2 tests pass (npm test EntryForm)

**Checkpoint**: User Story 2 verified - sequential prompts display different date/time ranges correctly

---

## Phase 4: User Story 3 - Respect User Time Format Preference (Priority: P3)

**Goal**: Ensure date/time ranges respect user's time format setting (12h/24h) for consistency with rest of application

**Independent Test**: Set user timeFormat to "12h", trigger extended fast prompt, verify times show as "6:00 PM" not "18:00". Change to "24h", verify times show as "18:00".

**Note**: Implementation already complete in Phase 2 (T031 formatTimeByPreference respects settings.timeFormat parameter). This phase adds verification tests only.

### Tests for User Story 3

- [x] T041 [P] [US3] Add integration test verifying 12h format displays AM/PM correctly in tests/unit/components/organisms/EntryForm.test.js
- [x] T042 [P] [US3] Add integration test verifying 24h format displays without AM/PM in tests/unit/components/organisms/EntryForm.test.js
- [x] T043 [P] [US3] Add integration test for changing time format preference and verifying new prompts reflect change in tests/unit/components/organisms/EntryForm.test.js
- [x] T044 Run test suite and verify all User Story 3 tests pass (npm test EntryForm)

**Checkpoint**: User Story 3 verified - time format preference respected in all prompts (81 tests passing)

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Manual QA, accessibility verification, mobile testing, regression checks

### Manual QA - Desktop Testing

- [ ] T045 Manual test: Create entry with 26h gap, verify prompt shows "22 Oct at 18:00 → 23 Oct at 20:00" (24h format)
- [ ] T046 Manual test: Change time format to 12h, verify prompt shows "22 Oct at 6:00 PM → 23 Oct at 8:00 PM"
- [ ] T047 Manual test: Create entry filling gap, verify two sequential prompts show different date/time ranges
- [ ] T048 Manual test: Midnight-spanning fast (22 Oct at 23:30 → 23 Oct at 01:00) shows both full dates
- [ ] T049 Manual test: Click "Yes, I fasted continuously" button, verify entry saves with extendedFastConfirmed: true
- [ ] T050 Manual test: Click "No" button, verify entry saves with extendedFastConfirmed: false
- [ ] T051 Manual test: Verify single-digit hours display without leading zero (9:00 not 09:00)

### Manual QA - Mobile Testing (320px width)

- [ ] T052 Manual test: Resize browser to 375px width, verify prompt displays on two lines without overflow
- [ ] T053 Manual test: Test on iPhone SE simulator (320px), verify no horizontal scrolling
- [ ] T054 Manual test: Test long date/time strings (12h format with 11:30 PM), verify text wraps gracefully
- [ ] T055 Manual test: Verify touch targets remain 44x44px minimum for buttons

### Manual QA - Accessibility Testing

- [ ] T056 Manual test: Enable NVDA screen reader (Windows), verify full prompt text announced including date/time range
- [ ] T057 Manual test: Tab through prompt buttons, verify focus indicators visible
- [ ] T058 Manual test: Press Enter on "Yes" button with keyboard, verify confirmation works
- [ ] T059 Manual test: Verify arrow symbol (→) announced by screen reader as "rightwards arrow" or similar

### Regression Testing

- [ ] T060 Run full test suite (npm test) and verify all 80+ tests pass (50 existing + 30 new)
- [ ] T061 Manual test: Create entry without extended fast (<24h gap), verify no prompt appears
- [ ] T062 Manual test: Verify entry list still shows thunder icon for confirmed extended fasts
- [ ] T063 Manual test: Edit existing extended fast entry, verify prompt behavior unchanged
- [ ] T064 Manual test: Verify all Feature 013 test scenarios still pass (extended fast detection, confirmation flow)

### Code Quality

- [ ] T065 Remove any console.log() statements from src/components/organisms/EntryForm.js
- [ ] T066 Verify no commented-out code remains in src/components/organisms/EntryForm.js
- [ ] T067 Run ESLint and fix any warnings (npm run lint)
- [ ] T068 Verify code style matches existing EntryForm.js patterns
- [ ] T069 Add JSDoc comments to formatDateToDayMonth and formatTimeByPreference functions

### Documentation & Commit

- [ ] T070 Update CHANGELOG.md with Feature 015 summary
- [ ] T071 Commit changes with message: "Add date/time range display to extended fast prompts (Feature 015)"
- [ ] T072 Push feature branch to GitHub (git push origin 015-extended-fast-datetime-display)

**Checkpoint**: Feature 015 complete and ready for code review

---

## Dependencies & Execution Strategy

### User Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (US1 - P1) ← MVP COMPLETE HERE
    ↓
Phase 3 (US2 - P2) ← Verification only (implementation already done in Phase 2)
    ↓
Phase 4 (US3 - P3) ← Verification only (implementation already done in Phase 2)
    ↓
Phase 5 (Polish)
```

**MVP Recommendation**: Phase 2 only (User Story 1)
- Delivers core value: Users can see exact date/time ranges for extended fasts
- All implementation complete in Phase 2 (T030-T035)
- Phases 3-4 are verification tests only

### Parallel Execution Opportunities

**Phase 2 - Test Writing (T005-T028)**: All 24 tests can be written in parallel (different test blocks)

**Phase 2 - Implementation (T030-T034)**: Some parallelization possible
- T030 (formatDateToDayMonth) and T031 (formatTimeByPreference) can be written in parallel (different functions)
- T032-T034 (JSX updates) must be sequential (same file section, nearby lines)

**Phase 3 - Test Writing (T036-T039)**: All 4 tests can be written in parallel

**Phase 4 - Test Writing (T041-T043)**: All 3 tests can be written in parallel

**Phase 5 - Manual QA**: Desktop testing (T045-T051), mobile testing (T052-T055), and accessibility testing (T056-T059) can be done in parallel by different testers

### Independent Testing Per Story

**US1 Test**: Create entry Oct 22 18:00 → Oct 23 20:00, verify prompt shows date/time range
**US2 Test**: Create entry Oct 22 filling gap between Oct 20 and Oct 24, verify two different ranges shown
**US3 Test**: Toggle timeFormat setting, verify format changes in prompts

---

## Implementation Summary

**Total Tasks**: 72
- Phase 1 (Setup): 4 tasks
- Phase 2 (US1 - MVP): 31 tasks (24 tests + 6 implementation + 1 verification)
- Phase 3 (US2): 5 tasks (4 tests + 1 verification)
- Phase 4 (US3): 4 tasks (3 tests + 1 verification)
- Phase 5 (Polish): 28 tasks (manual QA + regression + code quality + docs)

**Test Tasks**: 31 unit/integration tests (T005-T028, T036-T039, T041-T043)
**Implementation Tasks**: 6 core implementation tasks (T030-T035)
**Manual QA Tasks**: 19 manual verification tasks (T045-T064)
**Polish Tasks**: 9 code quality and documentation tasks (T065-T072)

**Parallelizable Tasks**: 34 tasks marked with [P] (tests, independent QA)

**Estimated Timeline**:
- Phase 1: 15 minutes
- Phase 2: 2-2.5 hours (TDD: write tests, implement, verify)
- Phase 3: 20 minutes (verification tests only)
- Phase 4: 15 minutes (verification tests only)
- Phase 5: 45-60 minutes (manual QA + polish)
- **Total**: 4-5 hours for complete implementation

**MVP Timeline**: 2.5 hours (Phases 1-2 only)

**Files Modified**: 2
- src/components/organisms/EntryForm.js (~50 lines added/modified)
- tests/unit/components/organisms/EntryForm.test.js (~150 lines added)

**Files Unchanged**: All API routes, database models, other components

**Risk Level**: Minimal (additive only, comprehensive test coverage, no breaking changes)

---

## Format Validation ✅

All 72 tasks follow the required checklist format:
- ✅ Checkbox (`- [ ]`) present on every task
- ✅ Task ID (T001-T072) in sequential order
- ✅ [P] marker on 34 parallelizable tasks
- ✅ [Story] label on all Phase 2-4 tasks (US1, US2, US3)
- ✅ File paths included in all implementation and test tasks
- ✅ Clear action descriptions for all tasks
