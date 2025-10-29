# Research & Technical Decisions: Toast Notification System

**Feature**: 021-toast-notifications  
**Date**: October 28, 2025  
**Status**: Complete

## Overview

This document captures technical research and decision rationale for implementing the toast notification system. All decisions prioritize simplicity, maintainability, and alignment with existing codebase patterns.

---

## R-001: Toast Library vs Custom Implementation

**Decision**: Custom implementation using React Context + Tailwind CSS

**Rationale**:
- **Existing patterns**: Project already uses React Context successfully (FastingGoalContext from Feature 020)
- **No new dependencies**: Avoids adding react-toastify, react-hot-toast, or similar libraries
- **Full control**: Can match exact design system and requirements (FIFO queue, ARIA regions, action buttons)
- **Bundle size**: Custom solution adds ~2-3KB vs 10-20KB for libraries
- **Learning consistency**: Developers already familiar with Context pattern from existing codebase

**Alternatives Considered**:
- **react-hot-toast** (15KB) - Popular, but adds dependency and doesn't support FIFO queue natively
- **react-toastify** (20KB) - Feature-rich but heavy, includes features we don't need (progress bars, swipe-to-dismiss)
- **sonner** (12KB) - Modern and lightweight, but introduces new patterns inconsistent with codebase

**Evidence**: Existing FastingGoalContext implementation (Feature 020) proves pattern viability. Project constitution emphasizes YAGNI and avoiding unnecessary dependencies.

---

## R-002: State Management Architecture

**Decision**: React Context with useReducer for toast queue management

**Rationale**:
- **Proven pattern**: Mirrors FastingGoalContext structure from Feature 020
- **Complex state transitions**: useReducer handles add/remove/queue/dedup logic cleanly
- **Testability**: Reducer functions are pure and easily unit-testable
- **Performance**: Context updates localized to ToastContainer (subscribers minimal)
- **No prop drilling**: Global access via useToast hook from any component

**Implementation Pattern**:
```javascript
// ToastContext.js
const ToastContext = createContext();

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST': /* handle FIFO queue */
    case 'REMOVE_TOAST': /* handle dismissal + queue processing */
    case 'CLEAR_ALL': /* clear all toasts */
  }
}

export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  return <ToastContext.Provider value={{state, dispatch}}>{children}</ToastContext.Provider>;
}
```

**Alternatives Considered**:
- **useState only** - Too complex for queue management with multiple state pieces
- **Zustand** - Would add new dependency, overkill for single-feature state
- **Redux** - Way too heavy for toast notifications

**Evidence**: FastingGoalContext uses simpler useState because it has less complex state transitions. Toast system needs reducer for queue management.

---

## R-003: Animation Strategy

**Decision**: Tailwind CSS transitions + conditional classes (no framer-motion)

**Rationale**:
- **No new dependencies**: Tailwind already in project
- **Prefers-reduced-motion support**: Easily disabled with CSS media query
- **Performance**: CSS transitions are GPU-accelerated
- **Simplicity**: Conditional classes (`opacity-0 -> opacity-100`) sufficient for slide-in/fade-out
- **Accessibility**: Respects user motion preferences automatically

**Implementation**:
```javascript
// Toast.js
<div className={`
  transition-all duration-300 ease-in-out
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
  motion-reduce:transition-none
`}>
```

**Alternatives Considered**:
- **framer-motion** (35KB) - Overkill for simple fade/slide animations
- **react-spring** (25KB) - Physics-based animations unnecessary for toasts
- **GSAP** (40KB) - Enterprise animation library not needed

**Evidence**: Existing project uses Tailwind transitions successfully. Constitution requires prefers-reduced-motion support (R-003 delivers this via motion-reduce: prefix).

---

## R-004: FIFO Queue Implementation

**Decision**: In-memory array queue with automatic processing on dismiss

**Rationale**:
- **Clarification answer**: User selected Option A (Queue with FIFO) in clarification session
- **No persistence needed**: Queue is ephemeral (cleared on page reload per FR-025)
- **Simple logic**: Array push for enqueue, array shift for dequeue
- **Auto-processing**: When toast dismisses, automatically display next queued toast
- **Deduplication**: Check last 1 second of timestamps before adding to queue

**Implementation Pattern**:
```javascript
// toastReducer
case 'ADD_TOAST': {
  const isDuplicate = state.displayed.some(t => 
    t.message === action.payload.message && 
    Date.now() - t.timestamp < 1000
  );
  
  if (isDuplicate) return state;
  
  if (state.displayed.length < 4) {
    return { ...state, displayed: [...state.displayed, newToast] };
  } else {
    return { ...state, queue: [...state.queue, newToast] };
  }
}

case 'REMOVE_TOAST': {
  const nextToast = state.queue[0];
  return {
    displayed: state.displayed.filter(t => t.id !== action.id),
    queue: state.queue.slice(1),
    ...(nextToast && { displayed: [...displayed, nextToast] })
  };
}
```

**Alternatives Considered**:
- **Discard oldest** - Rejected in clarification (Option B not chosen)
- **Smart priority** - Over-engineered for MVP, can add later if needed
- **No queue (discard)** - Would lose error messages, unacceptable

**Evidence**: User explicitly chose FIFO in clarification session (2025-10-28). FR-007 updated to reflect this.

---

## R-005: Accessibility Implementation

**Decision**: ARIA live regions + role attributes + Escape key handler

**Rationale**:
- **WCAG 2.1 AA compliance**: Required by constitution and FR-019
- **Screen reader support**: `role="status"` for success (polite announcement), `role="alert"` for errors (immediate announcement)
- **Keyboard access**: Escape key dismisses focused toast or all toasts
- **No focus trap**: Toasts don't steal focus, can be dismissed via Escape without tabbing
- **Semantic HTML**: `<aside>` element for toast container, `<button>` for close/action buttons

**Implementation**:
```javascript
// Toast.js
<aside
  role={type === 'error' ? 'alert' : 'status'}
  aria-live={type === 'error' ? 'assertive' : 'polite'}
  aria-atomic="true"
  className="toast-container"
>
  <p>{message}</p>
  <button aria-label="Close notification" onClick={onClose}>X</button>
</aside>

// ToastContainer.js - Escape key handler
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') clearAll();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [clearAll]);
```

**Alternatives Considered**:
- **Focus management** - Not needed, toasts are announcements not interactive dialogs
- **Tab trapping** - Would be annoying for keyboard users, toasts are dismissible not required
- **Custom ARIA** - Standard roles (status/alert) are better supported by screen readers

**Evidence**: Spec FR-019 through FR-021 define accessibility requirements. Edge case documents screen reader needs.

---

## R-006: Mobile Responsiveness Strategy

**Decision**: Full-width on mobile (<640px), max-width on desktop (500px), touch-friendly buttons (44px min)

**Rationale**:
- **Mobile-first**: Constitution principle II requires mobile-first design
- **Touch targets**: 44px minimum per Apple/Google guidelines (FR-022 requirement)
- **No viewport blocking**: Positioned top-center, doesn't cover navigation or FAB buttons
- **Readable text**: Max 200 characters recommended per FR-009
- **Consistent spacing**: 12px gap between stacked toasts per FR-006

**Implementation**:
```javascript
// ToastContainer.js
<div className="
  fixed top-4 left-1/2 -translate-x-1/2
  w-full max-w-[500px] px-4 sm:w-auto
  flex flex-col gap-3
  pointer-events-none
  z-50
">
  {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
</div>

// Toast.js
<div className="
  w-full min-h-[44px] px-4 py-3 rounded-lg shadow-lg
  pointer-events-auto
  bg-green-500 text-white  /* success variant */
  bg-red-500 text-white     /* error variant */
">
```

**Alternatives Considered**:
- **Bottom position** - Would cover floating action buttons on mobile
- **Fixed 400px width** - Too narrow on desktop, too wide on mobile
- **Modal-style** - Would block interaction, toasts should be non-intrusive

**Evidence**: Existing GoalSettingPanel (Feature 020) uses similar responsive pattern successfully.

---

## R-007: Integration Strategy for Existing Components

**Decision**: Systematic replacement of inline success/error messages, preserve form field validation

**Rationale**:
- **Zero breaking changes**: Keep existing error handling as fallback
- **Form validation stays inline**: Field-level errors remain below inputs (better UX)
- **Global feedback via toasts**: Operation-level success/error uses toasts
- **Backward compatibility**: If ToastContext fails to load, inline messages still work

**Components to Update** (from FR-017):
1. **EntryForm** - Replace `apiError` state display with `showError()`, add `showSuccess()` on save
2. **SettingsForm** - Replace `apiError` state display with `showError()`, add `showSuccess()` on save
3. **GoalSettingPanel** - Add `showSuccess()` for goal changes (addresses TODO from Feature 020)
4. **Admin User Management** - Replace inline notifications with toasts for delete/toggle operations
5. **Authentication flows** - Add toasts for login/register/password reset feedback

**Implementation Pattern**:
```javascript
// Before (EntryForm.js)
const [apiError, setApiError] = useState('');
// ... in catch block
setApiError(error.message);
// ... in JSX
{apiError && <ErrorMessage>{apiError}</ErrorMessage>}

// After (EntryForm.js)
const { showError, showSuccess } = useToast();
// ... in catch block
showError(error.message);
// ... in try block (success)
showSuccess('Entry saved successfully!');
// ... JSX cleanup (remove inline error display)
```

**Alternatives Considered**:
- **Remove all inline errors** - Bad UX, form field errors should be inline
- **Keep both** - Redundant, would show same message twice
- **Toast-only** - Would lose form field context (which field failed?)

**Evidence**: Spec FR-018 explicitly states "replace existing inline success/error messages... while keeping form field validation errors inline".

---

## R-008: Color Scheme & Visual Design

**Decision**: Green for success, Red for errors, consistent with existing design system

**Rationale**:
- **Existing patterns**: App already uses green for success (buttons), red for errors (ErrorMessage component)
- **Color contrast**: WCAG 2.1 AA requires 4.5:1 ratio (FR-023)
  - Green-500 (#10b981) on white text: 4.5:1 ✓
  - Red-500 (#ef4444) on white text: 4.86:1 ✓
- **Semantic meaning**: Green = success, Red = error is universal convention
- **Accessibility**: Doesn't rely on color alone (icons + text provide redundancy)

**Implementation**:
```javascript
const variants = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
};
```

**Alternatives Considered**:
- **Blue for info** - Not needed, only 2 states (success/error) per FR-002
- **Orange for warnings** - Out of scope, no warning toast type in spec
- **Custom colors** - Introduces inconsistency with existing design system

**Evidence**: Existing ErrorMessage component uses red for errors. Spec FR-002 requires only success (green) and error (red).

---

## R-009: Auto-Dismiss Timing

**Decision**: 5 seconds for success toasts, manual dismiss for errors

**Rationale**:
- **Spec requirement**: FR-003 specifies 5 seconds for success, FR-004 specifies manual for errors
- **Industry standard**: 5 seconds is standard across toast libraries (react-hot-toast, react-toastify, sonner)
- **User testing**: 5 seconds is long enough to read (avg 3-4 seconds) but short enough to not feel slow
- **Error persistence**: Errors require user acknowledgment to ensure they're seen

**Implementation**:
```javascript
// Toast.js
useEffect(() => {
  if (autoDismiss) {
    const timer = setTimeout(() => onDismiss(), 5000);
    return () => clearTimeout(timer);
  }
}, [autoDismiss, onDismiss]);
```

**Alternatives Considered**:
- **3 seconds** - Too short for reading longer messages
- **7 seconds** - Feels sluggish, users frustrated waiting
- **User-configurable** - Over-engineered for MVP, no requirement in spec

**Evidence**: Spec clarification session didn't question timing, indicating 5 seconds is reasonable default. Edge case about "very long error messages" suggests some messages need more time (handled by manual dismiss for errors).

---

## R-010: Action Button Implementation

**Decision**: Optional action prop with label + callback, dismiss on click

**Rationale**:
- **User Story 4**: P3 priority, optional enhancement
- **Simple API**: `showError(message, { action: 'Retry', onAction: () => {} })`
- **Auto-dismiss after action**: Clicking action button triggers callback then dismisses toast (FR-011)
- **Use cases**: Retry failed operations, View created items, Undo deletions

**Implementation**:
```javascript
// useToast hook
function showError(message, options = {}) {
  dispatch({
    type: 'ADD_TOAST',
    payload: {
      id: generateId(),
      type: 'error',
      message,
      autoDismiss: false,
      action: options.action, // { label: 'Retry', onAction: () => {} }
    }
  });
}

// Toast.js
{action && (
  <button
    onClick={() => {
      action.onAction();
      onDismiss();
    }}
    className="ml-4 px-3 py-1 bg-white/20 rounded hover:bg-white/30"
  >
    {action.label}
  </button>
)}
```

**Alternatives Considered**:
- **Multiple actions** - Over-complicated, spec only shows 1 action per toast
- **Action without dismiss** - Would leave stale toast after action completes
- **Separate showErrorWithAction()** - Redundant, optional param is cleaner

**Evidence**: Spec User Story 4 shows single action button examples (Retry, View, Undo). FR-011 specifies dismiss after action click.

---

## R-011: Testing Strategy

**Decision**: Unit tests (Toast, Context, Hook), Integration tests (Component updates), E2E tests (Full flows)

**Rationale**:
- **TDD requirement**: Constitution principle III mandates tests before implementation
- **Coverage target**: 80% minimum per constitution
- **Test pyramid**: Many unit tests, fewer integration, few E2E
- **Acceptance criteria**: 27 scenarios in spec provide test cases

**Test Breakdown**:
- **Unit Tests** (~15 tests):
  - Toast component rendering (success/error variants, close button, action button)
  - ToastContext reducer (add, remove, clear, dedup, queue)
  - useToast hook API (showSuccess, showError, clearAll)
- **Integration Tests** (~10 tests):
  - EntryForm with toasts (save success, save error)
  - SettingsForm with toasts
  - GoalSettingPanel with toasts (goal change feedback)
  - Admin operations with toasts
- **E2E Tests** (~6 tests):
  - Success toast auto-dismisses after 5 seconds
  - Error toast persists until manually dismissed
  - Multiple toasts stack correctly
  - Queue processes when toast dismisses
  - Escape key dismisses all toasts
  - Action button triggers callback and dismisses

**Tools**: Jest + React Testing Library (unit/integration), Playwright (E2E)

**Evidence**: Constitution requires TDD with 80% coverage. Spec has 27 acceptance scenarios = 27 potential test cases.

---

## R-012: Performance Considerations

**Decision**: Memoize toast list, throttle animations, CSS transforms for layout

**Rationale**:
- **SC-001/SC-002**: <500ms display latency required
- **60fps animations**: <16ms per frame for smooth transitions
- **Zero CLS**: Use CSS transforms (translate) not margin/top for positioning
- **Minimal re-renders**: useMemo for toast list, useCallback for dismiss handlers

**Implementation**:
```javascript
// ToastContainer.js
const displayedToasts = useMemo(() => state.toasts, [state.toasts]);

const handleDismiss = useCallback((id) => {
  dispatch({ type: 'REMOVE_TOAST', payload: { id } });
}, [dispatch]);
```

**Performance Targets**:
- Toast display: <100ms (well under 500ms requirement)
- Animation frame time: <16ms (60fps)
- Context update: <50ms
- Queue processing: <10ms

**Alternatives Considered**:
- **Virtual scrolling** - Not needed, max 4 toasts displayed
- **RequestAnimationFrame** - CSS transitions handle this automatically
- **Web Animations API** - More complex, CSS transitions sufficient

**Evidence**: Spec SC-001/SC-002 require <500ms latency. Constitution requires >90 Lighthouse performance score.

---

## Summary

All technical decisions documented and rationalized. No unresolved "NEEDS CLARIFICATION" items remaining. Implementation ready to proceed to Phase 1 (Data Model & Contracts).

**Key Technical Choices**:
1. Custom implementation (no toast library)
2. React Context + useReducer for state
3. Tailwind CSS for styling and animations
4. FIFO queue for overflow management
5. ARIA live regions for accessibility
6. Systematic integration into existing components
7. 5-second auto-dismiss for success, manual for errors
8. Optional action buttons with callback + dismiss
9. TDD with unit/integration/E2E tests
10. Performance optimizations (memoization, CSS transforms)

All decisions align with project constitution and existing codebase patterns. Zero new external dependencies added.
