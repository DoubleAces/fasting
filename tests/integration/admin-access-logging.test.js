/**
 * Admin Access Logging Integration Tests
 * 
 * Tests that access denial is properly logged with all required information
 * T029: Non-admin dashboard access is logged
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

describe('Admin Access Logging Integration', () => {
  let testUser;
  let consoleSpy;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Clean all collections and recreate test user
    await cleanTestDatabase();
    
    // Create a test non-admin user
    // Use a valid bcrypt hash (for password "testpassword123")
    testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: '$2b$10$rBV2KvGzR5t6Z8Z8Z8Z8ZOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
      isAdmin: false,
    });
  });

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  it('should log when non-admin user attempts dashboard access', async () => {
    const { logAdminAccessDenied } = await import('@/lib/utils/adminLogger');
    
    // Simulate middleware logging denied access
    logAdminAccessDenied({
      userId: testUser._id.toString(),
      email: testUser.email,
      ip: '192.168.1.100',
      url: '/dashboard',
      reason: 'User does not have admin privileges',
    });

    // Verify log was created
    expect(consoleSpy).toHaveBeenCalled();
    
    const logCall = consoleSpy.mock.calls[0];
    expect(logCall[0]).toContain('ADMIN ACCESS DENIED');
    
    const logData = logCall[1];
    expect(logData).toMatchObject({
      userId: testUser._id.toString(),
      email: testUser.email,
      ip: '192.168.1.100',
      url: '/dashboard',
      reason: 'User does not have admin privileges',
    });
    expect(logData.timestamp).toBeTruthy();
  });

  it('should log when unauthenticated user attempts dashboard access', async () => {
    const { logAdminAccessDenied } = await import('@/lib/utils/adminLogger');
    
    // Simulate middleware logging denied access for unauthenticated user
    logAdminAccessDenied({
      email: 'none',
      ip: '192.168.1.101',
      url: '/dashboard/users',
      reason: 'Not authenticated',
    });

    const logCall = consoleSpy.mock.calls[0];
    const logData = logCall[1];
    
    expect(logData.userId).toBe('anonymous');
    expect(logData.reason).toBe('Not authenticated');
  });

  it('should log successful admin access', async () => {
    const { logAdminAccessGranted } = await import('@/lib/utils/adminLogger');
    
    // Create temporary admin user
    // Use a valid bcrypt hash
    const adminUser = await User.create({
      name: 'Admin User',
      email: `admin-${Date.now()}@example.com`,
      password: '$2b$10$rBV2KvGzR5t6Z8Z8Z8Z8ZOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
      isAdmin: true,
    });

    logAdminAccessGranted({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      ip: '192.168.1.200',
      url: '/dashboard',
    });

    const logCall = consoleSpy.mock.calls[0];
    expect(logCall[0]).toContain('ADMIN ACCESS GRANTED');
    
    const logData = logCall[1];
    expect(logData).toMatchObject({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      ip: '192.168.1.200',
      url: '/dashboard',
    });

    // Clean up
    await User.findByIdAndDelete(adminUser._id);
  });

  it('should create logs with consistent structure for parsing', async () => {
    const { logAdminAccessDenied } = await import('@/lib/utils/adminLogger');
    
    logAdminAccessDenied({
      userId: testUser._id.toString(),
      email: testUser.email,
      ip: '192.168.1.100',
      url: '/dashboard/settings',
      reason: 'Not an admin',
    });

    const logData = consoleSpy.mock.calls[0][1];
    
    // Verify structure is consistent and parseable
    expect(logData).toHaveProperty('timestamp');
    expect(logData).toHaveProperty('userId');
    expect(logData).toHaveProperty('email');
    expect(logData).toHaveProperty('ip');
    expect(logData).toHaveProperty('url');
    expect(logData).toHaveProperty('reason');
    expect(logData).toHaveProperty('action');
    
    // Verify types
    expect(typeof logData.timestamp).toBe('string');
    expect(typeof logData.userId).toBe('string');
    expect(typeof logData.email).toBe('string');
    expect(typeof logData.ip).toBe('string');
    expect(typeof logData.url).toBe('string');
    expect(typeof logData.action).toBe('string');
  });
});
