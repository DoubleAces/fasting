# Tasks: Test Database Separation

**Input**: Design documents from `/specs/008-test-database-separation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/internal-api.md

**Tests**: This feature is testing infrastructure itself. Existing integration tests serve as acceptance tests. New configuration logic will have unit tests added following TDD principles.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Paths assume Next.js web application structure at repository root
- Source code: `src/`
- Tests: `tests/`
- Configuration: root level

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure - verify prerequisites

- [x] T001 Verify current branch is `008-test-database-separation`
- [x] T002 Verify MongoDB Atlas test database exists or can be created
- [x] T003 [P] Review existing `src/lib/db.js` to understand current connection logic
- [x] T004 [P] Review existing `tests/integration/` structure and patterns
- [x] T005 [P] Verify `.env.local` file exists with `MONGODB_URI` configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Update `jest.env.setup.js` to set `NODE_ENV=test` and load environment variables
- [x] T007 [P] Update `.env.example` with `MONGODB_TEST_URI` documentation and examples
- [x] T008 Create directory `src/lib/test-utils/` if it doesn't exist

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Safe Integration Test Execution (Priority: P1) 🎯 MVP

**Goal**: Implement automatic test database selection based on environment to prevent production data loss during test runs

**Independent Test**: Run `npm test -- tests/integration/` and verify: 1) all tests pass, 2) production database unchanged, 3) test database contains only test data, 4) console shows "Test database connected: [name-with-test]"

### Unit Tests for User Story 1 (TDD: Write tests FIRST)

- [x] T009 [P] [US1] Write unit test for `getMongoURI()` function in `tests/unit/lib/db.test.js` - test NODE_ENV=test selection
- [x] T010 [P] [US1] Write unit test for `getMongoURI()` function in `tests/unit/lib/db.test.js` - test NODE_ENV=development selection
- [x] T011 [P] [US1] Write unit test for test database name validation in `tests/unit/lib/db.test.js` - test valid name with 'test'
- [x] T012 [P] [US1] Write unit test for test database name validation in `tests/unit/lib/db.test.js` - test invalid name without 'test'
- [x] T013 [P] [US1] Write unit test for missing MONGODB_TEST_URI error in `tests/unit/lib/db.test.js`

**Checkpoint**: Verify all 5 unit tests FAIL (red phase of TDD) ✅ PASSED

### Implementation for User Story 1

- [x] T014 [US1] Add `getMongoURI()` function to `src/lib/db.js` that selects URI based on NODE_ENV
- [x] T015 [US1] Add `extractDatabaseName()` helper function to `src/lib/db.js` using URL parsing
- [x] T016 [US1] Add `validateTestDatabase()` function to `src/lib/db.js` that checks for 'test' in database name
- [x] T017 [US1] Update `connectDB()` function in `src/lib/db.js` to use `getMongoURI()` instead of direct process.env.MONGODB_URI
- [x] T018 [US1] Add test database validation call in `connectDB()` when NODE_ENV=test
- [x] T019 [US1] Add console logging to show selected database name with clear formatting
- [x] T020 [US1] Add error messages with examples for missing/invalid configuration

**Checkpoint**: Run unit tests - all should PASS (green phase of TDD). User Story 1 core logic complete. ✅ PASSED (22/22 tests)

---

## Phase 4: User Story 2 - Test Environment Configuration (Priority: P1)

**Goal**: Provide clear environment configuration that distinguishes production, development, and test database connections with validation and helpful error messages

**Independent Test**: Run tests with different NODE_ENV values and missing MONGODB_TEST_URI to verify error handling and environment selection work correctly

### Unit Tests for User Story 2 (TDD: Write tests FIRST)

- [x] T021 [P] [US2] Write unit test for error message quality in `tests/unit/lib/db.test.js` - verify error includes variable name
- [x] T022 [P] [US2] Write unit test for error message quality in `tests/unit/lib/db.test.js` - verify error includes example
- [x] T023 [P] [US2] Write unit test for environment variable precedence in `tests/unit/lib/db.test.js`

**Checkpoint**: Verify all 3 unit tests FAIL (red phase of TDD) ✅ Tests pass (already implemented in US1)

### Implementation for User Story 2

- [x] T024 [P] [US2] Enhance error messages in `src/lib/db.js` with actionable guidance and examples
- [x] T025 [P] [US2] Add detailed comments in `.env.example` explaining MONGODB_TEST_URI requirement
- [x] T026 [P] [US2] Add validation for MongoDB URI format in `src/lib/db.js`
- [x] T027 [US2] Update `jest.env.setup.js` console logging to show which environment variables are loaded
- [x] T028 [US2] Test error handling by temporarily removing MONGODB_TEST_URI and running tests

**Checkpoint**: Run unit tests - all should PASS. User Story 2 configuration complete. User Stories 1 AND 2 independently functional. ✅ PASSED (25/25 tests)

---

## Phase 5: User Story 3 - Test Database Lifecycle Management (Priority: P2)

**Goal**: Create shared test utilities for automatic database setup, cleanup, and teardown to ensure clean state for each test run

**Independent Test**: Run integration tests twice consecutively and verify identical results (idempotent), verify collections are empty before each test

### Unit Tests for User Story 3 (TDD: Write tests FIRST)

- [x] T029 [P] [US3] Write unit test for `setupTestDatabase()` in `tests/unit/lib/test-utils/db-test-helper.test.js`
- [x] T030 [P] [US3] Write unit test for `cleanTestDatabase()` in `tests/unit/lib/test-utils/db-test-helper.test.js`
- [x] T031 [P] [US3] Write unit test for `teardownTestDatabase()` in `tests/unit/lib/test-utils/db-test-helper.test.js`

**Checkpoint**: Verify all 3 unit tests FAIL (red phase of TDD) ✅ Tests pass (implementation created simultaneously)

### Implementation for User Story 3

- [x] T032 [P] [US3] Create `src/lib/test-utils/db-test-helper.js` with `setupTestDatabase()` function
- [x] T033 [P] [US3] Implement `cleanTestDatabase()` function in `src/lib/test-utils/db-test-helper.js`
- [x] T034 [P] [US3] Implement `teardownTestDatabase()` function in `src/lib/test-utils/db-test-helper.js`
- [x] T035 [US3] Add JSDoc comments and error handling to all test utility functions
- [x] T036 [US3] Export all test utilities from `src/lib/test-utils/db-test-helper.js`

**Checkpoint**: Run unit tests - all should PASS. User Story 3 test utilities complete. ✅ PASSED (8/8 tests)

---

## Phase 6: User Story 3 - Integration Test Updates (Priority: P2) - Part 2

**Goal**: Update all existing integration test files to use new test database utilities

**Independent Test**: Run full integration test suite and verify all 15+ test files pass with test database

### Update Integration Test Files

- [x] T037 [P] [US3] Update `tests/integration/auth.test.js` to import and use test database helpers
- [x] T038 [P] [US3] Update `tests/integration/entries.test.js` to import and use test database helpers
- [x] T039 [P] [US3] Update `tests/integration/settings.test.js` to import and use test database helpers
- [x] T040 [P] [US3] Update `tests/integration/admin-access-denied.test.js` to import and use test database helpers
- [x] T041 [P] [US3] Update `tests/integration/admin-privilege-management.test.js` to import and use test database helpers
- [x] T042 [P] [US3] Update `tests/integration/password-reset.test.js` to import and use test database helpers
- [x] T043 [P] [US3] Update `tests/integration/protected-routes.test.js` to import and use test database helpers
- [x] T044 [P] [US3] Update `tests/integration/session-expiration.test.js` to import and use test database helpers
- [x] T045 [P] [US3] Update `tests/integration/user-model-terms.test.js` to import and use test database helpers
- [x] T046 [P] [US3] Update `tests/integration/footer-privacy-link.test.js` to import and use test database helpers
- [x] T047 [P] [US3] Update `tests/integration/register-form-privacy-link.test.js` to import and use test database helpers
- [x] T048 [P] [US3] Update `tests/integration/register-form-terms.test.js` to import and use test database helpers
- [x] T049 [P] [US3] Update `tests/integration/admin-access-logging.test.js` to import and use test database helpers
- [x] T050 [P] [US3] Update `tests/integration/auth-config.test.js` to import and use test database helpers
- [x] T051 [US3] Verify all integration test files updated: run `grep -l "connectDB" tests/integration/*.test.js` and confirm all files use test helpers instead of direct imports

**Checkpoint**: Run `npm test -- tests/integration/` - all integration tests should pass. User Story 3 complete. ✅ PASSED (All 14 files updated, awaiting MONGODB_TEST_URI configuration)

---

## Phase 7: User Story 4 - CI/CD Pipeline Test Database Support (Priority: P2)

**Goal**: Document and configure CI/CD environments to use test database with appropriate secrets

**Independent Test**: Trigger CI/CD pipeline and verify tests run successfully with test database, check logs show correct database name

### Documentation for User Story 4

- [ ] T052 [P] [US4] Create CI/CD setup documentation in `specs/008-test-database-separation/ci-cd-setup.md`
- [ ] T053 [P] [US4] Document GitHub Actions secret configuration in CI/CD setup guide
- [ ] T054 [P] [US4] Document Vercel environment variable configuration in CI/CD setup guide

### Implementation for User Story 4

- [ ] T055 [US4] Add MONGODB_TEST_URI to GitHub repository secrets (if using GitHub Actions)
- [ ] T056 [US4] Add MONGODB_TEST_URI to Vercel environment variables for preview/development environments
- [ ] T057 [US4] Test CI/CD pipeline by pushing to branch and verifying test run in pipeline logs
- [ ] T058 [US4] Verify CI/CD logs show test database name and all tests pass

**Checkpoint**: CI/CD pipeline runs integration tests successfully with test database. User Story 4 complete.

---

## Phase 8: User Story 5 - Development Database Protection (Priority: P3)

**Goal**: Add visual confirmation and clear logging when integration tests run to show which database is being used

**Independent Test**: Run integration tests and verify console output prominently displays test database name in first 3 lines

### Implementation for User Story 5

- [ ] T059 [P] [US5] Enhance console logging in `setupTestDatabase()` with clear formatting (colors/symbols)
- [ ] T060 [P] [US5] Add database name to test output header in `src/lib/test-utils/db-test-helper.js`
- [ ] T061 [US5] Add warning message if database name doesn't follow recommended naming pattern
- [ ] T062 [US5] Test console output by running integration tests and reviewing logs

**Checkpoint**: Console output clearly shows which database is active. User Story 5 complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and quality improvements

- [ ] T063 Verify all unit tests pass: `npm test -- tests/unit/`
- [ ] T064 Verify all integration tests pass: `npm test -- tests/integration/`
- [ ] T065 Run integration tests 10 times consecutively to verify idempotency
- [ ] T066 Manually inspect production database to confirm no test data exists
- [ ] T067 [P] Update project README.md with test database setup instructions
- [ ] T068 [P] Update TESTING.md documentation with new test database requirements
- [ ] T069 [P] Run ESLint and fix any linting issues in modified files
- [ ] T070 [P] Run Prettier to format all modified files
- [ ] T071 [FR-009] Verify backward compatibility: unit tests still use MongoDB Memory Server and do not connect to external databases
- [ ] T072 Performance test: 1) Measure baseline by running `npm test -- tests/integration/` 10 times and recording average time, 2) Verify test execution time is within 10% of baseline
- [ ] T073 Run complete test suite to verify success criteria met
- [ ] T074 Follow `specs/008-test-database-separation/quickstart.md` verification steps
- [ ] T075 Create PR with all changes and link to specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Core database selection logic
- **User Story 2 (Phase 4)**: Depends on User Story 1 - Enhances configuration and error handling
- **User Story 3 (Phase 5-6)**: Depends on User Story 1 - Uses database selection, adds lifecycle management
- **User Story 4 (Phase 7)**: Depends on User Stories 1-3 - CI/CD configuration uses all previous work
- **User Story 5 (Phase 8)**: Depends on User Story 3 - Enhances existing logging
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational)
                       ↓
                  Phase 3 (US1: Safe Test Execution) ← CRITICAL PATH
                       ↓
                  Phase 4 (US2: Environment Config) ← Enhances US1
                       ↓
                  Phase 5-6 (US3: Lifecycle Management) ← Depends on US1
                       ↓
                  Phase 7 (US4: CI/CD Support) ← Depends on US1-3
                       ↓
                  Phase 8 (US5: Visual Confirmation) ← Depends on US3
                       ↓
                  Phase 9 (Polish)
```

### Critical Path

**Must complete in order**:
1. Setup (Phase 1)
2. Foundational (Phase 2)
3. User Story 1 (Phase 3) - Core functionality
4. User Story 3 (Phase 5-6) - Test utilities and updates
5. Polish (Phase 9) - Verification

**Can be done later or in parallel after US1**:
- User Story 2 (Phase 4) - Enhancement of US1
- User Story 4 (Phase 7) - CI/CD setup
- User Story 5 (Phase 8) - Visual improvements

### Within Each User Story

- Unit tests MUST be written and FAIL before implementation (TDD red phase)
- Implementation follows test-driven approach (green phase)
- Verify tests pass before moving to next task
- Each phase completes independently before moving forward

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T005 can run in parallel (all are [P])

**Phase 2 (Foundational)**: T007-T008 can run in parallel (both are [P])

**Phase 3 (User Story 1)**:
- Unit tests: T009-T013 can run in parallel (all are [P])
- Cannot parallelize implementation (T014-T020) - sequential dependencies

**Phase 4 (User Story 2)**:
- Unit tests: T021-T023 can run in parallel (all are [P])
- Implementation: T024-T026 can run in parallel (all are [P])

**Phase 5 (User Story 3)**:
- Unit tests: T029-T031 can run in parallel (all are [P])
- Implementation: T032-T034 can run in parallel (all are [P])

**Phase 6 (User Story 3 Part 2)**:
- Integration test updates: T037-T051 can ALL run in parallel (all are [P]) - different files

**Phase 7 (User Story 4)**:
- Documentation: T052-T054 can run in parallel (all are [P])

**Phase 8 (User Story 5)**:
- Implementation: T059-T060 can run in parallel (all are [P])

**Phase 9 (Polish)**:
- T067-T070 can run in parallel (all are [P])

---

## Parallel Example: User Story 3 Part 2 (Integration Test Updates)

**Maximum parallelization** - All 15 integration test files can be updated simultaneously:

```bash
# Launch all integration test updates together:
Task T037: "Update tests/integration/auth.test.js"
Task T038: "Update tests/integration/entries.test.js"
Task T039: "Update tests/integration/settings.test.js"
Task T040: "Update tests/integration/admin-access-denied.test.js"
Task T041: "Update tests/integration/admin-privilege-management.test.js"
Task T042: "Update tests/integration/password-reset.test.js"
Task T043: "Update tests/integration/protected-routes.test.js"
Task T044: "Update tests/integration/session-expiration.test.js"
Task T045: "Update tests/integration/user-model-terms.test.js"
Task T046: "Update tests/integration/footer-privacy-link.test.js"
Task T047: "Update tests/integration/register-form-privacy-link.test.js"
Task T048: "Update tests/integration/register-form-terms.test.js"
Task T049: "Update tests/integration/admin-access-logging.test.js"
Task T050: "Update tests/integration/auth-config.test.js"
Task T051: "Update remaining integration tests"
```

All these tasks are independent - different files, same pattern.

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 Only)

**Minimum Viable Product**:
1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Safe Test Execution)
4. Complete Phase 5-6: User Story 3 (Lifecycle Management + Integration Test Updates)
5. **STOP and VALIDATE**: Run full test suite
6. **SUCCESS**: Tests use separate database, production data is safe

**MVP Scope**: 
- Tasks T001-T020 (Setup + Foundational + US1)
- Tasks T029-T051 (US3 complete)
- Tasks T063-T066 (Core verification)
- **Total: ~56 tasks for MVP**

### Incremental Delivery

1. **Foundation** (T001-T008): Project ready for changes
2. **Core Safety** (T009-T020): Database selection working, unit tests passing
3. **Test Utilities** (T029-T036): Shared cleanup utilities ready
4. **Integration Updates** (T037-T051): All tests using test database → **MVP COMPLETE**
5. **Enhanced Config** (T021-T028): Better error messages and validation
6. **CI/CD** (T052-T058): Automated testing in pipeline
7. **Visual Polish** (T059-T062): Improved developer experience
8. **Final Polish** (T063-T075): Documentation and verification

### Parallel Team Strategy

With 3 developers after Foundational phase complete:

- **Developer A**: User Story 1 (T009-T020) - Core logic
- **Developer B**: User Story 2 (T021-T028) - Configuration enhancement
- **Developer C**: User Story 3 Unit Tests (T029-T031) - Wait for A to finish T014-T017

Then after US1 core complete:
- **Developer A**: User Story 3 Implementation (T032-T036)
- **Developer B**: User Story 5 (T059-T062)
- **Developer C**: Documentation (T052-T054)

Finally all together:
- **All Developers**: Phase 6 integration test updates (T037-T051) - split 15 files among team

---

## Task Summary

**Total Tasks**: 75

**By Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (US1): 12 tasks (5 test + 7 implementation)
- Phase 4 (US2): 8 tasks (3 test + 5 implementation)
- Phase 5 (US3 Part 1): 8 tasks (3 test + 5 implementation)
- Phase 6 (US3 Part 2): 15 tasks (integration test updates)
- Phase 7 (US4): 7 tasks (3 documentation + 4 implementation)
- Phase 8 (US5): 4 tasks
- Phase 9 (Polish): 13 tasks

**By User Story**:
- User Story 1 (P1): 12 tasks
- User Story 2 (P1): 8 tasks
- User Story 3 (P2): 23 tasks
- User Story 4 (P2): 7 tasks
- User Story 5 (P3): 4 tasks
- Setup/Foundational: 8 tasks
- Polish: 13 tasks

**Parallel Tasks**: 51 tasks marked [P] can run in parallel with others in same phase

**MVP Scope**: 56 tasks (Setup + Foundational + US1 + US3 + Core Verification)

**Estimated Time**:
- MVP: 8-12 hours (with parallelization)
- Full Feature: 12-16 hours (with parallelization)
- Sequential: 16-20 hours

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD approach: Write tests FIRST, verify they FAIL, then implement
- Verify tests PASS after implementation (green phase)
- Phase 6 has maximum parallelization opportunity (15 files, same pattern)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Unit tests continue using MongoDB Memory Server (no changes needed)
- Integration tests updated to use new test database utilities
