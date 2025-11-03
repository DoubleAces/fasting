# Implementation Plan: Biological Fasting Stages Timeline

**Branch**: `026-biological-fasting-stages` | **Date**: November 2, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/026-biological-fasting-stages/spec.md`

**Note**: This plan follows the constitution requirements: Next.js App Router, JavaScript ES6+, TailwindCSS, TDD mandatory, mobile-first responsive design.

## Summary

Enhance the existing fasting timer into an educational tool by adding a vertical timeline showing biological fasting stages (0-72+ hours). Each stage displays hour milestones and scientifically accurate descriptions of biological processes (ketosis, autophagy, glycogen depletion, etc.). The timeline highlights the current stage with darker styling, shows completed stages in lighter colors above, and upcoming stages in lighter colors below. Includes a progress indicator within the current stage and auto-scrolls to current position. Integrates seamlessly with existing FastingTimer component from Feature 017, maintaining the glassmorphic design system from Feature 025.

**Key Technical Approach**:
- Create new BiologicalStagesTimeline component as child of existing FastingTimer
- Define 8 fasting stages as static configuration (no database storage)
- Reuse useFastingTimer hook for elapsed time calculations
- Calculate current stage index and progress percentage client-side
- Use CSS scroll-behavior and React useRef for auto-positioning
- Preserve existing numeric timer display alongside timeline
- Zero API changes, zero schema changes

## Technical Context

**Language/Version**: JavaScript (ES6+) with React 19.1.0, Next.js 15.5.6 (App Router)  
**Primary Dependencies**: 
- Next.js 15.5.6 (React framework with App Router - existing)
- React 19.1.0 (existing)
- Tailwind CSS 4.1.14 (styling with glassmorphic utilities - existing)
- date-fns 4.1.0 (date manipulation - existing)
- lucide-react (icons if needed for stage markers - existing)

**Storage**: N/A (no database changes - stage definitions as static configuration in code)  
**Testing**: Jest 30.2.0 + React Testing Library 16.3.0 (unit/component), Playwright 1.56.1 (E2E)  
**Target Platform**: Web (responsive: 320px mobile to 1024px+ desktop), PWA-capable  
**Project Type**: Web application (Next.js App Router with client-side timeline component)  
**Performance Goals**: 
- Timeline render <500ms on initial load (SC-009)
- Stage updates every 60 seconds (matches existing timer - SC-004)
- Progress calculation accuracy within 1% (SC-006)
- Zero impact on existing timer performance
- Smooth scrolling without jank (60fps)

**Constraints**: 
- Mobile-first responsive design (Constitution II, FR-013)
- WCAG 2.1 Level AA compliance (Constitution VI)
- Touch-friendly scroll on mobile (Constitution II)
- Glassmorphic design consistency (FR-012)
- 80% test coverage minimum (Constitution III)
- Zero breaking changes to existing timer
- No new API routes or database queries

**Scale/Scope**: 
- 8 biological stages (0-4hr, 4-8hr, 8-12hr, 12-16hr, 16-24hr, 24-48hr, 48-72hr, 72+hr)
- 1 new component (BiologicalStagesTimeline)
- 1 new utility module (fastingStages.js configuration)
- 1 modified component (FastingTimer integration)
- Estimated 15-20 unit tests, 5-8 component tests, 3-5 E2E scenarios

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices ✅
- **App Router**: Component will be client-side ('use client') integrated into existing App Router structure
- **Server Components**: Parent FastingTimer component remains server-renderable, timeline is client boundary
- **File-based routing**: No new routes - integrates into existing timer pages
- **Performance**: Leverages existing timer optimization, adds memoization for stage calculations

### II. Mobile-First Responsive Design ✅
- **Mobile-first**: Timeline designed for 320px mobile viewport first, scales to desktop
- **Touch-friendly**: Scrollable timeline with touch gestures, minimum 44px tap targets for future interactions
- **Progressive enhancement**: Core timer functionality preserved, timeline enhances with biological context
- **Responsive testing**: Component tests at multiple breakpoints (320px, 768px, 1024px)

### III. Test-Driven Development (NON-NEGOTIABLE) ✅
- **TDD workflow**: Tests written first for stage calculations, boundary detection, progress tracking
- **Red-Green-Refactor**: Unit tests → Component tests → E2E scenarios → Implementation
- **Coverage targets**: 
  - Unit tests: Stage calculation logic, boundary conditions (8 stages × 3-4 tests each = 24-32 tests)
  - Component tests: Timeline rendering, current stage highlighting, scroll behavior (8-12 tests)
  - E2E tests: Full user journeys at different elapsed times (5 scenarios from spec)
- **Minimum 80% coverage**: Stage logic and rendering covered comprehensively

### IV. Component Architecture ✅
- **Atomic design**: BiologicalStagesTimeline (organism), StageCard (molecule), StageProgressBar (atom)
- **Reusability**: Stage configuration externalized to constants/fastingStages.js
- **Self-contained**: Timeline component owns stage state calculation, receives only elapsed time as prop
- **Props validation**: JSDoc comments for all component props (elapsedMs, currentStageIndex, stages)
- **Documentation**: Component usage examples in quickstart.md

### V. User Privacy & Data Security ✅
- **No new data collection**: Feature uses existing timer data (lastMealTime, elapsed time)
- **Client-side only**: All stage calculations happen in browser, no new API calls
- **No tracking**: Stage progress not logged or transmitted to server
- **Educational content**: Stage descriptions are informational, not medical advice (noted in Out of Scope)

### VI. Performance & Accessibility ✅
- **Performance**: 
  - Target <500ms timeline render (SC-009)
  - Memoized stage calculations (useMemo) to prevent re-renders
  - Lazy scroll positioning (useEffect with cleanup)
  - No impact on existing Lighthouse scores (>90 Performance, 100 Accessibility)
- **Accessibility**:
  - Semantic HTML: `<ol>` for timeline stages, `<progress>` for stage progress
  - ARIA labels: `aria-current="true"` for current stage, `aria-label` for progress
  - Keyboard navigation: Scrollable with arrow keys, screen reader announcements
  - Color contrast: Meets WCAG AA for all text (4.5:1 minimum)
  - Reduced motion: Respects prefers-reduced-motion for scroll animations

**GATE STATUS**: ✅ **PASS** - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```
specs/026-biological-fasting-stages/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Biological stages research and design decisions
├── data-model.md        # Phase 1: Entity definitions (FastingStage, TimelineState)
├── quickstart.md        # Phase 1: Quick start implementation guide
├── contracts/           # Phase 1: N/A (no API contracts - client-side only)
├── checklists/
│   └── requirements.md  # Specification validation (completed)
└── tasks.md             # Phase 2: Generated by /speckit.tasks (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.js                           # MODIFY: Uses FastingTimer (already integrated)
│   │   └── DashboardTimerSection.js          # MODIFY: Wraps FastingTimer with context
│   └── entries/
│       └── page.js                            # MODIFY: Uses FastingTimer (already integrated)
├── components/
│   ├── atoms/
│   │   └── StageProgressBar.js               # NEW: Progress bar within current stage
│   ├── molecules/
│   │   ├── TimerDisplay.js                    # EXISTING: Numeric time display (unchanged)
│   │   ├── StageCard.js                       # NEW: Individual stage card (hour range + description)
│   │   └── GoalProgressDisplay.js             # EXISTING: Goal progress (unchanged)
│   └── organisms/
│       ├── FastingTimer.js                    # MODIFY: Integrate BiologicalStagesTimeline
│       ├── FastingTimerCard.js                # EXISTING: Card wrapper (unchanged)
│       └── BiologicalStagesTimeline.js        # NEW: Main timeline component (scrollable list)
├── hooks/
│   ├── useFastingTimer.js                     # EXISTING: Reused for elapsed time (unchanged)
│   └── useStageCalculation.js                 # NEW: Calculate current stage + progress
├── lib/
│   ├── constants/
│   │   └── fastingStages.js                   # NEW: 8 stage definitions (static config)
│   └── utils/
│       ├── fastingTimerUtils.js               # EXISTING: Timer calculations (unchanged)
│       └── stageUtils.js                      # NEW: Stage boundary logic, progress calculation
└── styles/
    └── globals.css                            # EXISTING: May add timeline-specific utilities

tests/
├── unit/
│   ├── lib/
│   │   ├── constants/
│   │   │   └── fastingStages.test.js          # NEW: Validate stage configuration
│   │   └── utils/
│   │       └── stageUtils.test.js             # NEW: Stage calculation logic tests
│   └── hooks/
│       └── useStageCalculation.test.js        # NEW: Hook tests
├── components/
│   ├── atoms/
│   │   └── StageProgressBar.test.js           # NEW: Progress bar rendering tests
│   ├── molecules/
│   │   └── StageCard.test.js                  # NEW: Stage card rendering tests
│   └── organisms/
│       ├── BiologicalStagesTimeline.test.js   # NEW: Timeline rendering + scroll tests
│       └── FastingTimer.test.js               # MODIFY: Add timeline integration tests
└── e2e/
    └── biological-stages-timeline.spec.js     # NEW: Full user journey tests (5 scenarios)
```

**Structure Decision**: Next.js App Router web application (existing). Timeline is a client-side component that integrates into the existing FastingTimer organism. No backend changes required - all stage logic is client-side. Component follows existing atomic design patterns (atoms → molecules → organisms). Stage definitions are static configuration (no database), making this a pure frontend enhancement.

## Complexity Tracking

*No constitution violations - this section intentionally left empty.*

All complexity justified and within constitutional bounds:
- ✅ Single new organism component (BiologicalStagesTimeline) follows existing patterns
- ✅ Reuses existing hooks and utilities (useFastingTimer, fastingTimerUtils)
- ✅ Static stage configuration prevents database complexity
- ✅ Client-side calculations keep backend simple
- ✅ Follows YAGNI principle - no over-engineering

