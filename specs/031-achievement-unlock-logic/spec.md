# Feature Specification: Achievement Unlock Logic

**Feature Branch**: `031-achievement-unlock-logic`  
**Created**: November 6, 2025  
**Status**: Draft  
**Input**: Implement automatic achievement unlocking system that evaluates user entries against achievement criteria and creates UserAchievement records when conditions are met.

## Clarifications

### Session 2025-11-06

- Q: Should streak calculation use entry creation timestamp or actual fasting period (meal times)? → A: Use actual fasting period (meal times) to calculate streaks, not record creation timestamp.
- Q: Should weight loss achievements track all-time lowest weight or current weight? → A: Current/most recent weight only - achievement unlocks based on current weight (must maintain loss).
- Q: Should achievement evaluation run on entry updates (PUT), risking gaming when users edit entries? → A: Evaluate on both POST and PUT with idempotency. Gaming mitigated by hiding locked achievements from users (only show progress count and unlocked achievements).
- Q: Should batch UserAchievement creation use MongoDB transactions or simpler approach? → A: Sequential creates with unique constraint - simple, fast, idempotent (partial success is acceptable).
- Q: What cache strategy for achievement definitions (refresh frequency when admin adds new achievements)? → A: Time-based cache with 1-hour TTL - balances performance with reasonable freshness for admin changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Duration Milestone Unlocking (Priority: P1)

When a user saves a fasting entry, the system automatically evaluates whether the entry's duration qualifies for any duration-based achievements (e.g., "12-Hour Starter", "24-Hour Warrior") and unlocks them immediately.

**Why this priority**: Duration milestones are the most fundamental achievement type with 81 existing achievements depending on this logic. This is the core value proposition of the achievements system.

**Independent Test**: Can be fully tested by creating a user, saving entries with varying `fastingDuration` values (12h, 24h, 48h, 72h), and verifying UserAchievement records are created with correct achievementIds and progress values.

**Acceptance Scenarios**:

1. **Given** a user with no achievements, **When** they save an entry with `fastingDuration=720` (12 hours), **Then** the "first-twelve" achievement is unlocked and a UserAchievement record is created
2. **Given** a user who already unlocked "first-twelve", **When** they save another 12-hour entry, **Then** no duplicate UserAchievement is created (idempotent)
3. **Given** a user with no achievements, **When** they save an entry with `fastingDuration=1440` (24 hours), **Then** both "first-twelve" and "first-twentyfour" achievements are unlocked in a single batch

---

### User Story 2 - Batch Multi-Achievement Unlocking (Priority: P1)

When a user's entry qualifies for multiple achievements simultaneously (e.g., a 72-hour fast unlocks 12h, 24h, 48h, and 72h milestones), all eligible achievements are unlocked together and presented to the user in a single notification.

**Why this priority**: Essential for performance and user experience. Without batch processing, each achievement evaluation would trigger separate database operations and notifications, causing poor UX and potential race conditions.

**Independent Test**: Can be fully tested by creating a user with no achievements, saving a single 72-hour entry, and verifying that 4+ UserAchievement records are created atomically with a single notification showing all unlocked achievements.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they save their first entry with `fastingDuration=4320` (72 hours), **Then** achievements "first-twelve", "first-twentyfour", "first-fortyeight", and "seventytwo-hour-champion" are all unlocked together
2. **Given** batch unlocking occurs, **When** the unlock operation completes, **Then** the API response includes all newly unlocked achievements in a single `unlockedAchievements` array
3. **Given** multiple achievements are unlocked, **When** the response reaches the client, **Then** a single toast notification displays all achievement names together (not separate toasts)

---

### User Story 3 - Streak Achievement Tracking (Priority: P2)

When a user saves consecutive daily entries, the system tracks their streak progress and unlocks streak-based achievements (e.g., "Seven-Day Dedication", "Month-Long Marathon") when milestones are reached.

**Why this priority**: Streaks are a proven engagement mechanism but require more complex date-range queries and historical data analysis. Dependent on basic unlocking working first.

**Independent Test**: Can be fully tested by creating entries for consecutive dates, verifying the streak count increments correctly, and confirming streak achievements unlock at days 3, 7, 14, 30, 60, 90.

**Acceptance Scenarios**:

1. **Given** a user with entries on 2024-11-01 and 2024-11-02, **When** they save an entry for 2024-11-03, **Then** the "three-day-streak" achievement is unlocked
2. **Given** a user with a 6-day streak, **When** they save an entry on day 7, **Then** the "seven-day-dedication" achievement is unlocked and `progress` field shows `{ currentStreak: 7 }`
3. **Given** a user with a 30-day streak, **When** they miss a day and restart, **Then** previously unlocked streak achievements remain (not revoked) but new progress starts from 1

---

### User Story 4 - Goal Completion Achievement Tracking (Priority: P2)

When a user marks their entry as having met their daily goal (`goalStatus: 'completed'`), the system tracks cumulative goal completions and unlocks achievements for milestones like 10, 25, 50, 100 completed goals.

**Why this priority**: Goal-based achievements drive user engagement with Feature 020 (Goal System) but are less critical than duration milestones. Requires counting historical entries with `goalStatus='completed'`.

**Independent Test**: Can be fully tested by creating multiple entries with `goalStatus='completed'`, verifying the count increments correctly, and confirming goal achievements unlock at counts 10, 25, 50, 100.

**Acceptance Scenarios**:

1. **Given** a user with 9 completed goals, **When** they save an entry with `goalStatus='completed'`, **Then** the "ten-goals-reached" achievement is unlocked
2. **Given** a user saves an entry with `goalStatus='not-completed'`, **When** the achievement service evaluates, **Then** no goal-based achievement is unlocked and the count remains unchanged
3. **Given** a user with 50 completed goals, **When** they save entry #51 with `goalStatus='completed'`, **Then** the "fifty-goals-mastered" achievement is unlocked with `progress: { goalsCompleted: 51 }`

---

### User Story 5 - Weight Loss Achievement Tracking (Priority: P3)

When a user saves entries with `morningWeight` values, the system tracks cumulative weight loss from their starting weight and unlocks achievements for milestones like 5, 10, 25, 50, 75 pounds lost.

**Why this priority**: Weight-based achievements are valuable for long-term motivation but require user profile data (starting weight) and consistent weight logging. Lower priority as not all users track weight.

**Independent Test**: Can be fully tested by creating a user with `startingWeight=200`, saving entries with decreasing `morningWeight` values, and verifying weight-loss achievements unlock at 5lb, 10lb, 25lb intervals.

**Acceptance Scenarios**:

1. **Given** a user with `startingWeight=200`, **When** they save an entry with `morningWeight=195`, **Then** the "five-pounds" achievement is unlocked
2. **Given** a user with no `startingWeight` in their profile, **When** they save entries with `morningWeight` values, **Then** no weight-loss achievements are evaluated
3. **Given** a user's weight fluctuates (200→195→197→190→192), **When** calculating weight loss, **Then** the system uses the current/most recent weight (192) for a total loss of 8 pounds (not historical lowest)

---

### User Story 6 - Custom Criteria Evaluation (Priority: P3)

When an achievement has `criteria.type='custom'`, the system evaluates custom business logic defined in the AchievementService (e.g., "First Morning Fast", "Weekend Warrior") that requires multiple field checks or complex conditions.

**Why this priority**: Custom criteria provide flexibility for unique achievements but are lower volume (few achievements use this) and can be added incrementally after standard criteria types work.

**Independent Test**: Can be fully tested by creating an achievement with `criteria.type='custom'` and `criteria.customKey='first-morning-entry'`, saving an entry with specific field values, and verifying the custom evaluation logic triggers correctly.

**Acceptance Scenarios**:

1. **Given** an achievement "Early Bird" with `customKey='first-morning-entry'`, **When** a user saves their first entry with a meal before 8am, **Then** the achievement is unlocked
2. **Given** an achievement "Weekend Warrior" with `customKey='weekend-fasts'`, **When** a user saves entries on Saturday and Sunday, **Then** the achievement is unlocked
3. **Given** a custom achievement's evaluation logic is not yet implemented, **When** the service encounters it, **Then** it logs a warning and skips evaluation without throwing errors

---

## Functional Requirements *(mandatory)*

1. **AchievementService Class**: Create `src/lib/services/AchievementService.js` with methods:
   - `evaluateAndUnlock(userId, entryId)` - Main entry point called after entry save
   - `evaluateDurationAchievements(userId, entry)` - Check duration-milestone criteria
   - `evaluateStreakAchievements(userId, entry)` - Check streak criteria
   - `evaluateEntryCountAchievements(userId)` - Check entry-count criteria
   - `evaluateGoalAchievements(userId)` - Check goal-completion criteria
   - `evaluateWeightAchievements(userId)` - Check weight-loss criteria
   - `evaluateCustomAchievements(userId, entry)` - Check custom criteria
   - `unlockAchievements(userId, achievementIds)` - Batch create UserAchievement records

2. **Criteria Evaluation Logic**: For each achievement criteria type, implement evaluation:
   - **duration-milestone**: Compare `entry.fastingDuration` against `criteria.params.minDuration`
   - **streak**: Query entries for consecutive dates, count streak length, compare against `criteria.params.streakLength`
   - **entry-count**: Count total entries for user, compare against `criteria.params.entryCount`
   - **goal-completion**: Count entries with `goalStatus='completed'`, compare against `criteria.params.goalsCompleted`
   - **weight-loss**: Calculate `user.startingWeight - entry.morningWeight`, compare against `criteria.params.poundsLost`
   - **custom**: Dispatch to custom evaluation functions based on `criteria.params.customKey`

3. **API Integration**: Integrate AchievementService into entry save operations:
   - **POST /api/entries**: After successful entry creation, call `AchievementService.evaluateAndUnlock(userId, entryId)`
   - **PUT /api/entries**: After successful entry update, call `AchievementService.evaluateAndUnlock(userId, entryId)`
   - Handle errors gracefully - achievement evaluation failures should not prevent entry saves

4. **UserAchievement Record Creation**: When achievements are unlocked:
   - Create UserAchievement document with: `{ userId, achievementId, unlockedAt: new Date(), progress: {...} }`
   - Use `UserAchievement.create()` with unique constraint on `(userId + achievementId)` to prevent duplicates
   - Handle `E11000` duplicate key errors silently (achievement already unlocked)
   - Populate `progress` field with relevant metrics (e.g., `{ currentStreak: 7 }`, `{ goalsCompleted: 10 }`)

5. **User achievementPoints Update**: When achievements are unlocked:
   - Query Achievement documents for newly unlocked achievements to get `points` values
   - Sum all points and increment `user.achievementPoints` using atomic update
   - Use `User.findByIdAndUpdate()` with `$inc: { achievementPoints: totalPoints }`

6. **Batch Unlocking**: When multiple achievements qualify simultaneously (see User Story 2 for detailed acceptance scenarios):
   - Collect all eligible achievementIds in an array before creating UserAchievement records
   - Create UserAchievement records sequentially using individual `create()` calls (no transactions required)
   - Rely on unique constraint `(userId + achievementId)` for idempotency - catch E11000 errors silently
   - Return all newly unlocked Achievement documents in API response under `unlockedAchievements` field

7. **Toast Notifications**: When achievements are unlocked:
   - Return unlocked achievements in API response: `{ entry: {...}, unlockedAchievements: [{ achievementId, name, points, rarity }] }`
   - Frontend displays toast notification using existing toast system (Feature 021)
   - Toast shows achievement name, points earned, and rarity badge
   - For multiple achievements, show single toast with "You unlocked 3 achievements! (+150 points)"

8. **Performance Requirements**:
   - Achievement evaluation must complete in <200ms for typical cases (user with <100 entries)
   - Use efficient queries with appropriate indexes on Entry collection
   - Cache Achievement definitions in memory with 1-hour TTL (rarely change, read-heavy)
   - Avoid N+1 query patterns when evaluating multiple criteria types

9. **Idempotency**: Achievement unlocking must be idempotent:
   - Re-evaluating the same entry multiple times does not create duplicate UserAchievement records
   - Relies on unique compound index `(userId + achievementId)` on UserAchievement collection
   - Duplicate unlock attempts return silently without errors

10. **Error Handling**:
    - Log achievement evaluation errors using existing logger (Feature 026)
    - Return user-friendly error messages in API responses
    - Never block entry saves due to achievement evaluation failures
    - Track evaluation errors in audit logs for debugging

11. **Testing Requirements**:
    - Unit tests for each criteria evaluation method (duration, streak, count, goal, weight, custom)
    - Integration tests for full evaluateAndUnlock flow with real Entry/Achievement/UserAchievement models
    - Edge case tests for: duplicate unlocking, missing data, invalid criteria, concurrent unlocks
    - Performance tests ensuring <200ms evaluation time with 100+ entries

12. **Streak Calculation Logic**:
    - Query entries ordered by fasting end time (lastMeal or equivalent) descending
    - Calculate calendar dates based on actual fasting period (meal times), not entry creation timestamp
    - Count consecutive days where user had active fasts (based on fasting period dates)
    - Consider fasts on consecutive calendar dates as maintaining streak
    - Multiple entries on same date do not break or extend streak (count as single day)

13. **Weight Loss Calculation Logic**:
    - Require `user.startingWeight` field to be set (exit early if missing)
    - Use most recent `entry.morningWeight` value for calculation (current weight, not historical lowest)
    - Calculate loss as: `startingWeight - currentMorningWeight`
    - Achievement eligibility evaluated based on sustained current weight at time of unlock - achievements remain unlocked even if weight increases later (permanent once earned)
    - Ignore negative values (weight gain does not unlock achievements)

14. **Custom Criteria Registry**:
    - Maintain object mapping `customKey` to evaluation functions
    - Example: `{ 'first-morning-entry': evaluateFirstMorningEntry, 'weekend-fasts': evaluateWeekendFasts }`
    - Log warning if customKey not found in registry
    - Allow adding new custom evaluators without modifying core service

15. **Achievement Filtering**:
    - Only evaluate achievements with `isActive=true`
    - Secret achievements (`isSecret=true`) are evaluated normally but not shown in UI until unlocked
    - Filter achievements by category if entry provides context (e.g., only check weight achievements if `morningWeight` present)

16. **Progress Tracking**:
    - Store incremental progress in `UserAchievement.progress` field for debugging
    - Example duration achievement: `{ durationMinutes: 1440 }`
    - Example streak achievement: `{ currentStreak: 7, longestStreak: 14 }`
    - Example goal achievement: `{ goalsCompleted: 25 }`

17. **Concurrent Unlock Prevention**:
    - Use database unique constraints as primary mechanism (not application locks)
    - If two simultaneous requests try to unlock same achievement, one succeeds and one receives E11000 error
    - Catch E11000 errors and treat as success (achievement already unlocked)

18. **API Response Format**: Entry save endpoints return:
    ```json
    {
      "entry": { ... },
      "unlockedAchievements": [
        {
          "achievementId": "first-twelve",
          "name": { "en": "12-Hour Starter" },
          "points": 10,
          "rarity": "common",
          "icon": "🎯"
        }
      ],
      "totalPointsEarned": 10
    }
    ```

19. **Logging Requirements**:
    - Log each achievement evaluation with userId, entryId, criteriaType, result
    - Log batch unlocks with userId, achievementIds array, totalPoints
    - Log evaluation errors with full context for debugging
    - Use structured logging (JSON format) for easy parsing

20. **Database Queries**:
    - **Streak calculation**: `Entry.find({ userId }).sort({ date: -1 }).limit(100).select('date')`
    - **Entry count**: `Entry.countDocuments({ userId })`
    - **Goal count**: `Entry.countDocuments({ userId, goalStatus: 'completed' })`
    - **Weight query**: `Entry.findOne({ userId, morningWeight: { $exists: true } }).sort({ date: -1 })`
    - **Achievement lookup**: `Achievement.find({ isActive: true }).lean()` with 1-hour in-memory cache

---

## Success Criteria *(mandatory)*

1. **Duration achievements unlock correctly**: When a user saves a 24-hour entry, the "first-twentyfour" achievement is unlocked and visible in `/achievements` page with green highlight.

2. **Batch unlocking works**: When a new user saves a 72-hour entry, at least 4 achievements unlock simultaneously and the API response includes all in the `unlockedAchievements` array.

3. **Idempotency verified**: Saving multiple entries with the same duration does not create duplicate UserAchievement records for the same achievementId.

4. **Streak tracking accurate**: Creating entries for 7 consecutive dates unlocks the "seven-day-dedication" achievement on day 7.

5. **Goal tracking works**: Creating 10 entries with `goalStatus='completed'` unlocks the "ten-goals-reached" achievement.

6. **Weight loss tracking works**: For a user with `startingWeight=200`, saving entries with `morningWeight` values decreasing to 195, 190, 185 unlocks achievements at 5lb, 10lb, 15lb thresholds.

7. **Performance target met**: Achievement evaluation completes in <200ms for users with <100 entries (measured via API response time).

8. **Toast notifications display**: After unlocking achievements, the frontend shows toast notification with achievement name, points, and rarity.

9. **User points updated**: After unlocking achievements, the user's `achievementPoints` field is incremented by the sum of all unlocked achievement points.

10. **Error resilience**: If achievement evaluation throws an error, the entry still saves successfully and the error is logged without crashing the API.

---

## Edge Cases *(optional but recommended)*

1. **Concurrent Entry Saves**: Two simultaneous entry saves for the same user might evaluate the same achievement criteria. The unique index on UserAchievement prevents duplicates.

2. **Entry Updates**: Updating an existing entry's `fastingDuration` from 12h to 24h re-evaluates achievements based on the new value. Idempotent unlocking (unique constraint) prevents duplicate "first-twelve" achievements. Gaming mitigated by hiding locked achievements from UI.

3. **Entry Deletion**: Deleting entries does NOT revoke achievements (achievements are permanent once unlocked).

4. **Streak Breaks**: If a user has a 10-day streak and then misses a day, the streak resets to 0. Previously unlocked streak achievements remain unlocked.

5. **Missing User Data**: If `user.startingWeight` is not set, weight-loss achievement evaluation is skipped silently.

6. **Invalid Entry Data**: If `entry.fastingDuration` is null or negative, duration achievement evaluation is skipped.

7. **Achievement Deactivation**: If an achievement is deactivated (`isActive=false`) after users have unlocked it, the UserAchievement records remain intact but new users cannot unlock it.

8. **Timezone Considerations**: Streak calculation uses actual fasting period dates (derived from meal times). Calendar date boundaries are determined by the user's meal timestamps, ensuring consistent streak tracking regardless of record creation time.

9. **Custom Criteria Missing**: If an achievement has `criteria.type='custom'` but the `customKey` is not found in the registry, log a warning and skip evaluation.

10. **Achievement Definition Changes**: If an achievement's criteria changes (e.g., minDuration changes from 720 to 600), previously unlocked instances remain valid but new evaluations use new criteria.

---

## Assumptions *(optional but recommended)*

1. **Entry Model Stability**: Entry model has stable fields (`fastingDuration`, `date`, `goalStatus`, `morningWeight`) that will not change during this feature's development.

2. **Achievement Model Stability**: Achievement model criteria structure (type + params) is stable and extensible for future criteria types.

3. **Unique Constraints Enforced**: The UserAchievement collection has a unique compound index on `(userId + achievementId)` to prevent duplicates.

4. **User Model Extended**: User model has an `achievementPoints` field (Number, default 0) for storing total points.

5. **Toast System Exists**: Frontend has a toast notification system (Feature 021) that can be invoked with achievement data.

6. **Single-User Entries**: Each entry belongs to exactly one user (no shared or collaborative entries).

7. **Date Storage Format**: Entry dates are stored as Date objects representing midnight UTC for consistent streak calculations.

8. **Achievement Definitions Complete**: All 81 achievements have valid criteria objects with proper type and params fields.

9. **Performance Baseline**: Most users have <100 entries, making full entry scans feasible for streak/count calculations.

10. **No Manual Unlocking**: Achievements are only unlocked through automatic evaluation (no admin interface for manual unlocking yet).

---

## Dependencies *(mandatory)*

1. **Feature 028**: Achievement Schema & Models - Provides Achievement and UserAchievement models
2. **Feature 029**: Achievement API Endpoints - Provides `/api/user/achievements` for fetching unlocked achievements
3. **Feature 030**: Achievement Content Seed Data - Provides 81 achievements with criteria definitions
4. **Feature 020**: Goal System - Provides `goalStatus` field on Entry model for goal-based achievements
5. **Entry Model**: Existing Entry model with fields: `fastingDuration`, `date`, `goalStatus`, `morningWeight`
6. **User Model**: Extended with `achievementPoints` field (Number, default: 0)
7. **Feature 021**: Toast Notification System - For displaying unlock notifications
8. **MongoDB Indexes**: Unique compound index on UserAchievement `(userId + achievementId)`, index on Entry `(userId + date)`
9. **Logger System**: Feature 026 Security Logger for error logging

---

## Out of Scope *(mandatory)*

1. **Achievement Revocation**: Deleting entries does not revoke previously unlocked achievements
2. **Manual Unlocking**: No admin interface for manually granting achievements to users
3. **Achievement Progress UI**: No progress bars or "X% to next achievement" indicators in this feature
4. **Leaderboards**: No ranking or comparison features showing top users by points
5. **Achievement Badges**: No image uploads or custom icons (uses emoji from seed data)
6. **Push Notifications**: Toast notifications only (no email/SMS/push when achievements unlock)
7. **Retroactive Unlocking**: No batch job to unlock achievements for existing entries (only new entries)
8. **Achievement Analytics**: No tracking of "most unlocked" or "rarest" achievements
9. **Social Features**: No sharing achievements to social media
10. **Achievement Filtering**: No user preferences to disable certain achievement categories
11. **Time-Limited Achievements**: No "unlock before date X" or seasonal achievements
12. **Multi-Language Notifications**: Toast notifications show English names only (translations exist in Achievement model but not used in toasts)
13. **Achievement Sound Effects**: No audio cues when achievements unlock

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

