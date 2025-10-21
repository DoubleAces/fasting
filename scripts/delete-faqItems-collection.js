/**
 * Delete the incorrectly named "faqItems" collection
 * Keep only "faqitems" (lowercase) which has the data
 * 
 * Run with: node scripts/delete-faqItems-collection.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function deleteCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Current collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Check if faqItems exists
    const faqItemsExists = collections.some(col => col.name === 'faqItems');
    
    if (!faqItemsExists) {
      console.log('\n✅ Collection "faqItems" does not exist. Nothing to delete.');
      process.exit(0);
    }

    // Delete the faqItems collection
    console.log('\n🗑️  Deleting "faqItems" collection...');
    await db.dropCollection('faqItems');
    console.log('✅ Successfully deleted "faqItems" collection');

    // Verify it's gone
    const updatedCollections = await db.listCollections().toArray();
    console.log('\n📋 Remaining collections:');
    updatedCollections.forEach(col => console.log(`   - ${col.name}`));

    console.log('\n🎉 Cleanup complete! Only "faqitems" (lowercase) remains.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the cleanup
deleteCollection();
