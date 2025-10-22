/**
 * Migration Runner
 * 
 * Wrapper script to run migrations with proper environment variable loading.
 * Loads .env.local and executes specified migration.
 * 
 * Usage:
 *   node scripts/run-migration.js 001 up
 *   node scripts/run-migration.js 002 up
 *   node scripts/run-migration.js 001 down  (rollback)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get migration number and command from arguments
const migrationNumber = process.argv[2];
const command = process.argv[3] || 'up';

if (!migrationNumber) {
  console.error('❌ Usage: node scripts/run-migration.js <number> [up|down]');
  console.error('   Example: node scripts/run-migration.js 001 up');
  process.exit(1);
}

// Build migration filename
const migrationFile = `${migrationNumber.padStart(3, '0')}-*.js`;
const migrationsDir = join(__dirname, '..', 'migrations');

// Find matching migration file
const fs = await import('fs');
const files = fs.readdirSync(migrationsDir);
const matchingFile = files.find(f => f.startsWith(migrationNumber.padStart(3, '0')));

if (!matchingFile) {
  console.error(`❌ Migration not found: ${migrationFile}`);
  console.error(`   Available migrations in ${migrationsDir}:`);
  files.forEach(f => console.error(`   - ${f}`));
  process.exit(1);
}

const migrationPath = join(migrationsDir, matchingFile);

console.log(`🔄 Running migration: ${matchingFile} (${command})`);
console.log(`📁 Path: ${migrationPath}`);
console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not set'}`);
console.log('');

// Import and run migration (use file:// URL for Windows compatibility)
try {
  const { pathToFileURL } = await import('url');
  const migrationURL = pathToFileURL(migrationPath).href;
  const migration = await import(migrationURL);
  
  if (command === 'up') {
    await migration.up();
  } else if (command === 'down') {
    await migration.down();
  } else {
    console.error(`❌ Invalid command: ${command} (use 'up' or 'down')`);
    process.exit(1);
  }
  
  console.log('\n✅ Migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
