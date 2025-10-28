/**
 * Unit tests for Entry Model - Goal Fields (Feature 020)
 * Tests fastingGoal and goalStatus field validation
 */

import mongoose from 'mongoose';
import Entry from '../../../../src/lib/models/Entry.js';

// Mock MongoDB connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    models: {},
  };
});

describe('Entry Model - Goal Fields', () => {
  describe('fastingGoal field', () => {
    it('should accept null as default value', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        // fastingGoal not provided
      });

      expect(entry.fastingGoal).toBeNull();
    });

    it('should accept valid goal duration in minutes (60 = 1 hour)', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 960, // 16 hours
      });

      expect(entry.fastingGoal).toBe(960);
    });

    it('should accept minimum value of 1 minute', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 1,
      });

      expect(entry.fastingGoal).toBe(1);
    });

    it('should accept maximum value of 10080 minutes (168 hours / 7 days)', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 10080,
      });

      expect(entry.fastingGoal).toBe(10080);
    });

    it('should reject values below 1 minute', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 0,
      });

      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.fastingGoal).toBeDefined();
      expect(validationError.errors.fastingGoal.message).toContain('at least 1 minute');
    });

    it('should reject values above 10080 minutes', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 10081,
      });

      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.fastingGoal).toBeDefined();
      expect(validationError.errors.fastingGoal.message).toContain('cannot exceed 168 hours');
    });

    it('should accept decimal values (e.g., 14.5 hours = 870 minutes)', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 870, // 14.5 hours
      });

      expect(entry.fastingGoal).toBe(870);
    });
  });

  describe('goalStatus field', () => {
    it('should accept null as default value', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        // goalStatus not provided
      });

      expect(entry.goalStatus).toBeNull();
    });

    it('should accept "completed" status', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 960,
        goalStatus: 'completed',
      });

      expect(entry.goalStatus).toBe('completed');
    });

    it('should accept "not-completed" status', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 960,
        goalStatus: 'not-completed',
      });

      expect(entry.goalStatus).toBe('not-completed');
    });

    it('should accept "no-goal" status', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        goalStatus: 'no-goal',
      });

      expect(entry.goalStatus).toBe('no-goal');
    });

    it('should reject invalid status values', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 960,
        goalStatus: 'invalid-status',
      });

      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.goalStatus).toBeDefined();
      expect(validationError.errors.goalStatus.message).toContain('must be completed, not-completed, or no-goal');
    });
  });

  describe('goal field combinations', () => {
    it('should allow entry with both fastingGoal and goalStatus', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 1080,
        fastingGoal: 960,
        goalStatus: 'completed',
      });

      expect(entry.fastingGoal).toBe(960);
      expect(entry.goalStatus).toBe('completed');
      expect(entry.validateSync()).toBeUndefined();
    });

    it('should allow entry with no goal fields (legacy entry)', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 960,
      });

      expect(entry.fastingGoal).toBeNull();
      expect(entry.goalStatus).toBeNull();
      expect(entry.validateSync()).toBeUndefined();
    });

    it('should allow fastingGoal without goalStatus (goal set but fast not ended yet)', () => {
      const entry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-28'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingGoal: 960,
        // goalStatus not set yet (fast still active)
      });

      expect(entry.fastingGoal).toBe(960);
      expect(entry.goalStatus).toBeNull();
      expect(entry.validateSync()).toBeUndefined();
    });
  });

  describe('backward compatibility', () => {
    it('should handle existing entries without goal fields', () => {
      // Simulates querying an existing entry created before Feature 020
      const legacyEntry = new Entry({
        userId: new mongoose.Types.ObjectId(),
        date: new Date('2025-10-27'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 840,
        hoursOfSleep: 8,
        morningWeight: 70,
        hungerLevel: 'Low',
        energyLevel: 'High Energy',
        wellBeing: 'Good',
      });

      expect(legacyEntry.fastingGoal).toBeNull();
      expect(legacyEntry.goalStatus).toBeNull();
      expect(legacyEntry.validateSync()).toBeUndefined();
    });
  });
});
