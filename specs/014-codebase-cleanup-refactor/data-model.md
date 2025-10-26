# Data Model: Codebase Cleanup & Refactoring

**Feature**: 014-codebase-cleanup-refactor  
**Date**: October 26, 2025  
**Status**: Completed

## Overview

This document describes the data structures and component state management patterns relevant to this refactoring feature. **No database schema changes** - this is purely internal component state refactoring.

---

## Component State Structures

### EntryForm Component State

**Purpose**: Manages form data, UI state, and extended fast confirmation flow for entry creation/editing

**Current State Variables** (src/components/organisms/EntryForm.js):

```javascript
// Form data
const [formData, setFormData] = useState({
  date: '',
  firstMealTime: '',
  lastMealTime: '',
  confirmedExtendedFast: false,
  // ... other fields ...
});

// UI state
const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState({});
const [showExtendedFastPrompt, setShowExtendedFastPrompt] = useState(false);

// ⚠️ DEAD CODE - TO BE REMOVED (P1)
const [checkingGap, setCheckingGap] = useState(false); // Line 69 - never read or set
```

**State Relationships**:
- `formData` → Primary data structure for entry submission
- `isLoading` → Controls submit button disabled state and loading spinner
- `errors` → Validation error messages keyed by field name
- `showExtendedFastPrompt` → Controls visibility of inline confirmation UI
- ~~`checkingGap`~~ → **UNUSED** - remnant from earlier implementation, safe to remove

**State Transitions**:

```
Initial Load
  ↓
[formData: empty, isLoading: false, showExtendedFastPrompt: false]
  ↓
User enters firstMealTime + lastMealTime
  ↓
Gap calculation detects >16 hour fast
  ↓
[showExtendedFastPrompt: true]
  ↓
User clicks "Confirm Extended Fast" or "Deny Extended Fast"
  ↓
[isLoading: true, showExtendedFastPrompt: false]
  ↓
Submit formData with confirmedExtendedFast = true/false
  ↓
API success → redirect to /entries
```

---

## Function Call Flow (Before & After Refactoring)

### Current Flow (Has Issues)

```
User enters meal times
  ↓
handleChange(e) triggered
  ↓
Line 99: setFormData({ firstMealTime: value })
  ↓
Line 109: setFormData({ lastMealTime: calculated }) ⚠️ Double state update
  ↓
Gap check logic runs
  ↓
setShowExtendedFastPrompt(true)
  ↓
User clicks "Confirm" or "Deny" button
  ↓
handleExtendedFastConfirmAndSave() or handleExtendedFastDenyAndSave()
  ↓
80+ duplicate lines of API submission logic ⚠️
  ↓
API call to POST /api/entries
```

### Refactored Flow (After P1)

```
User enters meal times
  ↓
handleChange(e) triggered
  ↓
✅ Single setFormData({ firstMealTime, lastMealTime }) - consolidated
  ↓
Gap check logic runs
  ↓
setShowExtendedFastPrompt(true)
  ↓
User clicks "Confirm" or "Deny" button
  ↓
handleExtendedFastConfirmAndSave() or handleExtendedFastDenyAndSave()
  ↓
✅ Call submitFormWithData(formData, true/false) - extracted function
  ↓
API call to POST /api/entries
```

---

## API Data Contracts (No Changes)

**Endpoint**: `POST /api/entries`

**Request Body**:
```json
{
  "date": "2025-10-26",
  "firstMealTime": "12:00",
  "lastMealTime": "19:30",
  "confirmedExtendedFast": true,
  "notes": "Optional notes"
}
```

**Response** (Success):
```json
{
  "success": true,
  "entry": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "date": "2025-10-26",
    "firstMealTime": "12:00",
    "lastMealTime": "19:30",
    "fastingDuration": 16.5,
    "confirmedExtendedFast": true,
    "createdAt": "2025-10-26T10:30:00Z"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "date": "Date is required",
    "firstMealTime": "Invalid time format"
  }
}
```

**⚠️ No changes to this contract** - refactoring only affects internal component logic, not API shape.

---

## Component Data Flow

### EntryForm Props (Input)

```javascript
/**
 * @param {Object} props
 * @param {Object} [props.entry] - Existing entry for edit mode (undefined for create)
 * @param {string} [props.entry.date] - ISO date string
 * @param {string} [props.entry.firstMealTime] - HH:mm format
 * @param {string} [props.entry.lastMealTime] - HH:mm format
 * @param {boolean} [props.entry.confirmedExtendedFast] - Extended fast status
 * @param {string} props.mode - 'create' | 'edit'
 */
```

**⚠️ No changes to props interface** - component API remains identical.

### EntryForm Outputs (Side Effects)

1. **API Call**: `POST /api/entries` or `PUT /api/entries/[id]`
2. **Navigation**: `router.push('/entries')` on success
3. **Toast/Error Display**: `setErrors()` on validation failure

**⚠️ No changes to outputs** - same API calls, same navigation, same error handling.

---

## State Management Patterns (Across Codebase)

### Pattern 1: Form State Management

**Observed Pattern** (from P2 audit):
```javascript
// Most form components use this pattern
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  // ... API call ...
  setIsLoading(false);
};
```

**Consistency Check** (P2 task): Verify all form components follow this pattern. Extract common logic if 3+ components have duplicate form handling.

### Pattern 2: API Error Handling

**Observed Pattern**:
```javascript
try {
  const response = await fetch('/api/endpoint', { method: 'POST', body: JSON.stringify(data) });
  const json = await response.json();
  
  if (!response.ok) {
    setErrors(json.details || { general: json.error });
    return;
  }
  
  // Success handling
} catch (error) {
  setErrors({ general: 'Network error occurred' });
}
```

**Consistency Check** (P2 task): Verify this pattern used across all API calls. Document any deviations in audit report.

---

## Validation Rules (No Changes)

**EntryForm Validation** (handled by API route + client-side checks):

1. **date**: Required, must be valid date, not in future
2. **firstMealTime**: Required, valid HH:mm format, reasonable hour (00:00-23:59)
3. **lastMealTime**: Required, valid HH:mm format, must be after firstMealTime (accounting for midnight crossing)
4. **confirmedExtendedFast**: Boolean, defaults to false
5. **notes**: Optional, max 500 characters

**⚠️ No validation changes** - refactoring maintains all existing validation logic.

---

## Database Schema (No Changes)

**Entry Model** (lib/models/Entry.js):

```javascript
const entrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  firstMealTime: { type: String, required: true },
  lastMealTime: { type: String, required: true },
  fastingDuration: { type: Number },
  confirmedExtendedFast: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**⚠️ Zero schema changes** - this is pure code refactoring, no data model modifications.

---

## Summary

| Aspect | Current State | After Refactoring | Change Type |
|--------|---------------|-------------------|-------------|
| **State Variables** | 5 variables (1 unused) | 4 variables (dead code removed) | Internal cleanup |
| **State Updates** | Double `setFormData` calls | Single atomic update | Performance optimization |
| **Handler Functions** | 4 handlers (2 unused, 2 with duplication) | 3 handlers (extracted shared logic) | Code simplification |
| **Component Props** | `{ entry, mode }` | `{ entry, mode }` | **No change** |
| **API Contracts** | POST/PUT /api/entries | POST/PUT /api/entries | **No change** |
| **Database Schema** | Entry model (8 fields) | Entry model (8 fields) | **No change** |

**Key Principle**: This refactoring is **behavior-preserving**. All data structures, API contracts, and component interfaces remain identical. Only internal implementation changes to reduce complexity and improve maintainability.

---

**Next Phase**: Quickstart Guide (quickstart.md)
