/**
 * Auth Validation Schema Tests
 * 
 * Tests for Joi validation schemas including:
 * - registerSchema: email, password, confirmPassword, name
 * - loginSchema: email, password, rememberMe
 * - forgotPasswordSchema: email
 * - resetPasswordSchema: token, password, confirmPassword
 */

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validation/authSchema';

// ============================================================================
// REGISTER SCHEMA TESTS
// ============================================================================

describe('registerSchema', () => {
  describe('valid data', () => {
    test('should validate with all required fields', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe',
      };

      const { error, value } = registerSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value).toEqual(data);
    });

    test('should validate without optional name field', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should trim and lowercase email', () => {
      const data = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error, value } = registerSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });

    test('should trim name', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: '  John Doe  ',
      };

      const { error, value } = registerSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.name).toBe('John Doe');
    });
  });

  describe('email validation', () => {
    test('should reject missing email', () => {
      const data = {
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Email is required');
    });

    test('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('valid email');
    });

    test('should reject email without @', () => {
      const data = {
        email: 'testexample.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });

    test('should reject email without domain', () => {
      const data = {
        email: 'test@',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });
  });

  describe('password validation', () => {
    test('should reject missing password', () => {
      const data = {
        email: 'test@example.com',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Password is required');
    });

    test('should reject password shorter than 8 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'Short1',
        confirmPassword: 'Short1',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('at least 8 characters');
    });

    test('should reject password without uppercase letter', () => {
      const data = {
        email: 'test@example.com',
        password: 'lowercase123',
        confirmPassword: 'lowercase123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('uppercase letter');
    });

    test('should reject password without lowercase letter', () => {
      const data = {
        email: 'test@example.com',
        password: 'UPPERCASE123',
        confirmPassword: 'UPPERCASE123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('lowercase letter');
    });

    test('should reject password without number', () => {
      const data = {
        email: 'test@example.com',
        password: 'NoNumbers',
        confirmPassword: 'NoNumbers',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('one number');
    });

    test('should accept strong password with special characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'Secure@Pass123!',
        confirmPassword: 'Secure@Pass123!',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('confirmPassword validation', () => {
    test('should reject missing confirmPassword', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Confirm password is required');
    });

    test('should reject non-matching confirmPassword', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Passwords do not match');
    });

    test('should accept matching confirmPassword', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('name validation', () => {
    test('should accept valid name', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'John Doe',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject name longer than 100 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'A'.repeat(101),
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('100 characters');
    });

    test('should accept name with 100 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: 'A'.repeat(100),
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject empty string name', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
        name: '',
      };

      const { error } = registerSchema.validate(data);

      expect(error).toBeDefined();
    });
  });
});

// ============================================================================
// LOGIN SCHEMA TESTS
// ============================================================================

describe('loginSchema', () => {
  describe('valid data', () => {
    test('should validate with email and password', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should validate with rememberMe', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
        rememberMe: true,
      };

      const { error, value } = loginSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.rememberMe).toBe(true);
    });

    test('should default rememberMe to false', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const { error, value } = loginSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.rememberMe).toBe(false);
    });

    test('should trim and lowercase email', () => {
      const data = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'anypassword',
      };

      const { error, value } = loginSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });
  });

  describe('email validation', () => {
    test('should reject missing email', () => {
      const data = {
        password: 'anypassword',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Email is required');
    });

    test('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'anypassword',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
    });
  });

  describe('password validation', () => {
    test('should reject missing password', () => {
      const data = {
        email: 'test@example.com',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Password is required');
    });

    test('should accept any password (no strength validation on login)', () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('rememberMe validation', () => {
    test('should accept boolean true', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
        rememberMe: true,
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept boolean false', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
        rememberMe: false,
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should reject non-boolean rememberMe', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
        rememberMe: 'yes',
      };

      const { error } = loginSchema.validate(data);

      expect(error).toBeDefined();
    });
  });
});

// ============================================================================
// FORGOT PASSWORD SCHEMA TESTS
// ============================================================================

describe('forgotPasswordSchema', () => {
  describe('valid data', () => {
    test('should validate with email', () => {
      const data = {
        email: 'test@example.com',
      };

      const { error } = forgotPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should trim and lowercase email', () => {
      const data = {
        email: '  TEST@EXAMPLE.COM  ',
      };

      const { error, value } = forgotPasswordSchema.validate(data);

      expect(error).toBeUndefined();
      expect(value.email).toBe('test@example.com');
    });
  });

  describe('email validation', () => {
    test('should reject missing email', () => {
      const data = {};

      const { error } = forgotPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Email is required');
    });

    test('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
      };

      const { error } = forgotPasswordSchema.validate(data);

      expect(error).toBeDefined();
    });
  });
});

// ============================================================================
// RESET PASSWORD SCHEMA TESTS
// ============================================================================

describe('resetPasswordSchema', () => {
  describe('valid data', () => {
    test('should validate with all required fields', () => {
      const data = {
        token: 'a'.repeat(64), // 64-char hex
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('token validation', () => {
    test('should reject missing token', () => {
      const data = {
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Reset token is required');
    });

    test('should reject token shorter than 64 characters', () => {
      const data = {
        token: 'a'.repeat(63),
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid reset token');
    });

    test('should reject token longer than 64 characters', () => {
      const data = {
        token: 'a'.repeat(65),
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid reset token');
    });

    test('should reject token with non-hex characters', () => {
      const data = {
        token: 'G'.repeat(64), // G is not valid hex
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid reset token');
    });

    test('should accept valid 64-char hex token', () => {
      const data = {
        token: 'abc123def456'.repeat(5) + 'abcd', // 64 hex chars
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });

    test('should accept token with lowercase hex only', () => {
      const data = {
        token: 'abcdef0123456789'.repeat(4), // 64 hex chars
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('password validation', () => {
    test('should reject missing password', () => {
      const data = {
        token: 'a'.repeat(64),
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Password is required');
    });

    test('should reject weak password', () => {
      const data = {
        token: 'a'.repeat(64),
        password: 'weak',
        confirmPassword: 'weak',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toMatch(/at least 8 characters|uppercase|lowercase|number/);
    });

    test('should accept strong password', () => {
      const data = {
        token: 'a'.repeat(64),
        password: 'StrongPass123',
        confirmPassword: 'StrongPass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });

  describe('confirmPassword validation', () => {
    test('should reject missing confirmPassword', () => {
      const data = {
        token: 'a'.repeat(64),
        password: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Confirm password is required');
    });

    test('should reject non-matching confirmPassword', () => {
      const data = {
        token: 'a'.repeat(64),
        password: 'NewSecurePass123',
        confirmPassword: 'DifferentPass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeDefined();
      expect(error.message).toContain('Passwords do not match');
    });

    test('should accept matching confirmPassword', () => {
      const data = {
        token: 'a'.repeat(64),
        password: 'NewSecurePass123',
        confirmPassword: 'NewSecurePass123',
      };

      const { error } = resetPasswordSchema.validate(data);

      expect(error).toBeUndefined();
    });
  });
});
