/**
 * useNetworkStatus Hook
 * React hook for monitoring online/offline network status
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Monitor network online/offline status
 * @returns {Object} Network status object
 * @returns {boolean} isOnline - True if browser is online
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Set initial status
    setIsOnline(navigator.onLine);

    // Event handlers
    const handleOnline = () => {
      console.log('[useNetworkStatus] Network online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[useNetworkStatus] Network offline');
      setIsOnline(false);
    };

    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

export default useNetworkStatus;
