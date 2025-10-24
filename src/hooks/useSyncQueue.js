'use client';

import { useState, useEffect } from 'react';
import { processSyncQueue, getSyncQueueStats } from '@/lib/pwa/syncQueue';

/**
 * React hook for managing offline sync queue
 * @returns {object} Sync queue state and controls
 */
export function useSyncQueue() {
  const [syncing, setSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [error, setError] = useState(null);

  // Get initial queue length on mount
  useEffect(() => {
    updateQueueStats();

    // Update queue stats every 10 seconds
    const interval = setInterval(updateQueueStats, 10000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Update queue statistics
   */
  const updateQueueStats = async () => {
    try {
      const stats = await getSyncQueueStats();
      setQueueLength(stats.queueLength);
      setSyncing(stats.syncing);
    } catch (err) {
      console.error('Failed to update queue stats:', err);
      setError(err.message);
    }
  };

  /**
   * Manually trigger sync
   */
  const triggerSync = async () => {
    // Prevent duplicate sync calls
    if (syncing) {
      console.log('Sync already in progress');
      return;
    }

    // Check if online
    if (!navigator.onLine) {
      setError('Cannot sync while offline');
      return;
    }

    try {
      setSyncing(true);
      setError(null);
      await processSyncQueue();
      await updateQueueStats();
    } catch (err) {
      console.error('Manual sync failed:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    queueLength,
    error,
    triggerSync,
    refresh: updateQueueStats,
  };
}
