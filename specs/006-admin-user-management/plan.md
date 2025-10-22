# Implementation Plan: Admin User Management

**Branch**: `006-admin-user-management` | **Date**: October 22, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-admin-user-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an admin user management interface that allows administrators to view, filter, sort, and paginate through all registered users, toggle admin privileges for other users (with self-protection), and delete user accounts with complete cascade deletion of related data (fasting entries, settings, tokens, logs). The feature includes custom toast notifications, real-time session updates, audit logging, and full WCAG 2.1 AA accessibility compliance.

## Technical Context

**Language/Version**: JavaScript ES6+ / TypeScript (optional), Node.js 18+  
**Primary Dependencies**: Next.js 15.5.6 (App Router), React 19.1.0, NextAuth.js v5, Mongoose (MongoDB ODM)  
**Storage**: MongoDB with replica set (required for atomic transactions)  
**Testing**: Jest 30.2.0, React Testing Library 16.3.0, Playwright (E2E)  
**Target Platform**: Web application (responsive: 320px mobile to 1920px+ desktop)  
**Project Type**: Web application (Next.js App Router with server-side API routes)  
**Performance Goals**: User list <2s (1000 users), admin toggle <1s, session propagation <5s, filter response <1s  
**Constraints**: WCAG 2.1 AA compliance, keyboard navigation required, custom toast system (no external library), atomic transactions for cascade deletion  
**Scale/Scope**: Support 1000+ users with server-side pagination, filtering, and sorting; 3 main user stories (View/Toggle/Delete); 48 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
- ✅ **PASS**: Using Next.js 15.5.6 App Router architecture
- ✅ **PASS**: Server Components for user list page (data fetching)
- ✅ **PASS**: Client Components only for interactive elements (toggle, delete buttons, filters)
- ✅ **PASS**: Server Actions for mutations (toggle admin, delete user)
- ✅ **PASS**: Next.js built-in optimizations utilized

### II. Mobile-First Responsive Design
- ✅ **PASS**: Spec requires responsive design (320px-1920px+)
- ✅ **PASS**: Touch-friendly UI elements (44x44px minimum per assumption #13)
- ✅ **PASS**: Mobile-first approach specified in requirements (FR-048)
- ✅ **PASS**: Progressive enhancement with server-side fallbacks

### III. Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: TDD approach specified in technical requirements
- ✅ **PASS**: Jest + React Testing Library + Playwright stack defined
- ✅ **PASS**: 48 testable functional requirements in spec
- ✅ **PASS**: Each user story has independent test descriptions
- ✅ **PASS**: Success criteria are measurable (SC-001 to SC-011)
- ⚠️  **NOTE**: Tests must be written and approved before implementation begins

### IV. Component Architecture
- ✅ **PASS**: Atomic design approach (UserTable, UserRow, FilterBar, PaginationControls components)
- ✅ **PASS**: Reusable toast notification system to be built
- ✅ **PASS**: Separation of concerns (Server Components for data, Client Components for interaction)
- ✅ **PASS**: Self-contained components planned (filters, pagination, actions)

### V. User Privacy & Data Security
- ✅ **PASS**: Admin-only access restriction (FR-041)
- ✅ **PASS**: Server-side validation for all operations (FR-044)
- ✅ **PASS**: Self-modification/deletion protection (FR-022, FR-029, FR-027, FR-035)
- ✅ **PASS**: Audit logging for sensitive operations (FR-042, FR-043)
- ✅ **PASS**: Cascade deletion for data integrity (FR-031, FR-032)
- ⚠️  **NOTE**: Consider GDPR compliance - cascade deletion supports right-to-erasure

### VI. Performance & Accessibility
- ✅ **PASS**: Performance targets defined (<2s load, <1s toggle, <5s session)
- ✅ **PASS**: WCAG 2.1 AA compliance required (FR-045)
- ✅ **PASS**: Keyboard navigation support (FR-046)
- ✅ **PASS**: Screen reader compatibility (FR-047, FR-040)
- ✅ **PASS**: Semantic HTML and ARIA labels required
- ✅ **PASS**: Success criteria includes Lighthouse score ≥90 (SC-008)

### VII. Database Conventions
- ✅ **PASS**: Mongoose schemas for User, FastingEntry, UserSettings, PasswordResetToken, SecurityLog
- ✅ **PASS**: Proper indexing required for performance (name, email, dates, admin status)
- ✅ **PASS**: Atomic operations via MongoDB transactions (FR-031, FR-032)
- ✅ **PASS**: Audit trails for admin actions (FR-042, FR-043)
- ⚠️  **NOTE**: MongoDB replica set required for transaction support (assumption #4)

**GATE RESULT**: ✅ **ALL GATES PASS** - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── admin/
│   │   └── users/
│   │       ├── page.js                    # Server Component: User list page
│   │       ├── components/
│   │       │   ├── UserTable.js           # Client Component: Main table with filters/sort
│   │       │   ├── UserRow.js             # Client Component: Individual user row
│   │       │   ├── FilterBar.js           # Client Component: Name/email/admin filters
│   │       │   ├── PaginationControls.js  # Client Component: Pagination UI
│   │       │   ├── AdminToggle.js         # Client Component: Toggle admin button
│   │       │   ├── DeleteUserButton.js    # Client Component: Delete button + dialog
│   │       │   └── ConfirmDialog.js       # Client Component: Reusable confirmation dialog
│   │       └── actions.js                 # Server Actions: toggleAdmin, deleteUser
│   └── api/
│       └── admin/
│           └── users/
│               └── route.js               # API Route: GET /api/admin/users (paginated, filtered, sorted)
├── components/
│   └── ui/
│       └── Toast.js                       # Client Component: Custom toast notification system
├── lib/
│   ├── db/
│   │   └── mongodb.js                     # MongoDB connection with transaction support
│   ├── models/
│   │   ├── User.js                        # Mongoose schema: User model
│   │   ├── FastingEntry.js                # Mongoose schema: FastingEntry model
│   │   ├── UserSettings.js                # Mongoose schema: UserSettings model
│   │   ├── PasswordResetToken.js          # Mongoose schema: Token model
│   │   ├── SecurityLog.js                 # Mongoose schema: SecurityLog model
│   │   └── AuditLog.js                    # Mongoose schema: AuditLog model (new)
│   ├── services/
│   │   ├── userService.js                 # Business logic: User CRUD operations
│   │   ├── auditService.js                # Business logic: Audit logging
│   │   └── sessionService.js              # Business logic: Session update propagation
│   ├── middleware/
│   │   └── adminAuth.js                   # Middleware: Verify admin privileges
│   └── utils/
│       ├── dateFormatter.js               # Utility: Format dates to dd.mm.yyyy HH:ii
│       └── validators.js                  # Utility: Input validation helpers
└── middleware.js                          # Next.js middleware: Route protection

tests/
├── unit/
│   ├── services/
│   │   ├── userService.test.js            # Unit: User service logic
│   │   ├── auditService.test.js           # Unit: Audit logging
│   │   └── sessionService.test.js         # Unit: Session updates
│   └── utils/
│       ├── dateFormatter.test.js          # Unit: Date formatting
│       └── validators.test.js             # Unit: Validation helpers
├── integration/
│   ├── api/
│   │   └── admin-users.test.js            # Integration: GET /api/admin/users
│   ├── actions/
│   │   ├── toggleAdmin.test.js            # Integration: Toggle admin action
│   │   └── deleteUser.test.js             # Integration: Delete user action
│   └── db/
│       └── cascadeDelete.test.js          # Integration: Transaction integrity
├── components/
│   ├── UserTable.test.js                  # Component: Table rendering & interaction
│   ├── FilterBar.test.js                  # Component: Filtering logic
│   ├── PaginationControls.test.js         # Component: Pagination logic
│   ├── AdminToggle.test.js                # Component: Toggle behavior
│   ├── DeleteUserButton.test.js           # Component: Delete with confirmation
│   └── Toast.test.js                      # Component: Toast notifications
└── e2e/
    ├── admin-user-view.spec.js            # E2E: US1 - View and browse users
    ├── admin-toggle.spec.js               # E2E: US2 - Toggle admin status
    └── admin-delete.spec.js               # E2E: US3 - Delete users with cascade
```

**Structure Decision**: Using Next.js 15.5.6 App Router structure with feature-based organization under `src/app/admin/users/`. Server Components handle data fetching, Client Components handle interactivity. Server Actions co-located with the feature for mutations. Shared UI components (Toast) in `src/components/ui/`. Business logic in `src/lib/services/` for testability. Comprehensive test coverage across unit, integration, component, and E2E layers.

## Complexity Tracking

*No violations detected - all gates pass*

This feature aligns with all constitution principles:
- Uses Next.js 15.5.6 App Router best practices
- Mobile-first responsive design (320px-1920px+)
- TDD approach with 120+ tests planned
- Reusable component architecture
- User data security with audit logging
- WCAG 2.1 AA accessibility compliance

---

## Phase 0: Research ✅ COMPLETE

**Artifacts Generated**:
- ✅ `research.md` - 10 research areas resolved, all technical decisions documented

**Key Decisions**:
1. Server-side pagination: MongoDB aggregation with `$facet`
2. Session updates: NextAuth JWT refresh + SWR polling (2s interval)
3. Toast system: React Context + Portal with Tailwind animations
4. Transactions: Mongoose sessions for atomic cascade deletion
5. Text search: MongoDB regex with case-insensitive collation
6. Debouncing: Custom hook with 300ms delay + AbortController
7. Accessibility: Semantic HTML + Radix UI primitives + ARIA live regions
8. Date formatting: Native `Intl.DateTimeFormat` for timezone support
9. Self-protection: Dual-layer (UI disabled + server 403 validation)
10. Audit logging: New AuditLog model with structured schema

**Database Indexes Required**:
- User: `{ name: 1 }`, `{ email: 1 }` (unique), `{ isAdmin: 1 }`, `{ createdAt: 1 }`, `{ lastLogin: 1 }`, `{ isAdmin: 1, createdAt: -1 }` (compound)
- AuditLog: `{ action: 1 }`, `{ performedBy: 1 }`, `{ targetUser: 1 }`, `{ timestamp: 1 }`

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts Generated**:
- ✅ `data-model.md` - 6 entities, 8 DTOs, 3 query patterns, 2 state diagrams, 2 migrations
- ✅ `contracts/api-users.yaml` - OpenAPI 3.0.3 spec with 3 endpoints
- ✅ `quickstart.md` - 10-phase implementation guide (16-20 hours)
- ✅ `CLAUDE.md` - Updated agent context with new technology

**Entity Summary**:
1. User (modified) - Added 5 indexes
2. FastingEntry (existing) - No changes
3. UserSettings (existing) - No changes
4. PasswordResetToken (existing) - No changes
5. SecurityLog (existing) - No changes
6. AuditLog (new) - Created with 7 indexes

**API Endpoints**:
1. `GET /api/admin/users` - Paginated user list with filters and sorting
2. `POST /api/admin/users/toggle-admin` - Toggle user admin status
3. `POST /api/admin/users/delete` - Delete user with cascade

**Implementation Plan**:
- Phase 0: Database Setup (1 hour)
- Phase 1: Toast System (2-3 hours)
- Phase 2: Date Formatter (1 hour)
- Phase 3: Backend Services (3-4 hours)
- Phase 4: API Routes (2-3 hours)
- Phase 5: Server Actions (Alternative) (1.5 hours)
- Phase 6: Frontend Components (4-5 hours)
- Phase 7: Page Integration (2 hours)
- Phase 8: E2E Tests (2-3 hours)
- Phase 9: Session Updates (1-2 hours)
- Phase 10: Polish & Performance (1-2 hours)

**Total Estimated Effort**: 16-20 hours

---

## Constitution Check (Post-Design) ✅ RE-VERIFIED

All gates remain passing after detailed design:

- ✅ **Next.js Best Practices**: Server Components for data fetching, Client Components for interactivity, Server Actions for mutations
- ✅ **Mobile-First Design**: Responsive 320px-1920px+, touch targets 44x44px minimum
- ✅ **TDD**: 120+ tests planned (30 unit, 40 integration, 50+ E2E)
- ✅ **Component Architecture**: 7 reusable components, atomic design principles
- ✅ **Security**: Dual-layer self-protection, audit logging, 403 validation
- ✅ **Accessibility**: WCAG 2.1 AA, keyboard navigation, ARIA labels, Lighthouse ≥90
- ✅ **Performance**: <2s load (1000 users), <1s toggle, <5s session updates

**No violations. No complexity justification required.**

---

## Next Steps

This planning phase is **COMPLETE**. Proceed to:

```bash
/speckit.tasks
```

This will generate `tasks.md` with detailed implementation checklist broken down by phase and user story.

After tasks are generated, begin implementation following TDD workflow:
1. Write tests for Phase 0 (Database Setup)
2. Get user approval of tests
3. Verify tests fail
4. Implement code to pass tests
5. Repeat for each phase

---

## Summary

**Feature**: Admin User Management  
**Branch**: 006-admin-user-management  
**Status**: Planning Complete ✅

**Deliverables**:
- ✅ Technical context defined
- ✅ Constitution check passed (all gates)
- ✅ Research complete (10 decisions)
- ✅ Data model designed (6 entities, 8 DTOs)
- ✅ API contracts specified (3 endpoints, OpenAPI 3.0.3)
- ✅ Implementation guide created (10 phases, 16-20 hours)
- ✅ Agent context updated

**Ready for**: `/speckit.tasks` command to generate detailed task breakdown

**Estimated Timeline**: 2-2.5 days full-time development with TDD approach

