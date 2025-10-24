# Implementation Plan: Progressive Web App (PWA) Conversion

**Branch**: `010-pwa-conversion` | **Date**: October 24, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-pwa-conversion/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Convert the existing Next.js 15.5.6 fasting tracker web application into a Progressive Web App (PWA) to provide native app-like functionality including home screen installation, offline data access, push notifications for fasting reminders, and fast repeat-visit loading. The implementation will leverage Next.js built-in PWA capabilities, service workers for caching and offline support, IndexedDB for client-side data storage, and Web Push API for notifications. Core features prioritized: installability (P1), offline mode with sync (P1), push notifications (P2), and performance caching (P2).

## Technical Context

**Language/Version**: JavaScript (ES6+) / Next.js 15.5.6 (App Router)  
**Primary Dependencies**: 
- Next.js 15.5.6 (React framework with App Router - existing)
- React 19.1.0 (existing)
- NextAuth.js v5.0 (Auth.js - existing, must work with service workers)
- MongoDB 5.5 with Mongoose 8.19.1 (existing)
- Tailwind CSS v4.1.14 (existing)
- Workbox (Google's service worker library - NEW, for PWA caching strategies)
- idb (IndexedDB wrapper - NEW, for offline data storage)
- web-push (Node.js library for Web Push - NEW, for notification server)

**Storage**: 
- Server: MongoDB (existing - entries, users, settings)
- Client: IndexedDB (NEW - offline entries queue, cached data, sync status)
- Client: Cache Storage API (NEW - static assets, API responses, app shell)

**Testing**: Jest (unit + integration - existing), React Testing Library (components - existing), Playwright (E2E - existing), Service Worker Testing (NEW - with Workbox testing utilities)

**Target Platform**: Web (PWA) - iOS Safari 16.4+, Android Chrome 90+, Desktop Chrome/Edge/Firefox (Lighthouse PWA auditable)

**Project Type**: Web application (single Next.js project with PWA enhancements)

**Performance Goals**: 
- Initial load: <3s on 3G
- Repeat visit: <1s (cached app shell)
- Service worker registration: <500ms
- Offline-to-online sync: <5s after connectivity returns
- Push notification delivery: 95%+ success rate
- Lighthouse PWA score: 90+

**Constraints**: 
- Must maintain existing authentication flow (NextAuth.js with Edge Runtime middleware)
- Service workers run in separate thread (cannot access DOM, must use postMessage)
- IndexedDB quota varies by browser (typically 50% of available disk, ~10GB mobile, ~60GB desktop)
- Push notifications require user permission (iOS 16.4+ for web push support)
- HTTPS required for service workers (already deployed on Vercel)
- Offline sync must use last-write-wins strategy (clarified)
- Cache eviction at 90 days (clarified)
- Exponential backoff retry: 5s, 10s, 20s, hourly (clarified)

**Scale/Scope**: 
- Expected users: 100-1000 initially
- Cached entries per user: Up to 90 days (~90 entries)
- IndexedDB storage per user: ~500KB-1MB (entries + metadata)
- Service worker cache: ~5-10MB (app shell, static assets, API responses)
- Push notification subscribers: Target 60% opt-in rate

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Next.js Best Practices
- **Status**: PASS
- **Evidence**: Follows App Router conventions, uses Server Components for data fetching, service worker registered via Next.js public directory pattern
- **PWA-Specific**: Web app manifest served as static JSON from `/public/manifest.json`, service worker from `/public/sw.js`

### ✅ Mobile-First Responsive Design
- **Status**: PASS
- **Evidence**: Existing app is mobile-first with Tailwind CSS, PWA enhances mobile experience with install prompts and offline capability
- **PWA-Specific**: Install prompts optimized for mobile (30s engagement threshold), push notifications prioritized for mobile use cases

### ✅ Test-Driven Development (NON-NEGOTIABLE)
- **Status**: PASS (with plan)
- **Evidence**: 
  - Unit tests: Service worker caching logic, sync queue management, notification scheduling
  - Integration tests: IndexedDB operations, offline sync workflows, push subscription management
  - E2E tests: Install flow, offline entry creation + sync, notification receipt + interaction
  - Service worker testing: Workbox provides testing utilities for cache strategies
- **Coverage Target**: 80% minimum (constitution requirement)

### ✅ Component Architecture
- **Status**: PASS
- **Evidence**: Existing atomic design structure maintained
- **PWA-Specific**: New components:
  - `InstallPrompt` (molecule) - Custom install button
  - `OfflineIndicator` (atom) - Network status badge
  - `UpdateBanner` (molecule) - Service worker update prompt
  - `NotificationPermissionPrompt` (molecule) - Permission request UI

### ✅ User Privacy & Data Security
- **Status**: PASS
- **Evidence**: 
  - Push notification encryption (Web Push Protocol with VAPID keys)
  - IndexedDB data remains client-side (encrypted at device level)
  - No tracking of offline behavior
  - Clear permission requests (FR-009: after first entry, not on first visit)
- **PWA-Specific**: Notification preferences stored encrypted server-side, push subscriptions associated with user account

### ✅ Performance & Accessibility
- **Status**: PASS (with PWA improvements)
- **Evidence**: 
  - Lighthouse PWA score target: 90+ (SC-006)
  - Offline capability improves reliability score
  - Install prompts are keyboard accessible
  - Service worker improves repeat-visit performance (<1s load time)
- **PWA-Specific**: Splash screens, theme colors, and manifest improve perceived performance and native feel

### 🟡 No Violations Requiring Justification
- **Status**: All gates passed
- **Action**: Proceed to Phase 0 (Research)

## Project Structure

### Documentation (this feature)

```
specs/010-pwa-conversion/
├── spec.md              # Feature specification (with clarifications)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (service worker patterns, IndexedDB, Web Push)
├── data-model.md        # Phase 1 output (IndexedDB schema, sync queue, cache structure)
├── quickstart.md        # Phase 1 output (PWA setup guide, testing offline)
├── contracts/           # Phase 1 output (service worker API, sync contracts)
│   ├── service-worker.md
│   ├── indexeddb-schema.md
│   ├── sync-strategy.md
│   └── push-notification.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Web application (Next.js App Router) with PWA enhancements. Following existing single-project structure, adding PWA-specific files to established directories.

```
src/
├── app/                              # Next.js App Router (existing)
│   ├── api/                          # API routes (existing)
│   │   ├── entries/                  # Entry CRUD (existing)
│   │   ├── settings/                 # Settings (existing)
│   │   ├── admin/                    # Admin routes (existing)
│   │   ├── pwa/                      # NEW: PWA-specific endpoints
│   │   │   ├── subscribe/
│   │   │   │   └── route.js          # POST /api/pwa/subscribe - Save push subscription
│   │   │   ├── unsubscribe/
│   │   │   │   └── route.js          # POST /api/pwa/unsubscribe - Remove subscription
│   │   │   ├── sync/
│   │   │   │   └── route.js          # POST /api/pwa/sync - Background sync handler
│   │   │   └── send-notification/
│   │   │       └── route.js          # POST /api/pwa/send-notification - Trigger push (internal/cron)
│   │   └── auth/                     # Authentication (existing, ensure service worker compatible)
│   ├── entries/                      # Entries pages (existing)
│   ├── settings/                     # Settings pages (existing)
│   ├── dashboard/                    # Admin dashboard (existing)
│   ├── layout.js                     # Root layout (existing, add PWA meta tags)
│   └── page.js                       # Homepage (existing)
│
├── components/                       # React components (existing - atomic design)
│   ├── atoms/
│   │   └── OfflineIndicator.js       # NEW: Network status badge
│   ├── molecules/
│   │   ├── InstallPrompt.js          # NEW: Custom PWA install button
│   │   ├── UpdateBanner.js           # NEW: Service worker update notification
│   │   └── NotificationPermissionPrompt.js  # NEW: Push permission request
│   └── organisms/                    # (existing entry forms, lists, etc.)
│
├── lib/                              # Utilities and business logic (existing)
│   ├── db.js                         # MongoDB connection (existing)
│   ├── auth.js                       # NextAuth config (existing, verify SW compatibility)
│   ├── models/                       # Mongoose schemas (existing)
│   │   ├── Entry.js                  # Entry model (existing)
│   │   ├── User.js                   # User model (existing)
│   │   └── PushSubscription.js       # NEW: Push subscription storage
│   ├── services/                     # Business logic (existing pattern)
│   │   ├── syncService.js            # NEW: Offline sync coordination
│   │   ├── notificationService.js    # NEW: Push notification scheduling
│   │   └── cacheService.js           # NEW: Cache management utilities
│   ├── pwa/                          # NEW: PWA-specific utilities
│   │   ├── indexeddb.js              # IndexedDB wrapper (idb library)
│   │   ├── syncQueue.js              # Sync queue management
│   │   ├── cacheStrategies.js        # Workbox cache strategy helpers
│   │   └── notificationScheduler.js  # Calculate reminder times
│   └── utils/                        # Helper functions (existing)
│       ├── dateFormatter.js          # (existing)
│       └── networkStatus.js          # NEW: Online/offline detection
│
├── hooks/                            # React hooks (existing)
│   ├── useNetworkStatus.js           # NEW: Online/offline status hook
│   ├── useInstallPrompt.js           # NEW: PWA install event hook
│   └── usePushNotification.js        # NEW: Push permission & subscription hook
│
├── middleware.js                     # Route protection (existing, ensure SW compatible)
│
└── styles/                           # Global styles (existing)

public/                               # Static assets (existing)
├── manifest.json                     # NEW: Web app manifest (PWA config)
├── sw.js                             # NEW: Service worker (generated by Workbox)
├── icons/                            # NEW: PWA app icons
│   ├── icon-192x192.png              # Required for manifest
│   ├── icon-512x512.png              # Required for manifest
│   ├── icon-maskable-192x192.png     # Maskable icons for adaptive display
│   └── icon-maskable-512x512.png
├── offline.html                      # NEW: Fallback page when fully offline
└── (existing static assets)

tests/                                # Tests (existing structure)
├── unit/
│   ├── services/
│   │   ├── syncService.test.js       # NEW: Sync logic tests
│   │   └── notificationService.test.js  # NEW: Notification scheduling tests
│   └── pwa/
│       ├── syncQueue.test.js         # NEW: Sync queue unit tests
│       └── cacheStrategies.test.js   # NEW: Cache strategy tests
├── integration/
│   ├── pwa/
│   │   ├── offline-sync.test.js      # NEW: Offline entry creation + sync
│   │   ├── indexeddb.test.js         # NEW: IndexedDB operations
│   │   └── push-subscription.test.js # NEW: Push subscription flow
│   └── api/
│       └── pwa-endpoints.test.js     # NEW: PWA API route tests
└── e2e/
    ├── pwa-install.spec.js           # NEW: Install flow E2E
    ├── offline-mode.spec.js          # NEW: Offline functionality E2E
    └── push-notifications.spec.js    # NEW: Notification flow E2E

scripts/                              # Utility scripts (existing)
└── generate-icons.js                 # NEW: Generate PWA icons from source

next.config.mjs                       # Next.js config (existing, add Workbox plugin)
package.json                          # Dependencies (existing, add Workbox, idb, web-push)
```

**Key Structural Notes**:
- **Minimal disruption**: PWA features added to existing structure, no architectural changes
- **Service worker**: Registered via `/public/sw.js`, generated by Workbox during build
- **IndexedDB**: Wrapped with `idb` library for Promise-based API
- **API routes**: New `/api/pwa/*` namespace for PWA-specific endpoints
- **Components**: New PWA UI components follow atomic design (atoms/molecules)
- **Testing**: PWA tests in separate subdirectories under existing `tests/` structure

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: No violations - all constitution gates passed. No complexity justification required.

---

## Phase 0: Research

**Status**: Complete ✅

Comprehensive research conducted and documented in `research.md`. Key findings:

1. **Next.js PWA Integration**: Use `next-pwa` library with Workbox 7+ for service worker generation
2. **Caching Strategy**: Hybrid approach - Cache-First for static assets, Network-First with cache fallback for API
3. **IndexedDB**: Use `idb` Promise wrapper with 4 stores (offline entries, cached entries, sync metadata, push metadata)
4. **Offline Sync**: Exponential backoff retry (5s, 10s, 20s, hourly) with last-write-wins conflict resolution
5. **Push Notifications**: Web Push Protocol with VAPID keys, `web-push` Node.js library
6. **Manifest**: Comprehensive manifest.json with maskable icons for Android adaptive display
7. **Performance**: Aggressive precaching for app shell, runtime caching for data, cache warming on first load
8. **Observability**: Console logging (dev) + server endpoint for critical errors (prod)

**New Dependencies**:
- `next-pwa` ^5.6.0 - Service worker generation and Next.js integration
- `idb` ^8.0.0 - IndexedDB Promise wrapper
- `web-push` ^3.6.0 - Web Push Protocol implementation
- `sharp` ^0.33.0 (dev) - Icon generation

**Alternatives Evaluated**: Workbox CLI (too manual), custom SW (reinventing wheel), Firebase (unnecessary dependency), LocalStorage (insufficient), PouchDB (overkill)

**See**: `specs/010-pwa-conversion/research.md` for complete research documentation with code examples and references

---

## Phase 1: Design & Contracts

**Status**: Complete ✅

This phase has generated:

### 1. Data Model (`data-model.md`)
Define IndexedDB schema and cache organization:
- **Store: offlineEntries** - Pending sync queue with retry metadata
- **Store: cachedEntries** - Offline viewing cache with 90-day eviction
- **Store: syncMeta** - Sync timestamps and error tracking
- **Store: pushMeta** - Push subscription storage per user
- **Cache Storage** - App shell, API responses, static assets organization
- **Eviction policies** - 90-day age-based eviction for cachedEntries store

### 2. API Contracts (`contracts/` directory)
Document PWA-specific API interfaces and behaviors:

**`service-worker.md`** - Service worker lifecycle and APIs:
- SW registration and update flow
- Cache strategies (Cache-First, Network-First, Stale-While-Revalidate)
- Message passing between client and service worker
- Precaching vs runtime caching decisions

**`indexeddb-schema.md`** - Database structure and operations:
- Schema version management (currently version 1)
- Store definitions with keyPath and indexes
- Transaction patterns (read-only vs readwrite)
- Quota management and error handling

**`sync-strategy.md`** - Offline sync workflow:
- Queue entry structure and status states
- Exponential backoff retry algorithm (5s, 10s, 20s, hourly)
- Last-write-wins conflict resolution based on sync timestamp
- Sync trigger conditions (online event, manual, periodic)

**`push-notification.md`** - Push notification system:
- Subscription endpoint: POST /api/pwa/subscribe
- Notification scheduling based on 7-day meal time average
- Notification payload format (title, body, icon, badge, data)
- Click handling and deep linking

### 3. Quickstart Guide (`quickstart.md`)
PWA setup and testing guide:
- Install dependencies (`npm install next-pwa idb web-push`)
- Generate VAPID keys for push notifications
- Create PWA icons from source image
- Configure `next.config.mjs` with Workbox plugin
- Test locally with offline mode in DevTools
- Verify service worker registration
- Test install prompt on mobile devices
- Deploy to Vercel with HTTPS
- Troubleshooting common issues

### 4. Agent Context Update
Run `update-agent-context.ps1` to add new technologies to AI assistant context:
- Workbox service worker patterns
- idb IndexedDB wrapper API
- web-push Web Push Protocol
- next-pwa configuration

**Completed Artifacts**:
1. ✅ `data-model.md` - IndexedDB schema (4 stores), Cache Storage organization (5 caches), eviction policies, sync queue structure
2. ✅ `contracts/service-worker.md` - SW lifecycle, caching strategies (Cache-First, Network-First, Stale-While-Revalidate), message passing, update flow
3. ✅ `contracts/indexeddb-schema.md` - Database initialization, CRUD operations, transaction patterns, error handling, quota management
4. ✅ `contracts/sync-strategy.md` - Offline sync workflow, exponential backoff (5s, 10s, 20s, 1hr), last-write-wins conflict resolution, retry logic
5. ✅ `contracts/push-notification.md` - Subscription management, 7-day average scheduling, Web Push Protocol with VAPID, notification click handling
6. ✅ `quickstart.md` - Installation guide, VAPID key generation, manifest creation, icon generation, testing procedures, deployment to Vercel, troubleshooting
7. ✅ Agent context updated - Added Workbox, idb, web-push, next-pwa to CLAUDE.md

---

## Phase 2: Implementation (Task Generation)

**Status**: To be generated via `/speckit.tasks` command (separate workflow)

Phase 2 will break down implementation into atomic, testable tasks following TDD approach. Expected task structure:

### Phase 2.0: PWA Foundation Setup
- Install PWA dependencies (next-pwa, idb, web-push, sharp)
- Configure `next.config.mjs` with Workbox plugin
- Generate VAPID keys for push notifications
- Create source icon and generate PWA icon sizes (192, 512, maskable variants)
- Create web app manifest (`manifest.json`)
- Link manifest in `app/layout.tsx`
- Create offline fallback page (`offline.html`)
- Write tests: Manifest validation, icon presence, VAPID key format

### Phase 2.1: Service Worker & Caching
- Implement service worker registration in client layout
- Configure Workbox caching strategies (cache-first, network-first)
- Set up precaching for app shell (HTML, CSS, JS)
- Set up runtime caching for API routes
- Implement offline fallback handling
- Implement cache versioning and cleanup
- Write tests: SW registration, cache hit/miss, offline navigation, cache eviction

### Phase 2.2: IndexedDB & Offline Storage
- Create `lib/pwa/indexeddb.js` database wrapper with idb
- Define schema with 4 stores (offlineEntries, cachedEntries, syncMeta, pushMeta)
- Implement offline entry queueing functions
- Implement cached entries storage with 90-day eviction
- Implement sync metadata tracking
- Implement push subscription storage
- Write tests: Schema creation, CRUD operations, eviction policy, quota exceeded handling

### Phase 2.3: Offline Sync System
- Create `lib/pwa/syncQueue.js` with queue operations
- Implement exponential backoff retry logic (5s, 10s, 20s, hourly)
- Implement last-write-wins conflict resolution
- Create sync service with online/offline detection
- Implement background sync registration (progressive enhancement)
- Create sync status UI indicator
- Write tests: Queue enqueue/dequeue, retry backoff, conflict resolution, sync success/failure

### Phase 2.4: Push Notifications
- Create API route: POST /api/pwa/subscribe (store subscription)
- Create API route: POST /api/pwa/send-notification (send push)
- Create MongoDB model: PushSubscription
- Implement notification scheduler with 7-day average calculation
- Create notification permission request UI
- Implement service worker push event handler
- Implement notification click handler with deep linking
- Write tests: Subscription storage, scheduling algorithm, push delivery, click handling

### Phase 2.5: PWA UI Components
- Create `InstallPrompt` component (molecule) with beforeinstallprompt handling
- Create `OfflineIndicator` component (atom) with network status
- Create `UpdateBanner` component (organism) for SW updates
- Create `NotificationPermissionPrompt` component (molecule)
- Create custom hooks: `useNetworkStatus`, `useInstallPrompt`, `usePushNotification`
- Integrate components into app layout
- Write tests: Component rendering, event handling, hook behavior

### Phase 2.6: Services & Utilities
- Create `services/syncService.js` (sync orchestration)
- Create `services/notificationService.js` (notification scheduling)
- Create `services/cacheService.js` (cache management)
- Create `lib/pwa/cacheStrategies.js` (custom Workbox strategies)
- Create `lib/pwa/notificationScheduler.js` (7-day average calculator)
- Create API route: POST /api/pwa/log-error (error logging endpoint)
- Write tests: Service methods, utility functions, error logging

### Phase 2.7: Integration & E2E Testing
- Write E2E test: PWA install flow (add to home screen)
- Write E2E test: Offline mode (create entry offline, sync when online)
- Write E2E test: Push notifications (subscribe, receive, click)
- Write E2E test: Update flow (new SW version, refresh prompt)
- Write integration test: Offline entry creation → sync → conflict resolution
- Write integration test: Cache warming on first load
- Run Lighthouse PWA audit (verify 90+ score)
- Test on iOS Safari 16.4+ and Android Chrome 90+

### Phase 2.8: Documentation & Deployment
- Update README.md with PWA features section
- Document PWA testing procedures in TESTING.md
- Create screenshots for manifest (desktop and mobile)
- Update environment variables template (VAPID keys)
- Deploy to Vercel with HTTPS
- Test production PWA on real devices
- Monitor error logs for critical issues
- Update quickstart.md with deployment learnings

**Task Generation Process**:
1. Run `/speckit.tasks` command to generate atomic tasks
2. Each task will include:
   - Clear acceptance criteria
   - Test-first requirement (write test before implementation)
   - Dependencies on other tasks
   - Estimated complexity (small/medium/large)
3. Tasks will be prioritized by phase and dependencies
4. Implementation will follow TDD: Red (write failing test) → Green (implement) → Refactor

**Constitution Compliance Per Phase**:
- All phases follow TDD (test-first approach)
- Mobile-first design maintained in PWA UI components
- Performance monitored via Lighthouse audits
- Security validated (VAPID keys, HTTPS requirement, client-side encryption)
- Atomic component design preserved

---

## Summary

This implementation plan converts the existing Next.js 15.5.6 fasting tracker into a Progressive Web App with offline capabilities, push notifications, and native app-like experience. The plan follows a structured approach:

**Phase 0 (Research)**: ✅ Complete - Evaluated technologies (next-pwa, idb, web-push), caching strategies, sync patterns, and observability approaches. All technical decisions documented in `research.md` with rationale and alternatives.

**Phase 1 (Design & Contracts)**: ✅ Complete - Generated comprehensive data model (IndexedDB schema with 4 stores, Cache Storage with 5 caches), 4 API contracts (service worker, IndexedDB, sync strategy, push notifications), quickstart guide with deployment instructions, and updated agent context with new technologies.

**Phase 2 (Implementation)**: 🔜 Next - To be generated via `/speckit.tasks` command, breaking down into 8 sub-phases with atomic, testable tasks following TDD approach.

**Key Technical Approach**:
- **Minimal disruption**: PWA enhancements added to existing Next.js structure
- **Next.js App Router**: Preserved with service worker registration in client layout
- **Offline-first**: IndexedDB for offline queue + sync, Cache Storage for assets/API
- **Push notifications**: Web Push Protocol with VAPID, no third-party service
- **Constitution compliance**: TDD maintained, mobile-first UI, performance optimized (Lighthouse 90+), security validated

**Success Criteria** (from spec.md):
- SC-001: Install prompt shown, 60%+ completion rate
- SC-002: Cached page load <1s, initial load <3s
- SC-003: Zero data loss, conflict resolution via last-write-wins
- SC-004: 95%+ notification delivery, 7-day average timing
- SC-005: Lighthouse PWA score 90+
- SC-010: All E2E PWA tests passing (install, offline, notifications, updates)

**Next Steps**:
1. Complete Phase 1 artifacts (data-model.md, contracts/, quickstart.md)
2. Run update-agent-context.ps1 to add new technologies
3. Execute `/speckit.tasks` to generate implementation task list
4. Begin Phase 2 implementation following TDD workflow

**Branch**: `010-pwa-conversion`  
**Specification**: `specs/010-pwa-conversion/spec.md`  
**Documentation**:
- ✅ `research.md` - Technical research (8 areas, 24 pages)
- ✅ `data-model.md` - IndexedDB & Cache Storage design (20 pages)
- ✅ `contracts/service-worker.md` - SW lifecycle & caching (18 pages)
- ✅ `contracts/indexeddb-schema.md` - Database operations (17 pages)
- ✅ `contracts/sync-strategy.md` - Offline sync workflow (16 pages)
- ✅ `contracts/push-notification.md` - Push notification system (18 pages)
- ✅ `quickstart.md` - Setup & deployment guide (16 pages)

**Status**: ✅ Planning phase 100% complete, ready for `/speckit.tasks` command

