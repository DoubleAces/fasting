# Quickstart: Biological Fasting Stages Timeline Implementation

**Feature**: 026 - Biological Fasting Stages Timeline  
**Estimated Time**: 16-20 hours (5 implementation phases)  
**Difficulty**: Intermediate  
**Prerequisites**: React hooks, Tailwind CSS, Jest/RTL experience

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Implementation Order](#implementation-order)
4. [Phase 1: Foundation TDD](#phase-1-foundation-tdd)
5. [Phase 2: Core Logic](#phase-2-core-logic)
6. [Phase 3: UI Components](#phase-3-ui-components)
7. [Phase 4: Integration](#phase-4-integration)
8. [Phase 5: E2E Validation](#phase-5-e2e-validation)
9. [Testing Commands](#testing-commands)
10. [Common Pitfalls](#common-pitfalls)
11. [Debugging Tips](#debugging-tips)

---

## Prerequisites

### Required Knowledge

- ✅ React 19.1.0 hooks (useState, useEffect, useRef, useMemo)
- ✅ Next.js 15.5.6 App Router Client Components
- ✅ Tailwind CSS 4.1.14 utility classes
- ✅ Jest 30.2.0 + React Testing Library 16.3.0
- ✅ TDD workflow (write tests first, then implementation)

### Environment

```powershell
# Verify Node.js version
node --version  # Should be 18+

# Verify dependencies installed
npm list react next tailwindcss jest @testing-library/react

# Confirm on correct branch
git branch  # Should show * 026-biological-fasting-stages

# Verify existing timer works
npm run dev
# Visit http://localhost:3000/dashboard, start a fast, confirm timer runs
```

### File Structure Overview

```
src/
├── lib/
│   ├── constants/
│   │   └── fastingStages.js         (NEW - Phase 2)
│   └── utils/
│       └── stageUtils.js             (NEW - Phase 2)
├── hooks/
│   └── useStageCalculation.js        (NEW - Phase 2)
└── components/
    ├── atoms/
    │   └── StageProgressBar.js       (NEW - Phase 3)
    ├── molecules/
    │   └── StageCard.js              (NEW - Phase 3)
    └── organisms/
        ├── BiologicalStagesTimeline.js  (NEW - Phase 3)
        └── FastingTimer.js           (MODIFY - Phase 4)

tests/
├── unit/
│   ├── lib/
│   │   ├── constants/
│   │   │   └── fastingStages.test.js  (NEW - Phase 1)
│   │   └── utils/
│   │       └── stageUtils.test.js     (NEW - Phase 1)
│   └── hooks/
│       └── useStageCalculation.test.js (NEW - Phase 1)
├── components/
│   ├── atoms/
│   │   └── StageProgressBar.test.js   (NEW - Phase 1)
│   ├── molecules/
│   │   └── StageCard.test.js          (NEW - Phase 1)
│   └── organisms/
│       └── BiologicalStagesTimeline.test.js (NEW - Phase 1)
└── e2e/
    └── biological-stages-timeline.spec.js  (NEW - Phase 1)
```

---

## Setup

### 1. Confirm Branch

```powershell
# Should already be on this branch
git status
# On branch 026-biological-fasting-stages
```

### 2. Create Directory Structure

```powershell
# Create test directories
New-Item -ItemType Directory -Force -Path "tests\unit\lib\constants"
New-Item -ItemType Directory -Force -Path "tests\unit\lib\utils"
New-Item -ItemType Directory -Force -Path "tests\unit\hooks"
New-Item -ItemType Directory -Force -Path "tests\components\atoms"
New-Item -ItemType Directory -Force -Path "tests\components\molecules"
New-Item -ItemType Directory -Force -Path "tests\components\organisms"

# Create source directories (if needed)
New-Item -ItemType Directory -Force -Path "src\lib\constants"
New-Item -ItemType Directory -Force -Path "src\lib\utils"
New-Item -ItemType Directory -Force -Path "src\hooks"
```

### 3. Create Test Fixtures

```powershell
# Create shared test data file
New-Item -ItemType File -Path "tests\fixtures\fastingStagesFixtures.js"
```

**Content for `tests/fixtures/fastingStagesFixtures.js`**:
```javascript
export const testElapsedTimes = {
  subOneHour: 0.5 * 60 * 60 * 1000,
  fedState: 2 * 60 * 60 * 1000,
  earlyFasting: 6 * 60 * 60 * 1000,
  glycogenDepletion: 10 * 60 * 60 * 1000,
  earlyKetosis: 14 * 60 * 60 * 1000,
  fullKetosis: 20 * 60 * 60 * 1000,
  autophagy: 36 * 60 * 60 * 1000,
  deepAutophagy: 60 * 60 * 60 * 1000,
  extendedFasting: 80 * 60 * 60 * 1000,
  exactBoundary: 12 * 60 * 60 * 1000
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
  exactBoundary: 3
};
```

---

## Implementation Order

**Follow TDD Workflow**: Write tests → Run tests (fail) → Implement → Run tests (pass) → Refactor → Commit

### Phases

1. **Foundation TDD** (4-5 hours): Write all tests first (20-25 unit + 8-12 component + 5 E2E)
2. **Core Logic** (3-4 hours): Implement config, utils, hooks
3. **UI Components** (4-5 hours): Build atoms → molecules → organisms
4. **Integration** (3-4 hours): Wire into FastingTimer, add scroll behavior
5. **E2E Validation** (2-3 hours): Manual testing, Lighthouse audit, coverage check

---

## Phase 1: Foundation TDD

### Step 1.1: Stage Configuration Tests

**File**: `tests/unit/lib/constants/fastingStages.test.js`

```javascript
import { FASTING_STAGES } from '@/lib/constants/fastingStages';

describe('FASTING_STAGES configuration', () => {
  it('should have exactly 8 stages', () => {
    expect(FASTING_STAGES).toHaveLength(8);
  });

  it('should start at 0 hours', () => {
    expect(FASTING_STAGES[0].hourRangeStart).toBe(0);
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
      expect(stage.biologicalProcesses).toBeInstanceOf(Array);
      expect(stage.scientificSources).toBeInstanceOf(Array);
      expect(stage.scientificSources.length).toBeGreaterThanOrEqual(2);
    });
  });
});
```

**Run test (should fail)**:
```powershell
npm test -- tests/unit/lib/constants/fastingStages.test.js
```

---

### Step 1.2: Stage Calculation Tests

**File**: `tests/unit/lib/utils/stageUtils.test.js`

```javascript
import { calculateTimelineState } from '@/lib/utils/stageUtils';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';
import { testElapsedTimes, expectedStageIndices } from '../../fixtures/fastingStagesFixtures';

describe('calculateTimelineState', () => {
  it('should return correct stage for fed state', () => {
    const state = calculateTimelineState(testElapsedTimes.fedState);
    expect(state.currentStageIndex).toBe(expectedStageIndices.fedState);
    expect(state.currentStage.id).toBe('fed-state');
    expect(state.elapsedHours).toBeCloseTo(2, 1);
  });

  it('should calculate progress within stage', () => {
    const state = calculateTimelineState(testElapsedTimes.fedState); // 2 hours
    // 2 hours into 0-4hr stage = 50% progress
    expect(state.progressWithinStage).toBeCloseTo(0.5, 2);
    expect(state.hoursIntoStage).toBeCloseTo(2, 1);
  });

  it('should transition to next stage at exact boundary', () => {
    const state = calculateTimelineState(testElapsedTimes.exactBoundary); // 12 hours
    expect(state.currentStageIndex).toBe(expectedStageIndices.exactBoundary); // Stage 3 (early ketosis)
    expect(state.progressWithinStage).toBe(0); // Just entered
  });

  it('should handle all stage boundaries correctly', () => {
    const boundaries = [0, 4, 8, 12, 16, 24, 48, 72];
    const expectedIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    
    boundaries.forEach((hours, idx) => {
      const state = calculateTimelineState(hours * 60 * 60 * 1000);
      expect(state.currentStageIndex).toBe(expectedIndices[idx]);
    });
  });

  it('should handle 72+ hour fasts', () => {
    const state = calculateTimelineState(testElapsedTimes.extendedFasting); // 80 hours
    expect(state.currentStageIndex).toBe(7);
    expect(state.currentStage.id).toBe('extended-fasting');
    expect(state.hoursIntoStage).toBeCloseTo(8, 1); // 8 hours past 72hr mark
  });

  it('should return null for invalid inputs', () => {
    expect(calculateTimelineState(null)).toBeNull();
    expect(calculateTimelineState(-1000)).toBeNull();
    expect(calculateTimelineState(0)).toBeNull();
  });

  it('should populate stagesCompleted and stagesUpcoming', () => {
    const state = calculateTimelineState(testElapsedTimes.earlyKetosis); // 14 hours
    expect(state.stagesCompleted).toHaveLength(3); // 0, 1, 2
    expect(state.stagesUpcoming).toHaveLength(4); // 4, 5, 6, 7
    expect(state.currentStage.id).toBe('early-ketosis');
  });
});
```

**Run test (should fail)**:
```powershell
npm test -- tests/unit/lib/utils/stageUtils.test.js
```

---

### Step 1.3: Hook Tests

**File**: `tests/unit/hooks/useStageCalculation.test.js`

```javascript
import { renderHook } from '@testing-library/react';
import { useStageCalculation } from '@/hooks/useStageCalculation';
import { testElapsedTimes, expectedStageIndices } from '../../fixtures/fastingStagesFixtures';

describe('useStageCalculation', () => {
  it('should return null when elapsedMs is null', () => {
    const { result } = renderHook(() => useStageCalculation(null));
    expect(result.current).toBeNull();
  });

  it('should calculate timeline state for valid elapsedMs', () => {
    const { result } = renderHook(() => useStageCalculation(testElapsedTimes.earlyKetosis));
    expect(result.current.currentStageIndex).toBe(expectedStageIndices.earlyKetosis);
    expect(result.current.elapsedHours).toBeCloseTo(14, 1);
  });

  it('should memoize result when elapsedMs unchanged', () => {
    const { result, rerender } = renderHook(
      ({ elapsedMs }) => useStageCalculation(elapsedMs),
      { initialProps: { elapsedMs: testElapsedTimes.fedState } }
    );
    
    const firstResult = result.current;
    rerender({ elapsedMs: testElapsedTimes.fedState }); // Same value
    expect(result.current).toBe(firstResult); // Same object reference
  });

  it('should recalculate when elapsedMs changes', () => {
    const { result, rerender } = renderHook(
      ({ elapsedMs }) => useStageCalculation(elapsedMs),
      { initialProps: { elapsedMs: testElapsedTimes.fedState } }
    );
    
    expect(result.current.currentStageIndex).toBe(0);
    
    rerender({ elapsedMs: testElapsedTimes.earlyKetosis });
    expect(result.current.currentStageIndex).toBe(3);
  });
});
```

**Run test (should fail)**:
```powershell
npm test -- tests/unit/hooks/useStageCalculation.test.js
```

---

### Step 1.4: Component Tests (All Should Fail Initially)

**StageProgressBar Test** (`tests/components/atoms/StageProgressBar.test.js`):
```javascript
import { render, screen } from '@testing-library/react';
import StageProgressBar from '@/components/atoms/StageProgressBar';

describe('StageProgressBar', () => {
  it('should render with 0% progress', () => {
    render(<StageProgressBar progress={0} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('should render with 50% progress', () => {
    render(<StageProgressBar progress={0.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('should render with 100% progress', () => {
    render(<StageProgressBar progress={1.0} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveStyle({ width: '100%' });
  });
});
```

**StageCard Test** (`tests/components/molecules/StageCard.test.js`):
```javascript
import { render, screen } from '@testing-library/react';
import StageCard from '@/components/molecules/StageCard';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';

describe('StageCard', () => {
  const mockStage = FASTING_STAGES[0];

  it('should render stage title and description', () => {
    render(<StageCard stage={mockStage} isCurrent={false} />);
    expect(screen.getByText(mockStage.title)).toBeInTheDocument();
    expect(screen.getByText(mockStage.description)).toBeInTheDocument();
  });

  it('should highlight current stage', () => {
    const { container } = render(<StageCard stage={mockStage} isCurrent={true} />);
    const card = container.firstChild;
    expect(card).toHaveClass('border-purple-500'); // Or however highlighting is done
  });

  it('should render progress bar when current stage', () => {
    render(<StageCard stage={mockStage} isCurrent={true} progress={0.5} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not render progress bar when not current stage', () => {
    render(<StageCard stage={mockStage} isCurrent={false} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

**BiologicalStagesTimeline Test** (`tests/components/organisms/BiologicalStagesTimeline.test.js`):
```javascript
import { render, screen } from '@testing-library/react';
import BiologicalStagesTimeline from '@/components/organisms/BiologicalStagesTimeline';
import { testElapsedTimes } from '../../fixtures/fastingStagesFixtures';

describe('BiologicalStagesTimeline', () => {
  it('should render all 8 stages', () => {
    render(<BiologicalStagesTimeline elapsedMs={testElapsedTimes.earlyKetosis} />);
    expect(screen.getAllByRole('article')).toHaveLength(8); // Assuming each StageCard is an article
  });

  it('should highlight current stage', () => {
    render(<BiologicalStagesTimeline elapsedMs={testElapsedTimes.earlyKetosis} />);
    // Stage 3 should be highlighted
    const stageCards = screen.getAllByRole('article');
    expect(stageCards[3]).toHaveAttribute('data-current', 'true'); // Or similar
  });

  it('should not render when elapsedMs is null', () => {
    const { container } = render(<BiologicalStagesTimeline elapsedMs={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should scroll to current stage on mount', () => {
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    render(<BiologicalStagesTimeline elapsedMs={testElapsedTimes.earlyKetosis} />);
    
    // Should call scrollIntoView after render
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    });
  });
});
```

---

### Step 1.5: E2E Tests

**File**: `tests/e2e/biological-stages-timeline.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Biological Stages Timeline', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and navigate to dashboard
    await page.goto('/login');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('US1-AS1: 14-hour fast shows early ketosis stage highlighted', async ({ page }) => {
    // Start a fast 14 hours ago
    const lastMealTime = new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString();
    await page.evaluate((time) => {
      // Mock API or database to return entry with lastMealTime
    }, lastMealTime);
    
    await page.reload();
    
    // Wait for timeline to render
    await page.waitForSelector('[data-testid="biological-stages-timeline"]');
    
    // Verify current stage is highlighted
    const currentStage = await page.locator('[data-current="true"]');
    await expect(currentStage).toContainText('Early Ketosis');
    
    // Verify progress bar exists and shows progress
    const progressBar = currentStage.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('US2-AS2: Progress bar at 50% for mid-stage fast', async ({ page }) => {
    // 14 hours = midpoint of 12-16hr stage
    const lastMealTime = new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString();
    await page.evaluate((time) => {
      // Setup test data
    }, lastMealTime);
    
    await page.reload();
    await page.waitForSelector('[data-testid="biological-stages-timeline"]');
    
    const progressBar = await page.locator('[data-current="true"] [role="progressbar"]');
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(parseInt(progressValue)).toBeCloseTo(50, 5); // Within 5% tolerance
  });

  test('US3-AS1: Timeline auto-scrolls to current stage on load', async ({ page }) => {
    const lastMealTime = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
    await page.evaluate((time) => {
      // Setup test data
    }, lastMealTime);
    
    await page.reload();
    await page.waitForSelector('[data-testid="biological-stages-timeline"]');
    
    // Check if current stage is in viewport
    const currentStage = await page.locator('[data-current="true"]');
    const isInViewport = await currentStage.isVisible();
    expect(isInViewport).toBe(true);
  });

  test('US4-AS1: Stage transitions from early ketosis to full ketosis', async ({ page }) => {
    // Start at 15.9 hours (near transition to full ketosis at 16hr)
    const lastMealTime = new Date(Date.now() - 15.9 * 60 * 60 * 1000).toISOString();
    await page.evaluate((time) => {
      // Setup test data
    }, lastMealTime);
    
    await page.reload();
    await page.waitForSelector('[data-testid="biological-stages-timeline"]');
    
    // Verify starting in early ketosis
    let currentStage = await page.locator('[data-current="true"]');
    await expect(currentStage).toContainText('Early Ketosis');
    
    // Wait 6 minutes (0.1 hours) for transition
    await page.waitForTimeout(6 * 60 * 1000);
    
    // Verify transitioned to full ketosis
    currentStage = await page.locator('[data-current="true"]');
    await expect(currentStage).toContainText('Full Ketosis');
  });

  test('US1-AS5: 72+ hour fast shows extended fasting stage', async ({ page }) => {
    const lastMealTime = new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString();
    await page.evaluate((time) => {
      // Setup test data
    }, lastMealTime);
    
    await page.reload();
    await page.waitForSelector('[data-testid="biological-stages-timeline"]');
    
    const currentStage = await page.locator('[data-current="true"]');
    await expect(currentStage).toContainText('Extended Fasting');
    await expect(currentStage).toContainText('72+'); // Hour range display
  });
});
```

---

### Checkpoint: Run All Tests (Should Fail)

```powershell
# Run all tests - expect ~35-45 failures
npm test

# Check coverage (should be 0%)
npm test -- --coverage
```

**Expected Output**: All tests fail with "Cannot find module" errors. This is correct! We haven't implemented anything yet.

---

## Phase 2: Core Logic

### Step 2.1: Stage Configuration

**File**: `src/lib/constants/fastingStages.js`

```javascript
/**
 * Biological fasting stages with scientific research backing.
 * Each stage represents a distinct metabolic phase during fasting.
 * 
 * @see specs/026-biological-fasting-stages/research.md Section 1
 */

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
    id: 'early-fasting',
    hourRangeStart: 4,
    hourRangeEnd: 8,
    title: 'Early Fasting',
    description: 'Insulin levels drop, allowing fat cells to release stored energy. The body begins transitioning from glucose to stored energy sources. Blood sugar stabilizes.',
    biologicalProcesses: [
      'Insulin levels decline',
      'Fat cell mobilization begins',
      'Blood sugar stabilization'
    ],
    scientificSources: [
      'Kerndt et al., Fasting: The History, Pathophysiology and Complications (1982)',
      'Cahill, Starvation in Man (1970)'
    ]
  },
  {
    id: 'glycogen-depletion',
    hourRangeStart: 8,
    hourRangeEnd: 12,
    title: 'Glycogen Depletion',
    description: 'Liver glycogen stores become depleted. The body increases fat burning and begins producing ketone bodies. Growth hormone levels rise to preserve muscle mass.',
    biologicalProcesses: [
      'Liver glycogen depletion',
      'Increased fat oxidation',
      'Growth hormone elevation'
    ],
    scientificSources: [
      'Rothman et al., Quantitation of hepatic glycogenolysis (1995)',
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
  {
    id: 'full-ketosis',
    hourRangeStart: 16,
    hourRangeEnd: 24,
    title: 'Full Ketosis',
    description: 'Brain begins utilizing ketones for energy. Fat burning is now the primary fuel source. Ketone levels reach 0.5-3 mM. Mental clarity often improves as brain adapts to ketones.',
    biologicalProcesses: [
      'Brain ketone utilization',
      'Primary fat-burning metabolism',
      'Enhanced mental clarity'
    ],
    scientificSources: [
      'Owen et al., Brain metabolism during fasting (1967)',
      'Veech, Therapeutic implications of ketone bodies (2004)'
    ]
  },
  {
    id: 'autophagy-activation',
    hourRangeStart: 24,
    hourRangeEnd: 48,
    title: 'Autophagy Activation',
    description: 'Cellular recycling process activates. Damaged proteins and organelles are broken down and reused. Immune system regeneration begins. Ketone levels stabilize at 1-3 mM.',
    biologicalProcesses: [
      'Autophagy activation',
      'Cellular cleanup and recycling',
      'Immune system regeneration'
    ],
    scientificSources: [
      'Alirezaei et al., Short-term fasting induces profound neuronal autophagy (2010)',
      'Ohsumi, Nobel Prize in Physiology or Medicine (2016)'
    ]
  },
  {
    id: 'deep-autophagy',
    hourRangeStart: 48,
    hourRangeEnd: 72,
    title: 'Deep Autophagy',
    description: 'Peak autophagy levels. Old immune cells cleared, stem cells activated for regeneration. Significant cellular repair and anti-aging benefits. Ketone levels peak at 2-5 mM.',
    biologicalProcesses: [
      'Peak autophagy activity',
      'Stem cell regeneration',
      'Immune system renewal'
    ],
    scientificSources: [
      'Longo & Mattson, Fasting: Molecular Mechanisms and Clinical Applications (2014)',
      'Cheng et al., Prolonged fasting reduces IGF-1/PKA to promote hematopoietic stem cell regeneration (2014)'
    ]
  },
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

**Run tests**:
```powershell
npm test -- tests/unit/lib/constants/fastingStages.test.js
# Should pass all 5 tests
```

---

### Step 2.2: Stage Calculation Utilities

**File**: `src/lib/utils/stageUtils.js`

```javascript
import { FASTING_STAGES } from '@/lib/constants/fastingStages';

/**
 * Calculate timeline state from elapsed milliseconds
 * @param {number|null} elapsedMs - Milliseconds since fast started
 * @returns {TimelineState|null} Current timeline state or null if invalid
 */
export function calculateTimelineState(elapsedMs) {
  // Guard against invalid inputs
  if (!elapsedMs || elapsedMs <= 0) {
    return null;
  }

  // Guard against missing configuration (should never happen)
  if (!FASTING_STAGES || FASTING_STAGES.length === 0) {
    console.error('FASTING_STAGES configuration missing');
    return null;
  }

  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Find current stage
  const currentStageIndex = FASTING_STAGES.findIndex((stage, idx) => {
    const nextStage = FASTING_STAGES[idx + 1];
    
    // User is in this stage if:
    // 1. Elapsed hours >= stage start AND
    // 2. (No next stage OR elapsed hours < next stage start)
    return elapsedHours >= stage.hourRangeStart && 
           (!nextStage || elapsedHours < nextStage.hourRangeStart);
  });

  // Fallback to first stage if not found (should never happen)
  const safeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStage = FASTING_STAGES[safeIndex];

  // Calculate progress within current stage
  const stageStart = currentStage.hourRangeStart;
  const stageEnd = currentStage.hourRangeEnd || (elapsedHours + 1); // Unbounded = continue
  const hoursIntoStage = elapsedHours - stageStart;
  const stageDuration = stageEnd - stageStart;
  const progressWithinStage = Math.min(hoursIntoStage / stageDuration, 1.0);

  return {
    currentStageIndex: safeIndex,
    elapsedHours,
    progressWithinStage,
    hoursIntoStage,
    stagesCompleted: FASTING_STAGES.slice(0, safeIndex),
    stagesUpcoming: FASTING_STAGES.slice(safeIndex + 1),
    currentStage
  };
}
```

**Run tests**:
```powershell
npm test -- tests/unit/lib/utils/stageUtils.test.js
# Should pass all 10-12 tests
```

---

### Step 2.3: Stage Calculation Hook

**File**: `src/hooks/useStageCalculation.js`

```javascript
'use client';

import { useMemo } from 'react';
import { calculateTimelineState } from '@/lib/utils/stageUtils';

/**
 * Hook to calculate current fasting stage and progress
 * Memoized to prevent unnecessary recalculations
 * 
 * @param {number|null} elapsedMs - Milliseconds since fast started
 * @returns {TimelineState|null} Current timeline state or null if inactive
 */
export function useStageCalculation(elapsedMs) {
  return useMemo(() => {
    if (!elapsedMs || elapsedMs <= 0) {
      return null;
    }
    
    return calculateTimelineState(elapsedMs);
  }, [elapsedMs]);
}
```

**Run tests**:
```powershell
npm test -- tests/unit/hooks/useStageCalculation.test.js
# Should pass all 4-5 tests
```

---

### Checkpoint: Core Logic Complete

```powershell
# Run all unit tests
npm test -- tests/unit/

# Expected: ~25-30 tests passing (config + utils + hook)
# Coverage should be ~80%+ on new files
```

---

## Phase 3: UI Components

### Step 3.1: StageProgressBar (Atom)

**File**: `src/components/atoms/StageProgressBar.js`

```javascript
'use client';

import React from 'react';

/**
 * Progress bar showing completion within a fasting stage
 * @param {Object} props
 * @param {number} props.progress - Progress value 0.0-1.0
 */
const StageProgressBar = React.memo(({ progress }) => {
  const percentage = Math.round(progress * 100);

  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${percentage}% complete`}
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

StageProgressBar.displayName = 'StageProgressBar';

export default StageProgressBar;
```

**Run tests**:
```powershell
npm test -- tests/components/atoms/StageProgressBar.test.js
# Should pass all 3 tests
```

---

### Step 3.2: StageCard (Molecule)

**File**: `src/components/molecules/StageCard.js`

```javascript
'use client';

import React from 'react';
import StageProgressBar from '@/components/atoms/StageProgressBar';

/**
 * Card displaying a single fasting stage
 * @param {Object} props
 * @param {Object} props.stage - Stage configuration object
 * @param {boolean} props.isCurrent - Whether this is the active stage
 * @param {number} [props.progress] - Progress 0.0-1.0 (only for current stage)
 */
const StageCard = React.memo(({ stage, isCurrent, progress }) => {
  const cardClasses = [
    'rounded-xl p-4 mb-3 backdrop-blur-md transition-all duration-300',
    isCurrent 
      ? 'bg-white/20 border-2 border-purple-500 shadow-lg shadow-purple-500/20' 
      : 'bg-white/10 border border-white/20'
  ].join(' ');

  const hourRange = stage.hourRangeEnd 
    ? `${stage.hourRangeStart}-${stage.hourRangeEnd} hours`
    : `${stage.hourRangeStart}+ hours`;

  return (
    <article
      className={cardClasses}
      data-current={isCurrent}
      data-testid={`stage-card-${stage.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">{stage.title}</h3>
        <span className="text-sm text-purple-300 font-medium">{hourRange}</span>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">{stage.description}</p>
      
      <div className="space-y-1 mb-3">
        {stage.biologicalProcesses.map((process, idx) => (
          <div key={idx} className="flex items-start text-xs text-gray-400">
            <span className="mr-2">•</span>
            <span>{process}</span>
          </div>
        ))}
      </div>

      {isCurrent && typeof progress === 'number' && (
        <StageProgressBar progress={progress} />
      )}
    </article>
  );
}, (prevProps, nextProps) => {
  // Only re-render if isCurrent or progress changes
  return prevProps.isCurrent === nextProps.isCurrent &&
         prevProps.progress === nextProps.progress;
});

StageCard.displayName = 'StageCard';

export default StageCard;
```

**Run tests**:
```powershell
npm test -- tests/components/molecules/StageCard.test.js
# Should pass all 4 tests
```

---

### Step 3.3: BiologicalStagesTimeline (Organism)

**File**: `src/components/organisms/BiologicalStagesTimeline.js`

```javascript
'use client';

import React, { useEffect, useRef } from 'react';
import { useStageCalculation } from '@/hooks/useStageCalculation';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';
import StageCard from '@/components/molecules/StageCard';

/**
 * Timeline of biological fasting stages
 * @param {Object} props
 * @param {number|null} props.elapsedMs - Milliseconds since fast started
 */
export default function BiologicalStagesTimeline({ elapsedMs }) {
  const timelineState = useStageCalculation(elapsedMs);
  const currentStageRef = useRef(null);
  const hasScrolled = useRef(false);

  // Auto-scroll to current stage once on mount
  useEffect(() => {
    if (timelineState && currentStageRef.current && !hasScrolled.current) {
      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      currentStageRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
      
      hasScrolled.current = true;
    }
  }, [timelineState]);

  // Don't render if no active fast
  if (!timelineState) {
    return null;
  }

  return (
    <div 
      className="mt-6 max-h-[600px] overflow-y-auto custom-scrollbar"
      data-testid="biological-stages-timeline"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Your Fasting Journey
      </h2>
      
      <div className="space-y-0">
        {FASTING_STAGES.map((stage, index) => {
          const isCurrent = index === timelineState.currentStageIndex;
          
          return (
            <div
              key={stage.id}
              ref={isCurrent ? currentStageRef : null}
            >
              <StageCard
                stage={stage}
                isCurrent={isCurrent}
                progress={isCurrent ? timelineState.progressWithinStage : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Run tests**:
```powershell
npm test -- tests/components/organisms/BiologicalStagesTimeline.test.js
# Should pass all 4-6 tests
```

---

### Checkpoint: UI Components Complete

```powershell
# Run all component tests
npm test -- tests/components/

# Expected: ~12-15 tests passing
# Coverage should be 80%+ on component files
```

---

## Phase 4: Integration

### Step 4.1: Modify FastingTimer

**File**: `src/components/organisms/FastingTimer.js`

**Find the existing structure** (likely around line 80-120):
```javascript
// Existing timer display code
<div className="glassmorphic-card">
  <TimerDisplay ... />
  <GoalProgressDisplay ... />
</div>
```

**Add BiologicalStagesTimeline below**:
```javascript
import BiologicalStagesTimeline from '@/components/organisms/BiologicalStagesTimeline';

// ... inside component render, after existing timer UI:

{isActive && (
  <BiologicalStagesTimeline elapsedMs={elapsedMs} />
)}
```

**Full Integration Example**:
```javascript
'use client';

import { useF fastingTimer } from '@/hooks/useFastingTimer';
import TimerDisplay from '@/components/molecules/TimerDisplay';
import GoalProgressDisplay from '@/components/molecules/GoalProgressDisplay';
import BiologicalStagesTimeline from '@/components/organisms/BiologicalStagesTimeline'; // NEW

export default function FastingTimer({ lastMealTime, date, goalSeconds, isActive }) {
  const { elapsedMs, formattedTime, ... } = useFastingTimer(lastMealTime, date, isActive);

  return (
    <div className="space-y-6">
      {/* Existing timer UI */}
      <div className="glassmorphic-card p-6">
        <TimerDisplay time={formattedTime} />
        {goalSeconds && (
          <GoalProgressDisplay 
            elapsedSeconds={elapsedMs / 1000}
            goalSeconds={goalSeconds}
          />
        )}
      </div>

      {/* NEW: Biological stages timeline */}
      {isActive && <BiologicalStagesTimeline elapsedMs={elapsedMs} />}
    </div>
  );
}
```

---

### Step 4.2: Add Custom Scrollbar Styles

**File**: `src/styles/globals.css` (or component-specific CSS)

```css
/* Custom scrollbar for timeline */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #a855f7, #ec4899);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #9333ea, #db2777);
}
```

---

### Step 4.3: Manual Testing

```powershell
# Start dev server
npm run dev
```

**Test Checklist**:
1. ✅ Login and navigate to dashboard
2. ✅ Start a new fast
3. ✅ Verify timeline appears below timer
4. ✅ Verify current stage (should be Fed State for <4hr fast)
5. ✅ Verify progress bar animates
6. ✅ Verify auto-scroll to current stage
7. ✅ Test manual scroll (should preserve position)
8. ✅ Test on mobile (320px viewport)
9. ✅ Test on tablet (768px viewport)
10. ✅ Test with 14hr fast (use dev tools to modify lastMealTime)

---

### Step 4.4: Integration Tests

**Run integration tests**:
```powershell
npm test -- tests/integration/
# Expected: 5 integration tests passing
```

---

## Phase 5: E2E Validation

### Step 5.1: Run E2E Tests

```powershell
# Run Playwright E2E tests
npx playwright test tests/e2e/biological-stages-timeline.spec.js

# View report
npx playwright show-report
```

**Expected**: All 5 E2E scenarios passing

---

### Step 5.2: Coverage Check

```powershell
# Run full test suite with coverage
npm test -- --coverage

# Check coverage report
open coverage/lcov-report/index.html
```

**Target**: 80%+ coverage on all new files

---

### Step 5.3: Lighthouse Audit

```powershell
# Build production version
npm run build

# Start production server
npm start

# Open Chrome DevTools → Lighthouse
# Run audit on http://localhost:3000/dashboard
```

**Targets**:
- Performance: >90
- Accessibility: 100
- Best Practices: >90
- SEO: >90

---

### Step 5.4: Multi-Device Testing

**Test on**:
1. iPhone SE (375px)
2. iPad (768px)
3. Desktop (1920px)

**Verify**:
- ✅ Timeline scrollable
- ✅ Cards readable
- ✅ Progress bars visible
- ✅ No horizontal scroll
- ✅ Touch scroll smooth

---

## Testing Commands

### Unit Tests

```powershell
# Run all unit tests
npm test -- tests/unit/

# Run specific test file
npm test -- tests/unit/lib/utils/stageUtils.test.js

# Watch mode for TDD
npm test -- --watch tests/unit/
```

### Component Tests

```powershell
# Run all component tests
npm test -- tests/components/

# Run specific component
npm test -- tests/components/molecules/StageCard.test.js
```

### Integration Tests

```powershell
npm test -- tests/integration/
```

### E2E Tests

```powershell
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test tests/e2e/biological-stages-timeline.spec.js

# Debug mode
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed
```

### Coverage

```powershell
# Full coverage report
npm test -- --coverage

# Coverage for specific directory
npm test -- --coverage --collectCoverageFrom="src/components/organisms/**"
```

---

## Common Pitfalls

### Pitfall 1: Stage Boundary Calculations

**Problem**: User at exactly 12 hours shows wrong stage

**Solution**: Ensure `findIndex` uses `<` not `<=` for upper bound
```javascript
// CORRECT:
elapsedHours >= stage.hourRangeStart && 
(!nextStage || elapsedHours < nextStage.hourRangeStart)

// WRONG:
elapsedHours >= stage.hourRangeStart && elapsedHours <= stage.hourRangeEnd
```

---

### Pitfall 2: Progress Bar Overflow

**Problem**: Progress bar exceeds 100% for 72+ hour stage

**Solution**: Cap progress at 1.0 for defined stages
```javascript
const progressWithinStage = Math.min(hoursIntoStage / stageDuration, 1.0);
```

---

### Pitfall 3: Auto-Scroll Firing Repeatedly

**Problem**: Timeline scrolls every time timer updates

**Solution**: Use `useRef` to track if scroll happened
```javascript
const hasScrolled = useRef(false);

useEffect(() => {
  if (timelineState && !hasScrolled.current) {
    currentStageRef.current.scrollIntoView(...);
    hasScrolled.current = true; // Prevent future scrolls
  }
}, [timelineState]);
```

---

### Pitfall 4: Memoization Not Working

**Problem**: StageCard re-renders every second

**Solution**: Use custom comparison function
```javascript
const StageCard = React.memo(({ stage, isCurrent, progress }) => {
  // Component code
}, (prevProps, nextProps) => {
  return prevProps.isCurrent === nextProps.isCurrent &&
         prevProps.progress === nextProps.progress;
});
```

---

### Pitfall 5: Missing 'use client' Directive

**Problem**: "You're importing a component that needs useState..." error

**Solution**: Add `'use client';` to top of files using hooks
```javascript
'use client';

import { useState, useEffect } from 'react';
// ... rest of component
```

---

## Debugging Tips

### Debug Stage Calculations

```javascript
// Add console logs to stageUtils.js
console.log('Elapsed hours:', elapsedHours);
console.log('Current stage index:', currentStageIndex);
console.log('Progress:', progressWithinStage);
```

### Debug Scroll Behavior

```javascript
// In BiologicalStagesTimeline.js
useEffect(() => {
  console.log('Scroll effect triggered:', {
    hasTimelineState: !!timelineState,
    hasRef: !!currentStageRef.current,
    hasScrolled: hasScrolled.current
  });
}, [timelineState]);
```

### Debug Test Failures

```powershell
# Run single test with verbose output
npm test -- tests/unit/lib/utils/stageUtils.test.js --verbose

# Run with debugging
node --inspect-brk node_modules/.bin/jest tests/unit/lib/utils/stageUtils.test.js
```

### Debug E2E Tests

```powershell
# Run with debug mode (pauses execution)
npx playwright test --debug

# Run with headed browser
npx playwright test --headed

# Take screenshots on failure
npx playwright test --screenshot=on
```

---

## Success Criteria Checklist

Before marking feature complete, verify:

- ✅ All 35-45 tests passing
- ✅ 80%+ code coverage
- ✅ Timeline renders all 8 stages
- ✅ Current stage highlights correctly
- ✅ Progress bar shows accurate percentage (±1%)
- ✅ Auto-scroll positions current stage in viewport
- ✅ Stage transitions work at boundaries
- ✅ 72+ hour fasts show extended fasting stage
- ✅ Timeline scrollable on mobile
- ✅ No horizontal scroll at 320px viewport
- ✅ Lighthouse Performance >90
- ✅ Lighthouse Accessibility 100
- ✅ No console errors or warnings
- ✅ Scientific sources included in stage descriptions

---

## Next Steps After Completion

1. **Commit Implementation**:
```powershell
git add .
git commit -m "feat: implement biological fasting stages timeline (Feature 026)

- Add 8 scientifically-backed fasting stages (0-72+ hours)
- Implement stage calculation with memoization
- Add vertical timeline with glassmorphic design
- Include auto-scroll to current stage
- Add 35-45 tests (80%+ coverage)
- Integrate with existing FastingTimer component

Closes #026"
```

2. **Update Documentation**:
- Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`
- Update README.md with feature description
- Add screenshot to docs/

3. **Deploy to Staging**:
```powershell
git push origin 026-biological-fasting-stages
# Open PR, request review
```

4. **Merge to Master**:
```powershell
git checkout master
git merge 026-biological-fasting-stages
git push origin master
```

5. **Production Deployment**:
- Vercel will auto-deploy from master
- Monitor Sentry for errors
- Check analytics for engagement

---

**Estimated Total Time**: 16-20 hours  
**Recommended Pace**: 2 hours/day over 8-10 days for quality TDD workflow

Good luck! 🚀
