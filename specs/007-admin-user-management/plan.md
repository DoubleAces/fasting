# Implementation Plan: Admin User Management

**Branch**: `007-admin-user-management` | **Date**: October 22, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-admin-user-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement admin user management functionality that enables administrators to view, edit admin privileges, and delete users with complete data cascade. The system will provide a responsive table interface with server-side pagination (configurable page size), column sorting (all columns, ascending/descending), and inline filtering (name, email, admin status). Admin operations include toggling isAdmin status (with session updates) and deleting users with atomic cascade deletion across all collections (fasting entries, settings, tokens, security logs). All dates displayed in admin's local timezone (dd.mm.yyyy HH:ii format). Error handling via toast notifications with retry capability. Comprehensive audit logging for all privilege changes and deletions.

## Technical Context

**Language/Version**: JavaScript (ES6+), Next.js 15.5.6, React 19.1.0  
**Primary Dependencies**: Next.js, React, NextAuth.js (Auth.js), Mongoose, Tailwind CSS, Joi (validation)  
**Storage**: MongoDB with Mongoose ODM  
**Testing**: Jest 30.2.0, React Testing Library 16.3.0, Playwright (E2E)  
**Target Platform**: Web application (responsive: mobile-first to desktop)  
**Project Type**: Next.js App Router web application  
**Performance Goals**: User list loads within 2 seconds for up to 1000 users; admin toggle operations complete within 1 second; session updates propagate within 5 seconds  
**Constraints**: Server-side operations (pagination, filtering, sorting) to maintain <2s load time; atomic delete operations (all-or-nothing); toast notifications auto-dismiss after 5 seconds  
**Scale/Scope**: Support databases with thousands of users; 40 functional requirements across 5 categories (display, edit, delete, access control, data integrity, error handling)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **Next.js Best Practices** | App Router, Server Components by default | ✅ PASS | Using Next.js 15.5.6 App Router; user list page will be Server Component with Client Components for interactive elements (filters, toggles) |
| **Mobile-First Responsive** | All features fully responsive | ✅ PASS | Table design with Tailwind responsive utilities; filter fields stack on mobile |
| **TDD (NON-NEGOTIABLE)** | Tests written → approved → fail → implement | ✅ PASS | Will write unit tests (API routes, utilities), integration tests (DB operations), component tests (table, filters), E2E tests (admin workflows) before implementation |
| **Component Architecture** | Reusable, composable, testable components | ✅ PASS | UserManagementTable (organism), UserTableRow (molecule), FilterInput (molecule), AdminToggle (atom), DeleteButton (atom) |
| **User Privacy & Security** | Data protection, secure APIs, auth | ✅ PASS | Admin-only access enforced via existing middleware; audit logging for all privilege changes and deletions; atomic delete operations |
| **Performance & Accessibility** | Lighthouse >90, WCAG 2.1 AA | ✅ PASS | Server-side pagination ensures performance; semantic table markup; keyboard navigation for all controls; ARIA labels for screen readers; toast notifications with proper ARIA live regions |
| **Database Conventions** | Mongoose schemas, indexing, atomic ops | ✅ PASS | Existing User model; will add indexes for filtering/sorting; atomic delete operations with transactions |

**Overall Gate Status**: ✅ **PASS** - All constitution principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```
specs/007-admin-user-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-users.yaml   # OpenAPI spec for /api/admin/users endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── dashboard/
│   │   ├── users/
│   │   │   └── page.js                    # NEW: User management page (admin-only)
│   │   ├── layout.js                       # EXISTING: Admin layout with sidebar
│   │   └── page.js                         # EXISTING: Admin dashboard home
│   └── api/
│       └── admin/
│           └── users/
│               ├── route.js                # NEW: GET (list with pagination/filter/sort)
│               └── [userId]/
│                   ├── route.js            # NEW: PATCH (toggle admin), DELETE (delete user)
│                   └── cascade-delete/
│                       └── route.js        # NEW: POST (atomic cascade delete helper)
├── components/
│   └── admin/
│       ├── UserManagementTable.js          # NEW: Main table component (Client Component)
│       ├── UserTableRow.js                 # NEW: Individual row with actions
│       ├── UserTableFilters.js             # NEW: Filter inputs for name/email/admin
│       ├── AdminToggle.js                  # NEW: Toggle switch for isAdmin
│       ├── DeleteUserButton.js             # NEW: Delete button with confirmation
│       ├── PaginationControls.js           # NEW: Pagination UI
│       ├── ToastNotification.js            # NEW: Toast/snackbar component
│       └── AdminSidebar.js                 # EXISTING: Update with "Users" nav link
├── lib/
│   ├── models/
│   │   └── User.js                         # EXISTING: Update indexes for filtering/sorting
│   ├── utils/
│   │   ├── adminLogger.js                  # EXISTING: Update for user management logging
│   │   ├── userCascadeDelete.js            # NEW: Utility for atomic cascade deletion
│   │   └── formatDate.js                   # NEW: Date formatting utility (dd.mm.yyyy HH:ii)
│   └── validation/
│       └── userManagementSchema.js         # NEW: Joi schemas for API validation
└── middleware.js                            # EXISTING: Already handles admin auth

tests/
├── unit/
│   ├── lib/
│   │   └── utils/
│   │       ├── userCascadeDelete.test.js   # NEW: Test atomic delete logic
│   │       └── formatDate.test.js          # NEW: Test date formatting
│   └── app/
│       └── api/
│           └── admin/
│               └── users/
│                   └── route.test.js       # NEW: API route unit tests
├── integration/
│   ├── admin-user-list.test.js             # NEW: User list pagination/filter/sort
│   ├── admin-toggle-privileges.test.js     # NEW: Toggle admin status
│   └── admin-delete-user.test.js           # NEW: Cascade delete operations
├── components/
│   └── admin/
│       ├── UserManagementTable.test.js     # NEW: Table component tests
│       ├── UserTableFilters.test.js        # NEW: Filter component tests
│       └── AdminToggle.test.js             # NEW: Toggle component tests
└── e2e/
    └── admin-user-management.spec.js       # NEW: End-to-end user management flows
```

**Structure Decision**: Next.js App Router web application structure. Admin user management follows existing pattern:
- Admin pages under `/app/dashboard/` (protected by existing middleware)
- Admin API routes under `/app/api/admin/`
- Admin-specific components in `/components/admin/`
- Shared utilities in `/lib/utils/`
- Comprehensive test coverage (unit, integration, component, E2E)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: N/A - No constitution violations. All principles satisfied without requiring complexity justifications.

---

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Artifact**: `research.md` (complete technical research)

**Research Areas Completed**:
1. ✅ Server-side pagination strategy (skip/limit vs cursor-based)
2. ✅ Table sorting implementation (client vs server-side)
3. ✅ Inline filtering approach (debouncing, query construction)
4. ✅ Cascade deletion pattern (transactions, atomic operations)
5. ✅ Timezone handling (server vs client-side conversion)
6. ✅ Toast notification system (library vs custom implementation)
7. ✅ Session update propagation (NextAuth refresh strategy)
8. ✅ Preventing self-actions (UI vs API enforcement)

**Key Decisions**:
- Pagination: Skip/limit pattern (simple, sufficient for scale)
- Sorting: Server-side with Mongoose indexes (leverages DB capabilities)
- Filtering: MongoDB regex with 300ms debouncing (reduces API calls)
- Cascade Delete: MongoDB transactions (atomic, rollback on failure)
- Timezone: Client-side conversion with browser auto-detection
- Toasts: Custom React component (no dependencies, accessible)
- Session Updates: NextAuth callback with DB lookup (real-time within 5s)
- Self-Protection: Server-side validation (cannot be bypassed)

**No External Dependencies**: All solutions use existing project stack.

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts**:
- ✅ `data-model.md` - Entity definitions, DTOs, validation rules
- ✅ `contracts/api-users.yaml` - OpenAPI specification for all endpoints
- ✅ `quickstart.md` - Implementation guide with code examples
- ✅ Agent context updated via `update-agent-context.ps1`

**Design Highlights**:

**Data Model**:
- 1 primary entity (User - enhanced with 4 new indexes)
- 4 related entities for cascade deletion (FastingEntry, UserSettings, PasswordResetToken, SecurityLog)
- 6 DTOs (UserListResponse, UserSummary, UserToggleRequest/Response, UserDeleteRequest/Response)
- State transition diagrams for admin status toggle and user deletion flow

**API Contracts**:
- GET `/api/admin/users` - List with pagination/filter/sort (7 query params)
- PATCH `/api/admin/users/[userId]` - Toggle admin status
- DELETE `/api/admin/users/[userId]` - Cascade delete user
- Complete OpenAPI 3.0.3 specification with examples, error responses, security schemes

**Implementation Guide**:
- 5 phases: Database Setup (30 min), API Routes (4-6 hrs), UI Components (6-8 hrs), Testing (2-3 hrs), Deployment
- Code examples for all critical components (cascade delete utility, API routes, React components, tests)
- Troubleshooting guide for common issues
- Estimated total time: 12-16 hours

---

### Phase 2: Task Breakdown

**Command**: `/speckit.tasks` (separate command, NOT part of `/speckit.plan`)

**Artifact**: `tasks.md` (generated by tasks command)

**Expected Output**:
- Granular development tasks for each component
- Dependency tracking (task order)
- Time estimates per task
- Acceptance criteria for each task
- Links to relevant spec sections

**NOT GENERATED BY THIS COMMAND** - User must run `/speckit.tasks` separately after reviewing this plan.

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Transaction Support**: MongoDB transactions require replica set (not available in standalone local dev) | Medium | Medium | Provide fallback non-transactional delete for dev; enforce transactions in production MongoDB Atlas |
| **Performance**: User list pagination slow with large datasets (>10k users) | Low | Medium | Indexes on sortable/filterable columns (name, email, createdAt, lastLogin, isAdmin); monitor query performance |
| **Race Condition**: Admin status toggle while session is being read | Low | Low | Use atomic DB operations; NextAuth session callback refreshes from DB within 5s |
| **Session Staleness**: Admin toggle not reflected in current session immediately | Medium | Low | Document 5-second propagation delay; consider real-time session invalidation for critical cases |
| **Cascade Delete Failure**: Related records not fully deleted if transaction fails | Low | High | Wrap in transaction; rollback on failure; log errors; provide retry mechanism in UI |

### Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Self-Action Edge Cases**: Admin bypasses self-protection via direct API calls | Low | High | Enforce server-side validation in API routes; do not rely on UI disabling alone |
| **Missing Indexes**: Forgot to create indexes in production | Medium | Medium | Add index creation script to deployment checklist; document in quickstart.md |
| **Toast Notification Accessibility**: Screen readers miss toast messages | Medium | Medium | Use ARIA live regions; test with screen readers (NVDA, JAWS); ensure keyboard dismissible |
| **Mobile UX**: Table not fully functional on small screens | Medium | Medium | Test on real devices; use responsive table patterns (horizontal scroll or stacked cards) |
| **Last Admin Protection**: Deleting/demoting last admin locks everyone out | Low | Critical | Future enhancement: Add validation to prevent last admin removal (not in MVP) |

---

## Success Metrics

### Functional Completeness

- ✅ All 40 functional requirements implemented and tested
- ✅ User list displays with pagination (default 25, configurable 10-100)
- ✅ Sorting by all displayed columns (name, email, registrationDate, lastLogin, adminStatus)
- ✅ Filtering by name, email, admin status (server-side)
- ✅ Admin toggle with self-protection (403 for self-modification)
- ✅ Cascade delete with atomic transaction (all collections)
- ✅ Toast notifications with retry for errors
- ✅ Dates in admin's local timezone (dd.mm.yyyy HH:ii format)

### Performance Targets

- User list loads within **2 seconds** for databases with up to 1000 users
- Admin toggle completes within **1 second**
- Session updates propagate within **5 seconds** (NextAuth refresh)
- Cascade delete completes within **10 seconds** for users with 1000+ related records

### Test Coverage

- **Unit Tests**: >80% code coverage for utilities (cascade delete, date formatting)
- **Integration Tests**: All API routes tested (list, toggle, delete)
- **Component Tests**: All admin components tested (table, filters, toggles, buttons)
- **E2E Tests**: Complete admin workflows (view list, filter, sort, toggle, delete)

### Accessibility

- **Lighthouse Accessibility Score**: >90
- **WCAG 2.1 AA Compliance**: All interactive elements keyboard accessible
- **Screen Reader**: Toast notifications announced via ARIA live regions
- **Focus Management**: Logical tab order, visible focus indicators

---

## Post-Implementation Validation

### Checklist

After completing Phase 2 tasks, verify:

**Functional**:
- [ ] Admin can view paginated user list (default 25 per page)
- [ ] Pagination controls work (page size adjustable 10-100)
- [ ] Sorting works for all columns (ascending/descending)
- [ ] Filtering works for name, email, admin status (server-side)
- [ ] Admin toggle works (success toast, session updates within 5s)
- [ ] Admin toggle disabled/blocked for current admin (403 error)
- [ ] User deletion works with cascade (all related records deleted)
- [ ] User deletion blocked for current admin (403 error)
- [ ] Dates displayed in local timezone (dd.mm.yyyy HH:ii)
- [ ] Toast notifications appear/dismiss automatically after 5s
- [ ] Error toasts include retry button

**Technical**:
- [ ] All indexes created (name, email, createdAt, lastLogin, isAdmin)
- [ ] Cascade delete uses transactions (atomic operation)
- [ ] API routes enforce admin-only access (middleware)
- [ ] Server-side validation prevents self-actions
- [ ] Audit logs created for admin toggle and delete operations

**Testing**:
- [ ] All unit tests pass (>80% coverage)
- [ ] All integration tests pass (API routes)
- [ ] All component tests pass (table, filters, toggles)
- [ ] All E2E tests pass (admin workflows)

**Performance**:
- [ ] User list loads <2s for 1000 users
- [ ] Admin toggle completes <1s
- [ ] Session updates propagate <5s
- [ ] No console errors or warnings

**Accessibility**:
- [ ] Lighthouse Accessibility score >90
- [ ] All interactive elements keyboard accessible (tab navigation)
- [ ] Toast notifications announced by screen readers
- [ ] Table has proper semantic markup (thead, tbody, th, td)
- [ ] Focus indicators visible on all controls

**Mobile**:
- [ ] Table responsive on mobile (horizontal scroll or stacked)
- [ ] Filter inputs stack vertically on mobile
- [ ] Toast notifications positioned correctly on mobile
- [ ] All actions functional on touch devices

---

## Next Steps

1. **Review This Plan**: Ensure all technical decisions align with project requirements
2. **Re-Check Constitution**: Verify Phase 1 design maintains compliance (currently ✅ PASS)
3. **Run Task Generation**: Execute `/speckit.tasks` command to generate `tasks.md` with granular implementation tasks
4. **Begin Implementation**: Follow task order in `tasks.md`, writing tests first (TDD)
5. **Continuous Testing**: Run tests after each task completion
6. **Final Validation**: Complete post-implementation checklist before merge

---

## Summary

**Planning Status**: ✅ **COMPLETE**

**Artifacts Created**:
- ✅ `plan.md` (this file) - Complete implementation plan
- ✅ `research.md` - 8 research areas with decisions and code patterns
- ✅ `data-model.md` - Entity definitions, DTOs, state diagrams
- ✅ `contracts/api-users.yaml` - OpenAPI 3.0.3 specification (3 endpoints)
- ✅ `quickstart.md` - Implementation guide with code examples (5 phases, 12-16 hours)
- ✅ Agent context updated - Technology stack added to CLAUDE.md

**Key Decisions**:
- Server-side pagination with skip/limit (default 25, configurable 10-100)
- Server-side sorting via Mongoose (leverages indexes)
- Server-side filtering with MongoDB regex (debounced 300ms)
- Cascade delete via MongoDB transactions (atomic all-or-nothing)
- Client-side timezone conversion (browser auto-detection)
- Custom toast notifications (no dependencies)
- NextAuth session callback for updates (propagates within 5s)
- Server-side self-action validation (403 errors)

**Constitution Compliance**: ✅ ALL PRINCIPLES SATISFIED
- TDD enforced (tests written first)
- Mobile-first responsive (Tailwind utilities)
- Next.js best practices (App Router, Server Components)
- Component architecture (atoms → molecules → organisms)
- Security (admin-only access, audit logging)
- Accessibility (WCAG 2.1 AA, screen readers)
- Performance (indexes, server-side ops, <2s load time)

**Risk Mitigation**:
- Transaction fallback for local dev (MongoDB standalone)
- Index creation script in quickstart guide
- ARIA live regions for toast accessibility
- Responsive table design for mobile
- Server-side validation prevents self-action bypasses

**Estimated Implementation Time**: 12-16 hours
- Database Setup: 30 minutes
- API Routes: 4-6 hours
- UI Components: 6-8 hours
- Testing: 2-3 hours
- Deployment: Included in phases

**Next Command**: `/speckit.tasks` to generate granular task breakdown in `tasks.md`

---

**End of Implementation Plan**


