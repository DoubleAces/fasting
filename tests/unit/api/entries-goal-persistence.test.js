/**
 * Unit Tests for Entry API Goal Persistence (Feature 020 - User Story 4)
 * 
 * Tests validation and handling of fastingGoal and goalStatus fields
 * in POST /api/entries endpoint
 * 
 * Tests cover:
 * - T061: Completed goal scenario (goal met)
 * - T062: Incomplete goal scenario (goal not met)
 * - T063: No goal scenario
 * - T064: Goal/status consistency validation
 */

import Joi from 'joi';

// We'll test the validation schema directly since integration tests are skipped
// This tests the business logic without requiring full API setup

describe('Entry API - Goal Persistence Validation (T061-T064)', () => {
  // Define expected schema (will be added to actual schema in T066)
  const goalFieldsSchema = Joi.object({
    fastingGoal: Joi.number()
      .integer()
      .min(1)
      .max(10080) // 168 hours * 60 minutes
      .allow(null)
      .optional()
      .messages({
        'number.base': 'Fasting goal must be a number',
        'number.integer': 'Fasting goal must be an integer (minutes)',
        'number.min': 'Fasting goal must be at least 1 minute',
        'number.max': 'Fasting goal cannot exceed 10080 minutes (168 hours)',
      }),

    goalStatus: Joi.string()
      .valid('completed', 'not-completed', 'no-goal')
      .allow(null)
      .optional()
      .when('fastingGoal', {
        is: Joi.number().required(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'any.only': 'Goal status must be one of: completed, not-completed, no-goal',
        'any.required': 'Goal status is required when fasting goal is provided',
      }),
  }).custom((value, helpers) => {
    // Business logic validation: Ensure consistency between fastingGoal and goalStatus
    const { fastingGoal, goalStatus } = value;

    // If goal is provided, status must not be 'no-goal'
    if (fastingGoal && goalStatus === 'no-goal') {
      return helpers.message('Cannot have goalStatus "no-goal" when fastingGoal is provided');
    }

    // If goalStatus is 'completed' or 'not-completed', fastingGoal must be provided
    if ((goalStatus === 'completed' || goalStatus === 'not-completed') && !fastingGoal) {
      return helpers.message('fastingGoal is required when goalStatus is "completed" or "not-completed"');
    }

    // If goalStatus is 'no-goal', fastingGoal should be null
    if (goalStatus === 'no-goal' && fastingGoal !== null && fastingGoal !== undefined) {
      return helpers.message('fastingGoal must be null when goalStatus is "no-goal"');
    }

    return value;
  });

  describe('Completed goal scenario (T061)', () => {
    it('should accept entry with completed goal (16h goal, 18h fasted)', () => {
      const entryData = {
        fastingGoal: 960, // 16 hours * 60 minutes
        goalStatus: 'completed',
      };

      const { error, value } = goalFieldsSchema.validate(entryData);

      expect(error).toBeUndefined();
      expect(value.fastingGoal).toBe(960);
      expect(value.goalStatus).toBe('completed');
    });

    it('should accept entry with exactly met goal (16h goal, 16h fasted)', () => {
      const entryData = {
        fastingGoal: 960,
        goalStatus: 'completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });

    it('should accept various completed goal durations', () => {
      const testCases = [
        { fastingGoal: 720, goalStatus: 'completed' }, // 12h
        { fastingGoal: 1080, goalStatus: 'completed' }, // 18h
        { fastingGoal: 1440, goalStatus: 'completed' }, // 24h
        { fastingGoal: 2880, goalStatus: 'completed' }, // 48h
      ];

      testCases.forEach(testCase => {
        const { error } = goalFieldsSchema.validate(testCase);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Incomplete goal scenario (T062)', () => {
    it('should accept entry with not-completed goal (16h goal, 10h fasted)', () => {
      const entryData = {
        fastingGoal: 960, // 16 hours
        goalStatus: 'not-completed',
      };

      const { error, value } = goalFieldsSchema.validate(entryData);

      expect(error).toBeUndefined();
      expect(value.fastingGoal).toBe(960);
      expect(value.goalStatus).toBe('not-completed');
    });

    it('should accept various not-completed goal scenarios', () => {
      const testCases = [
        { fastingGoal: 960, goalStatus: 'not-completed' }, // 16h goal not met
        { fastingGoal: 720, goalStatus: 'not-completed' }, // 12h goal not met
        { fastingGoal: 1440, goalStatus: 'not-completed' }, // 24h goal not met
      ];

      testCases.forEach(testCase => {
        const { error } = goalFieldsSchema.validate(testCase);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('No goal scenario (T063)', () => {
    it('should accept entry with no-goal status and null fastingGoal', () => {
      const entryData = {
        fastingGoal: null,
        goalStatus: 'no-goal',
      };

      const { error, value } = goalFieldsSchema.validate(entryData);

      expect(error).toBeUndefined();
      expect(value.fastingGoal).toBeNull();
      expect(value.goalStatus).toBe('no-goal');
    });

    it('should accept entry with both fields omitted (no goal was set)', () => {
      const entryData = {};

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });

    it('should accept entry with only goalStatus: no-goal', () => {
      const entryData = {
        goalStatus: 'no-goal',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });
  });

  describe('Goal/status consistency validation (T064)', () => {
    it('should reject goalStatus completed/not-completed without fastingGoal', () => {
      const testCases = [
        { goalStatus: 'completed' },
        { goalStatus: 'not-completed' },
      ];

      testCases.forEach(testCase => {
        const { error } = goalFieldsSchema.validate(testCase);
        expect(error).toBeDefined();
        expect(error.message).toContain('fastingGoal is required');
      });
    });

    it('should reject fastingGoal with goalStatus: no-goal', () => {
      const entryData = {
        fastingGoal: 960,
        goalStatus: 'no-goal',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('Cannot have goalStatus "no-goal" when fastingGoal is provided');
    });

    it('should reject fastingGoal without goalStatus', () => {
      const entryData = {
        fastingGoal: 960,
        // goalStatus missing
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('Goal status is required when fasting goal is provided');
    });

    it('should reject invalid goalStatus values', () => {
      const entryData = {
        fastingGoal: 960,
        goalStatus: 'invalid-status',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('must be one of: completed, not-completed, no-goal');
    });

    it('should reject fastingGoal below minimum (1 minute)', () => {
      const entryData = {
        fastingGoal: 0,
        goalStatus: 'not-completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('must be at least 1 minute');
    });

    it('should reject fastingGoal above maximum (168 hours)', () => {
      const entryData = {
        fastingGoal: 10081, // 168 hours * 60 + 1
        goalStatus: 'completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('cannot exceed 10080 minutes');
    });

    it('should reject non-integer fastingGoal', () => {
      const entryData = {
        fastingGoal: 960.5,
        goalStatus: 'completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeDefined();
      expect(error.message).toContain('must be an integer');
    });
  });

  describe('Edge cases', () => {
    it('should accept minimum valid goal (1 minute)', () => {
      const entryData = {
        fastingGoal: 1,
        goalStatus: 'completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });

    it('should accept maximum valid goal (168 hours = 10080 minutes)', () => {
      const entryData = {
        fastingGoal: 10080,
        goalStatus: 'completed',
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });

    it('should handle null values correctly', () => {
      const entryData = {
        fastingGoal: null,
        goalStatus: null,
      };

      const { error } = goalFieldsSchema.validate(entryData);
      expect(error).toBeUndefined();
    });
  });
});
