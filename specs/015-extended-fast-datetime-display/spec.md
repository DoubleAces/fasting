# Feature Specification: Extended Fast Date/Time Range Display

**Feature Branch**: `015-extended-fast-datetime-display`  
**Created**: October 26, 2025  
**Status**: Draft  
**Input**: User description: "Add date/time range display to extended fast confirmation prompts so users can see when their fasting window started and ended (e.g., 'Oct 22 at 18:00 → Oct 23 at 20:00') in addition to the duration, making it easier to understand and verify extended fast periods"

## Clarifications

### Session 2025-10-26

- Q: When the extended fast date/time range display encounters missing meal time data (e.g., previous entry exists but has no lastMealTime), how should the system respond? → A: No popup shown (cannot calculate extended fast without meal times)
- Q: When date/time ranges span midnight (e.g., "Oct 22 at 23:30 → Oct 23 at 01:00"), how should the system display this to ensure clarity? → A: Always show both full dates (e.g., "Oct 22 at 23:30 → Oct 23 at 01:00")
- Q: How should single-digit hours be formatted in the time display (e.g., 9:00 AM vs 09:00 AM)? → A: Without leading zero (9:00, not 09:00)
- Q: How should date formats be localized for international users (e.g., "Oct 22" vs "22 Oct" vs "10/22")? → A: Use "22 Oct" (day-month) format for all users consistently
- Q: How should the system handle timezone display when dates are stored in UTC but users may be in different timezones? → A: Display times exactly as user entered them (no timezone conversion)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Extended Fast Date/Time Range (Priority: P1)

When creating or editing an entry that triggers an extended fast prompt (>24 hours), the user sees both the duration AND the specific start/end date and time of the fasting period, making it immediately clear when the fast began and ended.

**Why this priority**: Core value of the feature - users need to understand the exact time window of their extended fast to make informed confirmation decisions. Without date/time context, a "26 hours" duration is abstract and hard to verify.

**Independent Test**: Can be fully tested by creating an entry that has a >24 hour gap from the previous entry (e.g., previous entry last meal at Oct 22 18:00, new entry first meal at Oct 23 20:00). User should see "22 Oct at 18:00 → 23 Oct at 20:00" displayed along with "26 hours".

**Acceptance Scenarios**:

1. **Given** I have an entry on Oct 22 with last meal at 18:00, **When** I create a new entry for Oct 23 with first meal at 20:00 (26 hour gap), **Then** the extended fast prompt displays "Extended fast detected (26 hours): 22 Oct at 18:00 → 23 Oct at 20:00. Did you fast continuously?"

2. **Given** I have an entry on Oct 20 with last meal at 14:00, **When** I create a new entry for Oct 22 with first meal at 16:00 (50 hour gap), **Then** the extended fast prompt displays "Extended fast detected (50 hours): 20 Oct at 14:00 → 22 Oct at 16:00. Did you fast continuously?"

3. **Given** I create an entry that creates an extended fast TO the next entry (future gap), **When** the prompt appears, **Then** I see the date/time range showing current entry's last meal time to next entry's first meal time

---

### User Story 2 - Sequential Extended Fast Date/Time Clarity (Priority: P2)

When filling a gap between two entries (creating both "from-previous" and "to-next" extended fasts), the user sees distinct date/time ranges for each prompt, clearly showing which time period each confirmation refers to.

**Why this priority**: Prevents confusion when multiple extended fasts are detected. Users need to understand they're confirming two different time periods, not the same one twice.

**Independent Test**: Can be fully tested by creating an entry that fills a gap (e.g., entries exist for Oct 20 and Oct 24, create entry for Oct 22). Both prompts should show different date/time ranges corresponding to Oct 20→Oct 22 and Oct 22→Oct 24.

**Acceptance Scenarios**:

1. **Given** I have entries on Oct 20 (last meal 14:00) and Oct 24 (first meal 16:00), **When** I create an entry for Oct 22 (first meal 16:00, last meal 18:00) creating two extended fasts, **Then** the first prompt shows "20 Oct at 14:00 → 22 Oct at 16:00" and the second prompt shows "22 Oct at 18:00 → 24 Oct at 16:00"

2. **Given** I'm viewing a sequential extended fast prompt, **When** I confirm the first extended fast, **Then** the prompt updates to show the second time period with different start/end dates and times

---

### User Story 3 - Respect User Time Format Preference (Priority: P3)

The date/time ranges displayed in extended fast prompts respect the user's time format preference (12-hour with AM/PM or 24-hour format) for consistency with the rest of the application.

**Why this priority**: Maintains consistent user experience and respects user preferences already configured in settings. Lower priority because feature is still usable even if time format doesn't match preference.

**Independent Test**: Can be fully tested by setting user time format to 12-hour, triggering extended fast prompt, and verifying times show as "6:00 PM" instead of "18:00". Then change to 24-hour format and verify times show as "18:00".

**Acceptance Scenarios**:

1. **Given** my time format setting is 12-hour, **When** an extended fast prompt appears showing Oct 22 at 18:00, **Then** the time is displayed as "22 Oct at 6:00 PM"

2. **Given** my time format setting is 24-hour, **When** an extended fast prompt appears showing Oct 22 at 18:00, **Then** the time is displayed as "22 Oct at 18:00"

3. **Given** I change my time format preference from 12-hour to 24-hour, **When** I trigger a new extended fast prompt, **Then** the date/time range reflects the updated format

---

### Edge Cases

- Midnight-spanning ranges: Always show both full dates even for consecutive days (e.g., "22 Oct at 23:30 → 23 Oct at 01:00") to maintain clarity
- Timezone handling: Display times exactly as user entered them without timezone conversion (user sees what they input)
- Missing meal time data: Extended fast cannot be calculated or displayed if previous entry's lastMealTime or next entry's firstMealTime is missing (no prompt shown in this case)
- Hour formatting: Single-digit hours displayed without leading zero (e.g., 9:00, not 09:00) for natural readability
- Date localization: Use consistent "22 Oct" (day-month) format for all users regardless of locale

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display both date and time for the start of an extended fast period (previous entry's last meal date/time as entered by user)
- **FR-002**: System MUST display both date and time for the end of an extended fast period (current/next entry's first meal date/time as entered by user)
- **FR-003**: System MUST display date/time range in a clear "start → end" format alongside the duration
- **FR-004**: System MUST format times according to user's time format preference (12-hour or 24-hour), with single-digit hours displayed without leading zero (e.g., 9:00 not 09:00)
- **FR-005**: System MUST format dates consistently in "Day Month" format (e.g., "22 Oct") for all users regardless of locale
- **FR-006**: System MUST always show both full dates in date/time ranges, even when spanning consecutive days (e.g., "22 Oct at 23:30 → 23 Oct at 01:00")
- **FR-007**: System MUST display correct date/time ranges for "from-previous" extended fast prompts (previous entry's last meal → current entry's first meal)
- **FR-008**: System MUST display correct date/time ranges for "to-next" extended fast prompts (current entry's last meal → next entry's first meal)
- **FR-009**: System MUST show different date/time ranges when multiple sequential extended fast prompts appear
- **FR-010**: System MUST preserve existing extended fast detection logic (>24 hours threshold)
- **FR-011**: System MUST preserve existing confirmation button functionality (confirm/deny behavior unchanged)
- **FR-012**: Extended fast prompts are only shown when complete meal time data exists (previous entry has lastMealTime and current/next entry has firstMealTime); no fallback display needed as extended fast cannot be calculated without this data

### Key Entities *(include if feature involves data)*

- **Extended Fast Prompt**: UI component displaying extended fast confirmation question with duration and date/time range, shown when gap between entries exceeds 24 hours
- **Gap Info**: Data structure containing previous/next entry details (dates, meal times), fasting duration (hours, minutes, formatted), and flags for extended fast direction (from-previous/to-next/both)
- **User Settings**: Contains user's time format preference (12h or 24h) used for formatting displayed times

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view exact start and end date/time for every extended fast prompt within 1 second of form submission
- **SC-002**: 100% of extended fast prompts display date/time ranges when entry data is complete (previous/next entry has required meal times)
- **SC-003**: Date/time format matches user's configured time preference in 100% of cases
- **SC-004**: Users can distinguish between two sequential extended fast periods by viewing different date/time ranges for each prompt
- **SC-005**: Zero regressions in existing extended fast confirmation functionality (all Feature 013 test scenarios continue to pass)
- **SC-006**: Date/time display renders correctly on mobile devices (320px width) without text overflow or layout breaking

