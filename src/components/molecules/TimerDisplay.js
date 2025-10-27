/**
 * TimerDisplay Component
 * Displays formatted fasting time with optional milestone badge
 */

import React from 'react';

/**
 * Displays fasting timer with semantic time element
 * @param {Object} formattedTime - Time object with days, hours, minutes
 * @param {string} milestone - Optional milestone name to display
 */
export default function TimerDisplay({ formattedTime, milestone }) {
  if (!formattedTime) return null;

  const { days, hours, minutes } = formattedTime;

  // Format ISO 8601 duration for datetime attribute
  // Format: P[n]DT[n]H[n]M (e.g., P1DT2H15M for 1 day, 2 hours, 15 minutes)
  const datetimeValue = `P${days > 0 ? `${days}D` : ''}T${hours}H${minutes}M`;

  // Helper for singular/plural
  const pluralize = (count, singular, plural = `${singular}s`) => 
    count === 1 ? singular : plural;

  // Create readable text for screen readers
  const readableTime = `${days > 0 ? `${days} ${pluralize(days, 'day')}, ` : ''}${hours} ${pluralize(hours, 'hour')}, ${minutes} ${pluralize(minutes, 'minute')}`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* ARIA live region for timer updates (polite = non-disruptive) */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        Fasting duration: {readableTime}
      </div>

      <time 
        dateTime={datetimeValue}
        role="timer"
        aria-label={`Fasting duration: ${readableTime}`}
        className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-gray-100"
      >
        {days > 0 && (
          <>
            <span className="tabular-nums">{days}</span>
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
              {pluralize(days, 'day')}
            </span>
          </>
        )}
        <span className="tabular-nums">{hours}</span>
        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
          {pluralize(hours, 'hour')}
        </span>
        <span className="tabular-nums">{minutes}</span>
        <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
          {pluralize(minutes, 'minute')}
        </span>
      </time>

      {milestone && (
        <span 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
          role="status"
          aria-label={`Milestone achieved: ${milestone}`}
        >
          <span aria-hidden="true">🎉 </span>
          {milestone}
        </span>
      )}
    </div>
  );
}
