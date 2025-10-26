# Implementation Plan: Extended Fast Date/Time Range Display

**Branch**: `015-extended-fast-datetime-display` | **Date**: October 26, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-extended-fast-datetime-display/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add date/time range display to extended fast confirmation prompts, showing users the exact start and end date/time of their fasting window (e.g., "22 Oct at 18:00 → 23 Oct at 20:00") alongside the existing duration. This enhancement makes extended fast periods easier to understand and verify by transforming abstract durations into concrete time windows.

## Technical Context

**Language/Version**: JavaScript (ES6+) with React 18  
**Primary Dependencies**: Next.js 15.5.6 (App Router), Tailwind CSS for styling  
**Storage**: MongoDB with Mongoose ODM (Entry model - no schema changes required)  
**Testing**: Jest + React Testing Library for component tests, existing EntryForm test suite  
**Target Platform**: Web (desktop and mobile browsers), mobile-first responsive design  
**Project Type**: Next.js web application with Server/Client Component architecture  
**Performance Goals**: Date/time formatting within 10ms, no impact on existing form submission performance (<2s)  
**Constraints**: Mobile touch targets maintained (44x44px min), text must not overflow on 320px width screens, times respect user's 12h/24h preference  
**Scale/Scope**: Single UI enhancement in EntryForm.js extended fast prompt section (~50 lines affected), additive change only (no breaking changes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
- ✅ **PASS**: Modification affects Client Component (EntryForm.js) display logic only
- ✅ **PASS**: No new API routes or Server Components needed
- ✅ **PASS**: Leverages existing data from `/api/entries/check-previous` endpoint (gapInfo structure already contains needed dates/times)

### II. Mobile-First Responsive Design
- ⚠️ **REVIEW**: Must verify date/time range text fits on smallest mobile screens (320px width) without wrapping awkwardly
- ✅ **PASS**: Touch targets unchanged (buttons remain 44x44px minimum)
- ⚠️ **REVIEW**: Long date/time strings (e.g., "22 Oct at 11:30 PM → 23 Oct at 1:00 AM") must be tested for overflow

### III. Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: TDD mandatory - tests must be written first showing current behavior (duration only), then failing tests for new behavior (duration + date/time range)
- ✅ **PASS**: Existing EntryForm.test.js has comprehensive extended fast coverage (50+ tests)
- ✅ **PASS**: New tests will verify: date/time format correctness, 12h/24h preference respect, sequential prompt differentiation

**Action Required**: Write failing tests for date/time display before implementation

### IV. Component Architecture
- ✅ **PASS**: EntryForm remains self-contained, changes isolated to prompt rendering section
- ✅ **PASS**: No new components needed (inline text formatting only)
- ✅ **PASS**: Props interface unchanged (settings prop already passed, contains timeFormat preference)

### V. User Privacy & Data Security
- ✅ **PASS**: No new data collection or storage
- ✅ **PASS**: Uses existing gapInfo data (previousEntry, nextEntry dates/times already available)
- ✅ **PASS**: No changes to authentication or API security

### VI. Performance & Accessibility
- ✅ **PASS**: Minimal performance impact (date formatting is synchronous JavaScript operation <10ms)
- ✅ **PASS**: Semantic HTML maintained (text content within existing prompt structure)
- ⚠️ **REVIEW**: Screen readers must announce full date/time range clearly (verify with aria-label testing)
- ✅ **PASS**: No new interactive elements, keyboard navigation unchanged

**Gate Decision**: ✅ **PROCEED** - All critical gates pass, three minor reviews flagged for implementation phase (mobile text overflow, long strings, screen reader clarity)

## Project Structure

### Documentation (this feature)

```
specs/015-extended-fast-datetime-display/
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
├── components/
│   └── organisms/
│       └── EntryForm.js          # PRIMARY: Add date/time range display to extended fast prompts
├── app/
│   └── api/
│       └── entries/
│           └── check-previous/
│               └── route.js       # UNCHANGED: Already returns previousEntry/nextEntry with dates/times
└── lib/
    └── models/
        └── Entry.js              # UNCHANGED: No schema changes required

tests/
└── unit/
    └── components/
        └── organisms/
            └── EntryForm.test.js  # PRIMARY: Add tests for date/time display formatting
```

**Key File**: `src/components/organisms/EntryForm.js` (~845 lines)
- Lines 773-778: Current extended fast prompt text (duration only)
- **Target**: Enhance prompt text to include formatted date/time range alongside duration
- **Data Available**: `gapInfo.previousEntry.date`, `gapInfo.previousEntry.lastMealTime`, `formData.date`, `formData.firstMealTime` (from-previous), `formData.lastMealTime`, `gapInfo.nextEntry` (to-next)
- **Settings Available**: `settings.timeFormat` (12h or 24h user preference)

**Structure Decision**: Next.js web application using existing EntryForm organism component. No new components or API routes needed - pure UI enhancement using data already available in component state.

## Complexity Tracking

*No violations - all Constitution gates passed. See Constitution Check section above.*

---

## Phase 0: Research

### Research Questions

1. **Date/Time Formatting**: What JavaScript API should be used to format dates as "22 Oct" and times according to user preference (12h/24h)?
   - **Decision**: Use native `toLocaleDateString()` with custom options for date, custom function for time formatting
   - **Rationale**: No external dependencies needed, respects user's timeFormat setting in component props
   - **Pattern**: `date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })` for "22 Oct"

2. **Time Format Conversion**: How to convert 24h time string ("18:00") to 12h format ("6:00 PM") when user preference is 12h?
   - **Decision**: Create utility function `formatTimeByPreference(time24h, format)` that parses HH:mm and returns formatted string
   - **Rationale**: Reusable across both "from-previous" and "to-next" prompts, handles edge cases (midnight, noon, single-digit hours)
   - **Pattern**: Use Date object to parse time, format with `toLocaleTimeString()` or manual formatting

3. **Text Layout**: How to display date/time range alongside duration without text overflow on mobile (320px)?
   - **Decision**: Use two-line layout: duration on first line, date/time range on second line (indented or smaller text)
   - **Rationale**: Prevents horizontal overflow, maintains readability, allows duration to remain prominent
   - **Pattern**: `"Extended fast detected (26 hours)\n22 Oct at 18:00 → 23 Oct at 20:00"`

4. **Sequential Prompts**: How to ensure different date/time ranges display for "from-previous" vs "to-next" prompts?
   - **Decision**: Use `currentPromptType` state to conditionally select correct date/time data
   - **Rationale**: Already implemented pattern in Feature 013, reuse same conditional logic
   - **Pattern**: `currentPromptType === 'from-previous' ? previousData : nextData`

### Research Findings

**Decision 1: Date Formatting Strategy**
- **Chosen**: `toLocaleDateString('en-US', { day: '2-digit', month: 'short' })` produces "Oct 22", then manually swap to "22 Oct"
- **Rationale**: Native API ensures proper month abbreviation, simple string manipulation swaps to day-month format
- **Alternatives Considered**:
  - Manual string building from Date parts: Rejected (month name mapping is error-prone)
  - Third-party library (date-fns, dayjs): Rejected (adds dependency for simple task)
  - `toLocaleDateString()` with locale 'en-GB': Rejected (produces "22 Oct." with period, also produces full month names in some locales)

**Decision 2: Time Formatting Implementation**
- **Chosen**: Create `formatTimeByPreference(time24h, format)` utility function in EntryForm component
- **Implementation**:
  ```javascript
  const formatTimeByPreference = (time24h, format) => {
    const [hours, minutes] = time24h.split(':').map(Number);
    
    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // 0 becomes 12, 13 becomes 1, etc.
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // 24h format - no leading zero for single-digit hours per clarification
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };
  ```
- **Rationale**: Handles all edge cases (midnight, noon, single-digit hours), respects clarification decision (no leading zeros)
- **Alternatives Considered**:
  - `Date.toLocaleTimeString()`: Rejected (difficult to control leading zero behavior, locale-dependent)
  - Separate functions for 12h/24h: Rejected (increases code duplication)

**Decision 3: Text Layout Solution**
- **Chosen**: Two-line format with line break between duration and date/time range
- **Implementation Example**:
  ```
  Extended fast detected (26 hours):
  22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?
  ```
- **Rationale**: Keeps duration prominent, prevents overflow, uses existing prompt structure (colon separator already present)
- **Mobile Rendering**: Arrow symbol (→) is single character, dates are abbreviated ("Oct" not "October"), times are short
- **Alternatives Considered**:
  - Single line: Rejected (overflows on 320px screens with long strings like "22 Oct at 11:30 PM")
  - Separate visual blocks: Rejected (too much visual weight for enhancement)
  - Smaller font size for date/time: Rejected (reduces readability unnecessarily)

**Decision 4: Sequential Prompt Data Selection**
- **Chosen**: Reuse existing `currentPromptType` conditional logic, select data based on prompt type
- **Implementation Pattern**:
  ```javascript
  const startDate = currentPromptType === 'from-previous' 
    ? gapInfo.previousEntry.date 
    : new Date(formData.date);
  const startTime = currentPromptType === 'from-previous'
    ? gapInfo.previousEntry.lastMealTime
    : formData.lastMealTime;
  // Similar for endDate/endTime
  ```
- **Rationale**: Maintains consistency with Feature 013 implementation, ensures correct data for each prompt type
- **Validation**: First prompt shows previous→current times, second prompt shows current→next times

---

## Phase 1: Design & Contracts

### Design Overview

**Approach**: Additive enhancement to existing extended fast prompt display. No new components, no API changes, no database migrations. Pure UI transformation using data already available in component state.

**Change Scope**: ~50 lines in EntryForm.js
- Add 2 utility functions (~25 lines): formatDateToDayMonth, formatTimeByPreference
- Update 2 prompt text blocks (~20 lines): from-previous and to-next prompt JSX
- Add ~100-150 lines of tests in EntryForm.test.js

**User Flow** (unchanged from Feature 013):
1. User fills entry form with date and meal times
2. On submit, API checks for extended fasts (>24 hours)
3. If detected, prompt displays with duration **and now date/time range**
4. User confirms or denies extended fast
5. Entry saves with confirmation flag

**Visual Design**:
```
┌────────────────────────────────────────────────┐
│  Extended fast detected (26 hours):            │  ← Line 1: Duration (existing)
│  22 Oct at 18:00 → 23 Oct at 20:00.            │  ← Line 2: Date/time range (NEW)
│  Did you fast continuously?                    │  ← Line 3: Question (simplified)
│                                                 │
│  [Yes, I fasted continuously]  [No]            │  ← Buttons (unchanged)
└────────────────────────────────────────────────┘
```

**Responsive Behavior**:
- Desktop (>768px): Two lines as shown, ample space
- Mobile (320-767px): Two lines with automatic text wrap if needed, arrow symbol (→) prevents overflow

---

### Component Contracts

#### Function: formatDateToDayMonth(dateString)

**Purpose**: Transform ISO date string into "DD Mon" format for display.

**Signature**:
```javascript
/**
 * Format an ISO date string to "DD Mon" format (e.g., "22 Oct").
 * @param {string} dateString - ISO date string (e.g., "2025-10-22" or "2025-10-22T00:00:00.000Z")
 * @returns {string} Formatted date in "DD Mon" format (e.g., "22 Oct")
 */
const formatDateToDayMonth = (dateString) => { /* implementation */ }
```

**Input Constraints**:
- `dateString` must be valid ISO 8601 date string or parseable by `new Date()`
- Accepts both "YYYY-MM-DD" format (from formData.date) and full ISO timestamp (from gapInfo entries)

**Output Guarantees**:
- Always returns string in "DD Mon" format
- Day is zero-padded (e.g., "05 Jan" not "5 Jan")
- Month is three-letter abbreviation in English (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)

**Edge Cases**:
- End-of-month dates (Jan 31, Feb 28): Returns "31 Jan", "28 Feb"
- Single-digit dates: Returns "01 Jan" through "09 Jan" with leading zero
- Invalid date string: Will throw error (caller responsible for valid data - API already validates)

**Example Usage**:
```javascript
formatDateToDayMonth('2025-10-22')  // → "22 Oct"
formatDateToDayMonth('2025-10-22T00:00:00.000Z')  // → "22 Oct"
formatDateToDayMonth('2025-01-05')  // → "05 Jan"
```

**Test Coverage Required**:
- Valid ISO date strings (with and without time)
- All 12 months
- Single-digit and double-digit days
- End-of-month dates

---

#### Function: formatTimeByPreference(time24h, format)

**Purpose**: Convert 24-hour time string to user's preferred format (12h with AM/PM or 24h).

**Signature**:
```javascript
/**
 * Format 24-hour time string to user's preferred format (12h or 24h).
 * @param {string} time24h - Time in "HH:mm" format (e.g., "18:00", "09:30")
 * @param {string} format - Either "12h" or "24h" (from settings.timeFormat)
 * @returns {string} Formatted time (e.g., "6:00 PM" for 12h, "18:00" for 24h)
 */
const formatTimeByPreference = (time24h, format) => { /* implementation */ }
```

**Input Constraints**:
- `time24h` must be string in "HH:mm" format (e.g., "18:00", "09:30", "00:00")
- `format` must be exactly "12h" or "24h" (from settings.timeFormat prop)
- Hours range: 00-23, Minutes range: 00-59

**Output Guarantees**:
- **12h format**: Returns "H:mm AM/PM" (e.g., "6:00 PM", "9:30 AM")
  - No leading zero on single-digit hours (9:00 AM, not 09:00 AM) per clarification
  - Minutes always zero-padded (9:05 AM, not 9:5 AM)
  - Space between time and period ("6:00 PM" not "6:00PM")
- **24h format**: Returns "H:mm" (e.g., "18:00", "9:30")
  - No leading zero on single-digit hours (9:00, not 09:00) per clarification
  - Minutes always zero-padded

**Edge Cases**:
- Midnight (00:00): Returns "12:00 AM" (12h) or "0:00" (24h)
- Noon (12:00): Returns "12:00 PM" (12h) or "12:00" (24h)
- 12:01 PM: Returns "12:01 PM" (12h) or "12:01" (24h)
- Single-digit hours (09:00): Returns "9:00 AM" (12h) or "9:00" (24h) - **no leading zero**

**Example Usage**:
```javascript
formatTimeByPreference('18:00', '12h')  // → "6:00 PM"
formatTimeByPreference('18:00', '24h')  // → "18:00"
formatTimeByPreference('09:30', '12h')  // → "9:30 AM"
formatTimeByPreference('00:00', '12h')  // → "12:00 AM"
formatTimeByPreference('12:00', '12h')  // → "12:00 PM"
```

**Test Coverage Required**:
- Morning times (AM): 00:00-11:59
- Afternoon times (PM): 12:00-23:59
- Midnight and noon edge cases
- Single-digit hours (verify no leading zero)
- Both 12h and 24h format outputs

---

### UI Rendering Changes

#### Location: EntryForm.js lines ~773-788

**Current Implementation** (Feature 013 - duration only):
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

**New Implementation** (Feature 015 - duration + date/time range):
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
1. Added `<br />` after duration for two-line layout
2. Inserted date/time range between duration and question
3. Simplified question text ("Did you fast continuously?" instead of verbose description)
4. Used utility functions (formatDateToDayMonth, formatTimeByPreference) for formatting
5. Added null check for `gapInfo.nextEntry` (defensive programming)

**Data Sources**:
- **From-previous prompt**:
  - Start: `gapInfo.previousEntry.date` + `gapInfo.previousEntry.lastMealTime`
  - End: `formData.date` + `formData.firstMealTime`
- **To-next prompt**:
  - Start: `formData.date` + `formData.lastMealTime`
  - End: `gapInfo.nextEntry.date` + `gapInfo.nextEntry.firstMealTime`

**Accessibility**:
- Screen readers will announce: "Extended fast detected (26 hours): 22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?"
- Arrow symbol (→) announced as "rightwards arrow" or similar depending on screen reader
- No aria-label needed (text is semantic and complete)

---

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  API: /api/entries/check-previous                                   │
│  Returns: gapInfo { previousEntry, nextEntry, durations }           │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  EntryForm Component State                                          │
│  - gapInfo (API response)                                           │
│  - formData (user input: date, firstMealTime, lastMealTime)         │
│  - settings (props: timeFormat = "12h" or "24h")                    │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Conditional Rendering (currentPromptType)                          │
│  - if 'from-previous': use previousEntry + formData                 │
│  - if 'to-next': use formData + nextEntry                           │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Date/Time Formatting Functions                                     │
│  - formatDateToDayMonth(dateString) → "22 Oct"                      │
│  - formatTimeByPreference(time24h, format) → "6:00 PM" or "18:00"   │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  JSX Output (Prompt Text)                                           │
│  "Extended fast detected (26 hours):\n                              │
│   22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?"    │
└─────────────────────────────────────────────────────────────────────┘
```

**No API Changes**: All data needed already exists in gapInfo response from Feature 013.

---

### API Contracts

**NONE REQUIRED** - This feature uses existing API responses without modification.

**Existing API Endpoint** (unchanged):
- **Route**: `POST /api/entries/check-previous`
- **Request Body**: `{ userId, date, firstMealTime, lastMealTime }`
- **Response**: `{ gapInfo: { previousEntry: { date, lastMealTime }, nextEntry: { date, firstMealTime }, ... } }`
- **Feature 015 Usage**: Reads `previousEntry.date`, `previousEntry.lastMealTime`, `nextEntry.date`, `nextEntry.firstMealTime` from existing response

---

### Testing Strategy

#### Unit Tests (formatDateToDayMonth, formatTimeByPreference)

**Location**: `tests/unit/components/organisms/EntryForm.test.js`

**Coverage**:
- ✅ Date formatting: 5 tests (ISO formats, all months, edge cases)
- ✅ Time formatting 12h: 8 tests (AM/PM, midnight, noon, single-digit hours)
- ✅ Time formatting 24h: 5 tests (various times, midnight, noon, no leading zeros)

**Total**: 18 unit tests for utility functions

#### Integration Tests (Prompt Display)

**Location**: `tests/unit/components/organisms/EntryForm.test.js`

**Coverage**:
- ✅ From-previous prompt displays date/time range (24h format)
- ✅ From-previous prompt displays date/time range (12h format)
- ✅ To-next prompt displays date/time range
- ✅ Sequential prompts show different date/time ranges
- ✅ Midnight-spanning fast shows both dates
- ✅ Mobile layout (two-line format)
- ✅ Confirm button still works (no regressions)

**Total**: 7 integration tests for prompt rendering

#### Regression Tests (Feature 013)

**Verify**: All 50+ existing EntryForm tests still pass
- Extended fast detection logic unchanged
- Confirmation/denial buttons still functional
- Entry saves correctly with extendedFastConfirmed flag
- Sequential prompts still show in correct order

#### Manual QA

**Desktop**:
- [ ] Test 12h format display
- [ ] Test 24h format display
- [ ] Test midnight-spanning fasts
- [ ] Test sequential prompts (both direction)
- [ ] Verify confirm/deny buttons work

**Mobile** (320px width):
- [ ] Verify two-line layout prevents overflow
- [ ] Test long date/time strings (11:30 PM format)
- [ ] Verify touch targets still 44x44px minimum

**Accessibility**:
- [ ] Test with NVDA screen reader (Windows)
- [ ] Test with VoiceOver (Mac)
- [ ] Verify full prompt text announced

---

### Implementation Checklist

**Before Starting** (TDD - NON-NEGOTIABLE):
- [ ] Write failing tests for formatDateToDayMonth (5 tests)
- [ ] Write failing tests for formatTimeByPreference (13 tests)
- [ ] Write failing tests for prompt display integration (7 tests)
- [ ] Run tests, verify all new tests fail (`npm test EntryForm`)

**Implementation**:
- [ ] Add formatDateToDayMonth function to EntryForm.js (~10 lines, before component)
- [ ] Add formatTimeByPreference function to EntryForm.js (~15 lines, before component)
- [ ] Update from-previous prompt JSX (~10 lines, line ~773)
- [ ] Update to-next prompt JSX (~10 lines, line ~783)
- [ ] Run tests, verify all tests pass (`npm test EntryForm`)

**Verification**:
- [ ] Run full test suite (`npm test`) - 75+ tests passing
- [ ] Manual QA checklist complete (14 test cases)
- [ ] Code review checklist complete (Constitution compliance verified)

---

## Phase 2: Task Breakdown

*Generated by `/speckit.tasks` command (separate from this plan).*

**See**: `tasks.md` when generated

---

## Implementation Notes

### File Structure After Implementation

**Modified Files**:
```
src/components/organisms/EntryForm.js  (~50 lines added/changed)
tests/unit/components/organisms/EntryForm.test.js  (~100-150 lines added)
```

**Generated Documentation**:
```
specs/015-extended-fast-datetime-display/
├── spec.md              ✅ Complete (specification)
├── plan.md              ✅ This file (implementation plan)
├── research.md          ✅ Complete (research findings)
├── data-model.md        ✅ Complete (data structures)
├── quickstart.md        ✅ Complete (step-by-step guide)
├── contracts/           ✅ (function contracts documented above)
└── tasks.md             ⏳ Run /speckit.tasks to generate
```

### Dependencies

**No New Dependencies**: Feature uses only native JavaScript Date API and existing React/Next.js dependencies.

**Existing Dependencies** (unchanged):
- React 18 (JSX rendering)
- Next.js 15.5.6 (framework)
- Jest + React Testing Library (testing)
- Tailwind CSS (styling - no new styles needed)

### Deployment Considerations

**Zero Risk Deployment**:
- No database migrations
- No API changes
- No breaking changes to existing features
- Additive only (existing behavior preserved)

**Rollback**: Simple `git revert` of commit if issues arise (no data migration to undo)

---

## Summary

**Ready for Implementation**: ✅ All planning phases complete

**Next Command**: `/speckit.tasks` to generate task breakdown (tasks.md)

**Estimated Implementation Time**: 2-3 hours (TDD approach with comprehensive testing)

**Complexity**: Low (pure UI enhancement, no backend changes)

**Risk**: Minimal (additive change, comprehensive test coverage, no data modifications)

