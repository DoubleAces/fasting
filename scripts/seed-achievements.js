/**
 * Seed Script: Achievement Data
 * 
 * Seeds the database with initial achievement definitions for testing and development.
 * Run with: node scripts/seed-achievements.js
 * 
 * Make sure MONGODB_URI is set in .env.local
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

import bcrypt from 'bcrypt';
import Achievement from '../src/lib/models/Achievement.js';
import User from '../src/lib/models/User.js';
import { connectDB } from '../src/lib/db.js';

const achievements = [
  {
    achievementId: 'sweet-sixteen',
    translations: {
      en: {
        name: 'Sweet Sixteen',
        description: 'Complete your first 16-hour fast',
        shortDescription: 'First 16hr fast'
      },
      es: {
        name: 'Dulce Dieciséis',
        description: 'Completa tu primer ayuno de 16 horas',
        shortDescription: 'Primer ayuno de 16h'
      }
    },
    badgeImage: {
      locked: '/badges/sweet-sixteen-locked.png',
      unlocked: '/badges/sweet-sixteen-unlocked.png'
    },
    icon: '🎯',
    iconColor: '#4F46E5',
    category: 'duration',
    points: 10,
    rarity: 'common',
    order: 1,
    criteria: { type: 'duration-milestone', params: { hours: 16 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'getting-started',
    translations: {
      en: {
        name: 'Getting Started',
        description: 'Complete your first 3 fasting entries',
        shortDescription: '3 entries'
      },
      es: {
        name: 'Primeros Pasos',
        description: 'Completa tus primeras 3 entradas de ayuno',
        shortDescription: '3 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/getting-started-locked.png',
      unlocked: '/badges/getting-started-unlocked.png'
    },
    icon: '🌱',
    iconColor: '#10B981',
    category: 'getting-started',
    points: 5,
    rarity: 'common',
    order: 0,
    criteria: { type: 'entry-count', params: { count: 3 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'week-warrior',
    translations: {
      en: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day fasting streak',
        shortDescription: '7-day streak'
      },
      es: {
        name: 'Guerrero Semanal',
        description: 'Mantén una racha de ayuno de 7 días',
        shortDescription: 'Racha de 7 días'
      }
    },
    badgeImage: {
      locked: '/badges/week-warrior-locked.png',
      unlocked: '/badges/week-warrior-unlocked.png'
    },
    icon: '🔥',
    iconColor: '#F59E0B',
    category: 'streak',
    points: 25,
    rarity: 'rare',
    order: 10,
    criteria: { type: 'streak', params: { days: 7 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'eighteen-hour-hero',
    translations: {
      en: {
        name: 'Eighteen Hour Hero',
        description: 'Complete an 18-hour fast',
        shortDescription: '18hr fast'
      },
      es: {
        name: 'Héroe de Dieciocho Horas',
        description: 'Completa un ayuno de 18 horas',
        shortDescription: 'Ayuno de 18h'
      }
    },
    badgeImage: {
      locked: '/badges/eighteen-hour-locked.png',
      unlocked: '/badges/eighteen-hour-unlocked.png'
    },
    icon: '💪',
    iconColor: '#8B5CF6',
    category: 'duration',
    points: 15,
    rarity: 'common',
    order: 2,
    criteria: { type: 'duration-milestone', params: { hours: 18 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'daily-dozen',
    translations: {
      en: {
        name: 'Daily Dozen',
        description: 'Complete 12 consecutive days of fasting',
        shortDescription: '12-day streak'
      },
      es: {
        name: 'Docena Diaria',
        description: 'Completa 12 días consecutivos de ayuno',
        shortDescription: 'Racha de 12 días'
      }
    },
    badgeImage: {
      locked: '/badges/daily-dozen-locked.png',
      unlocked: '/badges/daily-dozen-unlocked.png'
    },
    icon: '📅',
    iconColor: '#EC4899',
    category: 'streak',
    points: 50,
    rarity: 'epic',
    order: 11,
    criteria: { type: 'streak', params: { days: 12 } },
    isActive: true,
    isSecret: false
  },
  {
    achievementId: 'century-club',
    translations: {
      en: {
        name: 'Century Club',
        description: 'Complete 100 fasting entries',
        shortDescription: '100 entries'
      },
      es: {
        name: 'Club del Centenario',
        description: 'Completa 100 entradas de ayuno',
        shortDescription: '100 entradas'
      }
    },
    badgeImage: {
      locked: '/badges/century-club-locked.png',
      unlocked: '/badges/century-club-unlocked.png'
    },
    icon: '💯',
    iconColor: '#06B6D4',
    category: 'consistency',
    points: 100,
    rarity: 'legendary',
    order: 50,
    criteria: { type: 'entry-count', params: { count: 100 } },
    isActive: true,
    isSecret: false
  }
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    // Find or create system admin user for achievements
    console.log('Finding or creating system admin...');
    let admin = await User.findOne({ email: 'system@achievements.local' });
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('system-admin-seed-achievements', 10);
      admin = await User.create({
        email: 'system@achievements.local',
        password: hashedPassword,
        name: 'System Achievement Admin',
        isAdmin: true,
        accountStatus: 'active'
      });
      console.log('✓ Created system admin user');
    } else {
      console.log('✓ Using existing system admin user');
    }
    
    // Add createdBy to all achievements
    const achievementsWithAdmin = achievements.map(achievement => ({
      ...achievement,
      createdBy: admin._id
    }));
    
    console.log('Clearing existing achievements...');
    const deleted = await Achievement.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} existing achievements`);
    
    console.log('Seeding achievements...');
    const inserted = await Achievement.insertMany(achievementsWithAdmin);
    console.log(`✅ Successfully seeded ${inserted.length} achievements`);
    
    console.log('\nSeeded achievements:');
    inserted.forEach(achievement => {
      console.log(`  - ${achievement.achievementId} (${achievement.category}, ${achievement.points} points)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
