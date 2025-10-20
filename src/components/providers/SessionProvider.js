/**
 * SessionProvider Component
 * 
 * Client-side wrapper that provides NextAuth session context to child components.
 * Must be used in the root layout to enable useSession() hook throughout the app.
 */

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
