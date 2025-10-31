'use client';

import React from 'react';
import Link from 'next/link';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';
import { format } from 'date-fns';

/**
 * RecentEntryItem Component
 * 
 * Displays a single fasting entry in the recent history list.
 * Shows date, duration, goalStatus icon, and optional "Extended Fast" badge.
 * Clickable to navigate to entry details.
 * 
 * @param {Object} entry - Entry object from database
 * @param {string} entry._id - Entry ID for navigation
 * @param {Date|string} entry.date - Entry date
 * @param {number|null} entry.fastingDuration - Fasting duration in minutes
 * @param {string} entry.goalStatus - 'completed' or 'not-completed'
 * @param {string} [className] - Additional CSS classes
 */
const RecentEntryItem = ({ entry, className = '' }) => {
  if (!entry) return null;

  const { _id, date, fastingDuration, goalStatus } = entry;

  // Format date
  const formattedDate = format(new Date(date), 'MMM d, yyyy');

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) {
      return 'No duration';
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

  // Check if extended fast (>24 hours = >1440 minutes)
  const isExtendedFast = fastingDuration && fastingDuration > 1440;

  // Only show goal status if there was actually a goal
  const hasGoal = goalStatus && goalStatus !== 'no-goal';
  const goalStatusIcon = hasGoal ? (goalStatus === 'completed' ? '✅' : '❌') : null;
  const goalStatusColor = hasGoal ? (goalStatus === 'completed' ? 'text-green-600' : 'text-red-600') : '';
  const goalStatusLabel = hasGoal ? (goalStatus === 'completed' ? 'Goal completed' : 'Goal not completed') : '';

  // Create descriptive aria-label
  const ariaLabel = `View fasting entry from ${formattedDate}. Duration: ${formatDuration(fastingDuration)}${goalStatusLabel ? `. ${goalStatusLabel}` : ''}${isExtendedFast ? '. Extended fast' : ''}`;

  return (
    <Link 
      href={`/entries/${_id}`} 
      className={`block ${className}`}
      aria-label={ariaLabel}
    >
      <GlassmorphicCard 
        className="p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Date, Duration, and Meal Times */}
          <div className="flex-1 min-w-0">
            {/* Date and Extended Fast Badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">{formattedDate}</span>
              {isExtendedFast && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                  Extended Fast
                </span>
              )}
            </div>
            
            {/* Duration */}
            <div className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {formatDuration(fastingDuration)}
            </div>
            
            {/* Meal Times and Additional Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              {/* Always show meal times */}
              {entry.lastMealTime && (
                <span className="flex items-center gap-1">
                  <span>🍽️</span>
                  <span>{entry.lastMealTime} → {entry.firstMealTime || 'ongoing'}</span>
                </span>
              )}
              
              {/* Show metrics if available */}
              {entry.energyLevel && (
                <span className="flex items-center gap-1">
                  <span>⚡</span>
                  <span>{entry.energyLevel}</span>
                </span>
              )}
              {entry.wellBeing && (
                <span className="flex items-center gap-1">
                  <span>😊</span>
                  <span>{entry.wellBeing}</span>
                </span>
              )}
              {entry.morningWeight && (
                <span className="flex items-center gap-1">
                  <span>⚖️</span>
                  <span>{entry.morningWeight}kg</span>
                </span>
              )}
              {entry.hoursOfSleep && (
                <span className="flex items-center gap-1">
                  <span>😴</span>
                  <span>{entry.hoursOfSleep}h</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Goal Status Icon (only if goal was set) */}
          {goalStatusIcon && (
            <div className={`text-2xl flex-shrink-0 ${goalStatusColor}`} aria-hidden="true" title={goalStatusLabel}>
              {goalStatusIcon}
            </div>
          )}
        </div>
      </GlassmorphicCard>
    </Link>
  );
};

export default RecentEntryItem;
