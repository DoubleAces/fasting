# Implementation Plan: Backfill Fasting Duration Calculation

**Branch**: `009-backfill-fasting-calculation` | **Date**: October 23, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-backfill-fasting-calculation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Fix bug where creating an entry for a previous date doesn't recalculate fasting duration for subsequent entries.

**Technical Approach**: Modify the POST /api/entries route to find the immediate next entry after the newly created entry and recalculate its fasting duration. Reuse existing `calculateFastingDuration()` utility and follow the same cascade pattern already implemented in PUT and DELETE routes.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Node.js with Next.js 14+ (App Router)  
**Primary Dependencies**: Next.js, Mongoose ODM, MongoDB Atlas, NextAuth.js  
**Storage**: MongoDB Atlas (cloud database) - existing `entries` collection with userId and date compound index  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Web application (server-side API routes in Next.js)  
**Project Type**: Web application (Next.js fullstack with API routes)  
**Performance Goals**: Database query and update within 100ms, total API response <1 second  
**Constraints**: Must maintain existing Entry model schema, reuse `calculateFastingDuration()` utility, one-level cascade only  
**Scale/Scope**: Single API route modification affecting POST /api/entries, impacts all users creating backdated entries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

**✅ I. Next.js Best Practices**
- Using App Router API routes (already established)
- Server-side only (no Client Component changes needed)
- Follows existing route handler patterns

**✅ II. Mobile-First Responsive Design**
- No UI changes required (backend bug fix only)
- N/A for this feature

**✅ III. Test-Driven Development (NON-NEGOTIABLE)**
- Will write integration tests FIRST to reproduce bug
- Tests will verify backfill calculation works
- Follows Red-Green-Refactor cycle

**✅ IV. Component Architecture**
- No component changes (API-only fix)
- N/A for this feature

**✅ V. User Privacy & Data Security**
- No new data collection
- Maintains existing userId-scoped queries
- Follows established authentication patterns

**✅ VI. Performance & Accessibility**
- Backend optimization (faster than 1 second per spec)
- No frontend impact
- N/A for this feature

### Code Quality Gates

**✅ ESLint Compliance**: No linting concerns (modifying existing compliant route)  
**✅ Test Coverage**: Will add integration tests for backfill scenario  
**✅ JSDoc Comments**: Will document new cascade logic  
**✅ Code Review**: Changes isolated to one route handler  
**✅ No Direct Commits**: Working on feature branch `009-backfill-fasting-calculation`

### Database Conventions

**✅ Mongoose Schema**: Reusing existing Entry model (no schema changes)  
**✅ Indexing**: Using existing compound index `{ userId: 1, date: -1 }`  
**✅ Atomic Operations**: Single `findByIdAndUpdate` per affected entry  
**✅ Audit Trails**: Not required for calculated fields

**GATE STATUS**: ✅ **PASSED** - All constitution requirements met

## Project Structure

### Documentation (this feature)

```
specs/009-backfill-fasting-calculation/
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
│   └── api/
│       └── entries/
│           └── route.js           # MODIFY: Add backfill cascade logic to POST handler
├── lib/
│   ├── models/
│   │   └── Entry.js               # NO CHANGE: Existing model
│   └── utils/
│       ├── fastingCalculator.js   # NO CHANGE: Reuse existing utility
│       └── dateUtils.js           # NO CHANGE: Existing date utilities
└── middleware.js                   # NO CHANGE: Authentication

tests/
├── integration/
│   └── entries.test.js            # ADD: New test cases for backfill scenario
└── unit/
    └── (no new unit tests needed - reusing existing utilities)
```

**Structure Decision**: 

This is a Next.js App Router web application. The fix requires modifying only one file:
- **Primary Change**: `src/app/api/entries/route.js` - Add cascade update logic to POST handler
- **Test Addition**: `tests/integration/entries.test.js` - Add integration tests for backfill scenario
- **No New Files**: Reusing all existing utilities and models

## Complexity Tracking

*No violations detected - Constitution Check passed all gates.*

---

## Phase 0: Research & Investigation ✅ COMPLETE

**Objective**: Analyze existing cascade patterns and determine implementation approach.

**Artifacts Generated**:
- ✅ `research.md` - Technical decisions for backfill cascade implementation

**Key Findings**:
1. **Cascade Pattern**: Reuse existing PUT/DELETE handler patterns (lines 147-177, 216-258)
2. **Query Strategy**: Use `findOne({ date: { $gt: ... } }).sort({ date: 1 }).limit(1)` for finding next entry
3. **Error Handling**: try-catch with console.warn (don't fail entry creation)
4. **Test Strategy**: Add integration tests to existing `entries.test.js` file
5. **Code Location**: Insert after `entry.save()` at line 147 in POST handler

**Decisions Made**: All 5 research areas resolved - no open questions remain.

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Objective**: Document data model (unchanged), API behavior changes, and implementation guide.

**Artifacts Generated**:
- ✅ `data-model.md` - Confirms no schema changes, documents data flow
- ✅ `contracts/api-changes.md` - Documents POST endpoint behavior change (backward compatible)
- ✅ `quickstart.md` - Step-by-step TDD implementation guide
- ✅ `CLAUDE.md` - Updated agent context with feature technology

**Key Design Decisions**:

### Data Model
- **No schema changes** required to Entry model
- Reuses existing compound index `{ userId: 1, date: -1 }`
- Query pattern uses `$gt` operator to find next entry efficiently

### API Contract
- **Backward compatible** - no breaking changes
- Request/response formats unchanged
- Side effect added: updates next entry's `fastingDuration` silently
- Clients must refetch to see updated values

### Implementation Approach
- **17 lines** of new code in POST handler
- **3 test cases** added to integration suite
- **Zero new dependencies** - reuses all existing utilities
- **TDD workflow**: Write failing tests → Implement → Verify

**Constitution Re-Check**: ✅ PASSED
- No new violations introduced by design
- Follows established patterns (PUT/DELETE handlers)
- Maintains data consistency and user privacy
- Performance acceptable (<1 second per spec SC-001)

---

## Phase 2: Task Breakdown (Next Command: `/speckit.tasks`)

**Status**: Ready for task generation

The implementation plan is complete. Run `/speckit.tasks` to generate the detailed task breakdown for implementation.

**Expected Tasks**:
1. Write failing integration tests (TDD Red phase)
2. Implement cascade logic in POST handler (TDD Green phase)
3. Verify all tests pass and refactor (TDD Refactor phase)
4. Manual testing and verification
5. Documentation and code review prep

**Estimated Effort**: 2-3 hours total development time

