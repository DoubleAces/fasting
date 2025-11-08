import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../src/lib/db.js';
import User from '../src/lib/models/User.js';
import Achievement from '../src/lib/models/Achievement.js';
import UserAchievement from '../src/lib/models/UserAchievement.js';

async function unlockSunriseFinisher() {
  try {
    await connectDB();
    
    const userId = '68f9489e946071adb9a80c3c';
    const achievementId = 'sunrise-finisher';
    
    // Check if already unlocked
    const existing = await UserAchievement.findOne({ userId, achievementId });
    if (existing) {
      console.log('❌ Achievement already unlocked!');
      process.exit(0);
    }
    
    // Get achievement details
    const achievement = await Achievement.findOne({ achievementId });
    if (!achievement) {
      console.log('❌ Achievement not found!');
      process.exit(1);
    }
    
    console.log(`🔓 Unlocking: ${achievement.translations.en.name}`);
    console.log(`   Points: ${achievement.points}`);
    console.log(`   Rarity: ${achievement.rarity}\n`);
    
    // Create UserAchievement
    await UserAchievement.create({
      userId,
      achievementId,
      unlockedAt: new Date(),
      progress: 100
    });
    
    // Update user points
    await User.findByIdAndUpdate(userId, {
      $inc: { achievementPoints: achievement.points }
    });
    
    console.log(`✅ Achievement unlocked! (+${achievement.points} points)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

unlockSunriseFinisher();
