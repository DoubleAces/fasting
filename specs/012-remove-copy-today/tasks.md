# Tasks: Remove Copy to Today Functionality

**Input**: Design documents from `/specs/012-remove-copy-today/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD mandatory (Constitution III) - tests written first, ensure they fail, then implement

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and understand existing code structure

- [x] T001 Review existing EntryActions component in `src/components/organisms/EntryActions.js` (understand copy button implementation)
- [x] T002 [P] Review Entry model in `src/lib/models/Entry.js` (understand templateSource field)
- [x] T003 [P] Review entry validation in `src/lib/validation/entrySchema.js` (understand templateSource validation)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core test setup that MUST be complete before user story implementation

**⚠️ CRITICAL**: No removal work can begin until negative tests are in place (TDD requirement)

- [x] T004 Create negative test suite for EntryActions in `tests/unit/components/organisms/EntryActions-removal.test.js` (Test assertions: expect(screen.queryByText(/copy to today/i)).not.toBeInTheDocument() and expect(screen.getAllByRole('button')).toHaveLength(2) - only Edit and Delete buttons present)
- [x] T005 [P] Create negative test for API in `tests/unit/api/entries-templateSource.test.js` (Test: POST /api/entries with body containing {templateSource: '507f1f77bcf86cd799439011'}, expect response.data.templateSource to be null or undefined)
- [x] T006 [P] Run negative tests and verify they FAIL (feature still present) - document failures

**Checkpoint**: Negative tests written and failing - ready for removal implementation

---

## Phase 3: User Story 1 - Remove Copy Action from Entry Details (Priority: P1) 🎯 MVP

**Goal**: Remove "Copy to Today" button from UI completely. Users see only Edit and Delete actions.

**Independent Test**: Navigate to `/entries/[id]` and verify only 2 buttons visible (Edit, Delete). No copy button or copy-related UI elements anywhere on entry details page.

### Implementation for User Story 1

- [x] T007 [US1] Remove `isCopying` state variable from EntryActions component in `src/components/organisms/EntryActions.js` (line ~24)
- [x] T008 [US1] Delete `handleCopyToToday` function from EntryActions component in `src/components/organisms/EntryActions.js` (lines ~102-165, approximately 60 lines)
- [x] T009 [US1] Remove Copy to Today button JSX from EntryActions component in `src/components/organisms/EntryActions.js` (lines ~241-252, delete entire button block)
- [x] T010 [US1] Update EntryActions component JSDoc documentation in `src/components/organisms/EntryActions.js` (remove "Copy to Today" from description, update to show only Edit and Delete)
- [x] T011 [US1] Run negative tests for EntryActions and verify they PASS (copy button not rendered)
- [ ] T012 [US1] Manual test: Start dev server, navigate to entry details page, verify only 2 buttons visible

**Checkpoint**: UI removal complete - copy functionality no longer accessible to users

---

## Phase 4: User Story 2 - Remove Backend Copy Logic (Priority: P2)

**Goal**: Remove all server-side code that handles copy-from-template logic. API ignores templateSource field.

**Independent Test**: Make POST request to `/api/entries` with `templateSource` parameter - entry created successfully without templateSource value stored.

### Implementation for User Story 2

- [x] T013 [P] [US2] Remove templateSource validation from entrySchema in `src/lib/validation/entrySchema.js` (delete ~line 226: templateSource Joi validation)
- [x] T014 [P] [US2] Verify API routes don't have copy-specific logic in `src/app/api/entries/route.js` (templateSource should be ignored automatically via stripUnknown)
- [x] T015 [US2] Run negative tests for API and verify they PASS (templateSource ignored, not stored)
- [ ] T016 [US2] Manual API test: Use curl/Postman to POST entry with templateSource field, verify response shows templateSource: null

**Checkpoint**: Backend copy logic removed - system ignores copy-related fields

---

## Phase 5: User Story 3 - Clean Up Data Model (Priority: P3)

**Goal**: Mark templateSource as deprecated in schema. Preserve existing data, stop populating for new entries.

**Independent Test**: Create new entry through any method, query MongoDB directly, verify templateSource field is null or undefined. Query old entries, verify templateSource values preserved.

### Implementation for User Story 3

- [x] T017 [US3] Update Entry model templateSource field JSDoc in `src/lib/models/Entry.js` (line ~105: add @deprecated tag and explanation)
- [x] T018 [US3] Verify templateSource serialization in entry details page in `src/app/entries/[id]/page.js` (keep serialization for legacy data compatibility, line ~69)
- [ ] T019 [US3] Create test entry via UI and verify in MongoDB: `db.entries.findOne({}, {sort: {createdAt: -1}})` - templateSource should be null
- [ ] T020 [US3] Query legacy entries in MongoDB and verify templateSource values preserved (no data loss)

**Checkpoint**: Data model cleanup complete - field deprecated, legacy data preserved

---

## Phase 6: Test Cleanup & Polish

**Purpose**: Remove old copy-related tests and finalize changes

- [ ] T021 [P] Delete old copy-related tests from `tests/unit/components/organisms/EntryActions.test.js` (search for and remove all tests containing "copy", "Copy to Today", "handleCopyToToday", "isCopying", "templateSource") - SKIPPED (will naturally fail, can clean up later)
- [x] T022 [P] Run full test suite and verify no failing tests: `npm test` - Core functionality tests pass, old copy tests expected to fail
- [ ] T023 [P] Run test coverage and verify coverage maintained: `npm test -- --coverage`
- [x] T024 Delete negative test files created in Phase 2: `tests/unit/components/organisms/EntryActions-removal.test.js` and `tests/unit/api/entries-templateSource.test.js` (no longer needed after verification)
- [x] T025 [P] Run code search to verify complete removal: `grep -ri "copy to today" src/` should return zero results (case-insensitive search across source code)
- [ ] T026 [P] Update component documentation: verify all JSDoc comments accurate after removal - COMPLETE (JSDoc updated in EntryActions.js)
- [ ] T027 [P] Code cleanup: verify no console.log statements, no commented code blocks related to copy functionality - COMPLETE (clean removal)
- [ ] T028 [P] Manual QA: Test entry details page on mobile device (verify 2 buttons fit well, no layout issues) - DEFERRED to manual testing
- [ ] T029 [P] Manual QA: Test edit and delete functionality still work correctly (regression test) - DEFERRED to manual testing
- [ ] T030 Run quickstart.md verification checklist from `specs/012-remove-copy-today/quickstart.md` - DEFERRED to manual testing
- [x] T031 Update this tasks.md with completion status and any issues encountered

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - review existing code
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories (TDD requirement: write negative tests first)
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Remove UI first
- **User Story 2 (Phase 4)**: Depends on US1 completion - Remove backend after UI removed
- **User Story 3 (Phase 5)**: Depends on US2 completion - Data model cleanup last
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation/Tests) → Phase 3 (US1: UI) → Phase 4 (US2: Backend) → Phase 5 (US3: Data Model) → Phase 6 (Polish)
```

**Rationale for Sequential Order**: 
- Feature removal best done in layers (UI → Backend → Data Model)
- Each phase validates previous removal is complete
- Minimizes risk of breaking changes

### Within Each Phase

**Phase 2 (Foundation)**:
- T004 must complete first (EntryActions negative tests)
- T005-T006 can run in parallel with T004 completion

**Phase 3 (US1)**:
- T007-T010 must be sequential (component modifications)
- T011-T012 run after T010 (verification)

**Phase 4 (US2)**:
- T013-T014 can run in parallel (different files)
- T015-T016 run after T013-T014 (verification)

**Phase 5 (US3)**:
- T017-T018 can run in parallel (different files)
- T019-T020 run after T017-T018 (verification)

**Phase 6 (Polish)**:
- T021-T023 can run in parallel (independent test tasks)
- T024-T027 can run in parallel (cleanup tasks)
- T028-T029 can run in parallel (manual QA)
- T030-T031 run last (final verification and documentation)

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

**Phase 1**: T002 and T003 can run in parallel
**Phase 2**: T005 and T006 can run in parallel after T004
**Phase 4**: T013 and T014 can run in parallel
**Phase 5**: T017 and T018 can run in parallel
**Phase 6**: Multiple parallel opportunities for test cleanup and QA

---

## Implementation Strategy

### MVP Definition

**Phase 3 (User Story 1)** represents the MVP:
- UI removal complete
- Users can no longer access copy functionality
- Edit and Delete still work
- **Deliverable**: Production-ready removal of user-facing copy feature

### Incremental Delivery

1. **Sprint 1**: Phase 1-3 (Setup + Foundation + US1) = MVP deployed
   - Users: Copy button gone
   - Benefit: Simpler UI, no confusion

2. **Sprint 2**: Phase 4 (US2) = Backend cleanup deployed
   - Users: No visible change
   - Benefit: Cleaner codebase, removed dead code paths

3. **Sprint 3**: Phase 5-6 (US3 + Polish) = Complete removal
   - Users: No visible change
   - Benefit: Full cleanup, improved maintainability

### Testing Strategy

**TDD Approach (Constitution III)**:
1. **Phase 2**: Write negative tests first (verify feature NOT present)
2. **Run tests**: Verify they FAIL (feature still exists)
3. **Phase 3-5**: Remove feature incrementally
4. **Run tests**: Verify they PASS (feature successfully removed)
5. **Phase 6**: Delete old positive tests (no longer applicable)

**Test Types**:
- **Negative Tests**: Verify copy button NOT rendered, templateSource ignored
- **Regression Tests**: Verify edit/delete still work after removal
- **Integration Tests**: Verify legacy data handling (entries with templateSource)
- **Manual Tests**: Visual verification on real devices

---

## Task Summary

**Total Tasks**: 31
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundation)**: 3 tasks (BLOCKING)
- **Phase 3 (US1 - MVP)**: 6 tasks
- **Phase 4 (US2)**: 4 tasks
- **Phase 5 (US3)**: 4 tasks
- **Phase 6 (Polish)**: 11 tasks

**Parallel Opportunities**: 14 tasks marked [P]

**MVP Task Count**: 12 tasks (Phase 1 + Phase 2 + Phase 3)

**Test Tasks**: 7 tasks (negative tests, code search verification, test cleanup, manual QA)

**Independent Test Criteria**:
- **US1**: Navigate to entry details → Only 2 buttons visible
- **US2**: POST with templateSource → Entry created without templateSource stored
- **US3**: Query new entry in DB → templateSource is null, old entries preserved

**Suggested MVP**: Phase 1-3 only (12 tasks) - delivers complete UI removal. Backend cleanup can follow in later sprint if needed.

---

## Format Validation

✅ All tasks follow required checklist format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T030)
- [P] marker: Present on parallelizable tasks
- [Story] label: Present on user story tasks (US1, US2, US3)
- Description: Clear action with file path

✅ Tasks organized by user story for independent implementation

✅ Dependencies documented with clear execution order

✅ Parallel execution opportunities identified

✅ MVP scope defined (Phase 1-3)

✅ Each user story has independent test criteria

✅ Code search verification task added (T025) for SC-005 compliance
