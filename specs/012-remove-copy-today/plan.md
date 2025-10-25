# Implementation Plan: Remove Copy to Today Functionality

**Branch**: `012-remove-copy-today` | **Date**: October 25, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-remove-copy-today/spec.md`

## Summary

Remove the "Copy to Today" functionality completely from the fasting tracker application. This involves removing the UI button from entry details pages, eliminating all backend logic that handles copy-from-template requests, and removing the `templateSource` field validation from the Entry schema. The feature will be cleanly removed without breaking other entry management functionality (view, edit, delete).

## Technical Context

**Language/Version**: JavaScript ES6+ / Next.js 15.5.6
**Primary Dependencies**: React 18, Mongoose ODM, NextAuth.js
**Storage**: MongoDB (Entry model - templateSource field validation to be removed)
**Testing**: Jest + React Testing Library (existing tests for copy functionality will be removed)
**Target Platform**: Web (responsive mobile-first)
**Project Type**: Next.js App Router web application
**Performance Goals**: No specific goals (removal improves performance by eliminating unnecessary code paths)
**Constraints**: Cannot break existing entry queries
**Scale/Scope**: Small-scale removal affecting 1 component, 1 API validation rule, 1 data model field, ~5-10 test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

#### ✅ I. Next.js Best Practices
- **Status**: PASS
- **Notes**: Removal work follows App Router conventions, maintaining Server Component patterns where appropriate

#### ✅ II. Mobile-First Responsive Design  
- **Status**: PASS
- **Notes**: Removing button improves mobile UX by reducing action clutter (3 buttons → 2)

#### ✅ III. Test-Driven Development
- **Status**: PASS - with adjustment
- **Notes**: For removal work, existing tests will be deleted along with functionality. New tests will verify absence of removed features (negative testing). TDD approach: Write negative tests → Verify they fail (feature still present) → Remove feature → Tests pass

#### ✅ IV. Component Architecture
- **Status**: PASS
- **Notes**: EntryActions component remains reusable and testable after removal of copy functionality

#### ✅ V. User Privacy & Data Security
- **Status**: PASS
- **Notes**: Preserving templateSource data maintains audit trail integrity. No security implications from removal.

#### ✅ VI. Performance & Accessibility
- **Status**: PASS - improves both
- **Notes**: Reduces code size, eliminates unnecessary API calls, simplifies UI (fewer buttons to navigate)

### Technology Stack Compliance

- **Framework**: Next.js 15.5.6 ✅
- **Language**: JavaScript ES6+ ✅
- **Styling**: Tailwind CSS (no styling changes needed) ✅
- **State Management**: React useState (reducing state variables) ✅
- **Forms**: N/A for removal
- **Testing**: Jest + RTL (removing copy-related tests) ✅

### Development Workflow Compliance

- **Code Quality Gates**: All gates will pass (removal reduces complexity) ✅
- **Feature Development Process**: Following Specify → Plan → Test → Implement ✅
- **Database Conventions**: Soft deprecation of templateSource maintains audit trail ✅

**GATE STATUS**: ✅ PASS - No constitution violations. Removal work aligns with all principles.

## Project Structure

### Documentation (this feature)

```
specs/012-remove-copy-today/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (removal patterns, legacy data handling)
├── data-model.md        # Phase 1 output (Entry model changes)
├── quickstart.md        # Phase 1 output (developer guide for removal)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── entries/
│   │   └── [id]/
│   │       └── page.js           # [NO CHANGE] Entry serialization works as-is
│   └── api/
│       └── entries/
│           └── route.js           # [VERIFY] templateSource auto-ignored via stripUnknown
├── components/
│   └── organisms/
│       ├── EntryActions.js        # [MODIFY] Remove copy button and logic
│       └── EntryDetailsView.js    # [NO CHANGE] Just passes entry to EntryActions
├── lib/
│   ├── models/
│   │   └── Entry.js               # [NO CHANGE] templateSource field remains in schema
│   └── validation/
│       └── entrySchema.js         # [MODIFY] Remove templateSource validation

tests/
├── unit/
│   ├── components/
│   │   └── organisms/
│   │       └── EntryActions.test.js  # [DELETE] Remove copy-related tests
│   └── api/
│       └── entries/
│           └── route.test.js         # [MODIFY] Remove templateSource test cases
└── integration/
    └── entry-details.test.js         # [MODIFY] Remove copy functionality tests
```

**Structure Decision**: Standard Next.js App Router structure (Option 2: Web application). All changes are modifications or deletions to existing files - no new files needed for this removal.

## Complexity Tracking

*No violations - removal work simplifies the codebase and reduces complexity*

**Complexity Reduction**:
- Removes 1 action button from UI (3 → 2 actions)
- Eliminates ~100 lines of copy logic from EntryActions component
- Removes validation rules for templateSource
- Reduces test surface area
- Simplifies user decision-making (fewer actions to choose from)

This feature removal aligns with YAGNI principle and reduces maintenance burden.

---

## Phase 0: Research (Complete)

**Status**: ✅ Complete

**Artifacts Generated**:
- [research.md](research.md) - Comprehensive research on removal patterns, legacy data handling, testing strategy, and rollback plans

**Key Decisions**:
1. Phased removal approach (UI → Backend → Data Model)
2. Preserve existing templateSource values (audit trail compliance)
3. Negative testing + remove existing tests
4. Soft deprecation of data model field
5. No feature flags needed (low-risk removal)

**All NEEDS CLARIFICATION items resolved** - Ready for Phase 1

---

## Phase 1: Design & Contracts (Complete)

**Status**: ✅ Complete

**Artifacts Generated**:
- [data-model.md](data-model.md) - Entry model changes (soft deprecation of templateSource)
- [contracts/api-changes.md](contracts/api-changes.md) - API contract modifications (validation removal)
- [quickstart.md](quickstart.md) - Developer implementation guide

**Key Designs**:
1. **Data Model**: templateSource field marked deprecated, preserved for legacy entries
2. **API Contracts**: Validation removed, field ignored if provided (backward compatible)
3. **Component Architecture**: EntryActions simplified, state reduced
4. **Testing Strategy**: Negative tests + remove old positive tests

**Agent Context**: Updated in CLAUDE.md

**Constitution Re-Check**: ✅ PASS - All principles still satisfied after design

---

## Next Steps

**Phase 2**: Generate implementation tasks

Run:
```bash
/speckit.tasks
```

This will create `tasks.md` with:
- TDD test tasks (write negative tests first)
- UI removal tasks (EntryActions component)
- Backend cleanup tasks (validation, model deprecation)
- Test cleanup tasks (remove old tests)
- Manual testing checklist
- Deployment tasks

---

## Summary

### Planning Complete

- ✅ Specification reviewed ([spec.md](spec.md))
- ✅ Constitution compliance verified (all gates pass)
- ✅ Research completed (7 areas researched)
- ✅ Data model designed (soft deprecation approach)
- ✅ API contracts updated (backward compatible changes)
- ✅ Implementation guide created (step-by-step quickstart)
- ✅ Agent context updated

### Estimated Effort

- **Implementation Time**: 1-2 hours
- **Testing Time**: 30-45 minutes  
- **Total**: ~2-3 hours for complete removal

### Risk Assessment

- **Risk Level**: LOW
- **Impact**: Simplifies codebase, improves UX (fewer buttons)
- **Rollback**: Git revert (instant)
- **Testing**: Negative tests + manual verification

### Ready for Tasks Generation

All planning and design work complete. Ready to break down into actionable tasks via `/speckit.tasks`.
