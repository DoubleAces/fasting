# Feature Specification: Live Fasting Timer# Feature Specification: Live Fasting Timer# Feature Specification: Live Fasting Timer# Feature Specification: Live Fasting Timer# Feature Specification: Live Fasting Timer# Feature Specification: [FEATURE NAME]



**Feature Branch**: `017-live-fasting-timer`  

**Created**: October 26, 2025  

**Status**: Draft  **Feature Branch**: `017-live-fasting-timer`  

**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."

**Created**: October 26, 2025  

## Clarifications

**Status**: Draft  **Feature Branch**: `017-live-fasting-timer`  

### Session 2025-10-26

**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."

- Q: Where exactly should the timer be positioned for optimal user experience? → A: Dedicated card component at the top of the entries page, before the entry list

- Q: What type of user experience should milestone celebrations provide? → A: Animated highlight on timer with persistent badge/icon (subtle, no dismiss needed)**Created**: October 26, 2025  

- Q: For a brand new user on their first fast with no history - should we show a progress bar? → A: Show timer only (no progress bar yet), with hint about progress tracking unlocking later. Note: Progress bar concept needs further validation during planning.

- Q: What update frequency provides the best user experience for the timer? → A: Every 60 seconds (balanced performance and engagement)## Clarifications

- Q: What should happen if the timer calculation encounters an error? → A: Show error message in timer card: "Unable to calculate fasting time. Please check your entry."

**Status**: Draft  **Feature Branch**: `017-live-fasting-timer`  

## User Scenarios & Testing *(mandatory)*

### Session 2025-10-26

### User Story 1 - In-App Live Timer Display (Priority: P1)

**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."

A user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every minute and persists across page refreshes by calculating elapsed time from the logged last meal time.

- Q: Where exactly should the timer be positioned for optimal user experience? → A: Dedicated card component at the top of the entries page, before the entry list

**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.

- Q: What type of user experience should milestone celebrations provide? → A: Animated highlight on timer with persistent badge/icon (subtle, no dismiss needed)

**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.

- Q: For a brand new user on their first fast with no history - should we show a progress bar? → A: Show timer only (no progress bar yet), with hint about progress tracking unlocking later. Note: Progress bar concept needs further validation during planning.

**Acceptance Scenarios**:

- Q: What update frequency provides the best user experience for the timer? → A: Every 60 seconds (balanced performance and engagement)

1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately

2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer as a dedicated card component at the top of the page, before the entry list, showing the correct elapsed time since my last meal- Q: What should happen if the timer calculation encounters an error? → A: Show error message in timer card: "Unable to calculate fasting time. Please check your entry."

3. **Given** I am viewing the active fasting timer, **When** 60 seconds pass, **Then** the timer updates to show the new elapsed time without page refresh

4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time## Clarifications

5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time

## User Scenarios & Testing *(mandatory)*

---

**Status**: Draft  **Feature Branch**: `017-live-fasting-timer`  **Feature Branch**: `[###-feature-name]`  

### User Story 2 - Timer Progress Visualization (Priority: P2)

### User Story 1 - In-App Live Timer Display (Priority: P1)

A user with an active fast and established fasting history sees a visual progress bar alongside the timer showing their progress toward their typical fasting duration. The progress bar fills as they approach their goal, and milestone achievements are highlighted.

### Session 2025-10-26

**Why this priority**: Visual feedback enhances motivation and provides immediate understanding of progress toward goals. This builds on the core timer functionality to make it more engaging.

A user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every minute and persists across page refreshes by calculating elapsed time from the logged last meal time.

**Independent Test**: Can be tested by creating entries with consistent fasting patterns to establish an average duration, then verifying the progress bar appears and fills correctly for a new active fast. Milestone notifications can be verified at specific time thresholds.

**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."

**Acceptance Scenarios**:

**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.

1. **Given** I have a fasting history establishing an average duration of 16 hours, **When** I view my active fasting timer, **Then** I see a progress bar showing percentage toward 16 hours

2. **Given** my active fast reaches 12 hours, **When** the timer updates, **Then** I see a milestone indicator with animated highlight and persistent badge celebrating "12-Hour Milestone Reached"- Q: Where exactly should the timer be positioned for optimal user experience? → A: Dedicated card component at the top of the entries page, before the entry list

3. **Given** I am at 89% of my typical fasting duration, **When** the timer updates, **Then** the progress bar shows 89% filled with the percentage displayed

4. **Given** I have no established fasting pattern (new user or inconsistent history), **When** I view the active timer, **Then** I see the elapsed time without a progress bar, with a hint message explaining progress tracking will unlock after completing more fasts**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.



---- Q: What type of user experience should milestone celebrations provide? → A: Animated highlight on timer with persistent badge/icon (subtle, no dismiss needed)**Created**: October 26, 2025  **Created**: [DATE]  



### User Story 3 - Timer Auto-Stop on Fast Break (Priority: P1)**Acceptance Scenarios**:



When a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.



**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately



**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer prominently displayed showing the correct elapsed time since my last meal## User Scenarios & Testing *(mandatory)*## Clarifications



**Acceptance Scenarios**:3. **Given** I am viewing the active fasting timer, **When** one minute passes, **Then** the timer updates to show the new elapsed time without page refresh



1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time

2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times

3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time

4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display

### User Story 1 - In-App Live Timer Display (Priority: P1)**Status**: Draft  **Status**: Draft  

---

---

### User Story 4 - Timer Status at Page Load (Priority: P2)



When a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.

### User Story 2 - Timer Progress Visualization (Priority: P2)

**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.

A user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every minute and persists across page refreshes by calculating elapsed time from the logged last meal time.### Session 2025-10-26

**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.

A user with an active fast and established fasting history sees a visual progress bar alongside the timer showing their progress toward their typical fasting duration. The progress bar fills as they approach their goal, and milestone achievements are highlighted.

**Acceptance Scenarios**:



1. **Given** today is October 26 and I have an entry for October 26 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal

2. **Given** today is October 26 and I have an entry for October 26 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)**Why this priority**: Visual feedback enhances motivation and provides immediate understanding of progress toward goals. This builds on the core timer functionality to make it more engaging.

3. **Given** today is October 26 and I have no entry for October 26, **When** I load the entries page, **Then** no timer appears until I create today's entry

4. **Given** today is October 26 and I have an entry for October 25 with last meal time but no October 26 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.**Input**: User description: "I want to add a live fasting timer feature to the fasting tracker app. When a user creates an entry for today and logs their last meal time, the app should start showing a live timer that displays how long they've been fasting (e.g., 'Fasting for 1 hour... 5 hours... 14 hours'). The timer should be prominently displayed on the entries page and update in real-time."**Input**: User description: "$ARGUMENTS"

5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero

**Independent Test**: Can be tested by creating entries with consistent fasting patterns to establish an average duration, then verifying the progress bar appears and fills correctly for a new active fast. Milestone notifications can be verified at specific time thresholds.

---



### Edge Cases

**Acceptance Scenarios**:

- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)

- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.### Session 2025-10-26

- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)1. **Given** I have a fasting history establishing an average duration of 16 hours, **When** I view my active fasting timer, **Then** I see a progress bar showing percentage toward 16 hours

- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)2. **Given** my active fast reaches 12 hours, **When** the timer updates, **Then** I see a milestone indicator with animated highlight and persistent badge celebrating "12-Hour Milestone Reached"

- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)

- **Calculation errors**: What happens if timer calculation encounters an error (corrupted data, invalid time format, system clock issues)? (Display error message in timer card: "Unable to calculate fasting time. Please check your entry." - graceful degradation without blocking page)3. **Given** I am at 89% of my typical fasting duration, **When** the timer updates, **Then** the progress bar shows 89% filled with the percentage displayed



## Requirements *(mandatory)*4. **Given** I have no established fasting pattern (new user or inconsistent history), **When** I view the active timer, **Then** I see the elapsed time without a progress bar, with a hint message explaining progress tracking will unlock after completing more fasts**Acceptance Scenarios**:- Q: Where exactly should the timer be positioned for optimal user experience? → A: Dedicated card component at the top of the entries page, before the entry list



### Functional Requirements



- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time for the next day---- Q: What type of user experience should milestone celebrations provide? → A: Animated highlight on timer with persistent badge/icon (subtle, no dismiss needed)

- **FR-002**: Timer MUST update the displayed elapsed time every 60 seconds to show current fasting duration

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")### User Story 3 - Timer Auto-Stop on Fast Break (Priority: P1)1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately

- **FR-006**: Timer MUST be displayed as a dedicated card component at the top of the entries page, before the entry list

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for the next day or breaks their current fast

- **FR-008**: Timer MUST show milestone achievements at significant durations (12 hours, 16 hours, 24 hours, etc.) through animated highlights on the timer with persistent badge/icon indicators

- **FR-009**: System MUST display a progress bar alongside the timer when a target duration can be determined from user's fasting history (minimum 7-10 historical entries)When a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer prominently displayed showing the correct elapsed time since my last meal

- **FR-010**: Progress bar MUST show percentage completion toward the target duration (e.g., "89% of 16 hours")

- **FR-011**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-012**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer

- **FR-013**: System MUST determine target fasting duration by calculating the user's average or most common fasting duration from recent entry history (last 30 days)**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.3. **Given** I am viewing the active fasting timer, **When** one minute passes, **Then** the timer updates to show the new elapsed time without page refresh

- **FR-014**: Timer display MUST use the user's preferred time format setting (12-hour or 24-hour) when showing start time

- **FR-015**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")

- **FR-016**: System MUST recalculate and update timer when today's entry is edited or deleted

- **FR-017**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time## User Scenarios & Testing *(mandatory)*

- **FR-018**: When user has insufficient fasting history for progress bar, system MUST display a hint message explaining progress tracking will unlock after completing more fasts

- **FR-019**: When timer calculation encounters an error (corrupted data, invalid time format, system clock issues), system MUST display an error message in the timer card location: "Unable to calculate fasting time. Please check your entry."



### Key Entities**Acceptance Scenarios**:5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time



- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no breaking time yet logged for the next period. Contains calculated elapsed duration and optional target duration.

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.

- **Milestone**: Predefined fasting duration thresholds (12h, 16h, 20h, 24h, 36h, 48h) that trigger animated highlights with persistent badge/icon indicators when reached during an active fast.1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"## User Scenarios & Testing *(mandatory)*## User Scenarios & Testing *(mandatory)*

- **Target Duration**: The expected fasting goal for the current session, calculated from the user's historical fasting patterns (average or median of recent fasting durations). Used to show progress percentage. Only available when sufficient history exists.

2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times

## Success Criteria *(mandatory)*

3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer---

### Measurable Outcomes

4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display

- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times

- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists### User Story 1 - In-App Live Timer Display (Priority: P1)

- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time

- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast---

- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times

- **SC-006**: Progress bar (when shown) accurately reflects percentage completion with less than 1% deviation from actual calculation### User Story 2 - Timer Progress Visualization (Priority: P2)

- **SC-007**: Milestone indicators appear within 60 seconds of reaching the milestone duration

- **SC-008**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)### User Story 4 - Timer Status at Page Load (Priority: P2)

- **SC-009**: Timer accurately handles timezone displays and calculations for users in any timezone

- **SC-010**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenarios



## Assumptions *(mandatory)*When a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.



1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format) and `date` (Date) fields that can be used to calculate elapsed fasting timeA user with an active fast sees a visual progress bar alongside the timer if they have a target fasting duration (based on their average or most common fasting duration). The progress bar fills as they approach their goal, and milestone achievements are highlighted.

2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries

3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the last meal timestamp**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.

4. **Performance**: Updating timer every 60 seconds is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page

5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functionsA user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every minute and persists across page refreshes by calculating elapsed time from the logged last meal time.

6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)

7. **Historical data**: Users with insufficient historical entries (< 7-10 entries) will see timer without progress bar, with hint message about unlocking this feature**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.

8. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)

9. **Entry creation flow**: Existing entry creation form and API already handle logging last meal time - no changes to data persistence are required**Why this priority**: Visual feedback enhances motivation and provides immediate understanding of progress toward goals. This builds on the core timer functionality to make it more engaging.

10. **Time synchronization**: User's device clock is reasonably accurate (within a few minutes) for timer calculations to be meaningful

**Acceptance Scenarios**:

## Out of Scope *(mandatory)*

### User Story 1 - In-App Live Timer Display (Priority: P1)<!--

1. **Push notifications**: Sending mobile push notifications for milestone achievements or timer updates - this is a future enhancement

2. **Persistent background notifications**: Showing timer in notification tray or lock screen when app is closed (Android/iOS persistent notifications) - marked as future enhancement1. **Given** today is October 26 and I have an entry for October 26 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal

3. **Manual timer controls**: Manual start/stop/pause buttons for the timer - timer is fully automatic based on meal time logging

4. **Timer widgets**: Standalone timer widgets for home screen or desktop - focus is on in-app display only2. **Given** today is October 26 and I have an entry for October 26 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)**Independent Test**: Can be tested by creating entries with consistent fasting patterns to establish an average duration, then verifying the progress bar appears and fills correctly for a new active fast. Milestone notifications can be verified at specific time thresholds.

5. **Multi-fast tracking**: Tracking multiple simultaneous fasts (alternate day fasting, etc.) - single active fast per user only

6. **Alarm/reminder functionality**: Setting alarms or reminders to notify users at specific fasting milestones - notifications are visual only, not time-triggered alerts3. **Given** today is October 26 and I have no entry for October 26, **When** I load the entries page, **Then** no timer appears until I create today's entry

7. **Historical timer replay**: Showing timer countups for past fasting sessions - timer only shows current/active fast

8. **Social sharing**: Sharing timer status or milestones to social media - no sharing functionality in this feature4. **Given** today is October 26 and I have an entry for October 25 with last meal time but no October 26 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.

9. **Customizable milestones**: Allowing users to set custom milestone thresholds - using predefined standard milestones only (12h, 16h, 24h, etc.)

10. **Timer analytics**: Detailed analytics about timer viewing behavior or engagement metrics - basic implementation without tracking5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero

11. **Sound/audio cues**: Audio notifications or sound effects for milestone achievements - visual indicators only

12. **Data persistence changes**: Any modifications to the Entry model or database schema - using existing fields only**Acceptance Scenarios**:



## Dependencies *(if applicable)*---



- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and potentially `firstMealTime` fields  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.

- **Entries Page**: Feature integrates with existing `/entries` page (src/app/entries/page.js) where timer will be displayed

- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly### Edge Cases

- **User Settings**: Timer should respect user's time format preference (12h/24h) from existing settings system

- **Authentication**: Requires existing authentication system to identify the current user and their entries1. **Given** I have a fasting history establishing an average duration of 16 hours, **When** I view my active fasting timer, **Then** I see a progress bar showing percentage toward 16 hours

- **Date/Time Utilities**: May leverage existing date utility functions (getYesterday, formatDate, etc.) from src/lib/utils/dateUtils.js

- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)

## Technical Constraints *(if applicable)*

- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)2. **Given** my active fast reaches 12 hours, **When** the timer updates, **Then** I see a milestone indicator with animated highlight and persistent badge celebrating "12-Hour Milestone Reached"**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.

- **Client-side rendering**: Timer must work in 'use client' React components (entries page is client-side)

- **React state management**: Timer updates must integrate with existing React state patterns without causing unnecessary re-renders- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

- **Calculation accuracy**: Elapsed time must account for timezone differences and use consistent date/time handling

- **Performance**: Timer updates (every 60 seconds) must not degrade page performance or cause memory leaks over extended periods- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)3. **Given** I am at 89% of my typical fasting duration, **When** the timer updates, **Then** the progress bar shows 89% filled with the percentage displayed

- **Browser compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

- **Mobile responsiveness**: Must adapt to mobile viewport constraints without breaking layout or being hidden- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **Existing styling**: Should follow existing Tailwind CSS patterns and design system used throughout the app

- **No database changes**: Implementation must not require Entry model changes or database migrations- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)4. **Given** I have no established fasting pattern (new user or inconsistent history), **When** I view the active timer, **Then** I see the elapsed time without a progress bar, with a message explaining progress tracking will activate after more entriesA user logs their last meal time for today and immediately sees a live timer on the entries page showing their current fasting duration. The timer updates every minute and persists across page refreshes by calculating elapsed time from the logged last meal time.  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,


- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)



## Requirements *(mandatory)*

---**Acceptance Scenarios**:

### Functional Requirements



- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time for the next day

- **FR-002**: Timer MUST update the displayed elapsed time at least once per minute to show current fasting duration### User Story 3 - Timer Auto-Stop on Fast Break (Priority: P1)  you should still have a viable MVP (Minimum Viable Product) that delivers value.

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")

- **FR-006**: Timer MUST be displayed as a dedicated card component at the top of the entries page, before the entry listWhen a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for the next day or breaks their current fast

- **FR-008**: Timer MUST show milestone achievements at significant durations (12 hours, 16 hours, 24 hours, etc.) through animated highlights on the timer with persistent badge/icon indicators

- **FR-009**: System MUST display a progress bar alongside the timer when a target duration can be determined from user's fasting history (minimum 7-10 historical entries)

- **FR-010**: Progress bar MUST show percentage completion toward the target duration (e.g., "89% of 16 hours")**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer prominently displayed showing the correct elapsed time since my last meal**Why this priority**: This is the core MVP functionality that delivers immediate value - users can see their fasting progress in real-time without any additional actions. This provides motivation and awareness of their current fasting status.  

- **FR-011**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-012**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer

- **FR-013**: System MUST determine target fasting duration by calculating the user's average or most common fasting duration from recent entry history (last 30 days)

- **FR-014**: Timer display MUST use the user's preferred time format setting (12-hour or 24-hour) when showing start time**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.3. **Given** I am viewing the active fasting timer, **When** one minute passes, **Then** the timer updates to show the new elapsed time without page refresh

- **FR-015**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")

- **FR-016**: System MUST recalculate and update timer when today's entry is edited or deleted

- **FR-017**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports

- **FR-018**: When user has insufficient fasting history for progress bar, system MUST display a hint message explaining progress tracking will unlock after completing more fasts**Acceptance Scenarios**:4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.



### Key Entities



- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no breaking time yet logged for the next period. Contains calculated elapsed duration and optional target duration.1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.

- **Milestone**: Predefined fasting duration thresholds (12h, 16h, 20h, 24h, 36h, 48h) that trigger animated highlights with persistent badge/icon indicators when reached during an active fast.2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times

- **Target Duration**: The expected fasting goal for the current session, calculated from the user's historical fasting patterns (average or median of recent fasting durations). Used to show progress percentage. Only available when sufficient history exists.

3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer**Independent Test**: Can be fully tested by creating a today's entry with a last meal time, then verifying the timer appears and counts up automatically. Refreshing the page should show the correct elapsed time. This delivers immediate value as a standalone feature.  Think of each story as a standalone slice of functionality that can be:

## Success Criteria *(mandatory)*

4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display

### Measurable Outcomes

---

- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times

- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists---

- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time

- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast  - Developed independently

- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times

- **SC-006**: Progress bar (when shown) accurately reflects percentage completion with less than 1% deviation from actual calculation### User Story 4 - Timer Status at Page Load (Priority: P2)

- **SC-007**: Milestone indicators appear within 60 seconds of reaching the milestone duration

- **SC-008**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)### User Story 2 - Timer Progress Visualization (Priority: P2)

- **SC-009**: Timer accurately handles timezone displays and calculations for users in any timezone

- **SC-010**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenariosWhen a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.



## Assumptions *(mandatory)***Acceptance Scenarios**:  - Tested independently



1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format) and `date` (Date) fields that can be used to calculate elapsed fasting time**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.

2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries

3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the last meal timestampA user with an active fast sees a visual progress bar alongside the timer if they have a target fasting duration (based on their average or most common fasting duration). The progress bar fills as they approach their goal, and milestone achievements are highlighted.

4. **Performance**: Updating timer every minute is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page

5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functions**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.

6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)

7. **Historical data**: Users with insufficient historical entries (< 7-10 entries) will see timer without progress bar, with hint message about unlocking this feature  - Deployed independently

8. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)

9. **Entry creation flow**: Existing entry creation form and API already handle logging last meal time - no changes to data persistence are required**Acceptance Scenarios**:

10. **Time synchronization**: User's device clock is reasonably accurate (within a few minutes) for timer calculations to be meaningful

**Why this priority**: Visual feedback enhances motivation and provides immediate understanding of progress toward goals. This builds on the core timer functionality to make it more engaging.

## Out of Scope *(mandatory)*

1. **Given** today is October 26 and I have an entry for October 26 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal

1. **Push notifications**: Sending mobile push notifications for milestone achievements or timer updates - this is a future enhancement

2. **Persistent background notifications**: Showing timer in notification tray or lock screen when app is closed (Android/iOS persistent notifications) - marked as future enhancement2. **Given** today is October 26 and I have an entry for October 26 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)1. **Given** I am logged in and on the entries page, **When** I create today's entry with last meal time of 6:00 PM, **Then** I see a live timer displaying "Fasting for 0 hours 0 minutes" that starts counting up immediately  - Demonstrated to users independently

3. **Manual timer controls**: Manual start/stop/pause buttons for the timer - timer is fully automatic based on meal time logging

4. **Timer widgets**: Standalone timer widgets for home screen or desktop - focus is on in-app display only3. **Given** today is October 26 and I have no entry for October 26, **When** I load the entries page, **Then** no timer appears until I create today's entry

5. **Multi-fast tracking**: Tracking multiple simultaneous fasts (alternate day fasting, etc.) - single active fast per user only

6. **Alarm/reminder functionality**: Setting alarms or reminders to notify users at specific fasting milestones - notifications are visual only, not time-triggered alerts4. **Given** today is October 26 and I have an entry for October 25 with last meal time but no October 26 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)**Independent Test**: Can be tested by creating entries with consistent fasting patterns to establish an average duration, then verifying the progress bar appears and fills correctly for a new active fast. Milestone notifications can be verified at specific time thresholds.

7. **Historical timer replay**: Showing timer countups for past fasting sessions - timer only shows current/active fast

8. **Social sharing**: Sharing timer status or milestones to social media - no sharing functionality in this feature5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero

9. **Customizable milestones**: Allowing users to set custom milestone thresholds - using predefined standard milestones only (12h, 16h, 24h, etc.)

10. **Timer analytics**: Detailed analytics about timer viewing behavior or engagement metrics - basic implementation without tracking2. **Given** I have an active fast (today's entry with last meal time logged), **When** I view the entries page, **Then** I see the timer prominently displayed showing the correct elapsed time since my last meal-->

11. **Sound/audio cues**: Audio notifications or sound effects for milestone achievements - visual indicators only

12. **Data persistence changes**: Any modifications to the Entry model or database schema - using existing fields only---



## Dependencies *(if applicable)***Acceptance Scenarios**:



- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and potentially `firstMealTime` fields### Edge Cases

- **Entries Page**: Feature integrates with existing `/entries` page (src/app/entries/page.js) where timer will be displayed

- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly3. **Given** I am viewing the active fasting timer, **When** one minute passes, **Then** the timer updates to show the new elapsed time without page refresh

- **User Settings**: Timer should respect user's time format preference (12h/24h) from existing settings system

- **Authentication**: Requires existing authentication system to identify the current user and their entries- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)

- **Date/Time Utilities**: May leverage existing date utility functions (getYesterday, formatDate, etc.) from src/lib/utils/dateUtils.js

- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)1. **Given** I have a fasting history establishing an average duration of 16 hours, **When** I view my active fasting timer, **Then** I see a progress bar showing percentage toward 16 hours

## Technical Constraints *(if applicable)*

- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

- **Client-side rendering**: Timer must work in 'use client' React components (entries page is client-side)

- **React state management**: Timer updates must integrate with existing React state patterns without causing unnecessary re-renders- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)2. **Given** my active fast reaches 12 hours, **When** the timer updates, **Then** I see a milestone indicator (visual highlight or message) celebrating "12-Hour Milestone Reached"4. **Given** I have an active fast showing a timer, **When** I refresh the page, **Then** the timer recalculates and displays the correct current elapsed time based on the logged last meal time### User Story 1 - [Brief Title] (Priority: P1)

- **Calculation accuracy**: Elapsed time must account for timezone differences and use consistent date/time handling

- **Performance**: Timer updates (every minute) must not degrade page performance or cause memory leaks over extended periods- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **Browser compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

- **Mobile responsiveness**: Must adapt to mobile viewport constraints without breaking layout or being hidden- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)3. **Given** I am at 89% of my typical fasting duration, **When** the timer updates, **Then** the progress bar shows 89% filled with the percentage displayed

- **Existing styling**: Should follow existing Tailwind CSS patterns and design system used throughout the app

- **No database changes**: Implementation must not require Entry model changes or database migrations- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)


4. **Given** I have no established fasting pattern (new user or inconsistent history), **When** I view the active timer, **Then** I see the elapsed time without a progress bar, with a message explaining progress tracking will activate after more entries5. **Given** I have an active fast, **When** I navigate away and return to the entries page, **Then** the timer still shows and displays the correct elapsed time

## Requirements *(mandatory)*



### Functional Requirements

---[Describe this user journey in plain language]

- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time for the next day

- **FR-002**: Timer MUST update the displayed elapsed time at least once per minute to show current fasting duration

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load### User Story 3 - Timer Auto-Stop on Fast Break (Priority: P1)---

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")

- **FR-006**: Timer MUST be displayed as a dedicated card component at the top of the entries page, before the entry list

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for the next day or breaks their current fast

- **FR-008**: Timer MUST show milestone achievements at significant durations (12 hours, 16 hours, 24 hours, etc.) through animated highlights on the timer with persistent badge/icon indicatorsWhen a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.**Why this priority**: [Explain the value and why it has this priority level]

- **FR-009**: System MUST display a progress bar alongside the timer when a target duration can be determined from user's fasting history

- **FR-010**: Progress bar MUST show percentage completion toward the target duration (e.g., "89% of 16 hours")

- **FR-011**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-012**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.### User Story 2 - Timer Progress Visualization (Priority: P2)

- **FR-013**: System MUST determine target fasting duration by calculating the user's average or most common fasting duration from recent entry history (last 30 days)

- **FR-014**: Timer display MUST use the user's preferred time format setting (12-hour or 24-hour) when showing start time

- **FR-015**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")

- **FR-016**: System MUST recalculate and update timer when today's entry is edited or deleted**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

- **FR-017**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports



### Key Entities

**Acceptance Scenarios**:A user with an active fast sees a visual progress bar alongside the timer if they have a target fasting duration (based on their average or most common fasting duration). The progress bar fills as they approach their goal, and milestone achievements are highlighted.

- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no breaking time yet logged for the next period. Contains calculated elapsed duration and optional target duration.

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.

- **Milestone**: Predefined fasting duration thresholds (12h, 16h, 20h, 24h, 36h, 48h) that trigger animated highlights with persistent badge/icon indicators when reached during an active fast.

- **Target Duration**: The expected fasting goal for the current session, calculated from the user's historical fasting patterns (average or median of recent fasting durations). Used to show progress percentage.1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"**Acceptance Scenarios**:



## Success Criteria *(mandatory)*2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times



### Measurable Outcomes3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer**Why this priority**: Visual feedback enhances motivation and provides immediate understanding of progress toward goals. This builds on the core timer functionality to make it more engaging.



- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display

- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists

- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time1. **Given** [initial state], **When** [action], **Then** [expected outcome]

- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast

- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times---

- **SC-006**: Progress bar (when shown) accurately reflects percentage completion with less than 1% deviation from actual calculation

- **SC-007**: Milestone indicators appear within 60 seconds of reaching the milestone duration**Independent Test**: Can be tested by creating entries with consistent fasting patterns to establish an average duration, then verifying the progress bar appears and fills correctly for a new active fast. Milestone notifications can be verified at specific time thresholds.2. **Given** [initial state], **When** [action], **Then** [expected outcome]

- **SC-008**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)

- **SC-009**: Timer accurately handles timezone displays and calculations for users in any timezone### User Story 4 - Timer Status at Page Load (Priority: P2)

- **SC-010**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenarios



## Assumptions *(mandatory)*

When a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.

1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format) and `date` (Date) fields that can be used to calculate elapsed fasting time

2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries**Acceptance Scenarios**:---

3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the last meal timestamp

4. **Performance**: Updating timer every minute is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.

5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functions

6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)

7. **Historical data**: Sufficient historical entries exist (minimum 7-10 entries) to calculate meaningful target duration for progress bar, otherwise progress bar is hidden

8. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.

9. **Entry creation flow**: Existing entry creation form and API already handle logging last meal time - no changes to data persistence are required

10. **Time synchronization**: User's device clock is reasonably accurate (within a few minutes) for timer calculations to be meaningful1. **Given** I have a fasting history establishing an average duration of 16 hours, **When** I view my active fasting timer, **Then** I see a progress bar showing percentage toward 16 hours### User Story 2 - [Brief Title] (Priority: P2)



## Out of Scope *(mandatory)***Acceptance Scenarios**:



1. **Push notifications**: Sending mobile push notifications for milestone achievements or timer updates - this is a future enhancement2. **Given** my active fast reaches 12 hours, **When** the timer updates, **Then** I see a milestone indicator (visual highlight or message) celebrating "12-Hour Milestone Reached"

2. **Persistent background notifications**: Showing timer in notification tray or lock screen when app is closed (Android/iOS persistent notifications) - marked as future enhancement

3. **Manual timer controls**: Manual start/stop/pause buttons for the timer - timer is fully automatic based on meal time logging1. **Given** today is October 26 and I have an entry for October 26 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal

4. **Timer widgets**: Standalone timer widgets for home screen or desktop - focus is on in-app display only

5. **Multi-fast tracking**: Tracking multiple simultaneous fasts (alternate day fasting, etc.) - single active fast per user only2. **Given** today is October 26 and I have an entry for October 26 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)3. **Given** I am at 89% of my typical fasting duration, **When** the timer updates, **Then** the progress bar shows 89% filled with the percentage displayed[Describe this user journey in plain language]

6. **Alarm/reminder functionality**: Setting alarms or reminders to notify users at specific fasting milestones - notifications are visual only, not time-triggered alerts

7. **Historical timer replay**: Showing timer countups for past fasting sessions - timer only shows current/active fast3. **Given** today is October 26 and I have no entry for October 26, **When** I load the entries page, **Then** no timer appears until I create today's entry

8. **Social sharing**: Sharing timer status or milestones to social media - no sharing functionality in this feature

9. **Customizable milestones**: Allowing users to set custom milestone thresholds - using predefined standard milestones only (12h, 16h, 24h, etc.)4. **Given** today is October 26 and I have an entry for October 25 with last meal time but no October 26 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)4. **Given** I have no established fasting pattern (new user or inconsistent history), **When** I view the active timer, **Then** I see the elapsed time without a progress bar, with a message explaining progress tracking will activate after more entries

10. **Timer analytics**: Detailed analytics about timer viewing behavior or engagement metrics - basic implementation without tracking

11. **Sound/audio cues**: Audio notifications or sound effects for milestone achievements - visual indicators only5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero

12. **Data persistence changes**: Any modifications to the Entry model or database schema - using existing fields only

**Why this priority**: [Explain the value and why it has this priority level]

## Dependencies *(if applicable)*

---

- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and potentially `firstMealTime` fields

- **Entries Page**: Feature integrates with existing `/entries` page (src/app/entries/page.js) where timer will be displayed---

- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly

- **User Settings**: Timer should respect user's time format preference (12h/24h) from existing settings system### Edge Cases

- **Authentication**: Requires existing authentication system to identify the current user and their entries

- **Date/Time Utilities**: May leverage existing date utility functions (getYesterday, formatDate, etc.) from src/lib/utils/dateUtils.js**Independent Test**: [Describe how this can be tested independently]



## Technical Constraints *(if applicable)*- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)



- **Client-side rendering**: Timer must work in 'use client' React components (entries page is client-side)- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)### User Story 3 - Timer Auto-Stop on Fast Break (Priority: P1)

- **React state management**: Timer updates must integrate with existing React state patterns without causing unnecessary re-renders

- **Calculation accuracy**: Elapsed time must account for timezone differences and use consistent date/time handling- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

- **Performance**: Timer updates (every minute) must not degrade page performance or cause memory leaks over extended periods

- **Browser compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)**Acceptance Scenarios**:

- **Mobile responsiveness**: Must adapt to mobile viewport constraints without breaking layout or being hidden

- **Existing styling**: Should follow existing Tailwind CSS patterns and design system used throughout the app- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **No database changes**: Implementation must not require Entry model changes or database migrations

- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)When a user logs their first meal time for the next day or edits today's entry to add a first meal time (breaking their fast), the timer automatically stops and shows the completed fast duration instead of a live countdown.

- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

## Requirements *(mandatory)*

**Why this priority**: Critical for accuracy and user experience - the timer must know when the fast has ended to avoid showing incorrect information. This prevents confusion and maintains data integrity.

### Functional Requirements

---

- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time for the next day

- **FR-002**: Timer MUST update the displayed elapsed time at least once per minute to show current fasting duration**Independent Test**: Can be tested by having an active fast timer running, then creating tomorrow's entry with a first meal time, or editing today's entry to add a breaking fast time. Timer should immediately stop and display the completed duration.

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load### User Story 3 - [Brief Title] (Priority: P3)

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")

- **FR-006**: Timer MUST be displayed as a dedicated card component at the top of the entries page, before the entry list**Acceptance Scenarios**:

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for the next day or breaks their current fast

- **FR-008**: Timer MUST show milestone achievements at significant durations (12 hours, 16 hours, 24 hours, etc.) through visual indicators or brief messages[Describe this user journey in plain language]

- **FR-009**: System MUST display a progress bar alongside the timer when a target duration can be determined from user's fasting history

- **FR-010**: Progress bar MUST show percentage completion toward the target duration (e.g., "89% of 16 hours")1. **Given** I have an active fasting timer running, **When** I create tomorrow's entry and log my first meal time, **Then** the timer stops counting and displays "Fast Completed: [duration]"

- **FR-011**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-012**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer2. **Given** I am currently fasting, **When** I edit today's entry to add a breaking fast indicator or modify meal times, **Then** the timer recalculates or stops based on the new times**Why this priority**: [Explain the value and why it has this priority level]

- **FR-013**: System MUST determine target fasting duration by calculating the user's average or most common fasting duration from recent entry history (last 30 days)

- **FR-014**: Timer display MUST use the user's preferred time format setting (12-hour or 24-hour) when showing start time3. **Given** I have completed a fast (timer stopped), **When** I view the entries page, **Then** I see the final completed duration displayed instead of a live timer

- **FR-015**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")

- **FR-016**: System MUST recalculate and update timer when today's entry is edited or deleted4. **Given** I am actively fasting, **When** I delete today's entry, **Then** the timer disappears from the display**Independent Test**: [Describe how this can be tested independently]

- **FR-017**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports



### Key Entities

---**Acceptance Scenarios**:

- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no breaking time yet logged for the next period. Contains calculated elapsed duration and optional target duration.

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.

- **Milestone**: Predefined fasting duration thresholds (12h, 16h, 20h, 24h, 36h, 48h) that trigger visual celebrations or notifications when reached during an active fast.

- **Target Duration**: The expected fasting goal for the current session, calculated from the user's historical fasting patterns (average or median of recent fasting durations). Used to show progress percentage.### User Story 4 - Timer Status at Page Load (Priority: P2)1. **Given** [initial state], **When** [action], **Then** [expected outcome]



## Success Criteria *(mandatory)*



### Measurable OutcomesWhen a user opens the entries page, the system intelligently determines whether to show an active fasting timer, a completed fast summary, or no timer based on their most recent entry data.---



- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times

- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists

- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time**Why this priority**: Ensures the timer appears contextually - only when relevant. This prevents showing stale or incorrect timer information and provides a smooth user experience.[Add more user stories as needed, each with an assigned priority]

- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast

- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times

- **SC-006**: Progress bar (when shown) accurately reflects percentage completion with less than 1% deviation from actual calculation

- **SC-007**: Milestone indicators appear within 60 seconds of reaching the milestone duration**Independent Test**: Can be tested by creating different entry scenarios (today's entry with last meal only, today's entry with both meals, no today entry, etc.) and verifying the correct timer state appears on page load.### Edge Cases

- **SC-008**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)

- **SC-009**: Timer accurately handles timezone displays and calculations for users in any timezone

- **SC-010**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenarios

**Acceptance Scenarios**:<!--

## Assumptions *(mandatory)*

  ACTION REQUIRED: The content in this section represents placeholders.

1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format) and `date` (Date) fields that can be used to calculate elapsed fasting time

2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries1. **Given** today is October 26 and I have an entry for October 26 with only last meal time logged, **When** I load the entries page, **Then** the active fasting timer appears showing elapsed time since last meal  Fill them out with the right edge cases.

3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the last meal timestamp

4. **Performance**: Updating timer every minute is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page2. **Given** today is October 26 and I have an entry for October 26 with both first and last meal times, **When** I load the entries page, **Then** no active timer appears (fast is complete for today)-->

5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functions

6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)3. **Given** today is October 26 and I have no entry for October 26, **When** I load the entries page, **Then** no timer appears until I create today's entry

7. **Historical data**: Sufficient historical entries exist (minimum 7-10 entries) to calculate meaningful target duration for progress bar, otherwise progress bar is hidden

8. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)4. **Given** today is October 26 and I have an entry for October 25 with last meal time but no October 26 entry, **When** I load the entries page, **Then** no active timer appears (previous day's fast is historical)- What happens when [boundary condition]?

9. **Entry creation flow**: Existing entry creation form and API already handle logging last meal time - no changes to data persistence are required

10. **Time synchronization**: User's device clock is reasonably accurate (within a few minutes) for timer calculations to be meaningful5. **Given** I have an active fast timer showing, **When** I create a new entry that starts a fresh fast, **Then** the timer resets to show the new fast duration starting from zero- How does system handle [error scenario]?



## Out of Scope *(mandatory)*



1. **Push notifications**: Sending mobile push notifications for milestone achievements or timer updates - this is a future enhancement---## Requirements *(mandatory)*

2. **Persistent background notifications**: Showing timer in notification tray or lock screen when app is closed (Android/iOS persistent notifications) - marked as future enhancement

3. **Manual timer controls**: Manual start/stop/pause buttons for the timer - timer is fully automatic based on meal time logging

4. **Timer widgets**: Standalone timer widgets for home screen or desktop - focus is on in-app display only

5. **Multi-fast tracking**: Tracking multiple simultaneous fasts (alternate day fasting, etc.) - single active fast per user only### Edge Cases<!--

6. **Alarm/reminder functionality**: Setting alarms or reminders to notify users at specific fasting milestones - notifications are visual only, not time-triggered alerts

7. **Historical timer replay**: Showing timer countups for past fasting sessions - timer only shows current/active fast  ACTION REQUIRED: The content in this section represents placeholders.

8. **Social sharing**: Sharing timer status or milestones to social media - no sharing functionality in this feature

9. **Customizable milestones**: Allowing users to set custom milestone thresholds - using predefined standard milestones only (12h, 16h, 24h, etc.)- **Multiple sessions**: What happens when a user has the entries page open in multiple browser tabs/devices? (Each tab should independently calculate and display elapsed time based on the logged last meal time - no real-time sync needed, just consistent calculation)  Fill them out with the right functional requirements.

10. **Timer analytics**: Detailed analytics about timer viewing behavior or engagement metrics - basic implementation without tracking

11. **Sound/audio cues**: Audio notifications or sound effects for milestone achievements - visual indicators only- **Timezone changes**: How does the timer handle users traveling across timezones? (Timer calculates based on absolute timestamps, so elapsed time remains accurate regardless of timezone display)-->

12. **Data persistence changes**: Any modifications to the Entry model or database schema - using existing fields only

- **Past entry edits**: What happens when a user edits yesterday's entry while today's timer is running? (Today's timer should be unaffected unless the edit impacts today's fasting duration calculation)

## Dependencies *(if applicable)*

- **Very long fasts (>24 hours)**: How does the timer display durations exceeding one day? (Display as "1 day 5 hours" or "29 hours" - use days + hours format for clarity)### Functional Requirements

- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and potentially `firstMealTime` fields

- **Entries Page**: Feature integrates with existing `/entries` page (src/app/entries/page.js) where timer will be displayed- **Exactly at midnight**: What happens when a user is fasting at midnight and the date changes? (Timer continues counting - it tracks from last meal time regardless of date boundary. Timer stops only when first meal is logged)

- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly

- **User Settings**: Timer should respect user's time format preference (12h/24h) from existing settings system- **Browser closed**: Does the timer continue counting when the browser is closed? (Yes - elapsed time is calculated from the logged last meal timestamp, not maintained in memory. When user reopens, timer shows correct elapsed time)- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]

- **Authentication**: Requires existing authentication system to identify the current user and their entries

- **Date/Time Utilities**: May leverage existing date utility functions (getYesterday, formatDate, etc.) from src/lib/utils/dateUtils.js- **No JavaScript/offline**: What happens if JavaScript fails to load or user is offline? (Timer won't update in real-time, but last calculated elapsed time should be shown. Graceful degradation to show static "Fasting since [time]" message)- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  



## Technical Constraints *(if applicable)*- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]



- **Client-side rendering**: Timer must work in 'use client' React components (entries page is client-side)## Requirements *(mandatory)*- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]

- **React state management**: Timer updates must integrate with existing React state patterns without causing unnecessary re-renders

- **Calculation accuracy**: Elapsed time must account for timezone differences and use consistent date/time handling- **FR-005**: System MUST [behavior, e.g., "log all security events"]

- **Performance**: Timer updates (every minute) must not degrade page performance or cause memory leaks over extended periods

- **Browser compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)### Functional Requirements

- **Mobile responsiveness**: Must adapt to mobile viewport constraints without breaking layout or being hidden

- **Existing styling**: Should follow existing Tailwind CSS patterns and design system used throughout the app*Example of marking unclear requirements:*

- **No database changes**: Implementation must not require Entry model changes or database migrations

- **FR-001**: System MUST display a live fasting timer on the entries page when today's entry exists with a last meal time logged and no first meal time for the next day

- **FR-002**: Timer MUST update the displayed elapsed time at least once per minute to show current fasting duration- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]

- **FR-003**: Timer MUST calculate elapsed time by comparing current time with the last meal time from today's entry (not by maintaining an in-memory counter)- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

- **FR-004**: Timer MUST persist across page refreshes by recalculating elapsed time on each page load

- **FR-005**: Timer MUST display elapsed time in a human-readable format showing hours and minutes (e.g., "14h 23m" or "14 hours 23 minutes")### Key Entities *(include if feature involves data)*

- **FR-006**: Timer MUST appear prominently on the entries page in a fixed or highly visible location (top of entry list or dedicated timer card)

- **FR-007**: Timer MUST automatically stop counting when the user logs a first meal time for the next day or breaks their current fast- **[Entity 1]**: [What it represents, key attributes without implementation]

- **FR-008**: Timer MUST show milestone achievements at significant durations (12 hours, 16 hours, 24 hours, etc.) through visual indicators or brief messages- **[Entity 2]**: [What it represents, relationships to other entities]

- **FR-009**: System MUST display a progress bar alongside the timer when a target duration can be determined from user's fasting history

- **FR-010**: Progress bar MUST show percentage completion toward the target duration (e.g., "89% of 16 hours")## Success Criteria *(mandatory)*

- **FR-011**: Timer MUST display the fasting start time (last meal time) alongside the elapsed duration for user reference

- **FR-012**: When no active fast exists (no today's entry or fast already broken), system MUST NOT display a timer<!--

- **FR-013**: System MUST determine target fasting duration by calculating the user's average or most common fasting duration from recent entry history (last 30 days)  ACTION REQUIRED: Define measurable success criteria.

- **FR-014**: Timer display MUST use the user's preferred time format setting (12-hour or 24-hour) when showing start time  These must be technology-agnostic and measurable.

- **FR-015**: Timer MUST handle fasts exceeding 24 hours by displaying in day + hour format (e.g., "1 day 5 hours")-->

- **FR-016**: System MUST recalculate and update timer when today's entry is edited or deleted

- **FR-017**: Timer MUST be responsive and display appropriately on mobile, tablet, and desktop viewports### Measurable Outcomes



### Key Entities- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]

- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]

- **Active Fast**: Represents the current ongoing fasting session, determined by today's entry having a last meal time but no breaking time yet logged for the next period. Contains calculated elapsed duration and optional target duration.- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]

- **Timer State**: The computed state determining what to display (active timer, completed fast summary, or no timer). Derived from today's entry data and timestamp calculations.- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

- **Milestone**: Predefined fasting duration thresholds (12h, 16h, 20h, 24h, 36h, 48h) that trigger visual celebrations or notifications when reached during an active fast.

- **Target Duration**: The expected fasting goal for the current session, calculated from the user's historical fasting patterns (average or median of recent fasting durations). Used to show progress percentage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with an active fast see their current fasting duration update within 60 seconds of the actual elapsed time at all times
- **SC-002**: Timer displays correctly (showing accurate elapsed time) after page refresh 100% of the time when an active fast exists
- **SC-003**: Timer automatically starts (shows "0 hours 0 minutes") within 2 seconds of creating a today's entry with last meal time
- **SC-004**: Timer automatically stops within 5 seconds of logging a first meal time that breaks the fast
- **SC-005**: Users can view their fasting progress without performing any manual actions beyond logging their normal meal times
- **SC-006**: Progress bar (when shown) accurately reflects percentage completion with less than 1% deviation from actual calculation
- **SC-007**: Milestone indicators appear within 60 seconds of reaching the milestone duration
- **SC-008**: Timer remains visible and accessible on all screen sizes (mobile 320px width to desktop 1920px+)
- **SC-009**: Timer accurately handles timezone displays and calculations for users in any timezone
- **SC-010**: System correctly determines whether to show active timer, completed fast, or no timer based on entry data in 100% of test scenarios

## Assumptions *(mandatory)*

1. **Entry Model**: The existing Entry model contains `lastMealTime` (String in HH:mm format) and `date` (Date) fields that can be used to calculate elapsed fasting time
2. **Existing today's date check**: The application can reliably determine "today's" date in the user's timezone to identify current entries
3. **Client-side calculation**: Timer elapsed time calculation happens on the client (browser) side using JavaScript/React, with the server providing only the last meal timestamp
4. **Performance**: Updating timer every minute is performant and does not cause noticeable performance degradation even with multiple timers or large entry lists on the page
5. **Browser capabilities**: Users have JavaScript enabled and use modern browsers supporting necessary DOM manipulation and timing functions
6. **Authentication**: User must be authenticated to see the timer (timer appears only on authenticated entries page)
7. **Historical data**: Sufficient historical entries exist (minimum 7-10 entries) to calculate meaningful target duration for progress bar, otherwise progress bar is hidden
8. **Concurrent fasts**: System design assumes only one active fast per user at a time (today's entry defines the active fast)
9. **Entry creation flow**: Existing entry creation form and API already handle logging last meal time - no changes to data persistence are required
10. **Time synchronization**: User's device clock is reasonably accurate (within a few minutes) for timer calculations to be meaningful

## Out of Scope *(mandatory)*

1. **Push notifications**: Sending mobile push notifications for milestone achievements or timer updates - this is a future enhancement
2. **Persistent background notifications**: Showing timer in notification tray or lock screen when app is closed (Android/iOS persistent notifications) - marked as future enhancement
3. **Manual timer controls**: Manual start/stop/pause buttons for the timer - timer is fully automatic based on meal time logging
4. **Timer widgets**: Standalone timer widgets for home screen or desktop - focus is on in-app display only
5. **Multi-fast tracking**: Tracking multiple simultaneous fasts (alternate day fasting, etc.) - single active fast per user only
6. **Alarm/reminder functionality**: Setting alarms or reminders to notify users at specific fasting milestones - notifications are visual only, not time-triggered alerts
7. **Historical timer replay**: Showing timer countups for past fasting sessions - timer only shows current/active fast
8. **Social sharing**: Sharing timer status or milestones to social media - no sharing functionality in this feature
9. **Customizable milestones**: Allowing users to set custom milestone thresholds - using predefined standard milestones only (12h, 16h, 24h, etc.)
10. **Timer analytics**: Detailed analytics about timer viewing behavior or engagement metrics - basic implementation without tracking
11. **Sound/audio cues**: Audio notifications or sound effects for milestone achievements - visual indicators only
12. **Data persistence changes**: Any modifications to the Entry model or database schema - using existing fields only

## Dependencies *(if applicable)*

- **Existing Entry Model**: Feature relies on current Entry model's `date`, `lastMealTime`, and potentially `firstMealTime` fields
- **Entries Page**: Feature integrates with existing `/entries` page (src/app/entries/page.js) where timer will be displayed
- **Entry Creation Flow**: Depends on existing entry creation form and API routes functioning correctly
- **User Settings**: Timer should respect user's time format preference (12h/24h) from existing settings system
- **Authentication**: Requires existing authentication system to identify the current user and their entries
- **Date/Time Utilities**: May leverage existing date utility functions (getYesterday, formatDate, etc.) from src/lib/utils/dateUtils.js

## Technical Constraints *(if applicable)*

- **Client-side rendering**: Timer must work in 'use client' React components (entries page is client-side)
- **React state management**: Timer updates must integrate with existing React state patterns without causing unnecessary re-renders
- **Calculation accuracy**: Elapsed time must account for timezone differences and use consistent date/time handling
- **Performance**: Timer updates (every minute) must not degrade page performance or cause memory leaks over extended periods
- **Browser compatibility**: Must work in all modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Mobile responsiveness**: Must adapt to mobile viewport constraints without breaking layout or being hidden
- **Existing styling**: Should follow existing Tailwind CSS patterns and design system used throughout the app
- **No database changes**: Implementation must not require Entry model changes or database migrations
