/**
 * Check user password hash
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function checkPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const user = await mongoose.connection.db.collection('users')
      .findOne({ email: 'raido.purga@gmail.com' });

    if (!user) {
      console.log('❌ User not found');
      process.exit(0);
    }

    console.log('📋 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Auth Method: ${user.authMethod}`);
    console.log(`   Has Password: ${user.password ? 'YES' : 'NO'}`);
    console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
    console.log(`   Last Login: ${user.lastLogin}`);
    console.log('');

    // Test password
    const testPasswords = ['TestPass123', 'NewPass123', 'Test1234'];
    
    console.log('🔐 Testing common passwords:');
    for (const pwd of testPasswords) {
      if (user.password) {
        const match = await bcrypt.compare(pwd, user.password);
        console.log(`   "${pwd}": ${match ? '✅ MATCH' : '❌ No match'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkPassword();
