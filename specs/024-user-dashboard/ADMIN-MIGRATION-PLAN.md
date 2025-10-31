# Admin Route Migration Plan

**Objective**: Migrate admin section from `/dashboard` to `/admin` to free up `/dashboard` for the user dashboard feature (Feature 024).

**Timeline**: 30-45 minutes  
**Risk Level**: Low (straightforward route rename)  
**Breaking Changes**: Admin users must update bookmarks

---

## Overview

The current admin area uses `/dashboard` routes, which conflicts with Feature 024's user dashboard. This migration moves all admin functionality to `/admin` routes with no functional changes.

### Current Routes
- `/dashboard` → Admin home page
- `/dashboard/users` → User management
- `/dashboard/performance` → Performance monitoring

### Target Routes
- `/admin` → Admin home page
- `/admin/users` → User management
- `/admin/performance` → Performance monitoring

---

## Migration Checklist

### Phase 1: File Structure Changes (15 min)

- [ ] **1.1** Rename directory `src/app/dashboard/` → `src/app/admin/`
  ```powershell
  # From project root
  Move-Item -Path "src\app\dashboard" -Destination "src\app\admin"
  ```

- [ ] **1.2** Verify all files moved correctly:
  ```
  src/app/admin/
  ├── page.js                    # Admin home
  ├── layout.js                  # Admin layout
  ├── not-found.js               # Admin 404
  ├── users/
  │   ├── page.js                # User management page
  │   ├── UserManagementPage.js
  │   └── components/
  │       ├── AdminToggle.js
  │       ├── ConfirmDialog.js
  │       ├── DeleteUserButton.js
  │       ├── FilterBar.js
  │       ├── PaginationControls.js
  │       ├── UserRow.js
  │       └── UserTable.js
  └── performance/
      └── page.js                # Performance monitoring
  ```

### Phase 2: Update Internal References (10 min)

- [ ] **2.1** Update `src/app/admin/users/page.js` redirects:
  ```javascript
  // OLD (Line 44):
  redirect('/login?redirect=/dashboard/users');
  
  // NEW:
  redirect('/login?redirect=/admin/users');
  
  // OLD (Line 48):
  redirect('/dashboard'); // Regular users go to dashboard
  
  // NEW:
  redirect('/'); // Regular users go to homepage (will redirect to /dashboard after Feature 024)
  ```

- [ ] **2.2** Update metadata in layout/pages if any reference "dashboard":
  ```javascript
  // Check and update:
  // - src/app/admin/layout.js (title, description)
  // - src/app/admin/page.js (any comments or metadata)
  // - src/app/admin/users/page.js (metadata)
  // - src/app/admin/performance/page.js (metadata)
  ```

### Phase 3: Update Middleware (5 min)

- [ ] **3.1** Update `src/middleware.js` admin route protection:
  ```javascript
  // Find all references to '/dashboard' in middleware
  // Replace with '/admin' where applicable
  
  // Example pattern to find:
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Admin check logic
  }
  
  // Replace with:
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Admin check logic
  }
  ```

- [ ] **3.2** Update middleware matcher config:
  ```javascript
  // OLD:
  export const config = {
    matcher: ['/', '/dashboard/:path*', /* other routes */],
  };
  
  // NEW:
  export const config = {
    matcher: ['/', '/admin/:path*', /* other routes */],
  };
  ```

### Phase 4: Update Navigation Links (5 min)

- [ ] **4.1** Update admin navigation component (if exists):
  ```javascript
  // Find: src/components/admin/AdminLayout.js or similar
  // Update any hardcoded links from /dashboard to /admin
  
  // Example:
  // OLD: <Link href="/dashboard">Home</Link>
  // NEW: <Link href="/admin">Home</Link>
  
  // OLD: <Link href="/dashboard/users">Users</Link>
  // NEW: <Link href="/admin/users">Users</Link>
  ```

- [ ] **4.2** Search codebase for hardcoded dashboard links:
  ```powershell
  # Search for potential hardcoded links
  Select-String -Path "src\**\*.js" -Pattern '"/dashboard"' -CaseSensitive
  Select-String -Path "src\**\*.jsx" -Pattern '"/dashboard"' -CaseSensitive
  
  # Review and update any admin-related links
  ```

### Phase 5: Update Tests (5-10 min)

- [ ] **5.1** Rename test directory:
  ```powershell
  # If test directory exists
  Move-Item -Path "tests\unit\app\dashboard" -Destination "tests\unit\app\admin"
  ```

- [ ] **5.2** Update test file imports and references:
  ```javascript
  // Update any imports referencing dashboard components
  // Example in tests/unit/app/admin/not-found.test.js:
  
  // OLD:
  import AdminNotFound from '@/app/dashboard/not-found';
  
  // NEW:
  import AdminNotFound from '@/app/admin/not-found';
  ```

- [ ] **5.3** Update E2E tests (if any):
  ```javascript
  // Find tests that navigate to /dashboard
  // Update URLs to /admin
  
  // Example in tests/e2e/admin.spec.js:
  // OLD: await page.goto('http://localhost:3000/dashboard');
  // NEW: await page.goto('http://localhost:3000/admin');
  ```

- [ ] **5.4** Run test suite:
  ```powershell
  npm test -- --testPathPattern="admin"
  ```

### Phase 6: Documentation Updates (5 min)

- [ ] **6.1** Update documentation files:
  ```
  docs/
  ├── ADMIN-AREA.md                     # Update route references
  ├── ADMIN-USER-MANAGEMENT.md          # Update route references
  └── ADMIN-AREA-PHASE-8-COMPLETION.md  # Update route references
  ```

- [ ] **6.2** Update README.md (if it mentions admin routes):
  ```markdown
  # OLD:
  Admin area: http://localhost:3000/dashboard
  
  # NEW:
  Admin area: http://localhost:3000/admin
  ```

---

## Verification Steps

### After Migration

1. **Start development server**:
   ```powershell
   npm run dev
   ```

2. **Verify admin routes accessible**:
   - ✅ Navigate to `http://localhost:3000/admin` (should show admin home)
   - ✅ Navigate to `http://localhost:3000/admin/users` (should show user management)
   - ✅ Navigate to `http://localhost:3000/admin/performance` (should show performance monitoring)
   - ✅ Verify login redirect works for unauthenticated access

3. **Verify old routes return 404**:
   - ✅ Navigate to `http://localhost:3000/dashboard` (should 404)
   - ✅ Navigate to `http://localhost:3000/dashboard/users` (should 404)

4. **Test admin functionality**:
   - ✅ Login as admin user
   - ✅ Navigate to admin area via direct URL
   - ✅ Test user management CRUD operations
   - ✅ Verify performance monitoring page loads

5. **Run full test suite**:
   ```powershell
   npm test
   ```

6. **Run E2E tests** (if applicable):
   ```powershell
   npm run test:e2e
   ```

---

## Rollback Plan

If issues occur during migration:

1. **Immediate rollback**:
   ```powershell
   # Revert directory rename
   Move-Item -Path "src\app\admin" -Destination "src\app\dashboard"
   
   # Revert any committed changes
   git checkout src/middleware.js
   git checkout src/app/dashboard/
   
   # Restore tests
   git checkout tests/
   ```

2. **Partial rollback** (if some changes work):
   - Keep new `/admin` routes
   - Re-enable old `/dashboard` routes temporarily
   - Add redirect from `/dashboard` to `/admin` in middleware

---

## Database Changes

**None required.** This is purely a frontend route change. No data model changes, no migrations needed.

---

## Deployment Notes

### Development
- Complete migration on feature branch
- Test thoroughly before merging to main
- Update local bookmarks

### Staging
- Deploy migration to staging first
- Notify QA team to test admin area
- Update staging documentation

### Production
- Deploy during low-traffic window (optional)
- Communicate route change to admin users 24h in advance
- Provide new bookmark URLs
- Monitor error logs for 24h after deployment

### Communication Template

**Subject**: Admin Area URL Change - Action Required

**Message**:
```
Hi Admin Team,

The admin area URL is changing to improve the application structure:

OLD URL: https://yourdomain.com/dashboard
NEW URL: https://yourdomain.com/admin

Action Required:
- Update your bookmarks to https://yourdomain.com/admin
- Update any saved links or shortcuts

Change Date: [DEPLOYMENT DATE]

All functionality remains the same - only the URL is changing.

Please contact support if you have any issues.
```

---

## Post-Migration Actions

After successful migration:

1. **Update browser bookmarks** (admin users)
2. **Archive old documentation** mentioning `/dashboard` admin routes
3. **Update internal wikis/knowledge bases**
4. **Mark Feature 024 as ready to implement**

---

## Files Modified

**Summary of changes**:

```
MOVED:
  src/app/dashboard/              → src/app/admin/
  tests/unit/app/dashboard/       → tests/unit/app/admin/

MODIFIED:
  src/middleware.js                # Route matcher and admin checks
  src/app/admin/users/page.js      # Redirect URLs
  src/components/admin/*.js        # Navigation links (if any)
  tests/e2e/admin.spec.js          # E2E test URLs (if exists)
  docs/ADMIN-*.md                  # Documentation URLs

VERIFIED:
  All admin functionality works at new /admin routes
  Old /dashboard routes return 404
  Tests pass with new routes
  No broken internal links
```

---

## Success Criteria

Migration is complete when:

- ✅ All admin routes accessible at `/admin/*`
- ✅ Old `/dashboard/*` routes return 404
- ✅ All tests pass
- ✅ Admin users can access all functionality
- ✅ No broken links in navigation
- ✅ Documentation updated
- ✅ Admin users notified of URL change
- ✅ `/dashboard` route is free for Feature 024 implementation

**Estimated Total Time**: 30-45 minutes

**Next Step After Completion**: Begin Feature 024 implementation (User Dashboard at `/dashboard`)
