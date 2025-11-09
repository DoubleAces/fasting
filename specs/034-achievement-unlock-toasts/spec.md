# Feature Specification: Achievement Unlock Toast Notifications

**Feature Branch**: `034-achievement-unlock-toasts`  
**Created**: November 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement toast notifications to display newly unlocked achievements when users save or update entries. The API already returns unlockedAchievements array in the response from POST/PUT /api/entries endpoints, but the frontend EntryForm component currently ignores this data. Add logic to check the response for unlocked achievements after successful entry save, and display an attractive toast notification showing the achievement name, icon, points earned, and rarity level. If multiple achievements unlock simultaneously, show them as separate sequential toasts or a single consolidated notification listing all unlocked achievements. The notification should be celebratory in tone with appropriate emoji/icons (🏆, ⭐) and link to the /achievements page where users can view their newly unlocked badges. This completes the achievement unlock feedback loop and provides immediate gratification for user progress."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Achievement Unlock Notification (Priority: P1)

When a user saves or updates a fasting entry that unlocks a single achievement, they immediately see a celebratory toast notification displaying the achievement name, icon, points earned, and rarity level. The toast provides instant positive feedback and reinforces their progress without requiring them to navigate to a separate achievements page.

**Why this priority**: This is the core functionality that completes the achievement unlock feedback loop. Without immediate visual feedback, users won't know they've earned achievements, significantly diminishing the motivation and engagement value of the entire achievement system. This must work first before handling multiple achievements or advanced features.

**Independent Test**: Can be fully tested by creating a fasting entry that unlocks a single achievement (e.g., first 12-hour fast), verifying the toast appears with achievement details (name, icon, points, rarity), auto-dismisses after 5 seconds, and delivers immediate gratification for user progress.

**Acceptance Scenarios**:

1. **Given** a user saves a fasting entry that unlocks their first 12-hour achievement, **When** the API returns the entry with `unlockedAchievements: [{ name: 'First 12-Hour Fast', points: 10, rarity: 'Common', ... }]`, **Then** a celebratory toast appears showing "🏆 Achievement Unlocked! First 12-Hour Fast - 10 points (Common)" with a green/gold color scheme

2. **Given** a user updates an existing entry (e.g., corrects meal times) that unlocks a streak achievement, **When** the PUT request succeeds with unlocked achievements in the response, **Then** the achievement toast displays immediately after the standard "Entry updated successfully!" success toast

3. **Given** an achievement unlock toast is displayed, **When** 5 seconds pass, **Then** the toast automatically fades out and dismisses, matching the existing toast system behavior

4. **Given** an achievement unlock toast is displayed, **When** the user clicks the "View Achievements" action button, **Then** the user is navigated to the /achievements page where they can view their newly unlocked badge and all other achievements

5. **Given** a user saves an entry that does not unlock any achievements, **When** the API returns `unlockedAchievements: []`, **Then** only the standard "Entry saved successfully!" toast appears without any achievement notification

6. **Given** an achievement unlock toast is displayed, **When** the user clicks the close button (X), **Then** the toast dismisses immediately without navigating to the achievements page

---

### User Story 2 - Multiple Achievement Unlocks (Priority: P1)

When a user saves an entry that unlocks multiple achievements simultaneously (e.g., a 24-hour fast unlocking both "First 12-Hour Fast" and "First 24-Hour Fast"), they see either sequential toasts for each achievement or a single consolidated toast listing all unlocked achievements. This ensures users are aware of all their progress without overwhelming the interface.

**Why this priority**: Essential for handling real-world scenarios where users can unlock multiple achievements at once, especially when creating their first entry with a long fast or hitting multiple milestones simultaneously. Without this, users would miss awareness of some achievements or experience confusing UI behavior.

**Independent Test**: Can be fully tested by creating a fasting entry that unlocks 2-3 achievements at once (e.g., first entry with a 48-hour fast), verifying all achievements are displayed either as sequential toasts with proper spacing/timing or as a single consolidated notification, and confirming users can identify all unlocked achievements clearly.

**Acceptance Scenarios**:

1. **Given** a user saves an entry that unlocks 2 achievements (e.g., "First 12-Hour Fast" and "First Entry Logged"), **When** the API returns `unlockedAchievements: [{...}, {...}]` with both achievements, **Then** the system displays a single consolidated toast showing "🏆 2 Achievements Unlocked! First 12-Hour Fast (10 pts) • First Entry Logged (5 pts)" with both listed

2. **Given** multiple achievements are displayed in a consolidated toast, **When** the user clicks the "View Achievements" action button, **Then** they are navigated to the /achievements page showing their newly unlocked badges highlighted or scrolled into view

3. **Given** a user saves an entry that unlocks 4+ achievements, **When** the consolidated toast would exceed a reasonable height (e.g., >200px), **Then** the toast displays the first 3 achievements followed by "and 1 more..." text, with all achievements viewable on the /achievements page

4. **Given** a consolidated achievement toast is displayed, **When** the user views the toast, **Then** all listed achievements are clearly formatted and readable with proper spacing between items

5. **Given** multiple achievements unlock and the UI displays sequential toasts (alternative implementation), **When** the first toast appears, **Then** subsequent achievement toasts appear at 6-second intervals (allowing 5s for auto-dismiss + 1s gap) to prevent overlap and maintain readability

---

### User Story 3 - Visual Design and Celebratory Tone (Priority: P2)

Achievement unlock toasts are visually distinct from standard success/error toasts, using celebratory emoji (🏆, ⭐, 🎉, ✨) and rarity-based icons to create excitement and reinforce the gamification aspect of the achievement system. Each rarity level displays a distinct emoji: Common=🏆, Rare=⭐, Epic=🎉, Legendary=✨, with the rarity name shown in the toast message.

**Why this priority**: Important for user engagement and creating a positive emotional response to achievement unlocks. While the core notification functionality (P1) must work first, the visual design significantly impacts the perceived value and motivation boost from achievements. This is what makes achievements feel special rather than just another system notification.

**Note**: Custom toast background colors (Common=green, Rare=blue, Epic=purple, Legendary=gold) are deferred to future enhancement. MVP focuses on emoji differentiation and rarity labels.

**Independent Test**: Can be fully tested by unlocking achievements of different rarity levels (Common, Rare, Epic, Legendary), verifying each displays with the correct emoji icon and rarity label in the message, and confirming the visual treatment creates a more exciting and engaging experience compared to standard success toasts.

**Acceptance Scenarios**:

1. **Given** a user unlocks a Common rarity achievement, **When** the toast displays, **Then** it uses a 🏆 trophy icon and the message includes "Achievement Unlocked! [Name] - [X] points (Common)"

2. **Given** a user unlocks a Rare rarity achievement, **When** the toast displays, **Then** it uses a ⭐ star icon and the message includes "(Rare)" as the rarity label

3. **Given** a user unlocks an Epic rarity achievement, **When** the toast displays, **Then** it uses a 🎉 celebration icon and the message includes "(Epic)" as the rarity label

4. **Given** a user unlocks a Legendary rarity achievement, **When** the toast displays, **Then** it uses a ✨ sparkles icon and the message includes "(Legendary)" as the rarity label

5. **Given** an achievement toast is displayed, **When** compared to standard success toasts, **Then** it is visually distinguishable through the presence of achievement-specific emoji icons, "Achievement Unlocked!" text, and rarity labels that stand out from typical "Entry saved successfully" messages

6. **Given** an achievement toast displays the points earned, **When** the toast renders, **Then** the points are shown in the message (e.g., "10 points" or "25 pts") emphasizing the reward value

---

### User Story 4 - Graceful Error Handling (Priority: P2)

When the API response includes unlocked achievements but the data is malformed or incomplete, or when the achievement toast rendering encounters errors, the system degrades gracefully by either showing a generic achievement notification or skipping the achievement toast while still displaying the standard success toast, ensuring core entry save functionality is never broken by achievement display issues.

**Why this priority**: Important for robustness and user experience, but not critical for MVP. The core entry save flow must never fail due to achievement display problems. This handles edge cases and ensures system reliability, but can be addressed after the happy path is working.

**Independent Test**: Can be fully tested by mocking API responses with malformed achievement data (missing name, invalid rarity, null points), verifying the system either shows a fallback toast ("Achievement unlocked! View achievements page") or silently skips the achievement toast while still showing "Entry saved successfully!", and confirming no JavaScript errors break the page.

**Acceptance Scenarios**:

1. **Given** the API returns an achievement with missing required fields (e.g., no `name` or `points`), **When** the EntryForm processes the response, **Then** the system logs a warning to the console, displays a generic achievement toast ("🏆 Achievement Unlocked! View your achievements page"), or skips the malformed achievement while processing others correctly

2. **Given** the API returns `unlockedAchievements` as `null` or `undefined` instead of an empty array, **When** the EntryForm checks for unlocked achievements, **Then** the system treats this as no achievements unlocked and displays only the standard success toast without crashing

3. **Given** an error occurs while rendering an achievement toast (e.g., invalid rarity value causing undefined color lookup), **When** the toast rendering fails, **Then** the error is caught, logged to the console, and either a fallback toast displays or the achievement notification is skipped without affecting the entry save success toast

4. **Given** the API response takes longer than expected (e.g., network latency), **When** the EntryForm receives the delayed response with achievements, **Then** the achievement toast still displays correctly even if there's a slight delay between the success toast and achievement toast

5. **Given** a user has JavaScript disabled or an ad blocker preventing toast rendering, **When** they save an entry with unlocked achievements, **Then** the core entry save functionality still works and they can still view their achievements by manually navigating to the /achievements page

---

### Edge Cases

- **API returns empty unlockedAchievements array**: System displays only standard success toast without achievement notification, no errors thrown
- **Achievement has unknown rarity value**: System falls back to default styling (green/Common) or uses generic achievement icon without breaking rendering
- **User navigates away before toast displays**: Toast system queues the achievement toast but it may not display if user leaves the page before rendering completes; achievements are still unlocked and visible on /achievements page
- **Multiple entries saved in quick succession**: Each entry's achievements trigger separate toast notifications, potentially stacking up to the 4-toast display limit with queuing for additional toasts
- **Achievement name or description contains special characters/HTML**: System properly escapes text content to prevent XSS vulnerabilities or rendering issues
- **User is on mobile device with limited screen height**: Toast system positions achievement toasts appropriately without covering critical UI elements or causing scrolling issues
- **Achievement unlock occurs during entry edit vs. create**: Both flows display achievement toasts identically; user context (editing existing vs. creating new) doesn't affect toast behavior
- **User has previously unlocked the same achievement**: This edge case shouldn't occur (API prevents duplicate unlocks), but if it does, system displays the toast as normal since the API should not return already-unlocked achievements
- **Achievement toast appears while another modal is open**: Achievement toast displays on top of modals (higher z-index) or queues until modal closes, depending on toast system implementation
- **Accessibility - screen reader announces achievement**: Toast includes proper ARIA attributes to announce achievement unlocks to screen reader users without being intrusive

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: EntryForm MUST check the API response from POST /api/entries and PUT /api/entries/[id] for the `unlockedAchievements` array field after successful entry save/update
- **FR-002**: When `unlockedAchievements` contains one or more achievement objects, EntryForm MUST trigger toast notifications displaying the unlocked achievement details
- **FR-003**: Each achievement toast MUST display the achievement name, emoji/icon (🏆 by default), points earned (formatted as "+X pts"), and rarity level (Common, Rare, Epic, Legendary)
- **FR-004**: When a single achievement is unlocked, the system MUST display one achievement toast with the format: "🏆 Achievement Unlocked! [Name] - [X points] ([Rarity])"
- **FR-005**: When multiple achievements are unlocked simultaneously (2+), the system MUST display either: (a) a single consolidated toast listing all achievements, OR (b) sequential toasts appearing at 6-second intervals to prevent overlap
- **FR-006**: Achievement toasts MUST include a "View Achievements" action button that navigates the user to the /achievements page when clicked; the close button (X) dismisses the toast without navigation
- **FR-007**: Achievement toasts MUST auto-dismiss after 5 seconds, consistent with existing toast system behavior
- **FR-008**: Achievement toasts MUST use rarity-based emoji icons: Common=🏆, Rare=⭐, Epic=🎉, Legendary=✨, with rarity name displayed in the toast message; custom color schemes (Common=green, Rare=blue, Epic=purple, Legendary=gold) are deferred to future enhancement
- **FR-009**: Achievement toasts MUST be visually distinct from standard success/error toasts through use of celebratory emoji icons, rarity labels, and "Achievement Unlocked" messaging
- **FR-010**: When `unlockedAchievements` is empty, null, undefined, or contains no valid achievement objects, the system MUST NOT display achievement toasts and only show the standard success toast
- **FR-011**: The system MUST handle malformed achievement data gracefully by either showing a fallback toast ("🏆 Achievement Unlocked! View achievements page"), logging warnings, or skipping the malformed achievement without crashing
- **FR-012**: Achievement toast rendering errors MUST NOT prevent the standard entry save success toast from displaying or break core entry form functionality
- **FR-013**: The EntryForm MUST continue to display the standard success toast ("Entry saved successfully!" or "Entry updated successfully!") regardless of whether achievements are unlocked
- **FR-014**: Consolidated multi-achievement toasts displaying 4+ achievements MUST truncate the display to show the first 3 achievements followed by "and X more..." text to prevent excessive toast height

### Key Entities

- **UnlockedAchievement**: Achievement data returned by the API, including:
  - `achievementId` (string): Unique identifier for the achievement
  - `name` (string): Display name (e.g., "First 12-Hour Fast")
  - `description` (string): Achievement description text
  - `points` (number): Points awarded (e.g., 10, 25, 100)
  - `rarity` (string): Rarity level - Common, Rare, Epic, or Legendary
  - `category` (string): Achievement category (e.g., "duration", "streak", "goal")
  - `iconColor` (string): Color code for icon display
  - `unlockedAt` (ISO 8601 timestamp): When the achievement was unlocked

- **Achievement Toast**: Visual notification component displaying unlocked achievement details, including:
  - Achievement emoji/icon (🏆, ⭐, 🎉, ✨ based on rarity)
  - Achievement name and rarity badge
  - Points earned (formatted display)
  - Click handler for navigation to /achievements page
  - Auto-dismiss timer (5 seconds)
  - Close button for manual dismissal

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can immediately see when they unlock achievements without navigating to a separate page - achievement toast appears within 500ms of entry save completion
- **SC-002**: 100% of unlocked achievements are displayed to users through toast notifications (no missed achievement unlocks)
- **SC-003**: Users can identify achievement details (name, points, rarity) from the toast notification without clicking through to the achievements page
- **SC-004**: Multi-achievement unlocks (2-5 simultaneous achievements) are displayed clearly without UI overlap or confusion - all achievements are identifiable in the notification
- **SC-005**: Achievement toast notifications do not interfere with or block the standard entry save success feedback - both toasts display correctly
- **SC-006**: Users can click on achievement toasts to navigate to the /achievements page in 100% of cases (via "View Achievements" action button)
- **SC-007**: Malformed or missing achievement data does not cause entry save operations to fail or display error messages - system degrades gracefully in all tested edge cases
- **SC-008**: Achievement toasts are visually distinguishable from standard toasts in 100% of cases through emoji icons (🏆, ⭐, 🎉, ✨), "Achievement Unlocked!" messaging, and rarity labels
- **SC-009**: The achievement notification system handles rapid sequential entry saves (3+ entries in 30 seconds) without breaking toast display or queuing behavior
- **SC-010**: Mobile users on devices with screen heights of 667px (iPhone SE) or larger can view achievement toasts without critical UI elements being obscured

## Assumptions

- The existing toast notification system (Feature 021) is fully functional and supports displaying custom toast content, icons, and styling
- The `/achievements` page exists and displays user achievements with proper routing
- The `useToast` hook from `@/hooks/useToast` provides methods for displaying custom toast notifications with configurable content, duration, and styling
- The API contract for POST /api/entries and PUT /api/entries/[id] reliably returns the `unlockedAchievements` array in the response body (per Feature 032 specification)
- Achievement data returned by the API includes all required fields (name, points, rarity, achievementId) with valid values
- The EntryForm component already successfully calls the API and receives the full response including the `unlockedAchievements` field
- The toast system supports stacking multiple toasts vertically with proper spacing and queuing behavior (per Feature 021 specification)
- Rarity values returned by the API are limited to the enum: "Common", "Rare", "Epic", "Legendary" (no other values)
- The `showSuccess` method from `useToast` can be extended or a new `showAchievement` method can be created to display custom achievement toast styling
- Users are already familiar with the existing toast notification system and understand that toasts auto-dismiss after 5 seconds

## Dependencies

- **Feature 021 - Toast Notification System**: Must be fully implemented and functional, providing the `useToast` hook and toast display infrastructure
- **Feature 032 - Achievement Unlock API Response**: API endpoints POST /api/entries and PUT /api/entries/[id] must return the `unlockedAchievements` array in the response
- **Achievements Page**: The `/achievements` route must exist and properly display user achievements for navigation from toast clicks
- **EntryForm Component**: The EntryForm must be successfully saving/updating entries and receiving API responses with the full response body

