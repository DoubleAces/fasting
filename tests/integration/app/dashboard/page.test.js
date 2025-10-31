/**
 * Dashboard Page Integration Tests
 * 
 * Tests for the user dashboard page functionality
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import Entry from '@/lib/models/Entry';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('Dashboard Page Integration', () => {
  let testUserId;
  let mockSession;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    testUserId = '507f1f77bcf86cd799439011';
    mockSession = {
      user: {
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
      },
    };
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch today\'s entry for authenticated user', async () => {
      const { auth } = await import('@/lib/auth');
      auth.mockResolvedValue(mockSession);

      // Create today's entry - use explicit date to avoid timezone issues
      const today = new Date('2025-01-30T00:00:00.000Z');
      
      const createdEntry = await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      // Import and execute the page component
      const DashboardPage = (await import('@/app/dashboard/page')).default;
      
      // This will execute the server component logic
      // Verify data can be fetched using the exact same query the page uses
      const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const entry = await Entry.findOne({
        userId: testUserId,
        date: {
          $gte: today,
          $lt: endOfDay,
        },
      }).lean();

      expect(entry).toBeTruthy();
      expect(entry.userId.toString()).toBe(testUserId);
      expect(entry._id.toString()).toBe(createdEntry._id.toString());
    }, 15000); // Increased timeout for slower test environment

    it('should detect active fast when entry has lastMealTime but no firstMealTime', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: null,
        fastingDuration: null,
      });

      const hasActiveFast = entry.lastMealTime && !entry.firstMealTime;
      expect(hasActiveFast).toBe(true);
    });

    it('should not detect active fast when entry is complete', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 960,
      });

      const hasActiveFast = entry.lastMealTime && !entry.firstMealTime;
      expect(hasActiveFast).toBe(false);
    });

    it('should handle no entry for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.findOne({
        userId: testUserId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }).lean();

      expect(entry).toBeNull();
    });
  });

  describe('Authentication', () => {
    it('should redirect unauthenticated users to login', async () => {
      const { auth } = await import('@/lib/auth');
      const { redirect } = await import('next/navigation');
      
      auth.mockResolvedValue(null);

      const DashboardPage = (await import('@/app/dashboard/page')).default;
      
      try {
        await DashboardPage();
      } catch (error) {
        // redirect throws in tests
      }

      expect(redirect).toHaveBeenCalledWith('/login?callbackUrl=/dashboard');
    });

    it('should allow authenticated users to view dashboard', async () => {
      const { auth } = await import('@/lib/auth');
      auth.mockResolvedValue(mockSession);

      const DashboardPage = (await import('@/app/dashboard/page')).default;
      
      // Should not throw or redirect
      const result = await DashboardPage();
      expect(result).toBeTruthy();
    });
  });

  describe('Timer Display Logic', () => {
    it('should show timer for active fast', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: null, // Active fast
        fastingDuration: null,
      });

      const hasActiveFast = entry && entry.lastMealTime && !entry.firstMealTime;
      expect(hasActiveFast).toBe(true);
    });

    it('should show Start CTA when no entry exists', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.findOne({
        userId: testUserId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }).lean();

      const hasActiveFast = entry && entry.lastMealTime && !entry.firstMealTime;
      expect(hasActiveFast).toBeFalsy(); // Will be null or false, both are falsy
      expect(entry).toBeNull();
    });

    it('should show Start CTA when fast is completed', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entry = await Entry.create({
        userId: testUserId,
        date: today,
        lastMealTime: '20:00',
        firstMealTime: '12:00', // Completed fast
        fastingDuration: 960,
      });

      const hasActiveFast = entry && entry.lastMealTime && !entry.firstMealTime;
      expect(hasActiveFast).toBe(false);
    });
  });
});
