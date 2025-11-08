require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const durations = await Achievement.find({ category: 'duration' })
    .select('achievementId translations.en.name criteria rarity points')
    .sort({ 'criteria.params.hours': 1 })
    .lean();
  
  console.log('\nDuration Achievements by Hours:\n');
  console.log('Hours | Achievement ID                  | Name                           | Rarity     | Points');
  console.log('='.repeat(110));
  
  durations.forEach(a => {
    const hours = a.criteria?.params?.hours || 0;
    const id = a.achievementId.padEnd(32);
    const name = a.translations.en.name.padEnd(32);
    const rarity = (a.rarity || 'N/A').padEnd(10);
    const points = String(a.points).padStart(4);
    console.log(`${String(hours).padStart(5)} | ${id} | ${name} | ${rarity} | ${points}pts`);
  });
  
  console.log('\n\nRarity Issues:');
  console.log('='.repeat(110));
  
  // Check for rarity inconsistencies
  if (durations.length > 1) {
    for (let i = 0; i < durations.length - 1; i++) {
      const curr = durations[i];
      const next = durations[i + 1];
      
      const currHours = curr.criteria?.params?.hours || 0;
      const nextHours = next.criteria?.params?.hours || 0;
      
      // Epic should be rarer than legendary
      const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
      const currRarityLevel = rarityOrder[curr.rarity] || 0;
      const nextRarityLevel = rarityOrder[next.rarity] || 0;
      
      if (currHours < nextHours && currRarityLevel > nextRarityLevel) {
        console.log(`⚠️  ${curr.achievementId} (${currHours}h, ${curr.rarity}) should be LESS rare than ${next.achievementId} (${nextHours}h, ${next.rarity})`);
      }
    }
  }
  
  process.exit(0);
});
