# Research: Admin Area Access

**Feature**: Admin Area Access  
**Date**: October 22, 2025  
**Phase**: 0 (Research & Decision Making)

## Overview

This document captures technical research and decisions for implementing a secure admin area in the Next.js fasting tracker application.

## Research Areas

### 1. Next.js App Router Admin Area Patterns

**Decision**: Use dedicated route group with layout wrapper

**Rationale**:
- Next.js App Router provides native support for route-specific layouts via `layout.js`
- Route groups allow organizing admin routes under `/dashboard` path
- Server Components by default reduce client-side JavaScript bundle
- Middleware can intercept requests before reaching route handlers for security
- Parallel routes not needed for simple admin/public separation

**Alternatives Considered**:
- **Separate admin subdomain**: Rejected - adds deployment complexity, requires separate DNS/hosting setup, overkill for single application
- **Route intercepting with parallel routes**: Rejected - unnecessary complexity for this use case, better suited for modals/overlays
- **Client-side route guarding only**: Rejected - security vulnerability, must enforce server-side

**Implementation Pattern**:
```
src/app/dashboard/
├── layout.js        # Admin-specific layout
├── page.js          # Dashboard home
└── [...routes]/     # Future admin pages
```

**References**:
- Next.js App Router Layouts: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

### 2. Admin Privilege Verification Strategy

**Decision**: Middleware + Server Component session checks with database verification

**Rationale**:
- Next.js middleware runs on Edge Runtime before route handlers (fastest interception)
- Middleware can access NextAuth session without database query (session cookie/JWT)
- Session contains user ID, can check admin flag from session if included
- For critical operations, re-verify admin flag from database (defense in depth)
- Per-request checking prevents privilege escalation after revocation

**Alternatives Considered**:
- **Middleware-only verification**: Rejected - requires including admin flag in session token, increases token size and requires token refresh on privilege change
- **Server Component-only verification**: Rejected - slower than middleware, routes load before check
- **API route wrapper pattern**: Rejected - doesn't protect page routes, only for API endpoints

**Implementation Approach**:
1. Extend NextAuth session to include `isAdmin` flag from database
2. Middleware checks session.user.isAdmin for initial access
3. Server Components re-verify from database for critical operations
4. Use React Context to share admin status across components (client-side only)

**Security Considerations**:
- Session token signed by NextAuth (tamper-proof)
- Session refreshed on admin flag changes (callback in NextAuth config)
- Database index on User.isAdmin for fast queries
- Logging of all privilege check failures

**References**:
- NextAuth Session Callbacks: https://next-auth.js.org/configuration/callbacks#session-callback
- Next.js Middleware Auth: https://nextjs.org/docs/app/building-your-application/authentication

---

### 3. User Model Schema Extension

**Decision**: Add boolean `isAdmin` field to existing User model

**Rationale**:
- Simple boolean sufficient for binary admin/non-admin distinction
- Indexed for fast privilege queries
- Default false (secure by default - users not admin unless explicitly granted)
- No breaking changes to existing user records (Mongoose default value)
- Can migrate to RBAC later if needed without removing field

**Alternatives Considered**:
- **Separate AdminUsers collection**: Rejected - data duplication, synchronization issues, adds complexity
- **Role enum field**: Rejected - overengineering for single admin role, YAGNI principle
- **Bitwise permissions field**: Rejected - premature optimization, not needed for MVP

**Schema Change**:
```javascript
isAdmin: {
  type: Boolean,
  default: false,
  index: true, // Fast privilege queries
}
```

**Migration Strategy**:
- Add field with default value (non-breaking)
- Create database script to set first admin user
- No data migration needed (default false applies to existing users)

**References**:
- Mongoose Schema Types: https://mongoosejs.com/docs/schematypes.html
- Mongoose Indexes: https://mongoosejs.com/docs/indexes.html

---

### 4. Admin Layout & Styling Approach

**Decision**: Tailwind CSS utility classes with admin layout components

**Rationale**:
- Existing project uses Tailwind CSS 4.1.14 (consistent styling approach)
- Dashboard layout pattern: fixed sidebar + header + scrollable content
- Server Components reduce client bundle size
- Responsive grid/flexbox for layout structure
- Dark mode support via Tailwind's dark: prefix (future enhancement)

**Alternatives Considered**:
- **Pre-built admin template library**: Rejected - adds dependencies, potential conflicts with existing styles, licensing concerns
- **CSS Modules for admin styles**: Rejected - inconsistent with project's Tailwind approach
- **Inline styles**: Rejected - not maintainable, no responsive utilities

**Layout Structure**:
```
┌─────────────────────────────────────┐
│ Header (AdminHeader)                │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main Content             │
│ (Admin   │ (children)               │
│ Sidebar) │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Component Breakdown**:
- `AdminLayout`: Wraps page content, provides layout structure
- `AdminSidebar`: Navigation links, collapsible on mobile
- `AdminHeader`: User info, logout, breadcrumbs
- `EmptyDashboard`: Welcome message with "Coming Soon" cards

**Responsive Behavior**:
- Desktop (≥1024px): Sidebar visible, fixed width (256px)
- Tablet (768-1023px): Sidebar collapsible, overlay when open
- Mobile (<768px): Sidebar hidden by default, hamburger menu

**References**:
- Tailwind CSS Dashboard Examples: https://tailwindui.com/components/application-ui/application-shells
- Next.js Layout Composition: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts

---

### 5. Security Logging Strategy

**Decision**: Winston logger with structured JSON logging to file + console

**Rationale**:
- Winston is Node.js standard for production logging
- Structured JSON logs enable log aggregation tools (Datadog, CloudWatch, etc.)
- File transport for persistent audit trail
- Console transport for development visibility
- Log rotation prevents disk space issues

**Alternatives Considered**:
- **Console.log only**: Rejected - no persistence, no structure, not production-ready
- **Database logging**: Rejected - performance overhead, database becomes audit log (separate concerns)
- **Third-party service (Sentry, LogRocket)**: Deferred - can add later, start with local logging

**Log Entry Structure**:
```json
{
  "timestamp": "2025-10-22T14:30:00.000Z",
  "level": "warn",
  "event": "unauthorized_admin_access",
  "userId": "user_id_or_null",
  "ip": "192.168.1.1",
  "attemptedUrl": "/dashboard/users",
  "userAgent": "Mozilla/5.0...",
  "sessionId": "session_id_hash"
}
```

**Fields Captured** (per clarification):
- Timestamp (ISO 8601)
- User ID (if authenticated)
- Attempted URL
- IP Address

**Additional Context** (for better debugging):
- User Agent
- Session ID (hashed for privacy)
- Event type (unauthorized_admin_access, privilege_revoked, etc.)

**Implementation**:
- Create `src/lib/utils/adminLogger.js` wrapper around Winston
- Convenience methods: `logUnauthorizedAccess()`, `logPrivilegeRevoked()`
- Configure in environment: LOG_LEVEL, LOG_FILE_PATH

**References**:
- Winston Logger: https://github.com/winstonjs/winston
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

---

### 6. Session Expiration & Privilege Revocation Handling

**Decision**: Redirect to login with preserved return URL

**Rationale** (from clarifications):
- Standard web application pattern (used by GitHub, Google Admin, etc.)
- NextAuth supports `callbackUrl` parameter for post-login redirects
- Graceful user experience - users understand session timeout
- Security: Forces fresh authentication after session expires
- Works for both session expiration and privilege revocation scenarios

**Alternatives Considered**:
- **Modal overlay re-authentication**: Rejected - more complex state management, requires client-side logic, breaks on page refresh
- **Silent session refresh**: Rejected - security risk, could mask privilege revocation
- **Show error without redirect**: Rejected - poor UX, user stuck on page

**Implementation Details**:

**Session Expiration Flow**:
1. User session expires (NextAuth default: 30 days, configurable)
2. Middleware detects expired session on next request
3. Redirect to `/login?callbackUrl=/dashboard/[current-path]&error=SessionExpired`
4. Login page shows message: "Your session has expired. Please log in again."
5. After successful login, NextAuth redirects to callbackUrl

**Privilege Revocation Flow**:
1. Admin flag set to false while user active in admin area
2. Next request: Middleware detects session.user.isAdmin === false
3. Force logout (clear session cookies)
4. Redirect to `/login?error=PrivilegeRevoked`
5. Login page shows: "Your admin access has been revoked. Please contact support."
6. User can log in as regular user (no callbackUrl - goes to default post-login page)

**Edge Case: Privilege Revoked During Session**:
- NextAuth session contains isAdmin flag
- Need to refresh session when admin flag changes
- Solution: Add session validation in middleware that checks database every N minutes (rate-limited cache)
- Alternative: Force logout all sessions on privilege change (simpler, implemented first)

**Code Locations**:
- Middleware: `src/middleware.js` (session checks, redirects)
- Login page: `src/app/login/page.js` (display error messages)
- Auth callbacks: `src/lib/auth.js` (session generation, admin flag inclusion)

**References**:
- NextAuth Callbacks: https://next-auth.js.org/configuration/callbacks
- NextAuth Redirect: https://next-auth.js.org/configuration/pages#sign-in-page

---

### 7. 404 Handling Within Admin Area

**Decision**: Custom 404 page using Next.js not-found.js within admin layout

**Rationale** (from clarifications):
- Next.js App Router supports route-specific `not-found.js` files
- Placing `not-found.js` in `/dashboard` directory applies only to admin routes
- Maintains admin layout (sidebar, header) for consistency
- Clear messaging: "Admin page not found" vs "Public page not found"
- User stays in admin context, can navigate using sidebar

**Alternatives Considered**:
- **Redirect to main dashboard**: Rejected - hides the error, user doesn't know page doesn't exist
- **Use public 404 page**: Rejected - loses admin layout, confusing context switch
- **Access denied page**: Rejected - wrong message, 404 ≠ permission denied

**Implementation**:
```
src/app/dashboard/not-found.js  # Custom 404 for admin routes
```

**Content**:
- Header: "Page Not Found"
- Message: "The admin page you're looking for doesn't exist."
- Suggestions: Links to main dashboard, common admin pages
- HTTP 404 status code (automatic in Next.js)

**Triggering not-found.js**:
- Next.js automatically uses route-specific not-found.js for unmatched routes
- Can manually trigger with `notFound()` function from 'next/navigation'

**References**:
- Next.js not-found.js: https://nextjs.org/docs/app/api-reference/file-conventions/not-found

---

### 8. Empty Dashboard Content Strategy

**Decision**: Welcome message with placeholder "Coming Soon" cards

**Rationale** (from clarifications):
- Professional appearance without functionality
- Clear indication this is an admin area (not broken)
- Sets expectations for future features
- Provides visual structure (cards/widgets) to guide future development
- Better UX than blank page or "TODO" text

**Layout**:
```
┌──────────────────────────────────────────────┐
│ Welcome to Admin Dashboard                   │
│ Your admin area is ready for configuration.  │
├─────────────────┬─────────────────┬──────────┤
│ Card 1          │ Card 2          │ Card 3   │
│ Coming Soon     │ Coming Soon     │ Coming   │
│                 │                 │ Soon     │
└─────────────────┴─────────────────┴──────────┘
```

**Card Placeholders**:
- User Management (Coming Soon)
- System Settings (Coming Soon)
- Analytics & Reports (Coming Soon)
- Content Management (Coming Soon)

**Styling**:
- Clean, professional dashboard aesthetic
- Consistent with public site but distinct
- Use Tailwind's card utilities (border, shadow, padding)
- Subtle animations on hover (scale, shadow increase)

**Component**: `EmptyDashboard.js` renders placeholder content

**References**:
- Empty State UI Patterns: https://www.nngroup.com/articles/empty-state-design/

---

## Technology Stack Summary

**No new external dependencies required!**

All functionality can be implemented with existing project stack:
- Next.js 15.5.6 (App Router, Middleware, Server Components)
- NextAuth 5.0 (Session management, callbacks)
- Mongoose 8.19.1 (User model extension)
- Tailwind CSS 4.1.14 (Admin layout styling)
- React 19.1.0 (Component architecture)

**Optional Addition** (recommended for production):
- Winston (logging library) - can be added later if needed
- Initially use console.log structured output for MVP

---

## Security Best Practices Applied

1. **Defense in Depth**: Multiple layers (middleware + server components)
2. **Secure by Default**: Users not admin unless explicitly granted
3. **Least Privilege**: Admin flag only, no broad permissions
4. **Audit Trail**: Logging unauthorized access attempts
5. **Session Security**: Signed tokens, forced logout on revocation
6. **Index Optimization**: Fast privilege queries prevent timing attacks
7. **OWASP Alignment**: Following OWASP authentication guidelines

---

## Performance Considerations

1. **Database Indexing**: User.isAdmin indexed for <100ms queries
2. **Server Components**: Reduce client JS bundle, faster page loads
3. **Middleware Efficiency**: Edge runtime, minimal latency
4. **Session Caching**: NextAuth session cached, not re-fetched every request
5. **Lazy Loading**: Admin components loaded only when needed

**Estimated Performance**:
- Privilege check: <50ms (indexed database query)
- Page load: <1.5s (Server Component, no heavy client JS)
- Layout switch: <200ms (component mount)

---

## Open Questions & Future Enhancements

**Resolved Questions** (via clarification session):
- ✅ Privilege revocation behavior
- ✅ Security logging details
- ✅ Empty dashboard content
- ✅ 404 handling
- ✅ Session expiration handling

**Future Enhancements** (out of scope for MVP):
- Role-based access control (RBAC) for granular permissions
- Admin user management UI (currently via script/database)
- Admin action audit logging (track what admins do, not just access)
- Mobile optimization (currently desktop-first)
- Admin dashboard widgets (analytics, charts, etc.)
- Multi-factor authentication for admin users
- IP whitelist for admin access
- Admin session duration separate from regular users

---

## Next Steps

**Phase 1: Design & Contracts**
1. Create detailed data model (User schema extension)
2. Define middleware contract (admin privilege checking)
3. Generate component contracts (AdminLayout, AdminSidebar, AdminHeader)
4. Update agent context with new files

**Phase 2: Implementation** (via /speckit.tasks)
1. Write tests (TDD approach)
2. Implement User model changes
3. Build middleware logic
4. Create admin layout components
5. Build admin routes
6. Add logging
7. E2E testing

---

## References & Resources

- Next.js App Router Documentation: https://nextjs.org/docs/app
- NextAuth.js Documentation: https://next-auth.js.org/
- Mongoose Documentation: https://mongoosejs.com/
- Tailwind CSS Dashboard Examples: https://tailwindui.com/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
