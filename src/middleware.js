/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware runs before every request and handles:
 * 1. Authentication checks for protected routes
 * 2. Redirects unauthenticated users to login page
 * 3. Redirects authenticated users away from auth pages
 * 
 * Protected Routes:
 * - /entries - Requires authentication
 * - /settings - Requires authentication
 * 
 * Auth Routes (redirect if already authenticated):
 * - /login - Redirect to /entries if authenticated
 * - /register - Redirect to /entries if authenticated
 * 
 * Public Routes (no authentication required):
 * - / - Homepage
 * - /faq - FAQ page
 * - /reset-password - Password reset page
 * - /api/auth/* - NextAuth endpoints
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Define protected routes that require authentication
 */
const protectedRoutes = ['/entries', '/settings'];

/**
 * Define auth routes that should redirect to /entries if already authenticated
 */
const authRoutes = ['/login', '/register'];

/**
 * Define public routes (password reset is public to allow unauthenticated access)
 */
const publicRoutes = ['/', '/faq', '/reset-password'];

/**
 * Middleware function
 * 
 * Runs on every request to check authentication and handle redirects.
 * 
 * @param {Request} request - The incoming request
 * @returns {Response} The response (redirect or continue)
 */
export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get session from NextAuth
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // CASE 1: Protected route without authentication
  // Redirect to login with callback URL to return after login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 2: Auth route with authentication
  // Redirect to /entries (user is already logged in)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/entries', request.url));
  }

  // CASE 3: Public route or allowed route
  // Continue to the requested page
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * Specifies which routes this middleware should run on.
 * 
 * Matcher options:
 * - Includes all routes except static files, _next internal routes, and API routes (except /api/auth)
 * - Uses negative lookahead to exclude patterns
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes except /api/auth/*
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
