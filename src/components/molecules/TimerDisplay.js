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
    <div className="flex flex-col items-center gap-4">
      {/* ARIA live region for timer updates (polite = non-disruptive) */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        Fasting duration: {readableTime}
      </div>

      {/* Timer Display */}
      <time 
        dateTime={datetimeValue}
        role="timer"
        aria-label={`Fasting duration: ${readableTime}`}
        className="flex flex-wrap items-center justify-center gap-3 text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
      >
        {days > 0 && (
          <>
            <div className="flex items-baseline gap-2">
              <span className="tabular-nums">{days}</span>
              <span className="text-xl md:text-2xl font-medium text-gray-500">
                {pluralize(days, 'day')}
              </span>
            </div>
          </>
        )}
        <div className="flex items-baseline gap-2">
          <span className="tabular-nums">{hours}</span>
          <span className="text-xl md:text-2xl font-medium text-gray-500">
            {pluralize(hours, 'hour')}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="tabular-nums">{minutes}</span>
          <span className="text-xl md:text-2xl font-medium text-gray-500">
            {pluralize(minutes, 'minute')}
          </span>
        </div>
      </time>

      {/* Milestone Badge */}
      {milestone && (
        <span 
          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
          role="status"
          aria-label={`Milestone achieved: ${milestone}`}
        >
          <span aria-hidden="true" className="text-base mr-2">🎉</span>
          {milestone}
        </span>
      )}
    </div>
  );
}
