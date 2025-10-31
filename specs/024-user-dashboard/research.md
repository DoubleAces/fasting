# Technical Research: User Dashboard

**Feature**: 024-user-dashboard  
**Date**: 2025-10-30  
**Status**: Complete

**Note**: The existing admin section at `/dashboard` will be migrated to `/admin` as Task 1 of implementation. See `ADMIN-MIGRATION-PLAN.md` for details.

## Research Tasks

### R-001: Recharts Integration with Next.js 15 & React 18

**Decision**: Use Recharts 2.12.7 for dashboard progress chart

**Rationale**:
- Recharts is specifically designed for React with declarative API that matches React component patterns
- Version 2.12.7 is confirmed compatible with React 18 (no peer dependency conflicts)
- Works seamlessly with Next.js 15 Server/Client Component architecture (chart must be Client Component with 'use client' directive)
- Smaller bundle size (~140KB gzipped) compared to Chart.js + react-chartjs-2 (~200KB+ gzipped)
- Built-in responsive container component handles resize automatically
- TypeScript support with @types/recharts (beneficial for future migration)
- Active maintenance (last update within 3 months)

**Alternatives Considered**:
- **Chart.js with react-chartjs-2**: More features but larger bundle, imperative API less React-idiomatic, requires additional wrapper component for responsiveness
- **Victory**: Excellent animations but heavier bundle (~250KB), overkill for simple line chart, animation complexity not needed for this feature
- **Native SVG**: Full control and zero dependencies but requires implementing tooltip logic, responsive calculations, axis scaling, accessibility features from scratch - significant dev time for minimal benefit

**Implementation Notes**:
```javascript
// Install dependency
npm install recharts@2.12.7

// Usage pattern
'use client'; // Required for Recharts

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line 
      type="monotone" 
      dataKey="duration" 
      stroke="url(#gradient)" 
      strokeWidth={2} 
    />
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#9333EA" />
        <stop offset="50%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
    </defs>
  </LineChart>
</ResponsiveContainer>
```

---

### R-002: Streak Calculation Algorithm

**Decision**: Count consecutive days backward from most recent entry date, not from today

**Rationale**:
- More user-friendly: users don't lose streak immediately if they haven't logged today yet (they might be currently fasting)
- Aligns with common gamification patterns (Duolingo, GitHub streak counter)
- Matches user mental model: "How many consecutive days have I completed?" vs "Am I on a streak right now?"
- Reduces false negatives: user who fasted yesterday and is fasting today doesn't see "0 days" just because they haven't ended today's fast yet
- Clarified in spec Session 2025-10-30 question 2

**Algorithm**:
```javascript
// Pseudocode
function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  // Sort by date descending
  const sorted = entries.sort((a, b) => b.date - a.date);
  
  let streak = 1; // Count the most recent entry
  let currentDate = sorted[0].date;
  
  for (let i = 1; i < sorted.length; i++) {
    const previousDate = sorted[i].date;
    const daysDiff = getDaysBetween(currentDate, previousDate);
    
    if (daysDiff === 1) {
      // Consecutive day found
      streak++;
      currentDate = previousDate;
    } else {
      // Gap found - break streak
      break;
    }
  }
  
  return streak;
}
```

**Edge Cases Handled**:
- Empty entries: return 0
- Single entry: return 1
- Gap in entries: streak resets at gap
- Today with no entry: doesn't break streak (counts from most recent)

**Alternatives Considered**:
- **Start from today**: Rejected - penalizes users who haven't logged today yet, creates confusing UX where streak disappears overnight
- **Hybrid with "at risk" indicator**: Rejected - adds unnecessary complexity, the simple backward-counting approach is sufficient and clearer

---

### R-003: Skeleton Loading States Pattern

**Decision**: Use animated glassmorphic skeleton cards matching final layout

**Rationale**:
- Skeleton screens provide better perceived performance than spinners (research shows 15-20% improvement in perceived speed)
- Shows users what to expect (layout structure) while loading
- Maintains visual consistency with Feature 023 glassmorphic design system
- Aligns with modern UX best practices (Facebook, LinkedIn, YouTube all use skeletons)
- Clarified in spec Session 2025-10-30 question 4

**Implementation Pattern**:
```javascript
// SkeletonCard.js
export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6">
        <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Usage in DashboardStats
{loading ? (
  <>
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </>
) : (
  <ActualStatCards />
)}
```

**Design Specifications**:
- Use Tailwind's `animate-pulse` for shimmer effect
- Match glassmorphic styling: `backdrop-blur-xl bg-white/40 border border-white/50`
- Use gradient backgrounds: `from-purple-100 to-pink-100` for lighter skeleton elements
- Maintain exact same dimensions and layout as final components
- Apply to: stat cards, recent history items, chart placeholder

**Alternatives Considered**:
- **Loading spinners**: Rejected - less modern UX, doesn't show layout structure, adds perceived delay
- **Hybrid approach (skeleton + spinner)**: Rejected - unnecessary complexity, skeleton alone is sufficient and clearer

---

### R-004: Server Component vs Client Component Split

**Decision**: Dashboard page is Server Component, interactive elements are Client Components

**Rationale**:
- Next.js 15 best practice: Server Components by default for data fetching
- Server Component benefits: faster initial load, smaller JS bundle, better SEO
- Client Components only where needed: timer (needs useEffect for interval), chart (Recharts requires 'use client'), stats (can be client for potential future interactivity)
- Follows existing codebase patterns (entries page uses similar split)

**Component Classification**:

**Server Components** (no 'use client' directive):
- `src/app/dashboard/page.js` - Main page, fetches entries data, passes to children

**Client Components** (requires 'use client' directive):
- `DashboardStats.js` - May need client-side calculations or animations
- `RecentFastsList.js` - Click handlers for navigation
- `DashboardChart.js` - Recharts requires client-side rendering
- `QuickActions.js` - Click handlers for navigation
- `FastingTimerCard.js` (existing) - useEffect for timer interval
- `StatCard.js`, `RecentEntryItem.js`, `SkeletonCard.js` - Can be server or client (used in client contexts)

**Data Flow**:
```
Server Component (page.js)
  ↓ (fetch entries via API or direct DB)
  ↓ (calculate initial stats server-side)
  ↓ (pass as props)
Client Components (timer, chart, stats)
```

**Alternatives Considered**:
- **All Client Components**: Rejected - larger JS bundle, slower initial load, unnecessary for non-interactive data display
- **All Server Components**: Impossible - timer and chart require client-side JavaScript

---

### R-005: Middleware Redirect Strategy

**Decision**: Redirect authenticated users from `/` to `/dashboard` in middleware

**Rationale**:
- Middleware runs before page render - faster than client-side redirect
- Maintains marketing homepage for unauthenticated users
- Follows Next.js 15 middleware best practices
- Single source of truth for routing logic
- Prevents flash of marketing content for authenticated users

**Implementation**:
```javascript
// src/middleware.js
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const session = await auth();
  
  // Redirect authenticated users from homepage to dashboard
  if (session?.user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users from dashboard to login
  if (!session?.user && request.nextUrl.pathname === '/dashboard') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', '/dashboard');
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard'],
};
```

**Edge Cases**:
- User logs out while on dashboard: middleware redirects to login with callback URL
- User clicks logo/home link: middleware redirects back to dashboard if authenticated
- Direct URL access to /dashboard: middleware enforces authentication

**Alternatives Considered**:
- **Client-side redirect with useEffect**: Rejected - causes flash of wrong content, slower, not SEO-friendly
- **Separate authenticated/unauthenticated homepages**: Rejected - unnecessary code duplication, harder to maintain

---

### R-006: Empty State Messaging Strategy

**Decision**: Use encouraging, actionable messages with gradient backgrounds

**Rationale**:
- Empty states are critical onboarding opportunities for new users
- Research shows positive, actionable messaging increases conversion by 30-40%
- Gradient backgrounds maintain visual consistency with Feature 023 design
- Each empty state guides user toward next action

**Message Guidelines**:

**Stat Cards (0 entries)**:
- Current Streak: "Start your first fast" (not "0 days" which is demotivating)
- Total Fasts: "Begin your journey" (positive framing)
- Average Duration: "Track 7+ fasts to see average" (clear next step)

**Recent History (0 entries)**:
- Slot 1: "Your first fast will appear here"
- Slot 2: "Track your fasting journey"
- Slot 3: "See your progress over time"
- Slot 4: "Every fast counts!"
- Slot 5: "Start logging today"

**Chart (<7 entries)**:
- "Create 7+ entries to see trends" (clear threshold)
- Show gradient placeholder chart shape to indicate what will appear

**Design Pattern**:
```javascript
{entries.length === 0 ? (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
    <p className="text-lg text-gray-600 mb-4">Your first fast will appear here</p>
    <GradientButton onClick={handleStartFast}>Start Your First Fast</GradientButton>
  </div>
) : (
  <ActualContent />
)}
```

**Alternatives Considered**:
- **Gray placeholder boxes**: Rejected - less visually appealing, doesn't match Feature 023 design
- **No empty states (just hide sections)**: Rejected - confusing for new users, looks broken
- **Neutral/technical messaging**: Rejected - less engaging, misses onboarding opportunity

---

### R-007: Performance Optimization Strategies

**Decision**: Implement multi-level optimization for <2s load time target

**Rationale**:
- FR-053 requires <2s initial load for users with <100 entries
- SC-002 measures page load + hydration time
- Dashboard is primary landing page - performance critical for user experience
- Multiple optimization layers needed to hit aggressive target

**Optimization Layers**:

**1. Server-Side Optimizations**:
- Fetch only required data (no overfetching): `GET /api/entries?limit=5` for recent history
- Calculate stats server-side (streak, total, average) to reduce client-side computation
- Use MongoDB indexes on userId + date for fast queries
- Consider caching frequently accessed data (average duration, streak) with 5-minute TTL

**2. Client-Side Optimizations**:
- Code splitting: dynamic imports for chart component (only loads when user has 7+ entries)
- Skeleton loading states to improve perceived performance
- Prefetch entries data on authentication (start fetch before dashboard route loads)
- Memoize expensive calculations (React.useMemo for data transformations)

**3. Bundle Optimizations**:
- Recharts tree-shaking: import only needed components (`LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`)
- Next.js Image optimization for any icons (already using from Feature 023)
- Minimize client component JavaScript (keep Server Components where possible)

**4. Rendering Optimizations**:
- Streaming SSR: render shell first, stream data when ready
- Parallel data fetching: fetch entries and settings simultaneously
- Avoid unnecessary re-renders: proper React key usage, stable references

**Monitoring**:
- Add performance markers: `performance.mark('dashboard-loaded')`
- Log server-side fetch times in development
- Track bundle sizes in CI/CD
- Use Lighthouse CI for regression detection

**Alternatives Considered**:
- **Client-side rendering only**: Rejected - slower initial load, worse SEO
- **Aggressive caching (1+ hour TTL)**: Rejected - stale data unacceptable for fasting tracker, users expect real-time updates
- **Paginated recent history**: Rejected - overkill for 5 entries, adds unnecessary complexity

---

## Summary

All technical unknowns resolved. Key decisions:
1. **Recharts 2.12.7** for charting (React-first, compatible, smaller bundle)
2. **Backward-counting streak** from most recent entry (user-friendly, matches gamification patterns)
3. **Skeleton loading states** with glassmorphic styling (better perceived performance)
4. **Server/Client Component split** following Next.js 15 best practices
5. **Middleware redirects** for authentication and routing
6. **Encouraging empty states** with gradient backgrounds and actionable CTAs
7. **Multi-layer performance optimization** to hit <2s load target

Ready to proceed to Phase 1 (data modeling and contracts).
