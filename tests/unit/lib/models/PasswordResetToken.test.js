/**
 * PasswordResetToken Model Tests
 * 
 * Tests for PasswordResetToken Mongoose model including:
 * - Schema validation
 * - Static methods: generateToken, validateToken
 * - Instance methods: markAsUsed
 * - TTL expiration behavior
 * - Token security and uniqueness
 */

import mongoose from 'mongoose';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import User from '@/lib/models/User';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createTestUser() {
  const hashedPassword = await User.hashPassword('SecurePass123');
  return User.create({
    email: 'test@example.com',
    password: hashedPassword,
    authMethod: 'email',
    name: 'Test User',
  });
}

// ============================================================================
// SCHEMA VALIDATION TESTS
// ============================================================================

describe('PasswordResetToken Model - Schema Validation', () => {
  test('should create a token with valid data', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    expect(token._id).toBeDefined();
    expect(token.token).toBeDefined();
    expect(token.token).toHaveLength(64); // 32 bytes = 64 hex chars
    expect(token.userId.toString()).toBe(user._id.toString());
    expect(token.expiresAt).toBeInstanceOf(Date);
    expect(token.used).toBe(false);
    expect(token.usedAt).toBeNull();
    expect(token.createdAt).toBeDefined();
  });

  test('should require token field', async () => {
    const user = await createTestUser();

    await expect(
      PasswordResetToken.create({
        userId: user._id,
        expiresAt: new Date(Date.now() + 3600000),
      })
    ).rejects.toThrow();
  });

  test('should require userId field', async () => {
    await expect(
      PasswordResetToken.create({
        token: 'a'.repeat(64),
        expiresAt: new Date(Date.now() + 3600000),
      })
    ).rejects.toThrow();
  });

  test('should require expiresAt field', async () => {
    const user = await createTestUser();

    await expect(
      PasswordResetToken.create({
        token: 'a'.repeat(64),
        userId: user._id,
      })
    ).rejects.toThrow();
  });

  test('should validate token is 64 characters', async () => {
    const user = await createTestUser();

    await expect(
      PasswordResetToken.create({
        token: 'abc123', // too short
        userId: user._id,
        expiresAt: new Date(Date.now() + 3600000),
      })
    ).rejects.toThrow();
  });

  test('should validate token is hexadecimal', async () => {
    const user = await createTestUser();

    await expect(
      PasswordResetToken.create({
        token: 'G'.repeat(64), // invalid hex character
        userId: user._id,
        expiresAt: new Date(Date.now() + 3600000),
      })
    ).rejects.toThrow();
  });

  test('should enforce unique token constraint', async () => {
    const user = await createTestUser();
    const tokenString = 'a'.repeat(64);

    await PasswordResetToken.create({
      token: tokenString,
      userId: user._id,
      expiresAt: new Date(Date.now() + 3600000),
    });

    await expect(
      PasswordResetToken.create({
        token: tokenString, // duplicate
        userId: user._id,
        expiresAt: new Date(Date.now() + 3600000),
      })
    ).rejects.toThrow();
  });

  test('should default used to false', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    expect(token.used).toBe(false);
  });

  test('should default usedAt to null', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    expect(token.usedAt).toBeNull();
  });
});

// ============================================================================
// STATIC METHOD TESTS
// ============================================================================

describe('PasswordResetToken Model - Static Methods', () => {
  describe('generateToken()', () => {
    test('should generate token with 64-character hex string', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      expect(token.token).toBeDefined();
      expect(token.token).toHaveLength(64);
      expect(token.token).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should generate unique tokens', async () => {
      const user = await createTestUser();
      const token1 = await PasswordResetToken.generateToken(user._id);
      const token2 = await PasswordResetToken.generateToken(user._id);

      expect(token1.token).not.toBe(token2.token);
    });

    test('should set expiresAt to 1 hour from now', async () => {
      const user = await createTestUser();
      const beforeGeneration = Date.now();
      const token = await PasswordResetToken.generateToken(user._id);
      const afterGeneration = Date.now();

      const expectedExpiry = beforeGeneration + 60 * 60 * 1000; // 1 hour
      const actualExpiry = token.expiresAt.getTime();

      // Allow 1 second tolerance for test execution time
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + afterGeneration - beforeGeneration + 1000);
    });

    test('should associate token with user', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      expect(token.userId.toString()).toBe(user._id.toString());
    });

    test('should set used to false by default', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      expect(token.used).toBe(false);
    });

    test('should allow multiple tokens for same user', async () => {
      const user = await createTestUser();
      const token1 = await PasswordResetToken.generateToken(user._id);
      const token2 = await PasswordResetToken.generateToken(user._id);

      expect(token1._id.toString()).not.toBe(token2._id.toString());
      expect(token1.token).not.toBe(token2.token);

      const userTokens = await PasswordResetToken.find({ userId: user._id });
      expect(userTokens).toHaveLength(2);
    });
  });

  describe('validateToken()', () => {
    test('should validate and return valid unused unexpired token', async () => {
      const user = await createTestUser();
      const generatedToken = await PasswordResetToken.generateToken(user._id);

      const validatedToken = await PasswordResetToken.validateToken(generatedToken.token);

      expect(validatedToken).toBeDefined();
      expect(validatedToken._id.toString()).toBe(generatedToken._id.toString());
      expect(validatedToken.token).toBe(generatedToken.token);
    });

    test('should populate userId with user data', async () => {
      const user = await createTestUser();
      const generatedToken = await PasswordResetToken.generateToken(user._id);

      const validatedToken = await PasswordResetToken.validateToken(generatedToken.token);

      expect(validatedToken.userId).toBeDefined();
      expect(validatedToken.userId._id.toString()).toBe(user._id.toString());
      expect(validatedToken.userId.email).toBe(user.email);
      expect(validatedToken.userId.name).toBe(user.name);
    });

    test('should return null for non-existent token', async () => {
      const validatedToken = await PasswordResetToken.validateToken('a'.repeat(64));

      expect(validatedToken).toBeNull();
    });

    test('should return null for used token', async () => {
      const user = await createTestUser();
      const generatedToken = await PasswordResetToken.generateToken(user._id);

      // Mark token as used
      await generatedToken.markAsUsed();

      const validatedToken = await PasswordResetToken.validateToken(generatedToken.token);

      expect(validatedToken).toBeNull();
    });

    test('should return null for expired token', async () => {
      const user = await createTestUser();
      
      // Create token that's already expired
      const expiredToken = await PasswordResetToken.create({
        token: 'a'.repeat(64),
        userId: user._id,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });

      const validatedToken = await PasswordResetToken.validateToken(expiredToken.token);

      expect(validatedToken).toBeNull();
    });

    test('should return null for token with invalid format', async () => {
      const validatedToken = await PasswordResetToken.validateToken('invalid-token');

      expect(validatedToken).toBeNull();
    });
  });
});

// ============================================================================
// INSTANCE METHOD TESTS
// ============================================================================

describe('PasswordResetToken Model - Instance Methods', () => {
  describe('markAsUsed()', () => {
    test('should set used to true', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      expect(token.used).toBe(false);

      await token.markAsUsed();

      expect(token.used).toBe(true);
    });

    test('should set usedAt to current timestamp', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      expect(token.usedAt).toBeNull();

      const beforeMark = Date.now();
      await token.markAsUsed();
      const afterMark = Date.now();

      expect(token.usedAt).toBeDefined();
      expect(token.usedAt).toBeInstanceOf(Date);
      expect(token.usedAt.getTime()).toBeGreaterThanOrEqual(beforeMark);
      expect(token.usedAt.getTime()).toBeLessThanOrEqual(afterMark);
    });

    test('should persist changes to database', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      await token.markAsUsed();

      const dbToken = await PasswordResetToken.findById(token._id);

      expect(dbToken.used).toBe(true);
      expect(dbToken.usedAt).toBeDefined();
    });

    test('should invalidate token for future validation', async () => {
      const user = await createTestUser();
      const token = await PasswordResetToken.generateToken(user._id);

      await token.markAsUsed();

      const validatedToken = await PasswordResetToken.validateToken(token.token);

      expect(validatedToken).toBeNull();
    });
  });
});

// ============================================================================
// TTL EXPIRATION TESTS
// ============================================================================

describe('PasswordResetToken Model - TTL Expiration', () => {
  test('should have TTL index on createdAt field', async () => {
    const indexes = await PasswordResetToken.collection.getIndexes();
    
    const ttlIndex = Object.values(indexes).find(
      index => index.expireAfterSeconds !== undefined
    );

    expect(ttlIndex).toBeDefined();
    expect(ttlIndex.expireAfterSeconds).toBe(3600); // 1 hour
  });

  test('should have createdAt field set automatically', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    expect(token.createdAt).toBeDefined();
    expect(token.createdAt).toBeInstanceOf(Date);
  });

  // Note: Actual TTL deletion is handled by MongoDB background task
  // and may not happen immediately in tests. This test verifies the
  // index configuration rather than actual deletion behavior.
});

// ============================================================================
// INDEX TESTS
// ============================================================================

describe('PasswordResetToken Model - Indexes', () => {
  test('should have unique index on token', async () => {
    const indexes = await PasswordResetToken.collection.getIndexes();
    
    expect(indexes).toHaveProperty('token_1');
    expect(indexes.token_1.unique).toBe(true);
  });

  test('should have index on userId', async () => {
    const indexes = await PasswordResetToken.collection.getIndexes();
    
    expect(indexes).toHaveProperty('userId_1');
  });

  test('should have index on expiresAt', async () => {
    const indexes = await PasswordResetToken.collection.getIndexes();
    
    const expiresAtIndex = Object.keys(indexes).find(key => 
      key.includes('expiresAt')
    );
    
    expect(expiresAtIndex).toBeDefined();
  });

  test('should have compound index on token, used, and expiresAt', async () => {
    const indexes = await PasswordResetToken.collection.getIndexes();
    
    const compoundIndex = Object.keys(indexes).find(key => 
      key.includes('token') && key.includes('used') && key.includes('expiresAt')
    );
    
    expect(compoundIndex).toBeDefined();
  });
});

// ============================================================================
// SECURITY TESTS
// ============================================================================

describe('PasswordResetToken Model - Security', () => {
  test('should generate cryptographically secure tokens', async () => {
    const user = await createTestUser();
    
    // Generate multiple tokens and check for randomness
    const tokens = await Promise.all(
      Array.from({ length: 10 }, () => PasswordResetToken.generateToken(user._id))
    );

    const tokenStrings = tokens.map(t => t.token);
    const uniqueTokens = new Set(tokenStrings);

    // All tokens should be unique
    expect(uniqueTokens.size).toBe(10);

    // Tokens should not have obvious patterns
    tokenStrings.forEach(token => {
      expect(token).not.toBe('0'.repeat(64));
      expect(token).not.toBe('f'.repeat(64));
      expect(token).not.toMatch(/^(.)\1+$/); // not all same character
    });
  });

  test('should enforce one-time use', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    // First validation should succeed
    const firstValidation = await PasswordResetToken.validateToken(token.token);
    expect(firstValidation).toBeDefined();

    // Mark as used
    await token.markAsUsed();

    // Second validation should fail
    const secondValidation = await PasswordResetToken.validateToken(token.token);
    expect(secondValidation).toBeNull();
  });

  test('should not expose sensitive data in JSON', async () => {
    const user = await createTestUser();
    const token = await PasswordResetToken.generateToken(user._id);

    const json = token.toJSON();

    // Token should be present (needed for password reset)
    expect(json.token).toBeDefined();

    // But user password should not be exposed
    expect(json.userId).toBeDefined();
    if (typeof json.userId === 'object') {
      expect(json.userId.password).toBeUndefined();
    }
  });
});
