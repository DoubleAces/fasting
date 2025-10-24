/**
 * PeriodicSync Component
 * Triggers sync every 5 minutes when online and queue not empty
 */

'use client';

import { useEffect } from 'react';
import { processSyncQueue, getSyncQueueStats } from '@/lib/pwa/syncQueue';

export default function PeriodicSync() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    console.log('[PeriodicSync] Setting up periodic sync (5 minutes)');

    const checkAndSync = async () => {
      try {
        // Check if online
        if (!navigator.onLine) {
          console.log('[PeriodicSync] Offline, skipping sync');
          return;
        }

        // Check queue length
        const stats = await getSyncQueueStats();
        if (stats.queueLength === 0) {
          console.log('[PeriodicSync] Queue empty, skipping sync');
          return;
        }

        console.log(`[PeriodicSync] Triggering sync (${stats.queueLength} items in queue)`);
        await processSyncQueue();
      } catch (error) {
        console.error('[PeriodicSync] Error during periodic sync:', error);
      }
    };

    // Set up interval (5 minutes = 300000 ms)
    const intervalId = setInterval(checkAndSync, 300000);

    // Cleanup on unmount
    return () => {
      console.log('[PeriodicSync] Cleaning up periodic sync');
      clearInterval(intervalId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
