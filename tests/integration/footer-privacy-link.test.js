/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe('Footer Privacy Link Integration', () => {
  let Footer;

  beforeAll(async () => {
    // Dynamically import Footer component
    const FooterModule = await import('../../src/components/organisms/Footer');
    Footer = FooterModule.default;
  });

  describe('Privacy Policy Link Presence', () => {
    it('should render Privacy Policy link in footer', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toBeInTheDocument();
    });

    it('should have correct href="/privacy"', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should be grouped with Terms link', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      
      // Both links should be present
      expect(privacyLink).toBeInTheDocument();
      expect(termsLink).toBeInTheDocument();
      
      // Both should have similar styling (same parent or same classes)
      expect(privacyLink.className).toEqual(termsLink.className);
    });
  });

  describe('Link Styling', () => {
    it('should have consistent styling with other footer links', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      
      // Both should have identical class names for consistent styling
      expect(privacyLink.className).toBe(termsLink.className);
    });

    it('should be accessible with proper link text', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      
      // Link should have descriptive text, not just "Privacy"
      expect(privacyLink.textContent).toMatch(/privacy policy/i);
    });
  });

  describe('Legal Section Grouping', () => {
    it('should be in a legal section with Terms link', () => {
      render(<Footer />);
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      
      // Get parent containers
      const privacyParent = privacyLink.closest('nav') || privacyLink.parentElement;
      const termsParent = termsLink.closest('nav') || termsLink.parentElement;
      
      // Both should share the same parent container (legal section)
      expect(privacyParent).toBe(termsParent);
    });
  });
});
