/**
 * Create a test user for password reset testing
 * Usage: node scripts/create-test-user.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define User schema
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      authMethod: String,
      registrationDate: { type: Date, default: Date.now },
      lastLogin: Date,
      isActive: { type: Boolean, default: true },
    }, { collection: 'users', timestamps: true });

    const User = mongoose.model('User', userSchema);

    // Test user details
    const testEmail = 'test@example.com';
    const testPassword = 'TestPass123';
    const testName = 'Test User';

    // Check if user already exists
    const existing = await User.findOne({ email: testEmail });
    if (existing) {
      console.log(`⚠️  User ${testEmail} already exists!`);
      console.log(`   Use this email to test password reset.\n`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Create user
    const user = await User.create({
      email: testEmail,
      password: hashedPassword,
      name: testName,
      authMethod: 'email',
      registrationDate: new Date(),
      isActive: true,
    });

    console.log('✅ Test user created successfully!\n');
    console.log('📋 Login Details:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Name: ${testName}`);
    console.log('');
    console.log('🔗 Test the password reset at:');
    console.log('   http://localhost:3001/forgot-password');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createTestUser();
