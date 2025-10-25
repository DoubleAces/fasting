/**
 * Integration tests for DELETE /api/entries/[id]
 * Regression tests for checkOnly parameter handling (BUG-001)
 * 
 * These tests verify that the checkOnly parameter correctly prevents deletion
 * during the "preview" phase of the delete operation, ensuring users can see
 * the impact before actually deleting an entry.
 */

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: !init?.status || (init.status >= 200 && init.status < 300),
      headers: new Map(),
    }),
  },
}));

import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import { generateTestToken } from '../helpers/authHelper.js';
import { DELETE } from '@/app/api/entries/[id]/route';
import { auth } from '@/lib/auth';
import bcrypt from 'bcrypt';

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('DELETE /api/entries/[id] - checkOnly parameter', () => {
  let testUser;
  let authToken;
  let testEntry;

  beforeAll(async () => {
    await connectDB();
    
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = new User({
      email: 'delete-test@example.com',
      name: 'Delete Test',
      password: hashedPassword,
    });
    await testUser.save();

    authToken = generateTestToken(testUser._id, testUser.email);
  });

  afterAll(async () => {
    if (testUser) {
      await Entry.deleteMany({ userId: testUser._id });
      await User.findByIdAndDelete(testUser._id);
    }
    await disconnectDB();
  });

  beforeEach(async () => {
    // Mock auth session
    auth.mockResolvedValue({
      user: {
        id: testUser._id.toString(),
        email: testUser.email,
      },
    });

    // Create test entry before each test
    testEntry = new Entry({
      userId: testUser._id,
      date: new Date('2025-10-24T12:00:00.000Z'),
      firstMealTime: '09:30',
      lastMealTime: '16:10',
    });
    await testEntry.save();
  });

  afterEach(async () => {
    await Entry.deleteMany({ userId: testUser._id });
  });

  describe('checkOnly=true behavior (BUG-001)', () => {
    it('should NOT delete entry when checkOnly=true', async () => {
      // Create request with checkOnly=true
      const url = `http://localhost:3000/api/entries/${testEntry._id}?checkOnly=true`;
      const request = new Request(url, {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: testEntry._id.toString() });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('extendedFastCreated');
      
      // Verify entry still exists
      const entryStillExists = await Entry.findById(testEntry._id);
      expect(entryStillExists).not.toBeNull();
    });

    it('should return extended fast info when checkOnly=true', async () => {
      // Create a next entry to trigger extended fast calculation
      const nextEntry = new Entry({
        userId: testUser._id,
        date: new Date('2025-10-25T12:00:00.000Z'),
        firstMealTime: '12:30',
        lastMealTime: '18:00',
      });
      await nextEntry.save();

      const url = `http://localhost:3000/api/entries/${testEntry._id}?checkOnly=true`;
      const request = new Request(url, {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: testEntry._id.toString() });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.extendedFastCreated).toBe(true);
      expect(data.extendedFastInfo).toBeDefined();
      expect(data.extendedFastInfo).toHaveProperty('duration');
    });

    it('should actually delete when checkOnly is not provided', async () => {
      const url = `http://localhost:3000/api/entries/${testEntry._id}`;
      const request = new Request(url, {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: testEntry._id.toString() });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(200);
      
      // Verify entry was actually deleted
      const entryDeleted = await Entry.findById(testEntry._id);
      expect(entryDeleted).toBeNull();
    });

    it('should handle checkOnly for entry with no next entry', async () => {
      const url = `http://localhost:3000/api/entries/${testEntry._id}?checkOnly=true`;
      const request = new Request(url, {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: testEntry._id.toString() });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.extendedFastCreated).toBe(false);
      expect(data.extendedFastInfo).toBeNull();
      
      // Entry should still exist
      const entryStillExists = await Entry.findById(testEntry._id);
      expect(entryStillExists).not.toBeNull();
    });

    it('should fail gracefully if entry not found during checkOnly', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const url = `http://localhost:3000/api/entries/${fakeId}?checkOnly=true`;
      const request = new Request(url, {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: fakeId });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });
  });

  describe('Actual deletion behavior', () => {
    it('should return 404 on second delete attempt', async () => {
      // First delete (actual)
      const url1 = `http://localhost:3000/api/entries/${testEntry._id}`;
      const request1 = new Request(url1, {
        method: 'DELETE',
      });
      const params1 = Promise.resolve({ id: testEntry._id.toString() });
      await DELETE(request1, { params: params1 });

      // Second delete attempt (should fail)
      const url2 = `http://localhost:3000/api/entries/${testEntry._id}`;
      const request2 = new Request(url2, {
        method: 'DELETE',
      });
      const params2 = Promise.resolve({ id: testEntry._id.toString() });
      const response = await DELETE(request2, { params: params2 });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it('should not fail if checkOnly=true then actual delete in sequence', async () => {
      // First request with checkOnly=true
      const url1 = `http://localhost:3000/api/entries/${testEntry._id}?checkOnly=true`;
      const request1 = new Request(url1, {
        method: 'DELETE',
      });
      const params1 = Promise.resolve({ id: testEntry._id.toString() });
      const response1 = await DELETE(request1, { params: params1 });
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1).toHaveProperty('extendedFastCreated');

      // Second request without checkOnly (actual delete)
      const url2 = `http://localhost:3000/api/entries/${testEntry._id}`;
      const request2 = new Request(url2, {
        method: 'DELETE',
      });
      const params2 = Promise.resolve({ id: testEntry._id.toString() });
      const response2 = await DELETE(request2, { params: params2 });

      expect(response2.status).toBe(200);

      // Verify entry was actually deleted
      const entryDeleted = await Entry.findById(testEntry._id);
      expect(entryDeleted).toBeNull();
    });
  });
});
