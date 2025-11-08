/**
 * Find User ID by Email
 * 
 * Usage:
 *   node scripts/find-my-userid.js <email>
 *   node scripts/find-my-userid.js              # Lists all users
 * 
 * Example:
 *   node scripts/find-my-userid.js john@example.com
 */

import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../src/lib/db.js';
import User from '../src/lib/models/User.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  const searchEmail = process.argv[2];
  
  try {
    await connectDB();
    console.log('✅ Database connected\n');
    
    if (searchEmail) {
      // Search for specific user
      console.log(`🔍 Searching for user: ${searchEmail}\n`);
      
      const user = await User.findOne({ email: searchEmail }).select('_id email name createdAt');
      
      if (!user) {
        console.log('❌ User not found');
        console.log('\n💡 Try running without email to see all users:');
        console.log('   node scripts/find-my-userid.js');
      } else {
        console.log('✅ User found!\n');
        console.log('='.repeat(60));
        console.log(`User ID:    ${user._id}`);
        console.log(`Email:      ${user.email}`);
        console.log(`Name:       ${user.name || 'N/A'}`);
        console.log(`Created:    ${new Date(user.createdAt).toLocaleDateString()}`);
        console.log('='.repeat(60));
        console.log('\n💡 To backfill achievements for this user, run:');
        console.log(`   node scripts/backfill-achievements.js ${user._id}`);
        console.log('\n💡 To diagnose achievements for this user, run:');
        console.log(`   node scripts/diagnose-achievements.js ${user._id}`);
      }
    } else {
      // List all users
      console.log('📋 Listing all users:\n');
      
      const users = await User.find({})
        .select('_id email name createdAt')
        .sort({ createdAt: -1 })
        .lean();
      
      if (users.length === 0) {
        console.log('No users found in database');
      } else {
        console.log(`Found ${users.length} user(s):\n`);
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email || 'No email'}`);
          console.log(`   ID: ${user._id}`);
          console.log(`   Name: ${user.name || 'N/A'}`);
          console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
          console.log('');
        });
        
        console.log('💡 To backfill achievements for a user, run:');
        console.log('   node scripts/backfill-achievements.js <userId>');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

main();
