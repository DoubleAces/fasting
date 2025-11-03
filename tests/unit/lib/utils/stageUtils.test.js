/**
 * Unit tests for calculateTimelineState function
 * Tests stage boundary detection, progress calculation, and edge cases
 */

import { calculateTimelineState } from '@/lib/utils/stageUtils';
import {
  testElapsedTimes,
  expectedStageIndices,
  expectedProgressWithinStage,
  mockStages,
} from '../../../fixtures/fastingStagesFixtures';

describe('calculateTimelineState', () => {
  describe('Fed State calculation (0-4hr)', () => {
    test('should return stage 0 for 2-hour fast', () => {
      const result = calculateTimelineState(testElapsedTimes.fedState, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.fedState);
      expect(result.currentStage.title).toBe('Fed State');
      expect(result.elapsedHours).toBe(2);
    });

    test('should return stage 0 for sub-1-hour fast', () => {
      const result = calculateTimelineState(testElapsedTimes.sub1Hour, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.sub1Hour);
      expect(result.elapsedHours).toBe(0.5);
    });
  });

  describe('Progress within stage', () => {
    test('should calculate 50% progress for 2-hour fast in 4-hour stage', () => {
      const result = calculateTimelineState(testElapsedTimes.fedState, mockStages);
      
      expect(result.progressWithinStage).toBeCloseTo(expectedProgressWithinStage.fedState, 2);
      expect(result.hoursIntoStage).toBe(2);
    });

    test('should calculate 50% progress for 14-hour fast in Early Ketosis stage', () => {
      const result = calculateTimelineState(testElapsedTimes.earlyKetosis, mockStages);
      
      expect(result.progressWithinStage).toBeCloseTo(expectedProgressWithinStage.earlyKetosis, 2);
      expect(result.hoursIntoStage).toBe(2); // 14hr - 12hr start = 2hr into stage
    });

    test('should return null progress for unbounded Extended Fasting stage (72+hr)', () => {
      const result = calculateTimelineState(testElapsedTimes.extendedFasting, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.extendedFasting);
      expect(result.progressWithinStage).toBeNull();
      expect(result.hoursIntoStage).toBe(8); // 80hr - 72hr start = 8hr into unbounded stage
    });
  });

  describe('Exact boundary transitions', () => {
    test('should enter next stage at exactly 4 hours (boundary)', () => {
      const result = calculateTimelineState(testElapsedTimes.exactBoundary4hr, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.exactBoundary4hr);
      expect(result.currentStage.title).toBe('Early Fasting');
      expect(result.progressWithinStage).toBe(0); // 0% into new stage
      expect(result.hoursIntoStage).toBe(0);
    });

    test('should enter Early Ketosis at exactly 12 hours', () => {
      const result = calculateTimelineState(testElapsedTimes.exactBoundary12hr, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.exactBoundary12hr);
      expect(result.currentStage.title).toBe('Early Ketosis');
      expect(result.progressWithinStage).toBe(0);
    });

    test('should enter Autophagy Activation at exactly 24 hours', () => {
      const result = calculateTimelineState(testElapsedTimes.exactBoundary24hr, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.exactBoundary24hr);
      expect(result.currentStage.title).toBe('Autophagy Activation');
      expect(result.progressWithinStage).toBe(0);
    });

    test('should enter Extended Fasting at exactly 72 hours', () => {
      const result = calculateTimelineState(testElapsedTimes.exactBoundary72hr, mockStages);
      
      expect(result.currentStageIndex).toBe(expectedStageIndices.extendedFasting);
      expect(result.currentStage.title).toBe('Extended Fasting');
    });
  });

  describe('All 8 stage boundaries', () => {
    test('should correctly identify all 8 stages', () => {
      const testCases = [
        { elapsed: testElapsedTimes.fedState, expected: 0, title: 'Fed State' },
        { elapsed: testElapsedTimes.earlyFasting, expected: 1, title: 'Early Fasting' },
        { elapsed: testElapsedTimes.glycogenDepletion, expected: 2, title: 'Glycogen Depletion' },
        { elapsed: testElapsedTimes.earlyKetosis, expected: 3, title: 'Early Ketosis' },
        { elapsed: testElapsedTimes.fullKetosis, expected: 4, title: 'Full Ketosis' },
        { elapsed: testElapsedTimes.autophagyActivation, expected: 5, title: 'Autophagy Activation' },
        { elapsed: testElapsedTimes.deepAutophagy, expected: 6, title: 'Deep Autophagy' },
        { elapsed: testElapsedTimes.extendedFasting, expected: 7, title: 'Extended Fasting' },
      ];

      testCases.forEach(({ elapsed, expected, title }) => {
        const result = calculateTimelineState(elapsed, mockStages);
        expect(result.currentStageIndex).toBe(expected);
        expect(result.currentStage.title).toBe(title);
      });
    });
  });

  describe('72+ hour handling', () => {
    test('should handle 80-hour fast (Extended Fasting stage)', () => {
      const result = calculateTimelineState(testElapsedTimes.extendedFasting, mockStages);
      
      expect(result.currentStageIndex).toBe(7);
      expect(result.elapsedHours).toBe(80);
      expect(result.progressWithinStage).toBeNull(); // Unbounded stage
    });

    test('should handle 100-hour fast (still Extended Fasting)', () => {
      const result = calculateTimelineState(100 * 60 * 60 * 1000, mockStages);
      
      expect(result.currentStageIndex).toBe(7);
      expect(result.currentStage.title).toBe('Extended Fasting');
      expect(result.hoursIntoStage).toBe(28); // 100 - 72 = 28 hours into unbounded stage
    });
  });

  describe('Invalid input handling', () => {
    test('should return null for null elapsedMs', () => {
      const result = calculateTimelineState(null, mockStages);
      
      expect(result).toBeNull();
    });

    test('should return null for undefined elapsedMs', () => {
      const result = calculateTimelineState(undefined, mockStages);
      
      expect(result).toBeNull();
    });

    test('should return null for negative elapsedMs', () => {
      const result = calculateTimelineState(-1000, mockStages);
      
      expect(result).toBeNull();
    });

    test('should return null for empty stages array', () => {
      const result = calculateTimelineState(testElapsedTimes.fedState, []);
      
      expect(result).toBeNull();
    });
  });

  describe('stagesCompleted and stagesUpcoming population', () => {
    test('should populate stagesCompleted for 14-hour fast (stages 0-2 complete)', () => {
      const result = calculateTimelineState(testElapsedTimes.earlyKetosis, mockStages);
      
      expect(result.stagesCompleted).toHaveLength(3);
      expect(result.stagesCompleted.map(s => s.id)).toEqual([0, 1, 2]);
    });

    test('should populate stagesUpcoming for 14-hour fast (stages 4-7 upcoming)', () => {
      const result = calculateTimelineState(testElapsedTimes.earlyKetosis, mockStages);
      
      expect(result.stagesUpcoming).toHaveLength(4);
      expect(result.stagesUpcoming.map(s => s.id)).toEqual([4, 5, 6, 7]);
    });

    test('should have empty stagesCompleted for Fed State', () => {
      const result = calculateTimelineState(testElapsedTimes.sub1Hour, mockStages);
      
      expect(result.stagesCompleted).toHaveLength(0);
    });

    test('should have all stages completed for Extended Fasting stage', () => {
      const result = calculateTimelineState(testElapsedTimes.extendedFasting, mockStages);
      
      expect(result.stagesCompleted).toHaveLength(7);
      expect(result.stagesUpcoming).toHaveLength(0);
    });
  });
});
