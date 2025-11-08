require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Entry = require('../src/lib/models/Entry').default;
const User = require('../src/lib/models/User').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Checking Raido\'s entries...\n');
  
  const user = await User.findOne({ email: 'raido.purga@gmail.com' }).lean();
  console.log(`User ID: ${user._id}\n`);
  
  // Check entries with goals
  const entriesWithGoals = await Entry.find({
    userId: user._id,
    goalDuration: { $exists: true, $ne: null }
  }).select('date goalDuration goalStatus').sort({ date: 1 }).lean();
  
  console.log(`📊 Entries with goalDuration set: ${entriesWithGoals.length}`);
  
  if (entriesWithGoals.length > 0) {
    console.log('\nEntries with goals:');
    entriesWithGoals.forEach(e => {
      console.log(`  ${new Date(e.date).toLocaleDateString()} - Goal: ${e.goalDuration}min, Status: ${e.goalStatus || 'not set'}`);
    });
  } else {
    console.log('\n⚠️  No entries have goalDuration field populated!');
    
    // Check what fields entries DO have
    const sampleEntry = await Entry.findOne({ userId: user._id }).lean();
    console.log('\n📋 Sample entry fields:');
    console.log(Object.keys(sampleEntry).sort().join(', '));
  }
  
  process.exit(0);
});
