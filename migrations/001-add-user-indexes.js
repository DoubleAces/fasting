/**
 * Migration: Add User Indexes for Admin User Management
 * 
 * Feature: 006-admin-user-management
 * Date: October 22, 2025
 * 
 * Purpose:
 * - Add indexes to User collection for optimal query performance
 * - Support filtering by name, email, admin status
 * - Support sorting by name, registration date, last login
 * - Enable fast pagination with compound indexes
 * 
 * Indexes to add:
 * 1. name (single field) - For name filtering and sorting
 * 2. registrationDate (single field) - For registration date sorting
 * 3. lastLogin (single field) - For last login sorting
 * 4. { isAdmin: 1, registrationDate: -1 } (compound) - For admin filtering + sorting
 * 
 * Note: email, isAdmin, authMethod, and { email: 1, isActive: 1 } indexes already exist
 * 
 * Rollback:
 * - Run: db.Users.dropIndex("name_1")
 * - Run: db.Users.dropIndex("registrationDate_1")
 * - Run: db.Users.dropIndex("lastLogin_1")
 * - Run: db.Users.dropIndex("isAdmin_1_registrationDate_-1")
 */

import mongoose from 'mongoose';
import User from '../src/lib/models/User.js';

async function up() {
  console.log('🔄 Starting migration: Add User indexes for admin user management...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasting';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get existing indexes
    const existingIndexes = await User.collection.indexes();
    console.log('📋 Existing indexes:', existingIndexes.map(i => i.name).join(', '));

    // Add name index
    if (!existingIndexes.find(i => i.name === 'name_1')) {
      await User.collection.createIndex({ name: 1 }, { name: 'name_1' });
      console.log('✅ Created index: name_1');
    } else {
      console.log('⏭️  Index already exists: name_1');
    }

    // Add registrationDate index
    if (!existingIndexes.find(i => i.name === 'registrationDate_1')) {
      await User.collection.createIndex({ registrationDate: 1 }, { name: 'registrationDate_1' });
      console.log('✅ Created index: registrationDate_1');
    } else {
      console.log('⏭️  Index already exists: registrationDate_1');
    }

    // Add lastLogin index
    if (!existingIndexes.find(i => i.name === 'lastLogin_1')) {
      await User.collection.createIndex({ lastLogin: 1 }, { name: 'lastLogin_1' });
      console.log('✅ Created index: lastLogin_1');
    } else {
      console.log('⏭️  Index already exists: lastLogin_1');
    }

    // Add compound index for isAdmin + registrationDate sorting
    if (!existingIndexes.find(i => i.name === 'isAdmin_1_registrationDate_-1')) {
      await User.collection.createIndex(
        { isAdmin: 1, registrationDate: -1 },
        { name: 'isAdmin_1_registrationDate_-1' }
      );
      console.log('✅ Created compound index: isAdmin_1_registrationDate_-1');
    } else {
      console.log('⏭️  Index already exists: isAdmin_1_registrationDate_-1');
    }

    // Verify all indexes created
    const updatedIndexes = await User.collection.indexes();
    console.log('\n📊 Final index count:', updatedIndexes.length);
    console.log('📋 All indexes:', updatedIndexes.map(i => i.name).join(', '));

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function down() {
  console.log('🔄 Starting rollback: Remove User indexes for admin user management...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasting';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Drop indexes (ignore errors if they don't exist)
    try {
      await User.collection.dropIndex('name_1');
      console.log('✅ Dropped index: name_1');
    } catch (error) {
      console.log('⚠️  Index does not exist: name_1');
    }

    try {
      await User.collection.dropIndex('registrationDate_1');
      console.log('✅ Dropped index: registrationDate_1');
    } catch (error) {
      console.log('⚠️  Index does not exist: registrationDate_1');
    }

    try {
      await User.collection.dropIndex('lastLogin_1');
      console.log('✅ Dropped index: lastLogin_1');
    } catch (error) {
      console.log('⚠️  Index does not exist: lastLogin_1');
    }

    try {
      await User.collection.dropIndex('isAdmin_1_registrationDate_-1');
      console.log('✅ Dropped compound index: isAdmin_1_registrationDate_-1');
    } catch (error) {
      console.log('⚠️  Index does not exist: isAdmin_1_registrationDate_-1');
    }

    console.log('\n✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'up';
  
  if (command === 'up') {
    up().catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
  } else if (command === 'down') {
    down().catch(error => {
      console.error('Rollback failed:', error);
      process.exit(1);
    });
  } else {
    console.error('Invalid command. Use "up" or "down"');
    process.exit(1);
  }
}

export { up, down };
