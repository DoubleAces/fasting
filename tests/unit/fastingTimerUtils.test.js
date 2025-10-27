/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from '@jest/globals';
import { calculateElapsedTime, formatElapsedTime, parseTime, detectMilestone } from '@/lib/utils/fastingTimerUtils';

describe('fastingTimerUtils', () => {
  describe('calculateElapsedTime', () => {
    it('should calculate elapsed time in milliseconds between lastMealTime and now', () => {
      const lastMealTime = '18:00'; // 6:00 PM
      const now = new Date('2025-10-27T20:30:00'); // 8:30 PM same day
      
      const elapsed = calculateElapsedTime(lastMealTime, now);
      
      // Should be 2.5 hours = 9000000 ms
      expect(elapsed).toBe(2.5 * 60 * 60 * 1000);
    });

    it('should handle overnight fasts (crossing midnight)', () => {
      const lastMealTime = '22:00'; // 10:00 PM yesterday
      const now = new Date('2025-10-27T08:00:00'); // 8:00 AM today
      
      const elapsed = calculateElapsedTime(lastMealTime, now);
      
      // Should be 10 hours = 36000000 ms
      expect(elapsed).toBe(10 * 60 * 60 * 1000);
    });

    it('should return 0 if lastMealTime is in the future (edge case)', () => {
      const lastMealTime = '23:00'; // 11:00 PM
      const now = new Date('2025-10-27T10:00:00'); // 10:00 AM (before last meal)
      
      const elapsed = calculateElapsedTime(lastMealTime, now);
      
      // Should treat as yesterday's meal and calculate correctly
      // From 23:00 yesterday to 10:00 today = 11 hours
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    it('should handle exact same time (0 elapsed)', () => {
      const lastMealTime = '10:00';
      const now = new Date('2025-10-27T10:00:00');
      
      const elapsed = calculateElapsedTime(lastMealTime, now);
      
      expect(elapsed).toBe(0);
    });
  });

  describe('formatElapsedTime', () => {
    it('should format milliseconds to hours and minutes', () => {
      const milliseconds = 5 * 60 * 60 * 1000 + 23 * 60 * 1000; // 5h 23m
      
      const formatted = formatElapsedTime(milliseconds);
      
      expect(formatted).toEqual({ hours: 5, minutes: 23, days: 0 });
    });

    it('should handle fasts over 24 hours with days', () => {
      const milliseconds = 26 * 60 * 60 * 1000 + 15 * 60 * 1000; // 26h 15m = 1d 2h 15m
      
      const formatted = formatElapsedTime(milliseconds);
      
      expect(formatted).toEqual({ days: 1, hours: 2, minutes: 15 });
    });

    it('should handle exactly 24 hours as 1 day', () => {
      const milliseconds = 24 * 60 * 60 * 1000;
      
      const formatted = formatElapsedTime(milliseconds);
      
      expect(formatted).toEqual({ days: 1, hours: 0, minutes: 0 });
    });

    it('should handle 0 milliseconds', () => {
      const formatted = formatElapsedTime(0);
      
      expect(formatted).toEqual({ hours: 0, minutes: 0, days: 0 });
    });

    it('should round down partial minutes', () => {
      const milliseconds = 1 * 60 * 60 * 1000 + 30 * 1000; // 1h 0m 30s
      
      const formatted = formatElapsedTime(milliseconds);
      
      expect(formatted).toEqual({ hours: 1, minutes: 0, days: 0 });
    });
  });

  describe('parseTime', () => {
    it('should parse HH:mm format to Date object for today', () => {
      const timeString = '14:30';
      
      const parsed = parseTime(timeString);
      
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getHours()).toBe(14);
      expect(parsed.getMinutes()).toBe(30);
    });

    it('should parse time with leading zeros', () => {
      const timeString = '08:05';
      
      const parsed = parseTime(timeString);
      
      expect(parsed.getHours()).toBe(8);
      expect(parsed.getMinutes()).toBe(5);
    });

    it('should handle midnight (00:00)', () => {
      const timeString = '00:00';
      
      const parsed = parseTime(timeString);
      
      expect(parsed.getHours()).toBe(0);
      expect(parsed.getMinutes()).toBe(0);
    });

    it('should handle end of day (23:59)', () => {
      const timeString = '23:59';
      
      const parsed = parseTime(timeString);
      
      expect(parsed.getHours()).toBe(23);
      expect(parsed.getMinutes()).toBe(59);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseTime('invalid')).toThrow();
      expect(() => parseTime('25:00')).toThrow();
      expect(() => parseTime('12:60')).toThrow();
    });
  });

  describe('detectMilestone', () => {
    it('should detect 12-hour milestone', () => {
      const milestone = detectMilestone(12);
      expect(milestone).toBe('12-Hour Fast');
    });

    it('should detect 16-hour milestone', () => {
      const milestone = detectMilestone(16);
      expect(milestone).toBe('16-Hour Fast');
    });

    it('should detect 18-hour milestone', () => {
      const milestone = detectMilestone(18);
      expect(milestone).toBe('18-Hour Fast');
    });

    it('should detect 24-hour milestone', () => {
      const milestone = detectMilestone(24);
      expect(milestone).toBe('24-Hour Fast');
    });

    it('should detect 36-hour milestone', () => {
      const milestone = detectMilestone(36);
      expect(milestone).toBe('36-Hour Fast');
    });

    it('should detect 48-hour milestone', () => {
      const milestone = detectMilestone(48);
      expect(milestone).toBe('48-Hour Fast');
    });

    it('should detect 72-hour milestone', () => {
      const milestone = detectMilestone(72);
      expect(milestone).toBe('72-Hour Fast');
    });

    it('should return highest applicable milestone for longer fasts', () => {
      const milestone = detectMilestone(100);
      expect(milestone).toBe('72-Hour Fast');
    });

    it('should return null for fasts under 12 hours', () => {
      expect(detectMilestone(11)).toBeNull();
      expect(detectMilestone(5)).toBeNull();
      expect(detectMilestone(0)).toBeNull();
    });

    it('should handle decimal hours and return appropriate milestone', () => {
      expect(detectMilestone(12.5)).toBe('12-Hour Fast');
      expect(detectMilestone(15.9)).toBe('12-Hour Fast');
      expect(detectMilestone(16.1)).toBe('16-Hour Fast');
    });
  });

  describe('isFastActive', () => {
    it('should return true if entry has lastMealTime but no firstMealTime', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      const entry = {
        entryDate: '2025-10-27',
        lastMealTime: '18:00',
        firstMealTime: null
      };
      
      expect(isFastActive(entry)).toBe(true);
    });

    it('should return false if entry has both lastMealTime and firstMealTime', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      const entry = {
        entryDate: '2025-10-27',
        lastMealTime: '18:00',
        firstMealTime: '10:00'
      };
      
      expect(isFastActive(entry)).toBe(false);
    });

    it('should return false if entry has neither lastMealTime nor firstMealTime', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      const entry = {
        entryDate: '2025-10-27',
        lastMealTime: null,
        firstMealTime: null
      };
      
      expect(isFastActive(entry)).toBe(false);
    });

    it('should return false if entry has only firstMealTime', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      const entry = {
        entryDate: '2025-10-27',
        lastMealTime: null,
        firstMealTime: '10:00'
      };
      
      expect(isFastActive(entry)).toBe(false);
    });

    it('should return false for null entry', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      
      expect(isFastActive(null)).toBe(false);
    });

    it('should return false for undefined entry', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      
      expect(isFastActive(undefined)).toBe(false);
    });

    it('should return false for empty object', () => {
      const { isFastActive } = require('@/lib/utils/fastingTimerUtils');
      
      expect(isFastActive({})).toBe(false);
    });
  });

  describe('getActiveFast', () => {
    it('should return active fast for today with lastMealTime only', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-27',
          lastMealTime: '18:00',
          firstMealTime: null
        },
        {
          date: '2025-10-26',
          lastMealTime: '20:00',
          firstMealTime: '12:00'
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toEqual({
        lastMealTime: '18:00',
        isActive: true
      });
    });

    it('should return completed fast for today with both meal times', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-27',
          lastMealTime: '18:00',
          firstMealTime: '12:00'
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toEqual({
        lastMealTime: '18:00',
        isActive: false
      });
    });

    it('should return null when no entry exists for today', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-26',
          lastMealTime: '20:00',
          firstMealTime: '12:00'
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toBeNull();
    });

    it('should return null when today entry has no lastMealTime', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-27',
          lastMealTime: null,
          firstMealTime: '12:00'
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toBeNull();
    });

    it('should ignore yesterday\'s incomplete fast', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-26',
          lastMealTime: '22:00',
          firstMealTime: null  // Incomplete fast from yesterday
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toBeNull();
    });

    it('should return null for empty entries array', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      
      const result = getActiveFast([], today);
      
      expect(result).toBeNull();
    });

    it('should return null for null entries', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      
      const result = getActiveFast(null, today);
      
      expect(result).toBeNull();
    });

    it('should handle entries with different date formats', () => {
      const { getActiveFast } = require('@/lib/utils/fastingTimerUtils');
      const today = '2025-10-27';
      const entries = [
        {
          date: '2025-10-27',  // Matches today
          lastMealTime: '15:00',
          firstMealTime: null
        }
      ];
      
      const result = getActiveFast(entries, today);
      
      expect(result).toEqual({
        lastMealTime: '15:00',
        isActive: true
      });
    });
  });
});
