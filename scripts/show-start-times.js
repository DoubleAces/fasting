import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../src/lib/db.js';
import Entry from '../src/lib/models/Entry.js';

async function showStartTimes() {
  try {
    await connectDB();
    
    const userId = '68f9489e946071adb9a80c3c';
    
    const entries = await Entry.find({ userId })
      .sort({ date: 1 })
      .lean();
    
    console.log(`\nAll start times (lastMealTime) for your ${entries.length} entries:\n`);
    
    entries.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      const [hours] = entry.lastMealTime.split(':').map(Number);
      const timeOfDay = hours < 6 ? '🌅 EARLY!' : hours < 12 ? '🌄 Morning' : hours < 18 ? '☀️ Afternoon' : hours < 22 ? '🌆 Evening' : '🌙 Night';
      console.log(`${date}: ${entry.lastMealTime} ${timeOfDay}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

showStartTimes();
