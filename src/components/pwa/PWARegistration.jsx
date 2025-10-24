'use client';

import { useEffect } from 'react';
import { initSyncTriggers } from '@/lib/pwa/syncQueue';
import { processSyncQueue } from '@/lib/pwa/syncQueue';

export default function PWARegistration() {
  useEffect(() => {
    // Initialize sync triggers (online event listener)
    initSyncTriggers();

    // Listen for Background Sync messages from service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          console.log('[PWARegistration] Background sync message received');
          processSyncQueue().catch((error) => {
            console.error('[PWARegistration] Background sync failed:', error);
          });
        }
      });
    }

    // Only register in production and in browser environment
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('✓ Service Worker registered successfully:', registration.scope);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available - dispatch custom event
                  console.log('✓ New service worker available');
                  window.dispatchEvent(
                    new CustomEvent('sw-update-available', {
                      detail: { registration },
                    })
                  );
                }
              });
            }
          });

          // Check for updates periodically (every hour)
          setInterval(() => {
            registration.update().catch((error) => {
              console.warn('Service worker update check failed:', error);
            });
          }, 60 * 60 * 1000);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      registerServiceWorker();
    }
  }, []); // Empty deps - run once on mount

  // This component doesn't render anything
  return null;
}
