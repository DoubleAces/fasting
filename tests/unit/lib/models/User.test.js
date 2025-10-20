/**
 * User Model Tests
 * 
 * Tests for User Mongoose model including:
 * - Schema validation
 * - Instance methods: comparePassword, updateLastLogin
 * - Static methods: hashPassword, findByEmail
 * - Pre-save hooks
 * - Indexes and uniqueness constraints
 */

import mongoose from 'mongoose';
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
// SCHEMA VALIDATION TESTS
// ============================================================================

describe('User Model - Schema Validation', () => {
  test('should create a user with valid email/password auth', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    const userData = {
      email: 'test@example.com',
      password: hashedPassword,
      authMethod: 'email',
      name: 'Test User',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.authMethod).toBe('email');
    expect(user.name).toBe('Test User');
    expect(user.isActive).toBe(true); // default value
    expect(user.rememberMe).toBe(false); // default value
    expect(user.registrationDate).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  test('should create a user with Google OAuth auth', async () => {
    const userData = {
      email: 'google@example.com',
      authMethod: 'google',
      googleId: 'google-oauth-id-12345',
      name: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.email).toBe('google@example.com');
    expect(user.authMethod).toBe('google');
    expect(user.googleId).toBe('google-oauth-id-12345');
    expect(user.picture).toBe('https://example.com/avatar.jpg');
    expect(user.password).toBeUndefined(); // password not required for OAuth
  });

  test('should require email', async () => {
    const userData = {
      password: await User.hashPassword('SecurePass123'),
      authMethod: 'email',
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  test('should enforce unique email constraint', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    await User.create({
      email: 'duplicate@example.com',
      password: hashedPassword,
      authMethod: 'email',
    });

    await expect(
      User.create({
        email: 'duplicate@example.com',
        password: hashedPassword,
        authMethod: 'email',
      })
    ).rejects.toThrow();
  });

  test('should enforce unique googleId constraint (sparse)', async () => {
    await User.create({
      email: 'google1@example.com',
      authMethod: 'google',
      googleId: 'unique-google-id',
    });

    await expect(
      User.create({
        email: 'google2@example.com',
        authMethod: 'google',
        googleId: 'unique-google-id',
      })
    ).rejects.toThrow();
  });

  test('should allow multiple users without googleId (sparse index)', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');

    await User.create({
      email: 'email1@example.com',
      password: hashedPassword,
      authMethod: 'email',
    });

    await User.create({
      email: 'email2@example.com',
      password: hashedPassword,
      authMethod: 'email',
    });

    const users = await User.find({ authMethod: 'email' });
    expect(users).toHaveLength(2);
  });

  test('should validate email format', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    await expect(
      User.create({
        email: 'invalid-email',
        password: hashedPassword,
        authMethod: 'email',
      })
    ).rejects.toThrow();
  });

  test('should enforce authMethod enum', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    await expect(
      User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'invalid-method',
      })
    ).rejects.toThrow();
  });

  test('should validate password is hashed (60 chars) for email auth', async () => {
    await expect(
      User.create({
        email: 'test@example.com',
        password: 'plain-text-password', // not hashed
        authMethod: 'email',
      })
    ).rejects.toThrow(/Password must be hashed/);
  });

  test('should enforce name max length (100 chars)', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    const longName = 'a'.repeat(101);

    await expect(
      User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
        name: longName,
      })
    ).rejects.toThrow();
  });

  test('should convert email to lowercase', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    const user = await User.create({
      email: 'UPPERCASE@EXAMPLE.COM',
      password: hashedPassword,
      authMethod: 'email',
    });

    expect(user.email).toBe('uppercase@example.com');
  });
});

// ============================================================================
// INSTANCE METHOD TESTS
// ============================================================================

describe('User Model - Instance Methods', () => {
  describe('comparePassword()', () => {
    test('should return true for correct password', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
      });

      // Need to explicitly select password since it's excluded by default
      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('SecurePass123');

      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('WrongPassword');

      expect(isMatch).toBe(false);
    });

    test('should throw error for OAuth users (no password)', async () => {
      const user = await User.create({
        email: 'google@example.com',
        authMethod: 'google',
        googleId: 'google-id-123',
      });

      await expect(user.comparePassword('any-password')).rejects.toThrow(
        /OAuth users do not have passwords/
      );
    });
  });

  describe('updateLastLogin()', () => {
    test('should update lastLogin timestamp', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
      });

      expect(user.lastLogin).toBeNull();

      const updatedUser = await user.updateLastLogin();

      expect(updatedUser.lastLogin).toBeDefined();
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
    });

    test('should update lastLogin on subsequent logins', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
      });

      await user.updateLastLogin();
      const firstLogin = user.lastLogin;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await user.updateLastLogin();
      const secondLogin = user.lastLogin;

      expect(secondLogin.getTime()).toBeGreaterThan(firstLogin.getTime());
    });
  });
});

// ============================================================================
// STATIC METHOD TESTS
// ============================================================================

describe('User Model - Static Methods', () => {
  describe('hashPassword()', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'SecurePass123';
      const hashedPassword = await User.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toHaveLength(60); // bcrypt hash length
      expect(hashedPassword).toMatch(/^\$2[ab]\$/); // bcrypt format
    });

    test('should generate different hashes for same password (salt)', async () => {
      const password = 'SecurePass123';
      const hash1 = await User.hashPassword(password);
      const hash2 = await User.hashPassword(password);

      expect(hash1).not.toBe(hash2); // different salts
    });

    test('should use minimum 10 rounds', async () => {
      const password = 'SecurePass123';
      const hashedPassword = await User.hashPassword(password);

      // bcrypt format: $2a$rounds$salt+hash
      const rounds = parseInt(hashedPassword.split('$')[2]);
      expect(rounds).toBeGreaterThanOrEqual(10);
    });
  });

  describe('findByEmail()', () => {
    test('should find active user by email (case-insensitive)', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isActive: true,
      });

      const user = await User.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    test('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    test('should not find inactive users', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      await User.create({
        email: 'inactive@example.com',
        password: hashedPassword,
        authMethod: 'email',
        isActive: false,
      });

      const user = await User.findByEmail('inactive@example.com');

      expect(user).toBeNull();
    });

    test('should exclude password by default', async () => {
      const hashedPassword = await User.hashPassword('SecurePass123');
      
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        authMethod: 'email',
      });

      const user = await User.findByEmail('test@example.com');

      expect(user.password).toBeUndefined();
    });
  });
});

// ============================================================================
// PRE-SAVE HOOK TESTS
// ============================================================================

describe('User Model - Pre-save Hooks', () => {
  test('should update updatedAt timestamp on save', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      authMethod: 'email',
    });

    const originalUpdatedAt = user.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    user.name = 'Updated Name';
    await user.save();

    expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  test('should validate password is hashed on save', async () => {
    const hashedPassword = await User.hashPassword('SecurePass123');
    
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      authMethod: 'email',
    });

    // Try to set plain text password
    user.password = 'plain-text-password';

    await expect(user.save()).rejects.toThrow(/Password must be hashed/);
  });
});

// ============================================================================
// INDEX TESTS
// ============================================================================

describe('User Model - Indexes', () => {
  test('should have email index', async () => {
    const indexes = await User.collection.getIndexes();
    
    expect(indexes).toHaveProperty('email_1');
  });

  test('should have googleId sparse index', async () => {
    const indexes = await User.collection.getIndexes();
    
    expect(indexes).toHaveProperty('googleId_1');
  });

  test('should have compound index on email and isActive', async () => {
    const indexes = await User.collection.getIndexes();
    
    const compoundIndex = Object.keys(indexes).find(key => 
      key.includes('email') && key.includes('isActive')
    );
    
    expect(compoundIndex).toBeDefined();
  });
});
