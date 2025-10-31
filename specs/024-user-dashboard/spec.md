# Feature Specification: User Dashboard

**Feature Branch**: `024-user-dashboard`  
**Created**: 2025-01-30  
**Status**: Draft  
**Input**: User description: "Create a modern, personalized dashboard for authenticated users featuring current fast timer, stats, recent fasts, and charts. Must match Feature 023 glassmorphic design."

## Clarifications

### Session 2025-10-30

- Q: Should the recent history section show exactly 5 entries, or should it be configurable (5-7) based on screen size or user preference? → A: Always show exactly 5 entries (matching FR-018, FR-024, FR-025)
- Q: Should the streak count start from today (breaking if no entry exists for today), or from the most recent entry date in the database? → A: Start from most recent entry - count backward from that date
- Q: Which charting library should be used for the progress visualization? → A: Recharts (React-first, TypeScript support, 2.12.7 compatible with React 18)
- Q: Should loading states use skeleton cards (shape placeholders) or spinners? → A: Skeleton cards (animated glassmorphic card shapes matching final layout)

## Overview

**Problem**: Currently, authenticated users land on the marketing homepage or navigate directly to `/entries`. There is no centralized dashboard showing their current fasting status, progress, or quick access to key actions. Users must navigate to different pages to understand their fasting journey at a glance.

**Solution**: Create a personalized user dashboard at `/dashboard` that serves as the main hub for authenticated users. The dashboard displays current fast status (active timer or "Start New Fast" CTA), key statistics (streak, total fasts, average duration), recent fasting history, progress charts, and quick action buttons. For new users with no data, the dashboard shows encouraging placeholder content with gradient backgrounds and calls-to-action.

**Value Proposition**: 
- **Immediate Context**: Users see their fasting status instantly upon login
- **Motivation**: Streak counter and stats encourage consistency
- **Efficiency**: Quick actions reduce clicks to common tasks
- **Progress Tracking**: Visual charts show trends and improvements
- **New User Onboarding**: Empty states guide first-time users to create their first entry

**Design Integration**: The dashboard MUST match the glassmorphic design system from Feature 023, using:
- GlassmorphicCard component for all cards
- GradientButton component for CTAs
- Purple-pink-indigo gradient palette (#9333EA, #EC4899, #6366F1)
- Decorative blur orbs (400-600px)
- Gradient headings with `pb-2` padding
- Smooth micro-interactions and hover states

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Fast Status (Priority: P1)

As an authenticated user, when I navigate to the dashboard, I want to immediately see if I'm currently fasting or not, so I can understand my current status and take appropriate action.

**Why this priority**: This is the most critical feature because it provides immediate, actionable context to users. Without this, the dashboard has no unique value over the existing `/entries` page. The ability to see "Am I fasting right now?" is the primary reason users open a fasting app.

**Independent Test**: Can be fully tested by creating entries with various lastMealTime values and verifying the dashboard shows either an active timer (counting up from last meal) or a "Start New Fast" button. Delivers standalone value as a status display even without other features.

**Acceptance Scenarios**:

1. **Given** I have an entry for today with lastMealTime set but no firstMealTime, **When** I visit `/dashboard`, **Then** I see a live fasting timer counting up from my last meal time with hours and minutes displayed
2. **Given** I have an entry for today with both lastMealTime and firstMealTime set (completed fast), **When** I visit `/dashboard`, **Then** I see a "Start New Fast" button in a glassmorphic card
3. **Given** I have no entries for today, **When** I visit `/dashboard`, **Then** I see a "Start New Fast" button with encouraging copy about beginning my fasting journey
4. **Given** I'm actively fasting and viewing the dashboard, **When** time passes, **Then** the timer updates every second without page refresh
5. **Given** I'm viewing an active fast timer, **When** I hover over the timer card, **Then** I see subtle scale-up animation and enhanced shadow (Feature 023 pattern)

---

### User Story 2 - View Key Statistics (Priority: P2)

As an authenticated user with fasting history, I want to see my key statistics (current streak, total fasts, average duration) displayed prominently on the dashboard, so I can track my progress and stay motivated.

**Why this priority**: Statistics provide motivation and context but aren't actionable like US1. Users can still use the app effectively without seeing stats, but stats significantly increase engagement and retention. This is secondary to knowing current fast status.

**Independent Test**: Can be tested by creating multiple entries with varying dates and durations, then verifying the dashboard calculates and displays streak (consecutive days with entries), total fasts (count of all entries), and average duration (mean of all fastingDuration values). Delivers value as a progress tracker even if timer (US1) or charts (US4) aren't implemented.

**Acceptance Scenarios**:

1. **Given** I have entries on consecutive days (e.g., Jan 28, 29, 30), **When** I visit `/dashboard`, **Then** I see a "Current Streak" stat card showing "3 days" with a flame emoji (🔥)
2. **Given** I have 15 total entries in my history, **When** I visit `/dashboard`, **Then** I see a "Total Fasts" stat card showing "15 fasts"
3. **Given** I have at least 7 entries with varying durations, **When** I visit `/dashboard`, **Then** I see an "Average Duration" stat card showing the mean duration (e.g., "16h 30m")
4. **Given** I have fewer than 7 entries, **When** I visit `/dashboard`, **Then** the "Average Duration" card shows "Need 7+ entries" as a placeholder
5. **Given** I have no entries at all, **When** I visit `/dashboard`, **Then** all stat cards show gradient placeholder backgrounds with "0 days", "0 fasts", and "Start tracking" messages
6. **Given** I'm viewing the stats section, **When** I hover over any stat card, **Then** the card shows a subtle lift effect with glassmorphic backdrop-blur-xl (Feature 023 pattern)

---

### User Story 3 - View Recent Fasting History (Priority: P2)

As an authenticated user, I want to see my recent fasts (last 5 entries) on the dashboard with duration and date, so I can quickly review my recent activity without navigating to the full entries list.

**Why this priority**: Recent history provides quick context and verification that entries were logged correctly. It's less critical than current status (US1) and stats (US2) because users can always navigate to `/entries` for full history. However, it's more valuable than charts (US4) because it shows actual data points users can verify.

**Independent Test**: Can be tested by creating 10 entries, then verifying the dashboard shows only the 5 most recent ones sorted by date descending. Each entry should display date, duration, and optionally a rating or icon. Delivers value as a quick history preview even without timer, stats, or charts.

**Acceptance Scenarios**:

1. **Given** I have 10 entries in my history, **When** I visit `/dashboard`, **Then** I see the 5 most recent entries listed with date and duration
2. **Given** an entry has a goalStatus of "completed", **When** viewing recent history, **Then** I see a green checkmark icon next to that entry
3. **Given** an entry has a goalStatus of "not-completed", **When** viewing recent history, **Then** I see a yellow warning icon next to that entry
4. **Given** an entry has fastingDuration > 24 hours (1440 minutes), **When** viewing recent history, **Then** I see an "Extended Fast" badge on that entry
5. **Given** I have only 3 entries total, **When** I visit `/dashboard`, **Then** I see all 3 entries plus 2 gradient placeholder slots with "No more entries yet" text
6. **Given** I have no entries, **When** I visit `/dashboard`, **Then** I see 5 gradient placeholder slots with encouraging messages like "Your first fast will appear here"
7. **Given** I'm viewing recent history, **When** I click on any entry, **Then** I navigate to the entry details page (`/entries/[id]`)

---

### User Story 4 - View Progress Visualization (Priority: P3)

As an authenticated user with sufficient data (7+ entries), I want to see a visual chart showing my fasting duration trends over time, so I can identify patterns and see my progress visually.

**Why this priority**: Charts are valuable for pattern identification but require sufficient data to be meaningful. They're non-essential for core functionality and can be added later without impacting basic dashboard usability. Users with fewer than 7 entries won't benefit from charts, making this a P3 feature.

**Independent Test**: Can be tested by creating 30 entries with varying durations, then verifying a line chart renders showing date on X-axis and duration on Y-axis. Chart should be responsive and use the gradient color scheme. Delivers value as trend visualization even if other features aren't complete.

**Acceptance Scenarios**:

1. **Given** I have 30 entries spanning the last month, **When** I visit `/dashboard`, **Then** I see a line chart showing fasting duration over time with purple-pink gradient styling
2. **Given** I have fewer than 7 entries, **When** I visit `/dashboard`, **Then** I see a gradient placeholder chart with text "Create 7+ entries to see trends"
3. **Given** I'm viewing the chart, **When** I hover over a data point, **Then** I see a tooltip showing the exact date and duration
4. **Given** the chart is visible, **When** I resize my browser window, **Then** the chart remains responsive and readable on all screen sizes (375px to 1440px+)
5. **Given** I have chart data, **When** I toggle between "Weekly" and "Monthly" view tabs, **Then** the chart updates to show aggregated data for the selected time period

---

### User Story 5 - Access Quick Actions (Priority: P2)

As an authenticated user, I want quick access buttons for common tasks (create entry, view all entries, settings) directly on the dashboard, so I can navigate efficiently without using the main navigation menu.

**Why this priority**: Quick actions improve efficiency and reduce friction for common tasks. They're important for user experience but not critical for core dashboard functionality. Users can always use the main navigation, making this a P2 convenience feature.

**Independent Test**: Can be tested by clicking each quick action button and verifying correct navigation occurs. Buttons should use GradientButton component from Feature 023. Delivers value as navigation shortcuts even without other dashboard features.

**Acceptance Scenarios**:

1. **Given** I'm on the dashboard, **When** I click "Create Entry" button, **Then** I navigate to `/entries` with the entry form modal automatically opened
2. **Given** I'm on the dashboard, **When** I click "View All Entries" button, **Then** I navigate to `/entries` page
3. **Given** I'm on the dashboard, **When** I click "Settings" button, **Then** I navigate to `/settings` page
4. **Given** I'm viewing quick actions, **When** I hover over any button, **Then** the button shows scale-up animation and shadow enhancement (Feature 023 pattern)
5. **Given** I'm on mobile (< 768px), **When** I view quick actions, **Then** buttons stack vertically and remain fully clickable with adequate touch targets (min 44px height)

---

### User Story 6 - Experience Consistent Design System (Priority: P1)

As a user familiar with the new homepage design (Feature 023), I expect the dashboard to maintain the same visual language and interactions, so the experience feels cohesive and professional.

**Why this priority**: Design consistency is critical for perceived quality and user trust. If the dashboard uses different components or styling than the public pages, it will feel like a different application. This is P1 because it affects every other user story.

**Independent Test**: Can be visually tested by comparing dashboard components to Feature 023 components. All cards should use GlassmorphicCard, all buttons should use GradientButton, color palette should match exactly. Delivers value as brand consistency even if individual features aren't complete.

**Acceptance Scenarios**:

1. **Given** I'm viewing the dashboard, **When** I inspect any card component, **Then** it uses the GlassmorphicCard component with backdrop-blur-xl, bg-white/80, and border border-white/50
2. **Given** I'm viewing the dashboard, **When** I inspect any button component, **Then** it uses GradientButton with the purple-pink-indigo gradient (from-purple-600 via-pink-600 to-indigo-600)
3. **Given** I'm viewing the dashboard, **When** I inspect the page background, **Then** it uses the same gradient background as Feature 023 (bg-gradient-to-br from-purple-50 via-white to-pink-50)
4. **Given** I'm viewing the dashboard, **When** I inspect heading typography, **Then** headings use gradient text with pb-2 padding matching Feature 023 style
5. **Given** I'm viewing the dashboard, **When** I look for decorative elements, **Then** I see blur orbs (400-600px size, purple/pink/indigo colors) positioned as background decoration
6. **Given** I'm interacting with any dashboard element, **When** I hover or click, **Then** micro-interactions (scale, shadow, transition-all duration-300) match Feature 023 patterns
7. **Given** I'm viewing placeholder states, **When** I inspect empty cards, **Then** they use gradient backgrounds (from-purple-50 to-pink-50) instead of gray placeholders

---

### Edge Cases

- **What happens when a user has exactly 1 entry?** The streak shows "1 day", total fasts shows "1 fast", average duration shows "Need 7+ entries", recent history shows 1 entry plus 4 gradient placeholders, and no chart is displayed.

- **What happens when a user deletes their only entry while viewing the dashboard?** All statistics reset to zero/empty states, the dashboard should update reactively or show a message prompting page refresh.

- **What happens if the active fast has been running for more than 7 days (168 hours)?** The timer continues to count but displays a warning message like "Extended fast detected - Please consult your healthcare provider for fasts exceeding 7 days."

- **What happens when calculating streak and there's a gap in entries (e.g., Jan 28, 30 missing Jan 29)?** The streak resets to count only consecutive days from the most recent entry backward. So if entries exist on Jan 30, 31, Feb 1, the streak is 3 days (not counting Jan 28). Note: If today is Feb 2 with no entry yet, the streak still counts from Feb 1 backward (user hasn't broken streak by not logging today yet).

- **What happens if a user has entries but all have null fastingDuration?** Total fasts count is still accurate, but average duration shows "Need valid durations", and chart shows placeholder state.

- **What happens on mobile devices when all dashboard cards are visible?** Cards stack vertically in single column layout, maintaining 16px spacing. Timer card appears first, followed by stats (also stacked), then recent history, then chart, then quick actions.

- **What happens when the user's session expires while viewing the dashboard?** NextAuth redirects to `/login` with a return URL of `/dashboard`, so after re-authenticating they land back on the dashboard.

- **What happens when clicking "Create Entry" and today's entry already exists?** The `/entries` page opens with the entry form in "edit mode" for today's entry instead of create mode.

- **What happens when the dashboard API calls fail (network error, server error)?** Each section that depends on data shows an error state with a "Retry" button. The page doesn't crash; only the affected section displays the error.

- **What happens for users in different timezones?** All dates and times are displayed in the user's local timezone (browser timezone). The "today" determination uses local date, so a user in Tokyo starting a fast at 11 PM Jan 30 won't show as "tomorrow" even though it's Jan 31 in UTC.

## Requirements *(mandatory)*

### Functional Requirements

**Dashboard Access & Navigation**

- **FR-001**: System MUST redirect authenticated users from the homepage (`/`) to the user dashboard (`/dashboard`) automatically via middleware (Note: Task 1 will migrate existing admin section from `/dashboard` to `/admin`)
- **FR-002**: System MUST redirect unauthenticated users attempting to access `/dashboard` to the login page (`/login`)
- **FR-003**: Dashboard MUST be accessible at the route `/dashboard` using Next.js App Router structure
- **FR-004**: Dashboard page MUST render as a Server Component for initial data load, with Client Components for interactive elements (timer, charts)

**Current Fast Status (User Story 1)**

- **FR-005**: Dashboard MUST display a live fasting timer when today's entry has lastMealTime but no firstMealTime (active fast)
- **FR-006**: Timer MUST update every second showing elapsed time in format "Xh Ym" (e.g., "16h 32m")
- **FR-007**: Dashboard MUST calculate elapsed time using the existing `calculateElapsedTime` function from `src/lib/utils/fastingTimerUtils.js`
- **FR-008**: Dashboard MUST display a "Start New Fast" button when no active fast exists (no entry for today, or today's entry is complete)
- **FR-009**: Timer card MUST use the existing FastingTimerCard component from `src/components/organisms/FastingTimerCard.js` or create a new DashboardTimerCard variant
- **FR-010**: Timer card MUST be wrapped in GlassmorphicCard component from Feature 023

**Statistics Display (User Story 2)**

- **FR-011**: Dashboard MUST calculate and display "Current Streak" as count of consecutive days with entries, starting from most recent date backward
- **FR-012**: Dashboard MUST calculate and display "Total Fasts" as count of all entries for the user (from Entry model)
- **FR-013**: Dashboard MUST calculate and display "Average Duration" as mean of all non-null fastingDuration values, only if user has 7+ entries
- **FR-014**: Average Duration calculation MUST use the existing `getAverageDuration` function from `src/lib/services/entryInsightsService.js`
- **FR-015**: Streak calculation MUST check for entries on consecutive calendar dates (not 24-hour periods), using date field from Entry model, counting backward from the most recent entry date (not today)
- **FR-016**: Statistics MUST be displayed in three separate GlassmorphicCard components arranged horizontally on desktop, vertically on mobile
- **FR-017**: Each stat card MUST show an icon (🔥 for streak, 📊 for total fasts, ⏱️ for average), the metric value, and a descriptive label

**Recent History (User Story 3)**

- **FR-018**: Dashboard MUST display the 5 most recent entries sorted by date descending
- **FR-019**: Each recent entry MUST display: formatted date (e.g., "Jan 30, 2025"), fastingDuration (e.g., "16h 30m"), and optionally goalStatus icon
- **FR-020**: Entries with goalStatus "completed" MUST show a green checkmark icon (✅)
- **FR-021**: Entries with goalStatus "not-completed" MUST show a yellow warning icon (⚠️)
- **FR-022**: Entries with fastingDuration > 1440 minutes (24 hours) MUST display an "Extended Fast" badge
- **FR-023**: Each entry in recent history MUST be clickable, navigating to `/entries/[id]` (entry details page)
- **FR-024**: Recent history MUST fetch entries using GET `/api/entries?limit=5` endpoint
- **FR-025**: If user has fewer than 5 entries, remaining slots MUST show gradient placeholder cards with encouraging text

**Progress Visualization (User Story 4)**

- **FR-026**: Dashboard MUST display a line chart showing fastingDuration (Y-axis) over date (X-axis) for the last 30 days
- **FR-027**: Chart MUST only render if user has 7+ entries; otherwise display gradient placeholder with "Create 7+ entries to see trends"
- **FR-028**: Chart MUST use Recharts library (version 2.12.7 or compatible) for React 18 and Next.js 15 Server/Client Component compatibility
- **FR-029**: Chart MUST use purple-pink-indigo gradient colors matching Feature 023 design system
- **FR-030**: Chart MUST show tooltips on hover displaying exact date and duration
- **FR-031**: Chart MUST provide toggle tabs for "Weekly" vs "Monthly" aggregation (P3 - can be deferred to v2)
- **FR-032**: Chart MUST be fully responsive, adapting to screen sizes from 375px (mobile) to 1440px+ (desktop)

**Quick Actions (User Story 5)**

- **FR-033**: Dashboard MUST display three quick action buttons: "Create Entry", "View All Entries", "Settings"
- **FR-034**: "Create Entry" button MUST navigate to `/entries` with query param `?openForm=true` to trigger entry form modal
- **FR-035**: "View All Entries" button MUST navigate to `/entries` page
- **FR-036**: "Settings" button MUST navigate to `/settings` page
- **FR-037**: All quick action buttons MUST use GradientButton component from Feature 023
- **FR-038**: Quick actions MUST be arranged horizontally on desktop (≥768px) and vertically on mobile (<768px)

**Design System Compliance (User Story 6)**

- **FR-039**: Dashboard MUST use GlassmorphicCard component (from `src/components/atoms/GlassmorphicCard.js`) for all card elements
- **FR-040**: Dashboard MUST use GradientButton component (from `src/components/atoms/GradientButton.js`) for all CTA buttons
- **FR-041**: Dashboard page background MUST use gradient: `bg-gradient-to-br from-purple-50 via-white to-pink-50`
- **FR-042**: Dashboard MUST include decorative blur orbs (400-600px size) with purple (#9333EA), pink (#EC4899), and indigo (#6366F1) colors
- **FR-043**: All dashboard headings MUST use gradient text styles: `bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2`
- **FR-044**: All interactive elements MUST use smooth transitions: `transition-all duration-300`
- **FR-045**: Hover states MUST apply scale-up (hover:scale-105) and enhanced shadows (hover:shadow-2xl)
- **FR-046**: Empty/placeholder states MUST use gradient backgrounds (`from-purple-50 to-pink-50`) instead of gray

**Data Integration**

- **FR-047**: Dashboard MUST fetch user's entries using GET `/api/entries` endpoint with authentication
- **FR-048**: Dashboard MUST use existing Entry model schema fields: userId, date, firstMealTime, lastMealTime, fastingDuration, goalStatus
- **FR-049**: Dashboard MUST use NextAuth session to identify authenticated user (session.user.id)
- **FR-050**: All database queries MUST filter by userId to ensure data isolation between users
- **FR-051**: Dashboard MUST handle empty state gracefully when user has zero entries
- **FR-052**: Dashboard MUST use existing utility functions: `calculateElapsedTime`, `formatElapsedTime`, `getActiveFast` from `src/lib/utils/fastingTimerUtils.js`

**Performance & Responsiveness**

- **FR-053**: Dashboard initial load MUST complete server-side data fetching in <2 seconds for users with <100 entries
- **FR-054**: Timer updates MUST occur client-side without triggering full page re-renders
- **FR-055**: Dashboard MUST be fully responsive across breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px+ (desktop)
- **FR-056**: Dashboard MUST use Next.js Image component for any icons or decorative images (with proper width/height)
- **FR-057**: Dashboard MUST implement skeleton loading states (animated glassmorphic card shapes matching final layout) for async data fetches to improve perceived performance

**Error Handling**

- **FR-058**: Dashboard MUST display user-friendly error messages if API calls fail (e.g., "Unable to load entries. Please try again.")
- **FR-059**: Dashboard MUST provide "Retry" buttons for failed data fetches
- **FR-060**: Dashboard MUST gracefully handle missing or invalid data (e.g., entries with null values)
- **FR-061**: Dashboard MUST log errors to console for debugging but NOT expose technical details to users

### Key Entities

- **Entry**: Existing Mongoose model representing a daily fasting log. Key fields: `_id` (ObjectId), `userId` (ObjectId), `date` (Date), `firstMealTime` (String HH:mm), `lastMealTime` (String HH:mm), `fastingDuration` (Number in minutes), `goalStatus` (String: "completed"|"not-completed"|"no-goal"), `createdAt` (Date), `updatedAt` (Date). Stored in `entries` collection. Unique constraint on userId + date.

- **DashboardStats**: Computed object (not persisted) containing aggregated user statistics. Fields: `currentStreak` (Number of consecutive days), `totalFasts` (Number of entries), `averageDuration` (Number in minutes, null if <7 entries). Calculated on-demand from Entry collection.

- **DashboardView**: The main dashboard page component. Composition of sub-components: TimerCard (current fast status), StatsCards (3 cards for streak/total/average), RecentHistoryList (5 recent entries), ProgressChart (30-day trend), QuickActionsBar (3 navigation buttons). Rendered at `/dashboard` route.

- **User**: Existing NextAuth user from session. Fields referenced: `id` (used for filtering entries), `name` (optional display), `email` (optional display). No schema changes required.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of authenticated users land on `/dashboard` as their first page after login (middleware redirect successful)
- **SC-002**: Dashboard page loads and renders initial content in under 2 seconds for users with up to 100 entries (server-side data fetch + hydration)
- **SC-003**: Live fasting timer updates every second with no perceptible lag or UI flicker (client-side timer efficiency)
- **SC-004**: Users with active fasts can see their elapsed time immediately upon page load (no loading spinner for timer card)
- **SC-005**: 95% of users can correctly identify their current streak within 5 seconds of viewing the dashboard (stat card visibility and clarity)
- **SC-006**: Users can navigate to `/entries` or `/settings` from the dashboard in 1 click (quick actions functionality)
- **SC-007**: New users (0 entries) see encouraging empty state messages within 2 seconds of page load (empty state UX)
- **SC-008**: Dashboard remains fully functional and readable on screens as small as 375px width (mobile responsiveness)
- **SC-009**: All dashboard components match Feature 023 design system (GlassmorphicCard, GradientButton, gradients, blur orbs) as verified by visual regression testing
- **SC-010**: Dashboard chart (when visible) renders 30 days of data in under 1 second after user has sufficient entries (chart performance)
- **SC-011**: Users can click any recent entry and navigate to its details page in under 500ms (entry click responsiveness)
- **SC-012**: Dashboard handles API failures gracefully with "Retry" buttons, preventing full page crashes (error resilience)
- **SC-013**: 80% of users who view the dashboard for the first time successfully create their first entry within the same session (conversion rate via "Start New Fast" CTA)
- **SC-014**: Dashboard page generates zero console errors in production build (code quality)
- **SC-015**: Dashboard passes all accessibility checks with no critical WCAG 2.1 violations (keyboard navigation, screen reader support, color contrast)
