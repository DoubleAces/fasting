'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/components/organisms/LoginForm';

/**
 * Login Page
 * 
 * User login page with email/password authentication.
 * Redirects to /entries after successful login.
 * 
 * Features:
 * - LoginForm component with validation
 * - NextAuth credentials provider integration
 * - Remember me functionality
 * - Google OAuth option
 * - Forgot password link
 * - Sign up link for new users
 * - Redirect to /entries on success
 * 
 * Route: /login
 * Layout: Auth layout (no authenticated navbar)
 */

// Page metadata (noindex for SEO - don't index auth pages)
export const metadata = {
  title: 'Log In - Fasting Tracker',
  description: 'Log in to your Fasting Tracker account to access your fasting entries and settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  const router = useRouter();

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

      {/* Login Form */}
      <LoginForm onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
}
