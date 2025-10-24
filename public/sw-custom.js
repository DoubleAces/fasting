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
  
  // Pre-cache critical offline resources
  event.waitUntil(
    caches.open('offline-v1').then((cache) => {
      return cache.addAll(['/offline.html']);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Add a catch-all fetch handler for failed navigations
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to get the response from the network or Workbox cache
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          
          // Try network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          console.log('[SW] Network failed for navigation, checking cache:', event.request.url);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache either, return offline page
          console.log('[SW] Page not in cache, returning offline fallback');
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
          
          // Last resort - return a simple response
          return new Response('Offline - please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        }
      })()
    );
  }
});
