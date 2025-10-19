/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import RegisterPage from '@/app/(auth)/register/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('RegisterPage', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({
      push: mockPush,
    });
    
    fetch.mockClear();
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
    it('should render registration form', () => {
      render(<RegisterPage />);

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<RegisterPage />);

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      render(<RegisterPage />);

      const loginLink = screen.getByText(/log in/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('should set page title on mount', () => {
      render(<RegisterPage />);

      expect(document.title).toBe('Create Account - Fasting Tracker');
    });

    it('should set noindex meta tag', () => {
      render(<RegisterPage />);

      const metaRobots = document.querySelector('meta[name="robots"]');
      expect(metaRobots).toBeTruthy();
      expect(metaRobots.content).toBe('noindex, nofollow');
    });
  });

  // ============================================================================
  // FORM SUBMISSION TESTS
  // ============================================================================

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockResolvedValueOnce({ ok: true, error: null });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
          method: 'POST',
        }));
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Wait for registration to complete and auto-login to start
      await waitFor(() => {
        expect(screen.getByText(/creating your account/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // AUTO-LOGIN AND REDIRECT TESTS
  // ============================================================================

  describe('Auto-Login and Redirect', () => {
    it('should auto-login user after successful registration', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockResolvedValueOnce({ ok: true, error: null });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'SecurePass123',
          redirect: false,
        });
      });
    });

    it('should redirect to /entries after successful auto-login', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockResolvedValueOnce({ ok: true, error: null });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/entries');
      });
    });

    it('should redirect to login page if auto-login fails', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?registered=true');
      });
    });

    it('should redirect to login on auto-login error', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '123', email: 'test@example.com' },
        }),
      });

      signIn.mockRejectedValueOnce(new Error('Network error'));

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?registered=true');
      });
    });
  });

  // ============================================================================
  // ERROR DISPLAY TESTS
  // ============================================================================

  describe('Error Display', () => {
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

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it('should display general error messages', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Server error occurred',
        }),
      });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
      });
    });

    it('should not redirect when registration fails', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Validation failed',
        }),
      });

      render(<RegisterPage />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password/i), 'SecurePass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should not call signIn or redirect
      expect(signIn).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
