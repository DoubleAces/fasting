'use client';

import { useState, useEffect } from 'react';
import { subscribeToPush, unsubscribeFromPush, isSubscribed as checkSubscribed } from '@/lib/pwa/pushNotifications';

/**
 * React hook for managing push notification state
 * @returns {object} Push notification state and controls
 */
export function usePushNotification() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check initial state
  useEffect(() => {
    checkState();
  }, []);

  const checkState = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    setPermission(Notification.permission);
    
    try {
      const subscribed = await checkSubscribed();
      setIsSubscribed(subscribed);
    } catch (err) {
      console.error('Failed to check subscription status:', err);
    }
  };

  const subscribe = async (preferences = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Request permission first if needed
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result);

        if (result !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // Subscribe to push notifications
      await subscribeToPush(preferences);
      setIsSubscribed(true);
      
      // Recheck state
      await checkState();
      
      return true;
    } catch (err) {
      console.error('Failed to subscribe:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      await unsubscribeFromPush();
      setIsSubscribed(false);
      
      // Recheck state
      await checkState();
      
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    refresh: checkState,
  };
}
