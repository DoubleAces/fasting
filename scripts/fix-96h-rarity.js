require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Fixing rarity issue: 96h achievement\n');
  
  const result = await Achievement.updateOne(
    { achievementId: 'ninetysix-hour-elite' },
    { $set: { rarity: 'legendary' } }
  );
  
  console.log(`Updated ${result.modifiedCount} achievement(s)`);
  
  const updated = await Achievement.findOne({ achievementId: 'ninetysix-hour-elite' })
    .select('achievementId translations.en.name rarity points')
    .lean();
  
  console.log('\nUpdated achievement:');
  console.log(`  ${updated.achievementId}: ${updated.translations.en.name}`);
  console.log(`  Rarity: ${updated.rarity}`);
  console.log(`  Points: ${updated.points}`);
  
  process.exit(0);
});
