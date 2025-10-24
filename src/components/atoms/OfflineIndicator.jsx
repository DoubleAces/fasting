'use client';

import { useState, useEffect } from 'react';
import { useSyncQueue } from '@/hooks/useSyncQueue';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { syncing, queueLength } = useSyncQueue();

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setIsLoading(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsLoading(false);
    };

    // Listen for network requests (loading state)
    const handleFetchStart = () => {
      if (navigator.onLine) {
        setIsLoading(true);
      }
    };

    const handleFetchEnd = () => {
      setIsLoading(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Custom events for loading state (FR-018)
    window.addEventListener('fetch-start', handleFetchStart);
    window.addEventListener('fetch-end', handleFetchEnd);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('fetch-start', handleFetchStart);
      window.removeEventListener('fetch-end', handleFetchEnd);
    };
  }, []);

  // Don't show anything when online and not loading
  if (isOnline && !isLoading) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-300"
      style={{
        backgroundColor: isOnline ? '#3b82f6' : '#ef4444',
        color: '#ffffff',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {isLoading || syncing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{syncing ? `Syncing${queueLength > 0 ? ` (${queueLength})` : ''}...` : 'Loading...'}</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>Offline{queueLength > 0 ? ` (${queueLength} pending)` : ''}</span>
          </>
        )}
      </div>
    </div>
  );
}
