# Implementation Plan: Achievement Unlock API Response

**Branch**: `032-achievement-unlock-response` | **Date**: November 7, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/032-achievement-unlock-response/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Modify POST /api/entries and PUT /api/entries/[id] endpoints to automatically evaluate achievements after entry save/update and include unlocked achievements in the API response. This integration connects the existing AchievementService (Feature 031) with entry creation/update flows using non-blocking error handling to ensure entry operations never fail due to achievement processing errors. The response format extends the existing entry data with an `unlockedAchievements` array containing complete achievement metadata (achievementId, name, description, points, rarity, category, iconColor, unlockedAt), enabling frontend to display immediate achievement notifications without additional API calls.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 15.x (App Router)  
**Primary Dependencies**: Mongoose ODM, AchievementService (Feature 031), Next.js API Routes  
**Storage**: MongoDB (existing Entry, UserAchievement, Achievement collections)  
**Testing**: Jest + MongoDB Memory Server for integration tests  
**Target Platform**: Node.js server-side API routes (Vercel deployment)  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: <200ms achievement evaluation (95th percentile), <500ms total API response time  
**Constraints**: Non-blocking (entry operations succeed even if achievement evaluation fails), <50KB response payload typical case  
**Scale/Scope**: Modifies 2 existing API route files, adds error handling, extends response format (no new database schemas)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
- ✅ **PASS**: Uses existing App Router API route patterns (`withErrorHandler`, response helpers)
- ✅ **PASS**: Server-side only (API routes), no Client Component concerns
- ✅ **PASS**: Follows existing file-based routing (`/api/entries/route.js`, `/api/entries/[id]/route.js`)

### II. Mobile-First Responsive Design
- ✅ **N/A**: Backend API integration only, no UI changes in this feature

### III. Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: Feature 031 already has 60/60 tests passing covering AchievementService
- ✅ **PASS**: Integration tests will verify API response format and error handling
- ✅ **PASS**: Existing Entry API tests provide baseline; will extend with achievement response validation

### IV. Component Architecture
- ✅ **N/A**: Backend API integration only, no component changes

### V. User Privacy & Data Security
- ✅ **PASS**: Uses existing authentication via `auth()` function from Entry API routes
- ✅ **PASS**: No new security concerns (achievement data already visible in separate endpoints)
- ✅ **PASS**: Non-blocking error handling prevents information leakage

### VI. Performance & Accessibility
- ✅ **PASS**: Performance requirements explicit (<200ms evaluation, <500ms total response)
- ✅ **PASS**: Non-blocking design ensures Entry API performance baseline maintained
- ✅ **N/A**: Accessibility not applicable (API responses, not UI)

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```
specs/032-achievement-unlock-response/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── post-api-entries.md
│   └── put-api-entries-id.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   └── api/
│       └── entries/
│           ├── route.js         # Modify POST handler (add achievement evaluation)
│           └── [id]/
│               └── route.js     # Modify PUT handler (add achievement evaluation)
├── lib/
│   ├── services/
│   │   └── AchievementService.js  # Existing (Feature 031) - no changes needed
│   └── api/
│       └── errorHandler.js      # Existing - no changes needed
└── models/
    ├── Entry.js                 # Existing - no schema changes
    ├── Achievement.js           # Existing - no changes needed
    └── UserAchievement.js       # Existing - no changes needed

tests/
├── integration/
│   └── achievements/
│       └── api-response.test.js  # New: Test POST/PUT response format
└── unit/
    └── api/
        ├── entries-post.test.js  # Extend existing tests
        └── entries-put.test.js   # Extend existing tests
```

**Structure Decision**: Web application (Next.js full-stack) - Option 2 pattern already established in codebase. This feature modifies existing API route handlers to integrate with existing AchievementService. No new directories or models required; only behavioral changes to 2 route files (`src/app/api/entries/route.js` POST handler, `src/app/api/entries/[id]/route.js` PUT handler) to call `AchievementService.evaluateAndUnlock()` and extend response format.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected** - All constitution checks passed. This feature follows established patterns and does not introduce new complexity or deviate from project standards.

