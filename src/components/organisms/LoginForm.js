import React, { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import Link from '@/components/atoms/Link';
import { loginSchema } from '@/lib/validation/authSchema';

/**
 * LoginForm Organism Component
 * 
 * Login form for authenticating existing users with email/password.
 * Handles client-side validation using Joi schema and NextAuth signIn.
 * 
 * Features:
 * - Email and password fields with validation
 * - "Remember Me" checkbox for persistent sessions
 * - Real-time validation on blur
 * - Error handling and display
 * - Loading state during submission
 * - Forgot password link
 * - Google OAuth button placeholder
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onSuccess] - Callback called after successful login
 * @param {Function} [props.onError] - Callback called on login error with error object
 */
const LoginForm = ({ onSuccess, onError }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field error on change
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    // Clear submit error on change
    if (submitError) {
      setSubmitError('');
    }
  };

  /**
   * Handle field blur - validate single field
   */
  const handleBlur = (e) => {
    const { id, value } = e.target;
    
    // Skip checkbox validation
    if (id === 'rememberMe') {
      return;
    }
    
    // Validate single field
    const result = loginSchema.validate({
      [id]: value,
    }, { abortEarly: true });
    
    if (result.error && result.error.details[0].path[0] === id) {
      setErrors((prev) => ({
        ...prev,
        [id]: result.error.details[0].message,
      }));
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const result = loginSchema.validate(formData, { abortEarly: false });
    
    if (result.error) {
      const newErrors = {};
      result.error.details.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Import NextAuth signIn dynamically
      const { signIn } = await import('next-auth/react');
      
      // Attempt login with NextAuth
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        // Login failed
        const errorMessage = result.error === 'CredentialsSignin' 
          ? 'Invalid email or password'
          : result.error;
        
        setSubmitError(errorMessage);
        
        if (onError) {
          onError(new Error(errorMessage));
        }
      } else if (result?.ok) {
        // Login successful
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = async () => {
    try {
      const { signIn } = await import('next-auth/react');
      
      // For OAuth providers, we MUST redirect to the provider
      // redirect: false doesn't work with OAuth - it only works with credentials
      await signIn('google', { 
        callbackUrl: '/entries',
        // OAuth requires redirect to Google's consent screen
        // Any errors will be handled by NextAuth and shown on the callback
      });
    } catch (error) {
      console.error('Google login error:', error);
      setSubmitError('Failed to initiate Google login. Please try again or use email login.');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Email Field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      {/* Password Field */}
      <FormField
        id="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />

      {/* Remember Me Checkbox */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="rememberMe"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9375rem',
          }}
        >
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            style={{
              width: '1.125rem',
              height: '1.125rem',
              cursor: 'pointer',
              accentColor: '#059669',
            }}
          />
          <span>Remember me</span>
        </label>
      </div>

      {/* Submit Error */}
      {submitError && (
        <ErrorMessage style={{ marginBottom: '1.5rem' }}>
          {submitError}
        </ErrorMessage>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting}
        style={{ marginBottom: '1rem' }}
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>

      {/* Forgot Password Link */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Link href="/forgot-password" variant="text">
          Forgot your password?
        </Link>
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </span>
      </Button>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9375rem' }}>
        <span style={{ color: '#6b7280' }}>Don't have an account? </span>
        <Link href="/register" variant="text">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
