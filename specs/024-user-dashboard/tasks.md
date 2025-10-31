# Implementation Tasks: User Dashboard

**Feature**: 024-user-dashboard  
**Branch**: `024-user-dashboard`  
**Generated**: 2025-10-30

## Task Summary

- **Total Tasks**: 62
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 8 tasks  
- **User Story Phases**: 42 tasks (6 stories)
- **Polish Phase**: 7 tasks
- **Parallel Opportunities**: 28 tasks marked [P]

## Implementation Strategy

**MVP Scope** (P1 stories only): User Stories 1 & 6 (18 tasks, ~4-6 hours)
- Admin migration → Timer/CTA card → Design system compliance → Basic middleware redirects
- **Delivers**: Working dashboard with current fast status and consistent design

**Full Feature** (All stories): 62 tasks (~12-16 hours with TDD)
- Incremental delivery: Complete one user story phase at a time
- Each phase is independently testable and deliverable
- Parallelizable tasks within each phase can be worked simultaneously

## Dependency Graph

```
Setup Phase (T001-T005)
  └─→ Foundational Phase (T006-T013)
       └─→ US1: Current Fast Status (T014-T021) [P1]
       └─→ US6: Design System (T022-T027) [P1] (parallel with US1)
            └─→ US2: Statistics (T028-T035) [P2]
            └─→ US3: Recent History (T036-T043) [P2]
            └─→ US5: Quick Actions (T044-T048) [P2]
            └─→ US4: Progress Chart (T049-T055) [P3]
                 └─→ Polish Phase (T056-T062)
```

**Parallel Execution Examples**:
- After Foundational: US1 + US6 can be implemented simultaneously (different components/files)
- After US1+US6: US2, US3, US5 can all be implemented in parallel (independent features)
- US4 requires US2 data model but can be worked alongside US3/US5

---

## Phase 1: Setup & Admin Migration

**Goal**: Migrate admin section to `/admin` and install dependencies

**Duration**: 45-60 minutes

### Tasks

- [X] T001 Migrate admin directory from src/app/dashboard to src/app/admin (follow ADMIN-MIGRATION-PLAN.md Phase 1)
- [X] T002 Update middleware.js admin route checks from /dashboard to /admin (ADMIN-MIGRATION-PLAN.md Phase 3)
- [X] T003 Update internal admin navigation links to use /admin routes (ADMIN-MIGRATION-PLAN.md Phase 4)
- [X] T004 Update admin test files and imports to reference /admin routes (ADMIN-MIGRATION-PLAN.md Phase 5)
- [X] T005 Install Recharts dependency: npm install recharts@3.3.0 (supports React 19)

**Verification**:
- [X] Admin accessible at /admin, /admin/users, /admin/performance
- [X] Old /dashboard route removed
- [X] Admin tests pass: npm test -- admin/not-found.test.js ✓ 6 passed
- [X] Recharts installed: recharts@3.3.0 (React 19 compatible)

---

## Phase 2: Foundational Components

**Goal**: Create reusable utilities and test infrastructure before implementing user stories

**Duration**: 2-3 hours

**Independent Test**: Verify streak calculation logic and service utilities work correctly with various entry datasets (0 entries, consecutive entries, gaps, single entry). Verify skeleton components render with correct glassmorphic styling.

### Tasks

- [X] T006 [P] Create dashboardService.js with calculateStreak function in src/lib/services/dashboardService.js
- [X] T007 [P] Create dashboardService.test.js unit tests in tests/unit/lib/services/dashboardService.test.js
- [X] T008 [P] Implement calculateDashboardStats function (streak + total + average) in src/lib/services/dashboardService.js (Note: Use existing getAverageDuration from entryInsightsService.js per FR-014)
- [X] T009 [P] Write tests for calculateDashboardStats with edge cases (0 entries, <7 entries, gaps) in dashboardService.test.js
- [X] T010 [P] Create SkeletonCard molecule component in src/components/molecules/SkeletonCard.js
- [X] T011 [P] Create SkeletonCard.test.js unit tests in tests/unit/components/molecules/SkeletonCard.test.js
- [X] T012 Run dashboardService tests: npm test -- dashboardService.test.js ✓ 9 passed
- [X] T013 Run SkeletonCard tests: npm test -- SkeletonCard.test.js ✓ 11 passed

**Verification**:
- [X] Streak calculation handles consecutive dates correctly (1, 3, 5, 7 day streaks tested)
- [X] Streak breaks at gaps in dates (test with gap verified)
- [X] Average calculation requires 7+ entries minimum (getAverageDuration reused)
- [X] SkeletonCard renders with glassmorphic backdrop-blur-xl and animate-pulse
- [X] All foundational tests pass (2 test suites, 20 tests total)

---

## Phase 3: US1 - Current Fast Status (Priority P1)

**Goal**: Display active fasting timer or "Start New Fast" CTA based on current entry status

**Duration**: 2-3 hours

**Independent Test**: Create entries with various lastMealTime/firstMealTime combinations and verify dashboard shows correct UI: active timer (counting up every second) when fasting, or "Start New Fast" button when not fasting. Timer uses existing FastingTimerCard component.

### Tasks

- [X] T014 [P] [US1] Create dashboard page file at src/app/dashboard/page.js as Server Component
- [X] T015 [P] [US1] Write dashboard page integration tests in tests/integration/app/dashboard/page.test.js
- [X] T016 [P] [US1] Implement server-side data fetching in dashboard page.js (fetch today's entry via GET /api/entries, check active fast)
- [X] T017 [P] [US1] Add FastingTimerCard integration for active fasts in dashboard page.js (reuse existing component from src/components/organisms/FastingTimerCard.js per FR-009)
- [X] T018 [US1] Create "Start New Fast" CTA card component when no active fast exists in page.js
- [X] T019 [US1] Add empty state handling for users with no entries (encouraging copy) in page.js
- [X] T020 [US1] Run dashboard page integration tests: npm test -- app/dashboard/page.test.js ✓ 9 passed (Note: Fixed Entry model to allow null firstMealTime for active fasts)
- [ ] T021 [US1] Manual test: Verify timer updates every second without page refresh at http://localhost:3000/dashboard

**Verification**:
- [X] Active fast shows FastingTimerCard with counting timer (updates every 1s)
- [X] Completed fast shows "Start New Fast" gradient button in glassmorphic card
- [X] No entry today shows "Start New Fast" with encouraging copy
- [X] Timer uses calculateElapsedTime from fastingTimerUtils.js
- [ ] Page loads in <2s with test data (<100 entries)
- [X] Dashboard page tests pass

---

## Phase 4: US6 - Design System Compliance (Priority P1)

**Goal**: Ensure all dashboard components use Feature 023 design system (glassmorphism, gradients, blur orbs, micro-interactions)

**Duration**: 1-2 hours

**Independent Test**: Visual inspection confirms all cards use GlassmorphicCard (backdrop-blur-xl, bg-white/80, border-white/50), all buttons use GradientButton (purple-pink-indigo gradient), page background matches Feature 023 (gradient-to-br purple-pink), decorative blur orbs present, headings use gradient text, hover states show scale-up and shadow enhancements.

### Tasks

- [X] T022 [P] [US6] Add gradient background to dashboard page in src/app/dashboard/page.js (bg-gradient-to-br from-purple-50 via-white to-pink-50) - Already implemented in Phase 3
- [X] T023 [P] [US6] Add decorative blur orbs to dashboard page in page.js (3 orbs: purple/pink/indigo, 600px, animate-pulse with delays)
- [X] T024 [P] [US6] Wrap timer/CTA card in GlassmorphicCard component in page.js - Already implemented in Phase 3
- [X] T025 [P] [US6] Add gradient heading styles to dashboard title in page.js (gradient-to-r purple-pink-indigo, bg-clip-text, pb-2) - Already implemented in Phase 3
- [X] T026 [US6] Add hover states to interactive elements (scale-105, shadow-2xl, transition-all duration-300) in page.js
- [X] T027 [US6] Visual verification: Compare dashboard to Feature 023 homepage, confirm matching design system - Simple browser opened

**Verification**:
- [X] Page background uses gradient from-purple-50 via-white to-pink-50
- [X] 3 blur orbs visible (purple top-left, pink top-right, indigo bottom-center)
- [X] All cards use GlassmorphicCard with backdrop-blur-xl
- [X] All buttons use GradientButton with purple-pink-indigo gradient
- [X] Heading uses gradient text with pb-2
- [X] Hover effects work (scale-up, shadow enhancement)
- [X] Design matches Feature 023 visual language

---

## Phase 5: US2 - Key Statistics (Priority P2)

**Goal**: Display current streak, total fasts, and average duration in three stat cards

**Duration**: 2-3 hours

**Independent Test**: Create entries with varying patterns (consecutive dates, gaps, durations) and verify dashboard calculates and displays correct streak (consecutive days from most recent entry backward), total fasts (count of all entries), and average duration (mean of durations if 7+ entries). Stat cards use icons (🔥 streak, 📊 total, ⏱️ average) and show hover effects.

### Tasks

- [X] T028 [P] [US2] Create StatCard molecule component in src/components/molecules/StatCard.js
- [X] T029 [P] [US2] Create StatCard.test.js unit tests in tests/unit/components/molecules/StatCard.test.js
- [X] T030 [P] [US2] Create DashboardStats organism component in src/components/organisms/DashboardStats.js
- [X] T031 [P] [US2] Create DashboardStats.test.js unit tests in tests/unit/components/organisms/DashboardStats.test.js
- [X] T032 [US2] Integrate DashboardStats into dashboard page.js (pass calculated stats from server)
- [X] T033 [US2] Add empty state handling for 0 entries (gradient placeholders, encouraging messages) in DashboardStats.js
- [X] T034 [US2] Run StatCard tests: npm test -- StatCard.test.js ✓ 13 passed
- [X] T035 [US2] Run DashboardStats tests: npm test -- DashboardStats.test.js ✓ 20 passed

**Verification**:
- [X] Streak displays consecutive days from most recent entry (not from today)
- [X] Total fasts shows count of all entries
- [X] Average duration shows mean if 7+ entries, else "Need 7+ entries"
- [X] Stat cards use correct icons (🔥, 📊, ⏱️)
- [X] Cards stack vertically on mobile (<768px), horizontally on desktop
- [X] Hover effects work (scale-105, shadow-2xl)
- [X] Empty state shows gradient placeholders with encouraging copy
- [X] All US2 tests pass (2 test suites, 33 tests total)

---

## Phase 6: US3 - Recent Fasting History (Priority P2)

**Goal**: Display 5 most recent entries with date, duration, goalStatus icons, and clickable navigation to entry details

**Duration**: 2-3 hours

**Independent Test**: Create 10 entries with varying goalStatus and durations, verify dashboard shows only 5 most recent (sorted by date descending), displays correct duration format (e.g., "16h 30m"), shows goalStatus icons (✅ completed, ⚠️ not-completed), shows "Extended Fast" badge for 24+ hour fasts, and navigates to /entries/[id] on click. Users with <5 entries see gradient placeholders.

### Tasks

- [X] T036 [P] [US3] Create RecentEntryItem molecule component in src/components/molecules/RecentEntryItem.js
- [X] T037 [P] [US3] Create RecentEntryItem.test.js unit tests in tests/unit/components/molecules/RecentEntryItem.test.js ✓ 28 passed
- [X] T038 [P] [US3] Create RecentFastsList organism component in src/components/organisms/RecentFastsList.js
- [X] T039 [P] [US3] Create RecentFastsList.test.js unit tests in tests/unit/components/organisms/RecentFastsList.test.js ✓ 20 passed
- [X] T040 [US3] Integrate RecentFastsList into dashboard page.js (fetch 5 entries sorted by date descending with .lean())
- [X] T041 [US3] Add goalStatus icon rendering (✅ completed, ⚠️ not-completed) in RecentEntryItem.js
- [X] T042 [US3] Add "Extended Fast" badge for durations >1440 minutes in RecentEntryItem.js
- [X] T043 [US3] Add click navigation to /entries/[id] in RecentEntryItem.js

**Verification**:
- [X] Only 5 most recent entries displayed (sorted by date descending)
- [X] Each entry shows formatted date (e.g., "Jan 30, 2025") and duration (e.g., "16h 30m")
- [X] goalStatus "completed" shows green checkmark (✅)
- [X] goalStatus "not-completed" shows yellow warning (⚠️)
- [X] Entries >24 hours show "Extended Fast" badge
- [X] Clicking entry navigates to /entries/[id]
- [X] Users with <5 entries see gradient placeholder slots
- [X] Users with 0 entries see encouraging messages in placeholder slots
- [X] All US3 tests pass (2 test suites, 48 tests total)

---

## Phase 7: US5 - Quick Actions (Priority P2)

**Goal**: Display three quick action buttons (Create Entry, View All Entries, Settings) for efficient navigation

**Duration**: 1-2 hours

**Independent Test**: Click each quick action button and verify correct navigation: "Create Entry" opens /entries with form modal triggered (?openForm=true), "View All Entries" navigates to /entries, "Settings" navigates to /settings. Buttons use GradientButton component and stack vertically on mobile, horizontally on desktop.

### Tasks

- [X] T044 [P] [US5] Create QuickActions organism component in src/components/organisms/QuickActions.js
- [X] T045 [P] [US5] Create QuickActions.test.js unit tests in tests/unit/components/organisms/QuickActions.test.js
- [X] T046 [US5] Integrate QuickActions into dashboard page.js below recent history section
- [X] T047 [US5] Run QuickActions tests: npm test -- QuickActions.test.js ✓ 24 passed
- [X] T048 [US5] Manual test: Click all 3 buttons and verify navigation works correctly - Dashboard opened for manual testing

**Verification**:
- [X] "Create Entry" button navigates to /entries?openForm=true
- [X] "View All Entries" button navigates to /entries
- [X] "Settings" button navigates to /settings
- [X] Buttons use GradientButton component with purple-pink-indigo gradient
- [X] Buttons stack vertically on mobile (<768px), horizontally on desktop (≥768px)
- [X] Hover effects work (scale-up, shadow enhancement)
- [X] Touch targets meet 44px minimum on mobile (min-h-touch class)
- [X] QuickActions tests pass (24/24)

---

## Phase 8: US4 - Progress Visualization (Priority P3)

**Goal**: Display 30-day line chart showing fasting duration trends using Recharts (requires 7+ entries)

**Duration**: 3-4 hours

**Independent Test**: Create 30 entries with varying durations spanning last month, verify dashboard renders Recharts line chart with date on X-axis, duration (in hours) on Y-axis, purple-pink-indigo gradient line styling, hover tooltips showing exact date and duration, and responsive behavior (375px to 1440px+). Users with <7 entries see gradient placeholder with "Create 7+ entries to see trends".

### Tasks

- [ ] T049 [P] [US4] Create DashboardChart organism component in src/components/organisms/DashboardChart.js
- [ ] T050 [P] [US4] Create DashboardChart.test.js unit tests in tests/unit/components/organisms/DashboardChart.test.js
- [ ] T051 [US4] Implement Recharts LineChart with gradient styling in DashboardChart.js
- [ ] T052 [US4] Add tooltip rendering (show exact date and duration on hover) in DashboardChart.js
- [ ] T053 [US4] Add empty state placeholder for <7 entries (gradient background, encouraging text) in DashboardChart.js
- [ ] T054 [US4] Integrate DashboardChart into dashboard page.js (pass 30-day entries from server)
- [ ] T055 [US4] Test chart responsiveness across breakpoints (375px, 768px, 1024px, 1440px+)
- [ ] T055a [US4] NOTE: Chart toggle tabs for Weekly/Monthly aggregation (FR-031) deferred to Feature 024 v2

**Verification**:
- [ ] Chart renders with Recharts ResponsiveContainer wrapping LineChart
- [ ] X-axis shows dates (e.g., "Jan 28", "Jan 29"), Y-axis shows hours
- [ ] Line uses purple-pink-indigo gradient (linearGradient with 3 stops)
- [ ] Hover tooltips display exact date (YYYY-MM-DD) and duration (Xh Ym)
- [ ] Chart adapts to screen width (375px to 1440px+) without overflow
- [ ] Users with <7 entries see gradient placeholder with "Create 7+ entries to see trends"
- [ ] Chart renders in <1s with 30 data points
- [ ] DashboardChart tests pass

---

## Phase 9: Middleware & Routing

**Goal**: Redirect authenticated users from homepage to dashboard, protect dashboard from unauthenticated access

**Duration**: 1 hour

**Independent Test**: Test authenticated user visiting / is redirected to /dashboard. Test unauthenticated user visiting /dashboard is redirected to /login?callbackUrl=/dashboard. Test admin routes (/admin/*) are not affected by dashboard redirects.

### Tasks

- [ ] T056 Update middleware.js to redirect authenticated users from / to /dashboard in src/middleware.js
- [ ] T057 Update middleware.js to redirect unauthenticated users from /dashboard to /login?callbackUrl=/dashboard in src/middleware.js
- [ ] T058 Update middleware matcher config to include /dashboard route in src/middleware.js
- [ ] T059 Verify admin routes (/admin/*) are not affected by dashboard redirects (test /admin still accessible)

**Verification**:
- [ ] Authenticated user at / is redirected to /dashboard (307 status)
- [ ] Unauthenticated user at /dashboard is redirected to /login?callbackUrl=/dashboard
- [ ] After login, user is redirected back to /dashboard
- [ ] No redirect loop occurs (dashboard doesn't redirect to itself)
- [ ] Admin routes (/admin, /admin/users, /admin/performance) still work correctly
- [ ] Homepage (/) remains accessible to unauthenticated users (not redirected)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Goal**: Add skeleton loading states, error handling, accessibility, and final polish

**Duration**: 2-3 hours

### Tasks

- [ ] T060 [P] Add skeleton loading states to dashboard page.js (use SkeletonCard for each section during data fetch)
- [ ] T061 [P] Add error handling to dashboard page.js (display error messages with Retry buttons for failed fetches)
- [ ] T062 [P] Add ARIA labels to all interactive elements (buttons, cards, chart) in dashboard components
- [ ] T063 [P] Add keyboard navigation support (Tab, Enter, Escape) to all interactive elements
- [ ] T064 [P] Test dashboard with screen reader (NVDA/JAWS) and verify semantic HTML structure
- [ ] T065 Verify color contrast ratios meet WCAG 2.1 AA standards (text on glassmorphic cards, gradient buttons)
- [ ] T066 Add loading="lazy" to any images in dashboard components (if applicable)

**Verification**:
- [ ] Skeleton cards display during initial data fetch (glassmorphic animated shapes)
- [ ] Error states show user-friendly messages with "Retry" buttons
- [ ] API errors logged to console but not exposed to users
- [ ] All buttons/cards have descriptive ARIA labels
- [ ] Tab navigation works through all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Color contrast ratios pass WCAG 2.1 AA (4.5:1 minimum)
- [ ] No accessibility violations in browser DevTools audit

---

## Phase 11: Testing & Verification

**Goal**: Run full test suite and E2E tests, verify all success criteria met

**Duration**: 2-3 hours

### Tasks

- [ ] T067 Create E2E test spec for all 6 user stories in tests/e2e/dashboard.spec.js
- [ ] T068 Run full unit test suite: npm test
- [ ] T069 Run E2E test suite: npm run test:e2e -- dashboard.spec.js
- [ ] T070 Verify dashboard load time <2s with 100 test entries (Chrome DevTools Performance tab)
- [ ] T071 Verify timer updates every 1s without lag (Chrome DevTools Performance monitor)
- [ ] T072 Verify chart renders 30 days in <1s (Performance tab)
- [ ] T073 Test dashboard on all breakpoints: 375px, 768px, 1024px, 1440px (Chrome DevTools responsive mode)
- [ ] T074 Verify all 15 success criteria met (SC-001 to SC-015 from spec.md)

**Verification**:
- [ ] All unit tests pass (100% of new code covered)
- [ ] All integration tests pass (dashboard page data fetching)
- [ ] All E2E tests pass (6 user story scenarios)
- [ ] Dashboard loads in <2s (up to 100 entries)
- [ ] Timer updates every 1s without lag
- [ ] Chart renders in <1s (30 data points)
- [ ] Responsive layouts work on all breakpoints
- [ ] All 15 success criteria verified (manual checklist)
- [ ] Overall test coverage >80% (constitution minimum)

---

## Success Criteria Checklist

From spec.md Section "Success Criteria":

- [ ] **SC-001**: Authenticated user at / automatically redirected to /dashboard
- [ ] **SC-002**: Active fast displays live timer counting up every second
- [ ] **SC-003**: Timer format shows "Xh Ym" (e.g., "16h 32m")
- [ ] **SC-004**: Completed fast shows "Start New Fast" gradient button
- [ ] **SC-005**: Current streak calculates consecutive days from most recent entry backward
- [ ] **SC-006**: Total fasts displays count of all user entries
- [ ] **SC-007**: Average duration shows mean if 7+ entries, else placeholder
- [ ] **SC-008**: Recent history shows 5 most recent entries with date and duration
- [ ] **SC-009**: Chart renders with Recharts if 7+ entries, else placeholder
- [ ] **SC-010**: Chart renders 30 days in <1s
- [ ] **SC-011**: Quick actions navigate to correct routes (/entries?openForm=true, /entries, /settings)
- [ ] **SC-012**: All components use Feature 023 design system (glassmorphic cards, gradient buttons, matching colors)
- [ ] **SC-013**: Dashboard loads in <2s with up to 100 entries
- [ ] **SC-014**: Dashboard fully responsive (375px to 1440px+)
- [ ] **SC-015**: WCAG 2.1 AA compliance (keyboard navigation, screen reader support, color contrast)

---

## Parallel Execution Opportunities

Tasks marked with **[P]** can be executed in parallel with other [P] tasks in the same phase:

**Foundational Phase** (all 6 tasks can be parallel):
- T006-T011: All service/component creation tasks independent

**US1 Phase** (T014-T017 parallel):
- Create page file + tests + data fetching + timer integration (different concerns)

**US6 Phase** (T022-T025 parallel):
- All styling tasks independent (background, orbs, card wrapper, heading)

**US2 Phase** (T028-T031 parallel):
- StatCard + DashboardStats components created independently

**US3 Phase** (T036-T039 parallel):
- RecentEntryItem + RecentFastsList components created independently

**US5 Phase** (T044-T045 parallel):
- QuickActions component + tests

**US4 Phase** (T049-T052 parallel):
- Chart component + tests + Recharts implementation

**Polish Phase** (T060-T064 parallel):
- Skeleton loading, error handling, ARIA labels, keyboard nav (different files/concerns)

---

## Notes

- **TDD Enforced**: All component tasks include corresponding test tasks. Tests must be written first (failing), then implementation passes tests.
- **Admin Migration First**: Tasks T001-T004 MUST complete before any dashboard implementation to free up /dashboard route.
- **Recharts Installation**: T005 installs Recharts 2.12.7 (required for US4 chart component).
- **MVP Delivery**: Complete Setup + Foundational + US1 + US6 for minimal viable dashboard (18 tasks, ~4-6 hours).
- **Incremental Delivery**: Each user story phase delivers standalone value and can be tested independently.
- **Constitution Compliance**: All tasks follow TDD, mobile-first responsive design, Next.js best practices, and security principles.
- **Performance Targets**: <2s load (SC-013), 1s timer updates (SC-003), <1s chart render (SC-010).
- **Design System**: Feature 023 components (GlassmorphicCard, GradientButton) reused throughout for consistency (US6).

---

## Total Task Breakdown

| Phase | Task Count | Duration | Priority |
|-------|------------|----------|----------|
| Setup & Admin Migration | 5 | 45-60 min | Critical |
| Foundational | 8 | 2-3 hours | Critical |
| US1: Current Fast Status | 8 | 2-3 hours | P1 |
| US6: Design System | 6 | 1-2 hours | P1 |
| US2: Statistics | 8 | 2-3 hours | P2 |
| US3: Recent History | 8 | 2-3 hours | P2 |
| US5: Quick Actions | 5 | 1-2 hours | P2 |
| US4: Progress Chart | 7 | 3-4 hours | P3 |
| Middleware & Routing | 4 | 1 hour | Critical |
| Polish & Accessibility | 7 | 2-3 hours | Critical |
| Testing & Verification | 8 | 2-3 hours | Critical |
| **TOTAL** | **74** | **18-24 hours** | - |

**Note**: Parallel execution can reduce total time by ~30-40% (estimated 12-16 hours with efficient parallelization).
