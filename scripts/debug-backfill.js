require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Entry = require('../src/lib/models/Entry').default;
const Achievement = require('../src/lib/models/Achievement').default;
const UserAchievement = require('../src/lib/models/UserAchievement').default;
const AchievementService = require('../src/lib/services/AchievementService').AchievementService;

const userId = '69073cdbbeb6bdc4acb03633'; // Paul's ID

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('🔍 Debugging achievement backfill for Paul\n');
  
  // Check entries
  const entries = await Entry.find({ userId })
    .select('date fastingDuration goalStatus morningWeight')
    .sort({ date: 1 })
    .lean();
  
  console.log(`📊 Total entries: ${entries.length}\n`);
  
  if (entries.length > 0) {
    console.log('Sample entries:');
    entries.slice(0, 5).forEach(e => {
      console.log(`  ${new Date(e.date).toLocaleDateString()} - ${Math.floor(e.fastingDuration / 60)}h ${e.fastingDuration % 60}m`);
    });
    console.log();
  }
  
  // Test each evaluator
  console.log('Testing evaluators with first entry...\n');
  
  const testEntryId = entries[0]?._id;
  
  if (testEntryId) {
    try {
      const durationIds = await AchievementService.evaluateDurationAchievements(userId, testEntryId.toString());
      console.log(`✅ Duration evaluator: ${durationIds.length} achievements`);
      if (durationIds.length > 0) console.log(`   IDs: ${durationIds.join(', ')}`);
      
      const streakIds = await AchievementService.evaluateStreakAchievements(userId);
      console.log(`✅ Streak evaluator: ${streakIds.length} achievements`);
      if (streakIds.length > 0) console.log(`   IDs: ${streakIds.join(', ')}`);
      
      const entryCountIds = await AchievementService.evaluateEntryCountAchievements(userId);
      console.log(`✅ Entry count evaluator: ${entryCountIds.length} achievements`);
      if (entryCountIds.length > 0) console.log(`   IDs: ${entryCountIds.join(', ')}`);
      
      const goalIds = await AchievementService.evaluateGoalAchievements(userId);
      console.log(`✅ Goal evaluator: ${goalIds.length} achievements`);
      if (goalIds.length > 0) console.log(`   IDs: ${goalIds.join(', ')}`);
      
      const weightIds = await AchievementService.evaluateWeightAchievements(userId);
      console.log(`✅ Weight evaluator: ${weightIds.length} achievements`);
      if (weightIds.length > 0) console.log(`   IDs: ${weightIds.join(', ')}`);
      
      const customIds = await AchievementService.evaluateCustomAchievements(userId, entries[0]);
      console.log(`✅ Custom evaluator: ${customIds.length} achievements`);
      if (customIds.length > 0) console.log(`   IDs: ${customIds.join(', ')}`);
    } catch (error) {
      console.error('❌ Error testing evaluators:', error.message);
      console.error(error.stack);
    }
  }
  
  // Check existing unlocked achievements
  console.log('\n📋 Currently unlocked achievements:');
  const unlocked = await UserAchievement.find({ userId })
    .select('achievementId unlockedAt')
    .lean();
  console.log(`   Total: ${unlocked.length}`);
  unlocked.forEach(ua => {
    console.log(`   - ${ua.achievementId}`);
  });
  
  process.exit(0);
});
