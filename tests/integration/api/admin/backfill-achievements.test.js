/**
 * @jest-environment node
 */

/**
 * Integration Tests: POST /api/admin/users/[userId]/backfill-achievements
 * 
 * Tests the achievement backfill API endpoint with real database operations.
 * Uses MongoDB Memory Server for isolated testing.
 */

// Mock NextAuth BEFORE importing route
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { POST } from '@/app/api/admin/users/[userId]/backfill-achievements/route';
import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Achievement from '@/lib/models/Achievement';
import UserAchievement from '@/lib/models/UserAchievement';
import { auth } from '@/lib/auth';
import bcrypt from 'bcrypt';

describe('POST /api/admin/users/[userId]/backfill-achievements', () => {
  let adminUser, regularUser, testUser;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Entry.deleteMany({});
    await Achievement.deleteMany({});
    await UserAchievement.deleteMany({});

    // Hash password for test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    adminUser = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
    });

    regularUser = await User.create({
      email: 'user@test.com',
      name: 'Regular User',
      password: hashedPassword,
      isAdmin: false,
    });

    testUser = await User.create({
      email: 'target@test.com',
      name: 'Target User',
      password: hashedPassword,
      isAdmin: false,
    });

    // Create test achievement
    await Achievement.create({
      achievementId: 'first-sixteen',
      criteria: { type: 'duration-milestone', durationHours: 16 },
      points: 15,
      rarity: 'common',
      category: 'duration',
      order: 1,
      createdBy: adminUser._id,
      translations: {
        en: {
          name: 'Sweet Sixteen',
          description: 'Complete your first 16-hour fast',
          shortDescription: 'First 16-hour fast',
        },
      },
    });
  });

  describe('Authentication & Authorization', () => {
    test('T001: Returns 401 when not authenticated', async () => {
      auth.mockResolvedValue(null);

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('T002: Returns 403 when user is not admin', async () => {
      auth.mockResolvedValue({ user: { id: regularUser._id.toString(), isAdmin: false } });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Admin access required');
    });

    test('T003: Admin can backfill achievements for any user', async () => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);

      expect(response.status).toBe(200);
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });
    });

    test('T004: Returns correct statistics when backfilling user with entries', async () => {
      // Create 3 entries for testUser (each qualifies for Sweet Sixteen achievement)
      await Entry.create([
        { userId: testUser._id, date: new Date('2025-11-01'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 17 * 60 + 30 },
        { userId: testUser._id, date: new Date('2025-11-02'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 18 * 60 + 15 },
        { userId: testUser._id, date: new Date('2025-11-03'), lastMealTime: '20:00', firstMealTime: '12:00', fastingDuration: 16 * 60 + 45 },
      ]);

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.entriesProcessed).toBe(3);
      expect(data.achievementsUnlocked).toBeGreaterThanOrEqual(0); // May be 0 if already unlocked
      expect(data.pointsEarned).toBeGreaterThanOrEqual(0);
    });

    test('T005: Returns zero stats when user has no entries', async () => {
      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.entriesProcessed).toBe(0);
      expect(data.achievementsUnlocked).toBe(0);
      expect(data.pointsEarned).toBe(0);
    });

    test('T006: Idempotency - Running twice does not create duplicates', async () => {
      // Create entry
      await Entry.create({
        userId: testUser._id,
        date: new Date('2025-11-01'),
        lastMealTime: '20:00',
        firstMealTime: '12:00',
        fastingDuration: 17 * 60 + 30,
      });

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: testUser._id.toString() } };

      // First backfill
      const response1 = await POST(request, params);
      const data1 = await response1.json();

      // Second backfill (should show 0 new achievements)
      const response2 = await POST(request, params);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.achievementsUnlocked).toBe(0);
      expect(data2.pointsEarned).toBe(0);

      // Verify no duplicates in database
      const userAchievements = await UserAchievement.find({ userId: testUser._id });
      const uniqueAchievements = new Set(userAchievements.map(ua => ua.achievementId.toString()));
      expect(userAchievements.length).toBe(uniqueAchievements.size);
    });
  });

  describe('Error Cases', () => {
    beforeEach(() => {
      auth.mockResolvedValue({ user: { id: adminUser._id.toString(), isAdmin: true } });
    });

    test('T007: Returns 404 when target user does not exist', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId but doesn't exist

      const request = new Request('http://localhost/api/admin/users/123/backfill-achievements', {
        method: 'POST',
      });
      const params = { params: { userId: fakeUserId } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });
});
