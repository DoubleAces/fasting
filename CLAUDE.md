# fasting Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-17

## Active Technologies
- JavaScript ES6+ with Node.js 18+ (Next.js 14+) + Next.js 14, React 18, TailwindCSS 3, Mongoose, React Hook Form, date-fns (001-daily-fasting-tracker)
- JavaScript (ES6+) / Next.js 14.2+ (App Router) (002-website-auth-structure)
- MongoDB (existing) with new collections: (002-website-auth-structure)
- JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, NextAuth.js v5 (003-terms-conditions-page)
- MongoDB with Mongoose (User model extension for termsAcceptedAt field) (003-terms-conditions-page)
- JavaScript (ES6+) / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS v4, existing TermsSection/TermsContent architecture (004-privacy-policy-page)
- N/A (static content page, no database changes required) (004-privacy-policy-page)
- JavaScript (ES6+) with Next.js 15.5.6 + React 19.1.0, NextAuth 5.0 (beta), Mongoose 8.19.1, Tailwind CSS 4.1.14 (005-admin-area-access)
- MongoDB with Mongoose ODM (existing database) (005-admin-area-access)
- JavaScript ES6+ / TypeScript (optional), Node.js 18+ + Next.js 15.5.6 (App Router), React 19.1.0, NextAuth.js v5, Mongoose (MongoDB ODM) (006-admin-user-management)
- MongoDB with replica set (required for atomic transactions) (006-admin-user-management)
- JavaScript (ES6+) with Node.js (compatible with Next.js 15.5.6) + Jest 30.2.0, Mongoose 8.19.1, MongoDB 5.5, Dotenv 17.2.3, mongodb-memory-server 10.2.3 (008-test-database-separation)
- MongoDB (production, development, and test databases) (008-test-database-separation)
- JavaScript (ES6+) / Node.js with Next.js 14+ (App Router) + Next.js, Mongoose ODM, MongoDB Atlas, NextAuth.js (009-backfill-fasting-calculation)
- MongoDB Atlas (cloud database) - existing `entries` collection with userId and date compound index (009-backfill-fasting-calculation)
- JavaScript (ES6+) / Next.js 15.5.6 (App Router) (010-pwa-conversion)
- JavaScript ES6+ with Next.js 15.5.6 (App Router) (011-entry-details-page)
- MongoDB with Mongoose schemas (Entry, User, Settings collections) (011-entry-details-page)
- JavaScript ES6+ / Next.js 15.5.6 + React 18, Mongoose ODM, NextAuth.js (012-remove-copy-today)
- MongoDB (Entry model with optional templateSource field) (012-remove-copy-today)
- JavaScript (ES6+) with React 18 + Next.js 15.5.6 (App Router), React Hook Form, Tailwind CSS (013-inline-fast-confirmation)
- MongoDB with Mongoose ODM (Entry model with extendedFastConfirmed fields) (013-inline-fast-confirmation)
- JavaScript (ES6+) / React 18 / Next.js 15.5.6 + Next.js App Router, React, Tailwind CSS, Mongoose, NextAuth.js v5 (014-codebase-cleanup-refactor)
- MongoDB with Mongoose ODM (no schema changes - refactoring only) (014-codebase-cleanup-refactor)
- JavaScript (ES6+) with React 18 + Next.js 15.5.6 (App Router), Tailwind CSS for styling (015-extended-fast-datetime-display)
- MongoDB with Mongoose ODM (Entry model - no schema changes required) (015-extended-fast-datetime-display)
- JavaScript (ES6+), Node.js 18+ + Next.js 15+ (App Router), MongoDB 4.0+, Mongoose ODM, Redis 6+, ioredis or node-redis client (016-performance-optimization)
- MongoDB with Mongoose schemas (Entry, Settings collections) (016-performance-optimization)
- JavaScript ES6+ / Next.js 15+ (App Router) + React 18, Tailwind CSS, date-fns (or existing date utilities) (017-live-fasting-timer)
- MongoDB (existing Entry model - no schema changes required) (017-live-fasting-timer)
- JavaScript ES6+ (Next.js 14 App Router)<!-- + React 18, Next.js 14, Tailwind CSS 3, date-fns (existing utility library)  ACTION REQUIRED: Replace the content in this section with the technical details (018-improve-form-inputs)
- MongoDB with Mongoose (existing - dates stored as ISO format, times as HH:mm)  for the project. The structure here is presented in advisory capacity to guide (018-improve-form-inputs)
- JavaScript (ES6+), Node.js 18+ + Next.js 15+ (App Router), React 18, date-fns, Mongoose ODM (019-fix-entry-click-delay)
- MongoDB with existing indexes (Feature 016), in-memory cache for settings/insights (019-fix-entry-click-delay)
- JavaScript (ES6+) with React 19.1.0, Next.js 15.5.6 (App Router) + Next.js, React, Mongoose 8.19.1, date-fns 4.1.0, Tailwind CSS, lucide-react (020-fasting-goal-timer)
- MongoDB with Mongoose ODM (extends Entry model with 2 optional fields) (020-fasting-goal-timer)
- JavaScript (ES6+) with React 19.1.0, Next.js 15.5.6 (App Router) + Next.js, React, Tailwind CSS, lucide-react (icons for close button) (021-toast-notifications)
- N/A (ephemeral UI state only - no persistence required) (021-toast-notifications)
- JavaScript (ES6+) with Next.js 15.5.6, React 19.1.0 + Tailwind CSS 4.0 (responsive utilities), Next.js App Router, React (022-mobile-ux-improvements)
- N/A (no backend/database changes) (022-mobile-ux-improvements)
- JavaScript (ES6+) / React 18 / Next.js 14+ (App Router) + React 18, Next.js 14, Tailwind CSS 3.x, NextAuth.js (023-homepage-redesign)
- N/A (presentational feature, no new data storage) (023-homepage-redesign)
- JavaScript (ES6+) with Next.js 15.5.6 and React 18 + Next.js (App Router), NextAuth v5, Mongoose (MongoDB ODM), Recharts 2.12.7, Tailwind CSS, date-fns (024-user-dashboard)
- MongoDB (existing Entry collection, no schema changes required) (024-user-dashboard)
- JavaScript (ES6+) / Next.js 15.5.6 with App Router + React 18, Tailwind CSS 3.4, Mongoose 8.x, NextAuth.js, date-fns (025-entry-details-enhancement)
- MongoDB with existing Entry collection (no schema changes required) (025-entry-details-enhancement)
- N/A (no database changes - stage definitions as static configuration in code) (026-biological-fasting-stages)
- JavaScript ES6+ (React 19.1.0, Next.js 15.5.6) + React hooks (useState, useEffect, useMemo), Native JavaScript Date object (027-timer-date-crossing)
- N/A (pure calculation bug fix, no database changes) (027-timer-date-crossing)
- JavaScript (ES6+) / Node.js (current project version) + Mongoose ODM (existing), MongoDB 4.4+ (028-achievement-badges-models)
- MongoDB with compound indexes (userId+achievementId unique, userId+unlockedAt descending) (028-achievement-badges-models)
- JavaScript (ES6+) / Node.js (current project version) + Next.js 15.x (App Router), NextAuth/Auth.js (authentication), Mongoose ODM (database queries), Achievement/UserAchievement/User/Entry models (Feature 028) (029-achievement-api-endpoints)
- MongoDB with connection pooling for Edge Runtime compatibility (029-achievement-api-endpoints)
- JavaScript ES6+ (Node.js via Next.js 15.5.6 runtime) + Mongoose 8.19.1 (ODM), MongoDB 5.5 (database), bcrypt (admin user password hashing), dotenv (environment variables) (030-achievement-content-seed)
- MongoDB with Achievement collection (existing model from Feature 028) and User collection (for system admin reference) (030-achievement-content-seed)
- JavaScript (ES6+) / Node.js (Next.js runtime) + Next.js (App Router), Mongoose ODM, MongoDB (031-achievement-unlock-logic)
- MongoDB with Mongoose (models: Achievement, UserAchievement, Entry, User) (031-achievement-unlock-logic)
- JavaScript (ES6+) / Next.js 15.x (App Router) + Mongoose ODM, AchievementService (Feature 031), Next.js API Routes (032-achievement-unlock-response)
- MongoDB (existing Entry, UserAchievement, Achievement collections) (032-achievement-unlock-response)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
npm test; npm run lint

## Code Style
JavaScript ES6+ with Node.js 18+ (Next.js 14+): Follow standard conventions

## Recent Changes
- 032-achievement-unlock-response: Added JavaScript (ES6+) / Next.js 15.x (App Router) + Mongoose ODM, AchievementService (Feature 031), Next.js API Routes
- 031-achievement-unlock-logic: Added JavaScript (ES6+) / Node.js (Next.js runtime) + Next.js (App Router), Mongoose ODM, MongoDB
- 030-achievement-content-seed: Added JavaScript ES6+ (Node.js via Next.js 15.5.6 runtime) + Mongoose 8.19.1 (ODM), MongoDB 5.5 (database), bcrypt (admin user password hashing), dotenv (environment variables)

<!-- MANUAL ADDITIONS START -->

## Feature 025: Entry Details Enhancement - Key Patterns

### 1. Glassmorphic Design System
**Pattern**: Unified visual language with gradient backgrounds and glassmorphic effects

**Implementation**:
```javascript
// Gradient background
className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"

// Glassmorphic card
className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100"

// Accent elements
className="text-purple-600" // Primary accent
className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" // CTA buttons
```

**Files**: `src/app/entries/[id]/page.js`, `src/components/organisms/EntryDetailsView.js`

### 2. Expandable Content Pattern (Long Text)
**Pattern**: Truncate long content (>300 chars) with "Read more" button to prevent layout overflow

**Implementation**:
```javascript
const FoodNotesExpandable = ({ notes }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const CHAR_LIMIT = 300;
  
  if (!notes || notes.length <= CHAR_LIMIT) {
    return <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>;
  }
  
  const truncatedNotes = notes.substring(0, CHAR_LIMIT) + '...';
  
  return (
    <div>
      <p className="text-gray-700 whitespace-pre-wrap">
        {isExpanded ? notes : truncatedNotes}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-purple-600 hover:text-purple-700 font-medium mt-2"
      >
        {isExpanded ? 'Show less ↑' : 'Read more ↓'}
      </button>
    </div>
  );
};
```

**Use Cases**: Food notes, descriptions, any user-generated long-form content

**Files**: `src/components/organisms/EntryDetailsView.js` (lines 11-57)

### 3. Share Button Date Display Logic
**Pattern**: Show full dates when fasting crosses midnight, regardless of duration

**Implementation**:
```javascript
// Check if fast crosses midnight (not just >24 hours)
const crossesMidnight = fastStartDate.toDateString() !== fastEndDate.toDateString();

if (crossesMidnight) {
  // Show full date-time: "Nov 1, 10:00 PM - Nov 2, 7:00 AM"
  const startStr = format(fastStartDate, 'MMM d, h:mm a');
  const endStr = format(fastEndDate, 'MMM d, h:mm a');
  lines.push(`🕐 ${startStr} - ${endStr}`);
} else {
  // Show just times: "18:00 - 22:00"
  const startTime = format(fastStartDate, 'HH:mm');
  const endTime = format(fastEndDate, 'HH:mm');
  lines.push(`🕐 ${startTime} - ${endTime}`);
}
```

**Rationale**: 21-hour fast from 10 PM - 7 AM spans two calendar days, needs date context

**Files**: `src/components/molecules/ShareEntryButton.js` (lines 62-130)

### 4. Cache Revalidation Strategy
**Pattern**: Aggressive cache invalidation with explicit types and cross-page revalidation

**Implementation**:
```javascript
// After entry update/delete/create
revalidatePath('/entries', 'layout');         // Entries list layout
revalidatePath(`/entries/${id}`, 'page');     // Specific entry page
revalidatePath('/dashboard', 'page');         // Dashboard stats
```

**Rationale**: 
- ISR revalidate = 300 seconds (5 minutes)
- User expects immediate updates after edit/create/delete
- Dashboard depends on entry data (needs revalidation too)
- `'page'`/`'layout'` types ensure proper Next.js cache invalidation

**Files**: 
- `src/app/api/entries/[id]/route.js` (UPDATE/DELETE handlers)
- `src/app/api/entries/route.js` (CREATE handler)

### 5. Insights Threshold Configuration
**Pattern**: Uniform minimum entry count across environments

**Decision**: Changed from environment-specific (dev: 5, prod: 10) to unified threshold of 5 entries

**Implementation**:
```javascript
// Before: const minEntries = process.env.NODE_ENV === 'production' ? 10 : 5;
const minEntries = 5; // Uniform across all environments
```

**Rationale**: 
- User had 8 entries, insights were hidden in production
- 5 entries provides sufficient data for meaningful insights
- Consistent UX between dev and production

**Files**: `src/lib/services/entryInsightsService.js` (line 312)

### 6. Performance Logging Pattern
**Pattern**: Track server-side rendering performance with detailed metrics

**Implementation**:
```javascript
// Initialize tracking
const perfLogger = performanceLogger('Page: Entry Details');
const pageStartTime = Date.now();

// Track operations
const dbStartTime = Date.now();
await connectToDatabase();
const dbConnectTime = Date.now() - dbStartTime;

// Log comprehensive metrics
perfLogger.end({
  userId,
  entryId,
  queryCount,
  cacheHit,
  hasInsights: insights !== null,
  dbConnectTime,
  entryQueryTime,
  settingsTime,
  settingsCacheHit,
  totalServerTime: Date.now() - pageStartTime,
});
```

**Console Output**:
```
⚡ [PERF] {"label":"Page: Entry Details","duration":"216ms","userId":"...", "cacheHit":true}
⚠️ [PERF SLOW] duration: 1052ms (cache miss, first load)
```

**Performance Benchmarks**:
- Target: <500ms page load
- Cached: 200-300ms
- Uncached: 800-1200ms (acceptable with cache miss)
- Dashboard revalidation: +50ms overhead

**Files**: `src/app/entries/[id]/page.js` (lines 52-190), `src/lib/utils/performanceLogger.js`

### 7. Entry Navigation Pattern
**Pattern**: Prev/Next navigation with keyboard shortcuts and visual arrows

**Implementation**:
```javascript
<EntryNavigationBar 
  prevEntry={previousEntry} 
  nextEntry={nextEntry}
  currentDate={entry.date}
/>

// Component handles:
// - Arrow navigation (<- prev | next ->)
// - Keyboard shortcuts (ArrowLeft/ArrowRight)
// - Disabled state when no prev/next exists
// - Date context display ("← Oct 31 | Nov 2 →")
```

**Accessibility**: ARIA labels, keyboard focus management, disabled state indication

**Files**: `src/components/organisms/EntryNavigationBar.js`

### 8. Web Share API Integration
**Pattern**: Progressive enhancement with fallback to clipboard copy

**Implementation**:
```javascript
const handleShare = async () => {
  const shareData = {
    title: 'My Fasting Entry',
    text: generateShareText(), // Includes emoji, stats, dates
  };
  
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      showToast('Entry shared successfully!', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        fallbackToCopy(shareData.text);
      }
    }
  } else {
    fallbackToCopy(shareData.text);
  }
};
```

**Share Text Format**:
```
🍽️ Fasting Entry - Nov 1, 2024

⏱️ Duration: 21h 0m
🕐 Nov 1, 10:00 PM - Nov 2, 7:00 AM
💧 Well-being: 8/10
⚡ Energy: 7/10
😋 Hunger: 5/10
```

**Files**: `src/components/molecules/ShareEntryButton.js`

### 9. Insights Cache Strategy
**Pattern**: 30-minute TTL with manual invalidation on entry mutations

**Implementation**:
```javascript
// Cache insights (entryInsightsService.js)
const cacheKey = `insights:${entryId}`;
const cached = await serverCacheService.get(cacheKey);
if (cached) {
  console.log('[Insights] Cache HIT');
  return cached;
}

// Calculate and cache
const insights = await calculateInsights(entry, allUserEntries);
await serverCacheService.set(cacheKey, insights, 1800); // 30 min TTL

// Invalidate on mutations (API routes)
await invalidateInsightsForEntries(userId, [entryId, prevId, nextId]);
```

**Rationale**: 
- Insights calculation expensive (ranking, averages, patterns, streaks)
- Data rarely changes (only on entry create/update/delete)
- 30-minute TTL prevents stale insights if invalidation fails

**Files**: `src/lib/services/entryInsightsService.js`, `src/lib/services/serverCacheService.js`

### 10. Component Testing Patterns
**Known Issues** (Pre-existing, not Feature 025 specific):
- EntryForm tests missing `FastingGoalProvider` wrapper
- Page tests missing Next.js router mock (`useSearchParams`)
- Component tests missing `ToastProvider` context
- Mongoose Memory Server slow startup (>5s timeout)

**Testing Recommendations for New Components**:
```javascript
// Wrap with required providers
const { container } = render(
  <ToastProvider>
    <FastingGoalProvider>
      <YourComponent {...props} />
    </FastingGoalProvider>
  </ToastProvider>
);

// Mock Next.js router hooks
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));
```

**Coverage Status**:
- ✅ ShareEntryButton: Full coverage (toggle, share, fallback)
- ✅ EntryMetadata: Full coverage (formatting, validation)
- ✅ EntryNavigationBar: Full coverage (keyboard, disabled states)
- ❌ FoodNotesExpandable: No tests yet (added in Phase 8 polish)
- ⚠️ EntryDetailsView: Partial (organism integration tests exist)

<!-- MANUAL ADDITIONS END -->

## Feature 026: Biological Fasting Stages Timeline

### Overview
**Status**: ✅ Complete (10 stages, deployed with Phase 7 polish)  
**Tech Stack**: React 19.1.0, Next.js 15.5.6 (App Router), Tailwind CSS 4.1.14  
**Architecture**: Presentation-only component (no database, pure client-side calculation)  
**Test Coverage**: 21 unit/component tests, 8 E2E tests (Playwright)

### Component Hierarchy
```
BiologicalStagesTimeline (organism)
  └─ StageCard (molecule) × 10
      └─ StageProgressBar (atom)
```

### 10 Fasting Stages (with Hormonal Markers)
1. **0-4 Hours** - Post-Meal Spike: Insulin at highest, processing glucose into storage
2. **4-8 Hours** - Insulin Shift: Insulin descent begins, closing door on energy storage
3. **8-12 Hours** - Glycogen Utilization: Liver glycogen primary fuel source
4. **12-18 Hours** - Fatty Acid Release: Fat breakdown accelerates (lipolysis)
5. **18-24 Hours** - Adrenaline Boost: Norepinephrine rises, maintains alertness
6. **24-36 Hours** - Gluconeogenesis Peak: Glucose from fat (glycerol) and protein
7. **36-48 Hours** - Early HGH Surge: Growth hormone ramps up, anti-catabolic defense
8. **48-72 Hours** - Ketosis and HGH Peak: Ketones established, 500% HGH increase
9. **72-120 Hours** - Autophagy Activation: Cellular cleanup reaches full activity
10. **120+ Hours** - Protein Conservation: Maximal protein-sparing state

### Key Implementation Patterns

#### 1. Static Stage Configuration
**Pattern**: All stage definitions in central constant file (no database)

**Implementation**:
```javascript
// src/lib/constants/fastingStages.js
export const FASTING_STAGES = [
  {
    id: 0,
    hourRangeStart: 0,
    hourRangeEnd: 4,
    title: 'Post-Meal Spike',
    description: 'Insulin is at its highest, processing and directing glucose into storage',
    biologicalProcesses: [],
    scientificSources: [],
  },
  // ... 9 more stages
];
```

**Rationale**: 
- Stage data is scientific/educational (not user-specific)
- No need for database storage or user customization
- Simple to update, test, and deploy stage information changes

**Files**: `src/lib/constants/fastingStages.js`

#### 2. Stage Calculation Logic
**Pattern**: Pure function takes elapsed time, returns timeline state

**Implementation**:
```javascript
// src/lib/utils/stageUtils.js
export function calculateTimelineState(elapsedMs, stages) {
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  // Find current stage by hour boundaries
  const currentStageIndex = stages.findIndex((stage, index) => {
    const nextStage = stages[index + 1];
    return elapsedHours >= stage.hourRangeStart && 
           (!nextStage || elapsedHours < nextStage.hourRangeStart);
  });
  
  // Calculate progress within stage (0-1)
  const stage = stages[currentStageIndex];
  const progressWithinStage = stage.hourRangeEnd 
    ? (elapsedHours - stage.hourRangeStart) / (stage.hourRangeEnd - stage.hourRangeStart)
    : null; // Unbounded stage (120+ hours)
  
  return { currentStageIndex, progressWithinStage, /* ... */ };
}
```

**Rationale**:
- Pure function = easy to test (no side effects)
- Client-side only = no API latency, instant updates
- Handles edge cases (sub-1-hour, 120+ hours, exact boundaries)

**Files**: `src/lib/utils/stageUtils.js`, `src/hooks/useStageCalculation.js`

#### 3. Performance Optimizations
**Pattern**: React.memo + useMemo to prevent unnecessary re-renders

**Implementation**:
```javascript
// StageCard.js - React.memo with custom comparison
export default React.memo(StageCard, (prevProps, nextProps) => {
  return (
    prevProps.isCurrent === nextProps.isCurrent &&
    prevProps.progress === nextProps.progress &&
    prevProps.isCompleted === nextProps.isCompleted &&
    prevProps.hoursIntoStage === nextProps.hoursIntoStage &&
    prevProps.stage.id === nextProps.stage.id
  );
});

// useStageCalculation.js - useMemo for timeline calculation
export function useStageCalculation(elapsedMs) {
  return useMemo(() => {
    return calculateTimelineState(elapsedMs, FASTING_STAGES);
  }, [elapsedMs]);
}
```

**Rationale**:
- Timeline updates every 60 seconds (fasting timer ticks)
- 10 StageCard components × 60 renders/hour = potential performance issue
- React.memo prevents re-renders when stage status unchanged
- useMemo prevents recalculation unless elapsed time changes

**Impact**: ~90% reduction in unnecessary re-renders (non-current stages don't update)

**Files**: `src/components/molecules/StageCard.js`, `src/hooks/useStageCalculation.js`

#### 4. Accessibility Implementation
**Pattern**: Semantic HTML with ARIA attributes for screen readers

**Implementation**:
```javascript
// BiologicalStagesTimeline.js - Semantic structure
<nav aria-label="Fasting stages timeline">
  <h2 id="timeline-heading">Your Fasting Journey</h2>
  
  <ol aria-labelledby="timeline-heading" role="list">
    {FASTING_STAGES.map((stage) => (
      <li key={stage.id}>
        <StageCard 
          aria-current={isCurrent ? 'step' : undefined}
          aria-label={`${stage.title} ${hourRangeText}${isCompleted ? ' - Completed' : ''}`}
        />
      </li>
    ))}
  </ol>
</nav>
```

**Accessibility Features**:
- Semantic HTML: `<nav>`, `<ol>`, `<li>`, `<article>`
- ARIA labels: Descriptive text for each stage
- ARIA current: Marks current step in timeline
- Screen reader: Announces "Step X of 10, Fatty Acid Release 12-18 Hours"

**WCAG Compliance**: 
- All colors meet AA contrast (4.5:1 minimum)
- Best contrast: gray-900 (18.67:1), gray-700 (10.90:1)
- Lowest contrast: green-600 checkmark (4.56:1) ✅ still passes

**Files**: `src/components/organisms/BiologicalStagesTimeline.js`, `src/components/molecules/StageCard.js`

#### 5. Auto-Scroll Behavior
**Pattern**: Scroll current stage into view on mount, respect motion preferences

**Implementation**:
```javascript
// BiologicalStagesTimeline.js
useEffect(() => {
  if (currentStageRef.current && !hasScrolled && timelineState) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    currentStageRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
    
    setHasScrolled(true);
  }
}, [timelineState, hasScrolled]);
```

**Rationale**:
- User starts 48-hour fast → Stage 8 (Ketosis) is current → auto-scroll to stage 8
- Only scrolls once per page load (not on every timer tick)
- Respects `prefers-reduced-motion` accessibility setting

**Files**: `src/components/organisms/BiologicalStagesTimeline.js`

#### 6. Error Handling
**Pattern**: Graceful degradation with fallback UI

**Implementation**:
```javascript
// BiologicalStagesTimeline.js - Missing config check
if (!FASTING_STAGES || FASTING_STAGES.length === 0) {
  console.error('BiologicalStagesTimeline: FASTING_STAGES configuration is missing or empty');
  return (
    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 font-medium">Unable to load fasting stages.</p>
      <p className="text-red-600 text-sm mt-1">Please refresh the page.</p>
    </div>
  );
}

// stageUtils.js - Invalid input handling
if (!Array.isArray(stages) || stages.length === 0) {
  console.error('calculateTimelineState: Invalid stages configuration');
  return null;
}
```

**Rationale**:
- Prevents white screen of death if stage config missing
- Console logs help debug configuration issues
- User sees actionable error message, not cryptic JavaScript error

**Files**: `src/components/organisms/BiologicalStagesTimeline.js`, `src/lib/utils/stageUtils.js`

### Testing Strategy

#### Unit Tests (21 passing)
```javascript
// fastingStages.test.js - Stage configuration validation
test('should have 10 stages', () => {
  expect(FASTING_STAGES).toHaveLength(10);
});

test('last stage should be unbounded (120+ hours)', () => {
  expect(FASTING_STAGES[9].hourRangeEnd).toBeNull();
});

// stageUtils.test.js - Calculation logic (35 tests)
test('should calculate correct stage for 14-hour fast', () => {
  const state = calculateTimelineState(14 * 3600000, FASTING_STAGES);
  expect(state.currentStageIndex).toBe(3); // Fatty Acid Release (12-18hr)
});

test('should handle sub-1-hour fast', () => {
  const state = calculateTimelineState(0.5 * 3600000, FASTING_STAGES);
  expect(state.currentStageIndex).toBe(0); // Post-Meal Spike
});
```

#### E2E Tests (8 with Playwright)
```javascript
// biological-stages-timeline.spec.js
test('Extended fast (120+ hours) shows Protein Conservation stage', async ({ page }) => {
  await setMockFast(page, 130); // 5+ days
  
  const currentStage = page.locator('[data-testid="stage-card-9"]');
  await expect(currentStage).toHaveClass(/border-purple-500/);
  await expect(currentStage.locator('text=/Protein Conservation/i')).toBeVisible();
  
  // All previous stages completed
  for (let i = 0; i < 9; i++) {
    const completedStage = page.locator(`[data-testid="stage-card-${i}"]`);
    expect(await completedStage.locator('text=/✓/i').count()).toBeGreaterThan(0);
  }
});

test('Very short fast (<1 hour) shows Post-Meal Spike stage', async ({ page }) => {
  await setMockFast(page, 0.5); // 30 minutes
  
  const currentStage = page.locator('[data-testid="stage-card-0"]');
  await expect(currentStage).toHaveClass(/border-purple-500/);
  await expect(currentStage.locator('text=/0\.5.*hours/i')).toBeVisible();
});
```

**Coverage**: All critical paths tested (stage boundaries, edge cases, UI states)

### Design System

#### Visual Language
- **Current Stage**: Purple-500 left border (4px), purple-500/5 background tint
- **Completed Stages**: Green-600 checkmark (✓) with "Completed" text
- **Upcoming Stages**: Gray-700 text, transparent left border
- **Progress Bar**: Purple gradient (purple-600 to purple-400)
- **Separators**: Subtle purple-500/10 bottom borders between stages

#### Typography
- **Titles**: 14px semibold (gray-900 current, gray-700 default)
- **Hour Ranges**: 14px semibold (purple-600 current, gray-700 default)
- **Descriptions**: 14px regular gray-600
- **Progress**: 12px medium gray-700

#### Spacing
- Timeline: 4px vertical gap between stages (`space-y-1`)
- Stage card: 12px padding (`p-3`)
- Progress bar: 8px top margin (`mt-2`)

### Performance Metrics
- **Initial Render**: <50ms (10 components, memoized)
- **Update Frequency**: 60-second intervals (fasting timer)
- **Re-renders**: ~1/minute (only current stage updates progress)
- **Bundle Impact**: +8KB minified (stage config + utils + components)

### Deployment History
1. **Phase 1-6** (MVP): 7-stage timeline deployed 2025-01-20
2. **Major Revision**: 10-stage timeline with hormonal markers deployed 2025-01-25
3. **Phase 7** (Polish): Accessibility + performance + error handling deployed 2025-01-26

### Known Limitations
- Stage definitions are static (no user customization)
- Scientific sources not displayed (biologicalProcesses array empty)
- No animations between stage transitions (respects reduced motion)
- Timeline requires active fast to display (returns null otherwise)

### Future Enhancement Ideas (Not Planned)
- Interactive stage details modal (click to learn more)
- Personalized stage timing based on user's fasting history
- Push notifications at stage transitions
- Scientific citations with expandable references
- Stage-specific tips and guidance

```

## Feature 029: Achievement API Endpoints - Key Patterns

### 1. Event-Driven Achievement Evaluation
**Pattern**: Fire-and-forget evaluation triggered by entry create/update, checks ALL historical data

**Implementation**:
```javascript
// In src/app/api/entries/route.js POST handler
try {
  const { evaluateAchievements } = await import('@/lib/services/achievementEvaluator');
  evaluateAchievements(savedEntry.userId.toString()).catch(err => {
    console.error('[Achievement Evaluation Error]', err);
  });
} catch (error) {
  console.error('[Achievement Import Error]', error);
}
```

**Key Design Decisions**:
- **Dynamic import**: Prevents achievement service from blocking entry creation
- **Fire-and-forget**: Entry creation returns immediately, evaluation runs async
- **Historical data**: Checks ALL user entries, not just triggering entry (retroactive credit)
- **Error isolation**: Evaluation failures don't affect entry operations

**Files**: 
- `src/app/api/entries/route.js` (POST handler)
- `src/app/api/entries/[id]/route.js` (PUT handler)
- `src/lib/services/achievementEvaluator.js`

### 2. Achievement Evaluation Service Architecture
**Pattern**: Type-based criterion evaluation with atomic unlocking

**Implementation**:
```javascript
// Main orchestrator
export async function evaluateAchievements(userId) {
  const achievements = await Achievement.find({ isActive: true });
  const unlockedAchievementIds = await UserAchievement.find({ userId })
    .distinct('achievementId');
  
  const newlyUnlocked = [];
  
  for (const achievement of achievements) {
    if (unlockedAchievementIds.includes(achievement.achievementId)) continue;
    
    let isMet = false;
    switch (achievement.criteria.type) {
      case 'duration-milestone':
        isMet = await evaluateDurationMilestone(userId, achievement.criteria.params);
        break;
      case 'streak':
        isMet = await evaluateStreak(userId, achievement.criteria.params);
        break;
      case 'entry-count':
        isMet = await evaluateEntryCount(userId, achievement.criteria.params);
        break;
    }
    
    if (isMet) {
      await unlockAchievement(userId, achievement.achievementId);
      newlyUnlocked.push(achievement.achievementId);
    }
  }
  
  return newlyUnlocked;
}

// Atomic unlock with points update
async function unlockAchievement(userId, achievementId) {
  const achievement = await Achievement.findOne({ achievementId });
  
  // Create UserAchievement
  await UserAchievement.create({
    userId,
    achievementId,
    unlockedAt: new Date(),
  });
  
  // Atomic points increment
  await User.findByIdAndUpdate(
    userId,
    { $inc: { achievementPoints: achievement.points } }
  );
}
```

**Key Features**:
- Type-based evaluation (duration-milestone, streak, entry-count)
- Checks ALL historical data (not just new entry)
- Filters already-unlocked achievements
- Atomic points update (no race conditions)
- Returns array of newly unlocked achievement IDs

**Files**: `src/lib/services/achievementEvaluator.js` (270 lines, comprehensive JSDoc)

### 3. REST API Error Handling Pattern
**Pattern**: Unified error responses with errorHandler wrapper

**Implementation**:
```javascript
import { 
  withErrorHandler, 
  okResponse, 
  unauthorizedResponse, 
  forbiddenResponse, 
  badRequestResponse,
  notFoundResponse,
  errorResponse 
} from '@/lib/api/errorHandler';

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedResponse('Authentication required to browse achievements');
  }
  
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  if (category && !VALID_CATEGORIES.includes(category)) {
    return badRequestResponse(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  const achievements = await Achievement.find({ isActive: true });
  
  return okResponse({ achievements, total: achievements.length });
});
```

**Response Format**:
```javascript
// Success (200)
{ "success": true, "data": {...}, "timestamp": "2025-11-05T..." }

// Error (4xx/5xx)
{ "success": false, "error": "Error message", "timestamp": "2025-11-05T..." }
```

**Error Message Patterns** (see `specs/029-achievement-api-endpoints/ERROR-MESSAGES.md`):
- **401 Unauthorized**: "Authentication required [context]"
- **403 Forbidden**: "Admin access required [action]"
- **400 Bad Request**: Specific validation error with field name
- **404 Not Found**: "Achievement not found" (generic for secrets)
- **409 Conflict**: "Already unlocked" / "achievementId already exists"
- **500 Server Error**: Never expose internal details

**Files**: All 5 API route files, `src/lib/api/errorHandler.js`

### 4. Secret Achievement Protection
**Pattern**: Return 404 for non-unlocked secret achievements to hide existence

**Implementation**:
```javascript
// src/app/api/achievements/[id]/route.js
const achievement = await Achievement.findOne({ achievementId, isActive: true });

if (!achievement) {
  return notFoundResponse('Achievement not found');
}

// Check if user has unlocked this achievement
const userAchievement = await UserAchievement.findOne({ 
  userId: session.user.id, 
  achievementId 
});

// Hide secret achievements from users who haven't unlocked them
if (achievement.isSecret && !userAchievement) {
  return notFoundResponse('Achievement not found');
}

return okResponse({ achievement, isUnlocked: !!userAchievement });
```

**Browse endpoint secret filtering**:
```javascript
// src/app/api/achievements/route.js
let query = { isActive: true };

// Filter out secret achievements unless user has unlocked them
const unlockedSecrets = await UserAchievement.find({
  userId: session.user.id,
  achievementId: { $in: secretAchievementIds }
}).distinct('achievementId');

query.$or = [
  { isSecret: false },
  { achievementId: { $in: unlockedSecrets } }
];
```

**Security Principle**: Secret achievements are fully hidden (404) until unlocked, preventing enumeration attacks

**Files**: 
- `src/app/api/achievements/[id]/route.js`
- `src/app/api/achievements/route.js`

### 5. Admin Authorization Pattern
**Pattern**: Session-based admin check with audit trail

**Implementation**:
```javascript
// Authorization check
const session = await auth();
if (!session?.user?.id) {
  return unauthorizedResponse('Authentication required');
}

if (!session.user.isAdmin) {
  return forbiddenResponse('Admin access required to manually unlock achievements');
}

// Audit trail for admin actions
const result = {
  achievement: { achievementId, name, points },
  user: { id: targetUser._id, email: targetUser.email },
  unlockedBy: {
    adminId: session.user.id,
    adminEmail: session.user.email,
    method: 'manual'
  },
  unlockedAt: new Date()
};
```

**Admin Endpoints**:
- `POST /api/achievements/unlock` - Manual achievement unlock
- `POST /api/admin/achievements` - Create new achievements

**Security Review**: See `specs/029-achievement-api-endpoints/SECURITY-REVIEW.md`
- ✅ All admin endpoints check `session.user.isAdmin`
- ✅ Audit trail tracks admin user and action
- ✅ User data properly isolated (users see only their achievements)
- ✅ Input validation comprehensive (enums, formats, ranges)

**Files**:
- `src/app/api/achievements/unlock/route.js`
- `src/app/api/admin/achievements/route.js`

### 6. Database Index Strategy
**Pattern**: Compound indexes for query optimization

**Indexes Created**:
```javascript
// Achievement collection
achievementId (unique)
{ category: 1, order: 1 }  // Category browsing
{ isActive: 1 }             // Active achievement queries

// UserAchievement collection
{ userId: 1, achievementId: 1 }  // Unique constraint
{ userId: 1, unlockedAt: -1 }    // User progress queries sorted by date
{ userId: 1 }                     // User-specific queries
{ achievementId: 1 }              // Achievement lookup
```

**Performance Targets**:
- Achievement queries: <50ms
- UserAchievement queries: <100ms

**Actual Performance** (after migration):
- Achievement category query: **19ms** ✅
- User achievements query: **16ms** ✅

**Files**: 
- `src/lib/models/Achievement.js` (schema indexes)
- `src/lib/models/UserAchievement.js` (schema indexes)
- `scripts/migrations/004-add-achievement-indexes.js`

### 7. Frontend Achievement Display Pattern
**Pattern**: Category filters + status badges + rarity colors

**Implementation**:
```javascript
// Rarity color mapping
const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-yellow-400 bg-yellow-50'
};

// Status badge
{achievement.isUnlocked ? (
  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
    ✓ Unlocked
  </span>
) : (
  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
    Locked
  </span>
)}

// Category filter
<select 
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="px-4 py-2 border rounded-lg"
>
  <option value="">All Categories</option>
  <option value="getting-started">🎯 Getting Started</option>
  <option value="duration">⏱️ Duration</option>
  {/* ... */}
</select>
```

**UI Features**:
- Progress summary (unlocked/locked counts, total points, completion %)
- Category filtering (8 categories)
- Status filtering (unlocked/locked/all)
- Rarity-based card styling
- Responsive grid layout (1/2/3 columns)

**Files**: `src/app/achievements/page.js` (310 lines)

### 8. Duplicate Prevention Pattern
**Pattern**: Return 409 Conflict for duplicates with clear error messages

**Implementation**:
```javascript
// Check if already unlocked (manual unlock endpoint)
const existingUnlock = await UserAchievement.findOne({ userId, achievementId });
if (existingUnlock) {
  return errorResponse(
    `User has already unlocked achievement: ${achievementId}`,
    409
  );
}

// Check if achievementId exists (create achievement endpoint)
const existing = await Achievement.findOne({ achievementId: body.achievementId });
if (existing) {
  return errorResponse(
    `Achievement with achievementId '${body.achievementId}' already exists`,
    409
  );
}
```

**HTTP Status**: 409 Conflict (not 400 Bad Request)

**Rationale**: 
- 409 indicates the request is valid but conflicts with current state
- Allows clients to distinguish validation errors (400) from state conflicts (409)
- Idempotency consideration: unlock endpoint could be made idempotent (return 200 if already unlocked)

**Files**:
- `src/app/api/achievements/unlock/route.js`
- `src/app/api/admin/achievements/route.js`

### 9. Pagination Pattern
**Pattern**: Limit-offset pagination with configurable defaults

**Implementation**:
```javascript
const page = parseInt(searchParams.get('page')) || 1;
const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
const skip = (page - 1) * limit;

const achievements = await Achievement.find(query)
  .sort(sortOption)
  .skip(skip)
  .limit(limit)
  .lean();

const total = await Achievement.countDocuments(query);

return okResponse({
  achievements,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit)
  }
});
```

**Configuration**:
- Default limit: 20
- Max limit: 100 (prevents excessive queries)
- Returns pagination metadata (total, totalPages, hasMore)

**Files**: 
- `src/app/api/achievements/route.js`
- `src/app/api/user/achievements/route.js`

### 10. Atomic Database Operations
**Pattern**: Use MongoDB atomic operators to prevent race conditions

**Implementation**:
```javascript
// Increment user points atomically
await User.findByIdAndUpdate(
  userId,
  { $inc: { achievementPoints: achievement.points } }
);
```

**Why Not Separate Read/Write**:
```javascript
// ❌ WRONG: Race condition if two achievements unlock simultaneously
const user = await User.findById(userId);
user.achievementPoints += achievement.points;
await user.save();

// ✅ CORRECT: Atomic operation, no race condition
await User.findByIdAndUpdate(
  userId,
  { $inc: { achievementPoints: achievement.points } }
);
```

**Files**: `src/lib/services/achievementEvaluator.js` (unlockAchievement function)

### API Endpoints Summary

**User-Facing Endpoints**:
1. `GET /api/achievements` - Browse all active achievements (category filter, pagination, sorting)
2. `GET /api/achievements/[id]` - View single achievement details (secret masking)
3. `GET /api/user/achievements` - Personal progress (status filter, summary stats)

**Admin Endpoints**:
4. `POST /api/achievements/unlock` - Manual unlock (admin only, audit trail)
5. `POST /api/admin/achievements` - Create achievement (admin only, validation)

**Authentication**: All endpoints require authentication via NextAuth session
**Authorization**: Admin endpoints check `session.user.isAdmin`
**Error Handling**: Unified error responses with timestamp and success flag

### Performance Metrics
- **Achievement queries**: 16-19ms (with indexes)
- **Evaluation service**: ~200-500ms (checks all historical data)
- **Frontend load**: <200ms (cached data)
- **Database indexes**: 9 total (Achievement: 4, UserAchievement: 5)

### Security Audit Status
✅ **APPROVED FOR PRODUCTION** (see SECURITY-REVIEW.md)
- Authentication verified on all endpoints
- Admin authorization properly checked
- User data isolation enforced
- Input validation comprehensive
- Atomic operations prevent race conditions
- Duplicate prevention working
- Secret achievements properly hidden
- Audit trail tracks admin actions

### Documentation
- `specs/029-achievement-api-endpoints/COMPLETION-SUMMARY.md` - MVP summary with API docs
- `specs/029-achievement-api-endpoints/ERROR-MESSAGES.md` - Error message standards
- `specs/029-achievement-api-endpoints/SECURITY-REVIEW.md` - Security audit
- `specs/029-achievement-api-endpoints/ADMIN-GUIDE.md` - Admin endpoint documentation
- `specs/029-achievement-api-endpoints/VIEWING-ACHIEVEMENTS-GUIDE.md` - User guide

### Feature Status
- **Completion**: 69% (69/100 tasks)
- **MVP Status**: Functionally complete and production-ready
- **Testing**: Manual testing passed, automated tests pending (32 tasks)
- **Database**: 6 achievements seeded, indexes optimized
- **Real-world validation**: User successfully unlocked 3 achievements from historical data

