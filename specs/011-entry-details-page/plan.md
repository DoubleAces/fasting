# Implementation Plan: Entry Details Page

**Branch**: `011-entry-details-page` | **Date**: October 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-entry-details-page/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a dedicated entry details page accessible via `/entries/[id]` that displays comprehensive information about a single fasting entry. The page shows complete entry data (duration, timeline, meals, health metrics, timestamps) with a 24-hour circular clock visualization for the fasting period. It provides personalized insights by comparing the entry to historical patterns (longest fast, rankings, averages, streak contribution, "best day" badges). The page includes contextual actions (edit, delete with confirmation, copy to today) and handles all edge cases gracefully. The implementation leverages Next.js App Router with Server Components for data fetching, Client Components for interactive elements, and follows existing patterns for authentication, data validation, and PWA offline support.

## Technical Context

**Language/Version**: JavaScript ES6+ with Next.js 15.5.6 (App Router)  
**Primary Dependencies**: 
- Next.js 15.5.6 (React 19.1.0, App Router, Server/Client Components)
- MongoDB 5.5 + Mongoose 8.19.1 (ODM)
- NextAuth.js 5.0.0-beta.29 (Authentication)
- Tailwind CSS 4.1.14 (Styling)
- date-fns 4.1.0 (Date manipulation)
- Joi 18.0.1 (Validation)
- @ducanh2912/next-pwa 10.2.9 (PWA support)
- Jest 30.2.0 + React Testing Library 16.3.0 (Unit/Component testing)
- Playwright 1.56.1 (E2E testing)

**Storage**: MongoDB with Mongoose schemas (Entry, User, Settings collections)  
**Testing**: Jest for unit/component tests, Playwright for E2E, TDD workflow mandatory  
**Target Platform**: Web (desktop + mobile responsive), PWA-capable  
**Project Type**: Web application (Next.js App Router, single repo with src/ structure)  
**Performance Goals**: 
- Page load <2s (SC-001)
- LCP <2.5s, FID <100ms, CLS <0.1 (Constitution - Core Web Vitals)
- Insights calculation <500ms for 90-day dataset
- 90-day offline caching support (clarification answer)

**Constraints**: 
- Mobile-first responsive design (Constitution II)
- WCAG 2.1 Level AA compliance (Constitution VI)
- Lighthouse scores: Performance >90, Accessibility 100
- Touch-friendly UI (minimum 44x44px targets)
- Offline-capable for cached entries (90 days)
- Authorization required for all entry access
- View-only details page (edit navigates to separate form)

**Scale/Scope**: 
- Single entry detail view
- Up to 90 days of cached entries per user
- Calculate insights from 30-day window (up to ~30 entries)
- Support extended fasts >24 hours
- Handle food notes up to 2000 characters
- 5 new components + 1 utility module + API route enhancement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Before Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Next.js Best Practices** | ✅ PASS | Using App Router, Server Components for data fetching, Client Components for interactivity (circular clock, action buttons) |
| **II. Mobile-First Responsive** | ✅ PASS | Mobile-first design required (FR-030), touch-friendly controls, stacked layout on small screens |
| **III. Test-Driven Development** | ✅ PASS | TDD workflow: write tests for insights calculations, component rendering, API route, then implement |
| **IV. Component Architecture** | ✅ PASS | Atomic design: atoms (Badge, TimeDisplay), molecules (FastingTimeline, InsightCard), organisms (EntryDetailsView) |
| **V. User Privacy & Security** | ✅ PASS | Authorization check required (FR-025), sensitive health data protection, no unauthorized access (SC-007) |
| **VI. Performance & Accessibility** | ✅ PASS | <2s load time (SC-001), WCAG 2.1 AA, semantic HTML, keyboard nav for actions, screen reader support |

**Result**: ✅ **All gates pass** - Proceed to Phase 0

### Post-Design Check (After Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Next.js Best Practices** | ✅ PASS | Server Component for page (data fetching), Client Components for timeline/actions, proper caching strategy (NetworkFirst), follows App Router conventions |
| **II. Mobile-First Responsive** | ✅ PASS | Research confirms mobile-first Tailwind utilities, responsive breakpoints, touch targets 44x44px minimum, tested on mobile devices |
| **III. Test-Driven Development** | ✅ PASS | Test files defined for all components, TDD workflow in quickstart.md, 4-layer testing (unit/component/integration/E2E), 80% coverage target |
| **IV. Component Architecture** | ✅ PASS | Atomic design enforced: 2 atoms (Badge, TimeDisplay), 3 molecules (FastingTimeline, InsightCard, EntryMetadata), 3 organisms (EntryDetailsView, EntryInsights, EntryActions), all independently testable |
| **V. User Privacy & Security** | ✅ PASS | Authorization via NextAuth + Server Component (research decision #4), ownership validation in API, CSRF protection, no unauthorized data exposure, sensitive health data protected |
| **VI. Performance & Accessibility** | ✅ PASS | Server-side insights calculation (research decision #2), MongoDB indexing, CDN edge caching, Redis for insights cache, SVG circular clock (accessible, performant), semantic HTML, keyboard nav, screen reader support, WCAG 2.1 AA compliance |

**Result**: ✅ **All gates pass** - Design approved for implementation

**Changes from Pre-Design Check**: Added implementation details confirming all principles satisfied. Research decisions (#1 SVG clock, #2 server-side insights, #4 authorization, #5 error handling, #6 responsive) and data model (entities, flow, validation) validate Constitution compliance.

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
│   └── entries/
│       ├── [id]/
│       │   ├── page.js                    # NEW: Entry details page (Server Component)
│       │   └── loading.js                 # NEW: Loading state
│       └── page.js                         # MODIFY: Add clickable links to entries
├── components/
│   ├── atoms/
│   │   ├── Badge.js                       # NEW: For "best day" and other badges
│   │   └── TimeDisplay.js                 # NEW: Format time with user preferences
│   ├── molecules/
│   │   ├── FastingTimeline.js             # NEW: 24-hour circular clock visualization
│   │   ├── InsightCard.js                 # NEW: Display individual insight
│   │   └── EntryMetadata.js               # NEW: Show created/updated timestamps
│   └── organisms/
│       ├── EntryDetailsView.js            # NEW: Main entry details container
│       ├── EntryInsights.js               # NEW: Insights section container
│       └── EntryActions.js                # NEW: Action buttons (edit, delete, copy)
├── lib/
│   ├── services/
│   │   └── entryInsightsService.js        # NEW: Calculate insights from historical data
│   ├── utils/
│   │   ├── timeFormatters.js              # EXISTING: Reuse for time display
│   │   └── dateUtils.js                   # EXISTING: Reuse for date calculations
│   └── models/
│       └── Entry.js                        # EXISTING: No changes needed
└── hooks/
    └── useEntryInsights.js                # NEW: Client-side hook for insights (if needed)

tests/
├── unit/
│   ├── services/
│   │   └── entryInsightsService.test.js   # NEW: Test insights calculations
│   └── components/
│       ├── FastingTimeline.test.js        # NEW: Test circular clock rendering
│       ├── EntryInsights.test.js          # NEW: Test insights display
│       └── EntryActions.test.js           # NEW: Test action buttons
├── integration/
│   └── entry-details.test.js              # NEW: Test full page integration
└── e2e/
    └── entry-details-flow.spec.js         # NEW: Test user journeys P1-P3

```

**Structure Decision**: Using Next.js App Router structure (existing pattern). Entry details page follows `/entries/[id]` dynamic route convention. Components organized by atomic design principles (atoms for basic elements, molecules for composed units, organisms for complex sections). Services layer for business logic (insights calculations) keeps components focused on presentation. Testing structure mirrors source organization for discoverability.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All constitution principles satisfied. No complexity justification needed.

