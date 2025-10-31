/**
 * Dashboard Service Tests
 * 
 * Tests for streak calculation and dashboard stats aggregation
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import Entry from '@/lib/models/Entry';
import { calculateStreak, calculateDashboardStats } from '@/lib/services/dashboardService';
import { subDays } from 'date-fns';

describe('Dashboard Service', () => {
  let testUserId;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    testUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId
  });

  describe('calculateStreak', () => {
    it('should return 0 for user with no entries', async () => {
      const streak = await calculateStreak(testUserId);
      expect(streak).toBe(0);
    });

    it('should return 1 for user with single entry', async () => {
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-30'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const streak = await calculateStreak(testUserId);
      expect(streak).toBe(1);
    });

    it('should calculate consecutive days streak correctly', async () => {
      // Create 5 consecutive days of entries
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-30'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-29'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-28'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-27'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: new Date('2025-10-26'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const streak = await calculateStreak(testUserId);
      expect(streak).toBe(5);
    });

    it('should break streak at first gap', async () => {
      // Create entries: today, yesterday, then skip a day, then 2 more
      const today = new Date('2025-10-30');
      await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: subDays(today, 1),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      // Gap here (skip day -2)
      await Entry.create({
        userId: testUserId,
        date: subDays(today, 3),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: subDays(today, 4),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const streak = await calculateStreak(testUserId);
      expect(streak).toBe(2); // Only today and yesterday count
    });

    it('should handle entries not in order', async () => {
      // Create entries out of order
      const today = new Date('2025-10-30');
      await Entry.create({
        userId: testUserId,
        date: subDays(today, 2),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });
      await Entry.create({
        userId: testUserId,
        date: subDays(today, 1),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const streak = await calculateStreak(testUserId);
      expect(streak).toBe(3); // Service should sort correctly
    });
  });

  describe('calculateDashboardStats', () => {
    it('should return all zeros/null for user with no entries', async () => {
      const stats = await calculateDashboardStats(testUserId);
      expect(stats).toEqual({
        currentStreak: 0,
        totalFasts: 0,
        averageDuration: null,
      });
    });

    it('should return correct stats for user with <7 entries', async () => {
      // Create 3 consecutive entries
      const today = new Date('2025-10-30');
      for (let i = 0; i < 3; i++) {
        await Entry.create({
          userId: testUserId,
          date: subDays(today, i),
          lastMealTime: '20:00',
          firstMealTime: '12:00',
          fastingDuration: 960,
        });
      }

      const stats = await calculateDashboardStats(testUserId);
      expect(stats.currentStreak).toBe(3);
      expect(stats.totalFasts).toBe(3);
      expect(stats.averageDuration).toBeNull(); // <7 entries
    });

    it('should return correct stats for user with 7+ entries', async () => {
      // Create 10 entries (7 consecutive, then gap, then 3 more)
      // First 7 consecutive (Oct 30 to Oct 24)
      await Entry.create({ userId: testUserId, date: new Date('2025-10-30'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 960 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-29'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1020 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-28'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1080 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-27'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1140 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-26'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1200 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-25'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1260 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-24'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 1320 });
      
      // Gap here (skip Oct 23)
      
      // 3 more entries (Oct 22, 21, 20 - all within 30 days)
      await Entry.create({ userId: testUserId, date: new Date('2025-10-22'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 960 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-21'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 960 });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-20'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 960 });

      const stats = await calculateDashboardStats(testUserId);
      expect(stats.currentStreak).toBe(7);
      expect(stats.totalFasts).toBe(10);
      expect(stats.averageDuration).toBeGreaterThan(0); // Should have average
    });

    it('should handle entries with null fastingDuration', async () => {
      // Create 5 consecutive entries without durations
      await Entry.create({ userId: testUserId, date: new Date('2025-10-30'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: null });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-29'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: null });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-28'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: null });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-27'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: null });
      await Entry.create({ userId: testUserId, date: new Date('2025-10-26'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: null });

      const stats = await calculateDashboardStats(testUserId);
      expect(stats.currentStreak).toBe(5); // Streak counts all entries
      expect(stats.totalFasts).toBe(5);
      expect(stats.averageDuration).toBeNull(); // No durations to average
    });
  });
});
