/**
 * User Test Fixtures
 * Shared test data for User model across unit and integration tests
 * 
 * Usage:
 *   import { testUsers, createTestUser } from '@/tests/fixtures/users';
 *   
 *   // Use predefined fixtures
 *   const user = await User.create(testUsers.regularUser);
 *   
 *   // Create custom test user
 *   const customUser = await createTestUser({ email: 'custom@test.com' });
 */

import mongoose from 'mongoose';

/**
 * Valid test user fixtures
 * All users include necessary authentication fields
 */
export const testUsers = {
  /**
   * Regular email/password user (English preference)
   */
  regularUser: {
    email: 'regular@test.com',
    password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C', // Pre-hashed bcrypt password (60-char hash)
    authMethod: 'email',
    name: 'Regular User',
    emailVerified: true,
    preferredLanguage: 'en', // NEW: Achievement feature
    achievementPoints: 0, // NEW: Achievement feature
    isActive: true,
    isAdmin: false,
    rememberMe: false,
  },

  /**
   * Admin user with elevated privileges
   */
  adminUser: {
    email: 'admin@test.com',
    password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C', // Pre-hashed bcrypt password (60-char hash)
    authMethod: 'email',
    name: 'Admin User',
    emailVerified: true,
    preferredLanguage: 'en',
    achievementPoints: 0,
    isActive: true,
    isAdmin: true,
    rememberMe: false,
  },

  /**
   * Google OAuth user (Spanish preference)
   */
  oauthUser: {
    email: 'oauth@test.com',
    authMethod: 'google',
    googleId: 'google-test-id-12345',
    name: 'OAuth User',
    picture: 'https://example.com/picture.jpg',
    emailVerified: true,
    preferredLanguage: 'es', // NEW: Spanish preference for achievement translations
    achievementPoints: 0,
    isActive: true,
    isAdmin: false,
    rememberMe: false,
  },

  /**
   * User with achievement points (for testing gamification)
   */
  achievementUser: {
    email: 'achievements@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Achievement User',
    emailVerified: true,
    preferredLanguage: 'fr', // French preference
    achievementPoints: 150, // NEW: User with points
    isActive: true,
    isAdmin: false,
    rememberMe: false,
  },

  /**
   * User with different language preferences (for translation testing)
   */
  germanUser: {
    email: 'german@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'German User',
    emailVerified: true,
    preferredLanguage: 'de', // German
    achievementPoints: 0,
    isActive: true,
    isAdmin: false,
  },

  portugueseUser: {
    email: 'portuguese@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Portuguese User',
    emailVerified: true,
    preferredLanguage: 'pt', // Portuguese
    achievementPoints: 0,
    isActive: true,
    isAdmin: false,
  },

  /**
   * Inactive user (soft deleted)
   */
  inactiveUser: {
    email: 'inactive@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Inactive User',
    emailVerified: false,
    preferredLanguage: 'en',
    achievementPoints: 0,
    isActive: false, // Soft deleted
    isAdmin: false,
  },
};

/**
 * Helper function to create a test user with custom overrides
 * 
 * @param {Object} overrides - Fields to override from default user
 * @returns {Object} User document ready for User.create()
 * 
 * @example
 * const user = await createTestUser({ email: 'custom@test.com', preferredLanguage: 'ja' });
 */
export function createTestUser(overrides = {}) {
  return {
    email: overrides.email || `testuser-${Date.now()}@test.com`,
    password: overrides.password || '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: overrides.authMethod || 'email',
    name: overrides.name || 'Test User',
    emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
    preferredLanguage: overrides.preferredLanguage || 'en',
    achievementPoints: overrides.achievementPoints !== undefined ? overrides.achievementPoints : 0,
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
    isAdmin: overrides.isAdmin || false,
    rememberMe: overrides.rememberMe || false,
    ...overrides,
  };
}

/**
 * Helper to create multiple test users at once
 * 
 * @param {number} count - Number of users to create
 * @param {Object} baseOverrides - Base fields to apply to all users
 * @returns {Array<Object>} Array of user documents
 * 
 * @example
 * const users = createMultipleTestUsers(5, { preferredLanguage: 'es', achievementPoints: 100 });
 */
export function createMultipleTestUsers(count = 1, baseOverrides = {}) {
  return Array.from({ length: count }, (_, index) => {
    return createTestUser({
      ...baseOverrides,
      email: `testuser-${Date.now()}-${index}@test.com`,
      name: `Test User ${index + 1}`,
    });
  });
}

/**
 * Minimal valid user (for testing required fields only)
 */
export const minimalUser = {
  email: 'minimal@test.com',
  password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
  authMethod: 'email',
  name: 'Minimal User',
};

/**
 * Invalid user fixtures (for validation testing)
 */
export const invalidUsers = {
  missingEmail: {
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'No Email User',
  },

  invalidEmailFormat: {
    email: 'not-an-email',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Invalid Email User',
  },

  missingPassword: {
    email: 'nopassword@test.com',
    authMethod: 'email', // Email auth requires password
    name: 'No Password User',
  },

  invalidLanguage: {
    email: 'invalid-lang@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Invalid Language User',
    preferredLanguage: 'invalid', // Not in enum
  },

  negativePoints: {
    email: 'negative-points@test.com',
    password: '\$2b\$10\$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
    authMethod: 'email',
    name: 'Negative Points User',
    achievementPoints: -50, // Should fail min: 0 validation
  },
};
