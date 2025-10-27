# Research: Live Fasting Timer

**Feature**: 017-live-fasting-timer  
**Date**: October 27, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a live fasting timer in a Next.js application. The timer must update every 60 seconds, persist across refreshes, integrate with existing MongoDB Entry model, and provide optional progress visualization.

## Research Tasks Completed

1. ✅ Timer implementation patterns in React
2. ✅ Date/time calculation best practices for elapsed time
3. ✅ Performance optimization for periodic updates
4. ✅ Progress bar calculation strategies
5. ✅ Accessibility requirements for live timers

---

## Decision 1: Timer State Management

**Decision**: Use custom React hook (`useFastingTimer`) with `useEffect` and `setInterval` for 60-second updates

**Rationale**:
- **Encapsulation**: Custom hook isolates timer logic from UI components
- **Reusability**: Can be used in multiple components if needed
- **Testability**: Hook logic can be tested independently
- **React patterns**: Follows standard React patterns for side effects
- **Cleanup**: `useEffect` cleanup automatically clears interval on unmount

**Alternatives Considered**:
1. **Web Workers**: Rejected - overkill for 60-second updates, adds complexity
2. **requestAnimationFrame**: Rejected - designed for 60fps animations, excessive for 1-minute intervals
3. **Server-sent events**: Rejected - requires server infrastructure, client-side calculation is sufficient
4. **Component state only**: Rejected - less reusable, harder to test

**Implementation Approach**:
```javascript
function useFastingTimer(lastMealTime, isActive) {
  const [elapsed, setElapsed] = useState(0);
  const [milestones, setMilestones] = useState([]);
  
  useEffect(() => {
    if (!isActive || !lastMealTime) return;
    
    const updateTimer = () => {
      const now = new Date();
      const lastMeal = parseTime(lastMealTime);
      const elapsedMs = now - lastMeal;
      setElapsed(elapsedMs);
      
      // Check milestones
      const newMilestones = detectMilestones(elapsedMs);
      setMilestones(newMilestones);
    };
    
    updateTimer(); // Immediate update
    const interval = setInterval(updateTimer, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [lastMealTime, isActive]);
  
  return { elapsed, milestones };
}
```

---

## Decision 2: Time Calculation Strategy

**Decision**: Calculate elapsed time on every render from absolute timestamps (no accumulated state)

**Rationale**:
- **Accuracy**: Always correct relative to system clock
- **Persistence**: Works across page refreshes without localStorage
- **Timezone-safe**: Handles timezone changes automatically
- **Simplicity**: No need to sync state with reality
- **Browser tab suspension**: Resumes correctly when tab becomes active

**Alternatives Considered**:
1. **Accumulate seconds**: Rejected - drifts over time, breaks on refresh
2. **Server timestamp sync**: Rejected - unnecessary network calls, latency issues
3. **localStorage persistence**: Rejected - redundant when calculating from Entry data

**Implementation Approach**:
```javascript
function calculateElapsedTime(lastMealTimeString, dateString) {
  // Parse lastMealTime (HH:mm format) with today's date
  const [hours, minutes] = lastMealTimeString.split(':').map(Number);
  const entryDate = new Date(dateString);
  
  const lastMeal = new Date(entryDate);
  lastMeal.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const elapsedMs = now - lastMeal;
  
  if (elapsedMs < 0) return { hours: 0, minutes: 0, totalMinutes: 0 };
  
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;
  
  return {
    hours: displayHours,
    minutes: displayMinutes,
    totalMinutes,
    milliseconds: elapsedMs
  };
}
```

**Edge Cases Handled**:
- **Midnight boundary**: Uses absolute timestamps, continues counting across midnight
- **Timezone changes**: Calculates from UTC/absolute time
- **Daylight saving**: Date objects handle DST automatically
- **Negative time**: Returns zero if calculation produces negative (system clock issues)

---

## Decision 3: Performance Optimization

**Decision**: Memoize timer calculations and prevent unnecessary re-renders using React.memo and useMemo

**Rationale**:
- **60-second interval**: Updates are infrequent, performance risk is low
- **Entry list isolation**: Timer updates should not re-render entry list
- **Mobile performance**: Battery-friendly update frequency
- **Component memoization**: React.memo prevents child re-renders

**Alternatives Considered**:
1. **Web Workers**: Rejected - adds complexity for minimal benefit
2. **10-second updates**: Rejected - user feedback preferred 60s for battery life
3. **Visibility API throttling**: Considered but deferred - timer should update in background tabs for accuracy on return

**Implementation Approach**:
```javascript
const FastingTimerDisplay = React.memo(({ elapsed, startTime, milestones }) => {
  const formattedTime = useMemo(() => {
    return formatElapsedTime(elapsed);
  }, [elapsed]);
  
  return (
    <div className="timer-display">
      <time dateTime={`PT${elapsed.hours}H${elapsed.minutes}M`}>
        {formattedTime}
      </time>
    </div>
  );
});
```

**Performance Targets**:
- Timer calculation: <10ms
- Component render: <50ms
- Total update overhead: <100ms
- Memory footprint: <1MB for timer state

---

## Decision 4: Progress Bar Calculation

**Decision**: Calculate target duration from median of last 30 days of completed fasts, require minimum 7 entries

**Rationale**:
- **Median vs Mean**: Median is more robust to outliers (occasional 24h+ fast doesn't skew average)
- **30-day window**: Recent pattern more relevant than lifetime average
- **7-entry minimum**: Ensures statistical relevance, prevents false patterns from 2-3 entries
- **Completed fasts only**: Only use entries where both firstMealTime and lastMealTime exist

**Alternatives Considered**:
1. **Mean average**: Rejected - skewed by outliers
2. **User-set goal**: Deferred to future enhancement (per user feedback during clarification)
3. **Most common duration**: Rejected - harder to calculate, median is simpler
4. **Lifetime average**: Rejected - doesn't adapt to changing habits

**Implementation Approach**:
```javascript
function calculateTargetDuration(entries) {
  // Filter completed fasts from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const completedFasts = entries
    .filter(entry => {
      return entry.lastMealTime && 
             entry.firstMealTime && 
             new Date(entry.date) >= thirtyDaysAgo;
    })
    .map(entry => entry.fastingDuration); // Duration in minutes
  
  if (completedFasts.length < 7) {
    return null; // Insufficient data
  }
  
  // Calculate median
  const sorted = [...completedFasts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  
  return Math.round(median); // Return median duration in minutes
}
```

**Progress Calculation**:
```javascript
function calculateProgress(elapsedMinutes, targetMinutes) {
  if (!targetMinutes || targetMinutes === 0) return null;
  
  const percentage = Math.min(
    Math.round((elapsedMinutes / targetMinutes) * 100),
    100 // Cap at 100%
  );
  
  return {
    percentage,
    remaining: Math.max(0, targetMinutes - elapsedMinutes),
    isComplete: elapsedMinutes >= targetMinutes
  };
}
```

---

## Decision 5: Milestone Detection

**Decision**: Predefined thresholds at [12, 16, 20, 24, 36, 48] hours with state tracking to prevent duplicate notifications

**Rationale**:
- **Standard IF windows**: 12h (minimum), 16h (common), 20h (extended), 24h (OMAD), 36h/48h (prolonged)
- **State tracking**: Track which milestones have been shown to prevent re-triggering on every render
- **Visual only**: No audio/push notifications (per spec)
- **Persistent badge**: Milestone badges remain visible after triggering

**Alternatives Considered**:
1. **Custom milestones**: Deferred to future (per spec out-of-scope)
2. **Hour-by-hour markers**: Rejected - too frequent, reduces significance
3. **Percentage-based**: Rejected - requires target duration, should work for all users

**Implementation Approach**:
```javascript
const MILESTONE_HOURS = [12, 16, 20, 24, 36, 48];

function detectMilestones(elapsedMinutes, previousMilestones = []) {
  const elapsedHours = elapsedMinutes / 60;
  
  const reachedMilestones = MILESTONE_HOURS.filter(
    hours => elapsedHours >= hours
  );
  
  // Find newly reached milestones
  const newMilestones = reachedMilestones.filter(
    hours => !previousMilestones.includes(hours)
  );
  
  return {
    reached: reachedMilestones,
    latest: newMilestones[newMilestones.length - 1] || null,
    isNew: newMilestones.length > 0
  };
}
```

**Animation Approach**:
- CSS `@keyframes` for highlight animation (1-2 second duration)
- Persistent badge icon using emoji or Tailwind icon library
- Badge displayed alongside timer without requiring dismissal
- Animation triggers only for newly detected milestones

---

## Decision 6: Accessibility Implementation

**Decision**: Use semantic HTML `<time>` element with proper ARIA labels and live region announcements

**Rationale**:
- **Semantic HTML**: `<time>` element with `datetime` attribute for machine readability
- **ARIA live regions**: Announce milestone achievements to screen readers
- **Polite updates**: Use `aria-live="polite"` to avoid interrupting
- **Visual alternatives**: Text content + visual indicators for milestone badges

**Alternatives Considered**:
1. **aria-live="assertive"**: Rejected - too interruptive for 60-second updates
2. **role="timer"**: Considered but `<time>` element is more semantic
3. **Skip announcements**: Rejected - fails accessibility requirements

**Implementation Approach**:
```javascript
<div className="fasting-timer" role="region" aria-label="Fasting Timer">
  <time 
    dateTime={`PT${hours}H${minutes}M`}
    aria-label={`Fasting for ${hours} hours and ${minutes} minutes`}
  >
    {hours}h {minutes}m
  </time>
  
  {/* Live region for milestone announcements */}
  <div 
    aria-live="polite" 
    aria-atomic="true"
    className="sr-only"
  >
    {latestMilestone && `${latestMilestone} hour milestone reached!`}
  </div>
</div>
```

**Accessibility Checklist**:
- ✅ Semantic HTML elements
- ✅ ARIA labels for dynamic content
- ✅ Live region updates for milestones
- ✅ Sufficient color contrast (Tailwind defaults meet WCAG AA)
- ✅ No keyboard interaction needed (display-only)
- ✅ Focus management N/A (no interactive elements)

---

## Decision 7: Error Handling

**Decision**: Graceful degradation with user-friendly error messages in timer card location

**Rationale**:
- **Non-blocking**: Errors should not prevent page from loading
- **User-friendly**: Clear message about what went wrong
- **Actionable**: Suggests user can check their entry
- **Fallback display**: Show error in timer card position to maintain layout

**Scenarios Handled**:
1. **Invalid time format**: lastMealTime not in HH:mm format
2. **Missing date**: Entry date field is null/undefined
3. **Future times**: lastMealTime is in the future (system clock issues)
4. **Calculation errors**: Math errors, NaN results

**Implementation Approach**:
```javascript
function FastingTimer({ entry }) {
  try {
    const elapsed = calculateElapsedTime(entry.lastMealTime, entry.date);
    
    if (!elapsed || elapsed.totalMinutes < 0) {
      return <ErrorDisplay message="Unable to calculate fasting time. Please check your entry." />;
    }
    
    return <TimerDisplay elapsed={elapsed} />;
  } catch (error) {
    console.error('Fasting timer error:', error);
    return <ErrorDisplay message="Unable to calculate fasting time. Please check your entry." />;
  }
}

function ErrorDisplay({ message }) {
  return (
    <div className="timer-card bg-red-50 border border-red-200 p-4">
      <div className="flex items-center gap-2">
        <span className="text-red-600" role="img" aria-label="Error">⚠️</span>
        <p className="text-red-800 text-sm">{message}</p>
      </div>
    </div>
  );
}
```

---

## Decision 8: Testing Strategy

**Decision**: Test-driven development with unit tests for logic, component tests for UI, E2E for flows

**Test Levels**:

**Unit Tests** (Jest):
- `fastingTimerUtils.test.js`: 
  - Calculate elapsed time from various time inputs
  - Handle midnight boundary crossing
  - Handle timezone scenarios
  - Return zero for negative times
  - Format display strings correctly

- `milestoneUtils.test.js`:
  - Detect milestones at correct thresholds
  - Prevent duplicate detections
  - Handle no milestones reached
  - Handle multiple milestones in one update

- `progressUtils.test.js`:
  - Calculate median from entry history
  - Handle < 7 entries (return null)
  - Filter last 30 days only
  - Calculate progress percentage correctly
  - Cap at 100%

**Component Tests** (React Testing Library):
- `FastingTimer.test.js`:
  - Renders timer when entry has lastMealTime
  - Does not render when no active fast
  - Shows error message on calculation failure
  - Updates display every 60 seconds (with Jest fake timers)
  - Recalculates on entry prop change

- `TimerDisplay.test.js`:
  - Displays hours and minutes correctly
  - Shows start time with correct format
  - Renders semantic time element
  - Applies correct ARIA labels

- `ProgressBar.test.js`:
  - Shows progress bar with target duration
  - Hides progress bar without sufficient history
  - Displays percentage correctly
  - Shows hint message for new users

**Integration Tests** (Playwright):
- Timer appears when creating entry with lastMealTime
- Timer stops when logging firstMealTime
- Timer persists across page refresh
- Timer updates after entry edit
- Progress bar appears with sufficient history
- Milestone badge appears at thresholds

**E2E Tests** (Playwright):
- Full user flow: Create entry → See timer → Wait → Check update → Break fast → Timer stops

**Coverage Target**: 80%+ for all new code

---

## Technical Dependencies

### Required Libraries
- **date-fns** or native Date APIs: Time calculation and formatting
- **Tailwind CSS**: Styling (already in project)
- **React 18**: Hooks, memo, useMemo
- **Jest + React Testing Library**: Unit and component testing
- **Playwright**: E2E testing

### Existing Code Dependencies
- `src/lib/models/Entry.js`: Entry schema (date, lastMealTime, firstMealTime, fastingDuration)
- `src/app/entries/page.js`: Entries page (will integrate timer)
- `src/lib/utils/dateUtils.js`: May leverage existing date utilities
- User settings: Time format preference (12h/24h)

### No New Database Changes
- Uses existing Entry model fields
- No new collections or migrations
- Client-side only calculation

---

## Summary of Decisions

| Decision | Choice | Key Rationale |
|----------|--------|---------------|
| State Management | Custom React hook with useEffect | Encapsulation, testability, cleanup |
| Time Calculation | Absolute timestamps, no accumulation | Accuracy, persistence, timezone-safe |
| Performance | 60s updates, React.memo, useMemo | Battery-friendly, prevents unnecessary renders |
| Progress Target | Median of last 30 days, min 7 entries | Robust to outliers, relevant recent pattern |
| Milestones | Predefined [12,16,20,24,36,48]h | Standard IF windows, state tracking |
| Accessibility | Semantic `<time>`, ARIA live regions | WCAG AA compliance, screen reader support |
| Error Handling | Graceful degradation with user message | Non-blocking, actionable guidance |
| Testing | TDD with unit/component/E2E tests | Constitution requirement, 80%+ coverage |

---

## Open Questions

**None** - All NEEDS CLARIFICATION items resolved during research phase.

---

## Next Steps

1. ✅ Research complete
2. ⏭️ Phase 1: Generate data-model.md
3. ⏭️ Phase 1: Generate API contracts (if needed)
4. ⏭️ Phase 1: Generate quickstart.md
5. ⏭️ Phase 2: Break down into atomic tasks (via `/speckit.tasks`)
