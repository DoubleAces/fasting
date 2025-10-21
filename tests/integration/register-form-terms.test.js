/**
 * Integration Tests for RegisterForm with Terms Acceptance
 * 
 * Tests the integration between RegisterForm and TermsCheckbox components.
 * Validates that terms acceptance is required for registration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from '@/components/organisms/RegisterForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('RegisterForm - Terms Acceptance Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  it('should render terms checkbox in registration form', () => {
    render(<RegisterForm />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(/I have read and agree to the/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Terms and Conditions/i })).toBeInTheDocument();
  });

  it('should prevent form submission when terms are not accepted', async () => {
    const { container } = render(<RegisterForm />);

    // Fill in valid form data
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });

    // Do NOT check the terms checkbox
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    // Try to submit
    const submitButton = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/must accept the Terms and Conditions/i)).toBeInTheDocument();
    });

    // API should NOT be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should allow form submission when terms are accepted', async () => {
    // Mock successful registration
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: '123',
          email: 'test@example.com',
          name: null,
        },
      }),
    });

    const mockOnSuccess = jest.fn();
    const { container } = render(<RegisterForm onSuccess={mockOnSuccess} />);

    // Fill in valid form data
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');
    const checkbox = screen.getByRole('checkbox');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
    fireEvent.click(checkbox); // Accept terms

    expect(checkbox).toBeChecked();

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(submitButton);

    // Should call API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test@example.com'),
        })
      );
    });

    // Should call onSuccess callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should clear terms error when checkbox is checked after validation error', async () => {
    const { container } = render(<RegisterForm />);

    // Fill in valid form data but don't accept terms
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });

    // Submit without accepting terms
    const submitButton = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(submitButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/must accept the Terms and Conditions/i)).toBeInTheDocument();
    });

    // Now accept terms
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/must accept the Terms and Conditions/i)).not.toBeInTheDocument();
    });
  });

  it('should display error with proper styling when terms are not accepted', async () => {
    const { container } = render(<RegisterForm />);

    // Fill in valid data
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });

    // Submit without accepting terms
    const submitButton = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(submitButton);

    // Check error message styling
    await waitFor(() => {
      const errorMessage = screen.getByText(/must accept the Terms and Conditions/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });
  });

  it('should maintain terms checkbox state during form interaction', async () => {
    render(<RegisterForm />);

    const checkbox = screen.getByRole('checkbox');

    // Initially unchecked
    expect(checkbox).not.toBeChecked();

    // Check the box
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Fill in other fields
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Checkbox should still be checked
    expect(checkbox).toBeChecked();

    // Uncheck the box
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should include terms link that opens in new tab', () => {
    render(<RegisterForm />);

    const link = screen.getByRole('link', { name: /Terms and Conditions/i });
    expect(link).toHaveAttribute('href', '/terms');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should validate all fields including terms before submission', async () => {
    render(<RegisterForm />);

    // Submit empty form
    const submitButton = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(submitButton);

    // Should show multiple errors including terms
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/must accept the Terms and Conditions/i)).toBeInTheDocument();
    });

    // API should NOT be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
