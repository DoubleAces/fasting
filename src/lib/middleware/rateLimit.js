/**
 * Rate limiting middleware for admin endpoints
 * Enforces 100 requests per minute per admin user
 */

// In-memory store for rate limiting (use Redis in production for distributed systems)
const requestCounts = new Map();

// Clean up old entries every minute
setInterval(() => {
  const oneMinuteAgo = Date.now() - 60000;
  for (const [key, data] of requestCounts.entries()) {
    if (data.resetTime < oneMinuteAgo) {
      requestCounts.delete(key);
    }
  }
}, 60000);

/**
 * Rate limiter configuration
 */
const config = {
  windowMs: 60000, // 1 minute
  maxRequests: 100 // requests per window
};

/**
 * Rate limiting middleware
 * 
 * @param {Request} req - Next.js request object
 * @returns {Object|null} Error response if rate limit exceeded, null if allowed
 */
export function rateLimit(req) {
  // Extract user ID from session (assumes adminAuth middleware has run first)
  const userId = req.session?.user?.id || req.headers.get('x-user-id');
  
  if (!userId) {
    // If no user ID, allow request (auth middleware will handle rejection)
    return null;
  }

  const now = Date.now();
  const key = `admin:${userId}`;
  
  let userData = requestCounts.get(key);
  
  // Initialize or reset if window expired
  if (!userData || now - userData.resetTime >= config.windowMs) {
    userData = {
      count: 0,
      resetTime: now + config.windowMs
    };
    requestCounts.set(key, userData);
  }
  
  // Increment request count
  userData.count++;
  
  // Check if limit exceeded
  if (userData.count > config.maxRequests) {
    const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
    
    return {
      status: 429,
      body: {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${config.maxRequests} requests per minute.`,
        retryAfter
      },
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(userData.resetTime).toISOString()
      }
    };
  }
  
  // Add rate limit headers to response
  req.rateLimitHeaders = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': (config.maxRequests - userData.count).toString(),
    'X-RateLimit-Reset': new Date(userData.resetTime).toISOString()
  };
  
  return null; // Allow request
}

/**
 * Get current rate limit status for a user
 * 
 * @param {string} userId - User ID
 * @returns {Object} Rate limit status
 */
export function getRateLimitStatus(userId) {
  const key = `admin:${userId}`;
  const userData = requestCounts.get(key);
  
  if (!userData) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: null
    };
  }
  
  return {
    count: userData.count,
    remaining: Math.max(0, config.maxRequests - userData.count),
    resetTime: userData.resetTime
  };
}

/**
 * Reset rate limit for a user (for testing)
 * 
 * @param {string} userId - User ID
 */
export function resetRateLimit(userId) {
  const key = `admin:${userId}`;
  requestCounts.delete(key);
}

export default rateLimit;
