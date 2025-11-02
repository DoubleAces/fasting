# Component Contracts

**Feature**: 025 - Entry Details Page Enhancement  
**Date**: October 31, 2025  
**Status**: Complete

## Overview

This document defines the prop interfaces, component APIs, and service contracts for the entry details page enhancement. All interfaces use TypeScript-style JSDoc annotations for IDE autocomplete and runtime validation.

---

## Page-Level Contracts

### 1. page.js (Server Component)

**File**: `src/app/entries/[id]/page.js`  
**Type**: Next.js Page (Server Component)  
**Purpose**: Fetch data, compute insights, render EntryDetailsView

**Parameters**:
```typescript
interface PageParams {
  params: {
    id: string;              // MongoDB ObjectId as string
  };
  searchParams?: {
    from?: string;           // Optional: Referrer path for back navigation
  };
}
```

**Return Type**:
```typescript
Promise<JSX.Element | notFound()>
```

**Data Fetching**:
```javascript
/**
 * @typedef {Object} PageData
 * @property {Entry} entry - The entry being viewed
 * @property {EntryInsights} insights - Computed insights for the entry
 * @property {ComparisonStats} comparisonStats - Comparison to averages
 * @property {TimelineContext} timelineContext - Previous/next entry info
 * @property {UserSettings} userSettings - User preferences
 */
```

**Error Handling**:
```javascript
// Not found (404)
if (!entry) {
  notFound();
}

// Unauthorized (handled by middleware)
// If not authenticated, middleware redirects to /auth/signin
```

**ISR Configuration**:
```javascript
export const revalidate = 300;  // 5 minutes

export async function generateStaticParams() {
  // Pre-render most recent 10 entries at build time
  const recentEntries = await Entry.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('_id')
    .lean();
  
  return recentEntries.map(entry => ({
    id: entry._id.toString()
  }));
}
```

---

## Organism Component Contracts

### 2. EntryDetailsView

**File**: `src/components/organisms/EntryDetailsView.js`  
**Type**: Server Component (presentational, no interactivity except nested Client Components)  
**Purpose**: Layout and orchestration of entry details sections

**Props Interface**:
```typescript
interface EntryDetailsViewProps {
  /** The entry being displayed */
  entry: Entry;
  
  /** Computed insights for the entry */
  insights: EntryInsights;
  
  /** Comparison statistics */
  comparisonStats: ComparisonStats;
  
  /** Timeline navigation context */
  timelineContext: TimelineContext;
  
  /** User settings for display preferences */
  userSettings: UserSettings;
  
  /** Optional: Referrer path for back navigation */
  backUrl?: string;
}
```

**Prop Validation** (JSDoc):
```javascript
/**
 * Enhanced entry details view with glassmorphic design
 * 
 * @param {Object} props
 * @param {import('@/lib/models/Entry').Entry} props.entry
 * @param {import('@/lib/services/entryInsightsService').EntryInsights} props.insights
 * @param {ComparisonStats} props.comparisonStats
 * @param {TimelineContext} props.timelineContext
 * @param {import('@/lib/models/User').UserSettings} props.userSettings
 * @param {string} [props.backUrl='/entries']
 * @returns {JSX.Element}
 */
export function EntryDetailsView({
  entry,
  insights,
  comparisonStats,
  timelineContext,
  userSettings,
  backUrl = '/entries'
}) {
  // ...
}
```

**Render Structure**:
```jsx
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Existing sections (enhanced styling) */}
    <EntryHeader entry={entry} />
    <CoreDataSection entry={entry} userSettings={userSettings} />
    <WellnessMetricsSection entry={entry} />
    
    {/* New sections */}
    <InsightsSection insights={insights} entry={entry} />
    <ComparisonStatsSection comparisonStats={comparisonStats} entry={entry} />
    <TimelineNavigationSection timelineContext={timelineContext} />
    
    {/* Enhanced actions */}
    <ActionButtonsSection entryId={entry._id} backUrl={backUrl} />
  </div>
</div>
```

**No Default Props**: All props required except `backUrl`.

---

## Molecule Component Contracts

### 3. InsightCalloutBox

**File**: `src/components/molecules/InsightCalloutBox.js`  
**Type**: Server Component (presentational only)  
**Purpose**: Display a single insight with styled callout

**Props Interface**:
```typescript
interface InsightCalloutBoxProps {
  /** Visual style of the callout */
  type: 'celebration' | 'info' | 'neutral';
  
  /** Emoji or icon to display */
  icon: string;
  
  /** Insight message text */
  message: string;
  
  /** Optional: Additional description text */
  description?: string;
  
  /** Optional: Additional CSS classes */
  className?: string;
}
```

**Prop Validation**:
```javascript
/**
 * Insight callout box with gradient styling
 * 
 * @param {Object} props
 * @param {'celebration'|'info'|'neutral'} props.type - Visual style
 * @param {string} props.icon - Emoji or icon (e.g., '🎉', '📊')
 * @param {string} props.message - Main insight message
 * @param {string} [props.description] - Optional additional context
 * @param {string} [props.className] - Optional additional classes
 * @returns {JSX.Element}
 */
export function InsightCalloutBox({
  type,
  icon,
  message,
  description,
  className = ''
}) {
  // ...
}
```

**Styling Variants**:
```javascript
const typeStyles = {
  celebration: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50',
  info: 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50',
  neutral: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
};
```

**Example Usage**:
```jsx
<InsightCalloutBox
  type="celebration"
  icon="🎉"
  message="This is your 3rd longest fast"
  description="You're in the top 10% of your fasts!"
/>
```

---

### 4. ComparisonCard

**File**: `src/components/molecules/ComparisonCard.js`  
**Type**: Server Component (presentational only)  
**Purpose**: Display a single comparison metric with trend indicator

**Props Interface**:
```typescript
interface ComparisonCardProps {
  /** Label for the comparison (e.g., "Overall Average") */
  label: string;
  
  /** Average value to compare against */
  averageValue: number;
  
  /** Current entry value */
  currentValue: number;
  
  /** Difference between current and average */
  difference: number;
  
  /** Percentage difference */
  percentage: number;
  
  /** Trend direction */
  trend: 'up' | 'down' | 'equal';
  
  /** Optional: Additional CSS classes */
  className?: string;
}
```

**Prop Validation**:
```javascript
/**
 * Comparison metric card
 * 
 * @param {Object} props
 * @param {string} props.label - Comparison label
 * @param {number} props.averageValue - Average value (hours)
 * @param {number} props.currentValue - Current entry value (hours)
 * @param {number} props.difference - Difference in hours
 * @param {number} props.percentage - Percentage difference
 * @param {'up'|'down'|'equal'} props.trend - Trend direction
 * @param {string} [props.className] - Optional additional classes
 * @returns {JSX.Element}
 */
export function ComparisonCard({
  label,
  averageValue,
  currentValue,
  difference,
  percentage,
  trend,
  className = ''
}) {
  // ...
}
```

**Trend Styling**:
```javascript
const trendStyles = {
  up: 'text-green-600',
  down: 'text-gray-600',
  equal: 'text-gray-600'
};

const trendIcons = {
  up: '↑',
  down: '↓',
  equal: '='
};
```

**Example Usage**:
```jsx
<ComparisonCard
  label="Overall Average"
  averageValue={15.5}
  currentValue={17.75}
  difference={2.25}
  percentage={14.5}
  trend="up"
/>
```

---

### 5. TimelineNav

**File**: `src/components/molecules/TimelineNav.js`  
**Type**: Server Component (presentational with nested Links)  
**Purpose**: Display previous/next entry navigation

**Props Interface**:
```typescript
interface TimelineNavProps {
  /** Previous entry data (if exists) */
  previousEntry: {
    id: string;
    date: Date;
    fastDuration: number;
    daysSince: number;
  } | null;
  
  /** Next entry data (if exists) */
  nextEntry: {
    id: string;
    date: Date;
    fastDuration: number;
    daysUntil: number;
  } | null;
  
  /** Optional: Additional CSS classes */
  className?: string;
}
```

**Prop Validation**:
```javascript
/**
 * Timeline navigation for previous/next entries
 * 
 * @param {Object} props
 * @param {Object|null} props.previousEntry - Previous entry data
 * @param {string} props.previousEntry.id - Entry ID
 * @param {Date} props.previousEntry.date - Entry date
 * @param {number} props.previousEntry.fastDuration - Fast duration (hours)
 * @param {number} props.previousEntry.daysSince - Days since previous entry
 * @param {Object|null} props.nextEntry - Next entry data (same structure)
 * @param {string} [props.className] - Optional additional classes
 * @returns {JSX.Element}
 */
export function TimelineNav({
  previousEntry,
  nextEntry,
  className = ''
}) {
  // ...
}
```

**Edge Case Rendering**:
```jsx
{/* Previous entry */}
{previousEntry ? (
  <Link href={`/entries/${previousEntry.id}`} className="...">
    <span>← Previous</span>
    <span>{formatDate(previousEntry.date)}</span>
    <span>{formatDuration(previousEntry.fastDuration)}</span>
    <span className="text-xs">{previousEntry.daysSince}d ago</span>
  </Link>
) : (
  <div className="backdrop-blur-md bg-white/70 rounded-xl p-4 text-center">
    <span className="text-gray-500">This is your first entry 🎉</span>
  </div>
)}
```

---

## Section Component Contracts

### 6. InsightsSection

**File**: Defined in `EntryDetailsView.js` (can be extracted if needed)  
**Type**: Server Component  
**Purpose**: Orchestrate display of multiple insights

**Props Interface**:
```typescript
interface InsightsSectionProps {
  /** Computed insights */
  insights: EntryInsights;
  
  /** Entry data for context */
  entry: Entry;
}
```

**Rendering Logic**:
```javascript
/**
 * @param {Object} props
 * @param {EntryInsights} props.insights
 * @param {Entry} props.entry
 */
function InsightsSection({ insights, entry }) {
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
        Personalized Insights
      </h2>
      
      <div className="space-y-3">
        {/* Rank insight */}
        {insights.rankData && (
          <InsightCalloutBox
            type={insights.rankData.rankPosition <= 3 ? 'celebration' : 'info'}
            icon={insights.rankData.rankPosition === 1 ? '🏆' : '🎉'}
            message={`This is your #${insights.rankData.rankPosition} longest fast`}
            description={`Out of ${insights.rankData.totalEntries} total entries`}
          />
        )}
        
        {/* Weekend vs weekday pattern */}
        {insights.weekendVsWeekdayPattern && (
          <InsightCalloutBox
            type="info"
            icon="📊"
            message={
              insights.weekendVsWeekdayPattern.isWeekend
                ? `Your weekend fasts average ${formatDuration(insights.weekendVsWeekdayPattern.weekendAvg)}`
                : `Your weekday fasts average ${formatDuration(insights.weekendVsWeekdayPattern.weekdayAvg)}`
            }
            description={
              Math.abs(insights.weekendVsWeekdayPattern.difference) > 1
                ? `${Math.abs(insights.weekendVsWeekdayPattern.difference).toFixed(1)}h ${
                    insights.weekendVsWeekdayPattern.difference > 0 ? 'longer' : 'shorter'
                  } than ${insights.weekendVsWeekdayPattern.isWeekend ? 'weekdays' : 'weekends'}`
                : 'Consistent across all days'
            }
          />
        )}
        
        {/* Deviation from typical */}
        {insights.deviationFromTypical && (
          <InsightCalloutBox
            type="neutral"
            icon={Math.abs(insights.deviationFromTypical.percentage) < 10 ? '✓' : '📈'}
            message={
              Math.abs(insights.deviationFromTypical.percentage) < 10
                ? 'This is a typical fast for you'
                : `${Math.abs(insights.deviationFromTypical.percentage).toFixed(0)}% ${
                    insights.deviationFromTypical.deviation > 0 ? 'longer' : 'shorter'
                  } than your typical fast`
            }
            description={`Your typical fast: ${formatDuration(insights.deviationFromTypical.typicalDuration)}`}
          />
        )}
        
        {/* Streak contribution */}
        {insights.streakContribution.isPartOfStreak && (
          <InsightCalloutBox
            type="celebration"
            icon="🔥"
            message={`Part of ${insights.streakContribution.currentStreak}-day streak!`}
            description={
              insights.streakContribution.streakType === 'building'
                ? 'Keep it going!'
                : 'You\'re maintaining consistency'
            }
          />
        )}
        
        {/* No insights edge case */}
        {!insights.rankData && !insights.weekendVsWeekdayPattern && (
          <p className="text-gray-600 text-center py-4">
            Keep logging entries to see personalized insights! (Need 10+ entries)
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### 7. ComparisonStatsSection

**File**: Defined in `EntryDetailsView.js` (can be extracted if needed)  
**Type**: Server Component  
**Purpose**: Display comparison metrics in grid layout

**Props Interface**:
```typescript
interface ComparisonStatsSectionProps {
  /** Comparison statistics */
  comparisonStats: ComparisonStats;
  
  /** Entry data for context */
  entry: Entry;
}
```

**Rendering Logic**:
```javascript
/**
 * @param {Object} props
 * @param {ComparisonStats} props.comparisonStats
 * @param {Entry} props.entry
 */
function ComparisonStatsSection({ comparisonStats, entry }) {
  // Handle insufficient data edge case
  if (!comparisonStats) {
    return (
      <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
        <p className="text-gray-600 text-center">
          Log more entries to see comparison statistics! (Need 2+ entries)
        </p>
      </div>
    );
  }
  
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
        How This Compares
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComparisonCard
          label="Overall Average"
          averageValue={comparisonStats.overallAverage.value}
          currentValue={entry.fastDuration}
          difference={comparisonStats.overallAverage.difference}
          percentage={comparisonStats.overallAverage.percentage}
          trend={comparisonStats.overallAverage.trend}
        />
        
        <ComparisonCard
          label="30-Day Average"
          averageValue={comparisonStats.thirtyDayAverage.value}
          currentValue={entry.fastDuration}
          difference={comparisonStats.thirtyDayAverage.difference}
          percentage={comparisonStats.thirtyDayAverage.percentage}
          trend={comparisonStats.thirtyDayAverage.trend}
        />
        
        <ComparisonCard
          label={`${comparisonStats.dayOfWeekAverage.dayName} Average`}
          averageValue={comparisonStats.dayOfWeekAverage.value}
          currentValue={entry.fastDuration}
          difference={comparisonStats.dayOfWeekAverage.difference}
          percentage={comparisonStats.dayOfWeekAverage.percentage}
          trend={comparisonStats.dayOfWeekAverage.trend}
        />
      </div>
    </div>
  );
}
```

---

### 8. TimelineNavigationSection

**File**: Defined in `EntryDetailsView.js` (can be extracted if needed)  
**Type**: Server Component  
**Purpose**: Wrapper for TimelineNav component

**Props Interface**:
```typescript
interface TimelineNavigationSectionProps {
  /** Timeline context with previous/next entries */
  timelineContext: TimelineContext;
}
```

**Rendering Logic**:
```javascript
/**
 * @param {Object} props
 * @param {TimelineContext} props.timelineContext
 */
function TimelineNavigationSection({ timelineContext }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Timeline
      </h2>
      <TimelineNav
        previousEntry={timelineContext.previousEntry}
        nextEntry={timelineContext.nextEntry}
      />
    </div>
  );
}
```

---

## Client Component Contracts

### 9. EditButton

**File**: `src/components/atoms/EditButton.js` (or defined in ActionButtonsSection)  
**Type**: Client Component ('use client')  
**Purpose**: Navigate to edit page with onClick handler

**Props Interface**:
```typescript
interface EditButtonProps {
  /** Entry ID to edit */
  entryId: string;
  
  /** Optional: Additional CSS classes */
  className?: string;
}
```

**Implementation**:
```javascript
'use client';

import { useRouter } from 'next/navigation';

/**
 * @param {Object} props
 * @param {string} props.entryId
 * @param {string} [props.className]
 */
export function EditButton({ entryId, className = '' }) {
  const router = useRouter();
  
  const handleEdit = () => {
    router.push(`/entries/${entryId}/edit`);
  };
  
  return (
    <button
      onClick={handleEdit}
      className={`px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 
                  hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg 
                  transform hover:scale-105 transition-all ${className}`}
    >
      ✏️ Edit Entry
    </button>
  );
}
```

---

### 10. DeleteButton

**File**: `src/components/atoms/DeleteButton.js` (or defined in ActionButtonsSection)  
**Type**: Client Component ('use client')  
**Purpose**: Delete entry with confirmation modal

**Props Interface**:
```typescript
interface DeleteButtonProps {
  /** Entry ID to delete */
  entryId: string;
  
  /** Optional: URL to redirect after deletion */
  redirectUrl?: string;
  
  /** Optional: Additional CSS classes */
  className?: string;
}
```

**Implementation**:
```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toastUtils';

/**
 * @param {Object} props
 * @param {string} props.entryId
 * @param {string} [props.redirectUrl='/entries']
 * @param {string} [props.className]
 */
export function DeleteButton({ entryId, redirectUrl = '/entries', className = '' }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }
      
      showToast('Entry deleted successfully', 'success');
      router.push(redirectUrl);
      router.refresh(); // Revalidate cached pages
    } catch (error) {
      showToast('Failed to delete entry', 'error');
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        className={`px-6 py-3 text-red-600 bg-white border-2 border-red-500 
                    rounded-xl hover:bg-red-50 transition-all ${className}`}
      >
        🗑️ Delete Entry
      </button>
      
      {showConfirmModal && (
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
```

---

### 11. DeleteConfirmationModal

**File**: `src/components/molecules/DeleteConfirmationModal.js`  
**Type**: Client Component ('use client')  
**Purpose**: Confirmation modal for destructive delete action

**Props Interface**:
```typescript
interface DeleteConfirmationModalProps {
  /** Callback when delete is confirmed */
  onConfirm: () => void | Promise<void>;
  
  /** Callback when cancel is clicked */
  onCancel: () => void;
  
  /** Loading state during deletion */
  isDeleting?: boolean;
}
```

**Implementation**:
```javascript
'use client';

import { useEffect } from 'react';

/**
 * @param {Object} props
 * @param {Function} props.onConfirm
 * @param {Function} props.onCancel
 * @param {boolean} [props.isDeleting=false]
 */
export function DeleteConfirmationModal({ onConfirm, onCancel, isDeleting = false }) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, isDeleting]);
  
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={!isDeleting ? onCancel : undefined}
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 
                     p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Delete Entry?
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this entry? This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 
                         rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 
                         hover:from-red-700 hover:to-red-800 rounded-xl shadow-lg 
                         transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Service Contracts

### 12. entryInsightsService (Enhanced)

**File**: `src/lib/services/entryInsightsService.js`  
**Type**: Service Module  
**Status**: ✅ Exists - Minor enhancements

**Method Signature**:
```typescript
/**
 * Calculate personalized insights for an entry
 * 
 * @param {Entry} entry - The entry to calculate insights for
 * @param {string} userId - User ID (for caching and authorization)
 * @returns {Promise<EntryInsights>} - Computed insights
 */
async function calculateInsights(entry, userId): Promise<EntryInsights>
```

**Cache Contract**:
```javascript
// Cache key format
const cacheKey = `insights:${userId}:${entry._id}`;

// TTL: 30 minutes (1800 seconds)
const TTL = 30 * 60;

// Cache implementation
import { serverCacheService } from './serverCacheService';

const cached = await serverCacheService.get(cacheKey);
if (cached) {
  return cached;
}

const insights = await calculateInsightsOptimized(entry, userId);
await serverCacheService.set(cacheKey, insights, TTL);
return insights;
```

**Error Handling**:
```javascript
try {
  const insights = await calculateInsights(entry, userId);
  return insights;
} catch (error) {
  console.error('[entryInsightsService] Calculation failed:', error);
  
  // Fallback: Return minimal insights
  return {
    rankData: null,
    longestThisMonth: null,
    thirtyDayAverage: 0,
    weekendVsWeekdayPattern: null,
    deviationFromTypical: null,
    streakContribution: { isPartOfStreak: false, currentStreak: 0, streakType: 'none' }
  };
}
```

---

## Type Definitions (Reference)

### Entry
```typescript
interface Entry {
  _id: string;
  userId: string;
  date: Date;
  fastDuration: number;
  startTime?: Date;
  endTime?: Date;
  moodLevel?: number;        // 1-5
  energyLevel?: number;      // 1-5
  hungerLevel?: number;      // 1-5
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### EntryInsights
```typescript
interface EntryInsights {
  longestThisMonth: { duration: number; date: Date } | null;
  rankData: { rankPosition: number; totalEntries: number } | null;
  thirtyDayAverage: number;
  weekendVsWeekdayPattern: {
    isWeekend: boolean;
    weekendAvg: number;
    weekdayAvg: number;
    difference: number;
  } | null;
  deviationFromTypical: {
    typicalDuration: number;
    deviation: number;
    percentage: number;
  } | null;
  streakContribution: {
    isPartOfStreak: boolean;
    currentStreak: number;
    streakType: 'building' | 'maintaining' | 'none';
  };
}
```

### ComparisonStats
```typescript
interface ComparisonStats {
  overallAverage: ComparisonMetric;
  thirtyDayAverage: ComparisonMetric;
  dayOfWeekAverage: ComparisonMetric & { dayName: string };
}

interface ComparisonMetric {
  value: number;
  difference: number;
  percentage: number;
  trend: 'up' | 'down' | 'equal';
}
```

### TimelineContext
```typescript
interface TimelineContext {
  previousEntry: TimelineEntry | null;
  nextEntry: TimelineEntry | null;
}

interface TimelineEntry {
  id: string;
  date: Date;
  fastDuration: number;
  daysSince?: number;     // For previous entry
  daysUntil?: number;     // For next entry
}
```

### UserSettings
```typescript
interface UserSettings {
  theme: 'light' | 'dark';
  timezone: string;
  units: 'imperial' | 'metric';
  defaultFastDuration: number;
}
```

---

## Testing Contracts

### Unit Test Expectations

**InsightCalloutBox**:
```javascript
describe('InsightCalloutBox', () => {
  it('renders celebration type with correct styling', () => {
    render(<InsightCalloutBox type="celebration" icon="🎉" message="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
  
  it('applies correct border color for type', () => {
    const { container } = render(
      <InsightCalloutBox type="info" icon="📊" message="Test" />
    );
    expect(container.firstChild).toHaveClass('border-purple-500');
  });
});
```

**ComparisonCard**:
```javascript
describe('ComparisonCard', () => {
  it('displays trend up indicator', () => {
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
});
```

**DeleteButton**:
```javascript
describe('DeleteButton', () => {
  it('shows confirmation modal on click', () => {
    render(<DeleteButton entryId="123" />);
    fireEvent.click(screen.getByText(/Delete Entry/i));
    expect(screen.getByText(/Delete Entry?/i)).toBeInTheDocument();
  });
  
  it('calls delete API on confirm', async () => {
    const mockFetch = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = mockFetch;
    
    render(<DeleteButton entryId="123" />);
    fireEvent.click(screen.getByText(/Delete Entry/i));
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/entries/123', { method: 'DELETE' });
    });
  });
});
```

---

## Summary

**Page Contracts**: page.js with ISR configuration  
**Organism Contracts**: EntryDetailsView (main orchestrator)  
**Molecule Contracts**: InsightCalloutBox, ComparisonCard, TimelineNav, DeleteConfirmationModal  
**Section Contracts**: InsightsSection, ComparisonStatsSection, TimelineNavigationSection  
**Client Component Contracts**: EditButton, DeleteButton  
**Service Contracts**: entryInsightsService (enhanced)  

**All contracts follow**:
- TypeScript-style JSDoc annotations
- Explicit prop validation
- Error handling patterns
- Test expectations
- Accessibility requirements

**Ready for Phase 2**: All component APIs defined, implementation can proceed with TDD.
