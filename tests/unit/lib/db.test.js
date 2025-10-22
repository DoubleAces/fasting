/**
 * Unit tests for MongoDB connection utility
 * Following TDD: Write tests first
 */

import { connectDB, disconnectDB, isConnected, getMongoURI, validateTestDatabase, extractDatabaseName } from '@/lib/db';
import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    readyState: 0,
  },
}));

describe('MongoDB Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset connection state
    mongoose.connection.readyState = 0;
    // Reset cached connection
    global.mongoose = { conn: null, promise: null };
    // Set up test environment (default for all tests)
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/fasting-tracker';
    process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/fasting-tracker-test';
  });

  describe('connectDB', () => {
    it('should connect to MongoDB with valid URI', async () => {
      mongoose.connect.mockResolvedValue(true);
      mongoose.connection.readyState = 1; // Connected

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        process.env.MONGODB_TEST_URI, // Now uses test URI in test environment
        expect.objectContaining({
          maxPoolSize: 10,
          minPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
        })
      );
    });

    it('should throw error when MONGODB_URI is missing in non-test environment', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.MONGODB_URI;

      await expect(connectDB()).rejects.toThrow('Please define the MONGODB_URI');
      expect(mongoose.connect).not.toHaveBeenCalled();
    });

    it('should reuse existing connection', async () => {
      // Set up cached connection
      global.mongoose = { conn: { connection: { readyState: 1 } }, promise: null };

      await connectDB();

      expect(mongoose.connect).not.toHaveBeenCalled();
    });
  });

  describe('disconnectDB', () => {
    it('should disconnect from MongoDB', async () => {
      mongoose.connection.readyState = 1; // Connected
      mongoose.disconnect.mockResolvedValue(true);

      await disconnectDB();

      expect(mongoose.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect if already disconnected', async () => {
      mongoose.connection.readyState = 0; // Disconnected

      await disconnectDB();

      expect(mongoose.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return true when connected', () => {
      mongoose.connection.readyState = 1;

      expect(isConnected()).toBe(true);
    });

    it('should return false when disconnected', () => {
      mongoose.connection.readyState = 0;

      expect(isConnected()).toBe(false);
    });

    it('should return false when connecting', () => {
      mongoose.connection.readyState = 2; // Connecting

      expect(isConnected()).toBe(false);
    });
  });

  // User Story 1: Safe Integration Test Execution - TDD Tests
  describe('getMongoURI - Environment-based database selection', () => {
    beforeEach(() => {
      // Clean up environment
      delete process.env.MONGODB_URI;
      delete process.env.MONGODB_TEST_URI;
      delete process.env.NODE_ENV;
    });

    it('should return MONGODB_TEST_URI when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-db';

      const uri = getMongoURI();

      expect(uri).toBe('mongodb://localhost:27017/test-db');
    });

    it('should return MONGODB_URI when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/development';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-db';

      const uri = getMongoURI();

      expect(uri).toBe('mongodb://localhost:27017/development');
    });

    it('should return MONGODB_URI when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-db';

      const uri = getMongoURI();

      expect(uri).toBe('mongodb://localhost:27017/production');
    });

    it('should return MONGODB_URI when NODE_ENV is not set', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/development';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-db';

      const uri = getMongoURI();

      expect(uri).toBe('mongodb://localhost:27017/development');
    });
  });

  describe('extractDatabaseName - Parse database name from MongoDB URI', () => {
    it('should extract database name from standard MongoDB URI', () => {
      const uri = 'mongodb://localhost:27017/my-test-database';
      
      const dbName = extractDatabaseName(uri);

      expect(dbName).toBe('my-test-database');
    });

    it('should extract database name from MongoDB Atlas URI', () => {
      const uri = 'mongodb+srv://user:pass@cluster.mongodb.net/fasting-tracker-test?retryWrites=true';
      
      const dbName = extractDatabaseName(uri);

      expect(dbName).toBe('fasting-tracker-test');
    });

    it('should extract database name from URI with query parameters', () => {
      const uri = 'mongodb://localhost:27017/test-db?authSource=admin';
      
      const dbName = extractDatabaseName(uri);

      expect(dbName).toBe('test-db');
    });

    it('should return empty string for URI without database name', () => {
      const uri = 'mongodb://localhost:27017';
      
      const dbName = extractDatabaseName(uri);

      expect(dbName).toBe('');
    });
  });

  describe('validateTestDatabase - Test database name validation', () => {
    it('should pass validation for database name containing "test"', () => {
      const uri = 'mongodb://localhost:27017/my-test-database';

      expect(() => validateTestDatabase(uri)).not.toThrow();
    });

    it('should pass validation for database name containing "TEST" (case insensitive)', () => {
      const uri = 'mongodb://localhost:27017/MY-TEST-DATABASE';

      expect(() => validateTestDatabase(uri)).not.toThrow();
    });

    it('should throw error for database name without "test" keyword', () => {
      const uri = 'mongodb://localhost:27017/production-database';

      expect(() => validateTestDatabase(uri)).toThrow('Test database name must include');
      expect(() => validateTestDatabase(uri)).toThrow('production-database');
    });

    it('should throw error for empty database name', () => {
      const uri = 'mongodb://localhost:27017';

      expect(() => validateTestDatabase(uri)).toThrow('Test database name must include');
    });
  });

  describe('connectDB - Environment-aware connection with validation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mongoose.connection.readyState = 0;
      global.mongoose = { conn: null, promise: null };
      delete process.env.MONGODB_URI;
      delete process.env.MONGODB_TEST_URI;
      delete process.env.NODE_ENV;
    });

    it('should throw error when MONGODB_TEST_URI is missing in test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      // MONGODB_TEST_URI is not set

      await expect(connectDB()).rejects.toThrow('MONGODB_TEST_URI must be set');
    });

    it('should throw error when test database name does not contain "test"', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/production'; // Invalid: no 'test' in name

      await expect(connectDB()).rejects.toThrow('Test database name must include');
    });
  });

  // User Story 2: Test Environment Configuration - TDD Tests
  describe('Error messages - User Story 2', () => {
    beforeEach(() => {
      delete process.env.MONGODB_URI;
      delete process.env.MONGODB_TEST_URI;
      delete process.env.NODE_ENV;
    });

    it('should include variable name MONGODB_TEST_URI in error message', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      // MONGODB_TEST_URI not set

      await expect(connectDB()).rejects.toThrow('MONGODB_TEST_URI');
    });

    it('should include example value in error message', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      // MONGODB_TEST_URI not set

      await expect(connectDB()).rejects.toThrow('mongodb://localhost:27017');
    });

    it('should respect environment variable precedence (test env uses MONGODB_TEST_URI)', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGODB_URI = 'mongodb://localhost:27017/production';
      process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/test-database';

      const uri = getMongoURI();

      expect(uri).toBe('mongodb://localhost:27017/test-database');
      expect(uri).not.toBe(process.env.MONGODB_URI);
    });
  });
});
