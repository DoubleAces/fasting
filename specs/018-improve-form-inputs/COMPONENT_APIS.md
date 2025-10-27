# Component API Documentation (Pre-Refactor)

**Purpose**: Reference for maintaining backward compatibility during HTML5 input refactor  
**Date**: October 27, 2025

## DateInput Component API

**Location**: `src/components/molecules/DateInput.js`

### Props

```javascript
{
  id: string,              // Input ID for accessibility (REQUIRED)
  label: string,           // Label text (REQUIRED)
  value: string,           // ISO date string (yyyy-mm-dd) (REQUIRED)
  onChange: Function,      // Change handler, receives ISO date string (REQUIRED)
  onBlur?: Function,       // Blur handler (OPTIONAL)
  error?: string,          // Error message to display (OPTIONAL)
  required?: boolean,      // Whether the field is required (default: false)
  max?: string,            // Maximum date in ISO format (yyyy-mm-dd) (OPTIONAL)
}
```

### Current Implementation

- **UI**: Three separate text inputs (day/month/year) with `/` separators
- **Input**: Accepts ISO date string (yyyy-mm-dd)
- **Output**: Calls onChange with ISO date string (yyyy-mm-dd)
- **Validation**: Numeric only, max lengths (2/2/4), max date enforcement
- **onChange Behavior**: Only called when complete date exists OR all fields empty
- **onBlur Behavior**: Only triggered when focus leaves entire date input group

### Backward Compatibility Requirements

✅ **MUST MAINTAIN**:
- Accept ISO date string (yyyy-mm-dd) in `value` prop
- Call `onChange` with ISO date string (yyyy-mm-dd)
- Support `max` prop for date limits
- Support `error`, `required`, `onBlur` props
- Maintain accessibility (aria-invalid, aria-describedby)

---

## TimeInput Component API

**Location**: `src/components/molecules/TimeInput.js`

### Props

```javascript
{
  id: string,              // Input element id (REQUIRED)
  label: string,           // Label text (REQUIRED)
  value?: string,          // Current time value in HH:mm format (24-hour) (default: '')
  format?: string,         // Display format: '12h' | '24h' (default: '24h')
  required?: boolean,      // Whether input is required (default: false)
  error?: string,          // External error message (default: '')
  onChange?: Function,     // Change handler, receives HH:mm string
  onBlur?: Function,       // Blur event handler
}
```

### Current Implementation

- **UI**: Three separate dropdowns (hour/minute/period for 12h, hour/minute for 24h)
- **Input**: Accepts HH:mm string in 24-hour format
- **Output**: Always calls onChange with HH:mm string in 24-hour format
- **Format Prop**: Advisory only for display, storage is always 24h
- **Validation**: Ensures valid hours (0-23) and minutes (0-59)
- **onChange Behavior**: Only called when both hour and minute selected OR both empty
- **onBlur Behavior**: Only triggered when focus leaves entire time input group

### Backward Compatibility Requirements

✅ **MUST MAINTAIN**:
- Accept HH:mm string (24-hour) in `value` prop
- Call `onChange` with HH:mm string (24-hour format) regardless of display
- Support `format` prop (even if browser overrides)
- Support `error`, `required`, `onBlur` props
- Maintain accessibility (aria-invalid, aria-describedby)

---

## EntryForm Component Usage

**Location**: `src/components/organisms/EntryForm.js`

### DateInput Usage

```javascript
<DateInput
  id="entry-date"
  label="Date"
  value={formData.date}
  onChange={handleChange('date')}
  onBlur={handleBlur('date')}
  error={errors.date}
  required
  max={new Date().toISOString().split('T')[0]}
/>
```

**Requirements**:
- **Create Mode**: Must default `formData.date` to today's date (ISO format)
- **Edit Mode**: Must pre-fill `formData.date` with entry's date
- **Max Validation**: Must prevent future date selection

### TimeInput Usage

(To be documented after reviewing TimeInput usage in EntryForm)

---

## Refactor Plan

### DateInput Refactor

**Before**: Three separate `<Input>` components (day/month/year)
**After**: Single `<input type="date">` component

**Key Changes**:
1. Remove day/month/year state management
2. Remove parseISODate and toISODate functions
3. Remove multi-field blur coordination
4. Use native HTML5 date input with max attribute
5. Simplify onChange handler (direct value pass-through)

**Preserved**:
- Same props interface
- Same ISO date format input/output
- Same accessibility attributes
- Same error handling

### TimeInput Refactor

**Before**: Three separate `<Select>` components (hour/minute/period)
**After**: Single `<input type="time">` component

**Key Changes**:
1. Remove hour/minute/period state management
2. Remove parseTime and toTimeString functions
3. Remove multi-select blur coordination
4. Use native HTML5 time input
5. Simplify onChange handler (direct value pass-through)

**Preserved**:
- Same props interface
- Same HH:mm format output (24-hour)
- Same accessibility attributes
- Same error handling
- Format prop remains (advisory, may be browser-overridden)

---

## Test Coverage Requirements

### DateInput Tests

**Existing Tests** (to be updated):
- ✅ Rendering (label, input fields, placeholders)
- ✅ ISO date parsing
- ✅ User input handling
- ✅ onChange callback with ISO string
- ✅ Input validation
- ✅ onBlur callback
- ✅ Error display
- ✅ Accessibility
- ✅ Value updates

**New Tests** (to be added):
- ✅ Single input type="date" rendering
- ✅ Native browser picker interaction
- ✅ Max date enforcement (disabled state)
- ✅ Pre-filled value in edit mode
- ✅ Calendar navigation

### TimeInput Tests

**Existing Tests** (to be updated):
- Similar structure to DateInput tests

**New Tests** (to be added):
- ✅ Single input type="time" rendering
- ✅ Native browser picker interaction
- ✅ HH:mm format validation
- ✅ Time range validation
- ✅ 12h/24h format handling

---

## Success Criteria

✅ **All 61 existing tests must still pass** (with updates for new HTML5 inputs)
✅ **All new tests must pass**
✅ **Zero breaking changes to EntryForm**
✅ **Backward compatible props interface**
✅ **Same data format (ISO dates, HH:mm times)**
