/**
 * Dashboard Loading State
 * 
 * Displays skeleton placeholders while dashboard data is being fetched.
 * Uses SkeletonCard for consistent loading UX.
 */

import SkeletonCard from '@/components/molecules/SkeletonCard';

export default function DashboardLoading() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4 overflow-hidden">
      {/* Decorative blur orbs for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-80 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Current Fast Status Skeleton */}
        <section className="mb-8" aria-label="Loading current fast status">
          <SkeletonCard />
        </section>

        {/* Statistics Skeleton */}
        <section className="mb-8" aria-label="Loading statistics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        {/* Recent History Skeleton */}
        <section className="mb-8" aria-label="Loading recent fasts">
          <SkeletonCard />
        </section>

        {/* Progress Chart Skeleton */}
        <section className="mb-8" aria-label="Loading progress chart">
          <SkeletonCard />
        </section>

        {/* Quick Actions Skeleton */}
        <section className="mb-8" aria-label="Loading quick actions">
          <SkeletonCard />
        </section>
      </div>
    </div>
  );
}
