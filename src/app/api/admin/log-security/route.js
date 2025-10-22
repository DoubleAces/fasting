/**
 * Security Logging API Route
 * 
 * Internal API endpoint for logging security events from Edge Runtime middleware.
 * This runs in Node.js runtime and can use MongoDB/Mongoose.
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SecurityLog from '@/lib/models/SecurityLog';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const logData = await request.json();

    // Validate required fields
    if (!logData.action || !logData.url || !logData.reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database and save log
    await connectDB();
    await SecurityLog.create({
      action: logData.action,
      userId: logData.userId || 'anonymous',
      email: logData.email || 'unknown',
      ip: logData.ip || 'unknown',
      url: logData.url,
      reason: logData.reason,
      userAgent: logData.userAgent || 'unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save security log:', error);
    // Return 200 anyway - logging failures shouldn't break the auth flow
    return NextResponse.json({ success: false, error: error.message });
  }
}
