# Implementation Plan: Codebase Cleanup & Refactoring

**Branch**: `014-codebase-cleanup-refactor` | **Date**: October 26, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-codebase-cleanup-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Systematically clean up technical debt accumulated after feature 013, focusing on EntryForm.js (941 lines with known issues) and expanding to codebase-wide patterns. Remove dead code, extract duplicate logic, consolidate redundant state updates, and ensure consistent patterns across all 110 components and 40 API routes.

**Technical Approach**: Incremental refactoring in three prioritized phases (P1: EntryForm.js, P2: Components, P3: Backend). Each cleanup commit must pass all existing tests. Use clarified extraction strategy (create `submitFormWithData()` function within component) and rely on existing 50 integration tests for validation (no new test creation). Manual QA required before merge. Target: 100+ line reduction, zero duplicates >20 lines, maintain 100% test pass rate.

## Technical Context

**Language/Version**: JavaScript (ES6+) / React 18 / Next.js 15.5.6  
**Primary Dependencies**: Next.js App Router, React, Tailwind CSS, Mongoose, NextAuth.js v5  
**Storage**: MongoDB with Mongoose ODM (no schema changes - refactoring only)  
**Testing**: Jest + React Testing Library (50 EntryForm tests + full suite), Playwright E2E  
**Target Platform**: Web application (Server + Client Components)  
**Project Type**: Web (Next.js App Router with co-located API routes)  
**Performance Goals**: Reduce EntryForm.js cognitive complexity by 15%, eliminate 100+ lines of duplicate code  
**Constraints**: Zero breaking changes to user-facing behavior, maintain 100% test pass rate, no architectural changes  
**Scale/Scope**: 941-line EntryForm.js (P1), 110 components (P2), 40 API routes (P3)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
✅ **PASS**: No architectural changes - maintaining existing Next.js App Router structure  
✅ **PASS**: No Server/Client Component changes - refactoring internal logic only  
✅ **PASS**: Following existing file-based routing - no route modifications  
✅ **PASS**: No optimization changes - code cleanup maintains current patterns

### II. Mobile-First Responsive Design
✅ **PASS**: Zero UI changes - FR-006 explicitly requires no user-facing behavior changes  
✅ **PASS**: No touch target or responsive design modifications  
✅ **PASS**: Refactoring only affects internal component logic, not rendering

### III. Test-Driven Development (NON-NEGOTIABLE)
✅ **PASS**: All existing tests must pass after every commit (FR-005, FR-015, FR-016, SC-003)  
✅ **PASS**: TDD cycle maintained: existing tests → refactor → tests still pass  
✅ **PASS**: 80% code coverage requirement maintained (FR-017, SC-007)  
✅ **PASS**: Manual QA required for extended fast confirmation flow (FR-016, SC-010)  
✅ **PASS**: No new tests required (clarification decision - rely on existing integration tests)

### IV. Component Architecture
✅ **PASS**: Maintaining atomic design principles (atoms/molecules/organisms)  
✅ **PASS**: Components remain self-contained and independently testable  
✅ **PASS**: No changes to component APIs or interfaces (out of scope: breaking changes)  
✅ **PASS**: Improving component internals without affecting external contracts

### V. User Privacy & Data Security
✅ **PASS**: No security changes - pure code cleanup  
✅ **PASS**: No authentication or authorization changes  
✅ **PASS**: No data handling or API route security changes (P3 reviews consistency only)

### VI. Performance & Accessibility
✅ **PASS**: Performance improvements expected (reduced complexity, fewer state updates)  
✅ **PASS**: No accessibility changes - zero UI modifications  
✅ **PASS**: Maintaining current Lighthouse scores and Core Web Vitals  
✅ **PASS**: No semantic HTML or keyboard navigation changes

### Technology Stack Compliance
✅ **PASS**: JavaScript (ES6+), React 18, Next.js 15.5.6 - no stack changes  
✅ **PASS**: Tailwind CSS, Mongoose, NextAuth.js - no dependency changes  
✅ **PASS**: Jest + React Testing Library + Playwright - existing test infrastructure  
✅ **PASS**: ESLint, Prettier - maintaining code quality gates

### Development Workflow Compliance
✅ **PASS**: Incremental commits enforced (FR-018 - one issue type per commit)  
✅ **PASS**: All tests must pass before merge (SC-008 - CI/CD pipeline)  
✅ **PASS**: Code review required (SC-009 - second developer approval)  
✅ **PASS**: ESLint/Prettier checks maintained

### Complexity Management
✅ **PASS**: **REDUCING complexity** - removing dead code, extracting duplicates, simplifying state  
✅ **PASS**: YAGNI enforced - no new abstractions, only extracting existing logic  
✅ **PASS**: Favor simplicity - 15% cognitive complexity reduction target (SC-004)  
✅ **PASS**: Technical debt reduction is core feature goal

### Violations & Justifications

**None** - This is a pure refactoring feature that aligns with all constitution principles. It reduces complexity, maintains test coverage, requires zero architecture changes, and explicitly forbids breaking changes. The constitution's complexity management section is the driving force behind this feature.

## Project Structure

### Documentation (this feature)

```
specs/014-codebase-cleanup-refactor/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (refactoring patterns, best practices)
├── data-model.md        # Phase 1 output (EntryForm state structure, component data flow)
├── quickstart.md        # Phase 1 output (step-by-step refactoring guide)
├── contracts/           # Phase 1 output (N/A - no API changes for this feature)
├── checklists/          
│   └── requirements.md  # Validation checklist (completed, all PASS)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (protected)/              # Protected routes (entries, settings)
│   ├── dashboard/                # Admin area pages
│   ├── entries/                  # Entry pages (list, detail, edit)
│   ├── settings/                 # Settings page
│   ├── page.js                   # Homepage
│   ├── layout.js                 # Root layout
│   └── api/                      # API Routes (40 routes)
│       ├── entries/              # Entry CRUD operations
│       ├── settings/             # Settings operations
│       ├── auth/                 # Authentication
│       └── admin/                # Admin operations
├── components/                   # React components (110 components - P2 target)
│   ├── atoms/                    # Basic components (Button, Input, etc.)
│   ├── molecules/                # Composite components (FormField, Card, etc.)
│   ├── organisms/                # Complex components
│   │   └── EntryForm.js          # ⚠️ PRIMARY TARGET (941 lines, known issues - P1)
│   └── templates/                # Page layouts
├── lib/                          # Utilities and business logic
│   ├── db.js                     # MongoDB connection
│   ├── models/                   # Mongoose schemas (Entry, User, Settings)
│   ├── utils/                    # Helper functions (potential P2 extraction targets)
│   └── validation/               # Validation schemas
├── contexts/                     # React contexts
├── hooks/                        # Custom React hooks
└── styles/                       # Global styles

tests/
├── unit/                         # Unit tests (utilities, helpers)
├── integration/                  # API integration tests
├── components/                   # Component tests (React Testing Library)
│   └── EntryForm.test.js         # ⚠️ 50 tests must pass after P1 changes
├── pages/                        # Page tests
└── e2e/                          # Playwright E2E tests
```

**Structure Decision**: Next.js App Router web application structure (existing). This is a **refactoring-only feature** - no new files, no route changes, no new components. Work focuses on:

- **Phase 1 (P1)**: `src/components/organisms/EntryForm.js` - remove dead code (lines 215-253, line 69), extract duplicate logic (lines 420-640), consolidate state updates (lines 99+109)
- **Phase 2 (P2)**: All 110 components in `src/components/` - audit for duplicate utilities, inconsistent patterns, unused code
- **Phase 3 (P3)**: All 40 API routes in `src/app/api/` - review error handling, validation, query optimization

**Key Constraint**: Zero structural changes. All refactoring happens within existing files. Test files remain unchanged (existing tests must pass as-is).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected** - Constitution Check passed all gates. This feature actively reduces complexity in alignment with constitution principles.

