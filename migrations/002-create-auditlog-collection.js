/**
 * Migration: Create AuditLog Collection
 * 
 * Feature: 006-admin-user-management
 * Date: October 22, 2025
 * 
 * Purpose:
 * - Create AuditLogs collection for tracking admin actions
 * - Add indexes for efficient querying by action, performer, target, and timestamp
 * - Support compliance and security investigations
 * 
 * Indexes to create:
 * 1. action (single field) - For filtering by action type
 * 2. performedBy (single field) - For filtering by admin
 * 3. targetUser (single field) - For filtering by affected user
 * 4. timestamp (single field) - For time-based queries
 * 5. { performedBy: 1, timestamp: -1 } (compound) - Actions by admin, newest first
 * 6. { targetUser: 1, timestamp: -1 } (compound) - Actions affecting user, newest first
 * 7. { action: 1, timestamp: -1 } (compound) - Actions by type, newest first
 * 
 * Rollback:
 * - Run: db.AuditLogs.drop()
 */

import mongoose from 'mongoose';
import AuditLog from '../src/lib/models/AuditLog.js';

async function up() {
  console.log('🔄 Starting migration: Create AuditLog collection...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasting';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'AuditLogs' }).toArray();
    
    if (collections.length > 0) {
      console.log('⏭️  Collection already exists: AuditLogs');
    } else {
      // Create collection (implicitly created by first insert)
      await AuditLog.collection.insertOne({
        action: 'TOGGLE_ADMIN',
        performedBy: new mongoose.Types.ObjectId(),
        targetUser: new mongoose.Types.ObjectId(),
        oldValue: { isAdmin: false },
        newValue: { isAdmin: true },
        blocked: false,
        timestamp: new Date(),
      });
      
      // Delete the dummy document
      await AuditLog.collection.deleteOne({});
      
      console.log('✅ Created collection: AuditLogs');
    }

    // Create indexes
    const existingIndexes = await AuditLog.collection.indexes();
    console.log('📋 Existing indexes:', existingIndexes.map(i => i.name).join(', '));

    // Single field indexes
    if (!existingIndexes.find(i => i.name === 'action_1')) {
      await AuditLog.collection.createIndex({ action: 1 }, { name: 'action_1' });
      console.log('✅ Created index: action_1');
    } else {
      console.log('⏭️  Index already exists: action_1');
    }

    if (!existingIndexes.find(i => i.name === 'performedBy_1')) {
      await AuditLog.collection.createIndex({ performedBy: 1 }, { name: 'performedBy_1' });
      console.log('✅ Created index: performedBy_1');
    } else {
      console.log('⏭️  Index already exists: performedBy_1');
    }

    if (!existingIndexes.find(i => i.name === 'targetUser_1')) {
      await AuditLog.collection.createIndex({ targetUser: 1 }, { name: 'targetUser_1' });
      console.log('✅ Created index: targetUser_1');
    } else {
      console.log('⏭️  Index already exists: targetUser_1');
    }

    if (!existingIndexes.find(i => i.name === 'timestamp_1')) {
      await AuditLog.collection.createIndex({ timestamp: 1 }, { name: 'timestamp_1' });
      console.log('✅ Created index: timestamp_1');
    } else {
      console.log('⏭️  Index already exists: timestamp_1');
    }

    // Compound indexes
    if (!existingIndexes.find(i => i.name === 'performedBy_1_timestamp_-1')) {
      await AuditLog.collection.createIndex(
        { performedBy: 1, timestamp: -1 },
        { name: 'performedBy_1_timestamp_-1' }
      );
      console.log('✅ Created compound index: performedBy_1_timestamp_-1');
    } else {
      console.log('⏭️  Index already exists: performedBy_1_timestamp_-1');
    }

    if (!existingIndexes.find(i => i.name === 'targetUser_1_timestamp_-1')) {
      await AuditLog.collection.createIndex(
        { targetUser: 1, timestamp: -1 },
        { name: 'targetUser_1_timestamp_-1' }
      );
      console.log('✅ Created compound index: targetUser_1_timestamp_-1');
    } else {
      console.log('⏭️  Index already exists: targetUser_1_timestamp_-1');
    }

    if (!existingIndexes.find(i => i.name === 'action_1_timestamp_-1')) {
      await AuditLog.collection.createIndex(
        { action: 1, timestamp: -1 },
        { name: 'action_1_timestamp_-1' }
      );
      console.log('✅ Created compound index: action_1_timestamp_-1');
    } else {
      console.log('⏭️  Index already exists: action_1_timestamp_-1');
    }

    // Verify all indexes created
    const updatedIndexes = await AuditLog.collection.indexes();
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
  console.log('🔄 Starting rollback: Drop AuditLog collection...');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasting';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Drop collection
    try {
      await mongoose.connection.db.dropCollection('AuditLogs');
      console.log('✅ Dropped collection: AuditLogs');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('⚠️  Collection does not exist: AuditLogs');
      } else {
        throw error;
      }
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
