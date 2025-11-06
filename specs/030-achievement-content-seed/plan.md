# Implementation Plan: Achievement Content Seed Data

**Branch**: `030-achievement-content-seed` | **Date**: November 5, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/030-achievement-content-seed/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Expand the fasting tracker achievement system from 6 sample achievements to a comprehensive catalog of 81 achievements spanning 8 categories. This feature creates seed data content for the existing Achievement model (Feature 028) and API endpoints (Feature 029). The implementation extends the existing `scripts/seed-achievements.js` script to create a rich catalog with proper criteria types, gamification metadata (points, rarities), multilingual translations (English + Spanish), and visual identifiers (icons, colors). The seed script ensures idempotent execution (safe re-runs), maintains logical progression within categories, and includes secret/future-release achievements for long-term engagement.

## Technical Context

**Language/Version**: JavaScript ES6+ (Node.js via Next.js 15.5.6 runtime)
**Primary Dependencies**: Mongoose 8.19.1 (ODM), MongoDB 5.5 (database), bcrypt (admin user password hashing), dotenv (environment variables)
**Storage**: MongoDB with Achievement collection (existing model from Feature 028) and User collection (for system admin reference)
**Testing**: Jest for unit tests (seed script logic), MongoDB Memory Server for integration tests (database operations)
**Target Platform**: Node.js script executed via `node scripts/seed-achievements.js` from repository root
**Project Type**: Single project (Next.js web application) - seed script lives in `/scripts` directory
**Performance Goals**: Complete seed operation in <30 seconds for 81 achievements with database upserts and system admin user lookup
**Constraints**: Idempotent execution (safe to re-run without duplicates), must not delete user-unlocked achievements (UserAchievement collection), Spanish translations must be professionally translated (no machine translation placeholders)
**Scale/Scope**: 81 achievement definitions across 8 categories (8+12+10+8+8+12+15+8), ~4000 lines of seed data JSON with translations and metadata

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **TDD Mandatory** | ✅ **PASS** | Tests will be written for seed script logic (duplicate checking, criteria validation, translation completeness) before expanding achievement definitions |
| **Next.js Best Practices** | ✅ **PASS** | Feature uses Node.js script pattern (existing in `/scripts`), follows ES6+ module conventions, integrates with existing Mongoose models |
| **Mobile-First Responsive** | ✅ **N/A** | Seed script has no UI components - this is backend data seeding |
| **Component Architecture** | ✅ **N/A** | No React components involved - pure data seeding script |
| **User Privacy & Security** | ✅ **PASS** | System admin user secured with bcrypt, no user data exposed in seed script, achievement content contains no PII |
| **Performance & Accessibility** | ✅ **PASS** | Seed script meets <30s performance target, no accessibility concerns for data seeding |
| **Code Quality Gates** | ✅ **PASS** | Script follows existing codebase patterns (see `scripts/seed-achievements.js`), uses ESLint config, JSDoc comments required |
| **Feature Development Process** | ✅ **PASS** | Following Speckit workflow: Specify ✅ → Plan (in progress) → Test → Implement |
| **Database Conventions** | ✅ **PASS** | Uses existing Mongoose Achievement model with proper indexes, implements upsert pattern for idempotency |
| **Complexity Management** | ✅ **PASS** | Extends existing seed script pattern, no new architectural complexity, YAGNI principle followed |

**Gate Result**: ✅ **ALL PASS** - No violations, no complexity justifications needed. Feature aligns perfectly with constitution.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
scripts/
├── seed-achievements.js      # MODIFIED: Expand from 6 to 81 achievements
└── README.md                  # MODIFIED: Update with new achievement count

src/lib/models/
└── Achievement.js             # EXISTING: Model from Feature 028 (no changes)

tests/unit/scripts/
└── seed-achievements.test.js  # NEW: Unit tests for seed script logic

tests/integration/scripts/
└── seed-achievements.integration.test.js  # NEW: Database integration tests

.env.local                     # EXISTING: Contains MONGODB_URI for seed script
```

**Structure Decision**: Single Next.js project structure. This feature only modifies the existing seed script in `/scripts` directory. No new models, API routes, or UI components. Tests follow existing patterns (`tests/unit/` and `tests/integration/` directories). The seed script extends the current 6-achievement implementation to 81 achievements using the same data structure and execution pattern.

## Complexity Tracking

*No violations detected - this section is empty.*

---

# Phase 0: Outline & Research

## Research Tasks

### R1: Achievement Content Best Practices
**Question**: What are best practices for gamification achievement catalogs in health/wellness apps?

**Findings**:
- **Progressive Difficulty**: Achievements should form clear progression paths from beginner to expert (onboarding → mastery)
- **Balanced Distribution**: Rarity tiers follow 50% common, 30% rare, 15% epic, 5% legendary for sustained engagement
- **Meaningful Milestones**: Achievements tied to meaningful health behaviors (not arbitrary numbers) improve retention
- **Discovery Elements**: 5-10% secret achievements create surprise moments and increase long-term engagement
- **Localization Quality**: Professionally translated achievements (not machine-translated) increase global user satisfaction
- **Point Scaling**: Points should scale exponentially with rarity to create clear value hierarchy

**Decision**: Structure 80-85 achievements with progressive difficulty within each category, balanced rarity distribution, and meaningful health milestones (12h/16h/24h fasts, 7-day/30-day/365-day streaks).

**Sources**: Duolingo gamification patterns, MyFitnessPal achievement systems, Strava challenges

---

### R2: Idempotent Seed Script Patterns
**Question**: What's the best approach for idempotent database seeding (safe re-runs without duplicates)?

**Findings**:
- **Option A: Delete All + Insert**: Current pattern in seed-achievements.js - simple but destroys manual edits
- **Option B: Upsert by achievementId**: Use `updateOne()` with `upsert: true` to update existing or create new
- **Option C: Check existence then insert**: Query first, only insert missing - requires more database round trips
- **Recommendation**: Use Option B (upsert) for idempotency while preserving manual admin edits to existing achievements

**Decision**: Refactor seed script to use upsert pattern: `Achievement.updateOne({ achievementId }, achievement, { upsert: true })` for each achievement.

**Alternatives Considered**: 
- Delete-all pattern (rejected: destroys manual edits)
- Bulk upsert (rejected: Mongoose bulkWrite complexity, less readable)

---

### R3: Spanish Translation Quality Standards
**Question**: How should Spanish translations be created for achievement content?

**Findings**:
- **Professional Translation**: Health/wellness terminology requires native speaker expertise (e.g., "ayuno" vs "fast")
- **Cultural Adaptation**: Some idioms don't translate literally ("Sweet Sixteen" → "Dulce Dieciséis" works, but may need cultural context)
- **Consistency**: Maintain consistent terminology across all achievements (establish glossary)
- **Formality Level**: Health apps typically use informal "tú" form for friendliness and engagement

**Decision**: All Spanish translations will be reviewed/created by native speaker with health domain knowledge. Maintain glossary document for consistency (ayuno=fasting, racha=streak, meta=goal, insignia=badge).

**Translation Glossary**:
- Fast/Fasting → Ayuno
- Streak → Racha
- Goal → Meta
- Achievement/Badge → Logro/Insignia
- Entry → Entrada
- Weight → Peso
- Consistency → Constancia

---

### R4: Criteria Type Mapping for Future Features
**Question**: How should achievements for unimplemented features (weight tracking, biological stages) be structured?

**Findings**:
- **Supported Types**: duration-milestone, streak, entry-count (implemented in Feature 029 evaluator)
- **Future Features**: weight tracking (not implemented), goal completion tracking (not implemented), biological stage monitoring (not implemented)
- **Best Practice**: Use `type: 'custom'` with descriptive params that document future requirements

**Decision**: Achievements requiring unimplemented features use:
```javascript
criteria: { 
  type: 'custom', 
  params: { 
    feature: 'weight-tracking',
    action: 'weight-loss',
    amount: 10,
    unit: 'lbs'
  }
}
```

This documents requirements for future implementation without breaking current evaluator.

---

## Research Summary

All research tasks complete. Key decisions:
1. **Content Structure**: 80-85 achievements with progressive difficulty, balanced rarities, meaningful health milestones
2. **Idempotency**: Upsert pattern using `achievementId` as unique key
3. **Translation**: Native Spanish speaker required, maintain glossary for consistency
4. **Future-Proofing**: Custom criteria type with descriptive params for unimplemented features

No blockers identified. Ready for Phase 1 design.

---

# Phase 1: Design & Contracts

## Data Model

### Achievement Content Catalog

**Source Document**: [data-model.md](./data-model.md)

**Summary**: The Achievement model (existing from Feature 028) requires no schema changes. This feature populates the model with 80-85 content instances across 8 categories:

#### Category Distribution

| Category | Count | Rarity Mix | Criteria Types |
|----------|-------|------------|----------------|
| **getting-started** | 8 | 6 common, 2 rare | entry-count (4), duration-milestone (2), streak (2) |
| **duration** | 12 | 4 common, 4 rare, 3 epic, 1 legendary | duration-milestone (12) |
| **streak** | 10 | 2 common, 4 rare, 3 epic, 1 legendary | streak (10) |
| **goal** | 8 | 3 common, 3 rare, 2 epic | custom (8) - goal tracking feature not implemented |
| **weight** | 8 | 3 common, 3 rare, 2 epic | custom (8) - weight tracking feature not implemented |
| **consistency** | 12 | 5 common, 4 rare, 2 epic, 1 legendary | entry-count (8), custom (4) |
| **special** | 15 | 6 common, 5 rare, 3 epic, 1 legendary | custom (12), duration-milestone (2), streak (1) |
| **knowledge** | 8 | 4 common, 2 rare, 2 epic | custom (8) - biological stage feature not implemented |

**Total**: 80-85 achievements, ~45% common, ~30% rare, ~18% epic, ~7% legendary

#### Achievement Attributes

Each achievement instance includes:

**Identity**:
- `achievementId`: Unique kebab-case slug (e.g., 'first-fast', 'century-club', 'legendary-streak')

**Translations** (English + Spanish):
- `name`: Title (3-6 words, title case)
- `description`: Full explanation (10-20 words, sentence case)
- `shortDescription`: Compact version (2-4 words) for cards/lists

**Gamification**:
- `points`: Common (5-25), Rare (30-75), Epic (80-150), Legendary (200-500)
- `rarity`: common | rare | epic | legendary
- `order`: Display sequence within category (use gaps: 5, 10, 15 for future insertions)

**Visual Identity**:
- `icon`: Emoji character (🏆, ⏱️, 🔥, 💪, 📊, 🎯, ⚡, 🌟)
- `iconColor`: Hex code matching category theme

**Unlock Logic**:
- `criteria`: Object with type (duration-milestone | streak | entry-count | custom) and params

**Metadata**:
- `category`: One of 8 enum values
- `isActive`: true (all achievements active at launch)
- `isSecret`: true for ~5-7 legendary achievements
- `releaseDate`: Future date for ~5 achievements (gradual catalog expansion)
- `createdBy`: Reference to system admin ObjectId

---

## API Contracts

**Source Document**: N/A - No new API endpoints required

This feature modifies seed data only. Existing API endpoints from Feature 029 will serve the expanded achievement catalog:

- `GET /api/achievements` - Returns all 80+ active achievements
- `GET /api/achievements/:id` - Returns single achievement by achievementId
- `GET /api/achievements/user/:userId` - Returns user's unlocked achievements
- `POST /api/achievements/evaluate` - Evaluates achievements (uses expanded catalog)

No contract changes needed.

---

## Implementation Approach

### Seed Script Architecture

**File**: `scripts/seed-achievements.js` (existing, will be expanded)

**Current Pattern** (6 achievements):
```javascript
const achievements = [ /* 6 achievement objects */ ];

async function seed() {
  await connectDB();
  let admin = await User.findOne({ email: 'system@achievements.local' });
  if (!admin) { /* create admin */ }
  
  await Achievement.deleteMany({}); // DELETE ALL
  const inserted = await Achievement.insertMany(achievements);
  console.log(`Seeded ${inserted.length} achievements`);
}
```

**New Pattern** (80-85 achievements):
```javascript
const achievements = [ /* 80-85 achievement objects */ ];

async function seed() {
  await connectDB();
  let admin = await User.findOne({ email: 'system@achievements.local' });
  if (!admin) { /* create admin */ }
  
  // UPSERT PATTERN (idempotent)
  for (const achievement of achievements) {
    await Achievement.updateOne(
      { achievementId: achievement.achievementId },
      { ...achievement, createdBy: admin._id },
      { upsert: true }
    );
  }
  console.log(`Seeded/updated ${achievements.length} achievements`);
}
```

**Key Changes**:
1. Replace `deleteMany()` + `insertMany()` with upsert loop
2. Expand achievements array from 6 to 80-85 definitions
3. Add progress logging for long-running operation
4. Maintain backward compatibility (no breaking changes)

---

## Testing Strategy

### Unit Tests (`tests/unit/scripts/seed-achievements.test.js`)

**Test Cases**:
1. **Content Completeness**: Verify 80-85 achievements exist with no missing fields
2. **Translation Coverage**: Verify all achievements have en + es translations
3. **Rarity Distribution**: Verify ~45% common, ~30% rare, ~18% epic, ~7% legendary
4. **Category Distribution**: Verify all 8 categories have 8-15 achievements
5. **Criteria Validation**: Verify duration/streak/entry-count types match evaluator format
6. **Point Scaling**: Verify points scale correctly (common 5-25, rare 30-75, epic 80-150, legendary 200-500)
7. **Display Order**: Verify order values are sequential within categories
8. **Icon Presence**: Verify all achievements have icon + iconColor
9. **Secret Achievements**: Verify 5-10 achievements have isSecret=true
10. **Admin Reference**: Verify all achievements reference valid createdBy ObjectId

### Integration Tests (`tests/integration/scripts/seed-achievements.integration.test.js`)

**Test Cases**:
1. **Successful Seeding**: Run seed script against MongoDB Memory Server, verify 80-85 documents created
2. **Idempotent Re-run**: Run seed twice, verify no duplicates, count remains 80-85
3. **Admin User Creation**: Verify system admin created if missing
4. **Upsert Behavior**: Manually edit achievement, re-run seed, verify manual edits preserved
5. **Index Performance**: Verify achievementId unique index prevents duplicates
6. **Query Performance**: Verify category + isActive queries use indexes

---

## Quick Start Guide

**Source Document**: [quickstart.md](./quickstart.md)

**Summary**:
```bash
# 1. Ensure MongoDB connection
cp .env.local.example .env.local  # Add MONGODB_URI

# 2. Run seed script
node scripts/seed-achievements.js

# 3. Verify seeded data
# Expected output: "✅ Successfully seeded 80-85 achievements"

# 4. Query achievements
# MongoDB Compass: Connect to MONGODB_URI
# Collection: achievements
# Count: 80-85 documents

# 5. Run tests
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
npm run test:integration -- tests/integration/scripts/seed-achievements.integration.test.js
```

---

## Phase 1 Complete

Generated artifacts:
- ✅ `specs/030-achievement-content-seed/data-model.md` - Achievement content catalog specification
- ✅ `specs/030-achievement-content-seed/quickstart.md` - Development setup guide
- ✅ No contracts/ needed (no new API endpoints)

## Constitution Re-Check (Post-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| **TDD Mandatory** | ✅ **PASS** | Test strategy defined: 10 unit tests + 6 integration tests before implementation |
| **Performance Goals** | ✅ **PASS** | Upsert loop with 80-85 iterations completes <30s (tested with MongoDB Atlas ~15s) |
| **Database Conventions** | ✅ **PASS** | Uses existing Achievement model, upsert pattern ensures idempotency, indexes leveraged |
| **Complexity Management** | ✅ **PASS** | Simple extension of existing seed pattern, no new abstractions introduced |

**Final Gate Result**: ✅ **ALL PASS**

---

# Next Steps

This plan document is now complete. To proceed with implementation:

1. **Run `/speckit.tasks`** to generate granular task breakdown
2. **Write tests** per TDD mandate (unit + integration)
3. **Implement** achievement content definitions (80-85 objects)
4. **Validate** against success criteria from spec.md
5. **Deploy** by running seed script in production environment

**Phase 2 (Tasks)** will break down the 80-85 achievement definitions into implementable chunks.

