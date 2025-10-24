# Contract: Push Notification System

**Feature**: 010-pwa-conversion  
**Type**: Web Push API & Notification Scheduling  
**Date**: October 24, 2025

## Overview

This contract defines the push notification system including subscription management, notification scheduling based on 7-day meal time average (FR-010a), server-side push delivery using Web Push Protocol with VAPID, and notification click handling.

---

## Push Subscription Flow

```
1. User grants notification permission
   │
   v
2. Service worker subscribes to Push Manager
   │
   v
3. Push subscription sent to server (POST /api/pwa/subscribe)
   │
   v
4. Server stores subscription in MongoDB (PushSubscription model)
   │
   v
5. Server schedules notifications based on user preferences
   │
   v
6. Server sends push via Web Push Protocol
   │
   v
7. Service worker receives push event
   │
   v
8. Service worker shows notification
   │
   v
9. User clicks notification → Open app at deep link
```

---

## Client-Side Subscription

### Permission Request

**Location**: `src/components/molecules/NotificationPermissionPrompt.jsx`

**Implementation**:
```javascript
'use client';

import { useState } from 'react';
import { subscribeToPush } from '@/lib/pwa/pushNotifications';

export function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);
  
  const requestPermission = async () => {
    setLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Subscribe to push notifications
        await subscribeToPush();
      }
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (permission === 'granted') {
    return null; // Already granted
  }
  
  if (permission === 'denied') {
    return (
      <div className="notification-prompt denied">
        <p>Notifications are blocked. Please enable in browser settings.</p>
      </div>
    );
  }
  
  return (
    <div className="notification-prompt">
      <h3>Stay on track with fasting reminders</h3>
      <p>Get notified when your eating window is about to start</p>
      <button onClick={requestPermission} disabled={loading}>
        {loading ? 'Enabling...' : 'Enable Notifications'}
      </button>
    </div>
  );
}
```

**Contract**:
- ✅ Permission MUST be requested via `Notification.requestPermission()`
- ✅ Permission request MUST be triggered by user interaction (button click)
- ✅ Subscription MUST only happen after `'granted'` permission
- ✅ `'denied'` permission MUST show instructions to enable in browser
- ✅ Component MUST hide when permission is `'granted'`

---

### Push Manager Subscription

**Location**: `src/lib/pwa/pushNotifications.js`

**Implementation**:
```javascript
import { getDB, savePushSubscription } from './indexeddb';

// VAPID public key (from environment variable, hardcoded for client)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

export async function subscribeToPush() {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('[Push] Already subscribed');
      return existingSubscription;
    }
    
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    console.log('[Push] Subscribed:', subscription.endpoint);
    
    // Send subscription to server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    throw error;
  }
}

async function sendSubscriptionToServer(subscription) {
  const response = await fetch('/api/pwa/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      preferences: {
        fastingWindowReminder: true, // Default: enabled
        dailyLog: false,
        weeklyReview: true
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to send subscription: ${response.status}`);
  }
  
  // Store subscription in IndexedDB (for offline access)
  const session = await getSession(); // Get NextAuth session
  if (session?.user?.id) {
    await savePushSubscription(session.user.id, subscription, {
      fastingWindowReminder: true,
      dailyLog: false,
      weeklyReview: true
    });
  }
}
```

**Contract**:
- ✅ Subscription MUST use `userVisibleOnly: true` (required by spec)
- ✅ Subscription MUST include `applicationServerKey` (VAPID public key)
- ✅ VAPID key MUST be converted from URL-safe base64 to Uint8Array
- ✅ Subscription MUST be sent to server immediately after creation
- ✅ Subscription MUST be stored in IndexedDB for offline reference
- ✅ Duplicate subscriptions MUST be detected and skipped

---

### Unsubscribe

**Implementation**:
```javascript
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('[Push] No subscription found');
      return;
    }
    
    // Unsubscribe from Push Manager
    await subscription.unsubscribe();
    console.log('[Push] Unsubscribed');
    
    // Notify server to remove subscription
    await fetch('/api/pwa/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
    
    // Remove from IndexedDB
    const session = await getSession();
    if (session?.user?.id) {
      const db = await getDB();
      await db.delete('pushMeta', session.user.id);
    }
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
  }
}
```

**Contract**:
- ✅ Unsubscribe MUST call `subscription.unsubscribe()`
- ✅ Unsubscribe MUST notify server to delete subscription
- ✅ Unsubscribe MUST remove from IndexedDB
- ✅ Unsubscribe MUST NOT throw if no subscription exists

---

## Server-Side Subscription Storage

### API Endpoint: POST /api/pwa/subscribe

**Location**: `src/app/api/pwa/subscribe/route.js`

**Implementation**:
```javascript
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import PushSubscription from '@/lib/models/PushSubscription';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { subscription, preferences } = await request.json();
    
    // Validate subscription structure
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription format' }, { status: 400 });
    }
    
    // Upsert subscription (update if exists, create if not)
    const pushSub = await PushSubscription.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        },
        preferences: preferences || {
          fastingWindowReminder: true,
          dailyLog: false,
          weeklyReview: true
        },
        subscribedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('[Push] Subscription saved for user:', session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      subscriptionId: pushSub._id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('[Push] Subscribe endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Contract**:
- ✅ Endpoint MUST require authentication (NextAuth session)
- ✅ Endpoint MUST validate subscription structure (endpoint, keys)
- ✅ Endpoint MUST use `findOneAndUpdate()` with `upsert: true` (handle duplicates)
- ✅ Endpoint MUST store subscription per user (one subscription per user)
- ✅ Endpoint MUST return HTTP 201 on success
- ✅ Endpoint MUST return HTTP 400 for invalid subscription

---

### MongoDB Model: PushSubscription

**Location**: `src/lib/models/PushSubscription.js`

**Schema**:
```javascript
import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One subscription per user
  },
  endpoint: {
    type: String,
    required: true
  },
  expirationTime: {
    type: Number,
    default: null
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  preferences: {
    fastingWindowReminder: {
      type: Boolean,
      default: true
    },
    dailyLog: {
      type: Boolean,
      default: false
    },
    weeklyReview: {
      type: Boolean,
      default: true
    }
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  lastNotificationAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for querying active subscriptions
PushSubscriptionSchema.index({ userId: 1 });
PushSubscriptionSchema.index({ 'preferences.fastingWindowReminder': 1 });

const PushSubscription = mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
```

**Contract**:
- ✅ `userId` MUST be unique (one subscription per user)
- ✅ `endpoint`, `keys.p256dh`, `keys.auth` MUST be required
- ✅ `preferences` MUST have default values
- ✅ Schema MUST include `timestamps: true` for `createdAt`/`updatedAt`
- ✅ Indexes MUST exist for `userId` and `preferences.fastingWindowReminder`

---

## Notification Scheduling (FR-010a)

### 7-Day Average Calculation

**Location**: `src/lib/pwa/notificationScheduler.js`

**Implementation**:
```javascript
import Entry from '@/lib/models/Entry';

/**
 * Calculate typical meal time based on last 7 days of entries
 * Returns time 1 hour before average first meal time
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - Time in HH:MM format or null
 */
export async function calculateTypicalMealTime(userId) {
  // Get last 7 entries with firstMealTime
  const entries = await Entry.find({
    userId,
    firstMealTime: { $exists: true, $ne: null }
  })
    .sort({ date: -1 })
    .limit(7);
  
  if (entries.length === 0) {
    console.log(`[Scheduler] No meal times found for user ${userId}`);
    return null;
  }
  
  // Convert times to minutes since midnight
  const mealTimesInMinutes = entries.map(entry => {
    const [hours, minutes] = entry.firstMealTime.split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  // Calculate average
  const avgMinutes = Math.round(
    mealTimesInMinutes.reduce((sum, time) => sum + time, 0) / mealTimesInMinutes.length
  );
  
  // Subtract 1 hour (60 minutes) for reminder time
  const reminderMinutes = Math.max(0, avgMinutes - 60);
  
  // Convert back to HH:MM format
  const hours = Math.floor(reminderMinutes / 60);
  const minutes = reminderMinutes % 60;
  
  const reminderTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  console.log(`[Scheduler] User ${userId} reminder time: ${reminderTime} (avg meal: ${Math.floor(avgMinutes/60)}:${avgMinutes%60})`);
  
  return reminderTime;
}
```

**Contract**:
- ✅ MUST query last 7 entries (not all entries)
- ✅ MUST filter entries where `firstMealTime` exists
- ✅ MUST calculate average in minutes since midnight
- ✅ MUST subtract 60 minutes (1 hour) for reminder
- ✅ MUST handle edge case: < 7 entries (use available entries)
- ✅ MUST return null if no meal times found
- ✅ MUST format output as `HH:MM` with zero-padding

---

### Scheduler Service

**Implementation**:
```javascript
import webpush from 'web-push';
import PushSubscription from '@/lib/models/PushSubscription';
import { calculateTypicalMealTime } from './notificationScheduler';

// Configure web-push with VAPID keys (server-side only)
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function scheduleNotifications() {
  console.log('[Scheduler] Starting notification scheduling');
  
  try {
    // Get all users with fasting reminders enabled
    const subscriptions = await PushSubscription.find({
      'preferences.fastingWindowReminder': true
    }).populate('userId');
    
    console.log(`[Scheduler] Found ${subscriptions.length} subscriptions`);
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const sub of subscriptions) {
      try {
        // Calculate reminder time for this user
        const reminderTime = await calculateTypicalMealTime(sub.userId._id);
        
        if (!reminderTime) {
          continue; // No meal data yet
        }
        
        // Check if current time matches reminder time (within 5-minute window)
        if (isTimeWithinWindow(currentTime, reminderTime, 5)) {
          await sendPushNotification(sub, {
            title: 'Fasting Window Ending Soon',
            body: `Your eating window typically starts in 1 hour (around ${addHour(reminderTime)})`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'fasting-reminder',
            data: { url: '/entries' }
          });
          
          // Update last notification time
          sub.lastNotificationAt = now;
          await sub.save();
        }
      } catch (error) {
        console.error(`[Scheduler] Error for user ${sub.userId}:`, error);
        // Continue with other users
      }
    }
    
    console.log('[Scheduler] Notification scheduling complete');
  } catch (error) {
    console.error('[Scheduler] Scheduling failed:', error);
  }
}

function isTimeWithinWindow(currentTime, targetTime, windowMinutes) {
  const [currentH, currentM] = currentTime.split(':').map(Number);
  const [targetH, targetM] = targetTime.split(':').map(Number);
  
  const currentMinutes = currentH * 60 + currentM;
  const targetMinutes = targetH * 60 + targetM;
  
  const diff = Math.abs(currentMinutes - targetMinutes);
  return diff <= windowMinutes;
}

function addHour(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
```

**Contract**:
- ✅ Scheduler MUST run periodically (via cron job or API route)
- ✅ Scheduler MUST query subscriptions with `fastingWindowReminder: true`
- ✅ Scheduler MUST calculate reminder time per user
- ✅ Scheduler MUST check if current time matches reminder (±5 minute window)
- ✅ Scheduler MUST update `lastNotificationAt` after sending
- ✅ Scheduler MUST continue on individual user errors (don't fail all)

---

## Push Notification Sending

### Send Function

**Implementation**:
```javascript
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      },
      JSON.stringify(payload),
      {
        TTL: 3600, // 1 hour time-to-live
        urgency: 'normal'
      }
    );
    
    console.log('[Push] Notification sent:', subscription.endpoint);
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid, remove from database
      console.log('[Push] Subscription expired, removing:', subscription.endpoint);
      await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
    } else {
      console.error('[Push] Send failed:', error);
      throw error;
    }
  }
}
```

**Contract**:
- ✅ MUST use `webpush.sendNotification()` from `web-push` library
- ✅ Payload MUST be JSON-stringified
- ✅ TTL (time-to-live) MUST be set (default 1 hour)
- ✅ Urgency MUST be `'normal'` (not `'high'` to preserve battery)
- ✅ MUST handle 410 (Gone) / 404 (Not Found) by removing subscription
- ✅ MUST NOT throw on expired subscription (graceful degradation)

---

### API Endpoint: POST /api/pwa/send-notification (Testing Only)

**Location**: `src/app/api/pwa/send-notification/route.js`

**Implementation**:
```javascript
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import PushSubscription from '@/lib/models/PushSubscription';
import webpush from 'web-push';

// Configure VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's subscription
    const subscription = await PushSubscription.findOne({ userId: session.user.id });
    
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    
    // Test payload
    const payload = {
      title: 'Test Notification',
      body: 'This is a test push notification from Fasting Tracker',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test',
      data: { url: '/entries' }
    };
    
    // Send notification
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      JSON.stringify(payload)
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error('[Push] Test notification failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Contract**:
- ✅ Endpoint MUST be for testing only (remove in production or add admin guard)
- ✅ Endpoint MUST require authentication
- ✅ Endpoint MUST return 404 if no subscription found
- ✅ Endpoint MUST send test notification immediately

---

## Service Worker Push Handling

### Push Event Handler

**Location**: `/public/sw.js` (generated by Workbox)

**Implementation**:
```javascript
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  
  let notificationData = {
    title: 'Fasting Tracker',
    body: 'You have a new update',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: { url: '/' }
  };
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      actions: [
        { action: 'open', title: 'Open App', icon: '/icons/open.png' },
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
      ]
    })
  );
});
```

**Contract**:
- ✅ Push event MUST call `showNotification()` (required for `userVisibleOnly`)
- ✅ Push data MUST be parsed as JSON
- ✅ MUST provide fallback notification if parsing fails
- ✅ MUST use `event.waitUntil()` to keep SW alive
- ✅ Notification MUST include icon, badge, data
- ✅ Vibrate pattern MUST be defined (accessibility)
- ✅ `requireInteraction` MUST be `false` (auto-dismiss)

---

### Notification Click Handler

**Implementation**:
```javascript
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return; // Just close notification
  }
  
  // Get deep link URL from notification data
  const url = event.notification.data?.url || '/entries';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
```

**Contract**:
- ✅ MUST close notification on click (`event.notification.close()`)
- ✅ MUST extract URL from `event.notification.data.url`
- ✅ MUST focus existing window if already open
- ✅ MUST open new window if app not open
- ✅ MUST handle `dismiss` action (no-op)
- ✅ MUST use `event.waitUntil()` to complete async operations

---

## Cron Job Integration (Vercel)

### Vercel Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/send-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Contract**:
- ✅ Cron MUST run every 5 minutes (`*/5 * * * *`)
- ✅ Cron endpoint MUST be protected (check `CRON_SECRET` header)

---

### Cron Endpoint

**Location**: `src/app/api/cron/send-notifications/route.js`

**Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { scheduleNotifications } from '@/lib/pwa/notificationScheduler';

export async function GET(request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await scheduleNotifications();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Cron] Notification scheduling failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Contract**:
- ✅ Endpoint MUST verify `CRON_SECRET` header
- ✅ Endpoint MUST be GET method (Vercel cron limitation)
- ✅ Endpoint MUST return 200 on success
- ✅ Endpoint MUST log errors but not crash

---

## Testing

### Unit Tests

```javascript
// Test: 7-day average calculation
test('calculates correct reminder time', async () => {
  const userId = 'user123';
  
  // Mock entries: meal times at 12:00, 12:30, 11:45, 12:15, 12:00, 12:30, 12:00
  // Average: 12:08 → Reminder: 11:08
  
  const reminderTime = await calculateTypicalMealTime(userId);
  
  expect(reminderTime).toBe('11:08');
});

// Test: Insufficient data
test('returns null when no meal times exist', async () => {
  const reminderTime = await calculateTypicalMealTime('no-data-user');
  expect(reminderTime).toBeNull();
});

// Test: Time window matching
test('identifies time within 5-minute window', () => {
  expect(isTimeWithinWindow('12:00', '12:03', 5)).toBe(true);
  expect(isTimeWithinWindow('12:00', '12:06', 5)).toBe(false);
});
```

### Integration Tests

```javascript
// Test: Full push flow
test('subscribes and receives push notification', async () => {
  // Subscribe
  const subscription = await subscribeToPush();
  expect(subscription.endpoint).toBeDefined();
  
  // Verify stored on server
  const response = await fetch('/api/pwa/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription, preferences: { fastingWindowReminder: true } })
  });
  expect(response.status).toBe(201);
  
  // Send test notification
  await fetch('/api/pwa/send-notification', { method: 'POST' });
  
  // Service worker should receive push event
  await page.waitForFunction(() => window.lastPushEvent !== undefined);
});
```

---

## References

- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- web-push library: https://github.com/web-push-libs/web-push
- VAPID specification: https://datatracker.ietf.org/doc/html/rfc8292
- Notification API: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
