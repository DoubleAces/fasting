/**
 * MongoDB Connection Utility
 * Implements connection pooling and singleton pattern for Next.js
 * 
 * Usage:
 *   import { connectDB } from '@/lib/db';
 *   await connectDB();
 */

import mongoose from 'mongoose';

// Connection options for production-ready setup
const options = {
  maxPoolSize: 10,        // Maximum number of connections in the pool
  minPoolSize: 5,         // Minimum number of connections to maintain
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  family: 4,              // Use IPv4, skip trying IPv6
};

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database
 * Uses connection pooling and caching for optimal performance
 * 
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
export async function connectDB() {
  // Validate environment variable (check at runtime for tests)
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending connection promise if connection is in progress
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, options).then((mongoose) => {
      console.log('✓ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('✗ MongoDB connection error:', error.message);
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB database
 * Useful for cleanup in tests or graceful shutdown
 * 
 * @returns {Promise<void>}
 */
export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('✓ MongoDB disconnected');
  }
}

/**
 * Check if MongoDB is currently connected
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get connection state as human-readable string
 * 
 * @returns {string} Connection state description
 */
export function getConnectionState() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

// Handle connection events
if (typeof window === 'undefined') {
  // Server-side only
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
  });
}

export default connectDB;
