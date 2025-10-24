/**
 * Sync Service
 * High-level abstraction over sync queue operations
 * Provides simplified interface for UI components and hooks
 */

import {
  processSyncQueue,
  getSyncQueueStats,
} from '@/lib/pwa/syncQueue';
import { getPendingEntries, deleteSyncedEntry } from '@/lib/pwa/indexeddb';

/**
 * Trigger sync operation
 * Wraps processSyncQueue with error handling
 * @returns {Promise<{ synced: number, failed: number }>} Sync results
 * @throws {Error} If sync fails critically
 */
export async function sync() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Sync can only be called in browser environment');
    }

    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }

    const result = await processSyncQueue();
    return result;
  } catch (error) {
    console.error('[SyncService] Sync failed:', error);
    throw new Error(`Sync operation failed: ${error.message}`);
  }
}

/**
 * Get current sync queue status
 * @returns {Promise<{ queueLength: number, syncing: boolean }>} Queue status
 * @throws {Error} If unable to get status
 */
export async function getQueueStatus() {
  try {
    if (typeof window === 'undefined') {
      return { queueLength: 0, syncing: false };
    }

    const stats = await getSyncQueueStats();
    return stats;
  } catch (error) {
    console.error('[SyncService] Failed to get queue status:', error);
    throw new Error(`Failed to get queue status: ${error.message}`);
  }
}

/**
 * Get detailed queue information
 * Includes list of pending entries
 * @returns {Promise<{ pending: Array, failed: Array, total: number }>} Detailed queue info
 * @throws {Error} If unable to get queue details
 */
export async function getQueueDetails() {
  try {
    if (typeof window === 'undefined') {
      return { pending: [], failed: [], total: 0 };
    }

    const pending = await getPendingEntries();
    const failed = pending.filter(entry => 
      entry.syncStatus === 'failed' && entry.retryCount >= 10
    );
    const retrying = pending.filter(entry => 
      entry.syncStatus === 'failed' && entry.retryCount < 10
    );

    return {
      pending: retrying,
      failed,
      total: pending.length,
    };
  } catch (error) {
    console.error('[SyncService] Failed to get queue details:', error);
    throw new Error(`Failed to get queue details: ${error.message}`);
  }
}

/**
 * Clear all entries from sync queue
 * ADMIN FUNCTION - Use with caution
 * @param {boolean} force - If true, clears even pending entries
 * @returns {Promise<number>} Number of entries cleared
 * @throws {Error} If unable to clear queue
 */
export async function clearQueue(force = false) {
  try {
    if (typeof window === 'undefined') {
      throw new Error('clearQueue can only be called in browser environment');
    }

    const entries = await getPendingEntries();
    
    let clearedCount = 0;
    for (const entry of entries) {
      // Only clear failed entries unless force is true
      if (force || (entry.syncStatus === 'failed' && entry.retryCount >= 10)) {
        await deleteSyncedEntry(entry.id);
        clearedCount++;
      }
    }

    console.log(`[SyncService] Cleared ${clearedCount} entries from queue`);
    return clearedCount;
  } catch (error) {
    console.error('[SyncService] Failed to clear queue:', error);
    throw new Error(`Failed to clear queue: ${error.message}`);
  }
}

/**
 * Retry a single entry by ID
 * Useful for manual intervention on failed entries
 * @param {string} entryId - ID of entry to retry
 * @returns {Promise<boolean>} True if retry succeeded
 * @throws {Error} If retry fails
 */
export async function retrySingleEntry(entryId) {
  try {
    if (typeof window === 'undefined') {
      throw new Error('retrySingleEntry can only be called in browser environment');
    }

    if (!navigator.onLine) {
      throw new Error('Cannot retry while offline');
    }

    // processSyncQueue will handle the individual entry sync
    const result = await processSyncQueue();
    
    // Check if the specific entry was synced
    const remaining = await getPendingEntries();
    const entryStillPending = remaining.some(e => e.id === entryId);
    
    return !entryStillPending;
  } catch (error) {
    console.error('[SyncService] Failed to retry entry:', error);
    throw new Error(`Failed to retry entry: ${error.message}`);
  }
}

export default {
  sync,
  getQueueStatus,
  getQueueDetails,
  clearQueue,
  retrySingleEntry,
};
