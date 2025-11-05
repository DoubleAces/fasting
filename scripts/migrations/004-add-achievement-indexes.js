/**
 * Migration: Achievement System Database Indexes
 * 
 * Ensures all required indexes exist for optimal achievement system performance.
 * Run this after deploying the achievement feature to production.
 * 
 * Indexes Created:
 * - Achievement collection: achievementId, category+order, isActive
 * - UserAchievement collection: userId+achievementId, userId+unlockedAt
 * 
 * Run with: node scripts/migrations/004-add-achievement-indexes.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env.local') });

import { connectDB } from '../../src/lib/db.js';
import Achievement from '../../src/lib/models/Achievement.js';
import UserAchievement from '../../src/lib/models/UserAchievement.js';

async function migrate() {
  console.log('🔧 Achievement System Index Migration');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n📡 Connecting to database...');
    await connectDB();
    console.log('✅ Connected successfully\n');
    
    // Achievement indexes
    console.log('📊 Creating Achievement indexes...');
    
    const achievementIndexes = await Achievement.collection.getIndexes();
    console.log(`Current Achievement indexes: ${Object.keys(achievementIndexes).length}`);
    
    // Sync indexes (creates missing, removes obsolete)
    await Achievement.syncIndexes();
    
    const achievementIndexesAfter = await Achievement.collection.getIndexes();
    console.log(`✅ Achievement indexes synced: ${Object.keys(achievementIndexesAfter).length} total`);
    Object.keys(achievementIndexesAfter).forEach(index => {
      console.log(`   - ${index}`);
    });
    
    // UserAchievement indexes
    console.log('\n📊 Creating UserAchievement indexes...');
    
    const userAchIndexes = await UserAchievement.collection.getIndexes();
    console.log(`Current UserAchievement indexes: ${Object.keys(userAchIndexes).length}`);
    
    // Sync indexes
    await UserAchievement.syncIndexes();
    
    const userAchIndexesAfter = await UserAchievement.collection.getIndexes();
    console.log(`✅ UserAchievement indexes synced: ${Object.keys(userAchIndexesAfter).length} total`);
    Object.keys(userAchIndexesAfter).forEach(index => {
      console.log(`   - ${index}`);
    });
    
    // Performance check
    console.log('\n📈 Running performance checks...');
    
    const achievementCount = await Achievement.countDocuments();
    const userAchievementCount = await UserAchievement.countDocuments();
    
    console.log(`   Achievements in database: ${achievementCount}`);
    console.log(`   UserAchievements in database: ${userAchievementCount}`);
    
    // Test query performance
    console.log('\n⚡ Testing query performance...');
    
    const start1 = Date.now();
    await Achievement.find({ isActive: true, category: 'duration' }).limit(10);
    const time1 = Date.now() - start1;
    console.log(`   ✓ Achievement category query: ${time1}ms`);
    
    if (userAchievementCount > 0) {
      const sampleUser = await UserAchievement.findOne();
      if (sampleUser) {
        const start2 = Date.now();
        await UserAchievement.find({ userId: sampleUser.userId }).sort({ unlockedAt: -1 });
        const time2 = Date.now() - start2;
        console.log(`   ✓ User achievements query: ${time2}ms`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration complete! All indexes created successfully.');
    console.log('\n💡 Recommendations:');
    console.log('   - Monitor query performance in production');
    console.log('   - Achievement queries should be <50ms');
    console.log('   - UserAchievement queries should be <100ms');
    console.log('   - Consider adding more indexes if queries are slow');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
