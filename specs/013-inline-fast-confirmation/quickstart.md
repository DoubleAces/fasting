# Quickstart Guide: Inline Extended Fast Confirmation

**Feature**: 013-inline-fast-confirmation  
**Branch**: `013-inline-fast-confirmation`  
**Status**: Planning Complete - Ready for Implementation

---

## Overview

This feature repositions the extended fast confirmation UI from the top of the entry edit form to the bottom, replacing the "Update Entry" button. When a user clicks "Update Entry" and an extended fast (24+ hours) is detected, the button is replaced with inline confirmation buttons that immediately save the entry when clicked - eliminating the confusing two-click flow.

**Key Changes**:
- ✅ Confirmation buttons replace "Update Entry" button (not both visible)
- ✅ Clicking confirmation immediately saves entry (one action, not two)
- ✅ Sequential confirmations (if multiple extended fasts) happen inline
- ✅ Non-extended fasts save immediately with no interruption

---

## Quick Start (For Developers)

### 1. Prerequisites

```bash
# Ensure you're on the feature branch
git checkout 013-inline-fast-confirmation

# Install dependencies (if not already)
npm install

# Verify tests pass
npm test
```

###  2. Files to Modify

**Primary File**:
- `src/components/organisms/EntryForm.js` (679 lines)
  - Lines 430-530: Remove extended fast prompt from top of form
  - Lines 665-670: Add conditional rendering (confirmation buttons OR submit button)
  - Add: `submitForm()` extracted function
  - Modify: `handleExtendedFastConfirm` and `handleExtendedFastDeny` to trigger save

**Test File**:
- `tests/unit/components/organisms/EntryForm.test.js` (1000+ lines)
  - Add: Tests for inline positioning
  - Add: Tests for single-click save
  - Update: Existing extended fast tests for new UI location

**No Changes Required**:
- ❌ `src/lib/models/Entry.js` (schema already has fields)
- ❌ `src/lib/validation/entrySchema.js` (validation unchanged)
- ❌ `src/app/api/entries/check-previous/route.js` (API unchanged)
- ❌ `src/app/api/entries/[id]/route.js` (API unchanged)

### 3. Implementation Checklist

#### Phase 1: TDD - Write Failing Tests (MANDATORY)
- [ ] Test 1: Confirmation buttons replace submit button (not both visible)
- [ ] Test 2: Clicking "Yes, confirm" immediately saves (no second click)
- [ ] Test 3: Clicking "No, deny" immediately saves (no second click)
- [ ] Test 4: Both buttons disabled during save (isSubmitting state)
- [ ] Test 5: Sequential confirmations show inline (no page refresh)
- [ ] Test 6: Changing time fields resets confirmation state
- [ ] Test 7: API error keeps buttons visible and clickable
- [ ] Run tests: `npm test EntryForm.test.js` → ❌ All 7 should FAIL

#### Phase 2: Implementation
- [ ] Extract `submitForm()` function from `handleSubmit`
- [ ] Remove extended fast prompt UI from lines 430-530
- [ ] Add conditional rendering at lines 665-670 (buttons OR submit)
- [ ] Modify `handleExtendedFastConfirm` to call `submitForm()`
- [ ] Modify `handleExtendedFastDeny` to call `submitForm()`
- [ ] Add time field change listener to reset `gapInfo`
- [ ] Add `aria-live="polite"` to button container
- [ ] Add mobile-responsive classes (`flex-col sm:flex-row`)

#### Phase 3: Verify Tests Pass
- [ ] Run tests: `npm test EntryForm.test.js` → ✅ All tests should PASS
- [ ] Run full test suite: `npm test` → ✅ No regressions
- [ ] Check coverage: `npm test -- --coverage` → ✅ Maintain 80%+

#### Phase 4: Manual QA
- [ ] Start dev server: `npm run dev`
- [ ] Test scenario 1: Edit entry with 16h fast → Click "Update Entry" → Saves immediately (no prompt)
- [ ] Test scenario 2: Edit entry with 26h fast → Click "Update Entry" → See confirmation buttons inline → Click "Yes, confirm" → Entry saves
- [ ] Test scenario 3: Two extended fasts → See first confirmation → Click confirm → See second confirmation → Click deny → Entry saves
- [ ] Test scenario 4: See confirmation → Change time → Confirmation disappears, "Update Entry" button returns
- [ ] Test mobile (< 640px): Buttons stack vertically, both reachable
- [ ] Test keyboard nav: Tab through buttons, Enter to submit
- [ ] Test screen reader (optional): Announcements for button replacement

#### Phase 5: Documentation
- [ ] Update component JSDoc (if needed)
- [ ] Add inline code comments for new functions
- [ ] Update CLAUDE.md or README.md with feature notes (if applicable)

---

## User Flows

### Flow 1: Non-Extended Fast (No Change)

```
User navigates to: /entries/[id]/edit
  ↓
Edits entry (16-hour fast)
  ↓
Clicks "Update Entry" button
  ↓
✅ Entry saves immediately
  ↓
Redirects to /entries/[id] (details page)
```

**Expected**: Same behavior as before, no interruption

---

### Flow 2: Extended Fast (Single Confirmation)

```
User navigates to: /entries/[id]/edit
  ↓
Edits entry (changes create 26-hour fast from previous entry)
  ↓
Clicks "Update Entry" button
  ↓
"Update Entry" button replaced with inline confirmation:
  ┌─────────────────────────────────────────────┐
  │ Extended Fast Detected (26h 30m)            │
  │ Did you fast continuously for this period?  │
  │                                             │
  │ [Yes, confirm extended fast]  [No, I ate]  │
  └─────────────────────────────────────────────┘
  ↓
User clicks "Yes, confirm extended fast"
  ↓
✅ Entry saves immediately with extendedFastConfirmed: true
  ↓
Redirects to /entries/[id] (details page)
```

**Expected**: One click saves (was two clicks before)

---

### Flow 3: Extended Fast (Two Confirmations)

```
User navigates to: /entries/[id]/edit
  ↓
Edits entry (creates 26h fast from previous AND 30h fast to next)
  ↓
Clicks "Update Entry" button
  ↓
First confirmation appears inline:
  ┌─────────────────────────────────────────────┐
  │ Extended Fast Detected (26h 30m)            │
  │ From previous entry on October 23rd         │
  │ Did you fast continuously for this period?  │
  │                                             │
  │ [Yes, confirm]  [No, I ate]                 │
  └─────────────────────────────────────────────┘
  ↓
User clicks "Yes, confirm"
  ↓
Second confirmation appears inline (no page refresh):
  ┌─────────────────────────────────────────────┐
  │ Extended Fast Detected (30h 15m)            │
  │ To next entry on October 26th               │
  │ Did you fast continuously for this period?  │
  │                                             │
  │ [Yes, confirm]  [No, I ate]                 │
  └─────────────────────────────────────────────┘
  ↓
User clicks "No, I ate"
  ↓
✅ Entry saves with both confirmations (confirm + deny)
  ↓
Redirects to /entries/[id] (details page)
```

**Expected**: Two confirmations inline, then one save (was three clicks before)

---

### Flow 4: Changing Mind (Field Change Reset)

```
User navigates to: /entries/[id]/edit
  ↓
Edits entry (creates 26h fast)
  ↓
Clicks "Update Entry" button
  ↓
Confirmation buttons appear inline
  ↓
User realizes mistake, changes Last Meal Time field
  ↓
✅ Confirmation buttons disappear, "Update Entry" button returns
  ↓
User clicks "Update Entry" (detection runs again)
```

**Expected**: Changing time fields resets confirmation state

---

## Technical Details

### State Management

**Key State Variables** (all existing):
- `showExtendedFastPrompt`: boolean - Controls visibility of confirmation buttons
- `gapInfo`: object | null - Extended fast detection results
- `currentPromptType`: 'from-previous' | 'to-next' | null - Which confirmation showing
- `isSubmitting`: boolean - Loading state for all buttons
- `formData`: object - Form values including extended fast flags

**No New State**: Feature reuses existing state variables

### Component Structure

**Before** (Current):
```jsx
<form>
  {/* Extended Fast Prompt - TOP OF FORM */}
  {showExtendedFastPrompt && (
    <div className="p-4 bg-purple-50">
      <Button onClick={handleExtendedFastConfirm}>Yes</Button>
      <Button onClick={handleExtendedFastDeny}>No</Button>
    </div>
  )}
  
  {/* Form fields */}
  <DateInput />
  <TimeInput />
  {/* ... more fields ... */}
  
  {/* Submit Button - BOTTOM OF FORM */}
  <Button type="submit">Update Entry</Button>
</form>
```

**After** (New):
```jsx
<form>
  {/* Extended Fast Prompt - REMOVED */}
  
  {/* Form fields */}
  <DateInput />
  <TimeInput />
  {/* ... more fields ... */}
  
  {/* Conditional Buttons - BOTTOM OF FORM */}
  <div aria-live="polite">
    {showExtendedFastPrompt ? (
      <div className="space-y-3">
        {/* Confirmation prompt and buttons */}
        <Button onClick={handleExtendedFastConfirmAndSave}>Yes</Button>
        <Button onClick={handleExtendedFastDenyAndSave}>No</Button>
      </div>
    ) : (
      <Button type="submit">Update Entry</Button>
    )}
  </div>
</form>
```

### Function Changes

**New Function**:
```javascript
const submitForm = async () => {
  // Extracted from handleSubmit
  // Validation + API call + redirect
};
```

**Modified Functions**:
```javascript
const handleExtendedFastConfirmAndSave = async () => {
  // Set confirmation state
  setFormData(prev => ({ ...prev, extendedFastFromPreviousConfirmed: true }));
  
  // Check if second confirmation needed
  if (gapInfo.isExtendedFastToNext && !formData.extendedFastToNextConfirmed) {
    setCurrentPromptType('to-next');
    return; // Show second confirmation
  }
  
  // All confirmations done, save
  setShowExtendedFastPrompt(false);
  await submitForm();
};

const handleExtendedFastDenyAndSave = async () => {
  // Similar to above, but sets denial flags
};
```

---

## Testing

### Unit Tests

**Run Component Tests**:
```bash
npm test EntryForm.test.js
```

**Watch Mode** (for development):
```bash
npm test EntryForm.test.js -- --watch
```

**Coverage Report**:
```bash
npm test EntryForm.test.js -- --coverage
```

**Expected Coverage**:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

### Test Cases (TDD - Write These First!)

**Test 1: Inline Positioning**
```javascript
it('should replace Update Entry button with confirmation buttons when extended fast detected', async () => {
  // Arrange: Mock extended fast response
  // Act: Fill form, click Update Entry
  // Assert: Submit button NOT visible, confirmation buttons ARE visible
});
```

**Test 2: Single Click Save (Confirm)**
```javascript
it('should save entry immediately when clicking Yes confirmation button', async () => {
  // Arrange: Extended fast detected, confirmation showing
  // Act: Click "Yes, confirm extended fast"
  // Assert: PUT /api/entries/[id] called once, redirected to details page
});
```

**Test 3: Single Click Save (Deny)**
```javascript
it('should save entry immediately when clicking No confirmation button', async () => {
  // Arrange: Extended fast detected, confirmation showing
  // Act: Click "No, I ate but didn't log"
  // Assert: PUT /api/entries/[id] called with extendedFastDenied: true
});
```

**Test 4: Loading State**
```javascript
it('should disable both confirmation buttons during save', async () => {
  // Arrange: Extended fast detected, confirmation showing
  // Act: Click "Yes, confirm" button
  // Assert: Both buttons disabled, clicked button shows spinner
});
```

**Test 5: Sequential Confirmations**
```javascript
it('should show second confirmation inline after first is confirmed', async () => {
  // Arrange: Two extended fasts detected (from previous AND to next)
  // Act: Click first "Yes, confirm"
  // Assert: Second confirmation appears, no API call yet, same location
});
```

**Test 6: Field Change Reset**
```javascript
it('should revert to Update Entry button when time field changes after confirmation appears', async () => {
  // Arrange: Extended fast detected, confirmation showing
  // Act: Change Last Meal Time field
  // Assert: Confirmation hidden, Update Entry button visible, gapInfo cleared
});
```

**Test 7: Error Handling**
```javascript
it('should keep confirmation buttons visible after API error', async () => {
  // Arrange: Extended fast detected, confirmation showing, mock API failure
  // Act: Click "Yes, confirm"
  // Assert: Error message shown, buttons still visible and clickable
});
```

---

## Troubleshooting

### Issue 1: "Both button and confirmation visible at same time"

**Symptom**: Update Entry button and confirmation buttons both showing  
**Cause**: Conditional rendering logic incorrect  
**Fix**: Ensure ternary operator, not two separate renders
```javascript
{showExtendedFastPrompt ? <Confirmation /> : <SubmitButton />}
// NOT:
{showExtendedFastPrompt && <Confirmation />}
<SubmitButton />
```

### Issue 2: "Second confirmation doesn't appear"

**Symptom**: After first confirmation, form submits instead of showing second  
**Cause**: Not checking for second extended fast  
**Fix**: Add conditional in confirmation handler
```javascript
if (gapInfo.isExtendedFastToNext && !formData.extendedFastToNextConfirmed) {
  setCurrentPromptType('to-next');
  return; // Don't call submitForm() yet
}
```

### Issue 3: "Buttons don't disable during save"

**Symptom**: User can click confirmation button multiple times  
**Cause**: `disabled` prop not set correctly  
**Fix**: Add `disabled={isSubmitting}` to both buttons
```javascript
<Button onClick={handleExtendedFastConfirmAndSave} disabled={isSubmitting}>
```

### Issue 4: "Tests fail with 'cannot find button'"

**Symptom**: Test can't find "Update Entry" button after extended fast  
**Cause**: Button is replaced, test expects it to always exist  
**Fix**: Use conditional query
```javascript
const submitButton = screen.queryByRole('button', { name: /update entry/i });
const confirmButton = screen.queryByRole('button', { name: /yes, confirm/i });
expect(submitButton || confirmButton).toBeInTheDocument();
```

---

## Success Criteria Verification

### SC-001: One-Click Update for Extended Fasts
**Test**: Edit entry with 26h fast, click "Yes, confirm", verify entry saved  
**Expected**: One action completes update (was two actions before)

### SC-002: No Change for Regular Fasts
**Test**: Edit entry with 16h fast, click "Update Entry"  
**Expected**: Entry saves immediately, no prompt

### SC-003: Zero Duplicate Submissions
**Test**: Click confirmation button rapidly (5 times in 1 second)  
**Expected**: Only 1 API call to PUT /api/entries/[id], button disabled after first click

### SC-004: Loading Feedback < 100ms
**Test**: Click confirmation button, measure time to spinner appearance  
**Expected**: Spinner visible within 100ms (React state update is instant)

### SC-005: Inline Positioning
**Test**: Trigger extended fast, measure button container position  
**Expected**: Confirmation buttons at bottom of form (same location as "Update Entry" button)

---

## Next Steps

1. **Start TDD**: Write failing tests first (Constitution III requirement)
2. **Implement**: Modify EntryForm.js per checklist above
3. **Verify**: All tests pass, manual QA complete
4. **Commit**: `git commit -m "feat: inline extended fast confirmation"`
5. **Review**: Code review with team
6. **Deploy**: Merge to main, deploy to production

---

## References

- **Feature Spec**: `specs/013-inline-fast-confirmation/spec.md`
- **Implementation Plan**: `specs/013-inline-fast-confirmation/plan.md`
- **Research**: `specs/013-inline-fast-confirmation/research.md`
- **Data Model**: `specs/013-inline-fast-confirmation/data-model.md`
- **API Contracts**: `specs/013-inline-fast-confirmation/contracts/api-changes.md`
- **Constitution**: `.specify/memory/constitution.md` (TDD, mobile-first, accessibility)
- **Component**: `src/components/organisms/EntryForm.js`
- **Tests**: `tests/unit/components/organisms/EntryForm.test.js`
