# Research: Entry Details Page

**Date**: October 24, 2025  
**Feature**: Entry Details Page  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Circular Clock Visualization Approach

**Decision**: Use SVG-based 24-hour circular clock with CSS for styling and animations

**Rationale**:
- SVG provides precise control over circular geometry needed for 24-hour clock
- Scalable for responsive design (mobile to desktop)
- Accessible via ARIA labels and semantic markup
- Performant for simple static visualizations (no heavy charting library needed)
- Can be styled with Tailwind CSS utilities
- Client Component for interactivity (tooltips on hover)

**Alternatives Considered**:
- **Canvas API**: Rejected - Less accessible, harder to style, overkill for static visualization
- **Chart.js/D3.js**: Rejected - Heavy dependencies for simple circular display, violates YAGNI principle
- **CSS-only circular progress**: Rejected - Limited to simple arcs, difficult for dual meal markers

**Implementation Notes**:
- SVG `<circle>` for clock face
- SVG `<path>` for shaded fasting period arc
- SVG `<circle>` markers for meal times
- Calculate angles: `angle = (hour + minute/60) * 15` (360°/24h = 15°/h)
- Use `viewBox` for responsive scaling
- Add `role="img"` and `aria-label` for accessibility

---

### 2. Insights Calculation Strategy

**Decision**: Server-side calculation in dedicated service module, cache-friendly design

**Rationale**:
- Calculations require querying multiple entries (30-90 days of data)
- Server Components can fetch and calculate in parallel with entry data
- Reduces client-side bundle size and computation
- Can leverage MongoDB aggregation pipelines for efficiency
- Results can be cached at CDN edge for repeated views

**Alternatives Considered**:
- **Client-side calculation**: Rejected - Requires downloading all user entries to browser, slow, unnecessary data transfer
- **Real-time database aggregation**: Rejected - Could be slow for users with many entries, better to compute in app layer with caching
- **Pre-calculated and stored**: Rejected - Requires updating on every new entry, stale data risk, storage overhead

**Calculation Logic**:
```
Insights to Calculate:
1. Longest fast this month: MAX(duration) WHERE date >= startOfMonth
2. Typical break-fast time: MEDIAN(firstMealTime) WHERE date >= 30daysAgo
3. Average duration (30 days): AVG(duration) WHERE date >= 30daysAgo
4. Streak contribution: Check if date is consecutive with yesterday's entry
5. Historical ranking: COUNT(entries WHERE duration > current.duration) + 1
6. Comparison to average: current.duration - average (with sign)
7. Best day badge: duration >= average AND energy="High Energy" AND wellBeing="Good" AND weight EXISTS
```

**Performance Optimization**:
- Fetch only necessary fields (not full Entry documents)
- Use MongoDB indexes on userId + date
- Consider Redis caching for frequently viewed entries
- Calculate asynchronously if >500ms threshold exceeded

---

### 3. PWA Offline Caching for Entry Details

**Decision**: Leverage existing Next PWA configuration, add entry details route to runtime caching

**Rationale**:
- @ducanh2912/next-pwa already configured in project
- Can use NetworkFirst strategy for entry details pages
- IndexedDB caching handled by service worker
- Consistent with 90-day caching policy (clarification answer)
- Workbox provides declarative caching rules

**Alternatives Considered**:
- **Custom service worker logic**: Rejected - Duplicates existing PWA setup, harder to maintain
- **Client-side IndexedDB manual caching**: Rejected - Service worker approach is standard PWA pattern
- **No offline support for details**: Rejected - Requirement explicitly states offline support (FR-032)

**Implementation**:
```javascript
// In next.config.mjs workbox options
runtimeCaching: [
  {
    urlPattern: /^https:\/\/[^\/]+\/entries\/[^\/]+$/, // Match /entries/[id]
    handler: 'NetworkFirst',
    options: {
      cacheName: 'entry-details-cache',
      expiration: {
        maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
      },
      networkTimeoutSeconds: 10,
    },
  },
]
```

---

### 4. Authorization Pattern for Entry Access

**Decision**: Reuse existing Next.js middleware + Server Component session check pattern

**Rationale**:
- Consistent with existing `/entries` page authorization
- Next Auth session available in Server Components via `auth()`
- Can verify entry ownership in Server Component before rendering
- Middleware already redirects unauthenticated users
- Follows principle of least privilege

**Alternatives Considered**:
- **API route proxy**: Rejected - Unnecessary indirection, slower than direct DB query in Server Component
- **Client-side auth check**: Rejected - Exposes unauthorized data during hydration, security risk
- **Custom authorization service**: Rejected - Duplicates Next Auth functionality

**Implementation Pattern**:
```javascript
// In src/app/entries/[id]/page.js (Server Component)
export default async function EntryDetailsPage({ params }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  const entry = await Entry.findById(params.id);
  if (!entry) notFound();
  if (entry.userId.toString() !== session.user.id) {
    redirect('/entries?error=unauthorized');
  }
  
  // ... render
}
```

---

### 5. Error Handling and Retry UX Pattern

**Decision**: Inline error display with retry button, preserve user state in modal

**Rationale**:
- Matches clarification answer (Option B)
- Prevents data loss on transient failures
- User-friendly - no forced navigation away
- Can use React Error Boundaries for graceful degradation
- Toast notifications for success feedback

**Alternatives Considered**:
- **Redirect on error**: Rejected - Loses user context, frustrating UX
- **Automatic retry**: Rejected - Could cause infinite loops, users lose control
- **Background queue**: Rejected - Overkill for simple user-initiated actions

**Implementation**:
```javascript
// Error state pattern in Client Components
const [error, setError] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  try {
    setIsDeleting(true);
    setError(null);
    await deleteEntry(entryId);
    router.push('/entries?message=deleted');
  } catch (err) {
    setError(err.message);
    // Modal stays open, retry button enabled
  } finally {
    setIsDeleting(false);
  }
};
```

---

### 6. Responsive Layout Strategy

**Decision**: Mobile-first CSS Grid/Flexbox with Tailwind responsive utilities, vertical stacking on mobile

**Rationale**:
- Follows Constitution II (Mobile-First Responsive Design)
- Tailwind provides semantic breakpoint utilities (sm:, md:, lg:)
- CSS Grid for complex layouts (timeline + insights side-by-side on desktop)
- Flexbox for simple vertical/horizontal flows
- No JavaScript needed for responsive behavior (performance)

**Alternatives Considered**:
- **JavaScript-based responsive**: Rejected - Unnecessary, CSS handles it, adds complexity
- **Separate mobile/desktop components**: Rejected - Code duplication, maintenance burden
- **CSS-in-JS library**: Rejected - Tailwind already configured, follows project conventions

**Layout Pattern**:
```html
<!-- Mobile: vertical stack -->
<!-- Desktop: sidebar layout -->
<div class="flex flex-col lg:flex-row gap-6">
  <main class="flex-1"><!-- Entry details --></main>
  <aside class="lg:w-80"><!-- Insights sidebar --></aside>
</div>
```

---

### 7. Testing Strategy

**Decision**: TDD with unit tests (calculations), component tests (rendering), integration tests (page), E2E tests (flows)

**Rationale**:
- Constitution III mandates TDD workflow
- Unit tests for pure calculation logic (insights service)
- Component tests for UI rendering and interactions
- Integration tests for Server Component data fetching
- E2E tests for critical user journeys (P1, P2, P3)
- Target 80% coverage minimum

**Test Structure**:
```
Unit Tests (Jest):
- entryInsightsService.test.js: All insight calculations
- FastingTimeline.test.js: SVG rendering, angle calculations
- EntryActions.test.js: Button states, disabled logic

Component Tests (React Testing Library):
- EntryDetailsView.test.js: Data display, null handling
- EntryInsights.test.js: Insights rendering, "best day" badge

Integration Tests (Jest + MongoDB Memory Server):
- entry-details.test.js: Full page rendering, authorization, edge cases

E2E Tests (Playwright):
- entry-details-flow.spec.js: Navigate from list, view details, click actions
```

---

## Summary

All research completed with clear decisions for:
1. **Visualization**: SVG-based circular clock (accessible, performant, Tailwind-compatible)
2. **Insights**: Server-side calculation with caching (fast, efficient)
3. **Offline**: Extend existing PWA config with NetworkFirst strategy
4. **Authorization**: Reuse Next Auth + Server Component pattern (consistent)
5. **Error Handling**: Inline errors with retry (user-friendly, no data loss)
6. **Responsive**: Mobile-first Tailwind utilities (Constitution compliance)
7. **Testing**: TDD with 4-layer strategy (unit/component/integration/E2E)

**Next Phase**: Phase 1 - Design (data model, contracts, quickstart)
