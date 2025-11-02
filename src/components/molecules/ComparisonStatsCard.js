/**
 * ComparisonStatsCard Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T058 - Create ComparisonStatsCard molecule
 * 
 * Displays comparison of current entry against period averages (This Month, Last Month, All Time).
 * 
 * Props:
 * - comparison: object (required) - { period, average, current, difference, percentDifference, count }
 * - className: string (optional) - Additional CSS classes
 */

import React from 'react';
import { formatDuration } from '@/lib/utils/formatters';

export default function ComparisonStatsCard({ comparison, className = '' }) {
  if (!comparison || comparison.average === null || comparison.count === 0) {
    return (
      <div 
        className={`
          bg-gradient-to-br from-gray-50/80 to-slate-50/80 border-gray-200/50
          backdrop-blur-sm rounded-xl p-5 border shadow-soft
          ${className}
        `.trim()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {comparison?.period || 'N/A'}
        </h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const { period, average, current, difference, percentDifference, count } = comparison;

  // Determine variant based on difference
  const isPositive = difference > 0;
  const isNeutral = Math.abs(percentDifference) < 5;
  
  let variantStyles;
  let trendIcon;
  
  if (isNeutral) {
    variantStyles = 'from-blue-50/80 to-indigo-50/80 border-blue-200/50';
    trendIcon = '➡️';
  } else if (isPositive) {
    variantStyles = 'from-green-50/80 to-emerald-50/80 border-green-200/50';
    trendIcon = '📈';
  } else {
    variantStyles = 'from-amber-50/80 to-orange-50/80 border-amber-200/50';
    trendIcon = '📉';
  }

  // Format difference with +/- sign
  const formattedDifference = difference > 0 
    ? `+${formatDuration(Math.abs(difference))}`
    : `-${formatDuration(Math.abs(difference))}`;

  const formattedPercent = percentDifference > 0
    ? `+${Math.abs(Math.round(percentDifference))}%`
    : `-${Math.abs(Math.round(percentDifference))}%`;

  return (
    <div 
      className={`
        bg-gradient-to-br ${variantStyles}
        backdrop-blur-sm rounded-xl p-5 border shadow-soft
        transition-all duration-200 hover:scale-[1.02]
        ${className}
      `.trim()}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {period}
        </h3>
        <span className="text-2xl" role="img" aria-hidden="true">
          {trendIcon}
        </span>
      </div>

      <div className="space-y-2">
        {/* Average */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Average:</span>
          <span className="text-base font-medium text-gray-900">
            {formatDuration(average)}
          </span>
        </div>

        {/* Current */}
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">This fast:</span>
          <span className="text-base font-bold text-gray-900">
            {formatDuration(current)}
          </span>
        </div>

        {/* Difference */}
        <div className="pt-2 border-t border-gray-200/50">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-700 font-medium">Difference:</span>
            <div className="text-right">
              <span className={`text-lg font-bold ${
                isPositive ? 'text-green-700' : difference < 0 ? 'text-amber-700' : 'text-blue-700'
              }`}>
                {formattedDifference}
              </span>
              <span className={`text-sm ml-2 ${
                isPositive ? 'text-green-600' : difference < 0 ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {formattedPercent}
              </span>
            </div>
          </div>
        </div>

        {/* Entry count */}
        <div className="pt-2 text-xs text-gray-500">
          Based on {count} {count === 1 ? 'entry' : 'entries'}
        </div>
      </div>
    </div>
  );
}
