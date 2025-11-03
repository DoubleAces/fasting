# Feature Specification: Timer Date Crossing Bug Fix

**Feature Branch**: `027-timer-date-crossing`  
**Created**: January 1, 2025  
**Status**: Draft  
**Input**: User description: "Timer displays 0:00:00 when month changes during active fast (e.g., start Oct 31 8PM, at Nov 1 2AM shows 0 instead of 6 hours). Root cause: fastingTimerUtils.js assumes all months have 30 days (43200 minutes) causing calculation errors at month/year boundaries. Fix: use native Date object for millisecond calculation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Month Boundary Timer Accuracy (Priority: P0)

When a user starts a fast on the last day of a month (e.g., Oct 31 at 8:00 PM) and continues fasting past midnight into the next month (e.g., Nov 1 at 2:00 AM), the timer must accurately display the elapsed fasting time (6 hours in this example) instead of showing 0:00:00 or incorrect values.

**Why this priority**: This is a P0 critical bug - the core timer functionality is completely broken for users who fast across month boundaries. This affects approximately 1/30th of all active fasts (fasts that cross into a new month), making it a high-impact issue that undermines trust in the application's accuracy.

**Independent Test**: Can be fully tested by creating an entry with lastMealTime on Oct 31, then mocking system time to Nov 1 and verifying the timer shows correct elapsed time. This is a pure calculation bug fix that delivers immediate value by restoring core timer functionality.

**Acceptance Scenarios**:

1. **Given** I started fasting on October 31 at 8:00 PM (20:00), **When** the system time is November 1 at 2:00 AM (02:00), **Then** the timer displays "6h 0m" (6 hours 0 minutes)

2. **Given** I started fasting on December 31 at 11:00 PM (23:00), **When** the system time is January 1 at 3:00 AM (03:00), **Then** the timer displays "4h 0m" (4 hours 0 minutes) and shows correct year boundary crossing

3. **Given** I started fasting on February 28 at 10:00 PM in a non-leap year, **When** the system time is March 1 at 8:00 AM, **Then** the timer displays "10h 0m" (10 hours 0 minutes)

4. **Given** I started fasting on February 29 at 10:00 PM in a leap year, **When** the system time is March 1 at 8:00 AM, **Then** the timer displays "10h 0m" (10 hours 0 minutes)

5. **Given** I started fasting on any date within a month, **When** viewing the timer before crossing month boundary, **Then** timer continues to work correctly (regression test - existing functionality unaffected)

---

### User Story 2 - Multi-Day Fast Across Month Boundaries (Priority: P1)

When a user is on an extended fast (>24 hours) that crosses month boundaries, the timer must accurately display the total elapsed time including days, hours, and minutes, regardless of how many different months the fast spans.

**Why this priority**: Extended fasts (24-72+ hours) are a common use case for intermittent fasting practitioners. If the timer breaks when crossing month boundaries, it severely impacts user experience for some of the most engaged users.

**Independent Test**: Can be tested by creating an entry with lastMealTime several days ago crossing at least one month boundary, then verifying timer shows correct total elapsed time with days component.

**Acceptance Scenarios**:

1. **Given** I started fasting on October 30 at 6:00 PM (18:00), **When** the system time is November 2 at 12:00 PM (12:00), **Then** the timer displays "2d 18h 0m" (2 days 18 hours 0 minutes)

2. **Given** I started fasting on December 30 at 8:00 AM (08:00), **When** the system time is January 2 at 10:00 AM (10:00), **Then** the timer displays "3d 2h 0m" (3 days 2 hours 0 minutes) spanning across year boundary

3. **Given** I started fasting on January 29 at 4:00 PM (16:00), **When** the system time is March 3 at 8:00 AM (08:00) in a non-leap year, **Then** the timer displays correct elapsed time accounting for February having 28 days

4. **Given** I started fasting on January 29 at 4:00 PM (16:00), **When** the system time is March 3 at 8:00 AM (08:00) in a leap year, **Then** the timer displays correct elapsed time accounting for February having 29 days

---

### User Story 3 - Timer Resilience Across All Calendar Scenarios (Priority: P1)

The timer calculation must work correctly for all calendar edge cases including short months (February), month boundaries, year boundaries, and different month lengths (28, 29, 30, 31 days) without requiring manual month-length logic.

**Why this priority**: This ensures the fix is robust and won't break in future calendar scenarios. By using native Date object calculations, the system automatically handles all calendar complexities without custom logic.

**Independent Test**: Can be tested with a comprehensive test suite covering all month lengths, leap years, and year boundaries. Each test independently verifies correct calculation for a specific calendar scenario.

**Acceptance Scenarios**:

1. **Given** I have fasts crossing any of the 12 month boundaries in a year, **When** timer calculates elapsed time, **Then** all calculations are accurate regardless of source/destination month length

2. **Given** the current year is a leap year and my fast crosses Feb 28→Feb 29, **When** timer calculates elapsed time, **Then** calculation correctly accounts for the 29th day

3. **Given** the current year is not a leap year and my fast crosses Feb 28→Mar 1, **When** timer calculates elapsed time, **Then** calculation correctly accounts for February having only 28 days

4. **Given** my fast starts in any timezone, **When** I travel to a different timezone during the fast, **Then** the elapsed time calculation remains accurate based on wall-clock time (local time perception)

5. **Given** daylight saving time changes occur during my fast, **When** timer calculates elapsed time, **Then** calculation reflects wall-clock time (human perception) rather than absolute UTC milliseconds

---

### Edge Cases

- **Month-to-month variations**: What happens when fasting from a 31-day month (Jan) to a 28-day month (Feb)? (System uses native Date object which automatically handles different month lengths)

- **Leap year February**: How does calculation handle Feb 29 in leap years vs non-leap years? (Native Date object automatically handles leap year logic)

- **Year boundary with month boundary**: What happens when fast crosses Dec 31→Jan 1? (Calculation works correctly using native Date year/month/day tracking)

- **Short fasts within same month**: Does the fix affect normal same-day or same-month fasts? (No - regression tests ensure existing functionality unchanged)

- **Historical entries**: What happens to timer calculations for historical entries created before this fix? (Calculations are deterministic based on stored lastMealTime and date - historical entries automatically calculate correctly with fixed logic)

- **Timezone changes mid-fast**: What happens if user changes timezone while fasting? (Timer uses local time components to calculate wall-clock elapsed time, so timezone changes are handled correctly)

- **DST transitions**: How does timer handle daylight saving time changes? (Current implementation calculates wall-clock time which matches user perception during DST transitions)

- **Very long fasts (>30 days)**: What happens for fasts spanning multiple months? (Native Date calculation handles unlimited date ranges correctly)

- **Invalid dates (Feb 30, Nov 31)**: What happens if corrupted data has impossible dates? (Native Date object gracefully handles by rolling over - Feb 30 becomes Mar 2/3 depending on leap year)

- **Future timestamps**: What happens if lastMealTime is accidentally in the future? (Existing code returns 0 for negative elapsed time - maintains this behavior)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate elapsed fasting time using native JavaScript Date object millisecond difference (Date.getTime() or equivalent) instead of manual year/month/day/hour/minute arithmetic

- **FR-002**: Timer calculation MUST produce accurate elapsed time when fast crosses from any month to any other month, accounting for different month lengths (28, 29, 30, 31 days)

- **FR-003**: Timer calculation MUST produce accurate elapsed time when fast crosses year boundary (Dec 31→Jan 1)

- **FR-004**: Timer calculation MUST handle leap years correctly (Feb 29 in leap years, Feb 28 in non-leap years) without explicit leap year logic

- **FR-005**: Timer calculation MUST NOT regress existing functionality for same-day or same-month fasts

- **FR-006**: Timer calculation MUST continue to return 0 for negative elapsed time (when lastMealTime is in the future due to data corruption or clock issues)

- **FR-007**: Timer calculation MUST handle timezone changes by calculating based on local time components to match user's wall-clock perception

- **FR-008**: System MUST remove manual month length assumptions (currently: month * 43200 minutes) from calculation logic

- **FR-009**: System MUST remove manual year length assumptions (currently: year * 525600 minutes) from calculation logic that don't account for leap years

- **FR-010**: All unit tests for calculateElapsedTime function MUST pass, including new tests for month boundary, year boundary, and leap year scenarios

### Key Entities

- **lastMealTime** (string, HH:mm format): The time the user ate their last meal, stored in 24-hour format
- **entryDate** (Date object or ISO string): The calendar date when the last meal occurred
- **currentTime** (Date object): The current system time used for calculating elapsed duration
- **elapsedMs** (number): The calculated difference in milliseconds between lastMealTime and currentTime, always >= 0

### Root Cause Analysis

**Current Broken Implementation** (src/lib/utils/fastingTimerUtils.js, lines 46-47):
```javascript
const startTotalMinutes = startYear * 525600 + startMonth * 43200 + startDay * 1440 + startHour * 60 + startMinute;
const endTotalMinutes = endYear * 525600 + endMonth * 43200 + endDay * 1440 + endHour * 60 + endMinute;
```

**Problems**:
1. Assumes all months have exactly 30 days (43200 minutes = 30 * 24 * 60)
2. Assumes all years have exactly 365 days (525600 minutes = 365 * 24 * 60) - doesn't account for leap years
3. October has 31 days (44640 minutes), not 30 days (43200 minutes)
4. When crossing Oct 31→Nov 1, month index changes from 9→10, but calculation uses fixed 43200 multiplier
5. This creates a 1440-minute (24-hour) error for every month boundary crossed

**Correct Approach**:
Use native Date object which encapsulates all calendar complexity:
```javascript
// Create Date objects with correct year/month/day and time components
const lastMealDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
const elapsed = now.getTime() - lastMealDate.getTime();
```

This delegates calendar math to JavaScript's built-in Date implementation which correctly handles:
- Variable month lengths (28, 29, 30, 31)
- Leap years
- Year boundaries
- Timezone and DST transitions (when using local time components)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Timer displays correct elapsed time (within 1 minute accuracy) for 100% of fasts that cross month boundaries in manual testing

- **SC-002**: Timer displays correct elapsed time (within 1 minute accuracy) for 100% of fasts that cross year boundaries in manual testing

- **SC-003**: Unit tests achieve 100% pass rate for all calendar scenarios: same-day, same-month, month boundary, year boundary, leap year, non-leap year

- **SC-004**: Zero regression in timer accuracy for existing same-day and same-month fasts (all existing unit tests continue to pass)

- **SC-005**: Code review confirms removal of all hardcoded month length assumptions (43200) and year length assumptions (525600) from calculation logic

- **SC-006**: New unit tests added cover at minimum: Oct→Nov boundary, Dec→Jan boundary, Feb 28→Mar 1 (non-leap), Feb 29→Mar 1 (leap year), multi-day fast across month boundary

### User-Facing Validation

- **UV-001**: Create test fast on Oct 31 at 8:00 PM, mock system time to Nov 1 at 2:00 AM, verify timer shows "6h 0m"
- **UV-002**: Create test fast on Dec 31 at 11:00 PM, mock system time to Jan 1 at 5:00 AM, verify timer shows "6h 0m"
- **UV-003**: Create test fast on Feb 28 at 10:00 PM (non-leap year), mock system time to Mar 1 at 10:00 AM, verify timer shows "12h 0m"
- **UV-004**: Verify all existing timer functionality (timer updates every 60s, stops on fast completion, displays correctly) remains unchanged

---

## Assumptions

1. **Assumption**: The existing `calculateElapsedTime` function signature can remain unchanged (lastMealTime, now, entryDate parameters)
   - **Rationale**: Based on code review, current function signature is sufficient; only internal implementation needs fixing

2. **Assumption**: The fix should use native Date object for millisecond calculation rather than custom calendar math
   - **Rationale**: JavaScript's Date object correctly handles all calendar edge cases, reducing complexity and bug risk

3. **Assumption**: Existing behavior of returning 0 for negative elapsed time (future timestamps) should be preserved
   - **Rationale**: This is a safety check present in current code (line 51: `return elapsed >= 0 ? elapsed : 0`)

4. **Assumption**: Wall-clock time perception is preferred over UTC milliseconds for DST transitions
   - **Rationale**: Current implementation uses local time components (lines 34-44) suggesting intent to match user perception

5. **Assumption**: The bug affects only the `calculateElapsedTime` function in `src/lib/utils/fastingTimerUtils.js`
   - **Rationale**: Based on code review, this is the only location with the problematic month/year arithmetic (lines 46-47)

---

## Out of Scope

- Modifying the timer update frequency (remains 60 seconds)
- Changing timer display format or UI components
- Adding new timer features or milestones
- Modifying how lastMealTime or entryDate are stored in database
- Changing timer behavior for completed fasts
- Adding server-side timer calculation or validation
- Modifying other fasting calculation functions (fastingCalculator.js uses different approach and is not affected)

---

## Dependencies

- Existing Feature 017 (live-fasting-timer) infrastructure
- Unit test framework (Jest) for adding new calendar edge case tests
- Existing timer components that consume `calculateElapsedTime` (no changes needed to consumers)

---

## Clarifications

*This specification contains zero [NEEDS CLARIFICATION] markers - all requirements are defined based on root cause analysis, existing code patterns, and standard JavaScript Date handling.*

---

## Notes

- The existing `fastingCalculator.js` utility (used for completed fast calculations) uses a different approach and is NOT affected by this bug
- Only the `fastingTimerUtils.js` calculateElapsedTime function for live active fasts has the month boundary bug
- The fix is isolated to approximately 10-15 lines of code (lines 15-51 in fastingTimerUtils.js)
- All existing consumers of calculateElapsedTime will automatically benefit from the fix without modification

