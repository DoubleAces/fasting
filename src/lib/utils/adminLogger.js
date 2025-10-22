/**
 * Admin Security Logger
 * 
 * Provides structured logging for admin area access attempts.
 * Logs include timestamp, user info, IP address, and action taken.
 * 
 * Denied access attempts are saved to MongoDB for security monitoring.
 * Granted access is only logged to console (not saved to DB).
 * 
 * Use cases:
 * - Log denied access attempts for security monitoring (saved to DB)
 * - Log successful admin access for audit trails (console only)
 * - Provide structured logs for log aggregation tools (e.g., CloudWatch, Datadog)
 */

import { connectDB } from '@/lib/db';
import SecurityLog from '@/lib/models/SecurityLog';

/**
 * Log denied admin access attempt
 * 
 * Saves to MongoDB and logs to console.
 * 
 * @param {Object} logData - Access attempt data
 * @param {string} logData.userId - User ID (or 'anonymous' if not authenticated)
 * @param {string} logData.email - User email
 * @param {string} logData.ip - IP address of request
 * @param {string} logData.url - Requested URL
 * @param {string} logData.reason - Reason for denial
 * @param {string} logData.userAgent - User agent string (optional)
 */
export async function logAdminAccessDenied(logData) {
  const timestamp = new Date().toISOString();
  
  const structuredLog = {
    timestamp,
    action: 'ADMIN_ACCESS_DENIED',
    userId: logData.userId || 'anonymous',
    email: logData.email || 'unknown',
    ip: logData.ip || 'unknown',
    url: logData.url,
    reason: logData.reason,
    userAgent: logData.userAgent || 'unknown',
  };

  // Log to console for immediate visibility
  console.warn('🔴 ADMIN ACCESS DENIED', structuredLog);

  // Save to MongoDB for persistent security monitoring
  try {
    await connectDB();
    await SecurityLog.create({
      action: 'ADMIN_ACCESS_DENIED',
      userId: structuredLog.userId,
      email: structuredLog.email,
      ip: structuredLog.ip,
      url: structuredLog.url,
      reason: structuredLog.reason,
      userAgent: structuredLog.userAgent,
    });
    console.log('✓ Security log saved to MongoDB');
  } catch (error) {
    // Don't throw error - logging failure shouldn't break the app
    console.error('✗ Failed to save security log to MongoDB:', error.message);
  }
}

/**
 * Log successful admin access
 * 
 * @param {Object} logData - Access data
 * @param {string} logData.userId - Admin user ID
 * @param {string} logData.email - Admin user email
 * @param {string} logData.ip - IP address of request
 * @param {string} logData.url - Accessed URL
 */
export function logAdminAccessGranted(logData) {
  const timestamp = new Date().toISOString();
  
  const structuredLog = {
    timestamp,
    action: 'ADMIN_ACCESS_GRANTED',
    userId: logData.userId,
    email: logData.email,
    ip: logData.ip || 'unknown',
    url: logData.url,
  };

  // Use console.warn for consistency with denied logs (makes filtering easier)
  console.warn('✅ ADMIN ACCESS GRANTED', structuredLog);
}

/**
 * Extract IP address from Next.js request
 * 
 * Checks various headers in order of reliability:
 * 1. x-forwarded-for (from proxies/load balancers)
 * 2. x-real-ip (from nginx)
 * 3. Direct connection IP
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
