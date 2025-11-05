# Implementation Plan: Achievement API Endpoints

**Branch**: `029-achievement-api-endpoints` | **Date**: November 4, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/029-achievement-api-endpoints/spec.md`

## Summary

Create 6 REST API endpoints and event-driven background service to expose the Achievement & Badges system built in Feature 028. **Endpoints include**: (1) GET `/api/achievements` - authenticated browsing of active achievements with filtering, pagination, and multilingual support; (2) GET `/api/achievements/[id]` - single achievement details with secret achievement masking; (3) GET `/api/user/achievements` - authenticated user's unlocked achievements with progress tracking and completion percentage; (4) POST `/api/achievements/unlock` - admin-only manual unlock for testing; (5) POST `/api/admin/achievements` - admin achievement creation; (6) **Event-driven evaluation service** triggered on entry creation/update to automatically unlock achievements based on criteria (duration milestones, streaks, entry counts). Users see unlocks on next page load (no real-time push in this phase).

**Technical Approach**: Follow existing Next.js API route patterns with `withErrorHandler` wrapper, `auth()` session validation, response helpers (`okResponse`, `unauthorizedResponse`, etc.), and Edge Runtime compatibility. Implement evaluation service as utility function callable from entry mutation hooks. All endpoints require authentication via NextAuth session; admin endpoints additionally validate `session.user.isAdmin` flag for elevated access.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Node.js (current project version)  
**Primary Dependencies**: Next.js 15.x (App Router), NextAuth/Auth.js (authentication), Mongoose ODM (database queries), Achievement/UserAchievement/User/Entry models (Feature 028)  
**Storage**: MongoDB with connection pooling for Edge Runtime compatibility  
**Testing**: Jest (unit tests for services), React Testing Library (integration tests for API routes), Playwright (E2E tests for achievement flows)  
**Target Platform**: Next.js web application deployed on Vercel (Edge Runtime compatible)  
**Project Type**: Web application (Next.js App Router with API routes)  
**Performance Goals**: <200ms for GET `/api/achievements` (100 achievements), <150ms for filtered queries, <300ms for POST unlock operations, <500ms for event-driven evaluation  
**Constraints**: Edge Runtime compatible (no Node.js-only APIs), authentication required for all endpoints (admin routes additionally require isAdmin flag), MongoDB unique indexes prevent duplicate unlocks, evaluation triggered only on entry creation/update events (not cron/batch)  
**Scale/Scope**: 6 API route files, 1 evaluation service utility, 80+ achievements in database, support for thousands of users with real-time evaluation on entry saves

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Test-Driven Development (MANDATORY)
- **Status**: PASS - Feature specification includes 6 prioritized user stories with 35 acceptance scenarios in Given-When-Then format
- **Implementation Plan**: Write API route tests, evaluation service tests, and E2E flows BEFORE implementing endpoints
- **Test Types Required**: 
  - Unit tests: Evaluation service logic (criteria checking, duplicate prevention), response formatting
  - Integration tests: API routes with authentication, database operations, error responses
  - E2E tests: Complete achievement unlock flow, browsing achievements, admin creation

### ✅ Next.js Best Practices
- **Status**: PASS - Follows Next.js 15.x App Router patterns
- **Alignment**: 
  - API routes in `src/app/api/` following file-based routing
  - Server-side authentication via `auth()` function
  - Edge Runtime compatible (no Node.js-only APIs)
  - Leverage existing patterns from `src/app/api/entries/[id]/route.js`
  - Use response helpers and `withErrorHandler` wrapper

### ✅ Mobile-First Responsive Design
- **Status**: N/A - Backend API endpoints only, no UI components
- **Note**: Achievement display UI will be addressed in separate frontend feature (Phase 3 of achievement system)

### ✅ Component Architecture
- **Status**: N/A - API layer only, no React components in this feature
- **Note**: Frontend components for achievement badges and progress planned for future feature

### ✅ User Privacy & Data Security
- **Status**: PASS - Security measures implemented
- **Security Considerations**: 
  - All endpoints require authentication via NextAuth session (member-only access)
  - Admin endpoints validate `session.user.isAdmin` flag
  - User isolation enforced (users only see their own unlocked achievements)
  - Input validation on all POST endpoints (achievementId format, required fields)
  - MongoDB unique indexes prevent duplicate unlocks
  - Secret achievements mask name/description until unlocked
  - Error messages don't leak sensitive information (generic 404s)

### ✅ Performance & Accessibility
- **Status**: PASS (API Performance)
- **Performance Measures**:
  - SC-002: GET `/api/achievements` returns in <200ms for 100 achievements
  - SC-003: Filtered queries <150ms
  - SC-008: POST unlock operations <300ms
  - SC-012: Event-driven evaluation <500ms per user
  - Database indexes on Achievement (category, order, isActive) and UserAchievement (userId+achievementId unique, userId+unlockedAt desc)
  - Pagination (limit 20, max 100) prevents large result sets
  - Event-driven evaluation processes only triggering user (not batch)
- **Accessibility**: N/A for API endpoints (frontend accessibility in Phase 3)

### ✅ Database Conventions (From Constitution)
- **Status**: PASS - Follows existing patterns
- **Mongoose Usage**: Queries use Achievement, UserAchievement, User, Entry models from Feature 028
- **Atomic Operations**: UserAchievement creation with user points increment in transaction-like pattern
- **Indexing**: Leverages existing compound indexes for performance
- **Audit Trails**: Uses existing timestamps (createdAt, updatedAt) and createdBy fields

**Overall Gate Status**: ✅ **PASS** - All applicable constitution requirements met, no violations to justify

## Project Structure

### Documentation (this feature)

```
specs/029-achievement-api-endpoints/
├── plan.md              # This file
├── research.md          # Phase 0 output: API patterns, event-driven architecture, evaluation strategies
├── data-model.md        # Phase 1 output: API request/response schemas, evaluation service flow
├── quickstart.md        # Phase 1 output: How to use endpoints, example requests, testing guide
├── contracts/           # Phase 1 output: OpenAPI/JSON schemas for all 6 endpoints
│   ├── achievements-list.json
│   ├── achievement-details.json
│   ├── user-achievements.json
│   ├── achievement-unlock.json
│   ├── admin-create-achievement.json
│   └── evaluation-service.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/app/api/
├── achievements/
│   ├── route.js              # NEW: GET /api/achievements (list with filters)
│   └── [id]/
│       └── route.js          # NEW: GET /api/achievements/[id] (single details)
├── user/
│   └── achievements/
│       └── route.js          # NEW: GET /api/user/achievements (user's unlocks)
├── achievements/
│   └── unlock/
│       └── route.js          # NEW: POST /api/achievements/unlock (manual unlock)
└── admin/
    └── achievements/
        └── route.js          # NEW: POST /api/admin/achievements (create achievement)

src/lib/
├── models/                   # UNCHANGED: Models from Feature 028
│   ├── Achievement.js
│   ├── UserAchievement.js
│   ├── User.js
│   └── Entry.js
├── services/
│   └── achievementEvaluator.js  # NEW: Event-driven evaluation service
└── api/
    └── errorHandler.js       # UNCHANGED: Existing withErrorHandler, response helpers

tests/unit/
└── services/
    └── achievementEvaluator.test.js  # NEW: Unit tests for evaluation logic

tests/integration/
└── api/
    ├── achievements-list.test.js      # NEW: GET /api/achievements tests
    ├── achievement-details.test.js    # NEW: GET /api/achievements/[id] tests
    ├── user-achievements.test.js      # NEW: GET /api/user/achievements tests
    ├── achievement-unlock.test.js     # NEW: POST unlock tests
    └── admin-create-achievement.test.js  # NEW: POST admin create tests

tests/e2e/
└── achievements/
    ├── browse-achievements.spec.js    # NEW: E2E browsing flow
    ├── unlock-achievement.spec.js     # NEW: E2E automatic unlock flow
    └── admin-create-achievement.spec.js  # NEW: E2E admin creation flow
```

**Structure Decision**: This is a Next.js web application following the App Router structure. API routes are placed in `src/app/api/` with file-based routing. The evaluation service is a utility in `src/lib/services/` callable from entry mutation hooks. Tests follow existing project structure with unit tests in `tests/unit/`, integration tests in `tests/integration/`, and E2E tests in `tests/e2e/`.

## Complexity Tracking

*No violations - this section intentionally left empty as Constitution Check passed all gates.*

