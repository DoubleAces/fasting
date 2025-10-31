'use client';

import React from 'react';
import StatCard from '@/components/molecules/StatCard';

/**
 * DashboardStats Component
 * 
 * Displays six enhanced statistics cards with meaningful insights.
 * Uses glassmorphic StatCard components in a responsive grid layout.
 * 
 * @param {Object} stats - Statistics object from dashboardService
 * @param {Object} stats.longestFast - { duration: minutes, date: Date }
 * @param {number} stats.consistency - Percentage 0-100
 * @param {Object} stats.weekComparison - { thisWeekAvg, lastWeekAvg, trend }
 * @param {Object} stats.monthSummary - { count, average }
 * @param {number} stats.currentStreak - Current consecutive days streak
 * @param {number} stats.totalFasts - Total number of fasting entries
 * @param {string} [className] - Additional CSS classes
 */
const DashboardStats = ({ stats, className = '' }) => {
  // Handle empty/undefined stats
  if (!stats) {
    stats = {
      longestFast: null,
      consistency: 0,
      weekComparison: { thisWeekAvg: null, lastWeekAvg: null, trend: 'stable' },
      monthSummary: { count: 0, average: null },
      currentStreak: 0,
      totalFasts: 0,
    };
  }

  const {
    longestFast = null,
    consistency = 0,
    weekComparison = { thisWeekAvg: null, lastWeekAvg: null, trend: 'stable' },
    monthSummary = { count: 0, average: null },
    currentStreak = 0,
    totalFasts = 0,
  } = stats;

  // Format duration helper
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) {
      return 'No data';
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins}m`;
    }
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
  };

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Trend icon helper
  const getTrendIcon = (trend) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  // Show encouraging message for new users
  const hasNoData = totalFasts === 0;

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
          Your Progress
        </h2>
      </div>

      {hasNoData ? (
        // Empty state for new users
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon="🏆"
            label="Longest Fast"
            value="Start today!"
          />
          <StatCard
            icon="✅"
            label="Consistency"
            value="Log your first"
          />
          <StatCard
            icon="📈"
            label="This Week"
            value="Build momentum"
          />
          <StatCard
            icon="📅"
            label="This Month"
            value="Track progress"
          />
          <StatCard
            icon="🔥"
            label="Current Streak"
            value="0 days"
          />
          <StatCard
            icon="📊"
            label="Total Fasts"
            value="0"
          />
        </div>
      ) : (
        // Stats cards with real data
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Longest Fast - Personal Record */}
          <StatCard
            icon="🏆"
            label="Longest Fast"
            value={
              longestFast
                ? `${formatDuration(longestFast.duration)} on ${formatDate(longestFast.date)}`
                : 'No completed fasts'
            }
          />

          {/* Consistency Score - % of last 30 days */}
          <StatCard
            icon="✅"
            label="Consistency (30d)"
            value={`${consistency}%`}
          />

          {/* This Week vs Last Week */}
          <StatCard
            icon={getTrendIcon(weekComparison.trend)}
            label="This Week"
            value={
              weekComparison.thisWeekAvg
                ? `${formatDuration(weekComparison.thisWeekAvg)} avg`
                : 'No fasts this week'
            }
          />

          {/* This Month Summary */}
          <StatCard
            icon="📅"
            label="This Month"
            value={
              monthSummary.count > 0
                ? `${monthSummary.count} fasts • ${formatDuration(monthSummary.average)} avg`
                : 'No fasts this month'
            }
          />

          {/* Current Streak */}
          <StatCard
            icon="🔥"
            label="Current Streak"
            value={currentStreak === 1 ? '1 day' : `${currentStreak} days`}
          />

          {/* Total Fasts - Lifetime */}
          <StatCard
            icon="📊"
            label="Total Fasts"
            value={`${totalFasts} lifetime`}
          />
        </div>
      )}
    </section>
  );
};

export default DashboardStats;
