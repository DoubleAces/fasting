# Feature Specification: Improve Entry Form Date and Time Inputs# Feature Specification: [FEATURE NAME]



**Feature Branch**: `018-improve-form-inputs`  **Feature Branch**: `[###-feature-name]`  

**Created**: October 27, 2025  **Created**: [DATE]  

**Status**: Draft  **Status**: Draft  

**Input**: User description: "Replace entry form date fields with single date picker calendar and improve time selectors. Currently the add/edit entry forms use 3 separate dropdowns (day/month/year) for date selection - replace with a single date input field with calendar picker. Add entry form should default date to today. For time fields (firstMealTime/lastMealTime), replace the current 2 dropdown selectors with better time picker inputs. Apply changes to both add entry and edit entry forms."**Input**: User description: "$ARGUMENTS"



## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Entry with Modern Date Picker (Priority: P1)

A user wants to log a new fasting entry for today and needs to quickly select the date without manually entering day/month/year in three separate fields.

**Why this priority**: This is the most common user action in the application. Every user must create entries, and defaulting to today's date with a calendar picker will significantly reduce friction in the primary workflow.

**Independent Test**: Can be fully tested by opening the create entry form and verifying the date field shows today's date by default and displays a calendar picker when clicked. Delivers immediate value by simplifying the most frequent user action.

**Acceptance Scenarios**:

1. **Given** user clicks "Create New Entry" button, **When** the form opens, **Then** the date field displays today's date by default

2. **Given** user clicks on the date field, **When** the calendar picker opens, **Then** today's date is highlighted

3. **Given** user selects a date from the calendar, **When** a date is clicked, **Then** the selected date populates the field and calendar closes

4. **Given** user needs to enter a past date, **When** they navigate to previous months in the calendar, **Then** they can select any past date up to today

5. **Given** user attempts to select a future date, **When** they click on a future date in the calendar, **Then** the date is not selectable (disabled state)

---

### User Story 2 - Edit Entry with Pre-filled Date Picker (Priority: P2)

A user wants to edit an existing entry and needs to see the entry's date pre-populated in the date picker, with the ability to change it if needed.

**Why this priority**: Editing entries is less frequent than creating them, but the date picker must work correctly in edit mode to maintain data integrity and user confidence.

**Independent Test**: Can be fully tested by clicking edit on an existing entry, verifying the date field shows the entry's date, and successfully changing it to a different date. Delivers value by ensuring users can correct mistakes without confusion.

**Acceptance Scenarios**:

1. **Given** user clicks edit on an entry from March 15, 2024, **When** the edit form opens, **Then** the date field displays "March 15, 2024"
2. **Given** user clicks on the pre-filled date field, **When** the calendar opens, **Then** March 15, 2024 is highlighted
3. **Given** user wants to change the date, **When** they select a different date from the calendar, **Then** the form updates with the new date
4. **Given** user saves the edited entry, **When** the form submits, **Then** the entry updates with the new date

---

### User Story 3 - Select Time with Improved Time Picker (Priority: P2)

A user wants to log their first and last meal times and needs an easier, more intuitive way to select times than scrolling through hour and minute dropdowns.

**Why this priority**: Time entry is required for every entry and affects calculated fasting durations. A better time picker improves data accuracy and user satisfaction. Ranked P2 because current dropdowns work but are not optimal.

**Independent Test**: Can be fully tested by entering a new entry and using the improved time picker to select meal times. Delivers value by making time selection faster and less error-prone.

**Acceptance Scenarios**:

1. **Given** user needs to enter first meal time, **When** they click the first meal time field, **Then** a time picker interface appears
2. **Given** user selects a time from the picker, **When** they confirm the selection, **Then** the time displays in the field formatted according to user's time format preference (12h/24h)
3. **Given** user has 12-hour format preference, **When** they select a time, **Then** the picker shows AM/PM options
4. **Given** user has 24-hour format preference, **When** they select a time, **Then** the picker shows hours 00-23
5. **Given** user enters an invalid time combination, **When** they attempt to submit, **Then** form validation prevents submission with clear error message

---

### User Story 3 - Select Time with Improved Time Picker (Priority: P2)

A user wants to log their first and last meal times and needs an easier, more intuitive way to select times than scrolling through hour and minute dropdowns.

**Why this priority**: Time entry is a core feature used every day. Current dropdown approach is cumbersome. HTML5 time inputs provide native, accessible pickers that work across devices.

**Independent Test**: Can be fully tested by clicking the first/last meal time fields and selecting different times. Delivers value by reducing time selection from ~10 seconds to ~3 seconds.

**Acceptance Scenarios**:

1. **Given** user needs to enter first meal time, **When** they click the first meal time field, **Then** a time picker interface appears

2. **Given** user selects a time from the picker, **When** they confirm the selection, **Then** the time displays in the field formatted according to user's time format preference (12h/24h)

3. **Given** user has 12-hour format preference, **When** they select a time, **Then** the picker shows AM/PM options

4. **Given** user has 24-hour format preference, **When** they select a time, **Then** the picker shows hours 00-23

5. **Given** user enters an invalid time combination, **When** they attempt to submit, **Then** form validation prevents submission with clear error message

---

### User Story 4 - Mobile-Friendly Date and Time Selection (Priority: P3)

A user on a mobile device wants to log entries with date and time pickers that work well on touch screens.

**Why this priority**: Many users may access the app on mobile devices. Mobile-friendly inputs improve accessibility and user experience. Ranked P3 because desktop experience is primary but mobile should not be broken.

**Independent Test**: Can be fully tested on mobile device or browser dev tools by creating an entry and verifying date/time pickers are touch-friendly. Delivers value by ensuring the app works well across devices.

**Acceptance Scenarios**:

1. **Given** user is on a mobile device, **When** they tap the date field, **Then** the calendar picker is large enough for easy touch interaction

2. **Given** user is on a mobile device, **When** they tap the time field, **Then** the time picker is optimized for touch input

3. **Given** user is on a mobile device, **When** they interact with date/time pickers, **Then** the interface does not require precise clicking or scrolling

---

## Requirements *(mandatory)*

### Edge Cases


4. **Given** user is on a mobile device, **When** they select a date or time, **Then** the picker closes and updates the field without requiring additional taps- How does system handle [error scenario]?



---

### Edge Cases

- What happens when user manually types an invalid date format in the date field?
- How does the system handle leap years and month boundaries (e.g., February 29, days in month)?
- What happens if user's browser does not support modern date/time input types?
- How does the date picker handle different locales and date format preferences?
- What happens when user has JavaScript disabled?
- How does the time picker handle the transition at midnight (23:59 to 00:00)?
- What happens if user selects December 31 and tries to navigate to next month (should not allow future dates)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace the three separate date input fields (day/month/year) with a single date input field
- **FR-002**: Date input field MUST display a calendar picker when clicked or focused
- **FR-003**: Calendar picker MUST highlight today's date by default
- **FR-004**: Create entry form MUST default the date field to today's date when opened
- **FR-005**: Edit entry form MUST pre-populate the date field with the entry's existing date
- **FR-006**: Calendar picker MUST disable future dates (user cannot select dates after today)
- **FR-007**: Calendar picker MUST allow selection of any past date
- **FR-008**: Selected date MUST be displayed in a user-friendly format (e.g., "March 15, 2024" or "15/03/2024")
- **FR-009**: Date field MUST store dates in ISO format (YYYY-MM-DD) for API compatibility
- **FR-010**: System MUST replace the two time dropdown selectors (hour/minute) with improved time picker inputs
- **FR-011**: Time picker MUST support both 12-hour (AM/PM) and 24-hour formats based on user settings
- **FR-012**: Time picker MUST return time in HH:mm format for API storage
- **FR-013**: Time picker MUST validate that selected time is in valid range (00:00-23:59)
- **FR-014**: First meal time and last meal time fields MUST each have their own time picker
- **FR-015**: Form validation MUST ensure last meal time is after first meal time on the same day
- **FR-016**: Date and time pickers MUST work on both desktop and mobile devices
- **FR-017**: Date and time pickers MUST be accessible via keyboard navigation
- **FR-018**: Date and time pickers MUST integrate with existing form validation and error display
- **FR-019**: All existing form functionality (submit, cancel, extended fast detection) MUST continue to work unchanged
- **FR-020**: Changes MUST apply to both create entry form and edit entry form

### Key Entities

- **Entry**: Represents a daily fasting log
  - `date`: Date of the entry (ISO format YYYY-MM-DD)
  - `firstMealTime`: Time of first meal (HH:mm format)
  - `lastMealTime`: Time of last meal (HH:mm format)
  - Other fields remain unchanged

- **User Settings**: Contains user preferences
  - `timeFormat`: User's preferred time display format ('12h' or '24h')
  - `measurementSystem`: User's preferred measurement system ('metric' or 'imperial')

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select a date from the calendar picker in under 5 seconds (compared to current ~10 seconds for three-field input)
- **SC-002**: Create entry form displays with today's date pre-filled, requiring zero user action for current-day entries
- **SC-003**: 95% of users successfully create an entry on first attempt without date/time input errors
- **SC-004**: Date and time pickers function correctly on both desktop and mobile devices (verified through cross-device testing)
- **SC-005**: Form submission time reduces by 30% due to improved input efficiency
- **SC-006**: Zero breaking changes to existing form functionality (all current features continue to work)
- **SC-007**: User satisfaction with date/time input increases (measurable through user feedback or testing)
- **SC-008**: Date picker correctly prevents selection of future dates in 100% of test cases
- **SC-009**: Time picker correctly handles AM/PM conversion for users with 12-hour format preference
- **SC-010**: All date and time inputs are accessible via keyboard (no mouse required for power users)

## Assumptions

- Users prefer visual calendar pickers over manual date entry
- The application already has user settings for time format preferences (12h/24h)
- The majority of entries are for the current day, justifying the "today" default
- Modern browsers with HTML5 input type support are the primary target
- The existing validation logic for date ranges and time comparisons will continue to work with new input components
- The application's design system and styling will adapt to the new input components without major redesign

## Dependencies

- Existing `EntryForm` component structure and validation logic
- User settings API for retrieving time format preferences
- Entry data model (date and time field formats)
- Form validation schema (Joi validation)
- Existing accessibility features and keyboard navigation patterns

## Out of Scope

- Changing the underlying data storage format for dates and times
- Adding timezone support or time zone selection
- Implementing date range selection (selecting multiple dates at once)
- Adding recurring entry templates or scheduling
- Modifying the entry data model beyond date and time fields
- Implementing custom calendar themes or extensive visual customization
- Adding time zone awareness or daylight saving time handling beyond what browsers provide natively
- Creating custom date/time picker libraries (should use established, accessible libraries if needed)
