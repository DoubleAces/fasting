require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function findIncompleteEntry() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);

    const Entry = mongoose.model('Entry', new mongoose.Schema({}, { strict: false, collection: 'entries' }));

    const targetUserId = '68fa2e74f57605a72c78fe14';
    
    const entry = await Entry.findOne({
      userId: mongoose.Types.ObjectId.createFromHexString(targetUserId),
      fastingDuration: null
    }).select('_id date lastMealTime firstMealTime');

    if (entry) {
      console.log('\n🔍 Found incomplete entry:');
      console.log('Entry ID:', entry._id.toString());
      console.log('Date:', entry.date.toISOString().split('T')[0]);
      console.log('Last Meal:', entry.lastMealTime || 'N/A');
      console.log('First Meal:', entry.firstMealTime || 'N/A');
      console.log('\n📝 Edit URL:', `http://localhost:3000/entries/${entry._id}/edit`);
      console.log('Or just go to /entries and click the edit button for Oct 21');
    } else {
      console.log('No incomplete entries found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findIncompleteEntry();
