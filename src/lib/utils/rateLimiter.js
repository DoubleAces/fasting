/**
 * Simple in-memory rate limiter for API endpoints
 * 
 * For production, consider using:
 * - Redis-based rate limiting
 * - upstash/ratelimit for edge functions
 * - Rate limiting middleware like express-rate-limit
 */

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 5) {
    this.windowMs = windowMs; // Time window in milliseconds
    this.maxRequests = maxRequests; // Max requests per window
    this.requests = new Map(); // Map of IP -> [timestamps]
  }

  /**
   * Check if a request should be allowed
   * @param {string} identifier - IP address or user identifier
   * @returns {boolean} - True if request is allowed, false if rate limited
   */
  checkLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];

    // Remove requests outside the current window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);

    // Check if user has exceeded the limit
    if (userRequests.length >= this.maxRequests) {
      return false; // Rate limited
    }

    // Add current request timestamp
    userRequests.push(now);
    this.requests.set(identifier, userRequests);

    // Clean up old entries periodically (every 100 requests)
    if (this.requests.size > 100) {
      this.cleanup(windowStart);
    }

    return true; // Request allowed
  }

  /**
   * Clean up old entries from the map
   * @param {number} windowStart - Timestamp for start of current window
   */
  cleanup(windowStart) {
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }

  /**
   * Get the client IP from the request
   * @param {Request} request - The incoming request
   * @returns {string} - Client IP address
   */
  static getClientIP(request) {
    // Try to get IP from various headers (for proxies/load balancers)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    // Fallback to connection IP (not available in Edge Runtime)
    return 'unknown';
  }

  /**
   * Reset rate limit for a specific identifier
   * Useful for testing or admin overrides
   * @param {string} identifier - IP address or user identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.requests.clear();
  }
}

// Create rate limiters for different endpoints
// Login: 5 attempts per minute
export const loginLimiter = new RateLimiter(60000, 5);

// Registration: 3 attempts per minute (stricter)
export const registerLimiter = new RateLimiter(60000, 3);

// Password reset: 3 attempts per 5 minutes
export const passwordResetLimiter = new RateLimiter(300000, 3);

/**
 * Helper function to check rate limit and return appropriate response
 * @param {RateLimiter} limiter - The rate limiter instance to use
 * @param {Request} request - The incoming request
 * @returns {Response|null} - Rate limit response or null if allowed
 */
export function checkRateLimit(limiter, request) {
  const clientIP = RateLimiter.getClientIP(request);
  
  if (!limiter.checkLimit(clientIP)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60' // Suggest retry after 60 seconds
        }
      }
    );
  }

  return null; // Request is allowed
}

export default RateLimiter;
