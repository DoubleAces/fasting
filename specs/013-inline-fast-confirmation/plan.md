# Implementation Plan: Inline Extended Fast Confirmation

**Branch**: `013-inline-fast-confirmation` | **Date**: October 25, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-inline-fast-confirmation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Move extended fast confirmation UI from top of form to bottom, replacing the "Update Entry" button. When user clicks "Update Entry" and an extended fast is detected, show inline confirmation buttons that immediately save the entry when clicked - eliminating the two-click flow. Non-extended fasts continue to save immediately with no interruption.

## Technical Context

**Language/Version**: JavaScript (ES6+) with React 18  
**Primary Dependencies**: Next.js 15.5.6 (App Router), React Hook Form, Tailwind CSS  
**Storage**: MongoDB with Mongoose ODM (Entry model with extendedFastConfirmed fields)  
**Testing**: Jest + React Testing Library for component tests, existing test patterns for form submission  
**Target Platform**: Web (desktop and mobile browsers), mobile-first responsive design  
**Project Type**: Next.js web application with Server/Client Component architecture  
**Performance Goals**: UI response within 100ms, form submission within 2 seconds  
**Constraints**: Mobile touch targets (44x44px min), keyboard navigation, screen reader support  
**Scale/Scope**: Single form component modification (EntryForm.js ~679 lines), affects entry edit flow only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Next.js Best Practices
- ✅ **PASS**: Modification affects Client Component (EntryForm.js) only - appropriate use case
- ✅ **PASS**: No new Server Components needed, follows existing architecture patterns
- ✅ **PASS**: Uses built-in Next.js routing for post-save navigation (router.push)

### II. Mobile-First Responsive Design
- ✅ **PASS**: Touch targets maintained (buttons are 44x44px minimum via Tailwind CSS Button component)
- ✅ **PASS**: Inline buttons at bottom improve mobile UX (closer to thumb zone)
- ⚠️ **REVIEW**: Must verify two inline buttons fit horizontally on smallest mobile screens (320px width)

### III. Test-Driven Development (NON-NEGOTIABLE)
- ✅ **PASS**: TDD mandatory - tests must be written first showing current behavior, then failing tests for new behavior
- ✅ **PASS**: Existing EntryForm.test.js has 1000+ lines covering extended fast flows
- ✅ **PASS**: Test structure already covers: prompt display, confirmation buttons, form submission with flags

**Action Required**: Write failing tests for inline positioning before implementation

### IV. Component Architecture
- ✅ **PASS**: EntryForm already self-contained, changes remain within single component
- ✅ **PASS**: Uses existing Button atom component (reusable)
- ✅ **PASS**: Props interface unchanged (entry, settings, onSuccess, onCancel)

### V. User Privacy & Data Security
- ✅ **PASS**: No new data collection or storage
- ✅ **PASS**: Uses existing extendedFastConfirmed fields
- ✅ **PASS**: No changes to authentication or API security

### VI. Performance & Accessibility
- ✅ **PASS**: No performance impact (UI reposition only, same logic)
- ✅ **PASS**: Semantic HTML maintained (button elements with proper labels)
- ✅ **PASS**: Keyboard navigation preserved (buttons are focusable)
- ⚠️ **REVIEW**: Must verify screen reader announces button replacement correctly

**Gate Decision**: ✅ **PROCEED** - All critical gates pass, two minor reviews flagged for implementation phase

## Project Structure

### Documentation (this feature)

```
specs/013-inline-fast-confirmation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── components/
│   └── organisms/
│       └── EntryForm.js          # PRIMARY: Extended fast confirmation UI repositioning
├── app/
│   └── entries/
│       └── [id]/
│           └── edit/
│               ├── page.js        # UNCHANGED: Server Component (passes data to wrapper)
│               └── EntryFormWrapper.js  # UNCHANGED: Client wrapper (navigation only)
└── lib/
    ├── models/
    │   └── Entry.js              # UNCHANGED: Mongoose model (fields already exist)
    └── validation/
        └── entrySchema.js        # UNCHANGED: Joi validation (fields already exist)

tests/
└── unit/
    └── components/
        └── organisms/
            └── EntryForm.test.js  # PRIMARY: Add tests for inline confirmation flow
```

**Key File**: `src/components/organisms/EntryForm.js` (~679 lines)
- Lines 430-530: Current extended fast prompt UI (top of form, purple box)
- Lines 665-670: Current submit button rendering
**Key File**: `src/components/organisms/EntryForm.js` (~679 lines)
- Lines 430-530: Current extended fast prompt UI (top of form, purple box)
- Lines 665-670: Current submit button rendering
- **Target**: Move confirmation buttons from lines 500-520 to replace submit button at lines 665-670 when extended fast detected

## Complexity Tracking

*No violations - all Constitution gates passed. See Constitution Check section above.*

---

## Phase 0: Research

### Research Questions

1. **UI State Management**: How to conditionally render confirmation buttons vs submit button?
   - **Answer**: Use existing `showExtendedFastPrompt` state to control rendering at form actions section
   - **Pattern**: `{showExtendedFastPrompt ? <ConfirmationButtons /> : <SubmitButton />}`

2. **Button Click Handlers**: How to combine confirmation + save in single action?
   - **Answer**: Modify `handleExtendedFastConfirm` and `handleExtendedFastDeny` to trigger form submission after setting confirmation state
   - **Pattern**: Call existing `handleSubmit` logic directly within confirmation handlers

3. **Sequential Confirmation**: How to handle "from previous" + "to next" extended fasts inline?
   - **Answer**: After first confirmation click, check if second confirmation needed; if yes show second buttons inline; if no, proceed with save
   - **Current Pattern**: Already implemented in lines 218-226, reuse same logic

4. **Form Reset**: When should confirmation buttons revert to "Update Entry"?
   - **Answer**: When user changes `firstMealTime` or `lastMealTime` after confirmation appears, clear `gapInfo` state
   - **Pattern**: Add cleanup in `handleChange` for time fields

### Research Findings

**Decision 1: Inline Positioning Strategy**
- **Rationale**: Form already has section structure (fields, then actions). Simply move confirmation UI from "Extended Fast Confirmation Prompt" section (lines 450+) to "Form Actions" section (lines 660+)
- **Alternatives Considered**: 
  - Portal/modal: Rejected (violates requirement for inline positioning)
  - Separate component: Rejected (adds complexity, same component works better)

**Decision 2: Save Action Integration**
- **Rationale**: Extract form submission logic from `handleSubmit` into reusable function `submitForm()`. Call from both submit button click and confirmation button clicks.
- **Alternatives Considered**:
  - Programmatic form submit: Rejected (doesn't bypass validation, still requires two clicks)
  - State flag then auto-submit: Rejected (React state batching may cause timing issues)

**Decision 3: Loading State Management**
- **Rationale**: Reuse existing `isSubmitting` state for both submit button and confirmation buttons. Disable all buttons when `isSubmitting === true`.
- **Alternatives Considered**:
  - Separate loading state: Rejected (adds redundant state, same behavior needed)
  - Button-level loading: Rejected (both buttons should disable together)

**Decision 4: Accessibility**  
- **Rationale**: Use ARIA live region to announce button replacement to screen readers. Add `aria-live="polite"` to form actions container.
- **Alternatives Considered**:
  - Focus management: Rejected (interrupts user, may confuse)
  - No announcement: Rejected (violates WCAG 2.1 AA)

---

## Phase 1: Design & Contracts

### Data Model

**No Changes Required** - Feature uses existing Entry model fields:
- `extendedFastConfirmed` (Boolean)
- `extendedFastDenied` (Boolean)
- `extendedFastFromPreviousConfirmed` (Boolean)
- `extendedFastToNextDenied` (Boolean)

See existing data model: `src/lib/models/Entry.js` lines 103-125

### API Contracts

**No Changes Required** - Feature uses existing endpoints:

**GET /api/entries/check-previous**
- Purpose: Detect extended fasts before/after current entry
- Request: `?date=YYYY-MM-DD&firstMealTime=HH:mm&lastMealTime=HH:mm`
- Response: `{ isExtendedFast, isExtendedFastFromPrevious, isExtendedFastToNext, fromPreviousFasting, toNextFasting, previousEntry, nextEntry }`
- Status: Already implemented, no changes

**PUT /api/entries/[id]**
- Purpose: Update existing entry
- Request body: `{ date, firstMealTime, lastMealTime, extendedFastConfirmed, extendedFastDenied, extendedFastToNextDenied, ... }`
- Response: `{ success: true, data: Entry }`
- Status: Already implemented, no changes

### Component Contracts

**EntryForm.js** (Modified)

**Current Behavior**:
```javascript
// Lines 430-530: Extended fast prompt at top of form
{showExtendedFastPrompt && gapInfo && (
  <div className="p-4 bg-purple-50 ...">
    <Button onClick={handleExtendedFastConfirm}>Yes, confirm extended fast</Button>
    <Button onClick={handleExtendedFastDeny}>No, I ate but didn't log</Button>
  </div>
)}

// Lines 665-670: Submit button at bottom
<Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Entry' : 'Save Entry'}
</Button>
```

**New Behavior**:
```javascript
// Lines 430-530: REMOVE extended fast prompt section

// Lines 665-670: Conditional rendering of buttons OR confirmation
<div aria-live="polite">
  {showExtendedFastPrompt && gapInfo ? (
    // Inline confirmation buttons
    <div className="space-y-3">
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-900 font-semibold mb-2">
          Extended Fast Detected ({gapInfo.fromPreviousFasting.formatted || gapInfo.toNextFasting.formatted})
        </p>
        <p className="text-xs text-purple-800 mb-3">
          Did you fast continuously for this entire period?
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={handleExtendedFastConfirmAndSave}
          disabled={isSubmitting}
          loading={isSubmitting}
          variant="primary"
        >
          Yes, confirm extended fast
        </Button>
        <Button 
          onClick={handleExtendedFastDenyAndSave}
          disabled={isSubmitting}
          variant="secondary"
        >
          No, I ate but didn't log
        </Button>
      </div>
    </div>
  ) : (
    // Regular submit button
    <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
      {isSubmitting ? 'Saving...' : isEditMode ? 'Update Entry' : 'Save Entry'}
    </Button>
  )}
</div>
```

**New Functions**:
- `handleExtendedFastConfirmAndSave()`: Set confirmation state + call `submitForm()`
- `handleExtendedFastDenyAndSave()`: Set denial state + call `submitForm()`
- `submitForm()`: Extracted submission logic (validation + API call)

**State Changes**:
- Remove top-of-form prompt rendering (lines 450-530)
- Add field change listeners to reset `gapInfo` when times change
- Maintain all existing state variables (`showExtendedFastPrompt`, `gapInfo`, `isSubmitting`, etc.)

---

## Implementation Strategy

### Phase 2 Tasks (Generated by /speckit.tasks)

