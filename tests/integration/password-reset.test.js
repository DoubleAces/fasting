/**
 * Password Reset API Integration Tests
 * 
 * Tests for password reset flow:
 * - Forgot password request
 * - Reset password with token
 * - Token expiration
 * - Token reuse prevention
 * - Edge cases and error handling
 * 
 * Test Coverage:
 * - POST /api/auth/forgot-password
 * - POST /api/auth/reset-password
 * - Token validation
 * - Email sending (mocked)
 * - Security features
 */

// Mock Next.js server components before imports
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: !init?.status || (init.status >= 200 && init.status < 300),
    }),
  },
}));

// Mock email utility
jest.mock('@/lib/utils/email', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

import { POST as forgotPasswordPOST } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/utils/email';
import { hashPassword } from '@/lib/utils/password';

describe('Password Reset API Integration Tests', () => {
  let testUser;
  let requestCounts; // Store reference to rate limit storage

  beforeAll(async () => {
    await dbConnect();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await PasswordResetToken.deleteMany({});

    // Create test user with email/password auth
    const hashedPassword = await hashPassword('TestPass123');
    testUser = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      authMethod: 'email',
    });

    // Clear email mock
    sendPasswordResetEmail.mockClear();
    
    // Clear rate limiting (access global state from route module)
    // We'll use different IPs for each test to avoid rate limiting issues
  });

  afterAll(async () => {
    await User.deleteMany({});
    await PasswordResetToken.deleteMany({});
  });

  // ============================================================================
  // FORGOT PASSWORD TESTS
  // ============================================================================

  describe('POST /api/auth/forgot-password', () => {
    test('should send reset email for valid email', async () => {
      const request = {
        json: async () => ({ email: 'test@example.com' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.1-test1' }),
      };

      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('password reset link has been sent');
      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
          resetToken: expect.any(String),
          resetUrl: expect.stringContaining('/reset-password?token='),
        })
      );

      // Verify token created in database
      const token = await PasswordResetToken.findOne({ userId: testUser._id });
      expect(token).toBeTruthy();
      expect(token.used).toBe(false);
    });

    test('should return generic message for non-existent email (security)', async () => {
      const request = {
        json: async () => ({ email: 'nonexistent@example.com' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.2-test2' }),
      };

      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('password reset link has been sent');
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('should return generic message for Google OAuth users', async () => {
      // Create Google OAuth user
      await User.create({
        email: 'google@example.com',
        name: 'Google User',
        authMethod: 'google',
        googleId: 'google123',
      });

      const request = {
        json: async () => ({ email: 'google@example.com' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.3-test3' }),
      };

      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('password reset link has been sent');
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    test('should reject invalid email format', async () => {
      const request = {
        json: async () => ({ email: 'invalid-email' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.4-test4' }),
      };

      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });

    test('should reject missing email', async () => {
      const request = {
        json: async () => ({}),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.5-test5' }),
      };

      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });

    test('should invalidate previous tokens when creating new one', async () => {
      // Create existing token
      const oldToken = await PasswordResetToken.generateToken(testUser._id);
      expect(oldToken.used).toBe(false);

      // Request new reset
      const request = {
        json: async () => ({ email: 'test@example.com' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.6-test6' }),
      };

      await forgotPasswordPOST(request);

      // Verify old token is marked as used
      const updatedOldToken = await PasswordResetToken.findById(oldToken._id);
      expect(updatedOldToken.used).toBe(true);
      expect(updatedOldToken.usedAt).toBeTruthy();
    });

    test('should enforce rate limiting', async () => {
      const ip = '192.168.1.1';
      const request = {
        json: async () => ({ email: 'test@example.com' }),
        headers: new Headers({ 'x-forwarded-for': ip }),
      };

      // Make 3 requests (within limit)
      for (let i = 0; i < 3; i++) {
        const response = await forgotPasswordPOST(request);
        expect(response.status).toBe(200);
      }

      // 4th request should be rate limited
      const response = await forgotPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
    });
  });

  // ============================================================================
  // RESET PASSWORD TESTS
  // ============================================================================

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate valid reset token
      resetToken = await PasswordResetToken.generateToken(testUser._id);
    });

    test('should reset password with valid token', async () => {
      const newPassword = 'NewSecurePass123';
      const request = {
        json: async () => ({
          token: resetToken.token,
          password: newPassword,
          confirmPassword: newPassword,
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Password successfully reset');

      // Verify password was updated
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isPasswordCorrect = await updatedUser.comparePassword(newPassword);
      expect(isPasswordCorrect).toBe(true);

      // Verify token is marked as used
      const usedToken = await PasswordResetToken.findById(resetToken._id);
      expect(usedToken.used).toBe(true);
      expect(usedToken.usedAt).toBeTruthy();

      // Verify lastLogin was updated
      expect(updatedUser.lastLogin).toBeTruthy();
    });

    test('should reject invalid token', async () => {
      const request = {
        json: async () => ({
          token: 'a'.repeat(64), // Invalid token (doesn't exist)
          password: 'NewSecurePass123',
          confirmPassword: 'NewSecurePass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid or expired reset token');
    });

    test('should reject expired token', async () => {
      // Create expired token (manually set expiration in past, skip validation)
      const expiredToken = new PasswordResetToken({
        token: 'b'.repeat(64),
        userId: testUser._id,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        used: false,
      });
      // Save without validation to bypass the "must be in future" check
      await expiredToken.save({ validateBeforeSave: false });

      const request = {
        json: async () => ({
          token: expiredToken.token,
          password: 'NewSecurePass123',
          confirmPassword: 'NewSecurePass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid or expired reset token');
    });

    test('should reject already used token', async () => {
      // Mark token as used
      await resetToken.markAsUsed();

      const request = {
        json: async () => ({
          token: resetToken.token,
          password: 'NewSecurePass123',
          confirmPassword: 'NewSecurePass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid or expired reset token');
    });

    test('should reject weak password', async () => {
      const request = {
        json: async () => ({
          token: resetToken.token,
          password: 'weak',
          confirmPassword: 'weak',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });

    test('should reject mismatched passwords', async () => {
      const request = {
        json: async () => ({
          token: resetToken.token,
          password: 'NewSecurePass123',
          confirmPassword: 'DifferentPass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });

    test('should reject missing token', async () => {
      const request = {
        json: async () => ({
          password: 'NewSecurePass123',
          confirmPassword: 'NewSecurePass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });

    test('should prevent resetting Google OAuth user password', async () => {
      // Create Google OAuth user
      const googleUser = await User.create({
        email: 'google@example.com',
        name: 'Google User',
        authMethod: 'google',
        googleId: 'google123',
      });

      // Create token for Google user (shouldn't happen in practice)
      const googleToken = await PasswordResetToken.generateToken(googleUser._id);

      const request = {
        json: async () => ({
          token: googleToken.token,
          password: 'NewSecurePass123',
          confirmPassword: 'NewSecurePass123',
        }),
      };

      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot reset password for Google OAuth');
    });
  });

  // ============================================================================
  // END-TO-END FLOW TEST
  // ============================================================================

  describe('Complete Password Reset Flow', () => {
    test('should complete full password reset flow', async () => {
      const originalPassword = 'TestPass123';
      const newPassword = 'NewSecurePass456';

      // Step 1: Verify user can login with original password
      const originalIsValid = await testUser.comparePassword(originalPassword);
      expect(originalIsValid).toBe(true);

      // Step 2: Request password reset
      const forgotRequest = {
        json: async () => ({ email: 'test@example.com' }),
        headers: new Headers({ 'x-forwarded-for': '127.0.0.99-testflow' }),
      };

      const forgotResponse = await forgotPasswordPOST(forgotRequest);
      expect(forgotResponse.status).toBe(200);

      // Step 3: Extract token from email mock call
      expect(sendPasswordResetEmail).toHaveBeenCalled();
      const emailCall = sendPasswordResetEmail.mock.calls[0][0];
      const resetTokenValue = emailCall.resetToken;

      // Step 4: Reset password with token
      const resetRequest = {
        json: async () => ({
          token: resetTokenValue,
          password: newPassword,
          confirmPassword: newPassword,
        }),
      };

      const resetResponse = await resetPasswordPOST(resetRequest);
      expect(resetResponse.status).toBe(200);

      // Step 5: Verify user can login with new password
      const updatedUser = await User.findById(testUser._id).select('+password');
      const newIsValid = await updatedUser.comparePassword(newPassword);
      expect(newIsValid).toBe(true);

      // Step 6: Verify original password no longer works
      const oldIsInvalid = await updatedUser.comparePassword(originalPassword);
      expect(oldIsInvalid).toBe(false);

      // Step 7: Verify token cannot be reused
      const reuseRequest = {
        json: async () => ({
          token: resetTokenValue,
          password: 'AnotherPass789',
          confirmPassword: 'AnotherPass789',
        }),
      };

      const reuseResponse = await resetPasswordPOST(reuseRequest);
      expect(reuseResponse.status).toBe(401);
    });
  });
});
