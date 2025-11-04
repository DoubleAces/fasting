# Implementation Plan: Achievement & Badges Database Models

**Branch**: `028-achievement-badges-models` | **Date**: November 4, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/028-achievement-badges-models/spec.md`

## Summary

Create three MongoDB/Mongoose models to support the Achievement & Badges gamification system: (1) **Achievement** model for storing badge definitions with multilingual translations, unlock criteria, and visual assets; (2) **UserAchievement** model for tracking user progress and unlocked badges with unique constraints; (3) **User model extensions** adding preferredLanguage and achievementPoints fields. This feature focuses exclusively on database schema definition with proper validation, indexes, and following existing project patterns from Entry.js and User.js models.

**Technical Approach**: Use Mongoose ODM with schema validation, compound indexes for query performance, flexible criteria object using Schema.Types.Mixed for future extensibility, and string-based achievementId references to support soft deletes.

## Technical Context

**Language/Version**: JavaScript (ES6+) / Node.js (current project version)  
**Primary Dependencies**: Mongoose ODM (existing), MongoDB 4.4+  
**Storage**: MongoDB with compound indexes (userId+achievementId unique, userId+unlockedAt descending)  
**Testing**: Jest + Mongoose testing patterns (existing project setup)  
**Target Platform**: Next.js web application (existing)  
**Project Type**: Web application (Next.js App Router with MongoDB backend)  
**Performance Goals**: <100ms category queries for up to 100 achievements, 10x query improvement with indexes  
**Constraints**: MongoDB 4.4+ required for compound indexes and Mixed types, no breaking changes to existing User model  
**Scale/Scope**: 80+ achievement definitions expected, thousands of UserAchievement documents per active user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Test-Driven Development (MANDATORY)
- **Status**: PASS - Feature specification includes 3 independently testable user stories with acceptance scenarios
- **Implementation Plan**: Write unit tests for model validation, unique constraints, and field defaults before implementing schemas
- **Test Types Required**: 
  - Unit tests: Schema validation, enum constraints, default values, index enforcement
  - Integration tests: Model CRUD operations, compound index uniqueness, User model compatibility

### ✅ Next.js Best Practices
- **Status**: PASS - Database models are framework-agnostic but follow Next.js project structure
- **Alignment**: Models placed in `src/lib/models/` following existing Entry.js and User.js patterns
- **Server Component Ready**: Models export for use in Server Components and API routes

### ✅ Mobile-First Responsive Design
- **Status**: N/A - Database models have no UI component
- **Note**: UI rendering of achievements will be addressed in separate frontend feature

### ✅ Component Architecture
- **Status**: N/A - Database layer, no React components in this feature
- **Note**: Achievement display components planned for future feature

### ✅ User Privacy & Data Security
- **Status**: PASS - Achievement data is not PII, UserAchievement links to existing authenticated User model
- **Security Considerations**: 
  - achievementPoints field on User model does not affect authentication
  - UserAchievement documents reference userId with proper ObjectId validation
  - No sensitive user data stored in achievement schemas

### ✅ Performance & Accessibility
- **Status**: PASS (Database Performance)
- **Performance Measures**:
  - Compound unique index on UserAchievement (userId + achievementId) prevents duplicate unlocks at DB level
  - Descending index on UserAchievement (userId + unlockedAt) optimizes "recent achievements" queries
  - Category enum on Achievement enables efficient filtering
  - Success criteria: SC-002 (<100ms category queries), SC-006 (10x index improvement)
- **Accessibility**: N/A for database models

### ✅ Database Conventions (From Constitution)
- **Status**: PASS - Fully aligned
- **Mongoose Schemas**: All three models use Mongoose with JSDoc documentation
- **Indexing**: Compound indexes specified for query performance (userId+achievementId unique, userId+unlockedAt desc)
- **Atomic Operations**: Schema validation enforces data integrity at write time
- **Soft Deletes**: String-based achievementId (not ObjectId) allows Achievement soft deletes without breaking UserAchievement references
- **Audit Trails**: Both Achievement and UserAchievement include timestamps (createdAt, updatedAt), Achievement includes createdBy

**Overall Gate Status**: ✅ **PASS** - All applicable constitution requirements met, no violations to justify

## Project Structure

### Documentation (this feature)

```
specs/028-achievement-badges-models/
├── plan.md              # This file
├── research.md          # Phase 0 output: Mongoose patterns, index strategies, validation best practices
├── data-model.md        # Phase 1 output: Entity relationships, field specifications, validation rules
├── quickstart.md        # Phase 1 output: How to use models, example queries, testing guide
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/lib/models/
├── Achievement.js          # NEW: Achievement schema with multilingual translations and criteria
├── UserAchievement.js      # NEW: User progress tracking with compound indexes
├── User.js                 # MODIFIED: Add preferredLanguage and achievementPoints fields
└── Entry.js                # UNCHANGED: Reference for existing patterns

tests/unit/models/
├── Achievement.test.js     # NEW: Unit tests for Achievement schema validation
├── UserAchievement.test.js # NEW: Unit tests for UserAchievement constraints and indexes
└── User.test.js            # MODIFIED: Add tests for new preferredLanguage and achievementPoints fields

tests/integration/
└── achievement-models.test.js  # NEW: Integration tests for model interactions and database operations
```

**Structure Decision**: This is a Next.js web application following Option 2 structure. Models are placed in `src/lib/models/` per existing project convention (Entry.js, User.js already present). Tests follow existing project structure with unit tests in `tests/unit/models/` and integration tests in `tests/integration/`.

## Complexity Tracking

*No violations - this section intentionally left empty as Constitution Check passed all gates.*

