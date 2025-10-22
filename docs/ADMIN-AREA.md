# Admin Area User Guide

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Status**: Production Ready

## Overview

The Fasting Tracker admin area provides a secure, professional interface for system administrators to manage the application. This guide covers everything you need to know about accessing, using, and managing the admin area.

---

## Table of Contents

1. [Accessing the Admin Area](#accessing-the-admin-area)
2. [Admin Area Features](#admin-area-features)
3. [Managing Admin Privileges](#managing-admin-privileges)
4. [Navigation](#navigation)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)
7. [Technical Reference](#technical-reference)

---

## Accessing the Admin Area

### Prerequisites

- Valid user account on the Fasting Tracker platform
- Admin privileges granted by system administrator
- Active session (logged in)

### Access URL

```
https://your-domain.com/dashboard
```

### What Happens When You Access

1. **If you're not logged in**: Redirected to login page with callback URL preserved
2. **If you're logged in but not admin**: See 404 page (security through obscurity)
3. **If you're an admin**: Access granted, see admin dashboard

### First-Time Access

After admin privileges are granted:
1. Log out if currently logged in
2. Log back in to refresh your session
3. Navigate to `/dashboard` or click the "Admin Dashboard" badge in the navigation bar

---

## Admin Area Features

### Current Features

#### Dashboard Home

**URL**: `/dashboard`

The main admin dashboard displays:
- Welcome message
- Professional layout with sidebar navigation
- Placeholder cards for upcoming features:
  - User Management
  - System Settings  
  - Analytics
  - Reports
  - Security Logs
  - Content Management

#### Professional Layout

- **Fixed Sidebar**: Navigation menu on the left (64px wide)
- **Header Bar**: Page title and user info at the top
- **Main Content Area**: Centered content with proper spacing
- **Responsive Design**: Works on desktop, tablet, and mobile

#### Custom 404 Page

If you access a non-existent route within the admin area (e.g., `/dashboard/nonexistent`):
- See a custom 404 page styled with admin layout
- Helpful links back to dashboard and homepage
- Maintains admin context (doesn't show public 404)

---

## Managing Admin Privileges

### For System Administrators

Admin privileges are managed via command-line script. This requires direct access to the server and database.

### Granting Admin Access

```bash
# Grant admin privileges to a user
node scripts/create-admin-user.js user@example.com
```

**Output**:
```
Connecting to MongoDB...
✓ MongoDB connected successfully
✓ User found: user@example.com
✓ Admin access granted to user@example.com
  User ID: 67123abc456def789
  Name: John Doe
  Auth Method: email
  Updated: 2025-10-22T10:30:45.123Z
```

### Revoking Admin Access

```bash
# Revoke admin privileges from a user  
node scripts/create-admin-user.js user@example.com --revoke
```

**Output**:
```
Connecting to MongoDB...
✓ MongoDB connected successfully
✓ User found: user@example.com
✓ Admin access revoked from user@example.com
  User ID: 67123abc456def789
  Name: John Doe
  Auth Method: email
  Updated: 2025-10-22T10:35:22.456Z
```

### Listing All Admins

```bash
# View all users with admin privileges
node scripts/create-admin-user.js --list
```

**Output**:
```
Connecting to MongoDB...
✓ MongoDB connected successfully

Admin Users (2):

1. admin@example.com
   ID: 67123abc456def789
   Name: Jane Smith
   Auth Method: email
   Created: 2025-01-15T08:00:00.000Z

2. superadmin@example.com
   ID: 67123abc456def790
   Name: John Doe
   Auth Method: google
   Created: 2025-03-22T14:30:00.000Z
```

### Important Notes

- **Immediate Effect**: Privilege changes take effect on the user's next request
- **Session Invalidation**: Users must log out and back in if already logged in
- **Idempotency**: Safe to run commands multiple times (won't cause errors)
- **Audit Trail**: All privilege changes should be logged externally (not automated yet)

---

## Navigation

### Navigating to Admin Area

#### From Public Site (As Admin)

Look for the purple "ADMIN" badge in the navigation bar:

```
┌─────────────────────────────────────┐
│  [ADMIN] Dashboard                  │  ← Click this
└─────────────────────────────────────┘
```

**Location**:
- **Desktop**: Top navigation bar, next to login/logout
- **Mobile**: Hamburger menu, below main navigation items

#### Direct URL

Simply navigate to: `/dashboard`

### Navigating to Public Site

#### From Admin Area

Click "View Public Site" link in the admin header:

```
┌─────────────────────────────────────┐
│  Dashboard    [← View Public Site]  │  ← Click this
└─────────────────────────────────────┘
```

**Location**: Top-right corner of admin header

#### Direct URL

Navigate to: `/` (homepage)

### Session Persistence

Your session persists when navigating between admin and public areas:
- ✅ No need to log in again
- ✅ Admin privileges maintained
- ✅ Context switches seamlessly
- ✅ Bookmarks work as expected

---

## Security

### Security Features

#### Access Control

- **Middleware Protection**: Every admin route checked on every request
- **Session Validation**: JWT-based authentication via NextAuth
- **Privilege Verification**: `isAdmin` flag checked from session
- **404 Obscurity**: Non-admin users see 404 (not "access denied")

#### Security Logging

All unauthorized access attempts are logged to MongoDB with:
- Timestamp (ISO 8601 format)
- User ID (if authenticated, else "unauthenticated")
- Email address (if authenticated, else "none")  
- Attempted URL path
- IP address
- User agent (browser/device info)
- Reason for denial ("unauthenticated" or "insufficient_privileges")

**Log Collection**: `SecurityLog` in MongoDB

**Example Log Entry**:
```json
{
  "_id": "67123abc456def789",
  "type": "access_denied",
  "userId": "66789def123abc456",
  "email": "user@example.com",
  "url": "/dashboard",
  "reason": "insufficient_privileges",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-10-22T10:45:30.123Z"
}
```

#### Session Security

- **HttpOnly Cookies**: Session cookies not accessible via JavaScript
- **Secure Flag**: Cookies only sent over HTTPS in production
- **SameSite Policy**: CSRF protection enabled
- **Signed Tokens**: JWTs cryptographically signed by NextAuth
- **Expiration Handling**: Expired sessions redirect to login with preserved URL

### Best Practices

#### For System Administrators

1. **Principle of Least Privilege**: Only grant admin to users who need it
2. **Regular Audits**: Periodically review admin list with `--list` command
3. **Immediate Revocation**: Revoke access immediately when no longer needed
4. **Monitor Logs**: Check SecurityLog collection for suspicious activity
5. **Secure Script Access**: Restrict who can run privilege management scripts

#### For Admin Users

1. **Log Out**: Always log out when done, especially on shared computers
2. **Strong Passwords**: Use strong, unique passwords for admin accounts
3. **Verify URL**: Check you're on correct domain before logging in
4. **Report Suspicious Activity**: Notify administrators of anything unusual
5. **Keep Sessions Short**: Don't leave admin area open unattended

### Security Through Obscurity

Non-admin users attempting to access `/dashboard` see a **404 page** instead of an "access denied" message. This prevents:
- Information disclosure about admin area existence
- Reconnaissance by potential attackers  
- Social engineering attacks
- Brute force targeting of admin routes

---

## Troubleshooting

### Problem: Can't Access Admin Area

**Symptom**: Redirected to 404 when accessing `/dashboard`

**Solutions**:
1. **Verify admin status**: Ask system administrator to check with `--list` command
2. **Refresh session**: Log out completely, then log back in
3. **Clear cookies**: Clear browser cookies and cache, then log in again
4. **Check URL**: Ensure you're using correct domain (not localhost in production)

### Problem: Admin Link Not Visible

**Symptom**: Can't see "ADMIN" badge in navigation bar

**Solutions**:
1. **Check login status**: Ensure you're logged in
2. **Verify privileges**: Confirm admin status with system administrator
3. **Hard refresh**: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Clear cache**: Clear browser cache and reload page

### Problem: Session Expired

**Symptom**: Redirected to login while using admin area

**Solutions**:
1. **Normal behavior**: Sessions expire after period of inactivity
2. **Log back in**: Your return URL is preserved, you'll go back to where you were
3. **Extend sessions**: Contact system administrator about session timeout settings

### Problem: Privilege Changes Not Taking Effect

**Symptom**: Granted admin but still can't access

**Solutions**:
1. **Log out first**: Must log out completely before privileges take effect
2. **Check MongoDB**: Verify `isAdmin: true` in users collection
3. **Restart server**: In development, restart dev server to refresh NextAuth callbacks
4. **Verify script output**: Check command output for success confirmation

---

## Technical Reference

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  User Request: /dashboard                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Middleware (Edge Runtime)                      │
│  - Check if logged in                           │
│  - Validate admin privileges                    │
│  - Log unauthorized attempts                    │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    ❌ Denied       ✅ Allowed
         │               │
         ▼               ▼
┌──────────────┐  ┌──────────────┐
│   404 Page   │  │  Dashboard   │
└──────────────┘  └──────────────┘
```

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| Admin Dashboard | `src/app/dashboard/page.js` | Main admin page |
| Admin Layout | `src/components/admin/AdminLayout.js` | Sidebar + header wrapper |
| Admin Sidebar | `src/components/admin/AdminSidebar.js` | Navigation menu |
| Admin Header | `src/components/admin/AdminHeader.js` | Page title + public site link |
| Middleware Auth | `src/lib/middleware/adminAuth.js` | Access control logic |
| Security Logger | `src/lib/utils/securityLogger.js` | Edge Runtime compatible logging |
| Log API | `src/app/api/admin/log-security/route.js` | MongoDB persistence |
| Admin Script | `scripts/create-admin-user.js` | Privilege management CLI |

### Database Schema

#### User Model Extension

```javascript
{
  // ... existing user fields
  isAdmin: {
    type: Boolean,
    default: false,
    index: true  // Indexed for fast lookups
  }
}
```

#### Security Log Model

```javascript
{
  type: { type: String, required: true },        // 'access_denied'
  userId: { type: String, required: true },      // User ID or 'unauthenticated'
  email: { type: String, required: true },       // Email or 'none'
  url: { type: String, required: true },         // Attempted path
  reason: { type: String, required: true },      // Denial reason
  ip: { type: String },                          // IP address
  userAgent: { type: String },                   // Browser info
  timestamp: { type: Date, default: Date.now }   // When it happened
}
```

### API Routes

| Route | Method | Runtime | Purpose |
|-------|--------|---------|---------|
| `/api/admin/log-security` | POST | Node.js | Persist security logs to MongoDB |

**Request Body**:
```json
{
  "type": "access_denied",
  "userId": "user-id-or-unauthenticated",
  "email": "user@example.com",
  "url": "/dashboard/path",
  "reason": "insufficient_privileges",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

**Response**:
```json
{
  "success": true
}
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `NEXTAUTH_URL` | Yes (prod) | Base URL for NextAuth |

---

## Future Enhancements

### Planned Features

1. **User Management Dashboard**: View, edit, and manage all users
2. **Analytics Dashboard**: User statistics, activity trends, engagement metrics
3. **Security Logs Viewer**: Browse and filter security logs in admin UI
4. **System Settings**: Configure app-wide settings and preferences
5. **Content Management**: Manage FAQ, Terms, Privacy Policy content
6. **Audit Trail**: Detailed logging of all admin actions
7. **Role-Based Access**: Multiple admin roles with different permissions
8. **Two-Factor Authentication**: Enhanced security for admin accounts

### Requesting Features

To request new admin features:
1. Document the use case and benefit
2. Submit feature request to development team
3. Include any security considerations
4. Specify priority and timeline if urgent

---

## Support

### Getting Help

1. **Check this guide**: Search for your issue in troubleshooting section
2. **Review security logs**: Check MongoDB SecurityLog collection for clues
3. **Test with non-admin account**: Verify expected behavior difference
4. **Contact system administrator**: For privilege-related issues
5. **Reach out to development team**: For technical issues or bugs

### Useful Commands

```bash
# Check admin status for user
node scripts/create-admin-user.js --list | grep "email@example.com"

# Verify MongoDB connection
mongo "your-connection-string" --eval "db.users.findOne({isAdmin: true})"

# Check security logs
mongo "your-connection-string" --eval "db.securitylogs.find().limit(10).pretty()"

# Restart development server (if needed)
npm run dev
```

---

## Changelog

### Version 1.0 (October 22, 2025)

- ✅ Initial admin area implementation
- ✅ Access control with middleware protection
- ✅ Professional layout (sidebar + header)
- ✅ Security logging to MongoDB
- ✅ Admin privilege management script
- ✅ Navigation between admin and public areas
- ✅ Custom 404 page within admin area
- ✅ Session expiration handling
- ✅ Edge Runtime compatibility (API-based logging)
- ✅ 75 automated tests covering all functionality
- ✅ Comprehensive documentation

---

## License & Credits

**Built for**: Fasting Tracker Application  
**Implementation Date**: October 2025  
**Test Coverage**: 75 tests passing (11 test suites)  
**Status**: Production Ready ✅

For technical implementation details, see:
- `specs/005-admin-area-access/spec.md` - Full feature specification
- `specs/005-admin-area-access/quickstart.md` - Developer quick start guide
- `scripts/README.md` - Admin script documentation
