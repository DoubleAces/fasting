# Feature Specification: Achievement Unlock API Response

**Feature Branch**: `032-achievement-unlock-response`  
**Created**: November 7, 2025  
**Status**: Draft  
**Input**: Modify the entry save flow (POST /api/entries and PUT /api/entries/[id]) to automatically evaluate and return unlocked achievements in the API response. After successfully saving an entry, call AchievementService.evaluateAndUnlock(userId, entryId) which runs all achievement evaluators in parallel (duration, streak, goal), deduplicates qualifying achievement IDs, batch-creates UserAchievement records with E11000 duplicate handling, atomically updates user points, and returns an unlockedAchievements array containing achievement details (achievementId, name, description, points, rarity, category, unlockedAt). The evaluation is non-blocking with try/catch error handling so entry operations succeed even if achievement evaluation fails. The response format includes the saved entry plus the unlockedAchievements array, enabling the frontend to display toast notifications, modals, or other UI feedback when users earn new achievements. This completes the backend unlock logic (Feature 031) and prepares the API contract for frontend achievement notification features.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entry Creation Returns Achievement Unlocks (Priority: P1)

When a user creates a new fasting entry that qualifies for achievement unlocks, the API response includes both the created entry and an array of newly unlocked achievements, enabling immediate UI feedback without additional API calls.

**Why this priority**: This is the core contract change that enables frontend achievement notifications. Without this, the frontend would need polling or separate API calls to discover unlocked achievements, resulting in delayed or missed notifications.

**Independent Test**: Can be fully tested by POSTing an entry that unlocks achievements (e.g., 12-hour fast) and verifying the response contains both `entry` and `unlockedAchievements` fields with correct achievement details.

**Acceptance Scenarios**:

1. **Given** a user creates their first 12-hour entry, **When** POST /api/entries succeeds, **Then** the response includes `unlockedAchievements: [{ achievementId: 'first-twelve', name: 'First 12-Hour Fast', points: 10, ... }]`
2. **Given** an entry unlocks multiple achievements (e.g., 24-hour fast unlocks 12h and 24h milestones), **When** POST /api/entries completes, **Then** the `unlockedAchievements` array contains all newly unlocked achievements in a single response
3. **Given** an entry does not qualify for any achievements, **When** POST /api/entries succeeds, **Then** the response includes `unlockedAchievements: []` (empty array)

---

### User Story 2 - Entry Updates Trigger Achievement Evaluation (Priority: P1)

When a user updates an existing entry (e.g., adds firstMealTime to complete a fast, changes fastingDuration), the system re-evaluates achievements and returns any newly unlocked achievements in the PUT response, ensuring consistency between creation and update flows.

**Why this priority**: Users may edit entries to correct mistakes or add missing data. The unlock logic must run on updates to avoid missed achievements and maintain data integrity.

**Independent Test**: Can be fully tested by creating an entry without achievements, then PUTting an update that qualifies for achievements (e.g., changing fastingDuration from 600 to 720 minutes), and verifying the PUT response includes newly unlocked achievements.

**Acceptance Scenarios**:

1. **Given** an entry exists with `fastingDuration: 600`, **When** user updates it to `fastingDuration: 720` via PUT /api/entries/[id], **Then** the response includes the "first-twelve" achievement in `unlockedAchievements`
2. **Given** an entry update does not change achievement-relevant fields (e.g., only updates `foodNotes`), **When** PUT /api/entries/[id] completes, **Then** achievement evaluation still runs but returns empty `unlockedAchievements: []`
3. **Given** an entry update would unlock an already-unlocked achievement, **When** PUT /api/entries/[id] completes, **Then** the duplicate is prevented by the unique constraint and `unlockedAchievements: []` is returned (idempotent)

---

### User Story 3 - Non-Blocking Achievement Evaluation (Priority: P1)

When achievement evaluation encounters errors (e.g., database timeout, malformed criteria), the entry save/update operation still succeeds and returns the entry data, ensuring core functionality is never blocked by achievement processing failures.

**Why this priority**: Entry creation/update is critical user functionality that must be reliable. Achievement unlocking is a secondary feature that should not cause entry operations to fail.

**Independent Test**: Can be fully tested by mocking AchievementService.evaluateAndUnlock to throw an error, verifying the POST/PUT request still returns 201/200 status with entry data, and confirming errors are logged without propagating to the client.

**Acceptance Scenarios**:

1. **Given** AchievementService.evaluateAndUnlock throws a database error, **When** POST /api/entries is called, **Then** the entry is still created, response returns 201 status with entry data, and `unlockedAchievements` is omitted or empty
2. **Given** achievement evaluation times out after 5 seconds, **When** PUT /api/entries/[id] is called, **Then** the entry update completes successfully within normal response time (<500ms)
3. **Given** an achievement evaluation error occurs, **When** the API handler catches the exception, **Then** an error log entry is created with details (userId, entryId, error message) for debugging, but no error response is returned to the client

---

### User Story 4 - Achievement Details in Response (Priority: P2)

When achievements are unlocked, the API response includes complete achievement metadata (name, description, points, rarity, category, iconColor) to enable rich UI displays without requiring additional API calls to fetch achievement definitions.

**Why this priority**: Including full details reduces frontend complexity and API roundtrips. Clients can immediately display achievement notifications with names, icons, and point values without caching or fetching achievement definitions.

**Independent Test**: Can be fully tested by creating an entry that unlocks an achievement, examining the response structure, and verifying all required fields (achievementId, name, description, points, rarity, category, iconColor, unlockedAt) are present with correct values.

**Acceptance Scenarios**:

1. **Given** an achievement is unlocked, **When** the API response is returned, **Then** `unlockedAchievements[0]` contains `{ achievementId, name, description, points, rarity, category, iconColor, unlockedAt }` with all fields populated
2. **Given** multiple achievements are unlocked, **When** the response is constructed, **Then** each item in `unlockedAchievements` includes the same complete metadata structure
3. **Given** an achievement has translations (e.g., en, es, fr), **When** the response is generated, **Then** the English translation is used by default for name and description

---

### Edge Cases

- **Achievement Service Unavailable**: If AchievementService module fails to import or is undefined, entry operations log the error and continue without achievement evaluation, returning entries without `unlockedAchievements` field
- **Malformed Achievement Data**: If an unlocked achievement has missing required fields (e.g., no name or points), it is excluded from the response array to prevent frontend errors
- **Concurrent Entry Creation**: When multiple entries are created simultaneously (e.g., batch import), each entry's achievement evaluation runs independently with idempotent unlock logic preventing duplicates
- **Entry Deletion After Unlock**: If a user deletes an entry after unlocking achievements, the UserAchievement records and points remain (achievements are not revoked)
- **Response Size**: If a single entry unlocks 10+ achievements (e.g., first entry with 72-hour fast), the response size may exceed typical API payload expectations; ensure serialization and transport handle large `unlockedAchievements` arrays
- **Achievement Criteria Changes**: If an admin modifies achievement criteria after entries are created, re-running evaluation on entry updates does not revoke previously unlocked achievements (forward-only unlock logic)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: POST /api/entries MUST call AchievementService.evaluateAndUnlock(userId, entryId) after successfully creating an entry record
- **FR-002**: PUT /api/entries/[id] MUST call AchievementService.evaluateAndUnlock(userId, entryId) after successfully updating an entry record
- **FR-003**: Achievement evaluation MUST execute within a try/catch block that logs errors without propagating exceptions to the API client
- **FR-004**: The API response MUST include an `unlockedAchievements` array field containing details of newly unlocked achievements
- **FR-005**: Each item in `unlockedAchievements` MUST include fields: achievementId (string), name (string), description (string), points (number), rarity (string), category (string), iconColor (string), unlockedAt (ISO 8601 timestamp)
- **FR-006**: When no achievements are unlocked, the `unlockedAchievements` field MUST be an empty array `[]`, not null or undefined
- **FR-007**: When achievement evaluation fails due to errors, the entry creation/update MUST still succeed and return the entry data with an empty `unlockedAchievements` array
- **FR-008**: The response format MUST follow the existing API pattern: `{ ...entry.toObject(), unlockedAchievements: [...] }` for consistent client-side parsing
- **FR-009**: Achievement evaluation MUST complete asynchronously without blocking the entry save operation (await the service call)
- **FR-010**: The system MUST log achievement unlock events to the console with format: `"🏆 Achievements unlocked: [achievementIds]"`
- **FR-011**: When achievement evaluation throws an error, the system MUST log the error with context: `"Achievement evaluation failed for entry [entryId]: [error.message]"`

### Key Entities

- **Entry**: Existing MongoDB document representing a fasting entry; modified API responses include `unlockedAchievements` field without changing database schema
- **UserAchievement**: Existing MongoDB document created by AchievementService when unlocking achievements; used to populate `unlockedAchievements` response array
- **Achievement**: Existing MongoDB document containing achievement definitions (name, description, points, rarity, category); data is enriched into the response
- **UnlockedAchievement (Response Object)**: Transient JavaScript object (not persisted) containing achievement details for API responses; structure: `{ achievementId, name, description, points, rarity, category, iconColor, unlockedAt }`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive achievement unlock notifications within 500ms of entry creation/update completion
- **SC-002**: Entry creation/update success rate remains at 99.9%+ even when achievement evaluation encounters errors
- **SC-003**: API response payload size stays under 50KB for typical cases (1-3 achievements unlocked per entry)
- **SC-004**: Achievement evaluation completes within 200ms for 95% of requests (measured from AchievementService call to response)
- **SC-005**: Zero user-facing errors occur when achievement evaluation fails (non-blocking error handling)
- **SC-006**: Frontend developers can display achievement notifications using only the API response data without additional API calls
- **SC-007**: All entry creation/update operations return consistent response structure regardless of whether achievements are unlocked

