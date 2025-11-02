/**
 * ComparisonSection Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T062 - Create ComparisonSection organism
 * 
 * Displays comparison statistics grid with This Month, Last Month, All Time cards.
 * 
 * Props:
 * - comparisons: object (required) - { thisMonth, lastMonth, allTime }
 */

'use client';

import React from 'react';
import ComparisonStatsCard from '@/components/molecules/ComparisonStatsCard';

export default function ComparisonSection({ comparisons }) {
  // Don't show section if no comparisons data
  if (!comparisons) {
    return null;
  }

  const { thisMonth, lastMonth, allTime } = comparisons;

  // Check if we have at least one valid comparison
  const hasData = [thisMonth, lastMonth, allTime].some(c => c && c.count > 0);

  if (!hasData) {
    return null;
  }

  // Count how many cards we'll show
  const cardCount = [thisMonth, lastMonth, allTime].filter(c => c && c.count > 0).length;
  
  // Dynamic grid classes based on card count
  const gridClass = cardCount === 1 
    ? 'grid grid-cols-1 max-w-md mx-auto'
    : cardCount === 2 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  return (
    <section 
      className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-indigo-200/50 shadow-soft space-y-6"
      role="region"
      aria-label="Comparison Statistics"
    >
      <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        <span>📊</span>
        How This Fast Compares
      </h2>

      <div className={gridClass}>
        {/* This Month */}
        {thisMonth && thisMonth.count > 0 && (
          <ComparisonStatsCard comparison={thisMonth} />
        )}

        {/* Last Month */}
        {lastMonth && lastMonth.count > 0 && (
          <ComparisonStatsCard comparison={lastMonth} />
        )}

        {/* All Time */}
        {allTime && allTime.count > 0 && (
          <ComparisonStatsCard comparison={allTime} />
        )}
      </div>

      {/* Helper text */}
      <p className="text-sm text-gray-600 text-center italic">
        💡 Comparisons show how this fast measures up against your historical averages
      </p>
    </section>
  );
}
