/**
 * StageProgressBar Atom Component
 * 
 * Visual progress indicator showing completion percentage within current fasting stage.
 * Displays gradient progress bar with ARIA attributes for accessibility.
 * 
 * @see specs/026-biological-fasting-stages/spec.md FR-005
 */

'use client';

import React from 'react';

/**
 * Progress bar component for fasting stage progress
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress value from 0 to 1 (e.g., 0.5 = 50%)
 * @returns {JSX.Element|null} - Progress bar element
 */
export default function StageProgressBar({ progress }) {
  if (progress === null || progress === undefined) {
    return null;
  }

  const progressPercent = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
    >
      <div
        data-testid="progress-fill"
        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
