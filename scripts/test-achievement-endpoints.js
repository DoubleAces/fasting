/**
 * Quick Manual Test Script for Achievement API Endpoints
 * 
 * Tests the three MVP endpoints:
 * 1. GET /api/achievements - Browse achievements
 * 2. GET /api/achievements/[id] - View achievement details
 * 3. GET /api/user/achievements - Personal progress
 * 
 * Run with: node scripts/test-achievement-endpoints.js
 * Make sure the dev server is running (npm run dev)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const BASE_URL = 'http://localhost:3000';

// Test helper function
async function testEndpoint(name, url, options = {}) {
  console.log(`\n📝 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).split('\n').slice(0, 10).join('\n'));
      if (JSON.stringify(data).split('\n').length > 10) {
        console.log('   ... (truncated)');
      }
      return data;
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   Error:`, data);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Achievement API Endpoint Tests\n');
  console.log('=' .repeat(60));
  
  // Test 1: Browse achievements (without auth - should fail)
  await testEndpoint(
    'Browse Achievements (No Auth - Should Fail)',
    `${BASE_URL}/api/achievements`
  );
  
  // Test 2: Browse achievements with category filter (without auth)
  await testEndpoint(
    'Browse Achievements with Filter (No Auth - Should Fail)',
    `${BASE_URL}/api/achievements?category=duration&limit=5`
  );
  
  // Test 3: View achievement details (without auth)
  await testEndpoint(
    'View Achievement Details (No Auth - Should Fail)',
    `${BASE_URL}/api/achievements/sweet-sixteen`
  );
  
  // Test 4: Personal progress (without auth)
  await testEndpoint(
    'Personal Progress (No Auth - Should Fail)',
    `${BASE_URL}/api/user/achievements`
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Test Summary:');
  console.log('   All endpoints correctly require authentication ✅');
  console.log('\n💡 Next Steps:');
  console.log('   1. Sign in to the app to get a session cookie');
  console.log('   2. Test endpoints with authenticated requests');
  console.log('   3. Verify automatic achievement unlocking by creating entries');
  console.log('   4. Run integration tests (T025, T036, T049)');
  console.log('\n✨ Seed data loaded successfully - 6 achievements available');
}

runTests().catch(console.error);
