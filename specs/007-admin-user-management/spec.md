# Feature Specification: Admin User Management

**Feature Branch**: `007-admin-user-management`  
**Created**: October 22, 2025  
**Status**: ✅ Complete - Merged to master (October 2025)  
**Input**: User description: "In the admin section of the project, I want to now add user management. I want to see a list of users in a table format, their name, email, registration date (in format dd.mm.yyyy), last login date and time (in format dd.mm.yyy HH:ii). I want to be able to edit their information (for now, only the 'isAdmin' field - i want to be able to toggle this on/off). Creation of users is not necessary. I also need the ability to delete the user, in which case it would delete all the data from all the collections that belong to that user"

## Clarifications

### Session 2025-10-22

- Q: User list pagination/performance - How should the table handle large datasets (hundreds/thousands of users)? → A: Server-side pagination with page size control
- Q: Table sorting capability - Should the user list table support sorting? → A: Sortable by all displayed columns
- Q: Timezone display for dates - How should dates/times be displayed across different timezones? → A: Display in admin's local timezone
- Q: Search/filter capability - Should users be able to search or filter the user list? → A: Filter fields in the table above the name, email and admin columns
- Q: Error handling for failed operations - How should the system handle errors during admin operations? → A: Toast notifications with retry option

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Users (Priority: P1)

As an admin, I need to see a comprehensive list of all registered users in the system so that I can monitor user activity and make informed decisions about user management.

**Why this priority**: This is the foundation of user management - admins cannot perform any management tasks without first being able to view users. This delivers immediate value by providing visibility into the user base.

**Independent Test**: Can be fully tested by logging in as an admin, navigating to the user management page, and verifying that all users are displayed in a table with correct information. Delivers value by providing user visibility even without edit/delete capabilities.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin user, **When** I navigate to the user management section, **Then** I see a table displaying all users with columns: Name, Email, Registration Date (dd.mm.yyyy), Last Login (dd.mm.yyyy HH:ii)
2. **Given** I am viewing the user list, **When** the page loads, **Then** all user records are retrieved and displayed in the table
3. **Given** I am viewing the user list, **When** a user has never logged in, **Then** their Last Login field shows an appropriate indicator (e.g., "Never" or "-")
4. **Given** the system has multiple users, **When** I view the user list, **Then** I can see my own account marked or highlighted as the current admin viewing the list

---

### User Story 2 - Toggle Admin Privileges (Priority: P2)

As an admin, I need to grant or revoke admin privileges to other users so that I can delegate administrative responsibilities or remove admin access when necessary.

**Why this priority**: This is the core editing functionality requested. It enables privilege management without requiring complex edit forms or multiple fields.

**Independent Test**: Can be fully tested by viewing a user in the list, toggling their admin status, and verifying the change persists. Delivers value by enabling admin privilege delegation independently of other features.

**Acceptance Scenarios**:

1. **Given** I am viewing the user list, **When** I click the admin toggle for a non-admin user, **Then** that user is granted admin privileges and the toggle state updates immediately
2. **Given** I am viewing the user list, **When** I click the admin toggle for an admin user, **Then** that user's admin privileges are revoked and the toggle state updates immediately
3. **Given** I have toggled a user's admin status, **When** I refresh the page, **Then** the admin status change persists
4. **Given** I am viewing the user list, **When** I attempt to toggle my own admin status, **Then** the system prevents this action and displays a warning message
5. **Given** I have toggled a user's admin status, **When** that user is currently logged in, **Then** their session reflects the updated privileges (they see/lose admin access accordingly)

---

### User Story 3 - Delete User and All Associated Data (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]


As an admin, I need to completely remove a user account and all their associated data from the system so that I can comply with user deletion requests or remove inactive/problematic accounts.

**Why this priority**: While important, deletion is typically less frequent than viewing and editing. It's also a destructive action that requires the most caution and confirmation.

**Independent Test**: Can be fully tested by selecting a test user, initiating deletion, confirming the action, and verifying the user and their data are completely removed. Delivers value by enabling complete user removal independently of other features.

**Acceptance Scenarios**:

1. **Given** I am viewing the user list, **When** I click the delete button for a user, **Then** a confirmation dialog appears warning about permanent data deletion
2. **Given** the delete confirmation dialog is displayed, **When** I confirm the deletion, **Then** the user account is removed from the database
3. **Given** a user is deleted, **When** the deletion completes, **Then** all data associated with that user across all collections is also deleted (fasting entries, settings, password reset tokens, security logs)
4. **Given** I have deleted a user, **When** I return to the user list, **Then** the deleted user no longer appears in the table
5. **Given** I am viewing the user list, **When** I attempt to delete my own account, **Then** the system prevents this action and displays an error message
6. **Given** the delete confirmation dialog is displayed, **When** I cancel the deletion, **Then** no changes are made and the user remains in the system

---

### Edge Cases

- What happens when an admin tries to remove their own admin privileges? → System prevents this and displays warning message
- What happens when an admin tries to delete their own account? → System prevents this and displays error message
- What happens when attempting to toggle admin status during a network failure? → Toast notification with error message and retry button
- What happens if a user is deleted while they are actively logged in? → User session is terminated
- How does the system handle viewing the user list when there are hundreds or thousands of users? → Server-side pagination with page size control
- What happens when attempting to delete a user that has already been deleted? → Toast notification with appropriate error message
- How does the system handle concurrent admin privilege changes by multiple admins? → Last write wins; toast notification on success
- What happens when displaying dates for users in different timezones? → Display all dates/times in admin's local timezone (browser timezone)

## Requirements *(mandatory)*

### Functional Requirements

#### Display Requirements

- **FR-001**: System MUST display a table of all registered users visible to authenticated admin users
- **FR-002**: Table MUST include columns for: Name, Email, Registration Date, Last Login, Admin Status, Actions
- **FR-003**: Registration Date MUST be formatted as dd.mm.yyyy (e.g., "22.10.2025")
- **FR-004**: Last Login MUST be formatted as dd.mm.yyyy HH:ii (e.g., "22.10.2025 14:30")
- **FR-005**: All dates and times MUST be displayed in the admin's local timezone (browser timezone)
- **FR-006**: System MUST display an appropriate indicator (e.g., "Never" or "-") when a user has never logged in
- **FR-007**: System MUST clearly identify which user record belongs to the currently logged-in admin
- **FR-007**: System MUST implement server-side pagination for the user list
- **FR-008**: System MUST allow admins to control page size (number of users per page)
- **FR-009**: System MUST display pagination controls (page numbers, next/previous navigation)
- **FR-010**: System MUST provide filter input fields above the Name, Email, and Admin Status columns
- **FR-011**: Name filter MUST filter users whose name contains the entered text (case-insensitive)
- **FR-012**: Email filter MUST filter users whose email contains the entered text (case-insensitive)
- **FR-013**: Admin Status filter MUST allow filtering by admin/non-admin/all users
- **FR-014**: Filters MUST work in combination (multiple filters applied simultaneously)
- **FR-015**: System MUST apply filters on the server side before pagination
- **FR-016**: System MUST allow sorting by all displayed columns (Name, Email, Registration Date, Last Login, Admin Status)
- **FR-017**: System MUST support both ascending and descending sort order
- **FR-018**: System MUST persist sort preferences during the current session

#### Edit Requirements

- **FR-019**: System MUST provide a toggle control for the isAdmin field for each user
- **FR-020**: Admin toggle MUST immediately update the user's admin status in the database
- **FR-021**: Admin toggle state MUST persist after page refresh
- **FR-022**: System MUST prevent admins from removing their own admin privileges
- **FR-023**: System MUST update the affected user's active session privileges immediately after admin status change

#### Delete Requirements

- **FR-024**: System MUST provide a delete action for each user in the list
- **FR-025**: System MUST display a confirmation dialog before executing user deletion
- **FR-026**: Confirmation dialog MUST clearly warn about permanent data loss
- **FR-027**: System MUST delete all user data across all collections when a user is deleted
- **FR-028**: System MUST prevent admins from deleting their own account
- **FR-029**: Deleted user MUST be immediately removed from the user list after successful deletion
- **FR-030**: System MUST terminate any active sessions for a deleted user

#### Access Control

- **FR-031**: User management interface MUST only be accessible to users with admin privileges
- **FR-032**: Non-admin users attempting to access user management MUST be redirected to an access denied page

#### Data Integrity

- **FR-033**: System MUST ensure all delete operations are atomic (either all data is deleted or none)
- **FR-034**: System MUST log all admin privilege changes for audit purposes
- **FR-035**: System MUST log all user deletion actions for audit purposes

#### Error Handling

- **FR-036**: System MUST display toast notifications for all operation errors (toggle admin status, delete user, filter/sort/pagination failures)
- **FR-037**: Error toast notifications MUST include a clear error message describing what went wrong
- **FR-038**: Error toast notifications MUST include a retry button for recoverable errors
- **FR-039**: Error toast notifications MUST auto-dismiss after 5 seconds (unless user interacts with them)
- **FR-040**: System MUST display success toast notifications after successful operations (admin toggle, user deletion)

### Key Entities

- **User**: Represents a registered user account with attributes including name, email, registration date, last login timestamp, and admin status (isAdmin boolean)
- **User Data**: Represents all data associated with a user across multiple collections including fasting entries, user settings, password reset tokens, security logs, and any other user-specific data

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view the complete user list within 2 seconds of page load for databases with up to 1000 users
- **SC-002**: Admin privilege toggle operations complete and reflect changes within 1 second
- **SC-003**: 100% of user data is successfully deleted when a user account is removed (verified through database inspection)
- **SC-004**: Zero cases of admins successfully removing their own admin privileges or deleting their own account
- **SC-005**: All admin actions (privilege changes, deletions) are logged with timestamp, admin user ID, and action details
- **SC-006**: User management interface is only accessible to authenticated admin users (100% access control enforcement)
- **SC-007**: Affected user sessions update within 5 seconds of admin privilege changes
