/**
 * Simple Test Database Connection Verification
 * 
 * This script verifies that:
 * 1. Test database connection works
 * 2. Database name validation is enforced
 * 3. Production and test databases are separate
 */

const path = require('path');
const { setupTestDatabase, cleanTestDatabase, teardownTestDatabase } = require(path.join(__dirname, '../src/lib/test-utils/db-test-helper.js'));
const { connectDB, disconnectDB } = require(path.join(__dirname, '../src/lib/db.js'));
const mongoose = require('mongoose');

async function verifyTestDatabaseSetup() {
  console.log('\n🧪 Verifying Test Database Setup\n');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Connect to test database
    console.log('\n1️⃣ Testing connection to test database...');
    process.env.NODE_ENV = 'test';
    await setupTestDatabase();
    
    const testDbName = mongoose.connection.db.databaseName;
    console.log(`   ✅ Connected to test database: ${testDbName}`);
    
    if (!testDbName.includes('test')) {
      throw new Error('❌ Test database name does not contain "test"!');
    }
    console.log(`   ✅ Database name contains "test" (validated)`);
    
    await teardownTestDatabase();
    
    // Test 2: Verify production database is different
    console.log('\n2️⃣ Verifying production database is different...');
    process.env.NODE_ENV = 'development';
    await connectDB();
    
    const prodDbName = mongoose.connection.db.databaseName;
    console.log(`   ✅ Production/Dev database: ${prodDbName}`);
    
    if (prodDbName === testDbName) {
      throw new Error('❌ Production and test databases are the same!');
    }
    console.log(`   ✅ Production and test databases are different`);
    
    await disconnectDB();
    
    // Test 3: Verify test database name validation
    console.log('\n3️⃣ Testing database name validation...');
    const originalTestUri = process.env.MONGODB_TEST_URI;
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_TEST_URI = originalTestUri.replace('test', 'production');
    
    try {
      await connectDB();
      throw new Error('❌ Validation did not catch invalid database name!');
    } catch (error) {
      if (error.message.includes('must contain')) {
        console.log(`   ✅ Validation correctly rejected database without "test"`);
      } else {
        throw error;
      }
    }
    
    // Restore original URI
    process.env.MONGODB_TEST_URI = originalTestUri;
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ All verifications passed!');
    console.log('\n📊 Summary:');
    console.log(`   Production Database: ${prodDbName}`);
    console.log(`   Test Database: ${testDbName}`);
    console.log(`   Validation: WORKING`);
    console.log('\n🎉 Test database separation is properly configured!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\n' + '='.repeat(50));
    process.exit(1);
  }
}

verifyTestDatabaseSetup();
