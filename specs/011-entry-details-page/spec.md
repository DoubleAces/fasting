# Feature Specification: Entry Details Page

**Feature Branch**: `011-entry-details-page` (merged to master)  
**Created**: October 24, 2025  
**Last Updated**: January 2025  
**Status**: ✅ Complete - All 3 User Stories Deployed  
**Input**: User description: "I need a dedicated details page that displays comprehensive information about a single fasting entry when a user clicks on it from the entries list."

## Implementation Status

- ✅ **User Story 1**: View Comprehensive Entry Details - Deployed
- ✅ **User Story 2**: Personal Insights and Patterns - Deployed
- ✅ **User Story 3**: Contextual Actions - Deployed
- 📊 **Test Coverage**: 85 tests passing
- 🚀 **Production**: Live on master branch

## Clarifications

### Session 2025-10-24

- Q: How should the visual timeline represent the fasting period that spans across midnight? → A: 24-hour circular clock diagram with shaded fasting period and meal window markers
- Q: What specific criteria define a "best day" for showing the special badge? → A: Entry with fasting duration ≥ user's average AND energyLevel = "High Energy" AND wellBeing = "Good" AND weight logged
- Q: How should the system handle ranking when multiple entries have identical fasting durations? → A: Use date as tiebreaker - more recent entry ranks higher among ties, display clean rank without mentioning tie (Note: Consider showing subtle hint when tied to avoid user confusion about rank changes)
- Q: Which entries should be automatically cached for offline viewing in the PWA? → A: Cache entries from last 90 days (consistent with existing PWA caching strategy)
- Q: How should the system handle failed actions (edit save fails, delete fails, copy fails)? → A: Show error message inline, keep user on same page/modal with data preserved, allow retry (Note: Entry details page itself is view-only; "Edit" button navigates to separate edit form)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Comprehensive Entry Details (Priority: P1)

A user clicks on an entry from their entries list and is taken to a dedicated details page that displays all information about that fasting session, including duration, start/end times with a visual timeline, meal information, weight, mood ratings (hunger, energy, well-being), and food notes. The page also shows metadata like when the entry was created and last updated.

**Why this priority**: This is the core value of the feature - users need to be able to see all their entry data in one place. Without this, the feature has no purpose. This standalone slice delivers immediate value by giving users access to information they cannot currently see in the list view.

**Independent Test**: Can be fully tested by clicking any entry from the entries list and verifying all entry fields are displayed correctly. Delivers the core value of deep-diving into entry details.

**Acceptance Scenarios**:

1. **Given** a user is viewing their entries list, **When** they click on any entry, **Then** they are navigated to a details page showing that entry's complete information
2. **Given** a user is on an entry details page, **When** the page loads, **Then** they see the fasting duration in hours and minutes
3. **Given** a user is on an entry details page, **When** the page loads, **Then** they see the exact start time (last meal from previous day) and end time (first meal of this day)
4. **Given** a user is on an entry details page, **When** the page loads, **Then** they see a visual timeline representation of the fasting period
5. **Given** a user is on an entry details page, **When** the page loads, **Then** they see all meal information including timing, foods eaten (from food notes), and portion details
6. **Given** a user is on an entry details page with weight data, **When** the page loads, **Then** they see the logged morning weight in the correct unit (kg or lbs based on settings)
7. **Given** a user is on an entry details page, **When** the page loads, **Then** they see their mood ratings (hunger level, energy level, well-being)
8. **Given** a user is on an entry details page, **When** the page loads, **Then** they see when the entry was created and last updated
9. **Given** a user is on an entry details page for an entry without optional data (weight, food notes), **When** the page loads, **Then** those sections display appropriate "not logged" messages
10. **Given** a user is on an entry details page, **When** they want to return to the list, **Then** they see a clear navigation option (back button or breadcrumb)

---

### User Story 2 - View Personal Insights and Patterns (Priority: P2)

A user viewing an entry details page sees personalized insights that compare this specific entry to their historical patterns, including whether this was their longest fast in a given period, their typical break-fast time, their recent average fasting duration, whether this entry contributed to their current streak, and where this entry ranks in their fasting history.

**Why this priority**: This adds significant value beyond just displaying data - it helps users understand the meaning and context of each entry in their journey. It's independently valuable because even without edit/delete actions, users gain insights they didn't have before.

**Independent Test**: Can be tested by viewing entries with varying durations and dates, then verifying the insights accurately reflect the user's historical data. Delivers value by helping users understand their patterns and progress.

**Acceptance Scenarios**:

1. **Given** a user views an entry that is their longest fast this month, **When** the insights section loads, **Then** they see a highlight indicating "Longest fast this month"
2. **Given** a user views an entry, **When** the insights section loads, **Then** they see their typical break-fast time calculated from recent entries
3. **Given** a user views an entry, **When** the insights section loads, **Then** they see their average fasting duration from the last 30 days
4. **Given** a user views an entry that is part of their current streak, **When** the insights section loads, **Then** they see confirmation that this entry contributed to their streak
5. **Given** a user views an entry, **When** the insights section loads, **Then** they see this entry's rank in their fasting history (e.g., "Your 5th longest fast")
6. **Given** a user views an entry with a duration above their average, **When** the insights section loads, **Then** they see a comparison showing it was X hours longer than their average
7. **Given** a user views an entry with a duration below their average, **When** the insights section loads, **Then** they see a comparison showing it was X hours shorter than their average
8. **Given** a new user with only 1-2 entries, **When** viewing entry insights, **Then** they see a message indicating more data is needed for meaningful insights (minimum 7 entries recommended)
9. **Given** a user views an entry that qualifies as a "best day" (fasting duration ≥ average, energyLevel = "High Energy", wellBeing = "Good", and weight logged), **When** the insights section loads, **Then** they see a special badge or indicator

---

### User Story 3 - Take Contextual Actions (Priority: P3)

A user viewing an entry details page can take quick actions relevant to that entry: edit the entry to correct or add information, delete the entry with confirmation (especially important if it impacts their streak), or copy this entry's pattern (meal times) to create a new entry for today with similar timing.

**Why this priority**: While valuable, these actions are supplementary to viewing details and insights. Users can still derive value from the feature without these actions. Edit and delete already exist in the list view, and copy is a convenience feature. This can be developed last without impacting the other stories.

**Independent Test**: Can be tested by performing each action and verifying the expected outcome. Delivers convenience value by providing actions in context of viewing full details.

**Acceptance Scenarios**:

1. **Given** a user is viewing an entry details page, **When** they click the edit button, **Then** they are taken to an edit form pre-populated with this entry's data
2. **Given** a user is viewing an entry details page, **When** they click the delete button, **Then** they see a confirmation dialog explaining the impact (especially if it affects their streak)
3. **Given** a user confirms deletion in the dialog, **When** the deletion completes, **Then** they are redirected to the entries list and see a success message
4. **Given** a user is viewing an entry details page, **When** they click the "Copy to Today" button, **Then** they see a form to create a new entry with this entry's meal times pre-filled
5. **Given** a user is viewing an entry from today, **When** they look for the "Copy to Today" button, **Then** it is either hidden or disabled (cannot copy today's entry to today)
6. **Given** a user clicks "Copy to Today" but already has an entry for today, **When** the action is triggered, **Then** they see a message explaining they can only have one entry per day
7. **Given** a user successfully copies an entry to today, **When** they save it, **Then** they are redirected to today's entry details page

---

### Edge Cases

- What happens when a user tries to access an entry details page for an entry that doesn't exist or was deleted? Display a 404-style error with a link back to the entries list.
- What happens when a user tries to access an entry that belongs to another user? Redirect to entries list with an error message about unauthorized access.
- What happens when calculating insights for a user's very first entry? Show a friendly message like "This is your first entry! Create more entries to see insights about your patterns."
- What happens if the entry has no previous entry (so fasting duration is null)? Display "N/A" or "Cannot calculate" with an explanation that the previous day's entry is needed.
- What happens if the entry is an extended fast (>24 hours)? Highlight this prominently in the visual timeline and insights section.
- What happens when displaying very long food notes (approaching the 2000 character limit)? Ensure the layout handles long text gracefully with scrolling or text truncation.
- What happens when the user's device is offline (PWA mode)? The page should still load if the entry data is cached, or show an appropriate offline message.
- What happens when viewing on mobile devices? The layout adapts to smaller screens with stacked sections and touch-friendly action buttons.
- What happens when multiple entries have identical durations (ranking ties)? Use date as tiebreaker with more recent ranking higher, and consider showing a subtle indicator (e.g., small info icon) to help users understand why ranks may shift when durations are identical.
- What happens when a delete or copy action fails (network error, server error)? Show error message inline within the modal/dialog, preserve user's state and choices, and provide a "Retry" button without forcing them to restart the entire action.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dedicated page for viewing a single entry's complete details when accessed via a unique identifier
- **FR-002**: System MUST show the entry's fasting duration in hours and minutes format (e.g., "16h 30m")
- **FR-003**: System MUST display the exact start time (last meal from previous day) and end time (first meal of current day) in the user's preferred time format (12h or 24h based on settings)
- **FR-004**: System MUST provide a visual timeline representation as a 24-hour circular clock diagram with shaded area showing the fasting period and markers indicating meal windows (last meal time and first meal time)
- **FR-005**: System MUST display all meal information including timing and food notes content (which may include portion details)
- **FR-006**: System MUST show morning weight with the correct measurement unit based on user settings (kg or lbs)
- **FR-007**: System MUST display all mood ratings including hunger level, energy level, and well-being with clear labels
- **FR-008**: System MUST show entry metadata including creation timestamp and last updated timestamp
- **FR-009**: System MUST display appropriate "not logged" or "N/A" messages for optional fields that have no data
- **FR-010**: System MUST provide clear navigation back to the entries list (back button, breadcrumb, or header link)
- **FR-011**: System MUST calculate and display whether this entry is the user's longest fast within the current month
- **FR-012**: System MUST calculate and display the user's typical break-fast time based on recent entries (last 30 days)
- **FR-013**: System MUST calculate and display the user's average fasting duration over the last 30 days
- **FR-014**: System MUST indicate whether this entry contributed to the user's current streak
- **FR-015**: System MUST show this entry's ranking in the user's fasting history (e.g., "3rd longest fast"), using date as tiebreaker when durations are identical (more recent ranks higher)
- **FR-016**: System MUST compare this entry's duration to the user's average and show the difference (e.g., "2h 15m longer than average")
- **FR-017**: System MUST display a message when insufficient data exists for meaningful insights (fewer than 7 entries)
- **FR-017a**: System MUST display a "best day" badge when an entry meets all criteria: fasting duration ≥ user's 30-day average, energyLevel = "High Energy", wellBeing = "Good", and morningWeight is logged
- **FR-018**: System MUST provide an edit action that navigates to an entry edit form pre-populated with this entry's data
- **FR-019**: System MUST provide a delete action that shows a confirmation dialog before deletion
- **FR-020**: System MUST explain the impact of deletion in the confirmation dialog (especially streak impact)
- **FR-021**: System MUST redirect to the entries list after successful deletion with a success message
- **FR-022**: System MUST provide a "Copy to Today" action that pre-fills a new entry form with this entry's meal timing pattern
- **FR-023**: System MUST hide or disable the "Copy to Today" action when viewing today's entry
- **FR-024**: System MUST prevent copying to today if an entry for today already exists and show an appropriate message
- **FR-025**: System MUST verify the user owns the entry before displaying any information (authorization check)
- **FR-026**: System MUST show an appropriate error page for non-existent entries (404-style)
- **FR-027**: System MUST handle entries with null fasting duration (no previous entry) by showing "N/A" with explanation
- **FR-028**: System MUST prominently highlight extended fasts (>24 hours) in the timeline and insights
- **FR-029**: System MUST handle long food notes (up to 2000 characters) with appropriate layout considerations
- **FR-030**: System MUST be responsive and adapt layout for mobile devices with touch-friendly controls
- **FR-031**: System MUST be accessible via a clickable action from each entry in the entries list
- **FR-032**: System MUST work in offline mode (PWA) if the entry data is cached (entries from last 90 days), or show offline message if entry is not available in cache
- **FR-033**: System MUST handle failed actions (delete, copy) by showing error messages inline without losing user context or data, and allowing retry without restarting the action
- **FR-034**: System MUST keep the entry details page as view-only display; the "Edit" action navigates to a separate edit form rather than making fields editable in place

### Key Entities

- **Entry**: Represents a single day's fasting data including date, meal times (firstMealTime, lastMealTime), fasting duration (in minutes), health metrics (hoursOfSleep, morningWeight, hungerLevel, energyLevel, wellBeing), food notes, extended fast confirmation flag, and timestamps (createdAt, updatedAt). Belongs to a specific user and has unique constraint on userId + date combination.

- **User**: Represents the authenticated user viewing the entry. Contains settings for time format preference (12h/24h) and measurement system (metric/imperial) which affect how entry data is displayed.

- **Entry Insights**: Calculated data derived from comparing the current entry to the user's historical entries. Includes longest fast indicators, typical patterns, averages, streak contribution status, and ranking. Not stored but computed on-demand when viewing details.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view complete entry details within 2 seconds of clicking an entry from the list (page load performance)
- **SC-002**: 95% of users successfully navigate to entry details on their first attempt (intuitive navigation from entries list)
- **SC-003**: Users spend at least 15 seconds on entry details pages on average (indicates they are reading and engaging with the information)
- **SC-004**: The insights section displays accurate calculations matching user's historical data in 100% of cases (data accuracy)
- **SC-005**: Entry details page works correctly on mobile devices (under 600px width) with no horizontal scrolling or broken layouts (mobile responsiveness)
- **SC-006**: Users can successfully complete edit, delete, and copy actions from the entry details page with clear feedback for each action (action completion rate)
- **SC-007**: Zero unauthorized access incidents where users can view entries belonging to other users (security)
- **SC-008**: Page handles edge cases (missing data, no previous entry, extended fasts) gracefully with clear user-facing messages in 100% of scenarios (error handling quality)

## Assumptions

- **Assumption 1**: Users access entry details primarily from the entries list page, not via direct URL navigation (though direct URL access must be supported and secured)
- **Assumption 2**: The "recent entries" period for calculating averages and patterns is 30 days, which provides enough data for meaningful insights without being too broad
- **Assumption 3**: A minimum of 7 entries is required before showing comparative insights, as fewer entries don't provide statistically meaningful patterns
- **Assumption 4**: Streak calculation logic already exists in the application and can be reused for determining if an entry contributes to the current streak
- **Assumption 5**: The visual timeline uses a 24-hour circular clock format to naturally handle fasting periods that span across midnight, with shaded regions representing the fasting window
- **Assumption 6**: Extended fasts are defined as gaps >24 hours between last meal of previous entry and first meal of current entry, consistent with existing extended fast confirmation logic
- **Assumption 7**: Users understand that insights are comparative and relative to their own history, not to other users or general population benchmarks
- **Assumption 8**: The edit functionality will use the same form/validation as the existing entry creation/edit features for consistency
- **Assumption 9**: Time format and measurement unit preferences are already stored in user settings and accessible via the Settings model
- **Assumption 10**: Page URLs will follow the pattern `/entries/[entryId]` where entryId is the MongoDB ObjectId of the entry
- **Assumption 11**: PWA caching strategy caches entries from the last 90 days for offline access, consistent with existing application caching policies

## Dependencies

- **Dependency 1**: Existing Entry model and database schema must remain stable (any changes to field names or structure would break this feature)
- **Dependency 2**: User authentication system must be functioning to verify entry ownership before displaying details
- **Dependency 3**: Settings model must be accessible to retrieve user preferences for time format and measurement units
- **Dependency 4**: Entries list page must be updated to make entries clickable with links to the details page
- **Dependency 5**: Entry creation/edit form must be reusable or adaptable for the edit action from details page
- **Dependency 6**: Delete functionality must include streak impact calculation logic to show accurate warnings
- **Dependency 7**: Date utilities and formatting functions must be available for displaying timestamps and calculating date-based insights
- **Dependency 8**: Existing validation schemas must be compatible with the data displayed and any actions taken from the details page

## Out of Scope

- **Out of Scope 1**: Social features (sharing entries, comparing with friends, public profiles) - this is a private details view only
- **Out of Scope 2**: Data export from individual entry (PDF download, image export, etc.) - these are separate features
- **Out of Scope 3**: Bulk actions (viewing multiple entries simultaneously, comparing two entries side-by-side) - this is single entry focus
- **Out of Scope 4**: Advanced analytics and charting (trends over time, graphs, statistical analysis) - this belongs in a dedicated analytics dashboard
- **Out of Scope 5**: Commenting or journaling beyond the existing food notes field - no new text input features
- **Out of Scope 6**: Achievements or badges system - gamification is a separate feature set
- **Out of Scope 7**: Editing streak data directly or manually adjusting streaks - streaks are calculated, not editable
- **Out of Scope 8**: Historical insights beyond 30 days or custom date ranges for averages - using fixed 30-day window for simplicity
- **Out of Scope 9**: Notifications or reminders triggered from viewing entry details - notification system is separate
- **Out of Scope 10**: Integration with external health apps or wearables from entry details page - separate integration feature

