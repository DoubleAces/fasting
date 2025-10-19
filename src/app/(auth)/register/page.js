'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import RegisterForm from '@/components/organisms/RegisterForm';

/**
 * Registration Page
 * 
 * Allows users to create new accounts with email/password authentication.
 * Handles successful registration by automatically logging in the user
 * and redirecting to the entries dashboard.
 * 
 * Features:
 * - Email/password registration form
 * - Automatic login after successful registration
 * - Error handling and display
 * - Redirect to /entries after success
 * - Link to login page for existing users
 * 
 * SEO: This page uses noindex to prevent indexing of auth pages
 */

export default function RegisterPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Set page title and meta tags
  useEffect(() => {
    document.title = 'Create Account - Fasting Tracker';
    
    // Add noindex meta tag
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';
    
    // Add description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Create your Fasting Tracker account to start monitoring your fasting journey.';
  }, []);

  /**
   * Handle successful registration
   * Automatically log in the user and redirect to entries page
   */
  const handleSuccess = async (data, password) => {
    try {
      setIsRedirecting(true);
      
      // Automatically sign in the user after registration
      const result = await signIn('credentials', {
        email: data.user.email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        console.error('Auto-login failed:', result.error);
        // Redirect to login page if auto-login fails
        router.push('/login?registered=true');
      } else {
        // Successful login - redirect to entries
        router.push('/entries');
      }
    } catch (error) {
      console.error('Error during post-registration:', error);
      // Redirect to login on error
      router.push('/login?registered=true');
    }
  };

  /**
   * Handle registration errors
   * Errors are already displayed by the form component
   */
  const handleError = (error) => {
    console.error('Registration error:', error);
    setIsRedirecting(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      }}>
        {isRedirecting ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Creating your account...
            </p>
          </div>
        ) : (
          <RegisterForm onSuccess={handleSuccess} onError={handleError} />
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
