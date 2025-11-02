# Tasks: Entry Details Page Enhancement

**Feature**: 025 - Entry Details Page Enhancement  
**Branch**: `025-entry-details-enhancement`  
**Input**: Design documents from `/specs/025-entry-details-enhancement/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: TDD is mandatory per project constitution. All test tasks are included and MUST be written first before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify all dependencies installed per package.json (Next.js 15.5.6, React 18, Tailwind CSS 3.4, Mongoose 8.x)
- [x] T002 Confirm authentication middleware working at src/middleware.js for protected routes
- [x] T003 [P] Verify existing Entry model at src/lib/models/Entry.js has all required fields (no changes needed)
- [x] T004 [P] Verify entryInsightsService exists at src/lib/services/entryInsightsService.js with caching infrastructure
- [x] T005 [P] Verify serverCacheService exists at src/lib/services/serverCacheService.js with TTL support

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create utility functions for duration formatting in src/lib/utils/formatters.js (formatDuration, formatTime)
- [x] T007 [P] Create utility functions for date formatting in src/lib/utils/formatters.js (formatDate, formatRelativeTime)
- [x] T008 [P] Verify glassmorphic Tailwind classes available in tailwind.config.js (backdrop-blur-md, gradients)
- [x] T009 Configure ISR for entry details page (revalidate = 300 seconds) in src/app/entries/[id]/page.js
- [x] T010 [P] Add generateStaticParams function in src/app/entries/[id]/page.js to pre-render 10 most recent entries

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Beautifully Styled Entry Details (Priority: P1) 🎯 MVP

**Goal**: Apply glassmorphic design system to entry details page with purple-pink-indigo gradients, making data visually engaging and consistent with dashboard

**Independent Test**: Navigate to any existing entry detail page and verify gradient background, glassmorphic cards, proper spacing, and gradient buttons are applied without requiring any insight calculations

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Unit test for EntryDetailsView visual structure in tests/components/EntryDetailsView.test.js
- [x] T012 [P] [US1] Snapshot test for glassmorphic styling in tests/components/EntryDetailsView.snapshot.test.js
- [x] T013 [P] [US1] E2E test for gradient background in tests/e2e/entry-details-styling.spec.js
- [x] T014 [P] [US1] Accessibility test for WCAG 2.1 AA contrast ratios in tests/a11y/entry-details-contrast.test.js

### Implementation for User Story 1

- [x] T015 [US1] Update page.js at src/app/entries/[id]/page.js to add gradient background container (FR-001)
- [x] T016 [US1] Apply glassmorphic card styling to EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-002)
- [x] T017 [P] [US1] Create gradient text component for duration display in src/components/atoms/GradientText.js (FR-003)
- [x] T018 [P] [US1] Style primary action button (Edit) with purple-pink gradient in src/components/atoms/EditButton.js (FR-004)
- [x] T019 [P] [US1] Style secondary action button (Back) with white/gray styling in src/components/atoms/BackButton.js (FR-005)
- [x] T020 [P] [US1] Style destructive action button (Delete) with white/red styling in src/components/atoms/DeleteButton.js (FR-006)
- [x] T021 [US1] Add wellness emoji indicators to EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-007)
- [x] T022 [US1] Apply consistent spacing (gap-6, p-6) throughout EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-009)
- [x] T023 [US1] Validate all text contrast ratios meet WCAG 2.1 AA using Chrome DevTools (FR-010) - Manual validation via automated a11y tests
- [x] T024 [US1] Display entry date with localized format in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-011)
- [x] T025 [US1] Display meal times with user's 12h/24h preference in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-012)
- [x] T026 [US1] Display fasting duration with gradient styling in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-013)
- [x] T027 [US1] Display weight with user's measurement preference in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-014)
- [x] T028 [US1] Add "Not logged" placeholder for optional null fields in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-017)
- [x] T029 [US1] Display entry creation and update timestamps in relative format in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-018)
- [x] T030 [US1] Verify authentication check before rendering page in src/app/entries/[id]/page.js (FR-059)
- [x] T031 [US1] Verify entry ownership (userId match) before displaying data in src/app/entries/[id]/page.js (FR-060)
- [x] T032 [US1] Redirect unauthorized users to login in src/app/entries/[id]/page.js (FR-061)
- [x] T033 [US1] Validate MongoDB ObjectId format in src/app/entries/[id]/page.js (FR-063)
- [x] T034 [US1] Return 404 for invalid entry IDs in src/app/entries/[id]/page.js (FR-064)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - entry details display with beautiful glassmorphic styling

---

## Phase 4: User Story 2 - See Personalized Insights and Patterns (Priority: P1)

**Goal**: Display contextual insights comparing current fast to historical data (rankings, weekend patterns, deviations, streaks) to drive engagement and motivation

**Independent Test**: View entries with sufficient historical data (at least 10 entries) and verify insights appear in gradient-styled callout boxes with accurate pattern analysis

### Tests for User Story 2

- [ ] T035 [P] [US2] Unit test for InsightCalloutBox component in tests/components/InsightCalloutBox.test.js
- [ ] T036 [P] [US2] Unit test for insight calculation service enhancements in tests/unit/entryInsightsService.test.js
- [ ] T037 [P] [US2] Integration test for InsightsSection rendering in tests/components/InsightsSection.test.js
- [ ] T038 [P] [US2] E2E test for insights display with sufficient data in tests/e2e/entry-insights.spec.js
- [ ] T039 [P] [US2] E2E test for insufficient data edge case in tests/e2e/entry-insights-edge-cases.spec.js

### Implementation for User Story 2

- [ ] T040 [P] [US2] Create InsightCalloutBox molecule component in src/components/molecules/InsightCalloutBox.js with gradient styling
- [ ] T041 [US2] Enhance entryInsightsService at src/lib/services/entryInsightsService.js to add weekendVsWeekdayPattern calculation (FR-020)
- [ ] T042 [US2] Enhance entryInsightsService at src/lib/services/entryInsightsService.js to add deviationFromTypical calculation (FR-021)
- [ ] T043 [US2] Enhance entryInsightsService at src/lib/services/entryInsightsService.js to add streakContribution calculation (FR-022)
- [ ] T044 [US2] Update aggregation pipeline in src/lib/services/entryInsightsService.js to use $facet for parallel calculations (FR-057)
- [ ] T045 [US2] Implement insights caching with 30-minute TTL in src/lib/services/entryInsightsService.js (FR-024)
- [ ] T046 [US2] Create InsightsSection component in src/components/organisms/InsightsSection.js to orchestrate insight display
- [ ] T047 [US2] Add historical rank insight display in InsightsSection at src/components/organisms/InsightsSection.js (FR-019)
- [ ] T048 [US2] Add weekend vs weekday pattern insight display in InsightsSection at src/components/organisms/InsightsSection.js (FR-020)
- [ ] T049 [US2] Add deviation from average insight display in InsightsSection at src/components/organisms/InsightsSection.js (FR-021)
- [ ] T050 [US2] Add current streak insight display in InsightsSection at src/components/organisms/InsightsSection.js (FR-022)
- [ ] T051 [US2] Add "Log more entries" message for insufficient data in InsightsSection at src/components/organisms/InsightsSection.js (FR-025)
- [ ] T052 [US2] Add error handling for insight calculation failures in InsightsSection at src/components/organisms/InsightsSection.js (FR-026)
- [ ] T053 [US2] Integrate InsightsSection into EntryDetailsView at src/components/organisms/EntryDetailsView.js
- [ ] T054 [US2] Update page.js at src/app/entries/[id]/page.js to fetch insights and pass to EntryDetailsView (FR-023)
- [ ] T055 [US2] Verify insights calculation completes in <500ms using performanceLogger in src/lib/services/entryInsightsService.js (FR-058)

**Checkpoint**: At this point, User Story 2 should be fully functional - users see personalized insights when viewing entries

---

## Phase 5: User Story 3 - Compare Entry to Personal Averages (Priority: P2)

**Goal**: Show numerical comparison statistics (overall, 30-day, day-of-week averages) to enhance motivation and goal-setting

**Independent Test**: View any entry with at least 30 days of historical data and verify comparison statistics are calculated accurately and displayed in gradient-styled cards

### Tests for User Story 3

- [ ] T056 [P] [US3] Unit test for ComparisonCard component in tests/components/ComparisonCard.test.js
- [ ] T057 [P] [US3] Unit test for comparison stats calculation in tests/unit/comparisonStats.test.js
- [ ] T058 [P] [US3] Integration test for ComparisonStatsSection rendering in tests/components/ComparisonStatsSection.test.js
- [ ] T059 [P] [US3] E2E test for comparison display with sufficient data in tests/e2e/entry-comparison-stats.spec.js
- [ ] T060 [P] [US3] E2E test for insufficient data edge cases in tests/e2e/entry-comparison-edge-cases.spec.js

### Implementation for User Story 3

- [ ] T061 [P] [US3] Create ComparisonCard molecule component in src/components/molecules/ComparisonCard.js with trend indicators
- [ ] T062 [US3] Create comparison stats calculation function in src/lib/utils/comparisonStats.js for overall average (FR-028)
- [ ] T063 [US3] Add 30-day rolling average calculation in src/lib/utils/comparisonStats.js (FR-029)
- [ ] T064 [US3] Add same-day-of-week average calculation in src/lib/utils/comparisonStats.js (FR-030)
- [ ] T065 [US3] Add trend direction and arrow logic in src/lib/utils/comparisonStats.js (FR-031)
- [ ] T066 [US3] Apply green gradient for above-average values in ComparisonCard at src/components/molecules/ComparisonCard.js (FR-032)
- [ ] T067 [US3] Apply neutral gray for below-average values in ComparisonCard at src/components/molecules/ComparisonCard.js (FR-033)
- [ ] T068 [US3] Create ComparisonStatsSection component in src/components/organisms/ComparisonStatsSection.js
- [ ] T069 [US3] Add "How This Compares" glassmorphic card in ComparisonStatsSection at src/components/organisms/ComparisonStatsSection.js (FR-036)
- [ ] T070 [US3] Add "N/A" handling for insufficient data in ComparisonStatsSection at src/components/organisms/ComparisonStatsSection.js (FR-035)
- [ ] T071 [US3] Integrate ComparisonStatsSection into EntryDetailsView at src/components/organisms/EntryDetailsView.js
- [ ] T072 [US3] Update page.js at src/app/entries/[id]/page.js to calculate comparison stats and pass to EntryDetailsView

**Checkpoint**: At this point, User Story 3 should be fully functional - users see comparison statistics when viewing entries

---

## Phase 6: User Story 4 - Navigate Entry Timeline Context (Priority: P2)

**Goal**: Show previous/next entry links with quick navigation to help users understand chronological flow and spot multi-day patterns

**Independent Test**: View any entry with previous and next entries, verify navigation links are styled and functional, and edge cases (first/last) show appropriate messages

### Tests for User Story 4

- [ ] T073 [P] [US4] Unit test for TimelineNav component in tests/components/TimelineNav.test.js
- [ ] T074 [P] [US4] Unit test for timeline context fetching in tests/unit/timelineContext.test.js
- [ ] T075 [P] [US4] Integration test for TimelineNavigationSection rendering in tests/components/TimelineNavigationSection.test.js
- [ ] T076 [P] [US4] E2E test for timeline navigation functionality in tests/e2e/entry-timeline-navigation.spec.js
- [ ] T077 [P] [US4] E2E test for first/last entry edge cases in tests/e2e/entry-timeline-edge-cases.spec.js

### Implementation for User Story 4

- [ ] T078 [P] [US4] Create TimelineNav molecule component in src/components/molecules/TimelineNav.js with gradient links
- [ ] T079 [US4] Create timeline context fetching function in src/lib/utils/timelineContext.js to fetch previous entry (FR-037)
- [ ] T080 [US4] Add next entry fetching in src/lib/utils/timelineContext.js (FR-038)
- [ ] T081 [US4] Add date gap handling in timeline queries in src/lib/utils/timelineContext.js (FR-044)
- [ ] T082 [US4] Create TimelineNavigationSection component in src/components/organisms/TimelineNavigationSection.js
- [ ] T083 [US4] Add "This is your first entry" message for first entry case in TimelineNav at src/components/molecules/TimelineNav.js (FR-040)
- [ ] T084 [US4] Add "This is your latest entry" message for latest entry case in TimelineNav at src/components/molecules/TimelineNav.js (FR-041)
- [ ] T085 [US4] Add compact glassmorphic styling to timeline cards in TimelineNav at src/components/molecules/TimelineNav.js (FR-043)
- [ ] T086 [US4] Integrate TimelineNavigationSection into EntryDetailsView at src/components/organisms/EntryDetailsView.js
- [ ] T087 [US4] Update page.js at src/app/entries/[id]/page.js to fetch timeline context and pass to EntryDetailsView

**Checkpoint**: At this point, User Story 4 should be fully functional - users can navigate between entries using timeline links

---

## Phase 7: User Story 5 - Edit or Delete Entry with Prominent Actions (Priority: P3)

**Goal**: Ensure edit/delete buttons are prominently displayed with beautiful gradient styling and proper confirmation for destructive actions

**Independent Test**: Click Edit/Delete buttons, verify proper navigation/confirmation, and ensure button styling matches gradient design system

### Tests for User Story 5

- [ ] T088 [P] [US5] Unit test for EditButton component in tests/components/EditButton.test.js
- [ ] T089 [P] [US5] Unit test for DeleteButton component in tests/components/DeleteButton.test.js
- [ ] T090 [P] [US5] Unit test for DeleteConfirmationModal component in tests/components/DeleteConfirmationModal.test.js
- [ ] T091 [P] [US5] E2E test for edit button navigation in tests/e2e/entry-edit-action.spec.js
- [ ] T092 [P] [US5] E2E test for delete button with confirmation in tests/e2e/entry-delete-action.spec.js

### Implementation for User Story 5

- [ ] T093 [P] [US5] Update EditButton at src/components/atoms/EditButton.js with purple-pink gradient and hover effects (FR-045)
- [ ] T094 [P] [US5] Update DeleteButton at src/components/atoms/DeleteButton.js with white/red styling (FR-046)
- [ ] T095 [P] [US5] Create DeleteConfirmationModal component in src/components/molecules/DeleteConfirmationModal.js with glassmorphic styling (FR-047)
- [ ] T096 [US5] Add modal state management to DeleteButton at src/components/atoms/DeleteButton.js
- [ ] T097 [US5] Implement deletion logic with confirmation in DeleteButton at src/components/atoms/DeleteButton.js (FR-048)
- [ ] T098 [US5] Add redirect to entries list after successful deletion in DeleteButton at src/components/atoms/DeleteButton.js (FR-049)
- [ ] T099 [US5] Add success toast notification after deletion in DeleteButton at src/components/atoms/DeleteButton.js (FR-049)
- [ ] T100 [P] [US5] Add BackButton with subtle gradient styling in src/components/atoms/BackButton.js (FR-050)
- [ ] T101 [US5] Add hover:scale-105 transitions to all buttons in action components (FR-051)
- [ ] T102 [US5] Verify 44x44px minimum touch target size for all buttons in action components (FR-052)
- [ ] T103 [US5] Integrate action buttons into ActionButtonsSection in EntryDetailsView at src/components/organisms/EntryDetailsView.js

**Checkpoint**: All user stories should now be independently functional and beautifully styled

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T104 [P] Add expandable food notes with "Read more" button if >300 chars in EntryDetailsView at src/components/organisms/EntryDetailsView.js (FR-016)
- [ ] T105 [P] Add performance logging for page load time in src/app/entries/[id]/page.js (FR-058)
- [ ] T106 [P] Add performance logging for insight calculations in src/lib/services/entryInsightsService.js (FR-058)
- [ ] T107 Verify page load time <2s on 4G connection using Lighthouse (SC-001, FR-053)
- [ ] T108 Verify 90% cache hit rate for insights using performance logs (SC-002, FR-056)
- [ ] T109 [P] Run accessibility audit with axe DevTools to verify WCAG 2.1 AA compliance (SC-004)
- [ ] T110 [P] Run visual regression tests to verify design consistency with dashboard (SC-006)
- [ ] T111 Verify Cumulative Layout Shift <0.1 using Chrome DevTools Performance tab (SC-012)
- [ ] T112 [P] Test mobile responsive behavior on iOS Safari and Chrome Android
- [ ] T113 [P] Test keyboard navigation (Tab, Enter, ESC) for all interactive elements
- [ ] T114 [P] Test screen reader compatibility with VoiceOver or NVDA
- [ ] T115 Run all unit tests and verify 80% coverage minimum per constitution
- [ ] T116 Run all integration tests and verify all user journeys pass
- [ ] T117 Run all E2E tests and verify all user stories testable independently
- [ ] T118 [P] Update CLAUDE.md with feature design patterns and decisions
- [ ] T119 [P] Update README.md with entry details page documentation
- [ ] T120 Run quickstart.md validation checklist to confirm all requirements met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (US1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (US2): Can start after Foundational - No dependencies on other stories (independently testable)
  - User Story 3 (US3): Can start after Foundational - No dependencies on other stories (independently testable)
  - User Story 4 (US4): Can start after Foundational - No dependencies on other stories (independently testable)
  - User Story 5 (US5): Can start after Foundational - No dependencies on other stories (independently testable)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for visual design - All components get glassmorphic styling
- **User Story 2 (P1)**: Independent - Insights calculations and display
- **User Story 3 (P2)**: Independent - Comparison statistics calculations and display
- **User Story 4 (P2)**: Independent - Timeline navigation with previous/next entries
- **User Story 5 (P3)**: Independent - Action button styling and deletion confirmation

**Key Insight**: After Foundational phase completes, all 5 user stories can be implemented in parallel by different team members as they have no inter-dependencies.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per constitution)
- Molecule components (InsightCalloutBox, ComparisonCard, TimelineNav) before organism sections
- Services/utilities before components that use them
- Component integration into EntryDetailsView after component implementation
- Page.js data fetching after all components ready

### Parallel Opportunities

- **Phase 1 Setup**: T003, T004, T005 can run in parallel (different files)
- **Phase 2 Foundational**: T007, T008, T010 can run in parallel (different files)
- **User Story 1 Tests**: T011, T012, T013, T014 can run in parallel (different test files)
- **User Story 1 Implementation**: T017, T018, T019, T020 can run in parallel (different component files)
- **User Story 2 Tests**: T035, T036, T037, T038, T039 can run in parallel (different test files)
- **User Story 2 Implementation**: T040 independent, insights calculations in T041-T045 sequential
- **User Story 3 Tests**: T056, T057, T058, T059, T060 can run in parallel (different test files)
- **User Story 3 Implementation**: T061, T062 can start in parallel (different files)
- **User Story 4 Tests**: T073, T074, T075, T076, T077 can run in parallel (different test files)
- **User Story 4 Implementation**: T078, T079 can start in parallel (different files)
- **User Story 5 Tests**: T088, T089, T090, T091, T092 can run in parallel (different test files)
- **User Story 5 Implementation**: T093, T094, T095, T100 can run in parallel (different component files)
- **Phase 8 Polish**: T104, T105, T106, T109, T110, T112, T113, T114, T118, T119 can run in parallel

**After Foundational Phase**: All 5 user stories (US1-US5) can be developed in parallel by different developers.

---

## Parallel Example: User Story 2 (Insights)

```bash
# Write all tests for User Story 2 together:
Task T035: "Unit test for InsightCalloutBox component in tests/components/InsightCalloutBox.test.js"
Task T036: "Unit test for insight calculation service enhancements in tests/unit/entryInsightsService.test.js"
Task T037: "Integration test for InsightsSection rendering in tests/components/InsightsSection.test.js"
Task T038: "E2E test for insights display with sufficient data in tests/e2e/entry-insights.spec.js"
Task T039: "E2E test for insufficient data edge case in tests/e2e/entry-insights-edge-cases.spec.js"

# Then implement molecule component:
Task T040: "Create InsightCalloutBox molecule component in src/components/molecules/InsightCalloutBox.js"

# Then enhance service (sequential because they modify same file):
Task T041 → T042 → T043 → T044 → T045: Enhance entryInsightsService.js

# Then build organism section and integrate:
Task T046 → T047 → T048 → T049 → T050 → T051 → T052 → T053 → T054 → T055
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (verify infrastructure)
2. Complete Phase 2: Foundational (blocking prerequisites)
3. Complete Phase 3: User Story 1 (glassmorphic styling)
4. Complete Phase 4: User Story 2 (personalized insights)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready - users get beautifully styled entry details with insights

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Beautiful styling!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP with insights!)
4. Add User Story 3 → Test independently → Deploy/Demo (Comparison stats added)
5. Add User Story 4 → Test independently → Deploy/Demo (Timeline navigation added)
6. Add User Story 5 → Test independently → Deploy/Demo (Action buttons polished)
7. Polish Phase → Final quality checks → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Glassmorphic Styling) - T011 to T034
   - **Developer B**: User Story 2 (Personalized Insights) - T035 to T055
   - **Developer C**: User Story 3 (Comparison Stats) - T056 to T072
   - **Developer D**: User Story 4 (Timeline Navigation) - T073 to T087
   - **Developer E**: User Story 5 (Action Buttons) - T088 to T103
3. Stories complete and integrate independently
4. Team converges for Polish Phase

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability (US1, US2, US3, US4, US5)
- Each user story should be independently completable and testable
- **TDD is mandatory**: Verify tests fail before implementing (per project constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Total Tasks**: 120 tasks across 8 phases
- **Test Tasks**: 35 tasks (TDD mandatory per constitution)
- **Implementation Tasks**: 85 tasks
- **Estimated Time**: 20-25 hours per quickstart.md

---

## Task Summary

**Phase 1 (Setup)**: 5 tasks  
**Phase 2 (Foundational)**: 5 tasks  
**Phase 3 (US1 - Styling)**: 24 tasks (4 test + 20 implementation)  
**Phase 4 (US2 - Insights)**: 21 tasks (5 test + 16 implementation)  
**Phase 5 (US3 - Comparisons)**: 17 tasks (5 test + 12 implementation)  
**Phase 6 (US4 - Timeline)**: 15 tasks (5 test + 10 implementation)  
**Phase 7 (US5 - Actions)**: 16 tasks (5 test + 11 implementation)  
**Phase 8 (Polish)**: 17 tasks  

**Total**: 120 tasks

**Parallel Opportunities**: 40+ tasks marked [P] can run in parallel  
**Independent Stories**: All 5 user stories can be developed in parallel after Foundational phase

**Suggested MVP**: User Story 1 + 2 (Glassmorphic styling with personalized insights) = 45 tasks
