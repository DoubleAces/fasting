# Quickstart Guide: User Dashboard

**Feature**: 024-user-dashboard  
**Estimated Time**: 45-60 minutes (if following TDD strictly)

## Prerequisites

- **Note**: This quickstart assumes admin migration (Task 1) is already complete. See `ADMIN-MIGRATION-PLAN.md` if starting fresh.
- Next.js 15.5.6 app running locally
- MongoDB connected and Entry model populated with test data
- NextAuth configured and working
- Feature 023 components available (GlassmorphicCard, GradientButton)

## Quick Start (5 Steps)

### Step 1: Install Dependencies (2 min)

```powershell
# Install Recharts for chart component
npm install recharts@2.12.7

# Verify installation
npm list recharts
# Should show: recharts@2.12.7
```

### Step 2: Create Dashboard Service (10 min)

**File**: `src/lib/services/dashboardService.js`

Create streak calculation logic:

```javascript
import { getDaysBetween } from '@/lib/utils/dateUtils';

/**
 * Calculate current streak from entries
 * Counts consecutive days backward from most recent entry
 * @param {Array} entries - User's entries sorted by date descending
 * @returns {number} Streak count in days
 */
export function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;
  
  // Ensure sorted descending
  const sorted = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  let streak = 1; // Count the most recent entry
  let currentDate = new Date(sorted[0].date);
  
  for (let i = 1; i < sorted.length; i++) {
    const previousDate = new Date(sorted[i].date);
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

/**
 * Calculate dashboard statistics
 * @param {Array} entries - User's entries
 * @returns {Object} { currentStreak, totalFasts, averageDuration }
 */
export function calculateDashboardStats(entries) {
  const currentStreak = calculateStreak(entries);
  const totalFasts = entries.length;
  
  // Average duration (requires 7+ entries with non-null durations)
  const validDurations = entries
    .map(e => e.fastingDuration)
    .filter(d => d !== null && d !== undefined && d > 0);
  
  const averageDuration = validDurations.length >= 7
    ? validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length
    : null;
  
  return {
    currentStreak,
    totalFasts,
    averageDuration,
  };
}
```

**Test** (TDD - write first):

```javascript
// tests/unit/lib/services/dashboardService.test.js
import { calculateStreak, calculateDashboardStats } from '@/lib/services/dashboardService';

describe('calculateStreak', () => {
  it('returns 0 for empty entries', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 for single entry', () => {
    const entries = [{ date: new Date('2025-10-30') }];
    expect(calculateStreak(entries)).toBe(1);
  });

  it('calculates streak for consecutive days', () => {
    const entries = [
      { date: new Date('2025-10-30') },
      { date: new Date('2025-10-29') },
      { date: new Date('2025-10-28') },
    ];
    expect(calculateStreak(entries)).toBe(3);
  });

  it('breaks streak at gap', () => {
    const entries = [
      { date: new Date('2025-10-30') },
      { date: new Date('2025-10-29') },
      { date: new Date('2025-10-27') }, // Gap on 10-28
      { date: new Date('2025-10-26') },
    ];
    expect(calculateStreak(entries)).toBe(2); // Only counts 10-29, 10-30
  });
});
```

---

### Step 3: Create Dashboard Page (15 min)

**File**: `src/app/dashboard/page.js`

```javascript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';
import { calculateDashboardStats } from '@/lib/services/dashboardService';
import { getActiveFast } from '@/lib/utils/fastingTimerUtils';
import DashboardView from './DashboardView';

export const metadata = {
  title: 'Dashboard - Fasting Tracker',
  description: 'Your personalized fasting dashboard',
};

export default async function DashboardPage() {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Connect to database
  await connectDB();

  // Fetch user's entries
  const entries = await Entry.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean();

  // Calculate stats server-side
  const stats = calculateDashboardStats(entries);

  // Get today's entry for active fast detection
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(
    e => new Date(e.date).toISOString().split('T')[0] === today
  );
  const activeFast = getActiveFast(todayEntry ? [todayEntry] : [], today);

  // Get recent 5 entries
  const recentEntries = entries.slice(0, 5);

  // Get last 30 days for chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const chartEntries = entries.filter(
    e => new Date(e.date) >= thirtyDaysAgo
  ).reverse(); // Ascending for chart

  return (
    <DashboardView
      stats={stats}
      activeFast={activeFast}
      recentEntries={recentEntries}
      chartEntries={chartEntries}
    />
  );
}
```

**File**: `src/app/dashboard/DashboardView.js` (Client Component wrapper)

```javascript
'use client';

import DashboardStats from '@/components/organisms/DashboardStats';
import RecentFastsList from '@/components/organisms/RecentFastsList';
import DashboardChart from '@/components/organisms/DashboardChart';
import QuickActions from '@/components/organisms/QuickActions';
import FastingTimerCard from '@/components/organisms/FastingTimerCard';

export default function DashboardView({
  stats,
  activeFast,
  recentEntries,
  chartEntries,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Decorative blur orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="fixed top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="fixed bottom-20 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2 mb-8">
          Your Dashboard
        </h1>

        {/* Timer or Start Fast CTA */}
        {activeFast?.isActive ? (
          <FastingTimerCard
            lastMealTime={activeFast.lastMealTime}
            date={activeFast.date}
            isActive={true}
          />
        ) : (
          <div className="mb-8">
            {/* Start Fast CTA card - implement based on spec */}
          </div>
        )}

        {/* Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Recent History */}
        <RecentFastsList entries={recentEntries} />

        {/* Chart */}
        <DashboardChart entries={chartEntries} />

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}
```

---

### Step 4: Create Core Components (10 min each)

**File**: `src/components/organisms/DashboardStats.js`

```javascript
'use client';

import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

export default function DashboardStats({ stats }) {
  const { currentStreak, totalFasts, averageDuration } = stats;

  const formatDuration = (minutes) => {
    if (!minutes) return 'Need 7+ entries';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Current Streak */}
      <GlassmorphicCard className="p-6 hover:scale-105 transition-all duration-300">
        <div className="text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-gray-900">{currentStreak}</div>
          <div className="text-sm text-gray-600 mt-1">Current Streak</div>
          {currentStreak === 0 && (
            <p className="text-xs text-purple-600 mt-2">Start your first fast</p>
          )}
        </div>
      </GlassmorphicCard>

      {/* Total Fasts */}
      <GlassmorphicCard className="p-6 hover:scale-105 transition-all duration-300">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-bold text-gray-900">{totalFasts}</div>
          <div className="text-sm text-gray-600 mt-1">Total Fasts</div>
          {totalFasts === 0 && (
            <p className="text-xs text-purple-600 mt-2">Begin your journey</p>
          )}
        </div>
      </GlassmorphicCard>

      {/* Average Duration */}
      <GlassmorphicCard className="p-6 hover:scale-105 transition-all duration-300">
        <div className="text-center">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatDuration(averageDuration)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Average Duration</div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}
```

**File**: `src/components/organisms/DashboardChart.js`

```javascript
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';
import { format } from 'date-fns';

export default function DashboardChart({ entries }) {
  if (entries.length < 7) {
    return (
      <GlassmorphicCard className="p-8 mb-8">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-4">📈</div>
          <p>Create 7+ entries to see trends</p>
        </div>
      </GlassmorphicCard>
    );
  }

  const chartData = entries.map(entry => ({
    date: format(new Date(entry.date), 'MMM d'),
    duration: (entry.fastingDuration || 0) / 60, // Convert to hours
    fullDate: format(new Date(entry.date), 'yyyy-MM-dd'),
    durationMinutes: entry.fastingDuration || 0,
  }));

  return (
    <GlassmorphicCard className="p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">30-Day Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const { fullDate, durationMinutes } = payload[0].payload;
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              return (
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/50">
                  <p className="text-sm text-gray-600">{fullDate}</p>
                  <p className="text-lg font-bold text-gray-900">{hours}h {minutes}m</p>
                </div>
              );
            }}
          />
          <Line 
            type="monotone" 
            dataKey="duration" 
            stroke="url(#lineGradient)" 
            strokeWidth={3}
            dot={{ fill: '#9333EA', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </GlassmorphicCard>
  );
}
```

---

### Step 5: Update Middleware (5 min)

**File**: `src/middleware.js`

Add redirect logic at the top of your existing middleware:

```javascript
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
  
  // ... existing middleware logic
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard', /* ...existing matchers */],
};
```

---

## Test It

```powershell
# Run dev server
npm run dev

# Open browser
start http://localhost:3000

# You should be redirected to /dashboard if logged in
# Or to /login if not logged in
```

**Expected Result**:
- ✅ Dashboard loads at `/dashboard`
- ✅ Shows stats: streak, total fasts, average (if 7+ entries)
- ✅ Shows recent 5 entries with durations
- ✅ Shows chart if 7+ entries exist
- ✅ Active fast timer if currently fasting
- ✅ "Start Fast" button if not currently fasting

---

## Common Issues

**Issue**: `Module not found: Can't resolve 'recharts'`  
**Fix**: Run `npm install recharts@2.12.7` and restart dev server

**Issue**: Dashboard shows "0 days" streak even though I have consecutive entries  
**Fix**: Check entry dates are truly consecutive (use MongoDB Compass or query to verify)

**Issue**: Chart doesn't render  
**Fix**: Ensure chart component has `'use client'` directive at top of file

**Issue**: Middleware redirect loop  
**Fix**: Check middleware matcher config doesn't include too many routes, ensure session check is correct

**Issue**: "Cannot read property 'user' of null" error  
**Fix**: Ensure NextAuth is configured and session is being fetched with `await auth()`

---

## Next Steps

After completing quickstart:

1. **Write comprehensive tests** (TDD requirement):
   - Unit tests for dashboardService
   - Component tests for all organisms
   - E2E tests for 6 user stories

2. **Add remaining components**:
   - RecentFastsList (show 5 entries with click navigation)
   - QuickActions (Create Entry, View All, Settings buttons)
   - SkeletonCard (loading states)

3. **Implement empty states**:
   - No entries: encouraging messages
   - <7 entries: "Need more data" placeholders

4. **Performance optimization**:
   - Add skeleton loading states
   - Memoize expensive calculations
   - Optimize chart rendering

5. **Accessibility**:
   - Add ARIA labels to stat cards
   - Ensure keyboard navigation works
   - Test with screen readers

**Time Estimate**:
- Quickstart (5 steps): 45-60 minutes
- Full implementation (with tests): 6-8 hours
- Full feature (with polish): 12-16 hours

---

## Verification Checklist

- [ ] Recharts installed and version confirmed
- [ ] `dashboardService.js` created with streak calculation
- [ ] Dashboard page created at `src/app/dashboard/page.js`
- [ ] DashboardStats component renders 3 stat cards
- [ ] DashboardChart component renders Recharts line chart
- [ ] Middleware redirects `/` → `/dashboard` for authenticated users
- [ ] Dashboard loads in <2 seconds (check Network tab)
- [ ] All Feature 023 components (GlassmorphicCard, GradientButton) render correctly
- [ ] Mobile responsiveness works (test at 375px width)
- [ ] Unit tests pass: `npm test -- dashboardService.test.js`

**Ready for full implementation!** ✅
