/**
 * useStageCalculation Hook
 * 
 * Calculates biological fasting stage and progress from elapsed milliseconds.
 * Memoized to prevent unnecessary recalculations and optimize performance.
 * 
 * @see specs/026-biological-fasting-stages/plan.md for architecture
 */

'use client';

import { useMemo } from 'react';
import { calculateTimelineState } from '@/lib/utils/stageUtils';
import { FASTING_STAGES } from '@/lib/constants/fastingStages';

/**
 * Calculate current fasting stage and timeline state
 * 
 * Takes elapsed milliseconds and returns the complete timeline state including
 * current stage, progress percentage, completed/upcoming stages. Returns null
 * when no active fast exists (elapsedMs is null/undefined/invalid).
 * 
 * Uses useMemo to prevent recalculation unless elapsedMs changes, optimizing
 * performance for the 60-second timer update interval.
 * 
 * @param {number|null|undefined} elapsedMs - Milliseconds since fast started
 * @returns {TimelineState|null} - Timeline state or null if no active fast
 * 
 * @example
 * // In a component
 * const { elapsedMs } = useFastingTimer();
 * const timelineState = useStageCalculation(elapsedMs);
 * 
 * if (timelineState) {
 *   console.log(`Stage: ${timelineState.currentStage.title}`);
 *   console.log(`Progress: ${(timelineState.progressWithinStage * 100).toFixed(0)}%`);
 * }
 */
export function useStageCalculation(elapsedMs) {
  return useMemo(() => {
    return calculateTimelineState(elapsedMs, FASTING_STAGES);
  }, [elapsedMs]);
}
