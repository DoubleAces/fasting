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
 * 
 * Note: This middleware runs in Edge Runtime, so we cannot import
 * database connections, bcrypt, or other Node.js-only modules.
 */

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Define protected routes that require authentication
 */
const protectedRoutes = ['/entries', '/settings'];

/**
 * Define admin routes that require admin privileges
 */
const adminRoutes = ['/dashboard'];

/**
 * Define auth routes that should redirect to /entries if already authenticated
 */
const authRoutes = ['/login', '/register'];

/**
 * Define public routes (password reset is public to allow unauthenticated access)
 */
const publicRoutes = ['/', '/faq', '/reset-password', '/features'];

/**
 * Middleware function
 * 
 * Runs on every request to check authentication and handle redirects.
 * Uses NextAuth's getToken() which is Edge Runtime compatible.
 * 
 * @param {Request} request - The incoming request
 * @returns {Response} The response (redirect or continue)
 */
export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get JWT token (Edge Runtime compatible)
  // Auth.js uses __Secure-authjs.session-token in production (not __Host-)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
    cookieName: process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  });
  
  const isAuthenticated = !!token;

  console.log('🔵 Middleware:', { 
    pathname, 
    isAuthenticated, 
    hasToken: !!token,
    tokenEmail: token?.email,
    cookies: request.cookies.getAll().map(c => c.name)
  });

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is an admin route
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // CASE 1: Admin route protection
  // Check admin privileges before allowing access
  if (isAdminRoute) {
    // If not authenticated, redirect to login with callback URL
    if (!isAuthenticated) {
      console.log('🔴 Redirecting to login - admin route without auth');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // If authenticated but not admin, redirect to access denied
    if (!token.isAdmin) {
      console.log('🔴 Redirecting to access-denied - non-admin user');
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    
    // Admin user - allow access
    console.log('✅ Admin access granted');
    return NextResponse.next();
  }

  // CASE 2: Protected route without authentication
  // Redirect to login with callback URL to return after login
  if (isProtectedRoute && !isAuthenticated) {
    console.log('🔴 Redirecting to login - protected route without auth');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 3: Auth route with authentication
  // Redirect to /entries (user is already logged in)
  if (isAuthRoute && isAuthenticated) {
    console.log('🟢 Redirecting to /entries - auth route with authentication');
    return NextResponse.redirect(new URL('/entries', request.url));
  }

  // CASE 4: Public route or allowed route
  // Continue to the requested page
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * Specifies which routes this middleware should run on.
 * 
 * Matcher options:
 * - Includes all routes except static files, _next internal routes, and API routes
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
     * - API routes (all /api/* routes handle their own auth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
