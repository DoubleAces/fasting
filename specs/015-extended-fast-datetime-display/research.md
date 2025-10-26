# Research: Extended Fast Date/Time Range Display

**Feature**: Add date/time range display to extended fast confirmation prompts  
**Date**: October 26, 2025  
**Status**: Completed

## Research Questions & Answers

### Q1: How should dates be formatted as "22 Oct" format in JavaScript?

**Decision**: Use `toLocaleDateString('en-US', { day: '2-digit', month: 'short' })` and swap order

**Rationale**:
- Native JavaScript `Date.toLocaleDateString()` ensures correct month abbreviations without manual mapping
- Produces "Oct 22" format, simple string split/join swaps to "22 Oct"
- No external dependencies required
- Reliable across different Date values and edge cases (leap years, month boundaries, etc.)

**Alternatives Considered**:
- **Manual string building**: Build string from `Date.getDate()` and month name array
  - Rejected: Requires maintaining month name mapping, error-prone, no advantage over native API
- **Third-party library** (date-fns, dayjs):
  - Rejected: Adds bundle size for simple formatting task, overkill for single format requirement
- **`toLocaleDateString()` with 'en-GB' locale**: Produces "22 Oct" directly
  - Rejected: Inconsistent behavior across browsers (some add periods: "22 Oct."), some locales produce full month names

**Implementation Notes**:
- Use `split(' ')` on result, reverse array, `join(' ')` to swap month/day
- Ensure consistent zero-padding for single-digit days (toLocaleDateString with '2-digit' handles this)
- Example: `new Date('2025-10-22').toLocaleDateString('en-US', { day: '2-digit', month: 'short' })` → "Oct 22" → "22 Oct"

---

### Q2: How to convert 24-hour time format ("18:00") to 12-hour format ("6:00 PM") based on user preference?

**Decision**: Create utility function `formatTimeByPreference(time24h, format)` within EntryForm component

**Rationale**:
- User's time format preference already available in `settings.timeFormat` prop ('12h' or '24h')
- Single reusable function handles both formats and all edge cases (midnight, noon, single-digit hours)
- Respects clarification decision: single-digit hours without leading zero (9:00 not 09:00)
- Pure function (no side effects), easily testable

**Implementation**:
```javascript
const formatTimeByPreference = (time24h, format) => {
  const [hours, minutes] = time24h.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // 24h format - no leading zero per clarification
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
```

**Edge Cases Handled**:
- Midnight (00:00): Displays as "12:00 AM" (12h) or "0:00" (24h)
- Noon (12:00): Displays as "12:00 PM" (12h) or "12:00" (24h)
- Single-digit hours: 9:00 displays as "9:00" not "09:00" per clarification
- Minutes always zero-padded: "9:05" not "9:5"

**Alternatives Considered**:
- **`Date.toLocaleTimeString()`**: Native API for time formatting
  - Rejected: Difficult to control leading zero behavior, locale-dependent, may add seconds
- **Separate functions for 12h and 24h**: Split into `formatTime12h()` and `formatTime24h()`
  - Rejected: Increases code duplication, harder to test, preference check still needed at call site
- **Template literals with lookup table**: Use object mapping for AM/PM
  - Rejected: More complex than arithmetic approach, no tangible benefit

---

### Q3: How to display date/time range alongside duration without text overflow on mobile (320px width)?

**Decision**: Use two-line layout with line break after duration

**Rationale**:
- Prevents horizontal overflow on smallest mobile screens
- Maintains duration prominence (first line, familiar pattern from Feature 013)
- Date/time range on second line provides context without overwhelming
- Uses existing prompt structure (colon separator already present after duration)
- Arrow symbol (→) is single Unicode character, visually clear

**Layout Example**:
```
Extended fast detected (26 hours):
22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?
```

**Character Count Analysis**:
- Longest realistic string: "Extended fast detected (50 hours): 22 Oct at 11:30 PM → 23 Oct at 1:00 AM"
- First line: ~36 characters
- Second line with 12h format: ~45 characters
- Both lines fit comfortably in 320px width with typical font sizes (14-16px)

**Alternatives Considered**:
- **Single line format**: "Extended fast detected (26 hours): 22 Oct at 18:00 → 23 Oct at 20:00"
  - Rejected: Overflows on 320px screens, especially with 12-hour format ("11:30 PM")
- **Separate visual blocks**: Duration in one box, date/time in separate box below
  - Rejected: Too much visual weight for simple enhancement, inconsistent with existing prompt style
- **Smaller font size**: Reduce date/time text to 12px or smaller
  - Rejected: Reduces readability unnecessarily, WCAG accessibility concerns on mobile
- **Truncation with tooltip**: Show abbreviated date/time, full on hover/tap
  - Rejected: Poor mobile UX (tooltips unreliable), hides important verification information

**Implementation Pattern**:
- Use `\n` or `<br />` (JSX) to create line break after colon
- Maintain existing text color and styling for consistency
- Screen readers will announce full text naturally (no special aria labels needed)

---

### Q4: How to ensure different date/time ranges display for "from-previous" vs "to-next" sequential prompts?

**Decision**: Reuse existing `currentPromptType` state conditional logic to select correct date/time data

**Rationale**:
- `currentPromptType` state already exists and accurately tracks which prompt is showing ('from-previous' or 'to-next')
- `gapInfo` object already contains all necessary data:
  - `gapInfo.previousEntry.date` and `.lastMealTime` for "from-previous" start
  - `formData.date` and `.firstMealTime` for "from-previous" end / "to-next" start
  - `gapInfo.nextEntry` data (if exists) for "to-next" end
- Conditional selection ensures correct data for each prompt without state duplication
- Consistent with Feature 013 implementation pattern (same conditional used for duration display)

**Implementation Pattern**:
```javascript
// Select start date/time based on prompt type
const startDate = currentPromptType === 'from-previous' 
  ? new Date(gapInfo.previousEntry.date)
  : new Date(formData.date);
  
const startTime = currentPromptType === 'from-previous'
  ? gapInfo.previousEntry.lastMealTime
  : formData.lastMealTime;

// Select end date/time based on prompt type  
const endDate = currentPromptType === 'from-previous'
  ? new Date(formData.date)
  : gapInfo.nextEntry ? new Date(gapInfo.nextEntry.date) : null;
  
const endTime = currentPromptType === 'from-previous'
  ? formData.firstMealTime
  : gapInfo.nextEntry ? gapInfo.nextEntry.firstMealTime : null;
```

**Data Flow**:
1. **First prompt** (from-previous): Shows `previousEntry.lastMealTime` → `formData.firstMealTime`
2. **Second prompt** (to-next): Shows `formData.lastMealTime` → `nextEntry.firstMealTime`
3. Each prompt displays distinct, non-overlapping time period

**Validation Points**:
- `gapInfo.previousEntry` always exists when "from-previous" prompt shows (checked in handleSubmit)
- `gapInfo.nextEntry` may not exist for "to-next" prompts (backfilling old gaps) - handle null case
- Dates are stored as Date objects in gapInfo, use `new Date()` constructor for consistent formatting

**Alternatives Considered**:
- **Separate state variables**: Create `promptStartDate`, `promptEndDate`, `promptStartTime`, `promptEndTime`
  - Rejected: Adds state management complexity, duplication of data already in gapInfo/formData, synchronization issues
- **Compute on render**: Calculate date/time range inside JSX using inline ternaries
  - Rejected: Clutters JSX, harder to test, less readable, same conditional logic still needed
- **Memoized selector function**: Use `useMemo` to compute date/time range
  - Rejected: Premature optimization (calculation is trivial), adds complexity without benefit

---

## Implementation Dependencies

### Required Data (Already Available)

**From `gapInfo` state** (populated by `/api/entries/check-previous`):
- `gapInfo.previousEntry.date`: ISO date string of previous entry
- `gapInfo.previousEntry.lastMealTime`: "HH:mm" format (24-hour)
- `gapInfo.nextEntry.date`: ISO date string of next entry (if exists)
- `gapInfo.nextEntry.firstMealTime`: "HH:mm" format (if exists)
- `gapInfo.fromPreviousFasting.formatted`: Current duration display (e.g., "26 hours")
- `gapInfo.toNextFasting.formatted`: Duration for to-next prompt

**From `formData` state** (user's current entry being created/edited):
- `formData.date`: ISO date string of current entry
- `formData.firstMealTime`: "HH:mm" format (24-hour)
- `formData.lastMealTime`: "HH:mm" format (24-hour)

**From `settings` prop** (user preferences):
- `settings.timeFormat`: "12h" or "24h" user preference

**From `currentPromptType` state** (which prompt is showing):
- `'from-previous'`: Show previous entry's last meal → current entry's first meal
- `'to-next'`: Show current entry's last meal → next entry's first meal

### No New API Calls Required

- All necessary date/time data already returned by existing `/api/entries/check-previous` endpoint
- No database schema changes needed
- No new backend validation required

---

## Testing Strategy

### Unit Tests (EntryForm.test.js)

**Date Formatting Tests**:
- ✓ Formats dates as "22 Oct" (day-month with abbreviated month)
- ✓ Handles single-digit days correctly ("9 Oct" not "09 Oct")
- ✓ Handles different months correctly (Jan, Feb, Mar, ..., Dec)
- ✓ Handles year boundaries (Dec 31 → Jan 1)

**Time Formatting Tests**:
- ✓ 24-hour format displays without leading zero (9:00, 18:00)
- ✓ 12-hour format shows AM/PM correctly
- ✓ Midnight displays as "12:00 AM" (12h) or "0:00" (24h)
- ✓ Noon displays as "12:00 PM" (12h) or "12:00" (24h)
- ✓ Minutes always zero-padded (9:05 not 9:5)

**Integration Tests** (prompt display):
- ✓ "From-previous" prompt shows correct date/time range (previous → current)
- ✓ "To-next" prompt shows different date/time range (current → next)
- ✓ Sequential prompts display distinct time periods
- ✓ Duration and date/time range both visible
- ✓ Text does not overflow on mobile (320px width)

**User Preference Tests**:
- ✓ 12-hour preference formats times with AM/PM
- ✓ 24-hour preference formats times without AM/PM
- ✓ Changing preference updates display correctly

### Manual QA Checklist

**Desktop Testing** (1920x1080):
- [ ] Create entry with 26-hour gap, verify date/time range displays alongside duration
- [ ] Verify date format is "22 Oct" (day before month)
- [ ] Verify times respect user's 12h/24h preference in settings
- [ ] Test midnight-spanning range (e.g., "22 Oct at 23:30 → 23 Oct at 1:00")
- [ ] Test sequential extended fasts, verify each prompt shows different date/time range

**Mobile Testing** (320px width):
- [ ] Verify date/time range text does not overflow horizontally
- [ ] Verify text remains readable (font size adequate)
- [ ] Test longest realistic string: "22 Oct at 11:30 PM → 23 Oct at 1:00 AM"
- [ ] Verify line break occurs after duration (two-line layout)

**Accessibility Testing**:
- [ ] Screen reader announces full date/time range naturally
- [ ] Text contrast passes WCAG AA (existing prompt styles maintained)
- [ ] No layout shift or reflow when date/time appears

---

## Conclusion

All research questions resolved with concrete implementation decisions. No technical blockers identified. Existing API and data structures provide all necessary information. Feature can be implemented as pure UI enhancement with no backend changes. Ready to proceed to Phase 1 (data model and contracts).
