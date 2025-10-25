# Feature Specification: Remove Copy to Today Functionality

**Feature Branch**: `012-remove-copy-today`  
**Created**: October 25, 2025  
**Status**: Draft  
**Input**: User description: "Remove the 'Copy to Today' functionality from the app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Copy Action from Entry Details (Priority: P1)

Users viewing entry details no longer see or interact with the "Copy to Today" button. The feature is completely removed from the user interface, preventing any confusion or accidental usage attempts.

**Why this priority**: This is the primary user-facing change and directly accomplishes the removal goal. Removing the UI element prevents users from attempting to use a feature that will no longer be supported.

**Independent Test**: Can be tested by navigating to any entry details page and verifying the "Copy to Today" button is not present in the actions area. Feature is complete when no user can access this functionality.

**Acceptance Scenarios**:

1. **Given** a user views an entry details page, **When** they look at the available actions, **Then** they should see only "Edit" and "Delete" buttons (no "Copy to Today" button)
2. **Given** a user views today's entry details, **When** they look at the available actions, **Then** the "Copy to Today" button should not appear (even in its disabled state)
3. **Given** a user views a past entry details page, **When** they check the action buttons, **Then** no copy functionality should be visible or accessible

---

### User Story 2 - Remove Backend Copy Logic (Priority: P2)

The system no longer processes copy-to-today requests. All backend code handling the creation of new entries from templates is removed, including validation logic and the templateSource tracking field.

**Why this priority**: This removes the underlying functionality after the UI is removed. While users can't trigger this after P1, completing this ensures no orphaned code remains and prevents potential security issues from undiscovered access paths.

**Independent Test**: Can be tested by attempting direct API calls to create entries with templateSource parameters - the system should either ignore the field or handle it as any other entry creation without special copy logic.

**Acceptance Scenarios**:

1. **Given** an API request attempts to create an entry with a templateSource field, **When** the system processes the request, **Then** the entry is created normally without any special copy-from-template logic
2. **Given** the system creates a new entry, **When** saving to the database, **Then** no templateSource reference is stored
3. **Given** existing entries are queried or displayed, **When** rendering the entry details page, **Then** the system displays entries without errors (console.error count = 0, page renders successfully)

---

### User Story 3 - Clean Up Data Model (Priority: P3)

The data model no longer includes the templateSource field for new entries. The validation schema is updated to reflect that this field is no longer accepted.

**Why this priority**: This is cleanup work that doesn't affect functionality but improves code maintainability by removing unused validation rules.

**Independent Test**: Can be tested by examining database entries created after the change - they should not contain templateSource fields.

**Acceptance Scenarios**:

1. **Given** a new entry is created through any method, **When** saved to the database, **Then** the templateSource field should be null or undefined
2. **Given** the entry validation schema, **When** reviewed, **Then** templateSource validation rules are removed
3. **Given** an API request with templateSource field, **When** validated, **Then** the field is silently ignored (stripUnknown: true)

---

### Edge Cases

- What happens when existing entries have templateSource values? (Answer: Field is ignored, no impact on functionality)
- How does the system handle old bookmarks or deep links that might have referenced copy functionality? (Answer: Standard entry details page renders without Copy to Today button - no special handling needed)
- What happens if users manually craft API requests with templateSource? (Answer: Field is silently ignored via stripUnknown, entry created normally without special copy logic)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove "Copy to Today" button from entry details pages (EntryActions component)
- **FR-002**: System MUST remove all client-side code related to copy-to-today functionality (state variables, handler functions, UI elements)
- **FR-003**: System MUST remove all server-side logic that handles copy-from-template requests
- **FR-004**: System MUST remove templateSource field validation from entrySchema.js (Joi validation rules)
- **FR-005**: System MUST NOT populate templateSource field for any new entries created after this change
- **FR-006**: System MUST update entry creation API to silently ignore templateSource parameter if provided in request body (stripUnknown behavior)
- **FR-007**: Edit and Delete functionality MUST remain fully operational after removal

### Key Entities

- **Entry**: The templateSource field (ObjectId reference to another entry) will be removed from validation and will no longer be populated for new entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users viewing any entry details page see exactly 2 action buttons (Edit and Delete), never 3
- **SC-002**: Zero API requests successfully execute copy-to-today logic after deployment
- **SC-003**: All new entries created after deployment have null/undefined templateSource field
- **SC-004**: System continues to display entries without errors after removal (no console errors, pages render successfully)
- **SC-005**: Code search for "copy to today" (case-insensitive) returns zero results in active source code (excluding spec documentation)

## Constraints *(optional)*

### Technical Constraints

- Changes must not break existing entry queries or display logic
- No database migration required

### Business Constraints

- Feature removal must be complete - no partial implementations
- No user-facing breaking changes to other entry management features (edit, delete, view)

## Assumptions *(optional)*

1. **User Communication**: Assumes users have been notified or will be notified through other channels (release notes, changelog) that this feature is being removed
2. **Alternative Workflow**: Assumes users can manually create new entries if they need to replicate data (copy-paste into form)
3. **Usage Data**: Assumes analysis has shown this feature is underutilized or causing issues, justifying removal
4. **No Dependencies**: Assumes no other features or integrations depend on the templateSource field or copy functionality
5. **Test Coverage**: Assumes existing tests for copy functionality will be removed along with the feature code

## Open Questions *(optional)*

*No open questions - feature scope is clear and straightforward removal*

## Related Features *(optional)*

- **011-entry-details-page**: Original feature that included the Copy to Today functionality
- **Future Manual Entry Creation Enhancement**: Users who relied on copy functionality may benefit from improved quick-entry forms or templates in the future

## Notes *(optional)*

### Rationale for Removal

This feature is being removed based on the following considerations:
- Potential confusion: Users may not understand when/why to use copy vs. creating a new entry
- Maintenance burden: Additional code paths to test and maintain
- Data integrity: Copying entries may not be appropriate for health tracking data where each day should be unique
- Simpler UX: Reducing action count from 3 to 2 improves decision-making clarity

### Historical Context

The "Copy to Today" feature was implemented as part of User Story 3 in the 011-entry-details-page feature. It allowed users to pre-fill today's entry with meal times from a past entry. The templateSource field tracked this relationship.

### Migration Path

No data migration required. The templateSource field validation is simply removed from the schema - the field becomes unused.
