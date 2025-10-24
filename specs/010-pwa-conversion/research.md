# Research: Progressive Web App (PWA) Conversion

**Feature**: 010-pwa-conversion  
**Date**: October 24, 2025  
**Status**: Complete

## Overview

This document captures research findings for converting the Next.js 15.5.6 fasting tracker into a Progressive Web App. Research focused on service worker patterns, offline-first architecture, IndexedDB for client-side storage, Web Push API for notifications, and Next.js PWA integration approaches.

---

## Research Areas

### 1. Next.js 15 PWA Integration Strategy

**Decision**: Use `next-pwa` with Workbox 7+ for service worker generation and caching strategies.

**Rationale**:
- `next-pwa` is the de facto standard PWA solution for Next.js (2M+ weekly downloads)
- Seamlessly integrates with Next.js build process
- Generates optimized service worker using Workbox
- Supports App Router architecture (Next.js 13+)
- Provides TypeScript support and excellent documentation
- Zero-config for basic setup, highly customizable for advanced needs

**Implementation Approach**:
```javascript
// next.config.mjs
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^\/api\/entries.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-entries',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        },
        networkTimeoutSeconds: 10
      }
    }
  ],
  disable: process.env.NODE_ENV === 'development'
});
```

**Alternatives Considered**:
- **Workbox CLI** - Rejected: requires manual integration, more boilerplate
- **Custom service worker** - Rejected: reinventing wheel, harder to maintain
- **next-offline** - Rejected: deprecated, not maintained since 2021

**References**:
- next-pwa documentation: https://github.com/shadowwalker/next-pwa
- Workbox strategies: https://developer.chrome.com/docs/workbox/modules/workbox-strategies/
- Next.js PWA example: https://github.com/vercel/next.js/tree/canary/examples/progressive-web-app

---

### 2. Service Worker Caching Strategies

**Decision**: Implement hybrid caching strategy - Cache-First for static assets, Network-First with cache fallback for API requests.

**Rationale**:
- **Cache-First** for static assets (CSS, JS, fonts, images) ensures instant loading on repeat visits
- **Network-First** for API data ensures users get fresh data when online, falls back to cache when offline
- Aligns with FR-004 specification requirements
- Balances performance and data freshness

**Caching Strategy Breakdown**:

| Resource Type | Strategy | Rationale |
|--------------|----------|-----------|
| App shell (HTML, CSS, JS) | Cache-First with Network fallback | Instant load, updated when SW updates |
| Static assets (images, fonts) | Cache-First with expiration | Rarely change, safe to cache long-term |
| API: GET /api/entries | Network-First (10s timeout) | Fresh data preferred, cache as fallback |
| API: POST /api/entries | Network-Only with queue | Mutations need server acknowledgment |
| API: User settings | Stale-While-Revalidate | Show cached, update in background |
| External fonts/CDN | Cache-First with long expiration | External resources, cache aggressively |

**Cache Versioning**:
```javascript
const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
};
```

**Alternatives Considered**:
- **Cache-Only** - Rejected: too aggressive, users miss updates
- **Network-Only** - Rejected: defeats purpose of PWA offline capability
- **Stale-While-Revalidate for everything** - Rejected: mutation APIs need confirmation

**References**:
- Workbox strategies guide: https://developer.chrome.com/docs/workbox/caching-strategies-overview/
- Offline cookbook: https://web.dev/offline-cookbook/
- Service worker lifecycle: https://web.dev/service-worker-lifecycle/

---

### 3. IndexedDB for Offline Data Storage

**Decision**: Use `idb` library (wrapper around IndexedDB) with structured stores for offline entries, sync queue, and cached data.

**Rationale**:
- `idb` provides Promise-based API (native IndexedDB uses callbacks)
- Lightweight (1.1KB gzipped), no external dependencies
- Excellent TypeScript support
- Simplified error handling and transaction management
- Used by Google Chrome team, well-maintained

**IndexedDB Schema Design**:
```javascript
// Database name: 'fasting-tracker'
// Version: 1

const schema = {
  stores: {
    // Store 1: Offline entries queue (pending sync)
    offlineEntries: {
      keyPath: 'id', // UUID generated client-side
      autoIncrement: false,
      indexes: {
        syncStatus: 'syncStatus', // 'pending', 'syncing', 'failed'
        createdAt: 'createdAt', // Timestamp for ordering
        date: 'date' // Entry date for deduplication
      }
    },
    
    // Store 2: Cached entries (for offline viewing)
    cachedEntries: {
      keyPath: 'id', // Server-generated MongoDB _id
      autoIncrement: false,
      indexes: {
        userId: 'userId',
        date: 'date',
        cachedAt: 'cachedAt' // For eviction policy
      }
    },
    
    // Store 3: Sync metadata
    syncMeta: {
      keyPath: 'key', // 'lastSyncTime', 'syncErrors', etc.
      autoIncrement: false
    },
    
    // Store 4: Push subscription metadata
    pushMeta: {
      keyPath: 'userId',
      autoIncrement: false
    }
  }
};
```

**Eviction Policy** (FR-017a: 90-day limit):
```javascript
async function evictOldEntries(db) {
  const tx = db.transaction('cachedEntries', 'readwrite');
  const store = tx.objectStore('cachedEntries');
  const index = store.index('cachedAt');
  
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const oldEntries = await index.getAll(IDBKeyRange.upperBound(ninetyDaysAgo));
  
  for (const entry of oldEntries) {
    await store.delete(entry.id);
  }
}
```

**Alternatives Considered**:
- **LocalStorage** - Rejected: 5-10MB limit, synchronous API, no structure
- **Native IndexedDB** - Rejected: callback-based, harder to work with
- **Dexie.js** - Rejected: larger bundle (14KB), unnecessary features for our use case
- **PouchDB** - Rejected: overkill (CouchDB sync), 145KB bundle size

**References**:
- idb library: https://github.com/jakearchibald/idb
- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Storage quota management: https://web.dev/storage-for-the-web/

---

### 4. Offline Sync Strategy

**Decision**: Implement exponential backoff retry (5s, 10s, 20s, then hourly) with last-write-wins conflict resolution based on sync timestamp (clarified in spec).

**Rationale**:
- Exponential backoff prevents server hammering during outages
- Hourly retries after initial attempts ensure eventual consistency
- Last-write-wins is simplest conflict resolution (appropriate for single-user entries)
- Background Sync API as enhancement (not baseline) due to limited browser support

**Sync Flow**:
```javascript
// 1. Detect online transition
window.addEventListener('online', async () => {
  await processSyncQueue();
});

// 2. Process queue with exponential backoff
async function processSyncQueue() {
  const queue = await getOfflineEntries();
  
  for (const entry of queue) {
    let attempt = 0;
    const delays = [5000, 10000, 20000, 3600000]; // 5s, 10s, 20s, 1hr
    
    while (attempt < delays.length) {
      try {
        await syncEntry(entry);
        await markSynced(entry.id);
        break; // Success
      } catch (error) {
        attempt++;
        if (attempt < delays.length) {
          await sleep(delays[attempt]);
        } else {
          await markFailed(entry.id, error);
          logCriticalError('Sync failed after all retries', entry);
        }
      }
    }
  }
}
```

**Conflict Resolution** (FR-008a):
```javascript
// Last-write-wins based on sync timestamp
async function syncEntry(offlineEntry) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sync-Timestamp': offlineEntry.createdAt // Client timestamp
    },
    body: JSON.stringify(offlineEntry.data)
  });
  
  // Server checks if entry exists for this date
  // If exists and server timestamp < X-Sync-Timestamp, overwrite
  // If exists and server timestamp > X-Sync-Timestamp, reject (client stale)
  // If not exists, create new
}
```

**Background Sync API** (Progressive Enhancement):
```javascript
// Register background sync (where supported)
if ('serviceWorker' in navigator && 'sync' in self.registration) {
  await navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('sync-entries');
  });
}

// Service worker handles sync event
self.addEventListener('sync', event => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(processSyncQueue());
  }
});
```

**Alternatives Considered**:
- **Immediate retry** - Rejected: hammers server during outages
- **Fixed interval retry** - Rejected: doesn't adapt to transient vs persistent failures
- **Operational Transform (OT)** - Rejected: overcomplicated for single-user data
- **CRDT** - Rejected: massive complexity for limited benefit

**References**:
- Background Sync API: https://developer.chrome.com/articles/background-sync/
- Exponential backoff: https://cloud.google.com/iot/docs/how-tos/exponential-backoff
- Conflict-free replicated data types: https://crdt.tech/ (for reference, not used)

---

### 5. Web Push Notifications

**Decision**: Use Web Push Protocol with VAPID (Voluntary Application Server Identification) keys for push notifications, `web-push` Node.js library for server-side sending.

**Rationale**:
- Web Push is standardized (RFC 8030), works across all modern browsers including iOS 16.4+
- VAPID authentication eliminates need for FCM/third-party push service
- `web-push` library handles encryption and signing automatically
- No external dependencies or API keys required
- Free, no per-message costs

**Implementation Architecture**:

```javascript
// Client-side: Request permission & subscribe
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // Send subscription to server
  await fetch('/api/pwa/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}

// Server-side: Send notification
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendNotification(userId, payload) {
  const subscription = await getPushSubscription(userId);
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}
```

**Notification Scheduling** (FR-010a: 7-day average):
```javascript
// Calculate "typical eating window" from last 7 days
async function calculateTypicalMealTime(userId) {
  const entries = await Entry.find({ userId })
    .sort({ date: -1 })
    .limit(7);
  
  const mealTimes = entries
    .map(e => e.firstMealTime)
    .filter(Boolean);
  
  if (mealTimes.length === 0) return null;
  
  // Average time in minutes since midnight
  const avgMinutes = mealTimes.reduce((sum, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return sum + (hours * 60 + minutes);
  }, 0) / mealTimes.length;
  
  // Return time 1 hour before average
  const reminderMinutes = Math.max(0, avgMinutes - 60);
  const hours = Math.floor(reminderMinutes / 60);
  const mins = Math.round(reminderMinutes % 60);
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Schedule via cron job or Next.js API route + Vercel Cron
export async function scheduleNotifications() {
  const users = await User.find({ 
    'notificationPreferences.fastingWindowReminder': true 
  });
  
  for (const user of users) {
    const reminderTime = await calculateTypicalMealTime(user.id);
    if (reminderTime && isTimeToSend(reminderTime)) {
      await sendNotification(user.id, {
        title: 'Fasting Window Ending Soon',
        body: 'Your eating window typically starts in 1 hour',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'fasting-reminder',
        data: { url: '/entries' }
      });
    }
  }
}
```

**Service Worker Push Handler**:
```javascript
self.addEventListener('push', event => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      vibrate: [200, 100, 200],
      requireInteraction: false
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

**Alternatives Considered**:
- **Firebase Cloud Messaging (FCM)** - Rejected: requires Google account, additional dependency
- **OneSignal** - Rejected: third-party service, privacy concerns, paid tiers
- **Push API without VAPID** - Rejected: deprecated, requires FCM sender ID
- **Polling** - Rejected: battery drain, not real-time

**References**:
- Web Push Protocol: https://datatracker.ietf.org/doc/html/rfc8030
- web-push library: https://github.com/web-push-libs/web-push
- Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- iOS Web Push support: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

---

### 6. Web App Manifest Configuration

**Decision**: Create comprehensive `manifest.json` with all required PWA fields, maskable icons for Android adaptive display.

**Rationale**:
- Manifest is required for installability (FR-001, FR-005)
- Maskable icons ensure proper display on Android adaptive icon systems
- `standalone` display mode provides app-like experience (no browser UI)
- Theme color integration with Tailwind CSS purple theme

**Manifest Structure**:
```json
{
  "name": "Fasting Tracker",
  "short_name": "Fasting",
  "description": "Track your intermittent fasting journey, log meals, and monitor health metrics",
  "start_url": "/entries",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9333ea",
  "orientation": "any",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["health", "lifestyle", "productivity"],
  "shortcuts": [
    {
      "name": "Log Entry",
      "short_name": "Log",
      "description": "Quickly log today's fasting entry",
      "url": "/entries/new",
      "icons": [{ "src": "/icons/shortcut-log.png", "sizes": "96x96" }]
    }
  ]
}
```

**Icon Generation Strategy**:
- Source: Single SVG logo at high resolution
- Generate PNGs: 192x192, 512x512 (required), plus 72x72, 96x96, 128x128, 256x256 (optional)
- Maskable icons: Add 20% safe zone padding for Android adaptive icons
- Tool: `sharp` library for automated generation

**Alternatives Considered**:
- **Minimal manifest** - Rejected: fails Lighthouse PWA audit, poor install experience
- **Browser display mode** - Rejected: shows browser UI, not app-like
- **minimal-ui display** - Rejected: compromise that satisfies neither use case

**References**:
- Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest
- Maskable icons: https://web.dev/maskable-icon/
- Adaptive icons: https://medium.com/google-design/designing-adaptive-icons-515af294c783

---

### 7. Performance Optimization & Caching

**Decision**: Implement aggressive precaching for app shell, runtime caching for data, and cache warming on first load.

**Rationale**:
- Precaching ensures instant repeat visits (<1s load time per SC-002)
- Runtime caching balances performance with data freshness
- Cache warming on first visit prepares for offline mode
- Aligns with FR-004, FR-017, FR-018 requirements

**Precache Strategy**:
```javascript
// Workbox precaching (in next.config.mjs)
{
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/],
  publicExcludes: ['!noprecache/**/*'],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  precaching: [
    // Critical app shell
    { url: '/', revision: null }, // Homepage
    { url: '/entries', revision: null }, // Main app page
    { url: '/offline.html', revision: null }, // Offline fallback
    // Fonts
    { url: '/fonts/inter-var.woff2', revision: '1' },
    // Critical CSS (injected by Next.js)
    // Critical JS chunks (handled automatically)
  ]
}
```

**Runtime Caching Rules**:
```javascript
{
  runtimeCaching: [
    // API: Entries (Network-First)
    {
      urlPattern: /^\/api\/entries.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-entries',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 }, // 1 day
        networkTimeoutSeconds: 10,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Only cache successful responses
              return response.status === 200 ? response : null;
            }
          }
        ]
      }
    },
    
    // API: Settings (Stale-While-Revalidate)
    {
      urlPattern: /^\/api\/settings.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-settings',
        expiration: { maxEntries: 10, maxAgeSeconds: 3600 } // 1 hour
      }
    },
    
    // Images (Cache-First with long expiration)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } // 30 days
      }
    },
    
    // Google Fonts (Cache-First with 1-year expiration)
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 31536000 } // 1 year
      }
    }
  ]
}
```

**Cache Warming** (on first load):
```javascript
// In service worker activation
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Warm cache with last 30 days of entries
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      await fetch(`/api/entries?from=${thirtyDaysAgo.toISOString()}&to=${today.toISOString()}`);
    })()
  );
});
```

**Alternatives Considered**:
- **No precaching** - Rejected: poor offline experience, slower repeat visits
- **Cache everything** - Rejected: excessive storage use, stale data issues
- **Aggressive cache warming** - Rejected: slows initial load, unnecessary for most users

**References**:
- Workbox precaching: https://developer.chrome.com/docs/workbox/modules/workbox-precaching/
- Cache strategies: https://web.dev/runtime-caching-with-workbox/
- Performance patterns: https://web.dev/fast/

---

### 8. Error Logging & Observability

**Decision**: Log PWA errors to browser console (development) and send critical errors to server endpoint (production) per FR-021, FR-022.

**Rationale**:
- Browser console sufficient for development debugging
- Server-side logging enables production monitoring without third-party service
- Critical errors (SW registration failure, persistent sync failures) need ops visibility
- Non-critical errors (cache miss, single sync retry) logged locally only

**Error Logging Implementation**:
```javascript
// Client-side error logger
class PWAErrorLogger {
  constructor() {
    this.endpoint = '/api/pwa/log-error';
    this.isDev = process.env.NODE_ENV === 'development';
  }
  
  async logError(level, category, message, metadata = {}) {
    // Always log to console
    console.error(`[PWA ${level}]`, category, message, metadata);
    
    // Send critical errors to server in production
    if (!this.isDev && level === 'critical') {
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            category,
            message,
            metadata,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        // Fail silently, don't break app
        console.warn('Failed to send error log', err);
      }
    }
  }
  
  critical(category, message, metadata) {
    return this.logError('critical', category, message, metadata);
  }
  
  warning(category, message, metadata) {
    return this.logError('warning', category, message, metadata);
  }
  
  info(category, message, metadata) {
    return this.logError('info', category, message, metadata);
  }
}

// Usage examples
const logger = new PWAErrorLogger();

// Critical: Service worker registration failed
try {
  await navigator.serviceWorker.register('/sw.js');
} catch (error) {
  await logger.critical('sw-registration', 'Failed to register service worker', {
    error: error.message,
    stack: error.stack
  });
}

// Critical: Sync failed after all retries
await logger.critical('sync-failure', 'Entry sync failed after exponential backoff', {
  entryId: entry.id,
  attempts: 4,
  lastError: error.message
});

// Warning: Cache quota exceeded
await logger.warning('cache-quota', 'IndexedDB quota exceeded, evicting old entries', {
  quotaExceeded: true,
  entriesEvicted: count
});

// Info: Offline entry created
logger.info('offline-entry', 'Entry created while offline', {
  entryId: entry.id,
  queueLength: queue.length
});
```

**Server-Side Error Endpoint**:
```javascript
// /api/pwa/log-error/route.js
export async function POST(request) {
  const { level, category, message, metadata, userAgent, timestamp } = await request.json();
  
  // Store in MongoDB PWAErrorLog collection
  await PWAErrorLog.create({
    level,
    category,
    message,
    metadata,
    userAgent,
    timestamp: new Date(timestamp)
  });
  
  // Optionally: Send to monitoring service (Sentry, DataDog)
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureMessage(message, { level, extra: metadata });
  // }
  
  return NextResponse.json({ success: true });
}
```

**Alternatives Considered**:
- **Sentry/DataDog** - Rejected: adds cost and complexity for MVP, can add later
- **Console-only** - Rejected: no production visibility, can't debug user issues
- **All errors to server** - Rejected: excessive noise, storage bloat

**References**:
- Error handling best practices: https://web.dev/articles/reporting-observer
- Service worker debugging: https://developer.chrome.com/docs/workbox/troubleshooting-and-logging/

---

## Technology Stack Summary

**New Dependencies**:
```json
{
  "dependencies": {
    "next-pwa": "^5.6.0",
    "idb": "^8.0.0",
    "web-push": "^3.6.0"
  },
  "devDependencies": {
    "workbox-webpack-plugin": "^7.0.0",
    "sharp": "^0.33.0"
  }
}
```

**No Major Architectural Changes**:
- Existing Next.js 15.5.6 App Router structure preserved
- NextAuth.js works with service workers (no session storage in SW)
- MongoDB remains server-side only (no client DB sync)
- Tailwind CSS theming applied to PWA manifest

**Build Process Changes**:
- `next-pwa` plugin added to `next.config.mjs`
- Service worker generated at build time to `public/sw.js`
- PWA icons generated via `scripts/generate-icons.js`

---

## Next Steps

1. **Phase 1**: Design & Contracts
   - Create `data-model.md` (IndexedDB schema, sync queue structure)
   - Generate contracts:
     - `contracts/service-worker.md` (SW API, caching rules)
     - `contracts/indexeddb-schema.md` (DB stores, indexes)
     - `contracts/sync-strategy.md` (Sync flow, conflict resolution)
     - `contracts/push-notification.md` (Notification API, scheduling)
   - Create `quickstart.md` (PWA setup guide, testing offline)
   - Update agent context with new technology

2. **Phase 2**: Implementation (via `/speckit.tasks`)
   - Install dependencies (`next-pwa`, `idb`, `web-push`)
   - Configure `next.config.mjs` with Workbox
   - Create web app manifest
   - Generate PWA icons
   - Implement IndexedDB wrapper
   - Build sync queue system
   - Create service worker handlers
   - Implement push notification API
   - Build PWA UI components
   - Write comprehensive tests
   - Lighthouse PWA audit

---

## References & Resources

**Official Documentation**:
- Progressive Web Apps: https://web.dev/progressive-web-apps/
- Service Workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest
- Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Notifications API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

**Libraries & Tools**:
- next-pwa: https://github.com/shadowwalker/next-pwa
- Workbox: https://developer.chrome.com/docs/workbox/
- idb: https://github.com/jakearchibald/idb
- web-push: https://github.com/web-push-libs/web-push

**Testing & Validation**:
- Lighthouse: https://developer.chrome.com/docs/lighthouse/overview/
- Workbox testing: https://developer.chrome.com/docs/workbox/modules/workbox-recipes/#testing
- PWA Builder: https://www.pwabuilder.com/

**Best Practices**:
- Offline cookbook: https://web.dev/offline-cookbook/
- PWA checklist: https://web.dev/pwa-checklist/
- Service worker best practices: https://web.dev/service-worker-mindset/
