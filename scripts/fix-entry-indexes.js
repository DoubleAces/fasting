/**
 * Fix Entry Collection Indexes
 * 
 * This script drops any incorrect unique indexes on the Entry collection
 * and ensures the correct compound unique index exists: { userId: 1, date: 1 }
 * 
 * Run with: node scripts/fix-entry-indexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('entries');

    // Get all existing indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    // Drop any incorrect unique index on just 'date'
    try {
      const hasDateOnlyIndex = indexes.find(idx => 
        idx.key.date && !idx.key.userId && idx.unique
      );
      
      if (hasDateOnlyIndex) {
        console.log('\n⚠️  Found incorrect unique index on date only!');
        console.log('Dropping incorrect index...');
        await collection.dropIndex({ date: 1 });
        console.log('✓ Dropped incorrect index');
      } else {
        console.log('\n✓ No incorrect date-only unique index found');
      }
    } catch (error) {
      if (error.code !== 27) { // 27 = index not found
        throw error;
      }
    }

    // Ensure correct compound unique index exists
    console.log('\nEnsuring correct compound unique index...');
    try {
      await collection.createIndex(
        { userId: 1, date: 1 },
        { unique: true, name: 'userId_1_date_1_unique' }
      );
      console.log('✓ Compound unique index created/verified');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        // Index already exists
        console.log('✓ Compound unique index already exists');
      } else {
        throw error;
      }
    }

    // Show final indexes
    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(UNIQUE)' : '');
    });

    console.log('\n✅ Index fix complete!');
    console.log('Users can now have entries with the same date without conflicts.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

fixIndexes();
