import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../src/lib/db.js';
import Entry from '../src/lib/models/Entry.js';
import Achievement from '../src/lib/models/Achievement.js';
import AchievementService from '../src/lib/services/AchievementService.js';

async function backfillTimeAchievements() {
  try {
    await connectDB();
    
    const userId = '68f9489e946071adb9a80c3c'; // raido.purga@gmail.com
    
    console.log('🔍 Fetching user entries...');
    const entries = await Entry.find({ userId }).sort({ date: 1 }).lean();
    console.log(`Found ${entries.length} entries\n`);
    
    console.log('🔍 Fetching time-based achievements...');
    const timeAchievements = await Achievement.find({
      'criteria.params.requirement': {
        $in: [
          'tenEarlyStarts',
          'tenLateStarts', 
          'startAtMidnight',
          'endAtSunrise',
          'comebackAfter30Days',
          'twoMidnightFast'
        ]
      }
    }).lean();
    
    console.log(`Found ${timeAchievements.length} time-based achievements:`);
    timeAchievements.forEach(ach => {
      console.log(`  - ${ach.achievementId}: ${ach.translations?.en?.name}`);
    });
    
    console.log('\n🔄 Evaluating achievements with new logic...\n');
    
    for (const entry of entries) {
      const result = await AchievementService.evaluateAndUnlock(userId, entry);
      if (result.unlockedAchievements.length > 0) {
        console.log(`✨ Unlocked ${result.unlockedAchievements.length} achievements from entry ${new Date(entry.date).toLocaleDateString()}:`);
        result.unlockedAchievements.forEach(ach => {
          console.log(`   - ${ach.name} (+${ach.points} pts)`);
        });
      }
    }
    
    console.log('\n✅ Backfill complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

backfillTimeAchievements();
