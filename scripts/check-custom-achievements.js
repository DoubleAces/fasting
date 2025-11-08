require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Checking custom achievements...\n');
  
  const customs = await Achievement.find({ 'criteria.type': 'custom' })
    .select('achievementId translations.en.name criteria')
    .lean();
  
  console.log(`Found ${customs.length} custom achievements\n`);
  console.log('Sample criteria structures:\n');
  
  customs.slice(0, 15).forEach(a => {
    console.log(`${a.achievementId.padEnd(30)} | ${a.translations.en.name.padEnd(30)} | ${JSON.stringify(a.criteria)}`);
  });
  
  process.exit(0);
});
