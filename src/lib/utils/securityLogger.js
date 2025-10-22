/**
 * Security Logger for Edge Runtime
 * 
 * Edge Runtime-compatible security logging utility.
 * Sends logging requests to an API route that runs in Node.js runtime.
 * 
 * This is specifically for middleware logging since Edge Runtime doesn't support
 * MongoDB native driver (uses Node.js streams). For regular API routes, 
 * use adminLogger.js which has more features.
 */

/**
 * Extract client IP address from request headers
 * 
 * @param {Request} request - Next.js request object
 * @returns {string} IP address or 'unknown'
 */
export function getClientIP(request) {
  // Check x-forwarded-for header (most common for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  // Check x-real-ip header (nginx)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to connection IP (if available)
  // Note: In production with proxies, this will be the proxy IP, not client IP
  return 'unknown';
}

/**
 * Log denied admin access attempt to MongoDB
 * 
 * Edge Runtime compatible - sends request to API route.
 * 
 * @param {Object} logData - Access attempt data
 * @param {string} logData.userId - User ID (or 'anonymous' if not authenticated)
 * @param {string} logData.email - User email
 * @param {string} logData.ip - IP address of request
 * @param {string} logData.url - Requested URL
 * @param {string} logData.reason - Reason for denial
 * @param {string} logData.userAgent - User agent string (optional)
 * @param {Request} logData.request - Original request object for base URL
 */
export async function logSecurityEvent(logData) {
  try {
    const baseUrl = logData.request 
      ? new URL(logData.request.url).origin 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/admin/log-security`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ADMIN_ACCESS_DENIED',
        userId: logData.userId || 'anonymous',
        email: logData.email || 'unknown',
        ip: logData.ip || 'unknown',
        url: logData.url,
        reason: logData.reason,
        userAgent: logData.userAgent || 'unknown',
      }),
    });

    if (response.ok) {
      console.log('✓ Security log sent to API');
    } else {
      console.error('✗ Failed to log security event:', response.statusText);
    }
  } catch (error) {
    // Don't throw - logging failure shouldn't break authentication
    console.error('✗ Failed to send security log:', error.message);
  }
}
