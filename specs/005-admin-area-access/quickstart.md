# Quickstart Guide: Admin Area Access

**Feature**: Admin Area Access  
**Date**: October 22, 2025  
**Audience**: Developers implementing this feature

## Overview

This guide provides a quick reference for implementing the admin area access feature in the fasting tracker application.

---

## 🚀 Quick Start (5 Steps)

### 1. Extend User Model (5 minutes)

**File**: `src/lib/models/User.js`

Add `isAdmin` field to schema:

```javascript
// Add after existing fields in userSchema
isAdmin: {
  type: Boolean,
  default: false,
  index: true,
},
```

**Verify**: Run unit tests to confirm schema change doesn't break existing functionality.

---

### 2. Create First Admin User (2 minutes)

**Create script**: `scripts/create-admin-user.js`

```javascript
import dbConnect from '../src/lib/db/mongodb.js';
import User from '../src/lib/models/User.js';

async function createAdmin(email) {
  await dbConnect();
  
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }
  
  user.isAdmin = true;
  await user.save();
  
  console.log(`✅ Admin access granted to ${email}`);
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/create-admin-user.js <email>');
  process.exit(1);
}

createAdmin(email);
```

**Run**: `node scripts/create-admin-user.js your-email@example.com`

---

### 3. Update NextAuth Session (10 minutes)

**File**: `src/lib/auth.js` (or wherever NextAuth config is)

Add `isAdmin` to session callback:

```javascript
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub;
      
      // Add admin flag to session
      const user = await User.findById(token.sub).select('isAdmin');
      session.user.isAdmin = user?.isAdmin || false;
    }
    return session;
  },
  // ... other callbacks
},
```

**Verify**: Login and check session in browser DevTools → Application → Cookies.

---

### 4. Add Middleware Protection (15 minutes)

**File**: `src/middleware.js`

Add admin route protection:

```javascript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/dashboard')) {
    const session = await auth();
    
    if (!session?.user) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

**Verify**: Try accessing `/dashboard` as non-admin user.

---

### 5. Create Admin Layout (20 minutes)

**File**: `src/app/dashboard/layout.js`

```javascript
import AdminLayout from '@/components/admin/AdminLayout';

export default function DashboardLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

**File**: `src/app/dashboard/page.js`

```javascript
import EmptyDashboard from '@/components/admin/EmptyDashboard';

export default function DashboardPage() {
  return <EmptyDashboard />;
}
```

**Verify**: Login as admin and navigate to `/dashboard`.

---

## 📁 File Structure

```
New Files (13 total):
├── src/app/dashboard/
│   ├── layout.js                    ✨ NEW
│   ├── page.js                      ✨ NEW
│   └── not-found.js                 ✨ NEW
├── src/app/access-denied/
│   └── page.js                      ✨ NEW
├── src/components/admin/
│   ├── AdminLayout.js               ✨ NEW
│   ├── AdminSidebar.js              ✨ NEW
│   ├── AdminHeader.js               ✨ NEW
│   └── EmptyDashboard.js            ✨ NEW
├── src/lib/middleware/
│   └── adminAuth.js                 ✨ NEW
├── src/lib/utils/
│   └── adminLogger.js               ✨ NEW
└── scripts/
    └── create-admin-user.js         ✨ NEW

Modified Files (2 total):
├── src/lib/models/User.js           📝 MODIFIED
└── src/middleware.js                📝 MODIFIED
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Login as admin → access `/dashboard` → see admin layout
- [ ] Login as regular user → access `/dashboard` → redirected to access denied
- [ ] No login → access `/dashboard` → redirected to login
- [ ] Admin user → access `/dashboard/nonexistent` → see custom 404
- [ ] Logout → session cleared

### Automated Testing

```bash
# Unit tests
npm test -- User.test.js                    # User model tests
npm test -- adminAuth.test.js               # Middleware tests

# Component tests
npm test -- AdminLayout.test.js             # Layout tests

# Integration tests
npm test -- admin-access.test.js            # Access control tests

# E2E tests
npm run test:e2e -- admin-area.spec.js      # Full user flows
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Session doesn't include `isAdmin`

**Symptom**: `session.user.isAdmin` is `undefined`

**Solution**:
1. Check NextAuth session callback includes `isAdmin`
2. Restart dev server (session callback changes require restart)
3. Clear browser cookies and login again
4. Verify User model has `isAdmin` field

### Issue 2: Middleware redirects admin users

**Symptom**: Admin users redirected even though `isAdmin = true` in database

**Solution**:
1. Check session in browser DevTools (should show `isAdmin: true`)
2. Verify middleware checks `session.user.isAdmin` (not `session.isAdmin`)
3. Test session callback in isolation
4. Clear session and login again

### Issue 3: Page loads without admin layout

**Symptom**: `/dashboard` page renders but without sidebar/header

**Solution**:
1. Verify `src/app/dashboard/layout.js` exists
2. Check `AdminLayout` component is imported correctly
3. Ensure layout.js exports default function
4. Check React error in browser console

### Issue 4: 404 page uses wrong layout

**Symptom**: `/dashboard/nonexistent` shows public 404, not admin 404

**Solution**:
1. Create `src/app/dashboard/not-found.js`
2. Ensure it uses `AdminLayout` component
3. Test by manually navigating to non-existent route
4. Check Next.js uses nearest `not-found.js` (not root)

---

## 📊 Performance Benchmarks

Expected performance after implementation:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Middleware execution | <50ms | Next.js logging |
| Page load (first visit) | <2s | Chrome DevTools Network tab |
| Page load (cached) | <500ms | Chrome DevTools Network tab |
| Database query (isAdmin check) | <50ms | Mongoose query logging |

---

## 🔐 Security Checklist

- [ ] Admin flag defaults to `false`
- [ ] No API endpoint allows setting `isAdmin` (user cannot self-promote)
- [ ] Middleware checks session on every request
- [ ] Session tokens are signed/encrypted (NextAuth default)
- [ ] Unauthorized access attempts logged
- [ ] HTTPS enforced in production (Vercel default)
- [ ] Session cookie has `httpOnly`, `secure`, `sameSite` flags

---

## 🚢 Deployment Checklist

### Before Deployment

- [ ] All tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Lint checks pass (`npm run lint`)
- [ ] At least one admin user created in production database
- [ ] Environment variables set (if any new ones)

### After Deployment

- [ ] Verify admin user can login and access `/dashboard`
- [ ] Verify non-admin user cannot access `/dashboard`
- [ ] Check error logging service (if configured)
- [ ] Monitor for 500 errors in middleware
- [ ] Test session expiration handling

---

## 📚 Key Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| Feature Spec | `specs/005-admin-area-access/spec.md` | Requirements |
| Research | `specs/005-admin-area-access/research.md` | Technical decisions |
| Data Model | `specs/005-admin-area-access/data-model.md` | Schema details |
| Middleware Contract | `specs/005-admin-area-access/contracts/middleware.md` | API contract |
| Next.js Middleware | https://nextjs.org/docs/app/building-your-application/routing/middleware | Official docs |
| NextAuth Callbacks | https://next-auth.js.org/configuration/callbacks | Session config |

---

## 🎯 Success Criteria

Feature is complete when:

- ✅ Admin users can access `/dashboard`
- ✅ Non-admin users are blocked from `/dashboard`
- ✅ Unauthenticated users redirected to login
- ✅ Admin area has distinct professional layout
- ✅ Custom 404 page works in admin area
- ✅ Session expiration handled gracefully
- ✅ All tests pass (unit, integration, E2E)
- ✅ Performance targets met (<2s page load, <50ms middleware)

---

## 🆘 Getting Help

**Stuck?** Check these in order:

1. **Error messages**: Read the full error in terminal/console
2. **Research doc**: Review technical decisions in `research.md`
3. **Contract**: Check expected behavior in `contracts/middleware.md`
4. **Tests**: Look at test cases for examples
5. **Logs**: Check browser DevTools console and Network tab
6. **Next.js docs**: Search official docs for specific APIs

**Common commands**:

```bash
# Start dev server with logging
npm run dev

# Run specific test file
npm test -- path/to/test.test.js

# Run tests in watch mode
npm run test:watch

# Check middleware logs
# Add console.log in middleware and check terminal output

# Verify database changes
# Use MongoDB Compass or mongo shell to query users collection
```

---

## 🎓 Learning Path

**New to this codebase?** Read in this order:

1. `spec.md` - Understand what we're building
2. `research.md` - Learn technical decisions
3. `data-model.md` - Understand database changes
4. `contracts/middleware.md` - Learn middleware behavior
5. This file (`quickstart.md`) - Start implementing

**Time estimate**: 2-3 hours for full implementation (excluding tests)

---

## ✅ Next Steps

After completing this feature:

1. **Commit changes**: `git commit -m "feat: implement admin area access"`
2. **Create PR**: Reference spec number `005-admin-area-access`
3. **Request review**: Tag team members
4. **Deploy to staging**: Test with real database
5. **Create first admin**: Run script on staging database
6. **Deploy to production**: After approval

**Ready for next feature?**
- Add admin functionality (user management, settings, etc.)
- Implement admin action audit logging
- Add admin analytics dashboard
