# Implementation Tasks: Admin User Management

**Feature**: 006-admin-user-management  
**Branch**: `006-admin-user-management`  
**Date**: October 22, 2025

---

## Task Summary

**Total Tasks**: 63  
**User Stories**: 3 (US1: View Users, US2: Toggle Admin, US3: Delete Users)  
**Estimated Effort**: 16-20 hours

**Task Distribution**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundation): 10 tasks
- Phase 3 (US1 - View Users): 18 tasks
- Phase 4 (US2 - Toggle Admin): 12 tasks
- Phase 5 (US3 - Delete Users): 13 tasks
- Phase 6 (Polish): 5 tasks

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)
For minimum viable product, implement **Phase 1-3 only** (Setup + Foundation + US1). This delivers:
- Complete user viewing capability with pagination, filtering, sorting
- Independent value without edit/delete features
- Estimated: 8-10 hours

### Full Feature (All User Stories)
Complete all phases for full admin user management capability.
Estimated: 16-20 hours

### Parallel Execution Opportunities

**Within User Stories**:
- US1: FilterBar, PaginationControls, and date formatter can be built in parallel
- US2: AdminToggle component and audit service can be built in parallel  
- US3: DeleteUserButton component and cascade deletion service can be built in parallel

**Across User Stories**:
- US2 and US3 can be started in parallel after US1 foundation is complete
- Toast system (Foundation) can be started early and used by all stories

---

## User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2)
                                                       → Phase 5 (US3)
                                            
All phases → Phase 6 (Polish)
```

**Explanation**:
- US1 (View Users) is the foundation - must complete first
- US2 (Toggle Admin) depends on US1 (needs user table to display toggle buttons)
- US3 (Delete Users) depends on US1 (needs user table to display delete buttons)
- US2 and US3 are **independent of each other** and can be implemented in parallel after US1

---

## Phase 1: Setup & Database (5 tasks)

**Goal**: Prepare database schema, indexes, and migrations for optimal performance.

**Estimated Time**: 1 hour

### Tasks

- [x] T001 Add indexes to User model in src/lib/models/User.js (name, isAdmin, createdAt, lastLogin, compound index)
- [x] T002 Create AuditLog model in src/lib/models/AuditLog.js with schema and indexes
- [x] T003 Create migration script migrations/001-add-user-indexes.js to add User indexes
- [x] T004 Create migration script migrations/002-create-auditlog-collection.js for AuditLog collection
- [x] T005 Run migrations and verify indexes created in MongoDB (manual verification)

**Deliverables**:
- Updated User model with 5 new indexes
- New AuditLog model with 7 indexes
- 2 migration scripts
- Database ready for high-performance queries

**Verification**:
```bash
node migrations/001-add-user-indexes.js
node migrations/002-create-auditlog-collection.js
# Verify in mongosh: db.users.getIndexes() and db.auditlogs.getIndexes()
```

---

## Phase 2: Foundation (10 tasks)

**Goal**: Build reusable components and utilities needed by all user stories.

**Estimated Time**: 3-4 hours

### Tasks

- [ ] T006 Write unit tests for Toast component in tests/components/Toast.test.js (7 test cases)
- [ ] T007 Write unit tests for ToastContainer in tests/components/ToastContainer.test.js (3 test cases)
- [ ] T008 Write integration tests for ToastContext in tests/integration/toast-context.test.js (4 test cases)
- [x] T009 [P] Implement Toast component in src/components/ui/Toast.js with success/error styling and ARIA announcements
- [x] T010 [P] Implement ToastContainer component in src/components/ui/ToastContainer.js with Portal rendering
- [x] T011 [P] Create ToastContext in src/contexts/ToastContext.js with state management and auto-dismiss logic
- [x] T012 Create useToast hook in src/hooks/useToast.js for consuming toast context
- [x] T013 Add ToastProvider to root layout in src/app/layout.js
- [ ] T014 Write unit tests for date formatter in tests/unit/utils/dateFormatter.test.js (5 test cases)
- [x] T015 [P] Implement date formatter utility in src/lib/utils/dateFormatter.js using Intl.DateTimeFormat
- [ ] T016 Write unit tests for audit service in tests/unit/services/auditService.test.js (4 test cases)
- [x] T017 [P] Implement audit service in src/lib/services/auditService.js with createAuditLog and logBlockedAttempt methods

**Deliverables**:
- Complete toast notification system (4 files, 14 tests)
- Date formatting utility (1 file, 5 tests)
- Audit logging service (1 file, 4 tests)
- Total: 23 tests passing

**Verification**:
```bash
npm test tests/components/Toast
npm test tests/components/ToastContainer
npm test tests/integration/toast-context
npm test tests/unit/utils/dateFormatter
npm test tests/unit/services/auditService
```

---

## Phase 3: User Story 1 - View and Browse Users (18 tasks)

**Goal**: Implement paginated, filterable, sortable user list with <2s load time.

**Priority**: P1 (Foundation capability - required for US2 and US3)

**Independent Test Criteria**:
- ✅ Table displays all users with 6 columns (name, email, registration date, last login, admin status, actions)
- ✅ Pagination controls navigate between pages (25 users default, configurable 10-100)
- ✅ Name filter shows matching users (case-insensitive partial match)
- ✅ Email filter shows matching users (case-insensitive partial match)
- ✅ Admin status filter shows all/admin/non-admin users
- ✅ Column headers toggle sort order (asc/desc)
- ✅ Current admin row visually highlighted
- ✅ Dates formatted as dd.mm.yyyy HH:ii in local timezone
- ✅ Page loads in <2 seconds with 1000 users

**Estimated Time**: 6-8 hours

### Tasks

#### Backend (Service & API)

- [ ] T018 Write unit tests for userService in tests/unit/services/userService.test.js (5 test cases for getPaginatedUsers)
- [ ] T019 [US1] Implement getPaginatedUsers in src/lib/services/userService.js with MongoDB aggregation pipeline
- [ ] T020 Write integration tests for GET /api/admin/users in tests/integration/api/admin-users.test.js (8 test cases)
- [ ] T021 [US1] Create API route GET /api/admin/users in src/app/api/admin/users/route.js with query parameter handling

#### Frontend Components

- [ ] T022 Write component tests for FilterBar in tests/components/FilterBar.test.js (5 test cases)
- [ ] T023 [P] [US1] Implement FilterBar component in src/app/admin/users/components/FilterBar.js with debounced inputs
- [ ] T024 Create useDebounce hook in src/hooks/useDebounce.js for 300ms debouncing
- [ ] T025 Write component tests for PaginationControls in tests/components/PaginationControls.test.js (6 test cases)
- [ ] T026 [P] [US1] Implement PaginationControls in src/app/admin/users/components/PaginationControls.js with page size selector
- [ ] T027 Write component tests for UserRow in tests/components/UserRow.test.js (4 test cases)
- [ ] T028 [US1] Implement UserRow component in src/app/admin/users/components/UserRow.js with date formatting and self-highlighting
- [ ] T029 Write component tests for UserTable in tests/components/UserTable.test.js (8 test cases)
- [ ] T030 [US1] Implement UserTable component in src/app/admin/users/components/UserTable.js with sortable headers

#### Page Integration

- [ ] T031 Write integration tests for user management page in tests/integration/pages/admin-users-page.test.js (6 test cases)
- [ ] T032 [US1] Create Server Component page in src/app/admin/users/page.js with server-side data fetching
- [ ] T033 [US1] Create Client Component wrapper in src/app/admin/users/UserManagementPage.js integrating all child components
- [ ] T034 [US1] Implement URL query param sync for filters, sort, and pagination

#### E2E Tests

- [ ] T035 Write E2E test for US1 in tests/e2e/admin-user-view.spec.js (15 assertions: table display, filtering, sorting, pagination, highlighting, date format, <2s load)

**Deliverables**:
- User service with pagination logic (1 file, 5 unit tests)
- API route for user list (1 file, 8 integration tests)
- 4 UI components (FilterBar, PaginationControls, UserRow, UserTable)
- 1 custom hook (useDebounce)
- Main page with integration (2 files, 6 tests)
- E2E test suite (1 file, 15 assertions)
- Total: ~52 tests passing for US1

**Verification**:
```bash
npm test tests/unit/services/userService
npm test tests/integration/api/admin-users
npm test tests/components/FilterBar
npm test tests/components/PaginationControls
npm test tests/components/UserRow
npm test tests/components/UserTable
npm test tests/integration/pages/admin-users-page
npx playwright test tests/e2e/admin-user-view.spec.js
```

---

## Phase 4: User Story 2 - Toggle User Admin Status (12 tasks)

**Goal**: Enable admins to grant/revoke admin privileges with <1s response and <5s session propagation.

**Priority**: P2 (Depends on US1)

**Independent Test Criteria**:
- ✅ Toggle button appears in each user row
- ✅ Toggle disabled for current admin's own row
- ✅ Clicking toggle updates user's admin status
- ✅ Success toast appears after toggle
- ✅ Table updates immediately to reflect new status
- ✅ Server rejects self-modification attempts with 403
- ✅ Target user's session updates within 5 seconds
- ✅ Audit log entry created for each toggle

**Estimated Time**: 3-4 hours

### Tasks

#### Backend (Service & API)

- [ ] T036 Write integration tests for toggleAdminStatus in tests/integration/services/toggleAdmin.test.js (6 test cases)
- [ ] T037 [US2] Implement toggleAdminStatus in src/lib/services/userService.js with self-protection and audit logging
- [ ] T038 Write integration tests for POST /api/admin/users/toggle-admin in tests/integration/api/toggle-admin.test.js (5 test cases)
- [ ] T039 [US2] Create API route POST /api/admin/users/toggle-admin in src/app/api/admin/users/toggle-admin/route.js

#### Frontend Components

- [ ] T040 Write component tests for AdminToggle in tests/components/AdminToggle.test.js (6 test cases)
- [ ] T041 [US2] Implement AdminToggle component in src/app/admin/users/components/AdminToggle.js with loading state and toast integration
- [ ] T042 [US2] Integrate AdminToggle into UserRow component in src/app/admin/users/components/UserRow.js

#### Session Updates

- [ ] T043 Write integration tests for session updates in tests/integration/session-update.test.js (4 test cases)
- [ ] T044 [US2] Update NextAuth config in src/auth.config.js to add JWT callback for session refresh
- [ ] T045 [US2] Implement session update trigger in UserManagementPage after successful toggle using useSession update()
- [ ] T046 [US2] Configure SWR polling with 2-second interval for session changes

#### E2E Tests

- [ ] T047 Write E2E test for US2 in tests/e2e/admin-toggle.spec.js (12 assertions: toggle behavior, disabled state, 403 validation, toast, table update, session propagation, audit log)

**Deliverables**:
- Toggle admin service method (6 integration tests)
- API route for toggle (1 file, 5 tests)
- AdminToggle component (1 file, 6 tests)
- Session update integration (4 tests)
- E2E test suite (1 file, 12 assertions)
- Total: ~33 tests passing for US2

**Verification**:
```bash
npm test tests/integration/services/toggleAdmin
npm test tests/integration/api/toggle-admin
npm test tests/components/AdminToggle
npm test tests/integration/session-update
npx playwright test tests/e2e/admin-toggle.spec.js
```

---

## Phase 5: User Story 3 - Delete Users with Cascade (13 tasks)

**Goal**: Enable permanent user deletion with atomic cascade (all related data) and transaction rollback protection.

**Priority**: P3 (Depends on US1, independent of US2)

**Independent Test Criteria**:
- ✅ Delete button appears in each user row
- ✅ Delete disabled for current admin's own row
- ✅ Clicking delete opens confirmation dialog
- ✅ Confirming deletes user and all related data atomically
- ✅ Success toast shows deletion summary with counts
- ✅ User removed from table after deletion
- ✅ Server rejects self-deletion attempts with 403
- ✅ Transaction rolls back on failure (no partial deletions)
- ✅ Retry button appears on error
- ✅ Audit log entry created for each deletion

**Estimated Time**: 4-5 hours

### Tasks

#### Backend (Service & API)

- [ ] T048 Write integration tests for deleteUserWithCascade in tests/integration/services/deleteUser.test.js (8 test cases including transaction rollback)
- [ ] T049 [US3] Implement deleteUserWithCascade in src/lib/services/userService.js with MongoDB transactions and cascade logic
- [ ] T050 Write integration tests for cascade deletion in tests/integration/db/cascadeDelete.test.js (4 test cases for transaction integrity)
- [ ] T051 Write integration tests for POST /api/admin/users/delete in tests/integration/api/delete-user.test.js (6 test cases)
- [ ] T052 [US3] Create API route POST /api/admin/users/delete in src/app/api/admin/users/delete/route.js

#### Frontend Components

- [ ] T053 Write component tests for ConfirmDialog in tests/components/ConfirmDialog.test.js (6 test cases including focus trap and Escape key)
- [ ] T054 [P] [US3] Implement ConfirmDialog component in src/app/admin/users/components/ConfirmDialog.js using Radix UI Dialog primitive
- [ ] T055 Write component tests for DeleteUserButton in tests/components/DeleteUserButton.test.js (8 test cases)
- [ ] T056 [US3] Implement DeleteUserButton in src/app/admin/users/components/DeleteUserButton.js with confirmation flow and retry button
- [ ] T057 [US3] Integrate DeleteUserButton into UserRow component in src/app/admin/users/components/UserRow.js

#### E2E Tests

- [ ] T058 Write E2E test for US3 in tests/e2e/admin-delete.spec.js (15 assertions: delete button, confirmation, cascade deletion, toast summary, table update, 403 validation, transaction rollback, retry, audit log)

**Deliverables**:
- Cascade deletion service with transactions (8 integration tests)
- Transaction integrity tests (4 tests)
- API route for deletion (1 file, 6 tests)
- ConfirmDialog component (1 file, 6 tests)
- DeleteUserButton component (1 file, 8 tests)
- E2E test suite (1 file, 15 assertions)
- Total: ~47 tests passing for US3

**Verification**:
```bash
npm test tests/integration/services/deleteUser
npm test tests/integration/db/cascadeDelete
npm test tests/integration/api/delete-user
npm test tests/components/ConfirmDialog
npm test tests/components/DeleteUserButton
npx playwright test tests/e2e/admin-delete.spec.js
```

---

## Phase 6: Polish & Accessibility (5 tasks)

**Goal**: Optimize performance, ensure WCAG 2.1 AA compliance, and production readiness.

**Estimated Time**: 1-2 hours

### Tasks

- [ ] T059 Write E2E accessibility test in tests/e2e/admin-accessibility.spec.js (keyboard navigation, screen reader, ARIA, semantic HTML)
- [ ] T060 Add loading states to all async operations (FilterBar, AdminToggle, DeleteUserButton)
- [ ] T061 Add error boundaries to user management page components
- [ ] T062 Run Lighthouse audit and verify accessibility score ≥90, optimize if needed
- [ ] T063 Create documentation in docs/ADMIN-USER-MANAGEMENT.md with user guide and troubleshooting

**Deliverables**:
- E2E accessibility test (1 file, 10+ assertions)
- Loading states and error boundaries
- Lighthouse report with score ≥90
- User documentation

**Verification**:
```bash
npx playwright test tests/e2e/admin-accessibility.spec.js
npm run build && npm run start
# Open Chrome DevTools > Lighthouse > Run audit
```

---

## Full Test Suite Summary

**Total Tests by Type**:
- Unit Tests: ~30 (services, utilities)
- Integration Tests: ~50 (API routes, components, services, database)
- Component Tests: ~40 (UI components)
- E2E Tests: ~50 assertions across 4 test files

**Total**: ~120+ tests

**Execution Time**:
- Unit: ~5 seconds
- Integration: ~30 seconds  
- E2E: ~3 minutes
- **Total**: ~4 minutes

**Coverage Target**: 80% minimum (per constitution)

---

## Task Execution Checklist

### Before Starting
- [ ] Branch `006-admin-user-management` checked out
- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB replica set running
- [ ] At least one admin user exists

### TDD Workflow (Per Task)
1. [ ] Write test(s) for the task
2. [ ] Get user approval of tests
3. [ ] Verify tests fail (Red)
4. [ ] Implement code to pass tests (Green)
5. [ ] Refactor if needed
6. [ ] Run full test suite to ensure no regressions
7. [ ] Commit changes

### After Each Phase
- [ ] All phase tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Manual testing completed

### Before Deployment
- [ ] All 63 tasks complete
- [ ] All ~120 tests passing
- [ ] E2E tests passing
- [ ] Lighthouse accessibility score ≥90
- [ ] Performance targets met (<2s load, <1s toggle, <5s session)
- [ ] User documentation complete

---

## Success Criteria Verification

Map each success criterion (SC-001 to SC-011) to test tasks:

- **SC-001** (User list <2s): Verified in T035 (E2E performance test)
- **SC-002** (Locate user in 3 actions): Verified in T035 (E2E filtering test)
- **SC-003** (Toggle <1s): Verified in T047 (E2E toggle performance)
- **SC-004** (Session <5s): Verified in T047 (E2E session propagation)
- **SC-005** (100% transaction integrity): Verified in T050 (integration transaction tests)
- **SC-006** (Deletion summary counts): Verified in T058 (E2E deletion toast)
- **SC-007** (Zero self-actions): Verified in T047, T058 (E2E disabled buttons + 403)
- **SC-008** (Lighthouse ≥90): Verified in T062 (manual Lighthouse audit)
- **SC-009** (Keyboard navigation): Verified in T059 (E2E accessibility)
- **SC-010** (Responsive 320-1920px): Verified in T059 (E2E viewport tests)
- **SC-011** (100% audit logs): Verified in T047, T058 (E2E audit log verification)

---

## Troubleshooting

### Common Issues During Implementation

**Issue**: Tests timing out
- **Solution**: Increase Jest timeout in setup file: `jest.setTimeout(10000)`

**Issue**: MongoDB transactions failing
- **Solution**: Verify replica set with `rs.status()` in mongosh. Initialize if needed: `rs.initiate()`

**Issue**: NextAuth session not updating
- **Solution**: Check JWT callback in auth.config.js and verify `update()` call triggers refresh

**Issue**: E2E tests failing
- **Solution**: Ensure test database is seeded with admin user before running Playwright tests

**Issue**: Dates showing wrong timezone
- **Solution**: Verify `Intl.DateTimeFormat().resolvedOptions().timeZone` returns expected timezone

---

## Next Steps After Completion

1. ✅ Merge to master branch
2. ✅ Deploy to staging environment
3. ✅ Conduct QA testing (all 3 user stories)
4. ✅ Monitor audit logs and performance metrics
5. ✅ Gather user feedback
6. ✅ Plan future enhancements (bulk operations, activity dashboard)

---

**Ready to begin**: Start with Phase 1 (Setup) and work through phases sequentially following TDD workflow.
