# Feature Specification: Admin Achievement Backfill

**Feature Branch**: `033-admin-achievement-backfill`  
**Created**: November 7, 2025  
**Status**: Draft  
**Input**: User description: "Add a Backfill Achievements action button next to each user in the admin user management table that triggers achievement evaluation for all existing entries"



## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backfill User Achievements (Priority: P1)

As an administrator viewing the user management table, I need a "Backfill Achievements" button next to each user so that I can retroactively unlock achievements for users whose entries existed before the achievement system was implemented, fixing the issue where qualifying achievements remain locked despite valid historical data.

**Why this priority**: This is the core feature addressing a critical data inconsistency issue. Users have reported locked achievements despite having qualifying entries. This provides administrators a simple, reliable fix without requiring command-line access or developer intervention.

**Independent Test**: Navigate to admin user management page, locate a user with historical entries but few unlocked achievements, click "Backfill Achievements" button, observe loading state, wait for completion, verify toast shows summary (e.g., "✅ Processed 127 entries, unlocked 8 achievements"), refresh achievements page for that user and confirm new achievements appear.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator viewing the user management table, **When** I look at any user row, **Then** I see a "Backfill Achievements" button in the actions column alongside existing admin toggle and delete buttons

2. **Given** I click the "Backfill Achievements" button for a user, **When** processing begins, **Then** the button displays a loading spinner and becomes disabled to prevent duplicate requests

3. **Given** the backfill operation is processing, **When** the system evaluates achievements, **Then** it retrieves all entries for that user in chronological order and calls the achievement evaluation service for each entry sequentially

4. **Given** the backfill operation completes successfully, **When** results are returned, **Then** I see a success toast notification displaying statistics like "✅ Backfilled 127 entries, unlocked 8 achievements, 15 points earned"

5. **Given** the backfill operation completes, **When** the toast displays, **Then** the button returns to its normal enabled state showing "Backfill Achievements" text

6. **Given** a user already has all qualifying achievements unlocked, **When** I click "Backfill Achievements", **Then** the system processes successfully and shows a message like "✅ Processed 50 entries, 0 new achievements (all already unlocked)"

7. **Given** the backfill operation encounters an error (network failure, database timeout, etc.), **When** the error occurs, **Then** I see an error toast with a user-friendly message like "❌ Failed to backfill achievements. Please try again." and the button returns to enabled state

8. **Given** I am viewing the user management table, **When** I look at my own user row (current admin), **Then** the "Backfill Achievements" button functions identically (no self-action restriction like delete/toggle admin)



---

### User Story 2 - Idempotent Backfill Operations (Priority: P1)

As an administrator, I need the backfill operation to be safe to run multiple times on the same user without creating duplicate achievements or breaking existing data, so that I can confidently retry failed operations or re-run backfills after users add more historical entries.

**Why this priority**: Critical for data integrity and administrator confidence. Without idempotency, administrators would risk corrupting achievement data or hesitate to use the feature. This is essential alongside the primary backfill capability.

**Independent Test**: Select a user with some unlocked achievements, run backfill operation, note the results (e.g., "unlocked 3 achievements"). Immediately run backfill again on the same user. Verify the second operation completes successfully with "0 new achievements" and no duplicate UserAchievement records in database.

**Acceptance Scenarios**:

1. **Given** I run backfill for a user who already has some achievements unlocked, **When** the system evaluates entries, **Then** it does not create duplicate UserAchievement records for achievements that are already unlocked

2. **Given** I run backfill twice in succession for the same user, **When** both operations complete, **Then** the total achievement count remains consistent and the second operation reports "0 new achievements unlocked"

3. **Given** a backfill operation partially completes (e.g., processes 50 of 100 entries then fails), **When** I retry the backfill, **Then** the system successfully processes all entries again and unlocks any achievements missed in the partial run without errors

4. **Given** a user has 15 unlocked achievements before backfill, **When** backfill evaluates and finds 3 new qualifying achievements, **Then** the user ends with exactly 18 total achievements (15 existing + 3 new) with no duplicates

---

### User Story 3 - Progress Visibility During Processing (Priority: P2)

As an administrator running a backfill operation for a user with many entries (100+), I need visual feedback that the operation is progressing so that I know the system is working and haven't triggered a timeout or freeze, especially for long-running operations.

**Why this priority**: Enhances user experience and reduces anxiety during long operations, but not critical for core functionality. The basic loading spinner in P1 provides minimum feedback; this adds polish for edge cases with high entry counts.

**Independent Test**: Identify a user with 200+ entries, click "Backfill Achievements", observe the button shows loading state throughout the operation which may take 10-30 seconds. Operation completes successfully without timeout. User can navigate away from page and operation continues in background.

**Acceptance Scenarios**:

1. **Given** I click "Backfill Achievements" for a user with 200+ entries, **When** processing begins, **Then** the button shows a loading spinner that remains visible throughout the entire operation

2. **Given** a backfill operation takes longer than 10 seconds, **When** processing continues, **Then** the button remains in loading state without timing out or reverting to normal state prematurely

3. **Given** I start a backfill operation, **When** processing is underway, **Then** I can scroll the user table, use filters, or perform other actions without canceling the backfill operation

4. **Given** I start a backfill operation and navigate to a different admin page, **When** the operation completes, **Then** I still receive the toast notification with results regardless of which page I'm viewing

- What happens when [boundary condition]?

---

### Edge Cases

- **What happens when backfilling a user with zero entries?** System should complete successfully and show "✅ Processed 0 entries, 0 achievements unlocked"

- **What happens if the user is deleted while backfill is processing?** Operation should fail gracefully with error message "User not found" rather than crashing

- **What happens if achievement evaluation service is temporarily unavailable?** Show error toast "Achievement service unavailable, please try again" and allow retry

- **What happens if multiple administrators trigger backfill for the same user simultaneously?** Both operations process independently; achievement service's duplicate handling (unique constraints) prevents duplicate unlocks

- **What happens if backfilling a user with 500+ entries?** Operation may take 30-60 seconds; ensure no API timeout limits, maintain loading state, and successfully return results

- **What happens if network connection drops mid-backfill?** Client shows connection error toast, server-side operation may continue; administrator can retry and idempotency ensures no duplicates

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST add a "Backfill Achievements" button in the actions column of each user row in the admin user management table at `/admin/users`

- **FR-002**: Button MUST be visible and enabled for all users including the current administrator (no self-action restriction applies to backfill unlike delete/toggle admin)

- **FR-003**: System MUST display a loading spinner on the button and disable it immediately when clicked to prevent duplicate requests

- **FR-004**: System MUST call a backend API endpoint that retrieves all entries for the specified user in chronological order (oldest to newest by entry date)

- **FR-005**: System MUST invoke the existing achievement evaluation service (AchievementService.evaluateAndUnlock) sequentially for each user entry

- **FR-006**: System MUST aggregate results including total entries processed, total achievements newly unlocked, and total points earned

- **FR-007**: System MUST display a success toast notification showing statistics in format "✅ Processed [N] entries, unlocked [M] achievements, [P] points earned"

- **FR-008**: When no new achievements are unlocked, system MUST display message "✅ Processed [N] entries, 0 new achievements (all already unlocked)"

- **FR-009**: System MUST return button to normal enabled state after operation completes (success or failure)

- **FR-010**: System MUST handle errors gracefully by displaying user-friendly error toast messages (e.g., "❌ Failed to backfill achievements. Please try again.") without exposing technical details

- **FR-011**: System MUST ensure backfill operations are idempotent - safe to run multiple times without creating duplicate achievement records


- **FR-012**: System MUST authenticate that the requesting user has administrator privileges before processing backfill requests

- **FR-013**: System MUST complete backfill operations for users with up to 500 entries without timing out (maximum: 60 seconds total API response time, target: <10 seconds @ 95th percentile for typical users with 50-150 entries)

- **FR-014**: System MUST log backfill operations including administrator who initiated, target user, timestamp, entries processed, and achievements unlocked

- **FR-015**: Button MUST follow existing admin action button styling patterns (consistent with AdminToggle and DeleteUserButton components)

### Key Entities

- **Backfill Request**: Represents an administrator-initiated achievement backfill operation
  - Target user identifier
  - Requesting administrator identifier  
  - Timestamp of request initiation

- **Backfill Result**: Aggregated statistics from a completed backfill operation
  - Total entries processed count
  - Newly unlocked achievements count
  - Total points earned from new achievements
  - Completion status (success/failure)
  - Error message if failed

## Success Criteria *(mandatory)*

Success is achieved when:

1. **Administrator Accessibility**: Administrators can initiate achievement backfill for any user with a single button click from the user management table without requiring command-line access or developer intervention

2. **Operation Completion**: Backfill operations successfully process all user entries (tested with users having 1-500 entries) within 60 seconds and return accurate statistics

3. **Result Visibility**: Toast notifications clearly communicate operation results with specific counts (entries processed, achievements unlocked, points earned) in 100% of backfill attempts

4. **Data Integrity**: Running backfill multiple times on the same user produces identical final achievement states with zero duplicate UserAchievement records (verified via database inspection)

5. **Error Recovery**: When backfill operations fail (simulated network errors, database unavailability), administrators receive clear error messages and can successfully retry without data corruption

6. **Access Control**: Non-administrator users attempting to access the backfill endpoint receive 403 Forbidden responses, while administrators successfully process backfills for any user including themselves

7. **User Impact**: After backfill completion, affected users see newly unlocked achievements in their achievements page without requiring logout/login or cache clearing

8. **Performance**: Backfill operations for typical users (50-150 entries) complete within 10 seconds at 95th percentile under normal system load

## Assumptions *(mandatory)*

- The existing AchievementService.evaluateAndUnlock() method is production-ready and correctly handles achievement evaluation logic (implemented in Feature 031)

- Achievement evaluation service includes idempotency mechanisms (unique constraints on UserAchievement collection preventing duplicates)

- User entries have consistent data quality (valid dates, fasting durations) as enforced by existing validation in entry creation/update endpoints

- Admin user management page at `/admin/users` exists and renders UserRow components with action buttons (implemented in Feature 006)

- Toast notification system exists and supports success/error variants with auto-dismiss behavior (implemented in Feature 021)

- Database performance allows sequential querying of 500+ entries within acceptable timeframe (existing indexes on userId + date from Feature 009)

- Administrator sessions remain valid for the duration of long-running backfill operations (typical session timeout is 30+ minutes)

- Network and server infrastructure can handle 30-60 second HTTP requests without premature timeout (configurable in deployment environment)

## Dependencies *(mandatory)*

- **Feature 006** (Admin User Management): Provides the `/admin/users` page, UserRow component structure, and existing action button patterns (AdminToggle, DeleteUserButton)

- **Feature 021** (Toast Notifications): Provides the toast notification system with success/error variants and auto-dismiss functionality

- **Feature 031** (Achievement Unlock Logic): Provides the AchievementService.evaluateAndUnlock() method that evaluates entries against achievement criteria

- **Feature 032** (Achievement Unlock API Response): Established the pattern of calling achievement evaluation from API endpoints and handling results

- **MongoDB Indexes**: Requires existing indexes on Entry collection (userId + date compound index) for efficient chronological retrieval of user entries

- **NextAuth.js**: Requires authentication middleware to verify administrator role before allowing backfill operations

## Out of Scope *(mandatory)*

- **Batch backfill for multiple users**: This feature only supports backfilling one user at a time via individual button clicks; bulk operations for all users are not included

- **Scheduled/automated backfill**: No cron jobs or automatic backfill triggers; operations are strictly admin-initiated via UI button

- **Progress bar or percentage indicators**: Loading state shows spinner only; detailed progress tracking (e.g., "Processing entry 45 of 127") is not implemented

- **Cancellation of in-progress operations**: Once backfill starts, it runs to completion; no cancel/abort functionality

- **Achievement preview before backfill**: System does not show which achievements will be unlocked before running the operation; results appear only in completion toast

- **Email notifications**: No email sent to affected users when administrator backfills their achievements

- **Detailed audit logs in UI**: Backfill operations are logged to database/server logs but not displayed in a dedicated audit log UI screen

- **Custom date range backfill**: System processes all entries for the user; cannot limit backfill to specific date ranges

- **Dry-run or preview mode**: No option to simulate backfill without actually creating UserAchievement records

- **Achievement removal/revocation**: This feature only adds missing achievements; does not remove incorrectly awarded achievements

## Technical Notes *(optional)*

### Integration with Existing Patterns

This feature follows established patterns from Feature 006 (Admin User Management):

- **Button component structure**: New BackfillAchievementsButton component mirrors DeleteUserButton and AdminToggle patterns (loading state, confirmation, toast feedback)
- **API endpoint convention**: POST /api/admin/users/[userId]/backfill-achievements follows existing /delete and /toggle-admin endpoint structure
- **Authentication**: Reuses existing admin role verification middleware from Feature 006
- **Error handling**: Implements same error response format and client-side error handling as existing admin actions

### Performance Considerations

- **Sequential processing**: Achievement evaluation runs entry-by-entry to leverage existing AchievementService interface; parallel processing not implemented to avoid complexity
- **Database queries**: Each evaluateAndUnlock() call triggers achievement definition queries; existing 1-hour cache (Feature 031) minimizes database load
- **API timeout**: Deployment configuration should allow 60+ second request timeout for edge cases with 500+ entries

### Testing Strategy

- **Unit tests**: Test BackfillAchievementsButton component in isolation with mocked API calls
- **Integration tests**: Test API endpoint with real database (MongoDB Memory Server), verify idempotency by running twice
- **Access control tests**: Verify 403 responses for non-admin users, successful execution for admin users
- **Edge case tests**: Zero entries, user not found, service unavailable, duplicate operations

## Security & Privacy *(optional)*

### Access Control

- Only authenticated users with `isAdmin: true` flag can trigger backfill operations
- API endpoint validates admin role before processing; client-side button visibility is convenience, not security boundary
- Each backfill request logs the requesting administrator's ID for audit trail

### Data Protection

- Backfill operations only read user entries and create UserAchievement records; no modification to existing user data
- Achievement data is not considered sensitive (visible to user in their account)
- No personal data (email, name, weight) is included in API responses or toast messages; only counts/statistics returned

### Abuse Prevention

- Button disabled during processing prevents client-side duplicate requests
- Idempotent design (unique constraints in database) prevents data corruption from simultaneous requests
- Server-side rate limiting could be added in future if abuse detected (not implemented in this feature)
