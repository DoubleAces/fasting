/**
 * Fasting Duration Calculator Tests
 * 
 * Tests for calculating fasting duration between last meal and first meal.
 * Handles same-day fasting and fasting across midnight.
 */

import {
  calculateFastingDuration,
  formatFastingDuration,
  isValidFastingPeriod,
} from '@/lib/utils/fastingCalculator';

describe('Fasting Duration Calculator', () => {
  describe('calculateFastingDuration', () => {
    describe('Same Day Fasting', () => {
      it('should calculate duration for meals on same day', () => {
        const result = calculateFastingDuration(
          '20:00', // Last meal at 8 PM
          '12:00', // First meal at noon next day
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 16,
          minutes: 0,
          totalMinutes: 960,
          formattedDuration: '16h 0m',
        });
      });

      it('should calculate duration with minutes', () => {
        const result = calculateFastingDuration(
          '19:30', // Last meal at 7:30 PM
          '11:45', // First meal at 11:45 AM
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 16,
          minutes: 15,
          totalMinutes: 975,
          formattedDuration: '16h 15m',
        });
      });

      it('should calculate short fasting period', () => {
        const result = calculateFastingDuration(
          '22:00', // Last meal at 10 PM
          '06:00', // First meal at 6 AM
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 8,
          minutes: 0,
          totalMinutes: 480,
          formattedDuration: '8h 0m',
        });
      });

      it('should calculate long fasting period', () => {
        const result = calculateFastingDuration(
          '18:00', // Last meal at 6 PM
          '14:00', // First meal at 2 PM next day
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 20,
          minutes: 0,
          totalMinutes: 1200,
          formattedDuration: '20h 0m',
        });
      });
    });

    describe('Across Midnight', () => {
      it('should handle fasting from evening to morning', () => {
        const result = calculateFastingDuration(
          '20:00', // Last meal at 8 PM
          '08:00', // First meal at 8 AM
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 12,
          minutes: 0,
          totalMinutes: 720,
          formattedDuration: '12h 0m',
        });
      });

      it('should handle fasting from late night to morning', () => {
        const result = calculateFastingDuration(
          '23:30', // Last meal at 11:30 PM
          '07:45', // First meal at 7:45 AM
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 8,
          minutes: 15,
          totalMinutes: 495,
          formattedDuration: '8h 15m',
        });
      });

      it('should handle fasting from early evening to afternoon', () => {
        const result = calculateFastingDuration(
          '17:00', // Last meal at 5 PM
          '13:30', // First meal at 1:30 PM next day
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 20,
          minutes: 30,
          totalMinutes: 1230,
          formattedDuration: '20h 30m',
        });
      });
    });

    describe('Same Day (No Overnight Fast)', () => {
      it('should handle meals on same calendar day', () => {
        const result = calculateFastingDuration(
          '08:00', // Breakfast at 8 AM
          '12:00', // Lunch at noon
          new Date('2024-03-15'),
          new Date('2024-03-15')
        );

        expect(result).toEqual({
          hours: 4,
          minutes: 0,
          totalMinutes: 240,
          formattedDuration: '4h 0m',
        });
      });

      it('should handle same day with minutes', () => {
        const result = calculateFastingDuration(
          '07:30', // First meal at 7:30 AM
          '12:45', // Second meal at 12:45 PM
          new Date('2024-03-15'),
          new Date('2024-03-15')
        );

        expect(result).toEqual({
          hours: 5,
          minutes: 15,
          totalMinutes: 315,
          formattedDuration: '5h 15m',
        });
      });
    });

    describe('Multi-Day Fasting', () => {
      it('should calculate 24+ hour fasts', () => {
        const result = calculateFastingDuration(
          '18:00', // Last meal at 6 PM
          '20:00', // First meal at 8 PM two days later
          new Date('2024-03-15'),
          new Date('2024-03-17')
        );

        expect(result).toEqual({
          hours: 50,
          minutes: 0,
          totalMinutes: 3000,
          formattedDuration: '50h 0m',
        });
      });

      it('should calculate 48+ hour fasts', () => {
        const result = calculateFastingDuration(
          '19:00', // Last meal at 7 PM
          '19:00', // First meal at 7 PM three days later
          new Date('2024-03-15'),
          new Date('2024-03-18')
        );

        expect(result).toEqual({
          hours: 72,
          minutes: 0,
          totalMinutes: 4320,
          formattedDuration: '72h 0m',
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle 1 minute fast', () => {
        const result = calculateFastingDuration(
          '12:00',
          '12:01',
          new Date('2024-03-15'),
          new Date('2024-03-15')
        );

        expect(result).toEqual({
          hours: 0,
          minutes: 1,
          totalMinutes: 1,
          formattedDuration: '0h 1m',
        });
      });

      it('should handle midnight meals', () => {
        const result = calculateFastingDuration(
          '00:00', // Midnight
          '12:00', // Noon
          new Date('2024-03-15'),
          new Date('2024-03-15')
        );

        expect(result).toEqual({
          hours: 12,
          minutes: 0,
          totalMinutes: 720,
          formattedDuration: '12h 0m',
        });
      });

      it('should handle end of day meals', () => {
        const result = calculateFastingDuration(
          '23:59', // 11:59 PM
          '23:59', // 11:59 PM next day
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 24,
          minutes: 0,
          totalMinutes: 1440,
          formattedDuration: '24h 0m',
        });
      });

      it('should handle single digit hour times', () => {
        const result = calculateFastingDuration(
          '9:30',
          '5:45',
          new Date('2024-03-15'),
          new Date('2024-03-16')
        );

        expect(result).toEqual({
          hours: 20,
          minutes: 15,
          totalMinutes: 1215,
          formattedDuration: '20h 15m',
        });
      });
    });

    describe('Date Object Handling', () => {
      it('should accept Date objects for dates', () => {
        const lastMealDate = new Date('2024-03-15T20:00:00');
        const firstMealDate = new Date('2024-03-16T12:00:00');

        const result = calculateFastingDuration(
          '20:00',
          '12:00',
          lastMealDate,
          firstMealDate
        );

        expect(result.hours).toBe(16);
        expect(result.minutes).toBe(0);
      });

      it('should accept ISO date strings', () => {
        const result = calculateFastingDuration(
          '20:00',
          '12:00',
          '2024-03-15',
          '2024-03-16'
        );

        expect(result.hours).toBe(16);
        expect(result.minutes).toBe(0);
      });
    });

    describe('Error Handling', () => {
      it('should throw error for invalid time format', () => {
        expect(() =>
          calculateFastingDuration(
            '25:00', // Invalid hour
            '12:00',
            new Date('2024-03-15'),
            new Date('2024-03-16')
          )
        ).toThrow('Invalid time format');
      });

      it('should throw error for invalid date', () => {
        expect(() =>
          calculateFastingDuration(
            '20:00',
            '12:00',
            'invalid-date',
            new Date('2024-03-16')
          )
        ).toThrow('Invalid date');
      });

      it('should throw error when first meal is before last meal', () => {
        expect(() =>
          calculateFastingDuration(
            '20:00',
            '12:00',
            new Date('2024-03-16'), // Later date
            new Date('2024-03-15')  // Earlier date
          )
        ).toThrow('First meal cannot be before last meal');
      });

      it('should throw error when same time on same day', () => {
        expect(() =>
          calculateFastingDuration(
            '12:00',
            '12:00',
            new Date('2024-03-15'),
            new Date('2024-03-15')
          )
        ).toThrow('Fasting duration must be greater than 0');
      });
    });
  });

  describe('formatFastingDuration', () => {
    it('should format hours and minutes', () => {
      expect(formatFastingDuration(16, 30)).toBe('16h 30m');
    });

    it('should format whole hours', () => {
      expect(formatFastingDuration(12, 0)).toBe('12h 0m');
    });

    it('should format only minutes', () => {
      expect(formatFastingDuration(0, 45)).toBe('0h 45m');
    });

    it('should format 24+ hours', () => {
      expect(formatFastingDuration(36, 15)).toBe('36h 15m');
    });

    it('should handle single digit values', () => {
      expect(formatFastingDuration(5, 3)).toBe('5h 3m');
    });

    it('should accept totalMinutes parameter', () => {
      expect(formatFastingDuration(960)).toBe('16h 0m');
      expect(formatFastingDuration(975)).toBe('16h 15m');
      expect(formatFastingDuration(0)).toBe('0h 0m');
    });
  });

  describe('isValidFastingPeriod', () => {
    it('should return true for valid fasting period (16h)', () => {
      expect(isValidFastingPeriod(960)).toBe(true); // 16 hours
    });

    it('should return true for minimum fasting period (1 minute)', () => {
      expect(isValidFastingPeriod(1)).toBe(true);
    });

    it('should return true for long fasts (48h)', () => {
      expect(isValidFastingPeriod(2880)).toBe(true); // 48 hours
    });

    it('should return false for 0 minutes', () => {
      expect(isValidFastingPeriod(0)).toBe(false);
    });

    it('should return false for negative minutes', () => {
      expect(isValidFastingPeriod(-60)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidFastingPeriod(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidFastingPeriod(undefined)).toBe(false);
    });

    it('should return false for extremely long fasts (>7 days)', () => {
      expect(isValidFastingPeriod(10080)).toBe(true); // 7 days - valid
      expect(isValidFastingPeriod(10081)).toBe(false); // >7 days - invalid
    });
  });
});
