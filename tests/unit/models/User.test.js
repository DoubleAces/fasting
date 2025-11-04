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

  /**
   * User Model Extensions - Achievement Features (Phase 5)
   * Tests for preferredLanguage and achievementPoints fields
   */
  describe('Achievement Extensions', () => {
    /**
     * T056: User.preferredLanguage enum validation
     */
    describe('T056 - preferredLanguage enum validation', () => {
      it('should accept valid language codes', async () => {
        const validLanguages = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'];

        for (const lang of validLanguages) {
          const user = await User.create({
            email: `user-${lang}@test.com`,
            password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
            authMethod: 'email',
            name: `User ${lang.toUpperCase()}`,
            preferredLanguage: lang,
          });

          expect(user.preferredLanguage).toBe(lang);
        }
      });

      it('should reject invalid language code', async () => {
        const invalidUser = {
          email: 'invalid-lang@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Invalid Language User',
          preferredLanguage: 'xx', // Invalid language code
        };

        await expect(User.create(invalidUser)).rejects.toThrow();
      });
    });

    /**
     * T057: User.preferredLanguage default value
     */
    describe('T057 - preferredLanguage default value', () => {
      it('should default to "en" when not provided', async () => {
        const user = await User.create({
          email: 'default-lang@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Default Language User',
          // preferredLanguage not provided
        });

        expect(user.preferredLanguage).toBe('en');
      });

      it('should allow explicit English preference', async () => {
        const user = await User.create({
          email: 'explicit-en@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Explicit English User',
          preferredLanguage: 'en',
        });

        expect(user.preferredLanguage).toBe('en');
      });
    });

    /**
     * T058: User.achievementPoints default value
     */
    describe('T058 - achievementPoints default value', () => {
      it('should default to 0 when not provided', async () => {
        const user = await User.create({
          email: 'default-points@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Default Points User',
          // achievementPoints not provided
        });

        expect(user.achievementPoints).toBe(0);
      });

      it('should allow explicit zero points', async () => {
        const user = await User.create({
          email: 'explicit-zero@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Zero Points User',
          achievementPoints: 0,
        });

        expect(user.achievementPoints).toBe(0);
      });
    });

    /**
     * T059: User.achievementPoints minimum value validation
     */
    describe('T059 - achievementPoints non-negative validation', () => {
      it('should accept positive achievementPoints', async () => {
        const user = await User.create({
          email: 'positive-points@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Positive Points User',
          achievementPoints: 150,
        });

        expect(user.achievementPoints).toBe(150);
      });

      it('should accept zero achievementPoints', async () => {
        const user = await User.create({
          email: 'zero-points@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Zero Points User',
          achievementPoints: 0,
        });

        expect(user.achievementPoints).toBe(0);
      });

      it('should reject negative achievementPoints', async () => {
        const invalidUser = {
          email: 'negative-points@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Negative Points User',
          achievementPoints: -50,
        };

        await expect(User.create(invalidUser)).rejects.toThrow();
      });
    });

    /**
     * T060: User.achievementPoints increment operations
     */
    describe('T060 - achievementPoints increment', () => {
      it('should increment achievementPoints correctly', async () => {
        const user = await User.create({
          email: 'increment@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Increment User',
          achievementPoints: 50,
        });

        // Increment by 25
        user.achievementPoints += 25;
        await user.save();

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.achievementPoints).toBe(75);
      });

      it('should increment from zero', async () => {
        const user = await User.create({
          email: 'increment-zero@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Increment From Zero',
        });

        expect(user.achievementPoints).toBe(0);

        user.achievementPoints += 100;
        await user.save();

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.achievementPoints).toBe(100);
      });
    });

    /**
     * T061: New fields don't break existing User methods
     */
    describe('T061 - Backward compatibility', () => {
      it('should not break existing authentication functionality', async () => {
        const user = await User.create({
          email: 'compat@test.com',
          password: '$2b$10$KIXd2H7cKZqE.WxBVL1Zv.3F0jHGXZJgQZ7mYKvN5xQ8YhKlFwJRm',
          authMethod: 'email',
          name: 'Compatibility User',
          preferredLanguage: 'es',
          achievementPoints: 50,
        });

        // Verify existing fields still work
        expect(user.email).toBe('compat@test.com');
        expect(user.authMethod).toBe('email');
        expect(user.name).toBe('Compatibility User');
        expect(user.termsAcceptedAt).toBeDefined();

        // Verify new fields
        expect(user.preferredLanguage).toBe('es');
        expect(user.achievementPoints).toBe(50);
      });

      it('should work with OAuth users', async () => {
        const user = await User.create({
          email: 'oauth-achievement@test.com',
          authMethod: 'google',
          googleId: 'google-achievement-123',
          name: 'OAuth Achievement User',
          emailVerified: true,
          preferredLanguage: 'fr',
          achievementPoints: 200,
        });

        expect(user.authMethod).toBe('google');
        expect(user.googleId).toBe('google-achievement-123');
        expect(user.preferredLanguage).toBe('fr');
        expect(user.achievementPoints).toBe(200);
      });
    });
  });
});
