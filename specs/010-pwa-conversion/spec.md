# Feature Specification: Progressive Web App (PWA) Conversion

**Feature Branch**: `010-pwa-conversion`  
**Created**: October 24, 2025  
**Status**: ✅ Complete - Merged to master (October 2025)  
**Input**: User description: "turn my project into a PWA"

## Clarifications

### Session 2025-10-24

- Q: When a user creates an entry for the same date on multiple devices while offline, how should conflicts be resolved when syncing? → A: Last-write-wins based on sync timestamp (entry that syncs last overwrites earlier)
- Q: What should happen when the cache storage quota is exceeded (too many cached entries or assets)? → A: Cache up to 90 days of entries, evict oldest first when quota reached
- Q: When an offline entry fails to sync (server error, timeout), what retry strategy should be used? → A: Retry with exponential backoff: 5s, 10s, 20s, then hourly
- Q: How should the system determine the "typical eating window" for fasting reminder notifications? → A: Average first meal time from last 7 days
- Q: What observability approach should be used for tracking PWA errors (service worker failures, sync issues, cache problems)? → A: Log to browser console + send critical errors to server endpoint

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install App to Home Screen (Priority: P1)

A mobile user visits the fasting tracker website and wants to install it to their device's home screen for quick access, creating an app-like experience without requiring an app store download.

**Why this priority**: This is the foundational PWA capability that differentiates a PWA from a regular website. Installation is the gateway to all other PWA features (offline mode, push notifications, full-screen experience). Without this, the PWA conversion has no value.

**Independent Test**: Can be fully tested by visiting the website on a mobile device, seeing the install prompt, tapping "Install", and verifying the app appears on the home screen with a custom icon and opens in full-screen mode without browser UI.

**Acceptance Scenarios**:

1. **Given** a user visits the fasting tracker on their mobile device for the first time, **When** they have interacted with the site for 30 seconds, **Then** they see a browser prompt asking if they want to install the app to their home screen
2. **Given** a user sees the install prompt, **When** they tap "Install" or "Add to Home Screen", **Then** the app icon appears on their device home screen with the custom fasting tracker logo
3. **Given** a user has installed the app, **When** they tap the home screen icon, **Then** the app opens in full-screen mode without browser address bar or navigation buttons
4. **Given** a user opens the installed app, **When** the app loads, **Then** they see a splash screen with the app name and icon while loading
5. **Given** a user visits the website on desktop Chrome/Edge, **When** they click the install icon in the address bar, **Then** the app installs as a desktop application in a standalone window

---

### User Story 2 - Use App Offline (Priority: P1)

A user who has previously visited the fasting tracker can continue using core features (viewing entries, logging new entries) even when they lose internet connection, ensuring uninterrupted access to their fasting data.

**Why this priority**: Offline functionality is a core PWA feature that provides reliability and resilience. Users need to log fasting data regardless of connectivity (e.g., on airplane, in rural areas, poor cell reception). This ensures the app feels native and always-available.

**Independent Test**: Can be fully tested by opening the app while online, turning off WiFi/data, attempting to view existing entries and create a new entry, then going back online and verifying the new entry synced to the server.

**Acceptance Scenarios**:

1. **Given** a user has previously opened the fasting tracker, **When** they open the app without internet connection, **Then** they see their previously loaded entries dashboard (not a "No Internet" error page)
2. **Given** a user is offline, **When** they navigate to view an entry they've seen before, **Then** the cached entry data loads successfully
3. **Given** a user is offline, **When** they create a new fasting entry, **Then** the entry is saved locally and a message indicates "Will sync when online"
4. **Given** a user created entries while offline, **When** their internet connection returns, **Then** the entries automatically sync to the server in the background
5. **Given** a user is offline, **When** they try to access a feature requiring server data they haven't cached (e.g., admin area), **Then** they see a friendly message "This feature requires an internet connection"

---

### User Story 3 - Receive Fasting Reminder Notifications (Priority: P2)

A user wants to receive push notifications reminding them when their fasting window is ending or when it's time to log their meals, helping them stay consistent with their fasting schedule without opening the app.

**Why this priority**: Push notifications significantly increase engagement and habit formation for fasting tracking. While not required for core functionality, notifications provide proactive value and are a key differentiator of PWAs. However, the app must be usable without notifications.

**Independent Test**: Can be fully tested by granting notification permission, setting a fasting reminder preference, waiting for the scheduled time, and verifying a push notification appears even when the app is closed.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** they complete their first entry, **Then** they see a prompt asking "Allow notifications to track your fasting reminders?"
2. **Given** a user grants notification permission, **When** they enable "Fasting window ending" reminders in settings, **Then** they receive a push notification 1 hour before their typical eating window (calculated as average first meal time from last 7 days)
3. **Given** a user has notifications enabled, **When** they haven't logged today's entry by 8 PM, **Then** they receive a notification "Don't forget to log today's fasting entry!"
4. **Given** a user receives a notification, **When** they tap the notification, **Then** the app opens directly to the relevant screen (e.g., create entry form)
5. **Given** a user declines notification permission, **When** they use the app, **Then** all features work normally without notifications, and they can enable them later in settings

---

### User Story 4 - Fast Loading on Repeat Visits (Priority: P2)

A user who regularly opens the fasting tracker experiences near-instant loading times on repeat visits due to aggressive caching of app shell and resources, creating a native app-like experience.

**Why this priority**: Performance is a key PWA benefit but not a functional feature. Fast loading improves user satisfaction and retention, but the app must work correctly first. This enhances an already-working app rather than enabling core functionality.

**Independent Test**: Can be fully tested by measuring initial load time, then closing and reopening the app 5 seconds later, and verifying the app shell loads in under 1 second (showing cached UI before data loads).

**Acceptance Scenarios**:

1. **Given** a user visits the fasting tracker for the first time, **When** the page loads, **Then** core assets (CSS, JavaScript, fonts, icons) are cached for future visits
2. **Given** a user has visited the app before, **When** they open it again, **Then** the app shell (navigation, header, layout) displays in under 1 second even on slow 3G
3. **Given** a user opens the app on repeat visit, **When** the cached shell loads, **Then** they see a loading indicator while fresh data loads from the server
4. **Given** the app has cached assets, **When** a user opens the app without internet, **Then** the UI still renders instantly (even though data may be stale)
5. **Given** the app has been updated, **When** a user with an old cached version opens the app, **Then** they see a discreet message "Update available - Refresh to get the latest version"

---

### User Story 5 - Seamless App Updates (Priority: P3)

A user with the installed PWA automatically receives updates when new features or bug fixes are deployed, without needing to manually download updates from an app store.

**Why this priority**: Auto-updates are a convenience feature that maintains the PWA over time. While valuable for long-term maintenance, it's not required for initial PWA functionality. Users can still use the app even with outdated service workers.

**Independent Test**: Can be fully tested by deploying a new version of the app, having a user with the old version open the app, and verifying they see an update notification and can refresh to get the new version.

**Acceptance Scenarios**:

1. **Given** a new version of the app has been deployed, **When** a user with an older version opens the app, **Then** they see a banner "New version available - Tap to update"
2. **Given** a user sees the update banner, **When** they tap "Update", **Then** the page reloads with the new version and they see a toast "App updated successfully"
3. **Given** a user ignores the update banner, **When** they continue using the app, **Then** it works with the cached old version without breaking
4. **Given** a critical bug fix is deployed, **When** the user next opens the app, **Then** the update happens automatically after a short delay (no action required)

---

### Edge Cases

- What happens when a user installs the PWA but their browser doesn't support service workers?
- How does the system handle offline entry creation when the user has spotty connectivity (online, offline, online rapidly)?
- What happens if a user denies notification permission initially but wants to enable it later?
- How does the app behave when the service worker fails to register (e.g., HTTPS not available)?
- What happens when a user clears browser cache while entries are queued for sync?
- How does the app handle conflicts when a user creates the same entry online from desktop and offline from mobile? **Resolution: Last-write-wins based on sync timestamp - the entry that syncs last overwrites any earlier version.**
- What happens when push notification permission is granted but the browser doesn't support it (e.g., iOS before 16.4)?
- How does the system handle service worker update failures (e.g., network error during update)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a web app manifest file with app name, icons, theme colors, and display mode set to "standalone"
- **FR-002**: System MUST serve the app over HTTPS (required for service workers and PWA installation)
- **FR-003**: System MUST register a service worker that caches core app shell assets (HTML, CSS, JavaScript, fonts, icons)
- **FR-004**: System MUST implement a cache-first strategy for static assets and a network-first strategy with cache fallback for API requests
- **FR-005**: System MUST provide installability by meeting PWA criteria (manifest, service worker, HTTPS)
- **FR-006**: System MUST show an install prompt on mobile devices after user engagement (30 seconds of interaction or 2+ page views)
- **FR-007**: System MUST provide offline access to previously viewed entries and the entry creation form
- **FR-008**: System MUST store offline-created entries in IndexedDB and sync them when connectivity returns
- **FR-008a**: System MUST resolve sync conflicts using last-write-wins strategy based on sync timestamp (entry syncing last overwrites any existing entry for that date)
- **FR-009**: System MUST request notification permission at an appropriate time (after first entry, not on first visit)
- **FR-010**: System MUST send push notifications for configurable fasting reminders (fasting window ending, daily log reminder)
- **FR-010a**: System MUST calculate "typical eating window" for fasting reminders by averaging the first meal time from the user's last 7 days of entries
- **FR-011**: System MUST handle notification clicks by opening the app to the relevant screen
- **FR-012**: System MUST detect when a new service worker is available and notify the user with an update prompt
- **FR-013**: System MUST provide a way for users to manually refresh to get updates (skip waiting)
- **FR-014**: System MUST display appropriate UI when offline (e.g., "Offline mode" indicator, disabled features that require network)
- **FR-015**: System MUST track online/offline status and automatically sync when transitioning from offline to online
- **FR-015a**: System MUST retry failed syncs using exponential backoff (5 seconds, 10 seconds, 20 seconds, then hourly until successful or manual intervention)
- **FR-016**: System MUST provide fallback behavior when PWA features are not supported (graceful degradation)
- **FR-017**: System MUST cache API responses for common requests (user entries, settings) with appropriate expiration
- **FR-017a**: System MUST cache up to 90 days of user entries in IndexedDB, evicting oldest entries first when storage quota is reached
- **FR-018**: System MUST show a loading state when fetching fresh data while displaying cached content
- **FR-019**: System MUST include app icons in multiple sizes (192x192, 512x512) for various device home screens and splash screens
- **FR-020**: System MUST configure manifest with appropriate orientation (any), start_url, and scope
- **FR-021**: System MUST log all PWA errors (service worker registration failures, sync failures, cache quota exceeded) to browser console for debugging
- **FR-022**: System MUST send critical PWA errors (service worker registration failures, persistent sync failures after all retries) to a server-side error logging endpoint for operational monitoring

### Key Entities

- **Web App Manifest**: Configuration file defining app name ("Fasting Tracker"), short_name ("Fasting"), description, icons (sizes 192x192, 512x512, maskable), theme_color (purple primary), background_color (white), display ("standalone"), start_url ("/entries"), scope ("/")

- **Service Worker**: Background script that intercepts network requests, manages caching strategies, handles offline functionality, manages app updates, and sends push notifications. Includes lifecycle events (install, activate, fetch).

- **Cache Storage**: Browser storage for cached responses organized by cache name (app-shell-v1, api-cache-v1, entries-cache-v1). Contains static assets, API responses, and offline fallback pages.

- **IndexedDB Store**: Client-side database for storing offline-created entries, sync queue for pending operations, and cached entry data. Structure: `{ id, userId, date, firstMealTime, lastMealTime, ... , syncStatus, createdOffline }`.

- **Push Subscription**: User's device-specific subscription for push notifications, containing endpoint URL and encryption keys. Stored on server associated with user account.

- **Notification Preferences**: User settings for notification types (fasting window ending, daily log reminder), timing preferences (e.g., "1 hour before eating window"), and enabled/disabled status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can install the app to their home screen in under 30 seconds after seeing the install prompt
- **SC-002**: The app loads in under 2 seconds on repeat visits (cached app shell displays in under 1 second)
- **SC-003**: Users can view their last 30 days of entries while completely offline (system caches up to 90 days with oldest-first eviction)
- **SC-004**: Users can create and save new entries offline, which sync successfully within 5 seconds of connectivity returning (with exponential backoff retry on failures)
- **SC-005**: 60% of users who install the PWA grant notification permission after being prompted at an appropriate time
- **SC-006**: The app achieves a Lighthouse PWA score of 90+ (installable, works offline, fast loading)
- **SC-007**: Users who enable notifications receive fasting reminders with 95%+ delivery success rate
- **SC-008**: App updates deploy and become available to users within 24 hours without requiring app store approval
- **SC-009**: The app remains fully functional on iOS Safari, Android Chrome, and desktop browsers with graceful degradation for unsupported features
- **SC-010**: Users experience 0 data loss when creating entries offline and syncing when back online

## Assumptions

- The existing Next.js application is already served over HTTPS (required for service workers)
- Users primarily access the fasting tracker from mobile devices (iOS Safari 16.4+, Android Chrome)
- The app is deployed on a hosting platform that supports service workers (e.g., Vercel)
- Users have modern browsers with service worker support (95%+ of mobile users)
- Push notifications will use the Web Push Protocol (no native app required)
- The existing authentication system (NextAuth.js) works with service workers
- Users will grant notification permission after seeing value (post-first entry)
- The majority of app usage happens on mobile devices while commuting or at meal times
- Network connectivity is intermittent for many users (subway, rural areas, airplane mode)
- Users expect native app-like behavior (instant loading, offline access, home screen icon)

