# Feature Specification: Live Fasting Timer

**Feature Branch**: `017-live-fasting-timer`  
**Created**: October 26, 2025  
**Status**: In Progress  
**Last Updated**: October 27, 2025

**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."

## Clarifications

### Session 2025-10-26

- Q: Where exactly should the timer be positioned for optimal user experience? → A: Dedicated card component at the top of the entries page, before the entry list

- Q: What type of user experience should milestone celebrations provide? → A: Animated highlight on timer with persistent badge/icon (subtle, no dismiss needed)

- Q: For a brand new user on their first fast with no history - should we show a progress bar? → A: Show timer only (no progress bar yet), with hint about progress tracking unlocking later. Note: Progress bar concept needs further validation during planning.

- Q: What update frequency provides the best user experience for the timer? → A: Every 60 seconds (balanced performance and engagement)

- Q: What should happen if the timer calculation encounters an error? → A: Show error message in timer card: "Unable to calculate fasting time. Please check your entry."

### Session 2025-10-27

- **Decision**: Remove all progress bar functionality from this feature. Progress visualization with intelligent goal calculation will be reconsidered as a separate feature (see FEATURE-BACKLOG.md). This feature focuses solely on the live timer.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - In-App Live Timer Display (Priority: P1)

A user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every 60 seconds and persists across page refreshes by calculating elapsed time from the logged last meal time.

**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.

**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.

**Acceptance Scenarios**:

1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately

2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer as a dedicated card component at the top of the page, before the entry list, showing the correct elapsed time since my last meal

3. **Given** I am viewing the active fasting timer, **When** 60 seconds pass, **Then** the timer updates to show the new elapsed time without page refresh

4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time

5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time

---

### User Story 2 - Timer Auto-Stop on Fast Break (Priority: P1)

When a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.

**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.

**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.

**Acceptance Scenarios**:

1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"

2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times

3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer

4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display

---

### User Story 3 - Timer Status at Page Load (Priority: P2)

When a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.

**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.

**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.

**Acceptance Scenarios**:

1. **Given** today is October 27 and I have an entry for October 27 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal

2. **Given** today is October 27 and I have an entry for October 27 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)

3. **Given** today is October 27 and I have no entry for October 27, **When** I load the entries page, **Then** no timer appears until I create today's entry

4. **Given** today is October 27 and I have an entry for October 26 with last meal time but no October 27 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)

5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero

---

### Edge Cases

- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)

- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)

- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)

- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)

- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)

- **Calculation errors**: What happens if timer calculation encounters an error (corrupted data, invalid time format, system clock issues)? (Display error message in timer card: "Unable to calculate fasting time. Please check your entry." - graceful degradation without blocking page)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time logged

- **FR-002**: Timer MUST update the displayed elapsed time exactly every 60 seconds to show current fasting duration

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")

- **FR-006**: Timer MUST be displayed as a dedicated card component at the top of the entries page, before the entry list

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for today (breaking their fast)

- **FR-008**: Timer MUST show milestone achievements at specific durations [12, 16, 20, 24, 36, 48] hours through animated highlights on the timer with persistent badge/icon indicators

- **FR-009**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-010**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer

- **FR-011**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")

- **FR-012**: System MUST recalculate and update timer when today's entry is edited or deleted

- **FR-013**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports

- **FR-014**: When timer calculation encounters an error (corrupted data, invalid time format, system clock issues), system MUST display an error message in the timer card location: "Unable to calculate fasting time. Please check your entry."

### Key Entities

- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no first meal time yet logged. Contains calculated elapsed duration.

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.

- **Milestone**: Predefined fasting duration thresholds [12, 16, 20, 24, 36, 48] hours that trigger animated highlights with persistent badge/icon indicators when reached during an active fast.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times

- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists

- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time

- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast

- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times

- **SC-006**: Milestone indicators appear within 60 seconds of reaching the milestone duration

- **SC-007**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)

- **SC-008**: Timer accurately handles timezone displays and calculations for users in any timezone

- **SC-009**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenarios

---

## Assumptions *(mandatory)*

1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format), `firstMealTime` (String in HH:mm format), and `date` (Date) fields that can be used to calculate elapsed fasting time

2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries

3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the meal timestamps

4. **Performance**: Updating timer every 60 seconds is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page

5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functions

6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)

7. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)

---

## Dependencies *(mandatory)*

- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and `firstMealTime` fields
- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly
- **Entries Page**: Timer integrates into existing `/app/entries/page.js` route
- **User Authentication**: Timer only displays for authenticated users with active session

---

## Out of Scope *(mandatory)*

### Explicitly NOT Included

1. **Progress bar visualization**: Visual progress indicator showing percentage toward a goal (deferred to future feature - see FEATURE-BACKLOG.md)
2. **Target duration calculation**: Calculating user's typical/goal fasting duration from history (deferred with progress bar)
3. **Progress percentage display**: Showing "X% of Y hours" completion (deferred with progress bar)
4. **Smart goal recommendations**: Algorithm to suggest optimal fasting durations (deferred with progress bar)
5. **Database schema changes**: No modifications to Entry model or new collections
6. **New API endpoints**: No new backend routes (client-side only feature)
7. **Multi-fast tracking**: Tracking multiple simultaneous fasts (out of scope)
8. **Historical timer playback**: Viewing past fasts with animated timer replay (out of scope)
9. **Timer notifications**: Push notifications or alerts when milestones reached (separate feature)
10. **Social sharing**: Share timer status with friends or community (separate feature)
11. **Timer customization**: User-configurable timer display format or position (YAGNI)
12. **Audio cues**: Sound effects for milestones (separate feature, accessibility consideration)

---

## Notes

- **Scope Reduction (2025-10-27)**: Progress bar functionality removed to simplify feature and address concerns about goal calculation algorithms (median could suggest unambitious targets). Timer-only implementation provides core value without complex goal logic.
- **Future Enhancement**: Progress visualization will be reconsidered as separate feature with better goal-setting approach (user-defined goals, historical bests, adaptive targets, etc.)
