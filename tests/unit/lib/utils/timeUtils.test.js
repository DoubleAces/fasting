/**
 * Time Utilities Tests
 * 
 * Tests for time parsing, formatting, validation, and conversion utilities.
 */

import {
  parseTime,
  formatTime,
  isValidTimeFormat,
  convertTo24Hour,
  convertTo12Hour,
  getTimeDifferenceMinutes,
  addMinutesToTime,
  compareTimeStrings,
  timeStringToMinutes,
  minutesToTimeString,
} from '@/lib/utils/timeUtils';

describe('Time Utilities', () => {
  describe('parseTime', () => {
    it('should parse valid 24-hour time', () => {
      const result = parseTime('14:30');
      expect(result).toEqual({ hours: 14, minutes: 30 });
    });

    it('should parse midnight', () => {
      const result = parseTime('00:00');
      expect(result).toEqual({ hours: 0, minutes: 0 });
    });

    it('should parse end of day', () => {
      const result = parseTime('23:59');
      expect(result).toEqual({ hours: 23, minutes: 59 });
    });

    it('should parse single digit hours', () => {
      const result = parseTime('9:15');
      expect(result).toEqual({ hours: 9, minutes: 15 });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseTime('25:00')).toThrow('Invalid time format');
    });

    it('should throw error for invalid minutes', () => {
      expect(() => parseTime('14:60')).toThrow('Invalid time format');
    });

    it('should throw error for non-string input', () => {
      expect(() => parseTime(1430)).toThrow('Invalid time format');
    });
  });

  describe('formatTime', () => {
    it('should format time object to string', () => {
      const result = formatTime({ hours: 14, minutes: 30 });
      expect(result).toBe('14:30');
    });

    it('should pad single digit hours', () => {
      const result = formatTime({ hours: 9, minutes: 30 });
      expect(result).toBe('09:30');
    });

    it('should pad single digit minutes', () => {
      const result = formatTime({ hours: 14, minutes: 5 });
      expect(result).toBe('14:05');
    });

    it('should format midnight', () => {
      const result = formatTime({ hours: 0, minutes: 0 });
      expect(result).toBe('00:00');
    });
  });

  describe('isValidTimeFormat', () => {
    it('should return true for valid 24-hour format', () => {
      expect(isValidTimeFormat('14:30')).toBe(true);
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
    });

    it('should return true for single digit hours', () => {
      expect(isValidTimeFormat('9:30')).toBe(true);
    });

    it('should return false for invalid hours', () => {
      expect(isValidTimeFormat('24:00')).toBe(false);
      expect(isValidTimeFormat('25:30')).toBe(false);
    });

    it('should return false for invalid minutes', () => {
      expect(isValidTimeFormat('14:60')).toBe(false);
      expect(isValidTimeFormat('14:99')).toBe(false);
    });

    it('should return false for invalid format', () => {
      expect(isValidTimeFormat('14')).toBe(false);
      expect(isValidTimeFormat('14:30:00')).toBe(false);
      expect(isValidTimeFormat('14.30')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidTimeFormat(null)).toBe(false);
      expect(isValidTimeFormat(undefined)).toBe(false);
    });
  });

  describe('convertTo24Hour', () => {
    it('should convert AM times correctly', () => {
      expect(convertTo24Hour('09:30 AM')).toBe('09:30');
      expect(convertTo24Hour('11:45 AM')).toBe('11:45');
    });

    it('should convert PM times correctly', () => {
      expect(convertTo24Hour('02:30 PM')).toBe('14:30');
      expect(convertTo24Hour('11:45 PM')).toBe('23:45');
    });

    it('should convert midnight (12:00 AM)', () => {
      expect(convertTo24Hour('12:00 AM')).toBe('00:00');
      expect(convertTo24Hour('12:30 AM')).toBe('00:30');
    });

    it('should convert noon (12:00 PM)', () => {
      expect(convertTo24Hour('12:00 PM')).toBe('12:00');
      expect(convertTo24Hour('12:30 PM')).toBe('12:30');
    });

    it('should handle lowercase am/pm', () => {
      expect(convertTo24Hour('09:30 am')).toBe('09:30');
      expect(convertTo24Hour('02:30 pm')).toBe('14:30');
    });

    it('should throw error for invalid format', () => {
      expect(() => convertTo24Hour('25:00 AM')).toThrow();
      expect(() => convertTo24Hour('14:30')).toThrow();
    });
  });

  describe('convertTo12Hour', () => {
    it('should convert morning times correctly', () => {
      expect(convertTo12Hour('09:30')).toBe('09:30 AM');
      expect(convertTo12Hour('11:45')).toBe('11:45 AM');
    });

    it('should convert afternoon times correctly', () => {
      expect(convertTo12Hour('14:30')).toBe('02:30 PM');
      expect(convertTo12Hour('23:45')).toBe('11:45 PM');
    });

    it('should convert midnight', () => {
      expect(convertTo12Hour('00:00')).toBe('12:00 AM');
      expect(convertTo12Hour('00:30')).toBe('12:30 AM');
    });

    it('should convert noon', () => {
      expect(convertTo12Hour('12:00')).toBe('12:00 PM');
      expect(convertTo12Hour('12:30')).toBe('12:30 PM');
    });

    it('should throw error for invalid format', () => {
      expect(() => convertTo12Hour('25:00')).toThrow();
      expect(() => convertTo12Hour('invalid')).toThrow();
    });
  });

  describe('getTimeDifferenceMinutes', () => {
    it('should calculate difference within same day', () => {
      const result = getTimeDifferenceMinutes('09:00', '17:00');
      expect(result).toBe(480); // 8 hours = 480 minutes
    });

    it('should handle times across midnight', () => {
      const result = getTimeDifferenceMinutes('22:00', '02:00');
      expect(result).toBe(240); // 4 hours = 240 minutes
    });

    it('should return 0 for same times', () => {
      const result = getTimeDifferenceMinutes('14:30', '14:30');
      expect(result).toBe(0);
    });

    it('should handle 1 minute difference', () => {
      const result = getTimeDifferenceMinutes('14:30', '14:31');
      expect(result).toBe(1);
    });

    it('should handle full day', () => {
      const result = getTimeDifferenceMinutes('00:00', '00:00');
      expect(result).toBe(0);
    });
  });

  describe('addMinutesToTime', () => {
    it('should add minutes within same hour', () => {
      const result = addMinutesToTime('14:30', 15);
      expect(result).toBe('14:45');
    });

    it('should add minutes across hour boundary', () => {
      const result = addMinutesToTime('14:45', 30);
      expect(result).toBe('15:15');
    });

    it('should add minutes across midnight', () => {
      const result = addMinutesToTime('23:45', 30);
      expect(result).toBe('00:15');
    });

    it('should handle adding full hours', () => {
      const result = addMinutesToTime('14:30', 120);
      expect(result).toBe('16:30');
    });

    it('should handle negative minutes (subtract)', () => {
      const result = addMinutesToTime('14:30', -30);
      expect(result).toBe('14:00');
    });

    it('should handle subtracting across midnight', () => {
      const result = addMinutesToTime('00:15', -30);
      expect(result).toBe('23:45');
    });
  });

  describe('compareTimeStrings', () => {
    it('should return 0 for equal times', () => {
      expect(compareTimeStrings('14:30', '14:30')).toBe(0);
    });

    it('should return negative for earlier time', () => {
      expect(compareTimeStrings('14:30', '15:30')).toBeLessThan(0);
    });

    it('should return positive for later time', () => {
      expect(compareTimeStrings('15:30', '14:30')).toBeGreaterThan(0);
    });

    it('should compare hours correctly', () => {
      expect(compareTimeStrings('09:00', '10:00')).toBeLessThan(0);
    });

    it('should compare minutes when hours are equal', () => {
      expect(compareTimeStrings('14:15', '14:45')).toBeLessThan(0);
    });
  });

  describe('timeStringToMinutes', () => {
    it('should convert time to minutes since midnight', () => {
      expect(timeStringToMinutes('00:00')).toBe(0);
      expect(timeStringToMinutes('01:00')).toBe(60);
      expect(timeStringToMinutes('14:30')).toBe(870); // 14*60 + 30
      expect(timeStringToMinutes('23:59')).toBe(1439);
    });

    it('should handle single digit hours', () => {
      expect(timeStringToMinutes('9:30')).toBe(570);
    });
  });

  describe('minutesToTimeString', () => {
    it('should convert minutes to time string', () => {
      expect(minutesToTimeString(0)).toBe('00:00');
      expect(minutesToTimeString(60)).toBe('01:00');
      expect(minutesToTimeString(870)).toBe('14:30');
      expect(minutesToTimeString(1439)).toBe('23:59');
    });

    it('should handle minutes exceeding 24 hours', () => {
      expect(minutesToTimeString(1440)).toBe('00:00'); // 24 hours wraps to midnight
      expect(minutesToTimeString(1500)).toBe('01:00'); // 25 hours wraps to 1 AM
    });

    it('should handle negative minutes', () => {
      expect(minutesToTimeString(-60)).toBe('23:00');
    });
  });
});
