# Feature Specification: Entry Details Page Enhancement

**Feature Branch**: `025-entry-details-enhancement`  
**Created**: October 31, 2025  
**Status**: Draft  
**Input**: User description: "Enhance the entry details page to display comprehensive fasting information with personalized insights and contextual analysis, styled with the modern glassmorphic design system recently implemented across the dashboard and entries pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Beautifully Styled Entry Details (Priority: P1)

A user clicks on an entry from their entries list and sees a comprehensive, visually stunning detail page that displays all entry information using the modern glassmorphic design system with purple-pink-indigo gradients, making their fasting data feel engaging and motivating rather than clinical.

**Why this priority**: This is the foundation of the feature - without the redesigned UI, there's no visual impact. The glassmorphic styling creates emotional engagement and consistency with the recently updated dashboard and entries pages. Users need to see their data beautifully presented before insights add value.

**Independent Test**: Can be fully tested by navigating to any existing entry detail page and verifying the new design system is applied (gradient background, glassmorphic cards, proper spacing, gradient buttons) without requiring any insight calculations.

**Acceptance Scenarios**:

1. **Given** a user is on the entries list page, **When** they click on any entry, **Then** they see the entry details page with a purple-pink-indigo gradient background (from-purple-50 via-pink-50 to-indigo-50)
2. **Given** a user is viewing entry details, **When** the page loads, **Then** all data cards use glassmorphic styling (backdrop-blur-md, bg-white/70, rounded-2xl, shadow-xl, border-white/20)
3. **Given** a user views the fasting duration, **When** displayed on the page, **Then** it uses gradient text styling (from-purple-600 to-pink-600) with prominent visual emphasis
4. **Given** a user views wellness metrics (energy, wellbeing, hunger), **When** rendered, **Then** each displays with appropriate emoji indicators and gradient-styled labels
5. **Given** a user sees action buttons (Edit, Delete, Back), **When** viewing them, **Then** primary actions use purple-pink gradient styling and secondary actions use white with border styling matching the dashboard
6. **Given** a user views their weight data, **When** weight is recorded, **Then** it displays with a trend arrow (↑↓) and gradient styling if available from comparison data

---

### User Story 2 - See Personalized Insights and Patterns (Priority: P1)

A user viewing an entry sees contextual insights comparing this fast to their historical data, such as "This is your 3rd longest fast" or "You typically fast 2 hours longer on weekends", helping them understand patterns and feel motivated by their progress.

**Why this priority**: Insights are the core value-add of this enhancement. Without personalized analysis, the page is just styled data display. These insights drive engagement, motivation, and self-understanding - key to habit formation and retention.

**Independent Test**: Can be fully tested by viewing entries with sufficient historical data (at least 10 entries) and verifying insights appear in gradient-styled callout boxes with accurate pattern analysis calculated from the user's data.

**Acceptance Scenarios**:

1. **Given** a user has at least 10 historical entries, **When** they view any entry detail page, **Then** they see a contextual insights section with gradient-styled callout boxes (from-purple-50 to-pink-50 border with border-purple-200)
2. **Given** a user's current entry is among their top 5 longest fasts, **When** viewing the insights, **Then** they see "This is your [rank] longest fast" with celebratory emphasis
3. **Given** a user has weekend vs weekday pattern differences >1 hour, **When** viewing a weekend entry, **Then** they see "You typically fast [X] hours [longer/shorter] on weekends" insight
4. **Given** a user has consistent fasting patterns, **When** an entry deviates significantly (>2 hours from average), **Then** they see "This fast is [longer/shorter] than your typical [X] hour pattern" insight
5. **Given** a user's entry contributes to an active streak, **When** viewing insights, **Then** they see "Part of your current [N] day streak 🔥" with gradient styling
6. **Given** a user has insufficient data (<5 entries), **When** viewing insights, **Then** they see an encouraging message "Log more entries to see personalized insights!" with gradient styling

---

### User Story 3 - Compare Entry to Personal Averages (Priority: P2)

A user viewing an entry sees a stats comparison section showing how this specific fast compares to their personal averages (overall average, 30-day average, same-day-of-week average), providing context and benchmarking for their performance.

**Why this priority**: Comparison data adds depth to insights but isn't critical for initial value. Users can understand their patterns from US2 insights alone. However, seeing numerical comparisons enhances motivation and goal-setting, making it important for engagement but not MVP-blocking.

**Independent Test**: Can be fully tested by viewing any entry with at least 30 days of historical data and verifying comparison statistics are calculated accurately and displayed in a visually appealing gradient-styled comparison card.

**Acceptance Scenarios**:

1. **Given** a user has at least 30 days of entries, **When** they view an entry detail page, **Then** they see a "How This Compares" card with glassmorphic styling showing 3 comparison metrics
2. **Given** a user views the comparison section, **When** rendered, **Then** it displays "Overall Average" (all-time), "30-Day Average", and "[Day] Average" (e.g., "Monday Average") with gradient-styled labels
3. **Given** this entry's duration is longer than the comparison average, **When** displayed, **Then** the difference shows with a positive green gradient (from-green-600 to-emerald-600) and upward arrow ↑
4. **Given** this entry's duration is shorter than the comparison average, **When** displayed, **Then** the difference shows with a neutral gray styling and downward arrow ↓
5. **Given** a user has weight data for this entry and historical weight data, **When** viewing comparisons, **Then** weight comparison shows trend direction with appropriate styling
6. **Given** a user has insufficient data for a specific comparison (<5 entries), **When** that comparison would display, **Then** it shows "N/A" with explanation "Log more [day] entries for comparison"

---

### User Story 4 - Navigate Entry Timeline Context (Priority: P2)

A user viewing an entry sees timeline context showing their previous and next entries with quick navigation links, helping them understand the chronological flow of their fasting journey and spot multi-day patterns.

**Why this priority**: Timeline navigation enhances UX but isn't essential for understanding the current entry. Users can always return to the list view to see other entries. However, inline navigation improves browsing efficiency and helps users spot patterns across consecutive days.

**Independent Test**: Can be fully tested by viewing any entry that has both a previous and next entry, verifying navigation links are styled with gradients and function correctly, and edge cases (first/last entries) show appropriate messaging.

**Acceptance Scenarios**:

1. **Given** a user views an entry that has a previous entry, **When** the timeline section renders, **Then** they see a "Previous Entry" card with date, fasting duration, and gradient-styled navigation link
2. **Given** a user views an entry that has a next entry, **When** the timeline section renders, **Then** they see a "Next Entry" card with date, fasting duration, and gradient-styled navigation link
3. **Given** a user clicks a timeline navigation link, **When** clicked, **Then** they navigate to that entry's detail page with the same styling and smooth transition
4. **Given** a user views their very first entry, **When** the timeline section renders, **Then** the "Previous Entry" area shows "This is your first entry 🎉" with gradient styling
5. **Given** a user views their most recent entry, **When** the timeline section renders, **Then** the "Next Entry" area shows "This is your latest entry" with gradient styling
6. **Given** timeline cards are displayed, **When** rendered, **Then** they use compact glassmorphic card styling matching the overall design system

---

### User Story 5 - Edit or Delete Entry with Prominent Actions (Priority: P3)

A user viewing an entry can easily edit or delete it using prominent, beautifully styled action buttons that match the gradient aesthetic, with proper confirmation for destructive actions to prevent accidental data loss.

**Why this priority**: Edit/Delete functionality already exists in the codebase. This story just ensures the buttons are prominently displayed and beautifully styled. While important for UX completeness, the core CRUD operations work without this redesign, making it polish rather than critical functionality.

**Independent Test**: Can be fully tested by clicking Edit/Delete buttons, verifying proper navigation/confirmation, and ensuring button styling matches the gradient design system (purple-pink for edit, red gradient for delete with confirmation modal).

**Acceptance Scenarios**:

1. **Given** a user views their own entry, **When** they see the action buttons, **Then** an "Edit Entry" button displays with purple-pink gradient styling (from-purple-600 to-pink-600) and hover effects
2. **Given** a user clicks the "Edit Entry" button, **When** clicked, **Then** they navigate to the entry edit form (existing functionality) with the button having hover:scale-105 transition
3. **Given** a user sees a "Delete Entry" button, **When** rendered, **Then** it uses white background with red border (border-red-500) and red text for destructive action clarity
4. **Given** a user clicks "Delete Entry", **When** clicked, **Then** a confirmation modal appears with glassmorphic styling asking "Are you sure you want to delete this entry?"
5. **Given** a user confirms deletion, **When** confirmed, **Then** the entry is deleted (existing functionality) and they redirect to entries list with success toast notification
6. **Given** a user views entry details, **When** action buttons are rendered, **Then** a "Back to Entries" link displays with subtle gradient styling as a tertiary action

---

### Edge Cases

- What happens when a user views an entry with no historical data (first entry ever)? → Show encouraging "Start of your journey" message instead of insights with gradient styling
- How does the system handle entries with missing optional fields (no weight, no wellness metrics)? → Show "Not logged" placeholder with muted styling instead of hiding sections entirely
- What happens when insight calculations fail due to database errors? → Show graceful fallback message "Insights temporarily unavailable" without breaking page layout
- How are insights displayed for extended fasts (>24 hours)? → Highlight with special gradient styling and "Extended Fast" badge, emphasize ranking among extended fasts specifically
- What happens when the user has exactly 1 entry (no comparison data)? → Show "Log more entries to see insights" with motivational gradient-styled message box
- How does the timeline navigation work for gaps in entries (user skipped days)? → Display actual previous/next chronological entry regardless of date gaps
- What happens if weight trend data exists but current entry has no weight? → Show trend based on most recent available weight data with timestamp
- How are weekend patterns calculated if user only has weekday entries? → Skip weekend-specific insights if insufficient weekend data (<3 entries)
- What happens when two consecutive entries have the same duration? → Rank insights use "tied for [N]th place" language with gradient styling
- How does the page handle very long food notes (>500 characters)? → Truncate with "Read more" gradient button in glassmorphic card

## Requirements *(mandatory)*

### Functional Requirements

#### Visual Design & Styling (P1)

- **FR-001**: System MUST apply purple-pink-indigo gradient background (from-purple-50 via-pink-50 to-indigo-50) to entry details page container
- **FR-002**: System MUST render all data cards with glassmorphic styling (backdrop-blur-md, bg-white/70, rounded-2xl, shadow-xl, border border-white/20)
- **FR-003**: System MUST display fasting duration with gradient text styling (bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent)
- **FR-004**: System MUST style primary action buttons (Edit) with purple-pink gradient (from-purple-600 to-pink-600) and hover:scale-105 transition
- **FR-005**: System MUST style secondary action buttons (Back) with white background, gray border (border-gray-300), and subtle hover effects
- **FR-006**: System MUST style destructive action button (Delete) with white background, red border (border-red-500), and red text
- **FR-007**: System MUST display wellness metrics (energy, wellbeing, hunger) with emoji indicators (😊 for Good, 😐 for Fair, 😔 for Poor, etc.)
- **FR-008**: System MUST render all insight callout boxes with gradient borders (border-purple-200) and gradient backgrounds (from-purple-50 to-pink-50)
- **FR-009**: System MUST maintain consistent 6-8 unit spacing (gap-6, p-6) throughout the page matching dashboard spacing patterns
- **FR-010**: System MUST ensure all text has sufficient contrast ratios (WCAG 2.1 AA compliant) against gradient backgrounds

#### Core Data Display (P1)

- **FR-011**: System MUST display entry date in localized format respecting user's date preferences (e.g., "Monday, October 31, 2025")
- **FR-012**: System MUST display meal times (firstMealTime, lastMealTime) respecting user's 12h/24h time format preference
- **FR-013**: System MUST display fasting duration in hours and minutes format (e.g., "16h 30m") with prominent gradient styling
- **FR-014**: System MUST display weight with user's preferred measurement system (kg or lbs) and 1 decimal precision if recorded
- **FR-015**: System MUST display wellness metrics (energy level, wellbeing, hunger level) with both emoji and text labels
- **FR-016**: System MUST display food notes in expandable text area if content exceeds 300 characters, with "Read more" gradient button
- **FR-017**: System MUST display "Not logged" placeholder with muted styling (text-gray-400) for optional fields that are null
- **FR-018**: System MUST show entry creation and last updated timestamps in relative format (e.g., "Created 2 days ago")

#### Personalized Insights (P1)

- **FR-019**: System MUST calculate and display historical rank insight (e.g., "This is your 3rd longest fast") if entry is in top 10 longest fasts
- **FR-020**: System MUST calculate and display weekend vs weekday pattern insight if user has ≥5 weekend entries and ≥5 weekday entries and difference is >1 hour
- **FR-021**: System MUST calculate and display deviation from average insight (e.g., "2 hours longer than your typical pattern") if deviation is >2 hours
- **FR-022**: System MUST display current streak insight if entry contributes to an active streak (e.g., "Part of your 5 day streak 🔥")
- **FR-023**: System MUST calculate insights using only the authenticated user's historical data (userId filter required)
- **FR-024**: System MUST cache calculated insights for 30 minutes (1800 seconds) to reduce database load
- **FR-025**: System MUST show encouraging "Log more entries to see insights" message with gradient styling if user has <5 total entries
- **FR-026**: System MUST handle insight calculation errors gracefully by showing "Insights temporarily unavailable" without breaking page layout
- **FR-027**: System MUST display insights in visually distinct gradient-styled callout boxes with rounded corners and subtle shadows

#### Stats Comparison (P2)

- **FR-028**: System MUST calculate and display overall average fasting duration (all-time) if user has ≥5 total entries
- **FR-029**: System MUST calculate and display 30-day rolling average fasting duration if user has ≥5 entries in last 30 days
- **FR-030**: System MUST calculate and display same-day-of-week average (e.g., "Monday Average") if user has ≥3 entries for that weekday
- **FR-031**: System MUST show difference between current entry and each average with directional arrow (↑ for above, ↓ for below) and colored gradient
- **FR-032**: System MUST use positive green gradient (from-green-600 to-emerald-600) for values above average
- **FR-033**: System MUST use neutral gray styling for values below average (no negative connotation for shorter fasts)
- **FR-034**: System MUST calculate weight trend if current entry has weight AND user has ≥3 historical weight entries
- **FR-035**: System MUST show "N/A" with explanation tooltip for comparison metrics with insufficient data
- **FR-036**: System MUST display all comparison statistics in a "How This Compares" glassmorphic card with organized grid layout

#### Timeline Navigation (P2)

- **FR-037**: System MUST fetch previous entry (by date) for the authenticated user and display in timeline section
- **FR-038**: System MUST fetch next entry (by date) for the authenticated user and display in timeline section
- **FR-039**: System MUST render timeline entry cards with date, fasting duration, and gradient-styled navigation link
- **FR-040**: System MUST handle first entry case by showing "This is your first entry 🎉" message with gradient styling
- **FR-041**: System MUST handle latest entry case by showing "This is your latest entry" message with gradient styling
- **FR-042**: System MUST navigate to clicked timeline entry's detail page when link is activated
- **FR-043**: System MUST display timeline cards using compact glassmorphic styling (smaller padding, subtle shadow)
- **FR-044**: System MUST show timeline navigation even for entries with date gaps (non-consecutive days)

#### Actions & Interactions (P3)

- **FR-045**: System MUST display "Edit Entry" button with purple-pink gradient that navigates to entry edit form when clicked
- **FR-046**: System MUST display "Delete Entry" button with white background and red border for destructive action clarity
- **FR-047**: System MUST show confirmation modal with glassmorphic styling when Delete button is clicked
- **FR-048**: System MUST execute entry deletion only after explicit user confirmation in modal
- **FR-049**: System MUST redirect user to entries list after successful deletion with success toast notification
- **FR-050**: System MUST display "Back to Entries" link with subtle gradient styling as tertiary navigation option
- **FR-051**: System MUST apply hover:scale-105 transform transition to all interactive buttons for tactile feedback
- **FR-052**: System MUST ensure all buttons have minimum 44x44px touch target size for mobile accessibility

#### Performance & Caching (P2)

- **FR-053**: System MUST render entry details page in <2 seconds on standard 4G mobile connection
- **FR-054**: System MUST use Incremental Static Regeneration (ISR) with 5-minute revalidation for entry detail pages
- **FR-055**: System MUST pre-render 10 most recent entries at build time using generateStaticParams
- **FR-056**: System MUST cache insight calculations for 30 minutes using serverCacheService
- **FR-057**: System MUST use single aggregation pipeline query to fetch all insights data (no N+1 queries)
- **FR-058**: System MUST log performance metrics (page load time, query count, cache hit rate) for monitoring

#### Authorization & Security (P1)

- **FR-059**: System MUST verify user is authenticated before rendering entry details page
- **FR-060**: System MUST verify user owns the entry (userId match) before displaying data
- **FR-061**: System MUST redirect unauthorized users to login page with callbackUrl to return after auth
- **FR-062**: System MUST redirect users attempting to view others' entries to their own entries list
- **FR-063**: System MUST validate MongoDB ObjectId format before querying database to prevent injection
- **FR-064**: System MUST return 404 Not Found for invalid or non-existent entry IDs

### Key Entities

- **Entry**: Represents a single day's fasting data. Contains date, meal times (firstMealTime, lastMealTime), fasting duration (calculated in minutes), wellness metrics (energyLevel, wellBeing, hungerLevel - all enum strings with emoji mappings), weight (morningWeight in kg/lbs), food notes (foodNotes up to 2000 chars), extended fast flags, fasting goal tracking (fastingGoal minutes, goalStatus enum), timestamps (createdAt, updatedAt). Each entry belongs to a specific user (userId reference) with unique constraint on userId + date combination.

- **EntryInsights**: Calculated analytics derived from comparing current entry to user's historical patterns. Contains ranking data (historicalRank, totalEntries), pattern analysis (weekendVsWeekdayPattern with difference in hours), average comparisons (overallAverage, thirtyDayAverage, sameDayOfWeekAverage), streak information (isPartOfStreak, currentStreakLength), deviation analysis (deviationFromTypical). Not stored in database but computed on-demand and cached for 30 minutes.

- **User**: Represents authenticated user with settings preferences. Contains timeFormat preference (12h/24h for meal time display), measurementSystem preference (metric/imperial for weight display), authentication details. Referenced by Entry.userId to establish data ownership and enforce authorization.

- **ComparisonStats**: Calculated comparison metrics for current entry. Contains averages (allTimeAverage, thirtyDayAverage, dayOfWeekAverage in minutes), differences (currentVsAllTime, currentVsThirtyDay, currentVsDayOfWeek with sign and magnitude), trend direction (above/below/equal enum), weight trend data if applicable. Computed from aggregation pipeline query with user historical data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view complete entry details with all data fields displayed in <2 seconds page load time on 4G mobile connection
- **SC-002**: 90% of entry detail page views render from cache (ISR or insight cache) reducing database queries by 70%
- **SC-003**: Users viewing entries with ≥10 historical entries see at least 2 personalized insights 100% of the time
- **SC-004**: Visual design maintains WCAG 2.1 AA contrast ratios (4.5:1 for normal text) across all gradient backgrounds and text combinations
- **SC-005**: Users can successfully navigate between entries using timeline links in <1 second with smooth transitions
- **SC-006**: Entry detail page feels cohesive with dashboard and entries list (verified by design consistency audit: same color palette, spacing, component patterns)
- **SC-007**: Users report increased motivation from insights (measured by session time increase: ≥30% longer time viewing entry details after enhancement)
- **SC-008**: Insight calculations complete in <500ms for users with <100 entries using optimized aggregation pipeline
- **SC-009**: Mobile users can interact with all buttons without mis-taps (verified by 44x44px minimum touch target compliance)
- **SC-010**: Entry edit and delete actions complete successfully 100% of the time with proper confirmation preventing accidental deletions
- **SC-011**: Users understand their fasting patterns better (measured by qualitative feedback: "insights helped me understand my habits" rating ≥4/5)
- **SC-012**: Page layout remains visually stable with no content shift when insights load asynchronously (verified by Cumulative Layout Shift <0.1)
- **SC-013**: Comparison statistics accuracy verified: calculated values match manual calculations for random sample of 50 entries
- **SC-014**: Timeline navigation handles all edge cases correctly: first entry, last entry, date gaps, single entry (verified by test coverage ≥95%)
- **SC-015**: Entry details page contributes to increased app engagement (measured by: users view ≥3 entry detail pages per session, up from baseline)

## Assumptions *(optional)*

1. **Design System Consistency**: Assumes the glassmorphic design system (purple-pink-indigo gradients, backdrop-blur, rounded-2xl corners) is already established in dashboard and entries pages and component patterns can be reused
2. **Existing Infrastructure**: Assumes entryInsightsService with caching, settingsService for user preferences, and performanceLogger are already implemented and functional
3. **Data Availability**: Assumes users have been creating entries with the enhanced schema including wellness metrics, weight data, and fasting goals from recent features
4. **Browser Support**: Assumes modern browser support for backdrop-filter (CSS blur) and gradient features; graceful degradation acceptable for older browsers
5. **Authentication**: Assumes NextAuth session management is working correctly and provides reliable user.id for authorization
6. **Database Performance**: Assumes MongoDB aggregation pipelines for insights calculations perform adequately with indexes on userId and date fields
7. **Mobile First**: Assumes mobile viewport is primary target with responsive breakpoints for desktop (md:, lg: Tailwind classes)
8. **Time Zone Handling**: Assumes entry dates are stored in UTC and localized on display using user's browser timezone
9. **Incremental Static Regeneration**: Assumes Vercel deployment supports Next.js ISR with 5-minute revalidation intervals
10. **Entry Edit Form**: Assumes entry edit functionality already exists at /entries/[id]/edit and just needs proper navigation from detail page
11. **Toast Notifications**: Assumes toast notification system exists (from Feature 021) for success/error messages after actions
12. **Cache Service**: Assumes serverCacheService provides reliable get/set methods with TTL support for insights caching
13. **Historical Data**: Assumes established users have sufficient historical entries (≥10) for meaningful insights; new users see appropriate encouragement messages
14. **Measurement Preferences**: Assumes weight display respects user's metric/imperial preference stored in user settings
15. **Extended Fast Detection**: Assumes extended fast confirmation logic from Feature 013 is working and entries have accurate extendedFastConfirmed flags

## Dependencies *(optional)*

1. **Feature 024 - User Dashboard**: Glassmorphic design system, gradient color palette (purple-pink-indigo), component patterns for cards and buttons
2. **Feature 011 - Entry Details Page (Original)**: Existing page structure, entryInsightsService, ComparisonStats calculations, timeline navigation logic
3. **Feature 020 - Fasting Goal Timer**: Entry schema with fastingGoal and goalStatus fields for display in entry details
4. **Feature 021 - Toast Notifications**: Toast system for success/error messages after edit/delete actions
5. **Feature 016 - Performance Optimization**: performanceLogger utility, caching infrastructure, ISR configuration
6. **NextAuth**: Authentication session management for user.id retrieval and authorization checks
7. **MongoDB Aggregation**: Database aggregation pipelines for efficient insights calculation with $facet operator
8. **Tailwind CSS**: Utility classes for gradients (from-purple-50), backdrop-blur (backdrop-blur-md), transforms (hover:scale-105)
9. **date-fns**: Date manipulation library for relative time display ("2 days ago"), month calculations for insights
10. **React Server Components**: Next.js App Router for server-side data fetching, ISR, and generateStaticParams
11. **Existing Components**: EntryDetailsView organism component structure, FormattedDate/Time atoms, wellness emoji mappings
12. **serverCacheService**: In-memory caching service with TTL support for insights result caching
13. **settingsService**: User settings retrieval for timeFormat and measurementSystem preferences
14. **Entry Model**: Mongoose schema with all current fields including wellness metrics, extended fast flags, goal tracking

## Out of Scope *(optional)*

1. **Advanced Analytics Dashboard**: Comprehensive charts, graphs, trend visualizations across all entries (separate feature for data visualization)
2. **Social Sharing**: Ability to share entry details or insights on social media platforms
3. **Entry Comparison Tool**: Side-by-side comparison of multiple entries beyond current timeline navigation
4. **AI-Generated Insights**: Machine learning predictions or recommendations based on patterns (use rule-based insights only)
5. **Export Functionality**: Download entry details as PDF or CSV from detail page (covered by separate export feature)
6. **Collaborative Features**: Sharing entries with friends, coaches, or accountability partners
7. **Custom Insight Configuration**: User ability to choose which insights to display or customize thresholds
8. **Historical Insight Trends**: Tracking how insights change over time (e.g., "Your average improved by 2 hours this month")
9. **Integration with Health Apps**: Syncing entry data with Apple Health, Google Fit, or other fitness platforms
10. **Entry Annotations**: Adding photos, voice notes, or additional metadata beyond existing food notes field
11. **Gamification**: Badges, achievements, or rewards based on entry patterns (separate gamification feature)
12. **Meal Planning**: Suggestions for meal timing or breaking fasts based on entry patterns
13. **Notification Settings**: Customizing when to receive notifications about insights or milestones
14. **Multi-Language Support**: Translating insights and labels beyond English (i18n is separate feature)
15. **Dark Mode**: Alternative color scheme for glassmorphic design (separate theming feature)
