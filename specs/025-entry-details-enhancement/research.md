# Research & Technical Decisions

**Feature**: 025 - Entry Details Page Enhancement  
**Date**: October 31, 2025  
**Status**: Complete

## Overview

This document captures technical research, design decisions, and rejected alternatives for enhancing the entry details page with glassmorphic styling and personalized insights.

---

## 1. Glassmorphic Design Implementation

### Decision: Use Tailwind CSS Utility Composition

**Rationale**:
- Consistent with existing Feature 024 (Dashboard) implementation
- No custom CSS required - pure Tailwind utilities
- Maintainable and theme-able through Tailwind configuration
- Performance: No additional CSS bundle size

**Pattern**:
```jsx
className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20"
```

**Breakdown**:
- `backdrop-blur-md`: CSS backdrop-filter blur for glassmorphic effect
- `bg-white/70`: 70% opacity white background
- `rounded-2xl`: 16px border radius for modern feel
- `shadow-xl`: Depth perception
- `border border-white/20`: Subtle border for definition

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Custom CSS classes | Breaks Tailwind-first approach, adds maintenance burden |
| CSS-in-JS (styled-components) | Not used elsewhere in codebase, adds dependency |
| Plain white backgrounds | Doesn't match new design system from Feature 024 |

**Accessibility Considerations**:
- Background opacity must maintain WCAG 2.1 AA contrast ratios (4.5:1 for text)
- Tested with purple-pink-indigo gradient backgrounds
- Text color adjusted to `text-gray-900` for sufficient contrast on translucent white
- Verified with Chrome DevTools contrast checker

---

## 2. Insight Calculation Architecture

### Decision: Reuse Existing entryInsightsService with Enhancements

**Rationale**:
- Feature 011 already implemented comprehensive insights service
- Uses optimized MongoDB aggregation pipeline ($facet for parallel calculations)
- Includes caching infrastructure (30-min TTL via serverCacheService)
- Proven performance (<500ms for users with <100 entries)

**Enhancement Strategy**:
- Add new insight types to existing aggregation facets
- Maintain single-query approach (no N+1 queries)
- Extend cache key strategy to include new insight variations
- Keep backward compatibility for existing consumers

**Service Architecture**:
```
entryInsightsService.js
├── calculateInsights(entry, userId)          # Main entry point
├── calculateInsightsOptimized(entry, userId) # Aggregation pipeline
├── getInsightsCacheKey(userId, entryId)      # Cache key generation
└── Facets:
    ├── longestThisMonth                      # Existing
    ├── rankData                              # Existing
    ├── thirtyDayAverage                      # Existing
    ├── weekendVsWeekdayPattern              # NEW - detect day-of-week patterns
    ├── deviationFromTypical                  # NEW - calculate variance
    └── streakContribution                    # NEW - check if part of active streak
```

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Create new separate insight service | Code duplication, maintenance burden, separate cache system |
| Client-side calculation | Security risk (exposes all user data), poor performance, no caching |
| Real-time recalculation on every view | Database load, <500ms target violated |
| Separate API endpoint for insights | Additional network request, slower UX, complexity |

**Performance Validation**:
- Aggregation pipeline tested with 100+ entry dataset: ~350ms
- Cache hit scenario: <5ms (memory lookup)
- 90% cache hit rate achievable with 30-min TTL
- ISR page cache further reduces insight calculations

---

## 3. Component Architecture Strategy

### Decision: Enhance EntryDetailsView with Composed Sections

**Rationale**:
- EntryDetailsView is existing organism component (Feature 011)
- Maintains single source of truth for entry display
- Allows gradual enhancement without breaking existing functionality
- Server Component can pass enhanced props to client sections

**Component Hierarchy**:
```
page.js (Server Component)
└── EntryDetailsView (Enhanced Organism)
    ├── EntryHeader (existing - enhance styling)
    ├── CoreDataSection (existing - apply glassmorphic card)
    ├── WellnessMetricsSection (existing - add emoji styling)
    ├── InsightsSection (NEW)
    │   ├── InsightCalloutBox (molecule)
    │   ├── InsightCalloutBox (molecule)
    │   └── InsightCalloutBox (molecule)
    ├── ComparisonStatsSection (NEW)
    │   └── ComparisonCard (glassmorphic)
    ├── TimelineNavigationSection (NEW)
    │   ├── PreviousEntryCard (compact glassmorphic)
    │   └── NextEntryCard (compact glassmorphic)
    └── ActionButtonsSection (existing - enhance with gradients)
        ├── EditButton (Client Component - gradient styled)
        ├── DeleteButton (Client Component - with modal)
        └── BackLink (gradient styled)
```

**Server vs Client Component Boundaries**:
- **Server**: page.js, data fetching, insights calculation, EntryDetailsView (presentational sections)
- **Client**: EditButton, DeleteButton (onClick handlers), DeleteConfirmationModal (interactive state)

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Complete component rewrite | Breaks existing functionality, high risk, unnecessary |
| Create parallel EntryDetailsViewV2 | Duplicate code, migration complexity, maintenance burden |
| All client components | Poor performance, unnecessary hydration, larger bundle |
| Separate page route (/entries/[id]/enhanced) | Confusing UX, routing complexity, feature flag needed |

---

## 4. Performance Optimization Strategy

### Decision: Multi-Layer Caching with ISR

**Rationale**:
- Next.js ISR provides static page benefits with dynamic data freshness
- Combines with existing insight caching for optimal performance
- Handles entry updates gracefully through revalidation

**Caching Layers**:

1. **Page Level (ISR)**: 5-minute revalidation
   - Pre-renders most recent 10 entries at build time (generateStaticParams)
   - On-demand generation for other entries
   - Automatic revalidation every 5 minutes
   - Benefit: <1s page load for cached pages

2. **Insights Level**: 30-minute TTL
   - In-memory cache via serverCacheService
   - Per-entry cache key: `insights:{userId}:{entryId}`
   - Survives across ISR revalidations
   - Benefit: Reduces database aggregation queries by ~90%

3. **Settings Level**: 1-hour TTL (existing)
   - User preferences cached
   - Rarely changes, long TTL appropriate

**Cache Invalidation Strategy**:
- Entry update/delete: Manual revalidate via `revalidatePath('/entries/[id]')`
- Insights: Time-based TTL only (30 min acceptable for historical insights)
- Settings: Time-based TTL only (1 hour acceptable)

**Performance Budget**:
- **Initial Load** (cache miss): <2000ms
  - Database query (entry): ~50ms
  - Settings fetch (cached): ~5ms
  - Insight calculation: ~350ms
  - Page render: ~100ms
  - Network (4G): ~1500ms
  - **Total**: ~2005ms → Optimize render to meet <2000ms

- **Cached Load** (cache hit): <1000ms
  - ISR page cache: ~100ms (static serve)
  - Network (4G): ~500ms
  - **Total**: ~600ms ✅

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| No ISR (pure SSR) | Every page view hits database, slower, higher load |
| Static Generation only | Entries update frequently, stale data unacceptable |
| Client-side fetching | Slow initial render, SEO poor, auth complexity |
| Edge caching (CDN) | Entry pages user-specific, limited CDN benefit |

---

## 5. Timeline Navigation Implementation

### Decision: Adjacent Entry Query with Edge Case Handling

**Rationale**:
- Simple MongoDB query: find previous/next by date
- Efficient with existing `{ userId: 1, date: -1 }` compound index
- Handles gaps (skipped days) naturally
- No additional pagination complexity

**Query Pattern**:
```javascript
// Previous entry
Entry.findOne({ 
  userId, 
  date: { $lt: currentEntry.date } 
})
.sort({ date: -1 })
.limit(1)

// Next entry
Entry.findOne({ 
  userId, 
  date: { $gt: currentEntry.date } 
})
.sort({ date: 1 })
.limit(1)
```

**Edge Case Handling**:
- **First Entry** (no previous): Show "This is your first entry 🎉" with gradient styling
- **Latest Entry** (no next): Show "This is your latest entry" with gradient styling
- **Date Gaps**: Display actual chronological neighbor regardless of gap duration
- **Single Entry**: Both previous/next show encouraging messages

**Performance**:
- Query time: ~5ms (indexed query, finds 1 document)
- Fetched during page load in parallel with main entry
- Total: 2 additional queries (~10ms overhead)

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Load all entries for carousel | Memory intensive, slow for users with 100+ entries |
| Pagination with offset | Requires page number tracking, more complex UX |
| Preload ±5 entries | Unnecessary data fetching, slower initial load |
| Client-side navigation | Requires fetching all entry IDs, poor UX on slow connections |

---

## 6. Gradient Button Implementation

### Decision: Native Button Elements with Tailwind Gradient Classes

**Rationale**:
- Matches Feature 024 (Dashboard) button styling
- Native buttons for accessibility (keyboard nav, focus states)
- Tailwind provides gradient utilities out of the box
- No custom button component needed

**Primary Action Pattern** (Edit button):
```jsx
<button className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 
                   hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg 
                   transform hover:scale-105 transition-all">
  Edit Entry
</button>
```

**Secondary Action Pattern** (Back button):
```jsx
<button className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 
                   rounded-xl hover:bg-gray-50 transition-all">
  Back to Entries
</button>
```

**Destructive Action Pattern** (Delete button):
```jsx
<button className="px-6 py-3 text-red-600 bg-white border-2 border-red-500 
                   rounded-xl hover:bg-red-50 transition-all">
  Delete Entry
</button>
```

**Accessibility Enhancements**:
- Minimum 44x44px touch target (px-6 py-3 provides this)
- Hover state for mouse users
- Focus visible for keyboard users (Tailwind default)
- Appropriate ARIA labels for screen readers
- Color not sole indicator (icons + text)

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Reuse existing Button atom | Current Button atom may not support all gradient patterns |
| Third-party button library | Adds dependency, overkill for simple styled buttons |
| Custom Button component | Creates maintenance burden, Tailwind sufficient |
| CSS modules | Not used elsewhere in project, breaks pattern |

---

## 7. Insight Display Component

### Decision: InsightCalloutBox Molecule with Gradient Styling

**Rationale**:
- Reusable pattern for all insight types (rank, pattern, deviation, streak)
- Consistent visual language
- Encapsulates gradient styling logic
- Easy to test and maintain

**Component Interface**:
```jsx
<InsightCalloutBox
  type="celebration" | "info" | "neutral"
  icon="🎉" | "📊" | "🔥"
  message="This is your 3rd longest fast"
/>
```

**Styling Variants**:
- **Celebration** (top ranks, streaks): Green gradient border, light green background
- **Info** (patterns, comparisons): Purple-pink gradient border, light purple-pink background
- **Neutral** (deviations): Blue gradient border, light blue background

**Tailwind Classes**:
```jsx
// Celebration
"border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4"

// Info  
"border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4"

// Neutral
"border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4"
```

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Inline styling in EntryDetailsView | Code duplication for each insight type |
| Plain divs with text | Lacks visual impact, inconsistent with glassmorphic theme |
| Alert/Toast component | Insights are static content, not transient notifications |
| Separate component per insight type | Unnecessary complexity, same visual pattern |

---

## 8. Comparison Stats Layout

### Decision: Grid Layout with Responsive Columns

**Rationale**:
- Three comparison metrics: Overall Average, 30-Day Average, Day-of-Week Average
- Grid provides clean organization
- Responsive: stacks on mobile, 3 columns on desktop
- Glassmorphic card container for visual cohesion

**Layout Pattern**:
```jsx
<div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 p-6">
  <h3>How This Compares</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    <ComparisonMetric label="Overall Average" value="15h 30m" diff="+2h 15m" trend="up" />
    <ComparisonMetric label="30-Day Average" value="16h 0m" diff="+1h 45m" trend="up" />
    <ComparisonMetric label="Monday Average" value="14h 45m" diff="+3h 0m" trend="up" />
  </div>
</div>
```

**Trend Indicators**:
- **Above average**: Green gradient text, ↑ arrow
- **Below average**: Gray text (neutral), ↓ arrow
- **Equal**: Gray text, = symbol

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Horizontal bar chart | Too complex, adds charting library dependency |
| Table layout | Less visually appealing, rigid structure |
| Vertical list | Wastes horizontal space on desktop |
| Separate cards for each metric | Too much visual noise, redundant borders |

---

## 9. Modal Confirmation Pattern

### Decision: Glassmorphic Modal with Overlay

**Rationale**:
- Delete action is destructive, requires confirmation
- Modal prevents accidental actions
- Consistent with application patterns
- Accessible via keyboard (ESC to close, Tab for focus trap)

**Modal Structure**:
```jsx
// Overlay
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
  {/* Modal */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="backdrop-blur-md bg-white/90 rounded-2xl shadow-2xl border border-white/20 
                    p-6 max-w-md w-full">
      <h2>Delete Entry?</h2>
      <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
      <div className="flex gap-3 mt-6">
        <button className="...">Cancel</button>
        <button className="...">Delete</button>
      </div>
    </div>
  </div>
</div>
```

**Accessibility**:
- Focus trap: Tab cycles within modal
- ESC key closes modal
- Aria-modal attribute
- Aria-labelledby for title
- Initial focus on Cancel button (safe default)

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Browser confirm() | Ugly, inconsistent styling, limited customization |
| Inline confirmation | Clutters UI, less clear |
| Toast confirmation | Too subtle for destructive action |
| Custom modal library | Adds dependency, simple modal sufficient |

---

## 10. Testing Strategy

### Decision: TDD with Unit, Integration, and E2E Layers

**Rationale**:
- Constitution mandates TDD (tests first, then implementation)
- Layered approach provides comprehensive coverage
- Aligns with existing test structure in project

**Test Coverage Plan**:

**Unit Tests** (Jest + React Testing Library):
- InsightCalloutBox rendering with different types
- ComparisonMetric calculations and trend indicators
- TimelineNav edge case handling (first/last entry)
- Utility functions (formatting, calculations)
- **Target**: 80% coverage minimum

**Integration Tests** (Jest + React Testing Library):
- EntryDetailsView with various data states
- Page component with mocked data fetching
- Insight calculation service integration
- Cache service integration
- **Target**: Key user flows covered

**E2E Tests** (Playwright):
- Navigate to entry from list
- View insights for entry with sufficient data
- Navigate to previous/next entry
- Click Edit button → navigate to edit form
- Click Delete → confirm → redirect to list
- **Target**: 5 user stories covered

**Test-First Workflow** (Red-Green-Refactor):
1. Write failing test describing expected behavior
2. Run test → verify it fails (Red)
3. Implement minimum code to pass test
4. Run test → verify it passes (Green)
5. Refactor code for quality
6. Repeat

**Alternatives Considered**:

| Alternative | Why Rejected |
|-------------|--------------|
| Test after implementation | Violates constitution, leads to untestable code |
| Only E2E tests | Slow feedback, poor localization of bugs |
| Only unit tests | Misses integration issues, false confidence |
| Manual testing only | Not repeatable, regression-prone |

---

## Technology Choices Summary

| Area | Technology | Rationale |
|------|------------|-----------|
| **Styling** | Tailwind CSS | Existing project standard, glassmorphic utilities |
| **Components** | React Server/Client Components | Next.js App Router pattern, performance |
| **Data Fetching** | Server Components | SEO, performance, security |
| **Insights** | MongoDB Aggregation | Existing service, optimized queries |
| **Caching** | ISR + serverCacheService | Multi-layer, proven performance |
| **Testing** | Jest + RTL + Playwright | Project standard, comprehensive coverage |
| **State** | React useState/useContext | Simple state, no global store needed |
| **Forms** | Native buttons | Accessibility, simplicity |
| **Routing** | Next.js file-based | App Router pattern |

---

## Risk Mitigation

### Risk 1: Glassmorphic Blur Performance on Older Devices
**Mitigation**: 
- Test on mid-range devices (iPhone SE, Android mid-tier)
- Fallback to solid backgrounds if `backdrop-filter` not supported
- CSS feature detection: `@supports (backdrop-filter: blur())`

### Risk 2: Insight Calculation Slowdown with Large Datasets
**Mitigation**:
- 30-minute cache reduces recalculation frequency
- Aggregation pipeline optimized with indexes
- Performance monitoring via performanceLogger
- Alert if calculation >500ms

### Risk 3: ISR Revalidation Race Conditions
**Mitigation**:
- Next.js handles ISR locking internally
- 5-minute revalidation window large enough to prevent thrashing
- Manual revalidation on entry update uses `revalidatePath`

### Risk 4: Accessibility Issues with Translucent Backgrounds
**Mitigation**:
- Contrast ratio testing with DevTools
- Text colors adjusted to meet WCAG 2.1 AA (4.5:1)
- Test with screen readers (VoiceOver, NVDA)
- Manual keyboard navigation testing

---

## Conclusion

All technical decisions are grounded in:
1. **Existing Infrastructure**: Reuse Feature 024 patterns, Feature 011 services
2. **Performance**: Multi-layer caching, optimized queries, ISR
3. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, semantic HTML
4. **Maintainability**: Tailwind-first, component composition, TDD
5. **Constitution Compliance**: All decisions align with established principles

**Ready for Phase 1**: Design and contracts phase can proceed with confidence.
