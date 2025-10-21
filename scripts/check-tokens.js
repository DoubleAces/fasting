/**
 * Check password reset tokens
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkTokens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const tokens = await mongoose.connection.db.collection('passwordresettokens')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log(`📋 Found ${tokens.length} password reset token(s):\n`);
    
    tokens.forEach((token, index) => {
      console.log(`${index + 1}. Token: ${token.token.substring(0, 20)}...`);
      console.log(`   User ID: ${token.userId}`);
      console.log(`   Used: ${token.used ? '✅ YES' : '❌ NO'}`);
      console.log(`   Expires: ${token.expiresAt}`);
      console.log(`   Created: ${token.createdAt}`);
      if (token.usedAt) {
        console.log(`   Used At: ${token.usedAt}`);
      }
      console.log('');
    });

    if (tokens.length === 0) {
      console.log('ℹ️  No password reset tokens found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkTokens();
