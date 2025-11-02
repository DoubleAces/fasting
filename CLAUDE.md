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
- 025-entry-details-enhancement: Added JavaScript (ES6+) / Next.js 15.5.6 with App Router + React 18, Tailwind CSS 3.4, Mongoose 8.x, NextAuth.js, date-fns
- 024-user-dashboard: Added JavaScript (ES6+) with Next.js 15.5.6 and React 18 + Next.js (App Router), NextAuth v5, Mongoose (MongoDB ODM), Recharts 2.12.7, Tailwind CSS, date-fns
- 023-homepage-redesign: Added JavaScript (ES6+) / React 18 / Next.js 14+ (App Router) + React 18, Next.js 14, Tailwind CSS 3.x, NextAuth.js

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
