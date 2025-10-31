# Implementation Plan: User Dashboard

**Branch**: `024-user-dashboard` | **Date**: 2025-10-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-user-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a personalized user dashboard at `/dashboard` that serves as the main hub for authenticated users. The dashboard displays current fast status (active timer counting up or "Start New Fast" CTA), key statistics (current streak counting consecutive days, total fasts count, average duration from 7+ entries), recent fasting history (5 most recent entries with clickable links), progress visualization (Recharts line chart for 30-day trends), and quick action buttons (Create Entry, View All, Settings). The dashboard reuses existing components (FastingTimerCard, GlassmorphicCard, GradientButton from Feature 023) and integrates with existing Entry model, entryInsightsService, and fastingTimerUtils. Middleware redirects authenticated users from `/` to `/dashboard`. Design matches Feature 023 glassmorphic system with purple-pink-indigo gradients, blur orbs, and skeleton loading states for optimal perceived performance.

## Technical Context

**Language/Version**: JavaScript (ES6+) with Next.js 15.5.6 and React 18  
**Primary Dependencies**: Next.js (App Router), NextAuth v5, Mongoose (MongoDB ODM), Recharts 2.12.7, Tailwind CSS, date-fns  
**Storage**: MongoDB (existing Entry collection, no schema changes required)  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Web (responsive design 375px-1440px+), Server-side rendering with Next.js App Router
**Project Type**: Web application (Next.js App Router with Server/Client Components)  
**Performance Goals**: Dashboard load <2s (up to 100 entries), timer updates every 1s with no lag, chart renders 30 days in <1s  
**Constraints**: Must match Feature 023 design system, reuse existing components/utilities, WCAG 2.1 AA compliance, mobile-first responsive  
**Scale/Scope**: Single dashboard page (/dashboard), 5-6 new components, integrates with existing Entry model (no schema changes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices ✅
- ✅ Uses Next.js 15.5.6 App Router architecture
- ✅ Dashboard page as Server Component (`src/app/dashboard/page.js`)
- ✅ Client Components only for interactive elements (timer, charts, stats)
- ✅ Leverages existing Next.js Image optimization
- ✅ Follows file-based routing conventions

### II. Mobile-First Responsive Design ✅
- ✅ Spec explicitly defines mobile-first (375px) to desktop (1440px+) responsive design
- ✅ Touch targets minimum 44x44px specified (FR-038)
- ✅ Cards stack vertically on mobile, horizontally on desktop
- ✅ All breakpoints defined: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px+ (desktop)

### III. Test-Driven Development (NON-NEGOTIABLE) ✅
- ✅ TDD workflow enforced: Write tests → Fail → Implement → Pass
- ✅ 15 measurable success criteria defined (SC-001 to SC-015)
- ✅ Unit tests required for streak calculation, stats aggregation
- ✅ Integration tests for API fetches, data transformation
- ✅ Component tests for all interactive elements (timer, chart, buttons)
- ✅ E2E tests for user scenarios (US1-US6)
- ✅ Target: 80%+ code coverage (constitution minimum)

### IV. Component Architecture ✅
- ✅ Reuses existing components: GlassmorphicCard, GradientButton, FastingTimerCard
- ✅ New components follow atomic design: DashboardStats (organism), QuickActions (organism), DashboardChart (organism)
- ✅ All components self-contained and independently testable
- ✅ Props validation via JSDoc comments
- ✅ Separation of Server Components (data fetching) and Client Components (interactivity)

### V. User Privacy & Data Security ✅
- ✅ All API calls require authentication (NextAuth session)
- ✅ Data isolation enforced (userId filtering in all queries - FR-050)
- ✅ No new sensitive data collection (uses existing Entry model)
- ✅ Follows existing security patterns from codebase

### VI. Performance & Accessibility ✅
- ✅ Performance targets: <2s load (FR-053), <1s chart render (SC-010), 1s timer updates (SC-003)
- ✅ WCAG 2.1 AA compliance required (SC-015)
- ✅ Keyboard navigation support (SC-015)
- ✅ Screen reader support (SC-015)
- ✅ Semantic HTML with proper ARIA labels
- ✅ Skeleton loading states for perceived performance (FR-057)

**GATE STATUS**: ✅ **PASSED** - All constitution principles satisfied. No violations requiring justification.

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
│   ├── dashboard/
│   │   └── page.js                    # [NEW] Server Component - main dashboard page
│   └── (existing routes)
├── components/
│   ├── atoms/
│   │   ├── GlassmorphicCard.js        # [EXISTING] Reused from Feature 023
│   │   └── GradientButton.js          # [EXISTING] Reused from Feature 023
│   ├── molecules/
│   │   ├── StatCard.js                # [NEW] Single stat card (streak/total/average)
│   │   ├── RecentEntryItem.js         # [NEW] Single recent entry row
│   │   └── SkeletonCard.js            # [NEW] Loading skeleton for cards
│   └── organisms/
│       ├── FastingTimerCard.js        # [EXISTING] Reused from Feature 017
│       ├── DashboardStats.js          # [NEW] Client Component - 3 stat cards
│       ├── RecentFastsList.js         # [NEW] Client Component - 5 recent entries
│       ├── DashboardChart.js          # [NEW] Client Component - Recharts line chart
│       └── QuickActions.js            # [NEW] Client Component - action buttons
├── lib/
│   ├── services/
│   │   ├── dashboardService.js        # [NEW] Streak calculation logic
│   │   └── entryInsightsService.js    # [EXISTING] Reused - getAverageDuration()
│   └── utils/
│       └── fastingTimerUtils.js       # [EXISTING] Reused - timer functions
├── middleware.js                       # [MODIFIED] Add redirect: / → /dashboard for authenticated users, preserve /admin routes
└── (existing files)

tests/
├── unit/
│   ├── lib/
│   │   └── services/
│   │       └── dashboardService.test.js   # [NEW] Streak calculation tests
│   └── components/
│       ├── molecules/
│       │   └── StatCard.test.js           # [NEW] Stat card component tests
│       └── organisms/
│           ├── DashboardStats.test.js     # [NEW] Stats section tests
│           ├── RecentFastsList.test.js    # [NEW] Recent history tests
│           ├── DashboardChart.test.js     # [NEW] Chart component tests
│           └── QuickActions.test.js       # [NEW] Quick actions tests
├── integration/
│   └── app/
│       └── dashboard/
│           └── page.test.js               # [NEW] Dashboard page integration tests
└── e2e/
    └── dashboard.spec.js                  # [NEW] E2E tests for 6 user stories

specs/024-user-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (API contracts if needed)
```

**Structure Decision**: Next.js App Router web application structure. Dashboard implemented as Server Component at `src/app/dashboard/page.js` for initial data load, with Client Components for interactive elements (timer, chart, stats). Follows existing project conventions with atomic design component organization. No backend/frontend split needed - monolithic Next.js app. Reuses 5 existing components/utilities, creates 10 new components.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations requiring justification.** All constitution gates passed cleanly.

---

## Implementation Notes

### Admin Area Route Migration

**Context**: The admin section currently uses `/dashboard` route, which conflicts with this feature's user dashboard.

**Solution**: Task 1 of implementation will migrate admin from `/dashboard` to `/admin`. See **`ADMIN-MIGRATION-PLAN.md`** for detailed steps.

**Impact**:
- ✅ Low risk - straightforward route rename
- ⚠️ Admin users must update bookmarks
- ✅ No database changes required
- ✅ All functionality remains identical
- ✅ Estimated time: 30-45 minutes

**Note**: This migration will be the first task in the implementation plan generated by `/speckit.tasks`.

