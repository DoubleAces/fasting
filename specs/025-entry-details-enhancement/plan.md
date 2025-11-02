# Implementation Plan: Entry Details Page Enhancement

**Branch**: `025-entry-details-enhancement` | **Date**: October 31, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-entry-details-enhancement/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enhance the entry details page (`/entries/[id]`) to display comprehensive fasting information with personalized insights and contextual analysis, styled with the modern glassmorphic design system (purple-pink-indigo gradients, backdrop-blur, rounded corners) recently implemented in Feature 024. The enhancement includes: (1) applying consistent glassmorphic styling to all data cards and UI elements, (2) calculating and displaying personalized insights comparing the entry to user's historical patterns (ranking, weekend/weekday patterns, deviations, streaks), (3) showing comparison statistics against personal averages (all-time, 30-day, day-of-week), (4) providing timeline navigation to previous/next entries, and (5) styling action buttons (Edit, Delete, Back) with gradient aesthetics. The implementation leverages existing infrastructure (entryInsightsService, serverCacheService, ISR) and enhances the current EntryDetailsView component while maintaining <2s page load times and 90% cache hit rates.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 15.5.6 with App Router  
**Primary Dependencies**: React 18, Tailwind CSS 3.4, Mongoose 8.x, NextAuth.js, date-fns  
**Storage**: MongoDB with existing Entry collection (no schema changes required)  
**Testing**: Jest + React Testing Library for components, Playwright for E2E flows  
**Target Platform**: Web (responsive mobile-first, desktop-optimized)  
**Project Type**: Web application (Next.js App Router with Server Components)  
**Performance Goals**: <2s page load on 4G, <500ms insight calculations, 90% cache hit rate  
**Constraints**: WCAG 2.1 AA accessibility, 44px touch targets, ISR with 5-min revalidation  
**Scale/Scope**: Single page enhancement, 5 user stories, leverages existing components/services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices ✅
- **App Router**: Using Server Components for page.js with data fetching
- **Server/Client Split**: Server Components for data/insights, Client Components for interactive elements (buttons, modals)
- **Built-in Optimizations**: Leveraging ISR (5-min revalidation), generateStaticParams for pre-rendering
- **Data Fetching**: Server-side with caching (30-min insights cache, ISR page cache)
- **Routing**: File-based routing with dynamic `/entries/[id]/page.js`

### II. Mobile-First Responsive Design ✅
- **Mobile-first**: Glassmorphic design tested on mobile viewports first
- **Responsive**: Tailwind breakpoints (md:, lg:) for desktop enhancements
- **Touch targets**: 44x44px minimum (FR-052) for all interactive buttons
- **Progressive enhancement**: Works without JavaScript for static content, enhances with client interactivity
- **Tested**: Visual testing across mobile/tablet/desktop viewports

### III. Test-Driven Development (TDD) ✅
- **TDD Mandatory**: Tests written first, must fail, then implement (enforced in Phase 2 tasks)
- **Coverage Types**: Unit tests (insight calculations, utilities), Integration tests (page rendering, data fetching), E2E tests (navigation flows, edit/delete actions)
- **80% Coverage**: Required minimum enforced via Jest configuration
- **Red-Green-Refactor**: All 5 user stories will follow TDD cycle in task breakdown

### IV. Component Architecture ✅
- **Reusable Components**: Leveraging existing atoms (GradientButton, GlassmorphicCard patterns from Feature 024)
- **Atomic Design**: Enhancing EntryDetailsView organism, using existing FormattedDate/Time atoms
- **Self-contained**: Each insight section independently testable
- **Props Validation**: JSDoc comments for component APIs
- **Separation**: Server Components (data fetching) vs Client Components (modals, interactive buttons)

### V. User Privacy & Data Security ✅
- **Authentication**: Auth check before page render (FR-059)
- **Authorization**: User ownership verification (FR-060, FR-062)
- **Data Filtering**: Insights only use authenticated user's data (FR-023, userId filter)
- **Input Validation**: ObjectId format validation (FR-063)
- **No Tracking**: No analytics added; insights computed from user's own data only

### VI. Performance & Accessibility ✅
- **Performance**: <2s page load (FR-053), <500ms insights (SC-008), 90% cache hit (SC-002)
- **Core Web Vitals**: ISR + caching strategy targets LCP <2.5s, CLS <0.1 (SC-012)
- **WCAG 2.1 AA**: Contrast ratios enforced (FR-010, SC-004), semantic HTML
- **Keyboard Navigation**: All buttons accessible via keyboard
- **Screen Readers**: Proper ARIA labels for insights, action buttons

**GATE STATUS**: ✅ **PASS** - All constitution principles satisfied

**Justification for any violations**: None - this enhancement aligns fully with established patterns and existing infrastructure.

## Project Structure

### Documentation (this feature)

```
specs/025-entry-details-enhancement/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (design decisions, patterns)
├── data-model.md        # Phase 1 output (entities, no schema changes)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output (component APIs, prop interfaces)
│   └── components.md    # Component prop contracts and APIs
├── checklists/
│   └── requirements.md  # Spec validation (completed ✅)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (existing structure - modifications highlighted)

```
src/
├── app/
│   └── entries/
│       └── [id]/
│           └── page.js                    # ✏️ ENHANCE: Add glassmorphic styling, enhance layout
├── components/
│   ├── atoms/                             # Existing - reuse gradient buttons, text styles
│   ├── molecules/                         # Existing - may add InsightCalloutBox
│   └── organisms/
│       └── EntryDetailsView.js            # ✏️ ENHANCE: Add insights, comparisons, timeline sections
├── lib/
│   ├── services/
│   │   ├── entryInsightsService.js        # ✔️ EXISTS: Reuse for insights calculations
│   │   ├── settingsService.js             # ✔️ EXISTS: Reuse for user preferences
│   │   └── serverCacheService.js          # ✔️ EXISTS: Reuse for caching
│   ├── models/
│   │   └── Entry.js                       # ✔️ NO CHANGES: Use existing schema
│   └── utils/
│       ├── formatters.js                  # ✔️ EXISTS: Date/time formatting
│       └── performanceLogger.js           # ✔️ EXISTS: Performance metrics
└── styles/                                # Tailwind - no changes needed

tests/
├── unit/
│   └── components/
│       └── organisms/
│           └── EntryDetailsView.test.js   # ✏️ NEW: Component tests
├── integration/
│   └── app/
│       └── entries/
│           └── [id]/
│               └── page.test.js           # ✏️ NEW: Page rendering tests
└── e2e/
    └── entry-details.spec.js              # ✏️ NEW: E2E navigation and action tests
```

**Structure Decision**: **Web Application (Next.js App Router)**

This is a page enhancement within the existing Next.js application structure. The implementation modifies:

1. **Page Component** (`src/app/entries/[id]/page.js`): Enhanced with glassmorphic styling container
2. **EntryDetailsView Organism** (`src/components/organisms/EntryDetailsView.js`): Major enhancements to add insights, comparisons, timeline sections
3. **Potential New Molecules**: InsightCalloutBox, ComparisonCard, TimelineNav (if abstracted from EntryDetailsView)
4. **Test Files**: New test suites for enhanced components and E2E flows

The feature leverages extensive existing infrastructure with no database schema changes, making this a pure frontend enhancement with backend service reuse.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - Constitution check passed with full compliance. No complexity justification required.

---

## Phase 0: Research & Investigation

**Status**: ✅ COMPLETE

**Output**: `research.md`

### Research Areas Investigated

1. **Glassmorphic Design Implementation Patterns**
   - How to apply backdrop-filter and gradient backgrounds consistently
   - Tailwind CSS utility composition for glassmorphic effects
   - Accessibility considerations for translucent backgrounds

2. **Insight Calculation Optimization**
   - Review existing entryInsightsService aggregation pipeline structure
   - Caching strategies for computed insights (30-min TTL validation)
   - Pattern detection algorithms (weekend/weekday, deviations, streaks)

3. **Component Enhancement vs Replacement Strategy**
   - When to enhance existing EntryDetailsView vs create new components
   - Molecule extraction patterns (InsightCalloutBox, ComparisonCard)
   - Server Component vs Client Component boundaries

4. **Performance Optimization Techniques**
   - ISR configuration best practices for dynamic pages
   - generateStaticParams for pre-rendering most viewed entries
   - Cache invalidation strategies when entries are updated

5. **Timeline Navigation Patterns**
   - Previous/next entry query optimization
   - Edge case handling (first/last entry, date gaps)
   - Pagination vs direct navigation tradeoffs

### Key Decisions Documented

All technical decisions, rationale, and rejected alternatives are documented in `research.md`.

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE

**Output**: `data-model.md`, `contracts/components.md`, `quickstart.md`

### Design Artifacts

1. **data-model.md**: Entity definitions (no schema changes - uses existing Entry model)
2. **contracts/components.md**: Component prop interfaces and API contracts
3. **quickstart.md**: Implementation guide with TDD workflow

### Agent Context Update

**Status**: ✅ COMPLETE

Agent context updated with:
- Feature 025 design patterns (glassmorphic styling, insight calculations)
- Component architecture decisions
- Performance optimization strategies

---

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design completion*

### I. Next.js Best Practices ✅
- Confirmed: Server Components for data, Client Components for interactivity
- ISR configuration validated against performance requirements
- Component splitting strategy aligns with Next.js patterns

### II. Mobile-First Responsive Design ✅
- Glassmorphic design tested with mobile viewports
- Touch target sizes confirmed (44x44px minimum)
- Responsive breakpoints documented in quickstart

### III. Test-Driven Development ✅
- Test structure planned in quickstart.md
- TDD workflow detailed for each user story
- 80% coverage target maintained

### IV. Component Architecture ✅
- Component hierarchy documented in contracts
- Atomic design principles maintained
- Reusability confirmed with existing design system

### V. User Privacy & Data Security ✅
- No new data collection
- Authorization patterns reused from existing page
- Insights computed from user's own data only

### VI. Performance & Accessibility ✅
- Performance budgets confirmed achievable
- WCAG 2.1 AA compliance verified with contrast tools
- Semantic HTML structure documented

**POST-DESIGN GATE STATUS**: ✅ **PASS** - All constitution principles maintained through design phase

---

## Next Steps

**Command to run**: `/speckit.tasks`

**Purpose**: Generate `tasks.md` with TDD task breakdown for Feature 025.

**Expected Output**:
- Phase-based task structure (Setup, US1-US5: Styling, Insights, Comparisons, Timeline, Actions)
- TDD workflow for each task (test file → implementation file → validation)
- Acceptance criteria per task
- Estimated time per task

---

**Planning Phase Status**: ✅ **COMPLETE**

**Phase 0**: ✅ research.md created  
**Phase 1**: ✅ data-model.md, contracts/, quickstart.md created  
**Phase 2**: ⏳ Ready for `/speckit.tasks` command

**Branch**: `025-entry-details-enhancement`  
**Feature Number**: 025  
**Spec Path**: `C:\Code projects\fasting\specs\025-entry-details-enhancement\spec.md`  
**Plan Path**: `C:\Code projects\fasting\specs\025-entry-details-enhancement\plan.md`

