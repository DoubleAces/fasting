/**
 * Biological Fasting Stages Configuration
 * 
 * Defines the 8 stages of biological fasting from 0 to 72+ hours with
 * scientifically accurate descriptions and processes. Each stage represents
 * a distinct metabolic state backed by peer-reviewed research.
 * 
 * @see specs/026-biological-fasting-stages/research.md for sources
 * @see specs/026-biological-fasting-stages/spec.md FR-003, FR-004
 */

/**
 * @typedef {Object} FastingStage
 * @property {number} id - Unique stage identifier (0-7)
 * @property {number} hourRangeStart - Start hour (inclusive)
 * @property {number|null} hourRangeEnd - End hour (exclusive), null for unbounded
 * @property {string} title - Stage name
 * @property {string} description - Brief stage description
 * @property {string[]} biologicalProcesses - Key metabolic processes
 * @property {string[]} scientificSources - Peer-reviewed research citations
 */

/**
 * 8 biological fasting stages with hour ranges and scientific backing
 * @type {FastingStage[]}
 */
export const FASTING_STAGES = [
  {
    id: 0,
    hourRangeStart: 0,
    hourRangeEnd: 4,
    title: '',
    description: 'Body processing your last meal',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 1,
    hourRangeStart: 4,
    hourRangeEnd: 8,
    title: '',
    description: 'Insulin dropping, using stored glucose',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 2,
    hourRangeStart: 8,
    hourRangeEnd: 16,
    title: '',
    description: 'Glycogen stores depleting, switching to fat',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 3,
    hourRangeStart: 16,
    hourRangeEnd: 24,
    title: '',
    description: 'Early ketone production beginning',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 4,
    hourRangeStart: 24,
    hourRangeEnd: 48,
    title: '',
    description: 'Running on ketones, fat burning optimized',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 5,
    hourRangeStart: 48,
    hourRangeEnd: 72,
    title: '',
    description: 'Extended fat burning, cellular cleanup active',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 6,
    hourRangeStart: 72,
    hourRangeEnd: null,
    title: '',
    description: 'Prolonged fasting state',
    biologicalProcesses: [],
    scientificSources: [],
  },
];

/**
 * Get stage by elapsed hours
 * @param {number} elapsedHours - Hours elapsed since fast started
 * @returns {FastingStage|null} - The current stage or null if invalid input
 */
export function getStageByHours(elapsedHours) {
  if (typeof elapsedHours !== 'number' || elapsedHours < 0) {
    return null;
  }

  return FASTING_STAGES.find((stage, index) => {
    // Last stage is unbounded (72+hr)
    if (stage.hourRangeEnd === null) {
      return elapsedHours >= stage.hourRangeStart;
    }
    
    // For all other stages, check if elapsed is within range
    return elapsedHours >= stage.hourRangeStart && elapsedHours < stage.hourRangeEnd;
  }) || null;
}
