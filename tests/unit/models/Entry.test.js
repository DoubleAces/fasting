/**
 * Unit tests for Entry Mongoose Model Schema
 * TDD: Write tests first, then implement the model
 * 
 * These tests validate the schema structure without requiring a database connection
 */

import Entry from '@/lib/models/Entry';

describe('Entry Model Schema', () => {
  describe('Schema Structure', () => {
    it('should have correct schema paths', () => {
      const paths = Entry.schema.paths;
      
      expect(paths.date).toBeDefined();
      expect(paths.firstMealTime).toBeDefined();
      expect(paths.lastMealTime).toBeDefined();
      expect(paths.fastingDuration).toBeDefined();
      expect(paths.hoursOfSleep).toBeDefined();
      expect(paths.morningWeight).toBeDefined();
      expect(paths.hungerLevel).toBeDefined();
      expect(paths.energyLevel).toBeDefined();
      expect(paths.wellBeing).toBeDefined();
      expect(paths.foodNotes).toBeDefined();
    });

    it('should have required fields marked as required', () => {
      const paths = Entry.schema.paths;
      
      expect(paths.date.isRequired).toBe(true);
      expect(paths.firstMealTime.isRequired).toBe(true);
      expect(paths.lastMealTime.isRequired).toBe(true);
    });

    it('should have correct enum values for hungerLevel', () => {
      const hungerLevelEnum = Entry.schema.paths.hungerLevel.enumValues;
      
      expect(hungerLevelEnum).toContain('Low');
      expect(hungerLevelEnum).toContain('Medium');
      expect(hungerLevelEnum).toContain('High');
      expect(hungerLevelEnum).toHaveLength(3);
    });

    it('should have correct enum values for energyLevel', () => {
      const energyLevelEnum = Entry.schema.paths.energyLevel.enumValues;
      
      expect(energyLevelEnum).toContain('Low Energy');
      expect(energyLevelEnum).toContain('Medium Energy');
      expect(energyLevelEnum).toContain('High Energy');
      expect(energyLevelEnum).toHaveLength(3);
    });

    it('should have correct enum values for wellBeing', () => {
      const wellBeingEnum = Entry.schema.paths.wellBeing.enumValues;
      
      expect(wellBeingEnum).toContain('Poor');
      expect(wellBeingEnum).toContain('Fair');
      expect(wellBeingEnum).toContain('Good');
      expect(wellBeingEnum).toHaveLength(3);
    });

    it('should have timestamps enabled', () => {
      expect(Entry.schema.options.timestamps).toBe(true);
    });

    it('should have unique index on date', () => {
      const dateIndex = Entry.schema.indexes().find(
        index => index[0].date !== undefined
      );
      
      expect(dateIndex).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should have findByDateRange static method', () => {
      expect(typeof Entry.findByDateRange).toBe('function');
    });

    it('should have getMostRecent static method', () => {
      expect(typeof Entry.getMostRecent).toBe('function');
    });

    it('should have findByDateString static method', () => {
      expect(typeof Entry.findByDateString).toBe('function');
    });
  });

  describe('Instance Methods', () => {
    it('should have isComplete instance method', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      });
      
      expect(typeof entry.isComplete).toBe('function');
    });
  });

  describe('Virtuals', () => {
    it('should have fastingDurationFormatted virtual', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 16.5,
      });
      
      expect(entry.fastingDurationFormatted).toBe('16h 30m');
    });

    it('should return N/A when fasting duration is null', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: null,
      });
      
      expect(entry.fastingDurationFormatted).toBe('N/A');
    });

    it('should format whole hours without minutes', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 16,
      });
      
      expect(entry.fastingDurationFormatted).toBe('16h');
    });
  });

  describe('Validation', () => {
    it('should create valid entry object', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should fail validation without date', () => {
      const entry = new Entry({
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.date).toBeDefined();
    });

    it('should fail validation without firstMealTime', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        lastMealTime: '20:00',
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.firstMealTime).toBeDefined();
    });

    it('should fail validation with invalid time format', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: 'invalid',
        lastMealTime: '20:00',
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.firstMealTime).toBeDefined();
    });

    it('should fail validation with invalid hungerLevel', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hungerLevel: 'Invalid',
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.hungerLevel).toBeDefined();
    });

    it('should fail validation with negative hoursOfSleep', () => {
      const entry = new Entry({
        date: new Date('2025-10-17'),
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: -1,
      });
      
      const validationError = entry.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.hoursOfSleep).toBeDefined();
    });
  });
});
