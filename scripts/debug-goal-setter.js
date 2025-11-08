require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Entry = require('../src/lib/models/Entry').default;
const Achievement = require('../src/lib/models/Achievement').default;

const userId = '69073cdbbeb6bdc4acb03633'; // Paul's ID

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Checking Goal Setter achievement...\n');
  
  // Check entries with goals
  const entriesWithGoals = await Entry.find({
    userId,
    goalDuration: { $exists: true, $ne: null }
  }).select('date goalDuration goalStatus').sort({ date: 1 }).lean();
  
  console.log(`📊 Entries with goalDuration set: ${entriesWithGoals.length}\n`);
  
  if (entriesWithGoals.length > 0) {
    console.log('First 5 entries with goals:');
    entriesWithGoals.slice(0, 5).forEach(e => {
      console.log(`  ${new Date(e.date).toLocaleDateString()} - Goal: ${e.goalDuration}min, Status: ${e.goalStatus || 'not set'}`);
    });
  }
  
  // Check the achievement requirement
  const goalSetter = await Achievement.findOne({ achievementId: 'goal-setter' }).lean();
  console.log('\n📋 Goal Setter achievement:');
  console.log(`  Requirement: ${goalSetter?.criteria?.params?.requirement || 'N/A'}`);
  console.log(`  Criteria type: ${goalSetter?.criteria?.type || 'N/A'}`);
  
  // Test the custom requirement
  const AchievementService = require('../src/lib/services/AchievementService').AchievementService;
  
  console.log('\n🧪 Testing evaluateCustomRequirement for "setFirstGoal"...');
  const result = await AchievementService.evaluateCustomRequirement(
    userId,
    'setFirstGoal',
    entriesWithGoals[0] || {}
  );
  
  console.log(`  Result: ${result ? '✅ QUALIFIED' : '❌ NOT QUALIFIED'}`);
  
  process.exit(0);
});
