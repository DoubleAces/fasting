# Quick Start: Timer Date Crossing Bug Fix

**Feature**: 027-timer-date-crossing  
**Priority**: P0 (Critical Bug)  
**Estimated Time**: 4-6 hours  
**Complexity**: Low (single function fix)

---

## At a Glance

**Problem**: Timer shows 0:00:00 when fast crosses month boundaries (e.g., Oct 31 → Nov 1)  
**Root Cause**: Manual calendar arithmetic assumes all months have 30 days  
**Solution**: Use native `Date.getTime()` for millisecond calculation  
**Impact**: ~3.3% of active fasts (those crossing month boundaries)

---

## TL;DR - What You Need to Know

**File to Fix**: `src/lib/utils/fastingTimerUtils.js` (lines 33-51)  
**Lines Changed**: ~20 lines removed, 1 line added  
**Function**: `calculateElapsedTime(lastMealTime, now, entryDate)`  
**Change**: Replace manual year/month/day arithmetic with `now.getTime() - lastMealDate.getTime()`

**Before**:
```javascript
// ❌ BROKEN: Assumes all months = 30 days (43200 minutes)
const startTotalMinutes = startYear * 525600 + startMonth * 43200 + ...
const elapsed = (endTotalMinutes - startTotalMinutes) * 60 * 1000;
```

**After**:
```javascript
// ✅ FIXED: Native Date handles all calendar complexity
const elapsed = now.getTime() - lastMealDate.getTime();
```

---

## Prerequisites

**Required Knowledge**:
- JavaScript Date API basics
- Jest testing framework
- Next.js project structure

**Required Tools**:
- Node.js (already installed)
- Jest 30.2.0 (already installed)
- Code editor (VS Code recommended)

**Required Context**:
- Feature 017 (live-fasting-timer) - Original timer implementation
- `src/hooks/useFastingTimer.js` - Consumes the fixed function
- `tests/unit/fastingTimerUtils.test.js` - Test file to update

---

## Step-by-Step Implementation

### Phase 1: Setup & Context (15 minutes)

**1.1 - Verify you're on the correct branch**:
```powershell
git status
# Should show: On branch 027-timer-date-crossing
```

**1.2 - Review the broken code**:
```powershell
code src/lib/utils/fastingTimerUtils.js
```

Look at lines 33-51 - this is the problematic manual arithmetic.

**1.3 - Run existing tests to establish baseline**:
```powershell
npm test -- fastingTimerUtils.test.js
```

Expected: All current tests pass (establishes regression baseline)

---

### Phase 2: Write Failing Tests (2-3 hours)

⚠️ **TDD GATE**: Tests MUST be written and approved before implementation!

**2.1 - Open test file**:
```powershell
code tests/unit/fastingTimerUtils.test.js
```

**2.2 - Add new test suite for month boundaries**:

```javascript
describe('calculateElapsedTime - Month Boundary Scenarios', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calculates elapsed time when fast crosses October to November', () => {
    // Set "current" time to Nov 1, 2024 at 2:00 AM
    jest.setSystemTime(new Date('2024-11-01T02:00:00'));
    
    const lastMealTime = '20:00'; // 8:00 PM
    const now = new Date(); // Nov 1, 2024 02:00:00
    const entryDate = new Date('2024-10-31'); // Oct 31, 2024
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 6 hours = 21,600,000 milliseconds
    expect(elapsed).toBe(6 * 60 * 60 * 1000);
  });

  it('calculates elapsed time crossing year boundary (Dec 31 to Jan 1)', () => {
    jest.setSystemTime(new Date('2025-01-01T03:00:00'));
    
    const lastMealTime = '23:00'; // 11:00 PM Dec 31
    const now = new Date();
    const entryDate = new Date('2024-12-31');
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 4 hours = 14,400,000 milliseconds
    expect(elapsed).toBe(4 * 60 * 60 * 1000);
  });

  it('handles non-leap year February (28 days)', () => {
    jest.setSystemTime(new Date('2025-03-01T08:00:00')); // 2025 not leap year
    
    const lastMealTime = '22:00'; // 10:00 PM Feb 28
    const now = new Date();
    const entryDate = new Date('2025-02-28');
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 10 hours = 36,000,000 milliseconds
    expect(elapsed).toBe(10 * 60 * 60 * 1000);
  });

  it('handles leap year February (29 days)', () => {
    jest.setSystemTime(new Date('2024-03-01T08:00:00')); // 2024 is leap year
    
    const lastMealTime = '22:00'; // 10:00 PM Feb 29
    const now = new Date();
    const entryDate = new Date('2024-02-29');
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 10 hours = 36,000,000 milliseconds
    expect(elapsed).toBe(10 * 60 * 60 * 1000);
  });

  it('calculates multi-day fast across month boundary', () => {
    jest.setSystemTime(new Date('2024-11-02T12:00:00')); // Nov 2 at noon
    
    const lastMealTime = '18:00'; // 6:00 PM Oct 30
    const now = new Date();
    const entryDate = new Date('2024-10-30');
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 2 days + 18 hours = 66 hours = 237,600,000 milliseconds
    expect(elapsed).toBe((2 * 24 + 18) * 60 * 60 * 1000);
  });

  it('handles different month lengths (Jan 31 to Feb 28)', () => {
    jest.setSystemTime(new Date('2025-02-28T10:00:00'));
    
    const lastMealTime = '10:00'; // 10:00 AM Jan 31
    const now = new Date();
    const entryDate = new Date('2025-01-31');
    
    const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
    
    // Expected: 28 days = 672 hours = 2,419,200,000 milliseconds
    expect(elapsed).toBe(28 * 24 * 60 * 60 * 1000);
  });
});
```

**2.3 - Run tests to verify they FAIL**:
```powershell
npm test -- fastingTimerUtils.test.js
```

Expected: **New tests should FAIL** (this is correct - we haven't fixed the bug yet!)

**2.4 - Get user approval**:
> "Tests written and failing as expected. Ready to proceed with implementation?"

⚠️ **STOP HERE** until tests are approved!

---

### Phase 3: Implement Fix (1 hour)

✅ **Prerequisites**: Tests approved and failing

**3.1 - Open the file to fix**:
```powershell
code src/lib/utils/fastingTimerUtils.js
```

**3.2 - Locate the broken code** (lines 33-51):
```javascript
// Find this section:
const startYear = lastMealDate.getFullYear();
const startMonth = lastMealDate.getMonth();
// ... (about 20 lines of manual arithmetic)
const elapsed = elapsedMinutes * 60 * 1000;
```

**3.3 - Replace with native Date calculation**:

Delete lines 33-51 and replace with:

```javascript
// Calculate elapsed time using native Date API
// This automatically handles:
// - Variable month lengths (28, 29, 30, 31 days)
// - Leap years
// - Year boundaries
// - Timezone/DST (using local time components)
const elapsed = now.getTime() - lastMealDate.getTime();
```

**3.4 - Complete fixed function**:

The entire function should now look like this:

```javascript
export function calculateElapsedTime(lastMealTime, now, entryDate = null) {
  const [hours, minutes] = lastMealTime.split(':').map(Number);
  
  let lastMealDate;
  if (entryDate) {
    // Parse ISO date string to get YYYY-MM-DD
    const isoString = entryDate instanceof Date ? entryDate.toISOString() : entryDate;
    const dateOnly = isoString.split('T')[0]; // Get "2024-10-31"
    const [year, month, day] = dateOnly.split('-').map(Number);
    
    // Create date in local timezone with the specified date and time
    lastMealDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  } else {
    lastMealDate = new Date();
    lastMealDate.setHours(hours, minutes, 0, 0);
  }
  
  // Calculate elapsed time using native Date API
  const elapsed = now.getTime() - lastMealDate.getTime();
  
  return elapsed >= 0 ? elapsed : 0;
}
```

**3.5 - Save the file**

---

### Phase 4: Verify Fix (1-2 hours)

**4.1 - Run unit tests**:
```powershell
npm test -- fastingTimerUtils.test.js
```

Expected: **ALL tests pass** (both new and existing)

**4.2 - Check for regressions**:
```powershell
npm test
```

Expected: **All tests in project pass** (no regressions)

**4.3 - Manual verification** (optional but recommended):

Create a test script:
```javascript
// test-fix.js
const { calculateElapsedTime } = require('./src/lib/utils/fastingTimerUtils');

// Test Oct 31 → Nov 1
const oct31 = new Date('2024-10-31');
const nov1 = new Date('2024-11-01T02:00:00');
const elapsed = calculateElapsedTime('20:00', nov1, oct31);
console.log(`Oct 31 8PM to Nov 1 2AM: ${elapsed}ms = ${elapsed / 3600000}h`);
// Should output: 21600000ms = 6h
```

**4.4 - E2E regression test**:
```powershell
npm run test:e2e -- fasting-timer
```

Expected: Timer still works in UI (start fast, view timer, refresh page)

---

### Phase 5: Code Review & Documentation (30 minutes)

**5.1 - Update JSDoc comments** (if needed):

Ensure function has clear documentation:
```javascript
/**
 * Calculates the elapsed time in milliseconds between lastMealTime and now
 * Uses native Date API to handle month boundaries, leap years, and year transitions
 * 
 * @param {string} lastMealTime - Time in HH:mm format (24-hour)
 * @param {Date} now - Current date/time
 * @param {Date|null} entryDate - The date of the entry (optional, defaults to today)
 * @returns {number} Elapsed time in milliseconds (always >= 0)
 * 
 * @example
 * // Fast started Oct 31 at 8PM, now Nov 1 at 2AM (6 hours)
 * calculateElapsedTime('20:00', new Date('2024-11-01T02:00:00'), new Date('2024-10-31'))
 * // Returns: 21600000 (6 * 60 * 60 * 1000)
 */
```

**5.2 - Run linter**:
```powershell
npm run lint
```

Expected: No errors

**5.3 - Format code**:
```powershell
npm run format
```

**5.4 - Commit changes**:
```powershell
git add src/lib/utils/fastingTimerUtils.js tests/unit/fastingTimerUtils.test.js
git commit -m "Fix timer month boundary bug - use native Date calculation

- Replace manual year/month/day arithmetic with Date.getTime()
- Fixes timer showing 0:00:00 when crossing month boundaries
- Add comprehensive tests for month/year boundaries and leap years
- All existing tests pass (zero regression)

Closes #027"
```

---

## Testing Checklist

### Unit Tests (Required)

- [ ] ✅ Oct 31 → Nov 1 (6 hours) - **NEW**
- [ ] ✅ Dec 31 → Jan 1 (4 hours) - **NEW**
- [ ] ✅ Feb 28 → Mar 1 non-leap (10 hours) - **NEW**
- [ ] ✅ Feb 29 → Mar 1 leap year (10 hours) - **NEW**
- [ ] ✅ Multi-day across month (2d 18h) - **NEW**
- [ ] ✅ Different month lengths (Jan 31 → Feb 28) - **NEW**
- [ ] ✅ Same-day fast - **EXISTING (regression)**
- [ ] ✅ Same-month fast - **EXISTING (regression)**
- [ ] ✅ Zero elapsed time - **EXISTING (regression)**
- [ ] ✅ Negative elapsed (future timestamp) - **EXISTING (regression)**

### Integration Tests (Required)

- [ ] ✅ useFastingTimer hook consumes fixed function correctly
- [ ] ✅ FastingTimer component displays correct time
- [ ] ✅ BiologicalStagesTimeline uses correct elapsed time

### E2E Tests (Required)

- [ ] ✅ Start fast on Oct 31 8PM, verify Nov 1 2AM shows 6h
- [ ] ✅ Refresh page with active fast - timer recalculates correctly
- [ ] ✅ Complete fast - timer stops at correct duration
- [ ] ✅ Timer updates every 60 seconds

### Manual Verification (Recommended)

- [ ] ✅ Create entry on last day of month with lastMealTime
- [ ] ✅ Wait until next month or mock system date
- [ ] ✅ Verify timer shows correct elapsed time (not 0:00:00)
- [ ] ✅ Test in different browsers (Chrome, Safari, Firefox)

---

## Common Pitfalls

### ❌ DON'T: Use Date.UTC for calculation
```javascript
// BAD: Breaks wall-clock time perception
const elapsed = Date.UTC(nowYear, nowMonth, ...) - Date.UTC(startYear, startMonth, ...);
```
**Why**: Users think in local time, not UTC. DST transitions would be confusing.

### ✅ DO: Use local time components
```javascript
// GOOD: Matches user perception
const lastMealDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
const elapsed = now.getTime() - lastMealDate.getTime();
```

---

### ❌ DON'T: Add external date libraries
```javascript
// BAD: Unnecessary dependency
import { differenceInMilliseconds } from 'date-fns';
```
**Why**: Native Date API is sufficient and adds no dependencies.

### ✅ DO: Use native JavaScript Date
```javascript
// GOOD: Built-in, optimized, zero dependencies
const elapsed = now.getTime() - lastMealDate.getTime();
```

---

### ❌ DON'T: Change function signature
```javascript
// BAD: Breaking change for consumers
export function calculateElapsedTime(lastMealTime, now, entryDate, useUTC = false)
```
**Why**: All consumers would need updates. Keep changes minimal.

### ✅ DO: Keep signature unchanged
```javascript
// GOOD: Backward compatible
export function calculateElapsedTime(lastMealTime, now, entryDate = null)
```

---

### ❌ DON'T: Skip regression tests
```javascript
// BAD: Only test new scenarios
npm test -- --testNamePattern="Month Boundary"
```
**Why**: Must ensure existing functionality still works.

### ✅ DO: Run full test suite
```javascript
// GOOD: Catches any regressions
npm test -- fastingTimerUtils.test.js
npm test  // Full suite
```

---

## Debugging Tips

### If tests still fail after fix:

**Check 1**: Verify Date constructor month is 0-indexed
```javascript
new Date(2024, 10, 1) // November 1 (10 = November, not October)
new Date(2024, 9, 31) // October 31 (9 = October)
```

**Check 2**: Verify Jest fake timers are set correctly
```javascript
jest.setSystemTime(new Date('2024-11-01T02:00:00')); // Must include time
```

**Check 3**: Verify millisecond calculation
```javascript
console.log(lastMealDate.getTime()); // Should be valid timestamp
console.log(now.getTime()); // Should be later timestamp
console.log(elapsed); // Should be positive number
```

---

### If timer shows wrong time in UI:

**Check 1**: Verify Entry has correct date
```javascript
console.log(entry.date); // Should be ISO date string or Date object
console.log(entry.lastMealTime); // Should be HH:mm format
```

**Check 2**: Verify hook calls function correctly
```javascript
// src/hooks/useFastingTimer.js
console.log('Calling calculateElapsedTime with:', lastMealTime, currentTime, date);
const elapsed = calculateElapsedTime(lastMealTime, currentTime, date);
console.log('Elapsed:', elapsed);
```

**Check 3**: Clear browser cache
```powershell
# Rebuild Next.js
npm run build
npm run start
```

---

## Performance Verification

### Benchmark (optional):

Create benchmark script:
```javascript
// benchmark.js
const { calculateElapsedTime } = require('./src/lib/utils/fastingTimerUtils');

console.time('1M calls');
for (let i = 0; i < 1000000; i++) {
  calculateElapsedTime('20:00', new Date(), new Date('2024-10-31'));
}
console.timeEnd('1M calls');
// Expected: <50ms for 1M calls
```

Expected: **Faster than before** (~5-10x improvement)

---

## Deployment Checklist

### Pre-Deployment

- [ ] ✅ All unit tests pass
- [ ] ✅ All integration tests pass
- [ ] ✅ All E2E tests pass
- [ ] ✅ Linter passes
- [ ] ✅ Code formatted
- [ ] ✅ PR approved by reviewer
- [ ] ✅ No console.log statements left in code

### Deployment

- [ ] ✅ Merge to master
- [ ] ✅ Vercel auto-deploys
- [ ] ✅ Monitor Sentry for errors (first 24 hours)

### Post-Deployment

- [ ] ✅ Create entry on last day of month
- [ ] ✅ Verify timer shows correct time on next month
- [ ] ✅ Check user reports/support tickets
- [ ] ✅ Update CLAUDE.md with fix documentation

---

## Success Criteria

**Primary**: 
- ✅ Timer displays correct elapsed time for fasts crossing month boundaries
- ✅ Oct 31 8PM → Nov 1 2AM shows "6h 0m" (not "0h 0m")

**Secondary**:
- ✅ All existing tests pass (zero regression)
- ✅ New tests cover all calendar edge cases
- ✅ Code review approves changes
- ✅ No performance degradation (actually improves 5-10x)

**User-Facing**:
- ✅ No user complaints about timer accuracy
- ✅ Timer works correctly across all month boundaries
- ✅ Timer works correctly across year boundary (Dec 31 → Jan 1)
- ✅ Timer works correctly for leap years

---

## Rollback Plan

**If issues arise post-deployment**:

1. **Identify issue**: Check Sentry, user reports
2. **Quick assessment**: Can we hotfix or need rollback?
3. **Rollback command**:
   ```powershell
   git revert <commit-hash>
   git push origin master
   ```
4. **Vercel auto-deploys rollback** (~2 minutes)
5. **Investigate root cause** in separate branch
6. **Re-test and redeploy fix**

**Rollback time**: <5 minutes  
**Rollback risk**: None (pure calculation change, no data affected)

---

## Additional Resources

**JavaScript Date API**:
- MDN Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
- Date.getTime(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime

**Jest Testing**:
- Fake Timers: https://jestjs.io/docs/timer-mocks
- Mock Functions: https://jestjs.io/docs/mock-functions

**Related Features**:
- Feature 017 spec: `specs/017-live-fasting-timer/spec.md`
- Original research: `specs/017-live-fasting-timer/research.md`

---

## Questions?

**Issue**: Timer shows incorrect time in non-October months  
**Answer**: The fix handles ALL month boundaries. Oct was just the reported example. Test with any month (Jan→Feb, Feb→Mar, etc.)

**Issue**: What about timezone changes mid-fast?  
**Answer**: Fixed function uses local time components, so timezone changes are handled correctly.

**Issue**: Does this affect completed fast calculations?  
**Answer**: No. Different function (`fastingCalculator.js`) handles completed fasts and doesn't have this bug.

**Issue**: Can I skip writing tests first?  
**Answer**: **NO**. TDD is NON-NEGOTIABLE per constitution. Tests must be written and approved before implementation.
