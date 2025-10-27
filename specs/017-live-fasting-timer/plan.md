# Implementation Plan: Live Fasting Timer

**Branch**: `017-live-fasting-timer` | **Date**: October 27, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-live-fasting-timer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a live fasting timer that automatically displays on the entries page when a user logs their last meal time. The timer shows elapsed fasting duration in real-time (updates every 60 seconds), persists across page refreshes by calculating from the logged timestamp, and automatically stops when the user breaks their fast. Timer is displayed as a dedicated card component at the top of the entries page. Milestone celebrations [12,16,20,24,36,48] hours provide engagement feedback.

**Technical Approach**: Client-side React component using useEffect/useState for timer updates, integrates with existing Entry model (no database changes), calculates elapsed time from lastMealTime field, responsive Tailwind CSS styling.

**Scope Change (Oct 27, 2025)**: Progress bar functionality removed. Simple milestone threshold detection kept. Progress visualization with intelligent goal calculation deferred to future feature (see FEATURE-BACKLOG.md).

## Technical Context

**Language/Version**: JavaScript ES6+ / Next.js 15+ (App Router)
**Primary Dependencies**: React 18, Tailwind CSS, date-fns (or existing date utilities)
**Storage**: MongoDB (existing Entry model - no schema changes required)
**Testing**: Jest + React Testing Library (unit/component), Playwright (E2E)
**Target Platform**: Web (responsive: mobile 320px+ to desktop 1920px+)
**Project Type**: Web application (Next.js App Router with client components)
**Performance Goals**: Timer update <100ms execution, <2s initial render, 60-second update interval
**Constraints**: Client-side only (no server polling), must not cause re-renders of entry list, <30KB bundle size for timer component
**Scale/Scope**: Single feature, ~3 new components, ~4-5 utility functions, estimated 8-10 hours development time (reduced from 12-16 due to scope simplification)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Next.js Best Practices
- **Status**: PASS
- Uses App Router architecture
- Client Component only where necessary (timer needs real-time updates)
- Leverages existing Next.js patterns in entries page
- No additional route creation needed

### ✅ Mobile-First Responsive Design
- **Status**: PASS
- Timer must work 320px to 1920px+ (FR-017)
- Dedicated card component ensures mobile visibility
- Touch-friendly UI (timer is display-only, no complex interactions)
- Tailwind CSS responsive utilities

### ✅ Test-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS - TDD workflow required
- Tests written before implementation
- Unit tests: timer calculation logic, milestone detection, progress calculation
- Component tests: FastingTimer render, state updates, error states
- Integration tests: integration with entries page, entry CRUD triggering timer updates
- E2E tests: full user flows (create entry → timer appears → breaks fast → timer stops)
- Target: 80%+ coverage

### ✅ Component Architecture
- **Status**: PASS
- Atomic design: Timer (organism), TimerDisplay (molecule with inline milestone badges)
- Self-contained components with clear props
- Presentation/container separation (FastingTimerContainer fetches data, FastingTimerDisplay renders)
- JSDoc documentation required
- **Note**: Simplified from original design - removed separate ProgressBar and MilestoneBadge components

### ✅ User Privacy & Data Security
- **Status**: PASS
- No new data collection
- Uses existing authenticated Entry data
- Client-side calculation only (no sensitive data transmission)
- No analytics/tracking

### ✅ Performance & Accessibility
- **Status**: PASS - Requires validation
- Timer updates every 60s (low performance impact)
- Semantic HTML (time element, proper ARIA labels)
- Keyboard navigation N/A (display-only component)
- Screen reader announcements for milestone achievements
- Will verify Lighthouse scores post-implementation

**Gate Result**: ✅ ALL GATES PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```
specs/017-live-fasting-timer/
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
│       └── page.js                           # MODIFY: Add FastingTimer component
├── components/
│   ├── molecules/
│   │   └── TimerDisplay.js                   # NEW: Timer display with inline milestone badges
│   └── organisms/
│       ├── FastingTimer.js                   # NEW: Main timer component (container + display)
│       └── FastingTimerCard.js              # NEW: Card wrapper with styling
├── lib/
│   └── utils/
│       └── fastingTimerUtils.js             # NEW: Timer calculation logic + milestone detection
└── hooks/
    └── useFastingTimer.js                    # NEW: Custom hook for timer state

tests/
├── unit/
│   └── fastingTimerUtils.test.js            # NEW: Timer calc + milestone tests
├── components/
│   ├── FastingTimer.test.js                  # NEW: Component tests
│   └── TimerDisplay.test.js                  # NEW: Display tests
└── e2e/
    └── fasting-timer.spec.js                 # NEW: E2E user flows
```

**Structure Decision**: Web application structure using Next.js App Router. Timer is a client-side feature that integrates into the existing `/entries` page. Components follow atomic design pattern already established in the project. No new API routes needed - timer calculates client-side from existing Entry data fetched by entries page.

## Complexity Tracking

*No constitution violations - this section not needed*

---

## Phase 0: Research ✅ COMPLETE

**Deliverable**: [research.md](./research.md)

**Key Decisions Made**:
1. Timer state management → Custom React hook with useEffect
2. Time calculation → Absolute timestamps (no accumulation)
3. Performance → 60-second updates with React.memo
4. Milestones → Predefined [12, 16, 20, 24, 36, 48] hours (simple threshold detection)
5. Accessibility → Semantic `<time>` element with ARIA live regions
6. Error handling → Graceful degradation with user message
7. Testing → TDD with unit/component/E2E coverage (80%+ target)
8. **Scope Change**: Progress bar removed - deferred to future feature with better goal algorithm

**All NEEDS CLARIFICATION items resolved** ✅

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- [data-model.md](./data-model.md) - Entity relationships and state management
- [contracts/README.md](./contracts/README.md) - No new API contracts needed
- [quickstart.md](./quickstart.md) - Developer onboarding guide
- Agent context updated (CLAUDE.md)

**Key Artifacts**:
1. **Data Model**: 3 client-side entities (Active Fast, Timer State, Milestone) - simplified from original 5
2. **API Contracts**: None needed - client-side only feature
3. **Quickstart**: Complete developer guide with examples and TDD workflow (updated for simplified scope)
4. **Agent Context**: Updated with JavaScript/React 18/Next.js 15/MongoDB stack

**Constitution Re-Check**: ✅ ALL GATES STILL PASS

---

## Phase 2: Task Breakdown

**Status**: ⏭️ NOT STARTED (requires `/speckit.tasks` command)

**Next Step**: Run `/speckit.tasks` to generate atomic task breakdown in `tasks.md`

**Expected Tasks** (preview):
- Write unit tests for fastingTimerUtils
- Implement fastingTimerUtils
- Write unit tests for milestoneUtils
- Implement milestoneUtils
- Write unit tests for progressUtils
- Implement progressUtils
- Write hook tests for useFastingTimer
- Implement useFastingTimer hook
- Write component tests for TimerDisplay
- Implement TimerDisplay component
- Write component tests for MilestoneBadge
- Implement MilestoneBadge component
- Write component tests for ProgressBar
- Implement ProgressBar component
- Write component tests for FastingTimer
- Implement FastingTimer main component
- Write E2E tests for user flows
- Integrate timer into entries page
- Accessibility audit and fixes
- Performance validation
- Code review and merge

---

## Summary

**Feature**: Live Fasting Timer (017)  
**Complexity**: Medium (8-10 hours estimated - reduced from 12-16)  
**Database Changes**: None ✅  
**API Changes**: None ✅  
**New Components**: 3 UI components + 1 utility module + 1 hook (simplified from 7)  
**Tests Required**: Unit (1 file) + Component (2 files) + E2E (1 file) = 4 test files (reduced from 8)  
**Constitution Compliance**: ✅ All gates pass  
**Scope Simplification**: Progress bar removed, milestone threshold detection kept  
**Ready for Implementation**: ✅ Yes - proceed to implementation

---

## References

- **Feature Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/README.md](./contracts/README.md)
- **Quickstart Guide**: [quickstart.md](./quickstart.md)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
- **Branch**: `017-live-fasting-timer`
- **Agent Context**: [../../CLAUDE.md](../../CLAUDE.md)

