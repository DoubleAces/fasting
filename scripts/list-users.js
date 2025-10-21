/**
 * Quick script to list users in database
 * Usage: node scripts/list-users.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}\n`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name).join(', '));
    console.log('');

    // Try multiple possible collection names
    const possibleCollectionNames = ['users', 'Users', 'user'];
    let users = [];
    let collectionUsed = '';

    for (const collectionName of possibleCollectionNames) {
      const userSchema = new mongoose.Schema({
        email: String,
        name: String,
        authMethod: String,
      }, { collection: collectionName });

      const UserModel = mongoose.model(`User_${collectionName}`, userSchema);
      const foundUsers = await UserModel.find({}).select('email name authMethod');
      
      if (foundUsers.length > 0) {
        users = foundUsers;
        collectionUsed = collectionName;
        break;
      }
    }

    console.log(`📋 Found ${users.length} user(s) in collection '${collectionUsed || 'none'}':\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Auth Method: ${user.authMethod}`);
      console.log(`   Can Reset Password: ${user.authMethod === 'email' ? '✅ YES' : '❌ NO (OAuth)'}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('ℹ️  No users found. Create an account at http://localhost:3001/register\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

listUsers();
