/**
 * Integration Tests: Authentication API
 * 
 * Test coverage:
 * - User registration (POST /api/auth/register)
 * - Email/password validation
 * - Duplicate email handling
 * - Password strength requirements
 * - Session management (login, logout, remember me) - to be added in Phase 5
 * - Google OAuth - to be added in Phase 6
 * - Password reset - to be added in Phase 8
 * 
 * @jest-environment node
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '@/lib/models/User';

// Mock Next.js request/response
const createMockRequest = (body) => ({
  json: async () => body,
});

const parseResponse = async (response) => {
  const json = await response.json();
  return { status: response.status, body: json };
};

describe('Registration API Integration Tests', () => {
  let mongoServer;
  let POST; // Registration handler

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;

    // Import route handler once
    const routeModule = await import('@/app/api/auth/register/route.js');
    POST = routeModule.POST;
  }, 30000); // 30 second timeout for setup

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  }, 10000); // 10 second timeout

  describe('POST /api/auth/register - Valid Registration', () => {
    it('should create new user with valid email and password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'Test User',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(201);
      expect(body).toMatchObject({
        success: true,
        message: 'Account created successfully',
        user: {
          email: 'test@example.com',
          name: 'Test User',
          authMethod: 'email',
        },
      });
      expect(body.user.id).toBeDefined();
      expect(body.user.createdAt).toBeDefined();
      expect(body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should create user without optional name field', async () => {
      const request = createMockRequest({
        email: 'noname@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(201);
      expect(body.user.email).toBe('noname@example.com');
      expect(body.user.name).toBeNull();
    });

    it('should convert email to lowercase', async () => {
      const request = createMockRequest({
        email: 'Test@EXAMPLE.COM',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(201);
      expect(body.user.email).toBe('test@example.com');
    });

    it('should hash password before storing', async () => {
      const request = createMockRequest({
        email: 'secure@example.com',
        password: 'MyPassword123!',
        confirmPassword: 'MyPassword123!',
      });

      await POST(request);

      const user = await User.findOne({ email: 'secure@example.com' }).select('+password');
      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('MyPassword123!');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // Bcrypt hash format
    });

    it('should set authMethod to email', async () => {
      const request = createMockRequest({
        email: 'method@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      await POST(request);

      const user = await User.findOne({ email: 'method@example.com' });
      expect(user.authMethod).toBe('email');
    });

    it('should set isActive to true', async () => {
      const request = createMockRequest({
        email: 'active@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      await POST(request);

      const user = await User.findOne({ email: 'active@example.com' });
      expect(user.isActive).toBe(true);
    });
  });

  describe('POST /api/auth/register - Duplicate Email', () => {
    it('should reject registration with existing email', async () => {
      // Create existing user
      await User.create({
        email: 'existing@example.com',
        password: '$2a$10$hashedpassword',
        authMethod: 'email',
      });

      const request = createMockRequest({
        email: 'existing@example.com',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Email already registered');
      expect(body.details).toEqual([
        {
          field: 'email',
          message: 'An account with this email already exists',
        },
      ]);
    });

    it('should reject duplicate email case-insensitively', async () => {
      // Create user with lowercase email
      await User.create({
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        authMethod: 'email',
      });

      // Try to register with uppercase email
      const request = createMockRequest({
        email: 'TEST@EXAMPLE.COM',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/register - Email Validation', () => {
    it('should reject invalid email format', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });

    it('should reject missing email', async () => {
      const request = createMockRequest({
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject empty email', async () => {
      const request = createMockRequest({
        email: '',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/register - Password Validation', () => {
    it('should reject weak password (too short)', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'Short1!',
        confirmPassword: 'Short1!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
          }),
        ])
      );
    });

    it('should reject password without uppercase letter', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'lowercase123!',
        confirmPassword: 'lowercase123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject password without lowercase letter', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'UPPERCASE123!',
        confirmPassword: 'UPPERCASE123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject password without number', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'NoNumbers!',
        confirmPassword: 'NoNumbers!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject password without special character', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'NoSpecial123',
        confirmPassword: 'NoSpecial123',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject missing password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/register - Password Confirmation', () => {
    it('should reject mismatched passwords', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'confirmPassword',
          }),
        ])
      );
    });

    it('should reject missing confirmPassword', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/register - Name Validation', () => {
    it('should accept valid name', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'John Doe',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(201);
      expect(body.user.name).toBe('John Doe');
    });

    it('should reject name exceeding max length (100 chars)', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'A'.repeat(101),
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/register - Multiple Validation Errors', () => {
    it('should return all validation errors', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(400);
      expect(body.error).toBe('Validation failed');
      expect(body.details.length).toBeGreaterThan(1);
    });
  });

  describe('POST /api/auth/register - Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Close database connection to simulate error
      await mongoose.disconnect();

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      });

      const response = await POST(request);
      const { status, body } = await parseResponse(response);

      expect(status).toBe(500);
      expect(body.error).toBe('Internal server error');

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGODB_URI);
    });
  });
});
