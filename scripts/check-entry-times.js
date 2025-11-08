import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import dbConnect from '../src/lib/dbConnect.js';
import Entry from '../src/models/Entry.js';

async function checkEntryTimes() {
  try {
    await dbConnect();
    
    const entry = await Entry.findOne({ user: '68f9489e946071adb9a80c3c' }).lean();
    
    console.log('Sample entry:');
    console.log(JSON.stringify(entry, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEntryTimes();
