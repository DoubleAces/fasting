import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../src/lib/db.js';
import Achievement from '../src/lib/models/Achievement.js';

async function findEarlyAchievements() {
  try {
    await connectDB();
    
    const achievements = await Achievement.find({
      $or: [
        { 'translations.en.description': /10.*am/i },
        { 'translations.en.description': /10.*morning/i },
        { 'translations.en.description': /before.*morning/i },
        { 'translations.en.name': /early/i }
      ]
    }).lean();
    
    console.log(`Found ${achievements.length} achievements:\n`);
    
    achievements.forEach((ach) => {
      console.log(`${ach.achievementId} | ${ach.translations?.en?.name}`);
      console.log(`  Description: ${ach.translations?.en?.description}`);
      console.log(`  Requirements: ${JSON.stringify(ach.requirements)}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findEarlyAchievements();
