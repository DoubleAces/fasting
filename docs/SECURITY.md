# Security Configuration Documentation

## Overview
This document outlines the security measures implemented in the Fasting Tracker MVP.

## Authentication & Authorization

### NextAuth v5 Configuration
**Location:** `src/lib/auth.js`

#### Session Management
- **Strategy:** JWT (stateless, no database session storage)
- **Max Age:** 30 days
- **Token Signing:** NEXTAUTH_SECRET environment variable

#### Session Cookies
NextAuth v5 automatically configures secure cookies with the following settings:

- **HttpOnly:** `true` - Prevents client-side JavaScript access
- **Secure:** `true` (in production) - HTTPS only
- **SameSite:** `lax` - CSRF protection
- **Path:** `/` - Available for all routes
- **Domain:** Auto-configured based on NEXTAUTH_URL

#### CSRF Protection
✅ **ENABLED BY DEFAULT** in NextAuth v5

NextAuth v5 includes built-in CSRF protection:
- CSRF tokens generated for all state-changing operations
- Token validation on sign-in, sign-out, and callback requests
- Protection against cross-site request forgery attacks

**No additional configuration required.**

### Password Security

#### Hashing Algorithm
**Location:** `src/lib/utils/password.js`

- **Algorithm:** bcrypt
- **Rounds:** 10 (industry standard minimum)
- **Salt:** Automatically generated per password
- **Hash Length:** 60 characters

```javascript
const BCRYPT_ROUNDS = 10;
```

#### Password Requirements
**Location:** `src/lib/validation/authSchema.js`

- **Minimum Length:** 8 characters
- **Complexity Requirements:**
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Special characters allowed but not required

### Rate Limiting

#### Implementation
**Location:** `src/lib/utils/rateLimiter.js`

Simple in-memory rate limiter for MVP. **For production, migrate to Redis-based solution.**

#### Limits by Endpoint

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/api/auth/register` | 3 requests | 60 seconds | Prevent mass account creation |
| Login attempts | 5 attempts | 60 seconds | Prevent brute force attacks |
| Password reset | 3 requests | 5 minutes | Prevent abuse |

#### Client Identification
- Primary: `X-Forwarded-For` header (for proxies/load balancers)
- Fallback: `X-Real-IP` header
- Default: 'unknown' (Edge Runtime limitation)

#### Rate Limit Response
- **Status Code:** 429 Too Many Requests
- **Headers:** `Retry-After: 60`
- **Error Code:** `RATE_LIMIT_EXCEEDED`

### User Data Isolation

#### Database Queries
All API routes filter by authenticated user's ID:

```javascript
// Check authentication
const session = await auth();
if (!session?.user?.id) {
  return unauthorizedResponse('Authentication required');
}

// Filter by userId
const entries = await Entry.find({ userId: session.user.id });
```

#### Ownership Verification
Before update/delete operations:

```javascript
// Verify ownership
if (entry.userId.toString() !== session.user.id) {
  return forbiddenResponse('You do not have permission');
}
```

#### Protected Endpoints
- ✅ `GET /api/entries` - Returns only user's entries
- ✅ `POST /api/entries` - Creates with user's userId
- ✅ `GET /api/entries/[id]` - Verifies ownership
- ✅ `PUT /api/entries/[id]` - Verifies ownership
- ✅ `DELETE /api/entries/[id]` - Verifies ownership
- ✅ `GET /api/entries/check-previous` - Filters by userId
- ✅ `GET /api/settings` - Returns only user's settings
- ✅ `PUT /api/settings` - Updates only user's settings

### Route Protection

#### Middleware
**Location:** `src/middleware.js`

Protected routes require authentication:
- `/entries`
- `/entries/*`
- `/settings`
- `/settings/*`
- `/api/entries/*`
- `/api/settings/*`

Unauthenticated requests redirect to `/login`.

#### Edge Runtime Compatibility
Uses `getToken()` from `next-auth/jwt` (Edge-compatible) instead of `auth()` which requires Node.js runtime.

## HTTP Security Headers

### Implemented by Next.js
Next.js automatically includes several security headers:

- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `DENY`
- **X-XSS-Protection:** `1; mode=block`

### Recommended for Production
Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ];
}
```

## Environment Variables

### Required for Security

```env
# NextAuth Secret (CRITICAL - use strong random string)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# NextAuth URL (production domain)
NEXTAUTH_URL=https://yourdomain.com

# Google OAuth Credentials
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# MongoDB Connection
MONGODB_URI=<MongoDB Atlas connection string>
```

### Security Best Practices for Secrets

1. **Never commit .env files to version control**
2. **Use different secrets for dev/staging/production**
3. **Rotate secrets regularly (every 90 days)**
4. **Use environment-specific values in deployment platforms**

## OAuth Security

### Google OAuth Configuration

**Authorized JavaScript Origins:**
- `http://localhost:3000` (development only)
- `https://yourdomain.com` (production)

**Authorized Redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (development)
- `https://yourdomain.com/api/auth/callback/google` (production)

### OAuth Flow Security
- ✅ PKCE (Proof Key for Code Exchange) enabled
- ✅ State parameter for CSRF protection
- ✅ Secure redirect URL validation
- ✅ Token expiration (3600 seconds)
- ✅ Refresh token for long-term access

## Error Handling

### Security-First Error Messages

#### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "timestamp": "2025-10-19T20:00:00.000Z"
}
```

#### Authorization Errors (403)
```json
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "timestamp": "2025-10-19T20:00:00.000Z"
}
```

#### Generic Login Errors
Never reveal whether email exists:
- ❌ "Email not found"
- ❌ "Incorrect password"
- ✅ "Invalid email or password"

## Production Deployment Checklist

### Pre-Deployment Security

- [ ] Set `NODE_ENV=production`
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure OAuth redirect URIs for production
- [ ] Enable MongoDB Atlas IP whitelist (production IPs only)
- [ ] Set up MongoDB Atlas database user with minimal permissions
- [ ] Configure HTTPS/TLS certificate
- [ ] Set up proper CORS headers
- [ ] Implement Redis-based rate limiting
- [ ] Enable database connection pooling
- [ ] Set up monitoring/alerting for failed login attempts
- [ ] Configure log rotation and retention
- [ ] Run security audit: `npm audit`
- [ ] Update all dependencies: `npm update`
- [ ] Test all authentication flows on staging

### Post-Deployment Monitoring

- [ ] Monitor rate limit violations
- [ ] Track failed login attempts
- [ ] Set up alerts for unusual authentication patterns
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Log analysis for security events

## Known Limitations (MVP)

### Rate Limiting
- **Current:** In-memory (resets on server restart)
- **Production Recommendation:** Redis-based distributed rate limiting

### Session Storage
- **Current:** JWT only (stateless)
- **Production Consideration:** Add database session storage for:
  - Session revocation
  - Multi-device management
  - Force logout capabilities

### Password Reset
- **Current:** Not implemented
- **Required for Production:** Email-based password reset flow

### Two-Factor Authentication
- **Current:** Not implemented
- **Optional for Production:** TOTP-based 2FA

## Security Audit Log

| Date | Change | Reason |
|------|--------|--------|
| 2025-10-19 | Added rate limiting to registration endpoint | Prevent mass account creation |
| 2025-10-19 | Implemented user data isolation in all API routes | Prevent unauthorized data access |
| 2025-10-19 | Documented CSRF protection (NextAuth v5 default) | Ensure team awareness |
| 2025-10-19 | Verified bcrypt rounds = 10 | Industry standard minimum |
| 2025-10-19 | Confirmed secure cookie configuration | Auto-configured by NextAuth v5 |

## Contact

For security concerns or vulnerability reports, please contact:
- **Email:** security@yourdomain.com
- **Response Time:** Within 24 hours for critical issues

---

**Last Updated:** October 19, 2025
**Document Version:** 1.0.0
**Review Frequency:** Quarterly or after major changes
