import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PushSubscription from '@/lib/models/PushSubscription';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscription, preferences = {} } = body;

    // Validate subscription structure
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Upsert subscription (one per user)
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime || null,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        preferences: {
          fastingWindowReminder: preferences.fastingWindowReminder ?? true,
          dailyStreak: preferences.dailyStreak ?? true,
          weeklyReport: preferences.weeklyReport ?? true,
        },
        subscribedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log(`✓ Push subscription saved for user: ${session.user.id}`);

    return NextResponse.json(
      {
        id: pushSubscription._id,
        message: 'Push subscription saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
