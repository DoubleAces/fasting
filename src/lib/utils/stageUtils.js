/**
 * Stage calculation utilities for biological fasting timeline
 * 
 * Handles stage boundary detection, progress calculation, and timeline state management.
 * All calculations are client-side with no database dependencies.
 * 
 * @see specs/026-biological-fasting-stages/data-model.md for TimelineState entity
 */

/**
 * @typedef {import('@/lib/constants/fastingStages').FastingStage} FastingStage
 */

/**
 * @typedef {Object} TimelineState
 * @property {number} currentStageIndex - Index of current stage (0-7)
 * @property {number} elapsedHours - Total hours into fast
 * @property {number|null} progressWithinStage - Progress % (0-1), null if unbounded
 * @property {number} hoursIntoStage - Hours progressed into current stage
 * @property {FastingStage[]} stagesCompleted - Stages fully completed
 * @property {FastingStage[]} stagesUpcoming - Stages not yet reached
 * @property {FastingStage} currentStage - The active stage object
 */

/**
 * Calculate timeline state from elapsed milliseconds
 * 
 * Determines current fasting stage, progress within that stage, and which stages
 * have been completed vs upcoming. Handles all boundary conditions including
 * exact hour boundaries and the unbounded 72+hr stage.
 * 
 * @param {number|null|undefined} elapsedMs - Milliseconds since fast started
 * @param {FastingStage[]} stages - Array of fasting stages
 * @returns {TimelineState|null} - Timeline state or null if invalid input
 * 
 * @example
 * // 14-hour fast (Early Ketosis stage)
 * const state = calculateTimelineState(14 * 60 * 60 * 1000, FASTING_STAGES);
 * // => { currentStageIndex: 3, progressWithinStage: 0.5, ... }
 */
export function calculateTimelineState(elapsedMs, stages) {
  // Validate inputs
  if (!elapsedMs || typeof elapsedMs !== 'number' || elapsedMs < 0) {
    return null;
  }
  
  if (!Array.isArray(stages) || stages.length === 0) {
    return null;
  }

  // Convert milliseconds to hours
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Find current stage index
  let currentStageIndex = 0;
  
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    
    // For unbounded last stage (72+hr)
    if (stage.hourRangeEnd === null) {
      if (elapsedHours >= stage.hourRangeStart) {
        currentStageIndex = i;
      }
      break;
    }
    
    // For bounded stages, check if elapsed is within range
    // Note: At exact boundary (e.g., 12.0hr), user enters next stage
    if (elapsedHours >= stage.hourRangeStart && elapsedHours < stage.hourRangeEnd) {
      currentStageIndex = i;
      break;
    }
  }

  const currentStage = stages[currentStageIndex];

  // Calculate hours into current stage
  const hoursIntoStage = elapsedHours - currentStage.hourRangeStart;

  // Calculate progress within stage (null for unbounded stage)
  let progressWithinStage = null;
  
  if (currentStage.hourRangeEnd !== null) {
    const stageDurationHours = currentStage.hourRangeEnd - currentStage.hourRangeStart;
    progressWithinStage = hoursIntoStage / stageDurationHours;
    
    // Clamp to [0, 1] to handle floating point edge cases
    progressWithinStage = Math.max(0, Math.min(1, progressWithinStage));
  }

  // Populate completed stages (all stages before current)
  const stagesCompleted = stages.slice(0, currentStageIndex);

  // Populate upcoming stages (all stages after current)
  const stagesUpcoming = stages.slice(currentStageIndex + 1);

  return {
    currentStageIndex,
    elapsedHours,
    progressWithinStage,
    hoursIntoStage,
    stagesCompleted,
    stagesUpcoming,
    currentStage,
  };
}

/**
 * Format hours into human-readable duration
 * @param {number} hours - Number of hours
 * @returns {string} - Formatted string (e.g., "2 hours", "30 minutes")
 */
export function formatHoursDuration(hours) {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const wholeHours = Math.floor(hours);
  return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
}

/**
 * Get stage title for display
 * @param {FastingStage} stage - The stage object
 * @returns {string} - Stage title with hour range (e.g., "Early Ketosis (12-16 Hours)")
 */
export function getStageDisplayTitle(stage) {
  if (!stage) return '';
  
  if (stage.hourRangeEnd === null) {
    return `${stage.title} (${stage.hourRangeStart}+ Hours)`;
  }
  
  return `${stage.title} (${stage.hourRangeStart}-${stage.hourRangeEnd} Hours)`;
}
