/**
 * List ALL indexes on entries collection (including hidden ones)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

async function listAllIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('entries');

    console.log('\n=== ALL INDEXES ===\n');
    const indexes = await collection.indexes();
    
    indexes.forEach((index, i) => {
      console.log(`Index ${i + 1}:`);
      console.log('  Name:', index.name);
      console.log('  Key:', JSON.stringify(index.key));
      console.log('  Unique:', index.unique || false);
      console.log('  Background:', index.background || false);
      console.log('');
    });

    console.log('\n=== ATTEMPTING TO DROP date_1 INDEX ===\n');
    try {
      await collection.dropIndex('date_1');
      console.log('✓ Dropped date_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('✓ date_1 index does not exist');
      } else {
        console.error('Error dropping index:', error.message);
      }
    }

    console.log('\n=== FINAL INDEX LIST ===\n');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

listAllIndexes();
