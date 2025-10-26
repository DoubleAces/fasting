# Quickstart Guide: Codebase Cleanup & Refactoring

**Feature**: 014-codebase-cleanup-refactor  
**Branch**: `014-codebase-cleanup-refactor`  
**Date**: October 26, 2025

## Overview

Step-by-step guide for safely refactoring the Fasting Tracker codebase to remove technical debt. Focuses on EntryForm.js cleanup (Phase 1), then expands to component audit (Phase 2) and API route review (Phase 3).

**Key Principle**: Incremental commits with test validation after EVERY change.

---

## Prerequisites

✅ **Required Before Starting**:
- Feature 013 (inline-fast-confirmation) deployed and stable in production
- All tests passing (`npm test` shows 0 failures)
- Working development environment (Node.js, MongoDB, dependencies installed)
- Git branch `014-codebase-cleanup-refactor` checked out
- VS Code or similar IDE with "Find All References" functionality

⚠️ **Verify Current State**:
```powershell
# Check branch
git branch --show-current  # Should show: 014-codebase-cleanup-refactor

# Run all tests (establish green baseline)
npm test

# Run EntryForm tests specifically
npm test -- --testPathPattern=EntryForm.test.js

# Check code coverage
npm test -- --coverage
```

Expected: All tests pass (50 EntryForm tests + full suite), coverage ≥80%

---

## Phase 1: EntryForm.js Cleanup (Priority: P1)

**File**: `src/components/organisms/EntryForm.js` (941 lines)  
**Estimated Time**: 2-3 hours  
**Test File**: `tests/components/EntryForm.test.js` (50 tests)

### Step 1.1: Remove Unused Handler Functions (Lines 215-253)

**What**: Delete `handleExtendedFastConfirm` and `handleExtendedFastDeny` functions  
**Why**: These functions are never called (dead code from earlier implementation)

**Actions**:

1. **Verify dead code**:
```powershell
# Search entire codebase for usage
git grep "handleExtendedFastConfirm"
git grep "handleExtendedFastDeny"
```

Expected: Only function definitions found, no callers

2. **Delete functions** (lines 215-253 in EntryForm.js):
```javascript
// DELETE THIS BLOCK:
const handleExtendedFastConfirm = () => {
  // ... ~20 lines ...
};

const handleExtendedFastDeny = () => {
  // ... ~20 lines ...
};
```

3. **Run tests immediately**:
```powershell
npm test -- --testPathPattern=EntryForm.test.js
```

Expected: All 50 tests pass (no failures)

4. **Commit**:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): remove unused handleExtendedFastConfirm and handleExtendedFastDeny functions

- Lines 215-253 removed
- Dead code from earlier extended fast confirmation implementation
- Verified no usages with git grep and IDE search
- All 50 tests pass"
```

**⏱️ Checkpoint**: Tests green? ✅ Proceed. Tests red? ❌ Revert and investigate.

---

### Step 1.2: Remove Unused State Variable (Line 69)

**What**: Delete `checkingGap` state variable  
**Why**: Never read or set anywhere in component

**Actions**:

1. **Verify unused**:
```powershell
# Search for any usage
git grep "checkingGap"
```

Expected: Only the `useState` declaration found

2. **Delete state declaration** (line 69 in EntryForm.js):
```javascript
// DELETE THIS LINE:
const [checkingGap, setCheckingGap] = useState(false);
```

3. **Run tests**:
```powershell
npm test -- --testPathPattern=EntryForm.test.js
```

Expected: All 50 tests pass

4. **Commit**:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): remove unused checkingGap state variable

- Line 69 removed
- State variable never read or set
- All 50 tests pass"
```

**⏱️ Checkpoint**: Tests green? ✅ Proceed. Tests red? ❌ Revert and investigate.

---

### Step 1.3: Extract Duplicate API Submission Logic (Lines 420-640)

**What**: Create `submitFormWithData()` function to eliminate 80+ duplicate lines  
**Why**: `handleExtendedFastConfirmAndSave` and `handleExtendedFastDenyAndSave` have identical API logic

**Actions**:

1. **Identify duplicate code** (in EntryForm.js):
- Lines 420-500: `handleExtendedFastConfirmAndSave` function
- Lines 540-620: `handleExtendedFastDenyAndSave` function
- Compare: 80+ lines are identical except `confirmedExtendedFast` value

2. **Create extracted function** (add before the two handler functions):

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

    // Build entry data
    const entryData = {
      date: formData.date,
      firstMealTime: formData.firstMealTime,
      lastMealTime: formData.lastMealTime,
      confirmedExtendedFast: isConfirmation, // ← Key difference
      notes: formData.notes || '',
    };

    // Determine endpoint (create vs edit)
    const url = mode === 'edit' 
      ? `/api/entries/${entry._id}` 
      : '/api/entries';
    const method = mode === 'edit' ? 'PUT' : 'POST';

    // Make API call
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

    // Success: redirect to entries list
    router.push('/entries');
  } catch (error) {
    console.error('Submission error:', error);
    setErrors({ general: 'An error occurred. Please try again.' });
    setIsLoading(false);
  }
};
```

3. **Refactor handlers** (simplify to one-liners):

```javascript
const handleExtendedFastConfirmAndSave = async () => {
  await submitFormWithData(formData, true);
};

const handleExtendedFastDenyAndSave = async () => {
  await submitFormWithData(formData, false);
};
```

4. **Delete 80+ duplicate lines** from both handler functions

5. **Run tests**:
```powershell
npm test -- --testPathPattern=EntryForm.test.js
```

Expected: All 50 tests pass (behavior unchanged)

6. **Commit**:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): extract duplicate API submission logic to submitFormWithData()

- Created submitFormWithData(formData, isConfirmation) function
- Refactored handleExtendedFastConfirmAndSave and handleExtendedFastDenyAndSave to call extracted function
- Eliminated 80+ lines of duplicate code
- All 50 tests pass, behavior unchanged"
```

**⏱️ Checkpoint**: Tests green? ✅ Proceed. Tests red? ❌ Revert and investigate.

---

### Step 1.4: Consolidate Double setFormData Calls (Lines 99 + 109)

**What**: Combine two `setFormData` calls into single atomic update  
**Why**: More efficient (one re-render instead of two), clearer intent

**Actions**:

1. **Locate double update** (in `handleChange` function):

```javascript
// CURRENT CODE (inefficient):
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'firstMealTime') {
    setFormData(prev => ({ ...prev, firstMealTime: value })); // Line 99
    
    // Calculate lastMealTime based on default fasting window
    const calculatedLastMealTime = /* ... calculation ... */;
    
    setFormData(prev => ({ ...prev, lastMealTime: calculatedLastMealTime })); // Line 109 ⚠️
  }
};
```

2. **Refactor to single update**:

```javascript
// REFACTORED CODE (efficient):
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'firstMealTime') {
    // Calculate lastMealTime based on default fasting window
    const calculatedLastMealTime = /* ... calculation ... */;
    
    // Single atomic update
    setFormData(prev => ({ 
      ...prev, 
      firstMealTime: value,
      lastMealTime: calculatedLastMealTime 
    }));
  }
};
```

3. **Run tests**:
```powershell
npm test -- --testPathPattern=EntryForm.test.js
```

Expected: All 50 tests pass

4. **Commit**:
```powershell
git add src/components/organisms/EntryForm.js
git commit -m "refactor(EntryForm): consolidate double setFormData calls in handleChange

- Combined two setFormData calls into single atomic update
- Improves performance (one re-render instead of two)
- Clearer intent showing both fields updated together
- All 50 tests pass"
```

**⏱️ Checkpoint**: Tests green? ✅ Proceed. Tests red? ❌ Revert and investigate.

---

### Step 1.5: Manual QA - Extended Fast Confirmation Flow

**What**: Verify extended fast confirmation UI works correctly after refactoring  
**Why**: Integration tests pass, but manual testing confirms no visual regressions

**Actions**:

1. **Start development server**:
```powershell
npm run dev
```

2. **Navigate to**: http://localhost:3000/entries

3. **Test Create Entry with Extended Fast**:
   - Click "Log Entry" or similar button
   - Enter today's date
   - Enter firstMealTime: `08:00`
   - Enter lastMealTime: `18:30` (>16 hour gap from previous day)
   - ✅ Verify inline prompt appears: "Confirm Extended Fast?"
   - Click "Yes, Confirm Extended Fast"
   - ✅ Verify entry saved with `confirmedExtendedFast: true`
   - ✅ Verify redirect to /entries list

4. **Test Deny Extended Fast**:
   - Create another entry with extended fast gap
   - Click "No, Regular Day"
   - ✅ Verify entry saved with `confirmedExtendedFast: false`
   - ✅ Verify redirect to /entries list

5. **Test Edit Entry** (if applicable):
   - Edit existing entry
   - Change meal times to trigger extended fast prompt
   - ✅ Verify prompt appears and save works

6. **Document QA results**:
```powershell
# Create QA report
echo "Manual QA - EntryForm Refactoring (Phase 1)" > specs/014-codebase-cleanup-refactor/qa-report.md
echo "" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "✅ Create entry with extended fast confirmation: PASS" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "✅ Deny extended fast: PASS" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "✅ Edit entry flow: PASS" >> specs/014-codebase-cleanup-refactor/qa-report.md
echo "✅ No visual regressions observed: PASS" >> specs/014-codebase-cleanup-refactor/qa-report.md

git add specs/014-codebase-cleanup-refactor/qa-report.md
git commit -m "docs: add manual QA report for Phase 1 EntryForm refactoring"
```

**⏱️ Checkpoint**: Manual QA pass? ✅ Phase 1 complete. QA fail? ❌ Investigate and fix.

---

### Phase 1 Success Metrics

After Step 1.1-1.5 complete:

- ✅ **SC-001**: EntryForm.js reduced from 941 lines to <850 lines (≥100 line reduction)
- ✅ **SC-002**: Zero duplicate code blocks >20 lines in EntryForm.js
- ✅ **SC-003**: 100% test pass rate maintained (all 50 tests pass)
- ✅ **SC-004**: Cognitive complexity reduced (fewer functions, clearer logic)
- ✅ **SC-005**: Phase 1 complete in single focused session
- ✅ **FR-001**: Unused handlers removed
- ✅ **FR-002**: Unused state variable removed
- ✅ **FR-003**: Duplicate logic extracted to `submitFormWithData()`
- ✅ **FR-004**: Double setFormData calls consolidated
- ✅ **FR-005**: All 50 EntryForm tests pass
- ✅ **FR-006**: User-facing behavior unchanged (manual QA confirms)

---

## Phase 2: Component-Wide Audit (Priority: P2)

**Scope**: All 110 components in `src/components/`  
**Estimated Time**: 3-4 hours  
**Output**: `audit-report.md` with findings

### Step 2.1: Run ESLint for Obvious Issues

**What**: Use ESLint to detect unused imports, variables, and syntax issues  
**Why**: Automated detection of low-hanging fruit

**Actions**:

```powershell
# Run ESLint on all components
npm run lint -- --ext .js,.jsx src/components/

# Save output
npm run lint -- --ext .js,.jsx src/components/ > specs/014-codebase-cleanup-refactor/eslint-report.txt
```

**Review output**: Note any `no-unused-vars`, `no-unused-imports`, or similar warnings. Add to audit report.

---

### Step 2.2: Manual Component Audit Checklist

**What**: Systematically review components for patterns  
**Why**: Semantic issues require human review

**Audit Checklist Template**:

For each component directory (`atoms/`, `molecules/`, `organisms/`):

1. **Unused Imports**: Check for imports never used in file
2. **Unused Props**: Check PropTypes/JSDoc against actual prop usage
3. **Unused State**: Check `useState` declarations for variables never read
4. **Duplicate Helpers**: Compare similar components for duplicate utility functions
5. **Error Handling**: Check try-catch patterns are consistent
6. **useEffect Cleanup**: Verify cleanup functions returned where needed
7. **Naming Conventions**: Check camelCase for variables, PascalCase for components
8. **Accessibility**: Check ARIA labels, roles, semantic HTML

**Sample Audit Entry**:

```markdown
## Component: Button (atoms/Button.js)

✅ No unused imports  
✅ Props usage matches PropTypes  
✅ No state management (presentational component)  
⚠️ Missing `aria-label` for icon-only variant  
⚠️ Inconsistent error handling compared to Input component

**Recommended Fix**: Add `aria-label` prop when `children` is empty. Use same try-catch pattern as Input.  
**Effort**: Small (15 minutes)
```

---

### Step 2.3: Identify Duplicate Utilities

**What**: Find helper functions duplicated across components  
**Why**: Extract to shared utilities if used in 3+ places

**Actions**:

```powershell
# Search for common utility patterns
git grep "formatTime" src/components/
git grep "formatDate" src/components/
git grep "calculateDuration" src/components/
git grep "validateEmail" src/components/
```

**Document findings**:
- If function appears in 3+ components → recommend extraction to `src/lib/utils/`
- If function appears in 1-2 components → acceptable duplication, document for awareness

---

### Step 2.4: Generate Audit Report

**What**: Consolidate findings into `audit-report.md`  
**Why**: Reference document for future cleanup work

**Template**:

```markdown
# Component Audit Report

**Date**: October 26, 2025  
**Scope**: 110 components in src/components/  
**Method**: ESLint + Manual checklist

## Executive Summary

- **Components Reviewed**: 110
- **Issues Found**: 25
- **High Priority**: 5
- **Medium Priority**: 12
- **Low Priority**: 8

## High Priority Issues

### 1. Duplicate `formatTime` function (5 components)

**Location**: 
- src/components/organisms/EntryForm.js (line 150)
- src/components/organisms/HistoryTable.js (line 85)
- src/components/molecules/TimeInput.js (line 45)
- src/components/molecules/DurationDisplay.js (line 30)
- src/components/pages/EntriesPage.js (line 200)

**Issue**: Same utility function copy-pasted across 5 files  
**Impact**: DRY violation, maintenance burden (bug fixes need 5 updates)  
**Recommended Fix**: Extract to `src/lib/utils/timeUtils.js`, import in all 5 locations  
**Effort**: Medium (1 hour - extract, update imports, test all 5 components)

[... more high priority issues ...]

## Medium Priority Issues

[... list ...]

## Low Priority Issues

[... list ...]

## Recommendations

1. **Immediate** (this feature): Fix high priority issues (5 items)
2. **Next sprint**: Address medium priority issues (12 items)
3. **Backlog**: Low priority items for future cleanup

## Metrics

- **Total Components**: 110
- **Components with Issues**: 38 (34.5%)
- **Components Clean**: 72 (65.5%)
- **Estimated Cleanup Time**: 8-10 hours for all issues
```

**Commit audit report**:

```powershell
git add specs/014-codebase-cleanup-refactor/audit-report.md
git add specs/014-codebase-cleanup-refactor/eslint-report.txt
git commit -m "docs: add Phase 2 component audit report

- Reviewed all 110 components in src/components/
- Identified 25 issues (5 high, 12 medium, 8 low priority)
- Documented duplicate utilities, inconsistent patterns, missing cleanup
- Recommended fixes with effort estimates"
```

---

### Phase 2 Success Metrics

After audit complete:

- ✅ **SC-006**: Identified and documented ≥10 codebase-wide patterns/issues
- ✅ **FR-007**: Duplicate helper functions identified
- ✅ **FR-008**: Error handling patterns documented
- ✅ **FR-009**: Unused imports/props/variables listed
- ✅ **FR-010**: useEffect cleanup patterns reviewed

**Note**: Phase 2 is **documentation-focused**. Actual fixes can be deferred to future work if time-constrained. The audit report serves as backlog for continuous improvement.

---

## Phase 3: API Route Review (Priority: P3)

**Scope**: All 40 API routes in `src/app/api/`  
**Estimated Time**: 2-3 hours  
**Output**: `api-audit-report.md` with findings

### Step 3.1: Define Standard Error Response Format

**What**: Document expected error response shape  
**Why**: Consistency makes frontend error handling easier

**Standard Format**:

```javascript
// Success
return NextResponse.json(
  { success: true, data: result },
  { status: 200 }
);

// Error
return NextResponse.json(
  { 
    success: false, 
    error: 'User-friendly message',
    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
  },
  { status: 400/401/403/404/500 }
);
```

**Document in**: `specs/014-codebase-cleanup-refactor/api-standards.md`

---

### Step 3.2: Audit All API Routes

**What**: Check each route for consistency  
**Why**: Identify deviations from standard patterns

**Checklist** (for each route in `src/app/api/`):

1. ✅ Error responses use standard format
2. ✅ Input validation exists (Joi schema or manual checks)
3. ✅ Authentication check present (if protected route)
4. ✅ Authorization check present (if role-based access)
5. ✅ Database errors caught and logged
6. ✅ Success responses include `success: true` field

**Sample Audit Entry**:

```markdown
## Route: POST /api/entries

**File**: src/app/api/entries/route.js  
✅ Standard error format  
✅ Input validation (Joi schema)  
✅ Authentication check (auth middleware)  
✅ Database error handling  
⚠️ Missing rate limiting for abuse prevention

**Recommended Fix**: Add rate limiting middleware (5 requests/minute per user)  
**Effort**: Medium (requires shared middleware setup)
```

---

### Step 3.3: Database Query Optimization Review

**What**: Check for inefficient queries or missing indexes  
**Why**: Prevent performance issues as data grows

**Actions**:

```powershell
# Find all database queries
git grep "\.find(" src/app/api/
git grep "\.findOne(" src/app/api/
git grep "\.aggregate(" src/app/api/
```

**Check each query**:
- Does it use indexed fields? (e.g., `userId`, `date`)
- Does it use projections? (only select needed fields)
- Does it use limits? (prevent loading too much data)
- Could it use `.lean()`? (return plain objects instead of Mongoose docs)

**Document findings** in `api-audit-report.md`

---

### Step 3.4: Generate API Audit Report

**Template**:

```markdown
# API Route Audit Report

**Date**: October 26, 2025  
**Scope**: 40 API routes in src/app/api/  
**Method**: Manual review against standards checklist

## Executive Summary

- **Routes Reviewed**: 40
- **Issues Found**: 12
- **Critical**: 2
- **Medium**: 6
- **Low**: 4

## Critical Issues

### 1. Missing authentication check (2 routes)

**Location**:
- src/app/api/settings/route.js (PUT handler)
- src/app/api/entries/[id]/route.js (DELETE handler)

**Issue**: Protected routes missing authentication middleware  
**Impact**: Security vulnerability - unauthorized users could modify data  
**Recommended Fix**: Add `auth` middleware or `getServerSession()` check  
**Effort**: Small (30 minutes - add checks, test with unauthenticated requests)

[... more critical issues ...]

## Recommendations

1. **Fix critical issues immediately** (security vulnerabilities)
2. **Address medium issues in next sprint** (consistency improvements)
3. **Low priority items** (code quality, nice-to-haves)

## Compliance Summary

| Standard | Compliant Routes | Non-Compliant Routes |
|----------|------------------|----------------------|
| Error format | 38/40 (95%) | 2/40 (5%) |
| Input validation | 35/40 (87.5%) | 5/40 (12.5%) |
| Authentication | 30/32 protected (93.75%) | 2/32 protected (6.25%) |
| Database optimization | 28/40 (70%) | 12/40 (30%) |
```

**Commit audit report**:

```powershell
git add specs/014-codebase-cleanup-refactor/api-audit-report.md
git add specs/014-codebase-cleanup-refactor/api-standards.md
git commit -m "docs: add Phase 3 API route audit report

- Reviewed all 40 API routes in src/app/api/
- Identified 12 issues (2 critical, 6 medium, 4 low priority)
- Documented missing auth checks, inconsistent error formats, query optimizations
- Defined standard error response format for future consistency"
```

---

### Phase 3 Success Metrics

After audit complete:

- ✅ **FR-011**: API error response format documented
- ✅ **FR-012**: Input validation reviewed for all routes
- ✅ **FR-013**: Database query efficiency assessed
- ✅ **FR-014**: Error logging patterns documented

**Note**: Like Phase 2, Phase 3 is primarily **documentation**. Critical security issues (if any) should be fixed immediately. Other improvements can be backlogged.

---

## Final Validation & Merge

### Pre-Merge Checklist

Before merging `014-codebase-cleanup-refactor` into `master`:

- ✅ **All tests pass**: `npm test` (100% pass rate)
- ✅ **Code coverage ≥80%**: `npm test -- --coverage`
- ✅ **ESLint passes**: `npm run lint` (no errors)
- ✅ **Manual QA complete**: qa-report.md created and all scenarios pass
- ✅ **Phase 1 metrics met**: EntryForm.js reduced by 100+ lines, zero duplicates >20 lines
- ✅ **Phase 2 audit complete**: audit-report.md created
- ✅ **Phase 3 audit complete**: api-audit-report.md created (or explicitly deferred if time-constrained)
- ✅ **Code review approved**: Second developer reviewed changes
- ✅ **Incremental commits**: One issue type per commit (FR-018)

### Merge Process

```powershell
# Ensure on feature branch
git checkout 014-codebase-cleanup-refactor

# Pull latest master
git fetch origin master
git merge origin/master

# Resolve any conflicts (unlikely for refactoring)

# Final test run
npm test

# Push feature branch
git push origin 014-codebase-cleanup-refactor

# Create pull request (GitHub/GitLab UI)
# Title: "feat: codebase cleanup and refactoring (Phase 1 complete)"
# Description: Link to specs/014-codebase-cleanup-refactor/spec.md
# Reviewers: Assign second developer

# After approval, merge to master
git checkout master
git merge 014-codebase-cleanup-refactor
git push origin master
```

### Post-Merge Monitoring

**Watch for**:
- Zero production incidents in 30 days (SC-007)
- No test failures in CI/CD (SC-008)
- No user-reported regressions (FR-006 validation)

---

## Troubleshooting

### Tests Fail After Refactoring

**Problem**: Tests were green before change, now red  
**Solution**:

1. Read test failure output carefully
2. Revert last commit: `git revert HEAD`
3. Re-run tests to confirm green again
4. Investigate why change broke tests
5. Fix issue, commit again

### Manual QA Finds Regression

**Problem**: Tests pass but behavior changed  
**Solution**:

1. Document specific regression (steps to reproduce)
2. Add new test case for missed scenario
3. Fix regression
4. Re-run all tests + manual QA

### Merge Conflicts with Master

**Problem**: Another developer changed same files  
**Solution**:

1. Communicate with team about conflict
2. Review conflicting changes carefully
3. Resolve conflicts favoring their changes (if feature work) or your refactoring (if also cleanup)
4. Re-run full test suite after merge

---

## Time Estimates

| Phase | Estimated Time | Tasks |
|-------|----------------|-------|
| **Phase 1 (P1)** | 2-3 hours | EntryForm cleanup (4 changes + manual QA) |
| **Phase 2 (P2)** | 3-4 hours | Component audit (ESLint + manual review) |
| **Phase 3 (P3)** | 2-3 hours | API route audit (standards + review) |
| **Total** | 7-10 hours | Full feature completion |

**Minimum Viable Completion**: Phase 1 only (2-3 hours) delivers immediate value and meets P1 success criteria.

---

## Next Steps

After this feature complete:

1. **Schedule follow-up work**: Address high-priority issues from Phase 2 and Phase 3 audits
2. **Socialize standards**: Share api-standards.md and component patterns with team
3. **Update documentation**: Reflect new `submitFormWithData()` pattern in component docs
4. **Continuous improvement**: Add ESLint rules to prevent regression (e.g., detect duplicate code)

---

**Ready to start?** → Begin with **Phase 1, Step 1.1**: Remove unused handler functions from EntryForm.js
