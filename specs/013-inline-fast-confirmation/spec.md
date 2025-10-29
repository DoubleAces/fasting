# Feature Specification: Inline Extended Fast Confirmation

**Feature Branch**: `013-inline-fast-confirmation`  
**Created**: October 25, 2025  
**Status**: ✅ Complete - Merged to master (October 2025)  
**Input**: User description: "Move the extended fast confirmation popup from the top of the edit entry form to replace the Update Entry button at the bottom. When a user clicks Update Entry and an extended fast is detected, hide the Update Entry button and show the two confirmation buttons in its place. When the user clicks either confirmation button, immediately save the entry with that selection - don't make them click Update Entry again. For non-extended fasts, Update Entry should work normally with no popup."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Non-Extended Fast Update (Priority: P1)

Users editing entries with regular fasting periods (under 24 hours) can save their changes with a single click, experiencing no interruptions or additional prompts.

**Why this priority**: This is the most common user flow. The majority of daily fasting entries are 16-18 hours and should have the smoothest experience. This ensures existing functionality remains intact.

**Independent Test**: Can be fully tested by editing any entry with a fasting period under 24 hours, clicking "Update Entry" once, and verifying the entry saves immediately without any confirmation prompts.

**Acceptance Scenarios**:

1. **Given** a user is editing an entry with a 16-hour fast, **When** they click "Update Entry", **Then** the entry saves immediately and they are redirected to the entry details page with a success message
2. **Given** a user is editing an entry with meal times that result in less than 24 hours from the previous entry, **When** they click "Update Entry", **Then** no confirmation popup appears and the save completes in one click

---

### User Story 2 - Extended Fast Confirmation (Priority: P2)

Users editing entries that create extended fasting periods (24+ hours) can confirm or deny the fast and save the entry in a single action, without needing to click the update button twice.

**Why this priority**: This addresses the primary UX issue - the two-click flow for extended fasts. While less common than regular fasts, extended fast entries are important for accurate tracking and the current flow is confusing.

**Independent Test**: Can be fully tested by editing an entry to create a 25+ hour gap, clicking "Update Entry", seeing inline confirmation buttons replace the Update button, clicking either confirmation option, and verifying the entry saves immediately with the selected confirmation state.

**Acceptance Scenarios**:

1. **Given** a user is editing an entry that creates a 26-hour fast from the previous entry, **When** they click "Update Entry", **Then** the Update Entry button is replaced by two inline confirmation buttons ("Yes, confirm extended fast" and "No, I ate but didn't log") at the bottom of the form
2. **Given** the extended fast confirmation buttons are displayed, **When** the user clicks "Yes, confirm extended fast", **Then** the entry is immediately saved with `extendedFastConfirmed: true` and the user is redirected to the entry details page
3. **Given** the extended fast confirmation buttons are displayed, **When** the user clicks "No, I ate but didn't log", **Then** the entry is immediately saved with `extendedFastDenied: true` and the user is redirected to the entry details page
4. **Given** a user is editing an entry that creates extended fasts both from previous AND to next entry, **When** they confirm/deny the first prompt, **Then** the second extended fast confirmation appears inline, and clicking either option saves the entry with both confirmation states

---

### User Story 3 - Visual Feedback During Save (Priority: P3)

Users see clear loading indicators when confirmation buttons are clicked, providing confidence that their action is being processed.

**Why this priority**: Good UX requires feedback for async operations. While not blocking core functionality, it prevents user confusion and duplicate clicks.

**Independent Test**: Can be fully tested by clicking an extended fast confirmation button and observing a loading state (spinner or disabled state) until the save completes or fails.

**Acceptance Scenarios**:

1. **Given** extended fast confirmation buttons are displayed, **When** the user clicks either button, **Then** a loading spinner appears and both buttons become disabled during the save operation
2. **Given** a save operation is in progress, **When** the save fails due to network error, **Then** an error message appears above the confirmation buttons and the buttons become clickable again
3. **Given** a save operation completes successfully, **When** redirecting to the details page, **Then** a success message is displayed

---

### Edge Cases

- What happens when the user changes meal times after the confirmation buttons appear? (Answer: Confirmation buttons should hide and revert to "Update Entry" button, requiring re-detection)
- What happens when network fails during save after clicking a confirmation button? (Answer: Show error message, keep confirmation buttons visible and clickable)
- What happens when multiple extended fasts are detected (from previous AND to next entry)? (Answer: Show first confirmation inline, then after selection show second confirmation inline, then save)
- What happens when user rapidly clicks a confirmation button multiple times? (Answer: Button should disable immediately on first click to prevent duplicate submissions)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect extended fasts (24+ hours) when "Update Entry" button is clicked on the entry edit form
- **FR-002**: System MUST hide the "Update Entry" button when an extended fast is detected
- **FR-003**: System MUST display two inline confirmation buttons ("Yes, confirm extended fast" and "No, I ate but didn't log") in place of the "Update Entry" button at the bottom of the form
- **FR-004**: System MUST immediately save the entry with the selected confirmation state when either confirmation button is clicked (no second "Update Entry" click required)
- **FR-005**: System MUST save entries immediately without any confirmation prompt when no extended fast is detected (fasting duration under 24 hours)
- **FR-006**: System MUST show loading state on confirmation buttons during save operation to prevent duplicate submissions
- **FR-007**: System MUST display error messages if save fails, and keep confirmation buttons visible and clickable for retry
- **FR-008**: System MUST revert to showing "Update Entry" button if user changes meal time fields after confirmation buttons appear (requiring re-detection)
- **FR-009**: System MUST handle multiple extended fasts (from previous AND to next entry) by showing confirmations sequentially inline, then saving after all confirmations are collected
- **FR-010**: System MUST redirect to entry details page with success message after successful save

### Key Entities

- **Entry**: Fasting entry with date, meal times, and optional extended fast confirmation fields (`extendedFastConfirmed`, `extendedFastDenied`, `extendedFastFromPreviousConfirmed`, `extendedFastToNextDenied`)
- **Extended Fast Detection**: Calculation result indicating if a fasting period exceeds 24 hours, including duration details and previous/next entry references

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users editing entries with extended fasts can complete the update in one action (clicking a confirmation button) instead of two (confirm + click Update Entry)
- **SC-002**: Users editing entries with regular fasts (under 24 hours) experience no change - single click on "Update Entry" saves immediately
- **SC-003**: Zero duplicate entry saves occur due to rapid clicking of confirmation buttons
- **SC-004**: Users see loading feedback within 100ms of clicking a confirmation button
- **SC-005**: Extended fast confirmation UI appears at the bottom of the form (where Update Entry button was) not at the top

## Assumptions *(optional)*

- Extended fast detection logic (24-hour threshold, API endpoint `/api/entries/check-previous`) remains unchanged
- Current form validation (required fields, date format, meal time format) remains unchanged
- The entry edit form component (`EntryForm.js`) already handles extended fast detection and confirmation state management
- Success/error handling patterns (redirect with message, error display) remain consistent with existing implementation
- Multiple extended fasts (from previous AND to next) should still be handled sequentially, but both confirmations happen inline before save (not requiring page refresh between them)

## Scope *(optional)*

### In Scope

- Repositioning extended fast confirmation UI from top of form to bottom (replacing Update Entry button)
- Combining confirmation selection with save action (one-click update)
- Maintaining sequential handling of multiple extended fasts inline
- Loading states and error handling for confirmation button clicks
- Reverting to Update Entry button if meal times change after confirmation appears

### Out of Scope

- Changing the 24-hour threshold for extended fast detection
- Modifying the extended fast detection logic or API
- Changing the create entry flow (only affects edit entry flow)
- Altering form validation rules or required fields
- Changing confirmation button text or messaging
- Implementing a "Cancel" action to hide confirmation buttons (user can simply change meal times to trigger re-detection)

## Dependencies *(optional)*

- Existing extended fast detection API (`/api/entries/check-previous`)
- Existing entry update API (`PUT /api/entries/[id]`)
- Current form component state management (React hooks for form data, errors, submission state)
- EntryFormWrapper component for handling success/error callbacks and navigation

## Open Questions *(optional)*

None - the feature description is clear and aligns with existing patterns in the codebase.

