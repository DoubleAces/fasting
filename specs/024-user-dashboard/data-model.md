# Data Model: User Dashboard

**Feature**: 024-user-dashboard  
**Date**: 2025-10-30

## Overview

The User Dashboard feature introduces **no new database entities or schema changes**. It reads from the existing `Entry` model and computes derived statistics on-demand. All data transformations happen in-memory at runtime.

## Existing Entities (No Changes)

### Entry

**Source**: `src/lib/models/Entry.js` (Mongoose model)  
**Collection**: `entries` (MongoDB)

**Purpose**: Represents a single day's fasting log entry. Used by dashboard to calculate stats, display recent history, and render chart data.

**Schema** (relevant fields for dashboard):

```javascript
{
  _id: ObjectId,                    // MongoDB document ID
  userId: ObjectId,                 // Owner reference (indexed for queries)
  date: Date,                       // Entry date (indexed, unique per user)
  firstMealTime: String,            // "HH:mm" format (e.g., "12:00")
  lastMealTime: String,             // "HH:mm" format (e.g., "20:00")
  fastingDuration: Number | null,   // Minutes, null if no previous entry
  goalStatus: String | null,        // "completed" | "not-completed" | "no-goal" | null
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
```

**Indexes** (existing):
- `{ userId: 1, date: -1 }` - Query entries by user, sorted by date descending (used for recent history)
- `{ userId: 1, date: 1 }` - Unique constraint (one entry per day per user)

**Query Patterns Used by Dashboard**:

```javascript
// 1. Recent 5 entries for history section
await Entry.find({ userId })
  .sort({ date: -1 })
  .limit(5)
  .lean();

// 2. All entries for stats calculation (streak, total, average)
await Entry.find({ userId })
  .sort({ date: -1 })
  .lean();

// 3. Last 30 days for chart data
const thirtyDaysAgo = subDays(new Date(), 30);
await Entry.find({
  userId,
  date: { $gte: thirtyDaysAgo, $lte: new Date() }
})
  .sort({ date: 1 })  // Ascending for chart x-axis
  .lean();

// 4. Today's entry for active fast detection
const today = new Date().toISOString().split('T')[0];
await Entry.findOne({
  userId,
  date: new Date(today)
})
  .lean();
```

---

## Computed Entities (Not Persisted)

These entities exist only in memory during dashboard rendering. They are computed from Entry data and never stored in the database.

### DashboardStats

**Purpose**: Aggregated user statistics displayed in stat cards

**Computed Fields**:

```javascript
{
  currentStreak: Number,      // Consecutive days with entries (backward from most recent)
  totalFasts: Number,         // Count of all entries for user
  averageDuration: Number | null  // Mean of non-null fastingDuration values (null if <7 entries)
}
```

**Computation Logic**:

```javascript
// Streak calculation (backward from most recent entry)
function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  const sorted = entries.sort((a, b) => b.date - a.date);
  let streak = 1;
  let currentDate = sorted[0].date;
  
  for (let i = 1; i < sorted.length; i++) {
    const daysDiff = getDaysBetween(currentDate, sorted[i].date);
    if (daysDiff === 1) {
      streak++;
      currentDate = sorted[i].date;
    } else break;  // Gap found
  }
  
  return streak;
}

// Total fasts (simple count)
const totalFasts = entries.length;

// Average duration (requires 7+ entries with non-null durations)
function calculateAverage(entries) {
  const validDurations = entries
    .map(e => e.fastingDuration)
    .filter(d => d !== null && d !== undefined);
  
  if (validDurations.length < 7) return null;
  
  const sum = validDurations.reduce((acc, d) => acc + d, 0);
  return sum / validDurations.length;
}
```

**Service Location**: `src/lib/services/dashboardService.js` (new file)

**Reuses**: `getAverageDuration()` from existing `src/lib/services/entryInsightsService.js`

---

### RecentEntry

**Purpose**: Simplified entry data for recent history list

**Computed Fields**:

```javascript
{
  id: String,                 // Entry._id as string
  date: Date,                 // Entry.date
  formattedDate: String,      // "Jan 30, 2025" format
  fastingDuration: Number | null,
  formattedDuration: String,  // "16h 30m" format or "N/A"
  goalStatus: String | null,  // "completed" | "not-completed" | "no-goal" | null
  isExtendedFast: Boolean,    // true if duration > 1440 minutes (24 hours)
  icon: String | null         // "✅" if completed, "⚠️" if not-completed, null otherwise
}
```

**Computation Logic**:

```javascript
function formatRecentEntry(entry) {
  const formattedDate = format(entry.date, 'MMM d, yyyy');  // date-fns
  const hours = Math.floor((entry.fastingDuration || 0) / 60);
  const minutes = (entry.fastingDuration || 0) % 60;
  const formattedDuration = entry.fastingDuration 
    ? `${hours}h ${minutes}m` 
    : 'N/A';
  
  const icon = entry.goalStatus === 'completed' ? '✅' 
    : entry.goalStatus === 'not-completed' ? '⚠️' 
    : null;
  
  return {
    id: entry._id.toString(),
    date: entry.date,
    formattedDate,
    fastingDuration: entry.fastingDuration,
    formattedDuration,
    goalStatus: entry.goalStatus,
    isExtendedFast: entry.fastingDuration > 1440,
    icon
  };
}
```

**Component Location**: `src/components/organisms/RecentFastsList.js`

---

### ChartDataPoint

**Purpose**: Data point for Recharts line chart

**Computed Fields**:

```javascript
{
  date: String,               // "Oct 1" format (short month + day)
  fullDate: String,           // "2025-10-01" format (for tooltip)
  duration: Number,           // fastingDuration in hours (converted from minutes)
  durationMinutes: Number     // Original minutes (for tooltip precision)
}
```

**Computation Logic**:

```javascript
function formatChartData(entries) {
  return entries.map(entry => ({
    date: format(entry.date, 'MMM d'),  // "Oct 1"
    fullDate: format(entry.date, 'yyyy-MM-dd'),  // "2025-10-01"
    duration: (entry.fastingDuration || 0) / 60,  // Convert to hours
    durationMinutes: entry.fastingDuration || 0
  }));
}
```

**Component Location**: `src/components/organisms/DashboardChart.js`

**Usage with Recharts**:

```javascript
<LineChart data={chartData}>
  <XAxis dataKey="date" />
  <YAxis label={{ value: 'Hours', angle: -90 }} />
  <Tooltip 
    content={({ payload }) => {
      if (!payload?.[0]) return null;
      const { fullDate, durationMinutes } = payload[0].payload;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return (
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded">
          <p>{fullDate}</p>
          <p className="font-bold">{hours}h {minutes}m</p>
        </div>
      );
    }}
  />
  <Line dataKey="duration" stroke="url(#gradient)" />
</LineChart>
```

---

### ActiveFast

**Purpose**: Current fasting status derived from today's entry

**Computed Fields**:

```javascript
{
  isActive: Boolean,          // true if lastMealTime set but no firstMealTime
  lastMealTime: String | null, // "HH:mm" format
  date: Date | null,          // Entry date
  elapsedMinutes: Number | null, // Minutes since lastMealTime
  formattedElapsed: String | null // "16h 32m" format
}
```

**Computation Logic**:

```javascript
function getActiveFast(todayEntry) {
  if (!todayEntry) return { isActive: false };
  
  const isActive = todayEntry.lastMealTime && !todayEntry.firstMealTime;
  
  if (!isActive) return { isActive: false };
  
  // Calculate elapsed time (reuses existing utility)
  const elapsedMinutes = calculateElapsedTime(
    todayEntry.lastMealTime, 
    new Date(), 
    todayEntry.date
  );
  
  return {
    isActive: true,
    lastMealTime: todayEntry.lastMealTime,
    date: todayEntry.date,
    elapsedMinutes,
    formattedElapsed: formatElapsedTime(elapsedMinutes)
  };
}
```

**Service Location**: Reuses existing `getActiveFast()` from `src/lib/utils/fastingTimerUtils.js`

---

## Data Flow

```
┌─────────────────────────────────────┐
│  MongoDB: entries collection        │
│  (userId, date, times, duration)    │
└─────────────┬───────────────────────┘
              │ Query (Server Component)
              ↓
┌─────────────────────────────────────┐
│  Server: dashboard/page.js          │
│  - Fetch entries from DB/API        │
│  - Compute initial stats            │
│  - Format data for components       │
└─────────────┬───────────────────────┘
              │ Props passing
              ↓
┌─────────────────────────────────────┐
│  Client Components:                 │
│  - DashboardStats (streak/total)    │
│  - RecentFastsList (5 entries)      │
│  - DashboardChart (30-day data)     │
│  - FastingTimerCard (active fast)   │
└─────────────────────────────────────┘
```

**Performance Considerations**:

1. **Query Optimization**:
   - Use `.lean()` for read-only queries (faster than full Mongoose documents)
   - Limit fields with `.select()` if only specific fields needed
   - Leverage existing compound indexes

2. **Computation Optimization**:
   - Calculate stats server-side to reduce client bundle
   - Memoize expensive calculations (React.useMemo)
   - Use Web Workers for heavy computations (future enhancement if needed)

3. **Caching Strategy** (optional future enhancement):
   - Cache computed stats with 5-minute TTL in Redis
   - Invalidate on new entry creation/update
   - Cache key: `dashboard:stats:${userId}`

---

## Validation Rules

Since no new data is created by the dashboard (read-only feature), validation rules are inherited from the Entry model:

**Entry Model Validations** (enforced at write time, not dashboard concern):
- `date`: Required, valid Date, not in future
- `firstMealTime`: Required (when completing fast), HH:mm format
- `lastMealTime`: Required, HH:mm format
- `fastingDuration`: Number >= 0 or null
- `goalStatus`: Enum: "completed" | "not-completed" | "no-goal" | null

**Dashboard Computed Value Validation**:
- Streak: Always >= 0 (integer)
- Total fasts: Always >= 0 (integer)
- Average duration: null if <7 entries, otherwise >= 0 (number)
- Chart data: Filter out entries with null duration before rendering

---

## State Transitions

The dashboard is a **read-only view** with no state mutations. However, it reflects state transitions that occur elsewhere:

**Entry Lifecycle States** (reflected in dashboard):

```
[No Entry]
    ↓ (User creates entry with lastMealTime)
[Active Fast] → Timer card shows counting up
    ↓ (User adds firstMealTime)
[Completed Fast] → Recent history shows duration
    ↓ (User edits entry)
[Updated Fast] → Dashboard reflects new duration
    ↓ (User deletes entry)
[No Entry] → Dashboard stats recalculate
```

**Streak Lifecycle**:

```
[Streak = 0] (No entries)
    ↓ (First entry created)
[Streak = 1]
    ↓ (Next day entry created)
[Streak = 2]
    ↓ (Skip a day - no entry created)
[Streak resets to 1] (Counting from most recent entry backward)
```

---

## API Contracts

Dashboard uses existing API endpoints (no new endpoints created):

### GET /api/entries

**Used For**: Fetching entries for stats, recent history, chart

**Request**:
```http
GET /api/entries?limit=5&skip=0
Authorization: Session cookie (NextAuth)
```

**Response** (200 OK):
```json
{
  "success": true,
  "entries": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "date": "2025-10-30T00:00:00.000Z",
      "firstMealTime": "12:00",
      "lastMealTime": "20:00",
      "fastingDuration": 960,
      "goalStatus": "completed",
      "createdAt": "2025-10-30T12:30:00.000Z",
      "updatedAt": "2025-10-30T20:15:00.000Z"
    }
  ],
  "total": 42,
  "limit": 5,
  "skip": 0
}
```

**Dashboard Usage Variations**:
- Recent history: `GET /api/entries?limit=5` (5 most recent)
- All entries (for stats): `GET /api/entries` (no limit, fetches all)
- Chart data: Could use date range filters if implemented: `GET /api/entries?startDate=2025-10-01&endDate=2025-10-30`

**Alternative**: Direct database query in Server Component (bypassing API for faster initial load):

```javascript
// In src/app/dashboard/page.js (Server Component)
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';

export default async function DashboardPage() {
  const session = await auth();
  await connectDB();
  
  const entries = await Entry.find({ userId: session.user.id })
    .sort({ date: -1 })
    .lean();
  
  // Compute stats server-side
  const stats = calculateDashboardStats(entries);
  
  return <DashboardView entries={entries} stats={stats} />;
}
```

---

## Edge Cases & Data Integrity

**Empty States**:
- 0 entries: All stats show 0/null, empty state messages displayed
- 1 entry: Streak = 1, total = 1, average = null (<7 entries)
- <7 entries: Average duration shows null/"Need 7+ entries" message

**Null fastingDuration Handling**:
- Entries with null duration excluded from average calculation
- Recent history shows "N/A" for duration if null
- Chart excludes null duration entries (or shows as 0 with visual indicator)

**Extended Fasts (>24h)**:
- Badge displayed in recent history if duration > 1440 minutes
- Warning message if active fast exceeds 7 days (168 hours / 10,080 minutes)

**Timezone Handling**:
- All dates displayed in user's browser timezone (client-side formatting)
- "Today" determination uses browser's local date
- Server stores dates in UTC, client converts for display

**Concurrent Updates**:
- Dashboard data is read-only, no write conflicts
- If entry is created/updated/deleted while dashboard is open, user may see stale data
- Solution: No real-time updates needed (acceptable to require page refresh)
- Future enhancement: Use Server-Sent Events or WebSockets for live updates

**Performance Degradation**:
- If user has >1000 entries, consider pagination or date range limits
- Chart limited to 30 days (max ~30 data points) for performance
- Stats calculation O(n) complexity acceptable up to ~5000 entries

---

## Migration Requirements

**No migrations required.** Dashboard reads from existing Entry model with no schema changes.

**Deployment Checklist**:
1. ✅ No database migrations
2. ✅ No new collections
3. ✅ No new indexes (existing indexes sufficient)
4. ✅ No data backfill needed
5. ✅ Backward compatible (reads existing data)

**Rollback Strategy**:
- Dashboard is additive feature, safe to remove
- Middleware redirect can be commented out to restore old behavior
- No data cleanup needed on rollback

---

## Summary

- **0 new database entities** (reads from existing Entry model)
- **4 computed entities** (DashboardStats, RecentEntry, ChartDataPoint, ActiveFast) - all in-memory
- **1 existing API endpoint** reused (GET /api/entries)
- **0 schema migrations** required
- **Read-only feature** with no data mutations
- **Safe to deploy** (no breaking changes, backward compatible)
