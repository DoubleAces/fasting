# Implementation Plan: Achievement Unlock Logic

**Branch**: `031-achievement-unlock-logic` | **Date**: November 6, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/031-achievement-unlock-logic/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement automatic achievement unlocking system that evaluates user fasting entries against achievement criteria and creates UserAchievement records when conditions are met. The system integrates into existing entry save operations (POST/PUT /api/entries) and evaluates 6 criteria types: duration-milestone, streak, entry-count, goal-completion, weight-loss, and custom. Achievement evaluation completes in <200ms with batch unlocking support for multiple simultaneous achievements. The system uses idempotent database operations (unique constraints) to prevent duplicate unlocks and caches achievement definitions in memory (1-hour TTL) for optimal performance.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Node.js (Next.js runtime)  
**Primary Dependencies**: Next.js (App Router), Mongoose ODM, MongoDB  
**Storage**: MongoDB with Mongoose (models: Achievement, UserAchievement, Entry, User)  
**Testing**: Jest (unit tests) + MongoDB Memory Server (integration tests)  
**Target Platform**: Server-side (Next.js API Routes)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: <200ms achievement evaluation for users with <100 entries  
**Constraints**: 
- Idempotent operations (unique constraints handle duplicates)
- No MongoDB transactions (sequential creates with error handling)
- 1-hour cache TTL for achievement definitions
- No blocking of entry saves on achievement evaluation failures  
**Scale/Scope**: 
- 81 achievements across 8 categories (existing)
- 6 criteria evaluation types (duration, streak, count, goal, weight, custom)
- Batch unlocking for multiple simultaneous achievements
- Integration with 2 API endpoints (POST/PUT /api/entries)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices ✅
- Server-side service class (AchievementService) for business logic
- Integration with Next.js API Routes (existing /api/entries endpoints)
- No client-side components needed (backend-only feature)
- Follows App Router architecture patterns

### II. Mobile-First Responsive Design ✅
- Backend service only - UI already responsive (Feature 029/030)
- Toast notifications use existing mobile-friendly system (Feature 021)
- No new UI components in this feature

### III. Test-Driven Development (NON-NEGOTIABLE) ✅
- **Mandatory TDD workflow will be followed**
- Unit tests for each criteria evaluator (6 types)
- Integration tests for full evaluateAndUnlock flow
- Edge case tests (duplicates, missing data, concurrent operations)
- Performance tests (<200ms target with 100+ entries)
- Minimum 80% coverage required

### IV. Component Architecture ✅
- Service-based architecture (AchievementService class)
- Separation of concerns (one method per criteria type)
- Reusable evaluation functions
- Self-contained, independently testable methods

### V. User Privacy & Data Security ✅
- Achievement data is non-sensitive (gamification only)
- Uses existing authentication via API routes
- No new data collection
- Follows existing OWASP patterns

### VI. Performance & Accessibility ✅
- Performance target: <200ms evaluation time
- Backend optimization via caching (1-hour TTL)
- Efficient database queries with indexes
- No accessibility concerns (backend service)

**GATE STATUS**: ✅ **PASSED** - All constitution principles satisfied

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
├── lib/
│   ├── services/
│   │   └── AchievementService.js      # NEW: Core service class
│   ├── models/
│   │   ├── Achievement.js              # EXISTS: Achievement definitions
│   │   ├── UserAchievement.js          # EXISTS: User unlock records
│   │   ├── Entry.js                    # EXISTS: Fasting entries
│   │   └── User.js                     # EXISTS: User profiles
│   └── utils/
│       └── cache.js                    # NEW: In-memory cache utility (1h TTL)
├── app/
│   └── api/
│       └── entries/
│           └── route.js                # MODIFY: Integrate AchievementService

tests/
├── unit/
│   └── services/
│       └── AchievementService.test.js  # NEW: Unit tests for all evaluators
└── integration/
    └── achievements/
        └── unlock-flow.test.js         # NEW: Full unlock flow tests
```

**Structure Decision**: Next.js App Router web application structure. New service class in `src/lib/services/` follows existing pattern (e.g., SecurityLogger from Feature 026). Integration into existing `/api/entries` route mirrors established API modification patterns. Tests follow existing Jest + MongoDB Memory Server setup from Features 028-030.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All constitution principles satisfied. No complexity justification required.

---

## Phase 0: Research ✅ COMPLETE

**Output**: `research.md` (12,000+ words)

**Research Completed**:
1. ✅ Streak calculation from meal times (use actual fasting period, not creation timestamp)
2. ✅ Weight loss tracking method (current weight only, must maintain loss)
3. ✅ Entry update re-evaluation strategy (evaluate on POST/PUT, idempotent, gaming mitigated by hiding locked achievements)
4. ✅ Batch operation atomicity (sequential creates with unique constraints, no transactions)
5. ✅ Achievement definition cache strategy (1-hour TTL in-memory cache)
6. ✅ Mongoose query optimization best practices
7. ✅ Error handling strategy (non-blocking, achievement failures don't prevent entry saves)
8. ✅ Custom criteria extensibility (registry pattern with function mapping)
9. ✅ Testing strategy (unit, integration, performance, edge cases)
10. ✅ API response format (unlockedAchievements array in response)

**Key Decisions Documented**:
- Streak uses fasting period dates, not entry creation time
- Weight loss uses current weight (sustained loss required)
- Both POST and PUT trigger evaluation (idempotent)
- No transactions needed (unique constraints handle duplicates)
- 1-hour cache TTL balances performance and freshness
- Non-blocking error handling preserves entry save integrity

**All NEEDS CLARIFICATION items resolved** - Ready for Phase 1

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:
- `data-model.md` (9,000+ words)
- `contracts/AchievementService.md` (8,000+ words)
- `contracts/api-endpoints.md` (7,500+ words)
- `quickstart.md` (5,000+ words)
- Agent context updated: `CLAUDE.md`

**Data Model Documented**:
1. ✅ Achievement entity (existing, no changes)
2. ✅ UserAchievement entity (existing, no changes)
3. ✅ Entry entity (existing, no changes)
4. ✅ User entity (extension required: achievementPoints field)
5. ✅ Service layer data structures (EvaluationResult, QualifiedAchievements, Progress snapshots)
6. ✅ Cache data structures (SimpleCache with 1h TTL)
7. ✅ Data flow diagrams (entry save → evaluation → unlock)
8. ✅ Validation rules and constraints
9. ✅ Migration requirements (User.achievementPoints)

**Contracts Generated**:
1. ✅ AchievementService API contract (9 methods, type definitions, error handling, performance characteristics)
2. ✅ API endpoint modifications (POST/PUT /api/entries with achievement integration)
3. ✅ Backward compatibility guaranteed (additive changes only)
4. ✅ Testing strategy defined (unit, integration, performance)

**Quickstart Guide Created**:
- 5-minute setup instructions
- TDD implementation checklist (11 phases)
- Common patterns and templates
- Debugging tips and performance benchmarking
- Common issues and solutions

**Agent Context Updated**:
- ✅ Added JavaScript/Node.js/Next.js stack to Claude context
- ✅ Added Mongoose/MongoDB database info
- ✅ Preserved existing manual additions

---

## Post-Phase 1 Constitution Re-Check ✅ PASSED

All constitution principles remain satisfied after design phase:
- ✅ Next.js best practices maintained
- ✅ Mobile-first (backend only, no UI changes)
- ✅ TDD workflow defined with comprehensive test strategy
- ✅ Component architecture (service-based, separation of concerns)
- ✅ User privacy & security (non-sensitive data, existing auth)
- ✅ Performance & accessibility (sub-200ms target, backend service)

**GATE STATUS**: ✅ **PASSED** - Design phase complete, ready for implementation

---

## Phase 2: Implementation ⏳ NOT STARTED

**Note**: Phase 2 (implementation tasks) is generated by `/speckit.tasks` command (separate from `/speckit.plan`).

This planning phase ends here. Next steps:
1. Review generated artifacts (research.md, data-model.md, contracts/, quickstart.md)
2. User approval of plan
3. Run `/speckit.tasks` to generate implementation task breakdown
4. Begin TDD implementation following quickstart guide

---

## Planning Phase Summary

**Date Completed**: November 6, 2025  
**Branch**: `031-achievement-unlock-logic`  
**Status**: ✅ Planning Complete - Ready for Implementation

**Artifacts Generated**:
- ✅ `plan.md` (this file) - 130 lines
- ✅ `research.md` - 500+ lines, all technical decisions documented
- ✅ `data-model.md` - 400+ lines, entities and flows mapped
- ✅ `contracts/AchievementService.md` - 400+ lines, service API defined
- ✅ `contracts/api-endpoints.md` - 350+ lines, API modifications specified
- ✅ `quickstart.md` - 300+ lines, developer guide
- ✅ Agent context updated

**Total Planning Artifacts**: ~2,300 lines of comprehensive documentation

**Estimated Implementation Time**: 8-10 hours (with TDD approach)

**Next Command**: `/speckit.tasks` to generate task breakdown for implementation phase

