# Data Model: Toast Notification System

**Feature**: 021-toast-notifications  
**Date**: October 28, 2025  
**Status**: Complete

## Overview

This document defines the data structures and state management for the toast notification system. The system uses ephemeral React state (no database persistence) managed via React Context with useReducer.

---

## Entities

### Toast

**Purpose**: Represents a single notification message displayed to the user.

**Type Definition**:
```typescript
interface Toast {
  id: string;                    // Unique identifier (timestamp + random)
  type: 'success' | 'error';     // Visual variant and ARIA role
  message: string;               // User-facing notification text
  timestamp: number;             // Creation time (Date.now()) for deduplication
  autoDismiss: boolean;          // true for success, false for error
  action?: {                     // Optional action button (P3 feature)
    label: string;               // Button text (e.g., "Retry", "View", "Undo")
    onAction: () => void;        // Callback function
  };
}
```

**Field Constraints**:
- `id`: Must be unique across all toasts. Format: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
- `type`: ENUM, only 'success' or 'error' allowed (FR-002)
- `message`: String, 10-200 characters recommended (FR-009), max 500 characters with truncation
- `timestamp`: Number (milliseconds since epoch), used for 1-second deduplication window (FR-008)
- `autoDismiss`: Boolean, derived from type (success=true, error=false per FR-003/FR-004)
- `action`: Optional object, undefined for toasts without action buttons

**Validation Rules**:
- Message must not be empty string
- Type must be 'success' or 'error'
- If action provided, both label and onAction required
- Timestamp must be valid number (Date.now())

**Example**:
```javascript
{
  id: '1698345600000-k3j2h4g5s',
  type: 'success',
  message: 'Entry saved successfully!',
  timestamp: 1698345600000,
  autoDismiss: true,
  action: undefined
}

{
  id: '1698345605000-p8m9n2v7x',
  type: 'error',
  message: 'Failed to delete user. Network error.',
  timestamp: 1698345605000,
  autoDismiss: false,
  action: {
    label: 'Retry',
    onAction: () => console.log('Retry clicked')
  }
}
```

**Lifecycle**:
1. **Created**: When showSuccess() or showError() called
2. **Queued**: If 4 toasts already displayed, added to queue
3. **Displayed**: Rendered in ToastContainer, auto-dismiss timer starts (if success)
4. **Dismissed**: User clicks close, Escape key, action button, or 5-second timer expires
5. **Removed**: Deleted from state, next queued toast (if any) moves to displayed

---

### ToastState

**Purpose**: Global state container managing active and queued toasts.

**Type Definition**:
```typescript
interface ToastState {
  displayed: Toast[];            // Currently visible toasts (max 4)
  queue: Toast[];                // Toasts waiting for display slot (FIFO)
  maxToasts: number;             // Display limit (const 4)
}
```

**Field Constraints**:
- `displayed`: Array of Toast objects, length ≤ 4 (FR-007)
- `queue`: Array of Toast objects, no max length (grows if many toasts triggered)
- `maxToasts`: Constant value 4, not user-configurable

**State Transitions**:

```
ADD_TOAST:
  IF duplicate (same message within 1 second)
    → Ignore (FR-008)
  ELSE IF displayed.length < 4
    → Add to displayed
  ELSE
    → Add to queue

REMOVE_TOAST:
  → Remove toast from displayed by id
  → IF queue.length > 0
      → Move queue[0] to displayed (FIFO)
      → Remove queue[0] from queue

CLEAR_ALL:
  → Set displayed = []
  → Set queue = []
```

**Example State**:
```javascript
{
  displayed: [
    { id: '1', type: 'success', message: 'Entry saved', ... },
    { id: '2', type: 'error', message: 'Network error', ... },
    { id: '3', type: 'success', message: 'Goal updated', ... }
  ],
  queue: [
    { id: '4', type: 'success', message: 'Settings saved', ... }
  ],
  maxToasts: 4
}
```

---

## State Management

### ToastContext

**Provider Pattern**: ToastProvider wraps root layout.js, making toast state globally available.

**Context Shape**:
```typescript
interface ToastContextValue {
  state: ToastState;
  dispatch: React.Dispatch<ToastAction>;
}
```

**Actions**:
```typescript
type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: { id: string } }
  | { type: 'CLEAR_ALL' };
```

**Reducer Logic**:
```javascript
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST': {
      const newToast = action.payload;
      
      // Deduplication check (FR-008)
      const isDuplicate = state.displayed.some(toast =>
        toast.message === newToast.message &&
        Date.now() - toast.timestamp < 1000
      );
      if (isDuplicate) return state;
      
      // Add to displayed or queue (FR-007)
      if (state.displayed.length < state.maxToasts) {
        return {
          ...state,
          displayed: [...state.displayed, newToast]
        };
      } else {
        return {
          ...state,
          queue: [...state.queue, newToast]
        };
      }
    }
    
    case 'REMOVE_TOAST': {
      const { id } = action.payload;
      const updatedDisplayed = state.displayed.filter(t => t.id !== id);
      
      // Process queue (FIFO)
      if (state.queue.length > 0) {
        const [nextToast, ...remainingQueue] = state.queue;
        return {
          ...state,
          displayed: [...updatedDisplayed, nextToast],
          queue: remainingQueue
        };
      }
      
      return {
        ...state,
        displayed: updatedDisplayed
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        displayed: [],
        queue: []
      };
    }
    
    default:
      return state;
  }
}
```

---

## Hook API

### useToast

**Purpose**: Provides clean API for components to trigger toast notifications.

**Type Definition**:
```typescript
interface UseToastReturn {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  clearAll: () => void;
}

interface ToastOptions {
  action?: {
    label: string;
    onAction: () => void;
  };
}
```

**Implementation**:
```javascript
export function useToast() {
  const { dispatch } = useContext(ToastContext);
  
  const showSuccess = useCallback((message, options = {}) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'success',
        message,
        timestamp: Date.now(),
        autoDismiss: true,
        action: options.action
      }
    });
  }, [dispatch]);
  
  const showError = useCallback((message, options = {}) => {
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'error',
        message,
        timestamp: Date.now(),
        autoDismiss: false,
        action: options.action
      }
    });
  }, [dispatch]);
  
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);
  
  return { showSuccess, showError, clearAll };
}
```

**Usage Examples**:
```javascript
// Simple success
const { showSuccess } = useToast();
showSuccess('Entry saved successfully!');

// Simple error
const { showError } = useToast();
showError('Failed to save entry. Please try again.');

// Error with retry action
showError('Failed to delete user', {
  action: {
    label: 'Retry',
    onAction: () => handleDelete(userId)
  }
});

// Success with view action
showSuccess('Entry created!', {
  action: {
    label: 'View',
    onAction: () => router.push(`/entries/${entryId}`)
  }
});

// Clear all toasts
const { clearAll } = useToast();
clearAll();
```

---

## Component State

### Toast Component (Individual)

**Internal State**:
```javascript
const [isVisible, setIsVisible] = useState(false);
const [isExiting, setIsExiting] = useState(false);
```

**State Transitions**:
1. **Mount**: isVisible=false → setTimeout → isVisible=true (triggers enter animation)
2. **Auto-dismiss** (success only): After 5s → setIsExiting=true → onDismiss()
3. **Manual dismiss**: User clicks X → setIsExiting=true → onDismiss()
4. **Action click**: User clicks action → action.onAction() → setIsExiting=true → onDismiss()

### ToastContainer Component

**Internal State**:
```javascript
// No local state - consumes ToastContext.state.displayed
const { state } = useContext(ToastContext);
```

**Effects**:
```javascript
// Escape key handler
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') clearAll();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [clearAll]);
```

---

## Persistence & Lifecycle

### Persistence Strategy

**Decision**: NO persistence (ephemeral state only)

**Rationale**:
- **FR-025**: "System MUST clear all toasts when user performs full page reload"
- **FR-026**: "System MUST persist toasts across client-side route transitions"
- **Implementation**: React Context state persists during Next.js router navigation (client-side) but clears on hard reload
- **No localStorage**: Unlike FastingGoalContext, toasts are transient notifications, not session data
- **No database**: Toasts are UI state, not domain data

### Lifecycle Rules

**Page Load**:
- ToastProvider mounts in root layout
- Initial state: { displayed: [], queue: [], maxToasts: 4 }
- No toasts displayed

**Client-Side Navigation** (Next.js router):
- Context state preserved
- Active toasts remain visible
- Auto-dismiss timers continue

**Hard Reload** (F5, Ctrl+R):
- Context state resets
- All toasts cleared (per FR-025)
- User must trigger new actions for feedback

**Tab Close/Browser Close**:
- State destroyed
- No persistence needed

---

## Validation & Error Handling

### Input Validation

**showSuccess() / showError()**:
```javascript
if (!message || typeof message !== 'string') {
  console.error('Toast message must be a non-empty string');
  return;
}

if (message.length > 500) {
  console.warn(`Toast message too long (${message.length} chars), truncating to 500`);
  message = message.substr(0, 497) + '...';
}

if (options.action) {
  if (!options.action.label || !options.action.onAction) {
    console.error('Toast action requires both label and onAction');
    return;
  }
}
```

### Reducer Validation

**ADD_TOAST**:
- Validate toast object shape
- Ensure id is unique
- Ensure type is 'success' or 'error'
- Validate timestamp is number

**REMOVE_TOAST**:
- Validate id exists in displayed array
- If not found, no-op (toast already dismissed)

### Error Boundaries

**ToastProvider wrapped in ErrorBoundary**:
```javascript
<ErrorBoundary fallback={<div>Toast system unavailable</div>}>
  <ToastProvider>
    {children}
  </ToastProvider>
</ErrorBoundary>
```

**Graceful Degradation**: If ToastContext fails, existing inline error messages remain functional (backward compatibility per FR-007).

---

## Performance Considerations

### Optimization Strategies

**Memoization**:
```javascript
// ToastContainer
const displayedToasts = useMemo(() => state.displayed, [state.displayed]);

// useToast hook
const showSuccess = useCallback(..., [dispatch]);
const showError = useCallback(..., [dispatch]);
const clearAll = useCallback(..., [dispatch]);
```

**Render Optimization**:
- Each Toast component manages own animation state (no re-render of siblings)
- ToastContainer only re-renders when displayed array changes
- Queue processing doesn't trigger re-renders (internal state update)

**Memory Management**:
- Toasts removed from state immediately on dismiss (no memory leaks)
- Timer cleanup in useEffect return
- Event listener cleanup in useEffect return

### Performance Targets

**Target** | **Measurement** | **Requirement**
-----------|-----------------|----------------
Toast Display Latency | Time from showSuccess() to visible | <100ms (FR-001: <500ms)
Animation Frame Time | Transition duration / frames | <16ms (60fps)
Context Update | dispatch() to state update | <10ms
Queue Processing | Time to move next toast | <5ms
Memory Usage | Context state size | <1KB (4 toasts × ~200 bytes)

---

## Testing Considerations

### Unit Test Scenarios

**Toast Entity**:
- ✓ Creates valid toast with required fields
- ✓ Generates unique id
- ✓ Sets correct autoDismiss based on type
- ✓ Validates message constraints

**ToastReducer**:
- ✓ ADD_TOAST adds to displayed when < 4
- ✓ ADD_TOAST adds to queue when = 4
- ✓ ADD_TOAST ignores duplicate within 1 second
- ✓ REMOVE_TOAST removes from displayed
- ✓ REMOVE_TOAST processes queue (FIFO)
- ✓ CLEAR_ALL empties both arrays

**useToast Hook**:
- ✓ showSuccess() creates success toast
- ✓ showError() creates error toast
- ✓ clearAll() dispatches CLEAR_ALL
- ✓ Options.action passed correctly

### Integration Test Scenarios

**Context + Component**:
- ✓ ToastProvider provides context to children
- ✓ useToast hook accesses context
- ✓ Toast component displays message
- ✓ Toast auto-dismisses after 5s (success)
- ✓ Toast persists (error)
- ✓ Escape key clears all toasts

### E2E Test Scenarios

**Full Workflows**:
- ✓ User saves entry → sees success toast → auto-dismisses
- ✓ User encounters error → sees error toast → manually dismisses
- ✓ User triggers 5 toasts → 4 displayed, 1 queued → queue processes
- ✓ User clicks retry action → callback fires → toast dismisses

---

## Summary

**Entities**: 2 (Toast, ToastState)  
**State Management**: React Context with useReducer  
**Hook API**: useToast (showSuccess, showError, clearAll)  
**Persistence**: None (ephemeral)  
**Validation**: Input validation, reducer validation, error boundaries  
**Performance**: Memoization, render optimization, <100ms latency  
**Testing**: Unit (reducer, hook), Integration (context), E2E (workflows)

All data structures defined and validated. Ready for contract generation (Phase 1 continued) and implementation (Phase 2).
