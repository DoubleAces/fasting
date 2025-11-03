# Implementation Plan: Timer Date Crossing Bug Fix

**Branch**: `027-timer-date-crossing` | **Date**: January 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/027-timer-date-crossing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix critical bug where fasting timer displays 0:00:00 when active fast crosses month boundaries (e.g., Oct 31 → Nov 1). Root cause is manual calendar arithmetic in `calculateElapsedTime()` that assumes all months have 30 days (43,200 minutes). Solution: Replace manual year/month/day arithmetic with native JavaScript Date object millisecond calculation, which automatically handles variable month lengths (28-31 days), leap years, and year boundaries.

## Technical Context

**Language/Version**: JavaScript ES6+ (React 19.1.0, Next.js 15.5.6)  
**Primary Dependencies**: React hooks (useState, useEffect, useMemo), Native JavaScript Date object  
**Storage**: N/A (pure calculation bug fix, no database changes)  
**Testing**: Jest 30.2.0 + React Testing Library (unit tests), Playwright (E2E regression)  
**Target Platform**: Web (Chrome, Safari, Firefox, Edge - all modern browsers)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <1ms calculation time (pure JavaScript date arithmetic), 60s update interval unchanged  
**Constraints**: Must maintain backward compatibility with existing function signature, zero regression on existing timer functionality, calculation must be deterministic and testable  
**Scale/Scope**: Single utility function fix (~10-15 lines), 5-8 new unit tests, affects all active fasts (~100% of users with ongoing fasts)

**Affected Files**:
- `src/lib/utils/fastingTimerUtils.js` (lines 15-51) - PRIMARY FIX
- `tests/unit/fastingTimerUtils.test.js` - NEW TESTS
- `src/hooks/useFastingTimer.js` - Consumer (no changes, validates fix works)
- `src/components/organisms/FastingTimer.js` - UI consumer (no changes)

**Integration Points**:
- Feature 017 (live-fasting-timer) - Core dependency
- useFastingTimer hook - Consumes calculateElapsedTime
- FastingTimer component - Displays timer output
- BiologicalStagesTimeline - Uses elapsed time for stage calculation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
✅ **PASS** - No Next.js-specific changes required. Pure utility function fix in `/lib/utils/` follows established patterns.

### II. Mobile-First Responsive Design  
✅ **PASS** - No UI changes. Fix is in calculation logic only. Mobile users benefit equally from accurate timer.

### III. Test-Driven Development (NON-NEGOTIABLE)
✅ **PASS** - TDD workflow enforced:
1. **Phase 2**: Write failing unit tests for month/year boundaries (REQUIRED BEFORE implementation)
2. Tests cover: Oct→Nov, Dec→Jan, Feb 28→Mar 1 (non-leap), Feb 29→Mar 1 (leap year)
3. Existing tests must continue passing (regression gate)
4. User approval of test scenarios before implementation begins
5. Red-Green-Refactor: Tests fail → Fix implementation → Tests pass

### IV. Component Architecture
✅ **PASS** - No component changes. Fix isolated to pure utility function (`calculateElapsedTime`). Function remains independently testable with no side effects.

### V. User Privacy & Data Security
✅ **PASS** - No data handling changes. Fix preserves existing data flow (lastMealTime, entryDate in → elapsed milliseconds out). No new data collected or exposed.

### VI. Performance & Accessibility
✅ **PASS** - Performance improved (native Date calculation ~10x faster than manual arithmetic). No accessibility impact (calculation only). Timer display unchanged.

**Technology Stack Compliance**:
- ✅ **Language**: JavaScript ES6+ (existing)
- ✅ **Testing**: Jest + React Testing Library (existing)
- ✅ **Documentation**: JSDoc comments maintained in fastingTimerUtils.js
- ✅ **Code Quality**: ESLint passes, Prettier formatting enforced

**Development Workflow Compliance**:
- ✅ **Specify**: Complete (spec.md validated 10/10 criteria)
- ✅ **Plan**: In progress (this document)
- ✅ **Test**: Phase 2 - Write tests BEFORE implementation
- ⏳ **Implement**: Phase 3 - After tests written and approved
- ⏳ **Review**: Phase 4 - Code review + QA
- ⏳ **Deploy**: Phase 5 - Merge to master

**GATE VERDICT**: ✅ **ALL GATES PASS** - Proceed to Phase 0 Research

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
src/
├── lib/
│   └── utils/
│       └── fastingTimerUtils.js    # PRIMARY FIX: calculateElapsedTime function
├── hooks/
│   └── useFastingTimer.js          # Consumer of fixed function (no changes)
└── components/
    └── organisms/
        ├── FastingTimer.js         # UI consumer (no changes)
        └── BiologicalStagesTimeline.js  # Uses elapsed time (no changes)

tests/
├── unit/
│   └── fastingTimerUtils.test.js   # NEW TESTS: Month/year boundary scenarios
└── e2e/
    └── fasting-timer.spec.js       # REGRESSION: Verify existing flows work
```

**Structure Decision**: Next.js App Router web application. Bug fix isolated to single utility function in `/src/lib/utils/`. No API routes, database models, or UI components modified. Testing spans unit tests (new calendar scenarios) and E2E regression (existing timer flows).

## Complexity Tracking

*N/A - No constitution violations. All gates pass.*

---

## Phase 0: Research (COMPLETE)

**Status**: ✅ Complete  
**Output**: [`research.md`](./research.md)

**Key Decisions**:
1. **Date Calculation**: Use native `Date.getTime()` instead of manual arithmetic
2. **Wall-Clock Time**: Maintain local time components (not UTC) for user perception
3. **Function Signature**: Keep unchanged for backward compatibility
4. **Test Strategy**: Comprehensive unit tests + E2E regression
5. **Error Handling**: Preserve existing behavior (return 0 for negative elapsed)
6. **Other Calculators**: No changes to `fastingCalculator.js` (different use case)

**Research Artifacts**:
- 6 technical decisions documented with rationale
- Best practices for JavaScript Date API
- Jest testing strategies
- Performance analysis (5-10x improvement expected)
- Risk assessment (Low risk)
- No new dependencies required

---

## Phase 1: Design & Contracts (COMPLETE)

**Status**: ✅ Complete  
**Outputs**: 
- [`data-model.md`](./data-model.md)
- [`quickstart.md`](./quickstart.md)
- Contracts: N/A (pure calculation fix, no API changes)

**Design Artifacts**:
- Function contract documented (unchanged signature)
- Calculation examples (Before/After for Oct→Nov, Dec→Jan, Feb 28→Mar 1)
- Integration points identified (useFastingTimer, FastingTimer, BiologicalStagesTimeline)
- Performance characteristics (O(1) time, O(1) space, 5-10x faster)
- Testing validation strategy (10 unit tests: 6 new + 4 regression)

**Agent Context Updated**:
- ✅ CLAUDE.md updated with Feature 027 technologies
- JavaScript ES6+ (React 19.1.0, Next.js 15.5.6)
- React hooks, Native JavaScript Date object
- No database changes

---

## Phase 2: Task Breakdown (PENDING)

**Status**: ⏳ Awaiting `/speckit.tasks` command  
**Output**: `tasks.md` (will be generated by separate command)

**Expected Tasks**:
1. Write failing unit tests (6 new scenarios)
2. User approval of test scenarios
3. Implement fix (replace lines 33-51 in fastingTimerUtils.js)
4. Verify all tests pass
5. Run E2E regression tests
6. Code review
7. Deploy to production

---

## Implementation Summary

### What's Changed

**Single File Modified**:
- `src/lib/utils/fastingTimerUtils.js` (lines 33-51)
  - **Before**: 20 lines of manual year/month/day arithmetic
  - **After**: 1 line using native `Date.getTime()`

**Single Test File Updated**:
- `tests/unit/fastingTimerUtils.test.js`
  - **Added**: 6 new test scenarios for month/year boundaries
  - **Preserved**: All existing tests (regression safety)

### What's Unchanged

**Zero Changes Required**:
- ✅ Database schema (Entry model)
- ✅ API routes
- ✅ UI components (FastingTimer, BiologicalStagesTimeline)
- ✅ Hooks (useFastingTimer) - automatically benefits from fix
- ✅ Function signature (backward compatible)
- ✅ Other calculation utilities (fastingCalculator.js)

### Impact Assessment

**Lines of Code**: ~20 lines removed, ~1 line added (net: -19 LOC)  
**Files Changed**: 2 (1 implementation + 1 test)  
**Consumers Affected**: 0 (all work without modification)  
**Migration Required**: None  
**Deployment Risk**: Low (pure calculation, no data/schema changes)  
**Performance**: 5-10x faster (native Date vs manual arithmetic)

---

## Next Steps

**Immediate**: Run `/speckit.tasks` command to generate Phase 2 task breakdown

**Then**: Begin TDD workflow:
1. Write failing tests (Phase 2 tasks)
2. Get user approval
3. Implement fix
4. Verify tests pass
5. Code review
6. Deploy

**Timeline**: 4-6 hours total (1h tests + 1h fix + 2h verification)

---

## Appendix: File Changes Detail

### src/lib/utils/fastingTimerUtils.js

**Lines Removed** (33-51):
```javascript
// Extract date/time components
const startYear = lastMealDate.getFullYear();
const startMonth = lastMealDate.getMonth();
const startDay = lastMealDate.getDate();
const startHour = lastMealDate.getHours();
const startMinute = lastMealDate.getMinutes();

const endYear = now.getFullYear();
const endMonth = now.getMonth();
const endDay = now.getDate();
const endHour = now.getHours();
const endMinute = now.getMinutes();

// ❌ BUG: Assumes all months = 30 days
const startTotalMinutes = startYear * 525600 + startMonth * 43200 + startDay * 1440 + startHour * 60 + startMinute;
const endTotalMinutes = endYear * 525600 + endMonth * 43200 + endDay * 1440 + endHour * 60 + endMinute;

const elapsedMinutes = endTotalMinutes - startTotalMinutes;
const elapsed = elapsedMinutes * 60 * 1000;
```

**Lines Added** (33):
```javascript
// ✅ FIX: Use native Date millisecond calculation
const elapsed = now.getTime() - lastMealDate.getTime();
```

### tests/unit/fastingTimerUtils.test.js

**New Test Suite Added**:
```javascript
describe('calculateElapsedTime - Month Boundary Scenarios', () => {
  // 6 new test cases for month/year boundaries
  // See quickstart.md for complete implementation
});
```

---

## Validation Checklist

### Pre-Implementation
- [x] Specification complete and validated (10/10 criteria)
- [x] Constitution check passed (all gates)
- [x] Research complete (6 decisions documented)
- [x] Design complete (data model, quickstart)
- [x] Agent context updated

### Implementation (Pending /speckit.tasks)
- [ ] Tests written and failing
- [ ] User approval obtained
- [ ] Fix implemented
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Deployed to production

---

**Plan Status**: ✅ **COMPLETE - Ready for Phase 2 (/speckit.tasks)**

