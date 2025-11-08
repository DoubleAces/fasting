# Implementation Plan: Admin Achievement Backfill

**Branch**: `033-admin-achievement-backfill` | **Date**: November 7, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/033-admin-achievement-backfill/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a "Backfill Achievements" button to the admin user management table that allows administrators to retroactively evaluate all user entries and unlock missing achievements. The feature addresses data inconsistency where existing users have locked achievements despite qualifying historical entries (created before the achievement system was implemented in Features 028-032). Implementation includes: (1) BackfillAchievementsButton client component with loading states and toast feedback following existing admin action button patterns, (2) POST /api/admin/users/[userId]/backfill-achievements API endpoint that sequentially evaluates all user entries using the existing AchievementService.evaluateAndUnlock() method, (3) idempotent operation design with aggregate statistics returned (entries processed, achievements unlocked, points earned), and (4) comprehensive error handling for edge cases (zero entries, deleted users, service failures, concurrent operations).

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 15.x (App Router)  
**Primary Dependencies**: Next.js (App Router), NextAuth/Auth.js (authentication), Mongoose ODM (database queries), AchievementService (Feature 031), useToast hook (Feature 021)  
**Storage**: MongoDB with Mongoose (models: Entry, Achievement, UserAchievement, User)  
**Testing**: Jest (unit tests) + MongoDB Memory Server (integration tests) + Playwright (E2E tests)  
**Target Platform**: Server-side (Next.js API Routes) + Client-side (React components)  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: <60 seconds total API response time for 500 entries, <200ms per entry evaluation (via cached achievement definitions), <10 seconds @ 95th percentile for typical users (50-150 entries)  
**Constraints**: Sequential entry processing (leverage existing AchievementService interface), idempotent operations (safe to run multiple times), admin-only access, no API timeout <60s, non-blocking toast notifications  
**Scale/Scope**: Single API endpoint, single client component, integration with existing admin user table, handles 1-500 entries per user, supports concurrent administrator operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
- ✅ **PASS**: Uses Next.js App Router API route pattern (`/api/admin/users/[userId]/backfill-achievements/route.js`)
- ✅ **PASS**: Server Component for API endpoint (admin role verification, database operations)
- ✅ **PASS**: Client Component for button ('use client' directive, useState for loading, useToast for notifications)
- ✅ **PASS**: Follows existing file-based routing conventions in `/app/api/admin/users/` directory

### II. Mobile-First Responsive Design
- ✅ **PASS**: Button inherits responsive admin table layout (existing Feature 006 mobile design)
- ✅ **PASS**: Touch-friendly button sizing (follows AdminToggle/DeleteUserButton patterns with 44px+ touch targets)
- ✅ **PASS**: Toast notifications already mobile-optimized (Feature 021 responsive implementation)

### III. Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: TDD workflow will be followed (tests written before implementation)
- ✅ **PASS**: Unit tests: BackfillAchievementsButton component with mocked API calls
- ✅ **PASS**: Integration tests: API endpoint with MongoDB Memory Server, idempotency verification (run twice, check duplicates)
- ✅ **PASS**: Access control tests: 403 for non-admin, 200 for admin
- ✅ **PASS**: Edge case tests: zero entries, user not found, service unavailable, concurrent operations
- ✅ **PASS**: E2E tests: Full flow from button click through toast notification verification

### IV. Component Architecture
- ✅ **PASS**: BackfillAchievementsButton is reusable, self-contained component
- ✅ **PASS**: Props validation via JSDoc comments (userId, userName, onBackfillSuccess callback)
- ✅ **PASS**: Follows atomic design: button component (molecule) within UserRow (organism)
- ✅ **PASS**: Mirrors existing admin action button patterns (DeleteUserButton, AdminToggle) for consistency

### V. User Privacy & Data Security
- ✅ **PASS**: Admin-only access enforced via NextAuth role check in API endpoint
- ✅ **PASS**: No sensitive user data in API responses (only aggregate counts: entries processed, achievements unlocked)
- ✅ **PASS**: Audit logging: records administrator ID, target user ID, timestamp, operation results
- ✅ **PASS**: Read-only operation on user entries (only creates UserAchievement records, no user data modification)

### VI. Performance & Accessibility
- ✅ **PASS**: Performance target explicit (<60s max, <10s @ 95th percentile)
- ✅ **PASS**: Accessibility: Button has aria-label for screen readers, disabled state clearly indicated
- ✅ **PASS**: Keyboard navigation: Button focusable and activatable via Enter/Space
- ✅ **PASS**: Loading states prevent user confusion during long operations

## Project Structure

### Documentation (this feature)

```
specs/033-admin-achievement-backfill/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── backfill-achievements-api.yaml
├── checklists/
│   └── requirements.md  # Already created during /speckit.specify
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── admin/
│   │   └── users/
│   │       ├── components/
│   │       │   ├── AdminToggle.js                  # Existing
│   │       │   ├── DeleteUserButton.js             # Existing
│   │       │   ├── BackfillAchievementsButton.js   # NEW - Feature 033
│   │       │   └── UserRow.js                      # MODIFIED - Add BackfillAchievementsButton
│   │       └── page.js                             # Existing (unchanged)
│   └── api/
│       └── admin/
│           └── users/
│               ├── [userId]/
│               │   └── backfill-achievements/
│               │       └── route.js                # NEW - Feature 033 API endpoint
│               ├── route.js                        # Existing
│               ├── delete/
│               │   └── route.js                    # Existing
│               └── toggle-admin/
│                   └── route.js                    # Existing
├── lib/
│   ├── services/
│   │   └── AchievementService.js                   # Existing (Feature 031, unchanged)
│   └── models/
│       ├── Entry.js                                # Existing
│       ├── Achievement.js                          # Existing
│       ├── UserAchievement.js                      # Existing
│       └── User.js                                 # Existing
└── hooks/
    └── useToast.js                                 # Existing (Feature 021, unchanged)

tests/
├── unit/
│   └── components/
│       └── admin/
│           └── BackfillAchievementsButton.test.js  # NEW - Feature 033
├── integration/
│   └── api/
│       └── admin/
│           └── backfill-achievements.test.js       # NEW - Feature 033
└── e2e/
    └── admin/
        └── achievement-backfill.spec.js            # NEW - Feature 033 (Playwright)
```

**Structure Decision**: Web application structure (Next.js App Router). Feature adds:
1. **New client component**: `BackfillAchievementsButton.js` following existing admin button patterns
2. **New API endpoint**: `/api/admin/users/[userId]/backfill-achievements/route.js` following existing admin API structure
3. **Modified component**: `UserRow.js` to include the new backfill button in actions column
4. **Test files**: Unit, integration, and E2E tests for complete coverage

No new models, services, or hooks required (leverages existing AchievementService, useToast, auth, models).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All Constitution checks PASS. No justification required.



## Phase 0: Research ( COMPLETE)

**Output**: `research.md` document with technical decisions and alternatives analysis.

**Status**: Complete - 7 research areas resolved:
1. Component Pattern Decision: Follow DeleteUserButton pattern (single-action button, no confirmation modal)
2. API Endpoint Structure: POST /api/admin/users/[userId]/backfill-achievements (RESTful pattern)
3. Evaluation Strategy: Sequential processing (accurate streak calculation, simpler implementation)
4. Error Handling Approach: Comprehensive (authentication, authorization, user existence, service failures)
5. Toast Message Format: Aggregate statistics with conditional messaging (achievements vs no achievements)
6. Access Control Pattern: Admin-only with NextAuth role check (existing pattern from Feature 006)
7. Performance Optimization: Leverage cached achievement definitions (Feature 031 optimization)

**Key findings documented in `research.md`.**

---

## Phase 1: Design Artifacts ( COMPLETE)

**Output**: Detailed design documents establishing contracts and implementation approach.

### Generated Artifacts:

1.  **research.md** (324 lines)
   - 7 research areas with decisions, rationale, and alternatives considered
   - Component pattern analysis (DeleteUserButton vs custom modal vs inline action)
   - API structure comparison (POST endpoint vs Server Action vs RPC-style)
   - Processing strategy evaluation (sequential vs parallel vs batch)
   - Error handling patterns with recovery strategies
   - Toast messaging formats with examples
   - Access control patterns matching Feature 006 implementation
   - Performance optimization leveraging Feature 031 caching

2.  **data-model.md** (247 lines)
   - Database Models: Zero new models (reuses Entry, Achievement, UserAchievement, User)
   - Ephemeral Structures: BackfillRequest (path params), BackfillResult (response object), ButtonState (client state)
   - Data Flow Diagram: Request  Auth  Fetch Entries  Sequential Loop  Aggregate  Response
   - Performance Analysis: 200KB memory footprint, <100s worst case (500 entries @ 200ms each)
   - Idempotency guarantees via unique constraints

3.  **contracts/backfill-achievements-api.yaml** (191 lines)
   - OpenAPI 3.0.3 specification
   - Endpoint: POST /api/admin/users/{userId}/backfill-achievements
   - Security: sessionAuth (NextAuth cookie)
   - Request: Path parameter userId (MongoDB ObjectId)
   - Responses: 200 (success), 401 (unauthenticated), 403 (non-admin), 404 (user not found), 500 (server error)
   - Success schema: BackfillSuccessResponse with entriesProcessed, achievementsUnlocked, pointsEarned, achievements array
   - Three examples: withAchievements (127 entries/8 unlocked), noNewAchievements (50 entries/0 unlocked), zeroEntries (0/0/0)

4.  **quickstart.md** (714 lines)
   - Step-by-step TDD implementation guide
   - Phase 1: Setup & Planning (15 minutes)
   - Phase 2: API Endpoint with integration tests (2 hours, 7 tests)
   - Phase 3: Client Component with unit tests (2.5 hours, 13 tests)
   - Phase 4: UserRow integration (30 minutes)
   - Phase 5: E2E Testing (1 hour, 3 tests)
   - Phase 6: Final testing & documentation (1 hour)
   - Complete code snippets for tests and implementation
   - Manual testing checklist (14 items)
   - Deployment checklist and troubleshooting guide
   - Git workflow with commit message templates

5.  **Agent Context Updated**
   - Executed `update-agent-context.ps1 -AgentType claude`
   - Added Feature 033 entry to CLAUDE.md:
     - Language: JavaScript (ES6+) / Next.js 15.x (App Router)
     - Framework: Next.js (App Router), NextAuth/Auth.js, Mongoose ODM, AchievementService, useToast hook
     - Database: MongoDB with Mongoose (Entry, Achievement, UserAchievement, User models)

**All Phase 1 artifacts follow templates from `.specify/templates/` and document technical decisions with complete rationale.**

---

## Phase 2: Task Generation ( PENDING)

**Status**: Not started - Requires separate `/speckit.tasks` command invocation by user.

**Output**: `tasks.md` document with granular implementation tasks following TDD workflow.

**Note**: Phase 2 is **NOT** part of the `/speckit.plan` command scope. User must explicitly run `/speckit.tasks` after reviewing and approving this plan.

**Expected tasks.md structure**:
- Task breakdown for BackfillAchievementsButton component (with unit tests)
- Task breakdown for API endpoint route.js (with integration tests)
- Task breakdown for UserRow.js modification (with regression tests)
- Task breakdown for E2E test suite (with Playwright scenarios)
- User approval gate between each "write tests" and "implement code" task
- Refactor/polish tasks after green phase completion

**Proceed to Phase 2 by running**: `/speckit.tasks` when ready to begin implementation.

---

## Next Steps

1.  **Review this plan** - Verify technical decisions and Constitution compliance
2.  **Run /speckit.tasks** - Generate granular implementation task breakdown (separate command)
3.  **Begin Implementation** - Follow TDD workflow in quickstart.md with task-by-task approval gates

**Branch**: `033-admin-achievement-backfill` (active)  
**Status**: Planning phase complete, ready for task generation  
**Estimated Implementation Time**: 6-8 hours (per quickstart.md breakdown)

---

**END OF IMPLEMENTATION PLAN** 
