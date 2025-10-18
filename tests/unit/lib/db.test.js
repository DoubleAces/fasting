/**
 * Unit tests for MongoDB connection utility
 * Following TDD: Write tests first
 */

import { connectDB, disconnectDB, isConnected } from '@/lib/db';
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
    process.env.MONGODB_URI = 'mongodb://localhost:27017/fasting-tracker-test';
  });

  describe('connectDB', () => {
    it('should connect to MongoDB with valid URI', async () => {
      mongoose.connect.mockResolvedValue(true);
      mongoose.connection.readyState = 1; // Connected

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        process.env.MONGODB_URI,
        expect.objectContaining({
          maxPoolSize: 10,
          minPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
        })
      );
    });

    it('should throw error when MONGODB_URI is missing', async () => {
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
});
