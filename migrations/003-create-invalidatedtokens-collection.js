/**
 * Migration 003: Create InvalidatedTokens Collection
 * 
 * Purpose:
 * Creates the invalidatedTokens collection with proper indexes for
 * forcing user logout when admin privileges are revoked.
 * 
 * What it does:
 * 1. Creates invalidatedTokens collection
 * 2. Creates userId index (single field)
 * 3. Creates invalidatedAt index (single field)
 * 4. Creates userId + invalidatedAt compound index (efficient lookups)
 * 5. Creates TTL index on invalidatedAt (auto-delete after 30 days)
 * 6. Verifies all indexes exist
 * 
 * Why:
 * - userId index: Fast lookup by user
 * - invalidatedAt index: Fast time-based queries
 * - Compound index: Efficient queries with both fields
 * - TTL index: Auto-cleanup old entries (JWT max age = 30 days)
 * 
 * TTL Index:
 * - Automatically deletes documents after 30 days
 * - Matches JWT maxAge (30 days)
 * - Prevents collection from growing indefinitely
 * 
 * Usage:
 *   node migrations/003-create-invalidatedtokens-collection.js
 * 
 * Safe to run multiple times (idempotent).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

/**
 * Connect to MongoDB
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

/**
 * Run migration
 */
async function migrate() {
  console.log('🚀 Starting Migration 003: Create InvalidatedTokens Collection\n');

  try {
    await connectDB();

    const db = mongoose.connection.db;
    const collectionName = 'invalidatedTokens';

    // ========================================================================
    // STEP 1: Create collection if it doesn't exist
    // ========================================================================
    
    console.log('📦 Step 1: Checking if collection exists...');
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`✅ Created collection: ${collectionName}`);
    } else {
      console.log(`ℹ️  Collection already exists: ${collectionName}`);
    }

    // ========================================================================
    // STEP 2: Create indexes
    // ========================================================================
    
    console.log('\n📊 Step 2: Creating indexes...');
    const collection = db.collection(collectionName);

    // Check existing indexes first
    const existingIndexes = await collection.indexes();
    const existingIndexNames = existingIndexes.map(idx => idx.name);

    // Index 1: userId (single field)
    if (!existingIndexNames.includes('userId_1')) {
      await collection.createIndex({ userId: 1 });
      console.log('✅ Created index: userId_1');
    } else {
      console.log('ℹ️  Index already exists: userId_1');
    }

    // Index 2: Drop old invalidatedAt_1 and recreate with TTL
    // We need to drop the non-TTL version first
    if (existingIndexNames.includes('invalidatedAt_1')) {
      console.log('🔧 Dropping old invalidatedAt_1 index (will recreate with TTL)...');
      await collection.dropIndex('invalidatedAt_1');
      console.log('✅ Dropped old index: invalidatedAt_1');
    }

    // Index 3: userId + invalidatedAt (compound, optimized for lookups)
    if (!existingIndexNames.includes('userId_1_invalidatedAt_-1')) {
      await collection.createIndex({ userId: 1, invalidatedAt: -1 });
      console.log('✅ Created index: userId_1_invalidatedAt_-1 (compound)');
    } else {
      console.log('ℹ️  Index already exists: userId_1_invalidatedAt_-1');
    }

    // Index 4: TTL index on invalidatedAt (auto-delete after 30 days)
    if (!existingIndexNames.includes('invalidatedAt_ttl_30d')) {
      await collection.createIndex(
        { invalidatedAt: 1 },
        { 
          expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days in seconds
          name: 'invalidatedAt_ttl_30d'
        }
      );
      console.log('✅ Created index: invalidatedAt_ttl_30d (TTL, 30 days)');
    } else {
      console.log('ℹ️  Index already exists: invalidatedAt_ttl_30d');
    }

    // ========================================================================
    // STEP 3: Verify indexes
    // ========================================================================
    
    console.log('\n🔍 Step 3: Verifying indexes...');
    const indexes = await collection.indexes();
    
    console.log(`\n📋 Total indexes: ${indexes.length}`);
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}`);
      if (index.expireAfterSeconds) {
        console.log(`      (TTL: ${index.expireAfterSeconds / 86400} days)`);
      }
    });

    // ========================================================================
    // STEP 4: Test document insertion (optional)
    // ========================================================================
    
    console.log('\n🧪 Step 4: Testing collection...');
    const testDoc = {
      userId: new mongoose.Types.ObjectId(),
      invalidatedAt: new Date(),
      reason: 'admin_revoked',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await collection.insertOne(testDoc);
    console.log('✅ Test insert successful');

    // Clean up test document
    await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Test document cleaned up');

    // ========================================================================
    // COMPLETION
    // ========================================================================
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration 003 completed successfully!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(`  Collection: ${collectionName}`);
    console.log(`  Indexes: ${indexes.length}`);
    console.log('  Features:');
    console.log('    - Fast user lookup (userId index)');
    console.log('    - Fast time lookup (invalidatedAt index)');
    console.log('    - Optimized compound queries (userId + invalidatedAt)');
    console.log('    - Auto-cleanup old entries (TTL 30 days)');
    console.log('\nNext steps:');
    console.log('  1. Toggle admin privileges will now force logout');
    console.log('  2. No more session polling spam!');
    console.log('  3. Immediate effect (next request)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
