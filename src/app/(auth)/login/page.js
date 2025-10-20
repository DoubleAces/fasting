'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import LoginForm from '@/components/organisms/LoginForm';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * Login Page
 * 
 * User login page with email/password authentication.
 * Redirects to /entries after successful login.
 * Handles OAuth errors from callback.
 * 
 * Features:
 * - LoginForm component with validation
 * - NextAuth credentials provider integration
 * - Remember me functionality
 * - Google OAuth option
 * - OAuth error handling from URL params
 * - Forgot password link
 * - Sign up link for new users
 * - Redirect to /entries on success
 * 
 * Route: /login
 * Layout: Auth layout (no authenticated navbar)
 * 
 * Note: Metadata set via document title since this is a client component
 */

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [oauthError, setOauthError] = useState('');

  useEffect(() => {
    document.title = 'Log In - Fasting Tracker';
    
    // Check for OAuth errors in URL params
    const error = searchParams.get('error');
    if (error) {
      // Map NextAuth error codes to user-friendly messages
      const errorMessages = {
        'OAuthSignin': 'Error connecting to OAuth provider. Please try again.',
        'OAuthCallback': 'OAuth authentication failed. Please try again.',
        'OAuthCreateAccount': 'Could not create OAuth account. Please try again or use email/password.',
        'EmailCreateAccount': 'Could not create account with this email.',
        'Callback': 'Authentication callback failed. Please try again.',
        'OAuthAccountNotLinked': 'This email is already registered with a different login method. Please use your original login method.',
        'EmailSignin': 'Email authentication failed.',
        'CredentialsSignin': 'Invalid email or password.',
        'SessionRequired': 'Please sign in to access this page.',
        'Default': 'An authentication error occurred. Please try again.',
      };
      
      setOauthError(errorMessages[error] || errorMessages['Default']);
    }
  }, [searchParams]);

  /**
   * Handle successful login
   * Redirect to entries page
   */
  const handleSuccess = () => {
    router.push('/entries');
  };

  /**
   * Handle login error
   * Error is already displayed in the form
   */
  const handleError = (error) => {
    console.error('Login error:', error);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Page Heading */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Welcome Back
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Log in to continue your fasting journey
        </p>
      </div>

      {/* OAuth Error Message */}
      {oauthError && (
        <ErrorMessage style={{ marginBottom: '1.5rem' }}>
          {oauthError}
        </ErrorMessage>
      )}

      {/* Login Form */}
      <LoginForm onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
