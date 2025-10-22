# Middleware Contract: Admin Authentication

**Feature**: Admin Area Access  
**Date**: October 22, 2025  
**Type**: Authorization Middleware

## Overview

This contract defines the behavior of admin authentication middleware that protects admin routes from unauthorized access.

---

## Middleware Signature

**File**: `src/middleware.js` (extends existing middleware)  
**Runtime**: Edge Runtime (Next.js Middleware)

### Function Interface

```javascript
/**
 * Next.js Middleware for route protection
 * Runs on Edge Runtime before route handlers
 * 
 * @param {Request} request - Incoming HTTP request
 * @returns {Response|NextResponse|null} Response object or null to continue
 */
export async function middleware(request) {
  // ... implementation
}

/**
 * Middleware configuration
 * Defines which routes the middleware applies to
 */
export const config = {
  matcher: [
    '/dashboard/:path*',     // All admin routes
    '/api/admin/:path*',     // Future admin API routes
    // ... other protected routes
  ],
};
```

---

## Request Flow

```
┌──────────────┐
│   Request    │
│ /dashboard/* │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   Middleware     │
│   (Edge Runtime) │
└──────┬───────────┘
       │
       ├─────► Session exists? ──NO──► Redirect to /login?callbackUrl=...
       │                YES
       ▼
┌──────────────────┐
│  Check isAdmin   │
│  from session    │
└──────┬───────────┘
       │
       ├─────► isAdmin === true? ──NO──► Redirect to /access-denied
       │                      YES
       ▼
┌──────────────────┐
│  Allow request   │
│  to continue     │
└──────────────────┘
```

---

## Input Contract

### Request Object

**Required Headers**:
- `cookie` - Contains NextAuth session cookie

**Request Properties**:
- `request.url` - Full URL being accessed
- `request.nextUrl.pathname` - Path portion of URL
- `request.headers.get('cookie')` - Session cookie

### Session Object (from NextAuth)

```typescript
interface Session {
  user: {
    id: string;           // User ID from database
    email: string;        // User email
    name?: string;        // User name (optional)
    isAdmin: boolean;     // Admin privilege flag
  };
  expires: string;        // ISO 8601 expiration timestamp
}
```

**Session Source**: NextAuth.js (read from encrypted cookie or JWT)

---

## Output Contract

### Response Types

**1. Allow Access (Success)**:
```javascript
// Return null or undefined to continue to route handler
return null;

// OR use NextResponse.next() explicitly
return NextResponse.next();
```

**2. Redirect to Login (Unauthenticated)**:
```javascript
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
loginUrl.searchParams.set('error', 'SessionExpired'); // Optional

return NextResponse.redirect(loginUrl);
```

**3. Redirect to Access Denied (Unauthorized)**:
```javascript
const accessDeniedUrl = new URL('/access-denied', request.url);
return NextResponse.redirect(accessDeniedUrl);
```

**4. Force Logout (Privilege Revoked)**:
```javascript
// Clear session cookies and redirect to login
const response = NextResponse.redirect(new URL('/login', request.url));
response.cookies.delete('next-auth.session-token'); // Production
response.cookies.delete('__Secure-next-auth.session-token'); // HTTPS
return response;
```

---

## Behavior Specifications

### 1. Unauthenticated User (No Session)

**Input**:
- No session cookie
- Request to `/dashboard`

**Expected Output**:
- HTTP 307 Redirect to `/login?callbackUrl=/dashboard`
- Preserve attempted URL for post-login redirect

**Test Case**:
```javascript
// Given: No session cookie
// When: Request to /dashboard
// Then: Redirect to /login?callbackUrl=/dashboard
```

---

### 2. Authenticated Non-Admin User

**Input**:
- Valid session: `{ user: { isAdmin: false } }`
- Request to `/dashboard`

**Expected Output**:
- HTTP 307 Redirect to `/access-denied`
- Log unauthorized access attempt

**Test Case**:
```javascript
// Given: Session with isAdmin=false
// When: Request to /dashboard
// Then: Redirect to /access-denied
// And: Log entry created with userId, attemptedUrl, timestamp, IP
```

---

### 3. Authenticated Admin User

**Input**:
- Valid session: `{ user: { isAdmin: true } }`
- Request to `/dashboard`

**Expected Output**:
- Allow request to continue (return null)
- No redirect, no logging

**Test Case**:
```javascript
// Given: Session with isAdmin=true
// When: Request to /dashboard
// Then: Request continues to route handler
// And: No redirect occurs
```

---

### 4. Expired Session

**Input**:
- Expired session cookie (past `expires` timestamp)
- Request to `/dashboard`

**Expected Output**:
- HTTP 307 Redirect to `/login?callbackUrl=/dashboard&error=SessionExpired`
- Session cookie cleared

**Test Case**:
```javascript
// Given: Expired session cookie
// When: Request to /dashboard
// Then: Redirect to /login?error=SessionExpired
// And: Session cookie deleted
```

---

### 5. Admin Privilege Revoked (Session Still Valid)

**Input**:
- Valid session: `{ user: { isAdmin: true } }` (from old session)
- Database: `user.isAdmin = false` (changed after session created)
- Request to `/dashboard`

**Expected Behavior**:
- **Initial implementation**: Rely on session refresh (admin sees old session until it expires/refreshes)
- **Future enhancement**: Check database on every request (slower but more secure)

**For MVP**:
- Session contains stale `isAdmin: true`
- Middleware allows access (uses session value)
- **Mitigation**: Short session duration (30 min recommended for admin)
- **Alternative**: Force logout all sessions when admin flag changes (server-side session store)

**Test Case**:
```javascript
// Given: Session with isAdmin=true (stale)
// And: Database has user.isAdmin=false
// When: Request to /dashboard
// Then: [MVP] Allow access (uses session)
// OR: [Future] Force logout and redirect to /login
```

---

### 6. Non-Existent Admin Route (404)

**Input**:
- Valid admin session
- Request to `/dashboard/nonexistent-page`

**Expected Output**:
- Middleware allows request to continue
- Next.js handles 404 with `/dashboard/not-found.js`
- Custom 404 page shown within admin layout

**Test Case**:
```javascript
// Given: Valid admin session
// When: Request to /dashboard/nonexistent
// Then: Middleware allows request
// And: Next.js returns 404 with admin layout
```

---

## Error Handling

### Invalid Session Token

**Scenario**: Session cookie is corrupted or tampered with

**Behavior**:
- NextAuth returns `null` session
- Treat as unauthenticated
- Redirect to login

### Network Errors (Future: Database Check)

**Scenario**: Database query fails during privilege re-verification

**Behavior**:
- Log error
- Fail closed: Deny access (security over availability)
- Show error page: "Unable to verify access. Please try again."

### Middleware Crash

**Scenario**: Unexpected error in middleware code

**Behavior**:
- Next.js catches error
- Returns 500 Internal Server Error
- Log error with stack trace
- **Important**: Do NOT allow request through on error (fail closed)

---

## Performance Requirements

| Operation | Max Duration | Notes |
|-----------|--------------|-------|
| Session decode | <10ms | NextAuth JWT/cookie decrypt |
| Admin flag check | <5ms | Read from session (in-memory) |
| Total middleware time | <50ms | Edge Runtime overhead |
| Database re-verify (future) | <100ms | If implemented, use indexed query |

**Target**: <50ms total middleware execution time (95th percentile)

---

## Security Requirements

### 1. Session Validation

- ✅ Verify session signature (NextAuth handles this)
- ✅ Check session expiration
- ✅ Validate session structure (has required fields)

### 2. CSRF Protection

- ✅ NextAuth handles CSRF tokens
- ✅ Middleware does NOT need additional CSRF checks

### 3. Rate Limiting

- ⚠️ Out of scope for MVP
- Future: Add rate limiting for failed access attempts
- Prevents brute force attacks on admin routes

### 4. Logging

- ✅ Log all unauthorized access attempts
- ✅ Include: timestamp, userId (if any), IP, attempted URL
- ❌ Do NOT log: passwords, session tokens, sensitive data

### 5. Secure Headers

```javascript
// Add security headers to response
const response = NextResponse.next();
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
return response;
```

---

## Testing Contract

### Unit Tests

```javascript
describe('Admin Middleware', () => {
  it('allows admin user to access /dashboard', async () => {
    const request = createMockRequest('/dashboard', { isAdmin: true });
    const response = await middleware(request);
    expect(response).toBeNull(); // Continues to route
  });

  it('redirects non-admin to /access-denied', async () => {
    const request = createMockRequest('/dashboard', { isAdmin: false });
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('/access-denied');
  });

  it('redirects unauthenticated to /login', async () => {
    const request = createMockRequest('/dashboard', null);
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('preserves callback URL on redirect', async () => {
    const request = createMockRequest('/dashboard/users', null);
    const response = await middleware(request);
    expect(response.headers.get('location')).toContain('callbackUrl=%2Fdashboard%2Fusers');
  });
});
```

### Integration Tests

- Test with real NextAuth session
- Test session expiration handling
- Test cookie clearing on logout
- Test with actual database queries (if implemented)

### E2E Tests

- Login as admin → access /dashboard → success
- Login as regular user → access /dashboard → denied
- No login → access /dashboard → redirect to login
- Revoke admin during session → access denied on next request

---

## Dependencies

**Required**:
- `next/server` - NextResponse, NextRequest
- `next-auth` - Session handling (via exported authConfig)

**Optional**:
- `src/lib/utils/adminLogger.js` - Security logging
- Database client (if implementing real-time privilege check)

---

## Example Implementation (Pseudocode)

```javascript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // NextAuth helper

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only check admin routes
  if (pathname.startsWith('/dashboard')) {
    const session = await auth(); // Get NextAuth session

    // Check if user is authenticated
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'SessionExpired');
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin
    if (!session.user.isAdmin) {
      // Log unauthorized access
      await logUnauthorizedAccess({
        userId: session.user.id,
        attemptedUrl: pathname,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        timestamp: new Date(),
      });

      return NextResponse.redirect(new URL('/access-denied', request.url));
    }

    // Admin user - allow access
    return NextResponse.next();
  }

  // Not an admin route - allow
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial contract definition |

---

## Notes

- Middleware runs on Edge Runtime (no Node.js APIs available)
- Session is read-only in middleware (cannot modify session)
- For session updates, use NextAuth callbacks in `/api/auth/[...nextauth]`
- Database queries in middleware add latency - use sparingly
