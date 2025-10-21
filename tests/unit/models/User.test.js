/**
 * User Model Unit Tests
 * 
 * Tests for User model extension with termsAcceptedAt field
 * Following TDD approach: Tests written before implementation
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../../src/lib/models/User.js';

describe('User Model - Terms Acceptance', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('termsAcceptedAt field', () => {
    it('should set termsAcceptedAt to current timestamp for new users', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm', // bcrypt hash
        authMethod: 'email',
        name: 'New User',
      };

      const user = await User.create(userData);

      expect(user.termsAcceptedAt).toBeDefined();
      expect(user.termsAcceptedAt).toBeInstanceOf(Date);
      
      // Should be set to recent time (within last second)
      const now = new Date();
      const diffMs = now - user.termsAcceptedAt;
      expect(diffMs).toBeLessThan(1000); // Within 1 second
    });

    it('should be required for new users (validation)', async () => {
      const userData = {
        email: 'noterms@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'No Terms User',
      };

      // Create user without termsAcceptedAt (should auto-populate with default)
      const user = await User.create(userData);
      
      expect(user.termsAcceptedAt).toBeDefined();
    });

    it('should be immutable after creation', async () => {
      const user = await User.create({
        email: 'immutable@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'Immutable User',
      });

      const originalDate = user.termsAcceptedAt;

      // Try to modify termsAcceptedAt
      user.termsAcceptedAt = new Date('2020-01-01');
      await user.save();

      // Re-fetch user
      const refetchedUser = await User.findById(user._id);

      // Should still be original date (immutable)
      expect(refetchedUser.termsAcceptedAt.getTime()).toBe(originalDate.getTime());
    });

    it('should not allow future dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year in future

      await expect(
        User.create({
          email: 'future@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Future User',
          termsAcceptedAt: futureDate,
        })
      ).rejects.toThrow(/cannot be in the future/i);
    });

    it('should accept past dates', async () => {
      const pastDate = new Date('2024-01-01');

      const user = await User.create({
        email: 'past@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'Past User',
        termsAcceptedAt: pastDate,
      });

      expect(user.termsAcceptedAt.getTime()).toBe(pastDate.getTime());
    });

    it('should accept null for existing users (migration compatibility)', async () => {
      // Simulate existing user without termsAcceptedAt
      const user = new User({
        email: 'existing@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'Existing User',
        termsAcceptedAt: null,
      });

      // Mark as not new (simulate existing document)
      user.isNew = false;

      await user.save();

      const savedUser = await User.findById(user._id);
      expect(savedUser.termsAcceptedAt).toBeNull();
    });

    it('should be a Date type', async () => {
      const user = await User.create({
        email: 'datetype@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'Date Type User',
      });

      expect(user.termsAcceptedAt).toBeInstanceOf(Date);
      expect(typeof user.termsAcceptedAt.getTime()).toBe('number');
    });

    it('should work with OAuth users (Google)', async () => {
      const user = await User.create({
        email: 'oauth@test.com',
        authMethod: 'google',
        googleId: 'google-123456',
        name: 'OAuth User',
        emailVerified: true,
      });

      expect(user.termsAcceptedAt).toBeDefined();
      expect(user.termsAcceptedAt).toBeInstanceOf(Date);
    });
  });

  describe('User model existing functionality', () => {
    it('should create user with email/password authentication', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
        authMethod: 'email',
        name: 'Test User',
      });

      expect(user.email).toBe('test@test.com');
      expect(user.authMethod).toBe('email');
      expect(user.termsAcceptedAt).toBeDefined(); // New field
    });

    it('should create user with Google OAuth authentication', async () => {
      const user = await User.create({
        email: 'google@test.com',
        authMethod: 'google',
        googleId: 'google-789',
        name: 'Google User',
        emailVerified: true,
      });

      expect(user.email).toBe('google@test.com');
      expect(user.authMethod).toBe('google');
      expect(user.googleId).toBe('google-789');
      expect(user.termsAcceptedAt).toBeDefined(); // New field
    });
  });
});
