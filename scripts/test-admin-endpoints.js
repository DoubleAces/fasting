/**
 * Test Script: Admin Achievement Endpoints
 * 
 * Tests the two admin endpoints:
 * 1. POST /api/achievements/unlock - Manual unlock
 * 2. POST /api/admin/achievements - Create achievement
 * 
 * Prerequisites:
 * - Dev server running (npm run dev)
 * - Logged in as admin user
 * - Get session cookie from browser
 * 
 * Usage:
 * 1. Sign in to app as admin
 * 2. Open browser dev tools → Application → Cookies
 * 3. Copy 'authjs.session-token' value
 * 4. Set SESSION_TOKEN environment variable below
 * 5. Run: node scripts/test-admin-endpoints.js
 */

const BASE_URL = 'http://localhost:3000';

// TODO: Replace with your actual session token from browser cookies
const SESSION_TOKEN = 'YOUR_SESSION_TOKEN_HERE';

async function testManualUnlock() {
  console.log('\n🔓 Testing Manual Achievement Unlock');
  console.log('=' .repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/achievements/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${SESSION_TOKEN}`
      },
      body: JSON.stringify({
        userId: 'YOUR_USER_ID_HERE', // Replace with actual user ID
        achievementId: 'week-warrior' // Unlock Week Warrior achievement
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Achievement:', data.achievement);
      console.log('User Points:', data.user.achievementPoints);
      console.log('Unlocked By:', data.unlockedBy);
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function testCreateAchievement() {
  console.log('\n🎯 Testing Create Achievement');
  console.log('=' .repeat(60));
  
  const newAchievement = {
    achievementId: 'test-achievement',
    translations: {
      en: {
        name: 'Test Achievement',
        description: 'This is a test achievement created via API',
        shortDescription: 'Test badge'
      },
      es: {
        name: 'Logro de Prueba',
        description: 'Este es un logro de prueba creado a través de API',
        shortDescription: 'Insignia de prueba'
      }
    },
    category: 'special',
    criteria: {
      type: 'custom',
      params: { requirement: 'test' }
    },
    points: 5,
    rarity: 'common',
    icon: '🧪',
    iconColor: '#8B5CF6',
    order: 100,
    isActive: true,
    isSecret: false
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${SESSION_TOKEN}`
      },
      body: JSON.stringify(newAchievement)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Achievement:', data.achievement);
      console.log('Created By:', data.createdBy);
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Admin Endpoints Test Suite');
  console.log('=' .repeat(60));
  
  if (SESSION_TOKEN === 'YOUR_SESSION_TOKEN_HERE') {
    console.log('\n⚠️  Please update SESSION_TOKEN in the script first!');
    console.log('\nSteps:');
    console.log('1. Sign in to http://localhost:3000 as admin');
    console.log('2. Open browser DevTools → Application → Cookies');
    console.log('3. Copy the value of "authjs.session-token"');
    console.log('4. Paste it into this script (SESSION_TOKEN variable)');
    console.log('5. Run script again');
    return;
  }
  
  await testManualUnlock();
  await testCreateAchievement();
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Test suite complete!');
}

runTests().catch(console.error);
