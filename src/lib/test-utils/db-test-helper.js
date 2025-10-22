/**
 * Test Database Utilities
 * Shared helpers for integration test database lifecycle management
 * 
 * Usage in integration tests:
 *   import { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } from '@/lib/test-utils/db-test-helper';
 *   
 *   beforeAll(async () => {
 *     await setupTestDatabase();
 *   });
 *   
 *   beforeEach(async () => {
 *     await cleanTestDatabase();
 *   });
 *   
 *   afterAll(async () => {
 *     await teardownTestDatabase();
 *   });
 */

import { connectDB, disconnectDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * Set up test database connection
 * Ensures test database is connected and ready for tests
 * 
 * @returns {Promise<void>}
 * @throws {Error} If connection fails or not in test environment
 */
export async function setupTestDatabase() {
  // Verify we're in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'setupTestDatabase() can only be called in test environment.\n' +
      `Current NODE_ENV: ${process.env.NODE_ENV}\n` +
      'Ensure jest.env.setup.js sets NODE_ENV=test'
    );
  }

  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to setup test database:', error.message);
    throw error;
  }
}

/**
 * Clean all collections in the test database
 * Ensures each test starts with a clean slate
 * 
 * @returns {Promise<void>}
 * @throws {Error} If not connected or cleanup fails
 */
export async function cleanTestDatabase() {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error(
      'Database must be connected before cleaning.\n' +
      'Call setupTestDatabase() in beforeAll() first.'
    );
  }

  try {
    // Get all collections in the database
    const collections = await mongoose.connection.db.collections();
    
    // Delete all documents from each collection
    const deletePromises = collections.map(collection => 
      collection.deleteMany({})
    );
    
    await Promise.all(deletePromises);
    
    // Optional: Log cleaned collections for debugging
    if (process.env.DEBUG_TESTS === 'true') {
      console.log(`✓ Cleaned ${collections.length} collections in test database`);
    }
  } catch (error) {
    console.error('Failed to clean test database:', error.message);
    throw error;
  }
}

/**
 * Tear down test database connection
 * Closes connection after all tests complete
 * 
 * @returns {Promise<void>}
 */
export async function teardownTestDatabase() {
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Failed to teardown test database:', error.message);
    // Don't throw - allow tests to complete even if disconnect fails
  }
}
