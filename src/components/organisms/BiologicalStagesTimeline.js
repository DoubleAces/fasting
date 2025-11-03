/**
 * BiologicalStagesTimeline Organism Component
 * 
 * Main timeline component displaying all 8 biological fasting stages.
 * Auto-scrolls to current stage on mount, highlights active stage,
 * and shows progress within current stage.
 * 
 * @see specs/026-biological-fasting-stages/spec.md US1, FR-001 through FR-007
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStageCalculation } from '@/hooks/useStageCalculation';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';
import StageCard from '@/components/molecules/StageCard';

/**
 * Biological fasting stages timeline component
 * 
 * @param {Object} props
 * @param {number|null} props.elapsedMs - Milliseconds since fast started
 * @returns {JSX.Element|null} - Timeline element or null if no active fast
 */
export default function BiologicalStagesTimeline({ elapsedMs }) {
  const timelineState = useStageCalculation(elapsedMs);
  const currentStageRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if stages configuration is missing or invalid
  if (!FASTING_STAGES || FASTING_STAGES.length === 0) {
    console.error('BiologicalStagesTimeline: FASTING_STAGES configuration is missing or empty');
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Unable to load fasting stages.</p>
        <p className="text-red-600 text-sm mt-1">Please refresh the page. If the problem persists, contact support.</p>
      </div>
    );
  }

  // Auto-scroll to current stage on mount (once only) - only when expanded
  useEffect(() => {
    if (currentStageRef.current && !hasScrolled && timelineState && isExpanded) {
      // Check prefers-reduced-motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      currentStageRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      
      setHasScrolled(true);
    }
  }, [timelineState, hasScrolled, isExpanded]);

  // Return null if no active fast
  if (!timelineState) {
    return null;
  }

  // Get stages to display based on expanded state
  const stagesToDisplay = isExpanded 
    ? FASTING_STAGES 
    : [FASTING_STAGES[timelineState.currentStageIndex]];

  return (
    <nav
      data-testid="biological-stages-timeline"
      className="w-full"
      aria-label="Fasting stages timeline"
    >
      {/* Timeline Header with Expand/Collapse Button */}
      <div className="flex items-center justify-between mb-3">
        <h2 id="timeline-heading" className="text-lg font-semibold text-gray-800">
          Your body&apos;s biological stages
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors cursor-pointer"
          aria-expanded={isExpanded}
          aria-controls="stages-list"
        >
          {isExpanded ? '− Show less' : '+ View all stages'}
        </button>
      </div>

      {/* Semantic Ordered List for Timeline */}
      <ol 
        id="stages-list"
        className="space-y-1"
        aria-labelledby="timeline-heading"
        role="list"
      >
        {stagesToDisplay.map((stage) => {
          const isCurrent = stage.id === timelineState.currentStageIndex;
          const isCompleted = stage.id < timelineState.currentStageIndex;
          
          return (
            <li
              key={stage.id}
              ref={isCurrent ? currentStageRef : null}
            >
              <StageCard
                stage={stage}
                isCurrent={isCurrent}
                isCompleted={isCompleted}
                progress={isCurrent ? timelineState.progressWithinStage : null}
                hoursIntoStage={isCurrent ? timelineState.hoursIntoStage : null}
              />
            </li>
          );
        })}
      </ol>

      {/* Stage Counter when collapsed */}
      {!isExpanded && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Stage {timelineState.currentStageIndex + 1} of {FASTING_STAGES.length}
        </div>
      )}
    </nav>
  );
}
