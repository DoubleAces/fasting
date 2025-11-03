/**
 * Shared test fixtures for biological fasting stages timeline
 * Used across unit, component, and E2E tests
 */

// Test elapsed times in milliseconds for different stages
export const testElapsedTimes = {
  // Stage 0: Fed State (0-4hr)
  fedState: 2 * 60 * 60 * 1000, // 2 hours
  
  // Stage 1: Early Fasting (4-8hr)
  earlyFasting: 6 * 60 * 60 * 1000, // 6 hours
  
  // Stage 2: Glycogen Depletion (8-12hr)
  glycogenDepletion: 10 * 60 * 60 * 1000, // 10 hours
  
  // Stage 3: Early Ketosis (12-16hr)
  earlyKetosis: 14 * 60 * 60 * 1000, // 14 hours
  
  // Stage 4: Full Ketosis (16-24hr)
  fullKetosis: 20 * 60 * 60 * 1000, // 20 hours
  
  // Stage 5: Autophagy Activation (24-48hr)
  autophagyActivation: 30 * 60 * 60 * 1000, // 30 hours
  
  // Stage 6: Deep Autophagy (48-72hr)
  deepAutophagy: 60 * 60 * 60 * 1000, // 60 hours
  
  // Stage 7: Extended Fasting (72+hr)
  extendedFasting: 80 * 60 * 60 * 1000, // 80 hours
  
  // Edge cases
  sub1Hour: 30 * 60 * 1000, // 30 minutes (Fed State)
  exactBoundary4hr: 4 * 60 * 60 * 1000, // Exactly 4 hours (boundary)
  exactBoundary12hr: 12 * 60 * 60 * 1000, // Exactly 12 hours (boundary)
  exactBoundary24hr: 24 * 60 * 60 * 1000, // Exactly 24 hours (boundary)
  exactBoundary72hr: 72 * 60 * 60 * 1000, // Exactly 72 hours (boundary)
};

// Expected stage indices for test elapsed times
export const expectedStageIndices = {
  fedState: 0,
  earlyFasting: 1,
  glycogenDepletion: 2,
  earlyKetosis: 3,
  fullKetosis: 4,
  autophagyActivation: 5,
  deepAutophagy: 6,
  extendedFasting: 7,
  sub1Hour: 0,
  exactBoundary4hr: 1, // At boundary, user enters next stage
  exactBoundary12hr: 3,
  exactBoundary24hr: 5,
  exactBoundary72hr: 7,
};

// Expected progress percentages within stage (0-1)
export const expectedProgressWithinStage = {
  fedState: 0.5, // 2hr into 4hr stage = 50%
  earlyFasting: 0.5, // 6hr = 2hr into 4-8hr stage = 50%
  glycogenDepletion: 0.5, // 10hr = 2hr into 8-12hr stage = 50%
  earlyKetosis: 0.5, // 14hr = 2hr into 12-16hr stage = 50%
  fullKetosis: 0.5, // 20hr = 4hr into 16-24hr stage = 50%
  autophagyActivation: 0.25, // 30hr = 6hr into 24-48hr stage = 25%
  deepAutophagy: 0.5, // 60hr = 12hr into 48-72hr stage = 50%
  extendedFasting: null, // Extended stage is unbounded (72+hr)
  sub1Hour: 0.125, // 0.5hr into 4hr stage = 12.5%
  exactBoundary4hr: 0, // Exactly at boundary = 0% into next stage
  exactBoundary12hr: 0,
  exactBoundary24hr: 0,
  exactBoundary72hr: 0,
};

// Mock stage data for testing (mirrors production config structure)
export const mockStages = [
  {
    id: 0,
    hourRangeStart: 0,
    hourRangeEnd: 4,
    title: 'Fed State',
    description: 'Body processes nutrients from last meal',
    biologicalProcesses: ['Insulin elevated', 'Glucose primary fuel'],
    scientificSources: ['Berg - Biochemistry', 'Cahill 2006'],
  },
  {
    id: 1,
    hourRangeStart: 4,
    hourRangeEnd: 8,
    title: 'Early Fasting',
    description: 'Glycogen stores begin depleting',
    biologicalProcesses: ['Insulin drops', 'Glycogen breakdown starts'],
    scientificSources: ['Kerndt 1982'],
  },
  {
    id: 2,
    hourRangeStart: 8,
    hourRangeEnd: 12,
    title: 'Glycogen Depletion',
    description: 'Body transitions from glucose to fat',
    biologicalProcesses: ['Liver glycogen depleting', 'Fat oxidation increases'],
    scientificSources: ['Rothman 1995'],
  },
  {
    id: 3,
    hourRangeStart: 12,
    hourRangeEnd: 16,
    title: 'Early Ketosis',
    description: 'Ketone production begins',
    biologicalProcesses: ['Ketone bodies produced', 'Fat becomes primary fuel'],
    scientificSources: ['Cahill 2006', 'Veech 2004'],
  },
  {
    id: 4,
    hourRangeStart: 16,
    hourRangeEnd: 24,
    title: 'Full Ketosis',
    description: 'Peak fat burning and ketone production',
    biologicalProcesses: ['High ketone levels', 'Maximal fat oxidation'],
    scientificSources: ['Owen 1967', 'Veech 2004'],
  },
  {
    id: 5,
    hourRangeStart: 24,
    hourRangeEnd: 48,
    title: 'Autophagy Activation',
    description: 'Cellular cleanup and recycling begins',
    biologicalProcesses: ['Autophagy upregulated', 'Cellular repair processes'],
    scientificSources: ['Alirezaei 2010', 'Nobel Prize 2016'],
  },
  {
    id: 6,
    hourRangeStart: 48,
    hourRangeEnd: 72,
    title: 'Deep Autophagy',
    description: 'Enhanced cellular regeneration',
    biologicalProcesses: ['Peak autophagy', 'Stem cell regeneration'],
    scientificSources: ['Longo & Mattson 2014', 'Cheng 2014'],
  },
  {
    id: 7,
    hourRangeStart: 72,
    hourRangeEnd: null,
    title: 'Extended Fasting',
    description: 'Prolonged metabolic benefits',
    biologicalProcesses: ['Immune system reset', 'Deep cellular repair'],
    scientificSources: ['Cheng 2014', 'Longo lab studies'],
  },
];

// Test user scenarios from spec.md
export const testScenarios = {
  // US1-AS1: 14-hour fast (Early Ketosis stage)
  us1as1: {
    elapsedMs: testElapsedTimes.earlyKetosis,
    expectedStageIndex: expectedStageIndices.earlyKetosis,
    expectedStageTitle: 'Early Ketosis',
    description: 'User with 14-hour fast sees Early Ketosis stage highlighted',
  },
  
  // US1-AS2: 30-hour fast (Autophagy Activation stage)
  us1as2: {
    elapsedMs: testElapsedTimes.autophagyActivation,
    expectedStageIndex: expectedStageIndices.autophagyActivation,
    expectedStageTitle: 'Autophagy Activation',
    description: 'User with 30-hour fast sees Autophagy Activation stage highlighted',
  },
  
  // US1-AS4: 80-hour fast (Extended Fasting stage)
  us1as4: {
    elapsedMs: testElapsedTimes.extendedFasting,
    expectedStageIndex: expectedStageIndices.extendedFasting,
    expectedStageTitle: 'Extended Fasting',
    description: 'User with 80-hour fast sees Extended Fasting stage highlighted',
  },
  
  // US2-AS2: 14-hour fast showing 50% progress
  us2as2: {
    elapsedMs: testElapsedTimes.earlyKetosis,
    expectedStageIndex: expectedStageIndices.earlyKetosis,
    expectedProgress: expectedProgressWithinStage.earlyKetosis,
    description: 'Progress bar shows ~50% completion in Early Ketosis stage',
  },
  
  // Edge case: Sub-1-hour fast
  subHourFast: {
    elapsedMs: testElapsedTimes.sub1Hour,
    expectedStageIndex: expectedStageIndices.sub1Hour,
    expectedStageTitle: 'Fed State',
    expectedProgress: expectedProgressWithinStage.sub1Hour,
    description: 'Sub-1-hour fast shows Fed State with minimal progress',
  },
};
