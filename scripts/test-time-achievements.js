import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../src/lib/db.js';
import Entry from '../src/lib/models/Entry.js';

async function testTimeAchievements() {
  try {
    await connectDB();
    
    const userId = '68f9489e946071adb9a80c3c'; // raido.purga@gmail.com
    
    const entries = await Entry.find({ userId })
      .sort({ date: 1 })
      .lean();
    
    console.log(`\nFound ${entries.length} entries for user\n`);
    
    // Check early starts (before 6 AM)
    const earlyStarts = entries.filter((entry) => {
      if (!entry.lastMealTime) return false;
      const [hours] = entry.lastMealTime.split(':').map(Number);
      return hours < 6;
    });
    
    console.log(`Early starts (before 6 AM): ${earlyStarts.length}/10`);
    earlyStarts.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      console.log(`  - ${date}: ${entry.lastMealTime}`);
    });
    
    // Check late starts (after 10 PM)
    const lateStarts = entries.filter((entry) => {
      if (!entry.lastMealTime) return false;
      const [hours] = entry.lastMealTime.split(':').map(Number);
      return hours >= 22;
    });
    
    console.log(`\nLate starts (after 10 PM): ${lateStarts.length}/10`);
    lateStarts.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      console.log(`  - ${date}: ${entry.lastMealTime}`);
    });
    
    // Check midnight starts
    const midnightStarts = entries.filter((entry) => entry.lastMealTime === '00:00');
    console.log(`\nMidnight starts (exactly 00:00): ${midnightStarts.length > 0 ? 'YES' : 'NO'}`);
    
    // Check sunrise finishes (5-7 AM)
    const sunriseFinishes = entries.filter((entry) => {
      if (!entry.firstMealTime) return false;
      const [hours] = entry.firstMealTime.split(':').map(Number);
      return hours >= 5 && hours < 7;
    });
    
    console.log(`\nSunrise finishes (5-7 AM): ${sunriseFinishes.length > 0 ? 'YES' : 'NO'}`);
    sunriseFinishes.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      console.log(`  - ${date}: ${entry.firstMealTime}`);
    });
    
    // Check 48+ hour fasts
    const longFasts = entries.filter((entry) => {
      return entry.firstMealTime && entry.fastingDuration >= 2880;
    });
    
    console.log(`\n48+ hour fasts (spans two midnights): ${longFasts.length > 0 ? 'YES' : 'NO'}`);
    longFasts.forEach((entry) => {
      const date = new Date(entry.date).toLocaleDateString();
      const hours = Math.floor(entry.fastingDuration / 60);
      console.log(`  - ${date}: ${hours}h ${entry.fastingDuration % 60}m`);
    });
    
    // Check comeback after 30+ days
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    let hasComeback = false;
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date);
      const currDate = new Date(sortedEntries[i].date);
      const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 30) {
        hasComeback = true;
        console.log(`\nComeback after 30+ days: YES`);
        console.log(`  Gap: ${dayDiff} days between ${prevDate.toLocaleDateString()} and ${currDate.toLocaleDateString()}`);
        break;
      }
    }
    if (!hasComeback) {
      console.log(`\nComeback after 30+ days: NO`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTimeAchievements();
