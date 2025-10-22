/**
 * Admin Logger Unit Tests
 * 
 * Tests for admin security logging utility
 * T028: Logger captures required fields (timestamp, userId, IP, URL)
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logAdminAccessDenied, logAdminAccessGranted } from '@/lib/utils/adminLogger';

describe('Admin Logger', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('logAdminAccessDenied', () => {
    it('should log required fields for denied access', () => {
      const logData = {
        userId: 'user123',
        email: 'test@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
        reason: 'Not an admin user',
      };

      logAdminAccessDenied(logData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔴 ADMIN ACCESS DENIED'),
        expect.objectContaining({
          timestamp: expect.any(String),
          userId: 'user123',
          email: 'test@example.com',
          ip: '192.168.1.1',
          url: '/dashboard',
          reason: 'Not an admin user',
        })
      );
    });

    it('should include timestamp in ISO format', () => {
      const logData = {
        userId: 'user123',
        email: 'test@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
        reason: 'Not an admin user',
      };

      logAdminAccessDenied(logData);

      const loggedData = consoleSpy.mock.calls[0][1];
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle missing userId gracefully', () => {
      const logData = {
        email: 'test@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
        reason: 'Not authenticated',
      };

      logAdminAccessDenied(logData);

      const loggedData = consoleSpy.mock.calls[0][1];
      expect(loggedData.userId).toBe('anonymous');
    });

    it('should handle missing IP gracefully', () => {
      const logData = {
        userId: 'user123',
        email: 'test@example.com',
        url: '/dashboard',
        reason: 'Not an admin user',
      };

      logAdminAccessDenied(logData);

      const loggedData = consoleSpy.mock.calls[0][1];
      expect(loggedData.ip).toBe('unknown');
    });
  });

  describe('logAdminAccessGranted', () => {
    it('should log required fields for granted access', () => {
      const logData = {
        userId: 'admin123',
        email: 'admin@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
      };

      logAdminAccessGranted(logData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ ADMIN ACCESS GRANTED'),
        expect.objectContaining({
          timestamp: expect.any(String),
          userId: 'admin123',
          email: 'admin@example.com',
          ip: '192.168.1.1',
          url: '/dashboard',
        })
      );
    });

    it('should include timestamp in ISO format', () => {
      const logData = {
        userId: 'admin123',
        email: 'admin@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
      };

      logAdminAccessGranted(logData);

      const loggedData = consoleSpy.mock.calls[0][1];
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Log Structure', () => {
    it('should create structured logs suitable for log aggregation', () => {
      const logData = {
        userId: 'user123',
        email: 'test@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
        reason: 'Not an admin user',
      };

      logAdminAccessDenied(logData);

      const loggedData = consoleSpy.mock.calls[0][1];
      
      // Verify all required fields exist for log aggregation tools
      expect(loggedData).toHaveProperty('timestamp');
      expect(loggedData).toHaveProperty('userId');
      expect(loggedData).toHaveProperty('email');
      expect(loggedData).toHaveProperty('ip');
      expect(loggedData).toHaveProperty('url');
      expect(loggedData).toHaveProperty('reason');
      expect(loggedData).toHaveProperty('action');
      
      // Verify the data is structured (object, not string)
      expect(typeof loggedData).toBe('object');
    });
  });
});
