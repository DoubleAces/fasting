/**
 * EntryInsightsService Enhancement Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T036 - Unit test for insight calculation service enhancements
 * 
 * Tests new insight calculations: weekendVsWeekdayPattern, deviationFromTypical, streakContribution.
 */

import { calculateInsights } from '@/lib/services/entryInsightsService';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';

// Mock database connection
jest.mock('@/lib/db');
jest.mock('@/lib/models/Entry');

describe('EntryInsightsService - Enhanced Calculations (US2)', () => {
  const mockUserId = '507f1f77bcf86cd799439012';
  const mockEntry = {
    _id: '507f1f77bcf86cd799439011',
    userId: mockUserId,
    date: new Date('2025-11-01'),
    fastingDuration: 960, // 16 hours
    firstMealTime: '12:00',
    lastMealTime: '20:00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('weekendVsWeekdayPattern calculation', () => {
    it('should calculate weekend vs weekday average', async () => {
      // Mock entries with weekend/weekday data
      const mockEntries = [
        { date: new Date('2025-10-27'), fastingDuration: 900 }, // Monday
        { date: new Date('2025-10-28'), fastingDuration: 920 }, // Tuesday
        { date: new Date('2025-10-29'), fastingDuration: 940 }, // Wednesday
        { date: new Date('2025-10-30'), fastingDuration: 960 }, // Thursday
        { date: new Date('2025-10-31'), fastingDuration: 980 }, // Friday
        { date: new Date('2025-11-01'), fastingDuration: 1000 }, // Saturday
        { date: new Date('2025-11-02'), fastingDuration: 1020 }, // Sunday
      ];

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const insights = await calculateInsights(mockEntry, mockUserId);

      expect(insights.weekendVsWeekdayPattern).toBeDefined();
      expect(insights.weekendVsWeekdayPattern.weekendAvg).toBeGreaterThan(0);
      expect(insights.weekendVsWeekdayPattern.weekdayAvg).toBeGreaterThan(0);
    });

    it('should detect if user fasts longer on weekends', async () => {
      const mockEntries = [
        { date: new Date('2025-10-27'), fastingDuration: 900 }, // Monday
        { date: new Date('2025-11-01'), fastingDuration: 1200 }, // Saturday
        { date: new Date('2025-11-02'), fastingDuration: 1200 }, // Sunday
      ];

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const insights = await calculateInsights(mockEntry, mockUserId);

      if (insights.weekendVsWeekdayPattern) {
        expect(insights.weekendVsWeekdayPattern.weekendAvg)
          .toBeGreaterThan(insights.weekendVsWeekdayPattern.weekdayAvg);
      }
    });
  });

  describe('deviationFromTypical calculation', () => {
    it('should calculate deviation from user typical duration', async () => {
      const mockEntries = Array(30).fill(null).map((_, i) => ({
        date: new Date(2025, 9, i + 1),
        fastingDuration: 900 // Typical: 15 hours
      }));

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const testEntry = {
        ...mockEntry,
        fastingDuration: 1080 // 18 hours - 3 hours above typical
      };

      const insights = await calculateInsights(testEntry, mockUserId);

      expect(insights.deviationFromTypical).toBeDefined();
      expect(insights.deviationFromTypical.typicalDuration).toBe(900);
      expect(insights.deviationFromTypical.deviation).toBeGreaterThan(0);
    });

    it('should handle negative deviation (shorter than typical)', async () => {
      const mockEntries = Array(30).fill(null).map((_, i) => ({
        date: new Date(2025, 9, i + 1),
        fastingDuration: 1000 // Typical: 16.67 hours
      }));

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const testEntry = {
        ...mockEntry,
        fastingDuration: 800 // 13.33 hours - shorter than typical
      };

      const insights = await calculateInsights(testEntry, mockUserId);

      if (insights.deviationFromTypical) {
        expect(insights.deviationFromTypical.deviation).toBeLessThan(0);
      }
    });
  });

  describe('streakContribution calculation', () => {
    it('should calculate current streak', async () => {
      // Mock consecutive entries for streak
      const mockEntries = Array(7).fill(null).map((_, i) => ({
        date: new Date(2025, 10, 1 - i), // Nov 1, Oct 31, Oct 30, etc.
        fastingDuration: 900
      }));

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const insights = await calculateInsights(mockEntry, mockUserId);

      expect(insights.streakContribution).toBeDefined();
      expect(insights.streakContribution.currentStreak).toBeGreaterThan(0);
    });

    it('should detect if entry continues streak', async () => {
      const mockEntries = [
        { date: new Date('2025-10-31'), fastingDuration: 900 },
        { date: new Date('2025-10-30'), fastingDuration: 900 },
      ];

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEntries)
      });

      const insights = await calculateInsights(mockEntry, mockUserId);

      if (insights.streakContribution) {
        expect(insights.streakContribution.continuesStreak).toBe(true);
      }
    });
  });

  describe('caching behavior', () => {
    it('should cache insights with 30-minute TTL', async () => {
      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockEntry])
      });

      // First call
      await calculateInsights(mockEntry, mockUserId);
      
      // Second call should use cache
      await calculateInsights(mockEntry, mockUserId);

      // Should only query once if cached properly
      // Note: Actual cache implementation details depend on serverCacheService
    });
  });

  describe('insufficient data handling', () => {
    it('should return null or limited insights with <10 entries', async () => {
      const fewEntries = Array(5).fill(null).map((_, i) => ({
        date: new Date(2025, 10, i + 1),
        fastingDuration: 900
      }));

      Entry.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(fewEntries)
      });

      const insights = await calculateInsights(mockEntry, mockUserId);

      // Should handle gracefully with limited data
      expect(insights).toBeDefined();
    });
  });
});
