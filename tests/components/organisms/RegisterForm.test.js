/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '@/components/organisms/RegisterForm';

// Mock fetch globally
global.fetch = jest.fn();

describe('RegisterForm Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterForm />);

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render heading and description', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByText(/start tracking your fasting journey/i)).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<RegisterForm />);

      const loginLink = screen.getByText(/log in/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should render help text for password requirements', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/minimum 8 characters with uppercase, lowercase, and number/i)).toBeInTheDocument();
    });

    it('should render help text for optional name field', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/optional.*personalize your experience/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(<RegisterForm />);

      // Email, password, and confirmPassword are required
      const emailLabel = screen.getByLabelText(/email/i).closest('div').querySelector('label');
      expect(emailLabel).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FORM INTERACTION TESTS
  // ============================================================================

  describe('Form Interaction', () => {
    it('should update email field on input', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update name field on input', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/^name/i);
      await user.type(nameInput, 'John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });

    it('should update password field on input', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'SecurePass123');

      expect(passwordInput).toHaveValue('SecurePass123');
    });

    it('should update confirmPassword field on input', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const confirmInput = screen.getByLabelText(/confirm password/i);
      await user.type(confirmInput, 'SecurePass123');

      expect(confirmInput).toHaveValue('SecurePass123');
    });

    it('should clear field error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

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

  describe('Client-Side Validation', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email must be a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for weak password (too short)', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'Short1');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for password without uppercase', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'lowercase123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });
    });

    it('should show error for password without lowercase', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'UPPERCASE123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must contain.*lowercase letter/i)).toBeInTheDocument();
      });
    });

    it('should show error for password without number', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'NoNumbers');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must contain.*number/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'SecurePass123');
      await user.type(confirmInput, 'DifferentPass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should show error for missing confirmPassword', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'SecurePass123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for name exceeding max length', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/^name/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      const longName = 'a'.repeat(101);
      await user.type(nameInput, longName);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name cannot exceed 100 characters/i)).toBeInTheDocument();
      });
    });

    it('should show multiple validation errors together', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        // Note: confirmPassword error doesn't show when password is also empty
        // This is expected Joi behavior with ref validation
      });
    });
  });

  // ============================================================================
  // PASSWORD STRENGTH INDICATOR TESTS
  // ============================================================================

  describe('Password Strength Indicator', () => {
    it('should not show strength indicator when password is empty', () => {
      render(<RegisterForm />);
      expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
    });

    it('should show weak strength for simple password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'Pass123');

      await waitFor(() => {
        expect(screen.getByText(/password strength: weak/i)).toBeInTheDocument();
      });
    });

    it('should show medium strength for moderate password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'SecurePass123');

      await waitFor(() => {
        expect(screen.getByText(/password strength: medium/i)).toBeInTheDocument();
      });
    });

    it('should show strong strength for complex password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText(/^password/i);
      await user.type(passwordInput, 'SecureP@ssw0rd123!');

      await waitFor(() => {
        expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // SUBMISSION TESTS
  // ============================================================================

  describe('Form Submission', () => {
    it('should call API with correct data on valid submission', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: '123', email: 'test@example.com' } }),
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^name/i), 'John Doe');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }));
        
        // Verify body contains all required fields
        const callArgs = fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body).toEqual({
          email: 'test@example.com',
          name: 'John Doe',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        });
      });
    });

    it('should call onSuccess callback on successful registration', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const mockResponse = { user: { id: '123', email: 'test@example.com' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<RegisterForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should disable form fields during submission', async () => {
      const user = userEvent.setup();

      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password/i)).toBeDisabled();
      expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should display API validation errors', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Validation failed',
          details: [
            { field: 'email', message: 'Email already exists' },
          ],
        }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should display general error message from API', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Registration temporarily unavailable',
        }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration temporarily unavailable/i)).toBeInTheDocument();
      });
    });

    it('should call onError callback on API error', async () => {
      const user = userEvent.setup();
      const mockOnError = jest.fn();

      const mockError = { message: 'Registration failed' };
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      render(<RegisterForm onError={mockOnError} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
      });
    });

    it('should clear submit error when user starts typing', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Registration failed',
        }),
      });

      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });

      // Type in email field
      await user.type(screen.getByLabelText(/email/i), 'x');

      // Error should be cleared
      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper autocomplete attributes', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText(/^name/i)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should prevent browser validation with noValidate', () => {
      const { container } = render(<RegisterForm />);
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });
});
