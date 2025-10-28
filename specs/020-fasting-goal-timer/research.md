# Technical Research: Fasting Goal Timer

**Feature**: 020-fasting-goal-timer  
**Date**: October 28, 2025  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Overview

This feature extends Feature 017 (Live Fasting Timer) with goal-setting and progress tracking capabilities. Research focuses on: session state management patterns in Next.js, Mongoose schema evolution, progress calculation performance, and UI patterns for goal visualization.

## Research Tasks

### R-001: Session State Management Pattern

**Question**: What is the best practice for managing session-based goal state in Next.js 15 with the App Router, given that goals must persist during fast but reset on browser refresh?

**Decision**: Use React Context API with localStorage fallback

**Rationale**:
- **React Context**: Provides component tree-wide access to goal state without prop drilling through FastingTimer → TimerDisplay hierarchy
- **localStorage**: Enables goal persistence across page refreshes during active fast session (addresses edge case from spec)
- **No server state**: Goal doesn't persist to database until fast ends, so no need for server-side session management
- **Simplicity**: Avoids complexity of Zustand/Redux for single-feature state
- **Performance**: Context updates trigger re-renders only for subscribed components

**Alternatives Considered**:
1. **Component-local useState**: Rejected - requires prop drilling through 3+ component layers (FastingTimerCard → FastingTimer → GoalSetting → GoalDisplay)
2. **URL query parameters**: Rejected - exposes goal in URL (poor UX), requires router navigation on every goal change
3. **Zustand**: Rejected - overkill for single-feature state, adds dependency weight
4. **Server-side session (NextAuth session)**: Rejected - requires database writes during fast, contradicts session-based design principle

**Implementation Notes**:
- Create `FastingGoalContext` provider wrapping entries page
- Store: `{ goalMinutes: number | null, setAt: Date | null }`
- useEffect in provider syncs to localStorage on goal changes
- Clear localStorage when fast ends (cleanup in entry submission)

---

### R-002: Mongoose Schema Evolution Best Practices

**Question**: How to safely add optional fields (fastingGoal, goalStatus) to existing Entry model with 1000+ documents without migration script?

**Decision**: Add fields as optional with default: null

**Rationale**:
- **Mongoose compatibility**: Schema changes are additive and non-breaking when fields are optional
- **Existing documents**: Remain valid - Mongoose returns null/undefined for missing fields
- **No migration required**: Documents auto-upgrade on next write (Mongoose adds fields on save)
- **Query safety**: Can query `{ goalStatus: null }` or `{ goalStatus: { $exists: false } }` for non-goal entries
- **Index efficiency**: Sparse indexes automatically ignore null values

**Alternatives Considered**:
1. **Migration script**: Rejected - unnecessary for optional fields, adds deployment complexity
2. **Default values (e.g., goalStatus: 'no-goal')**: Rejected - pollutes existing entries with assumed data, violates data integrity
3. **Separate GoalEntry collection**: Rejected - breaks single-entry-per-day principle, requires JOIN queries

**Implementation Notes**:
```javascript
// Add to entrySchema
fastingGoal: {
  type: Number,  // minutes
  min: [1, 'Fasting goal must be at least 1 minute'],
  max: [10080, 'Fasting goal cannot exceed 168 hours (7 days)'],
  default: null
},
goalStatus: {
  type: String,
  enum: {
    values: ['completed', 'not-completed', 'no-goal'],
    message: 'Goal status must be completed, not-completed, or no-goal'
  },
  default: null
}
```

---

### R-003: Progress Calculation Performance

**Question**: What is the most efficient way to calculate and update progress percentage every 60 seconds without blocking UI?

**Decision**: Pure calculation in useMemo hook with millisecond-based elapsed time

**Rationale**:
- **useMemo**: Memoizes calculation result, only recalculates when dependencies change (currentTime, goalMinutes)
- **No async overhead**: Calculation is pure math (elapsedMs / goalMs * 100), completes in <1ms
- **Already available data**: useFastingTimer hook provides elapsedMs, no additional fetches required
- **Single responsibility**: Keep progress calculation in UI layer (computed state), not business logic

**Alternatives Considered**:
1. **Web Worker**: Rejected - overkill for <1ms calculation, adds complexity and bundle size
2. **Server-side calculation**: Rejected - requires API call every 60s, adds network latency
3. **requestAnimationFrame**: Rejected - 60fps updates unnecessary, wastes CPU (60s interval sufficient per spec)

**Implementation Notes**:
```javascript
// In custom hook or component
const progressPercentage = useMemo(() => {
  if (!goalMinutes || !elapsedMs) return 0;
  const goalMs = goalMinutes * 60 * 1000;
  return (elapsedMs / goalMs) * 100;
}, [elapsedMs, goalMinutes]);
```

**Performance Validation**:
- Calculation complexity: O(1)
- Memory: negligible (2 numbers in closure)
- Re-renders: only when currentTime updates (every 60s)
- Target: <1ms per calculation (SC-002 requirement)

---

### R-004: Goal Completion Time Calculation

**Question**: How to accurately calculate and display goal completion time considering timezone, DST, and client-side time drift?

**Decision**: Use Date objects with client-side system time, format with date-fns

**Rationale**:
- **Client-side time**: Per spec assumption A-004, server sync not required for MVP
- **Date arithmetic**: `new Date(startTime.getTime() + goalMs)` provides absolute timestamp
- **date-fns formatting**: Already in dependencies, provides locale-aware formatting
- **Timezone handling**: Date objects automatically use client timezone
- **DST-aware**: Native Date handles DST transitions correctly

**Alternatives Considered**:
1. **Server-side time sync**: Rejected - adds latency, network dependency, contradicts assumption A-004
2. **Manual timezone conversion**: Rejected - error-prone, Date objects handle this natively
3. **Relative time (countdown)**: Rejected - spec explicitly requires absolute timestamp, not countdown

**Implementation Notes**:
```javascript
import { format } from 'date-fns';

const calculateGoalCompletionTime = (lastMealTime, date, goalMinutes) => {
  // Parse lastMealTime (HH:mm) and date to create start timestamp
  const [hours, minutes] = lastMealTime.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0, 0);
  
  // Add goal duration
  const completionTime = new Date(startTime.getTime() + goalMinutes * 60 * 1000);
  
  // Format as "Oct 29, 12:00 PM"
  return format(completionTime, 'MMM d, h:mm a');
};
```

**Edge Case Handling**:
- **Already exceeded goal**: Show past timestamp with "Goal reached at" text + checkmark icon
- **DST transition**: Date objects auto-adjust (may show unexpected time but mathematically correct)
- **Timezone travel**: Recalculates based on current system timezone (spec edge case acknowledged)

---

### R-005: Progress Bar UI Component Pattern

**Question**: What is the best Tailwind CSS pattern for a dynamic progress bar that handles 0-100%+ with visual distinction for exceeded goals?

**Decision**: Use dynamic width with Tailwind classes and conditional color/icon for >100%

**Rationale**:
- **Dynamic width**: `style={{ width: `${Math.min(percentage, 100)}%` }}` prevents visual overflow
- **Tailwind transitions**: `transition-all duration-500` provides smooth updates
- **Color coding**: Different bg-color classes for <100% (blue) vs >=100% (green)
- **Exceeded indicator**: Show "✓" icon and "Goal Exceeded!" text when >100%
- **Accessibility**: Includes aria-valuenow, aria-valuemin, aria-valuemax for screen readers

**Alternatives Considered**:
1. **CSS animation library (Framer Motion)**: Rejected - adds 50kb+ bundle size for simple progress bar
2. **SVG circular progress**: Rejected - linear bar more intuitive for time-based progress per UX research
3. **Native <progress> element**: Rejected - limited styling options, can't handle >100% well

**Implementation Notes**:
```javascript
<div className="w-full bg-gray-200 rounded-full h-4" role="progressbar" 
     aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
  <div 
    className={`h-4 rounded-full transition-all duration-500 ${
      percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
    }`}
    style={{ width: `${Math.min(percentage, 100)}%` }}
  />
</div>
{percentage >= 100 && (
  <div className="flex items-center gap-1 text-green-600 font-semibold mt-2">
    <CheckCircle size={20} /> Goal Exceeded!
  </div>
)}
```

---

### R-006: Preset Button vs Custom Input UX Pattern

**Question**: Should preset buttons and custom input be in modal/dialog or inline panel for optimal mobile UX?

**Decision**: Use inline collapsible panel (not modal) for goal setting

**Rationale**:
- **Mobile-first**: Avoids modal scroll issues on small screens, keeps context visible
- **Non-blocking**: User can see timer while setting goal (important for mid-fast goal changes)
- **Faster interaction**: No modal open/close animations, meets SC-001 (<10s to set goal)
- **Accessibility**: Easier keyboard navigation without focus trap
- **Progressive disclosure**: Collapse after goal set, show "Change Goal" button to re-expand

**Alternatives Considered**:
1. **Modal dialog**: Rejected - blocks timer view, requires extra tap to open/close, modal fatigue on mobile
2. **Separate page**: Rejected - adds navigation friction, breaks single-page timer UX
3. **Always-visible panel**: Rejected - clutters UI when goal already set, wastes screen space

**Implementation Notes**:
- Use `<details>` element for native collapse behavior (progressive enhancement)
- Fallback to React state toggle for custom styling
- Preset buttons in 2x2 grid on mobile (22px tap targets)
- Custom input with number keyboard on mobile (`inputmode="decimal"`)

---

### R-007: Goal Data Persistence Timing

**Question**: At what point during fast completion should goal data be written to database?

**Decision**: Write goal data in POST /api/entries endpoint when user submits "End Fast" form

**Rationale**:
- **Single write**: Goal data saved alongside firstMealTime in single transaction
- **Data consistency**: All entry fields (meal times, metrics, goal) saved atomically
- **No partial state**: Avoids scenario where goal saved but entry incomplete
- **Existing pattern**: Follows current entry creation flow, minimal code changes

**Alternatives Considered**:
1. **Separate POST /api/entries/[id]/goal endpoint**: Rejected - requires two API calls, complicates error handling
2. **Auto-save on goal set**: Rejected - contradicts session-based design (spec FR-013)
3. **Background sync on page unload**: Rejected - unreliable (beforeunload not guaranteed), adds complexity

**Implementation Notes**:
```javascript
// In POST /api/entries
const entryData = {
  ...existingFields,
  // Add goal fields from session state (via request body)
  fastingGoal: goalMinutes || null,
  goalStatus: calculateGoalStatus(duration, goalMinutes)
};

function calculateGoalStatus(duration, goalMinutes) {
  if (!goalMinutes) return 'no-goal';
  return duration >= goalMinutes ? 'completed' : 'not-completed';
}
```

---

### R-008: Validation Rules for Custom Goal Input

**Question**: What validation rules ensure user-entered goals are practical and prevent edge cases?

**Decision**: Range 1-168 hours (10080 minutes), allow decimals, validate on blur and submit

**Rationale**:
- **Minimum 1 hour**: Prevents accidental 0 or negative values, ensures meaningful goal
- **Maximum 168 hours (7 days)**: Per spec assumption A-002, covers extended fasts
- **Decimal support**: Enables 14.5h, 16.25h precision (spec FR-003)
- **Validate on blur**: Immediate feedback without interrupting typing
- **Prevent submit**: Disable confirm button when invalid

**Validation Rules**:
```javascript
const validateGoalInput = (value) => {
  const hours = parseFloat(value);
  
  if (isNaN(hours)) return 'Please enter a valid number';
  if (hours < 1) return 'Goal must be at least 1 hour';
  if (hours > 168) return 'Goal cannot exceed 168 hours (7 days)';
  if (hours !== Math.floor(hours * 100) / 100) return 'Maximum 2 decimal places';
  
  return null; // Valid
};
```

**Error Messages**:
- Empty input: "Please enter a goal duration"
- Non-numeric: "Please enter a valid number"
- < 1: "Goal must be at least 1 hour"
- > 168: "Goal cannot exceed 168 hours (7 days)"
- Too many decimals: "Maximum 2 decimal places allowed"

---

## Technology Decisions Summary

| Technology | Decision | Purpose |
|------------|----------|---------|
| **State Management** | React Context + localStorage | Session-based goal state with browser refresh persistence |
| **Database Schema** | Mongoose optional fields | Additive schema evolution without migration |
| **Progress Calculation** | useMemo hook | Efficient 60-second update cycle |
| **Time Calculation** | Native Date + date-fns | Client-side timestamp with DST awareness |
| **Progress Bar UI** | Tailwind + dynamic width | Accessible, responsive, handles >100% |
| **Goal Input UX** | Inline collapsible panel | Mobile-first, non-blocking interaction |
| **Data Persistence** | Write on fast completion | Atomic save with entry submission |
| **Input Validation** | 1-168 hours, decimals | Practical range, prevents edge cases |

## Dependencies Validation

| Dependency | Status | Notes |
|------------|--------|-------|
| **Next.js 15.5.6** | ✅ Confirmed | App Router, React 19 support |
| **React 19.1.0** | ✅ Confirmed | Context API, hooks available |
| **Mongoose 8.19.1** | ✅ Confirmed | Schema evolution supported |
| **date-fns 4.1.0** | ✅ Confirmed | Format function available |
| **Tailwind CSS** | ✅ Confirmed | Utility classes for progress bar |
| **lucide-react** | ✅ Confirmed | CheckCircle icon for exceeded goal |

## Performance Estimates

| Operation | Target | Estimated | Status |
|-----------|--------|-----------|--------|
| **Goal setting** | <10s | ~2-5s | ✅ Well under target |
| **Progress update** | <1s after tick | <50ms | ✅ 20x under target |
| **Completion time calc** | <1% error | <0.1% error | ✅ 10x under target |
| **Goal data save** | N/A | ~200ms | ✅ Part of entry POST |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Browser refresh loses goal** | Medium | Low | Document in UX, localStorage fallback |
| **Timezone edge cases** | Low | Low | Acknowledged in spec, client-side acceptable |
| **>100% progress confusion** | Low | Medium | Clear UI with checkmark and "exceeded" text |
| **Validation bypass** | Low | Low | Server-side validation in API endpoint |

## Open Questions

**None** - All technical unknowns from spec have been resolved.

## References

- Next.js 15 Context API: https://react.dev/reference/react/createContext
- Mongoose Schema Evolution: https://mongoosejs.com/docs/guide.html#timestamps
- date-fns Documentation: https://date-fns.org/
- WCAG Progress Bar Accessibility: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
