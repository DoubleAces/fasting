/**
 * Performance Monitoring Page
 * 
 * Admin dashboard page for monitoring application performance.
 * Displays cache statistics, API performance metrics, and system health.
 * 
 * Route: /admin/performance
 * Access: Admin only (enforced by admin layout)
 */

import PerformanceMetrics from '@/components/admin/PerformanceMetrics';

export const metadata = {
  title: 'Performance Monitoring | Admin Dashboard',
  description: 'Monitor application performance, cache statistics, and system health',
};

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Performance Monitoring
        </h1>
        <p className="mt-2 text-gray-600">
          Real-time insights into application performance, cache efficiency, and system health
        </p>
      </div>

      {/* Performance Metrics Component */}
      <PerformanceMetrics />
    </div>
  );
}
