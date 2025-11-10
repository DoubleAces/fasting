# Feature Specification: Admin Achievement Management UI

**Feature Branch**: `035-admin-achievement-management`  
**Created**: November 9, 2025  
**Status**: Draft  
**Input**: User description: "Create a comprehensive admin UI for managing the achievement system, allowing administrators to create, edit, activate/deactivate, and delete achievements without touching the database directly."

## Clarifications

### Session 2025-11-09

- Q: What level of detail should the Admin Audit Log capture for each achievement management action? → A: Standard - Action details + IP address + user agent + before/after values for edits
- Q: Should the admin achievement management API endpoints have rate limiting, and if so, what threshold? → A: Moderate - 100 requests per minute per admin user
- Q: What is the retention policy for Admin Audit Log records? → A: 90 days in database, then archive to cold storage, delete after 2 years
- Q: What security measures should be applied to the CSV import functionality for translations? → A: Basic - File size limit (5MB), format validation, row count limit (500), schema validation
- Q: How should the Analytics page handle potentially expensive aggregation queries? → A: Real-time calculation on page load (accepting potential slowness with large datasets)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Views Achievement List (Priority: P1)

An administrator navigates to the achievement management section and sees a searchable, filterable list of all achievements in the system with key information and status indicators, allowing them to quickly understand the current achievement landscape.

**Why this priority**: This is the foundation - administrators need to see what achievements exist before they can manage them. Without a list view, no other management functions are accessible or useful.

**Independent Test**: An admin user can access `/admin/achievements`, see a paginated list of all 81+ achievements with their status (active/inactive), category, tier, and unlock statistics. They can search by name, filter by status/category/tier, and sort by different columns.

**Acceptance Scenarios**:

1. **Given** an admin user is logged in, **When** they navigate to `/admin/achievements`, **Then** they see a list of all achievements with name, status badge, category, tier icon, and unlock count
2. **Given** an admin views the achievement list, **When** they type in the search box, **Then** the list filters in real-time to show only achievements matching the search term in name or description
3. **Given** an admin views the achievement list, **When** they select a filter (status: active/inactive, category, or tier), **Then** only achievements matching that filter are displayed
4. **Given** the achievement list has more than 20 items, **When** an admin views the page, **Then** they see pagination controls and can navigate between pages
5. **Given** an admin views the achievement list, **When** they click a column header (name, unlock count), **Then** the list sorts by that column in ascending/descending order
6. **Given** an admin views an achievement row, **When** they see the unlock statistics, **Then** they see the number of users who have unlocked that achievement and the percentage of total users

---

### User Story 2 - Admin Creates New Achievement (Priority: P1)

An administrator creates a new achievement by filling out a comprehensive form with all required information including multilingual content, criteria configuration, and metadata, ensuring the achievement integrates properly with the existing unlock system.

**Why this priority**: [Explain the value and why it has this priority level]

**Why this priority**: Creating new achievements is core functionality - this is why the admin UI exists. Without this, administrators cannot expand the gamification system.

**Independent Test**: [Describe how this can be tested independently]

**Independent Test**: An admin user can click "Create Achievement" button, fill out a multi-step form with English content (name, description, short description), select category and tier, set points value, configure unlock criteria with dynamic parameter fields based on type, optionally add Spanish translations, and save to create a functional achievement that can be unlocked by users.

**Acceptance Scenarios**:

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

1. **Given** an admin views the achievement list, **When** they click "Create Achievement" button, **Then** they see a multi-step creation form with tabs or sections for Content, Criteria, Metadata, and Settings

2. **Given** an admin is on the Content step, **When** they fill in English name, description, and short description fields, **Then** these fields are validated as required and show error messages if left blank---

3. **Given** an admin completes English content, **When** they click "Add Spanish Translation", **Then** they see additional input fields for Spanish name, description, and short description

4. **Given** an admin is on the Criteria step, **When** they select a criteria type (duration, streak, goal, entry-count), **Then** the form dynamically shows relevant parameter fields (e.g., "hours" for duration, "days" for streak)### User Story 3 - [Brief Title] (Priority: P3)

5. **Given** an admin is on the Metadata step, **When** they select category, tier, and enter points value and display order, **Then** these values are validated (points > 0, display order >= 0)

6. **Given** an admin is on the Settings step, **When** they toggle "Active" and "Secret" switches and optionally set release date, **Then** these settings are reflected in the preview[Describe this user journey in plain language]

7. **Given** an admin has filled all required fields, **When** they click "Create Achievement", **Then** the system validates the achievementId is unique and creates the achievement with isActive set according to the Active toggle

8. **Given** an admin creates an achievement with duplicate achievementId, **When** they submit the form, **Then** they see an error message "Achievement ID already exists" and can modify it**Why this priority**: [Explain the value and why it has this priority level]

9. **Given** an admin creates an achievement successfully, **When** the achievement is saved, **Then** they are redirected to the achievement list with a success toast notification

**Independent Test**: [Describe how this can be tested independently]

---

**Acceptance Scenarios**:

### User Story 3 - Admin Edits Existing Achievement (Priority: P1)

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

An administrator modifies an existing achievement's content, criteria, or settings to correct errors, update descriptions, adjust unlock requirements, or add new language translations without disrupting users who have already unlocked it.

---

**Why this priority**: Achievements need maintenance - fixing typos, clarifying descriptions, or adjusting criteria parameters is essential for quality. This is core CRUD functionality alongside creation.

[Add more user stories as needed, each with an assigned priority]

**Independent Test**: An admin user can click "Edit" on any achievement in the list, see the same multi-step form pre-populated with current values, modify any field (add Spanish translation, change points from 25 to 30, adjust criteria parameters), save changes, and see the updated achievement in the list with a "Last Updated" timestamp.

### Edge Cases

**Acceptance Scenarios**:

<!--

1. **Given** an admin views an achievement in the list, **When** they click the "Edit" action button, **Then** they see the edit form pre-populated with all current values from the database  ACTION REQUIRED: The content in this section represents placeholders.

2. **Given** an admin edits an achievement, **When** they modify the English description, **Then** the changes are reflected in the real-time preview panel  Fill them out with the right edge cases.

3. **Given** an achievement has only English content, **When** an admin clicks "Add Spanish Translation" in edit mode, **Then** they see empty Spanish input fields and can add new translations-->

4. **Given** an admin modifies criteria parameters (e.g., changing streak from 7 days to 10 days), **When** they save, **Then** the achievement criteria is updated without affecting existing UserAchievement records (already unlocked achievements remain unlocked)

5. **Given** an admin changes the points value from 25 to 30, **When** they save, **Then** new unlocks will award 30 points but existing unlocks are not recalculated (note: this is edge case behavior to document)- What happens when [boundary condition]?

6. **Given** an admin edits an active achievement, **When** they toggle it to inactive (draft), **Then** users no longer see this achievement on the public achievements page but unlocked records are preserved- How does system handle [error scenario]?

7. **Given** an admin saves changes successfully, **When** the form submits, **Then** they see a success toast "Achievement updated successfully" and return to the list view

## Requirements *(mandatory)*

---

<!--

### User Story 4 - Admin Activates/Deactivates Achievements (Priority: P2)  ACTION REQUIRED: The content in this section represents placeholders.

  Fill them out with the right functional requirements.

An administrator quickly activates or deactivates achievements without editing the full form, allowing them to control which achievements are visible to users and evaluating for unlock, useful for seasonal achievements, beta testing new achievements, or temporarily removing problematic achievements.-->



**Why this priority**: This is important for operational control but less critical than basic CRUD. Administrators can achieve the same result through the edit form, but bulk operations and quick toggles improve efficiency significantly.### Functional Requirements



**Independent Test**: An admin user can click a toggle switch on an achievement row to immediately change its active status from true to false (or vice versa), see the status badge update instantly, and have that change reflected in the public achievements page where users can no longer see inactive achievements.- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]

- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  

**Acceptance Scenarios**:- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]

- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]

1. **Given** an admin views an active achievement in the list, **When** they click the status toggle switch, **Then** the achievement's isActive flag changes to false and the status badge shows "Inactive"
2. **Given** an admin deactivates an achievement, **When** they refresh the page, **Then** the achievement shows as inactive and is no longer evaluated during entry saves
3. **Given** an admin views the achievement list with checkboxes selected, **When** they select multiple achievement rows and click "Activate All" bulk action, **Then** all selected achievements become active and show success message with count
4. **Given** an admin views the achievement list, **When** they select multiple active achievements and click "Deactivate All" bulk action, **Then** all selected achievements become inactive
5. **Given** an achievement has been unlocked by users, **When** an admin deactivates it, **Then** existing UserAchievement records are preserved (users keep their unlocks) but new users cannot unlock it
6. **Given** an admin reactivates a previously deactivated achievement, **When** users meet the unlock criteria after reactivation, **Then** they can unlock it normally

---

### User Story 5 - Admin Views Translation Management (Priority: P2)

An administrator accesses a dedicated translation management tool to view all achievements with missing translations for specific languages, quickly identify gaps in multilingual support, and add missing translations in bulk to improve the experience for non-English speaking users.

**Why this priority**: Translation management is valuable for international users but not blocking for core functionality. Most deployments start with English-only content and add translations incrementally.

**Independent Test**: An admin user can navigate to "Translation Manager" from the achievements page, select a target language (Spanish, French, German, Arabic), see a list of all achievements missing translations for that language with their English content visible for reference, click "Add Translation" inline, fill in the missing fields, and save to update that achievement's translations.

**Acceptance Scenarios**:

1. **Given** an admin navigates to the translation manager, **When** they view the page, **Then** they see a language selector dropdown with available languages (English, Spanish, French, German, Arabic)
2. **Given** an admin selects Spanish language, **When** the filter applies, **Then** they see only achievements that are missing Spanish translations (where translations.es is incomplete or missing)
3. **Given** an achievement is missing Spanish translation, **When** an admin views it in the translation manager, **Then** they see the English content (name, description) as reference and empty Spanish input fields
4. **Given** an admin adds Spanish translations inline, **When** they click "Save Translation", **Then** the achievement's translations.es object is updated and the achievement is removed from the missing translations list
5. **Given** an admin wants to export for external translation, **When** they click "Export to CSV", **Then** they download a CSV file with achievementId, English content, and empty columns for the selected language
6. **Given** an admin has a completed CSV file, **When** they click "Import from CSV" and upload the file, **Then** the system validates CSV format (file size ≤5MB, ≤500 rows, valid schema) and bulk updates translations for matching achievementIds
7. **Given** an admin uploads an invalid CSV file, **When** validation fails, **Then** they see specific error messages (file too large, invalid format, missing columns, malformed data)


---

### User Story 6 - Admin Views Achievement Analytics (Priority: P3)

An administrator views aggregate analytics showing achievement popularity, unlock rates, tier distribution, and user engagement metrics to understand which achievements are engaging users and which may need adjustment or promotion.

**Why this priority**: Analytics provide valuable insights but are not essential for day-to-day achievement management. Administrators can make decisions based on manual observation initially, and analytics can be added after core CRUD functionality is solid.

**Independent Test**: An admin user can navigate to "Analytics" tab on the achievements page, see aggregate statistics (total achievements, most popular achievement with highest unlock rate, rarest achievement with lowest unlock rate), view a chart showing unlock trends over time, and see a table of all achievements ranked by unlock percentage.

**Acceptance Scenarios**:

1. **Given** an admin navigates to the analytics section, **When** they view the page, **Then** they see summary cards showing total achievements created, total active achievements, most popular achievement (highest unlock rate), and rarest achievement (lowest unlock rate)
2. **Given** an admin views achievement analytics, **When** they see the most popular achievement, **Then** they see the achievement name, unlock rate percentage (e.g., "85% of users"), and total unlock count
3. **Given** an admin views the analytics page, **When** they scroll down, **Then** they see a sortable table of all achievements ranked by unlock percentage with columns: Achievement Name, Category, Unlock Count, Unlock Percentage, Average Days to Unlock
4. **Given** analytics calculations are expensive with large datasets, **When** an admin loads the analytics page, **Then** statistics are calculated in real-time on page load (accepting potential slowness)
5. **Given** an admin views an achievement's detailed analytics, **When** they click on an achievement in the table, **Then** they see a modal with unlock timeline graph showing when users unlocked it over time
6. **Given** an admin wants to identify unused achievements, **When** they sort by unlock count ascending, **Then** they see achievements that no users have unlocked at the top of the list

---

### User Story 7 - Admin Deletes Achievement (Priority: P3)

An administrator removes an achievement that is obsolete, incorrect, or no longer needed, with appropriate warnings about impact on user progress and confirmation dialogs to prevent accidental deletion of important achievements.

**Why this priority**: Deletion is important for data hygiene but less critical than creation and editing. Most teams prefer soft deletion (marking inactive) over hard deletion, and accidental deletion risks are high, so this should come after core features are battle-tested.

**Independent Test**: An admin user can click "Delete" action on an achievement row, see a warning dialog explaining that X users have unlocked this achievement and asking for confirmation, confirm deletion, and see the achievement removed from the database along with all associated UserAchievement unlock records (hard delete with cascade).

**Acceptance Scenarios**:

1. **Given** an admin views an achievement in the list, **When** they click the "Delete" action button, **Then** they see a confirmation modal with warning message about deletion consequences
2. **Given** an achievement has been unlocked by users, **When** an admin attempts to delete it, **Then** the warning modal shows "Warning: 47 users have unlocked this achievement. Deletion will remove their unlock records and recalculate their points."
3. **Given** an admin confirms deletion, **When** they click "Yes, Delete Achievement", **Then** the achievement document is removed from the Achievement collection
4. **Given** an achievement is deleted, **When** the deletion completes, **Then** all related UserAchievement records are also deleted and affected users' achievementPoints totals are recalculated
5. **Given** an achievement is deleted, **When** an admin views the achievement list, **Then** the deleted achievement no longer appears and they see a success toast "Achievement deleted successfully"
6. **Given** an achievement is deleted, **When** users view the public achievements page, **Then** they no longer see the deleted achievement (even if they previously unlocked it)

---

### Edge Cases

- **What happens when an admin creates an achievement with invalid criteria parameters?** The form validates criteria configuration and shows specific error messages (e.g., "Hours must be positive number", "Days must be at least 1").
- **How does the system handle concurrent edits by multiple admins?** Last write wins - the system does not lock achievements during editing. The most recent save overwrites previous changes. Future enhancement could add optimistic locking with version checking.
- **What happens when an admin uploads a badge image larger than 5MB?** The upload is rejected with error message "File too large. Maximum size is 5MB. Please compress your image."
- **How does the system handle achievements with missing English translations?** English is required - the form will not allow saving without at least English name and description. Error message: "English translation is required."
- **What happens when an admin tries to edit an achievement that was just deleted by another admin?** The edit form shows error "Achievement not found - it may have been deleted" and redirects to the list view.
- **How does the system handle changing criteria from one type to another (e.g., duration to streak)?** When criteria type changes, the params object is cleared and admin must reconfigure parameters for the new type. A warning modal confirms the change: "Changing criteria type will reset parameters. Continue?"
- **What happens when an admin deactivates an achievement that is part of an ongoing evaluation?** The achievement evaluation logic checks isActive flag before awarding unlocks, so deactivation takes effect immediately on the next entry save.
- **What happens when API rate limit is exceeded?** Admin receives 429 Too Many Requests response with Retry-After header indicating when they can retry (100 requests per minute limit).

## Requirements *(mandatory)*

### Functional Requirements

**Achievement List View**:
- **FR-001**: System MUST display a paginated list of all achievements with columns: Name, Status Badge (Active/Inactive), Category, Tier Icon, Points, Unlock Count (X users), Actions
- **FR-002**: System MUST provide real-time search functionality that filters achievements by name or description as the admin types
- **FR-003**: System MUST provide filter dropdowns for Status (All/Active/Inactive), Category (all 8 categories), and Tier (Bronze/Silver/Gold/Platinum/Diamond)
- **FR-004**: System MUST support column sorting (ascending/descending) for Name, Points, and Unlock Count columns
- **FR-005**: System MUST display 20 achievements per page with pagination controls showing current page, total pages, and Previous/Next buttons
- **FR-006**: System MUST show unlock statistics for each achievement (number of users unlocked and percentage of total users)

**Achievement Creation**:
- **FR-007**: System MUST provide "Create Achievement" button that opens a multi-step form with sections: Content, Criteria, Metadata, Settings
- **FR-008**: System MUST require achievementId (auto-generated from name as lowercase slug), English name, English description, and English shortDescription as mandatory fields
- **FR-009**: System MUST validate achievementId is unique across all achievements before allowing save
- **FR-010**: System MUST provide language tabs or expandable sections for adding optional translations (Spanish, French, German, Portuguese) with same fields (name, description, shortDescription)
- **FR-011**: System MUST provide criteria type selector with options: duration-milestone, streak, goal-completion, entry-count, weight-milestone, custom
- **FR-012**: System MUST dynamically render criteria parameter fields based on selected type (e.g., "hours" number input for duration, "days" number input for streak)
- **FR-013**: System MUST validate criteria parameters are positive numbers with appropriate ranges (hours >= 0.5, days >= 1, count >= 1)
- **FR-014**: System MUST provide category dropdown with 8 options (getting-started, duration, streak, goal, weight, consistency, special, knowledge)
- **FR-015**: System MUST provide tier dropdown with 5 options (bronze, silver, gold, platinum, diamond) with visual indicators (colors or icons)
- **FR-016**: System MUST validate points value is positive integer between 1 and 1000
- **FR-017**: System MUST provide display order number input for controlling achievement sort order within categories
- **FR-018**: System MUST provide Active toggle (default: ON) and Secret toggle (default: OFF) in settings section
- **FR-019**: System MUST provide optional Release Date picker for scheduling achievement activation
- **FR-020**: System MUST show real-time preview of achievement card as admin fills out the form, displaying name, description, tier badge, and points
- **FR-021**: System MUST save achievement with all provided translations, criteria, metadata, and settings when form is valid
- **FR-022**: System MUST show success toast "Achievement created successfully" and redirect to achievement list after successful creation

**Achievement Editing**:
- **FR-023**: System MUST provide "Edit" action button on each achievement row that opens edit form
- **FR-024**: System MUST pre-populate edit form with all current values from the achievement document
- **FR-025**: System MUST allow modifying any field except achievementId (which is immutable after creation)
- **FR-026**: System MUST save changes to the existing achievement document without creating a new record
- **FR-027**: System MUST update the updatedAt timestamp automatically when changes are saved
- **FR-028**: System MUST show success toast "Achievement updated successfully" after successful edit

**Achievement Activation/Deactivation**:
- **FR-029**: System MUST provide quick toggle switch on each achievement row to change isActive status
- **FR-030**: System MUST update status badge immediately when toggle is clicked (optimistic UI update)
- **FR-031**: System MUST persist isActive change to database and revert UI if save fails
- **FR-032**: System MUST provide checkbox selection on each achievement row for bulk operations
- **FR-033**: System MUST show bulk action toolbar when one or more achievements are selected
- **FR-034**: System MUST provide "Activate All" and "Deactivate All" bulk action buttons in toolbar
- **FR-035**: System MUST execute bulk activate/deactivate on all selected achievements and show success message with count (e.g., "5 achievements activated")

**Translation Management**:
- **FR-036**: System MUST provide "Translation Manager" link or tab accessible from main achievements page
- **FR-037**: System MUST display language selector dropdown with available languages (English, Spanish, French, German, Portuguese)
- **FR-038**: System MUST filter and show only achievements missing translations for selected language
- **FR-039**: System MUST display English content as reference alongside empty translation input fields
- **FR-040**: System MUST allow inline editing of missing translations with Save button per achievement
- **FR-041**: System MUST provide "Export to CSV" functionality that generates downloadable CSV with achievementId, English content, and empty target language columns
- **FR-042**: System MUST provide "Import from CSV" functionality with file upload that validates CSV format and updates translations for matching achievementIds
- **FR-043**: System MUST validate CSV imports with file size limit (5MB), row count limit (500), format validation, and schema validation
- **FR-044**: System MUST show validation errors for CSV import (file too large, missing required columns, invalid achievementIds, malformed data)

**Achievement Analytics**:
- **FR-045**: System MUST display aggregate statistics cards: Total Achievements, Total Active, Most Popular (name + unlock %), Rarest (name + unlock %)
- **FR-046**: System MUST calculate unlock percentage as (UserAchievement count for achievementId / total User count) * 100
- **FR-047**: System MUST calculate all analytics statistics in real-time on page load
- **FR-048**: System MUST display sortable table of all achievements with columns: Name, Category, Unlock Count, Unlock %, Avg Days to Unlock
- **FR-049**: System MUST provide detailed analytics modal when clicking on an achievement in the analytics table
- **FR-050**: System MUST show unlock timeline chart in analytics modal displaying unlock events over time

**Achievement Deletion**:
- **FR-051**: System MUST provide "Delete" action button (with warning icon) on each achievement row
- **FR-052**: System MUST show confirmation modal when delete is clicked with warning message about consequences
- **FR-053**: System MUST display number of users who have unlocked the achievement in the warning modal
- **FR-054**: System MUST require explicit confirmation (typing achievement name or clicking "Yes, Delete") before executing deletion
- **FR-055**: System MUST hard delete the achievement document from Achievement collection when confirmed
- **FR-056**: System MUST cascade delete all related UserAchievement records when achievement is deleted
- **FR-057**: System MUST recalculate and update achievementPoints totals for all affected users after deletion
- **FR-058**: System MUST show success toast "Achievement deleted successfully" after deletion completes

**Security & Rate Limiting**:
- **FR-059**: System MUST restrict access to all admin achievement management pages to users with isAdmin: true flag
- **FR-060**: System MUST show "Access Denied" page with 403 status for non-admin users attempting to access achievement admin pages
- **FR-061**: System MUST enforce rate limiting of 100 requests per minute per admin user on all admin achievement API endpoints
- **FR-062**: System MUST return 429 Too Many Requests response with Retry-After header when rate limit is exceeded

**Audit Logging**:
- **FR-063**: System MUST log all achievement management actions (create, edit, delete, activate, deactivate, bulk operations) to Admin Audit Log
- **FR-064**: System MUST capture in audit log: action type, admin ID, achievement ID, timestamp, IP address, user agent, and before/after values for edits
- **FR-065**: System MUST retain audit logs for 90 days in database, then archive to cold storage, and delete after 2 years total retention

**General Requirements**:
- **FR-066**: System MUST follow existing glassmorphic design system with purple-pink gradients consistent with the rest of the admin area
- **FR-067**: System MUST be fully responsive and usable on desktop browsers (minimum 1024px width)
- **FR-068**: System MUST validate all form inputs client-side before submission with specific error messages
- **FR-069**: System MUST validate all form inputs server-side on API endpoints with error responses
- **FR-070**: System MUST handle API errors gracefully with user-friendly toast messages and fallback to list view

### Key Entities

**Achievement** (existing model from Feature 028):
- achievementId: Unique string slug (e.g., "sweet-sixteen")
- translations: Object with language keys (en, es, fr, de, pt) containing name, description, shortDescription
- badgeImage: Object with locked/unlocked URLs (optional, for future badge uploads)
- icon: Emoji string (optional)
- iconColor: Hex color string (optional)
- category: Enum (getting-started, duration, streak, goal, weight, consistency, special, knowledge)
- points: Number (1-1000)
- tier: Enum (bronze, silver, gold, platinum, diamond)
- order: Number for display sorting
- criteria: Object with type (duration-milestone, streak, goal-completion, entry-count, weight-milestone, custom) and params (flexible object)
- isActive: Boolean (default: true)
- isSecret: Boolean (default: false)
- releaseDate: Date (optional)
- createdBy: ObjectId reference to User (admin who created it)
- createdAt: Timestamp
- updatedAt: Timestamp

**UserAchievement** (existing model from Feature 028):
- userId: ObjectId reference to User
- achievementId: String reference to Achievement.achievementId
- unlockedAt: Timestamp when unlocked
- progress: Number (0-100 for incremental achievements)
- notificationSeen: Boolean

**AdminAuditLog** (new for this feature):
- adminId: ObjectId reference to User (admin who performed action)
- action: String (create_achievement, update_achievement, delete_achievement, activate_achievement, deactivate_achievement, bulk_activate, bulk_deactivate)
- achievementId: String (affected achievement)
- changes: Object (before/after values for edits)
- timestamp: Date (indexed for retention policy queries)
- ipAddress: String
- userAgent: String
- retentionExpiry: Date (timestamp + 90 days for database retention, + 2 years for total retention)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view the complete achievement list page within 2 seconds of navigation with all 81+ achievements loaded
- **SC-002**: Administrators can create a new achievement with English content only in under 3 minutes using the form interface
- **SC-003**: Administrators can add Spanish translations to an existing achievement in under 2 minutes
- **SC-004**: Search functionality filters achievement list in real-time with results appearing within 500 milliseconds of typing
- **SC-005**: Bulk activation/deactivation operations complete for up to 50 selected achievements within 3 seconds
- **SC-006**: Form validation provides immediate feedback (within 200ms) for all input fields when admin leaves focus
- **SC-007**: Real-time achievement preview updates within 300ms when admin modifies any content field
- **SC-008**: Achievement creation or edit saves successfully within 1.5 seconds with appropriate success feedback
- **SC-009**: Analytics page calculates and displays all statistics on page load (may take 3-5 seconds with large datasets)
- **SC-010**: CSV export generates downloadable file for up to 100 achievements within 5 seconds
- **SC-011**: CSV import processes and validates up to 500 achievement translations within 10 seconds with progress indicator
- **SC-012**: All admin achievement management pages are restricted to admin users with 100% enforcement via middleware
- **SC-013**: Achievement deletion with cascade to UserAchievements completes within 5 seconds for achievements with up to 1000 unlocks
- **SC-014**: All achievement management actions are logged with complete audit trail including admin ID, timestamp, IP address, user agent, and change details
- **SC-015**: Rate limiting enforces 100 requests per minute per admin with 429 responses for exceeded limits
- **SC-016**: Audit logs are retained in database for 90 days with automated archival to cold storage before 2-year deletion

## Assumptions

- The existing Achievement and UserAchievement models (from Feature 028) are production-ready and will not require schema changes
- The admin authentication system (Feature 005) is functional and provides reliable isAdmin flag checking
- The existing glassmorphic design components from the admin area (AdminLayout, AdminSidebar, etc.) can be reused for consistency
- Badge image upload functionality is out of scope for this phase - achievements will use emoji icons only
- Achievement unlock logic (Feature 031) will continue to work with achievements created/edited through the admin UI
- The admin area is accessed at `/admin` routes (not `/dashboard`) following the migration from Feature 024
- Initial deployment will focus on English and Spanish translations only, with French, German, and Portuguese added as needed
- Soft deletion (isActive: false) is preferred over hard deletion for most operational scenarios, but hard delete is provided for incorrect achievements
- The system uses MongoDB with Mongoose for database operations with existing Achievement and UserAchievement collections
- The achievement list page will use server-side pagination with client-side filtering for performance with large datasets
- Real-time preview will be client-side only (no server rendering) to reduce API calls during form editing
- CSV import will validate but not enforce referential integrity - admins can add translations for achievements that don't exist (no-op)
- Achievement criteria validation will be schema-based only - the admin UI does not test actual unlock logic or evaluate sample data
- Cold storage for audit log archival will use existing infrastructure (cloud storage bucket or similar)
- Rate limiting will be implemented per-admin-user (not per-IP) to allow multiple admins from same office
- Analytics real-time calculation is acceptable for MVP; caching can be added later if performance degrades

## Dependencies

- **Feature 005 (Admin Area Access)**: Provides admin authentication, authorization middleware, and admin layout components
- **Feature 028 (Achievement Database Models)**: Provides Achievement and UserAchievement Mongoose models and schemas
- **Feature 029 (Achievement API Endpoints)**: Provides GET /api/user/achievements endpoint (may need new admin-specific GET /api/admin/achievements endpoint)
- **Feature 021 (Toast Notification System)**: Provides showSuccess and showError toast functions for user feedback
- **Existing MongoDB database**: Must have Achievement and UserAchievement collections with proper indexes from Feature 028
- **Next.js App Router**: Admin achievement pages will use App Router patterns consistent with existing admin pages
- **React**: Form components will use React state management and hooks
- **Tailwind CSS**: Styling will use Tailwind classes consistent with glassmorphic design system
- **Rate limiting library**: Need middleware for request rate limiting (e.g., express-rate-limit or custom implementation)
- **Cold storage solution**: Need access to cloud storage (AWS S3, Azure Blob, or similar) for audit log archival

## Out of Scope

- Badge image upload and cloud storage integration (Future: Feature 036)
- Custom badge designer or image editor (achievements use emoji icons only in this phase)
- Achievement versioning or revision history (audit log tracks changes but doesn't allow rollback)
- Real-time collaborative editing with conflict resolution (last write wins)
- Achievement preview in actual user interface (preview is stylized card only, not full achievements page view)
- Achievement template system or duplication feature (admins create from scratch each time)
- Advanced criteria builder with AND/OR logic combinations (criteria is single type with single set of parameters)
- Testing tool to simulate achievement unlocks with sample user data
- Integration with external translation services or APIs
- Automated achievement generation or AI-assisted content suggestions
- Mobile responsive design for admin UI (desktop-only, minimum 1024px width)
- Achievement scheduling system beyond simple release date (no recurring achievements or time-limited achievements)
- User-facing achievement request or suggestion system
- Integration with other gamification systems (leaderboards, badges outside achievements)
- Automated audit log archival process (manual archival acceptable for MVP)
- Analytics caching or background refresh (real-time calculation for MVP)
- CSV virus scanning (basic validation only)
