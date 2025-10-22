/**
 * Unit Tests: userService
 * 
 * Tests for user service methods:
 * - getPaginatedUsers
 * - toggleAdminStatus
 * - deleteUserWithCascade
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';
import {
  getPaginatedUsers,
  toggleAdminStatus,
  deleteUserWithCascade,
} from '@/lib/services/userService';
import User from '@/lib/models/User';
import Entry from '@/lib/models/Entry';
import Settings from '@/lib/models/Settings';
import InvalidatedToken from '@/lib/models/InvalidatedToken';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import AuditLog from '@/lib/models/AuditLog';

// Mock the database connection to prevent connecting to real MongoDB
jest.mock('@/lib/db', () => ({
  __esModule: true,
  connectDB: jest.fn().mockResolvedValue({}),
  default: jest.fn().mockResolvedValue({}),
}));

let mongoServer;
let hashedPassword; // Reusable hashed password for tests

// Set timeout for all tests in this file (30 seconds)
jest.setTimeout(30000);

beforeAll(async () => {
  // Create in-memory MongoDB instance (without replica set - simpler and faster)
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  // Mock startSession to avoid requiring replica set for transactions
  // Create a more complete session mock that Mongoose can work with
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
    inTransaction: jest.fn().mockReturnValue(true),
    id: { id: Buffer.from('test') },
    transaction: {
      state: 'STARTING_TRANSACTION',
    },
    // Make it compatible with Mongoose model operations
    [Symbol.for('mongoose#connection')]: null,
  };
  
  mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

  // Hash password once for reuse in all tests
  hashedPassword = await bcrypt.hash('Password123!', 10);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('userService - getPaginatedUsers', () => {
  test('should return paginated users with default params', async () => {
    // Create test users
    await User.create([
      { email: 'user1@test.com', name: 'User 1', isAdmin: false, password: hashedPassword },
      { email: 'user2@test.com', name: 'User 2', isAdmin: true, password: hashedPassword },
      { email: 'user3@test.com', name: 'User 3', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
    });

    expect(result.users).toHaveLength(3);
    expect(result.totalUsers).toBe(3);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  test('should filter users by name', async () => {
    await User.create([
      { email: 'john@test.com', name: 'John Doe', isAdmin: false, password: hashedPassword },
      { email: 'jane@test.com', name: 'Jane Smith', isAdmin: false, password: hashedPassword },
      { email: 'bob@test.com', name: 'Bob Johnson', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      nameFilter: 'john',
    });

    expect(result.users).toHaveLength(2); // John Doe and Bob Johnson
    expect(result.users[0].name).toMatch(/john/i);
    expect(result.users[1].name).toMatch(/john/i);
  });

  test('should filter users by email', async () => {
    await User.create([
      { email: 'user@example.com', name: 'User 1', isAdmin: false, password: hashedPassword },
      { email: 'admin@example.com', name: 'User 2', isAdmin: true, password: hashedPassword },
      { email: 'user@test.com', name: 'User 3', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      emailFilter: 'example',
    });

    expect(result.users).toHaveLength(2);
    expect(result.users[0].email).toContain('example');
    expect(result.users[1].email).toContain('example');
  });

  test('should filter users by admin status - admin only', async () => {
    await User.create([
      { email: 'user1@test.com', name: 'User 1', isAdmin: false, password: hashedPassword },
      { email: 'admin1@test.com', name: 'Admin 1', isAdmin: true, password: hashedPassword },
      { email: 'admin2@test.com', name: 'Admin 2', isAdmin: true, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      adminFilter: 'admin',
    });

    expect(result.users).toHaveLength(2);
    expect(result.users.every(u => u.isAdmin)).toBe(true);
  });

  test('should filter users by admin status - non-admin only', async () => {
    await User.create([
      { email: 'user1@test.com', name: 'User 1', isAdmin: false, password: hashedPassword },
      { email: 'user2@test.com', name: 'User 2', isAdmin: false, password: hashedPassword },
      { email: 'admin1@test.com', name: 'Admin 1', isAdmin: true, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      adminFilter: 'non-admin',
    });

    expect(result.users).toHaveLength(2);
    expect(result.users.every(u => !u.isAdmin)).toBe(true);
  });

  test('should sort users by name ascending', async () => {
    await User.create([
      { email: 'user3@test.com', name: 'Charlie', isAdmin: false, password: hashedPassword },
      { email: 'user1@test.com', name: 'Alice', isAdmin: false, password: hashedPassword },
      { email: 'user2@test.com', name: 'Bob', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });

    expect(result.users[0].name).toBe('Alice');
    expect(result.users[1].name).toBe('Bob');
    expect(result.users[2].name).toBe('Charlie');
  });

  test('should sort users by name descending', async () => {
    await User.create([
      { email: 'user3@test.com', name: 'Charlie', isAdmin: false, password: hashedPassword },
      { email: 'user1@test.com', name: 'Alice', isAdmin: false, password: hashedPassword },
      { email: 'user2@test.com', name: 'Bob', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'desc',
    });

    expect(result.users[0].name).toBe('Charlie');
    expect(result.users[1].name).toBe('Bob');
    expect(result.users[2].name).toBe('Alice');
  });

  test('should paginate users correctly', async () => {
    // Create 25 users
    const users = Array.from({ length: 25 }, (_, i) => ({
      email: `user${i}@test.com`,
      name: `User ${i}`,
      isAdmin: false,
      password: hashedPassword,
    }));
    await User.create(users);

    // Get first page
    const page1 = await getPaginatedUsers({
      page: 1,
      limit: 10,
    });

    expect(page1.users).toHaveLength(10);
    expect(page1.totalUsers).toBe(25);
    expect(page1.totalPages).toBe(3);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.hasPrevPage).toBe(false);

    // Get second page
    const page2 = await getPaginatedUsers({
      page: 2,
      limit: 10,
    });

    expect(page2.users).toHaveLength(10);
    expect(page2.currentPage).toBe(2);
    expect(page2.hasNextPage).toBe(true);
    expect(page2.hasPrevPage).toBe(true);

    // Get last page
    const page3 = await getPaginatedUsers({
      page: 3,
      limit: 10,
    });

    expect(page3.users).toHaveLength(5);
    expect(page3.currentPage).toBe(3);
    expect(page3.hasNextPage).toBe(false);
    expect(page3.hasPrevPage).toBe(true);
  });

  test('should return empty results when no users match filters', async () => {
    await User.create([
      { email: 'user@test.com', name: 'User 1', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 1,
      limit: 10,
      nameFilter: 'nonexistent',
    });

    expect(result.users).toHaveLength(0);
    expect(result.totalUsers).toBe(0);
  });

  test('should handle invalid page numbers gracefully', async () => {
    await User.create([
      { email: 'user@test.com', name: 'User 1', isAdmin: false, password: hashedPassword },
    ]);

    const result = await getPaginatedUsers({
      page: 999,
      limit: 10,
    });

    expect(result.users).toHaveLength(0);
    expect(result.currentPage).toBe(999);
    expect(result.totalPages).toBe(1);
  });
});

describe('userService - toggleAdminStatus', () => {
  test('should toggle admin status from false to true', async () => {
    const user = await User.create({
      email: 'user@test.com',
      name: 'Test User',
      isAdmin: false,
      password: hashedPassword,
    });

    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });


    const result = await toggleAdminStatus(user._id.toString(), admin._id.toString());

    expect(result.success).toBe(true);
    expect(result.user.isAdmin).toBe(true);
    expect(result.user._id.toString()).toBe(user._id.toString());

    // Verify user in database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.isAdmin).toBe(true);

    // Verify audit log created
    const auditLog = await AuditLog.findOne({ action: 'TOGGLE_ADMIN' });
    expect(auditLog).toBeTruthy();
    expect(auditLog.performedBy.toString()).toBe(admin._id.toString());
    expect(auditLog.targetUser.toString()).toBe(user._id.toString());
  });

  test('should toggle admin status from true to false', async () => {
    const user = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });

    const performingAdmin = await User.create({
      email: 'superadmin@test.com',
      name: 'Super Admin',
      isAdmin: true,
      password: hashedPassword,
    });


    const result = await toggleAdminStatus(user._id.toString(), performingAdmin._id.toString());

    expect(result.success).toBe(true);
    expect(result.user.isAdmin).toBe(false);

    // Verify user in database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.isAdmin).toBe(false);
  });

  test('should reject self-modification with 403', async () => {
    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });

    // Expect the function to throw an error
    await expect(
      toggleAdminStatus(admin._id.toString(), admin._id.toString())
    ).rejects.toThrow('Cannot modify your own admin status');

    // Verify user unchanged
    const unchangedUser = await User.findById(admin._id);
    expect(unchangedUser.isAdmin).toBe(true);

    // Verify no InvalidatedToken created
    const token = await InvalidatedToken.findOne({ userId: admin._id });
    expect(token).toBeFalsy();
  });

  test('should return 404 when user not found', async () => {
    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });

    const fakeUserId = new mongoose.Types.ObjectId().toString();
    
    await expect(
      toggleAdminStatus(fakeUserId, admin._id.toString())
    ).rejects.toThrow('User not found');
  });

  test('should handle database error gracefully', async () => {
    const user = await User.create({
      email: 'user@test.com',
      name: 'Test User',
      isAdmin: false,
      password: hashedPassword,
    });

    // Use invalid ObjectId to trigger error
    await expect(
      toggleAdminStatus(user._id.toString(), 'invalid-object-id')
    ).rejects.toThrow();
  });
});

describe('userService - deleteUserWithCascade', () => {
  test.skip('should delete user with all related data', async () => {
    const user = await User.create({
      email: 'user@test.com',
      name: 'Test User',
      isAdmin: false,
      password: hashedPassword,
    });


    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });


    // Create related data
    await Entry.create([
      { 
        userId: user._id, 
        date: new Date(), 
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      },
      { 
        userId: user._id, 
        date: new Date(Date.now() - 86400000), // yesterday
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      },
    ]);

    await Settings.create({
      userId: user._id,
      theme: 'light',
    });

    await InvalidatedToken.create({
      userId: user._id,
      invalidatedAt: new Date(),
      reason: 'security',
    });

    await PasswordResetToken.create({
      userId: user._id,
      token: 'a'.repeat(64), // 64-character hexadecimal string
      expiresAt: new Date(Date.now() + 3600000),
    });

    const result = await deleteUserWithCascade(user._id.toString(), admin._id.toString());

    expect(result.success).toBe(true);
    expect(result.deletedCounts.entries).toBe(2);
    expect(result.deletedCounts.settings).toBe(1);
    expect(result.deletedCounts.invalidatedTokens).toBe(1);
    expect(result.deletedCounts.passwordResetTokens).toBe(1);
    expect(result.user.email).toBe('user@test.com');

    // Verify user deleted
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeFalsy();

    // Verify related data deleted
    const entries = await Entry.find({ userId: user._id });
    expect(entries).toHaveLength(0);

    const settings = await Settings.find({ userId: user._id });
    expect(settings).toHaveLength(0);

    const tokens = await InvalidatedToken.find({ userId: user._id });
    expect(tokens).toHaveLength(0);

    const resetTokens = await PasswordResetToken.find({ userId: user._id });
    expect(resetTokens).toHaveLength(0);

    // Verify audit log created
    const auditLog = await AuditLog.findOne({ action: 'delete_user' });
    expect(auditLog).toBeTruthy();
    expect(auditLog.performedBy.toString()).toBe(admin._id.toString());
  });

  test('should reject self-deletion with 403', async () => {
    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });

    await expect(
      deleteUserWithCascade(admin._id.toString(), admin._id.toString())
    ).rejects.toThrow('Admins cannot delete their own account');

    // Verify user not deleted
    const stillExists = await User.findById(admin._id);
    expect(stillExists).toBeTruthy();
  });

  test('should return 404 when user not found', async () => {
    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });


    const fakeUserId = new mongoose.Types.ObjectId().toString();
    
    await expect(
      deleteUserWithCascade(fakeUserId, admin._id.toString())
    ).rejects.toThrow('User not found');
  });

  // Note: Tests with transactions are skipped because MongoMemoryServer
  // doesn't support transactions without replica set configuration
  test.skip('should handle user with no related data', async () => {
    const user = await User.create({
      email: 'user@test.com',
      name: 'Test User',
      isAdmin: false,
      password: hashedPassword,
    });


    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });


    const result = await deleteUserWithCascade(user._id.toString(), admin._id.toString());

    expect(result.success).toBe(true);
    expect(result.deletedCounts.entries).toBe(0);
    expect(result.deletedCounts.settings).toBe(0);
    expect(result.deletedCounts.invalidatedTokens).toBe(0);
    expect(result.deletedCounts.passwordResetTokens).toBe(0);

    // Verify user deleted
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeFalsy();
  });

  test('should handle errors during deletion', async () => {
    const user = await User.create({
      email: 'user@test.com',
      name: 'Test User',
      isAdmin: false,
      password: hashedPassword,
    });

    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });

    // Use invalid admin ID to trigger error
    await expect(
      deleteUserWithCascade(user._id.toString(), 'invalid-admin-id')
    ).rejects.toThrow();

    // Verify user still exists (operation failed)
    const stillExists = await User.findById(user._id);
    expect(stillExists).toBeTruthy();
  });

  test.skip('should delete only target user data, not other users', async () => {
    const user1 = await User.create({
      email: 'user1@test.com',
      name: 'User 1',
      isAdmin: false,
      password: hashedPassword,
    });


    const user2 = await User.create({
      email: 'user2@test.com',
      name: 'User 2',
      isAdmin: false,
      password: hashedPassword,
    });


    const admin = await User.create({
      email: 'admin@test.com',
      name: 'Admin User',
      isAdmin: true,
      password: hashedPassword,
    });


    // Create entries for both users
    await Entry.create([
      { 
        userId: user1._id, 
        date: new Date(), 
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      },
      { 
        userId: user2._id, 
        date: new Date(), 
        firstMealTime: '12:00',
        lastMealTime: '20:00',
      },
    ]);

    // Delete user1
    await deleteUserWithCascade(user1._id.toString(), admin._id.toString());

    // Verify user1 deleted
    const deletedUser = await User.findById(user1._id);
    expect(deletedUser).toBeFalsy();

    // Verify user1 entries deleted
    const user1Entries = await Entry.find({ userId: user1._id });
    expect(user1Entries).toHaveLength(0);

    // Verify user2 still exists
    const user2Exists = await User.findById(user2._id);
    expect(user2Exists).toBeTruthy();

    // Verify user2 entries still exist
    const user2Entries = await Entry.find({ userId: user2._id });
    expect(user2Entries).toHaveLength(1);
  });
});




