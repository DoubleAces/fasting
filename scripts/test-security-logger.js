/**
 * Test Security Logger
 * 
 * Quick script to verify security logging API works.
 * This tests the /api/admin/log-security endpoint used by middleware.
 * 
 * Make sure the dev server is running on port 3001 before running this test.
 */

async function testSecurityLogger() {
  console.log('🧪 Testing Security Logger API...\n');
  console.log('Make sure the dev server is running on http://localhost:3001\n');

  // Wait a bit to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Test logging a denied access attempt via API
    console.log('Sending POST request to http://localhost:3001/api/admin/log-security...');
    
    const response = await fetch('http://localhost:3001/api/admin/log-security', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ADMIN_ACCESS_DENIED',
        userId: 'test-user-123',
        email: 'test@example.com',
        ip: '192.168.1.1',
        url: '/dashboard',
        reason: 'Test log entry - not an admin',
        userAgent: 'Mozilla/5.0 (Test Script)',
      }),
    });

    console.log(`Response status: ${response.status}`);
    
    const result = await response.json();
    console.log('Response body:', result);
    
    if (result.success) {
      console.log('\n✅ Security log test completed successfully!');
      console.log('Check MongoDB Atlas > fasting database > securitylogs collection');
      console.log('You should see a new document with action: ADMIN_ACCESS_DENIED\n');
      process.exit(0);
    } else {
      console.error('\n❌ Test failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. Dev server is running (npm run dev)');
    console.error('2. Server is listening on port 3001');
    console.error('3. No firewall blocking localhost connections\n');
    console.error('Full error:', error);
    process.exit(1);
  }
}

testSecurityLogger();
