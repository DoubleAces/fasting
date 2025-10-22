/**
 * Admin Authentication Helper Functions
 * 
 * Provides utilities for checking admin privileges and validating sessions
 * in middleware and server components.
 * 
 * Functions:
 * - checkAdminAccess: Determine if session has admin access and where to redirect
 * - validateAdminSession: Validate session structure and admin flag
 * 
 * Usage:
 *   import { checkAdminAccess } from '@/lib/middleware/adminAuth';
 *   const { allowed, redirect } = checkAdminAccess(session, requestedUrl);
 */

/**
 * Check if user has admin access
 * 
 * @param {Object|null} session - NextAuth session object
 * @param {string} requestedUrl - URL user is trying to access (for callback)
 * @returns {Object} { allowed: boolean, redirect: string|null }
 */
export function checkAdminAccess(session, requestedUrl = '/dashboard') {
  // No session = unauthenticated -> redirect to login
  if (!session || !session.user) {
    const encodedCallback = encodeURIComponent(requestedUrl);
    return {
      allowed: false,
      redirect: `/login?callbackUrl=${encodedCallback}`,
    };
  }
  
  // Has session but not admin -> show 404 (security through obscurity)
  if (!session.user.isAdmin) {
    return {
      allowed: false,
      redirect: '/404',
    };
  }
  
  // Has session and is admin -> allow access
  return {
    allowed: true,
    redirect: null,
  };
}

/**
 * Validate admin session structure
 * 
 * @param {Object|null} session - NextAuth session object
 * @returns {Object} { isValid: boolean, isAdmin: boolean }
 */
export function validateAdminSession(session) {
  // Invalid session structure
  if (!session || !session.user) {
    return {
      isValid: false,
      isAdmin: false,
    };
  }
  
  // Valid session, check admin flag
  return {
    isValid: true,
    isAdmin: session.user.isAdmin === true,
  };
}

/**
 * Get user info from session for display
 * 
 * @param {Object|null} session - NextAuth session object
 * @returns {Object|null} User info or null
 */
export function getAdminUserInfo(session) {
  if (!session || !session.user) {
    return null;
  }
  
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    picture: session.user.picture,
    isAdmin: session.user.isAdmin,
  };
}
