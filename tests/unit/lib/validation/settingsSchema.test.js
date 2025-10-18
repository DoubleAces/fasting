/**
 * Settings Validation Schema Tests
 * 
 * Tests for validating settings form data using Joi.
 */

import { validateSettings, settingsSchema } from '@/lib/validation/settingsSchema';

describe('Settings Validation Schema', () => {
  describe('Valid Settings Data', () => {
    it('should validate complete valid settings', () => {
      const validSettings = {
        userId: 'user123',
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error, value } = validateSettings(validSettings);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validSettings);
    });

    it('should validate minimal settings (without userId)', () => {
      const minimalSettings = {
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error, value } = validateSettings(minimalSettings);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(minimalSettings);
    });

    it('should validate imperial and 12h format', () => {
      const settings = {
        measurementSystem: 'imperial',
        timeFormat: '12h',
      };

      const { error, value } = validateSettings(settings);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(settings);
    });
  });

  describe('Measurement System Validation', () => {
    it('should require measurementSystem', () => {
      const settings = {
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('measurementSystem');
      expect(error.details[0].message).toMatch(/required/i);
    });

    it('should accept "metric"', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should accept "imperial"', () => {
      const settings = {
        measurementSystem: 'imperial',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should reject invalid measurement system', () => {
      const settings = {
        measurementSystem: 'invalid',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('measurementSystem');
      expect(error.details[0].message).toMatch(/must be one of/i);
    });

    it('should reject empty string', () => {
      const settings = {
        measurementSystem: '',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
    });
  });

  describe('Time Format Validation', () => {
    it('should require timeFormat', () => {
      const settings = {
        measurementSystem: 'metric',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('timeFormat');
      expect(error.details[0].message).toMatch(/required/i);
    });

    it('should accept "12h"', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '12h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should accept "24h"', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should reject invalid time format', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: 'invalid',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('timeFormat');
      expect(error.details[0].message).toMatch(/must be one of/i);
    });

    it('should reject empty string', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
    });
  });

  describe('User ID Validation', () => {
    it('should accept valid userId', () => {
      const settings = {
        userId: 'user123',
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should accept default userId', () => {
      const settings = {
        userId: 'default',
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should allow missing userId', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });

    it('should reject empty string userId', () => {
      const settings = {
        userId: '',
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('userId');
    });

    it('should accept alphanumeric userId', () => {
      const settings = {
        userId: 'user123abc',
        measurementSystem: 'metric',
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeUndefined();
    });
  });

  describe('Unknown Fields', () => {
    it('should strip unknown fields', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: '24h',
        unknownField: 'should be removed',
      };

      const { error, value } = validateSettings(settings);
      expect(error).toBeUndefined();
      expect(value.unknownField).toBeUndefined();
    });

    it('should allow valid fields with unknown fields', () => {
      const settings = {
        userId: 'user123',
        measurementSystem: 'metric',
        timeFormat: '24h',
        extra1: 'removed',
        extra2: 'removed',
      };

      const { error, value } = validateSettings(settings);
      expect(error).toBeUndefined();
      expect(value.userId).toBe('user123');
      expect(value.measurementSystem).toBe('metric');
      expect(value.timeFormat).toBe('24h');
      expect(value.extra1).toBeUndefined();
      expect(value.extra2).toBeUndefined();
    });
  });

  describe('Type Validation', () => {
    it('should reject non-string measurementSystem', () => {
      const settings = {
        measurementSystem: 123,
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
    });

    it('should reject non-string timeFormat', () => {
      const settings = {
        measurementSystem: 'metric',
        timeFormat: 24,
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
    });

    it('should reject boolean values', () => {
      const settings = {
        measurementSystem: true,
        timeFormat: '24h',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
    });
  });

  describe('Multiple Errors', () => {
    it('should report multiple validation errors', () => {
      const settings = {
        measurementSystem: 'invalid',
        timeFormat: 'invalid',
      };

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThan(0);
    });

    it('should report all missing required fields', () => {
      const settings = {};

      const { error } = validateSettings(settings);
      expect(error).toBeDefined();
      expect(error.details.length).toBe(2); // measurementSystem and timeFormat
    });
  });
});
