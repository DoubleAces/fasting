/**
 * Reset Password Page
 * 
 * Public page for resetting password using token from email link.
 * Displays ResetPasswordForm component.
 * 
 * Route: /reset-password?token=xxx
 * 
 * Features:
 * - Password reset form
 * - Token extraction from URL
 * - Token validation
 * - Success/error messaging
 * - Link to login after success
 * - SEO metadata
 * 
 * @returns {JSX.Element} Reset password page
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/components/organisms/ResetPasswordForm';

/**
 * Reset Password Content Component
 * Wrapped in Suspense to handle useSearchParams
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Missing or invalid token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-6 shadow-md rounded-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This password reset link is invalid or has expired.
              </p>
              <div className="mt-6">
                <a
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-xl shadow-soft hover:shadow-soft-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Request New Reset Link
                </a>
              </div>
              <div className="mt-4">
                <a
                  href="/login"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Back to login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid token - show reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}

/**
 * Reset Password Page with Suspense Boundary
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
