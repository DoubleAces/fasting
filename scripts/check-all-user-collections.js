import 'dotenv/config';
import mongoose from 'mongoose';

async function checkAllUserCollections() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in environment');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check each potential user collection
    const userCollectionNames = ['user', 'users', 'Users'];
    
    for (const collectionName of userCollectionNames) {
      console.log(`\n🔍 Checking collection: ${collectionName}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   Total documents: ${count}`);
        
        if (count > 0) {
          const users = await collection.find({}).limit(10).toArray();
          users.forEach((user, index) => {
            console.log(`\n   User ${index + 1}:`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Name: ${user.name || 'N/A'}`);
            console.log(`     Auth Method: ${user.authMethod || 'N/A'}`);
            console.log(`     Active: ${user.isActive}`);
            console.log(`     Created: ${user.createdAt}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllUserCollections();
