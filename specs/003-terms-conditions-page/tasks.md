# Tasks: Terms and Conditions Page

**Input**: Design documents from `/specs/003-terms-conditions-page/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Following TDD (Test-Driven Development) as required by project constitution.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Single Next.js project: `src/`, `tests/` at repository root
- Components follow atomic design: `src/components/atoms/`, `molecules/`, `organisms/`
- Pages in App Router: `src/app/[route]/page.js`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and branch setup

- [X] T001 Create feature branch `003-terms-conditions-page` from main
- [X] T002 [P] Verify development environment (Next.js 15.5.6, Node.js, MongoDB running)
- [X] T003 [P] Install dependencies if needed (npm install)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend User model with termsAcceptedAt field in src/lib/models/User.js
- [X] T005 Write unit tests for User model extension in tests/unit/models/User.test.js
- [X] T006 Run User model tests to verify termsAcceptedAt field validation (must be Date, immutable, not future)
- [X] T007 [P] Configure smooth scroll CSS behavior in src/app/globals.css (scroll-behavior: smooth)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Terms Before Registration (Priority: P1) 🎯 MVP

**Goal**: New users can access and review the terms and conditions before creating an account

**Independent Test**: Navigate to /terms from registration page, verify complete terms are visible with all 10 sections, scroll through content, return to registration

### Tests for User Story 1 (TDD - Write First)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Create test for TermsSection atom in tests/components/atoms/TermsSection.test.js (renders heading with ID, renders content, applies correct styling)
- [ ] T009 [P] [US1] Create test for TermsContent organism in tests/components/organisms/TermsContent.test.js (renders all 10 sections, effective date displayed, section IDs are correct, health disclaimer highlighted)
- [ ] T010 [US1] Create test for terms page in tests/pages/terms.test.js (page renders, metadata correct, accessible to unauthenticated users)
- [ ] T011 [US1] Run all User Story 1 tests and confirm they FAIL (red phase)

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create TermsSection atom component in src/components/atoms/TermsSection.js (accepts id, title, content, highlighted props)
- [ ] T013 [US1] Create TermsContent organism in src/components/organisms/TermsContent.js (contains all 10 sections with proper content)
- [ ] T014 [US1] Create terms page in src/app/terms/page.js (Server Component with metadata export, renders TermsContent)
- [ ] T015 [US1] Add terms content for all sections: Introduction, Account Terms, User Responsibilities, Health Disclaimer, Privacy Notice, Service Usage, Termination, Liability Limitations, Dispute Resolution, Contact Information
- [ ] T016 [US1] Add health-specific disclaimers in Health Disclaimer section (fasting risks for pregnant, diabetic, medical conditions)
- [ ] T017 [US1] Add support email address in Contact Information section
- [ ] T018 [US1] Run all User Story 1 tests and confirm they PASS (green phase)
- [ ] T019 [US1] Refactor components for code quality without changing behavior (if needed)
- [ ] T020 [US1] Re-run tests to ensure no regressions after refactoring

### E2E Tests for User Story 1

- [ ] T021 [US1] Create Playwright E2E test in tests/e2e/terms-page-viewing.spec.js (navigate to /terms, verify all sections visible, verify scrolling works)
- [ ] T022 [US1] Create Playwright accessibility test in tests/e2e/terms-accessibility.spec.js (run axe-core, verify WCAG 2.1 AA compliance, test keyboard navigation)
- [ ] T023 [US1] Run E2E tests for User Story 1 and verify they pass

**Checkpoint**: At this point, User Story 1 should be fully functional - /terms page accessible and displays all content

---

## Phase 4: User Story 1B - Terms Acceptance in Registration (Priority: P1) 🎯 MVP

**Goal**: Registration flow requires users to explicitly accept terms via checkbox before account creation

**Independent Test**: Attempt registration without checking terms (blocked), check terms box and register successfully, verify termsAcceptedAt timestamp saved

**Note**: This is part of P1 MVP as it's critical for legal compliance

### Tests for User Story 1B (TDD - Write First)

- [ ] T024 [P] [US1] Create test for TermsCheckbox molecule in tests/components/molecules/TermsCheckbox.test.js (renders unchecked by default, onChange handler works, error message displays, links to /terms)
- [ ] T025 [US1] Create integration test in tests/integration/registration-with-terms.test.js (registration blocked without checkbox, registration succeeds with checkbox, termsAcceptedAt saved to database)
- [ ] T026 [US1] Run User Story 1B tests and confirm they FAIL (red phase)

### Implementation for User Story 1B

- [ ] T027 [US1] Create TermsCheckbox molecule in src/components/molecules/TermsCheckbox.js (controlled component with checked, onChange, error props)
- [ ] T028 [US1] Update RegisterForm organism in src/app/(auth)/register/page.js - add termsAccepted state
- [ ] T028a [US1] Add "Read our Terms and Conditions" link to registration page (separate from checkbox, positioned above or below form)
- [ ] T029 [US1] Add TermsCheckbox to RegisterForm with validation logic (client-side)
- [ ] T030 [US1] Update registration API route to validate terms acceptance (server-side validation)
- [ ] T031 [US1] Update User.create() call to set termsAcceptedAt timestamp on successful registration
- [ ] T032 [US1] Add error message display for unchecked terms ("You must accept the Terms and Conditions to create an account")
- [ ] T033 [US1] Run User Story 1B tests and confirm they PASS (green phase)
- [ ] T034 [US1] Refactor registration form code for clarity (if needed)
- [ ] T035 [US1] Re-run tests to ensure no regressions

### E2E Tests for User Story 1B

- [ ] T036 [US1] Create Playwright E2E test in tests/e2e/terms-registration-flow.spec.js (complete registration journey: fill form, verify terms checkbox unchecked, try submit without checkbox, check checkbox, submit successfully, verify redirect to /entries)
- [ ] T037 [US1] Add database verification in E2E test (query User document, verify termsAcceptedAt is set to recent timestamp)
- [ ] T038 [US1] Run E2E tests for User Story 1B and verify they pass

**Checkpoint**: MVP complete - Users can view terms AND registration requires terms acceptance with timestamp tracking

---

## Phase 5: User Story 2 - Access Terms While Logged In (Priority: P2)

**Goal**: Existing users can review the current terms and conditions at any time from footer links

**Independent Test**: Log in, navigate to /terms from footer, verify terms are displayed, use back button to return

**Note**: Most implementation already done in US1 - this phase focuses on verification with authenticated users

### Tests for User Story 2 (TDD - Write First)

- [ ] T039 [P] [US2] Create test for authenticated user access in tests/pages/terms.test.js (logged-in user can access /terms, content identical to unauthenticated view)
- [ ] T040 [US2] Run User Story 2 tests and confirm current behavior (should mostly pass with US1 implementation)

### Implementation for User Story 2

- [ ] T041 [US2] Verify terms page is accessible to authenticated users (no middleware blocking)
- [ ] T042 [US2] Verify footer "Terms" link exists and points to /terms route
- [ ] T043 [US2] Test browser back button navigation from terms page
- [ ] T044 [US2] Run User Story 2 tests and confirm they PASS

### E2E Tests for User Story 2

- [ ] T045 [US2] Create Playwright E2E test in tests/e2e/terms-authenticated-access.spec.js (log in, click footer Terms link, verify navigation to /terms, verify content displayed, click back button, verify return to previous page)
- [ ] T046 [US2] Run E2E tests for User Story 2 and verify they pass

**Checkpoint**: User Story 2 complete - Authenticated users can access terms from footer

---

## Phase 6: User Story 3 - Reference Specific Sections (Priority: P3)

**Goal**: Users can link to or reference specific sections of the terms via URL anchors

**Independent Test**: Navigate to /terms, click section heading, verify URL updates with anchor (e.g., /terms#health-disclaimer), share URL with anchor and verify it scrolls to correct section

### Tests for User Story 3 (TDD - Write First)

- [ ] T047 [P] [US3] Add test to TermsSection.test.js for anchor functionality (section heading has id attribute matching section name)
- [ ] T048 [P] [US3] Add test to terms page test for anchor navigation (URL hash updates when clicking section, page scrolls to correct section on load with hash)
- [ ] T049 [US3] Run User Story 3 tests and confirm behavior (may already pass with US1 implementation)

### Implementation for User Story 3

- [ ] T050 [US3] Verify each TermsSection has proper id attribute (should be done in T012)
- [ ] T051 [US3] Add click handlers to section headings if needed for anchor navigation (or verify native browser behavior works)
- [ ] T052 [US3] Test direct navigation to URLs with anchors (e.g., /terms#health-disclaimer)
- [ ] T053 [US3] Verify smooth scroll CSS works for anchor navigation
- [ ] T054 [US3] Run User Story 3 tests and confirm they PASS

### E2E Tests for User Story 3

- [ ] T055 [US3] Create Playwright E2E test in tests/e2e/terms-section-anchors.spec.js (navigate to /terms, click on Health Disclaimer section, verify URL is /terms#health-disclaimer, verify page scrolled to section)
- [ ] T056 [US3] Add test for direct URL navigation (navigate directly to /terms#privacy-notice, verify page loads and scrolls to Privacy Notice section)
- [ ] T057 [US3] Add test for copying and sharing anchor URLs (get URL with hash, navigate to it in new context, verify correct section displayed)
- [ ] T058 [US3] Run E2E tests for User Story 3 and verify they pass

**Checkpoint**: All user stories complete - Terms page fully functional with all P1, P2, P3 features

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T059 [P] Verify mobile responsiveness on 320px, 375px, 768px, 1024px, 1920px viewports
- [ ] T060 [P] Verify dark mode styling for all terms components
- [ ] T061 [P] Run Lighthouse audit on /terms page and verify SEO score >90
- [ ] T062 [P] Run Lighthouse audit and verify page load time <2 seconds on 3G
- [ ] T063 [P] Verify WCAG 2.1 AA compliance with manual keyboard testing (Tab, Enter, Esc keys)
- [ ] T064 [P] Run ESLint on all new/modified files and fix any errors/warnings
- [ ] T065 [P] Run Prettier on all new/modified files to ensure consistent formatting
- [ ] T066 Test edge cases: JavaScript disabled (terms page should still render), browser back/forward navigation
- [ ] T067 [P] Verify no console.log() statements in production code
- [ ] T068 [P] Add JSDoc comments to complex functions in TermsCheckbox and TermsContent
- [ ] T069 Run complete test suite (unit + integration + E2E) and verify 100% pass rate
- [ ] T070 Generate test coverage report and verify >90% coverage for terms components
- [ ] T071 [P] Update CLAUDE.md or project documentation with terms feature details (if needed)
- [ ] T072 Verify quickstart.md instructions work by following them step-by-step
- [ ] T073 Create PR with comprehensive description of all changes
- [ ] T074 Request legal review of terms content before merging to production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase - Core terms page display
- **User Story 1B (Phase 4)**: Depends on User Story 1 (Phase 3) - Registration integration needs terms page to exist
- **User Story 2 (Phase 5)**: Depends on User Story 1 (Phase 3) - Can start immediately after US1 complete
- **User Story 3 (Phase 6)**: Depends on User Story 1 (Phase 3) - Can start immediately after US1 complete (or in parallel)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1B (P1)**: Depends on User Story 1 (terms page must exist to link from checkbox)
- **User Story 2 (P2)**: Depends on User Story 1 (terms page must exist to access while logged in)
- **User Story 3 (P3)**: Depends on User Story 1 (section anchors built into TermsSection from US1)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD red phase)
- Atom components before organisms (TermsSection before TermsContent)
- Page components after organisms (terms page needs TermsContent)
- Unit tests before integration tests
- Integration tests before E2E tests
- Story implementation complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel

**Phase 2 (Foundational)**:
- T007 can run in parallel with T004-T006 (CSS config independent of model work)

**Phase 3 (User Story 1 - Tests)**:
- T008, T009, T010 can all run in parallel (different test files)

**Phase 3 (User Story 1 - Implementation)**:
- T012 and T013 can run in parallel initially (independent components)
- After T012, T013, T014: T015, T016, T017 can run in parallel (different sections of content)

**Phase 4 (User Story 1B - Tests)**:
- T024 and T025 can run in parallel (different test files)

**Phase 5, 6 (User Story 2 & 3)**:
- After User Story 1 complete, US2 and US3 can proceed in parallel if desired

**Phase 7 (Polish)**:
- T059, T060, T061, T062, T063, T064, T065, T067, T068, T071 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1 - Core Implementation

```bash
# After tests written and failing, launch implementation tasks in parallel:

# Developer A:
Task T012: "Create TermsSection atom component in src/components/atoms/TermsSection.js"

# Developer B (parallel):
Task T013: "Create TermsContent organism in src/components/organisms/TermsContent.js"

# After both T012 and T013 complete:

# Developer A:
Task T014: "Create terms page in src/app/terms/page.js"

# Developer B (parallel):
Task T015: "Add terms content for all sections"

# Developer C (parallel):
Task T016: "Add health-specific disclaimers in Health Disclaimer section"

# Developer D (parallel):
Task T017: "Add support email address in Contact Information section"
```

---

## Parallel Example: User Story 1 - Testing Phase

```bash
# Launch all tests for User Story 1 together:

# Developer A:
Task T008: "Create test for TermsSection atom in tests/components/atoms/TermsSection.test.js"

# Developer B (parallel):
Task T009: "Create test for TermsContent organism in tests/components/organisms/TermsContent.test.js"

# Developer C (parallel):
Task T010: "Create test for terms page in tests/pages/terms.test.js"

# After all complete:
Task T011: "Run all User Story 1 tests and confirm they FAIL"
```

---

## Implementation Strategy

### MVP Scope (Recommended)
**Phase 1, 2, 3, 4** = Complete MVP
- Setup infrastructure
- User model extension
- Terms page display (User Story 1)
- Terms acceptance in registration (User Story 1B)
- **Deliverable**: Legally compliant registration flow with terms acceptance tracking

### Phase 2 Delivery (Optional)
Add **Phase 5** (User Story 2)
- Authenticated user access to terms
- **Deliverable**: Existing users can review terms anytime

### Phase 3 Delivery (Optional)
Add **Phase 6** (User Story 3)
- Section anchor navigation
- **Deliverable**: Enhanced UX with direct section linking

### Final Delivery
Add **Phase 7** (Polish)
- Performance optimization
- Accessibility verification
- Code quality improvements
- **Deliverable**: Production-ready feature

---

## Task Validation Checklist

✅ **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ **All user story tasks have Story label**: [US1], [US2], [US3]  
✅ **Setup and Foundational tasks have NO Story label**  
✅ **Polish tasks have NO Story label**  
✅ **Each user story has independent test criteria**  
✅ **Tests written before implementation (TDD)**  
✅ **File paths included in all implementation tasks**  
✅ **Dependencies clearly documented**  
✅ **Parallel opportunities identified**  
✅ **MVP scope clearly defined** (Phase 1-4)

---

## Summary

- **Total Tasks**: 75
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 4 tasks (blocking)
- **User Story 1 (P1)**: 23 tasks (terms page display)
- **User Story 1B (P1)**: 16 tasks (registration integration)
- **User Story 2 (P2)**: 8 tasks (authenticated access)
- **User Story 3 (P3)**: 12 tasks (section anchors)
- **Polish Phase**: 16 tasks (quality & optimization)
- **Parallel Opportunities**: 25+ tasks can run in parallel within phases
- **MVP Scope**: Phase 1-4 (46 tasks) = Complete legal compliance
- **Independent Test Criteria**: Each user story has clear verification steps

---

**Next Steps**: 
1. Begin with Phase 1 (Setup) - 3 tasks
2. Complete Phase 2 (Foundational) - 4 blocking tasks
3. Start Phase 3 (User Story 1) using TDD workflow
4. Continue through phases in order, or parallelize User Stories 2 & 3 after US1 complete
5. Legal review required before production deployment (Task T074)
