/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/organisms/LoginForm';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginForm Component', () => {
  let mockSignIn;

  beforeEach(() => {
    // Get the mocked signIn function
    mockSignIn = require('next-auth/react').signIn;
    mockSignIn.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      render(<LoginForm />);

      const checkbox = screen.getByLabelText(/remember me/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render forgot password link', () => {
      render(<LoginForm />);

      const forgotLink = screen.getByText(/forgot your password/i);
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/reset-password');
    });

    it('should render Google OAuth button', () => {
      render(<LoginForm />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('should render sign up link', () => {
      render(<LoginForm />);

      const signUpLink = screen.getByText(/sign up/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
    });

    it('should render divider between login and OAuth', () => {
      render(<LoginForm />);

      expect(screen.getByText(/^or$/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FORM INTERACTION TESTS
  // ============================================================================

  describe('Form Interaction', () => {
    it('should update email field on input', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password field on input', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'SecurePass123');

      expect(passwordInput).toHaveValue('SecurePass123');
    });

    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const checkbox = screen.getByLabelText(/remember me/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should clear field error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      // Submit empty form to trigger validation
      await user.click(submitButton);

      // Verify error appears
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Type in field
      await user.type(emailInput, 't');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Validation', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /^log in$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /^log in$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email must be a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should not submit form with validation errors', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /^log in$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // signIn should not be called
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should validate on blur', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      
      await user.click(emailInput);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // FORM SUBMISSION TESTS
  // ============================================================================

  describe('Form Submission', () => {
    it('should call signIn with correct credentials on submit', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: true });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'SecurePass123',
          redirect: false,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      // Button should show loading text
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should call onSuccess callback on successful login', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      mockSignIn.mockResolvedValue({ ok: true });

      render(<LoginForm onSuccess={onSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should display error message on failed login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'WrongPassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should call onError callback on failed login', async () => {
      const user = userEvent.setup();
      const onError = jest.fn();
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' });

      render(<LoginForm onError={onError} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'WrongPassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });

    it('should clear previous errors on new submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });

      // First submission - fail
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'WrongPassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Second submission - should clear error during submission
      mockSignIn.mockResolvedValueOnce({ ok: true });
      await user.clear(passwordInput);
      await user.type(passwordInput, 'CorrectPassword');
      await user.click(submitButton);

      // Error should be cleared
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // GOOGLE OAUTH TESTS
  // ============================================================================

  describe('Google OAuth', () => {
    it('should call signIn with google provider when OAuth button clicked', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ ok: true });

      render(<LoginForm />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/entries' });
      });
    });

    it('should handle OAuth errors gracefully', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('OAuth error'));

      render(<LoginForm />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate google login/i)).toBeInTheDocument();
      });
    });

    it('should disable OAuth button during form submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /^log in$/i });
      const googleButton = screen.getByRole('button', { name: /continue with google/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      // OAuth button should be disabled during submission
      expect(googleButton).toBeDisabled();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<LoginForm />);

      const form = screen.getByRole('button', { name: /^log in$/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have labels associated with inputs', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should have proper autocomplete attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should mark required fields', () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });
});
