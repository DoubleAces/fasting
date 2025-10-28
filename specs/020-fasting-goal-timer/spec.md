# Feature Specification: Fasting Goal Timer# Feature Specification: Fasting Goal Timer# Feature Specification: Fasting Goal Timer# Feature Specification: Fasting Goal Timer# Feature Specification: Fasting Goal Timer# Feature Specification: Fasting Goal Timer# Feature Specification: [FEATURE NAME]



**Feature Branch**: `020-fasting-goal-timer`

**Created**: October 28, 2025

**Status**: Draft**Feature Branch**: `020-fasting-goal-timer`



**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."**Created**: October 28, 2025



## User Scenarios & Testing *(mandatory)***Status**: Draft**Feature Branch**: `020-fasting-goal-timer`



### User Story 1 - Set Fasting Goal (Priority: P1)



Users can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."**Created**: October 28, 2025



**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.



**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.## User Scenarios & Testing *(mandatory)***Status**: Draft**Feature Branch**: `020-fasting-goal-timer`



**Acceptance Scenarios**:



1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see an inline collapsible panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field### User Story 1 - Set Fasting Goal (Priority: P1)



2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the panel closes, showing my goal on the timer display



3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the panel closesUsers can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."**Created**: October 28, 2025



4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately



5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.



---



### User Story 2 - View Progress Toward Goal (Priority: P1)**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.## User Scenarios & Testing *(mandatory)***Status**: Draft**Feature Branch**: `020-fasting-goal-timer`  



Users see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.



**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.**Acceptance Scenarios**:



**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".



**Acceptance Scenarios**:1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see a modal/panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field### User Story 1 - Set Fasting Goal (Priority: P1)



1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%



2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progress2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the modal closes, showing my goal on the timer display



3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal



4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the modal closesUsers can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."**Created**: October 28, 2025  



5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"



---4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately



### User Story 3 - See Goal Completion Time (Priority: P1)



Users see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.



**Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.



**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.---



**Acceptance Scenarios**:



1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information### User Story 2 - View Progress Toward Goal (Priority: P1)**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.## User Scenarios & Testing *(mandatory)***Status**: Draft  **Feature Branch**: `020-fasting-goal-timer`  **Feature Branch**: `[###-feature-name]`  



2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)



3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)Users see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.



4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown



---**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.**Acceptance Scenarios**:



### User Story 4 - Goal Persistence and Analytics (Priority: P2)



When users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".



**Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.



**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.**Acceptance Scenarios**:1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see a modal/panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field### User Story 1 - Set Fasting Goal (Priority: P1)**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."



**Acceptance Scenarios**:



1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%



2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'



3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progress2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the modal closes, showing my goal on the timer display



4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)



---3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal



### Edge Cases



- **What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)?** 4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the modal closesUsers can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.**Created**: October 28, 2025  **Created**: [DATE]  

  

  **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp. System treats this as an immediately completed goal. When fast ends, goalStatus will be 'completed'.



- **What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later?** 5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"

  

  **Answer**: Goal is stored in localStorage as part of session state, so it will persist across browser restarts. Goal remains active until fast ends or user explicitly clears it.



- **What happens if a user changes their goal multiple times during a single fast?**---4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately

  

  **Answer**: Each goal change immediately recalculates progress bar and completion time. When fast ends, only the FINAL goal is saved to the Entry record (fastingGoal and goalStatus reflect the last-set goal).



- **What happens if localStorage is disabled or cleared while a fast is active?**### User Story 3 - See Goal Completion Time (Priority: P1)

  

  **Answer**: Goal data will be lost. User will need to set goal again. This is acceptable per spec assumptions (session-based design). The system will show a warning notification when localStorage.setItem() fails and gracefully degrade to Context-only mode.



- **What happens if user's device clock changes (DST, manual adjustment) during a fast?**Users see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.## User Scenarios & Testing *(mandatory)*

  

  **Answer**: Completion time calculation uses client-side Date objects, so it will adjust to new clock time. This is acceptable per spec assumptions (client-side time calculation). Progress percentage calculation uses elapsed milliseconds, so it's not affected by clock changes.



- **What happens if a user sets a goal but ends the fast before the timer has updated (within 60 seconds)?****Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.

  

  **Answer**: Progress bar may not have updated yet (60s update cycle), but goalStatus calculation happens at fast end time based on final duration. Data accuracy is preserved even if UI hasn't updated yet.



---**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.---



## Functional Requirements *(optional)*



1. **FR-001**: System SHALL provide four preset goal buttons: 12h, 16h, 18h, and 24h**Acceptance Scenarios**:

2. **FR-002**: System SHALL provide a custom input field accepting numeric values between 1 and 168 hours

3. **FR-003**: System SHALL validate custom input and reject values outside 1-168 range or non-numeric input

4. **FR-004**: System SHALL allow decimal values for custom input (e.g., 14.5 hours for 14 hours 30 minutes)

5. **FR-005**: System SHALL store goal data in React Context and localStorage for session persistence1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information### User Story 2 - View Progress Toward Goal (Priority: P1)**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.**Status**: Draft  **Status**: Draft  

6. **FR-006**: System SHALL clear localStorage goal data when fast ends (after entry is created)

7. **FR-007**: System SHALL calculate progress percentage as (elapsedTime / goalTime) × 100

8. **FR-008**: System SHALL update progress display every 60 seconds (synced with timer updates)

9. **FR-009**: System SHALL display progress in format "Xh Ym / Xh Ym (Z%)"2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)

10. **FR-010**: System SHALL show visual indicator (green color, checkmark icon) when progress exceeds 100%

11. **FR-011**: System SHALL calculate goal completion time as lastMealTime + goalDuration

12. **FR-012**: System SHALL format completion time as "MMM d, h:mm a" (e.g., "Oct 29, 4:00 AM")

13. **FR-013**: System SHALL display completion time below progress bar3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)Users see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.

14. **FR-014**: System SHALL add fastingGoal field to Entry model (type: Number, min: 1, max: 10080 minutes)

15. **FR-015**: System SHALL add goalStatus field to Entry model (type: String, enum: ['completed', 'not-completed', 'no-goal'])

16. **FR-016**: System SHALL calculate goalStatus as 'completed' if duration >= goal, 'not-completed' if duration < goal, 'no-goal' if no goal set

17. **FR-017**: System SHALL modify POST /api/entries endpoint to accept optional fastingGoal and goalStatus fields4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown

18. **FR-018**: System SHALL validate goal/status consistency (if goal provided, status must be provided and vice versa)



---

---**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.**Acceptance Scenarios**:### User Story 1 - Set Fasting Goal (Priority: P1)

## Success Criteria *(optional)*



1. **SC-001**: Goal can be set in <10 seconds from button click to confirmation

2. **SC-002**: Progress bar updates within 1 second of timer tick### User Story 4 - Goal Persistence and Analytics (Priority: P2)

3. **SC-003**: Completion time calculation error is <1% of actual time

4. **SC-004**: Goal data persists to Entry record with 100% accuracy

5. **SC-005**: Edge cases (>100% progress, no goal, goal changes) handled without errors

6. **SC-006**: Goal change feedback is visible within 1 secondWhen users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".

7. **SC-007**: No breaking changes to existing timer functionality

8. **SC-008**: Visual confirmation of goal completion is clear and immediate (checkmark, color change)



---**Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.



## Assumptions *(optional)*



1. User has Feature 017 (Live Fasting Timer) already deployed and functional**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.**Acceptance Scenarios**:1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see a modal/panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field**Input**: User description: "Add fasting goal feature to live timer. User can set a target fasting duration (preset buttons: 12h, 16h, 18h, 24h OR custom input). Display real-time progress bar showing current duration vs goal (e.g., '2h 30m / 16h 00m'). Show calculated goal completion time (e.g., 'Goal reached at: Oct 29, 4:00 AM'). Goal is session-based (set per fast, can be changed mid-fast). When fast ends, save to entry: fastingGoal (number), goalStatus (completed/not-completed/no-goal based on if duration >= goal). This enables future analytics on goal completion rate and willpower tracking."**Input**: User description: "$ARGUMENTS"

2. User's device clock is reasonably accurate (client-side time calculations acceptable)

3. User understands "session-based" means goal doesn't persist across browser sessions unless fast is active

4. Maximum practical fasting goal is 7 days (168 hours) - longer fasts are rare and not primary use case

5. Progress updates every 60 seconds (matching existing timer update frequency) is sufficient - no need for real-time (1-second) updates**Acceptance Scenarios**:

6. User can change goal mid-fast, and final goal is what gets saved to Entry record

7. Browser localStorage is available and enabled (fallback: in-memory only with warning notification, goal lost on refresh)

8. User has MongoDB connection established (required for Entry model persistence)

1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%

---



## Dependencies *(optional)*

2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'

1. **Feature 017 - Live Fasting Timer**: Provides `useFastingTimer` hook with `elapsedMs` state

2. **Entry Model** (`src/lib/models/Entry.js`): Mongoose schema must support optional field additions

3. **FastingTimer Component** (`src/components/organisms/FastingTimer.js`): Integration point for goal UI

4. **POST /api/entries Route** (`src/app/api/entries/route.js`): Must be modified to accept goal fields3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progress2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the modal closes, showing my goal on the timer displayUsers can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.

5. **MongoDB Database**: Must be accessible for schema changes and data persistence



---

4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)

## Out of Scope *(optional)*



1. Goal history analytics dashboard (future feature - requires data accumulation first)

2. Goal completion rate charts or statistics (future feature)---3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal

3. Goal notifications/reminders (e.g., "30 minutes until goal reached")

4. Social features (sharing goals, leaderboards)

5. Goal templates or favorites (e.g., "My usual 16:8 goal")

6. Multi-day goal support (goals spanning multiple calendar days with progress tracking across days)### Edge Cases

7. Goal streaks or achievements system

8. Export goal data to CSV or other formats

9. Goal recommendations based on user's fasting history

10. Integration with third-party health apps (Apple Health, Google Fit, etc.)- **What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)?** 4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the modal closes


  

  **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp. System treats this as an immediately completed goal. When fast ends, goalStatus will be 'completed'.



- **What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later?** 5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"

  

  **Answer**: Goal is stored in localStorage as part of session state, so it will persist across browser restarts. Goal remains active until fast ends or user explicitly clears it.



- **What happens if a user changes their goal multiple times during a single fast?**---4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.

  

  **Answer**: Each goal change immediately recalculates progress bar and completion time. When fast ends, only the FINAL goal is saved to the Entry record (fastingGoal and goalStatus reflect the last-set goal).



- **What happens if localStorage is disabled or cleared while a fast is active?**### User Story 3 - See Goal Completion Time (Priority: P1)

  

  **Answer**: Goal data will be lost. User will need to set goal again. This is acceptable per spec assumptions (session-based design). Consider showing a warning if localStorage is unavailable.



- **What happens if user's device clock changes (DST, manual adjustment) during a fast?**Users see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed## User Scenarios & Testing *(mandatory)*## User Scenarios & Testing *(mandatory)*

  

  **Answer**: Completion time calculation uses client-side Date objects, so it will adjust to new clock time. This is acceptable per spec assumptions (client-side time calculation). Progress percentage calculation uses elapsed milliseconds, so it's not affected by clock changes.



- **What happens if a user sets a goal but ends the fast before the timer has updated (within 60 seconds)?****Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.

  

  **Answer**: Progress bar may not have updated yet (60s update cycle), but goalStatus calculation happens at fast end time based on final duration. Data accuracy is preserved even if UI hasn't updated yet.



---**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.---**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.



## Functional Requirements *(optional)*



1. **FR-001**: System SHALL provide four preset goal buttons: 12h, 16h, 18h, and 24h**Acceptance Scenarios**:

2. **FR-002**: System SHALL provide a custom input field accepting numeric values between 1 and 168 hours

3. **FR-003**: System SHALL validate custom input and reject values outside 1-168 range or non-numeric input

4. **FR-004**: System SHALL allow decimal values for custom input (e.g., 14.5 hours for 14 hours 30 minutes)

5. **FR-005**: System SHALL store goal data in React Context and localStorage for session persistence1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information### User Story 2 - View Progress Toward Goal (Priority: P1)

6. **FR-006**: System SHALL clear localStorage goal data when fast ends (after entry is created)

7. **FR-007**: System SHALL calculate progress percentage as (elapsedTime / goalTime) × 100

8. **FR-008**: System SHALL update progress display every 60 seconds (synced with timer updates)

9. **FR-009**: System SHALL display progress in format "Xh Ym / Xh Ym (Z%)"2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)

10. **FR-010**: System SHALL show visual indicator (green color, checkmark icon) when progress exceeds 100%

11. **FR-011**: System SHALL calculate goal completion time as lastMealTime + goalDuration

12. **FR-012**: System SHALL format completion time as "MMM d, h:mm a" (e.g., "Oct 29, 4:00 AM")

13. **FR-013**: System SHALL display completion time below progress bar3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)Users see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.**Acceptance Scenarios**:

14. **FR-014**: System SHALL add fastingGoal field to Entry model (type: Number, min: 1, max: 10080 minutes)

15. **FR-015**: System SHALL add goalStatus field to Entry model (type: String, enum: ['completed', 'not-completed', 'no-goal'])

16. **FR-016**: System SHALL calculate goalStatus as 'completed' if duration >= goal, 'not-completed' if duration < goal, 'no-goal' if no goal set

17. **FR-017**: System SHALL modify POST /api/entries endpoint to accept optional fastingGoal and goalStatus fields4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown

18. **FR-018**: System SHALL validate goal/status consistency (if goal provided, status must be provided and vice versa)



---

---**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.### User Story 1 - Set Fasting Goal (Priority: P1)<!--

## Success Criteria *(optional)*



1. **SC-001**: Goal can be set in <10 seconds from button click to confirmation

2. **SC-002**: Progress bar updates within 1 second of timer tick### User Story 4 - Goal Persistence and Analytics (Priority: P2)

3. **SC-003**: Completion time calculation error is <1% of actual time

4. **SC-004**: Goal data persists to Entry record with 100% accuracy

5. **SC-005**: Edge cases (>100% progress, no goal, goal changes) handled without errors

6. **SC-006**: Goal change feedback is visible within 1 secondWhen users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see a modal/panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field

7. **SC-007**: No breaking changes to existing timer functionality

8. **SC-008**: Visual confirmation of goal completion is clear and immediate (checkmark, color change)



---**Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.



## Assumptions *(optional)*



1. User has Feature 017 (Live Fasting Timer) already deployed and functional**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.**Acceptance Scenarios**:  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.

2. User's device clock is reasonably accurate (client-side time calculations acceptable)

3. User understands "session-based" means goal doesn't persist across browser sessions unless fast is active

4. Maximum practical fasting goal is 7 days (168 hours) - longer fasts are rare and not primary use case

5. Progress updates every 60 seconds (matching existing timer update frequency) is sufficient - no need for real-time (1-second) updates**Acceptance Scenarios**:

6. User can change goal mid-fast, and final goal is what gets saved to Entry record

7. Browser localStorage is available and enabled (fallback: in-memory only, goal lost on refresh)

8. User has MongoDB connection established (required for Entry model persistence)

1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the modal closes, showing my goal on the timer display

---



## Dependencies *(optional)*

2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'

1. **Feature 017 - Live Fasting Timer**: Provides `useFastingTimer` hook with `elapsedMs` state

2. **Entry Model** (`src/lib/models/Entry.js`): Mongoose schema must support optional field additions

3. **FastingTimer Component** (`src/components/organisms/FastingTimer.js`): Integration point for goal UI

4. **POST /api/entries Route** (`src/app/api/entries/route.js`): Must be modified to accept goal fields3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progressUsers can set a personal fasting goal for their current fasting session, choosing from preset durations or entering a custom duration. This provides motivation and clear targets for each fast.  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,

5. **MongoDB Database**: Must be accessible for schema changes and data persistence



---

4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)

## Out of Scope *(optional)*



1. Goal history analytics dashboard (future feature - requires data accumulation first)

2. Goal completion rate charts or statistics (future feature)---3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the modal closes

3. Goal notifications/reminders (e.g., "30 minutes until goal reached")

4. Social features (sharing goals, leaderboards)

5. Goal templates or favorites (e.g., "My usual 16:8 goal")

6. Multi-day goal support (goals spanning multiple calendar days with progress tracking across days)### Edge Cases

7. Goal streaks or achievements system

8. Export goal data to CSV or other formats

9. Goal recommendations based on user's fasting history

10. Integration with third-party health apps (Apple Health, Google Fit, etc.)- What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)? **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp.4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)  you should still have a viable MVP (Minimum Viable Product) that delivers value.




- What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later? **Answer**: Goal is stored in the session (not persisted until fast ends), so it will be lost. User must set goal again. (Session-based design as specified).



- What happens when a user changes their goal multiple times during a single fast? **Answer**: Only the final goal at fast completion is saved to the entry record. Previous goals are not tracked.5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately



- What happens when user enters extremely large custom goals (e.g., 168 hours = 7 days)? **Answer**: System accepts values up to 168 hours (1 week). Values above that show validation error.



- What happens when a user sets a goal but never ends the fast (leaves page/app)? **Answer**: Goal is lost (session-based). No goal data is saved to entry because fast was never completed.---**Why this priority**: Core feature that enables all other functionality. Without goal setting, no progress tracking or completion analytics are possible. This is the foundation of the feature.  



- What happens when system clock changes (daylight saving time, user travels timezones)? **Answer**: Goal completion time recalculates based on current system time. May show unexpected times if user crosses timezones.



## Requirements *(mandatory)*### User Story 3 - See Goal Completion Time (Priority: P1)5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed



### Functional Requirements



- **FR-001**: System MUST provide a "Set Fasting Goal" button or interface element accessible when an active fast is runningUsers see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.



- **FR-002**: System MUST display four preset goal duration buttons: 12 hours, 16 hours, 18 hours, and 24 hours



- **FR-003**: System MUST provide a custom input field allowing users to enter goal durations in hours (accepting whole numbers and decimals, e.g., 14.5)**Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.---



- **FR-004**: System MUST validate custom goal input to ensure it is a positive number between 1 and 168 hours (1 week maximum)



- **FR-005**: System MUST allow users to change their goal at any time during an active fast, with immediate UI updates**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.**Independent Test**: User starts a fast, clicks "Set Fasting Goal" button, selects 16 hours from presets, sees goal confirmation message. Goal is stored in session state and displays on timer.  Think of each story as a standalone slice of functionality that can be:



- **FR-006**: System MUST display current progress toward goal in the format "[current] / [goal]" (e.g., "4h 30m / 16h 00m")



- **FR-007**: System MUST display progress as a percentage (e.g., "28%") alongside the time-based progress**Acceptance Scenarios**:### User Story 2 - View Progress Toward Goal (Priority: P1)



- **FR-008**: System MUST render a visual progress bar that fills proportionally to goal completion percentage



- **FR-009**: System MUST handle progress >100% gracefully when user exceeds their goal (show filled bar with "exceeded" visual indicator)1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information  - Developed independently



- **FR-010**: System MUST calculate and display goal completion time as an absolute timestamp (e.g., "Goal reached at: Oct 29, 12:00 PM")



- **FR-011**: System MUST recalculate goal completion time immediately when user changes their goal2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)Users see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.



- **FR-012**: System MUST update progress display every 60 seconds in sync with the existing timer updates



- **FR-013**: System MUST store goal data in session state (memory) during active fast, not persisting to database until fast ends3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)**Acceptance Scenarios**:  - Tested independently



- **FR-014**: When user ends fast, system MUST save fastingGoal as number of minutes to entry record



- **FR-015**: When user ends fast, system MUST calculate and save goalStatus as one of: 'completed' (duration >= goal), 'not-completed' (duration < goal), or 'no-goal' (goal never set)4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.



- **FR-016**: System MUST display a prompt to "Set a goal to track your progress" when user has active fast but no goal set



- **FR-017**: System MUST show goal-related UI elements only when an active fast exists (hide when no active fast)---  - Deployed independently



- **FR-018**: System MUST preserve existing timer functionality (elapsed time display, milestone badges) when goal features are added



### Key Entities### User Story 4 - Goal Persistence and Analytics (Priority: P2)**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".



- **Fasting Goal**: Represents a user's target duration for their current fast. Contains: target duration in minutes, timestamp when set, current progress percentage, calculated completion time. Exists only in session state (not persisted) until fast ends.



- **Entry (modified)**: Existing entry record enhanced with two new optional fields: fastingGoal (number, minutes) and goalStatus (enum: 'completed'|'not-completed'|'no-goal'). These fields are populated only when a fast is ended, providing historical data for future analytics.When users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.1. **Given** I have an active fast running, **When** I click the "Set Fasting Goal" button, **Then** I see a modal/panel with preset goal buttons (12h, 16h, 18h, 24h) and a custom input field  - Demonstrated to users independently



- **Progress State**: Computed state representing current progress toward goal. Contains: elapsed duration, goal duration, percentage complete (0-100+), visual indicator (color/icon for <100% vs >100%), display strings for UI rendering. Recalculated every timer update (60 seconds).



## Success Criteria *(mandatory)***Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.**Acceptance Scenarios**:



### Measurable Outcomes



- **SC-001**: Users can set a fasting goal in under 10 seconds using either preset buttons or custom input**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.-->



- **SC-002**: Progress bar and percentage display update within 1 second of timer tick (60-second intervals)



- **SC-003**: Goal completion time displays correctly with <1% calculation error (accurate to within 1 minute)**Acceptance Scenarios**:1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%



- **SC-004**: 100% of goal data (fastingGoal and goalStatus) is accurately saved to entry records when fast ends



- **SC-005**: System handles edge cases (progress >100%, goal changes mid-fast, invalid inputs) without errors or crashes1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'2. **Given** I see the goal selection interface, **When** I click the "16h" preset button, **Then** the goal is set to 16 hours and the modal closes, showing my goal on the timer display



- **SC-006**: Users can change their goal mid-fast with immediate visual feedback (progress bar updates within 1 second)



- **SC-007**: Goal feature integrates seamlessly with existing timer without breaking any current functionality (timer updates, milestone badges, fast completion)2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progress



- **SC-008**: Users completing their goal (reaching 100%) receive clear visual confirmation (progress bar full, completion time reached, potential success badge)



## Assumptions *(mandatory)*3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'### User Story 1 - [Brief Title] (Priority: P1)



- **A-001**: Session-based goal storage is acceptable tradeoff (simplicity vs. persistence). Users who refresh page must re-set goal. This reduces complexity and avoids database writes during active fast.



- **A-002**: Maximum goal of 168 hours (7 days) is sufficient for fasting tracking use case. Longer fasts are rare and can be accommodated by not setting a goal.4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal



- **A-003**: 60-second update frequency (matching existing timer) provides acceptable responsiveness for progress updates. Real-time second-by-second updates not required.



- **A-004**: Goal completion time calculation uses client-side system time. Server-side time sync not required. Minor discrepancies acceptable.---3. **Given** I see the goal selection interface, **When** I enter "14" in the custom hours input field and confirm, **Then** the goal is set to 14 hours and the modal closes



- **A-005**: Single goal per fast is sufficient. Users cannot set multiple incremental goals (e.g., "12h minimum, 16h stretch goal"). This reduces UI complexity.



- **A-006**: Decimal hour inputs (e.g., 14.5 hours) are sufficient granularity. Minute-level precision not required for goal setting.### Edge Cases4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)



- **A-007**: Visual progress indicator (>100% with distinct styling) is sufficient for goal exceeded scenario. No additional notifications or alerts required.



- **A-008**: Feature 017 (Live Fasting Timer) is fully functional and stable. This feature extends it without modifications to core timer logic.- What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)? **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp.[Describe this user journey in plain language]



## Dependencies *(mandatory)*



- **D-001**: Feature 017 (Live Fasting Timer) must be fully deployed and functional. Provides: useFastingTimer hook, FastingTimer component, 60-second update cycle, elapsed time calculation.- What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later? **Answer**: Goal is stored in the session (not persisted until fast ends), so it will be lost. User must set goal again. (Session-based design as specified).5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"



- **D-002**: Entry model (src/lib/models/Entry.js) must support adding optional fields without breaking existing entries. Mongoose schema must accept fastingGoal (Number) and goalStatus (String enum).



- **D-003**: useFastingTimer hook must expose elapsed time in consistent format (milliseconds or Date objects) for progress calculations.- What happens when a user changes their goal multiple times during a single fast? **Answer**: Only the final goal at fast completion is saved to the entry record. Previous goals are not tracked.4. **Given** I have already set a goal of 16 hours, **When** I click the goal setting button again and change it to 18 hours, **Then** my goal updates to 18 hours and the progress bar adjusts immediately



- **D-004**: Entry API endpoints (POST/PUT) must accept and persist new goal-related fields (fastingGoal, goalStatus) when saving entries.



- **D-005**: MongoDB database must support optional fields on Entry documents. Existing entries without goal data should remain valid.- What happens when user enters extremely large custom goals (e.g., 168 hours = 7 days)? **Answer**: System accepts values up to 168 hours (1 week). Values above that show validation error.---



## Out of Scope *(mandatory)*



- **OOS-001**: Analytics dashboard showing goal completion rates, average goal durations, or success trends. (Future feature)- What happens when a user sets a goal but never ends the fast (leaves page/app)? **Answer**: Goal is lost (session-based). No goal data is saved to entry because fast was never completed.**Why this priority**: [Explain the value and why it has this priority level]



- **OOS-002**: Goal suggestions or recommendations based on past fasting history. (Future feature - potential ML application)



- **OOS-003**: Push notifications or alerts when goal is reached. (Future feature)- What happens when system clock changes (daylight saving time, user travels timezones)? **Answer**: Goal completion time recalculates based on current system time. May show unexpected times if user crosses timezones.### User Story 3 - See Goal Completion Time (Priority: P1)



- **OOS-004**: Multiple concurrent goals or incremental goal milestones (e.g., "12h good, 16h great, 20h excellent"). (Future feature)



- **OOS-005**: Goal presets customization (users cannot edit the four preset values). (Future feature)## Requirements *(mandatory)*5. **Given** I enter an invalid custom goal (e.g., "abc" or "0" or negative number), **When** I try to confirm, **Then** I see a validation error message and cannot proceed



- **OOS-006**: Goal templates or goal history (quick-select previously used goals). (Future feature)



- **OOS-007**: Social features (sharing goals, comparing with friends, leaderboards). (Future feature)### Functional RequirementsUsers see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.



- **OOS-008**: Integration with external fitness/health apps (Apple Health, Google Fit). (Future feature)



- **OOS-009**: Goal-based gamification (badges, achievements, streaks tied to goal completion). (Partial - completion tracking enables this, but UI not built)- **FR-001**: System MUST provide a "Set Fasting Goal" button or interface element accessible when an active fast is running**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]



- **OOS-010**: Server-side time synchronization or timezone-aware completion time calculations. (Client-side time sufficient for MVP)



## Notes- **FR-002**: System MUST display four preset goal duration buttons: 12 hours, 16 hours, 18 hours, and 24 hours**Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.



- Session-based storage design deliberately chosen for simplicity. Alternative persistent storage during fast would require: additional database fields for "current goal" vs "final goal", background sync logic, conflict resolution if user sets goal on multiple devices. These complexities deferred to future iterations if user feedback indicates need.



- Progress bar design should handle >100% gracefully with distinct visual treatment (e.g., different color, overflow animation, "exceeded" badge). This celebrates user achievement rather than treating it as an error state.- **FR-003**: System MUST provide a custom input field allowing users to enter goal durations in hours (accepting whole numbers and decimals, e.g., 14.5)---



- Goal completion time is absolute timestamp, not countdown timer. This design decision reduces cognitive load ("what time can I eat?") vs. countdown ("how much longer?"). Future iteration could offer toggle between views.



- Feature integrates with existing timer infrastructure without modifications. All new functionality is additive, reducing risk of breaking changes to Feature 017.- **FR-004**: System MUST validate custom goal input to ensure it is a positive number between 1 and 168 hours (1 week maximum)**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.




- **FR-005**: System MUST allow users to change their goal at any time during an active fast, with immediate UI updates**Acceptance Scenarios**:



- **FR-006**: System MUST display current progress toward goal in the format "[current] / [goal]" (e.g., "4h 30m / 16h 00m")**Acceptance Scenarios**:



- **FR-007**: System MUST display progress as a percentage (e.g., "28%") alongside the time-based progress### User Story 2 - View Progress Toward Goal (Priority: P1)



- **FR-008**: System MUST render a visual progress bar that fills proportionally to goal completion percentage1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information



- **FR-009**: System MUST handle progress >100% gracefully when user exceeds their goal (show filled bar with "exceeded" visual indicator)1. **Given** [initial state], **When** [action], **Then** [expected outcome]



- **FR-010**: System MUST calculate and display goal completion time as an absolute timestamp (e.g., "Goal reached at: Oct 29, 12:00 PM")2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)



- **FR-011**: System MUST recalculate goal completion time immediately when user changes their goalUsers see real-time visual feedback on their progress toward their fasting goal, including a progress bar and percentage completion. This provides motivation and makes the abstract concept of time remaining concrete.2. **Given** [initial state], **When** [action], **Then** [expected outcome]



- **FR-012**: System MUST update progress display every 60 seconds in sync with the existing timer updates3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)



- **FR-013**: System MUST store goal data in session state (memory) during active fast, not persisting to database until fast ends



- **FR-014**: When user ends fast, system MUST save fastingGoal as number of minutes to entry record4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown



- **FR-015**: When user ends fast, system MUST calculate and save goalStatus as one of: 'completed' (duration >= goal), 'not-completed' (duration < goal), or 'no-goal' (goal never set)**Why this priority**: Essential for user engagement and motivation. Without visual progress feedback, the goal feature provides minimal value. Must be implemented together with goal setting for a complete experience.---



- **FR-016**: System MUST display a prompt to "Set a goal to track your progress" when user has active fast but no goal set---



- **FR-017**: System MUST show goal-related UI elements only when an active fast exists (hide when no active fast)



- **FR-018**: System MUST preserve existing timer functionality (elapsed time display, milestone badges) when goal features are added### User Story 4 - Goal Persistence and Analytics (Priority: P2)



### Key Entities**Independent Test**: User with active fast and 16-hour goal sees "4h 30m / 16h 00m (28%)" display and a progress bar filled to 28%. After 30 minutes, display updates to "5h 00m / 16h 00m (31%)".### User Story 2 - [Brief Title] (Priority: P2)



- **Fasting Goal**: Represents a user's target duration for their current fast. Contains: target duration in minutes, timestamp when set, current progress percentage, calculated completion time. Exists only in session state (not persisted) until fast ends.When users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.



- **Entry (modified)**: Existing entry record enhanced with two new optional fields: fastingGoal (number, minutes) and goalStatus (enum: 'completed'|'not-completed'|'no-goal'). These fields are populated only when a fast is ended, providing historical data for future analytics.



- **Progress State**: Computed state representing current progress toward goal. Contains: elapsed duration, goal duration, percentage complete (0-100+), visual indicator (color/icon for <100% vs >100%), display strings for UI rendering. Recalculated every timer update (60 seconds).**Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.



## Success Criteria *(mandatory)***Acceptance Scenarios**:[Describe this user journey in plain language]



### Measurable Outcomes**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.



- **SC-001**: Users can set a fasting goal in under 10 seconds using either preset buttons or custom input



- **SC-002**: Progress bar and percentage display update within 1 second of timer tick (60-second intervals)**Acceptance Scenarios**:



- **SC-003**: Goal completion time displays correctly with <1% calculation error (accurate to within 1 minute)1. **Given** I have set a fasting goal of 16 hours and am 4.5 hours into my fast, **When** I view the timer, **Then** I see a progress display showing "4h 30m / 16h 00m" with a visual progress bar filled to approximately 28%**Why this priority**: [Explain the value and why it has this priority level]



- **SC-004**: 100% of goal data (fastingGoal and goalStatus) is accurately saved to entry records when fast ends1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'



- **SC-005**: System handles edge cases (progress >100%, goal changes mid-fast, invalid inputs) without errors or crashes



- **SC-006**: Users can change their goal mid-fast with immediate visual feedback (progress bar updates within 1 second)2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'



- **SC-007**: Goal feature integrates seamlessly with existing timer without breaking any current functionality (timer updates, milestone badges, fast completion)2. **Given** I am viewing my fasting progress, **When** time passes and the timer updates (every 60 seconds), **Then** the progress bar and percentage update in real-time to reflect my new progress**Independent Test**: [Describe how this can be tested independently]



- **SC-008**: Users completing their goal (reaching 100%) receive clear visual confirmation (progress bar full, completion time reached, potential success badge)3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'



## Assumptions *(mandatory)*



- **A-001**: Session-based goal storage is acceptable tradeoff (simplicity vs. persistence). Users who refresh page must re-set goal. This reduces complexity and avoids database writes during active fast.4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)



- **A-002**: Maximum goal of 168 hours (7 days) is sufficient for fasting tracking use case. Longer fasts are rare and can be accommodated by not setting a goal.3. **Given** I have set a goal of 18 hours and am 20 hours into my fast (exceeded goal), **When** I view the timer, **Then** the progress bar shows 100% completion and displays "20h 00m / 18h 00m (111%)" with a visual indicator that I exceeded my goal**Acceptance Scenarios**:



- **A-003**: 60-second update frequency (matching existing timer) provides acceptable responsiveness for progress updates. Real-time second-by-second updates not required.---



- **A-004**: Goal completion time calculation uses client-side system time. Server-side time sync not required. Minor discrepancies acceptable.



- **A-005**: Single goal per fast is sufficient. Users cannot set multiple incremental goals (e.g., "12h minimum, 16h stretch goal"). This reduces UI complexity.### Edge Cases



- **A-006**: Decimal hour inputs (e.g., 14.5 hours) are sufficient granularity. Minute-level precision not required for goal setting.4. **Given** I change my goal from 16 hours to 18 hours mid-fast, **When** I'm currently at 10 hours, **Then** the progress bar immediately recalculates to show 10h / 18h (56%) instead of the previous 10h / 16h (63%)1. **Given** [initial state], **When** [action], **Then** [expected outcome]



- **A-007**: Visual progress indicator (>100% with distinct styling) is sufficient for goal exceeded scenario. No additional notifications or alerts required.- What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)? **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp.



- **A-008**: Feature 017 (Live Fasting Timer) is fully functional and stable. This feature extends it without modifications to core timer logic.



## Dependencies *(mandatory)*- What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later? **Answer**: Goal is stored in the session (not persisted until fast ends), so it will be lost. User must set goal again. (Session-based design as specified).



- **D-001**: Feature 017 (Live Fasting Timer) must be fully deployed and functional. Provides: useFastingTimer hook, FastingTimer component, 60-second update cycle, elapsed time calculation.5. **Given** I have an active fast but have not set a goal, **When** I view the timer, **Then** I see the timer counting up normally without a progress bar, and a prompt to "Set a goal to track your progress"---



- **D-002**: Entry model (src/models/Entry.js) must support adding optional fields without breaking existing entries. Mongoose schema must accept fastingGoal (Number) and goalStatus (String enum).- What happens when a user changes their goal multiple times during a single fast? **Answer**: Only the final goal at fast completion is saved to the entry record. Previous goals are not tracked.



- **D-003**: useFastingTimer hook must expose elapsed time in consistent format (milliseconds or Date objects) for progress calculations.



- **D-004**: Entry API endpoints (POST/PUT) must accept and persist new goal-related fields (fastingGoal, goalStatus) when saving entries.- What happens when user enters extremely large custom goals (e.g., 168 hours = 7 days)? **Answer**: System accepts values up to 168 hours (1 week). Values above that show validation error.



- **D-005**: MongoDB database must support optional fields on Entry documents. Existing entries without goal data should remain valid.---### User Story 3 - [Brief Title] (Priority: P3)



## Out of Scope *(mandatory)*- What happens when a user sets a goal but never ends the fast (leaves page/app)? **Answer**: Goal is lost (session-based). No goal data is saved to entry because fast was never completed.



- **OOS-001**: Analytics dashboard showing goal completion rates, average goal durations, or success trends. (Future feature)



- **OOS-002**: Goal suggestions or recommendations based on past fasting history. (Future feature - potential ML application)- What happens when system clock changes (daylight saving time, user travels timezones)? **Answer**: Goal completion time recalculates based on current system time. May show unexpected times if user crosses timezones.



- **OOS-003**: Push notifications or alerts when goal is reached. (Future feature)### User Story 3 - See Goal Completion Time (Priority: P1)[Describe this user journey in plain language]



- **OOS-004**: Multiple concurrent goals or incremental goal milestones (e.g., "12h good, 16h great, 20h excellent"). (Future feature)## Requirements *(mandatory)*



- **OOS-005**: Goal presets customization (users cannot edit the four preset values). (Future feature)



- **OOS-006**: Goal templates or goal history (quick-select previously used goals). (Future feature)### Functional Requirements



- **OOS-007**: Social features (sharing goals, comparing with friends, leaderboards). (Future feature)Users see the exact date and time when they will reach their fasting goal, helping them plan their day and manage expectations about when they can eat again.**Why this priority**: [Explain the value and why it has this priority level]



- **OOS-008**: Integration with external fitness/health apps (Apple Health, Google Fit). (Future feature)- **FR-001**: System MUST provide a "Set Fasting Goal" button or interface element accessible when an active fast is running



- **OOS-009**: Goal-based gamification (badges, achievements, streaks tied to goal completion). (Partial - completion tracking enables this, but UI not built)



- **OOS-010**: Server-side time synchronization or timezone-aware completion time calculations. (Client-side time sufficient for MVP)- **FR-002**: System MUST display four preset goal duration buttons: 12 hours, 16 hours, 18 hours, and 24 hours



## Notes**Why this priority**: Critical psychological feature - knowing "when can I eat" reduces anxiety and improves adherence. Makes the abstract goal concrete and calendar-bound.**Independent Test**: [Describe how this can be tested independently]



- Session-based storage design deliberately chosen for simplicity. Alternative persistent storage during fast would require: additional database fields for "current goal" vs "final goal", background sync logic, conflict resolution if user sets goal on multiple devices. These complexities deferred to future iterations if user feedback indicates need.- **FR-003**: System MUST provide a custom input field allowing users to enter goal durations in hours (accepting whole numbers and decimals, e.g., 14.5)



- Progress bar design should handle >100% gracefully with distinct visual treatment (e.g., different color, overflow animation, "exceeded" badge). This celebrates user achievement rather than treating it as an error state.



- Goal completion time is absolute timestamp, not countdown timer. This design decision reduces cognitive load ("what time can I eat?") vs. countdown ("how much longer?"). Future iteration could offer toggle between views.- **FR-004**: System MUST validate custom goal input to ensure it is a positive number between 1 and 168 hours (1 week maximum)



- Feature integrates with existing timer infrastructure without modifications. All new functionality is additive, reducing risk of breaking changes to Feature 017.**Independent Test**: User who started fasting at 8:00 PM on Oct 28 with a 16-hour goal sees "Goal reached at: Oct 29, 12:00 PM" displayed below the progress bar.**Acceptance Scenarios**:


- **FR-005**: System MUST allow users to change their goal at any time during an active fast, with immediate UI updates



- **FR-006**: System MUST display current progress toward goal in the format "[current] / [goal]" (e.g., "4h 30m / 16h 00m")

**Acceptance Scenarios**:1. **Given** [initial state], **When** [action], **Then** [expected outcome]

- **FR-007**: System MUST display progress as a percentage (e.g., "28%") alongside the time-based progress



- **FR-008**: System MUST render a visual progress bar that fills proportionally to goal completion percentage

1. **Given** I started my fast at 8:00 PM today and set a 16-hour goal, **When** I view the timer, **Then** I see "Goal reached at: [Tomorrow's Date], 12:00 PM" displayed clearly below the progress information---

- **FR-009**: System MUST handle progress >100% gracefully when user exceeds their goal (show filled bar with "exceeded" visual indicator)



- **FR-010**: System MUST calculate and display goal completion time as an absolute timestamp (e.g., "Goal reached at: Oct 29, 12:00 PM")

2. **Given** I am viewing my goal completion time, **When** I change my goal from 16 hours to 18 hours, **Then** the completion time immediately updates to show the new target time (2 hours later)[Add more user stories as needed, each with an assigned priority]

- **FR-011**: System MUST recalculate goal completion time immediately when user changes their goal



- **FR-012**: System MUST update progress display every 60 seconds in sync with the existing timer updates

3. **Given** I have already passed my goal completion time (fasting for 18 hours with a 16-hour goal), **When** I view the timer, **Then** I see "Goal reached at: [Date], [Time]" with a visual indicator that the goal was completed (e.g., checkmark icon)### Edge Cases

- **FR-013**: System MUST store goal data in session state (memory) during active fast, not persisting to database until fast ends



- **FR-014**: When user ends fast, system MUST save fastingGoal as number of minutes to entry record

4. **Given** I am viewing the completion time and my fast is active, **When** the timer updates every minute, **Then** the completion time remains static (doesn't count down) as it's an absolute timestamp, not a countdown<!--

- **FR-015**: When user ends fast, system MUST calculate and save goalStatus as one of: 'completed' (duration >= goal), 'not-completed' (duration < goal), or 'no-goal' (goal never set)

  ACTION REQUIRED: The content in this section represents placeholders.

- **FR-016**: System MUST display a prompt to "Set a goal to track your progress" when user has active fast but no goal set

---  Fill them out with the right edge cases.

- **FR-017**: System MUST show goal-related UI elements only when an active fast exists (hide when no active fast)

-->

- **FR-018**: System MUST preserve existing timer functionality (elapsed time display, milestone badges) when goal features are added

### User Story 4 - Goal Persistence and Analytics (Priority: P2)

### Key Entities

- What happens when [boundary condition]?

- **Fasting Goal**: Represents a user's target duration for their current fast. Contains: target duration in minutes, timestamp when set, current progress percentage, calculated completion time. Exists only in session state (not persisted) until fast ends.

When users end their fast, the system records whether they met their goal, providing data for future analytics on goal completion rates and willpower tracking.- How does system handle [error scenario]?

- **Entry (modified)**: Existing entry record enhanced with two new optional fields: fastingGoal (number, minutes) and goalStatus (enum: 'completed'|'not-completed'|'no-goal'). These fields are populated only when a fast is ended, providing historical data for future analytics.



- **Progress State**: Computed state representing current progress toward goal. Contains: elapsed duration, goal duration, percentage complete (0-100+), visual indicator (color/icon for <100% vs >100%), display strings for UI rendering. Recalculated every timer update (60 seconds).

**Why this priority**: Enables future features and insights but doesn't directly impact the current fasting experience. Can be implemented after core P1 features are working. Provides foundation for gamification.## Requirements *(mandatory)*

## Success Criteria *(mandatory)*



### Measurable Outcomes

**Independent Test**: User sets 16-hour goal, fasts for 18 hours, ends fast. Entry record shows fastingGoal=960 (minutes), goalStatus='completed'. User who fasts only 14 hours shows goalStatus='not-completed'. User who never set a goal shows goalStatus='no-goal'.<!--

- **SC-001**: Users can set a fasting goal in under 10 seconds using either preset buttons or custom input

  ACTION REQUIRED: The content in this section represents placeholders.

- **SC-002**: Progress bar and percentage display update within 1 second of timer tick (60-second intervals)

**Acceptance Scenarios**:  Fill them out with the right functional requirements.

- **SC-003**: Goal completion time displays correctly with <1% calculation error (accurate to within 1 minute)

-->

- **SC-004**: 100% of goal data (fastingGoal and goalStatus) is accurately saved to entry records when fast ends

1. **Given** I set a fasting goal of 16 hours, **When** I end my fast after 18 hours by logging my first meal time, **Then** the system saves my entry with fastingGoal=960 (minutes) and goalStatus='completed'

- **SC-005**: System handles edge cases (progress >100%, goal changes mid-fast, invalid inputs) without errors or crashes

### Functional Requirements

- **SC-006**: Users can change their goal mid-fast with immediate visual feedback (progress bar updates within 1 second)

2. **Given** I set a fasting goal of 18 hours, **When** I end my fast early after only 15 hours, **Then** the system saves my entry with fastingGoal=1080 (minutes) and goalStatus='not-completed'

- **SC-007**: Goal feature integrates seamlessly with existing timer without breaking any current functionality (timer updates, milestone badges, fast completion)

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]

- **SC-008**: Users completing their goal (reaching 100%) receive clear visual confirmation (progress bar full, completion time reached, potential success badge)

3. **Given** I never set a fasting goal during my fast, **When** I end my fast after 14 hours, **Then** the system saves my entry with fastingGoal=null and goalStatus='no-goal'- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  

## Assumptions *(mandatory)*

- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]

- **A-001**: Users understand that goals are per-session and will be lost if they close the browser before ending the fast (acceptable trade-off for simpler implementation)

4. **Given** I have multiple completed entries with goal data, **When** I view my entries list in the future (out of scope for this feature), **Then** each entry displays an indicator of whether the goal was met (foundation for analytics)- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]

- **A-002**: Users primarily fast for durations between 12-24 hours, with occasional longer fasts (168-hour max is reasonable upper bound)

- **FR-005**: System MUST [behavior, e.g., "log all security events"]

- **A-003**: The existing timer infrastructure (useFastingTimer hook, 60-second update interval) is sufficient for progress tracking (no need for more frequent updates)

---

- **A-004**: Goal completion time calculation can use client-side system time (acceptable if minor timezone/clock issues occur)

*Example of marking unclear requirements:*

- **A-005**: Users find visual progress bars motivating and understand percentage-based progress indicators

### Edge Cases

- **A-006**: Analytics/reporting features using goalStatus data will be implemented in future features (out of scope now)

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]

- **A-007**: The Entry model can be extended with two new optional fields without requiring data migration (existing entries without these fields are valid)

- What happens when a user sets a goal that is shorter than their current elapsed time (e.g., sets 12-hour goal when already fasting for 14 hours)? **Answer**: Progress bar shows >100%, completion time shows as "Goal reached" with past timestamp.- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

- **A-008**: Users set goals at the beginning or middle of fasts, not retroactively after fasts complete



## Dependencies *(mandatory)*

- What happens when a user starts a fast, sets a goal, then closes the browser and returns hours later? **Answer**: Goal is stored in the session (not persisted until fast ends), so it will be lost. User must set goal again. (Session-based design as specified).### Key Entities *(include if feature involves data)*

- **D-001**: Feature 017 (Live Fasting Timer) must be fully functional - this feature extends the existing timer component



- **D-002**: Entry model must support adding two new optional fields (fastingGoal, goalStatus) without breaking existing functionality

- What happens when a user changes their goal multiple times during a single fast? **Answer**: Only the final goal at fast completion is saved to the entry record. Previous goals are not tracked.- **[Entity 1]**: [What it represents, key attributes without implementation]

- **D-003**: Existing useFastingTimer hook must provide elapsed time data that can be used for progress calculations

- **[Entity 2]**: [What it represents, relationships to other entities]

- **D-004**: Entry update/create API endpoints must handle saving the new goal-related fields

- What happens when user enters extremely large custom goals (e.g., 168 hours = 7 days)? **Answer**: System accepts values up to 168 hours (1 week). Values above that show validation error.

- **D-005**: Database (MongoDB) must support the new fields in Entry schema without migration issues

## Success Criteria *(mandatory)*

## Out of Scope *(mandatory)*

- What happens when a user sets a goal but never ends the fast (leaves page/app)? **Answer**: Goal is lost (session-based). No goal data is saved to entry because fast was never completed.

- **OOS-001**: Suggesting goals based on user history or machine learning (future enhancement to "Smart Progress Bar" concept)

<!--

- **OOS-002**: Displaying goal completion analytics, statistics, or trends (e.g., "You complete your goals 85% of the time")

- What happens when system clock changes (daylight saving time, user travels timezones)? **Answer**: Goal completion time recalculates based on current system time. May show unexpected times if user crosses timezones.  ACTION REQUIRED: Define measurable success criteria.

- **OOS-003**: Gamification elements beyond basic progress bar (badges, points, achievements, leaderboards)

  These must be technology-agnostic and measurable.

- **OOS-004**: Push notifications when goal is reached (requires notification infrastructure)

## Requirements *(mandatory)*-->

- **OOS-005**: Goal presets customization (allowing users to change the 12/16/18/24 preset values)



- **OOS-006**: Multiple goal types (duration goal is only type; weight goals, meal timing goals are separate features)

### Functional Requirements### Measurable Outcomes

- **OOS-007**: Goal reminders or motivation messages during fast ("You're halfway there!")



- **OOS-008**: Social/sharing features for goals ("Share your progress with friends")

- **FR-001**: System MUST provide a "Set Fasting Goal" button or interface element accessible when an active fast is running- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]

- **OOS-009**: Historical goal editing (changing goal data for past completed fasts)

- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]

- **OOS-010**: Streak tracking based on goal completion (separate feature, depends on this data)

- **FR-002**: System MUST display four preset goal duration buttons: 12 hours, 16 hours, 18 hours, and 24 hours- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]

## Notes

- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

- This feature reintroduces the progress bar concept that was deferred from Feature 017, but with a user-controlled goal instead of calculated/suggested targets

- The session-based goal design (not persisted until fast ends) is intentionally simple - could be enhanced later to persist in localStorage or database for better UX- **FR-003**: System MUST provide a custom input field allowing users to enter goal durations in hours (accepting whole numbers and decimals, e.g., 14.5)

- Goal data structure enables future analytics features without requiring database changes later

- Custom input field should support decimals (e.g., 14.5 hours) for flexibility, though most users will likely use presets

- Progress bar should have smooth visual design that integrates with existing timer card aesthetics- **FR-004**: System MUST validate custom goal input to ensure it is a positive number between 1 and 168 hours (1 week maximum)

- Consider color coding progress bar: green when approaching goal (80-99%), gold/celebration when goal reached (100%+)

- **FR-005**: System MUST allow users to change their goal at any time during an active fast, with immediate UI updates

- **FR-006**: System MUST display current progress toward goal in the format "[current] / [goal]" (e.g., "4h 30m / 16h 00m")

- **FR-007**: System MUST display progress as a percentage (e.g., "28%") alongside the time-based progress

- **FR-008**: System MUST render a visual progress bar that fills proportionally to goal completion percentage

- **FR-009**: System MUST handle progress >100% gracefully when user exceeds their goal (show filled bar with "exceeded" visual indicator)

- **FR-010**: System MUST calculate and display goal completion time as an absolute timestamp (e.g., "Goal reached at: Oct 29, 12:00 PM")

- **FR-011**: System MUST recalculate goal completion time immediately when user changes their goal

- **FR-012**: System MUST update progress display every 60 seconds in sync with the existing timer updates

- **FR-013**: System MUST store goal data in session state (memory) during active fast, not persisting to database until fast ends

- **FR-014**: When user ends fast, system MUST save fastingGoal as number of minutes to entry record

- **FR-015**: When user ends fast, system MUST calculate and save goalStatus as one of: 'completed' (duration >= goal), 'not-completed' (duration < goal), or 'no-goal' (goal never set)

- **FR-016**: System MUST display a prompt to "Set a goal to track your progress" when user has active fast but no goal set

- **FR-017**: System MUST show goal-related UI elements only when an active fast exists (hide when no active fast)

- **FR-018**: System MUST preserve existing timer functionality (elapsed time display, milestone badges) when goal features are added

### Key Entities

- **Fasting Goal**: Represents a user's target duration for their current fast. Contains: target duration in minutes, timestamp when set, current progress percentage, calculated completion time. Exists only in session state (not persisted) until fast ends.

- **Entry (modified)**: Existing entry record enhanced with two new optional fields: fastingGoal (number, minutes) and goalStatus (enum: 'completed'|'not-completed'|'no-goal'). These fields are populated only when a fast is ended, providing historical data for future analytics.

- **Progress State**: Computed state representing current progress toward goal. Contains: elapsed duration, goal duration, percentage complete (0-100+), visual indicator (color/icon for <100% vs >100%), display strings for UI rendering. Recalculated every timer update (60 seconds).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set a fasting goal in under 10 seconds using either preset buttons or custom input

- **SC-002**: Progress bar and percentage display update within 1 second of timer tick (60-second intervals)

- **SC-003**: Goal completion time displays correctly with <1% calculation error (accurate to within 1 minute)

- **SC-004**: 100% of goal data (fastingGoal and goalStatus) is accurately saved to entry records when fast ends

- **SC-005**: System handles edge cases (progress >100%, goal changes mid-fast, invalid inputs) without errors or crashes

- **SC-006**: Users can change their goal mid-fast with immediate visual feedback (progress bar updates within 1 second)

- **SC-007**: Goal feature integrates seamlessly with existing timer without breaking any current functionality (timer updates, milestone badges, fast completion)

- **SC-008**: Users completing their goal (reaching 100%) receive clear visual confirmation (progress bar full, completion time reached, potential success badge)

## Assumptions *(mandatory)*

- **A-001**: Users understand that goals are per-session and will be lost if they close the browser before ending the fast (acceptable trade-off for simpler implementation)

- **A-002**: Users primarily fast for durations between 12-24 hours, with occasional longer fasts (168-hour max is reasonable upper bound)

- **A-003**: The existing timer infrastructure (useFastingTimer hook, 60-second update interval) is sufficient for progress tracking (no need for more frequent updates)

- **A-004**: Goal completion time calculation can use client-side system time (acceptable if minor timezone/clock issues occur)

- **A-005**: Users find visual progress bars motivating and understand percentage-based progress indicators

- **A-006**: Analytics/reporting features using goalStatus data will be implemented in future features (out of scope now)

- **A-007**: The Entry model can be extended with two new optional fields without requiring data migration (existing entries without these fields are valid)

- **A-008**: Users set goals at the beginning or middle of fasts, not retroactively after fasts complete

## Dependencies *(mandatory)*

- **D-001**: Feature 017 (Live Fasting Timer) must be fully functional - this feature extends the existing timer component

- **D-002**: Entry model must support adding two new optional fields (fastingGoal, goalStatus) without breaking existing functionality

- **D-003**: Existing useFastingTimer hook must provide elapsed time data that can be used for progress calculations

- **D-004**: Entry update/create API endpoints must handle saving the new goal-related fields

- **D-005**: Database (MongoDB) must support the new fields in Entry schema without migration issues

## Out of Scope *(mandatory)*

- **OOS-001**: Suggesting goals based on user history or machine learning (future enhancement to "Smart Progress Bar" concept)

- **OOS-002**: Displaying goal completion analytics, statistics, or trends (e.g., "You complete your goals 85% of the time")

- **OOS-003**: Gamification elements beyond basic progress bar (badges, points, achievements, leaderboards)

- **OOS-004**: Push notifications when goal is reached (requires notification infrastructure)

- **OOS-005**: Goal presets customization (allowing users to change the 12/16/18/24 preset values)

- **OOS-006**: Multiple goal types (duration goal is only type; weight goals, meal timing goals are separate features)

- **OOS-007**: Goal reminders or motivation messages during fast ("You're halfway there!")

- **OOS-008**: Social/sharing features for goals ("Share your progress with friends")

- **OOS-009**: Historical goal editing (changing goal data for past completed fasts)

- **OOS-010**: Streak tracking based on goal completion (separate feature, depends on this data)

## Notes

- This feature reintroduces the progress bar concept that was deferred from Feature 017, but with a user-controlled goal instead of calculated/suggested targets
- The session-based goal design (not persisted until fast ends) is intentionally simple - could be enhanced later to persist in localStorage or database for better UX
- Goal data structure enables future analytics features without requiring database changes later
- Custom input field should support decimals (e.g., 14.5 hours) for flexibility, though most users will likely use presets
- Progress bar should have smooth visual design that integrates with existing timer card aesthetics
- Consider color coding progress bar: green when approaching goal (80-99%), gold/celebration when goal reached (100%+)
