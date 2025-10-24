# Contract: Sync Strategy

**Feature**: 010-pwa-conversion  
**Type**: Offline-to-Online Data Synchronization  
**Date**: October 24, 2025

## Overview

This contract defines the offline sync workflow, queue management, retry strategy with exponential backoff, conflict resolution algorithm (last-write-wins), and sync trigger conditions. All sync operations follow test-driven development principles.

---

## Sync Queue Structure

### Queue Entry States

```
┌─────────┐ User creates entry offline
│ Created │
└────┬────┘
     │
     v
┌─────────┐ Added to IndexedDB offlineEntries
│ Pending │ syncStatus = 'pending'
└────┬────┘
     │ Online event OR manual trigger
     v
┌─────────┐ API request in flight
│ Syncing │ syncStatus = 'syncing'
└────┬────┘
     │
     ├─ Success ──> ┌────────┐
     │              │ Synced │ Moved to cachedEntries, removed from queue
     │              └────────┘
     │
     └─ Failure ──> ┌────────┐
                    │ Failed │ Retry with exponential backoff
                    └───┬────┘
                        │ Wait delay (5s, 10s, 20s, 1hr)
                        └──> Back to Syncing
```

### Queue Entry Structure

```typescript
interface QueueEntry {
  id: string;                    // UUID
  userId: string;
  date: string;
  entryData: EntryPayload;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: number;             // Client timestamp (used for conflict resolution)
  lastSyncAttempt: number | null;
  syncAttempts: number;          // 0-indexed (0 = first attempt)
  nextRetryAt: number | null;    // Unix timestamp for next retry
  error: string | null;          // Last error message
}
```

**Contract**:
- ✅ Queue entries MUST include `createdAt` for conflict resolution
- ✅ `syncAttempts` MUST start at 0
- ✅ `nextRetryAt` MUST be calculated using exponential backoff
- ✅ `error` MUST be populated on sync failure

---

## Sync Trigger Conditions

### 1. Online Event (Primary Trigger)

**Event**: Browser detects network connectivity restored

**Implementation**:
```javascript
// src/lib/pwa/syncQueue.js
export function initSyncTriggers() {
  window.addEventListener('online', async () => {
    console.log('[Sync] Network online, processing queue');
    await processSyncQueue();
  });
  
  // Also check on page load if already online
  if (navigator.onLine) {
    processSyncQueue();
  }
}
```

**Contract**:
- ✅ MUST register `online` event listener on app initialization
- ✅ MUST check `navigator.onLine` on page load
- ✅ MUST NOT trigger if already syncing (prevent duplicate requests)
- ✅ MUST process queue asynchronously (non-blocking)

---

### 2. Manual Trigger

**Event**: User clicks "Sync Now" button in UI

**Implementation**:
```javascript
// useSyncQueue.js hook
export function useSyncQueue() {
  const [syncing, setSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  
  const triggerSync = async () => {
    if (syncing) return; // Prevent duplicate
    
    setSyncing(true);
    try {
      await processSyncQueue();
    } finally {
      setSyncing(false);
      setQueueLength(await getPendingCount());
    }
  };
  
  return { syncing, queueLength, triggerSync };
}
```

**Contract**:
- ✅ Manual trigger MUST check `syncing` state to prevent duplicates
- ✅ Manual trigger MUST update UI sync indicator
- ✅ Manual trigger MUST work regardless of online status (will fail gracefully if offline)
- ✅ Manual trigger MUST update queue length after sync

---

### 3. Periodic Check (Background)

**Event**: Every 5 minutes while app is open

**Implementation**:
```javascript
// Only run in browser, not SSR
if (typeof window !== 'undefined') {
  setInterval(async () => {
    if (navigator.onLine) {
      const pendingCount = await getPendingCount();
      if (pendingCount > 0) {
        console.log(`[Sync] Periodic check: ${pendingCount} pending`);
        await processSyncQueue();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}
```

**Contract**:
- ✅ Periodic check MUST only run in browser (not server-side)
- ✅ Periodic check MUST verify online status before syncing
- ✅ Periodic check MUST check queue length before syncing (skip if empty)
- ✅ Interval MUST be 5 minutes (configurable via constant)

---

### 4. Background Sync API (Progressive Enhancement)

**Event**: Service worker triggers sync when connectivity restored

**Implementation**:
```javascript
// Register background sync (where supported)
if ('serviceWorker' in navigator && 'sync' in self.registration) {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-entries');
}

// Service worker handler
self.addEventListener('sync', event => {
  if (event.tag === 'sync-entries') {
    event.waitUntil(processSyncQueue());
  }
});
```

**Contract**:
- ✅ Background Sync MUST be feature-detected before use
- ✅ Background Sync MUST be progressive enhancement (not required for core functionality)
- ✅ Sync tag MUST be `'sync-entries'` (consistent naming)
- ✅ Service worker MUST use `event.waitUntil()` to keep sync alive

---

## Sync Processing Algorithm

### Main Queue Processor

**Location**: `src/lib/pwa/syncQueue.js`

**Implementation**:
```javascript
let syncInProgress = false; // Prevent concurrent syncs

export async function processSyncQueue() {
  // Prevent concurrent sync operations
  if (syncInProgress) {
    console.log('[Sync] Already in progress, skipping');
    return;
  }
  
  syncInProgress = true;
  
  try {
    const pendingEntries = await getPendingEntries();
    
    if (pendingEntries.length === 0) {
      console.log('[Sync] Queue empty');
      return;
    }
    
    console.log(`[Sync] Processing ${pendingEntries.length} entries`);
    
    for (const entry of pendingEntries) {
      // Check if retry delay has passed
      if (entry.nextRetryAt && Date.now() < entry.nextRetryAt) {
        console.log(`[Sync] Skipping ${entry.id}, retry at ${new Date(entry.nextRetryAt)}`);
        continue;
      }
      
      await syncEntry(entry);
    }
    
    console.log('[Sync] Queue processing complete');
  } catch (error) {
    console.error('[Sync] Queue processing error:', error);
  } finally {
    syncInProgress = false;
  }
}
```

**Contract**:
- ✅ MUST use mutex (`syncInProgress`) to prevent concurrent syncs
- ✅ MUST skip entries where `nextRetryAt > Date.now()`
- ✅ MUST process entries sequentially (not parallel)
- ✅ MUST handle errors gracefully (log, don't throw)
- ✅ MUST reset `syncInProgress` in finally block

---

### Individual Entry Sync

**Implementation**:
```javascript
async function syncEntry(entry) {
  try {
    // Update status to 'syncing'
    await updateSyncStatus(entry.id, 'syncing');
    
    // Make API request with sync timestamp header
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Timestamp': entry.createdAt.toString(), // For conflict resolution
        'Authorization': `Bearer ${await getAccessToken()}` // From NextAuth
      },
      body: JSON.stringify({
        date: entry.date,
        ...entry.entryData
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const serverEntry = await response.json();
    
    // Success: Move to cached entries
    await cacheEntry(serverEntry);
    await deleteSyncedEntry(entry.id);
    await setSyncMeta('lastSuccessfulSync', Date.now());
    
    console.log(`[Sync] ✓ Entry ${entry.id} synced successfully`);
    
  } catch (error) {
    console.error(`[Sync] ✗ Entry ${entry.id} failed:`, error.message);
    
    // Schedule retry with exponential backoff
    await scheduleRetry(entry, error.message);
  }
}
```

**Contract**:
- ✅ MUST update status to `'syncing'` before request
- ✅ MUST include `X-Sync-Timestamp` header for conflict resolution
- ✅ MUST include authentication token from NextAuth session
- ✅ MUST move to `cachedEntries` on success
- ✅ MUST delete from `offlineEntries` on success
- ✅ MUST schedule retry on failure (with exponential backoff)

---

## Exponential Backoff Retry (FR-015a)

### Retry Delay Schedule

**Delays**: 5 seconds → 10 seconds → 20 seconds → 1 hour (repeating)

```javascript
const RETRY_DELAYS = [
  5 * 1000,        // 5 seconds (1st retry)
  10 * 1000,       // 10 seconds (2nd retry)
  20 * 1000,       // 20 seconds (3rd retry)
  60 * 60 * 1000   // 1 hour (4th+ retries)
];

const MAX_RETRY_ATTEMPTS = 10; // Stop after 10 attempts (prevent infinite loop)
```

### Retry Scheduler

**Implementation**:
```javascript
async function scheduleRetry(entry, errorMessage) {
  const nextAttempt = entry.syncAttempts + 1;
  
  // Stop retrying after max attempts
  if (nextAttempt >= MAX_RETRY_ATTEMPTS) {
    await updateSyncStatus(entry.id, 'failed', `Max retries exceeded: ${errorMessage}`);
    await logCriticalError('sync-max-retries', errorMessage, {
      entryId: entry.id,
      attempts: nextAttempt
    });
    return;
  }
  
  // Calculate delay using exponential backoff
  const delayIndex = Math.min(nextAttempt - 1, RETRY_DELAYS.length - 1);
  const delay = RETRY_DELAYS[delayIndex];
  const nextRetryAt = Date.now() + delay;
  
  // Update entry with retry metadata
  await db.put('offlineEntries', {
    ...entry,
    syncStatus: 'pending',
    syncAttempts: nextAttempt,
    nextRetryAt,
    lastSyncAttempt: Date.now(),
    error: errorMessage
  });
  
  console.log(`[Sync] Retry scheduled for ${entry.id} at ${new Date(nextRetryAt)} (attempt ${nextAttempt})`);
  
  // Schedule next sync attempt
  setTimeout(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, delay);
}
```

**Contract**:
- ✅ Retry delays MUST follow pattern: 5s, 10s, 20s, 1hr, 1hr, ...
- ✅ MUST stop retrying after `MAX_RETRY_ATTEMPTS` (default 10)
- ✅ MUST update `syncAttempts`, `nextRetryAt`, `error` fields
- ✅ MUST log critical error when max retries exceeded
- ✅ MUST use `setTimeout()` to schedule next retry
- ✅ MUST check online status before retrying

---

## Conflict Resolution (FR-008a)

### Last-Write-Wins Strategy

**Decision Rule**: Entry with latest `createdAt`/`updatedAt` timestamp wins

### Client-Side Implementation

```javascript
// Client sends sync timestamp in header
const response = await fetch('/api/entries', {
  method: 'POST',
  headers: {
    'X-Sync-Timestamp': entry.createdAt.toString() // Unix timestamp
  },
  body: JSON.stringify(entryData)
});
```

**Contract**:
- ✅ Client MUST send `X-Sync-Timestamp` header with request
- ✅ Timestamp MUST be Unix timestamp (milliseconds since epoch)
- ✅ Timestamp MUST be `createdAt` of offline entry (not current time)

---

### Server-Side Implementation

**Location**: `src/app/api/entries/route.js`

**Implementation**:
```javascript
export async function POST(request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const syncTimestamp = parseInt(request.headers.get('X-Sync-Timestamp') || '0');
  const { date, ...entryData } = await request.json();
  
  // Check for existing entry
  const existing = await Entry.findOne({
    userId: session.user.id,
    date
  });
  
  if (!existing) {
    // No conflict: Create new entry
    const newEntry = await Entry.create({
      userId: session.user.id,
      date,
      ...entryData
    });
    return NextResponse.json(newEntry, { status: 201 });
  }
  
  // Conflict detected: Compare timestamps
  const serverTimestamp = existing.updatedAt.getTime();
  
  if (syncTimestamp > serverTimestamp) {
    // Client data is newer: Overwrite server
    const updated = await Entry.findByIdAndUpdate(
      existing._id,
      { ...entryData, updatedAt: new Date(syncTimestamp) },
      { new: true }
    );
    
    console.log(`[Sync] Conflict resolved: Client wins (${syncTimestamp} > ${serverTimestamp})`);
    return NextResponse.json(updated, { status: 200 });
  } else {
    // Server data is newer: Reject client update
    console.log(`[Sync] Conflict resolved: Server wins (${serverTimestamp} > ${syncTimestamp})`);
    return NextResponse.json(existing, { 
      status: 200,
      headers: { 'X-Conflict-Resolved': 'server-wins' }
    });
  }
}
```

**Contract**:
- ✅ Server MUST check for existing entry with same `userId` + `date`
- ✅ Server MUST compare `X-Sync-Timestamp` with `existing.updatedAt`
- ✅ Client data wins if `syncTimestamp > serverTimestamp`
- ✅ Server data wins if `serverTimestamp >= syncTimestamp`
- ✅ Server MUST return HTTP 200 (not 409 Conflict) for resolved conflicts
- ✅ Server MUST include `X-Conflict-Resolved` header when server wins
- ✅ Server MUST log conflict resolution decision

---

### Client Conflict Handling

```javascript
async function syncEntry(entry) {
  const response = await fetch('/api/entries', { ... });
  const serverEntry = await response.json();
  
  // Check if server won conflict
  const conflictResolved = response.headers.get('X-Conflict-Resolved');
  
  if (conflictResolved === 'server-wins') {
    console.log(`[Sync] Server data was newer, discarding client entry ${entry.id}`);
    
    // Cache server version (don't overwrite)
    await cacheEntry(serverEntry);
    
    // Remove from offline queue
    await deleteSyncedEntry(entry.id);
    
    // Notify user (optional)
    window.dispatchEvent(new CustomEvent('sync-conflict-resolved', {
      detail: { entryId: entry.id, winner: 'server' }
    }));
  } else {
    // Client won or no conflict
    await cacheEntry(serverEntry);
    await deleteSyncedEntry(entry.id);
  }
}
```

**Contract**:
- ✅ Client MUST check `X-Conflict-Resolved` header
- ✅ Client MUST cache server entry regardless of conflict outcome
- ✅ Client MUST remove offline entry from queue
- ✅ Client MAY notify user of conflict resolution (optional)

---

## Error Handling

### Network Errors

**Types**: DNS failure, timeout, connection refused

**Handling**:
```javascript
catch (error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    // Network error (no response from server)
    await scheduleRetry(entry, 'Network unavailable');
  } else {
    throw error;
  }
}
```

**Contract**:
- ✅ Network errors MUST trigger retry with backoff
- ✅ Network errors MUST NOT be logged as critical (expected offline behavior)

---

### HTTP Errors

**Types**: 4xx client errors, 5xx server errors

**Handling**:
```javascript
if (!response.ok) {
  const errorText = await response.text();
  
  if (response.status >= 500) {
    // Server error: Retry
    throw new Error(`Server error ${response.status}: ${errorText}`);
  } else if (response.status === 401) {
    // Authentication error: Don't retry, log critical
    await updateSyncStatus(entry.id, 'failed', 'Authentication failed');
    await logCriticalError('sync-auth-failed', 'User session expired', {
      entryId: entry.id
    });
  } else if (response.status === 400) {
    // Bad request: Don't retry, log critical
    await updateSyncStatus(entry.id, 'failed', `Invalid data: ${errorText}`);
    await logCriticalError('sync-bad-request', errorText, {
      entryId: entry.id,
      entryData: entry.entryData
    });
  } else {
    // Other client error: Retry
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
}
```

**Contract**:
- ✅ 5xx errors MUST trigger retry (temporary server issue)
- ✅ 401 errors MUST NOT retry (auth token expired)
- ✅ 400 errors MUST NOT retry (invalid data)
- ✅ 401/400 errors MUST log as critical (requires manual intervention)
- ✅ Other 4xx errors MAY retry (could be transient)

---

## Testing

### Unit Tests

```javascript
// Test: Exponential backoff calculation
test('calculates correct retry delays', () => {
  expect(getRetryDelay(0)).toBe(5000);  // 1st retry: 5s
  expect(getRetryDelay(1)).toBe(10000); // 2nd retry: 10s
  expect(getRetryDelay(2)).toBe(20000); // 3rd retry: 20s
  expect(getRetryDelay(3)).toBe(3600000); // 4th retry: 1hr
  expect(getRetryDelay(10)).toBe(3600000); // 11th retry: still 1hr
});

// Test: Max retries
test('stops retrying after max attempts', async () => {
  const entry = { id: '123', syncAttempts: 9 };
  
  await scheduleRetry(entry, 'Test error');
  
  const updated = await db.get('offlineEntries', '123');
  expect(updated.syncStatus).toBe('failed');
  expect(updated.error).toContain('Max retries exceeded');
});

// Test: Conflict resolution
test('client data overwrites when timestamp is newer', async () => {
  const clientTimestamp = Date.now();
  const serverTimestamp = clientTimestamp - 10000; // 10s older
  
  const result = await resolveConflict(clientTimestamp, serverTimestamp);
  
  expect(result.winner).toBe('client');
});
```

### Integration Tests

```javascript
// Test: Full sync flow
test('syncs offline entry when online', async () => {
  // Create offline entry
  const entry = await addOfflineEntry('user123', '2025-10-24', {
    firstMealTime: '12:00',
    lastMealTime: '20:00',
    fastingHours: 16
  });
  
  // Mock API response
  fetchMock.post('/api/entries', {
    status: 201,
    body: { _id: 'server123', ...entry.entryData }
  });
  
  // Trigger sync
  await processSyncQueue();
  
  // Verify entry removed from queue
  const pending = await getPendingEntries();
  expect(pending).toHaveLength(0);
  
  // Verify entry cached
  const cached = await getCachedUserEntries('user123');
  expect(cached).toHaveLength(1);
  expect(cached[0].id).toBe('server123');
});

// Test: Retry on failure
test('retries with exponential backoff on network failure', async () => {
  const entry = await addOfflineEntry('user123', '2025-10-24', { ... });
  
  fetchMock.post('/api/entries', { throws: new TypeError('Network request failed') });
  
  // 1st attempt
  await processSyncQueue();
  let updated = await db.get('offlineEntries', entry.id);
  expect(updated.syncAttempts).toBe(1);
  expect(updated.nextRetryAt).toBeCloseTo(Date.now() + 5000, -2); // ~5s
  
  // 2nd attempt (after 5s)
  jest.advanceTimersByTime(5000);
  await processSyncQueue();
  updated = await db.get('offlineEntries', entry.id);
  expect(updated.syncAttempts).toBe(2);
  expect(updated.nextRetryAt).toBeCloseTo(Date.now() + 10000, -2); // ~10s
});
```

---

## References

- Background Sync API: https://developer.chrome.com/articles/background-sync/
- Exponential backoff: https://cloud.google.com/iot/docs/how-tos/exponential-backoff
- Conflict resolution strategies: https://martin.kleppmann.com/papers/chapter3-cidr15.pdf
