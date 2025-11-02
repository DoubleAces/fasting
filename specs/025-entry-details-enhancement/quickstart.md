# Quickstart Implementation Guide

**Feature**: 025 - Entry Details Page Enhancement  
**Date**: October 31, 2025  
**Status**: Complete

## Overview

This guide provides a step-by-step implementation path for the entry details page enhancement, following Test-Driven Development (TDD) principles and the project constitution.

---

## Prerequisites

**Before starting**:
- ✅ Branch created: `025-entry-details-enhancement`
- ✅ Specification complete and validated
- ✅ Design research complete
- ✅ Data model defined
- ✅ Component contracts established

**Environment Setup**:
```powershell
# Ensure on correct branch
git checkout 025-entry-details-enhancement

# Pull latest changes
git pull origin 025-entry-details-enhancement

# Install dependencies (if needed)
npm install

# Run tests to verify baseline
npm run test

# Start development server
npm run dev
```

---

## Implementation Order

Follow this sequence to minimize dependencies and enable incremental testing:

### Phase 1: Foundation (Glassmorphic Styling)
1. Update page.js with background gradient
2. Apply glassmorphic styling to existing sections
3. Test visual appearance manually

### Phase 2: Molecule Components
4. Build InsightCalloutBox (TDD)
5. Build ComparisonCard (TDD)
6. Build TimelineNav (TDD)

### Phase 3: Service Enhancement
7. Enhance entryInsightsService with new insights (TDD)
8. Test aggregation pipeline performance

### Phase 4: Page Data Fetching
9. Update page.js to fetch comparison stats
10. Update page.js to fetch timeline context
11. Test data fetching layer

### Phase 5: Organism Integration
12. Integrate InsightsSection into EntryDetailsView
13. Integrate ComparisonStatsSection into EntryDetailsView
14. Integrate TimelineNavigationSection into EntryDetailsView

### Phase 6: Client Interactions
15. Build DeleteConfirmationModal (TDD)
16. Update EditButton with gradient styling
17. Update DeleteButton with modal integration

### Phase 7: End-to-End Testing
18. Write Playwright E2E tests for all user stories
19. Test edge cases (first entry, insufficient data, etc.)

### Phase 8: Performance & Accessibility
20. Validate ISR caching behavior
21. Test accessibility (keyboard nav, screen reader, contrast)
22. Performance testing (Lighthouse, Core Web Vitals)

---

## TDD Workflow (Red-Green-Refactor)

**For each component/feature**:

### Step 1: Write Failing Test (Red)
```javascript
// Example: InsightCalloutBox
describe('InsightCalloutBox', () => {
  it('renders with celebration styling', () => {
    render(
      <InsightCalloutBox
        type="celebration"
        icon="🎉"
        message="This is your 3rd longest fast"
      />
    );
    
    expect(screen.getByText('This is your 3rd longest fast')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
});
```

**Run test**:
```powershell
npm run test -- InsightCalloutBox
```

**Expected**: ❌ Test fails (component doesn't exist yet)

### Step 2: Implement Minimum Code (Green)
```javascript
// src/components/molecules/InsightCalloutBox.js
export function InsightCalloutBox({ type, icon, message }) {
  return (
    <div>
      <span>{icon}</span>
      <p>{message}</p>
    </div>
  );
}
```

**Run test**:
```powershell
npm run test -- InsightCalloutBox
```

**Expected**: ✅ Test passes

### Step 3: Refactor for Quality
```javascript
// src/components/molecules/InsightCalloutBox.js
const typeStyles = {
  celebration: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50',
  info: 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50',
  neutral: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
};

export function InsightCalloutBox({ type, icon, message, description, className = '' }) {
  return (
    <div className={`${typeStyles[type]} rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{message}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Run test again**:
```powershell
npm run test -- InsightCalloutBox
```

**Expected**: ✅ Test still passes (refactor didn't break behavior)

### Step 4: Add More Tests
```javascript
describe('InsightCalloutBox', () => {
  it('renders with celebration styling', () => { /* ... */ });
  
  it('renders with info styling', () => {
    const { container } = render(
      <InsightCalloutBox type="info" icon="📊" message="Test" />
    );
    expect(container.firstChild).toHaveClass('border-purple-500');
  });
  
  it('renders description when provided', () => {
    render(
      <InsightCalloutBox
        type="neutral"
        icon="✓"
        message="Test"
        description="Additional context"
      />
    );
    expect(screen.getByText('Additional context')).toBeInTheDocument();
  });
  
  it('does not render description when omitted', () => {
    const { container } = render(
      <InsightCalloutBox type="info" icon="📊" message="Test" />
    );
    expect(container.querySelector('.text-sm')).not.toBeInTheDocument();
  });
});
```

**Run all tests**:
```powershell
npm run test -- InsightCalloutBox
```

**Expected**: ✅ All tests pass

---

## Detailed Task Breakdown

### Task 1: Update page.js with Background Gradient

**File**: `src/app/entries/[id]/page.js`

**Test**: Visual inspection (no unit test needed for styling)

**Implementation**:
```javascript
// Add gradient background to page wrapper
export default async function EntryDetailsPage({ params }) {
  // ... existing data fetching ...
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <EntryDetailsView
        entry={entry}
        insights={insights}
        comparisonStats={comparisonStats}
        timelineContext={timelineContext}
        userSettings={userSettings}
        backUrl={searchParams?.from || '/entries'}
      />
    </div>
  );
}
```

**Validation**:
```powershell
# Start dev server
npm run dev

# Open http://localhost:3000/entries/[valid-entry-id]
# Visual check: Page background should be purple-pink-indigo gradient
```

**Time Estimate**: 10 minutes

---

### Task 2: Apply Glassmorphic Styling to Existing Sections

**File**: `src/components/organisms/EntryDetailsView.js`

**Test**: Visual inspection + snapshot test

**Snapshot Test**:
```javascript
// tests/components/EntryDetailsView.test.js
import { render } from '@testing-library/react';
import { EntryDetailsView } from '@/components/organisms/EntryDetailsView';

describe('EntryDetailsView', () => {
  it('matches glassmorphic styling snapshot', () => {
    const mockProps = {
      entry: { /* mock entry */ },
      insights: { /* mock insights */ },
      comparisonStats: { /* mock stats */ },
      timelineContext: { previousEntry: null, nextEntry: null },
      userSettings: { /* mock settings */ }
    };
    
    const { container } = render(<EntryDetailsView {...mockProps} />);
    expect(container).toMatchSnapshot();
  });
});
```

**Implementation**:
```javascript
// Wrap each section in glassmorphic card
<div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
  {/* Section content */}
</div>
```

**Time Estimate**: 30 minutes

---

### Task 3: Build InsightCalloutBox Component (TDD)

**File**: `src/components/molecules/InsightCalloutBox.js`  
**Test File**: `tests/components/InsightCalloutBox.test.js`

**TDD Steps**:
1. Write test for basic rendering ❌
2. Implement minimal component ✅
3. Write test for type variants ❌
4. Implement type styling ✅
5. Write test for optional description ❌
6. Implement description rendering ✅
7. Write test for accessibility ❌
8. Add ARIA attributes ✅

**Full Test Suite**:
```javascript
// tests/components/InsightCalloutBox.test.js
import { render, screen } from '@testing-library/react';
import { InsightCalloutBox } from '@/components/molecules/InsightCalloutBox';

describe('InsightCalloutBox', () => {
  it('renders with celebration styling', () => {
    render(
      <InsightCalloutBox
        type="celebration"
        icon="🎉"
        message="This is your 3rd longest fast"
      />
    );
    
    expect(screen.getByText('This is your 3rd longest fast')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
  
  it('renders with info styling', () => {
    const { container } = render(
      <InsightCalloutBox type="info" icon="📊" message="Test" />
    );
    expect(container.firstChild).toHaveClass('border-purple-500');
  });
  
  it('renders with neutral styling', () => {
    const { container } = render(
      <InsightCalloutBox type="neutral" icon="✓" message="Test" />
    );
    expect(container.firstChild).toHaveClass('border-blue-500');
  });
  
  it('renders description when provided', () => {
    render(
      <InsightCalloutBox
        type="info"
        icon="📊"
        message="Test"
        description="Additional context"
      />
    );
    expect(screen.getByText('Additional context')).toBeInTheDocument();
  });
  
  it('does not render description when omitted', () => {
    const { container } = render(
      <InsightCalloutBox type="info" icon="📊" message="Test" />
    );
    expect(container.querySelector('.text-sm')).not.toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <InsightCalloutBox
        type="info"
        icon="📊"
        message="Test"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

**Implementation** (see contracts/components.md for full code)

**Time Estimate**: 1 hour

---

### Task 4: Build ComparisonCard Component (TDD)

**File**: `src/components/molecules/ComparisonCard.js`  
**Test File**: `tests/components/ComparisonCard.test.js`

**Test Suite**:
```javascript
// tests/components/ComparisonCard.test.js
import { render, screen } from '@testing-library/react';
import { ComparisonCard } from '@/components/molecules/ComparisonCard';

describe('ComparisonCard', () => {
  it('renders comparison data correctly', () => {
    render(
      <ComparisonCard
        label="Overall Average"
        averageValue={15.5}
        currentValue={17.75}
        difference={2.25}
        percentage={14.5}
        trend="up"
      />
    );
    
    expect(screen.getByText('Overall Average')).toBeInTheDocument();
    expect(screen.getByText(/15.5/)).toBeInTheDocument();
    expect(screen.getByText(/17.75/)).toBeInTheDocument();
  });
  
  it('displays up trend indicator', () => {
    render(
      <ComparisonCard
        label="Test"
        averageValue={15}
        currentValue={17}
        difference={2}
        percentage={13.3}
        trend="up"
      />
    );
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
  
  it('displays down trend indicator', () => {
    render(
      <ComparisonCard
        label="Test"
        averageValue={17}
        currentValue={15}
        difference={-2}
        percentage={-11.8}
        trend="down"
      />
    );
    expect(screen.getByText('↓')).toBeInTheDocument();
  });
  
  it('displays equal trend indicator', () => {
    render(
      <ComparisonCard
        label="Test"
        averageValue={16}
        currentValue={16}
        difference={0}
        percentage={0}
        trend="equal"
      />
    );
    expect(screen.getByText('=')).toBeInTheDocument();
  });
  
  it('applies green color for up trend', () => {
    const { container } = render(
      <ComparisonCard
        label="Test"
        averageValue={15}
        currentValue={17}
        difference={2}
        percentage={13.3}
        trend="up"
      />
    );
    expect(container.querySelector('.text-green-600')).toBeInTheDocument();
  });
  
  it('formats duration correctly', () => {
    render(
      <ComparisonCard
        label="Test"
        averageValue={16.5}
        currentValue={18.25}
        difference={1.75}
        percentage={10.6}
        trend="up"
      />
    );
    // Should display "16h 30m" and "18h 15m" (formatted)
    expect(screen.getByText(/16h 30m/)).toBeInTheDocument();
    expect(screen.getByText(/18h 15m/)).toBeInTheDocument();
  });
});
```

**Time Estimate**: 1.5 hours

---

### Task 5: Build TimelineNav Component (TDD)

**File**: `src/components/molecules/TimelineNav.js`  
**Test File**: `tests/components/TimelineNav.test.js`

**Test Suite**:
```javascript
// tests/components/TimelineNav.test.js
import { render, screen } from '@testing-library/react';
import { TimelineNav } from '@/components/molecules/TimelineNav';

describe('TimelineNav', () => {
  it('renders both previous and next entries', () => {
    const mockPrevious = {
      id: 'prev-id',
      date: new Date('2024-10-30'),
      fastDuration: 16,
      daysSince: 1
    };
    
    const mockNext = {
      id: 'next-id',
      date: new Date('2024-11-01'),
      fastDuration: 18,
      daysUntil: 1
    };
    
    render(
      <TimelineNav
        previousEntry={mockPrevious}
        nextEntry={mockNext}
      />
    );
    
    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Next/i)).toBeInTheDocument();
    expect(screen.getByText(/1d ago/i)).toBeInTheDocument();
    expect(screen.getByText(/in 1d/i)).toBeInTheDocument();
  });
  
  it('shows "first entry" message when no previous entry', () => {
    render(
      <TimelineNav
        previousEntry={null}
        nextEntry={{ id: 'next-id', date: new Date(), fastDuration: 16, daysUntil: 1 }}
      />
    );
    
    expect(screen.getByText(/This is your first entry/i)).toBeInTheDocument();
  });
  
  it('shows "latest entry" message when no next entry', () => {
    render(
      <TimelineNav
        previousEntry={{ id: 'prev-id', date: new Date(), fastDuration: 16, daysSince: 1 }}
        nextEntry={null}
      />
    );
    
    expect(screen.getByText(/This is your latest entry/i)).toBeInTheDocument();
  });
  
  it('renders links with correct href', () => {
    const mockPrevious = { id: 'prev-123', date: new Date(), fastDuration: 16, daysSince: 1 };
    const mockNext = { id: 'next-456', date: new Date(), fastDuration: 18, daysUntil: 1 };
    
    render(
      <TimelineNav
        previousEntry={mockPrevious}
        nextEntry={mockNext}
      />
    );
    
    const prevLink = screen.getByRole('link', { name: /Previous/i });
    const nextLink = screen.getByRole('link', { name: /Next/i });
    
    expect(prevLink).toHaveAttribute('href', '/entries/prev-123');
    expect(nextLink).toHaveAttribute('href', '/entries/next-456');
  });
});
```

**Time Estimate**: 1.5 hours

---

### Task 6: Enhance entryInsightsService (TDD)

**File**: `src/lib/services/entryInsightsService.js`  
**Test File**: `tests/unit/entryInsightsService.test.js`

**Test Suite** (add to existing tests):
```javascript
// tests/unit/entryInsightsService.test.js
import { calculateInsights } from '@/lib/services/entryInsightsService';
import { Entry } from '@/lib/models/Entry';

describe('entryInsightsService - Enhanced', () => {
  beforeEach(async () => {
    // Clear database
    await Entry.deleteMany({});
  });
  
  describe('weekendVsWeekdayPattern', () => {
    it('calculates weekend vs weekday averages', async () => {
      const userId = 'test-user-id';
      
      // Create weekday entries (Mon-Fri)
      await Entry.create([
        { userId, date: new Date('2024-10-28'), fastDuration: 16 }, // Mon
        { userId, date: new Date('2024-10-29'), fastDuration: 15 }, // Tue
        { userId, date: new Date('2024-10-30'), fastDuration: 16 }, // Wed
        { userId, date: new Date('2024-10-31'), fastDuration: 15 }, // Thu
        { userId, date: new Date('2024-11-01'), fastDuration: 16 }  // Fri
      ]);
      
      // Create weekend entries (Sat-Sun)
      await Entry.create([
        { userId, date: new Date('2024-11-02'), fastDuration: 18 }, // Sat
        { userId, date: new Date('2024-11-03'), fastDuration: 19 }, // Sun
        { userId, date: new Date('2024-11-09'), fastDuration: 18 }, // Sat
        { userId, date: new Date('2024-11-10'), fastDuration: 17 }  // Sun
      ]);
      
      const currentEntry = await Entry.findOne({ date: new Date('2024-11-02') });
      const insights = await calculateInsights(currentEntry, userId);
      
      expect(insights.weekendVsWeekdayPattern).toBeDefined();
      expect(insights.weekendVsWeekdayPattern.isWeekend).toBe(true);
      expect(insights.weekendVsWeekdayPattern.weekendAvg).toBeCloseTo(18, 0);
      expect(insights.weekendVsWeekdayPattern.weekdayAvg).toBeCloseTo(15.6, 1);
      expect(insights.weekendVsWeekdayPattern.difference).toBeCloseTo(2.4, 1);
    });
    
    it('returns null with insufficient data', async () => {
      const userId = 'test-user-id';
      
      // Only 2 entries total
      await Entry.create([
        { userId, date: new Date('2024-10-28'), fastDuration: 16 },
        { userId, date: new Date('2024-10-29'), fastDuration: 15 }
      ]);
      
      const currentEntry = await Entry.findOne({ date: new Date('2024-10-28') });
      const insights = await calculateInsights(currentEntry, userId);
      
      expect(insights.weekendVsWeekdayPattern).toBeNull();
    });
  });
  
  describe('deviationFromTypical', () => {
    it('calculates deviation from median', async () => {
      const userId = 'test-user-id';
      
      // Create entries: 14, 15, 16, 16, 16, 17, 18 (median = 16)
      await Entry.create([
        { userId, date: new Date('2024-10-20'), fastDuration: 14 },
        { userId, date: new Date('2024-10-21'), fastDuration: 15 },
        { userId, date: new Date('2024-10-22'), fastDuration: 16 },
        { userId, date: new Date('2024-10-23'), fastDuration: 16 },
        { userId, date: new Date('2024-10-24'), fastDuration: 16 },
        { userId, date: new Date('2024-10-25'), fastDuration: 17 },
        { userId, date: new Date('2024-10-26'), fastDuration: 18 }
      ]);
      
      const currentEntry = await Entry.findOne({ date: new Date('2024-10-26') });
      const insights = await calculateInsights(currentEntry, userId);
      
      expect(insights.deviationFromTypical).toBeDefined();
      expect(insights.deviationFromTypical.typicalDuration).toBeCloseTo(16, 0);
      expect(insights.deviationFromTypical.deviation).toBeCloseTo(2, 0);
      expect(insights.deviationFromTypical.percentage).toBeCloseTo(12.5, 1);
    });
  });
  
  describe('streakContribution', () => {
    it('detects entry as part of active streak', async () => {
      const userId = 'test-user-id';
      
      // Create consecutive entries
      await Entry.create([
        { userId, date: new Date('2024-10-28'), fastDuration: 16 },
        { userId, date: new Date('2024-10-29'), fastDuration: 15 },
        { userId, date: new Date('2024-10-30'), fastDuration: 16 },
        { userId, date: new Date('2024-10-31'), fastDuration: 17 }
      ]);
      
      const currentEntry = await Entry.findOne({ date: new Date('2024-10-31') });
      const insights = await calculateInsights(currentEntry, userId);
      
      expect(insights.streakContribution.isPartOfStreak).toBe(true);
      expect(insights.streakContribution.currentStreak).toBe(4);
      expect(insights.streakContribution.streakType).toBe('building');
    });
    
    it('detects no streak with gaps', async () => {
      const userId = 'test-user-id';
      
      // Create entries with gap
      await Entry.create([
        { userId, date: new Date('2024-10-28'), fastDuration: 16 },
        // Gap: Oct 29 missing
        { userId, date: new Date('2024-10-30'), fastDuration: 16 },
        { userId, date: new Date('2024-10-31'), fastDuration: 17 }
      ]);
      
      const currentEntry = await Entry.findOne({ date: new Date('2024-10-31') });
      const insights = await calculateInsights(currentEntry, userId);
      
      expect(insights.streakContribution.isPartOfStreak).toBe(true);
      expect(insights.streakContribution.currentStreak).toBe(2); // Only last 2 days
    });
  });
});
```

**Implementation**:
1. Update aggregation pipeline with new facets
2. Add post-aggregation logic for streak detection
3. Implement fallback for MongoDB <7.0 (no $median operator)

**Time Estimate**: 3 hours

---

### Task 7: Update page.js Data Fetching

**File**: `src/app/entries/[id]/page.js`

**Integration Test**:
```javascript
// tests/integration/entryDetailsPage.test.js
import { render, screen } from '@testing-library/react';
import { getServerSession } from 'next-auth';
import EntryDetailsPage from '@/app/entries/[id]/page';

// Mock NextAuth
jest.mock('next-auth');

describe('Entry Details Page - Data Fetching', () => {
  beforeEach(() => {
    getServerSession.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' }
    });
  });
  
  it('fetches entry, insights, comparison stats, and timeline context', async () => {
    // Create test entry
    const entry = await Entry.create({
      userId: 'test-user-id',
      date: new Date('2024-10-31'),
      fastDuration: 17
    });
    
    const page = await EntryDetailsPage({ params: { id: entry._id.toString() } });
    
    // Page should render EntryDetailsView with all props
    expect(page.type).toBe(EntryDetailsView);
    expect(page.props.entry).toBeDefined();
    expect(page.props.insights).toBeDefined();
    expect(page.props.comparisonStats).toBeDefined();
    expect(page.props.timelineContext).toBeDefined();
  });
  
  it('returns 404 for non-existent entry', async () => {
    const page = await EntryDetailsPage({ params: { id: 'invalid-id' } });
    
    expect(page).toEqual(notFound());
  });
  
  it('returns 404 for entry owned by different user', async () => {
    // Create entry for different user
    const entry = await Entry.create({
      userId: 'other-user-id',
      date: new Date('2024-10-31'),
      fastDuration: 17
    });
    
    const page = await EntryDetailsPage({ params: { id: entry._id.toString() } });
    
    expect(page).toEqual(notFound());
  });
});
```

**Implementation**:
```javascript
// src/app/entries/[id]/page.js
export default async function EntryDetailsPage({ params, searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Validate entry ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }
  
  // Fetch entry with authorization check
  const entry = await Entry.findOne({
    _id: params.id,
    userId: session.user.id
  }).lean();
  
  if (!entry) {
    notFound();
  }
  
  // Fetch user settings (cached)
  const userSettings = await settingsService.getUserSettings(session.user.id);
  
  // Calculate insights (cached)
  const insights = await entryInsightsService.calculateInsights(entry, session.user.id);
  
  // Calculate comparison stats
  const comparisonStats = await calculateComparisonStats(entry, session.user.id);
  
  // Fetch timeline context
  const timelineContext = await fetchTimelineContext(entry, session.user.id);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <EntryDetailsView
        entry={entry}
        insights={insights}
        comparisonStats={comparisonStats}
        timelineContext={timelineContext}
        userSettings={userSettings}
        backUrl={searchParams?.from || '/entries'}
      />
    </div>
  );
}

// Helper: Calculate comparison stats
async function calculateComparisonStats(entry, userId) {
  // ... implementation from data-model.md ...
}

// Helper: Fetch timeline context
async function fetchTimelineContext(entry, userId) {
  // ... implementation from data-model.md ...
}
```

**Time Estimate**: 2 hours

---

### Task 8: Integrate Sections into EntryDetailsView

**File**: `src/components/organisms/EntryDetailsView.js`

**Integration Test**:
```javascript
// tests/components/EntryDetailsView.integration.test.js
import { render, screen } from '@testing-library/react';
import { EntryDetailsView } from '@/components/organisms/EntryDetailsView';

describe('EntryDetailsView - Integration', () => {
  const mockProps = {
    entry: {
      _id: 'test-id',
      date: new Date('2024-10-31'),
      fastDuration: 17.5,
      moodLevel: 4,
      energyLevel: 5,
      hungerLevel: 2
    },
    insights: {
      rankData: { rankPosition: 3, totalEntries: 25 },
      weekendVsWeekdayPattern: {
        isWeekend: false,
        weekendAvg: 18,
        weekdayAvg: 16,
        difference: 2
      },
      deviationFromTypical: {
        typicalDuration: 16,
        deviation: 1.5,
        percentage: 9.4
      },
      streakContribution: {
        isPartOfStreak: true,
        currentStreak: 5,
        streakType: 'building'
      }
    },
    comparisonStats: {
      overallAverage: { value: 15.5, difference: 2, percentage: 12.9, trend: 'up' },
      thirtyDayAverage: { value: 16, difference: 1.5, percentage: 9.4, trend: 'up' },
      dayOfWeekAverage: {
        dayName: 'Thursday',
        value: 15.8,
        difference: 1.7,
        percentage: 10.8,
        trend: 'up'
      }
    },
    timelineContext: {
      previousEntry: {
        id: 'prev-id',
        date: new Date('2024-10-30'),
        fastDuration: 16,
        daysSince: 1
      },
      nextEntry: {
        id: 'next-id',
        date: new Date('2024-11-01'),
        fastDuration: 18,
        daysUntil: 1
      }
    },
    userSettings: {
      theme: 'light',
      timezone: 'America/New_York',
      units: 'imperial',
      defaultFastDuration: 16
    }
  };
  
  it('renders all sections', () => {
    render(<EntryDetailsView {...mockProps} />);
    
    expect(screen.getByText(/Personalized Insights/i)).toBeInTheDocument();
    expect(screen.getByText(/How This Compares/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeline/i)).toBeInTheDocument();
  });
  
  it('displays insights correctly', () => {
    render(<EntryDetailsView {...mockProps} />);
    
    expect(screen.getByText(/your #3 longest fast/i)).toBeInTheDocument();
    expect(screen.getByText(/5-day streak/i)).toBeInTheDocument();
  });
  
  it('displays comparison stats correctly', () => {
    render(<EntryDetailsView {...mockProps} />);
    
    expect(screen.getByText(/Overall Average/i)).toBeInTheDocument();
    expect(screen.getByText(/30-Day Average/i)).toBeInTheDocument();
    expect(screen.getByText(/Thursday Average/i)).toBeInTheDocument();
  });
  
  it('displays timeline navigation', () => {
    render(<EntryDetailsView {...mockProps} />);
    
    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Next/i)).toBeInTheDocument();
  });
});
```

**Time Estimate**: 2 hours

---

### Task 9: Build DeleteConfirmationModal (TDD)

**File**: `src/components/molecules/DeleteConfirmationModal.js`  
**Test File**: `tests/components/DeleteConfirmationModal.test.js`

**Test Suite**:
```javascript
// tests/components/DeleteConfirmationModal.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationModal } from '@/components/molecules/DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  it('renders modal with message', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );
    
    expect(screen.getByText(/Delete Entry?/i)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });
  
  it('calls onConfirm when Delete button clicked', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Delete'));
    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });
  
  it('calls onCancel when Cancel button clicked', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('calls onCancel when ESC key pressed', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('calls onCancel when overlay clicked', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    const { container } = render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
      />
    );
    
    fireEvent.click(container.querySelector('.fixed.inset-0'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('disables buttons when deleting', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        isDeleting={true}
      />
    );
    
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Deleting...')).toBeDisabled();
  });
  
  it('does not call onCancel when overlay clicked during deletion', () => {
    const mockConfirm = jest.fn();
    const mockCancel = jest.fn();
    
    const { container } = render(
      <DeleteConfirmationModal
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        isDeleting={true}
      />
    );
    
    fireEvent.click(container.querySelector('.fixed.inset-0'));
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
```

**Time Estimate**: 1.5 hours

---

### Task 10: Write E2E Tests (Playwright)

**File**: `tests/e2e/entry-details.spec.js`

**Test Suite**:
```javascript
// tests/e2e/entry-details.spec.js
import { test, expect } from '@playwright/test';

test.describe('Entry Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate
    await page.goto('/auth/signin');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/entries');
  });
  
  test('US1: View beautifully styled entry details', async ({ page }) => {
    // Click on first entry
    await page.click('[data-testid="entry-card"]:first-child');
    
    // Should navigate to entry details
    await expect(page).toHaveURL(/\/entries\/[a-f0-9]{24}/);
    
    // Should see glassmorphic background gradient
    const body = await page.locator('body');
    await expect(body).toHaveCSS('background', /gradient/);
    
    // Should see glassmorphic cards
    const cards = await page.locator('.backdrop-blur-md').count();
    expect(cards).toBeGreaterThan(3);
  });
  
  test('US2: See personalized insights', async ({ page }) => {
    await page.goto('/entries/[test-entry-id]');
    
    // Should see "Personalized Insights" section
    await expect(page.locator('text=Personalized Insights')).toBeVisible();
    
    // Should see at least one insight callout
    const insights = await page.locator('[data-testid="insight-callout"]').count();
    expect(insights).toBeGreaterThan(0);
    
    // Should see rank insight (if available)
    const rankInsight = page.locator('text=/your #\\d+ longest fast/i');
    if (await rankInsight.count() > 0) {
      await expect(rankInsight).toBeVisible();
    }
  });
  
  test('US3: Compare entry to personal averages', async ({ page }) => {
    await page.goto('/entries/[test-entry-id]');
    
    // Should see "How This Compares" section
    await expect(page.locator('text=How This Compares')).toBeVisible();
    
    // Should see 3 comparison cards
    const comparisonCards = await page.locator('[data-testid="comparison-card"]').count();
    expect(comparisonCards).toBe(3);
    
    // Should see "Overall Average", "30-Day Average", "Day-of-Week Average"
    await expect(page.locator('text=Overall Average')).toBeVisible();
    await expect(page.locator('text=30-Day Average')).toBeVisible();
    await expect(page.locator('text=/\\w+ Average/')).toBeVisible();
  });
  
  test('US4: Navigate entry timeline', async ({ page }) => {
    await page.goto('/entries/[test-entry-id]');
    
    // Should see timeline section
    await expect(page.locator('text=Timeline')).toBeVisible();
    
    // Click "Previous" entry link
    const previousLink = page.locator('text=Previous');
    if (await previousLink.count() > 0) {
      await previousLink.click();
      await expect(page).toHaveURL(/\/entries\/[a-f0-9]{24}/);
    }
  });
  
  test('US5: Edit entry with prominent action', async ({ page }) => {
    await page.goto('/entries/[test-entry-id]');
    
    // Should see Edit button with gradient styling
    const editButton = page.locator('text=Edit Entry');
    await expect(editButton).toBeVisible();
    await expect(editButton).toHaveClass(/bg-gradient-to-r/);
    
    // Click Edit button
    await editButton.click();
    
    // Should navigate to edit page
    await expect(page).toHaveURL(/\/entries\/[a-f0-9]{24}\/edit/);
  });
  
  test('US5: Delete entry with confirmation', async ({ page }) => {
    await page.goto('/entries/[test-entry-id]');
    
    // Should see Delete button
    const deleteButton = page.locator('text=Delete Entry');
    await expect(deleteButton).toBeVisible();
    
    // Click Delete button
    await deleteButton.click();
    
    // Should see confirmation modal
    await expect(page.locator('text=Delete Entry?')).toBeVisible();
    await expect(page.locator('text=This action cannot be undone')).toBeVisible();
    
    // Click Cancel
    await page.click('text=Cancel');
    
    // Modal should close
    await expect(page.locator('text=Delete Entry?')).not.toBeVisible();
  });
  
  test('Edge case: First entry shows appropriate message', async ({ page }) => {
    // Navigate to first entry (assuming it's the only one)
    await page.goto('/entries/[first-entry-id]');
    
    // Should see "This is your first entry" message
    await expect(page.locator('text=This is your first entry')).toBeVisible();
  });
  
  test('Edge case: Latest entry shows appropriate message', async ({ page }) => {
    // Navigate to latest entry
    await page.goto('/entries/[latest-entry-id]');
    
    // Should see "This is your latest entry" message
    await expect(page.locator('text=This is your latest entry')).toBeVisible();
  });
});
```

**Time Estimate**: 3 hours

---

## Testing Checklist

**Before marking feature complete**:

- [ ] All unit tests pass (npm run test)
- [ ] All integration tests pass
- [ ] All E2E tests pass (npm run test:e2e)
- [ ] Visual regression tests pass (if applicable)
- [ ] Manual testing on Chrome, Firefox, Safari
- [ ] Mobile responsive testing (iOS Safari, Chrome Android)
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Screen reader testing (VoiceOver or NVDA)
- [ ] Lighthouse score ≥90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Core Web Vitals pass:
  - [ ] LCP <2.5s
  - [ ] FID <100ms
  - [ ] CLS <0.1
- [ ] No console errors or warnings
- [ ] No accessibility violations (axe DevTools)
- [ ] ISR caching verified (check page load times)
- [ ] Cache invalidation works (edit/delete entry, verify revalidation)

---

## Performance Validation

**Lighthouse Audit**:
```powershell
# Run Lighthouse
npx lighthouse http://localhost:3000/entries/[entry-id] --view
```

**Expected Scores**:
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

**Core Web Vitals** (Chrome DevTools → Performance):
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

**Cache Performance**:
```powershell
# Test page load with cold cache
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/entries/[entry-id]

# Test page load with warm cache (should be faster)
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/entries/[entry-id]
```

---

## Accessibility Validation

**Keyboard Navigation**:
- Tab through all interactive elements
- Enter activates buttons/links
- ESC closes modal
- Focus visible on all elements

**Screen Reader Testing**:
- VoiceOver (Mac): Cmd+F5 to enable
- NVDA (Windows): Download and install
- Test: Navigate through page, verify all content announced

**Contrast Checking**:
- Use Chrome DevTools → Inspect → Accessibility
- Verify all text meets WCAG 2.1 AA (4.5:1 ratio)

**Axe DevTools**:
```powershell
# Install extension
# https://www.deque.com/axe/browser-extensions/

# Run scan on entry details page
# Should return 0 violations
```

---

## Deployment Checklist

**Before merging to master**:

- [ ] All tests pass in CI/CD
- [ ] Feature branch rebased on latest master
- [ ] No merge conflicts
- [ ] Code review approved (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Changelog entry added (if applicable)

**After merging**:

- [ ] Deploy to staging environment
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours
- [ ] Verify analytics tracking (if applicable)

---

## Troubleshooting

### Issue: Insights not displaying

**Diagnosis**:
```javascript
// Check cache service
const cacheKey = `insights:${userId}:${entryId}`;
const cached = await serverCacheService.get(cacheKey);
console.log('Cached insights:', cached);

// Check aggregation pipeline
const insights = await entryInsightsService.calculateInsights(entry, userId);
console.log('Calculated insights:', insights);
```

**Solutions**:
- Clear cache: `serverCacheService.del(cacheKey)`
- Verify database connection
- Check MongoDB aggregation pipeline logs

### Issue: ISR not revalidating

**Diagnosis**:
```javascript
// In page.js, check revalidate export
export const revalidate = 300; // Should be present

// Check Next.js build output
npm run build
# Look for "ISR" indicator next to /entries/[id]
```

**Solutions**:
- Verify `revalidate` export exists
- Use `revalidatePath('/entries/[id]')` after entry update
- Clear Next.js cache: `rm -rf .next`

### Issue: Tests failing

**Diagnosis**:
```powershell
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- InsightCalloutBox.test.js
```

**Solutions**:
- Check test database connection
- Verify mock data matches schema
- Clear test database: `await Entry.deleteMany({})`

---

## Summary

**Estimated Total Time**: 20-25 hours

**Key Success Factors**:
1. Follow TDD rigorously (tests first, then implementation)
2. Incremental development (small commits, frequent testing)
3. Constitution compliance at every step
4. Performance monitoring throughout
5. Accessibility testing at component level

**Ready to implement**: All specifications, designs, and contracts in place. Follow this guide sequentially for smooth feature delivery.
