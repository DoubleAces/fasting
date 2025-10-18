/**
 * Date Utilities Tests
 * 
 * Tests for date parsing, formatting, comparison, and manipulation utilities.
 * Uses date-fns for consistent date handling.
 */

import {
  parseDate,
  formatDate,
  formatDateLong,
  formatDateShort,
  isToday,
  isYesterday,
  isSameDay,
  getYesterday,
  getTomorrow,
  getStartOfDay,
  getEndOfDay,
  isValidDate,
  compareDates,
  getDaysBetween,
  getDateFromDaysAgo,
} from '@/lib/utils/dateUtils';

describe('Date Utilities', () => {
  describe('parseDate', () => {
    it('should parse ISO date string', () => {
      const result = parseDate('2024-03-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // 0-indexed
      expect(result.getDate()).toBe(15);
    });

    it('should parse Date object', () => {
      const date = new Date('2024-03-15');
      const result = parseDate(date);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(date.getTime());
    });

    it('should parse timestamp', () => {
      const timestamp = new Date('2024-03-15').getTime();
      const result = parseDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should throw error for invalid date string', () => {
      expect(() => parseDate('invalid')).toThrow('Invalid date');
    });

    it('should throw error for null', () => {
      expect(() => parseDate(null)).toThrow('Invalid date');
    });

    it('should throw error for undefined', () => {
      expect(() => parseDate(undefined)).toThrow('Invalid date');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format (yyyy-MM-dd)', () => {
      const date = new Date('2024-03-15T10:30:00');
      const result = formatDate(date);
      expect(result).toBe('2024-03-15');
    });

    it('should format date with custom format', () => {
      const date = new Date('2024-03-15T10:30:00');
      const result = formatDate(date, 'MM/dd/yyyy');
      expect(result).toBe('03/15/2024');
    });

    it('should accept date string', () => {
      const result = formatDate('2024-03-15');
      expect(result).toBe('2024-03-15');
    });

    it('should accept timestamp', () => {
      const timestamp = new Date('2024-03-15').getTime();
      const result = formatDate(timestamp);
      expect(result).toBe('2024-03-15');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid')).toThrow('Invalid date');
    });
  });

  describe('formatDateLong', () => {
    it('should format date in long format', () => {
      const date = new Date('2024-03-15');
      const result = formatDateLong(date);
      expect(result).toBe('March 15, 2024');
    });

    it('should handle different months', () => {
      const date = new Date('2024-12-25');
      const result = formatDateLong(date);
      expect(result).toBe('December 25, 2024');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = new Date('2024-03-15');
      const result = formatDateShort(date);
      expect(result).toBe('Mar 15');
    });

    it('should handle different months', () => {
      const date = new Date('2024-12-25');
      const result = formatDateShort(date);
      expect(result).toBe('Dec 25');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should ignore time component', () => {
      const todayMorning = new Date();
      todayMorning.setHours(6, 0, 0, 0);
      expect(isToday(todayMorning)).toBe(true);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });

    it('should return false for two days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2024-03-15T10:30:00');
      const date2 = new Date('2024-03-15T14:45:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return true for same date at midnight', () => {
      const date1 = new Date('2024-03-15T00:00:00');
      const date2 = new Date('2024-03-15T23:59:59');
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('getYesterday', () => {
    it('should return yesterday', () => {
      const yesterday = getYesterday();
      const today = new Date();
      const expectedDate = today.getDate() - 1;
      
      // Handle month boundary
      if (expectedDate < 1) {
        expect(yesterday.getMonth()).toBe(today.getMonth() === 0 ? 11 : today.getMonth() - 1);
      } else {
        expect(yesterday.getDate()).toBe(expectedDate);
      }
    });

    it('should set time to start of day', () => {
      const yesterday = getYesterday();
      expect(yesterday.getHours()).toBe(0);
      expect(yesterday.getMinutes()).toBe(0);
      expect(yesterday.getSeconds()).toBe(0);
      expect(yesterday.getMilliseconds()).toBe(0);
    });
  });

  describe('getTomorrow', () => {
    it('should return tomorrow', () => {
      const tomorrow = getTomorrow();
      const today = new Date();
      const expectedDate = today.getDate() + 1;
      
      expect(tomorrow.getDate()).toBeGreaterThan(today.getDate());
    });

    it('should set time to start of day', () => {
      const tomorrow = getTomorrow();
      expect(tomorrow.getHours()).toBe(0);
      expect(tomorrow.getMinutes()).toBe(0);
      expect(tomorrow.getSeconds()).toBe(0);
      expect(tomorrow.getMilliseconds()).toBe(0);
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2024-03-15T14:30:45.123');
      const result = getStartOfDay(date);
      
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day', () => {
      const date = new Date('2024-03-15T14:30:45.123');
      const result = getEndOfDay(date);
      
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid Date object', () => {
      const date = new Date('2024-03-15');
      expect(isValidDate(date)).toBe(true);
    });

    it('should return true for valid date string', () => {
      expect(isValidDate('2024-03-15')).toBe(true);
    });

    it('should return true for valid timestamp', () => {
      const timestamp = new Date('2024-03-15').getTime();
      expect(isValidDate(timestamp)).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidDate('invalid')).toBe(false);
    });

    it('should return false for Invalid Date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('compareDates', () => {
    it('should return 0 for same dates', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-15');
      expect(compareDates(date1, date2)).toBe(0);
    });

    it('should return negative for earlier date', () => {
      const date1 = new Date('2024-03-14');
      const date2 = new Date('2024-03-15');
      expect(compareDates(date1, date2)).toBeLessThan(0);
    });

    it('should return positive for later date', () => {
      const date1 = new Date('2024-03-16');
      const date2 = new Date('2024-03-15');
      expect(compareDates(date1, date2)).toBeGreaterThan(0);
    });

    it('should ignore time when comparing days', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-15T20:00:00');
      expect(compareDates(date1, date2)).toBe(0);
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same day', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-15');
      expect(getDaysBetween(date1, date2)).toBe(0);
    });

    it('should return positive for future date', () => {
      const date1 = new Date('2024-03-15');
      const date2 = new Date('2024-03-20');
      expect(getDaysBetween(date1, date2)).toBe(5);
    });

    it('should return negative for past date', () => {
      const date1 = new Date('2024-03-20');
      const date2 = new Date('2024-03-15');
      expect(getDaysBetween(date1, date2)).toBe(-5);
    });

    it('should ignore time component', () => {
      const date1 = new Date('2024-03-15T10:00:00');
      const date2 = new Date('2024-03-20T20:00:00');
      expect(getDaysBetween(date1, date2)).toBe(5);
    });
  });

  describe('getDateFromDaysAgo', () => {
    it('should return date from days ago', () => {
      const result = getDateFromDaysAgo(5);
      const expected = new Date();
      expected.setDate(expected.getDate() - 5);
      
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });

    it('should return today for 0 days ago', () => {
      const result = getDateFromDaysAgo(0);
      const today = new Date();
      
      expect(result.getDate()).toBe(today.getDate());
    });

    it('should set time to start of day', () => {
      const result = getDateFromDaysAgo(5);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle negative days (future)', () => {
      const result = getDateFromDaysAgo(-5);
      const expected = new Date();
      expected.setDate(expected.getDate() + 5);
      
      expect(result.getDate()).toBeGreaterThan(new Date().getDate());
    });
  });
});
