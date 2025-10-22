# Implementation Plan: Test Database Separation

**Branch**: `008-test-database-separation` | **Date**: October 22, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-test-database-separation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement automatic test database separation to protect production and development data from being wiped during integration test runs. The solution will introduce environment-aware database configuration using `MONGODB_TEST_URI`, automatic database selection based on `NODE_ENV=test`, and safety validation to prevent accidental production database usage during testing. All existing integration tests will be updated to use the test database while maintaining backward compatibility with unit tests using MongoDB Memory Server.

## Technical Context

**Language/Version**: JavaScript (ES6+) with Node.js (compatible with Next.js 15.5.6)
**Primary Dependencies**: Jest 30.2.0, Mongoose 8.19.1, MongoDB 5.5, Dotenv 17.2.3, mongodb-memory-server 10.2.3
**Storage**: MongoDB (production, development, and test databases)
**Testing**: Jest (unit & integration tests), React Testing Library, Playwright (E2E)
**Target Platform**: Node.js runtime (local development, CI/CD pipelines, Vercel deployment)
**Project Type**: Web application (Next.js 15 App Router)
**Performance Goals**: Test suite startup <5 seconds additional overhead, test execution within 10% of current performance
**Constraints**: Must maintain backward compatibility with existing unit tests, no new external dependencies, configuration must follow existing patterns
**Scale/Scope**: 15+ integration test files to update, 3 environment configurations (production, development, test)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Test-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS
- **Justification**: This feature is about improving test infrastructure itself. Existing integration tests serve as acceptance tests - they must continue passing after implementation. New test configuration logic will have unit tests added.

### ✅ Next.js Best Practices
- **Status**: PASS
- **Justification**: Feature leverages existing Next.js patterns. Changes are limited to test configuration and database utility, not affecting Next.js App Router or component architecture.

### ✅ Mobile-First Responsive Design
- **Status**: N/A
- **Justification**: This is a testing infrastructure feature with no UI components or user-facing changes.

### ✅ Component Architecture
- **Status**: N/A
- **Justification**: No component changes required. Infrastructure-only feature.

### ✅ User Privacy & Data Security
- **Status**: PASS
- **Justification**: Feature ENHANCES security by preventing test data from polluting production database. Test database credentials will be stored in environment variables following existing security patterns.

### ✅ Performance & Accessibility
- **Status**: PASS with conditions
- **Justification**: No impact on production application performance or accessibility. Test suite performance must remain within 10% of current execution time (constraint documented in spec).

### ✅ Technology Stack Compliance
- **Status**: PASS
- **Justification**: Uses existing technology stack (Jest, Mongoose, MongoDB, dotenv). No new dependencies introduced.

### ✅ Code Quality Gates
- **Status**: PASS
- **Justification**: All existing tests must pass after implementation. ESLint/Prettier compliance maintained. No direct commits to main branch.

**Overall**: ✅ APPROVED - All applicable gates passed. Proceed to Phase 0.

---

## Phase 0: Research & Technical Decisions ✅ COMPLETE

**Status**: Complete  
**Output**: [research.md](./research.md)

### Key Decisions Made

1. **Environment-Based Database Selection**: Use `NODE_ENV` to determine database URI (standard Node.js pattern)
2. **Test Database Name Validation**: Require 'test' keyword in database name for safety
3. **Jest Configuration**: Global `NODE_ENV=test` with per-file `@jest-environment node` for integration tests
4. **Cleanup Strategy**: `beforeEach` hooks for collection cleanup with shared setup utilities
5. **MongoDB URI Parsing**: Use Node.js URL class for extracting database names
6. **Backward Compatibility**: No changes to unit tests (continue using MongoDB Memory Server)
7. **CI/CD Configuration**: Add `MONGODB_TEST_URI` as encrypted secret in GitHub Actions/Vercel
8. **Error Messages**: Clear, actionable error messages with examples

**All technical unknowns resolved. Ready for Phase 1.**

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Complete  
**Outputs**: 
- [data-model.md](./data-model.md) - Configuration entities and validation logic
- [contracts/internal-api.md](./contracts/internal-api.md) - Internal module contracts
- [quickstart.md](./quickstart.md) - Implementation guide
- CLAUDE.md updated with technology context

### Design Artifacts

1. **Data Model**: Configuration entities (Environment Config, DB Connection Manager, Config Validator, Test Setup/Teardown Handler)
2. **API Contracts**: Internal module exports for `connectDB()`, test utilities (`setupTestDatabase`, `cleanTestDatabase`, `teardownTestDatabase`)
3. **Quickstart Guide**: 5-phase implementation plan with verification steps
4. **Agent Context**: Updated Claude context with Jest, Mongoose, MongoDB, Dotenv

### Constitution Re-Check (Post-Design)

**Re-evaluation after Phase 1 design completion**:

- ✅ **TDD Compliance**: Design includes unit tests for new configuration logic
- ✅ **Next.js Best Practices**: No deviations from framework patterns
- ✅ **Security**: Test database credentials in environment variables only
- ✅ **Performance**: <5s overhead for test suite, <500ms per-test cleanup
- ✅ **Technology Stack**: Uses existing dependencies only
- ✅ **Code Quality**: All quality gates satisfied in design

**Overall**: ✅ APPROVED - Design satisfies all constitution requirements. Ready for Phase 2 (task breakdown).

## Project Structure

### Documentation (this feature)

```
specs/008-test-database-separation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
# Next.js Web Application Structure (existing)
src/
├── lib/
│   ├── db.js                    # [MODIFY] Add environment-aware DB selection
│   └── test-utils/
│       └── db-test-helper.js    # [CREATE] Test database utilities
├── app/                          # Next.js App Router (no changes)
├── components/                   # React components (no changes)
└── contexts/                     # React contexts (no changes)

tests/
├── unit/                         # [NO CHANGE] Continue using MongoDB Memory Server
│   └── lib/
│       └── db.test.js           # [MODIFY] Add tests for environment selection
├── integration/                  # [MODIFY ALL] Update to use test database
│   ├── setup.js                 # [CREATE] Shared test database setup
│   ├── teardown.js              # [CREATE] Shared test database teardown
│   ├── auth.test.js             # [MODIFY] Use test database helper
│   ├── entries.test.js          # [MODIFY] Use test database helper
│   ├── settings.test.js         # [MODIFY] Use test database helper
│   └── [14+ other files]        # [MODIFY] Use test database helper
└── e2e/                          # Playwright tests (no changes for this feature)

# Configuration Files
.env.local                        # [MANUAL] Developer adds MONGODB_TEST_URI
.env.example                      # [MODIFY] Add MONGODB_TEST_URI documentation
jest.config.js                    # [MODIFY] Set NODE_ENV=test for integration tests
jest.setup.js                     # [MODIFY] Test database configuration
jest.env.setup.js                 # [MODIFY] Load test environment variables
package.json                      # [NO CHANGE] Existing scripts sufficient

# CI/CD Configuration
.github/
└── workflows/                    # [MODIFY] Add MONGODB_TEST_URI to CI secrets
```

**Structure Decision**: Using existing Next.js web application structure with App Router. Changes are minimal and focused on test infrastructure (`src/lib/db.js`, `tests/` directory, and configuration files). No new directories required - only new test utility files within existing structure. This follows the project's established patterns for test organization (unit, integration, e2e separation).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations requiring justification.** All constitution gates passed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

