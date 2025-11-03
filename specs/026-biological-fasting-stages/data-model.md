# Data Model: Biological Fasting Stages Timeline

**Feature**: 026 - Biological Fasting Stages Timeline  
**Date**: November 2, 2025  
**Status**: Complete

## Overview

This feature introduces a visual timeline showing biological fasting stages but **does not add any new database entities**. All data is either:
1. **Static configuration** (stage definitions in code)
2. **Computed on-demand** (current stage, progress calculated client-side)

The timeline leverages existing Entry data (lastMealTime, date) through the established useFastingTimer hook.

---

## Entity Definitions

### 1. FastingStage (Static Configuration - Not Persisted)

**Description**: Represents a biological phase during fasting. Defined as a JavaScript constant array.

**Location**: `src/lib/constants/fastingStages.js`

**Schema**:
```javascript
{
  id: string,                      // Unique identifier (e.g., "fed-state", "early-ketosis")
  hourRangeStart: number,          // Start hour (0 for first stage)
  hourRangeEnd: number | null,     // End hour (null for 72+ unbounded stage)
  title: string,                   // Display name (e.g., "Early Ketosis")
  description: string,             // Scientific explanation (50-150 words)
  biologicalProcesses: string[],   // Key processes (e.g., ["Ketone production", "Fat oxidation"])
  scientificSources: string[]      // Citation references for validation
}
```

**Example**:
```javascript
export const FASTING_STAGES = [
  {
    id: 'fed-state',
    hourRangeStart: 0,
    hourRangeEnd: 4,
    title: 'Fed State',
    description: 'After eating, insulin rises to facilitate glucose uptake. Blood glucose peaks 1-2 hours post-meal. The body is in anabolic state, storing excess glucose as glycogen in liver and muscles.',
    biologicalProcesses: [
      'Digestion and nutrient absorption',
      'Insulin elevation',
      'Glycogen storage in liver and muscles'
    ],
    scientificSources: [
      'Berg et al., Biochemistry 8th Edition',
      'Cahill, Fuel Metabolism in Starvation (2006)'
    ]
  },
  {
    id: 'early-ketosis',
    hourRangeStart: 12,
    hourRangeEnd: 16,
    title: 'Early Ketosis',
    description: 'As glycogen depletes, liver begins producing ketone bodies from fatty acids. Metabolic switch from glucose to fat burning initiates. Ketone levels rise to 0.2-0.5 mM.',
    biologicalProcesses: [
      'Ketone production begins',
      'Fat oxidation increases',
      'Metabolic switching'
    ],
    scientificSources: [
      'Cahill, Fuel Metabolism in Starvation',
      'Veech, Therapeutic implications of ketone bodies (2004)'
    ]
  },
  // ... 6 more stages
  {
    id: 'extended-fasting',
    hourRangeStart: 72,
    hourRangeEnd: null, // Unbounded
    title: 'Extended Fasting (72+ Hours)',
    description: 'Beyond 72 hours, body continues deep autophagy and cellular regeneration. Studies show potential for immune system rejuvenation. Ketone levels plateau at optimal ranges. Medical supervision recommended.',
    biologicalProcesses: [
      'Continued cellular regeneration',
      'Immune system reset potential',
      'Sustained ketone production'
    ],
    scientificSources: [
      'Cheng et al., Cell Stem Cell (2014)',
      'Longo lab fasting-mimicking studies'
    ]
  }
];
```

**Validation Rules**:
- All 8 stages defined in ascending order
- No overlapping hour ranges
- Last stage `hourRangeEnd` must be `null` (unbounded)
- All required fields present
- Description 50-150 words
- Minimum 2 scientific sources per stage

**Relationships**: None - static data

**Indexes**: N/A - not persisted

---

### 2. TimelineState (Computed Type - Not Persisted)

**Description**: Represents a user's current position in the fasting timeline. Calculated on-demand in React component.

**Location**: Computed in `useStageCalculation` hook

**TypeScript Interface** (for documentation):
```typescript
interface TimelineState {
  currentStageIndex: number;        // Index in FASTING_STAGES array (0-7)
  elapsedHours: number;             // Total hours fasted (e.g., 14.5)
  progressWithinStage: number;      // Percentage through current stage (0.0-1.0)
  hoursIntoStage: number;           // Hours since entering current stage
  stagesCompleted: FastingStage[];  // Stages before current (for rendering)
  stagesUpcoming: FastingStage[];   // Stages after current (for rendering)
  currentStage: FastingStage;       // The active stage object
}
```

**Calculation Logic**:
```javascript
function calculateTimelineState(elapsedMs) {
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  // Find current stage
  const currentStageIndex = FASTING_STAGES.findIndex((stage, idx) => {
    const nextStage = FASTING_STAGES[idx + 1];
    return elapsedHours >= stage.hourRangeStart && 
           (!nextStage || elapsedHours < nextStage.hourRangeStart);
  });
  
  const currentStage = FASTING_STAGES[currentStageIndex];
  const stageStart = currentStage.hourRangeStart;
  const stageEnd = currentStage.hourRangeEnd || (elapsedHours + 1); // Unbounded = continue
  
  const hoursIntoStage = elapsedHours - stageStart;
  const progressWithinStage = Math.min(
    hoursIntoStage / (stageEnd - stageStart),
    1.0
  );
  
  return {
    currentStageIndex,
    elapsedHours,
    progressWithinStage,
    hoursIntoStage,
    stagesCompleted: FASTING_STAGES.slice(0, currentStageIndex),
    stagesUpcoming: FASTING_STAGES.slice(currentStageIndex + 1),
    currentStage
  };
}
```

**Edge Cases**:
- **Sub-1-hour fast**: currentStageIndex = 0 (fed state), progressWithinStage = 0.0-0.25
- **Exactly at boundary** (e.g., 12.0 hours): User enters next stage, progressWithinStage = 0.0
- **72+ hours**: currentStageIndex = 7 (extended fasting), progressWithinStage continues beyond 1.0 (acceptable)

**Relationships**: None - ephemeral state

**Storage**: Client-side React state only (not persisted)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ MongoDB (Existing)                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Entry Collection                                        │ │
│ │ { lastMealTime: "10:00", date: "2025-11-02", ... }    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Server Component fetches)
┌─────────────────────────────────────────────────────────────┐
│ FastingTimer (Client Component)                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ useFastingTimer(lastMealTime, date, isActive)          │ │
│ │   → elapsedMs, formattedTime                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                         │                                    │
│            ┌────────────┴────────────┐                      │
│            ▼                         ▼                      │
│  ┌─────────────────┐      ┌────────────────────────┐       │
│  │ TimerDisplay    │      │ useStageCalculation    │       │
│  │ (existing)      │      │   → TimelineState      │       │
│  └─────────────────┘      └────────────────────────┘       │
│                                     │                        │
│                                     ▼                        │
│              ┌──────────────────────────────────────┐       │
│              │ BiologicalStagesTimeline             │       │
│              │  ┌────────────────────────────────┐  │       │
│              │  │ FASTING_STAGES (static config)│  │       │
│              │  │  - 8 stage definitions        │  │       │
│              │  └────────────────────────────────┘  │       │
│              │  │                                    │       │
│              │  ▼ (map stages to UI)                │       │
│              │  ┌────────────────────────────────┐  │       │
│              │  │ StageCard × 8                  │  │       │
│              │  │  - Current stage highlighted   │  │       │
│              │  │  - Progress bar in current     │  │       │
│              │  └────────────────────────────────┘  │       │
│              └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow Summary**:
1. Entry data fetched from MongoDB (existing flow - Feature 017)
2. `useFastingTimer` calculates `elapsedMs` from `lastMealTime`
3. `useStageCalculation` computes `TimelineState` from `elapsedMs`
4. `BiologicalStagesTimeline` renders stages with `TimelineState` + `FASTING_STAGES`
5. No data written back to database

---

## Data Validation

### Stage Configuration Validation

**Location**: `tests/unit/lib/constants/fastingStages.test.js`

**Validation Rules**:
```javascript
describe('FASTING_STAGES configuration', () => {
  it('should have exactly 8 stages', () => {
    expect(FASTING_STAGES).toHaveLength(8);
  });

  it('should have non-overlapping hour ranges', () => {
    for (let i = 0; i < FASTING_STAGES.length - 1; i++) {
      expect(FASTING_STAGES[i].hourRangeEnd).toBe(
        FASTING_STAGES[i + 1].hourRangeStart
      );
    }
  });

  it('should have last stage with unbounded end', () => {
    expect(FASTING_STAGES[7].hourRangeEnd).toBeNull();
  });

  it('should have all required fields', () => {
    FASTING_STAGES.forEach(stage => {
      expect(stage).toHaveProperty('id');
      expect(stage).toHaveProperty('hourRangeStart');
      expect(stage).toHaveProperty('title');
      expect(stage).toHaveProperty('description');
      expect(stage).toHaveProperty('biologicalProcesses');
      expect(stage).toHaveProperty('scientificSources');
      expect(stage.scientificSources.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should be in ascending order by hourRangeStart', () => {
    for (let i = 1; i < FASTING_STAGES.length; i++) {
      expect(FASTING_STAGES[i].hourRangeStart).toBeGreaterThan(
        FASTING_STAGES[i - 1].hourRangeStart
      );
    }
  });
});
```

### TimelineState Validation

**Location**: `tests/unit/lib/utils/stageUtils.test.js`

**Boundary Conditions**:
```javascript
describe('calculateTimelineState', () => {
  it('should return stage 0 for 0-4 hour range', () => {
    const state = calculateTimelineState(2 * 60 * 60 * 1000); // 2 hours
    expect(state.currentStageIndex).toBe(0);
    expect(state.progressWithinStage).toBeCloseTo(0.5, 2); // 50% through 0-4hr stage
  });

  it('should transition to stage 1 at exactly 4 hours', () => {
    const state = calculateTimelineState(4 * 60 * 60 * 1000);
    expect(state.currentStageIndex).toBe(1); // 4-8hr stage
    expect(state.progressWithinStage).toBe(0.0); // Just entered
  });

  it('should handle 72+ hour fasts', () => {
    const state = calculateTimelineState(80 * 60 * 60 * 1000); // 80 hours
    expect(state.currentStageIndex).toBe(7); // Extended fasting stage
    expect(state.hoursIntoStage).toBe(8); // 8 hours past 72hr mark
  });

  it('should cap progress at 1.0 for defined stages', () => {
    const state = calculateTimelineState(15.9 * 60 * 60 * 1000); // 15.9 hours
    expect(state.progressWithinStage).toBeLessThanOrEqual(1.0);
  });
});
```

---

## Migration Plan

**No Migration Required**: This feature does not modify any existing database schemas.

**Existing Schemas Unchanged**:
- ✅ Entry model: No new fields
- ✅ User model: No new fields
- ✅ Settings model: No new fields
- ✅ MongoDB indexes: No changes

**Backward Compatibility**: 100% - Timeline is additive UI feature only.

**Rollback Strategy**: Simple component removal - no data cleanup needed.

---

## Performance Considerations

### Computation Complexity

**Stage Calculation**:
- **Time Complexity**: O(n) where n = 8 (constant)
- **Space Complexity**: O(1) - no arrays created beyond input
- **Estimated Runtime**: <1ms per calculation
- **Update Frequency**: Every 60 seconds (matches timer)

**Optimization**:
```javascript
// Memoize calculation to prevent unnecessary re-renders
const timelineState = useMemo(() => {
  return calculateTimelineState(elapsedMs);
}, [elapsedMs]);
```

**Performance Budget**:
- Initial render: <500ms (includes all 8 stage cards)
- Re-render on timer update: <16ms (60fps target)
- Memory footprint: ~5KB (8 stages × ~600 bytes each)

### Rendering Optimization

**React.memo for StageCard**:
```javascript
const StageCard = React.memo(({ stage, isCurrent, progress }) => {
  // Only re-renders if props change
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if isCurrent or progress changes
  return prevProps.isCurrent === nextProps.isCurrent &&
         prevProps.progress === nextProps.progress;
});
```

**Virtual Scrolling**: Not needed (only 8 items, all visible)

**Lazy Loading**: Not needed (all stages required for scroll positioning)

---

## Testing Data

### Test Fixtures

**Location**: `tests/fixtures/fastingStagesFixtures.js`

```javascript
export const testElapsedTimes = {
  subOneHour: 0.5 * 60 * 60 * 1000,    // 30 minutes
  fedState: 2 * 60 * 60 * 1000,         // 2 hours (0-4hr stage)
  earlyFasting: 6 * 60 * 60 * 1000,     // 6 hours (4-8hr stage)
  glycogenDepletion: 10 * 60 * 60 * 1000, // 10 hours (8-12hr stage)
  earlyKetosis: 14 * 60 * 60 * 1000,    // 14 hours (12-16hr stage)
  fullKetosis: 20 * 60 * 60 * 1000,     // 20 hours (16-24hr stage)
  autophagy: 36 * 60 * 60 * 1000,       // 36 hours (24-48hr stage)
  deepAutophagy: 60 * 60 * 60 * 1000,   // 60 hours (48-72hr stage)
  extendedFasting: 80 * 60 * 60 * 1000, // 80 hours (72+hr stage)
  exactBoundary: 12 * 60 * 60 * 1000    // Exactly 12 hours (boundary test)
};

export const expectedStageIndices = {
  subOneHour: 0,
  fedState: 0,
  earlyFasting: 1,
  glycogenDepletion: 2,
  earlyKetosis: 3,
  fullKetosis: 4,
  autophagy: 5,
  deepAutophagy: 6,
  extendedFasting: 7,
  exactBoundary: 3 // Enters next stage at boundary
};
```

### Mock Data for Component Tests

```javascript
export const mockTimelineState = {
  currentStageIndex: 3,
  elapsedHours: 14.5,
  progressWithinStage: 0.625, // 62.5% through 12-16hr stage
  hoursIntoStage: 2.5,
  stagesCompleted: FASTING_STAGES.slice(0, 3),
  stagesUpcoming: FASTING_STAGES.slice(4),
  currentStage: FASTING_STAGES[3]
};
```

---

## Edge Cases & Null Handling

### Edge Case Matrix

| Scenario | Input | Expected Behavior |
|----------|-------|-------------------|
| No active fast | `elapsedMs = null` or `isActive = false` | Timeline not rendered |
| Sub-1-hour fast | `elapsedMs = 1800000` (30min) | Stage 0, progress 12.5% |
| Exactly at boundary | `elapsedMs = 43200000` (12hr) | Stage 3, progress 0% |
| 72+ hour fast | `elapsedMs = 288000000` (80hr) | Stage 7, shows hours beyond 72 |
| Invalid elapsed time | `elapsedMs = -1000` | Default to stage 0, progress 0% |
| Missing stage config | `FASTING_STAGES = []` | Error caught in tests, cannot deploy |

### Error Handling

```javascript
function useStageCalculation(elapsedMs) {
  return useMemo(() => {
    // Guard against null/undefined
    if (!elapsedMs || elapsedMs <= 0) {
      return null; // Component won't render timeline
    }
    
    // Guard against missing config (should never happen in production)
    if (!FASTING_STAGES || FASTING_STAGES.length === 0) {
      console.error('FASTING_STAGES configuration missing');
      return null;
    }
    
    // Normal calculation
    return calculateTimelineState(elapsedMs);
  }, [elapsedMs]);
}
```

---

## Future Extensibility

### Potential Enhancements (Not Implemented)

**User Customization** (Out of Scope - Spec):
```javascript
// Hypothetical: User-specific stage overrides (not implemented)
interface UserStagePreferences {
  userId: ObjectId;
  customStages?: FastingStage[]; // Override default stages
  hiddenStages?: string[];        // Hide specific stage IDs
  stageNotifications?: boolean;   // Enable push notifications
}
```

**Historical Stage Tracking** (Out of Scope - Spec):
```javascript
// Hypothetical: Track stages reached per fast (not implemented)
interface FastStageHistory {
  entryId: ObjectId;
  stagesReached: string[];        // Array of stage IDs reached
  maxStageIndex: number;          // Furthest stage reached
  timeAtEachStage: number[];      // Minutes spent in each stage
}
```

**Personalized Stage Timing** (Out of Scope - Spec):
```javascript
// Hypothetical: Adjust stage timing based on user metrics (not implemented)
interface PersonalizedStages {
  userId: ObjectId;
  ketosisOffset: number;          // Hours to adjust ketosis onset (e.g., -2 for faster adapters)
  autophagyOffset: number;        // Hours to adjust autophagy activation
  basedOnFastingHistory: boolean; // Calculate from past fasts
}
```

**Note**: All above are explicitly out of scope per specification. Current implementation uses static, generalized stages.

---

## Summary

### Data Model Characteristics

- ✅ **Zero database changes**: No new collections, no schema modifications
- ✅ **Static configuration**: 8 stages defined in code, version-controlled
- ✅ **Client-side computation**: All calculations happen in browser
- ✅ **Ephemeral state**: Timeline position not persisted
- ✅ **Reuses existing data**: Leverages Entry.lastMealTime via useFastingTimer
- ✅ **Testable**: Stage config and calculations easily unit tested
- ✅ **Extensible**: Can add DB layer later without breaking changes

### Key Entities

1. **FastingStage** (static): 8 stages with scientific descriptions
2. **TimelineState** (computed): Current position in timeline

### Integration Points

- Reads: Entry.lastMealTime, Entry.date (via useFastingTimer hook)
- Writes: None
- Dependencies: Feature 017 (Live Fasting Timer)

### Validation

- Configuration validated in unit tests (8 stages, non-overlapping, complete fields)
- Calculation validated at boundaries (0, 4, 8, 12, 16, 24, 48, 72 hours)
- Component rendering validated with mock timeline states

**Ready for Implementation**: All entities defined, calculations specified, validation strategy complete.
