# Tasks: Admin Area Access

**Input**: Design documents from `/specs/005-admin-area-access/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/middleware.md

**Tests**: Included per Constitution requirement (TDD mandatory)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Next.js App Router structure: `src/app/`, `src/components/`, `src/lib/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/components/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for admin area per plan.md: `src/app/dashboard/`, `src/components/admin/`, `src/lib/middleware/`, `src/lib/utils/`
- [x] T002 [P] Create admin scripts directory: `scripts/` for admin user management
- [x] T003 [P] Review and understand existing NextAuth configuration in `src/lib/auth.js` and `src/auth.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 **User Model Extension**: Add `isAdmin` field to User schema in `src/lib/models/User.js` with `type: Boolean, default: false, index: true`
- [x] T005 [P] **Unit Test**: User model validates isAdmin field in `tests/unit/lib/models/User.test.js` (write test, confirm it fails)
- [x] T006 **NextAuth Session Extension**: Update session callback in `src/lib/auth.js` to include `isAdmin` flag from database
- [x] T007 [P] **Script**: Create admin user management script in `scripts/create-admin-user.js` to grant/revoke admin access
- [x] T008 [P] **Integration Test**: Script successfully grants admin access in `tests/integration/scripts/create-admin-user.test.js`

**Checkpoint**: Foundation ready - User model extended, session includes admin flag, script available for creating admin users

---

## Phase 3: User Story 1 - Admin User Accesses Dashboard Area (Priority: P1) 🎯 MVP

**Goal**: Admin users can log in and access a professional dashboard area with distinct layout (sidebar, header, placeholder content). Non-admin users are blocked.

**Independent Test**: An admin user logs in, navigates to `/dashboard`, sees admin layout with welcome message and "Coming Soon" cards. Non-admin user attempting `/dashboard` is redirected to access denied page.

### Tests for User Story 1 (Write FIRST)

- [x] T009 [P] [US1] **Unit Test**: Middleware redirects unauthenticated users to login in `tests/unit/lib/middleware/adminAuth.test.js`
- [x] T010 [P] [US1] **Unit Test**: Middleware redirects non-admin users to access-denied in `tests/unit/lib/middleware/adminAuth.test.js`
- [x] T011 [P] [US1] **Unit Test**: Middleware allows admin users to continue in `tests/unit/lib/middleware/adminAuth.test.js`
- [x] T012 [P] [US1] **Component Test**: AdminLayout renders sidebar and header in `tests/components/admin/AdminLayout.test.js`
- [x] T013 [P] [US1] **Component Test**: AdminSidebar renders navigation items in `tests/components/admin/AdminSidebar.test.js`
- [x] T014 [P] [US1] **Component Test**: AdminHeader displays user info in `tests/components/admin/AdminHeader.test.js`
- [x] T015 [P] [US1] **Component Test**: EmptyDashboard shows welcome message and placeholder cards in `tests/components/admin/EmptyDashboard.test.js`
- [ ] T016 [P] [US1] **E2E Test**: Admin user login and dashboard access flow in `tests/e2e/admin-access.spec.js`

**Checkpoint**: All tests written and PASSING (E2E pending manual execution) - ready for implementation complete

### Implementation for User Story 1

- [x] T017 [P] [US1] **Middleware Logic**: Implement admin auth helper functions in `src/lib/middleware/adminAuth.js` (session validation, admin check)
- [x] T018 [US1] **Middleware Integration**: Update `src/middleware.js` to protect `/dashboard` routes using adminAuth helper
- [x] T019 [P] [US1] **Component**: Create AdminSidebar component in `src/components/admin/AdminSidebar.js` with navigation structure
- [x] T020 [P] [US1] **Component**: Create AdminHeader component in `src/components/admin/AdminHeader.js` with user info display
- [x] T021 [US1] **Component**: Create AdminLayout wrapper in `src/components/admin/AdminLayout.js` integrating sidebar and header
- [x] T022 [P] [US1] **Component**: Create EmptyDashboard component in `src/components/admin/EmptyDashboard.js` with welcome message and "Coming Soon" cards
- [x] T023 [P] [US1] **Route**: Create dashboard layout in `src/app/dashboard/layout.js` using AdminLayout
- [x] T024 [P] [US1] **Route**: Create dashboard home page in `src/app/dashboard/page.js` using EmptyDashboard
- [x] T025 [P] [US1] **Route**: Create access denied page in `src/app/access-denied/page.js` with clear messaging
- [x] T026 [US1] **Styling**: Add Tailwind classes to admin components for professional dashboard appearance (sidebar fixed, responsive grid)
- [x] T027 [US1] **Verify Tests**: Run all User Story 1 tests and ensure they pass

**Checkpoint**: User Story 1 complete - Admin users can access dashboard with professional layout, non-admin users blocked. ✅ MVP COMPLETE!

---

## Phase 4: User Story 2 - Non-Admin Users Prevented from Accessing Admin Area (Priority: P1)

**Goal**: Comprehensive security logging and testing of unauthorized access prevention including edge cases

**Independent Test**: Regular user attempts dashboard access → redirected to access denied page and attempt logged. Unauthenticated user → redirected to login. Logs include timestamp, userId, IP, attempted URL.

### Tests for User Story 2 (Write FIRST)

- [ ] T028 [P] [US2] **Unit Test**: Logger captures required fields (timestamp, userId, IP, URL) in `tests/unit/lib/utils/adminLogger.test.js`
- [ ] T029 [P] [US2] **Integration Test**: Non-admin dashboard access is logged in `tests/integration/admin-access-logging.test.js`
- [ ] T030 [P] [US2] **Integration Test**: Unauthenticated dashboard access redirects to login with callbackUrl in `tests/integration/admin-access-denied.test.js`
- [ ] T031 [P] [US2] **E2E Test**: Non-admin user blocked from dashboard and sees clear error message in `tests/e2e/admin-access-denied.spec.js`

**Checkpoint**: All tests written and FAILING - ready for implementation

### Implementation for User Story 2

- [ ] T032 [P] [US2] **Logger**: Create adminLogger utility in `src/lib/utils/adminLogger.js` with structured logging
- [ ] T033 [US2] **Middleware Enhancement**: Add logging to middleware when access denied (integrate adminLogger)
- [ ] T034 [US2] **Middleware Enhancement**: Ensure callbackUrl preserved in login redirects in `src/middleware.js`
- [ ] T035 [US2] **Access Denied Page**: Enhance `src/app/access-denied/page.js` with detailed explanation and support contact info
- [ ] T036 [US2] **Login Page**: Update `src/app/login/page.js` to display session expired message when query param present
- [ ] T037 [US2] **Verify Tests**: Run all User Story 2 tests and ensure they pass

**Checkpoint**: User Story 2 complete - Security logging operational, all access denial scenarios handled gracefully

---

## Phase 5: User Story 3 - System Administrator Grants Admin Access (Priority: P2)

**Goal**: Database script allows granting and revoking admin privileges. Admin status refreshed in sessions.

**Independent Test**: Run script to grant admin access to user → user can access dashboard on next login. Run script to revoke → user loses access immediately.

### Tests for User Story 3 (Write FIRST)

- [ ] T038 [P] [US3] **Integration Test**: Script grants admin access successfully in `tests/integration/scripts/grant-admin.test.js`
- [ ] T039 [P] [US3] **Integration Test**: Script revokes admin access successfully in `tests/integration/scripts/revoke-admin.test.js`
- [ ] T040 [P] [US3] **Integration Test**: User with revoked admin access is logged out on next request in `tests/integration/admin-privilege-revocation.test.js`
- [ ] T041 [P] [US3] **E2E Test**: Admin privilege lifecycle (grant → access → revoke → denied) in `tests/e2e/admin-lifecycle.spec.js`

**Checkpoint**: All tests written and FAILING - ready for implementation

### Implementation for User Story 3

- [ ] T042 [US3] **Script Enhancement**: Enhance `scripts/create-admin-user.js` to support revoke operation (accept `--revoke` flag)
- [ ] T043 [US3] **Script Feature**: Add list-admins command to script (display all users with isAdmin=true)
- [ ] T044 [US3] **Middleware Enhancement**: Add check for privilege revocation (force logout if session shows admin but DB shows non-admin) in `src/middleware.js`
- [ ] T045 [P] [US3] **Documentation**: Add script usage examples to `scripts/README.md`
- [ ] T046 [US3] **Verify Tests**: Run all User Story 3 tests and ensure they pass

**Checkpoint**: User Story 3 complete - Admin privileges can be granted and revoked via script with proper session handling

---

## Phase 6: User Story 4 - Admin Navigates Between Public Site and Admin Area (Priority: P3)

**Goal**: Admin users can seamlessly navigate between admin area and public site without re-authentication

**Independent Test**: Admin user in dashboard clicks link to public site → sees public site. Clicks admin link → returns to dashboard without login prompt.

### Tests for User Story 4 (Write FIRST)

- [ ] T047 [P] [US4] **Component Test**: AdminHeader includes link to public site in `tests/components/admin/AdminHeader.test.js`
- [ ] T048 [P] [US4] **Component Test**: Public site header includes admin dashboard link (if admin) in `tests/components/Header.test.js` (if applicable)
- [ ] T049 [P] [US4] **E2E Test**: Navigate from dashboard to public site and back in `tests/e2e/admin-navigation.spec.js`
- [ ] T050 [P] [US4] **Integration Test**: Session persists across public/admin context switch in `tests/integration/admin-session-persistence.test.js`

**Checkpoint**: All tests written and FAILING - ready for implementation

### Implementation for User Story 4

- [ ] T051 [P] [US4] **Component Enhancement**: Add "View Public Site" link to AdminHeader in `src/components/admin/AdminHeader.js`
- [ ] T052 [P] [US4] **Component Enhancement**: Add conditional "Admin Dashboard" link to public site header in `src/components/Header.js` (only if user.isAdmin)
- [ ] T053 [US4] **Session Validation**: Ensure middleware doesn't break session when switching contexts in `src/middleware.js`
- [ ] T054 [P] [US4] **Styling**: Ensure admin link in public header is visually distinct (badge or icon indicating admin access)
- [ ] T055 [US4] **Verify Tests**: Run all User Story 4 tests and ensure they pass

**Checkpoint**: User Story 4 complete - Seamless navigation between admin and public areas

---

## Phase 7: Edge Cases & Error Handling

**Purpose**: Handle edge cases identified in clarifications and spec edge cases section

### Tests for Edge Cases (Write FIRST)

- [ ] T056 [P] **Unit Test**: Custom 404 within admin layout in `tests/unit/app/dashboard/not-found.test.js`
- [ ] T057 [P] **Integration Test**: Session expiration redirects with preserved URL in `tests/integration/session-expiration.test.js`
- [ ] T058 [P] **E2E Test**: Admin accesses non-existent route → sees admin 404 in `tests/e2e/admin-404.spec.js`
- [ ] T059 [P] **E2E Test**: Session expires during admin session → redirect with message in `tests/e2e/session-expiration.spec.js`

**Checkpoint**: All edge case tests written and FAILING

### Implementation for Edge Cases

- [ ] T060 [P] **Route**: Create custom 404 page in `src/app/dashboard/not-found.js` using AdminLayout
- [ ] T061 [US1] **Middleware Enhancement**: Add session expiration detection with error query param in `src/middleware.js`
- [ ] T062 [P] **Component**: Style 404 page with helpful navigation links in `src/app/dashboard/not-found.js`
- [ ] T063 **Verify Tests**: Run all edge case tests and ensure they pass

**Checkpoint**: All edge cases handled properly

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T064 [P] **Documentation**: Update quickstart.md with actual implementation notes in `specs/005-admin-area-access/quickstart.md`
- [ ] T065 [P] **Documentation**: Create admin area user guide in `docs/ADMIN-AREA.md`
- [ ] T066 [P] **Accessibility**: Verify keyboard navigation works in admin area (Tab through sidebar, header, main content)
- [ ] T067 [P] **Accessibility**: Add ARIA labels to admin navigation elements
- [ ] T068 [P] **Performance**: Verify admin privilege check completes in <100ms (add performance logging)
- [ ] T069 [P] **Performance**: Verify dashboard page loads in <2 seconds (Lighthouse test)
- [ ] T070 [P] **Security Review**: Audit middleware code for security vulnerabilities
- [ ] T071 [P] **Security Review**: Verify session cookies have secure flags (httpOnly, secure, sameSite)
- [ ] T072 **Code Quality**: Run ESLint on all new files and fix warnings
- [ ] T073 **Code Quality**: Add JSDoc comments to all exported functions
- [ ] T074 [P] **Responsive Design**: Test admin layout on tablet and mobile (collapsible sidebar)
- [ ] T075 **Integration**: Run full test suite (unit + integration + component + E2E)
- [ ] T076 **Deployment Prep**: Create first admin user in staging/production database
- [ ] T077 **Validation**: Complete quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core MVP functionality
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 - Enhances security logging (can start after US1 components exist)
- **User Story 3 (Phase 5)**: Depends on Foundational - Independent of US1/US2 (can run parallel)
- **User Story 4 (Phase 6)**: Depends on US1 complete (needs AdminHeader component) - Navigation enhancement
- **Edge Cases (Phase 7)**: Depends on US1 complete (needs routes and middleware) - Can run parallel with US2-US4
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational only - FULLY INDEPENDENT
- **US2 (P1)**: Foundational + US1 middleware/routes - Enhances US1 with logging
- **US3 (P2)**: Foundational only - FULLY INDEPENDENT (can parallel with US1/US2)
- **US4 (P3)**: US1 components (AdminHeader) - Adds navigation

### Critical Path

1. Setup (Phase 1) → 2. Foundational (Phase 2) → 3. User Story 1 (Phase 3) → 4. Polish
2. **MVP = Phase 1 + Phase 2 + Phase 3 (US1)**

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T002 (scripts dir) || T003 (review NextAuth) can run in parallel

**Within Foundational (Phase 2)**:
- T005 (test) || T007 (script) || T008 (integration test) can run after T004 completes

**Within User Story 1 Tests**:
- T009-T016 (all tests) can be written in parallel

**Within User Story 1 Implementation**:
- After T018 (middleware) completes:
  - T019 (AdminSidebar) || T020 (AdminHeader) || T022 (EmptyDashboard) || T023 (layout) || T024 (page) || T025 (access denied)
  - Then T021 (AdminLayout integrates sidebar+header)
  - Then T026 (styling)

**Cross-Story Parallelization** (with multiple developers):
- After Foundational complete: US1 || US3 can proceed in parallel
- After US1 complete: US2 || US4 can proceed in parallel

---

## Parallel Example: User Story 1

```bash
# Write all tests in parallel (8 developers):
Developer 1: T009 - Middleware unauthenticated test
Developer 2: T010 - Middleware non-admin test
Developer 3: T011 - Middleware admin test
Developer 4: T012 - AdminLayout component test
Developer 5: T013 - AdminSidebar component test
Developer 6: T014 - AdminHeader component test
Developer 7: T015 - EmptyDashboard component test
Developer 8: T016 - E2E admin access test

# Implement core components in parallel (after middleware done):
Developer A: T019 - AdminSidebar
Developer B: T020 - AdminHeader
Developer C: T022 - EmptyDashboard
Developer D: T023 - Dashboard layout
Developer E: T024 - Dashboard page
Developer F: T025 - Access denied page
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. **Phase 1**: Setup (10 minutes)
2. **Phase 2**: Foundational (30 minutes) - BLOCKS everything
3. **Phase 3**: User Story 1 (2 hours)
   - Write tests FIRST (30 min)
   - Implement components (1 hour)
   - Verify tests pass (30 min)
4. **STOP and VALIDATE**: Manual testing + E2E
5. **Deploy MVP**: Admin can access dashboard, non-admin blocked

**MVP Deliverable**: ~3 hours of work, core functionality operational

### Incremental Delivery

1. **Sprint 1**: Setup + Foundational + US1 → **Deploy MVP**
2. **Sprint 2**: US2 (security logging) → **Deploy enhanced security**
3. **Sprint 3**: US3 (admin management) → **Deploy admin lifecycle**
4. **Sprint 4**: US4 (navigation) + Edge Cases + Polish → **Deploy complete feature**

### Parallel Team Strategy (4 developers)

**Sprint 1** (Setup + Foundation + US1):
- All: Phase 1 + Phase 2 together (40 min)
- All: Write US1 tests together (30 min)
- Split implementation:
  - Dev 1+2: Middleware + Routes (T017-T018, T023-T025)
  - Dev 3: Sidebar + Header (T019-T020)
  - Dev 4: Layout + EmptyDashboard (T021-T022)
- All: Integration + styling (T026-T027)

**Sprint 2** (Parallel stories):
- Dev 1: US2 (security logging)
- Dev 2: US3 (admin management)
- Dev 3+4: US4 (navigation) + Edge Cases

**Sprint 3** (Polish):
- All: Phase 8 tasks divided by category

---

## Task Summary

**Total Tasks**: 77
- Setup: 3 tasks
- Foundational: 5 tasks (BLOCKS all stories)
- User Story 1 (P1): 19 tasks (8 tests + 11 implementation)
- User Story 2 (P1): 10 tasks (4 tests + 6 implementation)
- User Story 3 (P2): 9 tasks (4 tests + 5 implementation)
- User Story 4 (P3): 9 tasks (4 tests + 5 implementation)
- Edge Cases: 8 tasks (4 tests + 4 implementation)
- Polish: 14 tasks

**Parallel Opportunities**: 45 tasks marked [P] (58% can run in parallel)

**Independent User Stories**:
- ✅ US1: Fully independent (only needs Foundational)
- ✅ US3: Fully independent (only needs Foundational)
- ⚠️ US2: Depends on US1 middleware/routes
- ⚠️ US4: Depends on US1 AdminHeader component

**MVP Scope** (Recommended): Phase 1 + Phase 2 + Phase 3 (US1) = 27 tasks (~3 hours)

**Full Feature** (All stories + polish): 77 tasks (~10-12 hours with tests)

---

## Notes

- **TDD Enforced**: Tests written before implementation per Constitution
- **[P] tasks**: Different files, can run in parallel if team has capacity
- **[Story] labels**: Map tasks to user stories for traceability and independent delivery
- **MVP-first approach**: US1 alone delivers working admin area
- **Incremental value**: Each story adds functionality without breaking previous work
- **Constitution compliance**: All gates passed, no violations
- **File paths**: All tasks include exact file paths for immediate execution
- **Checkpoints**: Validate after each phase before proceeding

**Ready to Start**: Begin with T001 (Setup) and follow sequential phase order, parallelizing marked tasks within phases as team capacity allows.
