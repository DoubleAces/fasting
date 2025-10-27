# Quick Start: Live Fasting Timer

**Feature**: 017-live-fasting-timer  
**Date**: October 27, 2025  
**Branch**: `017-live-fasting-timer`

## Overview

This guide helps developers quickly understand and start working on the live fasting timer feature. Read this before diving into implementation.

---

## What Are We Building?

A **client-side timer** that automatically displays when users log their last meal time, showing:
- ⏱️ Elapsed fasting duration (updates every 60 seconds)
- 🎯 Milestone achievements (12h, 16h, 20h, 24h, 36h, 48h)
- 📊 Progress bar (when user has 7+ historical fasts)
- ✅ Auto-start when meal logged, auto-stop when fast broken

**User Flow**:
1. User creates today's entry with lastMealTime "6:00 PM"
2. Timer appears at top of entries page showing "Fasting for 0h 0m"
3. Every 60 seconds, timer updates (1h 0m, 2h 15m, etc.)
4. At 12 hours, milestone badge appears with animation
5. If user has fasting history, progress bar shows "75% of 16 hours"
6. User logs firstMealTime → Timer stops and disappears

---

## Key Decisions (from Research)

| Aspect | Decision | Why |
|--------|----------|-----|
| **State** | Custom React hook (`useFastingTimer`) | Encapsulation, testability |
| **Calculation** | Absolute timestamps (no accumulation) | Accuracy, works across refreshes |
| **Update Frequency** | 60 seconds | Battery-friendly, user validated |
| **Progress Target** | Median of last 30 days (min 7 entries) | Robust to outliers |
| **Milestones** | Predefined [12,16,20,24,36,48] hours | Standard IF windows |
| **Error Handling** | Graceful degradation, show message | Non-blocking UX |

---

## Project Structure

```
src/
├── app/entries/page.js                    # MODIFY: Add <FastingTimer />
├── components/
│   ├── atoms/
│   │   └── MilestoneBadge.js             # NEW: 🎯 Badge component
│   ├── molecules/
│   │   ├── TimerDisplay.js                # NEW: Core time display
│   │   └── ProgressBar.js                 # NEW: Progress visualization
│   └── organisms/
│       ├── FastingTimer.js                # NEW: Main timer (START HERE)
│       └── FastingTimerCard.js           # NEW: Card wrapper
├── lib/utils/
│   ├── fastingTimerUtils.js              # NEW: Core calculations
│   ├── milestoneUtils.js                  # NEW: Milestone logic
│   └── progressUtils.js                   # NEW: Progress calculation
└── hooks/
    └── useFastingTimer.js                 # NEW: Timer state hook

tests/
├── unit/
│   ├── fastingTimerUtils.test.js         # NEW: Write first (TDD)
│   ├── milestoneUtils.test.js             # NEW: Write first (TDD)
│   └── progressUtils.test.js              # NEW: Write first (TDD)
├── components/
│   ├── FastingTimer.test.js               # NEW: Write first (TDD)
│   ├── TimerDisplay.test.js               # NEW: Write first (TDD)
│   └── ProgressBar.test.js                # NEW: Write first (TDD)
└── e2e/
    └── fasting-timer.spec.js              # NEW: Write first (TDD)
```

---

## Getting Started

### 1. Prerequisites

- Branch: `017-live-fasting-timer` (already created)
- Node.js 18+ installed
- Dependencies: Already in project (React 18, Tailwind CSS)
- Familiarity with: React hooks, Jest, Playwright

### 2. Development Workflow (TDD Required)

```bash
# 1. Ensure you're on feature branch
git checkout 017-live-fasting-timer

# 2. Create test file FIRST
touch tests/unit/fastingTimerUtils.test.js

# 3. Write failing tests
npm test tests/unit/fastingTimerUtils.test.js
# Expected: Tests fail (red)

# 4. Implement feature
touch src/lib/utils/fastingTimerUtils.js
# Write minimum code to pass tests

# 5. Run tests again
npm test tests/unit/fastingTimerUtils.test.js
# Expected: Tests pass (green)

# 6. Refactor if needed
# Improve code quality while keeping tests green

# 7. Repeat for next component
```

### 3. Implementation Order

**Phase 1: Core Timer Logic** (Unit Tests First)
1. ✅ Write tests for `calculateElapsedTime()`
2. ✅ Implement `fastingTimerUtils.js`
3. ✅ Write tests for `detectMilestones()`
4. ✅ Implement `milestoneUtils.js`
5. ✅ Write tests for `calculateTargetDuration()`
6. ✅ Implement `progressUtils.js`

**Phase 2: React Hook** (Hook Tests First)
1. ✅ Write tests for `useFastingTimer()`
2. ✅ Implement hook with useEffect/useState
3. ✅ Test 60-second interval with Jest fake timers

**Phase 3: UI Components** (Component Tests First)
1. ✅ Write tests for `TimerDisplay`
2. ✅ Implement TimerDisplay component
3. ✅ Write tests for `MilestoneBadge`
4. ✅ Implement MilestoneBadge
5. ✅ Write tests for `ProgressBar`
6. ✅ Implement ProgressBar
7. ✅ Write tests for `FastingTimer` (main component)
8. ✅ Implement FastingTimer (container + display)

**Phase 4: Integration** (E2E Tests First)
1. ✅ Write E2E test for full user flow
2. ✅ Integrate timer into entries page
3. ✅ Test across devices (mobile/tablet/desktop)
4. ✅ Verify accessibility (screen reader, ARIA)

---

## Core Utilities API

### fastingTimerUtils.js

```javascript
/**
 * Calculate elapsed time from last meal
 * @param {string} lastMealTime - HH:mm format
 * @param {Date} entryDate - Entry date
 * @returns {Object} { hours, minutes, totalMinutes, milliseconds }
 */
export function calculateElapsedTime(lastMealTime, entryDate) {
  // Implementation in research.md
}

/**
 * Format elapsed time for display
 * @param {Object} elapsed - { hours, minutes }
 * @returns {string} "14h 23m" or "1 day 5h"
 */
export function formatElapsedTime(elapsed) {
  // Handle >24 hours
}
```

### milestoneUtils.js

```javascript
/**
 * Detect reached milestones
 * @param {number} elapsedMinutes
 * @param {number[]} previousMilestones
 * @returns {Object} { reached, latest, isNew, shouldAnimate }
 */
export function detectMilestones(elapsedMinutes, previousMilestones) {
  // Implementation in research.md
}

export const MILESTONES = [
  { hours: 12, label: '12-Hour Milestone', icon: '🎯' },
  { hours: 16, label: '16-Hour Milestone', icon: '⭐' },
  // ...
];
```

### progressUtils.js

```javascript
/**
 * Calculate target duration from historical fasts
 * @param {Array} entries - Entry objects
 * @returns {number|null} Median duration in minutes or null
 */
export function calculateTargetDuration(entries) {
  // Implementation in research.md
}

/**
 * Calculate progress toward target
 * @param {number} elapsedMinutes
 * @param {number} targetMinutes
 * @returns {Object|null} { percentage, remaining, isComplete, target }
 */
export function calculateProgress(elapsedMinutes, targetMinutes) {
  // Implementation in research.md
}
```

---

## useFastingTimer Hook API

```javascript
/**
 * Custom hook for fasting timer state
 * @param {string} lastMealTime - HH:mm format
 * @param {Date} entryDate - Entry date
 * @param {boolean} isActive - Whether fast is active
 * @returns {Object} { elapsed, milestones, progress, error }
 */
export function useFastingTimer(lastMealTime, entryDate, isActive) {
  const [elapsed, setElapsed] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!isActive || !lastMealTime) return;
    
    const updateTimer = () => {
      try {
        const newElapsed = calculateElapsedTime(lastMealTime, entryDate);
        setElapsed(newElapsed);
        
        const newMilestones = detectMilestones(
          newElapsed.totalMinutes,
          milestones
        );
        
        if (newMilestones.isNew) {
          setMilestones(newMilestones.reached);
        }
      } catch (err) {
        setError('Unable to calculate fasting time. Please check your entry.');
      }
    };
    
    updateTimer(); // Immediate
    const interval = setInterval(updateTimer, 60000); // 60s
    
    return () => clearInterval(interval);
  }, [lastMealTime, entryDate, isActive]);
  
  return { elapsed, milestones, error };
}
```

---

## Component Integration

### Entries Page Integration

```javascript
// src/app/entries/page.js

import FastingTimer from '@/components/organisms/FastingTimer';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  // ...existing state
  
  return (
    <div>
      <h1>Fasting Entries</h1>
      
      {/* NEW: Add timer at top, before entry list */}
      <FastingTimer entries={entries} />
      
      {/* Existing entry list */}
      <EntryList entries={entries} />
    </div>
  );
}
```

### FastingTimer Component Structure

```javascript
// src/components/organisms/FastingTimer.js

export default function FastingTimer({ entries }) {
  // 1. Derive active fast from entries
  const activeFast = deriveActiveFast(entries);
  
  // 2. Use timer hook
  const { elapsed, milestones, error } = useFastingTimer(
    activeFast?.startTime,
    activeFast?.startDate,
    activeFast?.status === 'active'
  );
  
  // 3. Calculate progress (if sufficient history)
  const target = calculateTargetDuration(entries);
  const progress = calculateProgress(elapsed?.totalMinutes, target);
  
  // 4. Render
  if (error) return <ErrorDisplay message={error} />;
  if (!activeFast) return null;
  
  return (
    <FastingTimerCard>
      <TimerDisplay elapsed={elapsed} startTime={activeFast.startTime} />
      {milestones.latest && <MilestoneBadge milestone={milestones.latest} />}
      {progress && <ProgressBar progress={progress} />}
      {!progress && <HintMessage />}
    </FastingTimerCard>
  );
}
```

---

## Testing Guide

### Unit Test Example

```javascript
// tests/unit/fastingTimerUtils.test.js

import { calculateElapsedTime } from '@/lib/utils/fastingTimerUtils';

describe('calculateElapsedTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-27T22:00:00'));
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('calculates elapsed time from last meal', () => {
    const lastMealTime = '18:00';
    const entryDate = new Date('2025-10-27');
    
    const result = calculateElapsedTime(lastMealTime, entryDate);
    
    expect(result).toEqual({
      hours: 4,
      minutes: 0,
      totalMinutes: 240,
      milliseconds: 14400000
    });
  });
  
  it('handles midnight boundary crossing', () => {
    jest.setSystemTime(new Date('2025-10-28T02:00:00'));
    
    const lastMealTime = '20:00';
    const entryDate = new Date('2025-10-27');
    
    const result = calculateElapsedTime(lastMealTime, entryDate);
    
    expect(result.hours).toBe(6);
    expect(result.minutes).toBe(0);
  });
  
  it('returns zero for negative elapsed time', () => {
    const lastMealTime = '23:00'; // Future time
    const entryDate = new Date('2025-10-27');
    
    const result = calculateElapsedTime(lastMealTime, entryDate);
    
    expect(result.totalMinutes).toBe(0);
  });
});
```

### Component Test Example

```javascript
// tests/components/TimerDisplay.test.js

import { render, screen } from '@testing-library/react';
import TimerDisplay from '@/components/molecules/TimerDisplay';

describe('TimerDisplay', () => {
  it('renders elapsed time correctly', () => {
    const elapsed = { hours: 14, minutes: 23, totalMinutes: 863 };
    
    render(<TimerDisplay elapsed={elapsed} startTime="18:00" />);
    
    expect(screen.getByText(/14h 23m/i)).toBeInTheDocument();
  });
  
  it('uses semantic time element', () => {
    const elapsed = { hours: 14, minutes: 23 };
    
    render(<TimerDisplay elapsed={elapsed} startTime="18:00" />);
    
    const timeElement = screen.getByRole('time');
    expect(timeElement).toHaveAttribute('datetime', 'PT14H23M');
  });
  
  it('includes ARIA label for accessibility', () => {
    const elapsed = { hours: 14, minutes: 23 };
    
    render(<TimerDisplay elapsed={elapsed} startTime="18:00" />);
    
    expect(screen.getByLabelText(/fasting for 14 hours and 23 minutes/i))
      .toBeInTheDocument();
  });
});
```

### E2E Test Example

```javascript
// tests/e2e/fasting-timer.spec.js

import { test, expect } from '@playwright/test';

test('timer appears when creating entry with last meal time', async ({ page }) => {
  // 1. Login
  await page.goto('/entries');
  // ...login steps
  
  // 2. Create entry with lastMealTime
  await page.click('button:has-text("Add Entry")');
  await page.fill('input[name="lastMealTime"]', '18:00');
  await page.click('button:has-text("Save")');
  
  // 3. Verify timer appears
  await expect(page.locator('.fasting-timer')).toBeVisible();
  await expect(page.locator('text=/Fasting for/i')).toBeVisible();
});

test('timer stops when breaking fast', async ({ page }) => {
  // Setup: Create entry with active fast
  // ...
  
  // 1. Edit entry to add firstMealTime
  await page.click('button[aria-label="Edit entry"]');
  await page.fill('input[name="firstMealTime"]', '10:00');
  await page.click('button:has-text("Save")');
  
  // 2. Verify timer disappears
  await expect(page.locator('.fasting-timer')).not.toBeVisible();
});
```

---

## Running Tests

```bash
# Unit tests
npm test tests/unit/fastingTimerUtils.test.js

# Component tests
npm test tests/components/FastingTimer.test.js

# All tests
npm test

# E2E tests
npm run test:e2e tests/e2e/fasting-timer.spec.js

# Coverage report
npm test -- --coverage
```

---

## Common Pitfalls

### ❌ DON'T: Accumulate seconds in state
```javascript
// BAD: Will drift, breaks on refresh
setInterval(() => {
  setElapsed(prev => prev + 60);
}, 60000);
```

### ✅ DO: Calculate from absolute timestamp
```javascript
// GOOD: Always accurate
setInterval(() => {
  const now = new Date();
  const elapsed = now - lastMealTime;
  setElapsed(elapsed);
}, 60000);
```

### ❌ DON'T: Forget to cleanup interval
```javascript
// BAD: Memory leak
useEffect(() => {
  setInterval(updateTimer, 60000);
}, []); // No cleanup!
```

### ✅ DO: Return cleanup function
```javascript
// GOOD: Cleans up on unmount
useEffect(() => {
  const interval = setInterval(updateTimer, 60000);
  return () => clearInterval(interval);
}, []);
```

### ❌ DON'T: Modify Entry API
```javascript
// BAD: No API changes needed
POST /api/timer/start
```

### ✅ DO: Use existing Entry data
```javascript
// GOOD: Client-side calculation only
const elapsed = calculateElapsedTime(entry.lastMealTime, entry.date);
```

---

## Debugging Tips

### Timer Not Appearing
1. Check console for errors
2. Verify entry has `lastMealTime`
3. Verify entry date is today
4. Check `deriveActiveFast()` logic
5. Ensure entries prop is passed to FastingTimer

### Timer Not Updating
1. Check interval is set (React DevTools)
2. Verify useEffect dependencies
3. Check for console errors during calculation
4. Use Jest fake timers to test interval

### Progress Bar Not Showing
1. Check entry count (need 7+ in last 30 days)
2. Verify entries have `fastingDuration`
3. Check `calculateTargetDuration()` return value
4. Confirm entries are within last 30 days

### Accessibility Issues
1. Run Lighthouse accessibility audit
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Verify ARIA labels are present
4. Check semantic HTML (`<time>` element)

---

## Resources

- **Spec**: [spec.md](./spec.md) - Full feature specification
- **Research**: [research.md](./research.md) - Technical decisions and rationale
- **Data Model**: [data-model.md](./data-model.md) - Entity relationships
- **API Contracts**: [contracts/README.md](./contracts/README.md) - No new APIs needed
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles

---

## Next Steps

1. ✅ Read this quickstart guide
2. ⏭️ Review [research.md](./research.md) for implementation details
3. ⏭️ Run `/speckit.tasks` to generate atomic task breakdown
4. ⏭️ Start TDD workflow: Write test → Implement → Refactor
5. ⏭️ Integrate components progressively (bottom-up: utils → hook → components → page)

---

## Questions?

- Review spec clarifications in [spec.md](./spec.md) (Session 2025-10-26)
- Check research decisions in [research.md](./research.md)
- Consult data model in [data-model.md](./data-model.md)
- Follow TDD strictly per constitution

**Ready to code!** 🚀
