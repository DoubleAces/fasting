# Implementation Plan: Fix Entry Click Delay

**Branch**: `019-fix-entry-click-delay` | **Date**: October 28, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-fix-entry-click-delay/spec.md`

**Note**: This plan follows the constitution requirements: Next.js App Router, JavaScript, TailwindCSS, MongoDB, TDD mandatory.

## Summary

Investigate and eliminate 500-1000ms delay when users click entries in the list to navigate to details page. Implementation follows measurement-first approach: (1) instrument click-to-load flow with performance markers measuring client router, server queries, serialization, and rendering phases; (2) generate baseline report identifying actual bottleneck with data; (3) implement targeted optimization for identified bottleneck (likely client-side router.push() or Next.js hydration based on Feature 016 optimizations already complete); (4) create automated performance regression test in Playwright. Technical approach builds on existing performance infrastructure from Feature 016 (database indexes, caching, performanceLogger utility). Target metrics: click-to-navigation <100ms, full page load <300ms (p95).

## Technical Context

**Language/Version**: JavaScript (ES6+), Node.js 18+  
**Primary Dependencies**: Next.js 15+ (App Router), React 18, date-fns, Mongoose ODM  
**Storage**: MongoDB with existing indexes (Feature 016), in-memory cache for settings/insights  
**Testing**: Jest + React Testing Library (unit/component), Playwright (E2E), Performance API (browser)  
**Target Platform**: Web application (desktop + mobile browsers)
**Project Type**: Web application (Next.js single project)  
**Performance Goals**: Click-to-navigation <100ms, full page load <300ms (p95), automated regression test <400ms threshold  
**Constraints**: Must not break existing auth/authorization, must preserve all entry functionality, must work on mobile with touch, must maintain accessibility  
**Scale/Scope**: ~50+ entries in typical user account, measurements with 10 iterations, baseline report generation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### TDD Compliance ✅
- Tests written first for performance measurement utilities
- Baseline report generation tested before implementation
- Performance regression test created and failing before optimization
- Red-Green-Refactor cycle for optimization implementation

### Component Architecture ✅
- No new UI components required (investigation/optimization feature)
- Existing EntryList and EntryDetailsView remain unchanged
- Performance measurement wrapped in utility functions (src/lib/utils/performanceMeasurement.js)

### Performance & Accessibility ✅
- Feature explicitly improves performance (click <100ms, load <300ms targets)
- Maintains existing accessibility (keyboard nav, screen readers)
- No visual UI changes, preserves semantic HTML
- Performance measurements add <5ms overhead (non-blocking)

### Next.js Best Practices ✅
- Uses existing Next.js 15 App Router architecture
- Leverages existing ISR (already configured on entry details page)
- Browser Performance API for client-side measurements
- Server Components performance logger already exists (Feature 016)

### Mobile-First Responsive ✅
- Touch interactions tested (acceptance criteria SC-009)
- Mobile 3G performance tested (acceptance criteria SC-007)
- Maintains existing mobile-responsive design
- No layout changes required

### User Privacy & Security ✅
- Performance metrics do not expose sensitive health data
- Timing measurements designed to avoid timing attacks
- Auth/authorization checks preserved during optimization
- Metrics logged locally, not transmitted externally

**Gate Result**: ✅ PASS - All constitution principles satisfied. No violations or justifications needed.

## Project Structure

### Documentation (this feature)

```
specs/019-fix-entry-click-delay/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (browser APIs, optimization patterns)
├── data-model.md        # Phase 1 output (PerformanceMetric, PerformanceBaseline entities)
├── quickstart.md        # Phase 1 output (measurement + optimization guide)
├── contracts/           # Phase 1 output (performance measurement API)
│   └── performance-measurement-api.md
├── checklists/
│   └── requirements.md  # Quality checklist (already complete)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── api/
│   │   └── entries/
│   │       ├── route.js                    # [NO CHANGE] Existing API
│   │       └── [id]/route.js               # [NO CHANGE] Existing API
│   └── entries/
│       ├── page.js                         # [MODIFY] Add performance markers to list
│       └── [id]/page.js                    # [MODIFY] Add server-side perf logging
├── components/
│   └── organisms/
│       ├── EntryList.js                    # [MODIFY] Replace router.push with Link + prefetch
│       └── EntryDetailsView.js             # [NO CHANGE] Or lazy-load insights if bottleneck
├── lib/
│   ├── utils/
│   │   ├── performanceLogger.js            # [EXISTS] Use existing from Feature 016
│   │   └── performanceMeasurement.js       # [CREATE] Client-side measurement utilities
│   └── services/
│       ├── entryInsightsService.js         # [EXISTS] Already optimized in Feature 016
│       └── settingsService.js              # [EXISTS] Already optimized in Feature 016
└── middleware.js                           # [NO CHANGE] No auth/routing changes

tests/
├── unit/
│   └── lib/
│       └── utils/
│           └── performanceMeasurement.test.js  # [CREATE] Test measurement utilities
├── integration/
│   └── api/
│       └── entries-performance.test.js         # [EXISTS] From Feature 016, verify still passing
└── e2e/
    ├── entry-details-flow.spec.js              # [EXISTS] Existing flow tests
    └── entry-click-performance.spec.js         # [CREATE] Performance regression test

scripts/
└── generate-performance-baseline.js            # [CREATE] Run measurements, output report
```

**Structure Decision**: This is a Next.js web application using the existing structure. The implementation follows the single project pattern established in Feature 001. Changes are minimal and focused on:
1. **Client-side measurement**: New `performanceMeasurement.js` utility using Browser Performance API
2. **EntryList optimization**: Modify to use Next.js Link component with prefetch (likely quick win)
3. **Performance regression test**: New Playwright E2E test to prevent future regressions
4. **Baseline report**: Script to run measurements and document current timings
5. **Leverages existing infrastructure**: Feature 016 already optimized server-side (indexes, caching, aggregation), so this feature focuses on client-side and navigation performance

No new directories required. All changes integrate into existing Next.js App Router structure.

## Complexity Tracking

*No constitutional violations requiring justification.*

This feature maintains architectural simplicity:
- Single project structure (existing Next.js app)
- Builds on Feature 016 performance infrastructure (no reinvention)
- Minimal code changes (performance measurement + optimization)
- Uses standard browser APIs (Performance API, PerformanceObserver)
- TDD approach with clear test boundaries (unit → integration → E2E)
- No new external dependencies required (all tools already in stack)

