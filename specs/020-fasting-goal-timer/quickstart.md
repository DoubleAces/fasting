# Quickstart Guide: Fasting Goal Timer

**Feature**: 020-fasting-goal-timer  
**Audience**: Developers implementing Feature 020  
**Estimated Reading Time**: 10 minutes

## Overview

Add goal-setting and progress tracking to the existing live fasting timer. Users can set a target duration (presets or custom), see real-time progress, and view goal completion analytics in their fasting history.

## What You'll Build

1. **Goal Setting UI**: Preset buttons (12h, 16h, 18h, 24h) + custom input
2. **Progress Display**: Real-time bar with "4h 30m / 16h 00m (28%)" format
3. **Completion Time**: Shows "Goal reached at: Oct 29, 12:00 PM"
4. **Data Persistence**: Save fastingGoal and goalStatus to Entry on fast completion

## Architecture At A Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    FastingGoalProvider                       │
│  (React Context + localStorage for session persistence)     │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
         ┌──────────▼────────────┐         ┌───────────▼───────────┐
         │   FastingTimer        │         │  GoalProgressBar      │
         │   (displays timer)    │         │  (progress display)   │
         └──────────┬────────────┘         └───────────┬───────────┘
                    │                                   │
                    │         ┌─────────────────────────┘
                    │         │
         ┌──────────▼─────────▼──────────┐
         │     useFastingTimer Hook       │
         │   (provides elapsedMs)         │
         └────────────────────────────────┘
```

**Data Flow**:
1. User sets goal → FastingGoalContext (memory + localStorage)
2. Timer ticks (60s) → useFastingTimer updates elapsedMs
3. Component calculates progress → Updates UI (bar + percentage)
4. User ends fast → POST /api/entries with goal data → Entry document

## Prerequisites

- Feature 017 (Live Fasting Timer) deployed and functional
- Familiarity with React Context API
- Basic understanding of Mongoose schemas

## Quick Start (5 Steps)

### Step 1: Extend Entry Model (5 min)

**File**: `src/lib/models/Entry.js`

Add two optional fields to the schema:

```javascript
// Add after existing fields
fastingGoal: {
  type: Number,
  min: [1, 'Fasting goal must be at least 1 minute'],
  max: [10080, 'Fasting goal cannot exceed 168 hours (7 days)'],
  default: null,
},

goalStatus: {
  type: String,
  enum: {
    values: ['completed', 'not-completed', 'no-goal'],
    message: 'Goal status must be completed, not-completed, or no-goal'
  },
  default: null,
},
```

**No migration needed** - fields are optional with default: null.

---

### Step 2: Create Context Provider (15 min)

**File**: `src/contexts/FastingGoalContext.js` (new)

```javascript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FastingGoalContext = createContext(null);

const STORAGE_KEY = 'fasting-goal-session';

export function FastingGoalProvider({ children }) {
  const [goalMinutes, setGoalMinutes] = useState(null);
  const [setAt, setSetAt] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { goalMinutes, setAt } = JSON.parse(stored);
        setGoalMinutes(goalMinutes);
        setSetAt(setAt ? new Date(setAt) : null);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (goalMinutes !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        goalMinutes,
        setAt: setAt?.toISOString()
      }));
    }
  }, [goalMinutes, setAt]);

  const setGoal = (minutes) => {
    setGoalMinutes(minutes);
    setSetAt(new Date());
  };

  const clearGoal = () => {
    setGoalMinutes(null);
    setSetAt(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FastingGoalContext.Provider value={{ goalMinutes, setAt, setGoal, clearGoal }}>
      {children}
    </FastingGoalContext.Provider>
  );
}

export function useFastingGoal() {
  const context = useContext(FastingGoalContext);
  if (!context) {
    throw new Error('useFastingGoal must be used within FastingGoalProvider');
  }
  return context;
}
```

**Wrap your entries page**:

```javascript
// In src/app/entries/page.js
import { FastingGoalProvider } from '@/contexts/FastingGoalContext';

export default function EntriesPage() {
  return (
    <FastingGoalProvider>
      {/* existing content */}
    </FastingGoalProvider>
  );
}
```

---

### Step 3: Build Goal Setting UI (30 min)

**File**: `src/components/molecules/GoalSettingPanel.js` (new)

```javascript
'use client';

import { useState } from 'react';
import { useFastingGoal } from '@/contexts/FastingGoalContext';

const PRESETS = [12, 16, 18, 24]; // hours

export default function GoalSettingPanel() {
  const { setGoal } = useFastingGoal();
  const [customInput, setCustomInput] = useState('');
  const [error, setError] = useState('');

  const handlePreset = (hours) => {
    setGoal(hours * 60);
    setError('');
  };

  const handleCustom = () => {
    const hours = parseFloat(customInput);
    
    if (isNaN(hours)) {
      setError('Please enter a valid number');
      return;
    }
    if (hours < 1) {
      setError('Goal must be at least 1 hour');
      return;
    }
    if (hours > 168) {
      setError('Goal cannot exceed 168 hours (7 days)');
      return;
    }
    
    setGoal(Math.round(hours * 60));
    setError('');
    setCustomInput('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Set Fasting Goal</h3>
      
      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESETS.map(hours => (
          <button
            key={hours}
            onClick={() => handlePreset(hours)}
            className="py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       font-semibold transition"
          >
            {hours}h
          </button>
        ))}
      </div>
      
      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Custom hours"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <button
          onClick={handleCustom}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                     font-semibold transition"
        >
          Set
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
```

---

### Step 4: Build Progress Display (30 min)

**File**: `src/components/molecules/GoalProgressDisplay.js` (new)

```javascript
'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { useFastingGoal } from '@/contexts/FastingGoalContext';

export default function GoalProgressDisplay({ elapsedMs, lastMealTime, date }) {
  const { goalMinutes } = useFastingGoal();

  const progress = useMemo(() => {
    if (!goalMinutes || !elapsedMs) return null;

    const goalMs = goalMinutes * 60 * 1000;
    const percentage = (elapsedMs / goalMs) * 100;
    
    // Calculate completion time
    const [hours, minutes] = lastMealTime.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    const completionTime = new Date(startTime.getTime() + goalMs);
    
    // Format elapsed and goal times
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    const goalHours = Math.floor(goalMinutes / 60);
    const goalMins = goalMinutes % 60;
    
    return {
      percentage,
      isExceeded: percentage >= 100,
      displayText: `${elapsedHours}h ${elapsedMins}m / ${goalHours}h ${goalMins}m (${Math.round(percentage)}%)`,
      completionText: format(completionTime, 'MMM d, h:mm a')
    };
  }, [elapsedMs, goalMinutes, lastMealTime, date]);

  if (!progress) return null;

  return (
    <div className="mt-4 space-y-2">
      {/* Progress text */}
      <p className="text-center text-lg font-semibold">
        {progress.displayText}
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4" 
           role="progressbar" 
           aria-valuenow={progress.percentage} 
           aria-valuemin={0} 
           aria-valuemax={100}>
        <div 
          className={`h-4 rounded-full transition-all duration-500 ${
            progress.isExceeded ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>
      
      {/* Completion time */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {progress.isExceeded ? 'Goal reached at: ' : 'Goal at: '}
        <span className="font-semibold">{progress.completionText}</span>
      </p>
      
      {/* Exceeded indicator */}
      {progress.isExceeded && (
        <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
          <CheckCircle size={20} /> Goal Exceeded!
        </div>
      )}
    </div>
  );
}
```

---

### Step 5: Integrate with FastingTimer (20 min)

**File**: `src/components/organisms/FastingTimer.js` (modify)

```javascript
import React from 'react';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { useFastingGoal } from '@/contexts/FastingGoalContext';
import TimerDisplay from '@/components/molecules/TimerDisplay';
import GoalSettingPanel from '@/components/molecules/GoalSettingPanel';
import GoalProgressDisplay from '@/components/molecules/GoalProgressDisplay';

export default function FastingTimer({ lastMealTime, date, isActive }) {
  const { formattedTime, currentMilestone, elapsedMs } = useFastingTimer(lastMealTime, date, isActive);
  const { goalMinutes } = useFastingGoal();

  if (!formattedTime) return null;

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
        {isActive ? 'Fasting for' : 'Fast Completed'}
      </h2>
      
      <TimerDisplay 
        formattedTime={formattedTime} 
        milestone={currentMilestone}
      />
      
      {isActive && (
        <>
          {/* Show goal setting if no goal, otherwise show progress */}
          {!goalMinutes ? (
            <>
              <p className="text-sm text-gray-500">Set a goal to track your progress</p>
              <GoalSettingPanel />
            </>
          ) : (
            <GoalProgressDisplay 
              elapsedMs={elapsedMs}
              lastMealTime={lastMealTime}
              date={date}
            />
          )}
        </>
      )}
      
      {!isActive && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Great job! Your fast has ended.
        </p>
      )}
    </div>
  );
}
```

---

### Step 6: Update Entry Submission (15 min)

**File**: `src/app/api/entries/route.js` (modify POST handler)

```javascript
// In POST handler
import { useFastingGoal } from '@/contexts/FastingGoalContext';

// Add validation schema
const createEntrySchema = Joi.object({
  // ...existing fields
  fastingGoal: Joi.number().min(1).max(10080).allow(null).optional(),
  goalStatus: Joi.string().valid('completed', 'not-completed', 'no-goal').allow(null).optional(),
});

// In handler logic
const { fastingGoal, goalStatus, ...otherFields } = req.body;

// Validate goal consistency
if (fastingGoal !== null && goalStatus === null) {
  return res.status(400).json({ error: 'goalStatus required when fastingGoal provided' });
}

// Calculate goalStatus on server if needed
let finalGoalStatus = goalStatus;
if (fastingGoal !== null && !goalStatus) {
  const duration = calculateFastingDuration(lastMealTime, firstMealTime, date);
  finalGoalStatus = duration >= fastingGoal ? 'completed' : 'not-completed';
}

// Create entry with goal data
const entry = new Entry({
  userId: session.user.id,
  ...otherFields,
  fastingGoal: fastingGoal ?? null,
  goalStatus: finalGoalStatus ?? null
});

await entry.save();

// Clear localStorage (client-side after successful POST)
// In client code:
// await fetch('/api/entries', { method: 'POST', body: ... });
// clearGoal(); // From FastingGoalContext
```

**In client form submission**:

```javascript
const { goalMinutes, clearGoal } = useFastingGoal();

const handleSubmit = async (formData) => {
  // Calculate goal status
  const duration = /* calculate from lastMealTime to firstMealTime */;
  const goalStatus = goalMinutes 
    ? (duration >= goalMinutes ? 'completed' : 'not-completed')
    : 'no-goal';

  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      fastingGoal: goalMinutes,
      goalStatus
    })
  });

  if (response.ok) {
    clearGoal(); // Clear session state
    // ...redirect or show success
  }
};
```

---

## Testing Your Implementation

### Manual Testing Checklist

- [ ] Set goal using preset button (e.g., 16h) - should save and display progress
- [ ] Set goal using custom input (e.g., 14.5h) - should accept decimals
- [ ] Try invalid inputs (0, -5, 200) - should show validation errors
- [ ] Refresh page with active goal - should restore from localStorage
- [ ] Watch progress update every 60 seconds - bar should fill proportionally
- [ ] Change goal mid-fast - progress should recalculate immediately
- [ ] Exceed goal (fast >16h with 16h goal) - should show green bar + checkmark
- [ ] End fast with goal - should save to Entry with correct goalStatus
- [ ] End fast without goal - should save with goalStatus: 'no-goal'
- [ ] Check database - Entry documents should have fastingGoal and goalStatus fields

### Automated Testing

**Unit tests** (Jest + React Testing Library):
- Test GoalSettingPanel validation logic
- Test progress calculation in useMemo
- Test FastingGoalContext provider/consumer

**Integration tests**:
- Test POST /api/entries with goal data
- Test Entry model validation

**E2E tests** (Playwright):
- Test full flow: set goal → view progress → end fast → verify data

---

## Common Pitfalls

1. **Forgetting to clear localStorage on fast end** → Old goals persist to next fast
   - Fix: Call `clearGoal()` after successful entry submission

2. **Using hours instead of minutes in database** → Calculation errors
   - Fix: Always store in minutes (960 not 16)

3. **Not handling >100% progress** → UI breaks or shows confusing results
   - Fix: Use `Math.min(percentage, 100)` for bar width, separate indicator for exceeded

4. **Context provider not wrapping page** → useFastingGoal throws error
   - Fix: Ensure FastingGoalProvider wraps entries page at correct level

5. **Validating only client-side** → Users can bypass validation
   - Fix: Duplicate validation in API endpoint

---

## Performance Optimization Tips

- Use `useMemo` for progress calculations (prevents recalc on every render)
- Debounce custom input onChange (optional - only if performance issues)
- Use CSS transitions for smooth progress bar animation
- Keep Context value stable with `useCallback` for setGoal/clearGoal

---

## Next Steps

1. ✅ **Feature 020 Complete** - Goal setting and progress tracking working
2. **Future Feature**: Analytics dashboard showing goal completion rates
3. **Future Feature**: Goal recommendations based on history
4. **Future Feature**: Gamification (badges for streaks, achievements)

---

## Resources

- **Research Document**: `research.md` - Technical decisions and rationale
- **Data Model**: `data-model.md` - Schema details and relationships
- **API Contract**: `contracts/post-api-entries.md` - API endpoint specification
- **Spec**: `spec.md` - User stories and requirements
- **Feature 017**: Live Fasting Timer (prerequisite)

---

## Getting Help

**Common Issues**:
- localStorage not persisting? Check browser privacy settings (incognito mode)
- Progress not updating? Verify useFastingTimer is running (check elapsedMs)
- Validation errors? Check min/max ranges (1-168 hours = 60-10080 minutes)
- Context errors? Verify provider wraps consuming components

**Need more help?** Review research.md for technical deep dives on specific decisions.
