# Feature Specification: Achievement API Endpoints

**Feature Branch**: `029-achievement-api-endpoints`  
**Created**: 2025  
**Status**: Draft  
**Input**: User description: "Create API endpoints for the Achievement & Badges System. We need 6 REST endpoints: 1) GET /api/achievements - list all active achievements with optional category filter, pagination (20 per page), sort by order/rarity/points, return translations in user's preferredLanguage or requested language. 2) GET /api/achievements/[id] - get single achievement details by achievementId slug, include full translations object, badge images, criteria, metadata. 3) GET /api/user/achievements - authenticated endpoint returning current user's unlocked achievements with unlockedAt timestamps, progress tracking, notification status, sorted by most recent first. Include earned points total and completion percentage. 4) POST /api/achievements/unlock - manual achievement unlock for testing/admin purposes, accepts userId and achievementId, validates achievement exists, checks for duplicates, creates UserAchievement record, increments user's achievementPoints, returns unlock confirmation. Requires authentication. 5) POST /api/admin/achievements - admin-only endpoint to create new achievements, validates admin session via isAdmin flag, accepts all Achievement fields (achievementId, translations, category, criteria, points, rarity, etc.), validates required fields, saves to database, returns created achievement. 6) Background service endpoint or scheduled function to check for automatic achievement unlocks based on user activity - evaluates achievement criteria (duration milestones, streak counts, entry counts) against user's Entry and UserAchievement data, unlocks achievements when criteria met, updates user points. Follow existing patterns: use withErrorHandler wrapper, auth() for authentication, return okResponse/errorResponse/unauthorizedResponse helpers, Edge Runtime compatible middleware, validate user ownership for user-specific data, check session.user.isAdmin for admin routes, handle MongoDB errors gracefully."

## Clarifications

### Session 2025-11-04

- Q: When the background evaluation function runs automatically, how frequently should it execute? → A: On entry creation/update event (event-driven, immediate feedback)
- Q: For the GET `/api/achievements` endpoint, should anonymous (unauthenticated) users be able to browse achievements, or should authentication be required? → A: Require authentication (achievements visible only to authenticated users; marketing handled on separate features page)
- Q: When a user unlocks an achievement, should the system send them a real-time notification (via WebSocket/SSE) or only show the unlock when they next fetch their achievements? → A: Fetch only for now (no real-time push), with real-time notifications planned for future enhancement
- Q: When the background evaluation function processes automatic unlocks, should it evaluate criteria for all users or only for users with recent activity? → A: Only recent activity users (evaluate only the user who triggered the event)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Available Achievements (Priority: P1)

Authenticated users must be able to browse all active achievements with filtering by category, view achievement details including unlock criteria and point values, and see content in their preferred language.

**Why this priority**: This is the core discovery feature - users need to see what achievements exist and what they need to do to unlock them. This drives engagement and provides clear goals. Essential for user motivation and gamification value. Authentication required to keep achievements as member-only feature.

**Independent Test**: Can be fully tested by authenticating as test user, making GET request to `/api/achievements` with and without category filter, verifying response contains array of achievement objects with translations, checking that inactive/secret achievements are excluded, and verifying unauthenticated requests return 401.

**Acceptance Scenarios**:

1. **Given** user is not authenticated, **When** GET `/api/achievements` is requested, **Then** 401 unauthorized response is returned
2. **Given** authenticated user and 15 active achievements exist across multiple categories, **When** GET `/api/achievements` is requested without filters, **Then** all 15 achievements are returned sorted by order field with translations in user's preferredLanguage
3. **Given** achievements exist in categories 'duration' and 'streak', **When** authenticated GET `/api/achievements?category=duration` is requested, **Then** only duration category achievements are returned
4. **Given** authenticated user has preferredLanguage='es' saved in their profile, **When** GET `/api/achievements` is requested, **Then** Spanish translations are returned for each achievement
5. **Given** 25 active achievements exist, **When** authenticated GET `/api/achievements?page=2&limit=20` is requested, **Then** achievements 21-25 are returned with pagination metadata
6. **Given** achievements have different rarity levels, **When** authenticated GET `/api/achievements?sort=rarity` is requested, **Then** achievements are returned sorted legendary > epic > rare > common

---

### User Story 2 - View Single Achievement Details (Priority: P1)

Users must be able to view complete details for a specific achievement including full multilingual translations, unlock criteria, badge images, rarity, points, and category information.

**Why this priority**: Essential companion to browsing - users need detailed information about specific achievements to understand unlock requirements and decide which to pursue. Required for both discovery and progress tracking.

**Independent Test**: Can be fully tested by making GET request to `/api/achievements/sweet-sixteen` with valid achievementId, verifying response contains full achievement object with all fields including nested translations and criteria objects, and testing with invalid achievementId returns 404.

**Acceptance Scenarios**:

1. **Given** an achievement exists with achievementId='sweet-sixteen', **When** GET `/api/achievements/sweet-sixteen` is requested, **Then** full achievement object is returned including translations for all languages, badge image URLs, criteria object, points, rarity, category
2. **Given** an achievement has isSecret=true, **When** GET `/api/achievements/[secretId]` is requested by user who hasn't unlocked it, **Then** achievement details are returned but with masked name/description
3. **Given** no achievement exists with achievementId='invalid-id', **When** GET `/api/achievements/invalid-id` is requested, **Then** 404 error response is returned with message "Achievement not found"
4. **Given** an achievement has translations in en/es/fr, **When** GET `/api/achievements/[id]?lang=fr` is requested, **Then** response includes all translations but highlights French translation in primary display field

---

### User Story 3 - View Personal Achievement Progress (Priority: P2)

Authenticated users must be able to view their unlocked achievements with unlock timestamps, track progress toward in-progress achievements, see total points earned, and view completion percentage across all available achievements.

**Why this priority**: Core personal gamification feature - users need to see their progress and earned achievements. While important, browsing available achievements (P1) is more critical for initial engagement. Users can't track progress until they know what to pursue.

**Independent Test**: Can be fully tested by authenticating as test user with 5 unlocked achievements, making GET request to `/api/user/achievements`, verifying response contains user's unlocked achievements sorted by unlockedAt descending, checking that achievementPoints total matches sum of unlocked achievement points, and confirming completion percentage is calculated correctly.

**Acceptance Scenarios**:

1. **Given** authenticated user has unlocked 5 achievements totaling 150 points, **When** GET `/api/user/achievements` is requested, **Then** response contains array of 5 UserAchievement objects with achievement details, unlockedAt timestamps sorted newest first, total points 150, and completion percentage
2. **Given** user is not authenticated, **When** GET `/api/user/achievements` is requested, **Then** 401 unauthorized response is returned
3. **Given** authenticated user has unlocked achievements with notificationSeen=false, **When** GET `/api/user/achievements` is requested, **Then** response includes unseen count and flags which achievements have unread notifications
4. **Given** authenticated user has progress toward incomplete achievements, **When** GET `/api/user/achievements?include=progress` is requested, **Then** response includes both unlocked achievements and in-progress achievements with current progress values

---

### User Story 4 - Manual Achievement Unlock (Priority: P3)

Authenticated users with appropriate permissions must be able to manually unlock achievements for testing purposes or administrative corrections, with validation to prevent duplicates and ensure achievement exists.

**Why this priority**: Important for testing and admin functions, but not core user-facing functionality. Most unlocks will be automatic via triggers. This supports development and edge case handling rather than primary user experience.

**Independent Test**: Can be fully tested by authenticating as admin user, making POST request to `/api/achievements/unlock` with valid userId and achievementId, verifying UserAchievement record is created with correct timestamp, user's achievementPoints are incremented, and duplicate unlock attempt returns validation error.

**Acceptance Scenarios**:

1. **Given** authenticated admin user and valid userId and achievementId, **When** POST `/api/achievements/unlock` with body `{userId, achievementId}`, **Then** UserAchievement record is created, user's achievementPoints incremented by achievement points value, and success response returned with unlock details
2. **Given** user has already unlocked the specified achievement, **When** POST `/api/achievements/unlock` is requested for same user-achievement pair, **Then** 409 conflict error response returned with message "Achievement already unlocked"
3. **Given** invalid achievementId is provided, **When** POST `/api/achievements/unlock` is requested, **Then** 404 error response returned with message "Achievement not found"
4. **Given** non-admin user is authenticated, **When** POST `/api/achievements/unlock` is requested, **Then** 403 forbidden response is returned with message "Admin access required"

---

### User Story 5 - Admin Create Achievements (Priority: P4)

Admin users must be able to create new achievement definitions through API with full field validation, multilingual translations, unlock criteria configuration, and visual assets, enabling achievement catalog expansion without code changes.

**Why this priority**: Administrative feature for content management. While valuable for scalability, it's not needed for MVP - initial achievements can be seeded directly. Users benefit from viewing and unlocking achievements before admins need self-service creation.

**Independent Test**: Can be fully tested by authenticating as admin user, making POST request to `/api/admin/achievements` with complete achievement definition including translations, criteria, category, points, rarity, verifying Achievement document is saved to MongoDB with all fields including createdBy reference to admin, and testing validation errors for missing required fields.

**Acceptance Scenarios**:

1. **Given** authenticated admin user with complete achievement data, **When** POST `/api/admin/achievements` with body containing achievementId, translations, category, criteria, points, rarity, **Then** Achievement document is created with all fields, createdBy set to admin's userId, and created achievement object returned
2. **Given** admin provides achievementId that already exists, **When** POST `/api/admin/achievements` is requested, **Then** 409 conflict error response returned with message "Achievement ID already exists"
3. **Given** admin omits required fields (achievementId or translations.en), **When** POST `/api/admin/achievements` is requested, **Then** 400 validation error response returned with details of missing fields
4. **Given** non-admin user is authenticated, **When** POST `/api/admin/achievements` is requested, **Then** 403 forbidden response returned
5. **Given** admin provides invalid category or rarity enum value, **When** POST `/api/admin/achievements` is requested, **Then** 400 validation error response returned with acceptable enum values

---

### User Story 6 - Automatic Achievement Unlocks (Priority: P4)

The system must automatically evaluate achievement criteria when a user creates or updates an entry, checking if the user meets unlock conditions and awarding achievements immediately without manual intervention.

**Why this priority**: Automation enhances user experience but isn't critical for MVP. Manual unlocking (P3) enables full testing and demonstration of achievement system. Automatic triggers add polish and scale but can be implemented after core viewing and tracking features are proven. Event-driven evaluation provides immediate feedback when users complete activities.

**Independent Test**: Can be fully tested by creating test user, creating/updating entry with specific patterns (e.g., 16-hour fasting duration), verifying achievements with matching criteria are automatically unlocked with UserAchievement records created immediately after entry save, and confirming user's achievementPoints are updated correctly. Users see unlocks on their next achievements page visit (real-time push notifications planned for future).

**Acceptance Scenarios**:

1. **Given** user creates/updates entry with 16-hour fasting duration and achievement 'sweet-sixteen' has criteria `{type: 'duration-milestone', params: {hours: 16}}`, **When** entry is saved (triggering evaluation), **Then** achievement is automatically unlocked for that user only and user receives points
2. **Given** user saves their 3rd entry and achievement 'getting-started' has criteria `{type: 'entry-count', params: {count: 3}}`, **When** entry save triggers evaluation, **Then** achievement unlocks automatically for that user
3. **Given** user's new entry creates 7-day streak and achievement 'week-warrior' has criteria `{type: 'streak', params: {days: 7}}`, **When** evaluation runs on entry save, **Then** achievement unlocks immediately
4. **Given** user meets criteria for achievement they already unlocked, **When** evaluation runs on entry save, **Then** no duplicate unlock occurs and no error is thrown
5. **Given** user unlocks achievement via automatic evaluation, **When** user later visits achievements page, **Then** newly unlocked achievement appears in their list (no real-time push notification in this phase)

---

### Edge Cases

- What happens when GET `/api/achievements` is requested with invalid category value? Return 400 error with message listing valid categories.
- How does system handle requesting achievement details for achievementId that exists but has isActive=false? Return 404 to prevent discovery of inactive achievements.
- What happens when GET `/api/user/achievements` is requested by user who has never unlocked any achievements? Return empty array with 0 total points and 0% completion.
- How does system handle POST `/api/achievements/unlock` when user doesn't exist? Return 404 error with message "User not found".
- What happens when POST `/api/admin/achievements` receives criteria object with unknown type? Accept and save - criteria types are validated in background evaluation logic, not at creation.
- How does system handle language preference query param with unsupported language code? Fall back to English (en) translations.
- What happens when background evaluation runs and user has been deleted but their entries exist? Skip evaluation for deleted users, log warning.
- How does system handle concurrent unlock requests for same user-achievement pair? MongoDB unique index prevents duplicates, second request returns 409 conflict.
- What happens when GET `/api/achievements` is requested with page=1000 (beyond available achievements)? Return empty array with valid pagination metadata showing total available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide GET `/api/achievements` authenticated endpoint that returns array of active achievements (isActive=true) excluding secret achievements user hasn't unlocked
- **FR-001a**: System MUST return 401 unauthorized response for GET `/api/achievements` when user is not authenticated
- **FR-002**: System MUST support category filter query parameter on `/api/achievements` endpoint accepting enum values: getting-started, duration, streak, goal, weight, consistency, special, knowledge
- **FR-003**: System MUST support pagination on `/api/achievements` with query parameters page (default 1) and limit (default 20, max 100)
- **FR-004**: System MUST support sort query parameter on `/api/achievements` accepting values: order, rarity, points, newest
- **FR-005**: System MUST return achievement translations in user's preferredLanguage if authenticated, or lang query parameter if provided, falling back to English (en)
- **FR-006**: System MUST provide GET `/api/achievements/[id]` endpoint accepting achievementId as URL parameter
- **FR-007**: System MUST return 404 error for GET `/api/achievements/[id]` when achievement doesn't exist or isActive=false
- **FR-008**: System MUST mask name/description for secret achievements (isSecret=true) that user hasn't unlocked, showing "???" placeholder text
- **FR-009**: System MUST provide GET `/api/user/achievements` authenticated endpoint requiring valid session via auth()
- **FR-010**: System MUST return 401 unauthorized response for GET `/api/user/achievements` when user is not authenticated
- **FR-011**: System MUST return user's unlocked achievements sorted by unlockedAt descending with achievement details joined
- **FR-012**: System MUST calculate and return total achievementPoints and completion percentage (unlocked count / total active count * 100) in GET `/api/user/achievements` response
- **FR-013**: System MUST provide POST `/api/achievements/unlock` authenticated endpoint accepting userId and achievementId in request body
- **FR-014**: System MUST validate admin access (session.user.isAdmin=true) for POST `/api/achievements/unlock` endpoint
- **FR-015**: System MUST validate achievement exists and user exists before creating UserAchievement record
- **FR-016**: System MUST return 409 conflict error when attempting to unlock achievement user already has
- **FR-017**: System MUST increment user's achievementPoints by achievement point value when unlocking achievement
- **FR-018**: System MUST provide POST `/api/admin/achievements` admin-only endpoint requiring session.user.isAdmin=true
- **FR-019**: System MUST validate required fields (achievementId, translations.en, category, criteria, points, rarity) in POST `/api/admin/achievements`
- **FR-020**: System MUST set createdBy field to authenticated admin's userId when creating achievement
- **FR-021**: System MUST return 409 conflict error when attempting to create achievement with duplicate achievementId
- **FR-022**: System MUST provide event-driven evaluation function triggered on entry creation/update to automatically unlock achievements for the triggering user only
- **FR-022a**: System MUST evaluate achievement criteria only for the specific user whose entry triggered the evaluation (not batch processing all users)
- **FR-023**: System MUST evaluate duration-milestone criteria by checking user's Entry records for firstMealTime and lastMealTime calculating fasting duration
- **FR-024**: System MUST evaluate streak criteria by checking consecutive days with Entry records
- **FR-025**: System MUST evaluate entry-count criteria by counting total Entry records for user
- **FR-026**: System MUST handle duplicate prevention in automatic unlocks using MongoDB unique compound index
- **FR-026a**: System MUST NOT send real-time push notifications when achievements unlock (user sees unlocks on next page load; real-time planned for future)
- **FR-027**: System MUST wrap all API route handlers with withErrorHandler for consistent error handling
- **FR-028**: System MUST use okResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, errorResponse helpers for consistent response format
- **FR-029**: System MUST be compatible with Edge Runtime for middleware authentication checks
- **FR-030**: System MUST handle MongoDB connection errors gracefully with appropriate error responses

### Key Entities

- **Achievement API Response**: Public achievement data returned from GET endpoints, containing achievementId, translations (filtered by language preference), badgeImage URLs, icon/iconColor, category, points, rarity, order, criteria (for unlocked or non-secret achievements), and basic metadata. Secret achievements mask sensitive fields until unlocked.

- **UserAchievement API Response**: Personal achievement unlock data returned from authenticated endpoints, containing achievement details (joined from Achievement collection), unlockedAt timestamp, progress value, notificationSeen flag, and enriched with user-specific context like total points earned and completion percentage.

- **Achievement Unlock Request**: POST body for manual unlock endpoint containing userId (ObjectId as string) and achievementId (string slug). Validated for existence and duplicate prevention before creating UserAchievement record and updating user points.

- **Achievement Creation Request**: POST body for admin creation endpoint containing complete achievement definition including achievementId, translations object with language keys, badgeImage URLs, icon/iconColor, category enum, points number, rarity enum, order number, criteria object with type and params, optional isActive/isSecret/releaseDate flags. Validated against schema requirements and enum constraints.

- **Background Evaluation Context**: Runtime context for automatic unlock evaluation including user activity data (Entry records, streak calculations, goal completions), achievement criteria definitions, current UserAchievement state, and user profile for point updates. Processes batch or individual user evaluations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: GET `/api/achievements` returns 401 for unauthenticated requests 100% of the time
- **SC-002**: GET `/api/achievements` returns all active achievements in under 200ms for datasets up to 100 achievements when authenticated
- **SC-003**: GET `/api/achievements?category=duration` correctly filters achievements and returns only matching category in under 150ms
- **SC-004**: GET `/api/achievements` with authenticated user returns translations in user's preferredLanguage 100% of the time when preference is set
- **SC-005**: GET `/api/achievements/[id]` returns 404 for invalid IDs and 200 with full achievement object for valid IDs in under 100ms
- **SC-006**: GET `/api/user/achievements` returns 401 for unauthenticated requests and 200 with user's achievements for authenticated requests
- **SC-007**: GET `/api/user/achievements` calculates completion percentage correctly matching formula (unlocked / total * 100) with 0% for no unlocks and 100% for all unlocked
- **SC-008**: POST `/api/achievements/unlock` creates UserAchievement record, increments user achievementPoints, and returns success response in under 300ms
- **SC-009**: POST `/api/achievements/unlock` prevents duplicate unlocks returning 409 conflict 100% of the time for repeated requests
- **SC-010**: POST `/api/admin/achievements` returns 403 for non-admin users 100% of the time
- **SC-011**: POST `/api/admin/achievements` creates Achievement document with all provided fields including createdBy reference in under 250ms
- **SC-012**: Event-driven evaluation function processes single user's entry save and evaluates all achievement criteria in under 500ms
- **SC-013**: Automatic unlocks correctly identify when triggering user meets criteria with 0% false positives and 0% false negatives
- **SC-014**: Automatic unlocks do NOT send real-time notifications (unlocks visible only on next page load) 100% of the time
- **SC-015**: All API endpoints return consistent JSON response format with status/data/error structure 100% of the time
- **SC-016**: Error responses include appropriate HTTP status codes (400, 401, 403, 404, 409, 500) matching error conditions
- **SC-017**: Pagination on GET `/api/achievements` returns correct page of results with accurate total count metadata for all page numbers within range

## Assumptions *(mandatory)*

1. **Authentication Available**: NextAuth session is configured and accessible via `auth()` function from `src/lib/auth.js`. Session includes user.id, user.email, and user.isAdmin fields.

2. **Models Exist**: Achievement, UserAchievement, User, and Entry models are implemented and exported from `@/lib/models/` directory following Mongoose schema patterns.

3. **Error Handlers Available**: Response helper functions (okResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, errorResponse) and withErrorHandler wrapper exist in `src/lib/api/errorHandler.js`.

4. **English Fallback**: When translations are requested in unsupported language or translation missing, system falls back to English (en) translations which are guaranteed to exist per model requirements.

5. **Edge Runtime Compatible**: All API routes must work with Edge Runtime, meaning database connections use connection pooling and no Node.js-specific APIs that aren't supported in Edge Runtime.

6. **Event-Driven Execution**: Background evaluation function is triggered by entry creation/update events. Evaluation processes only the user who triggered the event, not batch processing all users. This provides immediate achievement unlocks with efficient resource usage.

7. **Criteria Evaluation Logic**: While API exposes criteria objects, specific evaluation logic for each criteria type (duration-milestone, streak, entry-count) is implemented in separate evaluation service, not directly in API routes.

8. **No Real-Time Notifications (Phase 1)**: Achievement unlocks are stored in database immediately but NOT pushed to client via WebSocket/SSE. Users see new unlocks when they navigate to achievements page or dashboard. Real-time push notifications planned for future enhancement.

9. **Admin Flag Authoritative**: User.isAdmin boolean is authoritative for admin access. No additional role-based access control system exists.

10. **Authentication Required for Browsing**: GET `/api/achievements` endpoint requires authentication. Anonymous users cannot browse achievements - achievements are member-only feature. Marketing/feature description handled on separate public features page outside this API.

11. **No Rate Limiting**: Rate limiting for API endpoints is handled by infrastructure (Vercel, Cloudflare) or separate middleware, not implemented in these endpoints.

12. **Optimistic Concurrency**: Background evaluation may have eventual consistency - if two processes evaluate same user simultaneously, MongoDB unique index prevents duplicate unlocks and second write fails gracefully.

## Dependencies *(mandatory)*

- **NextAuth (Auth.js)**: Session management and authentication via auth() function
- **Achievement Models**: Achievement, UserAchievement, User models from Feature 028
- **Entry Model**: Entry model for fasting data used in criteria evaluation
- **MongoDB Connection**: Database connection pool via mongodb.js utility
- **API Utilities**: withErrorHandler wrapper and response helper functions
- **Mongoose**: ORM for model queries, population, and aggregation
- **Next.js API Routes**: App Router API route structure in src/app/api/

## Out of Scope *(mandatory)*

- **Achievement Evaluation Service**: Detailed business logic for evaluating each criteria type (separate service layer implementation)
- **Frontend Components**: React components for displaying achievements, progress bars, badge galleries
- **WebSocket/Real-time Updates**: Real-time push notifications when achievements unlock (separate notification feature)
- **Achievement Analytics**: Tracking which achievements are most popular, completion rates, time to unlock statistics
- **Localization Management**: Admin UI for managing translations, adding new languages, editing achievement text
- **Badge Image Upload**: Image upload, storage, and CDN integration for badge assets
- **Leaderboards**: Public or friend leaderboards showing top achievement earners
- **Social Sharing**: Share unlocked achievements to social media or within app
- **Achievement Categories CRUD**: API endpoints for creating/managing achievement categories (categories are hardcoded enums)
- **Bulk Operations**: Bulk create achievements, bulk unlock for testing, bulk delete
- **Achievement History**: Detailed audit trail of when achievements were modified, versioning
- **Progressive Unlock Animations**: Client-side animations and visual effects when achievements unlock
- **Email Notifications**: Email digest of newly unlocked achievements



