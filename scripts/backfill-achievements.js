/**
 * Backfill Script: Evaluate Achievements for Existing Entries
 * 
 * Problem: Achievement system (Features 031-032) only evaluates NEW entries.
 * Existing entries from before the achievement system was implemented don't
 * have their achievements unlocked.
 * 
 * Solution: This script runs the AchievementService.evaluateAndUnlock() for
 * all existing entries, unlocking achievements retroactively.
 * 
 * Usage:
 *   node scripts/backfill-achievements.js [userId]
 * 
 * Examples:
 *   node scripts/backfill-achievements.js                  # All users
 *   node scripts/backfill-achievements.js 507f1f77bcf86cd799439011  # Specific user
 * 
 * Features:
 * - Evaluates all entries for all users (or single user if specified)
 * - Idempotent: safe to run multiple times (duplicate handling in DB)
 * - Progress reporting: shows achievements unlocked per entry
 * - Summary statistics: total entries processed, achievements unlocked
 * - Error resilient: continues processing if individual entry fails
 */

import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/lib/db.js';
import { AchievementService } from '../src/lib/services/AchievementService.js';
import Entry from '../src/lib/models/Entry.js';
import User from '../src/lib/models/User.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Backfill achievements for a single user
 */
async function backfillUserAchievements(userId) {
  console.log(`\n🔍 Processing user: ${userId}`);
  
  // Get all entries for this user, sorted chronologically
  const entries = await Entry.find({ userId })
    .sort({ date: 1 }) // Oldest to newest (important for streak calculation)
    .select('_id date fastingTime');
  
  if (entries.length === 0) {
    console.log('   No entries found for this user');
    return { entriesProcessed: 0, achievementsUnlocked: 0, errors: 0 };
  }
  
  console.log(`   Found ${entries.length} entries to process`);
  
  let totalAchievements = 0;
  let errorCount = 0;
  
  // Process each entry sequentially
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const entryNum = i + 1;
    
    try {
      // Evaluate achievements for this entry
      const result = await AchievementService.evaluateAndUnlock(
        userId.toString(),
        entry._id.toString()
      );
      
      if (result.unlockedAchievements.length > 0) {
        totalAchievements += result.unlockedAchievements.length;
        console.log(`   ✅ Entry ${entryNum}/${entries.length} (${entry.date.toISOString().split('T')[0]}): Unlocked ${result.unlockedAchievements.length} achievement(s)`);
        result.unlockedAchievements.forEach(ach => {
          console.log(`      🏆 ${ach.name} (+${ach.points} pts)`);
        });
      } else {
        // Don't spam console for entries with no new achievements
        if (entryNum % 10 === 0 || entryNum === entries.length) {
          console.log(`   📊 Processed ${entryNum}/${entries.length} entries...`);
        }
      }
    } catch (error) {
      errorCount++;
      console.error(`   ❌ Entry ${entryNum}/${entries.length} failed: ${error.message}`);
      // Continue processing other entries
    }
  }
  
  return {
    entriesProcessed: entries.length,
    achievementsUnlocked: totalAchievements,
    errors: errorCount
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Achievement Backfill Script Starting...\n');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Get target user(s)
    const targetUserId = process.argv[2]; // Optional: node script.js <userId>
    
    let users;
    if (targetUserId) {
      // Single user mode
      console.log(`🎯 Single user mode: ${targetUserId}`);
      const user = await User.findById(targetUserId).select('_id email name');
      if (!user) {
        throw new Error(`User not found: ${targetUserId}`);
      }
      users = [user];
      console.log(`   User: ${user.email || user.name || 'Unknown'}`);
    } else {
      // All users mode
      console.log('🎯 All users mode');
      users = await User.find({}).select('_id email name');
      console.log(`   Found ${users.length} users`);
    }
    
    // Process each user
    const startTime = Date.now();
    let totalStats = {
      usersProcessed: 0,
      entriesProcessed: 0,
      achievementsUnlocked: 0,
      errors: 0
    };
    
    for (const user of users) {
      const userStats = await backfillUserAchievements(user._id);
      totalStats.usersProcessed++;
      totalStats.entriesProcessed += userStats.entriesProcessed;
      totalStats.achievementsUnlocked += userStats.achievementsUnlocked;
      totalStats.errors += userStats.errors;
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKFILL COMPLETE');
    console.log('='.repeat(60));
    console.log(`Users processed:        ${totalStats.usersProcessed}`);
    console.log(`Entries processed:      ${totalStats.entriesProcessed}`);
    console.log(`Achievements unlocked:  ${totalStats.achievementsUnlocked} 🏆`);
    console.log(`Errors:                 ${totalStats.errors}`);
    console.log(`Duration:               ${duration}s`);
    console.log('='.repeat(60));
    
    if (totalStats.achievementsUnlocked > 0) {
      console.log('\n🎉 SUCCESS! Your achievements have been unlocked!');
      console.log('💡 Refresh your achievements page to see the results.');
    } else {
      console.log('\n✨ No new achievements to unlock (all entries already evaluated).');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectDB();
    console.log('\n✅ Database disconnected');
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
