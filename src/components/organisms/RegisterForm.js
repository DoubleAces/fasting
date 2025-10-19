import React, { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import Link from '@/components/atoms/Link';
import { registerSchema } from '@/lib/validation/authSchema';

/**
 * RegisterForm Organism Component
 * 
 * Registration form for creating new user accounts with email/password.
 * Handles client-side validation using Joi schema and API submission.
 * 
 * Features:
 * - Email and password fields with validation
 * - Password confirmation matching
 * - Optional name field
 * - Real-time validation on blur
 * - Password strength indicators
 * - Error handling and display
 * - Loading state during submission
 * 
 * @param {Object} props - Component props
 * @param {Function} [props.onSuccess] - Callback called after successful registration with user data
 * @param {Function} [props.onError] - Callback called on registration error with error object
 */
const RegisterForm = ({ onSuccess, onError }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    
    // Skip validation for optional empty fields
    if (id === 'name' && !value) {
      return;
    }
    
    // For confirmPassword, we need the full context
    if (id === 'confirmPassword') {
      const result = registerSchema.validate({
        ...formData,
        confirmPassword: value,
      }, { abortEarly: true });
      
      if (result.error && result.error.details[0].path[0] === 'confirmPassword') {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: result.error.details[0].message,
        }));
      }
      return;
    }
    
    // Validate single field for others
    const result = registerSchema.validate({
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
    const result = registerSchema.validate(formData, { abortEarly: false });
    
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
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from API
        if (data.details && Array.isArray(data.details)) {
          const newErrors = {};
          data.details.forEach((err) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        } else {
          // Handle general error
          setSubmitError(data.message || 'Registration failed. Please try again.');
        }
        
        if (onError) {
          onError(data);
        }
        return;
      }
      
      // Success - call callback
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('An unexpected error occurred. Please try again later.');
      
      if (onError) {
        onError({ message: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculate password strength
   */
  const getPasswordStrength = (password) => {
    if (!password) return null;
    
    // If password doesn't meet minimum requirements, it's weak
    if (password.length < 8) return 'weak';
    if (!/[a-z]/.test(password)) return 'weak';
    if (!/[A-Z]/.test(password)) return 'weak';
    if (!/\d/.test(password)) return 'weak';
    
    let strength = 0;
    
    // Length bonus
    if (password.length >= 12) strength++;
    
    // Special character bonus
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Medium: meets all basic requirements (0-1 bonus points)
    // Strong: exceeds requirements (2+ bonus points)
    if (strength >= 2) return 'strong';
    return 'medium';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Create your account
        </h2>
        <p style={{ color: '#6b7280' }}>
          Start tracking your fasting journey today
        </p>
      </div>

      {submitError && (
        <ErrorMessage style={{ marginBottom: '1rem' }}>
          {submitError}
        </ErrorMessage>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          placeholder="you@example.com"
          required
          disabled={isSubmitting}
          autoComplete="email"
        />

        <FormField
          id="name"
          label="Name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          placeholder="John Doe (optional)"
          disabled={isSubmitting}
          autoComplete="name"
          helpText="Optional - helps personalize your experience"
        />

        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
            autoComplete="new-password"
            helpText="Minimum 8 characters with uppercase, lowercase, and number"
          />
          
          {/* Password strength indicator */}
          {formData.password && passwordStrength && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                gap: '0.25rem',
                marginBottom: '0.25rem'
              }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: passwordStrength === 'weak' ? '#ef4444' : 
                                   passwordStrength === 'medium' ? '#f59e0b' : '#10b981',
                  transition: 'background-color 0.2s',
                }}></div>
                <div style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                                   (passwordStrength === 'medium' ? '#f59e0b' : '#10b981') : '#e5e7eb',
                  transition: 'background-color 0.2s',
                }}></div>
                <div style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: passwordStrength === 'strong' ? '#10b981' : '#e5e7eb',
                  transition: 'background-color 0.2s',
                }}></div>
              </div>
              <p style={{ 
                fontSize: '0.875rem',
                color: passwordStrength === 'weak' ? '#ef4444' : 
                       passwordStrength === 'medium' ? '#f59e0b' : '#10b981',
              }}>
                Password strength: {passwordStrength}
              </p>
            </div>
          )}
        </div>

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
          disabled={isSubmitting}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.875rem',
          color: '#6b7280',
          marginTop: '1rem'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: '500' }}>
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
