/**
 * Find the missing user by ID
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function findUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const userId = '68f54578c72e658f916ef133';
    
    // Check all possible collections
    const collections = ['users', 'user', 'Users'];
    
    for (const collName of collections) {
      console.log(`🔍 Checking ${collName}...`);
      try {
        const user = await mongoose.connection.db.collection(collName)
          .findOne({ _id: new mongoose.Types.ObjectId(userId) });
        
        if (user) {
          console.log(`✅ FOUND in ${collName}!`);
          console.log(JSON.stringify(user, null, 2));
          return;
        }
      } catch (e) {
        // Collection might not exist
      }
    }
    
    console.log('\n❌ User not found in any collection');
    console.log('The user may have been deleted or is in production database');
    console.log('\n💡 Checking if you\'re logged in via production session...');
    console.log('Your current database (test): fasting-tracker-test');
    console.log('Production database might be: fasting-tracker or fasting');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

findUser();
