/**
 * Authentication Validation Schemas
 * 
 * Joi validation schemas for authentication-related forms and API requests.
 * Includes registration, login, password reset request, and password reset confirmation.
 * 
 * Schemas:
 * - registerSchema: User registration with email, password, confirmPassword, name
 * - loginSchema: User login with email, password, optional rememberMe
 * - forgotPasswordSchema: Password reset request with email
 * - resetPasswordSchema: Password reset confirmation with token, password, confirmPassword
 * 
 * Password Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional: special characters for added security
 * 
 * Features:
 * - Email format validation (RFC 5322)
 * - Password strength validation
 * - Password confirmation matching
 * - Trimmed strings
 * - Custom error messages
 */

import Joi from 'joi';

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Password strength validator
 * Requires:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordValidator = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  .messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

/**
 * Email validator
 * Standard email format validation
 */
const emailValidator = Joi.string()
  .email({ tlds: { allow: false } }) // Allow all TLDs
  .trim()
  .lowercase()
  .required()
  .messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
  });

// ============================================================================
// REGISTRATION SCHEMA
// ============================================================================

/**
 * User registration validation schema
 * 
 * Fields:
 * - email: Required, valid email format
 * - password: Required, strong password (8+ chars, uppercase, lowercase, number)
 * - confirmPassword: Required, must match password
 * - name: Optional, 1-100 characters
 * 
 * @example
 * const result = registerSchema.validate({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   confirmPassword: 'SecurePass123',
 *   name: 'John Doe'
 * });
 */
export const registerSchema = Joi.object({
  email: emailValidator,

  password: passwordValidator.required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords do not match',
    }),

  name: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Name must be at least 1 character',
    'string.max': 'Name cannot exceed 100 characters',
  }),
});

// ============================================================================
// LOGIN SCHEMA
// ============================================================================

/**
 * User login validation schema
 * 
 * Fields:
 * - email: Required, valid email format
 * - password: Required (no strength validation on login)
 * - rememberMe: Optional boolean, default false
 * 
 * @example
 * const result = loginSchema.validate({
 *   email: 'user@example.com',
 *   password: 'userPassword',
 *   rememberMe: true
 * });
 */
export const loginSchema = Joi.object({
  email: emailValidator,

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),

  rememberMe: Joi.boolean().optional().default(false),
});

// ============================================================================
// FORGOT PASSWORD SCHEMA
// ============================================================================

/**
 * Password reset request validation schema
 * 
 * Fields:
 * - email: Required, valid email format
 * 
 * @example
 * const result = forgotPasswordSchema.validate({
 *   email: 'user@example.com'
 * });
 */
export const forgotPasswordSchema = Joi.object({
  email: emailValidator,
});

// ============================================================================
// RESET PASSWORD SCHEMA
// ============================================================================

/**
 * Password reset confirmation validation schema
 * 
 * Fields:
 * - token: Required, 64-character hexadecimal string
 * - password: Required, strong password (8+ chars, uppercase, lowercase, number)
 * - confirmPassword: Required, must match password
 * 
 * @example
 * const result = resetPasswordSchema.validate({
 *   token: 'a1b2c3d4...', // 64 hex chars
 *   password: 'NewSecurePass123',
 *   confirmPassword: 'NewSecurePass123'
 * });
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .length(64)
    .pattern(/^[a-f0-9]{64}$/)
    .required()
    .messages({
      'string.empty': 'Reset token is required',
      'string.length': 'Invalid reset token format',
      'string.pattern.base': 'Invalid reset token format',
    }),

  password: passwordValidator.required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords do not match',
    }),
});

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
