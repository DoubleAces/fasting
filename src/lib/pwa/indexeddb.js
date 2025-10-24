import { openDB } from 'idb';

const DB_NAME = 'fasting-tracker';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Get or initialize IndexedDB database instance
 * @returns {Promise<IDBDatabase>}
 */
export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading DB from v${oldVersion} to v${newVersion}`);

        // Create offlineEntries store for entries created while offline
        if (!db.objectStoreNames.contains('offlineEntries')) {
          const offlineStore = db.createObjectStore('offlineEntries', {
            keyPath: 'id',
          });
          offlineStore.createIndex('userId', 'userId', { unique: false });
          offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          offlineStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create cachedEntries store for server entries cached for offline access
        if (!db.objectStoreNames.contains('cachedEntries')) {
          const cacheStore = db.createObjectStore('cachedEntries', {
            keyPath: 'id',
          });
          cacheStore.createIndex('userId', 'userId', { unique: false });
          cacheStore.createIndex('date', 'date', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Create syncMeta store for sync metadata (last sync time, queue stats, errors)
        if (!db.objectStoreNames.contains('syncMeta')) {
          db.createObjectStore('syncMeta', {
            keyPath: 'key',
          });
        }

        // Create pushMeta store for push notification subscription data
        if (!db.objectStoreNames.contains('pushMeta')) {
          db.createObjectStore('pushMeta', {
            keyPath: 'userId',
          });
        }
      },
      blocked() {
        console.warn('DB upgrade blocked by another tab');
      },
      blocking() {
        console.warn('DB blocking another tab from upgrading');
      },
      terminated() {
        console.error('DB connection terminated unexpectedly');
        dbInstance = null;
      },
    });

    console.log('✓ IndexedDB initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDB() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ==================== OFFLINE ENTRIES OPERATIONS ====================

/**
 * Add an entry to offline queue
 * @param {string} userId - User ID
 * @param {string} date - Entry date (YYYY-MM-DD)
 * @param {object} entryData - Entry data (startTime, endTime, etc.)
 * @returns {Promise<string>} Entry ID
 */
export async function addOfflineEntry(userId, date, entryData) {
  const db = await getDB();
  const id = crypto.randomUUID();
  
  const entry = {
    id,
    userId,
    date,
    ...entryData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    syncAttempts: 0,
  };

  try {
    await db.put('offlineEntries', entry);
    console.log(`✓ Offline entry created: ${id}`);
    return id;
  } catch (error) {
    console.error('Failed to add offline entry:', error);
    throw error;
  }
}

/**
 * Get all pending offline entries
 * @returns {Promise<Array>} Array of pending entries
 */
export async function getPendingEntries() {
  const db = await getDB();
  try {
    const tx = db.transaction('offlineEntries', 'readonly');
    const index = tx.store.index('syncStatus');
    const entries = await index.getAll('pending');
    return entries;
  } catch (error) {
    console.error('Failed to get pending entries:', error);
    throw error;
  }
}

/**
 * Update sync status of an offline entry
 * @param {string} id - Entry ID
 * @param {string} status - New status (pending, syncing, synced, error)
 * @param {string} error - Error message (optional)
 * @returns {Promise<void>}
 */
export async function updateSyncStatus(id, status, error = null) {
  const db = await getDB();
  try {
    const tx = db.transaction('offlineEntries', 'readwrite');
    const entry = await tx.store.get(id);
    
    if (!entry) {
      throw new Error(`Entry ${id} not found`);
    }

    entry.syncStatus = status;
    entry.lastSyncAttempt = new Date().toISOString();
    entry.syncAttempts = (entry.syncAttempts || 0) + 1;
    
    if (error) {
      entry.lastError = error;
    }

    await tx.store.put(entry);
    await tx.done;
    console.log(`✓ Entry ${id} status updated to: ${status}`);
  } catch (error) {
    console.error('Failed to update sync status:', error);
    throw error;
  }
}

/**
 * Delete a synced offline entry
 * @param {string} id - Entry ID
 * @returns {Promise<void>}
 */
export async function deleteSyncedEntry(id) {
  const db = await getDB();
  try {
    await db.delete('offlineEntries', id);
    console.log(`✓ Synced entry deleted: ${id}`);
  } catch (error) {
    console.error('Failed to delete synced entry:', error);
    throw error;
  }
}

// ==================== CACHED ENTRIES OPERATIONS ====================

/**
 * Cache a server entry for offline access
 * @param {object} serverEntry - Entry from server with _id
 * @returns {Promise<void>}
 */
export async function cacheEntry(serverEntry) {
  const db = await getDB();
  
  const entry = {
    id: serverEntry._id,
    userId: serverEntry.userId,
    date: serverEntry.date,
    startTime: serverEntry.startTime,
    endTime: serverEntry.endTime,
    duration: serverEntry.duration,
    notes: serverEntry.notes,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  };

  try {
    await db.put('cachedEntries', entry);
    console.log(`✓ Entry cached: ${entry.id}`);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('Quota exceeded, evicting old entries...');
      await evictOldEntries();
      // Retry after eviction
      await db.put('cachedEntries', entry);
    } else {
      console.error('Failed to cache entry:', error);
      throw error;
    }
  }
}

/**
 * Get cached entries for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cached entries
 */
export async function getCachedUserEntries(userId) {
  const db = await getDB();
  try {
    const tx = db.transaction('cachedEntries', 'readonly');
    const index = tx.store.index('userId');
    const entries = await index.getAll(userId);
    return entries;
  } catch (error) {
    console.error('Failed to get cached entries:', error);
    throw error;
  }
}

/**
 * Remove expired cache entries (older than 90 days)
 * @returns {Promise<number>} Number of entries evicted
 */
export async function evictOldEntries() {
  const db = await getDB();
  const now = new Date().toISOString();
  
  try {
    const tx = db.transaction('cachedEntries', 'readwrite');
    const index = tx.store.index('expiresAt');
    const range = IDBKeyRange.upperBound(now);
    
    let count = 0;
    let cursor = await index.openCursor(range);
    
    while (cursor) {
      await cursor.delete();
      count++;
      cursor = await cursor.continue();
    }
    
    await tx.done;
    console.log(`✓ Evicted ${count} expired entries`);
    return count;
  } catch (error) {
    console.error('Failed to evict old entries:', error);
    throw error;
  }
}

// ==================== SYNC META OPERATIONS ====================

/**
 * Set sync metadata
 * @param {string} key - Metadata key
 * @param {any} value - Metadata value
 * @returns {Promise<void>}
 */
export async function setSyncMeta(key, value) {
  const db = await getDB();
  
  const metadata = {
    key,
    value,
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.put('syncMeta', metadata);
  } catch (error) {
    console.error('Failed to set sync metadata:', error);
    throw error;
  }
}

/**
 * Get sync metadata
 * @param {string} key - Metadata key
 * @returns {Promise<any>} Metadata value or undefined
 */
export async function getSyncMeta(key) {
  const db = await getDB();
  try {
    const metadata = await db.get('syncMeta', key);
    return metadata ? metadata.value : undefined;
  } catch (error) {
    console.error('Failed to get sync metadata:', error);
    throw error;
  }
}

// ==================== PUSH META OPERATIONS ====================

/**
 * Save push notification subscription
 * @param {string} userId - User ID
 * @param {PushSubscription} subscription - Push subscription object
 * @param {object} preferences - Notification preferences
 * @returns {Promise<void>}
 */
export async function savePushSubscription(userId, subscription, preferences = {}) {
  const db = await getDB();
  
  const pushData = {
    userId,
    subscription: subscription.toJSON(),
    preferences,
    createdAt: new Date().toISOString(),
  };

  try {
    await db.put('pushMeta', pushData);
    console.log(`✓ Push subscription saved for user: ${userId}`);
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    throw error;
  }
}

/**
 * Get push notification subscription
 * @param {string} userId - User ID
 * @returns {Promise<object|undefined>} Push metadata or undefined
 */
export async function getPushSubscription(userId) {
  const db = await getDB();
  try {
    const pushData = await db.get('pushMeta', userId);
    return pushData;
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    throw error;
  }
}
