import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PushSubscription from '@/lib/models/PushSubscription';
import { sendPushNotification, formatNotificationPayload } from '@/lib/pwa/notificationScheduler';

/**
 * POST /api/pwa/send-notification
 * Send a test push notification to the current user
 * Admin/testing endpoint
 */
export async function POST(request) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Connect to database
    await dbConnect();

    // Get user's push subscription
    const subscription = await PushSubscription.findOne({ userId }).lean();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No push subscription found. Please enable notifications first.' },
        { status: 404 }
      );
    }

    // Parse request body for notification type (optional)
    let notificationType = 'fastingReminder';
    let data = {};

    try {
      const body = await request.json();
      if (body.type) {
        notificationType = body.type;
      }
      if (body.data) {
        data = body.data;
      }
    } catch {
      // Use defaults if body is empty or invalid JSON
    }

    // Format notification payload
    let payload;
    if (notificationType === 'test') {
      // Custom test payload
      payload = {
        title: '🧪 Test Notification',
        body: data.message || 'This is a test notification from Fasting Tracker',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/entries',
          type: 'test',
          timestamp: new Date().toISOString(),
        },
      };
    } else {
      // Use standard notification templates
      payload = formatNotificationPayload(notificationType, {
        userId,
        ...data,
      });
    }

    // Send notification
    const success = await sendPushNotification(subscription, payload);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    // Update last notification timestamp
    await PushSubscription.findByIdAndUpdate(subscription._id, {
      lastNotificationAt: new Date(),
    });

    console.log(`✓ Test notification sent to user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Test notification sent successfully',
        type: notificationType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Send notification failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
