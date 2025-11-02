/**
 * Entry Comparison Service Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T057 - Unit test for comparison statistics calculations
 * 
 * Tests calculateComparisons function for This Month, Last Month, All Time stats.
 */

import { calculateComparisons } from '@/lib/services/entryInsightsService';
import { connectDB } from '@/lib/db';
import Entry from '@/lib/models/Entry';

// Mock database connection
jest.mock('@/lib/db');
jest.mock('@/lib/models/Entry');

describe('Entry Comparison Calculations (US3)', () => {
  const mockUserId = '507f1f77bcf86cd799439012';
  const mockEntry = {
    _id: '507f1f77bcf86cd799439011',
    userId: mockUserId,
    date: new Date('2025-11-01'),
    fastingDuration: 960 // 16 hours
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connectDB.mockResolvedValue(true);
  });

  describe('This Month comparison', () => {
    it('should calculate this month average and difference', async () => {
      const thisMonthEntries = [
        { date: new Date('2025-11-01'), fastingDuration: 960 },
        { date: new Date('2025-10-30'), fastingDuration: 900 },
        { date: new Date('2025-10-29'), fastingDuration: 920 },
        { date: new Date('2025-10-28'), fastingDuration: 880 },
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(thisMonthEntries)
      });

      const comparisons = await calculateComparisons(mockEntry, mockUserId);

      expect(comparisons.thisMonth).toBeDefined();
      expect(comparisons.thisMonth.average).toBeGreaterThan(0);
      expect(comparisons.thisMonth.count).toBe(4);
      expect(comparisons.thisMonth.difference).toBeDefined();
    });
  });

  describe('Last Month comparison', () => {
    it('should calculate last month average', async () => {
      const lastMonthEntries = [
        { date: new Date('2025-09-15'), fastingDuration: 900 },
        { date: new Date('2025-09-16'), fastingDuration: 920 },
        { date: new Date('2025-09-17'), fastingDuration: 880 },
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(lastMonthEntries)
      });

      const comparisons = await calculateComparisons(mockEntry, mockUserId);

      expect(comparisons.lastMonth).toBeDefined();
      expect(comparisons.lastMonth.count).toBe(3);
    });

    it('should return null for last month if no entries', async () => {
      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const comparisons = await calculateComparisons(mockEntry, mockUserId);

      expect(comparisons.lastMonth.average).toBeNull();
      expect(comparisons.lastMonth.count).toBe(0);
    });
  });

  describe('All Time comparison', () => {
    it('should calculate all time average', async () => {
      const allEntries = [
        { fastingDuration: 900 },
        { fastingDuration: 920 },
        { fastingDuration: 880 },
        { fastingDuration: 940 },
        { fastingDuration: 960 },
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(allEntries)
      });

      const comparisons = await calculateComparisons(mockEntry, mockUserId);

      expect(comparisons.allTime).toBeDefined();
      expect(comparisons.allTime.count).toBe(5);
      expect(comparisons.allTime.average).toBeGreaterThan(0);
    });
  });

  describe('Percentage calculations', () => {
    it('should calculate positive percentage difference', async () => {
      const entries = [
        { fastingDuration: 800 }, // avg = 800
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(entries)
      });

      const testEntry = { ...mockEntry, fastingDuration: 960 }; // 20% higher
      const comparisons = await calculateComparisons(testEntry, mockUserId);

      expect(comparisons.thisMonth.percentDifference).toBeGreaterThan(0);
    });

    it('should calculate negative percentage difference', async () => {
      const entries = [
        { fastingDuration: 1000 }, // avg = 1000
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(entries)
      });

      const testEntry = { ...mockEntry, fastingDuration: 800 }; // 20% lower
      const comparisons = await calculateComparisons(testEntry, mockUserId);

      expect(comparisons.thisMonth.percentDifference).toBeLessThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle entry with no fasting duration', async () => {
      const entryWithoutDuration = { ...mockEntry, fastingDuration: null };

      const comparisons = await calculateComparisons(entryWithoutDuration, mockUserId);

      expect(comparisons).toBeNull();
    });

    it('should exclude current entry from averages', async () => {
      const entries = [
        { _id: mockEntry._id, fastingDuration: 960 }, // Current entry
        { _id: 'other1', fastingDuration: 900 },
        { _id: 'other2', fastingDuration: 920 },
      ];

      Entry.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(entries)
      });

      const comparisons = await calculateComparisons(mockEntry, mockUserId);

      // Should only count the 2 other entries
      expect(comparisons.thisMonth.count).toBe(2);
    });
  });
});
