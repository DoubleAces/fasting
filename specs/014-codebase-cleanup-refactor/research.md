# Research: Codebase Cleanup & Refactoring

**Feature**: 014-codebase-cleanup-refactor  
**Date**: October 26, 2025  
**Status**: Completed

## Overview

This document consolidates research findings for safe, systematic code refactoring across the Fasting Tracker codebase. Focus areas: dead code removal, duplicate logic extraction, state management optimization, and pattern consistency across 110 components and 40 API routes.

---

## Research Areas

### 1. React Component Refactoring Best Practices

**Decision**: Use incremental refactoring with test validation after each change

**Rationale**:
- **Safety**: Small commits allow easy rollback if tests fail
- **Confidence**: Running 50 EntryForm tests after each change validates behavior preservation
- **Clarity**: Git history shows exactly what changed and why
- **Team Review**: Smaller diffs are easier to review for correctness

**Implementation Approach**:
1. Run all tests to establish green baseline (`npm test`)
2. Make ONE type of change (e.g., remove one unused function)
3. Run tests immediately (`npm test -- --testPathPattern=EntryForm.test.js`)
4. If green: commit with descriptive message (e.g., "refactor(EntryForm): remove unused handleExtendedFastConfirm")
5. If red: revert and investigate why tests failed
6. Repeat for next change

**Alternatives Considered**:
- **Big-bang refactoring** (all changes at once): Rejected - too risky, hard to debug test failures, difficult code review
- **Branch-per-change** (separate branch for each cleanup): Rejected - excessive overhead, merge conflicts between branches
- **Test-first refactoring** (write new tests before changes): Rejected - out of scope per clarification decision, existing tests sufficient

**References**:
- Martin Fowler's "Refactoring" (Chapter 2: Principles in Refactoring)
- Kent Beck's "Test-Driven Development: By Example"

---

### 2. Dead Code Detection Strategies

**Decision**: Manual review with IDE "Find Usages" + git grep confirmation

**Rationale**:
- **Accuracy**: Known dead code already identified (handleExtendedFastConfirm/Deny never called)
- **IDE Support**: VS Code "Find All References" catches JavaScript usage across project
- **Production Validation**: Git grep confirms no dynamic invocations (string-based calls)
- **Log Verification**: Check production logs for evidence of usage (Assumption #7 from spec)

**Implementation Approach**:
1. **For known dead code** (handleExtendedFastConfirm, handleExtendedFastDeny, checkingGap):
   - Verify with "Find All References" in VS Code (Ctrl+Shift+F)
   - Run `git grep "handleExtendedFastConfirm"` to catch string usage
   - Check production logs for function name mentions
   - If zero results: safe to delete

2. **For suspected dead code** (P2 component audit):
   - Use ESLint `no-unused-vars` rule to find unused imports/variables
   - Check component props usage with "Find All References"
   - Document intentional dead code with comments (e.g., "// Reserved for future feature X")

**Alternatives Considered**:
- **Automated tools** (coverage-based dead code detection): Rejected - high false positive rate, requires sophisticated tooling setup
- **Delete and see what breaks**: Rejected - unprofessional, wastes CI/CD resources, confuses team
- **Comment out instead of delete**: Rejected - creates code clutter, git history serves as backup

**References**:
- OWASP Code Review Guide (Section: Dead Code)
- "Working Effectively with Legacy Code" by Michael Feathers

---

### 3. Duplicate Code Extraction Patterns

**Decision**: Extract to local function within component (clarified as `submitFormWithData()`)

**Rationale**:
- **Scope Containment**: No ripple effects to other components or files
- **Testability**: Existing integration tests cover extracted logic through caller functions
- **Clear Intent**: Function name `submitFormWithData(formData, isConfirmation)` documents purpose
- **Safety**: Doesn't risk breaking existing `submitForm()` function used by other code paths
- **Simplicity**: Minimal refactoring - just extract duplicate lines to new function

**Implementation Approach**:

**Current State** (lines 420-640 in EntryForm.js):
```javascript
const handleExtendedFastConfirmAndSave = async () => {
  // 80+ lines of API submission logic
  // ... duplicate code ...
};

const handleExtendedFastDenyAndSave = async () => {
  // 80+ lines of identical API submission logic
  // ... duplicate code ...
};
```

**Refactored State**:
```javascript
/**
 * Submits form data with extended fast confirmation status
 * @param {Object} formData - Entry data to submit
 * @param {boolean} isConfirmation - True if confirming extended fast, false if denying
 * @returns {Promise<Object>} API response with saved entry
 */
const submitFormWithData = async (formData, isConfirmation) => {
  // Extracted 80+ lines of submission logic
  // Sets confirmedExtendedFast based on isConfirmation param
  // Handles API call, error handling, success redirect
  // ... extracted logic ...
};

const handleExtendedFastConfirmAndSave = async () => {
  await submitFormWithData(formData, true);
};

const handleExtendedFastDenyAndSave = async () => {
  await submitFormWithData(formData, false);
};
```

**Alternatives Considered**:
- **Call existing submitForm()**: Rejected - would require modifying tested function, risk breaking other callers
- **Extract to shared utility file**: Rejected - over-engineering for single-component use case, violates YAGNI
- **Keep duplicate code with TODO comment**: Rejected - doesn't solve technical debt problem

**References**:
- "Refactoring: Improving the Design of Existing Code" by Martin Fowler (Extract Function pattern)
- Clean Code by Robert C. Martin (DRY principle)

---

### 4. React State Management Optimization

**Decision**: Consolidate double `setFormData` calls into single atomic update

**Rationale**:
- **Performance**: Single state update triggers one re-render instead of two
- **Consistency**: Reduces risk of intermediate state causing bugs
- **Clarity**: Intent is clearer with single update showing both fields change together
- **React Best Practice**: Batch related state updates when possible

**Implementation Approach**:

**Current State** (lines 99 and 109 in EntryForm.js):
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'firstMealTime') {
    setFormData(prev => ({ ...prev, firstMealTime: value }));
    // ... some logic ...
    setFormData(prev => ({ ...prev, lastMealTime: calculatedValue })); // Line 109
  }
};
```

**Refactored State**:
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'firstMealTime') {
    const calculatedValue = /* ... calculation logic ... */;
    setFormData(prev => ({ 
      ...prev, 
      firstMealTime: value,
      lastMealTime: calculatedValue 
    }));
  }
};
```

**Alternatives Considered**:
- **Use React 18 automatic batching**: Rejected - explicit single update is clearer and more intentional
- **Separate useState hooks**: Rejected - would require more extensive refactoring, breaks existing patterns
- **useReducer instead of useState**: Rejected - out of scope (no architectural changes)

**References**:
- React 18 Automatic Batching: https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching
- React useState Best Practices

---

### 5. Component Audit Methodology (Phase 2)

**Decision**: Manual review with checklist + ESLint for obvious issues

**Rationale**:
- **Balance**: Automated tools catch syntax-level issues, manual review catches semantic issues
- **Efficiency**: Don't need deep analysis for every component, just identify patterns
- **Scope Control**: Manual approach prevents scope creep into unnecessary optimizations
- **Documentation**: Audit report becomes reference for future development

**Implementation Approach**:

**Audit Checklist** (for each component in src/components/):
1. ✅ Unused imports (ESLint `no-unused-imports`)
2. ✅ Unused props (check PropTypes/JSDoc against actual usage)
3. ✅ Unused state variables (check useState declarations)
4. ✅ Duplicate helper functions (compare similar components)
5. ✅ Inconsistent error handling (try-catch patterns, error boundaries)
6. ✅ Missing useEffect cleanup (return cleanup functions)
7. ✅ Inconsistent naming conventions (camelCase, PascalCase)
8. ✅ Missing accessibility attributes (ARIA labels, roles)

**Output**: `audit-report.md` in specs/014-codebase-cleanup-refactor/ listing:
- Components with issues (file paths + line numbers)
- Issue type and severity (high/medium/low)
- Recommended fix
- Estimated effort (small/medium/large)

**Alternatives Considered**:
- **Automated refactoring tools** (jscodeshift, Codemod): Rejected - high setup cost, risk of incorrect transformations
- **Deep static analysis** (SonarQube, CodeClimate): Rejected - overkill for this scope, generates noise
- **Skip Phase 2 entirely**: Rejected - defeats purpose of codebase-wide cleanup

**References**:
- ESLint Rules: https://eslint.org/docs/latest/rules/
- React Component Checklist: https://react.dev/learn/thinking-in-react

---

### 6. API Route Consistency Patterns (Phase 3)

**Decision**: Document standard error response format and validate compliance

**Rationale**:
- **Consistency**: All API routes should return errors in same shape for frontend handling
- **Debugging**: Standard format makes logs easier to parse and troubleshoot
- **Documentation**: Serves as reference for future API route development
- **No Breaking Changes**: Review only, fixes applied if no client impact

**Implementation Approach**:

**Standard Error Response Format** (Next.js API Routes):
```javascript
// Success response
return NextResponse.json(
  { success: true, data: result },
  { status: 200 }
);

// Error response
return NextResponse.json(
  { 
    success: false, 
    error: 'User-friendly message',
    details: process.env.NODE_ENV === 'development' ? errorStack : undefined 
  },
  { status: 400/401/403/404/500 }
);
```

**Audit Process**:
1. Review all 40 API routes in `src/app/api/`
2. Check error response format consistency
3. Verify input validation exists (Joi schemas or manual checks)
4. Check authentication/authorization checks present where needed
5. Review database query patterns (indexes, projections, limits)
6. Document findings in `audit-report.md`

**Alternatives Considered**:
- **Implement custom error handler middleware**: Rejected - architectural change (out of scope)
- **Migrate to tRPC or GraphQL**: Rejected - massive scope creep, not a "cleanup" task
- **Skip P3 entirely**: Considered - acceptable fallback if P1+P2 consume full time budget

**References**:
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- REST API Error Handling Best Practices

---

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Refactoring Strategy** | Incremental commits with test validation | Safety, confidence, reviewability |
| **Dead Code Detection** | Manual IDE + git grep + production logs | Accuracy, low false positives |
| **Duplicate Extraction** | Local `submitFormWithData()` function | Scope containment, safety, simplicity |
| **State Optimization** | Single `setFormData` call | Performance, consistency, React best practice |
| **Component Audit** | Manual checklist + ESLint | Balance automation and semantic review |
| **API Route Review** | Document standard format, validate compliance | Consistency without breaking changes |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tests fail after refactoring | Medium | High | Run tests after each commit, revert immediately if red |
| "Dead" code actually used in production | Low | High | Check production logs, use git grep for string references |
| Extracted function doesn't cover all edge cases | Low | Medium | Existing 50 tests cover edge cases through caller functions |
| Audit scope creeps into rewrites | Medium | Medium | Strict checklist, document-only approach for P2/P3 |
| Manual QA misses regression | Low | High | Use detailed QA checklist, test extended fast confirmation thoroughly |

---

## Open Questions Resolution

All 5 open questions from spec were addressed:

1. **Extraction strategy**: ✅ RESOLVED - Create `submitFormWithData()` within component
2. **Testing approach**: ✅ RESOLVED - Rely on existing 50 integration tests
3. **Phase 2 audit depth**: ✅ RESOLVED - Manual checklist with ESLint, document findings
4. **Documentation updates**: ✅ RESOLVED - Update JSDoc for extracted functions only
5. **Performance measurement**: ✅ RESOLVED - Focus on code quality metrics (line count, complexity, test pass rate)

---

**Next Phase**: Design & Contracts (data-model.md, quickstart.md)
