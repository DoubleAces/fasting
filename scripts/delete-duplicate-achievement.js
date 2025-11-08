require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;
const UserAchievement = require('../src/lib/models/UserAchievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to database\n');
  
  // Check if three-entries exists
  const duplicate = await Achievement.findOne({ achievementId: 'three-entries' });
  if (!duplicate) {
    console.log('❌ No duplicate "three-entries" achievement found');
    process.exit(0);
  }
  
  console.log('Found duplicate achievement:');
  console.log(`   ID: ${duplicate._id}`);
  console.log(`   achievementId: ${duplicate.achievementId}`);
  console.log(`   Name: ${duplicate.translations.en.name}`);
  console.log(`   Points: ${duplicate.points}`);
  
  // Check if anyone has unlocked it
  const usersWithAchievement = await UserAchievement.countDocuments({ achievementId: 'three-entries' });
  console.log(`\n👥 Users who have unlocked this: ${usersWithAchievement}`);
  
  if (usersWithAchievement > 0) {
    console.log('\n⚠️  WARNING: Users have this achievement. Deleting it will orphan their UserAchievement records.');
    console.log('   Consider migrating them to "getting-started" first.');
  }
  
  // Delete it
  console.log('\n🗑️  Deleting duplicate achievement...');
  const result = await Achievement.deleteOne({ achievementId: 'three-entries' });
  console.log(`✅ Deleted ${result.deletedCount} achievement(s)`);
  
  // Clean up orphaned UserAchievements if any
  if (usersWithAchievement > 0) {
    console.log('\n🧹 Cleaning up orphaned UserAchievement records...');
    const cleanup = await UserAchievement.deleteMany({ achievementId: 'three-entries' });
    console.log(`✅ Deleted ${cleanup.deletedCount} orphaned UserAchievement record(s)`);
  }
  
  process.exit(0);
});
