import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * POST /api/pwa/log-error
 * Receives client-side error logs
 * Logs to server console (could integrate with logging service)
 */
export async function POST(request) {
  try {
    const session = await auth();
    
    // Allow both authenticated and unauthenticated error logging
    // (Some errors may occur before authentication)
    const userId = session?.user?.id || 'anonymous';

    const error = await request.json();

    // Validate error payload
    if (!error.type || !error.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message' },
        { status: 400 }
      );
    }

    // Log error to server console
    // In production, this could be sent to a logging service (e.g., Sentry, LogRocket)
    console.error('[CLIENT_ERROR]', {
      userId,
      type: error.type,
      level: error.level || 'error',
      message: error.message,
      timestamp: error.timestamp,
      url: error.url,
      userAgent: error.userAgent,
      context: error.context,
    });

    // TODO: Integrate with external logging service
    // Example:
    // await sendToSentry({
    //   ...error,
    //   userId,
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API] Error logging endpoint failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
