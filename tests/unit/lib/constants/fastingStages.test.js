/**
 * Unit tests for FASTING_STAGES configuration
 * Tests the static configuration of 8 biological fasting stages
 */

import { FASTING_STAGES } from '@/lib/constants/fastingStages';

describe('FASTING_STAGES configuration', () => {
  test('should have exactly 7 stages', () => {
    expect(FASTING_STAGES).toHaveLength(7);
  });

  test('should start at 0 hours', () => {
    expect(FASTING_STAGES[0].hourRangeStart).toBe(0);
  });

  test('should have non-overlapping hour ranges', () => {
    for (let i = 0; i < FASTING_STAGES.length - 1; i++) {
      const currentStage = FASTING_STAGES[i];
      const nextStage = FASTING_STAGES[i + 1];
      
      // Current stage's end should equal next stage's start
      expect(currentStage.hourRangeEnd).toBe(nextStage.hourRangeStart);
    }
  });

  test('should have last stage unbounded (null hourRangeEnd)', () => {
    const lastStage = FASTING_STAGES[FASTING_STAGES.length - 1];
    expect(lastStage.hourRangeEnd).toBeNull();
  });

  test('should have all required fields for each stage', () => {
    const requiredFields = [
      'id',
      'hourRangeStart',
      'hourRangeEnd',
      'title',
      'description',
      'biologicalProcesses',
      'scientificSources',
    ];

    FASTING_STAGES.forEach((stage, index) => {
      requiredFields.forEach((field) => {
        expect(stage).toHaveProperty(field);
      });

      // Validate field types
      expect(typeof stage.id).toBe('number');
      expect(typeof stage.hourRangeStart).toBe('number');
      expect(stage.hourRangeEnd === null || typeof stage.hourRangeEnd === 'number').toBe(true);
      expect(typeof stage.title).toBe('string');
      expect(typeof stage.description).toBe('string');
      expect(Array.isArray(stage.biologicalProcesses)).toBe(true);
      expect(Array.isArray(stage.scientificSources)).toBe(true);
    });
  });
});
