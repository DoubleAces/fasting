/**
 * Admin Privilege Management Integration Tests
 * 
 * Tests for granting and revoking admin privileges via script.
 */

import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcrypt';

describe('Admin Privilege Management', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    // Clean up test users after each test
    await User.deleteMany({ email: /test-admin-privilege/i });
  });

  describe('Granting Admin Access', () => {
    it('should grant admin access to regular user', async () => {
      // Create a regular user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-grant@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: false,
        isActive: true,
        emailVerified: true,
      });

      expect(user.isAdmin).toBe(false);

      // Grant admin access
      user.isAdmin = true;
      await user.save();

      // Verify admin access was granted
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isAdmin).toBe(true);
    });

    it('should handle granting admin to user who already has admin', async () => {
      // Create an admin user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-already@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
      });

      expect(user.isAdmin).toBe(true);

      // Try to grant admin again (should be idempotent)
      user.isAdmin = true;
      await user.save();

      // Verify still admin
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isAdmin).toBe(true);
    });

    it('should not affect other user properties when granting admin', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-preserve@example.com',
        password: hashedPassword,
        name: 'Test User',
        authMethod: 'email',
        isAdmin: false,
        isActive: true,
        emailVerified: true,
      });

      const originalName = user.name;
      const originalEmail = user.email;
      const originalAuthMethod = user.authMethod;

      // Grant admin access
      user.isAdmin = true;
      await user.save();

      // Verify other properties unchanged
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(originalName);
      expect(updatedUser.email).toBe(originalEmail);
      expect(updatedUser.authMethod).toBe(originalAuthMethod);
      expect(updatedUser.isAdmin).toBe(true);
    });
  });

  describe('Revoking Admin Access', () => {
    it('should revoke admin access from admin user', async () => {
      // Create an admin user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-revoke@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
      });

      expect(user.isAdmin).toBe(true);

      // Revoke admin access
      user.isAdmin = false;
      await user.save();

      // Verify admin access was revoked
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isAdmin).toBe(false);
    });

    it('should handle revoking admin from user who is not admin', async () => {
      // Create a regular user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-not-admin@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: false,
        isActive: true,
        emailVerified: true,
      });

      expect(user.isAdmin).toBe(false);

      // Try to revoke admin (should be idempotent)
      user.isAdmin = false;
      await user.save();

      // Verify still not admin
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isAdmin).toBe(false);
    });

    it('should not affect other user properties when revoking admin', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-revoke-preserve@example.com',
        password: hashedPassword,
        name: 'Admin User',
        authMethod: 'email',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
      });

      const originalName = user.name;
      const originalEmail = user.email;
      const originalAuthMethod = user.authMethod;

      // Revoke admin access
      user.isAdmin = false;
      await user.save();

      // Verify other properties unchanged
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(originalName);
      expect(updatedUser.email).toBe(originalEmail);
      expect(updatedUser.authMethod).toBe(originalAuthMethod);
      expect(updatedUser.isAdmin).toBe(false);
    });
  });

  describe('Privilege Revocation Detection', () => {
    it('should detect when admin privilege is revoked', async () => {
      // Create an admin user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-detection@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
      });

      // Simulate checking admin status (like middleware would)
      const adminCheck1 = await User.findById(user._id);
      expect(adminCheck1.isAdmin).toBe(true);

      // Revoke admin access (simulating script execution)
      user.isAdmin = false;
      await user.save();

      // Check admin status again (simulating next request)
      const adminCheck2 = await User.findById(user._id);
      expect(adminCheck2.isAdmin).toBe(false);
    });

    it('should immediately reflect privilege changes in database', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'test-admin-privilege-immediate@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isAdmin: false,
        isActive: true,
        emailVerified: true,
      });

      // Grant admin
      user.isAdmin = true;
      await user.save();

      // Immediately check (should be updated)
      const check1 = await User.findById(user._id);
      expect(check1.isAdmin).toBe(true);

      // Revoke admin
      user.isAdmin = false;
      await user.save();

      // Immediately check (should be updated)
      const check2 = await User.findById(user._id);
      expect(check2.isAdmin).toBe(false);
    });
  });
});
