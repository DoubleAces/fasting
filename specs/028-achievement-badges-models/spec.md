# Feature Specification: Achievement & Badges Database Models

**Feature Branch**: `028-achievement-badges-models`  
**Created**: November 4, 2025  
**Status**: Draft  
**Input**: User description: "Create the database models for the Achievement & Badges System. We need two MongoDB models: 1) Achievement model with fields for achievementId (unique slug), translations object (nested with language codes en/es/fr/de/pt containing name/description/shortDescription), badgeImage object (locked/unlocked URLs), icon/iconColor for emoji alternative, category (enum: getting-started/duration/streak/goal/weight/consistency/special/knowledge), points (number), rarity (enum: common/rare/epic/legendary), order (display order), criteria object (type and params for unlock logic), isActive boolean, isSecret boolean, releaseDate, timestamps, and createdBy admin reference. 2) UserAchievement model with userId, achievementId (references Achievement.achievementId), unlockedAt date, progress number (for incremental tracking), notificationSeen boolean, and timestamps. Include appropriate indexes: unique compound index on userId+achievementId for UserAchievement, and index on userId+unlockedAt descending. Add User model extension for preferredLanguage (enum: en/es/fr/de/pt/ja/zh, default en) and achievementPoints number field. Follow existing project patterns for model structure, validation, and exports."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store Achievement Definitions (Priority: P1)

The system must persist achievement definitions with multilingual support, allowing badges to be created, read, updated, and managed with complete metadata including unlock criteria and display properties.

**Why this priority**: This is the foundation - without achievement definitions stored in the database, no other achievement functionality can work. All other features depend on this.

**Independent Test**: Can be fully tested by creating an Achievement document with all required fields (achievementId, translations, category, criteria), saving it to MongoDB, and querying it back with all fields intact including nested translations and criteria objects.

**Acceptance Scenarios**:

1. **Given** the Achievement model is defined, **When** an achievement document is created with English translations and unlock criteria, **Then** the document is saved to MongoDB with all fields including nested translations object
2. **Given** an achievement exists with criteria `{type: 'duration-milestone', params: {hours: 16}}`, **When** querying the achievement by achievementId, **Then** the criteria object is returned with correct type and params structure
3. **Given** multiple achievements exist with different categories, **When** querying achievements filtered by category 'duration', **Then** only achievements with category='duration' are returned
4. **Given** an achievement has translations for en/es/fr, **When** querying the achievement, **Then** all three language translations are returned with name/description/shortDescription for each

---

### User Story 2 - Track User Achievement Progress (Priority: P1)

The system must record when users unlock achievements, track incremental progress toward achievements, and prevent duplicate unlocks for the same user-achievement combination.

**Why this priority**: This is equally foundational - user progress tracking is required for any achievement functionality to provide value to users. Must be implemented alongside achievement definitions.

**Independent Test**: Can be fully tested by creating a UserAchievement document linking a userId to an achievementId with unlockedAt timestamp, then querying all achievements for that user and verifying the unlock relationship exists and is unique.

**Acceptance Scenarios**:

1. **Given** a user exists and an achievement exists, **When** a UserAchievement document is created linking them, **Then** the document is saved with userId, achievementId, unlockedAt date, and initial progress value
2. **Given** a UserAchievement exists for user A and achievement 'sweet-sixteen', **When** attempting to create another UserAchievement for the same user-achievement pair, **Then** the database rejects the duplicate due to unique compound index
3. **Given** a user has unlocked 3 achievements, **When** querying UserAchievements for that userId sorted by unlockedAt descending, **Then** the 3 achievements are returned with most recent unlock first
4. **Given** a UserAchievement exists with progress=50, **When** updating the progress field to 75, **Then** the progress value is persisted and the document maintains notificationSeen flag state

---

### User Story 3 - Extend User Model for Gamification (Priority: P1)

The system must add language preference and achievement points tracking to existing User model, allowing users to view achievements in their preferred language and track total gamification points earned.

**Why this priority**: Required for multilingual achievement display and gamification scoring system. Must be implemented alongside achievement models to support full feature set.

**Independent Test**: Can be fully tested by querying an existing user, updating their preferredLanguage to 'es' and achievementPoints to 150, then verifying the user document persists these new fields without breaking existing authentication or profile fields.

**Acceptance Scenarios**:

1. **Given** an existing user document, **When** the preferredLanguage field is set to 'fr', **Then** the user document saves successfully and the language preference is persisted
2. **Given** a user has preferredLanguage='en' (default), **When** updating to 'ja', **Then** the enum validation accepts the value and saves it
3. **Given** a user has achievementPoints=100, **When** incrementing by 25 points, **Then** the achievementPoints field updates to 125
4. **Given** a new user is created without specifying preferredLanguage, **When** the user document is saved, **Then** preferredLanguage defaults to 'en' and achievementPoints defaults to 0

---

### Edge Cases

- What happens when an achievement document is created without required fields (achievementId, category, criteria)? System must reject with validation error.
- How does the system handle an achievement with only partial translations (e.g., only English, missing Spanish)? The translations object should allow sparse language data - validation should require at least English ('en').
- What happens when a UserAchievement is queried for a userId that has never unlocked any achievements? Query returns empty array without error.
- How does the system enforce the unique constraint on User.email when adding new fields? Existing unique indexes and validation must not be affected by new fields.
- What happens when querying UserAchievements with an achievementId that references a deleted Achievement? The UserAchievement document remains valid (soft reference via string achievementId, not ObjectId).
- How does the system handle achievements with isActive=false? They exist in database but should be filtered in application logic (database stores all, active flag controls visibility).
- What happens when an achievement criteria object has an unknown type? Model should accept any string for type (validated in application logic, not schema) to allow future criteria types without schema migration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define an Achievement model with achievementId field as unique String slug (e.g., 'sweet-sixteen', 'first-fast')
- **FR-002**: System MUST store achievement translations as nested object with language code keys (en, es, fr, de, pt) containing name (String), description (String), and shortDescription (String) for each language
- **FR-003**: System MUST store achievement badge images as object with locked (String URL) and unlocked (String URL) properties, allowing null values for achievements using emoji icons instead
- **FR-004**: System MUST provide icon (String emoji) and iconColor (String hex color) fields as alternative to badge images for simpler achievement display
- **FR-005**: System MUST enforce achievement category as enum with values: getting-started, duration, streak, goal, weight, consistency, special, knowledge
- **FR-006**: System MUST store achievement metadata including points (Number), rarity (enum: common/rare/epic/legendary), and order (Number for display sorting)
- **FR-007**: System MUST store achievement unlock criteria as flexible object with type (String) and params (Mixed) to support multiple criteria patterns (duration-milestone, streak, entry-count, goal-completion)
- **FR-008**: System MUST provide isActive (Boolean, default true), isSecret (Boolean, default false), and releaseDate (Date) fields for achievement lifecycle management
- **FR-009**: System MUST reference admin user who created achievement via createdBy field (ObjectId ref to User)
- **FR-010**: System MUST automatically add createdAt and updatedAt timestamps to Achievement documents
- **FR-011**: System MUST define UserAchievement model with userId (ObjectId ref to User) and achievementId (String matching Achievement.achievementId)
- **FR-012**: System MUST enforce unique compound index on UserAchievement (userId + achievementId) to prevent duplicate unlocks
- **FR-013**: System MUST store unlockedAt (Date) timestamp when user earns achievement
- **FR-014**: System MUST track incremental achievement progress as Number field (0-100 for percentage, or raw count for count-based achievements)
- **FR-015**: System MUST track whether user has seen unlock notification via notificationSeen (Boolean, default false)
- **FR-016**: System MUST add index on UserAchievement (userId + unlockedAt descending) for efficient recent achievements queries
- **FR-017**: System MUST extend existing User model with preferredLanguage field (enum: en/es/fr/de/pt/ja/zh, default 'en')
- **FR-018**: System MUST extend existing User model with achievementPoints field (Number, default 0) to track total gamification score
- **FR-019**: System MUST follow existing project patterns for model structure including JSDoc comments, validation messages, and export syntax
- **FR-020**: System MUST use mongoose.Schema.Types.ObjectId for user references and mongoose.Schema.Types.Mixed for flexible criteria params

### Key Entities

- **Achievement**: Represents a badge/achievement definition that users can unlock. Contains multilingual names and descriptions, unlock criteria logic, visual assets (images or emoji), categorization (getting-started, duration, etc.), gamification metadata (points, rarity), lifecycle flags (active, secret, release date), and audit trail (creator, timestamps). Uniquely identified by achievementId slug.

- **UserAchievement**: Represents a user's earned achievement, linking a specific user to an achievement they've unlocked. Contains unlock timestamp, incremental progress tracking (for achievements earned gradually), and notification state. Enforces one unlock per user-achievement pair via compound unique index. Indexed for efficient queries of user's recent achievements.

- **User** (extended): Existing authentication and profile entity, extended with multilingual preferences (preferredLanguage for displaying achievements in user's chosen language) and gamification score (achievementPoints tracking total points from all unlocked achievements). New fields integrate seamlessly with existing authentication, profile, and session management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Achievement documents can be created with all required fields and saved to MongoDB without validation errors
- **SC-002**: Queries for achievements by category return correct filtered results in under 100ms for datasets up to 100 achievements
- **SC-003**: UserAchievement documents successfully enforce unique constraint, preventing duplicate user-achievement pairs while allowing same achievement for different users
- **SC-004**: Users can have preferredLanguage updated and queries return achievements with translations in the specified language
- **SC-005**: AchievementPoints field on User model can be incremented and queried without affecting existing authentication or profile functionality
- **SC-006**: Database indexes on UserAchievement (userId + achievementId unique, userId + unlockedAt descending) are created and improve query performance by 10x compared to non-indexed queries
- **SC-007**: Achievement criteria objects with varying structures (duration params, streak params, count params) are stored and retrieved without data loss or type coercion
- **SC-008**: Models export successfully and can be imported in API routes following existing project import patterns (e.g., `import Achievement from '@/lib/models/Achievement'`)

## Assumptions *(mandatory)*

1. **English Required**: All achievement definitions must include at minimum English ('en') translations. Other languages are optional and can be added incrementally.
2. **String References**: UserAchievement.achievementId uses string reference (not ObjectId) to Achievement.achievementId for flexibility. This allows achievements to be soft-deleted without breaking user progress records.
3. **Application Logic**: Achievement unlock logic, validation of criteria, and filtering by isActive/isSecret flags will be implemented in API/service layer, not in database schemas.
4. **Future Criteria Types**: The criteria.type field accepts any string to allow new unlock criteria types to be added in future without schema migration. Validation of specific types happens in application code.
5. **Additive Points**: AchievementPoints on User model are always additive (never decrease). Point recalculation if needed will be handled in future migration/admin tools.
6. **Image Storage**: BadgeImage URLs assume images are uploaded to storage service (e.g., Vercel Blob, AWS S3) and stored as public URLs. Image upload functionality is out of scope for this feature.
7. **Default Language**: System assumes 'en' (English) as default preferredLanguage for all existing and new users unless explicitly changed.
8. **Progress Semantics**: The progress field in UserAchievement is flexible - for percentage-based achievements use 0-100, for count-based achievements use raw counts. Interpretation depends on achievement criteria type.

## Dependencies *(mandatory)*

- **Mongoose ODM**: Models depend on Mongoose library for schema definition, validation, and MongoDB interaction
- **MongoDB**: Database must be MongoDB 4.4+ to support compound indexes and mixed field types
- **Existing User Model**: User model extensions require existing User schema from `src/lib/models/User.js`
- **Database Connection**: Requires established MongoDB connection (typically in `src/lib/mongodb.js`)
- **Node.js Environment**: Requires Node.js environment variables for MongoDB connection string

## Out of Scope *(mandatory)*

- **API Endpoints**: No API routes for CRUD operations on achievements (planned for future implementation phase)
- **Achievement Unlock Logic**: Business logic for evaluating criteria and automatically unlocking achievements (separate feature)
- **Admin UI**: Admin dashboard for managing achievements, uploading badge images, creating new achievements (separate feature)
- **Frontend Components**: React components for displaying achievements, badge galleries, progress bars (separate feature)
- **Seed Data**: Initial set of 80+ achievements to populate database (separate migration/seeding task)
- **Migration Scripts**: Scripts to add preferredLanguage and achievementPoints fields to existing User documents (separate migration task)
- **Badge Image Upload**: Image upload functionality and storage integration (part of future admin UI feature)
- **Notifications**: System for notifying users when achievements are unlocked (separate notification feature)
- **Leaderboards**: Ranking users by achievementPoints or achievement counts (future gamification feature)

---

