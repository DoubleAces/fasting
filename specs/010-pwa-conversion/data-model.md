# Data Model: PWA Offline & Caching

**Feature**: 010-pwa-conversion  
**Date**: October 24, 2025

## Overview

This document defines the data model for Progressive Web App (PWA) features including offline storage, sync queue management, push notification subscriptions, and client-side caching. The model consists of two primary storage mechanisms:

1. **IndexedDB** - Structured client-side database for offline entries, sync queue, and metadata
2. **Cache Storage API** - Browser caching for static assets and API responses

---

## IndexedDB Schema

**Database Name**: `fasting-tracker`  
**Version**: 1  
**Library**: `idb` (Promise-based wrapper)

### Store 1: offlineEntries

**Purpose**: Queue of entries created while offline, pending synchronization with server

**Configuration**:
```javascript
{
  keyPath: 'id', // UUID generated client-side
  autoIncrement: false,
  indexes: {
    syncStatus: { unique: false }, // 'pending', 'syncing', 'synced', 'failed'
    createdAt: { unique: false },  // Timestamp for ordering
    date: { unique: false },       // Entry date for deduplication
    userId: { unique: false }      // User ID for multi-user cleanup
  }
}
```

**Document Structure**:
```typescript
interface OfflineEntry {
  id: string;                    // UUID (e.g., 'a1b2c3d4-...')
  userId: string;                // MongoDB User._id
  date: string;                  // ISO 8601 date (e.g., '2025-10-24')
  entryData: {                   // Entry payload to sync
    firstMealTime: string;       // e.g., '12:00'
    lastMealTime: string;        // e.g., '20:00'
    fastingHours: number;        // e.g., 16
    waterIntake: number;         // e.g., 2000 (ml)
    weight: number | null;       // e.g., 75.5 (kg)
    notes: string;               // Free-form text
  };
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: number;             // Unix timestamp (e.g., 1729785600000)
  lastSyncAttempt: number | null; // Unix timestamp of last sync try
  syncAttempts: number;          // Retry count (0-3)
  nextRetryAt: number | null;    // Unix timestamp for next retry
  error: string | null;          // Last error message if failed
}
```

**Indexes Purpose**:
- `syncStatus` - Query pending/failed entries for sync processing
- `createdAt` - Order entries chronologically for sync queue
- `date` - Detect duplicate entries for same date (deduplication)
- `userId` - Filter entries by user, cleanup on logout

**Usage**:
```javascript
// Add offline entry
await db.add('offlineEntries', {
  id: crypto.randomUUID(),
  userId: session.user.id,
  date: '2025-10-24',
  entryData: { firstMealTime: '12:00', ... },
  syncStatus: 'pending',
  createdAt: Date.now(),
  lastSyncAttempt: null,
  syncAttempts: 0,
  nextRetryAt: null,
  error: null
});

// Query pending entries
const pending = await db.getAllFromIndex(
  'offlineEntries', 
  'syncStatus', 
  'pending'
);

// Update sync status
await db.put('offlineEntries', {
  ...entry,
  syncStatus: 'synced',
  lastSyncAttempt: Date.now()
});
```

---

### Store 2: cachedEntries

**Purpose**: Offline-viewable entries cached from server (last 90 days per FR-017a)

**Configuration**:
```javascript
{
  keyPath: 'id', // MongoDB _id from server
  autoIncrement: false,
  indexes: {
    userId: { unique: false },
    date: { unique: false },
    cachedAt: { unique: false } // For eviction policy
  }
}
```

**Document Structure**:
```typescript
interface CachedEntry {
  id: string;                    // MongoDB _id (e.g., '507f1f77bcf86cd799439011')
  userId: string;                // MongoDB User._id
  date: string;                  // ISO 8601 date
  entryData: {                   // Full entry data from server
    firstMealTime: string;
    lastMealTime: string;
    fastingHours: number;
    waterIntake: number;
    weight: number | null;
    notes: string;
    createdAt: string;           // ISO 8601 timestamp
    updatedAt: string;           // ISO 8601 timestamp
  };
  cachedAt: number;              // Unix timestamp when cached
  expiresAt: number;             // Unix timestamp (cachedAt + 90 days)
}
```

**Eviction Policy** (FR-017a):
- **Trigger**: On IndexedDB quota exceeded error OR periodic cleanup
- **Strategy**: Delete entries where `expiresAt < Date.now()` (oldest first)
- **Retention**: 90 days from `cachedAt` timestamp
- **Estimated Storage**: ~1KB per entry × 90 entries × 1000 users = ~90MB

**Usage**:
```javascript
// Cache entry from server
await db.put('cachedEntries', {
  id: serverEntry._id,
  userId: serverEntry.userId,
  date: serverEntry.date,
  entryData: serverEntry,
  cachedAt: Date.now(),
  expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
});

// Retrieve cached entries
const userEntries = await db.getAllFromIndex(
  'cachedEntries',
  'userId',
  currentUserId
);

// Evict old entries
const tx = db.transaction('cachedEntries', 'readwrite');
const index = tx.store.index('cachedAt');
const oldEntries = await index.getAll(
  IDBKeyRange.upperBound(Date.now() - (90 * 24 * 60 * 60 * 1000))
);
for (const entry of oldEntries) {
  await tx.store.delete(entry.id);
}
await tx.done;
```

---

### Store 3: syncMeta

**Purpose**: Metadata about sync operations (timestamps, errors, statistics)

**Configuration**:
```javascript
{
  keyPath: 'key', // Metadata key (e.g., 'lastFullSync', 'syncErrors')
  autoIncrement: false
}
```

**Document Structure**:
```typescript
interface SyncMetadata {
  key: string;                   // Metadata identifier
  value: any;                    // Metadata value (varies by key)
  updatedAt: number;             // Unix timestamp
}

// Example keys:
{
  key: 'lastFullSync',
  value: 1729785600000,          // Last successful full sync timestamp
  updatedAt: 1729785600000
}

{
  key: 'syncErrors',
  value: [
    { timestamp: 1729785000000, error: 'Network timeout', entryId: 'abc123' },
    { timestamp: 1729785300000, error: 'Server 500', entryId: 'def456' }
  ],
  updatedAt: 1729785300000
}

{
  key: 'queueStats',
  value: { pending: 3, synced: 147, failed: 2 },
  updatedAt: 1729785600000
}
```

**Usage**:
```javascript
// Update last sync time
await db.put('syncMeta', {
  key: 'lastFullSync',
  value: Date.now(),
  updatedAt: Date.now()
});

// Get sync metadata
const lastSync = await db.get('syncMeta', 'lastFullSync');

// Track sync errors
const errors = await db.get('syncMeta', 'syncErrors');
await db.put('syncMeta', {
  key: 'syncErrors',
  value: [...(errors?.value || []), { 
    timestamp: Date.now(), 
    error: err.message, 
    entryId: entry.id 
  }],
  updatedAt: Date.now()
});
```

---

### Store 4: pushMeta

**Purpose**: Push notification subscription information per user

**Configuration**:
```javascript
{
  keyPath: 'userId', // One subscription per user
  autoIncrement: false
}
```

**Document Structure**:
```typescript
interface PushSubscription {
  userId: string;                // MongoDB User._id
  subscription: {                // PushSubscription object from Push API
    endpoint: string;            // Push service endpoint URL
    expirationTime: number | null;
    keys: {
      p256dh: string;            // Public key
      auth: string;              // Auth secret
    };
  };
  subscribedAt: number;          // Unix timestamp
  lastNotificationAt: number | null; // Last notification sent
  preferences: {                 // Notification preferences
    fastingWindowReminder: boolean;
    dailyLog: boolean;
    weeklyReview: boolean;
  };
}
```

**Usage**:
```javascript
// Store push subscription
const subscription = await swRegistration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});

await db.put('pushMeta', {
  userId: session.user.id,
  subscription: subscription.toJSON(),
  subscribedAt: Date.now(),
  lastNotificationAt: null,
  preferences: {
    fastingWindowReminder: true,
    dailyLog: false,
    weeklyReview: true
  }
});

// Retrieve subscription
const pushData = await db.get('pushMeta', currentUserId);
```

---

## Cache Storage Organization

**API**: Browser Cache Storage API (managed by Workbox)  
**Versioning**: Cache names include version (`-v1`) for easy invalidation

### Cache 1: app-shell-v1

**Purpose**: Critical app resources for instant loading and offline navigation

**Contents**:
- HTML pages: `/`, `/entries`, `/settings`, `/offline.html`
- CSS bundles: `_next/static/css/*.css`
- JavaScript bundles: `_next/static/chunks/*.js`
- Fonts: `/fonts/inter-var.woff2`
- Service worker: `/sw.js`

**Strategy**: Cache-First (precached at SW install)

**Size**: ~2-5 MB

**Invalidation**: On service worker update (new version deployed)

**Configuration** (next.config.mjs):
```javascript
{
  publicExcludes: ['!noprecache/**/*'],
  cacheOnFrontEndNav: true,
  // Pages are automatically precached by next-pwa
}
```

---

### Cache 2: api-entries-v1

**Purpose**: API responses for entry data (offline viewing)

**Contents**:
- GET `/api/entries` (all entries)
- GET `/api/entries?from=...&to=...` (date range queries)
- GET `/api/entries/[id]` (single entry)

**Strategy**: Network-First with 10s timeout, fallback to cache

**TTL**: 24 hours (maxAgeSeconds: 86400)

**Max Entries**: 100 responses

**Size**: ~50-100 KB

**Configuration**:
```javascript
{
  urlPattern: /^\/api\/entries.*/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-entries-v1',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 86400 // 24 hours
    },
    networkTimeoutSeconds: 10,
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null; // Only cache 200 OK
      }
    }]
  }
}
```

---

### Cache 3: api-settings-v1

**Purpose**: User settings and preferences (rarely change)

**Contents**:
- GET `/api/settings` (user settings)
- GET `/api/settings/notifications` (notification preferences)

**Strategy**: Stale-While-Revalidate (show cached, update in background)

**TTL**: 1 hour (maxAgeSeconds: 3600)

**Max Entries**: 10 responses

**Size**: ~5 KB

**Configuration**:
```javascript
{
  urlPattern: /^\/api\/settings.*/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'api-settings-v1',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 3600 // 1 hour
    }
  }
}
```

---

### Cache 4: images-v1

**Purpose**: Static images (PWA icons, UI assets)

**Contents**:
- `/icons/*.png` (PWA icons)
- `/images/*.{png,jpg,svg}` (UI assets)
- Avatar images (if implemented)

**Strategy**: Cache-First with 30-day expiration

**Max Entries**: 60 images

**Size**: ~5-10 MB

**Configuration**:
```javascript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images-v1',
    expiration: {
      maxEntries: 60,
      maxAgeSeconds: 2592000 // 30 days
    }
  }
}
```

---

### Cache 5: google-fonts

**Purpose**: External Google Fonts (Inter font family)

**Contents**:
- `https://fonts.googleapis.com/css2?family=Inter:wght@...`
- `https://fonts.gstatic.com/s/inter/*.woff2`

**Strategy**: Cache-First with 1-year expiration

**Max Entries**: 4 font files

**Size**: ~200 KB

**Configuration**:
```javascript
{
  urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts',
    expiration: {
      maxEntries: 4,
      maxAgeSeconds: 31536000 // 1 year
    }
  }
}
```

---

## Sync Queue Workflow

### Entry States

```
┌─────────┐
│ Created │ (User creates entry offline)
└────┬────┘
     │
     v
┌─────────┐
│ Pending │ (Added to offlineEntries with syncStatus='pending')
└────┬────┘
     │ Online event triggered
     v
┌─────────┐
│ Syncing │ (syncStatus='syncing', API request sent)
└────┬────┘
     │
     ├─ Success ──> ┌────────┐
     │              │ Synced │ (Removed from queue, added to cachedEntries)
     │              └────────┘
     │
     └─ Failure ──> ┌────────┐
                    │ Failed │ (Retry with exponential backoff)
                    └───┬────┘
                        │ Retry after delay (5s, 10s, 20s, 1hr)
                        └──> Back to Syncing
```

### Conflict Resolution (FR-008a)

**Strategy**: Last-write-wins based on sync timestamp

```javascript
// Client sends sync timestamp in header
const response = await fetch('/api/entries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Sync-Timestamp': entry.createdAt.toString() // Client timestamp
  },
  body: JSON.stringify(entry.entryData)
});

// Server logic (pseudo-code)
async function syncEntry(userId, date, data, syncTimestamp) {
  const existing = await Entry.findOne({ userId, date });
  
  if (!existing) {
    // No conflict: Create new entry
    return await Entry.create({ userId, date, ...data });
  }
  
  const serverTimestamp = existing.updatedAt.getTime();
  
  if (syncTimestamp > serverTimestamp) {
    // Client data is newer: Overwrite server
    return await Entry.findByIdAndUpdate(existing._id, data, { new: true });
  } else {
    // Server data is newer: Reject client update
    return { conflict: true, serverData: existing };
  }
}
```

### Retry Logic (FR-015a)

**Delays**: 5 seconds → 10 seconds → 20 seconds → 1 hour (repeating)

```javascript
const RETRY_DELAYS = [5000, 10000, 20000, 3600000]; // ms

async function scheduleRetry(entry) {
  const delay = RETRY_DELAYS[Math.min(entry.syncAttempts, RETRY_DELAYS.length - 1)];
  
  await db.put('offlineEntries', {
    ...entry,
    syncStatus: 'pending',
    syncAttempts: entry.syncAttempts + 1,
    nextRetryAt: Date.now() + delay,
    error: null
  });
  
  // Schedule retry
  setTimeout(() => processSyncQueue(), delay);
}
```

---

## Storage Quotas & Limits

### IndexedDB

**Typical Quota**: 
- Chrome/Edge: ~80% of available disk space (temporary storage)
- Firefox: ~50% of free disk space (persistent storage)
- Safari: 1 GB (temporary), unlimited (persistent with user permission)

**Estimation**:
- offlineEntries: ~500 bytes per entry × 100 entries = ~50 KB
- cachedEntries: ~1 KB per entry × 90 entries × 1000 users = ~90 MB (worst case)
- syncMeta: ~1 KB total
- pushMeta: ~500 bytes per user

**Total Estimated**: ~90-100 MB (well within quota)

**Quota Management**:
```javascript
// Check available quota
const estimate = await navigator.storage.estimate();
console.log(`Used: ${estimate.usage} bytes`);
console.log(`Quota: ${estimate.quota} bytes`);
console.log(`Percentage: ${(estimate.usage / estimate.quota * 100).toFixed(2)}%`);

// Request persistent storage (optional)
if (navigator.storage && navigator.storage.persist) {
  const isPersisted = await navigator.storage.persist();
  console.log(`Persistent storage: ${isPersisted}`);
}

// Handle quota exceeded
try {
  await db.put('cachedEntries', entry);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    await evictOldEntries();
    await db.put('cachedEntries', entry); // Retry
  }
}
```

### Cache Storage

**Typical Quota**: Same as IndexedDB (shared quota in most browsers)

**Estimation**:
- app-shell-v1: ~2-5 MB
- api-entries-v1: ~50-100 KB
- api-settings-v1: ~5 KB
- images-v1: ~5-10 MB
- google-fonts: ~200 KB

**Total Estimated**: ~10-15 MB

**Cache Management**:
```javascript
// Cleanup old cache versions on SW activation
self.addEventListener('activate', event => {
  const cacheAllowlist = ['app-shell-v1', 'api-entries-v1', 'api-settings-v1', 'images-v1', 'google-fonts'];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheAllowlist.includes(cacheName)) {
            return caches.delete(cacheName); // Delete old versions
          }
        })
      );
    })
  );
});
```

---

## Testing Considerations

### Unit Tests

```javascript
// Test: IndexedDB schema creation
test('creates offlineEntries store with correct indexes', async () => {
  const db = await openDB('test-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('offlineEntries', { keyPath: 'id' });
      store.createIndex('syncStatus', 'syncStatus');
      store.createIndex('createdAt', 'createdAt');
    }
  });
  
  expect(db.objectStoreNames).toContain('offlineEntries');
  const tx = db.transaction('offlineEntries');
  expect(tx.store.indexNames).toContain('syncStatus');
});

// Test: Eviction policy
test('evicts entries older than 90 days', async () => {
  const oldEntry = { id: '1', cachedAt: Date.now() - (100 * 24 * 60 * 60 * 1000) };
  const newEntry = { id: '2', cachedAt: Date.now() };
  
  await db.put('cachedEntries', oldEntry);
  await db.put('cachedEntries', newEntry);
  
  await evictOldEntries();
  
  expect(await db.get('cachedEntries', '1')).toBeUndefined();
  expect(await db.get('cachedEntries', '2')).toBeDefined();
});
```

### Integration Tests

```javascript
// Test: Offline entry creation → sync
test('creates entry offline and syncs when online', async () => {
  // Simulate offline
  mockOnlineStatus(false);
  
  await createEntry({ date: '2025-10-24', firstMealTime: '12:00' });
  
  const pending = await db.getAllFromIndex('offlineEntries', 'syncStatus', 'pending');
  expect(pending).toHaveLength(1);
  
  // Simulate online
  mockOnlineStatus(true);
  window.dispatchEvent(new Event('online'));
  
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith('/api/entries', expect.any(Object));
  });
  
  const synced = await db.getAllFromIndex('offlineEntries', 'syncStatus', 'synced');
  expect(synced).toHaveLength(1);
});
```

---

## References

- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- idb library: https://github.com/jakearchibald/idb
- Cache Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Cache
- Storage quotas: https://web.dev/storage-for-the-web/
- Workbox caching: https://developer.chrome.com/docs/workbox/caching-strategies-overview/
