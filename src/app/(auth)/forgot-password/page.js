/**
 * Forgot Password Page
 * 
 * Public page for requesting password reset email.
 * Displays ForgotPasswordForm component.
 * 
 * Route: /forgot-password
 * 
 * Features:
 * - Email input form
 * - Success/error messaging
 * - Link back to login
 * - SEO metadata
 * 
 * @returns {JSX.Element} Forgot password page
 */

import React from 'react';
import ForgotPasswordForm from '@/components/organisms/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Fasting Tracker',
  description: 'Reset your password for Fasting Tracker',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
