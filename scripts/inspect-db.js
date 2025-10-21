/**
 * Comprehensive database inspection
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}\n`);

    // Check all collections and their counts
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📊 Collection Details:\n');
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`   ${col.name}: ${count} document(s)`);
      
      if (count > 0 && count < 10) {
        const docs = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
        docs.forEach(doc => {
          console.log(`      - ${JSON.stringify(doc, null, 2).substring(0, 200)}...`);
        });
      }
    }
    
    console.log('\n🔍 Checking sessions collection...');
    const sessions = await mongoose.connection.db.collection('sessions').find({}).limit(5).toArray();
    if (sessions.length > 0) {
      console.log(`Found ${sessions.length} session(s)`);
      sessions.forEach(s => {
        console.log(`   Session: ${s._id}`);
        console.log(`   Data: ${JSON.stringify(s).substring(0, 150)}...`);
      });
    } else {
      console.log('No sessions found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

inspect();
