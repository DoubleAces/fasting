/**
 * SessionProvider Component
 * 
 * Client-side wrapper that provides NextAuth session context to child components.
 * Must be used in the root layout to enable useSession() hook throughout the app.
 * 
 * Configuration:
 * - refetchInterval: 0 (disabled) - No automatic polling
 * - refetchOnWindowFocus: false - No refetch when tab gains focus
 * 
 * Why disabled:
 * We use token invalidation for forced logout instead of polling.
 * This eliminates "GET /api/auth/session" spam in console.
 */

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider 
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
