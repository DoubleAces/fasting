# Tasks: Codebase Cleanup & Refactoring

**Feature**: 014-codebase-cleanup-refactor  
**Branch**: `014-codebase-cleanup-refactor`  
**Status**: Ready for Implementation

---

## Task Summary

**Total Tasks**: 18  
**User Story 1 (P1)**: 7 tasks (EntryForm cleanup - MVP)  
**User Story 2 (P2)**: 5 tasks (Component audit)  
**User Story 3 (P3)**: 5 tasks (API route review)  
**Polish**: 1 task (Final validation)

**Parallel Opportunities**: 0 tasks (sequential refactoring required - each task depends on previous passing tests)

**Suggested MVP Scope**: User Story 1 only (Phase 3: T003-T009) - delivers immediate value with EntryForm cleanup

---

## Implementation Strategy

### Approach
This is a **refactoring-only feature** with zero new functionality. Each task MUST:
1. Make ONE type of change (per FR-018 incremental commits requirement)
2. Run all tests immediately after change
3. Commit only if tests pass
4. Revert and investigate if tests fail

### Independent Testability
- **User Story 1**: Tested by existing 50 EntryForm tests + manual QA
- **User Story 2**: Tested by full test suite + ESLint
- **User Story 3**: Tested by API integration tests + audit checklist

### Deployment Strategy
- **MVP**: User Story 1 (EntryForm cleanup) can be deployed independently
- **User Story 2**: Can be deployed after User Story 1 (no dependencies)
- **User Story 3**: Can be deployed after User Story 1 (no dependencies)

---

## Phase 1: Setup

### Prerequisites Verification

- [x] T001 Verify all prerequisites before starting (branch: 014-codebase-cleanup-refactor, all tests passing, feature 013 deployed)

**Actions**:
```powershell
git branch --show-current  # Confirm: 014-codebase-cleanup-refactor
npm test  # Confirm: All tests pass (establish green baseline)
npm test -- --testPathPattern=EntryForm.test.js  # Confirm: 50 EntryForm tests pass
npm test -- --coverage  # Confirm: Coverage ≥80%
```

**Success Criteria**:
- Git branch is `014-codebase-cleanup-refactor`
- All tests pass (0 failures)
- Code coverage ≥80%
- No ESLint errors: `npm run lint`

**Dependencies**: None (first task)

---

## Phase 2: Foundational Tasks

### Environment Setup

- [x] T002 Create workspace directory for audit documentation in specs/014-codebase-cleanup-refactor/

**Actions**:
```powershell
# Verify feature directory structure exists
Test-Path "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor"

# Create placeholder for audit reports (will be populated in US2 and US3)
echo "# Component Audit Report - Placeholder" > "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\audit-report.md"
echo "# API Audit Report - Placeholder" > "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\api-audit-report.md"
echo "# QA Report - Placeholder" > "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\qa-report.md"
```

**Success Criteria**:
- Feature directory exists with all documentation files
- Placeholder files created for future audit reports

**Dependencies**: T001 (prerequisites verified)

---

## Phase 3: User Story 1 - EntryForm Code Cleanup (Priority: P1)

**Goal**: Clean up EntryForm.js (941 lines) by removing dead code, extracting duplicate logic, consolidating state updates, and ensuring all 50 tests pass.

**Independent Test**: Run existing 50 EntryForm tests + manual QA of extended fast confirmation flow. Success = all tests pass, no regressions, code demonstrably cleaner (100+ line reduction).

**Estimated Time**: 2-3 hours

### US1: Remove Dead Code

- [x] T003 [US1] Verify handleExtendedFastConfirm and handleExtendedFastDeny functions are unused in src/components/organisms/EntryForm.js

**Actions**:
```powershell
# Search entire codebase for usage
git grep "handleExtendedFastConfirm"
git grep "handleExtendedFastDeny"
```

**Expected Result**: Only function definitions found (lines 215-253), no callers

**Success Criteria**:
- Zero usage found outside function definitions
- Document findings (no callers exist)

**Dependencies**: T002 (environment setup)

---

- [x] T004 [US1] Remove handleExtendedFastConfirm and handleExtendedFastDeny functions (lines 215-253) from src/components/organisms/EntryForm.js

**Actions**:
1. Open `src/components/organisms/EntryForm.js`
2. Delete lines 215-253 (both unused handler functions)
3. Run tests: `npm test -- --testPathPattern=EntryForm.test.js`
4. If tests pass, commit:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): remove unused handleExtendedFastConfirm and handleExtendedFastDeny functions

- Lines 215-253 removed
- Dead code from earlier extended fast confirmation implementation
- Verified no usages with git grep and IDE search
- All 50 tests pass"
```

**Success Criteria**:
- Functions deleted from EntryForm.js
- All 50 EntryForm tests pass
- Committed with descriptive message

**Dependencies**: T003 (dead code verified)

---

- [x] T005 [US1] Verify checkingGap state variable is unused in src/components/organisms/EntryForm.js

**Actions**:
```powershell
# Search for any usage
git grep "checkingGap" src/components/organisms/EntryForm.js
```

**Expected Result**: Only `useState` declaration found (line 69), no reads or sets

**Success Criteria**:
- Zero usage found except declaration
- Documented (state variable never used)

**Dependencies**: T004 (previous refactoring committed)

---

- [x] T006 [US1] Remove checkingGap state variable (line 69) from src/components/organisms/EntryForm.js

**Actions**:
1. Open `src/components/organisms/EntryForm.js`
2. Delete line 69: `const [checkingGap, setCheckingGap] = useState(false);`
3. Run tests: `npm test -- --testPathPattern=EntryForm.test.js`
4. If tests pass, commit:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): remove unused checkingGap state variable

- Line 69 removed
- State variable never read or set
- All 50 tests pass"
```

**Success Criteria**:
- State variable deleted
- All 50 EntryForm tests pass
- Committed

**Dependencies**: T005 (unused state verified)

---

### US1: Extract Duplicate Logic

---

- [x] T007 [US1] Extract duplicate API submission logic to submitFormWithData() function in src/components/organisms/EntryForm.js

**Actions**:
1. Open `src/components/organisms/EntryForm.js`
2. Identify duplicate code in:
   - Lines 420-500: `handleExtendedFastConfirmAndSave` function
   - Lines 540-620: `handleExtendedFastDenyAndSave` function
3. Create new `submitFormWithData(formData, isConfirmation)` function (add before handlers):
```javascript
/**
 * Submits form data with extended fast confirmation status
 * 
 * @param {Object} formData - Entry data to submit
 * @param {boolean} isConfirmation - True if confirming extended fast, false if denying
 * @returns {Promise<Object>} API response with saved entry
 */
const submitFormWithData = async (formData, isConfirmation) => {
  try {
    setIsLoading(true);
    setErrors({});

    const entryData = {
      date: formData.date,
      firstMealTime: formData.firstMealTime,
      lastMealTime: formData.lastMealTime,
      confirmedExtendedFast: isConfirmation,
      notes: formData.notes || '',
    };

    const url = mode === 'edit' 
      ? `/api/entries/${entry._id}` 
      : '/api/entries';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrors(data.details || { general: data.error });
      setIsLoading(false);
      return;
    }

    router.push('/entries');
  } catch (error) {
    console.error('Submission error:', error);
    setErrors({ general: 'An error occurred. Please try again.' });
    setIsLoading(false);
  }
};
```
4. Refactor both handlers to call extracted function:
```javascript
const handleExtendedFastConfirmAndSave = async () => {
  await submitFormWithData(formData, true);
};

const handleExtendedFastDenyAndSave = async () => {
  await submitFormWithData(formData, false);
};
```
5. Delete 80+ duplicate lines from both handler functions
6. Run tests: `npm test -- --testPathPattern=EntryForm.test.js`
7. If tests pass, commit:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): extract duplicate API submission logic to submitFormWithData()

- Created submitFormWithData(formData, isConfirmation) function
- Refactored handleExtendedFastConfirmAndSave and handleExtendedFastDenyAndSave to call extracted function
- Eliminated 80+ lines of duplicate code
- All 50 tests pass, behavior unchanged"
```

**Success Criteria**:
- `submitFormWithData()` function created with JSDoc
- Both handler functions refactored to call extracted function
- 80+ duplicate lines removed
- All 50 EntryForm tests pass
- Committed

**Dependencies**: T006 (previous refactoring committed)

---

### US1: Consolidate State Updates

---

- [x] T008 [US1] Consolidate double setFormData calls in handleChange (lines 99+109) in src/components/organisms/EntryForm.js

**Actions**:
1. Open `src/components/organisms/EntryForm.js`
2. Locate double `setFormData` calls in `handleChange` function (lines 99 and 109)
3. Refactor to single atomic update:
```javascript
// Before (inefficient):
if (name === 'firstMealTime') {
  setFormData(prev => ({ ...prev, firstMealTime: value }));
  const calculatedLastMealTime = /* calculation */;
  setFormData(prev => ({ ...prev, lastMealTime: calculatedLastMealTime }));
}

// After (efficient):
if (name === 'firstMealTime') {
  const calculatedLastMealTime = /* calculation */;
  setFormData(prev => ({ 
    ...prev, 
    firstMealTime: value,
    lastMealTime: calculatedLastMealTime 
  }));
}
```
4. Run tests: `npm test -- --testPathPattern=EntryForm.test.js`
5. If tests pass, commit:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): consolidate double setFormData calls in handleChange

- Combined two setFormData calls into single atomic update
- Improves performance (one re-render instead of two)
- Clearer intent showing both fields updated together
- All 50 tests pass"
```

**Success Criteria**:
- Double `setFormData` calls consolidated into single update
- All 50 EntryForm tests pass
- Committed

**Dependencies**: T007 (duplicate logic extracted)

---

### US1: Manual QA

---

- [x] T009 [US1] Perform manual QA of extended fast confirmation flow and document results in specs/014-codebase-cleanup-refactor/qa-report.md

**Actions**:
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000/entries
3. Test create entry with extended fast:
   - Enter today's date
   - Enter firstMealTime: `08:00`
   - Enter lastMealTime: `18:30` (>16 hour gap)
   - ✅ Verify inline prompt appears
   - Click "Yes, Confirm Extended Fast"
   - ✅ Verify entry saved with `confirmedExtendedFast: true`
   - ✅ Verify redirect to /entries
4. Test deny extended fast:
   - Create another entry with extended fast gap
   - Click "No, Regular Day"
   - ✅ Verify entry saved with `confirmedExtendedFast: false`
5. Test edit entry flow
6. Document results:
```powershell
$qaReport = @"
# Manual QA Report - EntryForm Refactoring (User Story 1)

**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
**Tester**: [Your Name]
**Feature**: 014-codebase-cleanup-refactor
**Phase**: User Story 1 (P1) - EntryForm Cleanup

## Test Scenarios

### ✅ Scenario 1: Create Entry with Extended Fast Confirmation
- **Steps**: Enter date, firstMealTime 08:00, lastMealTime 18:30
- **Expected**: Inline prompt appears
- **Actual**: Prompt displayed correctly
- **Status**: PASS

### ✅ Scenario 2: Confirm Extended Fast
- **Steps**: Click "Yes, Confirm Extended Fast" button
- **Expected**: Entry saved with confirmedExtendedFast=true, redirect to /entries
- **Actual**: Entry saved correctly, redirect successful
- **Status**: PASS

### ✅ Scenario 3: Deny Extended Fast
- **Steps**: Click "No, Regular Day" button
- **Expected**: Entry saved with confirmedExtendedFast=false
- **Actual**: Entry saved correctly
- **Status**: PASS

### ✅ Scenario 4: Edit Entry Flow
- **Steps**: Edit existing entry, modify meal times
- **Expected**: Extended fast prompt appears if gap >16 hours
- **Actual**: Prompt behavior correct
- **Status**: PASS

## Summary

- **Total Scenarios**: 4
- **Passed**: 4
- **Failed**: 0
- **Regressions Found**: None
- **User-Facing Behavior**: Unchanged (FR-006 validated)

## Code Metrics

- **EntryForm.js Line Count Before**: 941 lines
- **EntryForm.js Line Count After**: <850 lines
- **Line Reduction**: 100+ lines (SC-001 validated)
- **Duplicate Code Blocks >20 lines**: 0 (SC-002 validated)
- **Test Pass Rate**: 100% (50/50 tests) (SC-003 validated)

## Conclusion

✅ **User Story 1 COMPLETE** - All acceptance scenarios pass, no regressions detected, code demonstrably cleaner.
"@

$qaReport | Out-File -FilePath "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\qa-report.md" -Encoding UTF8

git add specs/014-codebase-cleanup-refactor/qa-report.md
git commit -m "docs: add manual QA report for User Story 1 (EntryForm refactoring)"
```

**Success Criteria**:
- All 4 QA scenarios pass
- No regressions detected
- qa-report.md created and committed
- **User Story 1 metrics validated**:
  - SC-001: EntryForm.js <850 lines (100+ reduction)
  - SC-002: Zero duplicates >20 lines
  - SC-003: 100% test pass rate (50/50)
  - FR-006: User-facing behavior unchanged

**Dependencies**: T008 (all refactoring complete)

---

## Phase 4: User Story 2 - Component-Wide Code Review (Priority: P2)

**Goal**: Audit all 110 components for duplicate utilities, inconsistent patterns, and unused code. Document findings in audit report.

**Independent Test**: Run full test suite + ESLint. Success = consistent patterns documented, ≥10 issues identified, audit report created.

**Estimated Time**: 3-4 hours

### US2: Automated Analysis

---

- [x] T010 [US2] Run ESLint on all components and save report to specs/014-codebase-cleanup-refactor/eslint-report.txt

**Actions**:
```powershell
# Run ESLint on all components
npm run lint -- --ext .js,.jsx src/components/ > "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\eslint-report.txt" 2>&1

# Review output for obvious issues
Get-Content "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\eslint-report.txt"
```

**Success Criteria**:
- ESLint report generated
- Unused imports, variables, and syntax issues documented

**Dependencies**: T009 (User Story 1 complete)

---

### US2: Manual Component Audit

---

- [x] T011 [US2] Audit all 110 components in src/components/ using checklist (unused imports, props, state, duplicate helpers, error handling, useEffect cleanup, naming, accessibility)

**Actions**:
1. Create audit checklist template
2. Review each component directory (atoms/, molecules/, organisms/):
   - ✅ Unused imports (from ESLint report)
   - ✅ Unused props (PropTypes vs actual usage)
   - ✅ Unused state variables (useState declarations)
   - ✅ Duplicate helper functions (compare similar components)
   - ✅ Inconsistent error handling (try-catch patterns)
   - ✅ Missing useEffect cleanup (return functions)
   - ✅ Naming conventions (camelCase, PascalCase)
   - ✅ Accessibility (ARIA labels, roles)
3. Document findings for each component with issues
4. Categorize by priority (high/medium/low)

**Success Criteria**:
- All 110 components reviewed
- Issues categorized by priority
- Findings documented (file paths + line numbers)

**Dependencies**: T010 (ESLint report generated)

---

- [x] T012 [US2] Search for duplicate utility functions across components using git grep

**Actions**:
```powershell
# Search for common utility patterns
git grep "formatTime" src/components/
git grep "formatDate" src/components/
git grep "calculateDuration" src/components/
git grep "validateEmail" src/components/
git grep "handleError" src/components/

# Document which functions appear in 3+ components (candidates for extraction)
```

**Success Criteria**:
- Duplicate utilities identified
- Functions appearing in 3+ components flagged for extraction to src/lib/utils/
- Documented in audit findings

**Dependencies**: T011 (manual audit in progress)

---

- [ ] T013 [US2] Generate comprehensive component audit report in specs/014-codebase-cleanup-refactor/audit-report.md

**Actions**:
Create detailed report with:
- Executive summary (components reviewed, issues found by priority)
- High priority issues (5+ items expected)
- Medium priority issues (10+ items expected)
- Low priority issues
- Recommendations (immediate, next sprint, backlog)
- Metrics (% components with issues, estimated cleanup time)

**Template**:
```markdown
# Component Audit Report

**Date**: October 26, 2025
**Scope**: 110 components in src/components/
**Method**: ESLint + Manual checklist

## Executive Summary

- **Components Reviewed**: 110
- **Issues Found**: [X]
- **High Priority**: [X]
- **Medium Priority**: [X]
- **Low Priority**: [X]

## High Priority Issues

### 1. [Issue Name]
**Location**: [file paths + line numbers]
**Issue**: [description]
**Impact**: [DRY violation, maintenance burden, etc.]
**Recommended Fix**: [specific solution]
**Effort**: [Small/Medium/Large]

[... more issues ...]

## Recommendations

1. **Immediate** (this feature): Fix high priority issues
2. **Next sprint**: Address medium priority issues
3. **Backlog**: Low priority items

## Metrics

- **Components with Issues**: X/110 (X%)
- **Components Clean**: X/110 (X%)
- **Estimated Cleanup Time**: X hours
```

**Success Criteria**:
- audit-report.md created with all sections
- ≥10 codebase-wide issues documented (SC-006)
- FR-007: Duplicate helpers identified
- FR-008: Error handling patterns documented
- FR-009: Unused imports/props/variables listed
- FR-010: useEffect cleanup patterns reviewed
- Committed

**Dependencies**: T012 (duplicate utilities identified)

---

- [ ] T014 [US2] Run full test suite to validate no regressions from User Story 1 and document User Story 2 completion

**Actions**:
```powershell
# Run all tests
npm test

# Verify coverage maintained
npm test -- --coverage

# Commit audit report
git add specs/014-codebase-cleanup-refactor/audit-report.md
git add specs/014-codebase-cleanup-refactor/eslint-report.txt
git commit -m "docs: add User Story 2 component audit report

- Reviewed all 110 components in src/components/
- Identified [X] issues ([X] high, [X] medium, [X] low priority)
- Documented duplicate utilities, inconsistent patterns, unused code
- Recommended fixes with effort estimates
- Full test suite passes (validates US1 stability)"
```

**Success Criteria**:
- All tests pass (validates User Story 1 refactoring stable)
- Code coverage ≥80% maintained
- **User Story 2 complete**: Audit report committed

**Dependencies**: T013 (audit report generated)

---

## Phase 5: User Story 3 - API Routes & Backend Cleanup (Priority: P3)

**Goal**: Review all 40 API routes for consistent error handling, validation, and query optimization. Document findings in API audit report.

**Independent Test**: Run API integration tests. Success = consistency report for all routes, standard error format documented.

**Estimated Time**: 2-3 hours

### US3: Define Standards

- [ ] T015 [US3] Document standard API error response format in specs/014-codebase-cleanup-refactor/api-standards.md

**Actions**:
Create `api-standards.md` with:
```markdown
# API Standards

## Error Response Format

### Success
\`\`\`javascript
return NextResponse.json(
  { success: true, data: result },
  { status: 200 }
);
\`\`\`

### Error
\`\`\`javascript
return NextResponse.json(
  { 
    success: false, 
    error: 'User-friendly message',
    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
  },
  { status: 400/401/403/404/500 }
);
\`\`\`

## Validation Checklist

1. ✅ Error responses use standard format
2. ✅ Input validation exists (Joi or manual)
3. ✅ Authentication check present (if protected)
4. ✅ Authorization check present (if role-based)
5. ✅ Database errors caught and logged
6. ✅ Success responses include `success: true`
```

**Success Criteria**:
- api-standards.md created
- Standard error format documented
- Validation checklist defined
- Committed

**Dependencies**: T014 (User Story 2 complete)

---

### US3: Audit API Routes

- [ ] T016 [US3] Audit all 40 API routes in src/app/api/ against standards checklist

**Actions**:
1. For each route in src/app/api/:
   - Check error response format compliance
   - Verify input validation exists
   - Check authentication/authorization (if protected)
   - Review database error handling
   - Check query optimization (indexes, projections, limits)
2. Document deviations in audit findings
3. Categorize by severity (critical/medium/low)

**Checklist per route**:
```
Route: POST /api/entries
File: src/app/api/entries/route.js
✅ Standard error format
✅ Input validation (Joi schema)
✅ Authentication check
⚠️ Missing rate limiting
```

**Success Criteria**:
- All 40 routes reviewed
- Deviations documented with file paths
- Critical issues flagged (security vulnerabilities)

**Dependencies**: T015 (standards defined)

---

- [ ] T017 [US3] Search for database queries and check optimization (indexes, projections, limits)

**Actions**:
```powershell
# Find all database queries
git grep "\.find(" src/app/api/
git grep "\.findOne(" src/app/api/
git grep "\.aggregate(" src/app/api/

# For each query, check:
# - Uses indexed fields? (userId, date)
# - Uses projections? (select only needed fields)
# - Uses limits? (prevent loading too much data)
# - Could use .lean()? (plain objects instead of Mongoose docs)
```

**Success Criteria**:
- All database queries identified
- Optimization opportunities documented
- Missing indexes flagged

**Dependencies**: T016 (API routes audited)

---

- [ ] T018 [US3] Generate comprehensive API audit report in specs/014-codebase-cleanup-refactor/api-audit-report.md

**Actions**:
Create report with:
- Executive summary (routes reviewed, issues by severity)
- Critical issues (security vulnerabilities - fix immediately)
- Medium issues (consistency improvements)
- Low issues (code quality, nice-to-haves)
- Compliance summary table
- Recommendations

**Template**:
```markdown
# API Route Audit Report

**Date**: October 26, 2025
**Scope**: 40 API routes in src/app/api/
**Method**: Manual review against standards checklist

## Executive Summary

- **Routes Reviewed**: 40
- **Issues Found**: [X]
- **Critical**: [X]
- **Medium**: [X]
- **Low**: [X]

## Critical Issues

### 1. Missing authentication check
**Location**: [file paths]
**Issue**: Protected routes missing auth middleware
**Impact**: Security vulnerability - unauthorized access
**Recommended Fix**: Add getServerSession() check
**Effort**: Small (30 minutes)

[... more issues ...]

## Compliance Summary

| Standard | Compliant Routes | Non-Compliant Routes |
|----------|------------------|----------------------|
| Error format | X/40 (X%) | X/40 (X%) |
| Input validation | X/40 (X%) | X/40 (X%) |
| Authentication | X/X protected (X%) | X/X protected (X%) |
| Database optimization | X/40 (X%) | X/40 (X%) |
```

**Success Criteria**:
- api-audit-report.md created
- FR-011: Error format consistency documented
- FR-012: Input validation reviewed
- FR-013: Query efficiency assessed
- FR-014: Error logging patterns documented
- Committed

**Dependencies**: T017 (database queries reviewed)

---

## Phase 6: Polish & Final Validation

### Complete Feature

- [ ] T019 Final validation checklist before merge

**Actions**:
```powershell
# Pre-merge checklist
# ✅ All tests pass
npm test

# ✅ Code coverage ≥80%
npm test -- --coverage

# ✅ ESLint passes
npm run lint

# ✅ Manual QA complete
Get-Content "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\qa-report.md"

# ✅ Phase 1 metrics met
# - EntryForm.js <850 lines (100+ reduction)
# - Zero duplicates >20 lines
# - 50/50 tests pass

# ✅ Phase 2 audit complete
Get-Content "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\audit-report.md"

# ✅ Phase 3 audit complete
Get-Content "C:\Code projects\fasting\specs\014-codebase-cleanup-refactor\api-audit-report.md"

# ✅ All requirements validated
# FR-001 to FR-018: All met
# SC-001 to SC-010: All validated

# Ready for code review and merge
```

**Success Criteria**:
- All tests pass (100% pass rate)
- Code coverage ≥80%
- ESLint clean
- All user stories complete
- All documentation committed
- **Ready for code review** (SC-009)
- **Ready for merge to master**

**Dependencies**: T018 (all user stories complete)

---

## Dependencies & Execution Order

### User Story Dependency Graph

```
Setup (T001-T002)
    ↓
User Story 1 (T003-T009) ← MVP - Can deploy independently
    ↓
User Story 2 (T010-T014) ← Independent, can start after US1
    ↓
User Story 3 (T015-T018) ← Independent, can start after US1
    ↓
Polish (T019) ← Final validation
```

### Parallel Execution Opportunities

**NONE** - This is a refactoring feature requiring sequential execution:
- Each task must validate with tests before next task
- Tasks modify same file (EntryForm.js) in User Story 1
- User Story 2 and 3 are document-only but depend on User Story 1 stability

### Critical Path

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 (MVP complete)

**Optional** (can defer if time-constrained):
→ T010 → T011 → T012 → T013 → T014 (User Story 2)
→ T015 → T016 → T017 → T018 (User Story 3)
→ T019 (Final validation)

---

## Success Metrics

### User Story 1 (P1) - EntryForm Cleanup
- ✅ SC-001: EntryForm.js <850 lines (100+ reduction)
- ✅ SC-002: Zero duplicate code blocks >20 lines
- ✅ SC-003: 100% test pass rate (50/50 tests)
- ✅ SC-004: 15% cognitive complexity reduction
- ✅ SC-005: Phase 1 complete in 2-3 hours
- ✅ FR-001: Unused handlers removed
- ✅ FR-002: Unused state variable removed
- ✅ FR-003: Duplicate logic extracted to submitFormWithData()
- ✅ FR-004: Double setFormData calls consolidated
- ✅ FR-005: All 50 EntryForm tests pass
- ✅ FR-006: User-facing behavior unchanged (manual QA)

### User Story 2 (P2) - Component Audit
- ✅ SC-006: ≥10 codebase-wide patterns documented
- ✅ FR-007: Duplicate helpers identified
- ✅ FR-008: Error handling patterns documented
- ✅ FR-009: Unused imports/props/variables listed
- ✅ FR-010: useEffect cleanup patterns reviewed

### User Story 3 (P3) - API Route Review
- ✅ FR-011: API error format documented
- ✅ FR-012: Input validation reviewed
- ✅ FR-013: Query efficiency assessed
- ✅ FR-014: Error logging patterns documented

### Overall Feature Success
- ✅ SC-007: Zero production incidents (30-day monitoring)
- ✅ SC-008: CI/CD pipeline passes
- ✅ SC-009: Code review approved
- ✅ SC-010: Manual QA checklist complete
- ✅ FR-015: All tests pass after each commit
- ✅ FR-016: Manual QA confirms no regressions
- ✅ FR-017: Code coverage ≥80%
- ✅ FR-018: Incremental commits (one issue per commit)

---

## Notes

- **No new tests created**: Per clarification decision, rely on existing 50 EntryForm tests for validation
- **No architectural changes**: Pure refactoring, zero breaking changes (FR-006, out of scope)
- **No API contract changes**: All refactoring internal to components (data-model.md confirms)
- **Incremental commits required**: Run tests after EVERY change, commit only if green (FR-018)
- **Manual QA required**: Extended fast confirmation flow must be manually tested (FR-016, SC-010)
- **Code review required**: Second developer must approve before merge (SC-009)

---

**Generated**: October 26, 2025  
**Feature**: 014-codebase-cleanup-refactor  
**Total Tasks**: 19 (1 setup, 1 foundational, 7 US1, 5 US2, 5 US3, 1 polish)  
**Estimated Time**: 7-10 hours (MVP: 2-3 hours for US1 only)
