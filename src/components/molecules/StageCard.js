/**
 * StageCard Molecule Component
 * 
 * Displays a single fasting stage with title, hour range, description,
 * biological processes, and optional progress bar for current stage.
 * 
 * @see specs/026-biological-fasting-stages/spec.md FR-001, FR-002, FR-005
 */

'use client';

import React from 'react';
import StageProgressBar from '@/components/atoms/StageProgressBar';

/**
 * Stage card component displaying biological fasting stage information
 * 
 * @param {Object} props
 * @param {Object} props.stage - The fasting stage object
 * @param {boolean} props.isCurrent - Whether this is the current active stage
 * @param {number|null} props.progress - Progress within stage (0-1), null if not current
 * @param {number|null} props.hoursIntoStage - Hours progressed into current stage
 * @returns {JSX.Element} - Stage card element
 */
export default function StageCard({ stage, isCurrent, progress, hoursIntoStage }) {
  const hourRangeText = stage.hourRangeEnd === null 
    ? `${stage.hourRangeStart}+ Hours`
    : `${stage.hourRangeStart}-${stage.hourRangeEnd} Hours`;

  // Calculate progress percentage for display
  const progressPercentage = progress !== null ? Math.round(progress * 100) : null;

  return (
    <article
      data-testid={`stage-card-${stage.id}`}
      className={`
        relative px-3 py-2
        ${isCurrent 
          ? 'bg-purple-500/5 border-l-4 border-purple-500' 
          : 'border-l-4 border-transparent'
        }
        transition-all duration-200
      `}
    >
      {/* Single line: hour range + description + progress */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hour range and description in one line */}
        <div className="flex-1 flex items-baseline gap-2">
          <span className={`text-sm font-semibold whitespace-nowrap ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
            {hourRangeText}:
          </span>
          <span className={`text-sm ${isCurrent ? 'text-gray-800' : 'text-gray-600'}`}>
            {stage.description}
          </span>
        </div>

        {/* Right: Progress indicator for current stage only */}
        {isCurrent && progressPercentage !== null && (
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-purple-600">
              {progressPercentage}%
            </div>
            <div className="text-xs text-gray-700">
              {hoursIntoStage?.toFixed(1)}h
            </div>
          </div>
        )}
      </div>

      {/* Slim progress bar for current stage */}
      {isCurrent && progress !== null && (
        <div className="mt-2">
          <StageProgressBar progress={progress} />
        </div>
      )}
    </article>
  );
}
