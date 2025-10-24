/**
 * UpdateBanner Component
 * Shows service worker updates and sync status
 * Displays banners for:
 * - Service worker updates available
 * - Active sync operations
 */

'use client';

import { useState, useEffect } from 'react';
import { useSyncQueue } from '@/hooks/useSyncQueue';

export default function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { syncing, queueLength } = useSyncQueue();

  useEffect(() => {
    // Listen for service worker update event
    const handleUpdateAvailable = () => {
      console.log('[UpdateBanner] Service worker update available');
      setUpdateAvailable(true);
      setDismissed(false);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Don't show anything if dismissed or no updates/syncing
  const showUpdateBanner = updateAvailable && !dismissed;
  const showSyncBanner = syncing && queueLength > 0;

  if (!showUpdateBanner && !showSyncBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-2">
      {/* Service Worker Update Banner */}
      {showUpdateBanner && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg bg-blue-600 px-4 py-3 text-white shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">
              A new version is available!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="rounded bg-white px-3 py-1 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              aria-label="Refresh to update"
            >
              Refresh
            </button>
            <button
              onClick={handleDismiss}
              className="rounded p-1 transition-colors hover:bg-blue-700"
              aria-label="Dismiss update notification"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {showSyncBanner && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg bg-purple-600 px-4 py-3 text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-medium">
              Syncing {queueLength} {queueLength === 1 ? 'entry' : 'entries'}...
            </span>
          </div>
          <div className="text-sm opacity-90">
            Please keep this tab open
          </div>
        </div>
      )}
    </div>
  );
}
