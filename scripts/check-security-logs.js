/**
 * Check Security Logs in MongoDB
 * 
 * Displays recent security log entries from the database.
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkSecurityLogs() {
  console.log('📋 Checking Security Logs in MongoDB...\n');

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    
    // Get the security logs collection
    const logs = await db
      .collection('securitylogs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    if (logs.length === 0) {
      console.log('No security logs found in database.');
    } else {
      console.log(`Found ${logs.length} recent security log(s):\n`);
      
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.action}`);
        console.log(`   Email: ${log.email}`);
        console.log(`   User ID: ${log.userId}`);
        console.log(`   IP: ${log.ip}`);
        console.log(`   URL: ${log.url}`);
        console.log(`   Reason: ${log.reason}`);
        console.log(`   User Agent: ${log.userAgent}`);
        console.log(`   Time: ${log.createdAt}`);
        console.log('');
      });
    }

    console.log('✅ Check completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

checkSecurityLogs();
