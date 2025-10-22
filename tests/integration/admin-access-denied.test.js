/**
 * Admin Access Denied Integration Tests
 * 
 * Tests that non-admin users are properly denied access and redirected
 * T030: Unauthenticated dashboard access redirects to login with callbackUrl
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';

describe('Admin Access Denied Integration', () => {
  let testUser;
  let adminUser;

  beforeAll(async () => {
    await connectDB();
    
    // Create test users
    // Use valid bcrypt hashes
    testUser = await User.create({
      name: 'Regular User',
      email: `regular-${Date.now()}@example.com`,
      password: '$2b$10$rBV2KvGzR5t6Z8Z8Z8Z8ZOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
      isAdmin: false,
    });

    adminUser = await User.create({
      name: 'Admin User',
      email: `admin-${Date.now()}@example.com`,
      password: '$2b$10$rBV2KvGzR5t6Z8Z8Z8Z8ZOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
      isAdmin: true,
    });
  });

  afterAll(async () => {
    // Clean up test users
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
    if (adminUser) {
      await User.findByIdAndDelete(adminUser._id);
    }
    await disconnectDB();
  });

  describe('Access Control', () => {
    it('should deny access to non-admin users', async () => {
      // Import middleware helper
      const { checkAdminAccess } = await import('@/lib/middleware/adminAuth');
      
      const session = {
        user: {
          id: testUser._id.toString(),
          email: testUser.email,
          isAdmin: false,
        },
      };

      const result = checkAdminAccess(session, '/dashboard');
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/404');
    });

    it('should allow access to admin users', async () => {
      const { checkAdminAccess } = await import('@/lib/middleware/adminAuth');
      
      const session = {
        user: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          isAdmin: true,
        },
      };

      const result = checkAdminAccess(session, '/dashboard');
      
      expect(result.allowed).toBe(true);
      expect(result.redirect).toBeNull();
    });

    it('should deny access to unauthenticated users', async () => {
      const { checkAdminAccess } = await import('@/lib/middleware/adminAuth');
      
      const result = checkAdminAccess(null, '/dashboard');
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/login?callbackUrl=%2Fdashboard');
    });

    it('should preserve requested URL in callback for unauthenticated users', async () => {
      const { checkAdminAccess } = await import('@/lib/middleware/adminAuth');
      
      const result = checkAdminAccess(null, '/dashboard/users');
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toContain('callbackUrl=');
      expect(decodeURIComponent(result.redirect)).toContain('/dashboard/users');
    });
  });

  describe('Session Validation', () => {
    it('should validate session has required fields', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const validSession = {
        user: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          isAdmin: true,
        },
      };

      const result = validateAdminSession(validSession);
      
      expect(result.isValid).toBe(true);
      expect(result.isAdmin).toBe(true);
    });

    it('should reject session without user object', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const result = validateAdminSession({});
      
      expect(result.isValid).toBe(false);
      expect(result.isAdmin).toBe(false);
    });

    it('should reject null session', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const result = validateAdminSession(null);
      
      expect(result.isValid).toBe(false);
      expect(result.isAdmin).toBe(false);
    });
  });

  describe('Admin Flag Validation', () => {
    it('should correctly identify admin users', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const session = {
        user: {
          id: adminUser._id.toString(),
          email: adminUser.email,
          isAdmin: true,
        },
      };

      const result = validateAdminSession(session);
      
      expect(result.isAdmin).toBe(true);
    });

    it('should correctly identify non-admin users', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const session = {
        user: {
          id: testUser._id.toString(),
          email: testUser.email,
          isAdmin: false,
        },
      };

      const result = validateAdminSession(session);
      
      expect(result.isValid).toBe(true);
      expect(result.isAdmin).toBe(false);
    });

    it('should treat missing isAdmin flag as non-admin', async () => {
      const { validateAdminSession } = await import('@/lib/middleware/adminAuth');
      
      const session = {
        user: {
          id: testUser._id.toString(),
          email: testUser.email,
        },
      };

      const result = validateAdminSession(session);
      
      expect(result.isValid).toBe(true);
      expect(result.isAdmin).toBe(false);
    });
  });
});
