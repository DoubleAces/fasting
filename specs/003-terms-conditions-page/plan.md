# Implementation Plan: Terms and Conditions Page

**Branch**: `003-terms-conditions-page` | **Date**: October 21, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-terms-conditions-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a publicly accessible Terms and Conditions page at /terms route with comprehensive legal content including health disclaimers specific to fasting tracking. The page must be accessible to all users, mobile-responsive, SEO-optimized, and integrated with the registration flow requiring explicit user acceptance via checkbox. The system will store acceptance timestamps in user records for audit compliance.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 15.5.6  
**Primary Dependencies**: Next.js App Router, React, Tailwind CSS v4, NextAuth.js v5  
**Storage**: MongoDB with Mongoose (User model extension for termsAcceptedAt field)  
**Testing**: Jest + React Testing Library (component/integration), Playwright (E2E)  
**Target Platform**: Web application (SSR with Next.js App Router)  
**Project Type**: Single Next.js web project  
**Performance Goals**: Page load <2 seconds, Lighthouse SEO score >90  
**Constraints**: Mobile-responsive (320px-2560px), WCAG 2.1 AA accessibility, keyboard navigation  
**Scale/Scope**: Single static page with 9 content sections, User model field addition, Registration form enhancement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **Next.js Best Practices**: Using App Router with Server Components for static terms page  
✅ **Mobile-First Responsive Design**: Page will be responsive 320px-2560px with touch-friendly elements  
✅ **Test-Driven Development**: Tests required before implementation (component, integration, E2E)  
✅ **Component Architecture**: Reusable components (TermsSection atom, TermsContent organism)  
✅ **User Privacy & Data Security**: Terms acceptance timestamp stored securely; no PII in terms content  
✅ **Performance & Accessibility**: Target Lighthouse SEO >90, WCAG 2.1 AA, keyboard navigation, semantic HTML

### Technology Stack Compliance

✅ **Frontend**: Next.js 15.5.6 with Tailwind CSS v4 (matches existing stack)  
✅ **Backend**: Next.js App Router for page rendering (no API routes needed for static content)  
✅ **Database**: Mongoose User model extension (termsAcceptedAt field)  
✅ **Testing**: Jest + React Testing Library + Playwright (matches existing setup)  
✅ **Authentication**: NextAuth.js v5 integration for registration form enhancement

### Development Workflow Compliance

✅ **Code Quality Gates**: ESLint, Prettier, tests must pass  
✅ **TDD Process**: Tests written first based on acceptance scenarios  
✅ **Database Conventions**: Mongoose schema extension with proper field documentation

### Violations & Justifications

**None** - All constitution principles are satisfied

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
│   ├── terms/
│   │   └── page.js                    # Main terms page (Server Component)
│   └── (auth)/
│       └── register/
│           └── page.js                # Updated with terms checkbox
├── components/
│   ├── atoms/
│   │   └── TermsSection.js           # Individual terms section with anchor
│   ├── molecules/
│   │   └── TermsCheckbox.js          # Terms acceptance checkbox for forms
│   └── organisms/
│       ├── TermsContent.js           # Full terms content with all sections
│       └── RegisterForm.js           # Updated to include terms checkbox
└── lib/
    └── models/
        └── User.js                    # Extended with termsAcceptedAt field

tests/
├── components/
│   ├── atoms/
│   │   └── TermsSection.test.js
│   ├── molecules/
│   │   └── TermsCheckbox.test.js
│   └── organisms/
│       └── TermsContent.test.js
├── integration/
│   └── terms-registration.test.js     # Registration with terms acceptance
├── pages/
│   └── terms.test.js                  # Terms page rendering
└── e2e/
    └── terms-acceptance.spec.js       # Full user journey E2E test
```

**Structure Decision**: Single Next.js project structure (existing). Terms page follows App Router conventions with Server Component for optimal SEO and performance. Components follow atomic design pattern already established in the project. Registration form enhancement maintains existing component structure.

---

## Planning Phases Status

### ✅ Phase 0: Research (COMPLETE)
**Output**: `research.md` with 7 major technical decisions
- Legal content structure (10 sections including health disclaimers)
- User consent tracking (termsAcceptedAt timestamp in User model)
- URL anchor implementation (fragment identifiers with smooth scroll)
- Registration form integration (TermsCheckbox validation)
- SEO optimization (SSR with metadata, <2s load target)
- Accessibility compliance (WCAG 2.1 AA, keyboard navigation)
- Testing strategy (TDD with unit/integration/E2E tests)

### ✅ Phase 1: Data Model & Contracts (COMPLETE)
**Outputs**:
- ✅ `data-model.md` - User model extension with termsAcceptedAt field + static TermsContent structure
- ✅ `quickstart.md` - Developer setup guide with TDD workflow and testing commands
- ✅ Agent context updated (CLAUDE.md) with new technologies/patterns
- ⏭️ No API contracts needed (static page with form enhancement only)

**Key Data Model Changes**:
- User.termsAcceptedAt: Date field (required for new users, immutable)
- TermsContent: Static structure (10 sections, hard-coded in component)
- State transitions: Registration flow with checkbox validation
- Validation rules: Client-side and server-side checkbox enforcement
- Storage impact: Negligible (<1 MB for 100k users)

### ⏳ Phase 2: Task Breakdown (PENDING)
**Next Command**: `/speckit.tasks`
- Generate `tasks.md` with detailed implementation tasks
- Create task structure following atomic design and TDD principles
- Define test cases for each component
- Order tasks by priority (P1 → P2 → P3)

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - No complexity tracking required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

