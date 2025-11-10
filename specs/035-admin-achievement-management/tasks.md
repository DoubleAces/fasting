# Tasks: Admin Achievement Management UI

**Input**: Design documents from `/specs/035-admin-achievement-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: This feature requires TDD per constitution. All test tasks are MANDATORY and must pass before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Next.js App Router: `src/app/`, `src/components/`, `src/lib/`
- API routes: `src/app/api/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify Next.js 15.5.6 and React 19.1.0 in package.json
- [X] T002 [P] Install React Hook Form if not present: `npm install react-hook-form`
- [X] T003 [P] Verify MongoDB connection and existing Achievement/UserAchievement models from Feature 028
- [X] T004 Create directory structure: `src/app/admin/achievements/`, `src/components/admin/achievements/`, `src/lib/services/`, `src/lib/middleware/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### New Data Model

- [X] T005 [P] Create AdminAuditLog model in src/lib/models/AdminAuditLog.js with schema (timestamp with TTL index 90 days, userId, action enum, resource enum, resourceId, changes object, ipAddress, userAgent)
- [X] T006 [P] Write unit test for AdminAuditLog model in tests/unit/lib/models/AdminAuditLog.test.js (test TTL index, validation, schema)

### Core Services

- [X] T007 [P] Create auditLogService in src/lib/services/auditLogService.js with log() method (capture userId, action, resource, resourceId, changes, IP, user agent)
- [X] T008 [P] Write unit test for auditLogService in tests/unit/lib/services/auditLogService.test.js (test logging all action types)
- [X] T009 [P] Create achievementAdminService skeleton in src/lib/services/achievementAdminService.js (list, create, update, delete, bulkActivate, bulkDeactivate methods)
- [X] T010 [P] Write unit test skeleton for achievementAdminService in tests/unit/lib/services/achievementAdminService.test.js

### Middleware

- [X] T011 [P] Create rate limiting middleware in src/lib/middleware/rateLimit.js (100 req/min per admin user per Clarification Q2)
- [X] T012 [P] Write unit test for rateLimit middleware in tests/unit/lib/middleware/rateLimit.test.js (test under limit, over limit, reset)
- [X] T013 Verify adminAuth middleware exists from Feature 005 in src/lib/middleware/adminAuth.js (check session.user.role === 'admin')

### Base UI Components

- [X] T014 [P] Verify AdminLayout component exists from Feature 005 in src/components/admin/AdminLayout.jsx
- [X] T015 [P] Create base admin achievements layout wrapper in src/components/admin/achievements/AchievementsLayout.jsx (navigation tabs: List, Translations, Analytics)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Views Achievement List (Priority: P1) 🎯 MVP

**Goal**: Display paginated, searchable, filterable list of all achievements with status, category, tier, unlock statistics

**Independent Test**: Admin can access `/admin/achievements`, see 81+ achievements paginated (20 per page), search by name, filter by status/category/tier, sort by any column, see unlock count per achievement

### Tests for User Story 1 (TDD - Write First)

- [X] T016 [P] [US1] Write contract test for GET /api/admin/achievements in tests/integration/api/admin/achievements/list.test.js (test pagination, search, filters, sorting, auth required, rate limiting)
- [ ] T017 [P] [US1] Write component test for AchievementList in tests/unit/components/admin/achievements/AchievementList.test.jsx (test rendering, search input, filter dropdowns, sort headers, pagination controls)
- [ ] T018 [P] [US1] Write service test for achievementAdminService.list() in tests/unit/lib/services/achievementAdminService.test.js (test query building, pagination logic, search, filters)

### API Implementation for User Story 1

- [X] T019 [US1] Implement achievementAdminService.list() in src/lib/services/achievementAdminService.js (query with pagination, search, filters, sorting, aggregate unlock counts from UserAchievement)
- [X] T020 [US1] Implement GET /api/admin/achievements route in src/app/api/admin/achievements/route.js (apply adminAuth, rateLimit, call achievementAdminService.list(), audit log view-list action)
- [ ] T021 [US1] Run tests T016, T017, T018 and verify they pass

### UI Implementation for User Story 1

- [X] T022 [P] [US1] Create AchievementList component in src/components/admin/achievements/AchievementList.jsx (table with columns: name, status badge, category, tier icon, unlock count, actions)
- [X] T023 [P] [US1] Create SearchInput component in src/components/admin/achievements/SearchInput.jsx (debounced search with clear button)
- [X] T024 [P] [US1] Create FilterBar component in src/components/admin/achievements/FilterBar.jsx (dropdowns for status, category, tier with "All" option)
- [ ] T025 [P] [US1] Create PaginationControls component in src/components/admin/achievements/PaginationControls.jsx (previous, next, page numbers, results count)
- [X] T026 [US1] Create main list page in src/app/admin/achievements/page.js (Server Component: fetch initial data, pass to AchievementList)
- [ ] T027 [US1] Wire up client-side interactions in AchievementList (search, filter, sort trigger API calls with updated params)
- [ ] T028 [US1] Add loading states and error handling to list page
- [ ] T029 [US1] Run component tests T017 and verify rendering, interactions work

### Integration Testing for User Story 1

- [ ] T030 [US1] Write E2E test for list page in tests/e2e/admin-achievements.spec.js (navigate to page, verify 81+ achievements load, test search filters sort pagination)
- [ ] T031 [US1] Run E2E test T030 and verify full user journey works
- [ ] T032 [US1] Manual testing: Access `/admin/achievements` as admin, verify <2s load time per success criteria, test all filters and sorting

**Checkpoint**: User Story 1 complete - Admin can view and navigate achievement list

---

## Phase 4: User Story 2 - Admin Creates New Achievement (Priority: P1)

**Goal**: Multi-step form to create achievement with English content (required), optional translations, criteria config, metadata, settings

**Independent Test**: Admin clicks "Create Achievement", fills 4-step form (Content: English name/desc/icon, Criteria: type + params, Metadata: category/tier/rarity, Settings: isActive toggle), saves, sees new achievement in list

### Tests for User Story 2 (TDD - Write First)

- [X] T033 [P] [US2] Write contract test for POST /api/admin/achievements in tests/integration/api/admin/achievements/create.test.js (test validation, duplicate achievementId, successful creation, auth, rate limiting)
- [ ] T034 [P] [US2] Write component test for AchievementForm in tests/unit/components/admin/achievements/AchievementForm.test.jsx (test multi-step navigation, validation, preview updates, form submission)
- [ ] T035 [P] [US2] Write component tests for form steps in tests/unit/components/admin/achievements/ (ContentStep.test.jsx, CriteriaStep.test.jsx, MetadataStep.test.jsx, SettingsStep.test.jsx)
- [ ] T036 [P] [US2] Write service test for achievementAdminService.create() in tests/unit/lib/services/achievementAdminService.test.js (test achievementId slug generation, audit logging, validation)

### API Implementation for User Story 2

- [X] T037 [US2] Implement achievementAdminService.create() in src/lib/services/achievementAdminService.js (generate achievementId slug from translations.en.name, validate required fields, call Achievement.create(), audit log create action with full achievement data)
- [ ] T038 [US2] Implement POST /api/admin/achievements route in src/app/api/admin/achievements/route.js (apply adminAuth, rateLimit, validate request body, check duplicate achievementId, call achievementAdminService.create())
- [ ] T039 [US2] Add achievementId slug generation utility in src/lib/utils/achievementIdGenerator.js (lowercase, replace spaces with hyphens, remove special chars)
- [ ] T040 [US2] Write unit test for achievementIdGenerator in tests/unit/lib/utils/achievementIdGenerator.test.js
- [ ] T041 [US2] Run tests T033, T036, T040 and verify they pass

### UI Implementation for User Story 2

- [X] T042 [P] [US2] Create ContentStep component in src/components/admin/achievements/ContentStep.jsx (English name/description/iconUrl required, add translation buttons for es/fr/de/ar, validation)
- [X] T043 [P] [US2] Create CriteriaStep component in src/components/admin/achievements/CriteriaStep.jsx (dropdown for criteria.type: fasting-hours/streak-days/goal-completions/custom, dynamic value field based on type)
- [X] T044 [P] [US2] Create MetadataStep component in src/components/admin/achievements/MetadataStep.jsx (category dropdown, tier dropdown, rarity.score slider 1-100)
- [X] T045 [P] [US2] Create SettingsStep component in src/components/admin/achievements/SettingsStep.jsx (isActive toggle, type dropdown: automatic/manual-trigger/admin-granted)
- [X] T046 [P] [US2] Create AchievementPreview component in src/components/admin/achievements/AchievementPreview.jsx (real-time preview of achievement card as user fills form)
- [X] T047 [US2] Create AchievementForm container in src/components/admin/achievements/AchievementForm.jsx (React Hook Form setup, stepper navigation: Next/Previous/Save, progress indicator, wire up all steps)
- [X] T048 [US2] Create create page in src/app/admin/achievements/create/page.js (render AchievementForm, handle form submission POST to API, redirect to list on success with toast)
- [X] T049 [US2] Add "Create Achievement" button to list page in src/app/admin/achievements/page.js (navigates to /admin/achievements/create)
- [ ] T050 [US2] Add form validation rules to each step (required fields, min/max values, format validation)
- [X] T051 [US2] Add error handling for duplicate achievementId (show inline error, allow user to modify)
- [ ] T052 [US2] Run component tests T034, T035 and verify form behavior

### Integration Testing for User Story 2

- [ ] T053 [US2] Write E2E test for create flow in tests/e2e/admin-achievements.spec.js (click Create button, fill all 4 steps, submit, verify new achievement in list)
- [ ] T054 [US2] Run E2E test T053 and verify full creation flow
- [ ] T055 [US2] Manual testing: Create achievement with all fields, verify <1.5s save time per success criteria, verify achievement appears in list and can be unlocked by users

**Checkpoint**: User Story 2 complete - Admin can create new achievements with multi-step form

---

## Phase 5: User Story 3 - Admin Edits Existing Achievement (Priority: P1)

**Goal**: Edit any field of existing achievement, see pre-populated form, save changes with audit trail

**Independent Test**: Admin clicks "Edit" on achievement in list, sees same 4-step form pre-filled with current values, modifies any field (e.g., change tier, add Spanish translation), saves, sees updated achievement in list with "Last Updated" timestamp

### Tests for User Story 3 (TDD - Write First)

- [ ] T056 [P] [US3] Write contract test for GET /api/admin/achievements/[achievementId] in tests/integration/api/admin/achievements/get-one.test.js (test fetch by achievementId, not found error, auth)
- [ ] T057 [P] [US3] Write contract test for PUT /api/admin/achievements/[achievementId] in tests/integration/api/admin/achievements/update.test.js (test validation, not found, successful update, audit logging before/after values, auth, rate limiting)
- [ ] T058 [P] [US3] Write service test for achievementAdminService.update() in tests/unit/lib/services/achievementAdminService.test.js (test change detection, audit logging with before/after, validation)

### API Implementation for User Story 3

- [X] T059 [US3] Implement achievementAdminService.getById() in src/lib/services/achievementAdminService.js (find by achievementId, throw 404 if not found)
- [X] T060 [US3] Implement achievementAdminService.update() in src/lib/services/achievementAdminService.js (fetch current achievement, apply changes, detect modified fields, update Achievement, audit log update action with before/after values)
- [X] T061 [US3] Implement GET /api/admin/achievements/[achievementId]/route.js (apply adminAuth, call achievementAdminService.getById())
- [X] T062 [US3] Implement PUT /api/admin/achievements/[achievementId]/route.js (apply adminAuth, rateLimit, validate request body, call achievementAdminService.update())
- [ ] T063 [US3] Run tests T056, T057, T058 and verify they pass

### UI Implementation for User Story 3

- [X] T064 [US3] Create edit page in src/app/admin/achievements/[achievementId]/edit/page.js (Server Component: fetch achievement by achievementId, pass to AchievementForm with mode='edit')
- [X] T065 [US3] Extend AchievementForm to support edit mode (detect mode prop, pre-populate defaultValues from initialData, change submit button text to "Save Changes", PUT instead of POST)
- [X] T066 [US3] Add "Edit" action button to AchievementList rows (navigates to /admin/achievements/[achievementId]/edit)
- [X] T067 [US3] Add handling for "not found" error (achievement deleted by another admin) - show error message and redirect to list
- [ ] T068 [US3] Run component tests to verify edit mode behavior

### Integration Testing for User Story 3

- [ ] T069 [US3] Write E2E test for edit flow in tests/e2e/admin-achievements.spec.js (click Edit on achievement, verify form pre-filled, change tier from bronze to silver, change points 25 to 30, add Spanish translation, save, verify changes in list)
- [ ] T070 [US3] Run E2E test T069 and verify full edit flow
- [ ] T071 [US3] Manual testing: Edit achievement, verify <1.5s save time, verify audit log captures before/after values, verify existing user unlocks not affected by criteria changes

**Checkpoint**: User Story 3 complete - Admin can edit existing achievements

---

## Phase 6: User Story 4 - Admin Activates/Deactivates Achievements (Priority: P2)

**Goal**: Quickly toggle isActive status without opening edit form, bulk activate/deactivate multiple achievements

**Independent Test**: Admin clicks toggle switch on achievement row, sees status change from Active to Inactive instantly, verifies achievement hidden from public page. Admin selects 5 achievements with checkboxes, clicks "Activate All", sees all 5 become active with success message showing count.

### Tests for User Story 4 (TDD - Write First)

- [ ] T072 [P] [US4] Write contract test for PATCH /api/admin/achievements/[achievementId]/toggle-active in tests/integration/api/admin/achievements/toggle-active.test.js (test toggle from true to false and vice versa, audit logging, auth)
- [ ] T073 [P] [US4] Write contract test for POST /api/admin/achievements/bulk-activate in tests/integration/api/admin/achievements/bulk-activate.test.js (test activating multiple achievementIds, partial success handling, auth)
- [ ] T074 [P] [US4] Write contract test for POST /api/admin/achievements/bulk-deactivate in tests/integration/api/admin/achievements/bulk-deactivate.test.js (test deactivating multiple achievementIds, partial success handling, auth)
- [ ] T075 [P] [US4] Write service tests for bulkActivate/bulkDeactivate in tests/unit/lib/services/achievementAdminService.test.js

### API Implementation for User Story 4

- [X] T076 [US4] Implement achievementAdminService.toggleActive() in src/lib/services/achievementAdminService.js (fetch achievement, flip isActive boolean, save, audit log activate or deactivate action)
- [X] T077 [US4] Implement achievementAdminService.bulkActivate() in src/lib/services/achievementAdminService.js (updateMany isActive=true for array of achievementIds, audit log bulk-activate with achievementIds list and count)
- [X] T078 [US4] Implement achievementAdminService.bulkDeactivate() in src/lib/services/achievementAdminService.js (updateMany isActive=false, audit log bulk-deactivate)
- [X] T079 [US4] Create PATCH /api/admin/achievements/[achievementId]/toggle-active/route.js (apply adminAuth, rateLimit, call achievementAdminService.toggleActive())
- [X] T080 [US4] Create POST /api/admin/achievements/bulk-activate/route.js (apply adminAuth, rateLimit, validate achievementIds array max 50 items, call achievementAdminService.bulkActivate())
- [X] T081 [US4] Create POST /api/admin/achievements/bulk-deactivate/route.js (apply adminAuth, rateLimit, validate achievementIds array, call achievementAdminService.bulkDeactivate())
- [ ] T082 [US4] Run tests T072, T073, T074, T075 and verify they pass

### UI Implementation for User Story 4

- [X] T083 [P] [US4] Add isActive toggle switch to each row in AchievementList component (calls PATCH /api/admin/achievements/[achievementId]/toggle-active, optimistic UI update, revert on error)
- [X] T084 [P] [US4] Add checkbox selection to AchievementList rows (controlled checkboxes with Select All option)
- [X] T085 [P] [US4] Create BulkActionToolbar component in src/components/admin/achievements/BulkActionToolbar.jsx (appears when checkboxes selected, shows "Activate All" and "Deactivate All" buttons with count)
- [X] T086 [US4] Wire up bulk actions (call POST /api/admin/achievements/bulk-activate or bulk-deactivate with selected achievementIds, show success toast with count, refresh list)
- [X] T087 [US4] Add loading states for toggle and bulk operations
- [ ] T088 [US4] Run component tests to verify toggle and bulk actions

### Integration Testing for User Story 4

- [ ] T089 [US4] Write E2E test for toggle in tests/e2e/admin-achievements.spec.js (toggle achievement from active to inactive, verify badge changes, verify hidden from public page)
- [ ] T090 [US4] Write E2E test for bulk operations in tests/e2e/admin-achievements.spec.js (select 3 achievements, click "Deactivate All", verify all 3 inactive)
- [ ] T091 [US4] Run E2E tests T089, T090 and verify flows work
- [ ] T092 [US4] Manual testing: Toggle 10 achievements rapidly, verify no rate limiting errors, verify audit logs capture all actions, verify users keep existing unlocks when achievement deactivated

**Checkpoint**: User Story 4 complete - Admin can quickly toggle status and perform bulk operations

---

## Phase 7: User Story 5 - Admin Manages Translations (Priority: P2)

**Goal**: View achievements missing translations for a language, add translations inline, export to CSV for external translation, import CSV with translations

**Independent Test**: Admin navigates to "Translations" tab, selects Spanish language, sees list of achievements missing Spanish translations with English content as reference, adds Spanish translation inline and saves. Admin exports CSV, edits externally, imports CSV with 50 new translations, sees success summary with rows processed and any errors.

### Tests for User Story 5 (TDD - Write First)

- [ ] T093 [P] [US5] Write contract test for GET /api/admin/achievements/translations/export in tests/integration/api/admin/achievements/translations/export.test.js (test CSV format, headers, all achievements included, auth)
- [ ] T094 [P] [US5] Write contract test for POST /api/admin/achievements/translations/import in tests/integration/api/admin/achievements/translations/import.test.js (test file validation 5MB/500 rows, schema validation, partial success with error list, auth)
- [ ] T095 [P] [US5] Write service test for csvService in tests/unit/lib/services/csvService.test.js (test export format, import parsing, validation)

### Services for User Story 5

- [ ] T096 [P] [US5] Create csvService in src/lib/services/csvService.js with exportTranslations() (generate CSV with columns: achievementId, language, name, description, iconUrl, include all achievements and languages)
- [ ] T097 [P] [US5] Implement csvService.importTranslations() (parse CSV, validate schema, validate file size 5MB and row count 500 per Clarification Q4, update translations for matching achievementIds, return summary with processed count and errors array)
- [ ] T098 [P] [US5] Write csvValidator utility in src/lib/utils/csvValidator.js (validate file size, row count, required columns, language codes: en/es/fr/de/ar, achievementId exists)
- [ ] T099 [P] [US5] Write unit test for csvValidator in tests/unit/lib/utils/csvValidator.test.js
- [ ] T100 [US5] Run tests T095, T099 and verify they pass

### API Implementation for User Story 5

- [ ] T101 [US5] Implement GET /api/admin/achievements/translations/export/route.js (apply adminAuth, call csvService.exportTranslations(), set Content-Disposition header with filename, return CSV file, audit log csv-export action)
- [ ] T102 [US5] Implement POST /api/admin/achievements/translations/import/route.js (apply adminAuth, rateLimit, parse multipart/form-data file, validate with csvValidator, call csvService.importTranslations(), audit log csv-import with summary, return success with errors)
- [ ] T103 [US5] Run tests T093, T094 and verify they pass

### UI Implementation for User Story 5

- [ ] T104 [P] [US5] Create TranslationManager page in src/app/admin/achievements/translations/page.js (language selector dropdown: es/fr/de/ar, fetch achievements missing that language, display with English reference)
- [ ] T105 [P] [US5] Create TranslationEditor component in src/components/admin/achievements/TranslationEditor.jsx (inline form showing English content read-only, editable fields for selected language: name/description/iconUrl, Save button)
- [ ] T106 [P] [US5] Add Export CSV button to TranslationManager page (downloads CSV via GET /api/admin/achievements/translations/export)
- [ ] T107 [P] [US5] Add Import CSV button and file upload in TranslationManager page (POST file to /api/admin/achievements/translations/import, show import summary modal with processed count and errors list)
- [ ] T108 [US5] Wire up inline translation editing (call PUT /api/admin/achievements/[achievementId] with updated translations, remove from missing list on success)
- [ ] T109 [US5] Add CSV import error handling UI (display row-level errors: "Row 12: Invalid language code 'jp'", "Row 34: Achievement ID 'nonexistent' not found")
- [ ] T110 [US5] Run component tests for TranslationEditor and TranslationManager

### Integration Testing for User Story 5

- [ ] T111 [US5] Write E2E test for translation manager in tests/e2e/admin-achievements.spec.js (navigate to Translations tab, select Spanish, add translation inline, save, verify no longer in missing list)
- [ ] T112 [US5] Write E2E test for CSV export/import in tests/e2e/admin-achievements.spec.js (export CSV, verify format, import modified CSV with 10 translations, verify success summary)
- [ ] T113 [US5] Run E2E tests T111, T112 and verify flows work
- [ ] T114 [US5] Manual testing: Export CSV with 81 achievements (<5s per success criteria), import CSV with 500 rows (<10s per success criteria), test file too large error (>5MB), test too many rows error (>500)

**Checkpoint**: User Story 5 complete - Admin can manage translations via UI and CSV import/export

---

## Phase 8: User Story 6 - Admin Views Analytics (Priority: P3)

**Goal**: Dashboard showing achievement statistics: total count, most popular, rarest, unlock trends over time, ranking by unlock percentage

**Independent Test**: Admin navigates to "Analytics" tab, sees summary cards (total achievements: 81, most popular: "First Fast" 85% unlock rate, rarest: "Century Club" 0.3% unlock rate), sees sortable table of all achievements ranked by unlock percentage, clicks achievement to see unlock timeline chart

### Tests for User Story 6 (TDD - Write First)

- [ ] T115 [P] [US6] Write contract test for GET /api/admin/achievements/analytics in tests/integration/api/admin/achievements/analytics.test.js (test response structure with summary, byCategory, byTier, topUnlocked, rarest, unlockTimeline, auth, target 3-5s response time)
- [ ] T116 [P] [US6] Write service test for analyticsService in tests/unit/lib/services/analyticsService.test.js (test aggregation queries, calculations)

### Services for User Story 6

- [ ] T117 [US6] Create analyticsService in src/lib/services/analyticsService.js with calculateAnalytics() (aggregate total achievements, active/inactive count, group by category, group by tier, join UserAchievement to get unlock counts, calculate percentages, find top 10 unlocked, find rarest 10, calculate unlock timeline last 30 days)
- [ ] T118 [US6] Optimize analyticsService with MongoDB aggregation pipeline (use $lookup for UserAchievement, $group for categories/tiers, $sort for rankings, ensure uses indexes)
- [ ] T119 [US6] Run test T116 and verify analytics calculations correct

### API Implementation for User Story 6

- [ ] T120 [US6] Implement GET /api/admin/achievements/analytics/route.js (apply adminAuth, call analyticsService.calculateAnalytics(), audit log view-analytics action, return JSON, verify response time 3-5s acceptable per Clarification Q5)
- [ ] T121 [US6] Run test T115 and verify API contract

### UI Implementation for User Story 6

- [ ] T122 [P] [US6] Create AnalyticsCards component in src/components/admin/achievements/AnalyticsCards.jsx (4 cards: Total, Active Count, Most Popular with name + unlock %, Rarest with name + unlock %)
- [ ] T123 [P] [US6] Create AnalyticsTable component in src/components/admin/achievements/AnalyticsTable.jsx (sortable table: Achievement Name, Category, Unlock Count, Unlock %, columns sortable)
- [ ] T124 [P] [US6] Create UnlockTimelineChart component in src/components/admin/achievements/UnlockTimelineChart.jsx (line chart showing unlocks per day last 30 days, use lightweight charting library or canvas)
- [ ] T125 [P] [US6] Create CategoryDistributionChart component in src/components/admin/achievements/CategoryDistributionChart.jsx (pie or bar chart showing count by category)
- [ ] T126 [US6] Create Analytics page in src/app/admin/achievements/analytics/page.js (Server Component: fetch analytics data, pass to components, show loading state)
- [ ] T127 [US6] Add "Analytics" navigation tab to AchievementsLayout (navigates to /admin/achievements/analytics)
- [ ] T128 [US6] Add loading skeleton for analytics page (show placeholders while 3-5s calculation runs)
- [ ] T129 [US6] Run component tests for analytics components

### Integration Testing for User Story 6

- [ ] T130 [US6] Write E2E test for analytics in tests/e2e/admin-achievements.spec.js (navigate to Analytics tab, verify summary cards render, verify table shows all achievements sorted by unlock %, click achievement to see timeline chart)
- [ ] T131 [US6] Run E2E test T130 and verify analytics display
- [ ] T132 [US6] Manual testing: Load analytics page with 81 achievements and 1000 user unlocks, verify loads in 3-5s, verify calculations accurate (spot check unlock percentages), test sorting table by each column

**Checkpoint**: User Story 6 complete - Admin can view comprehensive achievement analytics

---

## Phase 9: User Story 7 - Admin Deletes Achievement (Priority: P3)

**Goal**: Delete achievement with cascade to UserAchievement records, show warning about impact, require confirmation

**Independent Test**: Admin clicks "Delete" on achievement, sees modal warning "47 users have unlocked this. Deletion will remove their unlock records and recalculate points.", confirms, sees achievement deleted from list and all UserAchievement records cascade deleted

### Tests for User Story 7 (TDD - Write First)

- [ ] T133 [P] [US7] Write contract test for DELETE /api/admin/achievements/[achievementId] in tests/integration/api/admin/achievements/delete.test.js (test successful deletion, cascade to UserAchievements, return usersAffected count, audit logging with usersAffected, auth, not found error)
- [ ] T134 [P] [US7] Write service test for achievementAdminService.delete() in tests/unit/lib/services/achievementAdminService.test.js (test cascade delete, audit logging)

### API Implementation for User Story 7

- [ ] T135 [US7] Implement achievementAdminService.delete() in src/lib/services/achievementAdminService.js (count UserAchievements for this achievementId, delete all UserAchievement records, delete Achievement, audit log delete action with deleted achievement data and usersAffected count, return usersAffected)
- [ ] T136 [US7] Implement DELETE /api/admin/achievements/[achievementId]/route.js (apply adminAuth, rateLimit, call achievementAdminService.delete(), return success with usersAffected count)
- [ ] T137 [US7] Run tests T133, T134 and verify they pass

### UI Implementation for User Story 7

- [ ] T138 [P] [US7] Create DeleteConfirmModal component in src/components/admin/achievements/DeleteConfirmModal.jsx (shows warning message with usersAffected count, "Warning: X users have unlocked this achievement. Deletion will remove their unlock records.", Yes/No buttons)
- [ ] T139 [US7] Add "Delete" action button to AchievementList rows (opens DeleteConfirmModal, fetches UserAchievement count for preview)
- [ ] T140 [US7] Wire up delete confirmation (on "Yes" button, call DELETE /api/admin/achievements/[achievementId], show success toast "Achievement deleted successfully", refresh list)
- [ ] T141 [US7] Add error handling for delete failures (show error message, keep modal open)
- [ ] T142 [US7] Run component tests for DeleteConfirmModal

### Integration Testing for User Story 7

- [ ] T143 [US7] Write E2E test for delete in tests/e2e/admin-achievements.spec.js (create test achievement, have test user unlock it, admin deletes achievement, verify removed from list, verify UserAchievement deleted, verify user points recalculated)
- [ ] T144 [US7] Run E2E test T143 and verify cascade delete works
- [ ] T145 [US7] Manual testing: Delete achievement with 50 user unlocks, verify deletion fast, verify audit log captures usersAffected, verify achievement gone from public page, verify deleted user unlocks no longer show in user profiles

**Checkpoint**: User Story 7 complete - Admin can delete achievements with cascade and proper warnings

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance optimization, documentation

### Performance Optimization

- [ ] T146 [P] Add database indexes for common queries in Achievement model (category + isActive compound index, tier index, rarity.score index for analytics)
- [ ] T147 [P] Add database indexes for UserAchievement model (userId + achievementId compound unique, achievementId for cascade queries)
- [ ] T148 [P] Test list page performance with 100+ achievements (verify <2s load time per success criteria SC-001)
- [ ] T149 [P] Test search performance with large dataset (verify <500ms response time per success criteria SC-002)
- [ ] T150 [P] Test analytics performance with 1000 users and 81 achievements (verify 3-5s load time acceptable per success criteria SC-006)

### Error Handling & User Experience

- [ ] T151 [P] Add toast notifications for all success actions (created, updated, deleted, bulk operations completed, CSV imported)
- [ ] T152 [P] Add error toast notifications for all failure cases (validation errors, duplicate achievementId, file too large, rate limit exceeded)
- [ ] T153 [P] Add loading skeletons for all async operations (list loading, form submitting, analytics calculating)
- [ ] T154 [P] Add empty states for list (no achievements, no search results, no missing translations)
- [ ] T155 [P] Add keyboard shortcuts (Escape to close modals, Enter to submit forms, arrow keys for table navigation)

### Accessibility & Desktop Optimization

- [ ] T156 [P] Ensure minimum width 1024px enforced per spec FR-067 (add viewport meta tag, add CSS min-width)
- [ ] T157 [P] Add keyboard navigation for list table (Tab through rows, Enter to edit/delete, Space to toggle checkbox)
- [ ] T158 [P] Add ARIA labels to all interactive elements (buttons, links, form fields, modals)
- [ ] T159 [P] Test with screen reader (NVDA or JAWS) to verify form steps, table navigation, modal announcements work
- [ ] T160 [P] Ensure color contrast meets WCAG 2.1 AA for status badges, buttons, text (use contrast checker)

### Code Quality & Testing

- [ ] T161 Run full test suite and verify 80% coverage per constitution (npm test -- --coverage)
- [ ] T162 Run ESLint and fix any linting errors (npm run lint -- --fix)
- [ ] T163 Run Prettier to format all files (npm run format)
- [ ] T164 Run Lighthouse audit on /admin/achievements page (verify Performance >90, Accessibility >90, Best Practices >90 per FR-070)
- [ ] T165 Review all audit log entries manually to verify completeness (check AdminAuditLog collection has entries for all actions)

### Documentation

- [ ] T166 [P] Add JSDoc comments to all services (achievementAdminService, auditLogService, csvService, analyticsService)
- [ ] T167 [P] Add JSDoc comments to all utilities (achievementIdGenerator, csvValidator)
- [ ] T168 [P] Update quickstart.md with any implementation learnings or gotchas discovered during development
- [ ] T169 [P] Create migration script in scripts/migrations/create-audit-log-collection.js (creates AdminAuditLog collection with TTL index)
- [ ] T170 [P] Add README section for running migrations (instructions to run migration before starting app)

### Final Integration Testing

- [ ] T171 Run all E2E tests end-to-end (npm run test:e2e) and verify 100% pass rate
- [ ] T172 Manual regression testing: Test all 7 user stories sequentially to verify no story broke another
- [ ] T173 Manual testing with production-like data: Import 81 real achievements, create 100 test users with unlocks, test all features
- [ ] T174 Performance testing under load: Use 5 concurrent admin users performing operations, verify rate limiting works (100 req/min per user), no crashes
- [ ] T175 Manual testing of audit log retention: Set TTL to 5 minutes for test, verify logs auto-delete after 5 minutes (validates 90-day retention will work)

---

## Dependencies & Parallel Execution

### User Story Dependency Graph

```
Phase 1: Setup (all serial)
    ↓
Phase 2: Foundational (all parallel within phase, but phase must complete before stories)
    ↓
┌────────────────────────────────────────────────────────┐
│ Stories can be implemented in parallel after Phase 2:  │
├────────────────────────────────────────────────────────┤
│ US1 (List) ────→ Independent (no dependencies)         │
│ US2 (Create) ───→ Independent (no dependencies)        │
│ US3 (Edit) ─────→ Depends on US1 (needs list to click) │
│ US4 (Toggle) ───→ Depends on US1 (needs list UI)       │
│ US5 (Translations)→ Depends on US3 (uses edit)         │
│ US6 (Analytics) ─→ Independent (read-only)             │
│ US7 (Delete) ───→ Depends on US1 (needs list UI)       │
└────────────────────────────────────────────────────────┘
    ↓
Phase 10: Polish (all parallel within phase)
```

### Recommended MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) + Phase 5 (US3)**

This delivers core CRUD functionality:
- ✅ View all achievements (US1)
- ✅ Create new achievements (US2)
- ✅ Edit existing achievements (US3)
- 🔜 Toggle status and bulk operations (US4 - can add quickly)
- 🔜 Translation management (US5 - nice-to-have)
- 🔜 Analytics (US6 - nice-to-have)
- 🔜 Delete (US7 - nice-to-have, can use edit to deactivate instead)

### Parallel Execution Examples

**Within Phase 2 (Foundational)**:
- T005 (AdminAuditLog model), T007 (auditLogService), T009 (achievementAdminService), T011 (rateLimit) can all run in parallel

**Within Phase 3 (US1)**:
- T016, T017, T018 (tests) can all run in parallel
- T022, T023, T024, T025 (UI components) can all run in parallel after T019-T021 (API) complete

**Across User Stories** (after Phase 2):
- US1, US2, US6 can be implemented fully in parallel (no dependencies)
- US3, US4, US5, US7 depend on US1 but can start once US1 list UI renders

---

## Implementation Strategy

### Phase Priorities

1. **Phase 1-2: Foundation** (2-3 days)
   - Setup project structure
   - Create all models and services
   - Write foundational tests
   - Verify auth and rate limiting work

2. **Phase 3-5: Core MVP** (5-7 days)
   - US1: List view (1-2 days)
   - US2: Create form (2-3 days) - Most complex due to multi-step form
   - US3: Edit form (1-2 days) - Reuses US2 components

3. **Phase 6-7: Enhanced Operations** (3-4 days)
   - US4: Toggle/bulk (1 day)
   - US5: Translations (2-3 days) - CSV handling complexity

4. **Phase 8-9: Advanced Features** (2-3 days)
   - US6: Analytics (1-2 days) - Aggregation queries
   - US7: Delete (1 day)

5. **Phase 10: Polish** (1-2 days)
   - Performance optimization
   - Accessibility audit
   - Documentation updates

**Total Estimated Time**: 13-19 days for full feature

**MVP Estimated Time**: 7-10 days (Phase 1-5 only)

### Test-Driven Development Flow

For EVERY task with implementation:
1. **RED**: Write test first (contract, integration, or unit) - verify it FAILS
2. **GREEN**: Implement minimal code to make test pass
3. **REFACTOR**: Clean up code without breaking test
4. **COMMIT**: Commit working feature with passing test

### Code Review Checkpoints

- After Phase 2: Review foundational models/services
- After Phase 3: Review US1 implementation (first story sets patterns)
- After Phase 5: Review core CRUD (US1-3) before moving to enhancements
- After Phase 10: Final review before merge

---

## Task Summary

**Total Tasks**: 175 tasks
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 11 tasks
- Phase 3 (US1 - List): 17 tasks
- Phase 4 (US2 - Create): 23 tasks
- Phase 5 (US3 - Edit): 16 tasks
- Phase 6 (US4 - Toggle/Bulk): 21 tasks
- Phase 7 (US5 - Translations): 22 tasks
- Phase 8 (US6 - Analytics): 18 tasks
- Phase 9 (US7 - Delete): 13 tasks
- Phase 10 (Polish): 30 tasks

**Parallelizable Tasks**: 89 tasks marked with [P]

**Independent Test Criteria**:
- US1: Admin can view, search, filter, sort paginated list
- US2: Admin can create achievement with 4-step form
- US3: Admin can edit any achievement field
- US4: Admin can toggle status and bulk activate/deactivate
- US5: Admin can manage translations and CSV import/export
- US6: Admin can view analytics dashboard
- US7: Admin can delete achievement with cascade

**MVP Scope**: 55 tasks (Phase 1-5) delivers core CRUD functionality

**Format Validation**: ✅ All tasks follow checklist format with Task ID, [P] markers, [Story] labels, and file paths
