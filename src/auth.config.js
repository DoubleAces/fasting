/**
 * NextAuth Edge-Compatible Configuration
 * 
 * This file contains only the Edge-compatible parts of NextAuth config
 * that can be used in middleware (Edge Runtime).
 * 
 * Does NOT include:
 * - Database connections
 * - Bcrypt/password hashing
 * - User models
 * - Any Node.js-only modules
 */

import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize() {
        // This will never be called in middleware
        // The actual authorization logic is in src/lib/auth.js
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/entries',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnProtected = nextUrl.pathname.startsWith('/entries') || 
                           nextUrl.pathname.startsWith('/settings');
      
      // If on protected route and not logged in, redirect to login
      if (isOnProtected && !isLoggedIn) {
        return false; // Will redirect to login page
      }
      
      // If on login/register and logged in, redirect to entries
      if ((isOnLogin || isOnRegister) && isLoggedIn) {
        return Response.redirect(new URL('/entries', nextUrl));
      }
      
      return true;
    },
  },
};
