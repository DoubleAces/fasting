/**
 * Test endpoint to verify NextAuth configuration
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET ✅' : 'NOT SET ❌',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET ✅' : 'NOT SET ❌',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET ❌',
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET ✅' : 'NOT SET ❌',
    mongoUri: process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌',
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'NextAuth Configuration Check',
    config,
    timestamp: new Date().toISOString(),
  });
}
