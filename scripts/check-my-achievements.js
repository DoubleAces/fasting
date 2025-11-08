require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const UserAchievement = require('../src/lib/models/UserAchievement').default;
const Entry = require('../src/lib/models/Entry').default;

const userId = '69073cdbbeb6bdc4acb03633'; // Paul's ID

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to database\n');
  
  // Check entry count
  const entryCount = await Entry.countDocuments({ userId });
  console.log(`📊 Total entries: ${entryCount}\n`);
  
  // Check unlocked achievements
  const userAchievements = await UserAchievement.find({ userId }).select('achievementId unlockedAt').lean();
  
  console.log(`🏆 Unlocked achievements (${userAchievements.length}):`);
  userAchievements.forEach(ua => {
    console.log(`   - ${ua.achievementId} (unlocked ${new Date(ua.unlockedAt).toLocaleDateString()})`);
  });
  
  // Check if first-entry and getting-started should be unlocked
  console.log('\n\n🔍 Should be unlocked:');
  if (entryCount >= 1) {
    const hasFirstEntry = userAchievements.some(ua => ua.achievementId === 'first-entry');
    console.log(`   - first-entry (First Step): ${hasFirstEntry ? '✅ UNLOCKED' : '❌ MISSING'}`);
  }
  
  if (entryCount >= 3) {
    const hasGettingStarted = userAchievements.some(ua => ua.achievementId === 'getting-started');
    const hasThreeEntries = userAchievements.some(ua => ua.achievementId === 'three-entries');
    console.log(`   - getting-started (Getting Started): ${hasGettingStarted ? '✅ UNLOCKED' : '❌ MISSING'}`);
    console.log(`   - three-entries (Getting Started DUPLICATE): ${hasThreeEntries ? '✅ UNLOCKED' : '❌ MISSING'}`);
  }
  
  process.exit(0);
});
