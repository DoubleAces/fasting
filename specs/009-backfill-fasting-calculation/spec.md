# Feature Specification: Backfill Fasting Duration Calculation

**Feature Branch**: `009-backfill-fasting-calculation`  
**Created**: October 23, 2025  
**Status**: Draft  
**Input**: User description: "I need to fix a bug in the application. When an entry is created for a previous day, the fasting number will not be calculated. Example: I entered my information for today, it was the first entry. Then I entered information for yesterday - data was entered, but based on the data - my todays entry should now also have fasting time and what not"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backfill Fasting Calculation When Adding Past Entry (Priority: P1)

A user logs today's entry first (showing no fasting duration because there's no previous day), then later adds yesterday's entry. The system should automatically recalculate today's fasting duration based on yesterday's last meal time.

**Why this priority**: This is a critical bug fix. Users naturally enter data out of order (e.g., forgetting yesterday's entry), and the system should intelligently update calculations when missing data is filled in. Without this, fasting data is inaccurate and misleading.

**Independent Test**: Can be fully tested by creating an entry for Day 2 (which shows no fasting), then creating an entry for Day 1, and verifying that Day 2's entry now displays the correct fasting duration calculated from Day 1's last meal to Day 2's first meal.

**Acceptance Scenarios**:

1. **Given** a user has created an entry for October 18th (today) with first meal at 12:00 PM, **When** they create an entry for October 17th (yesterday) with last meal at 8:00 PM, **Then** the system automatically updates October 18th's entry to show 16 hours of fasting
2. **Given** a user has entries for Day 1 and Day 3 but not Day 2, **When** they create an entry for Day 2, **Then** the system calculates Day 2's fasting from Day 1's last meal AND updates Day 3's fasting from Day 2's last meal
3. **Given** a user has an entry for today with fasting duration null, **When** they add yesterday's entry without a last meal time, **Then** today's fasting duration remains null (cannot calculate)
4. **Given** a user has entries for multiple consecutive days, **When** they add an earlier entry that becomes the new "previous day" for an existing entry, **Then** all affected subsequent entries have their fasting durations recalculated

---

### User Story 2 - Update Future Entries When Editing Past Entry (Priority: P2)

A user edits the last meal time of a past entry. The system should recalculate the fasting duration for all subsequent entries that depend on this data.

**Why this priority**: While less frequent than adding missing entries, editing historical data should maintain accuracy. This ensures data integrity when users correct mistakes.

**Independent Test**: Can be fully tested by creating two consecutive day entries with calculated fasting, then editing the first day's last meal time, and verifying the second day's fasting duration updates accordingly.

**Acceptance Scenarios**:

1. **Given** a user has entries for October 17th (last meal 8:00 PM) and October 18th (first meal 12:00 PM, fasting: 16h), **When** they edit October 17th's last meal to 6:00 PM, **Then** October 18th's fasting duration updates to 18 hours
2. **Given** a user edits a middle entry in a multi-day sequence, **When** the last meal time changes, **Then** only the immediately following day's fasting duration is recalculated (cascade stops after one day)
3. **Given** a user edits yesterday's entry and removes the last meal time, **When** the update is saved, **Then** today's fasting duration is set to null

---

### Edge Cases

- What happens when a user creates multiple past entries in random order (e.g., Day 5, then Day 2, then Day 4)?
- How does the system handle updating fasting calculations when entries span multiple days (multi-day fasting)?
- What if a user adds an entry for 3 days ago when there are already entries for the last 2 days?
- Should the system recalculate ALL future entries or just the immediate next entry?
- What happens if there's a gap in entries (e.g., Day 1 and Day 5 exist, but Days 2-4 don't)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST recalculate fasting duration for the immediate next day's entry when a new entry is created for a previous date
- **FR-002**: System MUST identify all entries that occur chronologically after the newly created entry (by date comparison)
- **FR-003**: System MUST recalculate fasting duration using the new entry's last meal time and the next entry's first meal time
- **FR-004**: System MUST handle cases where the next entry already has a fasting duration (overwrite with correct calculation)
- **FR-005**: System MUST set fasting duration to null if required data is missing (e.g., no last meal time on previous day)
- **FR-006**: System MUST apply the same recalculation logic when an existing entry's last meal time is updated
- **FR-007**: System MUST only recalculate the immediate next day's entry (not cascade through all future entries beyond the next one)
- **FR-008**: System MUST use the existing `calculateFastingDuration()` utility function for consistency
- **FR-009**: System MUST persist the updated fasting duration to the database immediately
- **FR-010**: System MUST handle the case where multiple entries exist after the created/edited entry (find the immediate next one by date)

### Key Entities

- **Entry**: Represents a daily fasting log with date, meal times, and calculated fasting duration. The fasting duration field is dependent on the previous entry's last meal time and is automatically calculated and updated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a user adds an entry for a previous date, any existing future entries display updated fasting durations within 1 second of saving
- **SC-002**: 100% of fasting duration calculations remain accurate regardless of the order in which entries are created
- **SC-003**: Users can enter data in any chronological order (past to present, present to past, or random) and still see correct fasting calculations
- **SC-004**: The system correctly handles entry sequences with gaps (missing days) without showing incorrect fasting data

## Assumptions *(optional)*

- The existing `calculateFastingDuration()` function works correctly and will be reused
- The cascade update only affects the immediate next entry (one-level cascade, not multi-level)
- Entries are always created for the authenticated user (userId is always available)
- The date field on entries is already indexed for efficient querying
- The existing UPDATE entry logic already handles recalculating next day's fasting when last meal time changes

## Dependencies *(optional)*

- Existing Entry model and API routes (`POST /api/entries`, `PUT /api/entries/[id]`)
- Existing `calculateFastingDuration()` utility function
- MongoDB queries to find the "next entry" by date

## Out of Scope *(optional)*

- Multi-level cascade updates (e.g., updating 10 future entries when editing an old entry)
- Batch recalculation of all existing entries (one-time data migration)
- Real-time UI updates without page refresh (client-side reactivity)
- Notification to user that fasting durations were recalculated
- Audit trail or history of fasting duration changes
