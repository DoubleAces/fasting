# Contract: IndexedDB Schema

**Feature**: 010-pwa-conversion  
**Type**: Client-Side Database Structure  
**Date**: October 24, 2025

## Overview

This contract defines the IndexedDB database schema, version management, transaction patterns, and operations for offline data storage. The database uses the `idb` Promise wrapper for cleaner API.

---

## Database Configuration

**Database Name**: `fasting-tracker`  
**Current Version**: 1  
**Library**: `idb` ^8.0.0 (Promise-based IndexedDB wrapper)

---

## Schema Definition

### Database Initialization

**Location**: `src/lib/pwa/indexeddb.js`

**Implementation**:
```javascript
import { openDB } from 'idb';

const DB_NAME = 'fasting-tracker';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[IndexedDB] Upgrading from v${oldVersion} to v${newVersion}`);
      
      // Create stores only if they don't exist
      if (!db.objectStoreNames.contains('offlineEntries')) {
        const offlineStore = db.createObjectStore('offlineEntries', { keyPath: 'id' });
        offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
        offlineStore.createIndex('date', 'date', { unique: false });
        offlineStore.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('cachedEntries')) {
        const cachedStore = db.createObjectStore('cachedEntries', { keyPath: 'id' });
        cachedStore.createIndex('userId', 'userId', { unique: false });
        cachedStore.createIndex('date', 'date', { unique: false });
        cachedStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains('pushMeta')) {
        db.createObjectStore('pushMeta', { keyPath: 'userId' });
      }
    },
    blocked() {
      console.warn('[IndexedDB] Database upgrade blocked by open connection');
    },
    blocking() {
      console.warn('[IndexedDB] This connection is blocking a database upgrade');
    },
    terminated() {
      console.error('[IndexedDB] Database connection terminated unexpectedly');
    }
  });
}
```

**Contract**:
- ✅ Database initialization MUST use `openDB()` from `idb`
- ✅ Upgrade callback MUST create stores only if they don't exist
- ✅ Indexes MUST be created during store creation (cannot be added later)
- ✅ `blocked`/`blocking`/`terminated` handlers MUST be defined for debugging

---

## Store 1: offlineEntries

### Purpose
Queue of entries created offline, pending server synchronization

### Schema
```typescript
interface OfflineEntry {
  id: string;                    // UUID (keyPath)
  userId: string;                // User._id
  date: string;                  // ISO 8601 date
  entryData: {
    firstMealTime: string;
    lastMealTime: string;
    fastingHours: number;
    waterIntake: number;
    weight: number | null;
    notes: string;
  };
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: number;             // Unix timestamp
  lastSyncAttempt: number | null;
  syncAttempts: number;
  nextRetryAt: number | null;
  error: string | null;
}
```

### Indexes
- `syncStatus` - Query by sync state
- `createdAt` - Order entries chronologically
- `date` - Check for duplicate entries
- `userId` - Filter by user

### Operations

**Add Offline Entry**:
```javascript
export async function addOfflineEntry(userId, date, entryData) {
  const db = await getDB();
  const entry = {
    id: crypto.randomUUID(),
    userId,
    date,
    entryData,
    syncStatus: 'pending',
    createdAt: Date.now(),
    lastSyncAttempt: null,
    syncAttempts: 0,
    nextRetryAt: null,
    error: null
  };
  
  await db.add('offlineEntries', entry);
  return entry;
}
```

**Contract**:
- ✅ Entry ID MUST be generated using `crypto.randomUUID()`
- ✅ `syncStatus` MUST default to `'pending'`
- ✅ `createdAt` MUST be current Unix timestamp
- ✅ Add operation MUST throw if entry with same ID exists

**Get Pending Entries**:
```javascript
export async function getPendingEntries() {
  const db = await getDB();
  return db.getAllFromIndex('offlineEntries', 'syncStatus', 'pending');
}
```

**Contract**:
- ✅ MUST use `getAllFromIndex()` for indexed queries
- ✅ MUST return array of entries (empty array if none found)

**Update Sync Status**:
```javascript
export async function updateSyncStatus(entryId, status, error = null) {
  const db = await getDB();
  const entry = await db.get('offlineEntries', entryId);
  
  if (!entry) {
    throw new Error(`Entry ${entryId} not found`);
  }
  
  await db.put('offlineEntries', {
    ...entry,
    syncStatus: status,
    lastSyncAttempt: Date.now(),
    syncAttempts: status === 'failed' ? entry.syncAttempts + 1 : entry.syncAttempts,
    error
  });
}
```

**Contract**:
- ✅ MUST verify entry exists before updating
- ✅ MUST increment `syncAttempts` only on failure
- ✅ MUST update `lastSyncAttempt` timestamp
- ✅ MUST use `put()` for updates (not `add()`)

**Delete Synced Entry**:
```javascript
export async function deleteSyncedEntry(entryId) {
  const db = await getDB();
  await db.delete('offlineEntries', entryId);
}
```

**Contract**:
- ✅ MUST remove entry after successful sync
- ✅ MUST NOT throw if entry doesn't exist (idempotent)

---

## Store 2: cachedEntries

### Purpose
Cached entries from server for offline viewing (90-day retention)

### Schema
```typescript
interface CachedEntry {
  id: string;                    // MongoDB _id (keyPath)
  userId: string;
  date: string;
  entryData: {
    firstMealTime: string;
    lastMealTime: string;
    fastingHours: number;
    waterIntake: number;
    weight: number | null;
    notes: string;
    createdAt: string;
    updatedAt: string;
  };
  cachedAt: number;              // Unix timestamp
  expiresAt: number;             // cachedAt + 90 days
}
```

### Indexes
- `userId` - Filter by user
- `date` - Query by date
- `cachedAt` - Eviction policy

### Operations

**Cache Entry**:
```javascript
export async function cacheEntry(serverEntry) {
  const db = await getDB();
  const cachedEntry = {
    id: serverEntry._id,
    userId: serverEntry.userId,
    date: serverEntry.date,
    entryData: serverEntry,
    cachedAt: Date.now(),
    expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
  };
  
  await db.put('cachedEntries', cachedEntry);
}
```

**Contract**:
- ✅ MUST use server `_id` as cache key
- ✅ `expiresAt` MUST be 90 days from `cachedAt`
- ✅ MUST use `put()` to upsert (overwrite if exists)

**Get User Entries**:
```javascript
export async function getCachedUserEntries(userId) {
  const db = await getDB();
  return db.getAllFromIndex('cachedEntries', 'userId', userId);
}
```

**Contract**:
- ✅ MUST return all entries for user (no pagination at IndexedDB level)
- ✅ MUST return empty array if no entries found

**Evict Old Entries**:
```javascript
export async function evictOldEntries() {
  const db = await getDB();
  const tx = db.transaction('cachedEntries', 'readwrite');
  const index = tx.store.index('cachedAt');
  
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const oldEntries = await index.getAll(IDBKeyRange.upperBound(ninetyDaysAgo));
  
  for (const entry of oldEntries) {
    await tx.store.delete(entry.id);
  }
  
  await tx.done;
  
  console.log(`[IndexedDB] Evicted ${oldEntries.length} old entries`);
  return oldEntries.length;
}
```

**Contract**:
- ✅ MUST use `IDBKeyRange.upperBound()` for range queries
- ✅ MUST use read-write transaction for deletions
- ✅ MUST commit transaction with `await tx.done`
- ✅ MUST return count of evicted entries

---

## Store 3: syncMeta

### Purpose
Metadata about sync operations (timestamps, errors, statistics)

### Schema
```typescript
interface SyncMetadata {
  key: string;                   // Metadata key (keyPath)
  value: any;                    // Metadata value (type varies)
  updatedAt: number;             // Unix timestamp
}
```

### Operations

**Set Metadata**:
```javascript
export async function setSyncMeta(key, value) {
  const db = await getDB();
  await db.put('syncMeta', {
    key,
    value,
    updatedAt: Date.now()
  });
}
```

**Contract**:
- ✅ MUST use `put()` to upsert metadata
- ✅ `updatedAt` MUST be current timestamp

**Get Metadata**:
```javascript
export async function getSyncMeta(key) {
  const db = await getDB();
  const meta = await db.get('syncMeta', key);
  return meta?.value;
}
```

**Contract**:
- ✅ MUST return `value` field only (unwrap metadata wrapper)
- ✅ MUST return `undefined` if key doesn't exist

---

## Store 4: pushMeta

### Purpose
Push notification subscription data per user

### Schema
```typescript
interface PushMetadata {
  userId: string;                // User._id (keyPath)
  subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  subscribedAt: number;
  lastNotificationAt: number | null;
  preferences: {
    fastingWindowReminder: boolean;
    dailyLog: boolean;
    weeklyReview: boolean;
  };
}
```

### Operations

**Save Subscription**:
```javascript
export async function savePushSubscription(userId, subscription, preferences) {
  const db = await getDB();
  await db.put('pushMeta', {
    userId,
    subscription: subscription.toJSON(),
    subscribedAt: Date.now(),
    lastNotificationAt: null,
    preferences
  });
}
```

**Contract**:
- ✅ Subscription MUST be serialized with `.toJSON()`
- ✅ Preferences MUST include all notification types
- ✅ `subscribedAt` MUST be current timestamp

**Get Subscription**:
```javascript
export async function getPushSubscription(userId) {
  const db = await getDB();
  return db.get('pushMeta', userId);
}
```

**Contract**:
- ✅ MUST return full push metadata object
- ✅ MUST return `undefined` if user has no subscription

---

## Transaction Patterns

### Read-Only Transaction

**Use Case**: Reading data without modifications

```javascript
const db = await getDB();
const tx = db.transaction('offlineEntries', 'readonly');
const entry = await tx.store.get(entryId);
await tx.done; // Optional for read-only
```

**Contract**:
- ✅ MUST use `'readonly'` mode for read operations
- ✅ `await tx.done` is optional but recommended
- ✅ MUST NOT attempt to modify data in readonly transaction

### Read-Write Transaction

**Use Case**: Modifying multiple stores atomically

```javascript
const db = await getDB();
const tx = db.transaction(['offlineEntries', 'syncMeta'], 'readwrite');

// Atomic operations
await tx.objectStore('offlineEntries').put(entry);
await tx.objectStore('syncMeta').put(metadata);

await tx.done; // REQUIRED for commit
```

**Contract**:
- ✅ MUST use `'readwrite'` mode for modifications
- ✅ MUST specify all stores being modified in transaction
- ✅ `await tx.done` is REQUIRED to commit changes
- ✅ Transaction auto-rolls back on unhandled errors

---

## Error Handling

### Quota Exceeded

**Trigger**: IndexedDB storage quota exceeded

**Handler**:
```javascript
try {
  await db.put('cachedEntries', entry);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.warn('[IndexedDB] Quota exceeded, evicting old entries');
    const evicted = await evictOldEntries();
    
    if (evicted > 0) {
      // Retry operation
      await db.put('cachedEntries', entry);
    } else {
      throw new Error('IndexedDB quota exceeded and no entries to evict');
    }
  } else {
    throw error;
  }
}
```

**Contract**:
- ✅ MUST catch `QuotaExceededError` specifically
- ✅ MUST attempt eviction before failing
- ✅ MUST retry operation after successful eviction
- ✅ MUST throw if no entries can be evicted

### Version Change Blocked

**Trigger**: Database upgrade blocked by open connections

**Handler**:
```javascript
// In openDB() options
{
  blocked() {
    console.warn('[IndexedDB] Upgrade blocked. Please close other tabs.');
    // Optionally: Show UI warning to user
    window.dispatchEvent(new CustomEvent('db-upgrade-blocked'));
  }
}
```

**Contract**:
- ✅ MUST notify user to close other tabs
- ✅ MUST NOT force-close other connections
- ✅ MAY dispatch custom event for UI handling

### Connection Terminated

**Trigger**: Database connection unexpectedly closed

**Handler**:
```javascript
{
  terminated() {
    console.error('[IndexedDB] Connection terminated');
    // Optionally: Clear cached DB instance, force reconnect
    cachedDB = null;
  }
}
```

**Contract**:
- ✅ MUST log error for debugging
- ✅ MUST clear cached DB instance
- ✅ Next operation will trigger reconnection

---

## Testing

### Unit Tests

```javascript
// Test: Database initialization
test('creates all required stores', async () => {
  const db = await getDB();
  
  expect(db.objectStoreNames.contains('offlineEntries')).toBe(true);
  expect(db.objectStoreNames.contains('cachedEntries')).toBe(true);
  expect(db.objectStoreNames.contains('syncMeta')).toBe(true);
  expect(db.objectStoreNames.contains('pushMeta')).toBe(true);
});

// Test: Add offline entry
test('adds offline entry with correct structure', async () => {
  const entry = await addOfflineEntry('user123', '2025-10-24', {
    firstMealTime: '12:00',
    lastMealTime: '20:00',
    fastingHours: 16,
    waterIntake: 2000,
    weight: 75.5,
    notes: 'Test'
  });
  
  expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/); // UUID format
  expect(entry.syncStatus).toBe('pending');
  expect(entry.createdAt).toBeGreaterThan(0);
});

// Test: Eviction policy
test('evicts entries older than 90 days', async () => {
  const db = await getDB();
  
  // Add old entry
  await db.put('cachedEntries', {
    id: 'old',
    userId: 'user123',
    date: '2025-01-01',
    entryData: {},
    cachedAt: Date.now() - (100 * 24 * 60 * 60 * 1000), // 100 days ago
    expiresAt: Date.now() - (10 * 24 * 60 * 60 * 1000)
  });
  
  // Add recent entry
  await db.put('cachedEntries', {
    id: 'recent',
    userId: 'user123',
    date: '2025-10-24',
    entryData: {},
    cachedAt: Date.now(),
    expiresAt: Date.now() + (90 * 24 * 60 * 60 * 1000)
  });
  
  const evicted = await evictOldEntries();
  
  expect(evicted).toBe(1);
  expect(await db.get('cachedEntries', 'old')).toBeUndefined();
  expect(await db.get('cachedEntries', 'recent')).toBeDefined();
});
```

### Integration Tests

```javascript
// Test: Offline entry → sync → cached entry
test('moves entry from offline queue to cache after sync', async () => {
  // Create offline entry
  const offline = await addOfflineEntry('user123', '2025-10-24', { ... });
  
  // Simulate successful sync
  await updateSyncStatus(offline.id, 'synced');
  
  // Cache server response
  await cacheEntry({
    _id: 'server123',
    userId: 'user123',
    date: '2025-10-24',
    ...offline.entryData
  });
  
  // Delete from offline queue
  await deleteSyncedEntry(offline.id);
  
  // Verify state
  expect(await getPendingEntries()).toHaveLength(0);
  
  const cached = await getCachedUserEntries('user123');
  expect(cached).toHaveLength(1);
  expect(cached[0].id).toBe('server123');
});
```

---

## Migration Strategy

### Version 2 (Future)

**Example**: Add `lastModified` index to `cachedEntries`

```javascript
if (oldVersion < 2 && newVersion >= 2) {
  const tx = transaction.objectStore('cachedEntries');
  tx.createIndex('lastModified', 'entryData.updatedAt', { unique: false });
}
```

**Contract**:
- ✅ Version checks MUST use `oldVersion < X && newVersion >= X`
- ✅ Migrations MUST be additive (no data loss)
- ✅ Migrations MUST handle existing data gracefully
- ✅ Breaking changes REQUIRE new store with data migration

---

## References

- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- idb library: https://github.com/jakearchibald/idb
- Storage quotas: https://web.dev/storage-for-the-web/
- Transaction guide: https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction
