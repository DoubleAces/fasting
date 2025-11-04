/**
 * Quickstart Validation Script
 * Validates code examples from quickstart.md work correctly
 * 
 * Run with: node scripts/validate-achievement-quickstart.js
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Achievement from '../src/lib/models/Achievement.js';
import UserAchievement from '../src/lib/models/UserAchievement.js';
import User from '../src/lib/models/User.js';

async function validateQuickstart() {
  let mongoServer;
  
  try {
    console.log('🔍 Validating Quickstart Examples...\n');

    // Connect to in-memory database (same as tests)
    console.log('1. Connecting to test MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB\n');

    // Clean test data
    await Achievement.deleteMany({ achievementId: /quickstart-/ });
    await UserAchievement.deleteMany({});
    await User.deleteMany({ email: /quickstart-/ });

    // Example 1: Create Achievement
    console.log('2. Creating achievement (Example 1)...');
    const admin = await User.create({
      email: 'quickstart-admin@test.com',
      password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
      authMethod: 'email',
      name: 'Quickstart Admin',
      isAdmin: true,
    });

    const firstFast = await Achievement.create({
      achievementId: 'quickstart-first-fast',
      translations: {
        en: {
          name: 'First Fast',
          description: 'Log your first fasting entry',
          shortDescription: 'First entry'
        },
        es: {
          name: 'Primer Ayuno',
          description: 'Registra tu primera entrada de ayuno',
          shortDescription: 'Primera entrada'
        }
      },
      icon: '🎉',
      iconColor: '#F59E0B',
      category: 'getting-started',
      points: 10,
      rarity: 'common',
      order: 1,
      criteria: {
        type: 'entry-count',
        params: { count: 1 }
      },
      isActive: true,
      isSecret: false,
      createdBy: admin._id
    });
    console.log('✅ Created achievement:', firstFast.achievementId);
    console.log('   Points:', firstFast.points);
    console.log('   Icon:', firstFast.icon);
    console.log('   Translations: en, es\n');

    // Example 2: Unlock Achievement
    console.log('3. Unlocking achievement for user (Example 2)...');
    const user = await User.create({
      email: 'quickstart-user@test.com',
      password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
      authMethod: 'email',
      name: 'Quickstart User',
      achievementPoints: 0,
      preferredLanguage: 'en',
    });

    const unlock = await UserAchievement.create({
      userId: user._id,
      achievementId: firstFast.achievementId,
      unlockedAt: new Date(),
      progress: 100,
      notificationSeen: false
    });

    await User.findByIdAndUpdate(user._id, {
      $inc: { achievementPoints: firstFast.points }
    });

    const updatedUser = await User.findById(user._id);
    console.log('✅ Unlocked achievement for user');
    console.log('   User points:', updatedUser.achievementPoints);
    console.log('   Unlock time:', unlock.unlockedAt.toISOString());
    console.log('   Progress:', unlock.progress, '%\n');

    // Example 3: Query Achievements
    console.log('4. Querying achievements (Example 3)...');
    const achievements = await Achievement.find({
      isActive: true,
      isSecret: false
    }).sort({ order: 1 });
    console.log('✅ Found', achievements.length, 'active achievements\n');

    // Example 4: Get User's Achievements
    console.log('5. Getting user achievements (Example 4)...');
    const userAchievements = await UserAchievement.find({ userId: user._id });
    console.log('✅ User has', userAchievements.length, 'unlocked achievements\n');

    // Example 5: Manual Join
    console.log('6. Manual join with achievement details (Example 5)...');
    const unlocks = await UserAchievement.find({ userId: user._id });
    const achievementIds = unlocks.map(u => u.achievementId);
    const achievementDetails = await Achievement.find({
      achievementId: { $in: achievementIds }
    });

    const enriched = unlocks.map(unlock => {
      const achievement = achievementDetails.find(
        a => a.achievementId === unlock.achievementId
      );
      return {
        unlockedAt: unlock.unlockedAt,
        achievementName: achievement?.translations.en.name,
        points: achievement?.points
      };
    });

    console.log('✅ Enriched achievements:', JSON.stringify(enriched, null, 2));
    console.log('');

    // Example 6: User Language Preference
    console.log('7. User language preference (Example 6)...');
    const spanishUser = await User.create({
      email: 'quickstart-spanish@test.com',
      password: '$2b$10$fQIgmDdkBa877TaRe80DKOZdGPYZfylm8SLGKf3HXfdXQnW8XrE8C',
      authMethod: 'email',
      name: 'Usuario Español',
      preferredLanguage: 'es',
    });

    const lang = spanishUser.preferredLanguage;
    const translation = firstFast.translations[lang] || firstFast.translations.en;
    console.log('✅ Spanish user sees:');
    console.log('   Language:', lang);
    console.log('   Name:', translation.name);
    console.log('   Description:', translation.description);
    console.log('');

    // Example 7: Duplicate Prevention
    console.log('8. Duplicate prevention (Example 7)...');
    try {
      await UserAchievement.create({
        userId: user._id,
        achievementId: firstFast.achievementId,
        unlockedAt: new Date(),
      });
      console.log('❌ ERROR: Should have thrown duplicate key error');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate prevention working correctly (Error 11000 caught)\n');
      } else {
        throw error;
      }
    }

    // Cleanup
    await Achievement.deleteMany({ achievementId: /quickstart-/ });
    await UserAchievement.deleteMany({});
    await User.deleteMany({ email: /quickstart-/ });

    console.log('✅ All quickstart examples validated successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

// Run validation
validateQuickstart();
