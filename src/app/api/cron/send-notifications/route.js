import { NextResponse } from 'next/server';
import { scheduleNotifications } from '@/lib/pwa/notificationScheduler';

/**
 * GET /api/cron/send-notifications
 * Vercel cron job endpoint - runs every 5 minutes
 * Sends scheduled push notifications to eligible users
 */
export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('[CRON] Unauthorized attempt to access cron endpoint');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting notification scheduling...');

    // Run notification scheduler
    const result = await scheduleNotifications();

    console.log(`[CRON] Notification scheduling complete:`, result);

    return NextResponse.json(
      {
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CRON] Notification scheduling failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
