# Feature Specification: Achievement Content Seed Data

**Feature Branch**: `030-achievement-content-seed`  
**Created**: November 5, 2025  
**Status**: Draft  

**Input**: User description: "Create 80+ achievement definitions for the fasting tracker achievement system. We already have the database models (Achievement, UserAchievement from Feature 028) and API endpoints (Feature 029) working. Now we need to populate the system with comprehensive achievement content across 8 categories. Generate a complete seed script that creates 80-85 achievements with proper criteria, points, rarities, multilingual translations (English + Spanish), icons, and metadata."



## User Scenarios & Testing *(mandatory)*

### User Story 1 - Populate Achievement Catalog (Priority: P1)

The system must have a comprehensive catalog of 81 achievement definitions spanning 8 categories, providing users with diverse goals and milestones to pursue across different aspects of fasting practice.

**Why this priority**: This is the content foundation - without a rich catalog of achievements, the achievement system has no purpose. Currently only 6 sample achievements exist. Users need a full spectrum of goals (easy to legendary) to maintain engagement and motivation.

**Independent Test**: Can be fully tested by running the seed script, verifying 81 Achievement documents are created in MongoDB across all 8 categories (getting-started, duration, streak, goal, weight, consistency, special, knowledge), and confirming each has proper translations, criteria, points, and rarity assignments.

**Acceptance Scenarios**:

1. **Given** the database contains only 6 sample achievements, **When** the seed script runs, **Then** 81 total achievements exist spanning all 8 categories with proper distribution (8 getting-started, 12 duration, 10 streak, 8 goal, 8 weight, 12 consistency, 15 special, 8 knowledge)
2. **Given** the seed script completes successfully, **When** querying achievements by category 'duration', **Then** 12 duration milestones exist ranging from 12h (common) to 120h (legendary) with incrementing difficulty
3. **Given** achievements are seeded with multilingual support, **When** querying any achievement, **Then** both English and Spanish translations exist with name, description, and shortDescription for each language
4. **Given** the Getting Started category is populated, **When** querying these achievements, **Then** 8 achievements exist designed for new users with low barriers (log first entry, complete first fast, etc.)

---

### User Story 2 - Define Achievement Criteria (Priority: P1)

Each achievement must have properly structured unlock criteria using supported types (duration-milestone, streak, entry-count) or custom type with descriptive parameters for future implementation.

**Why this priority**: Criteria definitions determine when achievements unlock automatically. Without proper criteria, the evaluation service cannot function. This is essential for automatic achievement unlocking functionality.

**Independent Test**: Can be fully tested by reviewing seeded achievements, verifying each has a criteria object with valid type field and appropriate params object, and confirming duration/streak/entry-count types match the evaluator's supported criteria while unsupported features use 'custom' type with clear params.

**Acceptance Scenarios**:

1. **Given** duration milestone achievements are seeded, **When** examining their criteria, **Then** each uses type 'duration-milestone' with params.hours set to the target duration (12, 14, 16, 18, 20, 22, 24, 36, 48, 72, 96, 120)
2. **Given** streak achievements are seeded, **When** examining their criteria, **Then** each uses type 'streak' with params.days set to consecutive day requirements (3, 7, 14, 30, 90, 100, 180, 365, 500, 1000)
3. **Given** entry count achievements are seeded, **When** examining their criteria, **Then** each uses type 'entry-count' with params.count set to total entries required (3, 10, 30, 100, 250, 500, 1000)
4. **Given** goal-related achievements are seeded, **When** examining their criteria, **Then** each uses type 'custom' with descriptive params like {feature: 'goal-completion', count: 7, consecutive: true} to guide future implementation

---

### User Story 3 - Assign Gamification Metadata (Priority: P1)

Each achievement must have appropriate points, rarity level, display order, icons, and colors that create a balanced progression system and visual identity.

**Why this priority**: Gamification metadata drives user motivation and provides visual hierarchy. Points must scale with difficulty, rarities must reflect accomplishment level, and display order must create logical progression paths. Essential for user engagement.

**Independent Test**: Can be fully tested by reviewing seeded achievements, verifying common achievements have 5-25 points, rare have 30-75, epic have 80-150, legendary have 200-500, and confirming each category has logical display order (order field 1-N) and appropriate emoji icons with hex colors.

**Acceptance Scenarios**:



**Acceptance Scenarios**:### User Story 3 - [Brief Title] (Priority: P3)



1. **Given** all 80+ achievements are seeded, **When** analyzing rarity distribution, **Then** approximately 40-50% are common, 30% rare, 15% epic, and 5-10% legendary[Describe this user journey in plain language]

2. **Given** duration milestones are seeded, **When** examining their rarities, **Then** 12-14h fasts are common, 16-20h are rare, 24-48h are epic, and 72h+ are legendary

3. **Given** Getting Started achievements are seeded, **When** examining their display order, **Then** order values progress logically (1: First Steps, 2: Breaking the Fast, 3: Double Digits, etc.)**Why this priority**: [Explain the value and why it has this priority level]

4. **Given** achievements are seeded with visual identifiers, **When** querying any achievement, **Then** it has an emoji icon (🏆, ⏱️, 🔥, etc.) and iconColor hex value appropriate to its category

**Independent Test**: [Describe how this can be tested independently]

---

**Acceptance Scenarios**:

### User Story 4 - Support Special Achievement Types (Priority: P2)

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

The system must include special achievements (secret badges, time-released badges, holiday achievements) that add discovery elements and seasonal engagement to the achievement system.

---

**Why this priority**: Special achievements drive long-term engagement and provide surprise elements. While not critical for MVP, they significantly enhance the gamification experience and give advanced users unique goals.

[Add more user stories as needed, each with an assigned priority]

**Independent Test**: Can be fully tested by reviewing seeded achievements, identifying those marked with isSecret=true or with future releaseDate values, and verifying special category achievements include unique criteria like time-of-day, holiday patterns, or rare conditions.

### Edge Cases

**Acceptance Scenarios**:

1. **Given** all 81 achievements are seeded, **When** analyzing rarity distribution, **Then** approximately 37 common (46%), 24 rare (30%), 15 epic (19%), 5 legendary (6%)
2. **Given** duration milestones are seeded, **When** examining their rarities, **Then** 12-14h fasts are common, 16-20h are rare, 24-48h are epic, and 72h+ are legendary
3. **Given** Getting Started achievements are seeded, **When** examining their display order, **Then** order values progress logically (5: First Steps, 10: Breaking the Fast, 15: Double Digits, etc.)
4. **Given** achievements are seeded with visual identifiers, **When** querying any achievement, **Then** it has an emoji icon (🏆, ⏱️, 🔥, etc.) and iconColor hex value appropriate to its category

---

### User Story 4 - Support Special Achievement Types (Priority: P2)

The system must include special achievements (secret badges, time-released badges, holiday achievements) that add discovery elements and seasonal engagement to the achievement system.

**Why this priority**: Special achievements drive long-term engagement and provide surprise elements. While not critical for MVP, they significantly enhance the gamification experience and give advanced users unique goals.

**Independent Test**: Can be fully tested by reviewing seeded achievements, identifying those marked with isSecret=true or with future releaseDate values, and verifying special category achievements include unique criteria like time-of-day, holiday patterns, or rare conditions.

**Acceptance Scenarios**:

1. **Given** legendary achievements are seeded, **When** examining their isSecret flags, **Then** at least 5-7 legendary achievements are marked secret (e.g., "Unbreakable" 500-day streak, "Legendary Streak" 1000-day streak, "Iron Will", "Unstoppable", "Immortal")
2. **Given** special category achievements are seeded, **When** examining their criteria, **Then** achievements include unique conditions like "Social Faster" (fast during holiday), "Sunrise Starter" (start at 5am), "Zen Master" (meditation notes)
3. **Given** achievements are seeded with release dates, **When** querying achievements, **Then** 5-10 achievements have future releaseDate values for gradual catalog expansion
4. **Given** the Knowledge & Exploration category is populated, **When** examining these achievements, **Then** they reference biological fasting stages (stage 5, stage 8, stage 10, ketosis, autophagy) for future stage-tracking integration

---

### Edge Cases

- What happens when the seed script runs multiple times? Script uses upsert pattern to update existing achievements by achievementId, preventing duplicates
- How does system handle achievements requiring features not yet implemented (weight tracking, stage monitoring)? Use 'custom' criteria type with descriptive params that document future requirements
- What if a user's preferred language doesn't exist in translations? System falls back to English (default language) as per existing API logic in Feature 029
- How are achievement display orders maintained when new achievements are added? Use gaps in order numbering (5, 10, 15, 20) to allow insertions without reordering entire category

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create 81 achievement definitions spanning 8 distinct categories (getting-started: 8, duration: 12, streak: 10, goal: 8, weight: 8, consistency: 12, special: 15, knowledge: 8)
- **FR-002**: System MUST provide bilingual translations (English and Spanish) for each achievement with name, description, and shortDescription fields
- **FR-003**: System MUST assign unlock criteria to each achievement using supported types (duration-milestone, streak, entry-count) or custom type for future features
- **FR-004**: System MUST assign point values scaled by rarity: common (5-25), rare (30-75), epic (80-150), legendary (200-500)
- **FR-005**: System MUST assign rarity levels (common, rare, epic, legendary) based on achievement difficulty and exclusivity
- **FR-006**: System MUST set display order within each category to create logical progression paths for users
- **FR-007**: System MUST assign emoji icons and hex color codes appropriate to each achievement's category and theme
- **FR-008**: System MUST mark 5-7 legendary achievements as secret (isSecret=true) for discovery elements
- **FR-009**: System MUST reference system admin user (system@achievements.local) as createdBy for all seeded achievements

- **FR-010**: System MUST set all seeded achievements as active (isActive=true) unless designated for future release
- **FR-011**: Getting Started category MUST include 8 achievements for new users (first entry, first fast, 10h, 16h, 12-day streak, 7-day streak, water logging, note taking)
- **FR-012**: Duration Milestones category MUST include 12 achievements covering 12h, 14h, 16h, 18h, 20h, 22h, 24h, 36h, 48h, 72h, 96h, and 120h fasting durations
- **FR-013**: Streak Achievements category MUST include 10 achievements for consecutive day milestones (3, 7, 14, 30, 90, 100, 180, 365, 500, 1000 days)

- **FR-014**: Goal Achievements category MUST include 8 achievements for goal completion patterns (first goal, overachiever, consecutive goals, total goals)
- **FR-015**: Weight Tracking category MUST include 8 achievements for weight logging and progress milestones (logging streaks, weight loss targets, goal achievement)
- **FR-016**: Consistency & Dedication category MUST include 12 achievements for long-term engagement patterns (entry milestones, journaling, time-of-day patterns)
- **FR-017**: Special Achievements category MUST include 15 achievements for unique accomplishments (personal bests, rare conditions, stage exploration)
- **FR-018**: Knowledge & Exploration category MUST include 8 achievements for biological stage-related milestones (stage progression, repeated stage achievement)

### Non-Functional Requirements

- **NFR-001**: Seed script MUST complete execution in under 30 seconds for all 81 achievements
- **NFR-002**: Achievement definitions MUST use consistent naming conventions (title case for names, sentence case for descriptions)
- **NFR-003**: Spanish translations MUST be grammatically correct and culturally appropriate (not machine-translated placeholder text)
- **NFR-004**: Criteria parameters MUST be realistic and achievable (no impossible targets like 10,000-day streaks)
- **NFR-005**: Point values MUST create balanced progression across achievement catalog (no single achievement worth more than cumulative value of 10 common achievements)

### Key Entities

**Achievement** (existing model, populated with content):
- achievementId: Unique slug identifier for each of 81 achievements
- translations: English and Spanish name/description/shortDescription for all achievements
- category: One of 8 categories with proper distribution (8-15 achievements per category)
- criteria: Type and params defining unlock conditions (duration-milestone, streak, entry-count, custom)
- points: Gamification currency scaled by difficulty (5-500 points)
- rarity: Difficulty tier (common/rare/epic/legendary) based on achievement exclusivity
- order: Display sequence within category for logical progression
- icon: Emoji character representing achievement theme
- iconColor: Hex color code matching category/achievement theme
- isActive: All set to true except future-release achievements
- isSecret: Set to true for ~5-10 legendary/exclusive achievements
- releaseDate: Future date for ~5-10 achievements to enable gradual catalog expansion
- createdBy: Reference to system admin user

## Success Criteria

1. **Content Completeness**: Database contains 81 active achievements distributed across all 8 categories (8 getting-started, 12 duration, 10 streak, 8 goal, 8 weight, 12 consistency, 15 special, 8 knowledge)
2. **Multilingual Coverage**: 100% of achievements have complete English and Spanish translations with no missing name/description/shortDescription fields
3. **Criteria Validity**: 100% of achievements have properly structured criteria objects with valid type fields and appropriate params matching their achievement description
4. **Gamification Balance**: Point values create clear progression tiers (common 5-25, rare 30-75, epic 80-150, legendary 200-500) with no overlaps between rarity levels
5. **User Engagement**: Users have clear achievement paths from easy (first entry) to legendary (1000-day streak) with multiple goals available at each skill level
6. **Category Distribution**: Each of 8 categories contains logically grouped achievements with progressive difficulty (e.g., Duration category progresses from 12h to 120h)
7. **Discovery Elements**: 5-7 legendary achievements are marked secret, creating surprise unlock moments for advanced users
8. **Future Readiness**: Achievements requiring unimplemented features (weight goals, stage tracking) use 'custom' criteria type with clear params for future development
9. **Execution Reliability**: Seed script runs successfully without errors, handles re-execution gracefully (no duplicate creation), and completes in under 30 seconds
10. **Visual Consistency**: All achievements have emoji icons and color codes that create visual identity within categories (e.g., all duration achievements use time-related emojis and purple tones)

## Assumptions

1. The existing Achievement model from Feature 028 supports all required fields (translations, criteria, points, rarity, icon, iconColor, isActive, isSecret, releaseDate, order)
2. The seed script will extend scripts/seed-achievements.js which currently creates 6 sample achievements
3. System admin user (system@achievements.local) exists or will be created by the seed script for createdBy references
4. Spanish translations will be provided by domain expert or professional translation service (not machine-translated placeholders)
5. Future features for weight tracking, goal completion tracking, and biological stage monitoring will be implemented to support 'custom' criteria achievements
6. The achievement evaluation service (Feature 029) already supports duration-milestone, streak, and entry-count criteria types
7. Re-running the seed script will be safe (idempotent) either by checking for existing achievementIds or by using MongoDB upsert operations
8. Badge images will be added in a future feature - this seed data focuses on text content, criteria, and metadata
9. The 8 category enum values are fixed and defined in the Achievement model schema
10. Display order numbering will use gaps (1, 5, 10, 15) to allow future insertion of new achievements without full re-ordering

## Dependencies

- Feature 028 (Achievement & Badges Database Models) - COMPLETE: Provides Achievement and UserAchievement models with all required fields
- Feature 029 (Achievement API Endpoints) - COMPLETE: Provides API endpoints and evaluation service that will use these seeded achievements
- System admin user creation - REQUIRED: Seed script needs existing admin user for createdBy field or must create it
- MongoDB connection - REQUIRED: Seed script requires database access to insert Achievement documents

## Out of Scope

- Badge image uploads or generation (will be separate feature)
- Real-time achievement unlock notifications (planned for future feature)
- Admin UI for managing achievement catalog (planned for separate feature)
- Achievement editing or deletion functionality (can be done via MongoDB directly or future admin UI)
- User achievement progress import or migration from external systems
- Achievement analytics or statistics tracking
- Localization beyond English and Spanish (additional languages can be added in future updates)
- Achievement versioning or change history tracking
- Custom achievement creation by non-admin users
