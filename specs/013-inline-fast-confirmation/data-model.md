# Data Model: Inline Extended Fast Confirmation

**Feature**: 013-inline-fast-confirmation  
**Date**: October 25, 2025  
**Status**: No changes required

## Overview

This feature repositions existing UI elements and does not introduce new data structures or modify existing schemas. All required fields for extended fast confirmation already exist in the Entry model.

---

## Existing Data Structures

### Entry Model (Unchanged)

**Location**: `src/lib/models/Entry.js`  
**Schema**: Mongoose ODM

```javascript
const EntrySchema = new Schema({
  // Core fasting data
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  firstMealTime: { type: Date, required: true },
  lastMealTime: { type: Date, required: true },
  fastingDuration: { type: Number, required: true }, // minutes
  
  // Extended fast tracking
  extendedFastConfirmed: { 
    type: Boolean, 
    default: false,
    description: 'User confirmed continuous fasting for 24+ hours'
  },
  extendedFastDenied: { 
    type: Boolean, 
    default: false,
    description: 'User denied continuous fasting (ate but did not log)'
  },
  extendedFastFromPreviousConfirmed: { 
    type: Boolean, 
    default: false,
    description: 'User confirmed extended fast from previous entry'
  },
  extendedFastToNextDenied: { 
    type: Boolean, 
    default: false,
    description: 'User denied extended fast to next entry'
  },
  
  // Optional tracking data
  hoursOfSleep: { type: Number },
  morningWeight: { type: Number },
  hungerLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  energyLevel: { type: String, enum: ['Low Energy', 'Medium Energy', 'High Energy'] },
  wellBeing: { type: String, enum: ['Poor', 'Fair', 'Good'] },
  foodNotes: { type: String, maxlength: 2000 },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

**Indexes** (Existing):
- `userId + date` (compound, unique): Fast lookups for user's entries by date
- `userId + createdAt`: Fast lookups for recent entries

**No Modifications Required**: All extended fast confirmation fields already exist and function correctly.

---

## API Request/Response Formats

### Extended Fast Detection (Unchanged)

**Endpoint**: `GET /api/entries/check-previous`

**Request**:
```typescript
{
  date: string;           // 'YYYY-MM-DD'
  firstMealTime: string;  // 'HH:mm' or ISO 8601
  lastMealTime: string;   // 'HH:mm' or ISO 8601
}
```

**Response**:
```typescript
{
  isExtendedFast: boolean;
  isExtendedFastFromPrevious: boolean;
  isExtendedFastToNext: boolean;
  fromPreviousFasting?: {
    hours: number;
    minutes: number;
    formatted: string;  // '26h 30m'
  };
  toNextFasting?: {
    hours: number;
    minutes: number;
    formatted: string;  // '30h 15m'
  };
  previousEntry?: {
    _id: string;
    date: string;  // 'YYYY-MM-DD'
    lastMealTime: string;  // 'HH:mm'
  };
  nextEntry?: {
    _id: string;
    date: string;  // 'YYYY-MM-DD'
    firstMealTime: string;  // 'HH:mm'
  };
}
```

**Usage**: Called when "Update Entry" clicked to detect if confirmation needed

---

### Entry Update (Unchanged)

**Endpoint**: `PUT /api/entries/[id]`

**Request**:
```typescript
{
  // Required
  date: string;  // 'YYYY-MM-DD'
  firstMealTime: string;  // ISO 8601
  lastMealTime: string;   // ISO 8601
  
  // Extended fast confirmation (conditional)
  extendedFastConfirmed?: boolean;
  extendedFastDenied?: boolean;
  extendedFastToNextDenied?: boolean;
  
  // Optional
  hoursOfSleep?: number;
  morningWeight?: number;
  hungerLevel?: 'Low' | 'Medium' | 'High';
  energyLevel?: 'Low Energy' | 'Medium Energy' | 'High Energy';
  wellBeing?: 'Poor' | 'Fair' | 'Good';
  foodNotes?: string;
}
```

**Response**:
```typescript
{
  success: true;
  data: Entry;  // Full entry object
}
```

**Error Response**:
```typescript
{
  success: false;
  error: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

**Usage**: Called by confirmation button clicks (with extended fast flags) or submit button (without flags)

---

## Component State (React)

### EntryForm Component State

**Location**: `src/components/organisms/EntryForm.js`

```typescript
// Form data (maps to Entry model)
const [formData, setFormData] = useState({
  date: string;
  firstMealTime: string;
  lastMealTime: string;
  extendedFastConfirmed: boolean;
  extendedFastFromPreviousConfirmed: boolean;
  extendedFastToNextConfirmed: boolean;
  extendedFastDenied: boolean;
  extendedFastToNextDenied: boolean;
  hoursOfSleep: string | number;
  morningWeight: string | number;
  hungerLevel: string;
  energyLevel: string;
  wellBeing: string;
  foodNotes: string;
});

// Validation
const [errors, setErrors] = useState<Record<string, string>>({});
const [apiError, setApiError] = useState<string>('');

// Extended fast detection
const [gapInfo, setGapInfo] = useState<GapInfo | null>(null);
const [showExtendedFastPrompt, setShowExtendedFastPrompt] = useState<boolean>(false);
const [currentPromptType, setCurrentPromptType] = useState<'from-previous' | 'to-next' | null>(null);

// Loading
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
```

**State Flow**:
1. User clicks "Update Entry"
2. `handleSubmit` → calls `/api/entries/check-previous` → updates `gapInfo`
3. If extended fast detected: `setShowExtendedFastPrompt(true)` + `setCurrentPromptType()`
4. User clicks confirmation button
5. Updates `formData` with confirmation flags
6. Calls `submitForm()` → `PUT /api/entries/[id]` → updates database
7. Redirects to entry details page

---

## Validation Rules (Unchanged)

### Client-Side Validation

**Required Fields**:
- `date`: Must be valid date, not in future
- `firstMealTime`: Must be valid time, before last meal
- `lastMealTime`: Must be valid time, after first meal

**Optional Field Constraints**:
- `hoursOfSleep`: 0-24, positive number
- `morningWeight`: Positive number, max 2 decimal places
- `hungerLevel`: Enum ('Low', 'Medium', 'High')
- `energyLevel`: Enum ('Low Energy', 'Medium Energy', 'High Energy')
- `wellBeing`: Enum ('Poor', 'Fair', 'Good')
- `foodNotes`: Max 2000 characters

**Extended Fast Rules**:
- No client-side validation for extended fast flags
- Flags are optional, set based on user confirmation
- Backend accepts any boolean values

### Server-Side Validation

**Location**: `src/lib/validation/entrySchema.js` (Joi schema)

```javascript
{
  date: Joi.date().required().max('now'),
  firstMealTime: Joi.date().required(),
  lastMealTime: Joi.date().required(),
  extendedFastConfirmed: Joi.boolean().optional(),
  extendedFastDenied: Joi.boolean().optional(),
  extendedFastToNextDenied: Joi.boolean().optional(),
  hoursOfSleep: Joi.number().min(0).max(24).optional(),
  morningWeight: Joi.number().positive().optional(),
  hungerLevel: Joi.string().valid('Low', 'Medium', 'High').optional(),
  energyLevel: Joi.string().valid('Low Energy', 'Medium Energy', 'High Energy').optional(),
  wellBeing: Joi.string().valid('Poor', 'Fair', 'Good').optional(),
  foodNotes: Joi.string().max(2000).optional()
}
```

**No Changes Required**: Extended fast fields already validated as optional booleans

---

## Data Flow Diagram

```
User Interaction
    ↓
Click "Update Entry"
    ↓
handleSubmit()
    ↓
Validate form fields (client-side)
    ↓
Check if gapInfo exists?
  ├─ No → Call GET /api/entries/check-previous
  │         ↓
  │       Update gapInfo state
  │         ↓
  │       Extended fast detected?
  │         ├─ Yes → Show confirmation buttons inline
  │         │         (replace "Update Entry" button)
  │         │         ↓
  │         │       User clicks confirmation button
  │         │         ↓
  │         │       Set confirmation flags in formData
  │         │         ↓
  │         │       Check for second confirmation?
  │         │         ├─ Yes → Show second confirmation inline
  │         │         │         (repeat)
  │         │         └─ No → Call submitForm()
  │         └─ No → Call submitForm()
  └─ Yes (already checked) → Call submitForm()
                              ↓
                         Validate again
                              ↓
                         PUT /api/entries/[id]
                              ↓
                         Server validates (Joi)
                              ↓
                         Save to MongoDB
                              ↓
                         Return updated Entry
                              ↓
                         Redirect to /entries/[id]
```

---

## Database Queries

### No New Queries Required

All queries already implemented:

**Find previous entry** (used by check-previous API):
```javascript
const previousEntry = await Entry.findOne({
  userId,
  date: { $lt: currentDate }
}).sort({ date: -1 }).lean();
```

**Find next entry** (used by check-previous API):
```javascript
const nextEntry = await Entry.findOne({
  userId,
  date: { $gt: currentDate }
}).sort({ date: 1 }).lean();
```

**Update entry** (used by PUT API):
```javascript
const updatedEntry = await Entry.findByIdAndUpdate(
  entryId,
  { $set: updateData },
  { new: true, runValidators: true }
);
```

**No Index Changes**: Existing `userId + date` compound index supports all queries efficiently

---

## Migration Plan

**No Migration Required** - Schema already contains all necessary fields

**If Future Migration Needed**:
1. Extended fast fields are optional (default: false)
2. Existing entries without flags remain valid
3. No data backfill required
4. No breaking changes to API

---

## Rollback Plan

**UI Rollback**: Revert EntryForm.js to previous version
- Extended fast prompts show at top again
- Two-click flow restored
- No data impact (database unchanged)

**Data Rollback**: Not applicable
- No schema changes
- No data migrations
- Entry documents remain valid

---

## Summary

### Changes: None
- ✅ Entry model: No modifications
- ✅ Validation schemas: No modifications
- ✅ API endpoints: No modifications
- ✅ Database indexes: No modifications

### Impact: UI Only
- Component state management modified
- Conditional rendering logic changed
- Button click handlers updated
- Form submission flow reorganized

### Risk: Minimal
- No breaking changes to data structures
- No migration scripts needed
- No backward compatibility concerns
- Rollback is simple (revert component file)

---

## References

- **Entry Model**: `src/lib/models/Entry.js` (lines 103-125 for extended fast fields)
- **Validation Schema**: `src/lib/validation/entrySchema.js`
- **Check Previous API**: `src/app/api/entries/check-previous/route.js`
- **Update Entry API**: `src/app/api/entries/[id]/route.js`
- **Component State**: `src/components/organisms/EntryForm.js` (lines 40-70)
