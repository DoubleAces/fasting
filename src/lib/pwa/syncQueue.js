import {
  getPendingEntries,
  updateSyncStatus,
  deleteSyncedEntry,
  cacheEntry,
  setSyncMeta,
} from './indexeddb';

// Mutex to prevent concurrent sync operations
let syncInProgress = false;

// Maximum retry attempts before giving up
const MAX_RETRY_ATTEMPTS = 10;

// Retry delays in milliseconds: 5s, 10s, 20s, then 1hr for all subsequent
const RETRY_DELAYS = [5000, 10000, 20000, 3600000]; // 5s, 10s, 20s, 1hr

/**
 * Process the offline sync queue
 * Syncs all pending entries to the server
 * @returns {Promise<void>}
 */
export async function processSyncQueue() {
  // Prevent concurrent sync operations
  if (syncInProgress) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  // Check if online
  if (!navigator.onLine) {
    console.log('📵 Offline, skipping sync');
    return;
  }

  syncInProgress = true;
  console.log('🔄 Starting sync queue processing...');

  try {
    const pendingEntries = await getPendingEntries();

    if (pendingEntries.length === 0) {
      console.log('✓ No pending entries to sync');
      return;
    }

    console.log(`📋 Found ${pendingEntries.length} pending entries`);

    // Process entries sequentially to maintain order
    for (const entry of pendingEntries) {
      // Skip if next retry time hasn't arrived yet
      if (entry.nextRetryAt && new Date(entry.nextRetryAt) > new Date()) {
        console.log(`⏰ Entry ${entry.id} scheduled for retry later`);
        continue;
      }

      await syncEntry(entry);
    }

    // Update last sync time
    await setSyncMeta('lastSyncTime', new Date().toISOString());
    console.log('✓ Sync queue processing complete');
  } catch (error) {
    console.error('❌ Sync queue processing failed:', error);
    await setSyncMeta('lastSyncError', error.message);
  } finally {
    syncInProgress = false;
  }
}

/**
 * Sync a single entry to the server
 * @param {object} entry - Offline entry to sync
 * @returns {Promise<void>}
 */
export async function syncEntry(entry) {
  console.log(`🔄 Syncing entry ${entry.id}...`);

  try {
    // Update status to syncing
    await updateSyncStatus(entry.id, 'syncing');

    // Get authentication token from NextAuth
    const session = await fetch('/api/auth/session').then((r) => r.json());
    
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Prepare entry data for API
    const entryData = {
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      notes: entry.notes,
    };

    // Make API request to create entry
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Timestamp': entry.createdAt,
      },
      body: JSON.stringify(entryData),
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Create error object with status code
      const apiError = new Error(error.message || `API error: ${response.status}`);
      apiError.status = response.status;
      throw apiError;
    }

    const serverEntry = await response.json();
    console.log(`✓ Entry ${entry.id} synced successfully`);

    // Cache the server entry for offline access
    await cacheEntry(serverEntry);

    // Remove from offline queue
    await deleteSyncedEntry(entry.id);

    // Update sync stats
    const syncCount = (await import('./indexeddb').then(m => m.getSyncMeta('successCount'))) || 0;
    await setSyncMeta('successCount', syncCount + 1);
  } catch (error) {
    console.error(`❌ Failed to sync entry ${entry.id}:`, error.message);

    // Determine error handling strategy based on error type
    const shouldRetry = determineRetryStrategy(error);

    if (!shouldRetry) {
      // Critical errors that should not retry
      console.error(`🚫 Non-retryable error for entry ${entry.id}`);
      await updateSyncStatus(entry.id, 'error', `Non-retryable error: ${error.message}`);
      await setSyncMeta('failedCount', ((await import('./indexeddb').then(m => m.getSyncMeta('failedCount'))) || 0) + 1);
      
      // Log critical error to server
      if (typeof window !== 'undefined') {
        try {
          const { logCriticalError } = await import('@/lib/utils/errorLogger');
          await logCriticalError('sync', error.message, {
            entryId: entry.id,
            status: error.status,
            date: entry.date,
          });
        } catch (logError) {
          console.error('Failed to log critical error:', logError);
        }
      }
      return;
    }

    // Check if max retries exceeded
    if (entry.syncAttempts >= MAX_RETRY_ATTEMPTS) {
      console.error(`🚫 Max retries exceeded for entry ${entry.id}`);
      await updateSyncStatus(entry.id, 'error', `Max retries exceeded: ${error.message}`);
      await setSyncMeta('failedCount', ((await import('./indexeddb').then(m => m.getSyncMeta('failedCount'))) || 0) + 1);
      
      // Log as critical error
      if (typeof window !== 'undefined') {
        try {
          const { logCriticalError } = await import('@/lib/utils/errorLogger');
          await logCriticalError('sync', `Max retries exceeded: ${error.message}`, {
            entryId: entry.id,
            attempts: entry.syncAttempts,
          });
        } catch (logError) {
          console.error('Failed to log critical error:', logError);
        }
      }
      return;
    }

    // Schedule retry with exponential backoff
    await scheduleRetry(entry, error.message);
  }
}

/**
 * Determine if error should trigger retry or fail permanently
 * @param {Error} error - Error object
 * @returns {boolean} True if should retry
 */
function determineRetryStrategy(error) {
  // Network errors (TypeError from fetch) - always retry
  if (error instanceof TypeError) {
    console.log('[Retry] Network error - will retry');
    return true;
  }

  // Check HTTP status code
  const status = error.status;

  if (!status) {
    // Unknown error - retry to be safe
    console.log('[Retry] Unknown error - will retry');
    return true;
  }

  // 401 Unauthorized - Don't retry (session expired, user needs to re-auth)
  if (status === 401) {
    console.log('[Retry] 401 Unauthorized - will NOT retry (session expired)');
    return false;
  }

  // 400 Bad Request - Don't retry (likely data validation issue)
  if (status === 400) {
    console.log('[Retry] 400 Bad Request - will NOT retry (validation error)');
    return false;
  }

  // 5xx Server Errors - Retry (temporary server issue)
  if (status >= 500 && status < 600) {
    console.log(`[Retry] ${status} Server Error - will retry`);
    return true;
  }

  // Other 4xx errors (403, 404, etc.) - Retry (might be temporary)
  if (status >= 400 && status < 500) {
    console.log(`[Retry] ${status} Client Error - will retry`);
    return true;
  }

  // Default: retry
  return true;
}

/**
 * Schedule a retry for a failed sync with exponential backoff
 * @param {object} entry - Entry that failed to sync
 * @param {string} errorMessage - Error message
 * @returns {Promise<void>}
 */
export async function scheduleRetry(entry, errorMessage) {
  const attemptIndex = Math.min(entry.syncAttempts, RETRY_DELAYS.length - 1);
  const delay = RETRY_DELAYS[attemptIndex];
  const nextRetryAt = new Date(Date.now() + delay).toISOString();

  console.log(
    `⏰ Scheduling retry ${entry.syncAttempts + 1}/${MAX_RETRY_ATTEMPTS} ` +
    `for entry ${entry.id} in ${delay / 1000}s`
  );

  // Update entry with retry info
  await updateSyncStatus(entry.id, 'pending', errorMessage);
  
  // Update nextRetryAt separately
  const { getDB } = await import('./indexeddb');
  const db = await getDB();
  const tx = db.transaction('offlineEntries', 'readwrite');
  const entryToUpdate = await tx.store.get(entry.id);
  if (entryToUpdate) {
    entryToUpdate.nextRetryAt = nextRetryAt;
    await tx.store.put(entryToUpdate);
    await tx.done;
  }

  // Schedule next sync attempt
  setTimeout(() => {
    if (navigator.onLine) {
      processSyncQueue().catch((err) => {
        console.error('Scheduled sync failed:', err);
      });
    }
  }, delay);
}

/**
 * Initialize sync triggers (online event, page load)
 * Call this in app layout on mount
 */
export function initSyncTriggers() {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('🔧 Initializing sync triggers...');

  // Trigger sync when coming online
  window.addEventListener('online', () => {
    console.log('🌐 Network restored, triggering sync...');
    processSyncQueue().catch((error) => {
      console.error('Online sync trigger failed:', error);
    });
  });

  // Trigger sync on page load if already online
  if (navigator.onLine) {
    console.log('🌐 Online at startup, checking sync queue...');
    setTimeout(() => {
      processSyncQueue().catch((error) => {
        console.error('Initial sync check failed:', error);
      });
    }, 2000); // Small delay to allow app to initialize
  }

  // Register Background Sync API if supported (progressive enhancement)
  registerBackgroundSync();

  console.log('✓ Sync triggers initialized');
}

/**
 * Register Background Sync API (progressive enhancement)
 * Only works in browsers that support it (Chrome/Edge)
 */
export async function registerBackgroundSync() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Check if service worker and sync API are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[BackgroundSync] Service Worker not supported');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    if (!('sync' in registration)) {
      console.log('[BackgroundSync] Background Sync API not supported (falling back to online event)');
      return;
    }

    // Register sync with tag
    await registration.sync.register('sync-entries');
    console.log('✓ Background Sync registered successfully');
  } catch (error) {
    console.error('[BackgroundSync] Registration failed:', error);
  }
}

/**
 * Get current sync queue statistics
 * @returns {Promise<object>} Queue stats
 */
export async function getSyncQueueStats() {
  try {
    const pendingEntries = await getPendingEntries();
    return {
      queueLength: pendingEntries.length,
      syncing: syncInProgress,
    };
  } catch (error) {
    console.error('Failed to get sync queue stats:', error);
    return {
      queueLength: 0,
      syncing: false,
    };
  }
}
