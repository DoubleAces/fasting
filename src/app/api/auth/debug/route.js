/**
 * Debug endpoint to test OAuth flow step by step
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const step = searchParams.get('step');

  console.log('🔍 DEBUG: OAuth debug endpoint hit, step:', step);

  if (step === 'callback') {
    console.log('🔍 DEBUG: This simulates what happens when Google calls back');
    console.log('🔍 DEBUG: URL params:', Object.fromEntries(searchParams));
  }

  return NextResponse.json({
    message: 'OAuth Debug Endpoint',
    step,
    timestamp: new Date().toISOString(),
    cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    url: request.url,
  });
}
