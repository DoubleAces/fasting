import { savePushSubscription, getPushSubscription } from './indexeddb';

/**
 * Convert base64 VAPID key to Uint8Array
 * @param {string} base64String - Base64 encoded VAPID key
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications
 * @param {object} preferences - Notification preferences
 * @returns {Promise<PushSubscription>}
 */
export async function subscribeToPush(preferences = {}) {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    console.log('✓ Service worker ready for push subscription');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('ℹ Already subscribed to push notifications');
      return subscription;
    }

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('✓ Push subscription created');

    // Get user session for userId
    const session = await fetch('/api/auth/session').then((r) => r.json());
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Send subscription to server
    const response = await fetch('/api/pwa/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: {
          fastingWindowReminder: preferences.fastingWindowReminder ?? true,
          dailyStreak: preferences.dailyStreak ?? true,
          weeklyReport: preferences.weeklyReport ?? true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription to server');
    }

    console.log('✓ Push subscription saved to server');

    // Store in IndexedDB for offline reference
    await savePushSubscription(session.user.id, subscription, preferences);
    console.log('✓ Push subscription saved to IndexedDB');

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<void>}
 */
export async function unsubscribeFromPush() {
  try {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('ℹ No push subscription to unsubscribe from');
      return;
    }

    // Unsubscribe from Push Manager
    await subscription.unsubscribe();
    console.log('✓ Unsubscribed from push notifications');

    // Notify server
    try {
      await fetch('/api/pwa/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });
      console.log('✓ Server notified of unsubscription');
    } catch (error) {
      console.warn('Failed to notify server of unsubscription:', error);
      // Continue anyway - local unsubscribe succeeded
    }

    // Remove from IndexedDB
    const session = await fetch('/api/auth/session').then((r) => r.json());
    if (session?.user?.id) {
      const { getDB } = await import('./indexeddb');
      const db = await getDB();
      await db.delete('pushMeta', session.user.id);
      console.log('✓ Push subscription removed from IndexedDB');
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

/**
 * Check if user is subscribed to push notifications
 * @returns {Promise<boolean>}
 */
export async function isSubscribed() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return subscription !== null;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
}

/**
 * Get current push subscription
 * @returns {Promise<PushSubscription|null>}
 */
export async function getSubscription() {
  try {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Failed to get subscription:', error);
    return null;
  }
}
