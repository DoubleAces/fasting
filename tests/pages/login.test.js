/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/(auth)/login/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    
    signIn.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />);

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    });

    it('should render page heading', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByText(/log in to continue your fasting journey/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByText(/forgot your password/i);
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink.closest('a')).toHaveAttribute('href', '/reset-password');
    });

    it('should render Google OAuth button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('should render link to sign up page', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByText(/sign up/i);
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
    });

    it('should set page title on mount', () => {
      render(<LoginPage />);

      expect(document.title).toBe('Log In - Fasting Tracker');
    });
  });

  // ============================================================================
  // FORM SUBMISSION TESTS
  // ============================================================================

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: true });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'SecurePass123',
          redirect: false,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      signIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      // Button should show loading text
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
    });

    it('should display error message on incorrect credentials', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should not redirect on failed login', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      signIn.mockRejectedValueOnce(new Error('Network error'));

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // REDIRECT TESTS
  // ============================================================================

  describe('Redirect After Success', () => {
    it('should redirect to /entries after successful login', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: true });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/entries');
      });
    });

    it('should not redirect if login fails', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: false, error: 'CredentialsSignin' });

      render(<LoginPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'WrongPassword');
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('Validation', () => {
    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();

      render(<LoginPage />);

      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(signIn).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/email must be a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup();

      render(<LoginPage />);

      // Submit empty form to trigger validation
      await user.click(screen.getByRole('button', { name: /^log in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Type in email field
      await user.type(screen.getByLabelText(/email/i), 't');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // REMEMBER ME TESTS
  // ============================================================================

  describe('Remember Me Functionality', () => {
    it('should include remember me checkbox', () => {
      render(<LoginPage />);

      const checkbox = screen.getByLabelText(/remember me/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should allow toggling remember me checkbox', async () => {
      const user = userEvent.setup();

      render(<LoginPage />);

      const checkbox = screen.getByLabelText(/remember me/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  // ============================================================================
  // GOOGLE OAUTH TESTS
  // ============================================================================

  describe('Google OAuth', () => {
    it('should call signIn with google provider when OAuth button clicked', async () => {
      const user = userEvent.setup();
      signIn.mockResolvedValueOnce({ ok: true });

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/entries' });
      });
    });

    it('should handle OAuth errors', async () => {
      const user = userEvent.setup();
      signIn.mockRejectedValueOnce(new Error('OAuth error'));

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to initiate google login/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<LoginPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/welcome back/i);
    });

    it('should have labels associated with all inputs', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('should have proper autocomplete attributes', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should mark required fields', () => {
      render(<LoginPage />);

      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/^password/i)).toBeRequired();
    });
  });

  // ============================================================================
  // NAVIGATION LINKS TESTS
  // ============================================================================

  describe('Navigation Links', () => {
    it('should have link to forgot password page', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByText(/forgot your password/i).closest('a');
      expect(forgotLink).toHaveAttribute('href', '/reset-password');
    });

    it('should have link to sign up page', () => {
      render(<LoginPage />);

      const signUpLink = screen.getByText(/sign up/i).closest('a');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });

    it('should display helper text for new users', () => {
      render(<LoginPage />);

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });
  });
});
