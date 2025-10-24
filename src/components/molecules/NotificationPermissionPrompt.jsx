'use client';

import { useState, useEffect } from 'react';
import { subscribeToPush } from '@/lib/pwa/pushNotifications';

export default function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState('default');
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        console.log('✓ Notification permission granted');
        // Subscribe to push notifications
        await subscribeToPush();
      } else {
        console.log('ℹ Notification permission denied');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  // Don't show if notifications not supported
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  // Don't show if already granted
  if (permission === 'granted') {
    return null;
  }

  // Show denied instructions
  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">
              Notifications Blocked
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              You've blocked notifications for this site. To enable fasting reminders:
            </p>
            <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" and change to "Allow"</li>
              <li>Reload this page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Show permission request prompt
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Enable Fasting Reminders
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get notified 1 hour before your typical meal time to help maintain your fasting schedule
          </p>
          
          {error && (
            <p className="text-sm text-red-600 mb-2">
              Error: {error}
            </p>
          )}
          
          <button
            onClick={handleRequestPermission}
            disabled={requesting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Enable notifications"
          >
            {requesting ? 'Requesting...' : 'Enable Notifications'}
          </button>
        </div>
      </div>
    </div>
  );
}
