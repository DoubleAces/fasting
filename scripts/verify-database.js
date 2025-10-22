/**
 * Database Verification Script
 * 
 * Verifies that migrations have been applied successfully.
 * Checks User collection indexes and AuditLog collection existence.
 * 
 * Usage: node scripts/verify-database.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/lib/models/User.js';
import AuditLog from '../src/lib/models/AuditLog.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Verifying Database State\n');
console.log('═'.repeat(50));

try {
  // Connect to MongoDB
  console.log('📡 Connecting to MongoDB...');
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment');
  }
  
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB\n');
  
  // Verify User indexes
  console.log('👤 User Collection');
  console.log('─'.repeat(50));
  
  const userIndexes = await User.collection.indexes();
  console.log(`Total indexes: ${userIndexes.length}`);
  
  const requiredUserIndexes = [
    'name_1',
    'registrationDate_1',
    'lastLogin_1',
    'isAdmin_1_registrationDate_-1'
  ];
  
  const userIndexNames = userIndexes.map(idx => idx.name);
  console.log('\nRequired indexes for admin user management:');
  
  requiredUserIndexes.forEach(indexName => {
    const exists = userIndexNames.includes(indexName);
    console.log(`  ${exists ? '✅' : '❌'} ${indexName}`);
  });
  
  const allUserIndexesPresent = requiredUserIndexes.every(idx => userIndexNames.includes(idx));
  
  if (allUserIndexesPresent) {
    console.log('\n✅ All User indexes present\n');
  } else {
    throw new Error('Missing User indexes - run migration 001');
  }
  
  // Verify AuditLog collection and indexes
  console.log('📋 AuditLog Collection');
  console.log('─'.repeat(50));
  
  const collections = await mongoose.connection.db.listCollections({ name: 'AuditLogs' }).toArray();
  
  if (collections.length === 0) {
    throw new Error('AuditLogs collection does not exist - run migration 002');
  }
  
  console.log('✅ AuditLogs collection exists');
  
  const auditLogIndexes = await AuditLog.collection.indexes();
  console.log(`Total indexes: ${auditLogIndexes.length}`);
  
  const requiredAuditLogIndexes = [
    'action_1',
    'performedBy_1',
    'targetUser_1',
    'timestamp_1',
    'performedBy_1_timestamp_-1',
    'targetUser_1_timestamp_-1',
    'action_1_timestamp_-1'
  ];
  
  const auditLogIndexNames = auditLogIndexes.map(idx => idx.name);
  console.log('\nRequired indexes:');
  
  requiredAuditLogIndexes.forEach(indexName => {
    const exists = auditLogIndexNames.includes(indexName);
    console.log(`  ${exists ? '✅' : '❌'} ${indexName}`);
  });
  
  const allAuditLogIndexesPresent = requiredAuditLogIndexes.every(idx => auditLogIndexNames.includes(idx));
  
  if (allAuditLogIndexesPresent) {
    console.log('\n✅ All AuditLog indexes present\n');
  } else {
    throw new Error('Missing AuditLog indexes - run migration 002');
  }
  
  // Summary
  console.log('═'.repeat(50));
  console.log('✅ Database Verification Passed!');
  console.log('═'.repeat(50));
  console.log('\nDatabase ready for admin user management:');
  console.log('  ✅ User collection has 4 new indexes');
  console.log('  ✅ AuditLog collection created with 7 indexes');
  console.log('  ✅ All migrations applied successfully');
  console.log('\nNext step: Continue with Phase 3 implementation');
  
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Verification failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
}
