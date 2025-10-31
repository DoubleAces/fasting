# Requirements Checklist: User Dashboard

**Feature**: 024-user-dashboard  
**Generated**: 2025-01-30  
**Status**: Ready for Planning

## Functional Requirements

### Dashboard Access & Navigation

- [ ] **FR-001**: System MUST redirect authenticated users from the homepage (`/`) to the dashboard (`/dashboard`) automatically via middleware
- [ ] **FR-002**: System MUST redirect unauthenticated users attempting to access `/dashboard` to the login page (`/login`)
- [ ] **FR-003**: Dashboard MUST be accessible at the route `/dashboard` using Next.js App Router structure
- [ ] **FR-004**: Dashboard page MUST render as a Server Component for initial data load, with Client Components for interactive elements (timer, charts)

### Current Fast Status (User Story 1 - P1)

- [ ] **FR-005**: Dashboard MUST display a live fasting timer when today's entry has lastMealTime but no firstMealTime (active fast)
- [ ] **FR-006**: Timer MUST update every second showing elapsed time in format "Xh Ym" (e.g., "16h 32m")
- [ ] **FR-007**: Dashboard MUST calculate elapsed time using the existing `calculateElapsedTime` function from `src/lib/utils/fastingTimerUtils.js`
- [ ] **FR-008**: Dashboard MUST display a "Start New Fast" button when no active fast exists (no entry for today, or today's entry is complete)
- [ ] **FR-009**: Timer card MUST use the existing FastingTimerCard component from `src/components/organisms/FastingTimerCard.js` or create a new DashboardTimerCard variant
- [ ] **FR-010**: Timer card MUST be wrapped in GlassmorphicCard component from Feature 023

### Statistics Display (User Story 2 - P2)

- [ ] **FR-011**: Dashboard MUST calculate and display "Current Streak" as count of consecutive days with entries, starting from most recent date backward
- [ ] **FR-012**: Dashboard MUST calculate and display "Total Fasts" as count of all entries for the user (from Entry model)
- [ ] **FR-013**: Dashboard MUST calculate and display "Average Duration" as mean of all non-null fastingDuration values, only if user has 7+ entries
- [ ] **FR-014**: Average Duration calculation MUST use the existing `getAverageDuration` function from `src/lib/services/entryInsightsService.js`
- [ ] **FR-015**: Streak calculation MUST check for entries on consecutive calendar dates (not 24-hour periods), using date field from Entry model
- [ ] **FR-016**: Statistics MUST be displayed in three separate GlassmorphicCard components arranged horizontally on desktop, vertically on mobile
- [ ] **FR-017**: Each stat card MUST show an icon (🔥 for streak, 📊 for total fasts, ⏱️ for average), the metric value, and a descriptive label

### Recent History (User Story 3 - P2)

- [ ] **FR-018**: Dashboard MUST display the 5 most recent entries sorted by date descending
- [ ] **FR-019**: Each recent entry MUST display: formatted date (e.g., "Jan 30, 2025"), fastingDuration (e.g., "16h 30m"), and optionally goalStatus icon
- [ ] **FR-020**: Entries with goalStatus "completed" MUST show a green checkmark icon (✅)
- [ ] **FR-021**: Entries with goalStatus "not-completed" MUST show a yellow warning icon (⚠️)
- [ ] **FR-022**: Entries with fastingDuration > 1440 minutes (24 hours) MUST display an "Extended Fast" badge
- [ ] **FR-023**: Each entry in recent history MUST be clickable, navigating to `/entries/[id]` (entry details page)
- [ ] **FR-024**: Recent history MUST fetch entries using GET `/api/entries?limit=5` endpoint
- [ ] **FR-025**: If user has fewer than 5 entries, remaining slots MUST show gradient placeholder cards with encouraging text

### Progress Visualization (User Story 4 - P3)

- [ ] **FR-026**: Dashboard MUST display a line chart showing fastingDuration (Y-axis) over date (X-axis) for the last 30 days
- [ ] **FR-027**: Chart MUST only render if user has 7+ entries; otherwise display gradient placeholder with "Create 7+ entries to see trends"
- [ ] **FR-028**: Chart MUST use a React charting library (e.g., Recharts, Chart.js, or Victory) compatible with Next.js 15 and Server/Client Components
- [ ] **FR-029**: Chart MUST use purple-pink-indigo gradient colors matching Feature 023 design system
- [ ] **FR-030**: Chart MUST show tooltips on hover displaying exact date and duration
- [ ] **FR-031**: Chart MUST provide toggle tabs for "Weekly" vs "Monthly" aggregation (P3 - can be deferred to v2)
- [ ] **FR-032**: Chart MUST be fully responsive, adapting to screen sizes from 375px (mobile) to 1440px+ (desktop)

### Quick Actions (User Story 5 - P2)

- [ ] **FR-033**: Dashboard MUST display three quick action buttons: "Create Entry", "View All Entries", "Settings"
- [ ] **FR-034**: "Create Entry" button MUST navigate to `/entries` with query param `?openForm=true` to trigger entry form modal
- [ ] **FR-035**: "View All Entries" button MUST navigate to `/entries` page
- [ ] **FR-036**: "Settings" button MUST navigate to `/settings` page
- [ ] **FR-037**: All quick action buttons MUST use GradientButton component from Feature 023
- [ ] **FR-038**: Quick actions MUST be arranged horizontally on desktop (≥768px) and vertically on mobile (<768px)

### Design System Compliance (User Story 6 - P1)

- [ ] **FR-039**: Dashboard MUST use GlassmorphicCard component (from `src/components/atoms/GlassmorphicCard.js`) for all card elements
- [ ] **FR-040**: Dashboard MUST use GradientButton component (from `src/components/atoms/GradientButton.js`) for all CTA buttons
- [ ] **FR-041**: Dashboard page background MUST use gradient: `bg-gradient-to-br from-purple-50 via-white to-pink-50`
- [ ] **FR-042**: Dashboard MUST include decorative blur orbs (400-600px size) with purple (#9333EA), pink (#EC4899), and indigo (#6366F1) colors
- [ ] **FR-043**: All dashboard headings MUST use gradient text styles: `bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2`
- [ ] **FR-044**: All interactive elements MUST use smooth transitions: `transition-all duration-300`
- [ ] **FR-045**: Hover states MUST apply scale-up (hover:scale-105) and enhanced shadows (hover:shadow-2xl)
- [ ] **FR-046**: Empty/placeholder states MUST use gradient backgrounds (`from-purple-50 to-pink-50`) instead of gray

### Data Integration

- [ ] **FR-047**: Dashboard MUST fetch user's entries using GET `/api/entries` endpoint with authentication
- [ ] **FR-048**: Dashboard MUST use existing Entry model schema fields: userId, date, firstMealTime, lastMealTime, fastingDuration, goalStatus
- [ ] **FR-049**: Dashboard MUST use NextAuth session to identify authenticated user (session.user.id)
- [ ] **FR-050**: All database queries MUST filter by userId to ensure data isolation between users
- [ ] **FR-051**: Dashboard MUST handle empty state gracefully when user has zero entries
- [ ] **FR-052**: Dashboard MUST use existing utility functions: `calculateElapsedTime`, `formatElapsedTime`, `getActiveFast` from `src/lib/utils/fastingTimerUtils.js`

### Performance & Responsiveness

- [ ] **FR-053**: Dashboard initial load MUST complete server-side data fetching in <2 seconds for users with <100 entries
- [ ] **FR-054**: Timer updates MUST occur client-side without triggering full page re-renders
- [ ] **FR-055**: Dashboard MUST be fully responsive across breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px+ (desktop)
- [ ] **FR-056**: Dashboard MUST use Next.js Image component for any icons or decorative images (with proper width/height)
- [ ] **FR-057**: Dashboard MUST implement proper loading states for async data fetches (skeleton cards or spinners)

### Error Handling

- [ ] **FR-058**: Dashboard MUST display user-friendly error messages if API calls fail (e.g., "Unable to load entries. Please try again.")
- [ ] **FR-059**: Dashboard MUST provide "Retry" buttons for failed data fetches
- [ ] **FR-060**: Dashboard MUST gracefully handle missing or invalid data (e.g., entries with null values)
- [ ] **FR-061**: Dashboard MUST log errors to console for debugging but NOT expose technical details to users

## User Stories Acceptance

### US1: View Current Fast Status (P1) ✅

- [ ] Active fast shows live timer counting up
- [ ] Completed fast shows "Start New Fast" button
- [ ] No entry for today shows "Start New Fast" button
- [ ] Timer updates every second
- [ ] Timer card has glassmorphic styling with hover effects

### US2: View Key Statistics (P2) ✅

- [ ] Current streak calculates correctly from consecutive days
- [ ] Total fasts counts all entries
- [ ] Average duration shows mean of 7+ entries
- [ ] Stats use gradient placeholder for empty states
- [ ] Stat cards have glassmorphic styling with hover effects

### US3: View Recent Fasting History (P2) ✅

- [ ] Shows 5 most recent entries sorted by date descending
- [ ] Each entry displays date and duration
- [ ] goalStatus icons display correctly (✅ for completed, ⚠️ for not-completed)
- [ ] Extended fasts (>24h) show badge
- [ ] Entries are clickable and navigate to details page
- [ ] Empty slots show gradient placeholders

### US4: View Progress Visualization (P3) ✅

- [ ] Line chart renders for users with 7+ entries
- [ ] Chart shows 30 days of data with date and duration
- [ ] Chart uses purple-pink-indigo gradient colors
- [ ] Tooltips show exact date and duration on hover
- [ ] Chart is responsive across all screen sizes
- [ ] Empty state shows gradient placeholder with message

### US5: Access Quick Actions (P2) ✅

- [ ] "Create Entry" button navigates with ?openForm=true param
- [ ] "View All Entries" button navigates to /entries
- [ ] "Settings" button navigates to /settings
- [ ] All buttons use GradientButton component
- [ ] Buttons stack vertically on mobile, horizontally on desktop

### US6: Experience Consistent Design System (P1) ✅

- [ ] All cards use GlassmorphicCard component
- [ ] All buttons use GradientButton component
- [ ] Page background matches Feature 023 gradient
- [ ] Decorative blur orbs present
- [ ] Headings use gradient text with pb-2
- [ ] Hover states use scale-105 and shadow-2xl
- [ ] Empty states use gradient backgrounds (not gray)

## Edge Cases Coverage

- [ ] User with exactly 1 entry shows appropriate states
- [ ] Deleting only entry updates dashboard reactively
- [ ] Active fast >7 days shows warning message
- [ ] Streak calculation handles gaps correctly
- [ ] Null fastingDuration entries handled gracefully
- [ ] Mobile layout works at 375px width
- [ ] Session expiry redirects to /login with return URL
- [ ] "Create Entry" when today exists opens edit mode
- [ ] API failures show error states with retry buttons
- [ ] Timezone handling uses browser local time

## Success Criteria Validation

- [ ] **SC-001**: 90% of users land on /dashboard after login
- [ ] **SC-002**: Dashboard loads in <2 seconds for users with <100 entries
- [ ] **SC-003**: Timer updates every second with no lag
- [ ] **SC-004**: Active fast timer visible immediately on page load
- [ ] **SC-005**: 95% of users identify streak within 5 seconds
- [ ] **SC-006**: Navigation to /entries or /settings in 1 click
- [ ] **SC-007**: New users see empty states within 2 seconds
- [ ] **SC-008**: Dashboard functional at 375px width
- [ ] **SC-009**: All components match Feature 023 design
- [ ] **SC-010**: Chart renders 30 days in <1 second
- [ ] **SC-011**: Entry click navigates in <500ms
- [ ] **SC-012**: API failures don't crash page
- [ ] **SC-013**: 80% of new users create first entry same session
- [ ] **SC-014**: Zero console errors in production build
- [ ] **SC-015**: Passes WCAG 2.1 accessibility checks

## Specification Quality Checklist

- [x] All user stories have assigned priorities (P1/P2/P3)
- [x] Each user story is independently testable
- [x] Acceptance scenarios use Given/When/Then format
- [x] Functional requirements are specific and measurable
- [x] No [NEEDS CLARIFICATION] markers present (all requirements clear)
- [x] Key entities are documented with relationships
- [x] Success criteria are measurable and technology-agnostic
- [x] Edge cases are comprehensive and documented
- [x] Design integration requirements are explicit
- [x] Existing codebase patterns are referenced (components, utilities, services)

## Notes

**Integration Points**:
- Existing Entry model (no schema changes)
- Existing FastingTimerCard component (reusable)
- Existing entryInsightsService (getAverageDuration function)
- Existing fastingTimerUtils (calculateElapsedTime, formatElapsedTime, getActiveFast)
- Feature 023 components (GlassmorphicCard, GradientButton)
- NextAuth session management
- Existing `/api/entries` endpoint

**New Components Required**:
- `src/app/dashboard/page.js` (Server Component)
- `src/components/organisms/DashboardStats.js` (Client Component for stats cards)
- `src/components/organisms/RecentFastsList.js` (Client Component for recent history)
- `src/components/organisms/DashboardChart.js` (Client Component for progress chart)
- `src/components/organisms/QuickActions.js` (Client Component for action buttons)
- Optionally: `src/lib/services/dashboardService.js` (streak calculation logic)

**Dependencies**:
- Next.js 15.5.6 (already installed)
- NextAuth v5 (already installed)
- React 18 (already installed)
- Recharts or Chart.js (need to install for FR-028)
- date-fns (already installed)

**Middleware Update Required**:
- Modify `src/middleware.js` to redirect authenticated users from `/` to `/dashboard` (FR-001)

**Ready for Planning**: ✅ This specification is complete and ready to proceed to `speckit.plan` phase.
