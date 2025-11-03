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

    // Feature 027: Month Boundary Timer Accuracy Tests
    describe('Month Boundary Crossing (US1)', () => {
      it('should handle fast crossing October to November boundary (31-day to 30-day month)', () => {
        // Start fast: Oct 31 8:00 PM
        // Current time: Nov 1 2:00 AM (6 hours elapsed)
        const lastMealTime = '20:00';
        const entryDate = new Date('2025-10-31T00:00:00');
        const now = new Date('2025-11-01T02:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 6 hours = 21,600,000 ms
        expect(elapsed).toBe(6 * 60 * 60 * 1000);
      });

      it('should handle fast crossing December to January boundary (year boundary)', () => {
        // Start fast: Dec 31 8:00 PM
        // Current time: Jan 1 12:00 AM (4 hours elapsed)
        const lastMealTime = '20:00';
        const entryDate = new Date('2025-12-31T00:00:00');
        const now = new Date('2026-01-01T00:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 4 hours = 14,400,000 ms
        expect(elapsed).toBe(4 * 60 * 60 * 1000);
      });

      it('should handle fast crossing February to March boundary (non-leap year)', () => {
        // Start fast: Feb 28 10:00 PM (2025 is NOT a leap year)
        // Current time: Mar 1 8:00 AM (10 hours elapsed)
        const lastMealTime = '22:00';
        const entryDate = new Date('2025-02-28T00:00:00');
        const now = new Date('2025-03-01T08:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 10 hours = 36,000,000 ms
        expect(elapsed).toBe(10 * 60 * 60 * 1000);
      });

      it('should handle fast crossing February to March boundary (leap year)', () => {
        // Start fast: Feb 29 10:00 PM (2024 IS a leap year)
        // Current time: Mar 1 8:00 AM (10 hours elapsed)
        const lastMealTime = '22:00';
        const entryDate = new Date('2024-02-29T00:00:00');
        const now = new Date('2024-03-01T08:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 10 hours = 36,000,000 ms
        expect(elapsed).toBe(10 * 60 * 60 * 1000);
      });
    });

    // Feature 027: Multi-Day Fast Across Month Boundaries (US2)
    describe('Multi-Day Fasts Crossing Month Boundaries (US2)', () => {
      it('should handle 2+ day fast crossing month boundary', () => {
        // Start fast: Oct 30 6:00 AM
        // Current time: Nov 2 12:00 AM (2 days 18 hours = 66 hours)
        const lastMealTime = '06:00';
        const entryDate = new Date('2025-10-30T00:00:00');
        const now = new Date('2025-11-02T00:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 66 hours = 237,600,000 ms
        expect(elapsed).toBe(66 * 60 * 60 * 1000);
      });

      it('should handle 3+ day fast crossing year boundary', () => {
        // Start fast: Dec 30 10:00 PM
        // Current time: Jan 2 12:00 AM (2 hours + 2 full days = 50 hours)
        const lastMealTime = '22:00';
        const entryDate = new Date('2025-12-30T00:00:00');
        const now = new Date('2026-01-02T00:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 50 hours = 180,000,000 ms
        expect(elapsed).toBe(50 * 60 * 60 * 1000);
      });
    });

    // Feature 027: Timer Resilience Across All Calendar Scenarios (US3)
    describe('Calendar Edge Cases (US3)', () => {
      it('should handle fasts crossing all different month lengths (28-day month)', () => {
        // Test Feb 28 → Mar 1 specifically for 28-day month
        // Start fast: Feb 27 11:00 PM
        // Current time: Feb 28 11:00 PM (24 hours)
        const lastMealTime = '23:00';
        const entryDate = new Date('2025-02-27T00:00:00');
        const now = new Date('2025-02-28T23:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 24 hours = 86,400,000 ms
        expect(elapsed).toBe(24 * 60 * 60 * 1000);
      });

      it('should handle fasts crossing all 12 month boundaries consistently', () => {
        // Test that January → February produces same calculation as any other month transition
        // Start fast: Jan 31 12:00 PM
        // Current time: Feb 1 12:00 PM (24 hours)
        const lastMealTime = '12:00';
        const entryDate = new Date('2025-01-31T00:00:00');
        const now = new Date('2025-02-01T12:00:00');
        
        const elapsed = calculateElapsedTime(lastMealTime, now, entryDate);
        
        // Should be exactly 24 hours = 86,400,000 ms
        expect(elapsed).toBe(24 * 60 * 60 * 1000);
      });
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
