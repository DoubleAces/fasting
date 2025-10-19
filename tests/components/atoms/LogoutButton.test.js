/**
 * LogoutButton Component Tests
 * 
 * Tests the logout button functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import LogoutButton from '@/components/atoms/LogoutButton';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the sign out button', () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toBeInTheDocument();
  });

  it('should display logout icon', () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should call signOut when clicked', async () => {
    signOut.mockResolvedValue(undefined);
    
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({
        callbackUrl: '/',
        redirect: true,
      });
    });
  });

  it('should handle logout errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    signOut.mockRejectedValue(new Error('Logout failed'));
    
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Logout error:',
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should accept custom className', () => {
    render(<LogoutButton className="custom-class" />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<LogoutButton />);
    
    const button = screen.getByRole('button', { name: /sign out/i });
    // Button should be accessible via role
    expect(button).toBeInTheDocument();
    // Should have accessible text
    expect(button).toHaveTextContent('Sign Out');
  });
});
