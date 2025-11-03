/**
 * Unit tests for useStageCalculation hook
 * Tests hook behavior with memoization and edge cases
 */

import { renderHook } from '@testing-library/react';
import { useStageCalculation } from '@/hooks/useStageCalculation';
import { testElapsedTimes, expectedStageIndices } from '../../fixtures/fastingStagesFixtures';

// Mock the stageUtils module
jest.mock('@/lib/utils/stageUtils', () => ({
  calculateTimelineState: jest.fn((elapsedMs, stages) => {
    if (!elapsedMs || elapsedMs < 0 || !stages || stages.length === 0) {
      return null;
    }
    
    // Mock implementation for testing
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // Simplified mock stage detection
    let currentStageIndex = 0;
    if (elapsedHours >= 72) currentStageIndex = 7;
    else if (elapsedHours >= 48) currentStageIndex = 6;
    else if (elapsedHours >= 24) currentStageIndex = 5;
    else if (elapsedHours >= 16) currentStageIndex = 4;
    else if (elapsedHours >= 12) currentStageIndex = 3;
    else if (elapsedHours >= 8) currentStageIndex = 2;
    else if (elapsedHours >= 4) currentStageIndex = 1;
    
    return {
      currentStageIndex,
      elapsedHours,
      progressWithinStage: 0.5,
      hoursIntoStage: 2,
      stagesCompleted: [],
      stagesUpcoming: [],
      currentStage: stages[currentStageIndex],
    };
  }),
}));

// Import after mock
import { calculateTimelineState } from '@/lib/utils/stageUtils';

describe('useStageCalculation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Null input handling', () => {
    test('should return null for null elapsedMs', () => {
      const { result } = renderHook(() => useStageCalculation(null));
      
      expect(result.current).toBeNull();
      expect(calculateTimelineState).toHaveBeenCalledWith(null, expect.any(Array));
    });

    test('should return null for undefined elapsedMs', () => {
      const { result } = renderHook(() => useStageCalculation(undefined));
      
      expect(result.current).toBeNull();
    });

    test('should return null for negative elapsedMs', () => {
      const { result } = renderHook(() => useStageCalculation(-1000));
      
      expect(result.current).toBeNull();
    });
  });

  describe('Valid calculation', () => {
    test('should calculate timeline state for 14-hour fast', () => {
      const { result } = renderHook(() => 
        useStageCalculation(testElapsedTimes.earlyKetosis)
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current.currentStageIndex).toBe(expectedStageIndices.earlyKetosis);
      expect(calculateTimelineState).toHaveBeenCalledWith(
        testElapsedTimes.earlyKetosis,
        expect.any(Array)
      );
    });

    test('should calculate timeline state for 30-hour fast', () => {
      const { result } = renderHook(() => 
        useStageCalculation(testElapsedTimes.autophagyActivation)
      );
      
      expect(result.current).not.toBeNull();
      expect(result.current.currentStageIndex).toBe(expectedStageIndices.autophagyActivation);
    });
  });

  describe('Memoization preservation', () => {
    test('should return same object reference when elapsedMs unchanged', () => {
      const { result, rerender } = renderHook(
        ({ elapsedMs }) => useStageCalculation(elapsedMs),
        { initialProps: { elapsedMs: testElapsedTimes.earlyKetosis } }
      );
      
      const firstResult = result.current;
      
      // Rerender with same elapsedMs
      rerender({ elapsedMs: testElapsedTimes.earlyKetosis });
      
      expect(result.current).toBe(firstResult); // Same reference due to useMemo
      expect(calculateTimelineState).toHaveBeenCalledTimes(1); // Called once only
    });

    test('should not recalculate when elapsedMs is null multiple times', () => {
      const { result, rerender } = renderHook(
        ({ elapsedMs }) => useStageCalculation(elapsedMs),
        { initialProps: { elapsedMs: null } }
      );
      
      expect(result.current).toBeNull();
      
      rerender({ elapsedMs: null });
      rerender({ elapsedMs: null });
      
      // With useMemo, same dependencies mean no recalculation
      // All three renders with null should produce the same result
      expect(result.current).toBeNull();
    });
  });

  describe('Recalculation on change', () => {
    test('should recalculate when elapsedMs changes', () => {
      const { result, rerender } = renderHook(
        ({ elapsedMs }) => useStageCalculation(elapsedMs),
        { initialProps: { elapsedMs: testElapsedTimes.earlyKetosis } }
      );
      
      const firstResult = result.current;
      expect(firstResult.currentStageIndex).toBe(expectedStageIndices.earlyKetosis);
      
      // Change elapsed time to different stage
      rerender({ elapsedMs: testElapsedTimes.autophagyActivation });
      
      expect(result.current).not.toBe(firstResult); // Different reference
      expect(result.current.currentStageIndex).toBe(expectedStageIndices.autophagyActivation);
      expect(calculateTimelineState).toHaveBeenCalledTimes(2);
    });

    test('should handle transition from null to valid elapsedMs', () => {
      const { result, rerender } = renderHook(
        ({ elapsedMs }) => useStageCalculation(elapsedMs),
        { initialProps: { elapsedMs: null } }
      );
      
      expect(result.current).toBeNull();
      
      // Start a fast
      rerender({ elapsedMs: testElapsedTimes.fedState });
      
      expect(result.current).not.toBeNull();
      expect(result.current.currentStageIndex).toBe(expectedStageIndices.fedState);
    });

    test('should handle transition from valid to null elapsedMs', () => {
      const { result, rerender } = renderHook(
        ({ elapsedMs }) => useStageCalculation(elapsedMs),
        { initialProps: { elapsedMs: testElapsedTimes.earlyKetosis } }
      );
      
      expect(result.current).not.toBeNull();
      
      // Fast ends
      rerender({ elapsedMs: null });
      
      expect(result.current).toBeNull();
    });
  });
});
