/**
 * User Dashboard Page (Server Component)
 * 
 * Route: /dashboard
 * 
 * Main hub for authenticated users showing:
 * - Current fast status (active timer or "Start New Fast" CTA)
 * - Key statistics (streak, total fasts, average duration)
 * - Recent fasting history (5 most recent entries)
 * - Progress visualization (30-day chart)
 * - Quick action buttons
 * 
 * Server-side data fetching for optimal performance.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Entry from '@/lib/models/Entry';
import { connectDB } from '@/lib/db';
import DashboardTimerSection from './DashboardTimerSection';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';
import GradientButton from '@/components/atoms/GradientButton';
import DashboardStats from '@/components/organisms/DashboardStats';
import RecentFastsList from '@/components/organisms/RecentFastsList';
import QuickActions from '@/components/organisms/QuickActions';
import DashboardChart from '@/components/organisms/DashboardChart';
import { getActiveFast } from '@/lib/utils/fastingTimerUtils';
import { calculateDashboardStats } from '@/lib/services/dashboardService';

/**
 * Metadata for SEO
 */
export const metadata = {
  title: 'Dashboard | Fasting Tracker',
  description: 'Your personalized fasting dashboard with stats, history, and progress tracking',
};

/**
 * Dashboard Page Component
 */
export default async function DashboardPage() {
  // ========================================================================
  // AUTHENTICATION
  // ========================================================================
  
  const session = await auth();
  
  // Redirect if not authenticated (middleware should catch this, but double-check)
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard');
  }
  
  const userId = session.user.id;

  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  
  await connectDB();
  
  // Get the most recent entry to check for active fast (not just today)
  const mostRecentEntry = await Entry.findOne({
    userId,
  })
    .sort({ date: -1 })
    .limit(1)
    .lean();

  // Determine if there's an active fast
  // A fast is active if the most recent entry has a lastMealTime
  // The lastMealTime STARTS a new fast that continues until the next entry's firstMealTime
  const hasActiveFast = mostRecentEntry && mostRecentEntry.lastMealTime;
  const todayEntry = mostRecentEntry;

  // Calculate dashboard statistics
  console.log('🔍 Dashboard calculating stats for userId:', userId);
  const stats = await calculateDashboardStats(userId);
  console.log('📊 Dashboard stats result:', stats);

  // Get recent 5 entries for history section
  const recentEntries = await Entry.find({ userId })
    .sort({ date: -1 }) // Most recent first
    .limit(5)
    .lean();

  // Get last 30 days of entries for progress chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const chartEntries = await Entry.find({
    userId,
    date: { $gte: thirtyDaysAgo },
  })
    .sort({ date: 1 }) // Oldest first for chart
    .lean();

  // Serialize entries for Client Components (convert MongoDB objects to plain objects)
  const serializeEntry = (entry) => ({
    _id: entry._id.toString(),
    userId: entry.userId.toString(),
    date: entry.date.toISOString(),
    firstMealTime: entry.firstMealTime,
    lastMealTime: entry.lastMealTime,
    fastingDuration: entry.fastingDuration,
    extendedFastConfirmed: entry.extendedFastConfirmed,
    fastingGoal: entry.fastingGoal,
    goalStatus: entry.goalStatus,
    templateSource: entry.templateSource,
    // Health metrics
    energyLevel: entry.energyLevel,
    wellBeing: entry.wellBeing,
    morningWeight: entry.morningWeight,
    hoursOfSleep: entry.hoursOfSleep,
    hungerLevel: entry.hungerLevel,
    foodNotes: entry.foodNotes,
    createdAt: entry.createdAt?.toISOString(),
    updatedAt: entry.updatedAt?.toISOString(),
  });

  const serializedRecentEntries = recentEntries.map(serializeEntry);
  const serializedChartEntries = chartEntries.map(serializeEntry);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4 overflow-hidden">
      {/* Decorative blur orbs for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
            Welcome back, {session.user.name || 'User'}
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress and stay motivated
          </p>
        </div>

        {/* Current Fast Status Section - Always show timer */}
        <section className="mb-8" aria-label="Current fasting status">
          <DashboardTimerSection
            lastMealTime={hasActiveFast ? todayEntry.lastMealTime : null}
            date={hasActiveFast ? todayEntry.date : null}
            isActive={hasActiveFast}
          />
        </section>

        {/* Statistics Section */}
        <section aria-label="Fasting statistics">
          <DashboardStats stats={stats} />
        </section>

        {/* Recent History Section */}
        <section aria-label="Recent fasting history">
          <RecentFastsList entries={serializedRecentEntries} />
        </section>

        {/* Timer removed - chart section replaced */}

        {/* Quick Actions Section */}
        <section aria-label="Quick action buttons">
          <QuickActions />
        </section>
      </div>
    </div>
  );
}
