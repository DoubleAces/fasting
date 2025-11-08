require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Achievement = require('../src/lib/models/Achievement').default;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const achievements = await Achievement.find({}).select('achievementId translations.en.name points criteria').lean();
  
  const sorted = achievements.sort((a, b) => {
    const nameA = a.translations?.en?.name || '';
    const nameB = b.translations?.en?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  console.log('\nAll Achievements:');
  console.log('='.repeat(100));
  sorted.forEach(a => {
    const id = a.achievementId.padEnd(35);
    const name = (a.translations?.en?.name || 'N/A').padEnd(35);
    const points = String(a.points).padStart(4);
    const type = a.criteria?.type || 'N/A';
    console.log(`${id} | ${name} | ${points}pts | ${type}`);
  });
  
  // Check for duplicates by name
  console.log('\n\nDuplicate Check:');
  console.log('='.repeat(100));
  const nameMap = new Map();
  achievements.forEach(a => {
    const name = a.translations?.en?.name;
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name).push(a.achievementId);
  });
  
  nameMap.forEach((ids, name) => {
    if (ids.length > 1) {
      console.log(`⚠️  DUPLICATE: "${name}" appears ${ids.length} times:`);
      ids.forEach(id => console.log(`   - ${id}`));
    }
  });
  
  process.exit(0);
});
