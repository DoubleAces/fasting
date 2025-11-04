# Research: Achievement & Badges Database Models

**Feature**: 028-achievement-badges-models  
**Date**: November 4, 2025  
**Phase**: 0 - Research & Design Decisions

## Overview

This document consolidates research findings and design decisions for implementing Achievement and UserAchievement MongoDB models with Mongoose ODM, plus User model extensions.

## Design Decisions

### 1. String-Based Achievement References vs ObjectId

**Decision**: Use String-based achievementId (not ObjectId) for UserAchievement → Achievement relationship

**Rationale**:
- **Soft Delete Support**: Achievements may be retired/deprecated without breaking user progress history
- **Flexibility**: Achievement definitions can be moved, renamed, or restructured without updating UserAchievement documents
- **Human-Readable**: Slug-based IDs ('sweet-sixteen', 'first-fast') are debuggable and portable
- **Cross-Environment**: Same achievementId works across dev/staging/prod without ObjectId sync issues

**Alternatives Considered**:
- **ObjectId Reference with Ref**: Standard Mongoose pattern but requires cascade delete or orphaned records on Achievement deletion
- **Composite Key**: More complex, no advantages for this use case
- **UUID**: Less readable than slugs, no practical benefit

**Implementation**: Achievement.achievementId is unique String index, UserAchievement.achievementId is String (no ref)

---

### 2. Nested Translations Object vs Separate Collection

**Decision**: Store translations as nested object within Achievement document

**Rationale**:
- **Atomicity**: All language variants updated together, no sync issues
- **Query Simplicity**: Single document read gets all translations
- **Write Pattern**: Achievements are admin-created, translations added infrequently (not user-generated content)
- **Document Size**: 5 languages × 3 fields × ~200 chars = ~3KB, well under 16MB MongoDB limit

**Alternatives Considered**:
- **Separate AchievementTranslation Collection**: Overkill for small, admin-managed dataset; adds join complexity
- **Flat Fields (name_en, name_es)**: Schema becomes rigid, adding new language requires migration

**Implementation**:
```javascript
translations: {
  en: { name: String, description: String, shortDescription: String },
  es: { ... },
  fr: { ... },
  de: { ... },
  pt: { ... }
}
```

**Validation**: Require at minimum 'en' translation, others optional (validated in application logic)

---

### 3. Flexible Criteria Object (Schema.Types.Mixed)

**Decision**: Use Schema.Types.Mixed for criteria.params to support multiple unlock criteria types

**Rationale**:
- **Extensibility**: New criteria types (e.g., 'time-of-day-fast', 'calorie-deficit') can be added without schema migration
- **Type Diversity**: Duration milestones need {hours: Number}, streaks need {days: Number}, goals need {goalType: String, count: Number}
- **Future-Proof**: Unknown requirements for special achievements (e.g., 'lunar-fast' with moon phase data)

**Alternatives Considered**:
- **Discriminator Pattern**: Separate schemas per criteria type - too rigid for admin-defined achievements
- **JSON String**: Loses MongoDB query capability, error-prone parsing
- **Predefined Union Schema**: Would require migration for each new criteria type

**Implementation**:
```javascript
criteria: {
  type: { type: String, required: true }, // 'duration-milestone', 'streak', 'entry-count', 'goal-completion'
  params: { type: Schema.Types.Mixed, required: true } // {hours: 16}, {days: 7}, {count: 100}, etc.
}
```

**Validation**: Type-specific params validation in application layer (service/controller), not schema

---

### 4. Compound Index Strategy

**Decision**: Two indexes on UserAchievement - (1) unique compound (userId + achievementId), (2) descending (userId + unlockedAt)

**Rationale**:
- **Unique Constraint**: Prevents duplicate unlocks at database level (more reliable than application logic)
- **Recent Achievements Query**: Common UI pattern shows "latest 5 unlocked badges" - index optimizes this
- **Query Performance**: SC-006 requires 10x improvement - compound indexes deliver 50-100x in practice
- **Write Cost**: Minimal - achievements unlock infrequently (not high-write workload)

**Alternatives Considered**:
- **Single userId Index**: Insufficient for uniqueness constraint, slower duplicate checks
- **Three Indexes (userId, achievementId, userId+achievementId)**: Over-indexing increases write latency and storage
- **Application-Level Uniqueness**: Race conditions possible with concurrent requests

**Implementation**:
```javascript
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, unlockedAt: -1 });
```

---

### 5. Progress Field Semantics

**Decision**: Single Number field with context-dependent interpretation (0-100 for percentages, raw counts otherwise)

**Rationale**:
- **Simplicity**: One field covers all use cases (partial completion, multi-step achievements)
- **Flexibility**: Application logic interprets based on criteria.type
- **Examples**: 
  - Duration milestone (16h): progress = 0-100 (percentage toward next milestone)
  - Streak achievement (30 days): progress = 0-30 (day count)
  - Entry count (100 entries): progress = 0-100 (entry count)

**Alternatives Considered**:
- **Separate Fields (progressPercent, progressCount)**: Confusing which to use, validation complexity
- **Progress Object {value, max, unit}**: Over-engineered for simple numeric tracking
- **String Progress**: Loses queryability (can't find "users 50%+ toward achievement")

**Implementation**: Single `progress: { type: Number, default: 0 }`, interpretation documented in JSDoc

---

### 6. User Model Extension Strategy

**Decision**: Add two new fields (preferredLanguage, achievementPoints) directly to existing User schema

**Rationale**:
- **Low Risk**: New optional fields with defaults don't break existing authentication/profile logic
- **No Migration Required**: Defaults apply to existing documents on read (Mongoose feature)
- **Query Simplicity**: Points available in User queries without joins
- **Consistent Pattern**: User model already has profile fields (name, picture, emailVerified)

**Alternatives Considered**:
- **Separate UserGameProfile Collection**: Adds join complexity for every user query showing points
- **Embedded Document**: No advantage over flat fields for two simple properties
- **Virtual Fields**: Points need persistence (not computed), language is user preference (not derived)

**Implementation**:
```javascript
preferredLanguage: {
  type: String,
  enum: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'],
  default: 'en'
},
achievementPoints: {
  type: Number,
  default: 0,
  min: 0
}
```

**Testing**: Verify no impact on existing User authentication, session, or profile methods

---

## Mongoose Best Practices Applied

### Schema Definition Patterns (from Entry.js)
- **JSDoc Comments**: Document each field's purpose and constraints
- **Validation Messages**: Custom error messages for enum violations, required fields
- **Default Values**: Explicit defaults for optional fields (isActive: true, isSecret: false, progress: 0)
- **Timestamps**: `{ timestamps: true }` option for automatic createdAt/updatedAt
- **Type Safety**: Use `mongoose.Schema.Types.ObjectId` for references, not string 'ObjectId'

### Validation Strategies
- **Required Fields**: `required: [true, 'Custom error message']` for mandatory data
- **Enum Validation**: `enum: { values: [...], message: 'Invalid value' }` for controlled vocabularies
- **Range Validation**: `min: 0` for achievementPoints (prevent negative points)
- **Custom Validators**: Not needed for this feature (simple types and enums sufficient)

### Index Best Practices
- **Compound Before Single**: (userId + achievementId) covers userId queries, no separate userId index needed
- **Descending for Dates**: `unlockedAt: -1` for "most recent first" queries
- **Unique Indexes**: Enforce data integrity at database level
- **Index Order**: Most selective field first in compound indexes (userId more selective than achievementId)

### Export Patterns (from Entry.js and User.js)
```javascript
const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);
export default Achievement;
```
**Reason**: Next.js hot reload can cause model re-registration errors, this pattern prevents crashes

---

## Performance Considerations

### Query Patterns Expected
1. **Get all achievements by category**: `Achievement.find({ category: 'duration', isActive: true })`
   - Optimized by: category field (consider index if >1000 achievements)
2. **Get user's unlocked achievements**: `UserAchievement.find({ userId }).sort({ unlockedAt: -1 })`
   - Optimized by: compound index (userId + unlockedAt desc)
3. **Check if user unlocked specific achievement**: `UserAchievement.findOne({ userId, achievementId })`
   - Optimized by: unique compound index (userId + achievementId)
4. **Get achievement with translations**: `Achievement.findOne({ achievementId })`
   - Optimized by: unique index on achievementId (implicit from unique constraint)

### Benchmark Targets (from SC-002, SC-006)
- Category queries: <100ms for 100 documents
- Index improvement: 10x faster than table scans
- Expected actual performance: 2-5ms for indexed queries on modest hardware

### Scale Planning
- **Achievement Documents**: ~100 (80 initial + growth)
- **UserAchievement Documents**: ~10,000 per 100 active users × 100 achievements = 1M docs
- **Storage**: 1M docs × 200 bytes avg = 200MB (minimal)
- **Index Size**: ~10MB for compound indexes (minimal)

**Conclusion**: Proposed schema and indexes handle expected scale with ease, no sharding required

---

## Testing Strategy

### Unit Tests (Model Validation)
- Achievement schema: Valid/invalid achievementId, translations structure, enum values, required fields
- UserAchievement schema: userId/achievementId presence, progress range, notificationSeen boolean
- User schema: preferredLanguage enum, achievementPoints non-negative, defaults applied

### Integration Tests (Database Operations)
- Create Achievement with all fields → verify saved with nested translations
- Create duplicate UserAchievement → verify unique constraint error
- Update achievementPoints on User → verify no impact on authentication methods
- Query UserAchievements sorted by unlockedAt → verify index usage (explain plan)

### Acceptance Test Mapping (from spec.md)
- User Story 1, Scenario 1: Create Achievement → translates to integration test "creates achievement with translations"
- User Story 2, Scenario 2: Duplicate unlock → translates to integration test "rejects duplicate UserAchievement"
- User Story 3, Scenario 4: Default values → translates to unit test "applies default language and points"

---

## Open Questions / Future Considerations

### Resolved in Assumptions (spec.md)
- ✅ English required minimum? → Yes (Assumption #1)
- ✅ Points can decrease? → No, always additive (Assumption #5)
- ✅ Image storage location? → External service URLs (Assumption #6)
- ✅ Unknown criteria types? → Accept any string, validate in app logic (Assumption #4)

### Deferred to Future Features
- ❓ Admin UI for badge image upload → Out of scope (separate feature)
- ❓ Automatic achievement unlock logic → Out of scope (separate feature)
- ❓ Notification system for unlocked achievements → Out of scope (separate feature)
- ❓ Migration script for existing users → Out of scope (separate task after models proven)

---

## Dependencies Confirmed

### Existing Infrastructure (Verified)
- ✅ MongoDB connection: `src/lib/mongodb.js` (existing)
- ✅ Mongoose ODM: Package.json lists mongoose (existing)
- ✅ User model: `src/lib/models/User.js` (existing, will extend)
- ✅ Test framework: Jest + testing setup (existing)

### No New Dependencies Required
- Schema.Types.Mixed: Built-in Mongoose feature
- Compound indexes: Built-in MongoDB feature (4.4+)
- Enum validation: Built-in Mongoose feature

---

## Summary

All design decisions made with rationale documented. No critical unknowns remain. Ready to proceed to Phase 1 (data-model.md and contracts).

**Key Takeaways**:
1. String-based achievementId for soft delete flexibility
2. Nested translations object for atomic updates
3. Schema.Types.Mixed for extensible criteria
4. Two compound indexes for performance and uniqueness
5. Direct User model extension (low risk, high simplicity)
6. Follow Entry.js and User.js patterns for consistency

**Risk Assessment**: LOW - All patterns proven in existing codebase, no breaking changes to authentication or critical paths
