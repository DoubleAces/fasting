/**
 * Reset user password to known value
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const email = 'raido.purga@gmail.com';
    const newPassword = 'TestPass123';

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          lastLogin: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successfully!\n');
      console.log('📋 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log('');
      console.log('🔗 Try logging in at: http://localhost:3001/login');
    } else {
      console.log('❌ Failed to update password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

resetPassword();
