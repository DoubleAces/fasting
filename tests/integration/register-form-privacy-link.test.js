/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import RegisterForm from '@/components/organisms/RegisterForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('RegisterForm - Privacy Policy Link Integration', () => {
  it('should display Privacy Policy link', () => {
    render(<RegisterForm />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toBeInTheDocument();
  });

  it('should have correct href="/privacy" for Privacy Policy link', () => {
    render(<RegisterForm />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('should have target="_blank" for Privacy Policy link', () => {
    render(<RegisterForm />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  it('should have rel="noopener noreferrer" for Privacy Policy link', () => {
    render(<RegisterForm />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display combined terms and privacy message', () => {
    render(<RegisterForm />);
    
    // Check that both terms and privacy are mentioned together
    expect(screen.getByText(/Terms and Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    
    // The text should indicate agreement to both
    const agreementText = screen.getByText(/I have read and agree to the/i);
    expect(agreementText).toBeInTheDocument();
  });

  it('should have both links opening in new tabs', () => {
    render(<RegisterForm />);
    
    const termsLink = screen.getByRole('link', { name: /Terms and Conditions/i });
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    
    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });
});
