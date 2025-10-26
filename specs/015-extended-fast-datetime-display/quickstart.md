# Quickstart Guide: Extended Fast Date/Time Range Display

**Feature**: Add date/time range display to extended fast confirmation prompts  
**Target**: EntryForm.js (~50 lines affected)  
**Estimated Time**: 2-3 hours (including tests)

---

## Prerequisites

- ✅ Feature 015 specification reviewed and understood
- ✅ Feature 015 research.md reviewed (date/time formatting decisions)
- ✅ Feature 015 data-model.md reviewed (data structures)
- ✅ Constitution.md TDD requirements understood (tests FIRST)
- ✅ Local development environment running (`npm run dev`)
- ✅ Test suite passing (`npm test` - all 50+ EntryForm tests passing)

---

## Implementation Overview

This feature adds **two utility functions** and updates **~20 lines of JSX** in EntryForm.js to display date/time ranges alongside duration in extended fast prompts.

**Core Changes**:
1. Add `formatDateToDayMonth()` helper function (~10 lines)
2. Add `formatTimeByPreference()` helper function (~15 lines)
3. Update extended fast prompt JSX (~20 lines)
4. Add comprehensive tests (~100-150 lines)

**No API or database changes required** - all data already available.

---

## Step 1: Write Tests FIRST (TDD - Required by Constitution)

### Location: `tests/unit/components/organisms/EntryForm.test.js`

Add these test suites **before implementing any code**:

### 1.1: formatDateToDayMonth() Tests

```javascript
describe('formatDateToDayMonth', () => {
  // Define function as a testable export or test via rendering
  
  test('formats ISO date string to "DD Mon" format', () => {
    const result = formatDateToDayMonth('2025-10-22');
    expect(result).toBe('22 Oct');
  });
  
  test('handles full ISO timestamp with time', () => {
    const result = formatDateToDayMonth('2025-10-22T00:00:00.000Z');
    expect(result).toBe('22 Oct');
  });
  
  test('pads single-digit days with zero', () => {
    const result = formatDateToDayMonth('2025-10-05');
    expect(result).toBe('05 Oct');
  });
  
  test('formats all month abbreviations correctly', () => {
    expect(formatDateToDayMonth('2025-01-15')).toBe('15 Jan');
    expect(formatDateToDayMonth('2025-02-28')).toBe('28 Feb');
    expect(formatDateToDayMonth('2025-12-31')).toBe('31 Dec');
  });
  
  test('handles end-of-month dates', () => {
    expect(formatDateToDayMonth('2025-01-31')).toBe('31 Jan');
    expect(formatDateToDayMonth('2025-02-28')).toBe('28 Feb'); // non-leap year
  });
});
```

### 1.2: formatTimeByPreference() Tests

```javascript
describe('formatTimeByPreference', () => {
  
  describe('12-hour format', () => {
    test('converts afternoon time to 12h format', () => {
      const result = formatTimeByPreference('18:00', '12h');
      expect(result).toBe('6:00 PM');
    });
    
    test('converts morning time to 12h format', () => {
      const result = formatTimeByPreference('09:30', '12h');
      expect(result).toBe('9:30 AM');
    });
    
    test('handles midnight (00:00) as 12:00 AM', () => {
      const result = formatTimeByPreference('00:00', '12h');
      expect(result).toBe('12:00 AM');
    });
    
    test('handles noon (12:00) as 12:00 PM', () => {
      const result = formatTimeByPreference('12:00', '12h');
      expect(result).toBe('12:00 PM');
    });
    
    test('handles 12:01 PM correctly', () => {
      const result = formatTimeByPreference('12:01', '12h');
      expect(result).toBe('12:01 PM');
    });
    
    test('handles 11:59 PM correctly', () => {
      const result = formatTimeByPreference('23:59', '12h');
      expect(result).toBe('11:59 PM');
    });
    
    test('does not pad single-digit hours with leading zero', () => {
      const result = formatTimeByPreference('09:00', '12h');
      expect(result).toBe('9:00 AM'); // NOT "09:00 AM"
    });
    
    test('pads single-digit minutes with zero', () => {
      const result = formatTimeByPreference('09:05', '12h');
      expect(result).toBe('9:05 AM'); // NOT "9:5 AM"
    });
  });
  
  describe('24-hour format', () => {
    test('returns 24h time unchanged (with correct formatting)', () => {
      const result = formatTimeByPreference('18:00', '24h');
      expect(result).toBe('18:00');
    });
    
    test('does not pad single-digit hours with leading zero', () => {
      const result = formatTimeByPreference('09:30', '24h');
      expect(result).toBe('9:30'); // NOT "09:30"
    });
    
    test('handles midnight as 0:00', () => {
      const result = formatTimeByPreference('00:00', '24h');
      expect(result).toBe('0:00');
    });
    
    test('handles noon as 12:00', () => {
      const result = formatTimeByPreference('12:00', '24h');
      expect(result).toBe('12:00');
    });
    
    test('pads minutes with zero', () => {
      const result = formatTimeByPreference('09:05', '24h');
      expect(result).toBe('9:05');
    });
  });
});
```

### 1.3: Extended Fast Prompt Display Tests

```javascript
describe('Extended Fast Date/Time Range Display', () => {
  
  test('displays date/time range in from-previous prompt (24h format)', async () => {
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      extendedFastDirection: 'from-previous',
      previousEntry: {
        date: '2025-10-22',
        lastMealTime: '18:00'
      },
      fromPreviousFasting: { formatted: '26 hours' }
    };
    
    const settings = { timeFormat: '24h' };
    
    render(
      <EntryForm 
        settings={settings}
        // ... other required props
      />
    );
    
    // Fill form to trigger gap check
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-10-23' } });
    fireEvent.change(screen.getByLabelText(/first meal time/i), { target: { value: '20:00' } });
    
    // Mock API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ gapInfo })
    });
    
    fireEvent.click(screen.getByText(/submit/i));
    
    await waitFor(() => {
      expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      expect(screen.getByText(/22 Oct at 18:00 → 23 Oct at 20:00/i)).toBeInTheDocument();
    });
  });
  
  test('displays date/time range in from-previous prompt (12h format)', async () => {
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      extendedFastDirection: 'from-previous',
      previousEntry: {
        date: '2025-10-22',
        lastMealTime: '18:00'
      },
      fromPreviousFasting: { formatted: '26 hours' }
    };
    
    const settings = { timeFormat: '12h' };
    
    render(<EntryForm settings={settings} /* ... */ />);
    
    // ... trigger form submission ...
    
    await waitFor(() => {
      expect(screen.getByText(/6:00 PM → .*8:00 PM/i)).toBeInTheDocument();
    });
  });
  
  test('displays date/time range in to-next prompt', async () => {
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastToNext: true,
      extendedFastDirection: 'to-next',
      nextEntry: {
        date: '2025-10-24',
        firstMealTime: '18:00'
      },
      toNextFasting: { formatted: '48 hours' }
    };
    
    render(<EntryForm settings={{ timeFormat: '24h' }} /* ... */ />);
    
    // ... trigger second prompt after denying first ...
    
    await waitFor(() => {
      expect(screen.getByText(/22 Oct at 18:00 → 24 Oct at 18:00/i)).toBeInTheDocument();
    });
  });
  
  test('displays both dates when fast spans midnight', async () => {
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      previousEntry: {
        date: '2025-10-22',
        lastMealTime: '23:30'
      },
      fromPreviousFasting: { formatted: '25 hours 30 minutes' }
    };
    
    render(<EntryForm /* ... */ />);
    
    // Form date: 2025-10-23, firstMealTime: 01:00
    
    await waitFor(() => {
      const promptText = screen.getByText(/22 Oct.*23 Oct/i);
      expect(promptText).toBeInTheDocument();
      expect(promptText).toHaveTextContent('22 Oct at 23:30 → 23 Oct at 1:00');
    });
  });
  
  test('displays duration and date/time range on separate lines (mobile layout)', async () => {
    // Set mobile viewport
    global.innerWidth = 375;
    
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      previousEntry: { date: '2025-10-22', lastMealTime: '18:00' },
      fromPreviousFasting: { formatted: '26 hours' }
    };
    
    const { container } = render(<EntryForm /* ... */ />);
    
    await waitFor(() => {
      const prompt = screen.getByText(/extended fast detected/i).closest('div');
      
      // Verify duration on first line
      expect(prompt).toHaveTextContent('Extended fast detected (26 hours):');
      
      // Verify date/time range on second line (following <br />)
      const html = prompt.innerHTML;
      expect(html).toContain('26 hours):<br>');
      expect(html).toContain('22 Oct at 18:00 → 23 Oct');
    });
  });
  
  test('shows different date/time ranges for sequential prompts (from-previous then to-next)', async () => {
    const gapInfoFromPrevious = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      extendedFastDirection: 'both',
      previousEntry: { date: '2025-10-20', lastMealTime: '18:00' },
      nextEntry: { date: '2025-10-24', firstMealTime: '18:00' },
      fromPreviousFasting: { formatted: '50 hours' },
      toNextFasting: { formatted: '48 hours' }
    };
    
    render(<EntryForm /* ... */ />);
    
    // ... trigger first prompt ...
    await waitFor(() => {
      expect(screen.getByText(/20 Oct at 18:00 → 22 Oct at 20:00/i)).toBeInTheDocument();
    });
    
    // Deny first prompt
    fireEvent.click(screen.getByText(/no/i));
    
    // Should show second prompt with different range
    await waitFor(() => {
      expect(screen.getByText(/22 Oct at 18:00 → 24 Oct at 18:00/i)).toBeInTheDocument();
      expect(screen.queryByText(/20 Oct/i)).not.toBeInTheDocument(); // First range gone
    });
  });
  
  test('maintains existing behavior when user confirms extended fast', async () => {
    // Verify date/time display doesn't break confirmation flow
    const gapInfo = {
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      previousEntry: { date: '2025-10-22', lastMealTime: '18:00' },
      fromPreviousFasting: { formatted: '26 hours' }
    };
    
    const mockOnSuccess = jest.fn();
    render(<EntryForm onSuccess={mockOnSuccess} /* ... */ />);
    
    // ... trigger prompt ...
    await waitFor(() => screen.getByText(/22 Oct at 18:00/i));
    
    // Click "Yes" button
    fireEvent.click(screen.getByText(/yes, i fasted continuously/i));
    
    // Verify existing confirmation behavior still works
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
```

**Run Tests**: `npm test EntryForm` - all tests should **fail** at this stage (TDD red phase).

---

## Step 2: Implement Utility Functions

### Location: `src/components/organisms/EntryForm.js` (around line 100, before component definition)

Add these helper functions **after all imports, before the EntryForm component**:

```javascript
/**
 * Format an ISO date string to "DD Mon" format (e.g., "22 Oct").
 * @param {string} dateString - ISO date string (e.g., "2025-10-22" or "2025-10-22T00:00:00.000Z")
 * @returns {string} Formatted date (e.g., "22 Oct")
 */
const formatDateToDayMonth = (dateString) => {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short' 
  });
  // toLocaleDateString returns "Oct 22", we want "22 Oct"
  const [month, day] = formatted.split(' ');
  return `${day} ${month}`;
};

/**
 * Format 24-hour time string to user's preferred format (12h or 24h).
 * @param {string} time24h - Time in "HH:mm" format (e.g., "18:00")
 * @param {string} format - Either "12h" or "24h"
 * @returns {string} Formatted time (e.g., "6:00 PM" or "18:00")
 */
const formatTimeByPreference = (time24h, format) => {
  const [hours, minutes] = time24h.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // 0 → 12, 13 → 1, etc.
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // 24h format - no leading zero for hours per clarification
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
```

**Run Tests**: `npm test EntryForm` - formatting function tests should now **pass**.

---

## Step 3: Update Extended Fast Prompt Rendering

### Location: `src/components/organisms/EntryForm.js` (lines ~773-778 and ~783-788)

**BEFORE** (current code):
```javascript
{currentPromptType === 'from-previous' && gapInfo.fromPreviousFasting && (
  <>
    Extended fast detected ({gapInfo.fromPreviousFasting.formatted}): Did you fast continuously from your last meal on your previous day?
  </>
)}

{currentPromptType === 'to-next' && gapInfo.toNextFasting && (
  <>
    Extended fast detected ({gapInfo.toNextFasting.formatted}): Did you fast continuously to your first meal on your next logged day?
  </>
)}
```

**AFTER** (new code with date/time ranges):
```javascript
{currentPromptType === 'from-previous' && gapInfo.fromPreviousFasting && (
  <>
    Extended fast detected ({gapInfo.fromPreviousFasting.formatted}):<br />
    {formatDateToDayMonth(gapInfo.previousEntry.date)} at {formatTimeByPreference(gapInfo.previousEntry.lastMealTime, settings.timeFormat)} → {formatDateToDayMonth(formData.date)} at {formatTimeByPreference(formData.firstMealTime, settings.timeFormat)}. Did you fast continuously?
  </>
)}

{currentPromptType === 'to-next' && gapInfo.toNextFasting && gapInfo.nextEntry && (
  <>
    Extended fast detected ({gapInfo.toNextFasting.formatted}):<br />
    {formatDateToDayMonth(formData.date)} at {formatTimeByPreference(formData.lastMealTime, settings.timeFormat)} → {formatDateToDayMonth(gapInfo.nextEntry.date)} at {formatTimeByPreference(gapInfo.nextEntry.firstMealTime, settings.timeFormat)}. Did you fast continuously?
  </>
)}
```

**Key Changes**:
1. Added `<br />` after duration to create two-line layout (mobile-friendly)
2. Added date/time range using `formatDateToDayMonth()` and `formatTimeByPreference()`
3. Simplified question text to "Did you fast continuously?" (context clear from date/time range)
4. Added `gapInfo.nextEntry` null check for to-next prompt (defensive programming)

**Run Tests**: `npm test EntryForm` - all integration tests should now **pass**.

---

## Step 4: Manual QA Checklist

### 4.1: Desktop Testing (Chrome, Firefox, Safari)

**Test Case 1**: From-previous prompt (24h format)
- [ ] Create entry for Oct 22 with lastMealTime 18:00
- [ ] Create entry for Oct 23 with firstMealTime 20:00
- [ ] Verify prompt shows: "Extended fast detected (26 hours):" on line 1
- [ ] Verify prompt shows: "22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?" on line 2

**Test Case 2**: From-previous prompt (12h format)
- [ ] Change user settings to 12h time format
- [ ] Repeat test case 1
- [ ] Verify times display as: "22 Oct at 6:00 PM → 23 Oct at 8:00 PM"

**Test Case 3**: To-next prompt
- [ ] Create entry for Oct 22
- [ ] Create entry for Oct 24
- [ ] Edit Oct 22 entry, verify to-next prompt shows: "22 Oct at ... → 24 Oct at ..."

**Test Case 4**: Sequential prompts (both direction)
- [ ] Create entry for Oct 20 (lastMealTime 18:00)
- [ ] Create entry for Oct 24 (firstMealTime 18:00)
- [ ] Create entry for Oct 22 (firstMealTime 20:00, lastMealTime 18:00)
- [ ] Verify first prompt: "20 Oct at 18:00 → 22 Oct at 20:00"
- [ ] Click "No", verify second prompt: "22 Oct at 18:00 → 24 Oct at 18:00"

**Test Case 5**: Midnight-spanning fast
- [ ] Create entry for Oct 22 with lastMealTime 23:30
- [ ] Create entry for Oct 23 with firstMealTime 01:00
- [ ] Verify prompt shows: "22 Oct at 23:30 → 23 Oct at 1:00" (both dates shown)

**Test Case 6**: Confirm extended fast
- [ ] Trigger any extended fast prompt
- [ ] Click "Yes, I fasted continuously"
- [ ] Verify entry saves successfully with extendedFastConfirmed: true
- [ ] Verify no regressions (existing Feature 013 behavior intact)

### 4.2: Mobile Testing (320px width - iPhone SE)

**Test Case 7**: Two-line layout on mobile
- [ ] Resize browser to 375px width (or use Chrome DevTools mobile emulation)
- [ ] Trigger extended fast prompt
- [ ] Verify duration displays on first line
- [ ] Verify date/time range displays on second line (after line break)
- [ ] Verify no horizontal overflow (all text visible)
- [ ] Verify text wraps gracefully if needed

**Test Case 8**: Long date/time strings on mobile
- [ ] Test with single-digit dates (e.g., "05 Jan at 9:30 AM")
- [ ] Test with 12h format (longer strings due to AM/PM)
- [ ] Verify no text cutoff at 320px width

### 4.3: Accessibility Testing

**Test Case 9**: Screen reader announcements
- [ ] Enable NVDA (Windows) or VoiceOver (Mac)
- [ ] Trigger extended fast prompt
- [ ] Verify screen reader announces full prompt text including date/time range
- [ ] Verify button options ("Yes" / "No") are announced clearly

**Test Case 10**: Keyboard navigation
- [ ] Trigger extended fast prompt
- [ ] Tab through buttons, verify focus indicators visible
- [ ] Press Enter on "Yes" button, verify confirmation works
- [ ] Press Escape, verify prompt can be dismissed (if applicable)

### 4.4: Edge Case Validation

**Test Case 11**: Single-digit hour formatting
- [ ] Test times like 09:00, 09:30
- [ ] Verify 12h format shows "9:00 AM" not "09:00 AM"
- [ ] Verify 24h format shows "9:00" not "09:00"

**Test Case 12**: Noon and midnight
- [ ] Test 00:00 → Verify "12:00 AM" (12h) or "0:00" (24h)
- [ ] Test 12:00 → Verify "12:00 PM" (12h) or "12:00" (24h)

**Test Case 13**: Month abbreviations
- [ ] Test dates in all 12 months
- [ ] Verify abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec

**Test Case 14**: End-of-month dates
- [ ] Test Jan 31, Feb 28, Dec 31
- [ ] Verify dates format correctly with two-digit padding

---

## Step 5: Regression Testing

### 5.1: Feature 013 Verification (No Regressions)

**Critical**: Verify all existing extended fast functionality still works:

- [ ] Extended fast detection still triggers at >24 hours
- [ ] Prompt displays correctly (not broken by new JSX)
- [ ] "Yes" button confirms and saves entry with extendedFastConfirmed: true
- [ ] "No" button denies and saves entry with extendedFastConfirmed: false
- [ ] Sequential prompts (both direction) still show in correct order
- [ ] Dismissed prompts don't reappear on same entry
- [ ] Entry list shows extended fast indicator (thunder icon)

### 5.2: Run Full Test Suite

```powershell
npm test
```

**Expected Results**:
- [ ] All 50+ existing EntryForm tests pass
- [ ] All ~25 new Feature 015 tests pass
- [ ] Zero failing tests
- [ ] Zero console errors or warnings

### 5.3: Run E2E Tests (if available)

```powershell
npm run test:e2e
```

**Verify**:
- [ ] Entry creation flow works end-to-end
- [ ] Extended fast confirmation flow works
- [ ] No visual regressions

---

## Step 6: Code Review Checklist

Before committing, verify:

**Code Quality**:
- [ ] No console.log() statements left in code
- [ ] No commented-out code
- [ ] No TODOs or FIXMEs
- [ ] Consistent code style (matches existing EntryForm.js patterns)
- [ ] Meaningful variable names (dateTimeRange, startDate, etc.)

**Constitution Compliance**:
- [ ] ✅ TDD followed (tests written first)
- [ ] ✅ Mobile-first design (two-line layout prevents overflow)
- [ ] ✅ Component architecture maintained (no new components needed)
- [ ] ✅ Privacy/security not impacted (no new data collection)
- [ ] ✅ Performance not impacted (synchronous formatting, no API calls)
- [ ] ✅ Accessibility considered (screen reader testing done)

**Specification Compliance**:
- [ ] FR-001: Date/time ranges display for all extended fast prompts ✅
- [ ] FR-002: Ranges show "start date at time → end date at time" format ✅
- [ ] FR-003: Date format is "22 Oct" (day-month) ✅
- [ ] FR-004: Time format matches user preference (12h/24h) ✅
- [ ] FR-005: No leading zeros on single-digit hours ✅
- [ ] FR-006: Midnight-spanning fasts show both dates ✅
- [ ] FR-007: From-previous uses previousEntry → formData ✅
- [ ] FR-008: To-next uses formData → nextEntry ✅
- [ ] FR-009: Sequential prompts show different ranges ✅
- [ ] FR-010: Two-line layout (duration, then date/time) ✅
- [ ] FR-011: Times display as user entered (no timezone conversion) ✅
- [ ] FR-012: No fallback needed (extended fast requires complete data) ✅

**Success Criteria**:
- [ ] SC-001: Date/time displays within 1 second (synchronous) ✅
- [ ] SC-002: 100% of prompts show date/time when data complete ✅
- [ ] SC-003: Format matches user's timeFormat 100% of time ✅
- [ ] SC-004: Sequential prompts show different ranges ✅
- [ ] SC-005: Zero regressions (all Feature 013 tests pass) ✅
- [ ] SC-006: Mobile rendering correct at 320px width ✅

---

## Step 7: Commit Changes

```powershell
git add src/components/organisms/EntryForm.js
git add tests/unit/components/organisms/EntryForm.test.js
git commit -m "Add date/time range display to extended fast prompts

- Add formatDateToDayMonth() helper (converts ISO date to '22 Oct' format)
- Add formatTimeByPreference() helper (converts 24h to 12h/24h per user pref)
- Update extended fast prompt JSX to display date/time ranges
- Add two-line layout (duration, then date/time range) for mobile
- Add 25 new tests (formatters + integration)
- All tests passing (75+ total EntryForm tests)
- Zero regressions from Feature 013

Implements Feature 015 user stories:
- US1: View date/time range in extended fast prompts
- US2: Sequential prompts show different date/time ranges
- US3: Time format matches user preference (12h/24h)

Closes Feature 015"
```

---

## Step 8: Post-Implementation Verification

### 8.1: Pull Request Checklist

When creating PR:
- [ ] Title: "Feature 015: Add date/time range display to extended fast prompts"
- [ ] Description includes:
  - Link to spec: `specs/015-extended-fast-datetime-display/spec.md`
  - Screenshot of prompt in 12h format
  - Screenshot of prompt in 24h format
  - Screenshot of mobile layout (320px)
  - Manual QA checklist results
- [ ] All CI checks passing
- [ ] No merge conflicts with master

### 8.2: Code Review Feedback

Address reviewer feedback:
- [ ] Make requested changes
- [ ] Re-run tests after changes
- [ ] Update manual QA checklist if needed

### 8.3: Merge to Master

After approval:
```powershell
git checkout master
git merge 015-extended-fast-datetime-display --no-ff
git push origin master
git branch -d 015-extended-fast-datetime-display
```

### 8.4: Production Deployment

- [ ] Verify deployment succeeds (Vercel auto-deploy)
- [ ] Test on production URL
- [ ] Verify date/time ranges display correctly in production
- [ ] Monitor error logs for any issues

---

## Troubleshooting

### Issue 1: Tests failing - "Cannot read property 'date' of undefined"

**Cause**: gapInfo.previousEntry or gapInfo.nextEntry not mocked in test.

**Fix**: Ensure test mocks include complete gapInfo structure:
```javascript
const gapInfo = {
  isExtendedFast: true,
  isExtendedFastFromPrevious: true,
  previousEntry: { 
    date: '2025-10-22',  // ← Must be present
    lastMealTime: '18:00'
  },
  fromPreviousFasting: { formatted: '26 hours' }
};
```

### Issue 2: Date formats showing wrong month

**Cause**: Using `toLocaleDateString()` without split/swap logic.

**Fix**: Ensure `formatDateToDayMonth()` includes the swap:
```javascript
const [month, day] = formatted.split(' ');
return `${day} ${month}`; // ← Swap order
```

### Issue 3: Times showing with leading zeros (e.g., "09:00 AM")

**Cause**: Using `padStart(2, '0')` on hours.

**Fix**: Only pad minutes, not hours:
```javascript
return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
//        ^ no padding      ^ padding here
```

### Issue 4: Mobile layout overflowing at 320px width

**Cause**: Missing `<br />` between duration and date/time range.

**Fix**: Ensure JSX includes line break:
```javascript
Extended fast detected ({gapInfo.fromPreviousFasting.formatted}):<br />
{/* date/time range on next line */}
```

### Issue 5: Screen reader not announcing full prompt

**Cause**: Complex JSX structure confusing assistive tech.

**Fix**: Wrap entire prompt in single semantic element with aria-label if needed.

---

## Estimated Timeline

- **Step 1** (Write Tests): 45-60 minutes
- **Step 2** (Implement Functions): 15-20 minutes
- **Step 3** (Update JSX): 10-15 minutes
- **Step 4** (Manual QA): 30-45 minutes
- **Step 5** (Regression Testing): 15-20 minutes
- **Step 6** (Code Review): 10-15 minutes
- **Step 7** (Commit): 5 minutes
- **Step 8** (PR & Merge): 30-60 minutes (depends on review speed)

**Total**: 2.5-3.5 hours (TDD approach, including comprehensive testing)

---

## Success Confirmation

✅ **Feature complete when**:
1. All 75+ tests passing (50 existing + 25 new)
2. Manual QA checklist 100% complete (14/14 test cases passed)
3. Mobile rendering verified at 320px width (no overflow)
4. Accessibility tested with screen reader
5. Zero regressions from Feature 013
6. Code merged to master and deployed to production

**Expected User Impact**:
- Users see exact date/time ranges in extended fast prompts
- Clearer context for confirming extended fasts
- Improved trust in fasting duration calculations
- Better mobile experience with two-line layout
- Consistent time format with user preferences

---

## Next Steps After Completion

1. **Update documentation**:
   - Add screenshots to README.md or user guide
   - Update CHANGELOG.md with Feature 015 summary

2. **Monitor user feedback**:
   - Watch for any confusion about date/time display
   - Track extended fast confirmation rates (expect increase in confidence)

3. **Consider future enhancements** (not in this feature):
   - Localized date formats (per user locale, not just en-US)
   - Custom date/time format preferences
   - Timezone display/conversion (currently out of scope)

---

**Questions?** Refer to:
- `specs/015-extended-fast-datetime-display/spec.md` (requirements)
- `specs/015-extended-fast-datetime-display/research.md` (technical decisions)
- `specs/015-extended-fast-datetime-display/data-model.md` (data structures)
- `constitution.md` (project standards)

**Ready to start?** Begin with Step 1 (Write Tests FIRST). Good luck! 🚀
