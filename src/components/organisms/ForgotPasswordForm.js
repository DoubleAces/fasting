/**
 * ForgotPasswordForm Organism Component
 * 
 * Form for requesting password reset email.
 * Handles client-side validation using Joi schema.
 * 
 * Features:
 * - Email field with validation
 * - Real-time validation on blur
 * - Error handling and display
 * - Success message display
 * - Loading state during submission
 * - Link back to login page
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onSuccess] - Callback called after successful request
 * @param {Function} [props.onError] - Callback called on error with error object
 */

'use client';

import React, { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import Link from '@/components/atoms/Link';
import { forgotPasswordSchema } from '@/lib/validation/authSchema';

const ForgotPasswordForm = ({ onSuccess, onError }) => {
  // Form state
  const [email, setEmail] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  /**
   * Handle email input change
   */
  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear field error on change
    if (errors.email) {
      setErrors({});
    }
    
    // Clear submit error on change
    if (submitError) {
      setSubmitError('');
    }
    
    // Clear success message on change
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  /**
   * Validate single field on blur
   */
  const handleBlur = (field) => {
    const validation = forgotPasswordSchema.validate(
      { email },
      { abortEarly: false }
    );

    if (validation.error) {
      const fieldError = validation.error.details.find(
        (error) => error.path[0] === field
      );
      if (fieldError) {
        setErrors({ [field]: fieldError.message });
      }
    } else {
      setErrors({});
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');

    // Validate form data
    const validation = forgotPasswordSchema.validate(
      { email },
      { abortEarly: false }
    );

    if (validation.error) {
      const formErrors = {};
      validation.error.details.forEach((error) => {
        formErrors[error.path[0]] = error.message;
      });
      setErrors(formErrors);
      return;
    }

    // Submit form
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      // Success
      setSuccessMessage(
        data.message || 'If an account with that email exists, a password reset link has been sent.'
      );
      
      // In development, show the reset URL
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
      
      setEmail(''); // Clear form

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setSubmitError(error.message || 'An error occurred. Please try again.');

      // Call error callback
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{successMessage}</p>
          {devResetUrl && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs font-semibold text-yellow-800 mb-2">
                🔧 DEVELOPMENT MODE - Reset Link:
              </p>
              <a
                href={devResetUrl}
                className="text-xs text-primary-600 hover:text-primary-700 underline break-all"
              >
                {devResetUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Submit Error */}
      {submitError && <ErrorMessage message={submitError} />}

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      {/* Email Field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        required
        autoComplete="email"
        placeholder="you@example.com"
        disabled={isSubmitting}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center text-sm">
        <span className="text-gray-600">Remember your password? </span>
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
