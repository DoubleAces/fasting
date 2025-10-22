/**
 * MongoDB Connection Utility
 * Implements connection pooling and singleton pattern for Next.js
 * Environment-aware database selection for test isolation
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
 * Get the appropriate MongoDB URI based on the current environment
 * 
 * @returns {string} MongoDB connection URI
 */
export function getMongoURI() {
  const env = process.env.NODE_ENV;
  
  // Use test database when in test environment
  if (env === 'test') {
    return process.env.MONGODB_TEST_URI;
  }
  
  // Use main database for production and development
  return process.env.MONGODB_URI;
}

/**
 * Extract database name from MongoDB connection URI
 * 
 * @param {string} uri - MongoDB connection URI
 * @returns {string} Database name, or empty string if not found
 */
export function extractDatabaseName(uri) {
  try {
    // Handle mongodb:// and mongodb+srv:// URLs
    const url = new URL(uri);
    // pathname starts with '/', so remove it and get the database name (before any query params)
    const pathname = url.pathname.slice(1); // Remove leading '/'
    const dbName = pathname.split('?')[0]; // Remove query parameters if present
    return dbName || '';
  } catch (error) {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Validate that test database name contains 'test' keyword for safety
 * 
 * @param {string} uri - MongoDB connection URI
 * @throws {Error} If database name doesn't contain 'test'
 */
export function validateTestDatabase(uri) {
  const dbName = extractDatabaseName(uri);
  
  if (!dbName || !dbName.toLowerCase().includes('test')) {
    throw new Error(
      `Test database name must include 'test' keyword for safety.\n` +
      `Found: ${dbName || '(empty)'}\n` +
      `Example: mongodb://localhost:27017/fasting-tracker-test\n` +
      `Please update MONGODB_TEST_URI in your .env.local file.`
    );
  }
}

/**
 * Connect to MongoDB database
 * Uses connection pooling and caching for optimal performance
 * Automatically selects test database in test environment
 * 
 * @returns {Promise<typeof mongoose>} Mongoose instance
 * @throws {Error} If required environment variables are missing or validation fails
 */
export async function connectDB() {
  // Get environment-appropriate URI
  const uri = getMongoURI();
  const env = process.env.NODE_ENV;
  
  // Validate environment variables
  if (env === 'test') {
    if (!uri) {
      throw new Error(
        `MONGODB_TEST_URI must be set when NODE_ENV=test\n` +
        `Add this to your .env.local file:\n` +
        `MONGODB_TEST_URI=mongodb://localhost:27017/fasting-tracker-test\n` +
        `(Database name must contain 'test' keyword for safety)`
      );
    }
    // Validate test database name contains 'test'
    validateTestDatabase(uri);
  } else {
    if (!uri) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
  }

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return pending connection promise if connection is in progress
  if (!cached.promise) {
    const dbName = extractDatabaseName(uri);
    cached.promise = mongoose.connect(uri, options).then((mongoose) => {
      console.log(`✓ MongoDB connected successfully${env === 'test' ? ' [TEST DATABASE]' : ''}`);
      console.log(`  Database: ${dbName}`);
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
// Only set up event listeners in Node.js runtime (not Edge Runtime)
if (typeof window === 'undefined' && typeof EdgeRuntime === 'undefined') {
  // Check if mongoose and connection are available (not in Edge Runtime)
  if (mongoose && mongoose.connection) {
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
}

export default connectDB;
