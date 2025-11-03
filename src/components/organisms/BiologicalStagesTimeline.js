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

  // Auto-scroll to current stage on mount (once only)
  useEffect(() => {
    if (currentStageRef.current && !hasScrolled && timelineState) {
      // Check prefers-reduced-motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      currentStageRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      
      setHasScrolled(true);
    }
  }, [timelineState, hasScrolled]);

  // Return null if no active fast
  if (!timelineState) {
    return null;
  }

  return (
    <div
      data-testid="biological-stages-timeline"
      className="w-full"
    >
      {/* Timeline Header */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Your Fasting Journey
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Tracking your body's biological stages
        </p>
      </div>

      {/* Compact Timeline List */}
      <div className="space-y-1">
        {FASTING_STAGES.map((stage) => {
          const isCurrent = stage.id === timelineState.currentStageIndex;
          const isCompleted = stage.id < timelineState.currentStageIndex;
          
          return (
            <div
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
