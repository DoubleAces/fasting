# Feature Specification: Admin User Management

**Feature Branch**: `006-admin-user-management`  
**Created**: October 22, 2025  
**Status**: Draft  
**Input**: User description: "Create an admin user management feature that allows administrators to: 1. View all users in a paginated table (25 per page, configurable 10-100) with server-side pagination for performance, filtering by name (text search), email (text search), and admin status (all/admin/non-admin), sorting by name, email, registration date, last login, and admin status (ascending/descending), display columns: name, email, registration date, last login, admin status, actions, all dates in admin's local timezone (dd.mm.yyyy HH:ii format), and self-identification (highlight current admin's row). 2. Toggle admin status (isAdmin field) for any user except themselves with button/toggle in each row, disabled state when targeting self, server-side validation prevents self-modification (403 error), session updates propagate within 5 seconds, toast notification confirms success, and audit logging records who changed what. 3. Delete users with complete cascade deletion except themselves with delete button in each row, confirmation dialog, disabled state when targeting self, server-side validation prevents self-deletion (403 error), atomic transaction deletes user plus all related data (fasting entries, user settings, password reset tokens, security logs), toast notification shows deletion summary (counts of deleted records), retry button on errors, and audit logging records deletion. Technical requirements: Next.js 15.5.6 App Router, React 19.1.0, MongoDB with Mongoose, NextAuth.js, user list loads under 2 seconds for 1000 users (requires indexes), admin toggle completes under 1 second, session updates within 5 seconds, custom toast notification system (no external library), TDD approach with Jest, React Testing Library, Playwright, WCAG 2.1 AA accessibility compliance, and mobile-first responsive design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Browse Users (Priority: P1)

As an administrator, I need to view all registered users in a paginated, filterable, and sortable table so that I can efficiently browse and search through the user base to find specific users or groups of users.

**Why this priority**: This is the foundation capability - administrators must be able to see users before they can manage them. This provides immediate value by giving visibility into the user base and is independently valuable even without edit/delete capabilities.

**Independent Test**: Navigate to the admin user management page and verify a table displays all users with pagination controls. Filter users by entering text in name/email fields and selecting admin status. Sort by clicking column headers. Confirm the table loads and responds within 2 seconds even with 1000+ users. Verify the current admin's row is visually distinguished.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator, **When** I navigate to the user management page, **Then** I see a table displaying all users with columns for name, email, registration date, last login, admin status, and actions
2. **Given** I am viewing the user table with more than 25 users, **When** the page loads, **Then** I see 25 users per page by default with pagination controls to navigate between pages
3. **Given** I am on the user table, **When** I type text into the name filter field, **Then** the table updates to show only users whose names contain that text (case-insensitive)
4. **Given** I am viewing the user table, **When** I type text into the email filter field, **Then** the table updates to show only users whose emails contain that text (case-insensitive)
5. **Given** I am viewing the user table, **When** I select "Admin" from the admin status filter, **Then** the table shows only users with admin privileges
6. **Given** I am viewing the user table, **When** I click on any column header (name, email, registration date, last login, admin status), **Then** the table sorts by that column in ascending order, and clicking again sorts in descending order
7. **Given** I am viewing the user table, **When** I change the page size selector, **Then** the table displays the selected number of users per page (options: 10, 25, 50, 100)
8. **Given** I am an administrator viewing the user table, **When** the table loads, **Then** my own user record is visually highlighted or marked to indicate it's the current user
9. **Given** I am viewing the user table, **When** I see date fields (registration date, last login), **Then** all dates are displayed in my browser's local timezone in dd.mm.yyyy HH:ii format

---

### User Story 2 - Toggle User Admin Status (Priority: P2)

As an administrator, I need to grant or revoke admin privileges for other users so that I can manage who has administrative access to the system, while being protected from accidentally removing my own admin access.

**Why this priority**: After viewing users (P1), the ability to modify admin privileges is the next most critical capability for user management. This enables proper access control and delegation of administrative responsibilities.

**Independent Test**: On the user management page, locate a user who is not the current administrator. Click the admin toggle button for that user. Verify a success notification appears, the user's admin status updates in the table, and within 5 seconds the change is reflected in the user's active session. Attempt to toggle the current admin's own status and verify it's prevented with appropriate feedback.

**Acceptance Scenarios**:

1. **Given** I am viewing a non-admin user in the table who is not myself, **When** I click the toggle admin button, **Then** the user's admin status changes to admin, I see a success toast notification, and the change is reflected in the table immediately
2. **Given** I am viewing an admin user in the table who is not myself, **When** I click the toggle admin button, **Then** the user's admin status changes to non-admin, I see a success toast notification, and the change is reflected in the table immediately
3. **Given** I have toggled a user's admin status, **When** that user is currently logged in, **Then** their session updates to reflect the new admin status within 5 seconds without requiring them to log out and back in
4. **Given** I am viewing my own user record in the table, **When** I look at the admin toggle button, **Then** it is disabled or hidden to prevent me from modifying my own admin status
5. **Given** I attempt to modify my own admin status via direct manipulation (API call, etc.), **When** the system processes the request, **Then** it rejects the request with an error indicating self-modification is not allowed
6. **Given** I have toggled a user's admin status, **When** the system processes the change, **Then** an audit log entry is created recording who made the change, which user was affected, what the change was, and when it occurred

---

### User Story 3 - Delete Users with Cascade (Priority: P3)

As an administrator, I need to permanently delete user accounts along with all their associated data so that I can remove inactive, fraudulent, or requested-to-be-deleted accounts while maintaining data integrity and being protected from accidentally deleting my own account.

**Why this priority**: User deletion is less frequently needed than viewing (P1) or modifying access (P2), making it the lowest priority. It's still valuable for account lifecycle management and compliance requirements.

**Independent Test**: On the user management page, locate a user who is not the current administrator. Click the delete button, confirm the deletion in the dialog. Verify a success notification shows summary of deleted records (user + related data counts), the user is removed from the table, and all related data (fasting entries, settings, tokens, logs) is deleted atomically. Attempt to delete the current admin's own account and verify it's prevented.

**Acceptance Scenarios**:

1. **Given** I am viewing a user in the table who is not myself, **When** I click the delete button, **Then** a confirmation dialog appears asking me to confirm the permanent deletion
2. **Given** I have clicked delete and see the confirmation dialog, **When** I confirm the deletion, **Then** the system deletes the user record and all associated data (fasting entries, user settings, password reset tokens, security logs) in a single atomic transaction
3. **Given** a user deletion transaction is in progress, **When** any part of the deletion fails (database error, network issue), **Then** the entire transaction rolls back and no data is deleted, preserving data integrity
4. **Given** I have successfully deleted a user, **When** the deletion completes, **Then** I see a toast notification showing a summary of what was deleted (e.g., "Deleted user and 47 fasting entries, 2 tokens, 15 security logs")
5. **Given** I see an error during user deletion, **When** the toast notification appears, **Then** it includes a "Retry" button allowing me to attempt the deletion again
6. **Given** I am viewing my own user record in the table, **When** I look at the delete button, **Then** it is disabled or hidden to prevent me from deleting my own account
7. **Given** I attempt to delete my own account via direct manipulation (API call, etc.), **When** the system processes the request, **Then** it rejects the request with an error indicating self-deletion is not allowed
8. **Given** I have deleted a user, **When** the system processes the deletion, **Then** an audit log entry is created recording who performed the deletion, which user was deleted, what data was removed, and when it occurred

---

### Edge Cases

- **What happens when the only admin user is viewing their own record?** The toggle and delete buttons are disabled/hidden for self, but the user can still view the table and manage other users.

- **What happens when filtering/sorting results in zero users?** Display an empty state message: "No users found matching your filters" with option to clear filters.

- **What happens when a user is deleted while another admin is viewing them?** The user disappears from the table on the next refresh/filter/sort action, or via real-time update if websockets are available (assume polling/manual refresh for MVP).

- **What happens if a user's session update fails during admin toggle?** The database change succeeds (admin status is updated), but the user may need to log out/in to see the change. System logs the session update failure for investigation.

- **What happens when pagination page number exceeds available pages (e.g., user is on page 10, filters reduce results to 2 pages)?** Automatically navigate to the last available page (page 2 in this example).

- **What happens when sorting by last login for users who have never logged in?** Users with null/empty last login values appear at the end when sorting ascending, or at the beginning when sorting descending (consistent null handling).

- **What happens during concurrent admin privilege changes?** Last write wins - if two admins modify the same user simultaneously, the most recent change is retained. Audit log captures both changes with timestamps.

- **What happens when cascade deletion encounters very large data sets (e.g., user with 10,000+ fasting entries)?** Transaction may take longer but must complete within a reasonable timeout (e.g., 30 seconds). If timeout occurs, transaction rolls back and user receives error with retry option.

## Requirements *(mandatory)*

### Functional Requirements

**Display Requirements:**

- **FR-001**: System MUST display all registered users in a table format with columns for name, email, registration date, last login, admin status, and available actions
- **FR-002**: System MUST display all date and time values in the administrator's browser local timezone
- **FR-003**: System MUST format all dates as dd.mm.yyyy HH:ii (e.g., "22.10.2025 14:30")
- **FR-004**: System MUST visually distinguish the currently logged-in administrator's own user record in the table (e.g., highlighted row, badge, or icon)
- **FR-005**: System MUST display user table with server-side pagination defaulting to 25 users per page
- **FR-006**: System MUST provide page size selector with options: 10, 25, 50, 100 users per page
- **FR-007**: System MUST provide pagination controls (first, previous, page numbers, next, last) to navigate between pages
- **FR-008**: System MUST display current page information (e.g., "Showing 26-50 of 147 users")
- **FR-009**: System MUST load and display the user table within 2 seconds for databases containing up to 1000 users

**Filtering Requirements:**

- **FR-010**: System MUST provide a text filter field for user names that searches case-insensitively for partial matches
- **FR-011**: System MUST provide a text filter field for email addresses that searches case-insensitively for partial matches
- **FR-012**: System MUST provide a dropdown filter for admin status with options: "All", "Admin", "Non-Admin"
- **FR-013**: System MUST apply filters on the server side to maintain performance with large datasets
- **FR-014**: System MUST allow multiple filters to be active simultaneously (name + email + admin status)
- **FR-015**: System MUST update filter results within 1 second of user input (with debouncing to reduce server load)

**Sorting Requirements:**

- **FR-016**: System MUST allow sorting by name, email, registration date, last login, and admin status
- **FR-017**: System MUST support both ascending and descending sort order for each sortable column
- **FR-018**: System MUST indicate current sort column and direction visually (e.g., arrow icon in column header)
- **FR-019**: System MUST toggle sort direction when clicking an already-sorted column header
- **FR-020**: System MUST perform sorting on the server side to maintain performance with large datasets

**Admin Toggle Requirements:**

- **FR-021**: System MUST provide a toggle control in each user row to change admin status
- **FR-022**: System MUST disable or hide the admin toggle control for the currently logged-in administrator's own record
- **FR-023**: System MUST complete admin status toggle operation within 1 second
- **FR-024**: System MUST update the table immediately after successful admin toggle to reflect the new status
- **FR-025**: System MUST display a success notification when admin status is successfully toggled
- **FR-026**: System MUST propagate admin status changes to the affected user's active session within 5 seconds
- **FR-027**: System MUST prevent administrators from modifying their own admin status via server-side validation (return error if attempted)

**Delete User Requirements:**

- **FR-028**: System MUST provide a delete button in each user row
- **FR-029**: System MUST disable or hide the delete button for the currently logged-in administrator's own record
- **FR-030**: System MUST display a confirmation dialog before proceeding with user deletion
- **FR-031**: System MUST delete user and all related data (fasting entries, user settings, password reset tokens, security logs) in a single atomic transaction
- **FR-032**: System MUST roll back the entire deletion transaction if any part fails, ensuring no partial deletions occur
- **FR-033**: System MUST display a success notification showing summary of deleted records (user + counts of related data types) after successful deletion
- **FR-034**: System MUST remove the deleted user from the table immediately after successful deletion
- **FR-035**: System MUST prevent administrators from deleting their own account via server-side validation (return error if attempted)

**Notification Requirements:**

- **FR-036**: System MUST display non-blocking toast notifications for success and error feedback
- **FR-037**: System MUST auto-dismiss success notifications after 5 seconds
- **FR-038**: System MUST keep error notifications visible until manually dismissed by user
- **FR-039**: System MUST provide a "Retry" button in error notifications for failed delete operations
- **FR-040**: System MUST announce notifications to screen readers for accessibility

**Security & Audit Requirements:**

- **FR-041**: System MUST restrict access to user management functionality to users with admin privileges only
- **FR-042**: System MUST create audit log entries for all admin status changes recording: who made the change, which user was affected, old and new values, timestamp
- **FR-043**: System MUST create audit log entries for all user deletions recording: who performed deletion, which user was deleted, what data was removed, timestamp
- **FR-044**: System MUST validate all operations server-side and reject invalid requests with appropriate error codes (e.g., 403 for self-modification attempts)

**Performance & Accessibility Requirements:**

- **FR-045**: System MUST meet WCAG 2.1 AA accessibility standards for all user management interface elements
- **FR-046**: System MUST support full keyboard navigation (Tab, Enter, Space, Escape) for all interactive controls
- **FR-047**: System MUST provide appropriate ARIA labels and roles for screen reader compatibility
- **FR-048**: System MUST display correctly and be fully functional on mobile devices (responsive design)

### Key Entities

- **User**: Represents a registered account in the system. Key attributes: unique identifier, name, email address, admin status flag, registration date, last login timestamp. Users can have admin privileges which grant access to user management functionality.

- **Fasting Entry**: Represents a fasting session tracked by a user. Related to User - each entry belongs to one user. When a user is deleted, all their fasting entries must be deleted.

- **User Settings**: Represents user-specific preferences and configurations. Related to User - each settings record belongs to one user. When a user is deleted, their settings must be deleted.

- **Password Reset Token**: Represents a temporary token for password reset functionality. Related to User - each token belongs to one user. When a user is deleted, all their tokens must be deleted.

- **Security Log**: Represents security-related events and audit trail. Related to User - each log entry may reference a user. When a user is deleted, logs referencing that user must be deleted or anonymized.

- **Audit Log**: Represents administrative actions for compliance and investigation. Records who did what, when, and to whom. Created for admin status changes and user deletions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view the complete user list within 2 seconds for databases with up to 1000 users
- **SC-002**: Administrators can locate a specific user using filters within 3 actions (enter name/email, select admin status, or use pagination)
- **SC-003**: Admin status toggle operations complete within 1 second from button click to confirmation notification
- **SC-004**: User sessions reflect admin status changes within 5 seconds without requiring logout/login
- **SC-005**: User deletion operations complete atomically - either all data is deleted or none (100% transaction integrity)
- **SC-006**: 100% of user deletions include correct summary showing counts of all deleted data types
- **SC-007**: Zero incidents of administrators accidentally modifying or deleting their own accounts (self-action prevention working correctly)
- **SC-008**: Interface achieves Lighthouse accessibility score of 90 or higher
- **SC-009**: All interactive elements are fully operable via keyboard navigation without mouse requirement
- **SC-010**: User management interface displays correctly and remains fully functional on screen widths from 320px (mobile) to 1920px+ (desktop)
- **SC-011**: 100% of administrative actions (toggles, deletes) are recorded in audit logs with complete information (who, what, when, outcome)

## Assumptions

1. **Authentication**: Assumes existing authentication system (NextAuth.js) is already implemented and working
2. **Admin Middleware**: Assumes existing middleware or guard to restrict admin routes/pages to users with admin privileges
3. **Database Performance**: Assumes database supports efficient querying with proper indexing on name, email, registration date, last login, and admin status fields
4. **Transaction Support**: Assumes database supports atomic transactions for cascade deletion (MongoDB with replica set or equivalent)
5. **User Model**: Assumes existing User model/schema in database with fields: id, name, email, isAdmin, createdAt (registration), lastLogin
6. **Related Collections**: Assumes related data collections (fasting entries, settings, tokens, logs) exist with userId foreign key references
7. **Session Management**: Assumes NextAuth.js session management allows programmatic session updates/refresh
8. **Browser Compatibility**: Assumes modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge) with JavaScript enabled
9. **Timezone Handling**: Assumes JavaScript Date/Intl APIs are available for timezone conversion in browser
10. **Default Page Size**: 25 users per page chosen as reasonable balance between usability (not too many to scan) and performance (fewer API calls)
11. **Filter Debouncing**: Text filter inputs will debounce at 300ms to reduce server load while maintaining responsive feel
12. **Toast Notifications**: Custom notification system (no external library) will use fixed position, stack multiple notifications, and support screen reader announcements
13. **Mobile Touch Targets**: All interactive elements (buttons, toggles, links) will meet 44x44px minimum touch target size for mobile accessibility
14. **Error Recovery**: Retry button for failed deletes assumes transient errors (network, temporary DB issues) - does not handle permanent failures like authorization changes

