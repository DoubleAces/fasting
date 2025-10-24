/**
 * Custom Service Worker
 * Handles push notifications and notification clicks
 * This file is injected into the generated service worker
 */

// Handle push events
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let notification = {
    title: 'Fasting Tracker',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    requireInteraction: false,
    data: {
      url: '/entries',
    },
  };

  // Parse push data
  if (event.data) {
    try {
      const data = event.data.json();
      notification = {
        ...notification,
        ...data,
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      vibrate: [200, 100, 200], // Vibration pattern for accessibility
      data: notification.data,
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);

  // Close the notification
  event.notification.close();

  // Get the URL to open (default to /entries)
  const urlToOpen = event.notification.data?.url || '/entries';

  // Handle notification click
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if there's already a window open with the app
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          // Focus existing window
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle service worker messages (e.g., CLEAR_CACHE from cacheService)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
      })
    );
  }
});

// Handle Background Sync API (progressive enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event triggered:', event.tag);

  if (event.tag === 'sync-entries') {
    event.waitUntil(
      // Send message to all clients to trigger sync
      clients.matchAll().then((clientList) => {
        return Promise.all(
          clientList.map((client) => {
            return client.postMessage({
              type: 'BACKGROUND_SYNC',
              tag: event.tag,
            });
          })
        );
      }).then(() => {
        console.log('[SW] Background sync message sent to clients');
      }).catch((error) => {
        console.error('[SW] Background sync failed:', error);
      })
    );
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  
  // Take control of all pages immediately
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[SW] Clients claimed');
    })
  );
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  
  // Pre-cache offline page for fallback
  event.waitUntil(
    caches.open('offline-fallback-v1').then((cache) => {
      console.log('[SW] Caching offline page');
      return cache.add('/offline.html');
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});
