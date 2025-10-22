/**
 * Admin Authentication Middleware Tests
 * 
 * Tests for the admin authentication helper functions that protect admin routes.
 * 
 * Test Cases:
 * - Unauthenticated users redirected to login
 * - Non-admin users redirected to access-denied
 * - Admin users allowed to continue
 * - Session validation logic
 */

import { describe, it, expect, jest } from '@jest/globals';
import { checkAdminAccess, validateAdminSession } from '@/lib/middleware/adminAuth';

describe('Admin Authentication Middleware', () => {
  describe('checkAdminAccess', () => {
    it('should return redirect to login for unauthenticated users', () => {
      const session = null;
      const result = checkAdminAccess(session);
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toContain('/login');
    });
    
    it('should return redirect to 404 for non-admin users', () => {
      const session = {
        user: {
          id: 'user123',
          email: 'user@example.com',
          isAdmin: false,
        },
      };
      
      const result = checkAdminAccess(session);
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/404');
    });
    
    it('should allow admin users to continue', () => {
      const session = {
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          isAdmin: true,
        },
      };
      
      const result = checkAdminAccess(session);
      
      expect(result.allowed).toBe(true);
      expect(result.redirect).toBeNull();
    });
    
    it('should treat missing isAdmin flag as non-admin', () => {
      const session = {
        user: {
          id: 'user123',
          email: 'user@example.com',
          // isAdmin is undefined
        },
      };
      
      const result = checkAdminAccess(session);
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/404');
    });
    
    it('should preserve callbackUrl in login redirect', () => {
      const session = null;
      const requestedUrl = '/dashboard/users';
      
      const result = checkAdminAccess(session, requestedUrl);
      
      expect(result.redirect).toContain('/login');
      expect(result.redirect).toContain('callbackUrl=');
      expect(result.redirect).toContain(encodeURIComponent(requestedUrl));
    });
  });
  
  describe('validateAdminSession', () => {
    it('should validate session with admin flag', () => {
      const session = {
        user: {
          id: 'admin123',
          email: 'admin@example.com',
          isAdmin: true,
        },
      };
      
      const result = validateAdminSession(session);
      
      expect(result.isValid).toBe(true);
      expect(result.isAdmin).toBe(true);
    });
    
    it('should invalidate null session', () => {
      const result = validateAdminSession(null);
      
      expect(result.isValid).toBe(false);
      expect(result.isAdmin).toBe(false);
    });
    
    it('should invalidate session without user', () => {
      const session = {};
      
      const result = validateAdminSession(session);
      
      expect(result.isValid).toBe(false);
      expect(result.isAdmin).toBe(false);
    });
    
    it('should recognize non-admin users', () => {
      const session = {
        user: {
          id: 'user123',
          email: 'user@example.com',
          isAdmin: false,
        },
      };
      
      const result = validateAdminSession(session);
      
      expect(result.isValid).toBe(true);
      expect(result.isAdmin).toBe(false);
    });
  });
});
