/**
 * Biological Fasting Stages Configuration
 * 
 * Defines the 10 stages of biological fasting from 0 to 5+ days with
 * detailed hormonal and metabolic descriptions. Each stage represents
 * a distinct physiological state with specific metabolic markers.
 * 
 * @see specs/026-biological-fasting-stages/research.md for sources
 * @see specs/026-biological-fasting-stages/spec.md FR-003, FR-004
 */

/**
 * @typedef {Object} FastingStage
 * @property {number} id - Unique stage identifier (0-9)
 * @property {number} hourRangeStart - Start hour (inclusive)
 * @property {number|null} hourRangeEnd - End hour (exclusive), null for unbounded
 * @property {string} title - Stage name
 * @property {string} description - Brief stage description
 * @property {string[]} biologicalProcesses - Key metabolic processes
 * @property {string[]} scientificSources - Peer-reviewed research citations
 */

/**
 * 10 biological fasting stages with hour ranges and scientific backing
 * @type {FastingStage[]}
 */
export const FASTING_STAGES = [
  {
    id: 0,
    hourRangeStart: 0,
    hourRangeEnd: 4,
    title: 'Post-Meal Spike',
    description: 'Insulin is at its highest, processing and directing glucose into storage',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 1,
    hourRangeStart: 4,
    hourRangeEnd: 8,
    title: 'Insulin Shift',
    description: 'Insulin levels begin their descent, closing the door on bulk energy storage',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 2,
    hourRangeStart: 8,
    hourRangeEnd: 12,
    title: 'Glycogen Utilization',
    description: 'Liver glycogen becomes the primary fuel source to maintain stable blood glucose',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 3,
    hourRangeStart: 12,
    hourRangeEnd: 18,
    title: 'Fatty Acid Release',
    description: 'Fat breakdown accelerates (lipolysis) to release fatty acids for energy',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 4,
    hourRangeStart: 18,
    hourRangeEnd: 24,
    title: 'Adrenaline Boost',
    description: 'Norepinephrine (Adrenaline) levels rise to maintain alertness and metabolic rate',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 5,
    hourRangeStart: 24,
    hourRangeEnd: 36,
    title: 'Gluconeogenesis Peak',
    description: 'Glucose creation from fat (glycerol) and protein becomes the main source of glucose',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 6,
    hourRangeStart: 36,
    hourRangeEnd: 48,
    title: 'Early HGH Surge',
    description: 'Growth Hormone (HGH) levels ramp up, initiating the anti-catabolic defense',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 7,
    hourRangeStart: 48,
    hourRangeEnd: 72,
    title: 'Ketosis and HGH Peak',
    description: 'Ketone production is established, and HGH surges dramatically (up to 500% increase)',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 8,
    hourRangeStart: 72,
    hourRangeEnd: 120,
    title: 'Autophagy Activation',
    description: 'Cellular cleanup (autophagy) reaches full activity for maximized systemic repair',
    biologicalProcesses: [],
    scientificSources: [],
  },
  {
    id: 9,
    hourRangeStart: 120,
    hourRangeEnd: null,
    title: 'Protein Conservation',
    description: 'The body enters the maximal protein-sparing state, conserving lean mass',
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
