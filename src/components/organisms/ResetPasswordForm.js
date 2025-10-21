/**
 * ResetPasswordForm Organism Component
 * 
 * Form for resetting user password using token from email link.
 * Handles client-side validation using Joi schema.
 * 
 * Features:
 * - Password and confirm password fields with validation
 * - Password strength requirements display
 * - Real-time validation on blur
 * - Error handling and display
 * - Success message display
 * - Loading state during submission
 * - Token validation feedback
 * - Link to login page after success
 * 
 * @param {Object} props - Component props
 * @param {string} props.token - Reset token from email link
 * @param {Function} [props.onSuccess] - Callback called after successful reset
 * @param {Function} [props.onError] - Callback called on error with error object
 */

'use client';

import React, { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import Link from '@/components/atoms/Link';
import { resetPasswordSchema } from '@/lib/validation/authSchema';

const ResetPasswordForm = ({ token, onSuccess, onError }) => {
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear field error on change
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
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
    const validation = resetPasswordSchema.validate(
      {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      { abortEarly: false }
    );

    if (validation.error) {
      const fieldError = validation.error.details.find(
        (error) => error.path[0] === field
      );
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError.message,
        }));
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
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
    const validation = resetPasswordSchema.validate(
      {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Success
      setSuccessMessage(
        data.message || 'Password successfully reset. You can now log in with your new password.'
      );
      setFormData({ password: '', confirmPassword: '' }); // Clear form

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
          <div className="mt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              Go to login →
            </Link>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {submitError && <ErrorMessage message={submitError} />}

      {/* Password Requirements */}
      {!successMessage && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p className="font-medium text-gray-700 mb-1">
            Password requirements:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>At least 8 characters long</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
          </ul>
        </div>
      )}

      {/* Password Field */}
      {!successMessage && (
        <FormField
          id="password"
          label="New Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handleBlur('password')}
          error={errors.password}
          required
          autoComplete="new-password"
          placeholder="Enter your new password"
          disabled={isSubmitting}
        />
      )}

      {/* Confirm Password Field */}
      {!successMessage && (
        <FormField
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur('confirmPassword')}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          placeholder="Confirm your new password"
          disabled={isSubmitting}
        />
      )}

      {/* Submit Button */}
      {!successMessage && (
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      )}

      {/* Back to Login Link (shown when not successful yet) */}
      {!successMessage && (
        <div className="text-center text-sm">
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to login
          </Link>
        </div>
      )}
    </form>
  );
};

export default ResetPasswordForm;
