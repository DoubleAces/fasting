/**
 * Notification Service
 * High-level abstraction over push notification operations
 * Provides simplified interface for UI components and hooks
 */

import {
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed,
  getSubscription,
} from '@/lib/pwa/pushNotifications';

/**
 * Subscribe to push notifications with preferences
 * @param {Object} preferences - Notification preferences
 * @param {boolean} preferences.fastingWindowReminder - Enable fasting reminders
 * @param {boolean} preferences.dailyStreak - Enable daily streak notifications
 * @param {boolean} preferences.weeklyReport - Enable weekly report notifications
 * @returns {Promise<PushSubscription>} The subscription object
 * @throws {Error} If subscription fails
 */
export async function subscribe(preferences = {}) {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Subscribe can only be called in browser environment');
    }

    // Check if Notification API is supported
    if (!('Notification' in window)) {
      throw new Error('Push notifications not supported in this browser');
    }

    // Default all preferences to true
    const defaultPreferences = {
      fastingWindowReminder: true,
      dailyStreak: true,
      weeklyReport: true,
      ...preferences,
    };

    const subscription = await subscribeToPush(defaultPreferences);
    console.log('[NotificationService] Subscription successful');
    return subscription;
  } catch (error) {
    console.error('[NotificationService] Subscribe failed:', error);
    throw new Error(`Failed to subscribe to notifications: ${error.message}`);
  }
}

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>} True if unsubscribe succeeded
 * @throws {Error} If unsubscribe fails
 */
export async function unsubscribe() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Unsubscribe can only be called in browser environment');
    }

    const result = await unsubscribeFromPush();
    console.log('[NotificationService] Unsubscribe successful');
    return result;
  } catch (error) {
    console.error('[NotificationService] Unsubscribe failed:', error);
    throw new Error(`Failed to unsubscribe from notifications: ${error.message}`);
  }
}

/**
 * Get current notification status
 * @returns {Promise<{ permission: string, subscribed: boolean, subscription: PushSubscription | null }>}
 * @throws {Error} If unable to get status
 */
export async function getStatus() {
  try {
    if (typeof window === 'undefined') {
      return {
        permission: 'denied',
        subscribed: false,
        subscription: null,
      };
    }

    // Check if Notification API is supported
    if (!('Notification' in window)) {
      return {
        permission: 'denied',
        subscribed: false,
        subscription: null,
      };
    }

    const permission = Notification.permission;
    const subscribed = await isSubscribed();
    const subscription = subscribed ? await getSubscription() : null;

    return {
      permission,
      subscribed,
      subscription,
    };
  } catch (error) {
    console.error('[NotificationService] Failed to get status:', error);
    throw new Error(`Failed to get notification status: ${error.message}`);
  }
}

/**
 * Send a test notification to current user
 * Calls server endpoint to trigger push
 * @returns {Promise<boolean>} True if test notification sent
 * @throws {Error} If test notification fails
 */
export async function testNotification() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('testNotification can only be called in browser environment');
    }

    // Check if subscribed first
    const subscribed = await isSubscribed();
    if (!subscribed) {
      throw new Error('Not subscribed to push notifications');
    }

    // Call server endpoint to send test notification
    const response = await fetch('/api/pwa/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        data: {
          message: 'This is a test notification from Fasting Tracker',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send test notification');
    }

    console.log('[NotificationService] Test notification sent');
    return true;
  } catch (error) {
    console.error('[NotificationService] Test notification failed:', error);
    throw new Error(`Failed to send test notification: ${error.message}`);
  }
}

/**
 * Request notification permission from user
 * @returns {Promise<string>} Permission state: 'granted', 'denied', or 'default'
 * @throws {Error} If permission request fails
 */
export async function requestPermission() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('requestPermission can only be called in browser environment');
    }

    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    console.log('[NotificationService] Permission:', permission);
    return permission;
  } catch (error) {
    console.error('[NotificationService] Permission request failed:', error);
    throw new Error(`Failed to request notification permission: ${error.message}`);
  }
}

export default {
  subscribe,
  unsubscribe,
  getStatus,
  testNotification,
  requestPermission,
};
