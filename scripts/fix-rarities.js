/**
 * Fix Achievement Rarities and Points
 * Run with: node scripts/fix-rarities.js
 */

import { readFile, writeFile } from 'fs/promises';

const fixes = {
  // Getting Started: 6 common, 2 rare (currently 4c, 1r, 2e, 1l)
  'fifty-entries': { rarity: 'rare', points: 50 }, // keep rare  
  'hundred-entries': { rarity: 'rare', points: 75 }, // epic→rare, adjust points
  'twofifty-entries': { rarity: 'epic', points: 150 }, // legendary→epic
  'fivehundred-entries': { rarity: 'epic', points: 200 }, // legendary→epic, keep points
  
  // Duration: 4 common, 4 rare, 3 epic, 1 legendary
  // Currently mostly common/rare/epic, some legendary - need to balance
  'fiveday-master': { rarity: 'legendary', points: 250 }, // keep
  'week-long-legend': { rarity: 'legendary', points: 400 }, // keep points high
  'extended-master': { rarity: 'legendary', points: 500 }, // keep
  
  // Streak: 2 common, 4 rare, 3 epic, 1 legendary
  // Currently has too many at legendary
  'ninety-day-legend': { rarity: 'epic', points: 150 }, // legendary→epic
  'hundred-day-elite': { rarity: 'epic', points: 200 }, // legendary→epic
  'halfyear-hero': { rarity: 'epic', points: 300 }, // legendary→epic
  'year-legend': { rarity: 'legendary', points: 500 }, // keep
  'fivehundred-day-titan': { rarity: 'legendary', points: 1000 }, // keep
  'thousand-day-immortal': { rarity: 'legendary', points: 2000 }, // keep
  
  // Goal: 3 common, 3 rare, 2 epic
  'perfect-month': { rarity: 'epic', points: 150 }, // legendary→epic
  
  // Weight: 3 common, 3 rare, 2 epic
  'fifty-pounds': { rarity: 'epic', points: 150 }, // legendary→epic
  'seventy five-pounds': { rarity: 'epic', points: 200 }, // legendary→epic
  'hundred-pounds': { rarity: 'epic', points: 250 }, // legendary→epic
  'goal-weight': { rarity: 'epic', points: 200 }, // legendary→epic
  
  // Consistency: 5 common, 4 rare, 2 epic, 1 legendary
  'quarterly-champion': { rarity: 'epic', points: 150 }, // legendary→epic
  'yearly-legend': { rarity: 'legendary', points: 300 }, // keep
  'century-club': { rarity: 'epic', points: 100 }, // legendary→epic
  
  // Special: 6 common, 5 rare, 3 epic, 1 legendary
  'all-rounder': { rarity: 'epic', points: 120 }, // legendary→epic
  'completionist': { rarity: 'epic', points: 150 }, // legendary→epic
  'master-faster': { rarity: 'legendary', points: 500 }, // keep
  'night-stalker': { rarity: 'epic', points: 100 }, // legendary→epic, secret
  
  // Knowledge: 4 common, 2 rare, 2 epic
  'fasting-encyclopedia': { rarity: 'epic', points: 150 }, // legendary→epic
  
  // Fix common point values that are too high (>25)
  'twentyfive-entries': { rarity: 'common', points: 25 },
  'thirtysix-hour-legend': { rarity: 'rare', points: 60 }, // epic→rare
  'fortyeight-hour-titan': { rarity: 'epic', points: 100 },
  'seventy two-hour-champion': { rarity: 'epic', points: 120 },
  'ninetysix-hour-elite': { rarity: 'epic', points: 150 },
};

// Additional secret achievements (need 5-7 total, currently 2)
const secretAchievements = [
  'lucky-thirteen',
  'night-stalker',
  'thousand-day-immortal',
  'extended-master',
  'master-faster'
];

async function fix() {
  const filePath = './scripts/achievements-data.js';
  let content = await readFile(filePath, 'utf-8');
  
  // Apply rarity and point fixes
  for (const [achievementId, changes] of Object.entries(fixes)) {
    // Find achievement block and update
    const regex = new RegExp(
      `(achievementId: '${achievementId}',[\\s\\S]*?points: )\\d+([\\s\\S]*?rarity: ')[^']+(',[\\s\\S]*?isSecret: )(true|false)`,
      'g'
    );
    
    content = content.replace(regex, (match, before, middle, afterRarity, endSecret, currentSecret) => {
      const newPoints = changes.points || match.match(/points: (\d+)/)[1];
      const newRarity = changes.rarity;
      const isSecret = secretAchievements.includes(achievementId) ? 'true' : 'false';
      
      return `${ before}${newPoints}${middle}${newRarity}${afterRarity}${isSecret}`;
    });
  }
  
  await writeFile(filePath, content, 'utf-8');
  console.log('✓ Fixed rarities and points');
  console.log(`✓ Set ${secretAchievements.length} secret achievements`);
}

fix().catch(console.error);
