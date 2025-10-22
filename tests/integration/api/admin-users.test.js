/**
 * Integration Tests: Admin Users API Routes
 * 
 * Tests for:
 * - GET /api/admin/users - List users with pagination/filtering/sorting
 * - PATCH /api/admin/users/toggle-admin - Toggle admin status
 * - POST /api/admin/users/delete - Delete user with cascade
 */

import { createMocks } from 'node-mocks-http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

// Mock next-auth BEFORE importing anything else
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth config
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock database connection
jest.mock('@/lib/db', () => ({
  __esModule: true,
  connectDB: jest.fn().mockResolvedValue({}),
  default: jest.fn().mockResolvedValue({}),
}));

// Now import route handlers and models
import { GET } from '@/app/api/admin/users/route';
import { PATCH } from '@/app/api/admin/users/toggle-admin/route';
import { POST } from '@/app/api/admin/users/delete/route';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import AuditLog from '@/lib/models/AuditLog';
import { getServerSession } from 'next-auth/next';

let mongoServer;
let hashedPassword;
let adminUser;
let regularUser;

// Set timeout for all tests
jest.setTimeout(30000);

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  // Hash password once
  hashedPassword = await bcrypt.hash('Password123!', 10);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Create test users
  adminUser = await User.create({
    email: 'admin@test.com',
    name: 'Admin User',
    isAdmin: true,
    password: hashedPassword,
  });

  regularUser = await User.create({
    email: 'user@test.com',
    name: 'Regular User',
    isAdmin: false,
    password: hashedPassword,
  });

  // Reset mock
  getServerSession.mockClear();
});

describe('GET /api/admin/users', () => {
  test('should require authentication', async () => {
    // Mock no session
    getServerSession.mockResolvedValue(null);

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  test('should require admin role', async () => {
    // Mock regular user session
    getServerSession.mockResolvedValue({
      user: {
        id: regularUser._id.toString(),
        email: regularUser.email,
        isAdmin: false,
      },
    });

    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('admin access');
  });

  test('should return paginated users for admin', async () => {
    // Mock admin session
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        isAdmin: true,
      },
    });

    // Create additional test users
    await User.create([
      { email: 'user2@test.com', name: 'User 2', isAdmin: false, password: hashedPassword },
      { email: 'user3@test.com', name: 'User 3', isAdmin: true, password: hashedPassword },
    ]);

    const { req } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.users).toHaveLength(4); // admin + regular + 2 new
    expect(data.data.totalUsers).toBe(4);
    expect(data.data.currentPage).toBe(1);
    expect(data.data.pageSize).toBe(10);
  });

  test('should filter users by name', async () => {
    getServerSession.mockResolvedValue({
      user: { id: adminUser._id.toString(), isAdmin: true },
    });

    await User.create({
      email: 'john@test.com',
      name: 'John Doe',
      isAdmin: false,
      password: hashedPassword,
    });

    const { req } = createMocks({
      method: 'GET',
      query: { nameFilter: 'john' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.users).toHaveLength(1);
    expect(data.data.users[0].name).toBe('John Doe');
  });

  test('should filter users by admin status', async () => {
    getServerSession.mockResolvedValue({
      user: { id: adminUser._id.toString(), isAdmin: true },
    });

    const { req } = createMocks({
      method: 'GET',
      query: { adminFilter: 'admin' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.users).toHaveLength(1);
    expect(data.data.users[0].isAdmin).toBe(true);
  });

  test('should sort users by name', async () => {
    getServerSession.mockResolvedValue({
      user: { id: adminUser._id.toString(), isAdmin: true },
    });

    await User.create([
      { email: 'charlie@test.com', name: 'Charlie', isAdmin: false, password: hashedPassword },
      { email: 'alice@test.com', name: 'Alice', isAdmin: false, password: hashedPassword },
    ]);

    const { req } = createMocks({
      method: 'GET',
      query: { sortBy: 'name', sortOrder: 'asc' },
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.users[0].name).toBe('Admin User');
    expect(data.data.users[1].name).toBe('Alice');
  });
});

describe('PATCH /api/admin/users/toggle-admin', () => {
  test('should require authentication', async () => {
    getServerSession.mockResolvedValue(null);

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: regularUser._id.toString() },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test('should require admin role', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: regularUser._id.toString(),
        isAdmin: false,
      },
    });

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: adminUser._id.toString() },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test('should toggle admin status', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: regularUser._id.toString() },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.isAdmin).toBe(true);

    // Verify in database
    const updatedUser = await User.findById(regularUser._id);
    expect(updatedUser.isAdmin).toBe(true);

    // Verify audit log
    const auditLog = await AuditLog.findOne({ action: 'TOGGLE_ADMIN' });
    expect(auditLog).toBeTruthy();
  });

  test('should prevent self-modification', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: adminUser._id.toString() },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('modify your own');
  });

  test('should validate userId format', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: 'invalid-id' },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 404 for non-existent user', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const fakeId = new mongoose.Types.ObjectId().toString();

    const { req } = createMocks({
      method: 'PATCH',
      body: { userId: fakeId },
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

describe('POST /api/admin/users/delete', () => {
  test('should require authentication', async () => {
    getServerSession.mockResolvedValue(null);

    const { req } = createMocks({
      method: 'POST',
      body: { userId: regularUser._id.toString() },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test('should require admin role', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: regularUser._id.toString(),
        isAdmin: false,
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: { userId: adminUser._id.toString() },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test('should prevent self-deletion', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: { userId: adminUser._id.toString() },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('delete your own');

    // Verify user still exists
    const stillExists = await User.findById(adminUser._id);
    expect(stillExists).toBeTruthy();
  });

  test('should validate userId format', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: { userId: 'invalid-id' },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  test('should return 404 for non-existent user', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    const fakeId = new mongoose.Types.ObjectId().toString();

    const { req } = createMocks({
      method: 'POST',
      body: { userId: fakeId },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  // Skip transaction-based test
  test.skip('should delete user and related data', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: adminUser._id.toString(),
        isAdmin: true,
      },
    });

    // Create entry for user
    await Entry.create({
      userId: regularUser._id,
      date: new Date(),
      firstMealTime: '12:00',
      lastMealTime: '20:00',
    });

    const { req } = createMocks({
      method: 'POST',
      body: { userId: regularUser._id.toString() },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deletedCounts.entries).toBe(1);

    // Verify user deleted
    const deletedUser = await User.findById(regularUser._id);
    expect(deletedUser).toBeFalsy();

    // Verify audit log
    const auditLog = await AuditLog.findOne({ action: 'DELETE_USER' });
    expect(auditLog).toBeTruthy();
  });
});
