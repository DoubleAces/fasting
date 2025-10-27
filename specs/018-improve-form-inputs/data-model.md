# Data Model: Improve Entry Form Date and Time Inputs

**Feature**: 018-improve-form-inputs  
**Date**: October 27, 2025  
**Status**: Complete

## Overview

This document defines the component API contracts, data flow, and state management for the improved date and time input components. The core change is replacing custom multi-field inputs with HTML5 native inputs while maintaining identical external APIs for backward compatibility.

---

## Component API Changes

### DateInput Molecule (Before → After)

#### Before (Current - 3 Text Inputs)

```jsx
/**
 * DateInput with 3 separate text fields (day/month/year)
 */
<DateInput
  id="entry-date"
  label="Date"
  value="2024-03-15"        // ISO format YYYY-MM-DD
  onChange={(isoDate) => {}} // Called with ISO string when complete date entered
  onBlur={() => {}}
  error="Date is required"
  required={true}
  max="2025-10-27"          // Max date (defaults to today)
/>

// Internal: 3 controlled inputs (day, month, year)
// Complexity: ~200 lines
```

#### After (New - Single HTML5 Input)

```jsx
/**
 * DateInput with single HTML5 date input + calendar picker
 */
<DateInput
  id="entry-date"
  label="Date"
  value="2024-03-15"        // ISO format YYYY-MM-DD (UNCHANGED)
  onChange={(isoDate) => {}} // Called with ISO string (UNCHANGED)
  onBlur={() => {}}          // (UNCHANGED)
  error="Date is required"   // (UNCHANGED)
  required={true}            // (UNCHANGED)
  max="2025-10-27"          // Max date (UNCHANGED)
/>

// Internal: 1 controlled input type="date"
// Complexity: ~80 lines
```

**API Compatibility**: ✅ **100% backward compatible** - no breaking changes to external API

#### Props Interface

| Prop | Type | Required | Default | Description | Change |
|------|------|----------|---------|-------------|--------|
| `id` | string | Yes | - | Input ID for accessibility | No change |
| `label` | string | Yes | - | Label text | No change |
| `value` | string | Yes | - | ISO date (YYYY-MM-DD) or empty | No change |
| `onChange` | function | Yes | - | Callback with ISO date string | No change |
| `onBlur` | function | No | undefined | Blur event handler | No change |
| `error` | string | No | undefined | Error message | No change |
| `required` | boolean | No | false | Required indicator | No change |
| `max` | string | No | today | Max selectable date (ISO) | No change |

---

### TimeInput Molecule (Before → After)

#### Before (Current - 3 Dropdowns)

```jsx
/**
 * TimeInput with hour/minute/period dropdowns
 */
<TimeInput
  id="first-meal"
  label="First Meal Time"
  value="14:30"              // HH:mm format (24-hour)
  onChange={(time) => {}}    // Called with HH:mm string
  onBlur={() => {}}
  error="Required"
  required={true}
  format="12h"               // Display format: '12h' | '24h'
/>

// Internal: 3 select dropdowns (hour, minute, AM/PM)
// Complexity: ~230 lines
```

#### After (New - Single HTML5 Input)

```jsx
/**
 * TimeInput with single HTML5 time input + picker
 */
<TimeInput
  id="first-meal"
  label="First Meal Time"
  value="14:30"              // HH:mm format (UNCHANGED)
  onChange={(time) => {}}    // Called with HH:mm string (UNCHANGED)
  onBlur={() => {}}          // (UNCHANGED)
  error="Required"           // (UNCHANGED)
  required={true}            // (UNCHANGED)
  format="12h"               // Advisory only (browser may override)
/>

// Internal: 1 controlled input type="time"
// Complexity: ~90 lines
```

**API Compatibility**: ✅ **100% backward compatible** - no breaking changes to external API

**Note on `format` prop**: In new implementation, `format` prop is advisory. Browser displays time based on user's OS locale settings. Value is always returned in 24-hour HH:mm format regardless of display.

#### Props Interface

| Prop | Type | Required | Default | Description | Change |
|------|------|----------|---------|-------------|--------|
| `id` | string | Yes | - | Input ID for accessibility | No change |
| `label` | string | Yes | - | Label text | No change |
| `value` | string | Yes | - | Time in HH:mm (24-hour) | No change |
| `onChange` | function | Yes | - | Callback with HH:mm string | No change |
| `onBlur` | function | No | undefined | Blur event handler | No change |
| `error` | string | No | undefined | Error message | No change |
| `required` | boolean | No | false | Required indicator | No change |
| `format` | string | No | '24h' | Display preference (advisory) | **Behavior change** |

---

### EntryForm Organism Changes

#### API (No Changes)

```jsx
<EntryForm
  entry={entry}              // Existing entry for edit mode (UNCHANGED)
  settings={settings}        // User settings (UNCHANGED)
  onSuccess={handleSuccess}  // Success callback (UNCHANGED)
  onCancel={handleCancel}    // Cancel callback (UNCHANGED)
/>
```

#### Internal State Changes

**Before**:
```javascript
const [formData, setFormData] = useState({
  date: entry?.date || '',  // Empty string in create mode
  firstMealTime: entry?.firstMealTime || '',
  lastMealTime: entry?.lastMealTime || '',
  // ... other fields
});
```

**After**:
```javascript
const [formData, setFormData] = useState({
  date: entry?.date || getTodayISO(),  // Defaults to today in create mode
  firstMealTime: entry?.firstMealTime || '',
  lastMealTime: entry?.lastMealTime || '',
  // ... other fields
});

// Helper function
const getTodayISO = () => new Date().toISOString().split('T')[0];
```

**Change**: Date field now defaults to today's date when creating new entry (not editing).

---

## Data Flow

### Create Entry Flow (with Today Default)

```
1. User clicks "Create New Entry" button
   ↓
2. EntryForm mounts in create mode (no entry prop)
   ↓
3. Initial state calculated:
   - date: getTodayISO() → "2025-10-27"
   - firstMealTime: "" (empty)
   - lastMealTime: "" (empty)
   ↓
4. DateInput renders with value="2025-10-27"
   - HTML5 input shows today's date pre-selected
   - User clicks input → calendar opens with today highlighted
   ↓
5. User selects different date (or keeps today)
   - Browser emits onChange with ISO string
   - EntryForm updates formData.date
   ↓
6. User selects meal times
   - TimeInput onChange emits HH:mm strings
   - EntryForm updates formData.firstMealTime / lastMealTime
   ↓
7. User clicks "Save Entry"
   - Validation runs (existing logic)
   - API call with formData (ISO date, HH:mm times)
   ↓
8. Success: onSuccess callback, form resets
```

### Edit Entry Flow

```
1. User clicks "Edit" on existing entry
   ↓
2. EntryForm mounts in edit mode (entry prop provided)
   ↓
3. Initial state from entry:
   - date: entry.date → "2024-03-15"
   - firstMealTime: entry.firstMealTime → "12:00"
   - lastMealTime: entry.lastMealTime → "20:00"
   ↓
4. DateInput renders with value="2024-03-15"
   - HTML5 input shows March 15, 2024
   - User clicks → calendar opens with March 15 highlighted
   ↓
5. User modifies date/times as needed
   - onChange handlers update formData
   ↓
6. User clicks "Save Entry"
   - Validation runs
   - API call (PUT) with updated formData
   ↓
7. Success: onSuccess callback, form closes
```

### Date Input Data Flow

```
Browser                DateInput              EntryForm              API
  │                       │                      │                    │
  │  User clicks input    │                      │                    │
  │─────────────────────→│                      │                    │
  │                       │                      │                    │
  │  Calendar opens       │                      │                    │
  │←─────────────────────│                      │                    │
  │                       │                      │                    │
  │  User selects date    │                      │                    │
  │─────────────────────→│                      │                    │
  │                       │                      │                    │
  │  Emits "2024-03-15"   │                      │                    │
  │                       │  onChange("2024-03-15")                   │
  │                       │─────────────────────→│                    │
  │                       │                      │                    │
  │                       │                      │  Updates state     │
  │                       │                      │  formData.date     │
  │                       │                      │                    │
  │                       │                      │  Validation        │
  │                       │                      │  (future check)    │
  │                       │                      │                    │
  │                       │                      │  User submits form │
  │                       │                      │───────────────────→│
  │                       │                      │                    │
  │                       │                      │  POST/PUT entry    │
  │                       │                      │  { date: "2024-03-15" }
```

### Time Input Data Flow

```
Browser                TimeInput              EntryForm              API
  │                       │                      │                    │
  │  User clicks input    │                      │                    │
  │─────────────────────→│                      │                    │
  │                       │                      │                    │
  │  Time picker opens    │                      │                    │
  │←─────────────────────│                      │                    │
  │                       │                      │                    │
  │  User selects 2:30 PM │                      │                    │
  │─────────────────────→│                      │                    │
  │                       │                      │                    │
  │  Emits "14:30"        │                      │                    │
  │  (24-hour format)     │                      │                    │
  │                       │  onChange("14:30")   │                    │
  │                       │─────────────────────→│                    │
  │                       │                      │                    │
  │                       │                      │  Updates state     │
  │                       │                      │  formData.firstMealTime
  │                       │                      │                    │
  │                       │                      │  Validation        │
  │                       │                      │  (first < last)    │
  │                       │                      │                    │
  │                       │                      │  User submits form │
  │                       │                      │───────────────────→│
  │                       │                      │                    │
  │                       │                      │  POST/PUT entry    │
  │                       │                      │  { firstMealTime: "14:30" }
```

---

## State Management

### Component-Level State

#### DateInput
```javascript
// No internal state needed (fully controlled)
const DateInput = ({ id, label, value, onChange, error, required, max }) => {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <input
        type="date"
        id={id}
        value={value}           // Controlled from parent
        onChange={(e) => onChange(e.target.value)}
        max={max || today}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
    </div>
  );
};
```

#### TimeInput
```javascript
// No internal state needed (fully controlled)
const TimeInput = ({ id, label, value, onChange, error, required, format }) => {
  return (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <input
        type="time"
        id={id}
        value={value}           // Controlled from parent
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage>}
    </div>
  );
};
```

**Simplification**: Previous implementations had internal state for day/month/year (DateInput) and hour/minute/period (TimeInput). New implementations are stateless controlled components.

### Form-Level State (EntryForm)

```javascript
const EntryForm = ({ entry, settings, onSuccess, onCancel }) => {
  const isEditMode = Boolean(entry);
  
  // Helper for today's date
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  
  // Form state
  const [formData, setFormData] = useState({
    date: isEditMode ? entry.date : getTodayISO(),  // TODAY DEFAULT HERE
    firstMealTime: entry?.firstMealTime || '',
    lastMealTime: entry?.lastMealTime || '',
    hoursOfSleep: entry?.hoursOfSleep || '',
    morningWeight: entry?.morningWeight || '',
    hungerLevel: entry?.hungerLevel || '',
    energyLevel: entry?.energyLevel || '',
    wellBeing: entry?.wellBeing || '',
    foodNotes: entry?.foodNotes || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle field changes
  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Validation (existing logic, no changes)
  const validateForm = () => {
    const newErrors = {};
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }
    
    // Time validation (existing logic)
    if (!formData.firstMealTime) {
      newErrors.firstMealTime = 'First meal time is required';
    }
    if (!formData.lastMealTime) {
      newErrors.lastMealTime = 'Last meal time is required';
    }
    
    // Validate last meal after first meal
    if (formData.firstMealTime && formData.lastMealTime) {
      const [firstHour, firstMin] = formData.firstMealTime.split(':').map(Number);
      const [lastHour, lastMin] = formData.lastMealTime.split(':').map(Number);
      
      const firstMinutes = firstHour * 60 + firstMin;
      const lastMinutes = lastHour * 60 + lastMin;
      
      if (lastMinutes <= firstMinutes) {
        newErrors.lastMealTime = 'Last meal time must be after first meal time';
      }
    }
    
    // ... rest of validation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Rest of form logic (submit, etc.) - no changes
};
```

---

## Validation Rules (Unchanged)

### Date Validation

| Rule | Check | Error Message | Implementation |
|------|-------|---------------|----------------|
| Required | `!formData.date` | "Date is required" | Client validation |
| Format | ISO YYYY-MM-DD | N/A | Browser enforces |
| Future date | `date > today` | "Date cannot be in the future" | Client + `max` attribute |
| Valid date | Exists in calendar | N/A | Browser enforces |

### Time Validation

| Rule | Check | Error Message | Implementation |
|------|-------|---------------|----------------|
| Required | `!formData.firstMealTime` | "First meal time is required" | Client validation |
| Format | HH:mm (00:00-23:59) | N/A | Browser enforces |
| Last > First | Time comparison | "Last meal must be after first meal" | Client validation |
| Valid time | Valid hours/minutes | N/A | Browser enforces |

**No changes to validation logic** - only difference is browser now enforces format/validity before value reaches our code.

---

## Database Schema (Unchanged)

```javascript
// Entry model (Mongoose schema)
const entrySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  date: {
    type: Date,                    // Stored as Date object
    required: true,
    // API sends/receives YYYY-MM-DD string, Mongoose converts
  },
  firstMealTime: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'First meal time must be in HH:mm format',
    },
  },
  lastMealTime: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Last meal time must be in HH:mm format',
    },
  },
  // ... other fields unchanged
});
```

**No database changes required**. Formats remain identical:
- Date: ISO string converted to Date by Mongoose
- Times: HH:mm strings (24-hour format)

---

## API Contracts (Unchanged)

### POST /api/entries (Create)

**Request Body**:
```json
{
  "date": "2025-10-27",        // ISO format YYYY-MM-DD
  "firstMealTime": "12:00",    // HH:mm 24-hour
  "lastMealTime": "20:00",     // HH:mm 24-hour
  "hoursOfSleep": 8,
  "morningWeight": 75.5,
  "hungerLevel": "Medium",
  "energyLevel": "High Energy",
  "wellBeing": "Good",
  "foodNotes": "Healthy day"
}
```

**No changes** - format identical to current implementation.

### PUT /api/entries/:id (Update)

Same request format as POST. **No changes**.

---

## Component Relationships

```
EntryForm (Organism)
  │
  ├─→ DateInput (Molecule)
  │     ├─→ Label (Atom)
  │     ├─→ <input type="date"> (HTML5)
  │     └─→ ErrorMessage (Atom)
  │
  ├─→ TimeInput (Molecule) [First Meal]
  │     ├─→ Label (Atom)
  │     ├─→ <input type="time"> (HTML5)
  │     └─→ ErrorMessage (Atom)
  │
  ├─→ TimeInput (Molecule) [Last Meal]
  │     ├─→ Label (Atom)
  │     ├─→ <input type="time"> (HTML5)
  │     └─→ ErrorMessage (Atom)
  │
  ├─→ FormField (Molecule) [Sleep, Weight]
  ├─→ RatingSelector (Molecule) [Hunger, Energy, Well-Being]
  └─→ Button (Atom) [Submit, Cancel]
```

**Hierarchy unchanged** - only internal implementation of DateInput and TimeInput modified.

---

## Migration Checklist

### Breaking Changes
- ✅ None - API contracts identical

### Behavioral Changes
- ⚠️ **Date defaults to today** in create mode (was empty before)
- ⚠️ **Time display format** follows OS locale (was controlled by `format` prop)
- ⚠️ **Calendar icon appearance** varies by browser (was consistent custom UI)

### Compatibility Verification
- ✅ Props: Same names, types, requirements
- ✅ Events: onChange signature identical
- ✅ Values: Same formats (ISO for date, HH:mm for time)
- ✅ Validation: Same rules, same error messages
- ✅ Accessibility: Same ARIA patterns
- ✅ Styling: Same Tailwind classes applicable

---

## Summary

| Aspect | Current | New | Status |
|--------|---------|-----|--------|
| **DateInput API** | 8 props | 8 props | ✅ Unchanged |
| **TimeInput API** | 8 props | 8 props | ✅ Unchanged |
| **EntryForm API** | 4 props | 4 props | ✅ Unchanged |
| **Date Format** | ISO YYYY-MM-DD | ISO YYYY-MM-DD | ✅ Unchanged |
| **Time Format** | HH:mm 24-hour | HH:mm 24-hour | ✅ Unchanged |
| **Validation** | Client-side rules | Client-side rules | ✅ Unchanged |
| **Database** | Mongoose schema | Mongoose schema | ✅ Unchanged |
| **API Contracts** | JSON format | JSON format | ✅ Unchanged |
| **Component Lines** | ~430 total | ~170 total | 🎯 60% reduction |
| **Today Default** | Empty string | Today's date | ⚠️ Enhancement |
| **Time Display** | Controlled by app | Controlled by OS | ⚠️ Behavioral change |

**Conclusion**: Significant internal simplification with zero breaking changes to external APIs.
