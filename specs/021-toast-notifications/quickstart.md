# Quickstart Guide: Toast Notification System

**Feature**: 021-toast-notifications  
**Date**: October 28, 2025  
**For**: Developers implementing this feature

## Overview

This guide walks you through implementing the toast notification system step-by-step. Follow the phases in order, writing tests before implementation (TDD).

---

## Prerequisites

- Feature 020 (Fasting Goal Timer) complete - provides React Context pattern reference
- Understanding of React Context API and useReducer
- Familiarity with Tailwind CSS and existing component structure
- Jest + React Testing Library setup (already in project)

---

## Phase 1: Core Toast System (P1 - Success & Error Feedback)

### Step 1.1: Create ToastContext

**File**: `src/contexts/ToastContext.js`

**Test First** (`tests/unit/contexts/ToastContext.test.js`):
```javascript
describe('ToastContext', () => {
  it('provides initial empty state', () => {
    // Test ToastProvider renders and provides empty displayed/queue
  });
  
  it('adds toast to displayed when < 4', () => {
    // Test ADD_TOAST action with empty displayed array
  });
  
  it('adds toast to queue when displayed is full', () => {
    // Test ADD_TOAST action with 4 toasts displayed
  });
  
  it('deduplicates identical messages within 1 second', () => {
    // Test duplicate detection logic
  });
  
  it('removes toast and processes queue (FIFO)', () => {
    // Test REMOVE_TOAST with queued toast
  });
  
  it('clears all toasts', () => {
    // Test CLEAR_ALL action
  });
});
```

**Then Implement**:
- ToastReducer with ADD_TOAST, REMOVE_TOAST, CLEAR_ALL actions
- ToastProvider component wrapping children
- Export ToastContext

**Key Logic**: See `data-model.md` reducer implementation

**Acceptance Criteria**:
- ✓ All ToastContext tests pass
- ✓ Provider renders children without errors
- ✓ FIFO queue processes correctly
- ✓ Deduplication works (1-second window)

---

### Step 1.2: Create useToast Hook

**File**: `src/hooks/useToast.js`

**Test First** (`tests/unit/hooks/useToast.test.js`):
```javascript
describe('useToast', () => {
  it('throws error when used outside ToastProvider', () => {
    // Test context requirement
  });
  
  it('showSuccess creates success toast with autoDismiss=true', () => {
    // Test success toast structure
  });
  
  it('showError creates error toast with autoDismiss=false', () => {
    // Test error toast structure
  });
  
  it('showError with action includes action object', () => {
    // Test options.action
  });
  
  it('clearAll dispatches CLEAR_ALL action', () => {
    // Test clearAll function
  });
});
```

**Then Implement**:
- useContext(ToastContext) with validation
- showSuccess(message, options) function
- showError(message, options) function
- clearAll() function
- Generate unique IDs (timestamp + random)

**Acceptance Criteria**:
- ✓ All useToast tests pass
- ✓ Hook generates unique toast IDs
- ✓ Success toasts have autoDismiss=true
- ✓ Error toasts have autoDismiss=false
- ✓ Action options passed correctly

---

### Step 1.3: Create Toast Component

**File**: `src/components/molecules/Toast.js`

**Test First** (`tests/unit/components/Toast.test.js`):
```javascript
describe('Toast Component', () => {
  it('renders success toast with green background', () => {
    // Test success variant styling
  });
  
  it('renders error toast with red background', () => {
    // Test error variant styling
  });
  
  it('displays message text', () => {
    // Test message rendering
  });
  
  it('shows close button (X)', () => {
    // Test close button presence
  });
  
  it('calls onDismiss when close button clicked', () => {
    // Test dismiss handler
  });
  
  it('auto-dismisses success toast after 5 seconds', () => {
    // Test autoDismiss timer
  });
  
  it('does NOT auto-dismiss error toast', () => {
    // Test error persistence
  });
  
  it('renders action button when provided', () => {
    // Test action button display
  });
  
  it('calls action.onAction and dismisses when action clicked', () => {
    // Test action callback + dismiss
  });
  
  it('has correct ARIA attributes', () => {
    // Test role="status" for success, role="alert" for error
  });
});
```

**Then Implement**:
- Toast component with type prop (success/error)
- Conditional styling (green for success, red for error)
- Close button with onDismiss handler
- Auto-dismiss useEffect (if autoDismiss=true, setTimeout 5s)
- Action button (if action provided)
- ARIA attributes (role, aria-live, aria-atomic)
- Enter/exit animations (Tailwind transitions)

**Styling**:
```javascript
const variants = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
};

// Component classes
className={`
  w-full min-h-[44px] px-4 py-3 rounded-lg shadow-lg
  flex items-center justify-between gap-3
  ${variants[type]}
  transition-all duration-300 ease-in-out
  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
  motion-reduce:transition-none
  pointer-events-auto
`}
```

**Acceptance Criteria**:
- ✓ All Toast component tests pass
- ✓ Success toasts auto-dismiss after 5 seconds
- ✓ Error toasts persist until manually dismissed
- ✓ Close button dismisses immediately
- ✓ Action button works (callback + dismiss)
- ✓ ARIA attributes correct for screen readers
- ✓ Animations respect prefers-reduced-motion

---

### Step 1.4: Create ToastContainer Component

**File**: `src/components/organisms/ToastContainer.js`

**Test First** (`tests/unit/components/ToastContainer.test.js`):
```javascript
describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    // Test empty state
  });
  
  it('renders displayed toasts', () => {
    // Test toast rendering from context
  });
  
  it('stacks multiple toasts vertically', () => {
    // Test flexbox layout with gap
  });
  
  it('clears all toasts when Escape key pressed', () => {
    // Test Escape key handler
  });
  
  it('positions toasts at top-center', () => {
    // Test fixed positioning
  });
  
  it('is responsive (full-width on mobile)', () => {
    // Test responsive classes
  });
});
```

**Then Implement**:
- Container div with fixed positioning (top-center)
- Map over displayed toasts from context
- Render Toast component for each
- Escape key event listener (clearAll)
- Cleanup event listener on unmount

**Styling**:
```javascript
className="
  fixed top-4 left-1/2 -translate-x-1/2
  w-full max-w-[500px] px-4 sm:w-auto
  flex flex-col gap-3
  pointer-events-none
  z-50
"
```

**Acceptance Criteria**:
- ✓ All ToastContainer tests pass
- ✓ Toasts stack vertically with 12px gap
- ✓ Positioned top-center of viewport
- ✓ Escape key clears all toasts
- ✓ Responsive (full-width on mobile, max-width on desktop)
- ✓ High z-index (above all content)

---

### Step 1.5: Integrate ToastProvider in Root Layout

**File**: `src/app/layout.js` (modify existing)

**Test**: Manual testing (E2E later)

**Changes**:
```javascript
import { ToastProvider } from '@/contexts/ToastContext';
import ToastContainer from '@/components/organisms/ToastContainer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
```

**Acceptance Criteria**:
- ✓ ToastProvider wraps entire app
- ✓ ToastContainer rendered globally
- ✓ No errors in browser console
- ✓ Dev server compiles successfully

---

### Step 1.6: Integration Testing - EntryForm

**File**: `tests/unit/integration/EntryForm.toast.test.js`

**Test First**:
```javascript
describe('EntryForm with Toasts', () => {
  it('shows success toast when entry saved', async () => {
    // Mock successful API response
    // Submit form
    // Assert toast displayed with "Entry saved successfully!"
  });
  
  it('shows error toast when save fails', async () => {
    // Mock API error
    // Submit form
    // Assert toast displayed with error message
  });
  
  it('removes inline apiError display', () => {
    // Verify inline error message removed from JSX
  });
});
```

**Then Modify**: `src/components/organisms/EntryForm.js`

**Changes**:
```javascript
import { useToast } from '@/hooks/useToast';

export default function EntryForm({ entry, onSuccess, onCancel }) {
  const { showSuccess, showError } = useToast();
  // Remove: const [apiError, setApiError] = useState('');
  
  const handleSubmit = async (e) => {
    try {
      // ... existing save logic
      showSuccess('Entry saved successfully!');
      if (onSuccess) onSuccess(result);
    } catch (error) {
      showError(error.message || 'Failed to save entry. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Remove: {apiError && <ErrorMessage>{apiError}</ErrorMessage>} */}
      {/* Keep form field errors inline */}
    </form>
  );
}
```

**Acceptance Criteria**:
- ✓ Integration tests pass
- ✓ Toast shows on success
- ✓ Toast shows on error
- ✓ Inline apiError removed
- ✓ Form field validation errors still inline
- ✓ 39 existing EntryForm tests still pass (no regressions)

---

### Step 1.7: Repeat Integration for Other Components

**Components to Update**:
1. ✓ `SettingsForm.js` - Settings update success/error
2. ✓ `GoalSettingPanel.js` - Goal change success (addresses TODO from Feature 020)
3. ✓ `LoginForm.js` - Login success/error
4. ✓ `RegisterForm.js` - Registration success/error
5. ✓ `ForgotPasswordForm.js` - Password reset email sent
6. ✓ `ResetPasswordForm.js` - Password reset success/error
7. ✓ Admin User Management - Delete/toggle admin success/error

**Pattern for Each**:
1. Write integration test
2. Import useToast hook
3. Replace inline success/error with showSuccess/showError
4. Remove inline error state display
5. Run tests (ensure no regressions)

**Testing Checklist**:
```
□ SettingsForm integration tests pass
□ GoalSettingPanel integration tests pass
□ LoginForm integration tests pass
□ RegisterForm integration tests pass
□ ForgotPasswordForm integration tests pass
□ ResetPasswordForm integration tests pass
□ Admin components integration tests pass
□ All existing tests still pass (no breaking changes)
```

---

## Phase 2: E2E Testing

### Step 2.1: Create E2E Test Suite

**File**: `tests/e2e/toast-notifications.spec.js`

**Tests to Implement**:
```javascript
test('Success toast auto-dismisses after 5 seconds', async ({ page }) => {
  // Navigate to entries page
  // Perform save action
  // Assert toast visible
  // Wait 5 seconds
  // Assert toast dismissed
});

test('Error toast persists until manually dismissed', async ({ page }) => {
  // Trigger error (invalid input)
  // Assert error toast visible
  // Wait 10 seconds
  // Assert still visible
  // Click close button
  // Assert dismissed
});

test('Multiple toasts stack correctly', async ({ page }) => {
  // Trigger 3 toasts quickly
  // Assert all 3 visible
  // Assert stacked vertically with spacing
});

test('Queue processes when toast dismisses', async ({ page }) => {
  // Trigger 5 toasts rapidly
  // Assert only 4 visible
  // Wait for first to dismiss
  // Assert 5th toast now visible
});

test('Escape key dismisses all toasts', async ({ page }) => {
  // Trigger 3 toasts
  // Press Escape key
  // Assert all dismissed
});

test('Action button works (Retry example)', async ({ page }) => {
  // Trigger error with retry action
  // Click "Retry" button
  // Assert callback fired
  // Assert toast dismissed
});
```

**Run E2E Tests**:
```bash
npm run test:e2e -- toast-notifications.spec.js
```

**Acceptance Criteria**:
- ✓ All 6 E2E tests pass
- ✓ Tests run in < 60 seconds
- ✓ No flaky tests (run 3x to verify)

---

## Phase 3: Manual QA Checklist

### Functional Testing

```
□ Success toast displays with green background
□ Success toast auto-dismisses after 5 seconds
□ Error toast displays with red background  
□ Error toast persists until manually dismissed
□ Close button (X) dismisses toast immediately
□ Multiple toasts stack vertically without overlap
□ 4-toast maximum enforced
□ 5th toast queues and displays when slot opens
□ Duplicate messages ignored (1-second window)
□ Action button triggers callback
□ Action button dismisses toast after click
□ Toasts persist across client-side navigation
□ Toasts clear on hard reload (F5)
```

### Accessibility Testing

```
□ Toasts use role="status" (success) or role="alert" (error)
□ Screen reader announces toasts (test with NVDA/JAWS)
□ Escape key dismisses all toasts
□ Close button has aria-label="Close notification"
□ Action button has clear label
□ Color contrast meets WCAG 2.1 AA (4.5:1 minimum)
□ Text remains readable at 200% zoom
□ Keyboard navigation works (Tab to action/close buttons)
```

### Responsive Testing

```
□ Mobile (<640px): Toasts full-width with padding
□ Tablet (640-1024px): Toasts centered, max-width 500px
□ Desktop (>1024px): Toasts centered, max-width 500px
□ Touch targets ≥44px on mobile
□ Text wraps correctly on long messages
□ Toasts don't cover navigation or FAB buttons
```

### Performance Testing

```
□ Toast displays within 500ms of action
□ Animations are smooth (60fps)
□ No layout shift when toast appears (CLS=0)
□ prefers-reduced-motion disables animations
□ Memory: No leaks (check DevTools after 50 toasts)
□ CPU: <5% usage during animations
```

### Browser Compatibility

```
□ Chrome (latest)
□ Firefox (latest)
□ Safari (latest)
□ Edge (latest)
□ Mobile Safari (iOS 15+)
□ Mobile Chrome (Android 10+)
```

---

## Phase 4: Optional Enhancements (P3)

### Test Page for Manual Testing

**File**: `src/app/test/toast/page.js`

**Purpose**: Dev-only page to manually test all toast scenarios

**Implementation**:
```javascript
'use client';

import { useToast } from '@/hooks/useToast';

export default function ToastTestPage() {
  const { showSuccess, showError, clearAll } = useToast();
  
  return (
    <div className="p-8 space-y-4">
      <h1>Toast Test Page (Dev Only)</h1>
      
      <button onClick={() => showSuccess('Success!')}>
        Show Success Toast
      </button>
      
      <button onClick={() => showError('Error!')}>
        Show Error Toast
      </button>
      
      <button onClick={() => {
        showError('Failed to delete', {
          action: {
            label: 'Retry',
            onAction: () => showSuccess('Retry worked!')
          }
        });
      }}>
        Show Error with Retry Action
      </button>
      
      <button onClick={() => {
        for (let i = 0; i < 5; i++) {
          showSuccess(`Toast ${i + 1}`);
        }
      }}>
        Show 5 Toasts (Test Queue)
      </button>
      
      <button onClick={clearAll}>
        Clear All Toasts
      </button>
    </div>
  );
}
```

**Access**: Visit `/test/toast` in dev mode to manually test all scenarios

---

## Testing Summary

### Coverage Target: 80% Minimum

**Unit Tests** (~15 tests):
- ToastContext reducer (6 tests)
- useToast hook (5 tests)
- Toast component (9 tests)
- ToastContainer (6 tests)

**Integration Tests** (~10 tests):
- EntryForm with toasts (2 tests)
- SettingsForm with toasts (2 tests)
- GoalSettingPanel with toasts (1 test)
- Admin operations (3 tests)
- Auth flows (2 tests)

**E2E Tests** (6 tests):
- Auto-dismiss (1 test)
- Manual dismiss (1 test)
- Stacking (1 test)
- Queue (1 test)
- Escape key (1 test)
- Action button (1 test)

**Total**: ~31 tests covering all acceptance scenarios

---

## Deployment Checklist

### Pre-Deployment

```
□ All 31 tests passing
□ ESLint clean (no errors)
□ Prettier formatted
□ JSDoc comments complete
□ Manual QA checklist complete
□ Accessibility audit passed
□ Performance audit passed
□ No console errors in production build
□ Code review approved
```

### Deployment Steps

```
1. Merge feature branch to main
2. Deploy to staging
3. Smoke test on staging (test page + real usage)
4. Deploy to production
5. Monitor error logs for 24 hours
6. Collect user feedback
```

### Rollback Plan

**If toast system fails**:
- Inline error messages remain as fallback
- Users still see errors (just inline instead of toast)
- Revert commit and redeploy
- Fix issues and redeploy

---

## Success Metrics

After 1 week in production, verify:

- ✓ SC-001: Users see success confirmation within 500ms (check analytics)
- ✓ SC-006: No WCAG violations (run accessibility audit)
- ✓ SC-007: Zero breaking changes (monitor error logs)
- ✓ SC-012: 30% reduction in "did it save?" support tickets (check support metrics)
- ✓ SC-014: Zero complaints about intrusive toasts (check feedback channels)

---

## Troubleshooting

### Toast not displaying

**Check**:
1. Is ToastProvider in root layout?
2. Is ToastContainer rendered?
3. Is useToast hook inside ToastProvider?
4. Check browser console for errors
5. Verify context state in React DevTools

### Toast not auto-dismissing

**Check**:
1. Verify autoDismiss=true for success toasts
2. Check setTimeout in Toast component
3. Verify cleanup in useEffect return
4. Check for timer being cleared prematurely

### Queue not processing

**Check**:
1. Verify FIFO logic in REMOVE_TOAST action
2. Check queue array in context state
3. Verify toast count limit (should be 4)
4. Test deduplication not interfering

### Accessibility issues

**Check**:
1. role="status" or role="alert" present
2. aria-live="polite" or "assertive"
3. aria-atomic="true"
4. Screen reader test (NVDA/JAWS)

---

## Resources

- **Spec**: `specs/021-toast-notifications/spec.md`
- **Research**: `specs/021-toast-notifications/research.md`
- **Data Model**: `specs/021-toast-notifications/data-model.md`
- **Tasks**: `specs/021-toast-notifications/tasks.md` (generated by `/speckit.tasks`)

- **Reference Implementation**: FastingGoalContext (Feature 020) - similar pattern
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA live regions**: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
- **Tailwind CSS Transitions**: https://tailwindcss.com/docs/transition-property

---

**Ready to implement!** Follow phases in order, write tests first (TDD), and verify acceptance criteria at each step.
