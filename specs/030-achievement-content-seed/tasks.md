# Tasks: Achievement Content Seed Data

**Feature**: 030-achievement-content-seed  
**Branch**: `030-achievement-content-seed`  
**Input**: Design documents from `/specs/030-achievement-content-seed/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Per TDD mandate, tests are written first.

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test framework setup

- [X] T001 Verify existing seed script structure in `scripts/seed-achievements.js` (currently has 6 achievements)
- [X] T002 Verify MongoDB connection and Achievement model accessibility from seed script
- [X] T003 [P] Create test directory structure: `tests/unit/scripts/` and `tests/integration/scripts/`
- [X] T004 [P] Install MongoDB Memory Server for integration tests: `npm install --save-dev mongodb-memory-server`

---

## Phase 2: Foundational (Test Framework)

**Purpose**: Core test infrastructure that validates seed script behavior (TDD requirement)

**⚠️ CRITICAL**: Tests must be written FIRST, fail initially, then pass after implementation

### Unit Test Suite

- [X] T005 [P] Create unit test file `tests/unit/scripts/seed-achievements.test.js`
- [X] T006 [P] Write test: "Should have 81 achievement definitions in achievements array"
- [X] T007 [P] Write test: "All achievements have complete English translations (name, description, shortDescription)"
- [X] T008 [P] Write test: "All achievements have complete Spanish translations (name, description, shortDescription)"
- [X] T009 [P] Write test: "Rarity distribution matches spec (~45% common, ~30% rare, ~18% epic, ~7% legendary)"
- [X] T010 [P] Write test: "Point values scale correctly by rarity (common 5-25, rare 30-75, epic 80-150, legendary 200-500)"
- [X] T011 [P] Write test: "Category distribution valid (8-15 achievements per category, all 8 categories present)"
- [X] T012 [P] Write test: "Criteria types are valid (duration-milestone, streak, entry-count, or custom)"
- [X] T013 [P] Write test: "All achievements have icon (emoji) and iconColor (hex code)"
- [X] T014 [P] Write test: "Secret achievements marked correctly (isSecret=true for ~5-7 achievements)"
- [X] T015 [P] Write test: "Display order sequential within categories with gaps for insertions"

### Integration Test Suite

- [X] T016 [P] Create integration test file `tests/integration/scripts/seed-achievements.integration.test.js`
- [X] T017 [P] Write test: "Successfully seeds 81 achievements to MongoDB Memory Server"
- [X] T018 [P] Write test: "Idempotent re-run does not create duplicates (upsert behavior)"
- [X] T019 [P] Write test: "System admin user (system@achievements.local) created if missing, reused if exists"
- [X] T020 [P] Write test: "Upsert preserves manual edits to non-seeded fields"
- [X] T021 [P] Write test: "Unique index on achievementId prevents duplicate creation"
- [X] T022 [P] Write test: "Query performance uses indexes (category + isActive queries)"

**Run Tests**: All tests should FAIL at this point (no implementation yet)

```bash
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
npm run test:integration -- tests/integration/scripts/seed-achievements.integration.test.js
```

**Checkpoint**: Test framework complete, all tests failing as expected (Red phase of TDD)

---

## Phase 3: User Story 1 - Populate Achievement Catalog (Priority: P1) 🎯 MVP

**Goal**: Expand seed script from 6 to 81 achievements across 8 categories with proper content structure

**Independent Test**: Run `node scripts/seed-achievements.js`, verify 81 Achievement documents in MongoDB with proper category distribution (8 getting-started, 12 duration, 10 streak, 8 goal, 8 weight, 12 consistency, 15 special, 8 knowledge)

**Why US1 is MVP**: Without comprehensive achievement catalog, the achievement system has no content. This story delivers 81 fully-functional achievements that unlock automatically via existing evaluator (Feature 029).

### Implementation for User Story 1

**NOTE**: Achievement definitions in T024-T031 should include BOTH English and Spanish translations from the start. Spanish translations must be professionally translated (not machine-translated) per NFR-003. Task T063 in Phase 8 provides final professional review and refinement of all Spanish translations.

- [ ] T023 [US1] Refactor seed script to use upsert pattern instead of deleteMany in `scripts/seed-achievements.js`
- [ ] T024 [P] [US1] Define 8 Getting Started achievements (first-steps, breaking-the-fast, double-digits, sweet-sixteen, daily-dozen, week-warrior, hydration-hero, note-taker) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T025 [P] [US1] Define 12 Duration Milestone achievements (12h to 120h progressive) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T026 [P] [US1] Define 10 Streak achievements (3, 7, 14, 30, 90, 100, 180, 365, 500, 1000 days) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T027 [P] [US1] Define 8 Goal achievements (custom criteria type) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T028 [P] [US1] Define 8 Weight Tracking achievements (custom criteria type) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T029 [P] [US1] Define 12 Consistency achievements (entry-count + custom) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T030 [P] [US1] Define 15 Special achievements (rare conditions, custom criteria) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T031 [P] [US1] Define 8 Knowledge & Exploration achievements (biological stages, custom) with bilingual translations in `scripts/seed-achievements.js`
- [ ] T032 [US1] Add progress logging to seed script for 81 upserts (track completion)
- [ ] T033 [US1] Update README.md with new achievement count and seed script usage

**Run Tests**: Unit tests for content completeness should now PASS

```bash
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
# Expected: Tests T006-T015 PASS (content structure validated)
```

**Checkpoint**: 81 achievement definitions complete, content structure validated

---

## Phase 4: User Story 2 - Define Achievement Criteria (Priority: P1)

**Goal**: Ensure all 81 achievements have properly structured unlock criteria matching evaluator capabilities

**Independent Test**: Query all seeded achievements, verify 100% have valid criteria objects with type field (duration-milestone, streak, entry-count, or custom) and appropriate params

**Why US2 is critical**: Without proper criteria, achievements cannot unlock automatically. This story ensures evaluation service (Feature 029) can process all criteria correctly.

### Implementation for User Story 2

- [ ] T034 [P] [US2] Validate Duration achievements use criteria type 'duration-milestone' with params.hours (12, 14, 16, 18, 20, 22, 24, 36, 48, 72, 96, 120)
- [ ] T035 [P] [US2] Validate Streak achievements use criteria type 'streak' with params.days (3, 7, 14, 30, 90, 100, 180, 365, 500, 1000)
- [ ] T036 [P] [US2] Validate entry-count achievements use criteria type 'entry-count' with params.count (3, 10, 30, 100, 250, 500, 1000)
- [ ] T037 [P] [US2] Validate Goal achievements use criteria type 'custom' with descriptive params (feature: 'goal-completion', action, count)
- [ ] T038 [P] [US2] Validate Weight achievements use criteria type 'custom' with descriptive params (feature: 'weight-tracking', action, amount, unit)
- [ ] T039 [P] [US2] Validate Knowledge achievements use criteria type 'custom' with descriptive params (feature: 'biological-stages', stage, stageName)
- [ ] T040 [US2] Add JSDoc comments to seed script documenting criteria type usage patterns

**Run Tests**: Criteria validation tests should now PASS

```bash
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
# Expected: Test T012 PASS (all criteria types valid)
```

**Checkpoint**: All 81 achievements have valid criteria structures compatible with evaluator

---

## Phase 5: User Story 3 - Assign Gamification Metadata (Priority: P1)

**Goal**: Assign appropriate points, rarities, display orders, icons, and colors to create balanced progression system

**Independent Test**: Analyze seeded achievements, verify rarity distribution (~45/30/18/7), point scaling by rarity, sequential display orders within categories, and icon/color presence

**Why US3 is critical**: Gamification metadata drives user engagement and provides visual hierarchy. Points must reflect difficulty, rarities must create aspiration, and display order must guide progression.

### Implementation for User Story 3

- [ ] T041 [P] [US3] Assign point values to all 81 achievements following rarity-based scaling (common 5-25, rare 30-75, epic 80-150, legendary 200-500)
- [ ] T042 [P] [US3] Assign rarity levels to achieve distribution: ~37 common, ~24 rare, ~15 epic, ~5 legendary (totals ~45/30/18/7%)
- [ ] T043 [P] [US3] Assign display order within each category using gaps (5, 10, 15, 20...) to allow future insertions
- [ ] T044 [P] [US3] Assign emoji icons to all achievements matching category themes (🌱 getting-started, ⏱️ duration, 🔥 streak, 🎯 goal, ⚖️ weight, 💯 consistency, ⚡ special, 🧬 knowledge)
- [ ] T045 [P] [US3] Assign hex color codes to all achievements matching category themes (Green #10B981, Purple #8B5CF6, Orange #F59E0B, Blue #3B82F6, Teal #14B8A6, Pink #EC4899, Gold #F59E0B, Teal #14B8A6)
- [ ] T046 [US3] Mark 5-7 legendary achievements as secret (isSecret=true): "Unbreakable" (500 days), "Legendary Streak" (1000 days), "Iron Will", "Unstoppable", "Immortal"

**Run Tests**: Gamification metadata tests should now PASS

```bash
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
# Expected: Tests T009, T010, T013, T014, T015 PASS (points, rarities, icons, secrets, order)
```

**Checkpoint**: All 81 achievements have complete gamification metadata, balanced progression established

---

## Phase 6: User Story 4 - Support Special Achievement Types (Priority: P2)

**Goal**: Include special achievements (secret badges, future-release badges) for discovery elements and long-term engagement

**Independent Test**: Query seeded achievements, verify 5-7 have isSecret=true (discovery), 5-10 have future releaseDate values (gradual catalog expansion), and special category has 15 unique achievements

**Why US4 enhances system**: Special achievements drive long-term engagement through surprise moments and seasonal content. Not critical for MVP but significantly boosts retention.

### Implementation for User Story 4

- [ ] T047 [P] [US4] Mark legendary achievements as secret: Update "Unbreakable" (500-day), "Legendary Streak" (1000-day), "Iron Will", "Unstoppable", "Immortal" with isSecret=true
- [ ] T048 [P] [US4] Assign future release dates to 5-10 achievements for gradual catalog expansion (e.g., New Year 2026, seasonal holidays)
- [ ] T049 [P] [US4] Verify Special category has 15 achievements with unique conditions (personal-best, wellness-warrior, hydration-master, social-faster, sunrise-starter, midnight-finisher, zen-master, iron-will, weekend-warrior, explorer, stage-explorer, perfect-week, month-master, unstoppable, immortal)
- [ ] T050 [US4] Document special achievement patterns in seed script comments (time-of-day, holiday, rare conditions)

**Run Tests**: Special achievement tests should now PASS

```bash
npm run test:unit -- tests/unit/scripts/seed-achievements.test.js
# Expected: Test T014 PASS (secret achievements marked correctly)

npm run test:integration -- tests/integration/scripts/seed-achievements.integration.test.js
# Expected: All integration tests PASS (database operations work correctly)
```

**Checkpoint**: Special achievements complete, full 81-achievement catalog ready for production

---

## Phase 7: Integration & Validation

**Purpose**: End-to-end validation of seed script with all user stories complete

- [ ] T051 Run complete unit test suite: `npm run test:unit -- tests/unit/scripts/seed-achievements.test.js` (expect all 10 tests PASS)
- [ ] T052 Run complete integration test suite: `npm run test:integration -- tests/integration/scripts/seed-achievements.integration.test.js` (expect all 6 tests PASS)
- [ ] T053 Execute seed script against local MongoDB: `node scripts/seed-achievements.js` (expect 81 achievements seeded in <30s)
- [ ] T054 Verify MongoDB document count: `mongosh "$MONGODB_URI" --eval "db.achievements.countDocuments()"` (expect 81)
- [ ] T055 Verify category distribution via MongoDB query (expect 8/12/10/8/8/12/15/8 per category)
- [ ] T056 Verify rarity distribution via MongoDB query (expect ~37 common, ~24 rare, ~15 epic, ~5 legendary)
- [ ] T057 Test idempotent re-run: Execute seed script twice, verify count remains 81 (no duplicates)
- [ ] T058 Test manual edit preservation: Edit one achievement manually, re-run seed, verify manual edit preserved
- [ ] T059 Verify system admin user (system@achievements.local) exists with proper createdBy references
- [ ] T060 Update `scripts/README.md` with seed script documentation and usage examples

---

## Phase 8: Polish & Documentation

**Purpose**: Final improvements and documentation updates

- [ ] T061 [P] Add JSDoc comments to all achievement definitions in seed script
- [ ] T062 [P] Create Spanish translation glossary document in `specs/030-achievement-content-seed/translation-glossary.md`
- [ ] T063 [P] Review all Spanish translations for grammatical correctness and cultural appropriateness (final professional review of translations added in Phase 3)
- [ ] T064 [P] Update feature spec `specs/030-achievement-content-seed/spec.md` with completion notes
- [ ] T065 [P] Create feature completion checklist comparing spec requirements vs. implementation
- [ ] T066 Run ESLint on seed script: `npm run lint scripts/seed-achievements.js` (expect no errors)
- [ ] T067 Run full test coverage: `npm run test:coverage` (expect >80% coverage for seed script)
- [ ] T068 Create `specs/030-achievement-content-seed/FEATURE-COMPLETE.md` documenting completion and success criteria validation

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Tests)
                        ↓
                  Phase 3 (US1) ← MVP
                        ↓
                  Phase 4 (US2)
                        ↓
                  Phase 5 (US3)
                        ↓
                  Phase 6 (US4)
                        ↓
              Phase 7 (Integration)
                        ↓
              Phase 8 (Polish)
```

**Independent Stories**: US1, US2, US3, US4 are all tightly coupled (all work on same seed script file). However, each story validates a different aspect:
- US1: Content completeness (81 achievements, 8 categories)
- US2: Criteria correctness (types, params)
- US3: Gamification balance (points, rarities, order)
- US4: Special features (secrets, future releases)

**MVP Scope**: User Story 1 (Phase 3) delivers minimum viable catalog of 81 achievements. System is fully functional after US1.

---

## Parallel Execution Opportunities

### Phase 2 (Tests) - All tests can be written in parallel:
- T005-T015 (Unit tests) - Different test cases, no dependencies
- T016-T022 (Integration tests) - Different test cases, no dependencies

### Phase 3 (US1) - Achievement definitions can be written in parallel:
- T024-T031 (8 parallel tasks) - Each defines one category, no file conflicts

### Phase 4 (US2) - Criteria validation tasks can run in parallel:
- T034-T039 (6 parallel tasks) - Each validates different criteria types

### Phase 5 (US3) - Metadata assignment can run in parallel:
- T041-T045 (5 parallel tasks) - Different metadata attributes

### Phase 6 (US4) - Special features can run in parallel:
- T047-T049 (3 parallel tasks) - Different special achievement aspects

### Phase 8 (Polish) - Documentation can run in parallel:
- T061-T065 (5 parallel tasks) - Different documentation files

**Parallel Execution Example (Phase 3)**:
```bash
# Terminal 1: Getting Started + Duration + Streak
# Work on T024, T025, T026

# Terminal 2: Goal + Weight + Consistency  
# Work on T027, T028, T029

# Terminal 3: Special + Knowledge
# Work on T030, T031
```

**Estimated Time Savings**: With 3 developers working in parallel on achievement definitions (Phase 3), ~6 hours of work can be completed in ~2 hours.

---

## Implementation Strategy

### TDD Workflow (Per Constitution)

1. **Red**: Write tests first (Phase 2) - all tests fail
2. **Green**: Implement minimum code to pass tests (Phases 3-6)
3. **Refactor**: Polish and optimize (Phase 8)

### Incremental Delivery

**Sprint 1** (MVP - 3-5 days):
- Phase 1: Setup (0.5 day)
- Phase 2: Tests (1 day)
- Phase 3: US1 - 81 achievements (2 days)
- Phase 7: Integration validation (0.5 day)
- **Deliverable**: Fully functional 81-achievement catalog

**Sprint 2** (Enhancement - 2-3 days):
- Phase 4: US2 - Criteria validation (0.5 day)
- Phase 5: US3 - Gamification metadata (0.5 day)
- Phase 6: US4 - Special achievements (0.5 day)
- Phase 8: Polish & documentation (1 day)
- **Deliverable**: Production-ready seed script with full test coverage

### Success Criteria Validation

After completing all tasks, validate against spec.md success criteria:

1. ✅ **Content Completeness**: 81 achievements across 8 categories (Phase 3, validated by T054-T055)
2. ✅ **Multilingual Coverage**: 100% English + Spanish translations (Phase 3, validated by T007-T008)
3. ✅ **Criteria Validity**: 100% valid criteria structures (Phase 4, validated by T034-T039)
4. ✅ **Gamification Balance**: Proper point scaling and rarity distribution (Phase 5, validated by T041-T042, T056)
5. ✅ **User Engagement**: Clear progression paths in all categories (Phase 5, validated by T043)
6. ✅ **Category Distribution**: 8-15 achievements per category (Phase 3, validated by T055)
7. ✅ **Discovery Elements**: 5-7 secret achievements (Phase 6, validated by T047)
8. ✅ **Future Readiness**: Custom criteria for unimplemented features (Phase 4, validated by T037-T039)
9. ✅ **Execution Reliability**: <30s execution, idempotent re-runs (Phase 7, validated by T053, T057)
10. ✅ **Visual Consistency**: Icons and colors for all achievements (Phase 5, validated by T044-T045)

---

## Task Summary

**Total Tasks**: 68 tasks
- Phase 1 (Setup): 4 tasks
- Phase 2 (Tests): 18 tasks (10 unit + 8 integration)
- Phase 3 (US1): 11 tasks
- Phase 4 (US2): 7 tasks
- Phase 5 (US3): 6 tasks
- Phase 6 (US4): 4 tasks
- Phase 7 (Integration): 10 tasks
- Phase 8 (Polish): 8 tasks

**Parallel Tasks**: 43 tasks marked [P] (63% parallelizable)

**Story Distribution**:
- US1 (Populate Catalog): 11 tasks
- US2 (Define Criteria): 7 tasks
- US3 (Gamification Metadata): 6 tasks
- US4 (Special Achievements): 4 tasks
- Infrastructure: 40 tasks (setup, tests, integration, polish)

**Suggested MVP**: Complete through Phase 3 (US1) + Phase 7 (Integration) = 25 tasks for fully functional 81-achievement catalog

**Format Validation**: ✅ All tasks follow required checklist format with IDs, [P] markers where appropriate, [Story] labels for user story phases, and exact file paths in descriptions.

---

**Last Updated**: November 5, 2025  
**Ready for Implementation**: Yes ✅  
**Next Step**: Begin Phase 1 (Setup) tasks T001-T004
