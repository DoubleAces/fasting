# Feature Specification: Toast Notification System

**Feature Branch**: `021-toast-notifications`  
**Created**: October 28, 2025  
**Status**: Draft  
**Input**: User description: "Add a toast notification system to provide user feedback for actions like goal changes, entry saves, errors, and success messages throughout the app"

## Clarifications

### Session 2025-10-28

- Q: When a 5th toast is triggered while 4 are already displayed, should the system queue it or discard it? → A: Queue with FIFO (First In, First Out) - 5th toast waits and displays when slot opens

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Success Feedback (Priority: P1)

Users see a brief, non-intrusive success message when they complete actions successfully (saving entries, updating settings, changing goals, etc.). The toast appears, displays for a few seconds, then automatically dismisses. This provides immediate positive feedback that their action worked.

**Why this priority**: Core functionality that addresses the primary user need for action confirmation. Without success feedback, users are left uncertain whether their actions completed successfully, leading to repeated attempts and frustration.

**Independent Test**: User saves a fasting entry, sees green toast appear at top of screen saying "Entry saved successfully!", toast auto-dismisses after 5 seconds. User can continue interacting with the app while toast is visible.

**Acceptance Scenarios**:

1. **Given** I am on the entries page and submit a new fasting entry, **When** the save completes successfully, **Then** I see a green success toast appear at the top of the screen with the message "Entry saved successfully!"

2. **Given** a success toast is displayed, **When** 5 seconds pass, **Then** the toast automatically fades out and disappears without any user action required

3. **Given** I update my user settings, **When** the update completes, **Then** I see a success toast with the message "Settings updated successfully!"

4. **Given** I change my fasting goal from 16h to 18h, **When** the goal updates, **Then** I see a success toast with the message "Goal updated to 18 hours"

5. **Given** a success toast is displayed, **When** I click elsewhere or scroll the page, **Then** the toast remains visible and does not interfere with my interaction with the page content

6. **Given** a success toast is displayed, **When** I click a close button (X) on the toast, **Then** the toast dismisses immediately without waiting for auto-dismiss

---

### User Story 2 - Error Feedback (Priority: P1)

Users see clear, actionable error messages when operations fail (network errors, validation failures, permission issues, etc.). Error toasts remain visible until manually dismissed, ensuring users don't miss critical information. This helps users understand what went wrong and how to fix it.

**Why this priority**: Essential for user experience and error recovery. Without clear error feedback, users cannot diagnose problems or take corrective action. Must be implemented alongside success feedback for complete user feedback coverage.

**Independent Test**: User attempts to save an invalid entry (e.g., end time before start time), sees red error toast with message "End time must be after start time" that remains visible until manually dismissed by clicking X button.

**Acceptance Scenarios**:

1. **Given** I submit a form with invalid data (e.g., fasting goal of 0 hours), **When** the validation fails, **Then** I see a red error toast with a clear message explaining the problem (e.g., "Goal must be between 1 and 168 hours")

2. **Given** an error toast is displayed, **When** I wait for an extended period, **Then** the toast remains visible and does not auto-dismiss (requires manual dismissal)

3. **Given** I attempt to save an entry but encounter a network error, **When** the request fails, **Then** I see an error toast with message "Failed to save entry. Please check your connection and try again."

4. **Given** an error toast is displayed, **When** I click the close button (X), **Then** the toast dismisses immediately

5. **Given** I receive an error for a failed operation (e.g., delete user failed), **When** the error toast displays, **Then** I see an optional "Retry" action button that I can click to retry the operation

6. **Given** I click a "Retry" button on an error toast, **When** the retry operation succeeds, **Then** the error toast dismisses and a success toast appears

---

### User Story 3 - Multiple Toast Management (Priority: P2)

When multiple actions occur in quick succession (e.g., saving multiple settings, bulk operations), users see toasts stack vertically without overlapping. Older toasts dismiss first, maintaining a clean interface. This prevents notification spam and keeps the UI organized.

**Why this priority**: Important for complex workflows and power users who perform multiple actions quickly. Not critical for MVP but significantly improves UX for heavy app usage.

**Independent Test**: User saves three entries in quick succession, sees three success toasts stack vertically with proper spacing. After 5 seconds, the first toast dismisses, followed by second and third at their respective timers.

**Acceptance Scenarios**:

1. **Given** I perform multiple successful actions quickly (e.g., save entry, update settings, change goal), **When** each action completes, **Then** I see multiple success toasts stack vertically with spacing between them

2. **Given** I have 3 toasts currently displayed, **When** the oldest toast's auto-dismiss timer completes, **Then** that toast dismisses first while the others remain visible

3. **Given** I have multiple toasts stacked, **When** I manually dismiss one toast by clicking its X button, **Then** only that specific toast dismisses and the others remain

4. **Given** I have 4 toasts currently displayed, **When** a 5th toast is triggered, **Then** the system queues the 5th toast and displays it automatically when one of the 4 visible toasts dismisses (FIFO order)

5. **Given** I have a mix of success and error toasts displayed, **When** viewing them, **Then** error toasts remain visible while success toasts auto-dismiss according to their timers

---

### User Story 4 - Action Buttons in Toasts (Priority: P3)

Users can take immediate action from toast notifications (e.g., "View" a newly created item, "Retry" a failed operation, "Undo" a deletion). This provides contextual shortcuts and improves workflow efficiency.

**Why this priority**: Nice-to-have enhancement that adds convenience but not critical for core functionality. Can be added after basic toast system is working.

**Independent Test**: User deletes an entry, sees toast "Entry deleted" with "Undo" button. Clicking "Undo" immediately restores the entry and shows "Entry restored" success toast.

**Acceptance Scenarios**:

1. **Given** I save a new fasting entry, **When** the success toast appears with message "Entry saved successfully!", **Then** I see an optional "View" action button that navigates me to the entry details page

2. **Given** I encounter an error during user deletion, **When** the error toast displays with message "Failed to delete user", **Then** I see a "Retry" action button that reattempts the deletion

3. **Given** I click an action button in a toast, **When** the action completes successfully, **Then** the original toast dismisses and a new success toast appears confirming the action result

4. **Given** I delete an entry, **When** the success toast appears, **Then** I see an "Undo" button that I can click within 5 seconds to restore the deleted entry

5. **Given** a toast has an action button, **When** I click the action button, **Then** the toast dismisses immediately after triggering the action callback

---

### Edge Cases

- **What happens when the same message is triggered multiple times rapidly** (e.g., user double-clicks save button)? System should deduplicate identical toasts within a 1-second window to prevent spam.

- **How does the system handle very long error messages** (e.g., detailed validation errors with 5+ fields)? Toast should have max-width constraints with text wrapping, and very long messages should be truncated with "..." and optional expand button.

- **What happens when a toast displays while user is on mobile with limited screen space**? Toast should be responsive, take full width on mobile with reduced padding, and position at top to avoid covering navigation or action buttons.

- **How does the system handle toasts when user navigates to a different page**? Active toasts should persist across client-side navigation (Next.js router transitions) if still within auto-dismiss window, but clear when user does full page reload.

- **What happens if JavaScript is disabled or toast system fails to load**? Fallback to traditional inline error/success messages within forms and components (existing behavior preserved).

- **How accessible are toasts to screen reader users**? Toasts must use ARIA live regions (`role="status"` for success, `role="alert"` for errors) to announce messages to screen readers without stealing focus.

- **What happens when user has reduced motion preference enabled** (prefers-reduced-motion CSS)? Toast animations (slide-in, fade-out) should be disabled, using instant show/hide instead.

- **How does the system handle toasts during slow network conditions**? Toasts should trigger immediately when action is initiated (optimistic) or when response is received (pessimistic), depending on operation criticality. Network errors should always show error toast.

## Requirements *(mandatory)*

### Functional Requirements

**Toast Display & Behavior:**

- **FR-001**: System MUST display toast notifications at the top-center of the viewport, above all other content including navigation bars
- **FR-002**: System MUST support two toast types: success (green) and error (red) with distinct visual styling
- **FR-003**: Success toasts MUST auto-dismiss after 5 seconds from initial display
- **FR-004**: Error toasts MUST remain visible until manually dismissed by user clicking close button
- **FR-005**: System MUST provide a close button (X icon) on all toasts for manual dismissal
- **FR-006**: System MUST stack multiple toasts vertically with consistent spacing (e.g., 12px gap) when multiple toasts are active simultaneously
- **FR-007**: System MUST limit the maximum number of simultaneously displayed toasts to 4, queuing additional toasts in FIFO order for display when slots become available
- **FR-008**: System MUST deduplicate identical toast messages triggered within 1 second window to prevent spam

**Toast Content & Actions:**

- **FR-009**: System MUST display a clear text message in each toast (minimum 10 characters, maximum 200 characters recommended)
- **FR-010**: System MUST support optional action buttons in toasts (e.g., "Retry", "View", "Undo") with callback handlers
- **FR-011**: System MUST dismiss toast immediately when user clicks an action button (after triggering callback)
- **FR-012**: System MUST wrap long messages to multiple lines with maximum width constraint (e.g., 500px desktop, 90vw mobile)

**Integration Points:**

- **FR-013**: System MUST provide a React hook (`useToast`) that components can import to trigger toasts
- **FR-014**: The `useToast` hook MUST expose `showSuccess(message, options)` function for success toasts
- **FR-015**: The `useToast` hook MUST expose `showError(message, options)` function for error toasts
- **FR-016**: The `useToast` hook MUST expose `clearAll()` function to programmatically dismiss all active toasts
- **FR-017**: System MUST integrate toast notifications into existing components: EntryForm, SettingsForm, GoalSettingPanel, Admin User Management, and Authentication flows
- **FR-018**: System MUST replace existing inline success/error messages with toast notifications where appropriate (while keeping form field validation errors inline)

**Accessibility & Responsiveness:**

- **FR-019**: Toasts MUST use ARIA live regions (`role="status"` for success, `role="alert"` for errors) for screen reader compatibility
- **FR-020**: Toasts MUST be keyboard accessible with focus management that allows users to dismiss via Escape key
- **FR-021**: System MUST respect `prefers-reduced-motion` CSS media query, disabling animations for users who prefer reduced motion
- **FR-022**: Toasts MUST be fully responsive, adapting layout for mobile screens (full width with padding on screens < 640px)
- **FR-023**: Toast text MUST meet WCAG 2.1 AA color contrast requirements (minimum 4.5:1 ratio for text)

**State Management & Persistence:**

- **FR-024**: System MUST maintain toast state in React Context to share across all components
- **FR-025**: System MUST clear all toasts when user performs full page reload or hard navigation
- **FR-026**: System MUST persist toasts across client-side route transitions (Next.js router navigation) if within auto-dismiss window
- **FR-027**: Each toast MUST have a unique ID (e.g., timestamp + random string) to enable individual dismissal and tracking

### Key Entities

- **Toast**: A notification message displayed to the user
  - **Attributes**: id (unique identifier), type (success/error), message (text content), action (optional button with label and callback), timestamp (creation time), autoDismiss (boolean - whether toast auto-dismisses)
  - **Lifecycle**: Created → Displayed → Auto-dismissed (success) or Manually dismissed (error/all) → Removed from state

- **Toast Context**: Global state container managing active toasts
  - **Attributes**: toasts (array of active Toast objects), maxToasts (limit, default 4), queue (array of pending Toast objects waiting for display slots)
  - **Operations**: addToast(), removeToast(id), clearAll(), deduplicateToast(message), processQueue() (displays next queued toast when slot available)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see success confirmation for all successful actions (entry saves, settings updates, goal changes) within 500ms of operation completion
- **SC-002**: Users see error messages for all failed operations within 500ms of error detection
- **SC-003**: Error toasts remain visible until manually dismissed (no accidental loss of error information)
- **SC-004**: Success toasts automatically dismiss after 5 seconds without requiring user interaction
- **SC-005**: Multiple toasts (up to 4) can be displayed simultaneously without visual overlap or layout issues
- **SC-006**: Toast notifications meet WCAG 2.1 Level AA accessibility standards (color contrast, ARIA regions, keyboard access)
- **SC-007**: Toast system introduces zero breaking changes to existing form validation or error handling (inline errors remain for form fields)
- **SC-008**: Toast notifications are fully responsive on mobile devices (320px to 1920px viewport widths)
- **SC-009**: Users can perform actions (retry, view, undo) directly from toasts when applicable, reducing clicks by at least 1 per action
- **SC-010**: Screen reader users receive immediate audio feedback for all success and error toasts via ARIA live regions

### User Satisfaction Metrics

- **SC-011**: Users report increased confidence that their actions completed successfully (reduced "did it save?" uncertainty)
- **SC-012**: Support tickets related to "action didn't work" or "not sure if saved" decrease by at least 30% after implementation
- **SC-013**: Users can identify and resolve errors more quickly with actionable error messages in toasts
- **SC-014**: Zero user complaints about toast notifications being intrusive or blocking critical UI elements

