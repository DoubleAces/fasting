# Tasks: PWA Conversion Implementation

**Feature**: 010-pwa-conversion  
**Branch**: 010-pwa-conversion  
**Date**: October 24, 2025  
**Status**: Ready for implementation

## Overview

This document breaks down the PWA conversion implementation into atomic, testable tasks following Test-Driven Development (TDD) principles. Each task includes clear acceptance criteria, test requirements, dependencies, and complexity estimates.

**Total Phases**: 8 (Phase 2.0 - 2.7)  
**Total Estimated Tasks**: 65-75 atomic tasks

---

## Task Structure

Each task follows this structure:

```markdown
### Task 2.X.Y: [Task Name]

**Description**: Clear description of what needs to be implemented

**Dependencies**: 
- List of task IDs this depends on
- Or "None" if no dependencies

**Complexity**: Low/Medium/High
- Justification for complexity rating

**Test Requirements** (TDD - Write tests FIRST):
- Unit tests: Specific test cases to write
- Integration tests: If applicable
- E2E tests: If applicable

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Implementation Notes**:
- Key technical considerations
- Links to contracts/data-model sections
- Code patterns to follow

**Files to Modify/Create**:
- List of specific file paths
```

---

## Phase 2.0: PWA Foundation Setup

**Priority**: Critical (Must complete before all other phases)  
**Estimated Tasks**: 7  
**Estimated Duration**: 1-2 days

### Task 2.0.1: Install PWA Dependencies

**Description**: Install required npm packages for PWA functionality

**Dependencies**: None

**Complexity**: Low
- Standard npm install, no custom configuration yet

**Test Requirements** (TDD):
- Unit tests: Verify packages exist in package.json with correct versions
- Integration tests: N/A

**Acceptance Criteria**:
- [X] `next-pwa` ^5.6.0 installed
- [X] `idb` ^8.0.0 installed
- [X] `web-push` ^3.6.0 installed
- [X] `sharp` ^0.33.0 installed as devDependency
- [X] All packages appear in package.json
- [X] `npm install` completes without errors

**Implementation Notes**:
- Use exact versions from research.md
- `sharp` is for icon generation (dev only)
- Run `npm install next-pwa@rc idb web-push` and `npm install -D sharp`

**Files to Modify/Create**:
- `package.json` (dependencies section)

---

### Task 2.0.2: Generate VAPID Keys

**Description**: Generate VAPID key pair for Web Push Protocol authentication

**Dependencies**: 
- Task 2.0.1 (web-push package required)

**Complexity**: Low
- Single command execution, key storage in .env

**Test Requirements** (TDD):
- Unit tests: Verify .env.local has VAPID keys in correct format
- Integration tests: N/A

**Acceptance Criteria**:
- [X] VAPID key pair generated using `npx web-push generate-vapid-keys`
- [X] `VAPID_PUBLIC_KEY` added to `.env.local`
- [X] `VAPID_PRIVATE_KEY` added to `.env.local`
- [X] `VAPID_EMAIL` added to `.env.local` (admin email)
- [X] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` added (client-side accessible)
- [X] Keys are base64-encoded strings
- [X] `.env.example` updated with placeholder entries

**Implementation Notes**:
- Run: `npx web-push generate-vapid-keys`
- Public key must be prefixed with `NEXT_PUBLIC_` for client access
- Email format: `mailto:admin@yourdomain.com`
- Never commit actual keys to Git

**Files to Modify/Create**:
- `.env.local` (create if doesn't exist)
- `.env.example` (add VAPID placeholders)

---

### Task 2.0.3: Create PWA Icons

**Description**: Generate PWA icons in required sizes from source image

**Dependencies**: 
- Task 2.0.1 (sharp package required)

**Complexity**: Low
- Script to generate multiple icon sizes from source

**Test Requirements** (TDD):
- Unit tests: Verify all icon files exist with correct dimensions
- Integration tests: N/A

**Acceptance Criteria**:
- [X] Source icon (`icon-source.png`) exists at 512x512 minimum
- [X] `icon-192x192.png` generated
- [X] `icon-512x512.png` generated
- [X] `icon-maskable-192x192.png` generated (with safe zone)
- [X] `icon-maskable-512x512.png` generated (with safe zone)
- [X] `badge-72x72.png` generated (monochrome)
- [X] All icons saved to `public/icons/` directory
- [X] Icons use purple theme color (#9333EA)

**Implementation Notes**:
- Maskable icons need 20% safe zone padding
- Badge icon should be monochrome for notification badges
- Use sharp library for image processing
- See quickstart.md section 4 for generation script

**Files to Modify/Create**:
- `public/icons/icon-192x192.png` (create)
- `public/icons/icon-512x512.png` (create)
- `public/icons/icon-maskable-192x192.png` (create)
- `public/icons/icon-maskable-512x512.png` (create)
- `public/icons/badge-72x72.png` (create)
- `scripts/generate-pwa-icons.js` (create helper script)

---

### Task 2.0.4: Create Web App Manifest

**Description**: Create manifest.json with PWA metadata and theme configuration

**Dependencies**: 
- Task 2.0.3 (icons required)

**Complexity**: Low
- JSON configuration file

**Test Requirements** (TDD):
- Unit tests: Validate manifest.json structure against PWA spec
- Integration tests: Test manifest loads correctly in browser

**Acceptance Criteria**:
- [X] `manifest.json` created in `public/` directory
- [X] `name` set to "Fasting Tracker"
- [X] `short_name` set to "Fasting"
- [X] `description` includes app purpose
- [X] `start_url` set to "/"
- [X] `display` set to "standalone"
- [X] `theme_color` set to "#9333EA" (purple)
- [X] `background_color` set to "#ffffff"
- [X] `icons` array includes all 4 icon sizes with correct purposes
- [X] Maskable icons have `purpose: "maskable"`
- [X] Standard icons have `purpose: "any"`

**Implementation Notes**:
- Follow data-model.md manifest structure
- Standalone display mode hides browser UI
- Theme color appears in Android task switcher
- Icons must use absolute paths (e.g., "/icons/icon-192x192.png")

**Files to Modify/Create**:
- `public/manifest.json` (create)

---

### Task 2.0.5: Link Manifest in App Layout

**Description**: Add manifest link and PWA meta tags to root layout

**Dependencies**: 
- Task 2.0.4 (manifest.json required)

**Complexity**: Low
- HTML meta tag additions

**Test Requirements** (TDD):
- Unit tests: Verify meta tags render in HTML
- E2E tests: Test manifest is detected by browser

**Acceptance Criteria**:
- [X] `<link rel="manifest">` added to layout head
- [X] `<meta name="theme-color">` added
- [X] `<meta name="apple-mobile-web-app-capable">` added for iOS
- [X] `<meta name="apple-mobile-web-app-status-bar-style">` added
- [X] `<meta name="viewport">` includes `width=device-width, initial-scale=1`
- [X] Apple touch icons linked for iOS support

**Implementation Notes**:
- Add to `src/app/layout.jsx` metadata export
- Use Next.js Metadata API (not manual meta tags)
- iOS requires separate apple-touch-icon links

**Files to Modify/Create**:
- `src/app/layout.jsx` (modify metadata export)

---

### Task 2.0.6: Configure Next.js with next-pwa

**Description**: Configure next-pwa plugin in Next.js config for service worker generation

**Dependencies**: 
- Task 2.0.1 (next-pwa package required)
- Task 2.0.4 (manifest.json required)

**Complexity**: Medium
- Requires understanding of Workbox runtime caching configuration

**Test Requirements** (TDD):
- Unit tests: Verify next.config.mjs exports correct structure
- Integration tests: Verify sw.js generated after build
- E2E tests: Test service worker registers successfully

**Acceptance Criteria**:
- [X] `next-pwa` imported in `next.config.mjs`
- [X] `dest: 'public'` configured (SW output directory)
- [X] `register: true` enabled (auto-registration)
- [X] `skipWaiting: true` enabled (immediate activation)
- [X] `disable: process.env.NODE_ENV === 'development'` set
- [X] Runtime caching configured for Google Fonts (Cache-First)
- [X] Runtime caching configured for `/api/entries` (Network-First, 10s timeout)
- [X] Runtime caching configured for `/api/settings` (Stale-While-Revalidate)
- [X] `npm run build` generates `public/sw.js` successfully

**Implementation Notes**:
- See research.md section 1 for configuration example
- Disable in development to avoid caching issues
- Runtime caching uses Workbox strategies
- Test with `npm run build && npm run start`

**Files to Modify/Create**:
- `next.config.mjs` (modify to wrap with withPWA)

---

### Task 2.0.7: Create Offline Fallback Page

**Description**: Create static offline.html page shown when network unavailable

**Dependencies**: None

**Complexity**: Low
- Simple static HTML page

**Test Requirements** (TDD):
- E2E tests: Test offline.html displays when network disconnected

**Acceptance Criteria**:
- [X] `offline.html` created in `public/` directory
- [X] Page displays "You are offline" message
- [X] Page includes app icon and branding
- [X] Page uses Tailwind classes (inline or minimal custom CSS)
- [X] Page explains offline functionality (cached entries viewable)
- [X] Page includes retry button (reloads page when clicked)
- [X] Page is valid HTML5

**Implementation Notes**:
- Keep minimal - no external CSS/JS dependencies
- Service worker will serve this for navigation requests when offline
- See service-worker.md contract for fallback logic

**Files to Modify/Create**:
- `public/offline.html` (create)

---

## Phase 2.1: Service Worker & Caching

**Priority**: High (Required for offline functionality)  
**Estimated Tasks**: 9  
**Estimated Duration**: 2-3 days

### Task 2.1.1: Register Service Worker in Client Layout

**Description**: Add client-side service worker registration component

**Dependencies**: 
- Task 2.0.6 (sw.js must be generated)

**Complexity**: Medium
- Client component with service worker lifecycle handling

**Test Requirements** (TDD):
- Unit tests: Test PWARegistration component renders without errors
- Unit tests: Test registration only happens in production
- Integration tests: Test service worker registration succeeds
- E2E tests: Verify sw.js registered in DevTools Application tab

**Acceptance Criteria**:
- [X] `PWARegistration` client component created
- [X] Component checks `typeof window !== 'undefined'`
- [X] Component checks `'serviceWorker' in navigator`
- [X] Component checks `process.env.NODE_ENV === 'production'`
- [X] Registration calls `navigator.serviceWorker.register('/sw.js')`
- [X] Registration handles errors gracefully (logs, doesn't throw)
- [X] Update detection dispatches `sw-update-available` custom event
- [X] Component added to root layout

**Implementation Notes**:
- See service-worker.md contract for registration example
- Use `useEffect` with empty deps array for one-time registration
- Mark component with `'use client'` directive

**Files to Modify/Create**:
- `src/components/pwa/PWARegistration.jsx` (create)
- `src/app/layout.jsx` (add PWARegistration component)

---

### Task 2.1.2: Test Cache-First Strategy for Static Assets

**Description**: Write tests to verify Cache-First strategy works for app shell

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- E2E testing with service worker requires specific setup

**Test Requirements** (TDD):
- E2E tests: Test static assets served from cache on repeat visit
- E2E tests: Test cache hit doesn't trigger network request
- E2E tests: Test offline navigation serves cached pages

**Acceptance Criteria**:
- [ ] Test loads page twice, second load serves from cache
- [ ] Test verifies Network tab shows "(from ServiceWorker)"
- [ ] Test disconnects network, page still loads
- [ ] Test verifies HTML, CSS, JS all cached
- [ ] Test runs in Playwright with service worker enabled

**Implementation Notes**:
- Use Playwright's `page.route()` to mock network
- Check `request.serviceWorker()` to verify SW interception
- See service-worker.md testing section

**Files to Modify/Create**:
- `tests/e2e/pwa-caching.spec.js` (create)

---

### Task 2.1.3: Test Network-First Strategy for API Routes

**Description**: Write tests to verify Network-First with cache fallback for /api/entries

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Test both online and offline scenarios

**Test Requirements** (TDD):
- Integration tests: Test API request goes to network when online
- Integration tests: Test API falls back to cache when offline
- Integration tests: Test 10-second timeout triggers cache fallback

**Acceptance Criteria**:
- [ ] Test makes API request while online, verifies network hit
- [ ] Test makes API request while offline, verifies cache served
- [ ] Test simulates slow network (>10s), verifies cache fallback
- [ ] Test verifies 503 returned when no cache available offline
- [ ] Test verifies successful responses are cached

**Implementation Notes**:
- Mock fetch in service worker context
- Use `page.setOfflineMode(true)` for offline testing
- See service-worker.md Network-First contract

**Files to Modify/Create**:
- `tests/integration/pwa/api-caching.test.js` (create)

---

### Task 2.1.4: Test Stale-While-Revalidate for Settings API

**Description**: Write tests for Stale-While-Revalidate strategy on /api/settings

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Test cache + background update behavior

**Test Requirements** (TDD):
- Integration tests: Test cached response returned immediately
- Integration tests: Test background fetch updates cache
- Integration tests: Test subsequent request gets updated data

**Acceptance Criteria**:
- [ ] Test first request caches response
- [ ] Test second request returns cached immediately
- [ ] Test cache updated after background fetch completes
- [ ] Test third request gets updated cached data
- [ ] Test works both online and offline

**Implementation Notes**:
- Stale-While-Revalidate shows cached, updates in background
- See service-worker.md contract for implementation

**Files to Modify/Create**:
- `tests/integration/pwa/settings-caching.test.js` (create)

---

### Task 2.1.5: Implement Service Worker Message Handler

**Description**: Add message handler in service worker for client communication

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Service worker message passing protocol

**Test Requirements** (TDD):
- Unit tests: Test message handler responds to known message types
- Integration tests: Test client can send messages to SW
- Integration tests: Test SW responds correctly

**Acceptance Criteria**:
- [ ] Message handler added to service worker
- [ ] `SKIP_WAITING` message triggers `self.skipWaiting()`
- [ ] `SYNC_NOW` message triggers sync queue processing
- [ ] `CLEAR_CACHE` message clears all caches
- [ ] Unknown message types logged, not throw errors
- [ ] Handler uses `event.waitUntil()` for async operations

**Implementation Notes**:
- See service-worker.md message passing section
- This enables manual sync trigger and cache clearing
- Add to workbox custom service worker file

**Files to Modify/Create**:
- `public/sw-custom.js` (create - custom SW additions)
- `next.config.mjs` (configure next-pwa to include custom SW)

---

### Task 2.1.6: Create UpdateBanner Component

**Description**: UI component to notify user of available service worker update

**Dependencies**: 
- Task 2.1.1 (service worker registration with update detection)

**Complexity**: Medium
- React component with service worker interaction

**Test Requirements** (TDD):
- Unit tests: Test component renders when update available
- Unit tests: Test component hidden by default
- Unit tests: Test reload button triggers skipWaiting + page reload
- E2E tests: Test update flow end-to-end

**Acceptance Criteria**:
- [ ] Component listens for `sw-update-available` custom event
- [ ] Component shows banner when event fired
- [ ] Banner displays "A new version is available!" message
- [ ] Banner includes "Reload" button
- [ ] Reload button posts `SKIP_WAITING` message to SW
- [ ] Reload button calls `window.location.reload()`
- [ ] Component styled with Tailwind (fixed position, top of page)
- [ ] Component accessible (keyboard navigable, screen reader friendly)

**Implementation Notes**:
- See service-worker.md update flow section
- Use `useEffect` to register event listener
- Consider auto-dismiss after 30 seconds

**Files to Modify/Create**:
- `src/components/molecules/UpdateBanner.jsx` (create)
- `src/app/layout.jsx` (add UpdateBanner component)

---

### Task 2.1.7: Create OfflineIndicator Component

**Description**: Visual indicator showing online/offline status

**Dependencies**: None (can be standalone)

**Complexity**: Low
- Simple component with network status detection

**Test Requirements** (TDD):
- Unit tests: Test component shows "Offline" when navigator.onLine is false
- Unit tests: Test component shows "Online" when navigator.onLine is true
- Unit tests: Test component updates on online/offline events

**Acceptance Criteria**:
- [X] Component displays network status
- [X] Component listens to `online` and `offline` window events
- [X] Component checks `navigator.onLine` on mount
- [X] Offline indicator styled prominently (red badge)
- [X] Online indicator subtle or hidden
- [X] Component follows atomic design (atom level)
- [X] Component shows loading state when fetching fresh data (FR-018)

**Implementation Notes**:
- Simple badge, fixed position (top-right corner)
- Could include sync queue count when offline
- See useNetworkStatus hook (Phase 2.6)

**Files to Modify/Create**:
- `src/components/atoms/OfflineIndicator.jsx` (create)
- `src/app/layout.jsx` (add OfflineIndicator component)

---

### Task 2.1.8: Test Service Worker Lifecycle Events

**Description**: Write tests for install, activate, fetch events

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: High
- Service worker testing requires specialized setup

**Test Requirements** (TDD):
- Integration tests: Test install event precaches app shell
- Integration tests: Test activate event cleans old caches
- Integration tests: Test fetch event intercepts requests
- Integration tests: Test skipWaiting triggers immediate activation

**Acceptance Criteria**:
- [ ] Test install event creates app-shell cache
- [ ] Test install event calls skipWaiting()
- [ ] Test activate event deletes old cache versions
- [ ] Test activate event calls clients.claim()
- [ ] Test fetch event intercepts same-origin requests
- [ ] Test fetch event applies correct caching strategy

**Implementation Notes**:
- Use Workbox testing utilities
- See service-worker.md lifecycle events section
- May require custom service worker for testing hooks

**Files to Modify/Create**:
- `tests/unit/pwa/service-worker.test.js` (create)

---

### Task 2.1.9: Test Offline Fallback Page

**Description**: Verify offline.html serves when fully offline

**Dependencies**: 
- Task 2.0.7 (offline.html created)
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- E2E test with network disconnection

**Test Requirements** (TDD):
- E2E tests: Test offline.html shown for navigation when offline
- E2E tests: Test retry button reloads page
- E2E tests: Test offline page displays correct branding

**Acceptance Criteria**:
- [ ] Test navigates to new page while offline
- [ ] Test verifies offline.html content displayed
- [ ] Test verifies "You are offline" message present
- [ ] Test clicks retry button, page reloads
- [ ] Test works for all navigation requests (not API)

**Implementation Notes**:
- Use Playwright's `setOfflineMode(true)`
- Clear cache before test to ensure fresh state
- See service-worker.md cache-first fallback logic

**Files to Modify/Create**:
- `tests/e2e/offline-fallback.spec.js` (create)

---

## Phase 2.2: IndexedDB & Offline Storage

**Priority**: High (Required for offline entries)  
**Estimated Tasks**: 8  
**Estimated Duration**: 2-3 days

### Task 2.2.1: Create IndexedDB Wrapper with idb

**Description**: Initialize IndexedDB database with 4 stores using idb library

**Dependencies**: 
- Task 2.0.1 (idb package installed)

**Complexity**: Medium
- Database schema design and upgrade handling

**Test Requirements** (TDD):
- Unit tests: Test database initializes with correct version
- Unit tests: Test all 4 stores created with correct keyPath
- Unit tests: Test indexes created for each store
- Integration tests: Test database survives page reload

**Acceptance Criteria**:
- [X] Database named "fasting-tracker" created
- [X] Database version set to 1
- [X] `offlineEntries` store created with keyPath 'id'
- [X] `cachedEntries` store created with keyPath 'id'
- [X] `syncMeta` store created with keyPath 'key'
- [X] `pushMeta` store created with keyPath 'userId'
- [X] All indexes created per indexeddb-schema.md contract
- [X] Upgrade handler implements blocked/blocking/terminated callbacks
- [X] `getDB()` function exports single database instance

**Implementation Notes**:
- See indexeddb-schema.md for complete schema
- Use `openDB()` from idb with upgrade callback
- Handle version conflicts gracefully

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (create)

---

### Task 2.2.2: Implement offlineEntries CRUD Operations

**Description**: Create functions for offline entry queue management

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: Medium
- Multiple operations with transaction handling

**Test Requirements** (TDD):
- Unit tests: Test addOfflineEntry creates entry with UUID
- Unit tests: Test getPendingEntries returns only pending status
- Unit tests: Test updateSyncStatus updates entry correctly
- Unit tests: Test deleteSyncedEntry removes entry
- Integration tests: Test operations survive database reconnection

**Acceptance Criteria**:
- [X] `addOfflineEntry(userId, date, entryData)` function implemented
- [X] Entry ID generated with `crypto.randomUUID()`
- [X] `syncStatus` defaults to 'pending'
- [X] `getPendingEntries()` returns array of pending entries
- [X] `updateSyncStatus(id, status, error)` updates entry
- [X] `deleteSyncedEntry(id)` removes entry
- [X] All operations use correct transaction modes
- [X] Functions throw descriptive errors on failure

**Implementation Notes**:
- See indexeddb-schema.md offlineEntries operations
- Use read-write transactions for modifications
- Validate entry structure before insertion

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (add functions)

---

### Task 2.2.3: Implement cachedEntries CRUD Operations

**Description**: Create functions for cached entry storage and retrieval

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: Medium
- Cache management with expiration

**Test Requirements** (TDD):
- Unit tests: Test cacheEntry stores server entry
- Unit tests: Test getCachedUserEntries returns user's entries
- Unit tests: Test evictOldEntries removes expired entries
- Integration tests: Test eviction policy (90 days)

**Acceptance Criteria**:
- [X] `cacheEntry(serverEntry)` function implemented
- [X] Uses server `_id` as cache key
- [X] `expiresAt` calculated as 90 days from now
- [X] `getCachedUserEntries(userId)` returns array
- [X] `evictOldEntries()` removes entries older than 90 days
- [X] Eviction uses `IDBKeyRange.upperBound()`
- [X] Functions return entry count for logging

**Implementation Notes**:
- See indexeddb-schema.md cachedEntries operations
- Eviction should run on quota exceeded error
- Use `put()` for upsert behavior

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (add functions)

---

### Task 2.2.4: Implement syncMeta Operations

**Description**: Create functions for sync metadata storage

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: Low
- Simple key-value operations

**Test Requirements** (TDD):
- Unit tests: Test setSyncMeta stores metadata
- Unit tests: Test getSyncMeta retrieves value
- Unit tests: Test metadata survives page reload

**Acceptance Criteria**:
- [X] `setSyncMeta(key, value)` function implemented
- [X] `getSyncMeta(key)` function implemented
- [X] Returns unwrapped value (not full metadata object)
- [X] Returns undefined if key doesn't exist
- [X] `updatedAt` timestamp automatically set

**Implementation Notes**:
- See indexeddb-schema.md syncMeta operations
- Used for tracking last sync time, errors, queue stats

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (add functions)

---

### Task 2.2.5: Implement pushMeta Operations

**Description**: Create functions for push subscription storage

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: Low
- Simple user-subscription mapping

**Test Requirements** (TDD):
- Unit tests: Test savePushSubscription stores subscription
- Unit tests: Test getPushSubscription retrieves by userId
- Unit tests: Test subscription.toJSON() serialization

**Acceptance Criteria**:
- [X] `savePushSubscription(userId, subscription, preferences)` implemented
- [X] Subscription serialized with `.toJSON()`
- [X] `getPushSubscription(userId)` returns full metadata
- [X] Returns undefined if no subscription exists
- [X] Preferences object validated

**Implementation Notes**:
- See indexeddb-schema.md pushMeta operations
- Used to store push subscription for offline reference

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (add functions)

---

### Task 2.2.6: Handle IndexedDB Quota Exceeded Error

**Description**: Implement quota exceeded error handling with automatic eviction

**Dependencies**: 
- Task 2.2.3 (evictOldEntries function exists)

**Complexity**: Medium
- Error handling with retry logic

**Test Requirements** (TDD):
- Unit tests: Test QuotaExceededError triggers eviction
- Unit tests: Test operation retries after eviction
- Unit tests: Test throws if no entries to evict
- Integration tests: Test with simulated quota limit

**Acceptance Criteria**:
- [ ] Catch `QuotaExceededError` by name
- [ ] Call `evictOldEntries()` on quota error
- [ ] Retry operation if eviction successful
- [ ] Throw descriptive error if eviction fails
- [ ] Log quota errors for monitoring

**Implementation Notes**:
- See indexeddb-schema.md error handling section
- Wrap all write operations with quota handler
- Browser quota typically ~60% of available disk space

**Files to Modify/Create**:
- `src/lib/pwa/indexeddb.js` (add error handling wrapper)

---

### Task 2.2.7: Test IndexedDB Transaction Patterns

**Description**: Write tests for read-only and read-write transactions

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: Medium
- Transaction isolation and commit behavior

**Test Requirements** (TDD):
- Unit tests: Test read-only transaction cannot modify data
- Unit tests: Test read-write transaction commits changes
- Unit tests: Test transaction auto-rollback on error
- Unit tests: Test concurrent transactions handled correctly

**Acceptance Criteria**:
- [ ] Test readonly transaction throws on write attempt
- [ ] Test readwrite transaction commits on await tx.done
- [ ] Test transaction rollback on unhandled error
- [ ] Test multiple stores in single transaction
- [ ] Test transaction timeout handling

**Implementation Notes**:
- See indexeddb-schema.md transaction patterns
- idb auto-manages transaction lifecycle
- Test with intentional errors to verify rollback

**Files to Modify/Create**:
- `tests/unit/pwa/indexeddb-transactions.test.js` (create)

---

### Task 2.2.8: Test Database Version Upgrade

**Description**: Test database upgrade handling and version conflicts

**Dependencies**: 
- Task 2.2.1 (database initialized)

**Complexity**: High
- Version migration simulation

**Test Requirements** (TDD):
- Integration tests: Test upgrade from v1 to v2 (future-proof)
- Integration tests: Test blocked handler notifies user
- Integration tests: Test database recreated on corruption

**Acceptance Criteria**:
- [ ] Test new store added in v2 upgrade
- [ ] Test blocked event dispatches custom event
- [ ] Test terminated event clears cached DB instance
- [ ] Test data preserved during upgrade
- [ ] Test version conflict resolved correctly

**Implementation Notes**:
- See indexeddb-schema.md migration strategy
- Simulate multiple tabs to trigger blocked event
- Test upgrade path even though currently v1

**Files to Modify/Create**:
- `tests/integration/pwa/indexeddb-upgrade.test.js` (create)

---

## Phase 2.3: Offline Sync System

**Priority**: High (Core offline functionality)  
**Estimated Tasks**: 10  
**Estimated Duration**: 3-4 days

### Task 2.3.1: Create Sync Queue Service

**Description**: Implement main sync queue processor with mutex

**Dependencies**: 
- Task 2.2.2 (offlineEntries operations)

**Complexity**: High
- Concurrency control, retry logic, error handling

**Test Requirements** (TDD):
- Unit tests: Test syncInProgress mutex prevents concurrent syncs
- Unit tests: Test processSyncQueue iterates all pending entries
- Unit tests: Test queue skips entries with future nextRetryAt
- Integration tests: Test full sync flow end-to-end

**Acceptance Criteria**:
- [X] `processSyncQueue()` function implemented
- [X] Mutex (`syncInProgress`) prevents concurrent runs
- [X] Fetches pending entries from IndexedDB
- [X] Skips entries where `nextRetryAt > Date.now()`
- [X] Processes entries sequentially (not parallel)
- [X] Handles errors gracefully (log, don't throw)
- [X] Resets mutex in finally block

**Implementation Notes**:
- See sync-strategy.md queue processor section
- Sequential processing ensures order
- Mutex critical for preventing duplicate syncs

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (create)

---

### Task 2.3.2: Implement Individual Entry Sync

**Description**: Sync single entry to server with authentication and conflict detection

**Dependencies**: 
- Task 2.3.1 (sync queue processor)
- Task 2.2.2 (offlineEntries operations)
- Task 2.2.3 (cachedEntries operations)

**Complexity**: High
- API integration, auth, conflict resolution, error handling

**Test Requirements** (TDD):
- Unit tests: Test syncEntry makes correct API request
- Unit tests: Test X-Sync-Timestamp header included
- Unit tests: Test successful sync moves entry to cache
- Integration tests: Test with real NextAuth session
- Integration tests: Test network errors trigger retry

**Acceptance Criteria**:
- [X] `syncEntry(entry)` function implemented
- [X] Updates syncStatus to 'syncing' before request
- [X] Includes `X-Sync-Timestamp` header with entry.createdAt
- [X] Includes NextAuth Bearer token in Authorization header
- [X] Makes POST request to `/api/entries`
- [X] On success: caches entry, deletes from queue, updates syncMeta
- [X] On failure: schedules retry with exponential backoff
- [X] Logs sync result (success/failure)

**Implementation Notes**:
- See sync-strategy.md syncEntry implementation
- Use `getSession()` from NextAuth for token
- Follow API contract for request format

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (add syncEntry function)

---

### Task 2.3.3: Implement Exponential Backoff Retry

**Description**: Schedule retries with exponential backoff (5s, 10s, 20s, 1hr)

**Dependencies**: 
- Task 2.3.2 (syncEntry function)

**Complexity**: Medium
- Delay calculation and retry scheduling

**Test Requirements** (TDD):
- Unit tests: Test retry delays follow pattern (5s, 10s, 20s, 1hr)
- Unit tests: Test max retries stops after 10 attempts
- Unit tests: Test nextRetryAt calculated correctly
- Unit tests: Test setTimeout schedules next sync

**Acceptance Criteria**:
- [X] `scheduleRetry(entry, errorMessage)` function implemented
- [X] Retry delays: [5000, 10000, 20000, 3600000] ms
- [X] After 3rd retry, all subsequent use 1hr delay
- [X] Stops after MAX_RETRY_ATTEMPTS (10)
- [X] Updates entry with nextRetryAt, syncAttempts, error
- [X] Logs critical error when max retries exceeded
- [X] Schedules next processSyncQueue() with setTimeout

**Implementation Notes**:
- See sync-strategy.md exponential backoff section
- Use Math.min() to cap delay index
- Check navigator.onLine before retrying

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (add scheduleRetry function)

---

### Task 2.3.4: Implement Online Event Trigger

**Description**: Automatically trigger sync when network comes online

**Dependencies**: 
- Task 2.3.1 (processSyncQueue function)

**Complexity**: Low
- Event listener registration

**Test Requirements** (TDD):
- Unit tests: Test online event listener registered
- Unit tests: Test processSyncQueue called on online event
- Integration tests: Test sync triggered when network restored

**Acceptance Criteria**:
- [X] `initSyncTriggers()` function implemented
- [X] Registers `online` event listener on window
- [X] Event handler calls `processSyncQueue()`
- [X] Checks `navigator.onLine` on page load
- [X] Triggers sync if already online at load time
- [X] Function called on app initialization

**Implementation Notes**:
- See sync-strategy.md trigger conditions section
- Add to app initialization (useEffect in layout)
- Primary trigger for offline-to-online sync

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (add initSyncTriggers function)
- `src/app/layout.jsx` (call initSyncTriggers in useEffect)

---

### Task 2.3.5: Implement Manual Sync Trigger

**Description**: Create React hook for manual sync with UI state

**Dependencies**: 
- Task 2.3.1 (processSyncQueue function)

**Complexity**: Medium
- React hook with async state management

**Test Requirements** (TDD):
- Unit tests: Test useSyncQueue hook returns correct state
- Unit tests: Test triggerSync prevents duplicate calls
- Unit tests: Test syncing state updates correctly
- Integration tests: Test hook with real IndexedDB

**Acceptance Criteria**:
- [X] `useSyncQueue()` hook implemented
- [X] Returns `{ syncing, queueLength, triggerSync }`
- [X] `triggerSync()` checks syncing state (prevent duplicates)
- [X] Updates `syncing` state during sync
- [X] Updates `queueLength` after sync completes
- [X] Hook refreshes queue length on mount
- [X] Hook can be used in UI components

**Implementation Notes**:
- See sync-strategy.md manual trigger section
- Use useState for syncing flag
- Use useEffect to get initial queue length

**Files to Modify/Create**:
- `src/hooks/useSyncQueue.js` (create)

---

### Task 2.3.6: Implement Periodic Sync Check

**Description**: Check and process sync queue every 5 minutes while app open

**Dependencies**: 
- Task 2.3.1 (processSyncQueue function)

**Complexity**: Low
- setInterval with online check

**Test Requirements** (TDD):
- Unit tests: Test interval set to 5 minutes
- Unit tests: Test only syncs when online
- Unit tests: Test only syncs when queue not empty
- Integration tests: Test interval cleaned up on unmount

**Acceptance Criteria**:
- [X] setInterval configured for 5 minutes (300000 ms)
- [X] Checks `navigator.onLine` before syncing
- [X] Checks queue length before syncing (skip if empty)
- [X] Only runs in browser (check `typeof window !== 'undefined'`)
- [X] Interval cleared on component unmount
- [X] Logs periodic check activity

**Implementation Notes**:
- See sync-strategy.md periodic check section
- Add to root layout useEffect with cleanup
- Prevents unnecessary sync attempts

**Files to Modify/Create**:
- `src/app/layout.jsx` (add periodic sync interval)

---

### Task 2.3.7: Implement Background Sync API (Progressive Enhancement)

**Description**: Register Background Sync for browsers that support it

**Dependencies**: 
- Task 2.3.1 (processSyncQueue function)
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Service worker API with feature detection

**Test Requirements** (TDD):
- Unit tests: Test feature detection for Background Sync
- Unit tests: Test sync registered with correct tag
- Integration tests: Test SW sync event triggers queue processing
- E2E tests: Test Background Sync on supported browsers

**Acceptance Criteria**:
- [X] Feature detection: `'sync' in self.registration`
- [X] Registration: `registration.sync.register('sync-entries')`
- [X] Service worker sync event handler added
- [X] Handler calls `processSyncQueue()`
- [X] Handler uses `event.waitUntil()` to keep SW alive
- [X] Graceful fallback if not supported (use online event)

**Implementation Notes**:
- See sync-strategy.md Background Sync API section
- Progressive enhancement - not required for core functionality
- Chrome/Edge support, Safari/Firefox don't

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (add registerBackgroundSync function)
- `public/sw-custom.js` (add sync event listener)

---

### Task 2.3.8: Implement Last-Write-Wins Conflict Resolution (Client)

**Description**: Send sync timestamp header for conflict detection

**Dependencies**: 
- Task 2.3.2 (syncEntry function)

**Complexity**: Low
- HTTP header addition

**Test Requirements** (TDD):
- Unit tests: Test X-Sync-Timestamp header sent
- Unit tests: Test timestamp is entry.createdAt
- Unit tests: Test header format (string integer)

**Acceptance Criteria**:
- [X] `X-Sync-Timestamp` header added to POST request
- [X] Header value is `entry.createdAt.toString()`
- [X] Timestamp is Unix milliseconds (not seconds)
- [X] Header included in all sync requests

**Implementation Notes**:
- See sync-strategy.md conflict resolution section
- Server uses this to determine which data is newer
- Simple last-write-wins strategy

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (modify syncEntry to add header)

---

### Task 2.3.9: Implement Last-Write-Wins Conflict Resolution (Server)

**Description**: Server-side conflict resolution based on timestamps

**Dependencies**: None (server-side only)

**Complexity**: High
- Database query, timestamp comparison, update logic

**Test Requirements** (TDD):
- Integration tests: Test client wins when timestamp newer
- Integration tests: Test server wins when timestamp newer
- Integration tests: Test no conflict when entry doesn't exist
- Integration tests: Test X-Conflict-Resolved header returned

**Acceptance Criteria**:
- [X] API route reads `X-Sync-Timestamp` header
- [X] Checks for existing entry (userId + date)
- [X] No existing: creates new entry (HTTP 201)
- [X] Client newer: updates entry (HTTP 200)
- [X] Server newer: returns existing (HTTP 200 + X-Conflict-Resolved header)
- [X] Logs conflict resolution decision
- [X] Returns entry data in all cases

**Implementation Notes**:
- See sync-strategy.md server-side implementation
- Modify existing POST /api/entries route
- Add conflict resolution logic before create/update

**Files to Modify/Create**:
- `src/app/api/entries/route.js` (modify POST handler)

---

### Task 2.3.10: Handle Sync Errors (Network, HTTP, Auth)

**Description**: Implement error handling for different failure types

**Dependencies**: 
- Task 2.3.2 (syncEntry function)
- Task 2.3.3 (scheduleRetry function)

**Complexity**: High
- Multiple error types, different handling strategies

**Test Requirements** (TDD):
- Unit tests: Test network errors trigger retry
- Unit tests: Test 5xx errors trigger retry
- Unit tests: Test 401 errors don't retry (log critical)
- Unit tests: Test 400 errors don't retry (log critical)
- Integration tests: Test error scenarios end-to-end

**Acceptance Criteria**:
- [X] Network errors (TypeError) trigger retry
- [X] HTTP 5xx errors trigger retry
- [X] HTTP 401 errors mark failed, log critical (don't retry)
- [X] HTTP 400 errors mark failed, log critical (don't retry)
- [X] Other 4xx errors trigger retry
- [X] All errors logged with context
- [X] Critical errors sent to server error endpoint

**Implementation Notes**:
- See sync-strategy.md error handling section
- 401 = expired session, user needs to re-auth
- 400 = bad data, likely code bug
- 5xx = temporary server issue, safe to retry

**Files to Modify/Create**:
- `src/lib/pwa/syncQueue.js` (add error handling to syncEntry)

---

## Phase 2.4: Push Notifications

**Priority**: Medium (P2 feature)  
**Estimated Tasks**: 12  
**Estimated Duration**: 3-4 days

### Task 2.4.1: Create NotificationPermissionPrompt Component

**Description**: UI component to request notification permission from user

**Dependencies**: None

**Complexity**: Medium
- Permission API, React state management

**Test Requirements** (TDD):
- Unit tests: Test component renders when permission is 'default'
- Unit tests: Test component hidden when permission is 'granted'
- Unit tests: Test button disabled during request
- Unit tests: Test denied state shows instructions

**Acceptance Criteria**:
- [X] Component checks `Notification.permission` on mount
- [X] Shows prompt only when permission is 'default'
- [X] Button triggers `Notification.requestPermission()`
- [X] On granted: calls subscribeToPush()
- [X] On denied: shows browser settings instructions
- [X] Component styled with Tailwind (card/modal)
- [X] Accessible (keyboard, screen reader)

**Implementation Notes**:
- See push-notification.md permission request section
- Request must be user-initiated (button click)
- Consider showing after user creates first entry

**Files to Modify/Create**:
- `src/components/molecules/NotificationPermissionPrompt.jsx` (create)

---

### Task 2.4.2: Implement Push Subscription Client-Side

**Description**: Subscribe to push notifications via Push Manager API

**Dependencies**: 
- Task 2.0.2 (VAPID keys generated)
- Task 2.1.1 (service worker registered)

**Complexity**: High
- Push API, VAPID key conversion, error handling

**Test Requirements** (TDD):
- Unit tests: Test subscribeToPush creates subscription
- Unit tests: Test VAPID key converted correctly
- Unit tests: Test duplicate subscription detected
- Integration tests: Test subscription sent to server
- Integration tests: Test subscription stored in IndexedDB

**Acceptance Criteria**:
- [X] `subscribeToPush()` function implemented
- [X] Waits for `navigator.serviceWorker.ready`
- [X] Checks for existing subscription
- [X] Converts VAPID public key from base64 to Uint8Array
- [X] Subscribes with `userVisibleOnly: true`
- [X] Sends subscription to POST /api/pwa/subscribe
- [X] Stores in IndexedDB via savePushSubscription()
- [X] Returns subscription object

**Implementation Notes**:
- See push-notification.md subscription flow section
- VAPID key from NEXT_PUBLIC_VAPID_PUBLIC_KEY
- Use urlBase64ToUint8Array helper function

**Files to Modify/Create**:
- `src/lib/pwa/pushNotifications.js` (create)

---

### Task 2.4.3: Implement Push Unsubscribe

**Description**: Unsubscribe from push notifications

**Dependencies**: 
- Task 2.4.2 (subscribeToPush function)

**Complexity**: Medium
- Unsubscribe from multiple places (Push Manager, server, IndexedDB)

**Test Requirements** (TDD):
- Unit tests: Test unsubscribeFromPush calls subscription.unsubscribe()
- Unit tests: Test server notified of unsubscribe
- Integration tests: Test subscription removed from all stores

**Acceptance Criteria**:
- [X] `unsubscribeFromPush()` function implemented
- [X] Gets existing subscription from Push Manager
- [X] Calls `subscription.unsubscribe()`
- [X] Posts to `/api/pwa/unsubscribe` with endpoint
- [X] Deletes from IndexedDB pushMeta store
- [X] Handles "no subscription" gracefully (don't throw)

**Implementation Notes**:
- See push-notification.md unsubscribe section
- User may want to disable then re-enable later

**Files to Modify/Create**:
- `src/lib/pwa/pushNotifications.js` (add unsubscribeFromPush function)

---

### Task 2.4.4: Create PushSubscription MongoDB Model

**Description**: Mongoose schema for storing push subscriptions server-side

**Dependencies**: None (server-side model)

**Complexity**: Low
- Mongoose schema definition

**Test Requirements** (TDD):
- Unit tests: Test schema validates required fields
- Unit tests: Test userId unique constraint
- Integration tests: Test model saves to MongoDB

**Acceptance Criteria**:
- [X] PushSubscription model created
- [X] `userId` field (ObjectId, unique, required, ref: User)
- [X] `endpoint` field (String, required)
- [X] `expirationTime` field (Number, nullable)
- [X] `keys` object with `p256dh` and `auth` (required)
- [X] `preferences` object with 3 booleans (defaults)
- [X] `subscribedAt` and `lastNotificationAt` timestamps
- [X] Indexes on userId and preferences.fastingWindowReminder

**Implementation Notes**:
- See push-notification.md MongoDB model section
- One subscription per user (unique constraint)
- Preferences control notification types

**Files to Modify/Create**:
- `src/lib/models/PushSubscription.js` (create)

---

### Task 2.4.5: Create POST /api/pwa/subscribe Endpoint

**Description**: API endpoint to store push subscription in MongoDB

**Dependencies**: 
- Task 2.4.4 (PushSubscription model)

**Complexity**: Medium
- Authentication, validation, upsert logic

**Test Requirements** (TDD):
- Integration tests: Test endpoint requires authentication
- Integration tests: Test subscription saved to MongoDB
- Integration tests: Test duplicate subscription updates existing
- Integration tests: Test invalid subscription returns 400

**Acceptance Criteria**:
- [X] POST /api/pwa/subscribe route created
- [X] Requires NextAuth session (401 if not authenticated)
- [X] Validates subscription structure (endpoint, keys)
- [X] Uses `findOneAndUpdate()` with `upsert: true`
- [X] Returns HTTP 201 with subscription ID
- [X] Returns HTTP 400 for invalid subscription
- [X] Logs subscription save

**Implementation Notes**:
- See push-notification.md subscribe endpoint section
- Upsert ensures one subscription per user
- Store preferences with subscription

**Files to Modify/Create**:
- `src/app/api/pwa/subscribe/route.js` (create)

---

### Task 2.4.6: Create POST /api/pwa/unsubscribe Endpoint

**Description**: API endpoint to remove push subscription from MongoDB

**Dependencies**: 
- Task 2.4.4 (PushSubscription model)

**Complexity**: Low
- Simple delete operation

**Test Requirements** (TDD):
- Integration tests: Test endpoint deletes subscription
- Integration tests: Test returns 404 if not found
- Integration tests: Test requires authentication

**Acceptance Criteria**:
- [X] POST /api/pwa/unsubscribe route created
- [X] Requires NextAuth session
- [X] Accepts endpoint in request body
- [X] Deletes subscription by endpoint
- [X] Returns HTTP 200 on success
- [X] Returns HTTP 404 if not found
- [X] Logs unsubscribe action

**Implementation Notes**:
- Delete by endpoint (not userId) for flexibility
- Endpoint URL uniquely identifies subscription

**Files to Modify/Create**:
- `src/app/api/pwa/unsubscribe/route.js` (create)

---

### Task 2.4.7: Implement 7-Day Average Meal Time Calculation

**Description**: Calculate typical meal time from last 7 entries

**Dependencies**: None (uses existing Entry model)

**Complexity**: Medium
- Date aggregation, time math, edge cases

**Test Requirements** (TDD):
- Unit tests: Test calculation with 7 entries
- Unit tests: Test calculation with < 7 entries
- Unit tests: Test returns null when no meal times
- Unit tests: Test reminder is 1 hour before average
- Unit tests: Test time format (HH:MM with zero-padding)

**Acceptance Criteria**:
- [X] `calculateTypicalMealTime(userId)` function implemented
- [X] Queries last 7 entries with firstMealTime
- [X] Calculates average in minutes since midnight
- [X] Subtracts 60 minutes for reminder time
- [X] Returns HH:MM formatted string
- [X] Returns null if no entries found
- [X] Handles < 7 entries (uses available data)

**Implementation Notes**:
- See push-notification.md 7-day average section
- Query Entry model with sort and limit
- Handle edge case: average < 60 min (would be negative)

**Files to Modify/Create**:
- `src/lib/pwa/notificationScheduler.js` (create)

---

### Task 2.4.8: Implement Notification Scheduler Service

**Description**: Service to check and send notifications based on user schedules

**Dependencies**: 
- Task 2.4.7 (calculateTypicalMealTime function)
- Task 2.4.4 (PushSubscription model)

**Complexity**: High
- User iteration, time matching, notification sending

**Test Requirements** (TDD):
- Unit tests: Test scheduleNotifications queries correct subscriptions
- Unit tests: Test time window matching (±5 minutes)
- Unit tests: Test skips users without meal data
- Integration tests: Test full scheduling flow
- Integration tests: Test lastNotificationAt updated

**Acceptance Criteria**:
- [X] `scheduleNotifications()` function implemented
- [X] Queries subscriptions with fastingWindowReminder: true
- [X] Calculates reminder time per user
- [X] Checks if current time within ±5 minute window
- [X] Sends push notification if time matches
- [X] Updates lastNotificationAt after send
- [X] Continues on individual user errors (don't fail all)

**Implementation Notes**:
- See push-notification.md scheduler service section
- Run via cron job (Phase 2.4.11)
- ±5 minute window accounts for cron timing

**Files to Modify/Create**:
- `src/lib/pwa/notificationScheduler.js` (add scheduleNotifications function)

---

### Task 2.4.9: Implement Push Notification Sending

**Description**: Send push notification via Web Push Protocol

**Dependencies**: 
- Task 2.0.2 (VAPID keys in environment)
- Task 2.4.4 (PushSubscription model)

**Complexity**: High
- Web Push Protocol, VAPID authentication, error handling

**Test Requirements** (TDD):
- Unit tests: Test sendPushNotification calls webpush.sendNotification
- Unit tests: Test payload is JSON-stringified
- Unit tests: Test 410/404 removes expired subscription
- Integration tests: Test with real web-push library

**Acceptance Criteria**:
- [X] `sendPushNotification(subscription, payload)` function implemented
- [X] Configures webpush with VAPID keys
- [X] Calls `webpush.sendNotification()` with subscription and payload
- [X] Payload JSON-stringified
- [X] TTL set to 3600 seconds (1 hour)
- [X] Urgency set to 'normal'
- [X] HTTP 410/404 removes subscription from database
- [X] Logs send success/failure

**Implementation Notes**:
- See push-notification.md send function section
- 410 = subscription expired, user unsubscribed
- Use web-push npm library

**Files to Modify/Create**:
- `src/lib/pwa/notificationScheduler.js` (add sendPushNotification function)

---

### Task 2.4.10: Implement Service Worker Push Event Handler

**Description**: Handle push events in service worker and show notifications

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Service worker event handling, notification API

**Test Requirements** (TDD):
- Integration tests: Test push event shows notification
- Integration tests: Test notification data parsed correctly
- E2E tests: Test notification appears on device

**Acceptance Criteria**:
- [X] Push event listener added to service worker
- [X] Parses `event.data` as JSON
- [X] Falls back to default notification if parsing fails
- [X] Calls `self.registration.showNotification()`
- [X] Notification includes title, body, icon, badge, tag, data
- [X] Vibrate pattern set for accessibility
- [X] `requireInteraction` set to false (auto-dismiss)
- [X] Uses `event.waitUntil()` to keep SW alive

**Implementation Notes**:
- See push-notification.md push event handler section
- userVisibleOnly requires showing notification
- Add to custom service worker file

**Files to Modify/Create**:
- `public/sw-custom.js` (add push event listener)

---

### Task 2.4.11: Implement Service Worker Notification Click Handler

**Description**: Handle notification clicks and deep link to app

**Dependencies**: 
- Task 2.4.10 (push event handler)

**Complexity**: Medium
- Window management, deep linking

**Test Requirements** (TDD):
- Integration tests: Test notification closes on click
- Integration tests: Test existing window focused if open
- Integration tests: Test new window opened if app not open
- E2E tests: Test deep link navigates to correct page

**Acceptance Criteria**:
- [X] Notification click listener added to service worker
- [X] Closes notification with `event.notification.close()`
- [X] Extracts URL from `event.notification.data.url`
- [X] Searches for existing window with matching URL
- [X] Focuses existing window if found
- [X] Opens new window if not found
- [X] Handles dismiss action (no-op)
- [X] Uses `event.waitUntil()` for async operations

**Implementation Notes**:
- See push-notification.md notification click handler section
- Deep link URL in notification.data.url
- Default to /entries if no URL provided

**Files to Modify/Create**:
- `public/sw-custom.js` (add notificationclick event listener)

---

### Task 2.4.12: Create Vercel Cron Job for Notifications

**Description**: Configure Vercel cron to trigger notification scheduling

**Dependencies**: 
- Task 2.4.8 (scheduleNotifications function)

**Complexity**: Medium
- Vercel config, cron endpoint with auth

**Test Requirements** (TDD):
- Integration tests: Test cron endpoint requires CRON_SECRET
- Integration tests: Test endpoint calls scheduleNotifications
- Integration tests: Test returns 200 on success

**Acceptance Criteria**:
- [X] `vercel.json` created with cron configuration
- [X] Cron runs every 5 minutes (`*/5 * * * *`)
- [X] Cron path: `/api/cron/send-notifications`
- [X] API route created at path
- [X] Endpoint verifies `authorization` header matches CRON_SECRET
- [X] Endpoint calls scheduleNotifications()
- [X] Returns HTTP 200 on success
- [X] Returns HTTP 401 if secret invalid
- [X] Logs cron execution

**Implementation Notes**:
- See push-notification.md cron integration section
- CRON_SECRET in environment variables
- Vercel automatically sends Authorization header

**Files to Modify/Create**:
- `vercel.json` (create with crons array)
- `src/app/api/cron/send-notifications/route.js` (create)

---

## Phase 2.5: PWA UI Components

**Priority**: Medium (Enhances UX)  
**Estimated Tasks**: 6  
**Estimated Duration**: 1-2 days

### Task 2.5.1: Create InstallPrompt Component

**Description**: Custom install button using beforeinstallprompt event

**Dependencies**: None

**Complexity**: Medium
- Browser install prompt API, event handling

**Test Requirements** (TDD):
- Unit tests: Test component captures beforeinstallprompt event
- Unit tests: Test install button triggers prompt
- Unit tests: Test component hidden after install
- E2E tests: Test install flow on real device

**Acceptance Criteria**:
- [X] Component listens for `beforeinstallprompt` event
- [X] Stores prompt event in state
- [X] Shows install button when prompt available
- [X] Button triggers `prompt.prompt()`
- [X] Listens for user choice (accepted/dismissed)
- [X] Hides button after successful install
- [X] Button styled with Tailwind (prominent CTA)
- [X] Accessible (keyboard, ARIA labels)
- [X] Install prompt appears after 30 seconds of interaction OR 2+ page views (FR-006)

**Implementation Notes**:
- beforeinstallprompt only fires if install criteria met (manifest, SW, HTTPS)
- Event preventDefault() required to show custom prompt
- Track engagement time and page views to optimize prompt timing per FR-006

**Files to Modify/Create**:
- `src/components/molecules/InstallPrompt.jsx` (create)
- `src/app/page.jsx` (add InstallPrompt to homepage)

---

### Task 2.5.2: Create useInstallPrompt Hook

**Description**: React hook for install prompt state management

**Dependencies**: None

**Complexity**: Low
- Event listener hook

**Test Requirements** (TDD):
- Unit tests: Test hook captures beforeinstallprompt event
- Unit tests: Test install() function triggers prompt
- Unit tests: Test isInstallable state updates correctly

**Acceptance Criteria**:
- [X] `useInstallPrompt()` hook implemented
- [X] Returns `{ isInstallable, install, outcome }`
- [X] Registers beforeinstallprompt listener in useEffect
- [X] `install()` function calls `prompt.prompt()`
- [X] `install()` waits for user choice
- [X] Returns outcome ('accepted' or 'dismissed')
- [X] Cleans up event listener on unmount

**Implementation Notes**:
- Used by InstallPrompt component
- Can be reused in other components
- Store prompt in ref to prevent re-renders

**Files to Modify/Create**:
- `src/hooks/useInstallPrompt.js` (create)

---

### Task 2.5.3: Create useNetworkStatus Hook

**Description**: React hook for online/offline status

**Dependencies**: None

**Complexity**: Low
- Navigator onLine API, event listeners

**Test Requirements** (TDD):
- Unit tests: Test hook returns correct initial status
- Unit tests: Test hook updates on online/offline events
- Unit tests: Test cleanup on unmount

**Acceptance Criteria**:
- [X] `useNetworkStatus()` hook implemented
- [X] Returns `{ isOnline }` boolean
- [X] Checks `navigator.onLine` on mount
- [X] Registers `online` and `offline` event listeners
- [X] Updates state on network change
- [X] Cleans up listeners on unmount

**Implementation Notes**:
- Used by OfflineIndicator and sync components
- Simple wrapper around navigator.onLine

**Files to Modify/Create**:
- `src/hooks/useNetworkStatus.js` (create)

---

### Task 2.5.4: Create usePushNotification Hook

**Description**: React hook for push notification subscription state

**Dependencies**: 
- Task 2.4.2 (subscribeToPush function)
- Task 2.4.3 (unsubscribeFromPush function)

**Complexity**: Medium
- Push API, state management, async operations

**Test Requirements** (TDD):
- Unit tests: Test hook returns correct permission state
- Unit tests: Test subscribe() function calls subscribeToPush
- Unit tests: Test unsubscribe() function calls unsubscribeFromPush
- Integration tests: Test with real Push API

**Acceptance Criteria**:
- [X] `usePushNotification()` hook implemented
- [X] Returns `{ permission, isSubscribed, subscribe, unsubscribe, loading }`
- [X] Checks `Notification.permission` on mount
- [X] Checks Push Manager subscription status on mount
- [X] `subscribe()` requests permission then subscribes
- [X] `unsubscribe()` removes subscription
- [X] Updates loading state during operations
- [X] Re-fetches state after subscribe/unsubscribe

**Implementation Notes**:
- Used by NotificationPermissionPrompt
- Can be used in settings page

**Files to Modify/Create**:
- `src/hooks/usePushNotification.js` (create)

---

### Task 2.5.5: Update UpdateBanner with Sync Status

**Description**: Enhance UpdateBanner to also show sync status

**Dependencies**: 
- Task 2.1.6 (UpdateBanner component)
- Task 2.3.5 (useSyncQueue hook)

**Complexity**: Low
- Component enhancement

**Test Requirements** (TDD):
- Unit tests: Test banner shows sync status when syncing
- Unit tests: Test banner shows update and sync independently

**Acceptance Criteria**:
- [X] UpdateBanner imports useSyncQueue hook
- [X] Shows sync status when syncing (e.g., "Syncing 3 entries...")
- [X] Shows update status when sw-update-available
- [X] Can show both statuses simultaneously
- [X] Styled to differentiate sync vs update
- [X] Dismissible (user can hide temporarily)

**Implementation Notes**:
- Combine update detection with sync status
- Different visual treatment for each status
- Consider toast notifications instead of banner

**Files to Modify/Create**:
- `src/components/molecules/UpdateBanner.jsx` (modify)

---

### Task 2.5.6: Update OfflineIndicator with Queue Count

**Description**: Show number of pending entries in offline indicator

**Dependencies**: 
- Task 2.1.7 (OfflineIndicator component)
- Task 2.3.5 (useSyncQueue hook)

**Complexity**: Low
- Component enhancement

**Test Requirements** (TDD):
- Unit tests: Test indicator shows queue count when offline
- Unit tests: Test indicator updates when queue changes

**Acceptance Criteria**:
- [X] OfflineIndicator imports useSyncQueue hook
- [X] Shows "Offline" badge when `!isOnline`
- [X] Shows queue count: "Offline (3 pending)"
- [X] Updates count when queue changes
- [X] Optionally shows "Syncing..." when sync in progress (FR-018)
- [X] Shows loading state when fetching fresh data while displaying cached content (FR-018)
- [X] Styled with Tailwind (badge in corner)

**Implementation Notes**:
- Helpful for user to see pending sync count
- Badge could be clickable to trigger manual sync

**Files to Modify/Create**:
- `src/components/atoms/OfflineIndicator.jsx` (modify)

---

## Phase 2.6: Services & Utilities

**Priority**: Medium (Supporting infrastructure)  
**Estimated Tasks**: 8  
**Estimated Duration**: 2-3 days

### Task 2.6.1: Create Sync Service

**Description**: High-level sync orchestration service

**Dependencies**: 
- Task 2.3.1 (processSyncQueue function)

**Complexity**: Medium
- Service layer abstraction

**Test Requirements** (TDD):
- Unit tests: Test syncService exposes correct methods
- Integration tests: Test service integrates with IndexedDB

**Acceptance Criteria**:
- [X] `syncService` module created
- [X] Exports: `sync()`, `getQueueStatus()`, `clearQueue()`
- [X] `sync()` wraps processSyncQueue()
- [X] `getQueueStatus()` returns pending/failed counts
- [X] `clearQueue()` removes all entries (admin function)
- [X] Functions throw descriptive errors

**Implementation Notes**:
- Abstraction layer over syncQueue functions
- Used by UI components and hooks
- Consider adding retry single entry function

**Files to Modify/Create**:
- `src/lib/services/syncService.js` (create)

---

### Task 2.6.2: Create Notification Service

**Description**: High-level notification management service

**Dependencies**: 
- Task 2.4.2 (subscribeToPush)
- Task 2.4.3 (unsubscribeFromPush)

**Complexity**: Medium
- Service layer abstraction

**Test Requirements** (TDD):
- Unit tests: Test notificationService exposes correct methods
- Integration tests: Test service integrates with Push API

**Acceptance Criteria**:
- [X] `notificationService` module created
- [X] Exports: `subscribe()`, `unsubscribe()`, `getStatus()`, `testNotification()`
- [X] `subscribe()` wraps subscribeToPush with preferences
- [X] `unsubscribe()` wraps unsubscribeFromPush
- [X] `getStatus()` returns permission and subscription state
- [X] `testNotification()` sends test push
- [X] Functions handle errors gracefully

**Implementation Notes**:
- Abstraction layer over push functions
- testNotification() calls POST /api/pwa/send-notification

**Files to Modify/Create**:
- `src/lib/services/notificationService.js` (create)

---

### Task 2.6.3: Create Cache Service

**Description**: Service for cache management and inspection

**Dependencies**: 
- Task 2.1.1 (service worker registered)

**Complexity**: Medium
- Cache Storage API operations

**Test Requirements** (TDD):
- Unit tests: Test cacheService methods return correct data
- Integration tests: Test cache clearing

**Acceptance Criteria**:
- [X] `cacheService` module created
- [X] Exports: `getCacheSize()`, `clearCaches()`, `getCacheKeys()`
- [X] `getCacheSize()` estimates total cache size
- [X] `clearCaches()` deletes all caches
- [X] `getCacheKeys()` lists all cache names
- [X] Functions check if caches API available

**Implementation Notes**:
- Used in settings/admin page
- Cache size estimation (not exact)
- Send CLEAR_CACHE message to service worker

**Files to Modify/Create**:
- `src/lib/services/cacheService.js` (create)

---

### Task 2.6.4: Create Network Status Utility

**Description**: Utility functions for network detection

**Dependencies**: None

**Complexity**: Low
- Navigator API wrapper

**Test Requirements** (TDD):
- Unit tests: Test isOnline() returns navigator.onLine
- Unit tests: Test waitForOnline() resolves when online

**Acceptance Criteria**:
- [X] `networkStatus` utility module created
- [X] Exports: `isOnline()`, `waitForOnline()`, `getConnectionType()`
- [X] `isOnline()` returns boolean
- [X] `waitForOnline()` returns Promise resolving when online
- [X] `getConnectionType()` uses Network Information API if available
- [X] Functions work server-side (return safe defaults)

**Implementation Notes**:
- Simple utilities for network checks
- waitForOnline() useful for "wait until online then sync"
- Network Information API limited browser support

**Files to Modify/Create**:
- `src/lib/utils/networkStatus.js` (create)

---

### Task 2.6.5: Create Error Logging Utility

**Description**: Client-side error logging with server reporting

**Dependencies**: None

**Complexity**: Medium
- Error capture, server endpoint

**Test Requirements** (TDD):
- Unit tests: Test logError() formats error correctly
- Unit tests: Test critical errors sent to server
- Integration tests: Test server endpoint receives errors

**Acceptance Criteria**:
- [X] `errorLogger` utility module created
- [X] Exports: `logError(type, message, context)`, `logCriticalError()`
- [X] Console logs in development
- [X] Critical errors POST to `/api/pwa/log-error`
- [X] Error payload includes timestamp, user agent, URL
- [X] Rate limiting (max 10 errors per minute)
- [X] Errors queued if offline

**Implementation Notes**:
- See research.md observability section
- Critical errors = sync failures, quota exceeded
- Consider integrating Sentry in future

**Files to Modify/Create**:
- `src/lib/utils/errorLogger.js` (create)
- `src/app/api/pwa/log-error/route.js` (create endpoint)

---

### Task 2.6.6: Create Cache Strategy Helpers

**Description**: Helper functions for custom Workbox strategies

**Dependencies**: None

**Complexity**: Low
- Workbox configuration helpers

**Test Requirements** (TDD):
- Unit tests: Test helpers return correct Workbox config

**Acceptance Criteria**:
- [X] `cacheStrategies` utility module created
- [X] Exports: `getCacheFirstConfig()`, `getNetworkFirstConfig()`, `getStaleWhileRevalidateConfig()`
- [X] Functions return Workbox strategy configurations
- [X] Includes cache names, expiration, timeouts
- [X] Used in next.config.mjs runtime caching

**Implementation Notes**:
- DRY principle for Workbox config
- Makes next.config.mjs cleaner
- See research.md caching strategies

**Files to Modify/Create**:
- `src/lib/pwa/cacheStrategies.js` (create)

---

### Task 2.6.7: Create Date/Time Utilities for Notifications

**Description**: Helper functions for time calculations in scheduler

**Dependencies**: None

**Complexity**: Low
- Date/time arithmetic

**Test Requirements** (TDD):
- Unit tests: Test timeToMinutes() converts HH:MM correctly
- Unit tests: Test minutesToTime() formats correctly
- Unit tests: Test isTimeWithinWindow() calculates correctly

**Acceptance Criteria**:
- [X] Time utility functions created (already existed)
- [X] `timeToMinutes(time)` - HH:MM to minutes since midnight
- [X] `minutesToTime(minutes)` - minutes to HH:MM
- [X] `isTimeWithinWindow(time1, time2, windowMinutes)` - checks if times within window
- [X] `addMinutes(time, minutes)` - adds minutes to time
- [X] Functions handle edge cases (midnight wrap, negative)

**Implementation Notes**:
- Used by notificationScheduler
- Simplify time math in 7-day average calculation

**Files to Modify/Create**:
- `src/lib/utils/timeUtils.js` (create)

---

### Task 2.6.8: Create Test Notification Endpoint

**Description**: Admin endpoint to send test push notification

**Dependencies**: 
- Task 2.4.9 (sendPushNotification function)

**Complexity**: Low
- Simple API endpoint

**Test Requirements** (TDD):
- Integration tests: Test endpoint requires auth
- Integration tests: Test notification sent

**Acceptance Criteria**:
- [X] POST /api/pwa/send-notification endpoint created
- [X] Requires NextAuth session
- [X] Gets user's subscription from database
- [X] Sends test notification with fixed payload
- [X] Returns HTTP 200 on success
- [X] Returns HTTP 404 if no subscription
- [X] Logs notification send

**Implementation Notes**:
- For testing only (consider admin-only in production)
- See push-notification.md test endpoint section
- Useful for debugging push issues
- Note: This endpoint is actually created in Task 2.4.6 (not 2.4.5)

**Files to Modify/Create**:
- `src/app/api/pwa/send-notification/route.js` (verify implementation from Task 2.4.6)

---

## Phase 2.7: Integration & E2E Testing

**Priority**: High (Quality assurance)  
**Estimated Tasks**: 11  
**Estimated Duration**: 3-4 days

### Task 2.7.1: E2E Test - PWA Install Flow

**Description**: End-to-end test for complete install flow

**Dependencies**: 
- Task 2.5.1 (InstallPrompt component)

**Complexity**: High
- E2E with device simulation

**Test Requirements** (TDD):
- E2E tests: Test install prompt appears after 30s
- E2E tests: Test clicking install adds to home screen
- E2E tests: Test app opens in standalone mode

**Acceptance Criteria**:
- [ ] Test loads homepage on mobile viewport
- [ ] Test waits 30 seconds for install prompt OR simulates 2+ page views (FR-006)
- [ ] Test clicks install button
- [ ] Test verifies beforeinstallprompt handled
- [ ] Test simulates "Add to Home Screen"
- [ ] Test verifies manifest.json loaded
- [ ] Test runs on Chrome/Android simulation
- [ ] Test measures and validates install completes in under 30 seconds (SC-001)

**Implementation Notes**:
- Use Playwright device emulation
- May require manual testing on real device
- See quickstart.md testing procedures
- Add performance timing assertion for SC-001 (install time <30s)

**Files to Modify/Create**:
- `tests/e2e/pwa-install.spec.js` (enhance if exists from earlier task)

---

### Task 2.7.2: E2E Test - Offline Entry Creation & Sync

**Description**: Test complete offline workflow

**Dependencies**: 
- Task 2.3.1 (sync queue)
- Task 2.2.2 (offline entries)

**Complexity**: High
- Complex multi-step flow

**Test Requirements** (TDD):
- E2E tests: Test create entry while offline
- E2E tests: Test entry stored in IndexedDB
- E2E tests: Test sync when online
- E2E tests: Test entry appears in MongoDB

**Acceptance Criteria**:
- [ ] Test creates user entry while online
- [ ] Test goes offline (setOfflineMode)
- [ ] Test creates second entry
- [ ] Test verifies entry in IndexedDB offlineEntries
- [ ] Test goes back online
- [ ] Test waits for sync to complete
- [ ] Test verifies entry synced to server
- [ ] Test verifies entry removed from queue

**Implementation Notes**:
- Most critical E2E test for PWA
- Tests core offline functionality
- See sync-strategy.md testing section

**Files to Modify/Create**:
- `tests/e2e/offline-sync.spec.js` (create)

---

### Task 2.7.3: E2E Test - Push Notification Flow

**Description**: Test notification subscription and delivery

**Dependencies**: 
- Task 2.4.2 (push subscription)
- Task 2.4.10 (push event handler)

**Complexity**: High
- Push notification testing requires special setup

**Test Requirements** (TDD):
- E2E tests: Test grant notification permission
- E2E tests: Test subscribe to push
- E2E tests: Test receive notification
- E2E tests: Test click notification opens app

**Acceptance Criteria**:
- [ ] Test grants notification permission
- [ ] Test subscribes to push notifications
- [ ] Test verifies subscription in database
- [ ] Test sends test notification
- [ ] Test verifies notification displayed
- [ ] Test clicks notification
- [ ] Test verifies app opened/focused

**Implementation Notes**:
- Playwright supports notification testing
- May require manual testing on real device
- See push-notification.md testing section

**Files to Modify/Create**:
- `tests/e2e/push-notifications.spec.js` (create)

---

### Task 2.7.4: E2E Test - Service Worker Update Flow

**Description**: Test service worker update and reload

**Dependencies**: 
- Task 2.1.6 (UpdateBanner component)

**Complexity**: Medium
- Simulate SW update

**Test Requirements** (TDD):
- E2E tests: Test new SW version detected
- E2E tests: Test update banner appears
- E2E tests: Test reload button updates SW

**Acceptance Criteria**:
- [ ] Test loads app with SW v1
- [ ] Test deploys SW v2 (mock or real build)
- [ ] Test detects update (sw-update-available event)
- [ ] Test UpdateBanner appears
- [ ] Test clicks Reload button
- [ ] Test verifies SW v2 active
- [ ] Test page reloads successfully

**Implementation Notes**:
- Complex to test - may require manual verification
- Use Playwright's service worker APIs
- See service-worker.md update flow

**Files to Modify/Create**:
- `tests/e2e/service-worker-update.spec.js` (create)

---

### Task 2.7.5: Integration Test - Offline Entry → Sync → Conflict Resolution

**Description**: Test conflict resolution when multiple entries for same date

**Dependencies**: 
- Task 2.3.9 (server-side conflict resolution)

**Complexity**: High
- Multi-client scenario simulation

**Test Requirements** (TDD):
- Integration tests: Test client offline, creates entry for date X
- Integration tests: Test server has newer entry for date X
- Integration tests: Test sync attempts
- Integration tests: Test server wins (timestamp comparison)

**Acceptance Criteria**:
- [ ] Test creates server entry with timestamp T1
- [ ] Test creates offline entry with timestamp T0 (older)
- [ ] Test syncs offline entry
- [ ] Test verifies X-Conflict-Resolved header
- [ ] Test verifies server entry unchanged
- [ ] Test verifies offline entry removed from queue
- [ ] Test verifies client caches server version

**Implementation Notes**:
- Critical test for data integrity
- Tests last-write-wins algorithm
- See sync-strategy.md conflict resolution

**Files to Modify/Create**:
- `tests/integration/pwa/conflict-resolution.test.js` (create)

---

### Task 2.7.6: Integration Test - IndexedDB Quota Exceeded

**Description**: Test quota exceeded handling and eviction

**Dependencies**: 
- Task 2.2.6 (quota error handling)

**Complexity**: High
- Simulate storage limits

**Test Requirements** (TDD):
- Integration tests: Test fill IndexedDB near quota
- Integration tests: Test QuotaExceededError triggered
- Integration tests: Test evictOldEntries called
- Integration tests: Test operation retried successfully

**Acceptance Criteria**:
- [ ] Test fills cachedEntries with large dataset
- [ ] Test attempts to add entry beyond quota
- [ ] Test catches QuotaExceededError
- [ ] Test eviction removes old entries
- [ ] Test retry succeeds after eviction
- [ ] Test throws if no entries to evict

**Implementation Notes**:
- Difficult to test - may need manual verification
- Browser quota typically large (GBs)
- Mock QuotaExceededError for unit tests

**Files to Modify/Create**:
- `tests/integration/pwa/quota-exceeded.test.js` (create)

---

### Task 2.7.7: Integration Test - Background Sync API

**Description**: Test Background Sync registration and execution

**Dependencies**: 
- Task 2.3.7 (Background Sync implementation)

**Complexity**: Medium
- Service worker sync event testing

**Test Requirements** (TDD):
- Integration tests: Test sync registration
- Integration tests: Test sync event fires
- Integration tests: Test processSyncQueue called

**Acceptance Criteria**:
- [ ] Test feature detection for Background Sync
- [ ] Test registers 'sync-entries' tag
- [ ] Test sync event fires in service worker
- [ ] Test queue processed on sync event
- [ ] Test entries synced successfully

**Implementation Notes**:
- Limited browser support (Chrome/Edge only)
- Fallback to online event tested separately
- See sync-strategy.md Background Sync section

**Files to Modify/Create**:
- `tests/integration/pwa/background-sync.test.js` (create)

---

### Task 2.7.8: Integration Test - 7-Day Average Calculation

**Description**: Test notification timing calculation

**Dependencies**: 
- Task 2.4.7 (calculateTypicalMealTime)

**Complexity**: Medium
- Date/time arithmetic testing

**Test Requirements** (TDD):
- Integration tests: Test with 7 entries
- Integration tests: Test with < 7 entries
- Integration tests: Test with no entries
- Integration tests: Test edge cases (early morning meals)

**Acceptance Criteria**:
- [ ] Test creates 7 entries with varying meal times
- [ ] Test calculates correct average
- [ ] Test subtracts 60 minutes for reminder
- [ ] Test returns HH:MM format
- [ ] Test handles midnight wrap (e.g., 00:30 meal)
- [ ] Test returns null when no data

**Implementation Notes**:
- Important for notification accuracy
- See push-notification.md calculation section
- Test with real Entry model and MongoDB

**Files to Modify/Create**:
- `tests/integration/pwa/meal-time-calculation.test.js` (create)

---

### Task 2.7.9: Test PWA Feature Detection and Fallback

**Description**: Verify graceful degradation when PWA features not supported (FR-016)

**Dependencies**: 
- Task 2.1.1 (service worker registration)
- Task 2.5.1 (install prompt)

**Complexity**: Medium
- Cross-browser compatibility testing

**Test Requirements** (TDD):
- Integration tests: Test behavior when service workers not supported
- Integration tests: Test behavior when push notifications not supported
- Integration tests: Test behavior when install not available
- E2E tests: Test fallback UI messages displayed

**Acceptance Criteria**:
- [ ] Test detects when 'serviceWorker' not in navigator
- [ ] Test verifies app still functions without SW (no offline mode)
- [ ] Test detects when Notification API unavailable
- [ ] Test shows appropriate message: "Install not available on this browser"
- [ ] Test shows message: "Notifications not supported on this device"
- [ ] Test verifies core features work without PWA enhancements
- [ ] Test graceful degradation on older browsers (IE11 compatibility not required)

**Implementation Notes**:
- Feature detection should happen before attempting to use PWA features
- Provide helpful messaging rather than silent failures
- See FR-016 for graceful degradation requirement
- Test on browsers with disabled service workers

**Files to Modify/Create**:
- `tests/integration/pwa/feature-detection.test.js` (create)
- `src/lib/utils/pwaFeatureDetection.js` (create helper utility)

---

### Task 2.7.10: Run Lighthouse PWA Audit

**Description**: Verify PWA score meets 90+ target

**Dependencies**: All Phase 2.0-2.6 tasks

**Complexity**: Medium
- Automated audit with Lighthouse

**Test Requirements** (TDD):
- E2E tests: Run Lighthouse audit
- E2E tests: Verify PWA score >= 90
- E2E tests: Verify all PWA criteria passed

**Acceptance Criteria**:
- [ ] Lighthouse CI integrated
- [ ] Audit runs on production build
- [ ] PWA score >= 90 (SC-005)
- [ ] All installability checks passed
- [ ] Service worker check passed
- [ ] Manifest check passed
- [ ] HTTPS check passed
- [ ] Audit results saved for comparison

**Implementation Notes**:
- Use @lhci/cli for CI integration
- Run on Vercel preview deployments
- See quickstart.md testing checklist

**Files to Modify/Create**:
- `lighthouserc.js` (create Lighthouse CI config)
- `.github/workflows/lighthouse.yml` (optional CI workflow)

---

### Task 2.7.11: Test on Real Devices (iOS & Android)

**Description**: Manual testing on actual mobile devices

**Dependencies**: All Phase 2.0-2.6 tasks

**Complexity**: High
- Manual testing process

**Test Requirements** (TDD):
- Manual tests: Install on iOS Safari 16.4+
- Manual tests: Install on Android Chrome 90+
- Manual tests: Test offline functionality
- Manual tests: Test push notifications

**Acceptance Criteria**:
- [ ] Tested on iOS Safari 16.4+ (iPhone)
- [ ] Tested on Android Chrome 90+ (Android device)
- [ ] Install prompt appears on both platforms
- [ ] App installs to home screen successfully
- [ ] Offline mode works (create entry, sync when online)
- [ ] Push notifications received on Android
- [ ] Push notifications received on iOS 16.4+
- [ ] App icon displays correctly (maskable icons)
- [ ] Theme color applied correctly
- [ ] No console errors on either platform

**Implementation Notes**:
- Critical for real-world validation
- Use BrowserStack for device testing if no physical devices
- See quickstart.md section 8 for testing procedures
- Document any platform-specific issues

**Files to Modify/Create**:
- `docs/DEVICE-TESTING.md` (create testing checklist/results)

---

## Summary

**Total Tasks**: 68 atomic tasks across 8 phases

**Phase Summary**:
- **Phase 2.0** (Foundation): 7 tasks - VAPID keys, icons, manifest, next-pwa config
- **Phase 2.1** (Service Worker): 9 tasks - SW registration, caching strategies, UI components
- **Phase 2.2** (IndexedDB): 8 tasks - Database schema, CRUD operations, quota handling
- **Phase 2.3** (Offline Sync): 10 tasks - Sync queue, retry logic, conflict resolution
- **Phase 2.4** (Push Notifications): 12 tasks - Subscription, scheduling, 7-day average, cron
- **Phase 2.5** (UI Components): 6 tasks - Install prompt, indicators, hooks
- **Phase 2.6** (Services): 8 tasks - Service layer, utilities, error logging
- **Phase 2.7** (Testing): 11 tasks - E2E tests, integration tests, feature detection, Lighthouse audit, device testing

**Critical Path** (must be done in order):
1. Phase 2.0 (Foundation) - All other phases depend on this
2. Phase 2.1 (Service Worker) - Required for offline functionality
3. Phase 2.2 (IndexedDB) - Required for offline storage
4. Phase 2.3 (Offline Sync) - Core PWA feature
5. Phase 2.4, 2.5, 2.6 can be done in parallel
6. Phase 2.7 (Testing) - Final validation

**Estimated Total Duration**: 15-20 days for full implementation

**Next Steps**:
1. Review tasks.md with team
2. Begin Phase 2.0 (Foundation Setup)
3. Follow TDD approach: Write tests first, then implement
4. Deploy to Vercel preview for testing
5. Validate on real devices before production

**Constitution Compliance**:
- ✅ All tasks follow TDD (test-first requirement)
- ✅ Components follow atomic design
- ✅ Mobile-first approach maintained
- ✅ Performance targets specified (Lighthouse 90+)
- ✅ Security considered (VAPID keys, HTTPS, auth)

---

*Generated on October 24, 2025*  
*Ready for implementation via `/speckit.implement` or manual execution*

