# Phase 6 Polish - QA Checklist & Testing Guide

**Feature**: Entry Details Page (User Stories 1 & 3)  
**Branch**: `011-entry-details-page`  
**Date**: October 25, 2025

---

## 📊 Progress Overview

| Task | Status | Priority | Notes |
|------|--------|----------|-------|
| T062: Test Suite | ✅ Complete | High | 58+ suites pass, regression tests added |
| T063: Accessibility | ✅ Complete | High | WCAG 2.1 AA compliant, audit doc created |
| T064: Mobile Testing | ⏳ Pending | High | Test on real devices |
| T065: PWA Offline | ⏳ Pending | Medium | Verify offline caching |
| T066: Performance | ⏳ Pending | High | Core Web Vitals check |
| T067: Edge Cases | ⏳ Pending | Medium | Manual testing scenarios |
| T068: Security | ⏳ Pending | High | Auth & CSRF checks |
| T069: Error Monitoring | ⏳ Pending | Medium | Add logging |
| T070: Documentation | ⏳ Pending | Low | Update README |
| T071: Manual QA | ⏳ Pending | High | All acceptance scenarios |
| T072: Staging Deploy | ⏳ Pending | High | Pre-production test |
| T073: Merge to Main | ⏳ Pending | High | Final release |

---

## T064: Mobile Responsiveness Testing 📱

### Device Matrix

| Device | Screen Size | Browser | Tester | Status |
|--------|-------------|---------|--------|--------|
| iPhone 13 | 390x844 | Safari | | ⏳ |
| iPhone SE | 375x667 | Safari | | ⏳ |
| Samsung Galaxy S21 | 360x800 | Chrome | | ⏳ |
| iPad Air | 820x1180 | Safari | | ⏳ |
| Desktop | 1920x1080 | Chrome | | ⏳ |
| Desktop | 1366x768 | Edge | | ⏳ |

### Test Scenarios

#### Portrait Mode (320px - 600px)
- [ ] Timeline SVG renders without distortion
- [ ] All text is readable (minimum 16px)
- [ ] No horizontal scroll
- [ ] Buttons stack vertically
- [ ] Touch targets >= 44x44px
- [ ] Spacing prevents mis-taps (gaps >= 8px)
- [ ] Food notes don't overflow container
- [ ] Long entry dates wrap properly
- [ ] Delete modal fits on screen

#### Tablet Mode (600px - 1024px)
- [ ] Layout transitions smoothly
- [ ] Grid columns adjust (2-column where appropriate)
- [ ] Action buttons remain horizontal or stack
- [ ] Timeline size appropriate for screen
- [ ] Metadata displays in readable columns

#### Desktop Mode (>1024px)
- [ ] Max-width container prevents too-wide content
- [ ] Proper use of white space
- [ ] All elements aligned correctly
- [ ] Timeline centered and appropriately sized

### Zoom Testing
- [ ] Page usable at 200% zoom
- [ ] No text cutoff at 150% zoom
- [ ] Buttons remain accessible when zoomed
- [ ] No horizontal scroll at 200% zoom

---

## T065: PWA Offline Functionality Testing 🔌

### Setup
1. Open Chrome DevTools
2. Go to Application tab
3. Check "Service Workers" section
4. Verify service worker is registered

### Test Scenarios

#### Initial Cache
```bash
# 1. Visit entry details page while online
Navigate to: /entries/[any-entry-id]

# 2. Check Network tab
- Verify NetworkFirst strategy
- Check cache storage contains assets
```

- [ ] Service worker registers successfully
- [ ] Entry details page cached
- [ ] Static assets (CSS, JS) cached
- [ ] API responses cached (if configured)

#### Offline Behavior
```bash
# 1. Open DevTools > Network tab
# 2. Check "Offline" checkbox
# 3. Refresh page
```

- [ ] Previously visited entry loads from cache
- [ ] Static content displays correctly
- [ ] No broken images/styles
- [ ] Error message shows for new fetches
- [ ] "You are offline" indicator appears (if implemented)

#### Cache Duration
- [ ] Entry cached for 90 days (check cache headers)
- [ ] Stale-while-revalidate works
- [ ] Old entries eventually expire

---

## T066: Performance Optimization ⚡

### Core Web Vitals Targets
| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Real user testing |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| Total Page Load | < 2s | DevTools Network |

### Lighthouse Performance Audit

```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools (F12)
2. Lighthouse tab
3. Select "Performance" only
4. Device: Mobile
5. Click "Analyze page load"
```

**Expected Scores**:
- Performance: 90-100 (Target: 90+)
- First Contentful Paint: < 1.8s
- Speed Index: < 3.4s
- Time to Interactive: < 3.8s

### Performance Checklist

#### Image Optimization
- [ ] No images on entry details page (N/A)
- [ ] SVG timeline optimized (inline, minimal paths)

#### JavaScript Bundle
- [ ] Code splitting working (check Network tab)
- [ ] Only necessary JS loaded for route
- [ ] No unused dependencies in bundle
- [ ] React components lazy-loaded where appropriate

#### CSS Optimization
- [ ] Tailwind purged unused classes
- [ ] Critical CSS inlined (Next.js handles)
- [ ] No render-blocking CSS

#### Network Requests
- [ ] Minimal API calls (1-2 for entry details)
- [ ] No redundant fetches
- [ ] Proper caching headers
- [ ] Compression enabled (gzip/brotli)

#### Database Queries
- [ ] Single entry fetch optimized
- [ ] User settings fetched in parallel
- [ ] No N+1 query problems
- [ ] Indexes on queried fields

### Performance Testing Script

```javascript
// Run in browser console on entry details page
console.time('Page Load');
performance.getEntriesByType('navigation')[0].toJSON();
console.timeEnd('Page Load');

// Check metrics
const perfData = performance.getEntriesByType('navigation')[0];
console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
console.log('Load Complete:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
console.log('Total Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
```

Expected:
- DOM Content Loaded: < 500ms
- Load Complete: < 2000ms

---

## T067: Edge Cases Manual Testing 🔍

### Test Data Setup

Create test entries with these characteristics:

#### Entry 1: Extended Fast (>24h)
```
Date: 2025-10-20
First Meal: 18:00
Last Meal: 20:00
Next Entry Date: 2025-10-22
Next Entry First Meal: 12:00
Duration: ~42 hours
```

**Expected**:
- [ ] Duration displays correctly ("42h 0m" or similar)
- [ ] Timeline shows extended fast badge
- [ ] "Extended fast created" badge visible
- [ ] Timeline visual handles >24h gracefully

#### Entry 2: Null Duration
```
Date: 2025-10-21
First Meal: null
Last Meal: null
Duration: null
```

**Expected**:
- [ ] Page doesn't crash
- [ ] "Not logged" displayed for duration
- [ ] Timeline shows empty/minimal visualization
- [ ] No JavaScript errors in console
- [ ] Copy to Today works (creates entry with null times)

#### Entry 3: Very Long Food Notes
```
Food Notes: 2000 characters (copy-paste lorem ipsum)
```

**Expected**:
- [ ] Notes display without breaking layout
- [ ] Container scrolls if needed
- [ ] No horizontal overflow
- [ ] Text remains readable
- [ ] Copy function preserves full notes

#### Entry 4: Midnight Crossing
```
Date: 2025-10-22
First Meal: 22:00
Last Meal: 02:00 (next day)
Duration: 4h 0m
```

**Expected**:
- [ ] Duration calculates correctly
- [ ] Timeline visualization crosses midnight properly
- [ ] Visual arc spans from 22:00 to 02:00
- [ ] No confusion about which day

#### Entry 5: Minimal Entry
```
Date: 2025-10-23
First Meal: 12:00
Last Meal: 16:00
All optional fields: null
```

**Expected**:
- [ ] Page renders completely
- [ ] "Not logged" for missing metrics
- [ ] No errors for null values
- [ ] Edit and Delete work correctly

#### Entry 6: Maximum Data
```
Date: 2025-10-24
All fields filled:
- Meal times
- Weight
- Energy level: High
- Well-being: Good
- Sleep: 8
- Water: 10
- Exercise: 60
- Mood: Happy
- Food notes: 500 chars
```

**Expected**:
- [ ] All data displays correctly
- [ ] Proper formatting for each metric
- [ ] No visual crowding
- [ ] Icons and labels aligned
- [ ] Copy creates entry with all meal times only

---

## T068: Security Review 🔒

### Authorization Tests

#### Test 1: Authenticated User Views Own Entry
```bash
1. Login as user A
2. Navigate to user A's entry
Expected: ✅ Entry displays
```

- [ ] User can view own entries
- [ ] All data visible
- [ ] Actions available

#### Test 2: Unauthenticated User
```bash
1. Logout
2. Try to navigate to /entries/[id]
Expected: ❌ Redirect to /login
```

- [ ] Redirected to login
- [ ] No entry data leaked
- [ ] Session expired message (if applicable)

#### Test 3: Authenticated User Views Other's Entry
```bash
1. Login as user A
2. Try to access user B's entry URL
Expected: ❌ 403 Forbidden or redirect
```

- [ ] Access denied
- [ ] Error message shown
- [ ] No data leaked in response

### CSRF Protection

#### Delete Action
```bash
1. Open entry details
2. Open browser DevTools > Network
3. Click Delete
4. Inspect DELETE request
```

- [ ] CSRF token present in request (if using)
- [ ] SameSite cookie attribute set
- [ ] Origin headers checked
- [ ] Referer validation working

#### Copy to Today Action
```bash
1. Click Copy to Today
2. Inspect POST request to /api/entries
```

- [ ] CSRF protection active
- [ ] Request includes proper auth headers
- [ ] No way to forge request from external site

### API Security

#### Direct API Access
```bash
# Try accessing API without proper auth
curl http://localhost:3000/api/entries/[id]
```

- [ ] Returns 401 Unauthorized
- [ ] No data exposed
- [ ] Proper WWW-Authenticate header

#### SQL Injection (MongoDB)
```bash
# Try malicious entry ID
/entries/[$ne]=1
/entries/{"$gt":""}
```

- [ ] Request properly sanitized
- [ ] Invalid ID returns 404
- [ ] No database error leaked

### Input Validation

- [ ] Entry ID must be valid ObjectId format
- [ ] Special characters handled safely
- [ ] No XSS vulnerabilities in displayed data
- [ ] Food notes sanitized if HTML present

---

## T069: Error Monitoring Checklist 📊

### Error Logging Setup

#### Application Errors
- [ ] Unhandled exceptions logged
- [ ] API errors include request context
- [ ] Error stack traces captured
- [ ] User ID included in logs (if authenticated)

#### API Error Scenarios

```javascript
// Test these error conditions:

1. Entry Not Found (404)
- Navigate to /entries/000000000000000000000000
- Expected: Friendly 404 page, error logged

2. Unauthorized Access (403)
- Try to access another user's entry
- Expected: Access denied message, attempt logged

3. Server Error (500)
- Simulate database connection failure
- Expected: Generic error message, detailed log server-side

4. Network Error
- Go offline, try to delete entry
- Expected: "Check your connection" message
```

### Error Messages - User Friendly

- [ ] No technical jargon in user-facing messages
- [ ] Actionable guidance ("Try again" or "Contact support")
- [ ] No stack traces visible to users
- [ ] Consistent error message styling

### Error Boundaries

```javascript
// Check if React Error Boundaries catch render errors
1. Simulate component error (bad prop)
2. Verify fallback UI displays
3. Error logged to monitoring service
```

- [ ] Error boundary catches component errors
- [ ] Fallback UI is user-friendly
- [ ] Page doesn't completely crash
- [ ] User can navigate away

---

## T070: Documentation Updates 📚

### README.md Updates

Add section:
```markdown
### Entry Details Page

View comprehensive information about any fasting entry:

**Features**:
- 24-hour visual timeline
- Meal times and fasting duration
- Health metrics (weight, energy, mood, etc.)
- Quick actions (Edit, Delete, Copy to Today)
- Responsive design (mobile-friendly)

**Access**: Click any entry from the Entries list, or navigate to `/entries/[entry-id]`

**Keyboard Navigation**: Fully accessible via keyboard (Tab, Enter, Escape)
```

### API Documentation

Document endpoints (if creating new docs):
```markdown
## DELETE /api/entries/[id]

Delete a fasting entry.

**Query Parameters**:
- `checkOnly` (boolean, optional): Preview deletion impact without actually deleting

**Response** (checkOnly=true):
```json
{
  "extendedFastCreated": boolean,
  "extendedFastInfo": {
    "duration": "42h 0m",
    "startTime": "2025-10-20T18:00:00.000Z",
    "endTime": "2025-10-22T12:00:00.000Z"
  }
}
```
```

### Checklist
- [ ] README updated with Entry Details section
- [ ] API docs updated (if applicable)
- [ ] User guide mentions new features (if exists)
- [ ] CHANGELOG.md entry added
- [ ] Screenshots added to docs (optional)

---

## T071: Manual QA - Acceptance Scenarios ✅

### User Story 1: View Entry Details (10 scenarios)

#### AC-US1-01: Display Basic Entry Information
```
Given: User is authenticated
When: User clicks an entry from the list
Then: Entry details page displays with date, meal times, and duration
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-02: Show 24-Hour Visual Timeline
```
Given: Entry has firstMealTime and lastMealTime
When: Entry details page loads
Then: Circular 24-hour timeline displays with shaded fasting period
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-03: Display Health Metrics
```
Given: Entry has health metrics (weight, energy, mood, etc.)
When: Entry details page loads
Then: All metrics display in organized sections with icons
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-04: Handle Missing Optional Fields
```
Given: Entry has null/undefined optional fields
When: Entry details page loads
Then: Missing fields show "Not logged" instead of crashing
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-05: Show Metadata
```
Given: Entry exists in database
When: Entry details page loads
Then: Created and updated timestamps display at bottom
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-06: Mobile Responsive Layout
```
Given: User views page on mobile device
When: Screen width < 600px
Then: Sections stack vertically, no horizontal scroll, buttons full-width
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-07: Back Navigation
```
Given: User is on entry details page
When: User clicks "Back to Entries" link
Then: Navigates to entries list page
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-08: Handle 404 Not Found
```
Given: Entry ID doesn't exist
When: User navigates to /entries/[invalid-id]
Then: 404 page displays with helpful message
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-09: Handle Unauthorized Access
```
Given: User tries to view another user's entry
When: Navigating to /entries/[other-user-entry-id]
Then: Access denied, redirected or error shown
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US1-10: Keyboard Accessible
```
Given: User uses only keyboard
When: Tab, Enter, Escape keys pressed
Then: All interactive elements reachable and usable
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

### User Story 3: Quick Actions (8 scenarios)

#### AC-US3-01: Edit Entry
```
Given: User is on entry details page
When: User clicks "Edit" button
Then: Navigates to /entries/[id]/edit
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-02: Delete with Confirmation
```
Given: User clicks "Delete" button
When: Delete modal appears
Then: User must confirm before entry is deleted
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-03: Delete Shows Streak Impact
```
Given: Deleting entry would break streak
When: User clicks Delete
Then: Modal shows warning about extended fast being removed
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-04: Delete Success Redirects
```
Given: User confirms deletion
When: Delete succeeds
Then: Redirects to /entries with success message
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-05: Copy to Today
```
Given: User is viewing past entry
When: User clicks "Copy to Today"
Then: New entry created for today with same meal times
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-06: Copy Validates Today Entry Exists
```
Given: Today's entry already exists
When: User clicks "Copy to Today"
Then: Error message: "You already have an entry for today"
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-07: Copy Button Disabled for Today
```
Given: User is viewing today's entry
When: Page loads
Then: "Copy to Today" button is disabled with tooltip
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

#### AC-US3-08: Action Errors Show Inline
```
Given: API error occurs during action
When: Error response received
Then: Error message displays above buttons, no page crash
```
- [ ] ✅ Pass | ❌ Fail | Date tested: _______

---

## T072: Vercel Deployment Checklist 🚀

### Pre-Deployment

- [ ] All tests passing locally: `npm test`
- [ ] Branch up to date with main
- [ ] Committed all changes
- [ ] No console errors in dev mode

### Deployment Steps

```bash
# 1. Ensure everything is committed
git status

# 2. Merge to main (Vercel auto-deploys on push to main)
git checkout main
git merge 011-entry-details-page

# 3. Push to trigger deployment
git push origin main

# 4. Watch Vercel dashboard
# https://vercel.com/your-project/deployments
# Wait for build to complete (~2 minutes)
```

### Post-Deployment Smoke Tests

**Once Vercel shows "Ready":**

#### Test 1: Page Loads
```
URL: https://your-domain.vercel.app/entries/[test-entry-id]
Expected: Page loads without errors
```
- [ ] Page loads successfully
- [ ] No console errors  
- [ ] Styles applied correctly

#### Test 2: Authentication Works
```
1. Try to access entry details (logged out)
Expected: Redirected to login
```
- [ ] Auth protection working
- [ ] Login redirects back

#### Test 3: Actions Work
```
1. Edit entry
2. Delete entry  
3. Copy to Today
Expected: All work on production
```
- [ ] Edit works
- [ ] Delete works
- [ ] Copy works

### Rollback Plan

If issues found:
```bash
# Revert the merge
git revert HEAD
git push origin main

# Vercel will auto-deploy the revert
```

---

## T073: Merge to Main Checklist ✅

### Pre-Merge Checklist

- [ ] All Phase 6 tasks completed
- [ ] All tests passing
- [ ] Staging deployment successful
- [ ] No known critical bugs
- [ ] Documentation updated
- [ ] Code reviewed (if team workflow)

### Merge Steps

```bash
# 1. Update local main
git checkout main
git pull origin main

# 2. Merge feature branch
git merge 011-entry-details-page

# 3. Resolve conflicts (if any)
# Test again after merge

# 4. Push to main
git push origin main

# 5. Tag release
git tag -a v1.1.0 -m "Add Entry Details Page"
git push origin v1.1.0
```

### Post-Merge

- [ ] Production deployment successful
- [ ] Smoke tests on production
- [ ] Monitoring dashboards checked
- [ ] No spike in error rates
- [ ] Release notes published
- [ ] Feature announced to users (if applicable)

### Release Notes Template

```markdown
# Release v1.1.0 - Entry Details Page

## New Features
✨ **Entry Details Page**: Click any entry to view comprehensive information
- 24-hour visual timeline showing fasting and eating periods
- All health metrics displayed with icons
- Quick actions: Edit, Delete, Copy to Today
- Mobile-responsive design
- Fully keyboard accessible (WCAG 2.1 AA compliant)

## Improvements
🐛 **Bug Fixes**:
- Fixed delete confirmation not showing streak impact
- Fixed timezone issues with Copy to Today
- Fixed error message layout breaking buttons
- Fixed validation errors for optional fields

## Technical
- Added 8 regression tests
- 31 unit tests for EntryActions component
- Accessibility audit completed
- Performance optimized (page load < 2s)

## Breaking Changes
None

## Migration Guide
No migration needed - all changes backward compatible
```

---

## 📝 Notes & Observations

Use this space to document any issues, observations, or improvements found during testing:

### Issues Found
1. 
2. 
3. 

### Observations
1. 
2. 
3. 

### Suggested Improvements
1. 
2. 
3. 

---

**QA Completed By**: _________________________  
**Date**: _________________________  
**Status**: ⏳ In Progress | ✅ Complete | ❌ Blocked
