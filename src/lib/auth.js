/**
 * NextAuth.js v5 Configuration
 * 
 * Configures authentication providers, JWT strategy, and callbacks.
 * 
 * Providers:
 * - Credentials: Email/password authentication with bcrypt validation
 * - Google OAuth: Social login via Google account
 * 
 * Session Strategy: JWT (stateless, no database session storage)
 * 
 * Security:
 * - Passwords hashed with bcrypt (10 rounds minimum)
 * - CSRF protection (built-in)
 * - Secure cookies (HttpOnly, Secure, SameSite)
 * - JWT tokens signed with NEXTAUTH_SECRET
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { loginSchema } from '@/lib/validation/authSchema';
import { sendWelcomeEmail } from '@/lib/utils/email';

/**
 * NextAuth configuration object
 */
export const authConfig = {
  // ============================================================================
  // PROVIDERS
  // ============================================================================
  
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'checkbox' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials with Joi schema
          const { error, value } = loginSchema.validate(credentials, {
            abortEarly: false,
          });

          if (error) {
            throw new Error('Invalid credentials format');
          }

          const { email, password } = value;

          // Connect to database
          await connectDB();

          // Find user by email
          const user = await User.findByEmail(email);

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify user is active
          if (!user.isActive) {
            throw new Error('Account is inactive. Please contact support.');
          }

          // Only validate password for email/password auth (not OAuth users)
          if (user.authMethod === 'email') {
            // Verify password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
              throw new Error('Invalid email or password');
            }
          } else {
            throw new Error(
              'This account uses Google sign-in. Please use "Continue with Google" button.'
            );
          }

          // Update last login timestamp
          await user.updateLastLogin();

          // Return user object (will be stored in JWT)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.picture,
            authMethod: user.authMethod,
          };
        } catch (error) {
          console.error('Credentials authorization error:', error);
          // Return null to indicate failed authentication
          // NextAuth will show generic "Sign in failed" error
          return null;
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid profile email',
        },
      },
      profile(profile) {
        console.log('🔵 Google profile callback triggered');
        console.log('Profile data:', profile);
        // Map Google profile to our user schema
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          emailVerified: profile.email_verified,
        };
      },
    }),
  ],

  // ============================================================================
  // SESSION STRATEGY
  // ============================================================================

  session: {
    strategy: 'jwt', // Use JWT tokens (stateless)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ============================================================================
  // JWT CONFIGURATION
  // ============================================================================

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ============================================================================
  // COOKIES
  // ============================================================================
  
  useSecureCookies: process.env.NODE_ENV === 'production',

  // ============================================================================
  // TRUST HOST (Required for Vercel deployment)
  // ============================================================================

  trustHost: true,

  // ============================================================================
  // PAGES (Custom Auth Pages)
  // ============================================================================

  pages: {
    signIn: '/login', // Custom login page
    signOut: '/', // Redirect to homepage after sign out
    error: '/login', // Error page (redirect to login with error query)
    newUser: '/entries', // Redirect new users to entries page
  },

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  callbacks: {
    /**
     * JWT Callback
     * 
     * Called whenever a JWT is created or updated.
     * Adds user data to the token.
     * 
     * @param {Object} params
     * @param {Object} params.token - JWT token
     * @param {Object} params.user - User object (only available on sign in)
     * @param {Object} params.account - Account object (only available on sign in)
     * @param {Object} params.profile - OAuth profile (only for OAuth providers)
     * @returns {Object} Updated token
     */
    async jwt({ token, user, account, profile }) {
      // On initial sign in, user object is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.picture;
        token.authMethod = user.authMethod || 'email';
      }

      // Handle Google OAuth sign in
      if (account?.provider === 'google' && profile) {
        console.log('🔵 Google OAuth JWT callback triggered');
        console.log('Profile:', profile);
        
        try {
          await connectDB();
          console.log('✅ Database connected');

          // Check if user exists in database
          let existingUser = await User.findByEmail(profile.email);

          if (!existingUser) {
            console.log('🆕 Creating new user from Google OAuth');
            // Create new user for first-time Google login
            existingUser = await User.create({
              email: profile.email,
              name: profile.name,
              picture: profile.picture,
              authMethod: 'google',
              googleId: profile.sub,
              emailVerified: true,
            });
            console.log('✅ User created:', existingUser._id);

            // Send welcome email (async, don't wait)
            sendWelcomeEmail({
              email: existingUser.email,
              name: existingUser.name,
            }).catch((err) => console.error('Failed to send welcome email:', err));
          } else {
            console.log('✅ Existing user found:', existingUser._id);
            // Update existing user with Google info if not already linked
            if (!existingUser.googleId) {
              console.log('🔗 Linking Google account to existing user');
              existingUser.googleId = profile.sub;
              existingUser.emailVerified = true;
            }
            
            // Always update picture to latest from Google
            if (profile.picture) {
              existingUser.picture = profile.picture;
            }
            
            await existingUser.save();

            // Update last login
            await existingUser.updateLastLogin();
          }

          // Add user data to token (including picture)
          token.id = existingUser._id.toString();
          token.authMethod = 'google';
          token.picture = existingUser.picture; // Add picture to token
          console.log('✅ Token updated with user ID:', token.id);
        } catch (error) {
          console.error('❌ Error in Google OAuth JWT callback:', error);
          console.error('Error details:', error.message);
          console.error('Stack:', error.stack);
          // Don't throw - let NextAuth handle the error
        }
      }

      return token;
    },

    /**
     * Session Callback
     * 
     * Called whenever a session is checked (e.g., getSession, useSession).
     * Adds user data from JWT to the session object.
     * 
     * @param {Object} params
     * @param {Object} params.session - Session object
     * @param {Object} params.token - JWT token
     * @returns {Object} Updated session
     */
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.picture = token.picture;
        session.user.authMethod = token.authMethod;
      }

      return session;
    },

    /**
     * Sign In Callback
     * 
     * Called on sign in before redirecting.
     * Can be used to control whether user is allowed to sign in.
     * 
     * @param {Object} params
     * @param {Object} params.user - User object
     * @param {Object} params.account - Account object
     * @param {Object} params.profile - OAuth profile
     * @returns {boolean} Whether to allow sign in
     */
    async signIn({ user, account, profile }) {
      console.log('🔵 SignIn callback triggered');
      console.log('Provider:', account?.provider);
      console.log('User email:', user?.email || profile?.email);
      
      // Allow all sign ins (additional checks can be added here)
      return true;
    },

    /**
     * Redirect Callback
     * 
     * Called anytime user is redirected to a callback URL.
     * Can be used to customize redirect behavior.
     * 
     * @param {Object} params
     * @param {string} params.url - URL to redirect to
     * @param {string} params.baseUrl - Base URL of site
     * @returns {string} URL to redirect to
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to base URL for external URLs
      return baseUrl;
    },
  },

  // ============================================================================
  // EVENTS
  // ============================================================================

  events: {
    /**
     * Sign In Event
     * 
     * Triggered on successful sign in.
     * Can be used for logging, analytics, etc.
     */
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} (${account?.provider || 'credentials'})`);
    },

    /**
     * Sign Out Event
     * 
     * Triggered on sign out.
     */
    async signOut({ token, session }) {
      console.log(`User signed out: ${token?.email || 'unknown'}`);
    },
  },

  // ============================================================================
  // DEBUG (Development only)
  // ============================================================================

  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth handler
 * 
 * Initialize NextAuth with configuration.
 * This is used in the API route handler.
 */
let authInstance;
try {
  console.log('🔵 Initializing NextAuth...');
  console.log('Environment check:', {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  });
  
  authInstance = NextAuth(authConfig);
  console.log('✅ NextAuth initialized successfully');
} catch (error) {
  console.error('❌ NextAuth initialization error:', error);
  console.error('Stack:', error.stack);
  throw error;
}

export const { handlers, auth, signIn, signOut } = authInstance;
