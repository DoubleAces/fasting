# Research: Inline Extended Fast Confirmation

**Feature**: 013-inline-fast-confirmation  
**Date**: October 25, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing inline extended fast confirmation in the entry edit form. The goal is to move confirmation UI from the top of the form to the bottom, replacing the "Update Entry" button, and combining confirmation selection with the save action.

---

## Research Questions & Answers

### Q1: How to conditionally render confirmation buttons vs submit button?

**Decision**: Use existing `showExtendedFastPrompt` state to control conditional rendering

**Rationale**:
- State variable already exists and accurately tracks when extended fast detected
- Pattern: `{showExtendedFastPrompt ? <ConfirmationButtons /> : <SubmitButton />}`
- No additional state needed, leverages existing detection logic

**Alternatives Considered**:
- **New state variable**: Rejected - redundant, `showExtendedFastPrompt` already serves this purpose
- **CSS visibility toggle**: Rejected - both elements would exist in DOM, accessibility issues
- **Portal component**: Rejected - adds complexity, doesn't meet "inline" requirement

**Implementation Notes**:
- Wrap in `<div aria-live="polite">` for screen reader announcements
- Maintain existing `gapInfo` state for duration/entry details
- Keep `currentPromptType` ('from-previous' or 'to-next') for sequential confirmations

---

### Q2: How to combine confirmation + save in single action?

**Decision**: Extract form submission logic into reusable `submitForm()` function, call from confirmation handlers

**Rationale**:
- DRY principle - submission logic used in 3 places: submit button, confirm button, deny button
- Allows confirmation handlers to: set state → validate → submit in one flow
- Maintains existing error handling and validation patterns

**Alternatives Considered**:
- **Programmatic form.submit()**: Rejected - doesn't work with React synthetic events, still requires form event flow
- **State flag + useEffect auto-submit**: Rejected - React batching may cause race conditions, harder to debug
- **Duplicate submission logic**: Rejected - violates DRY, increases maintenance burden

**Implementation Pattern**:
```javascript
// Extract from handleSubmit
const submitForm = async () => {
  // Validation
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setIsSubmitting(true);
  try {
    // API call logic (lines 355-425)
    // ... existing code ...
  } catch (error) {
    setApiError(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

// New handlers
const handleExtendedFastConfirmAndSave = async () => {
  setFormData(prev => ({ ...prev, extendedFastFromPreviousConfirmed: true }));
  // Check if second confirmation needed
  if (gapInfo.isExtendedFastToNext && !formData.extendedFastToNextConfirmed) {
    setCurrentPromptType('to-next');
    // Keep prompt visible for second confirmation
    return;
  }
  setShowExtendedFastPrompt(false);
  await submitForm();
};
```

---

### Q3: How to handle sequential confirmations (from previous + to next)?

**Decision**: Reuse existing sequential logic, but keep both confirmations inline before final save

**Rationale**:
- Code already handles sequential flow (lines 218-226 in current implementation)
- First confirmation click: if second needed, update `currentPromptType` and keep `showExtendedFastPrompt = true`
- Second confirmation click: set final state, hide prompt, submit form
- No page refresh between confirmations, better UX

**Current Pattern (lines 218-226)**:
```javascript
// After first confirmation
if (currentPromptType === 'from-previous' && gapInfo?.isExtendedFastToNext) {
  setTimeout(() => {
    setCurrentPromptType('to-next');
    setShowExtendedFastPrompt(true);
  }, 100);
} else {
  // All confirmations done
  setFormData(prev => ({ ...prev, extendedFastConfirmed: true }));
}
```

**Modification**:
- Remove `setTimeout` (not needed, state updates are synchronous)
- Add `await submitForm()` after all confirmations collected
- Update button text dynamically based on `currentPromptType`:
  - 'from-previous': "Extended Fast Detected (26h 30m) - From previous entry"
  - 'to-next': "Extended Fast Detected (30h 15m) - To next entry"

**Implementation Notes**:
- Keep `currentPromptType` state variable
- Confirmation buttons always show current context (which extended fast)
- User sees: Confirm first → Buttons update for second → Confirm second → Save

---

### Q4: When should confirmation buttons revert to "Update Entry"?

**Decision**: Clear `gapInfo` state when user changes `firstMealTime` or `lastMealTime` after confirmation buttons appear

**Rationale**:
- Meal time changes may invalidate extended fast detection
- Forces re-detection on next submit (existing API call `/api/entries/check-previous`)
- Prevents stale confirmation state from saving incorrect data

**Implementation Pattern**:
```javascript
const handleChange = (field) => (e) => {
  const value = typeof e === 'string' ? e : e.target.value;
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Clear extended fast state if times change
  if (field === 'firstMealTime' || field === 'lastMealTime') {
    if (gapInfo || showExtendedFastPrompt) {
      setGapInfo(null);
      setShowExtendedFastPrompt(false);
      setCurrentPromptType(null);
      setFormData(prev => ({
        ...prev,
        extendedFastConfirmed: false,
        extendedFastFromPreviousConfirmed: false,
        extendedFastToNextConfirmed: false,
        extendedFastDenied: false,
        extendedFastToNextDenied: false,
      }));
    }
  }
  
  // Existing error clearing logic...
};
```

**Alternatives Considered**:
- **Clear on any field change**: Rejected - too aggressive, date change already triggers re-check
- **Don't clear, show warning**: Rejected - confusing UX, user may not notice
- **Disable time fields after confirmation**: Rejected - prevents legitimate corrections

**Edge Cases Covered**:
- User clicks confirm → changes mind → changes time → confirmation resets ✅
- User sees confirmation → changes date → auto-recheck triggers (existing behavior) ✅
- User changes time multiple times before confirming → only final value matters ✅

---

### Q5: How to handle loading states for confirmation buttons?

**Decision**: Reuse existing `isSubmitting` state, disable both confirmation buttons during save

**Rationale**:
- Same loading state for all save actions (submit button, confirm, deny)
- Prevents duplicate clicks across all buttons
- Shows loading spinner on whichever button was clicked

**Implementation**:
```javascript
<Button 
  onClick={handleExtendedFastConfirmAndSave}
  disabled={isSubmitting}
  loading={isSubmitting}  // Shows spinner if this button clicked
  variant="primary"
>
  Yes, confirm extended fast
</Button>
<Button 
  onClick={handleExtendedFastDenyAndSave}
  disabled={isSubmitting}  // Disabled during any save
  variant="secondary"
>
  No, I ate but didn't log
</Button>
```

**Alternatives Considered**:
- **Separate loading states**: Rejected - adds complexity, same behavior needed
- **Only disable clicked button**: Rejected - allows clicking other button during save
- **No loading state**: Rejected - poor UX, user gets no feedback

---

### Q6: How to handle accessibility (screen readers)?

**Decision**: Use ARIA live region to announce button replacement

**Rationale**:
- Screen readers need notification when UI changes dynamically
- `aria-live="polite"` announces after current speech finishes (non-intrusive)
- Provides context: "Extended fast detected, confirmation required" message

**Implementation**:
```javascript
<div aria-live="polite" className="flex gap-2">
  {showExtendedFastPrompt && gapInfo ? (
    <>
      <span className="sr-only">
        Extended fast detected. Please confirm before saving.
      </span>
      {/* Confirmation buttons */}
    </>
  ) : (
    <Button type="submit">Update Entry</Button>
  )}
</div>
```

**Alternatives Considered**:
- **aria-live="assertive"**: Rejected - too interrupting, not urgent information
- **Focus management**: Rejected - moving focus interrupts user, may be disorienting
- **No announcement**: Rejected - violates WCAG 2.1 AA (4.1.3 Status Messages)

**Accessibility Checklist**:
- ✅ Keyboard navigation: Buttons are natively focusable
- ✅ Screen reader labels: Button text is descriptive ("Yes, confirm extended fast")
- ✅ Status announcements: Live region announces UI state changes
- ✅ Error handling: API errors announced and associated with buttons
- ✅ Loading states: `aria-busy` and loading spinner for visual/non-visual feedback

---

### Q7: How to handle mobile responsiveness (320px width)?

**Decision**: Stack buttons vertically on small screens using Tailwind's `flex-col` class

**Rationale**:
- Two buttons side-by-side require ~280px minimum (140px each + gap)
- Leaves only 40px for padding on 320px screens
- Vertical stacking ensures 44x44px touch targets maintained

**Implementation**:
```javascript
<div className="flex flex-col sm:flex-row gap-2">
  <Button className="w-full sm:w-auto">Yes, confirm extended fast</Button>
  <Button className="w-full sm:w-auto">No, I ate but didn't log</Button>
</div>
```

**Breakpoints**:
- Mobile (< 640px): Vertical stack, full width buttons
- Tablet+ (≥ 640px): Horizontal row, auto width buttons

**Touch Target Verification**:
- Button height: 44px (Tailwind `Button` component default)
- Button width (mobile): 100% (full container width)
- Button width (desktop): Auto (content-based, minimum 100px via Button component)
- Gap between buttons: 8px (Tailwind `gap-2`)

---

## Technology Decisions

### UI Framework: Tailwind CSS (Existing)
- **Why**: Already used throughout codebase
- **Benefit**: Consistent styling, responsive utilities built-in
- **Usage**: `flex`, `gap-2`, `bg-purple-50`, `border`, `rounded-lg`, `p-3`

### Component Library: Custom Button/ErrorMessage Atoms (Existing)
- **Why**: Project uses atomic design pattern
- **Benefit**: Consistent button behavior (loading, disabled, variants)
- **Usage**: `<Button variant="primary" loading={isSubmitting} disabled={isSubmitting}>`

### State Management: React Hooks (Existing)
- **Why**: Client component already uses `useState` extensively
- **Benefit**: No new dependencies, familiar pattern
- **Usage**: `useState`, `flushSync` for synchronous state updates

### Testing: Jest + React Testing Library (Existing)
- **Why**: Mandated by Constitution III (TDD)
- **Benefit**: Tests already exist (1000+ lines), same patterns apply
- **Usage**: `render`, `screen`, `userEvent`, `waitFor`, `expect`

---

## Implementation Risks & Mitigations

### Risk 1: State Update Timing (Sequential Confirmations)
**Scenario**: User clicks first confirmation, state updates, but second prompt doesn't show  
**Likelihood**: Medium  
**Impact**: High (blocks save)  
**Mitigation**: Use `flushSync` for critical state updates (already used in validation)
```javascript
import { flushSync } from 'react-dom';

flushSync(() => {
  setCurrentPromptType('to-next');
  setShowExtendedFastPrompt(true);
});
```

### Risk 2: Validation Errors Not Visible
**Scenario**: User clicks confirmation button, validation fails, but errors show above (out of viewport)  
**Likelihood**: Medium  
**Impact**: Medium (confusing UX)  
**Mitigation**: Scroll to first error on validation failure
```javascript
if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors);
  // Scroll to first error
  const firstErrorField = Object.keys(validationErrors)[0];
  document.getElementById(`entry-${firstErrorField}`)?.scrollIntoView({ behavior: 'smooth' });
  return;
}
```

### Risk 3: Race Condition (Multiple Clicks)
**Scenario**: User rapidly clicks confirmation button, triggers multiple API calls  
**Likelihood**: Low (buttons disabled on first click)  
**Impact**: High (duplicate entries)  
**Mitigation**: Already handled by `isSubmitting` state + button `disabled` prop

### Risk 4: Screen Reader Context Loss
**Scenario**: Button replacement announced, but user doesn't understand what changed  
**Likelihood**: Low  
**Impact**: Medium (accessibility violation)  
**Mitigation**: Include context in `sr-only` text: "Extended fast detected from previous entry on October 23rd. Confirmation required before saving."

---

## Testing Strategy

### Unit Tests (EntryForm.test.js)

**New Test Cases**:
1. ✅ **Inline positioning**: Confirmation buttons replace submit button (not both visible)
2. ✅ **Single click save**: Clicking "Yes, confirm" immediately saves (no second click)
3. ✅ **Loading state**: Both buttons disabled during save operation
4. ✅ **Sequential flow**: Two confirmations shown inline before save (no page refresh)
5. ✅ **Field change reset**: Changing time after confirmation reverts to submit button
6. ✅ **Error handling**: API error shows above confirmation buttons, buttons stay clickable
7. ✅ **Accessibility**: Live region announces button replacement
8. ✅ **Mobile responsive**: Buttons stack vertically on small screens (CSS test or visual regression)

**Existing Tests to Update**:
- Lines 835-870: Extended fast confirmation flow (update assertions for inline positioning)
- Lines 932-970: Form submission with confirmed fast (update to expect single click)
- Lines 1055-1110: Clear confirmation on date change (add time change test)

### Integration Tests
- **Not required**: No API changes, existing `/api/entries/check-previous` and `PUT /api/entries/[id]` work as-is

### E2E Tests (Playwright) - Deferred
- Manual QA sufficient for UI repositioning
- E2E tests can be added post-deployment if needed

---

## Performance Considerations

### No Performance Impact
- **Reason**: UI repositioning only, no new API calls or data processing
- **State updates**: Same number of state variables, same update frequency
- **Re-renders**: Conditional rendering prevents dual-render (prompt + button never both visible)
- **Bundle size**: No new dependencies, same Button component reused

### Metrics
- **Time to Interactive**: No change (same React component mount time)
- **First Contentful Paint**: No change (form renders identically initially)
- **Interaction Response**: < 100ms (instant button swap on state change)

---

## Open Questions

None - all research questions resolved. Ready for implementation.

---

## References

- **Existing Implementation**: `src/components/organisms/EntryForm.js` lines 430-670
- **Extended Fast Detection API**: `src/app/api/entries/check-previous/route.js`
- **Entry Update API**: `src/app/api/entries/[id]/route.js`
- **Existing Tests**: `tests/unit/components/organisms/EntryForm.test.js`
- **Button Component**: `src/components/atoms/Button.js`
- **Constitution**: `.specify/memory/constitution.md` (TDD, mobile-first, accessibility requirements)
