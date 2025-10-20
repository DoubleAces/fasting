/**
 * NextAuth.js API Route Handler
 * 
 * This route handles all NextAuth requests:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out
 * - /api/auth/callback - OAuth callbacks
 * - /api/auth/session - Get session
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - Get providers
 * 
 * The [...nextauth] catch-all route handles all these endpoints.
 */

import { handlers } from '@/lib/auth';

/**
 * GET handler for NextAuth requests
 * 
 * Handles:
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get configured providers
 * - GET /api/auth/signin - Show sign in page
 * - GET /api/auth/signout - Show sign out confirmation
 * - GET /api/auth/callback/[provider] - OAuth callback handler
 */
export const GET = handlers.GET;

/**
 * POST handler for NextAuth requests
 * 
 * Handles:
 * - POST /api/auth/signin/[provider] - Sign in with provider
 * - POST /api/auth/signout - Sign out
 * - POST /api/auth/callback/[provider] - OAuth callback (token exchange)
 */
export const POST = handlers.POST;
