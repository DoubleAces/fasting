require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const customs = await Achievement.find({ 'criteria.type': 'custom' })
    .select('achievementId translations.en.name translations.en.description criteria')
    .lean();
  
  const timeBased = customs.filter(a => 
    a.translations.en.description.match(/before|after|morning|night|midnight|sunrise|weekend|weekday/i)
  );
  
  console.log(`Time-based achievements (${timeBased.length}):\n`);
  timeBased.forEach(a => {
    console.log(`${a.achievementId.padEnd(25)} | ${a.translations.en.name.padEnd(25)} | ${a.criteria?.params?.requirement || 'N/A'}`);
    console.log(`  Description: ${a.translations.en.description}\n`);
  });
  
  process.exit(0);
});
