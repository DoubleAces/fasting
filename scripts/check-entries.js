require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkEntries() {
  try {
    // Use the MONGODB_URI directly (not test)
    const uri = process.env.MONGODB_URI;
    const dbName = uri.split('/')[3].split('?')[0];
    console.log('Connecting to database:', dbName);
    await mongoose.connect(uri);

    const Entry = mongoose.model('Entry', new mongoose.Schema({}, { strict: false, collection: 'entries' }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

    // Check specific user ID from dashboard
    const targetUserId = '68fa2e74f57605a72c78fe14';
    console.log('\nChecking entries for userId:', targetUserId);
    
    const user = await User.findById(targetUserId);
    if (user) {
      console.log('✅ User found:', user.email);
    } else {
      console.log('⚠️  User not found in users collection, but may have entries');
    }
    
    const entries = await Entry.find({ userId: mongoose.Types.ObjectId.createFromHexString(targetUserId) })
      .select('date fastingDuration lastMealTime firstMealTime')
      .sort({ date: -1 });

    console.log('\nTotal entries:', entries.length);
    console.log('Entries with non-null duration:', entries.filter(e => e.fastingDuration != null).length);
    console.log('\nEntry details:');
    entries.forEach((e, i) => {
      console.log(`${i+1}. Date: ${e.date.toISOString().split('T')[0]}`);
      console.log(`   Last Meal: ${e.lastMealTime || 'null'}, First Meal: ${e.firstMealTime || 'null'}`);
      console.log(`   Duration: ${e.fastingDuration || 'null'} minutes`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEntries();
