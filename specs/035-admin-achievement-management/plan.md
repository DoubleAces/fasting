# Implementation Plan: Admin Achievement Management UI

**Branch**: `035-admin-achievement-management` | **Date**: November 9, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/035-admin-achievement-management/spec.md`

## Summary

Create a comprehensive admin UI for managing achievements, providing administrators with full CRUD operations for the achievement system. The interface extends the existing `/admin` area with dedicated pages for viewing, creating, editing, activating/deactivating, and deleting achievements. Key features include multilingual content management, bulk operations, translation tools with CSV import/export, real-time analytics dashboard, and comprehensive audit logging. The system integrates with existing Achievement and UserAchievement models from Feature 028, follows the established glassmorphic design system, and enforces admin-only access with rate limiting (100 req/min per admin).

## Technical Context

**Language/Version**: JavaScript ES6+ with Next.js 15.5.6 (App Router), React 19.1.0  
**Primary Dependencies**: Next.js, React, Mongoose (MongoDB ODM), NextAuth v5, Tailwind CSS, React Hook Form  
**Storage**: MongoDB with Achievement, UserAchievement, and AdminAuditLog collections  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E), TDD mandatory  
**Target Platform**: Web application (desktop browsers, minimum 1024px width)  
**Project Type**: Web application with frontend (Next.js pages/components) and backend (API routes)  
**Performance Goals**: 
- List page load <2s for 81+ achievements
- Search/filter response <500ms
- Form save operations <1.5s
- Analytics page load 3-5s (real-time calculation acceptable)
- CSV export <5s for 100 achievements
- CSV import <10s for 500 translations

**Constraints**: 
- Admin-only access (isAdmin: true flag required)
- Desktop-only UI (no mobile responsive design)
- Rate limiting: 100 requests/minute per admin user
- CSV validation: 5MB max file size, 500 row limit
- Audit log retention: 90 days in DB, then cold storage, 2-year total retention
- Real-time analytics calculations (no caching in MVP)

**Scale/Scope**: 
- 81+ existing achievements to manage
- Multi-step forms with 4 sections (Content, Criteria, Metadata, Settings)
- 5 language support (English required, Spanish/French/German/Portuguese optional)
- 7 user stories (3 P1, 2 P2, 2 P3)
- 70 functional requirements
- Full CRUD + bulk operations + analytics + translations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Test-Driven Development (TDD)
- **Status**: PASS - Enforced by workflow
- **Plan**: All tests written and approved before implementation begins
- **Coverage Target**: Minimum 80% code coverage for all new code

### ✅ Next.js Best Practices
- **Status**: PASS
- **Approach**: Using App Router, Server Components where appropriate, Client Components for interactive forms
- **Routes**: `/admin/achievements` pages follow Next.js 15 conventions

### ✅ Mobile-First Responsive Design
- **Status**: WAIVED - Desktop-only requirement
- **Justification**: Admin tools are desktop-focused per spec (FR-067: minimum 1024px width). Admin users work from desktop environments.

### ✅ Component Architecture
- **Status**: PASS
- **Approach**: Atomic design with reusable form components, table components, modal components
- **Reuse**: Extends existing AdminLayout, AdminSidebar, AdminHeader from Feature 005

### ✅ User Privacy & Data Security
- **Status**: PASS
- **Measures**: 
  - Admin-only access with isAdmin flag check (FR-059, FR-060)
  - Rate limiting 100 req/min per admin (FR-061, FR-062)
  - Comprehensive audit logging (FR-063, FR-064, FR-065)
  - CSV validation to prevent injection attacks (FR-043)
  - Server-side validation on all inputs (FR-069)

### ✅ Performance & Accessibility
- **Status**: PASS with notes
- **Performance**: Specific targets in success criteria (SC-001 through SC-011)
- **Accessibility**: Keyboard navigation, semantic HTML, screen reader support (Constitution VI)
- **Note**: Analytics real-time calculation may be slower (3-5s) but acceptable per clarification

### ⚠️ Database Conventions
- **Status**: PASS
- **Models**: Reusing existing Achievement and UserAchievement models from Feature 028
- **New Entity**: AdminAuditLog with proper indexes (timestamp for retention queries)
- **Patterns**: Atomic operations for bulk activate/deactivate, cascade deletes

### ✅ Code Quality Gates
- **Status**: PASS
- **Gates**: ESLint, Prettier, all tests passing, code review required
- **Documentation**: JSDoc for complex functions and API routes

## Project Structure

### Documentation (this feature)

```
specs/035-admin-achievement-management/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── achievements-api.yaml     # OpenAPI spec for admin endpoints
│   └── audit-log-api.yaml        # OpenAPI spec for audit endpoints
├── checklists/
│   └── requirements.md  # Requirements validation (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```
src/
├── app/
│   └── admin/
│       └── achievements/
│           ├── page.js                    # Main achievement list page
│           ├── create/
│           │   └── page.js                # Create achievement page
│           ├── [achievementId]/
│           │   └── edit/
│           │       └── page.js            # Edit achievement page
│           ├── translations/
│           │   └── page.js                # Translation manager page
│           └── analytics/
│               └── page.js                # Analytics dashboard page
│
├── components/
│   ├── admin/
│   │   └── achievements/
│   │       ├── AchievementList.jsx        # List table component
│   │       ├── AchievementForm.jsx        # Multi-step form container
│   │       ├── ContentStep.jsx            # Form step: content
│   │       ├── CriteriaStep.jsx           # Form step: criteria
│   │       ├── MetadataStep.jsx           # Form step: metadata
│   │       ├── SettingsStep.jsx           # Form step: settings
│   │       ├── AchievementPreview.jsx     # Real-time preview
│   │       ├── BulkActionToolbar.jsx      # Bulk operations UI
│   │       ├── TranslationEditor.jsx      # Inline translation editing
│   │       ├── AnalyticsCards.jsx         # Stats summary cards
│   │       ├── AnalyticsTable.jsx         # Achievement ranking table
│   │       ├── UnlockTimelineChart.jsx    # Chart component
│   │       └── DeleteConfirmModal.jsx     # Deletion warning dialog
│   │
│   ├── molecules/
│   │   └── (reusable form components, badges, etc.)
│   │
│   └── atoms/
│       └── (buttons, inputs, labels, etc.)
│
├── lib/
│   ├── models/
│   │   ├── Achievement.js                 # Existing model (Feature 028)
│   │   ├── UserAchievement.js             # Existing model (Feature 028)
│   │   └── AdminAuditLog.js               # NEW: Audit log model
│   │
│   ├── services/
│   │   ├── achievementAdminService.js     # Admin CRUD operations
│   │   ├── auditLogService.js             # Audit logging service
│   │   ├── csvService.js                  # CSV import/export
│   │   └── analyticsService.js            # Analytics calculations
│   │
│   ├── middleware/
│   │   ├── adminAuth.js                   # Existing from Feature 005
│   │   └── rateLimit.js                   # NEW: Rate limiting middleware
│   │
│   └── utils/
│       ├── csvValidator.js                # CSV validation logic
│       └── achievementIdGenerator.js      # Slug generation from name
│
└── app/api/
    └── admin/
        └── achievements/
            ├── route.js                   # GET (list), POST (create)
            ├── [achievementId]/
            │   └── route.js               # GET (one), PUT (update), DELETE
            ├── bulk-activate/
            │   └── route.js               # POST bulk activate
            ├── bulk-deactivate/
            │   └── route.js               # POST bulk deactivate
            ├── translations/
            │   ├── export/
            │   │   └── route.js           # GET CSV export
            │   └── import/
            │       └── route.js           # POST CSV import
            └── analytics/
                └── route.js               # GET analytics data

tests/
├── unit/
│   ├── lib/
│   │   ├── models/
│   │   │   └── AdminAuditLog.test.js
│   │   ├── services/
│   │   │   ├── achievementAdminService.test.js
│   │   │   ├── auditLogService.test.js
│   │   │   ├── csvService.test.js
│   │   │   └── analyticsService.test.js
│   │   └── utils/
│   │       ├── csvValidator.test.js
│   │       └── achievementIdGenerator.test.js
│   │
│   └── components/
│       └── admin/
│           └── achievements/
│               ├── AchievementList.test.jsx
│               ├── AchievementForm.test.jsx
│               ├── ContentStep.test.jsx
│               ├── CriteriaStep.test.jsx
│               ├── MetadataStep.test.jsx
│               ├── SettingsStep.test.jsx
│               ├── BulkActionToolbar.test.jsx
│               ├── TranslationEditor.test.jsx
│               └── DeleteConfirmModal.test.jsx
│
├── integration/
│   └── api/
│       └── admin/
│           └── achievements/
│               ├── crud.test.js           # Test create, read, update, delete
│               ├── bulk-operations.test.js
│               ├── translations.test.js
│               ├── analytics.test.js
│               └── rate-limiting.test.js
│
└── e2e/
    └── admin-achievements.spec.js         # End-to-end user flows
```

**Structure Decision**: Web application structure (Option 2) is used. The application follows Next.js App Router conventions with co-located API routes. Admin pages are nested under `/app/admin/achievements/` to extend the existing admin area from Feature 005. Component organization follows atomic design principles with specific admin achievement components isolated in `src/components/admin/achievements/`. Services layer provides business logic separation from API routes and components.

## Complexity Tracking

*No violations requiring justification. Mobile-first waived per spec (desktop-only admin tool). All other gates pass.*

---

## Phase 0: Research & Discovery

**Status**: ✅ Complete  
**Output**: `research.md`  
**Outcome**: No unknowns identified. All technical details documented in Technical Context section with zero NEEDS CLARIFICATION markers. All clarifications resolved during specification phase (5 Q&A pairs integrated).

---

## Phase 1: Design Artifacts

**Status**: ✅ Complete  
**Date**: 2025-01-09

### Deliverables Generated

1. **data-model.md** ✅
   - Documented 3 entities: Achievement (existing), UserAchievement (existing), AdminAuditLog (new)
   - Defined schemas, indexes, validation rules, state transitions
   - Specified TTL behavior for audit retention (90-day auto-deletion)
   - Documented cascade delete pattern for UserAchievements

2. **contracts/achievements-api.yaml** ✅
   - OpenAPI 3.0 specification for 10 API endpoints
   - Complete request/response schemas with validation rules
   - Security (session auth), rate limiting (100 req/min), error handling
   - Endpoints: CRUD, bulk operations, translations (CSV), analytics

3. **quickstart.md** ✅
   - Developer onboarding guide with 5-minute setup
   - Architecture overview (file structure, data flow)
   - TDD workflow with code examples
   - Testing strategy (unit, integration, E2E)
   - Common gotchas, debugging tips, performance benchmarks

4. **Agent Context Update** ✅
   - Ran `update-agent-context.ps1 -AgentType claude`
   - Added JavaScript ES6+ with Next.js 15.5.6 to CLAUDE.md
   - Added frameworks: Next.js, React, Mongoose, NextAuth v5, Tailwind CSS, React Hook Form
   - Added database: MongoDB with Achievement, UserAchievement, AdminAuditLog collections

### Constitution Re-evaluation

All gates still PASS after design phase:
- ✅ TDD: Test examples in quickstart.md, coverage targets documented
- ✅ Next.js: App Router structure defined, Server/Client Component patterns shown
- ✅ Mobile-first: Still WAIVED (desktop-only admin tool)
- ✅ Components: Atomic design structure documented in project structure
- ✅ Security: Auth, rate limiting, audit logging, CSV validation in contracts
- ✅ Performance: Targets specified in Technical Context, benchmarking guide in quickstart
- ✅ Database: AdminAuditLog model designed with TTL index, cascade patterns documented
- ✅ Code Quality: ESLint/Prettier/testing patterns in quickstart

**No new violations introduced during design phase.**

---

## Next Phase

**Phase 2**: Task Breakdown  
**Command**: `/speckit.tasks`  
**Action**: Break down implementation into atomic, testable tasks with TDD cycles

This plan is now complete. Proceed with `/speckit.tasks` to generate `tasks.md` implementation breakdown.

