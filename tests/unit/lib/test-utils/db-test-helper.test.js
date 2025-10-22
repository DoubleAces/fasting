/**
 * Unit tests for test database utilities
 * Following TDD: Tests written first
 */

import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
import { connectDB, disconnectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Mock the db module
jest.mock('@/lib/db');

// Mock mongoose
jest.mock('mongoose', () => ({
  connection: {
    readyState: 0,
    db: {
      collections: jest.fn(),
    },
  },
}));

describe('Test Database Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    mongoose.connection.readyState = 0;
  });

  describe('setupTestDatabase', () => {
    it('should call connectDB when in test environment', async () => {
      connectDB.mockResolvedValue(true);

      await setupTestDatabase();

      expect(connectDB).toHaveBeenCalled();
    });

    it('should throw error when not in test environment', async () => {
      process.env.NODE_ENV = 'production';

      await expect(setupTestDatabase()).rejects.toThrow('can only be called in test environment');
      expect(connectDB).not.toHaveBeenCalled();
    });

    it('should propagate connection errors', async () => {
      connectDB.mockRejectedValue(new Error('Connection failed'));

      await expect(setupTestDatabase()).rejects.toThrow('Connection failed');
    });
  });

  describe('cleanTestDatabase', () => {
    it('should delete documents from all collections', async () => {
      // Mock connected state
      mongoose.connection.readyState = 1;
      
      // Mock collections
      const mockCollection1 = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 5 }) };
      const mockCollection2 = { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }) };
      mongoose.connection.db.collections.mockResolvedValue([mockCollection1, mockCollection2]);

      await cleanTestDatabase();

      expect(mongoose.connection.db.collections).toHaveBeenCalled();
      expect(mockCollection1.deleteMany).toHaveBeenCalledWith({});
      expect(mockCollection2.deleteMany).toHaveBeenCalledWith({});
    });

    it('should throw error if database is not connected', async () => {
      mongoose.connection.readyState = 0; // Disconnected

      await expect(cleanTestDatabase()).rejects.toThrow('Database must be connected');
    });

    it('should propagate cleanup errors', async () => {
      mongoose.connection.readyState = 1;
      mongoose.connection.db.collections.mockRejectedValue(new Error('Cleanup failed'));

      await expect(cleanTestDatabase()).rejects.toThrow('Cleanup failed');
    });
  });

  describe('teardownTestDatabase', () => {
    it('should call disconnectDB', async () => {
      disconnectDB.mockResolvedValue(undefined);

      await teardownTestDatabase();

      expect(disconnectDB).toHaveBeenCalled();
    });

    it('should not throw error if disconnect fails (graceful cleanup)', async () => {
      disconnectDB.mockRejectedValue(new Error('Disconnect failed'));

      // Should not throw
      await expect(teardownTestDatabase()).resolves.not.toThrow();
    });
  });
});
