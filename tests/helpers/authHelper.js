/**
 * Authentication Helper for Integration Tests
 * 
 * Provides utilities for generating test authentication tokens
 * that can be used to authenticate API requests in integration tests.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a test JWT token for a user
 * @param {string} userId - The MongoDB ObjectId of the user
 * @param {string} email - The user's email address
 * @returns {string} JWT token string
 */
function generateTestToken(userId, email = 'test@example.com') {
  const secret = process.env.NEXTAUTH_SECRET || 'test-secret';
  
  const token = jwt.sign(
    {
      sub: userId.toString(),
      email: email,
      name: 'Test User',
      id: userId.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    },
    secret
  );

  return token;
}

/**
 * Create authorization headers for test requests
 * @param {string} token - JWT token
 * @returns {Object} Headers object with Cookie
 */
function createAuthHeaders(token) {
  return {
    Cookie: `authjs.session-token=${token}`,
  };
}

module.exports = {
  generateTestToken,
  createAuthHeaders,
};
