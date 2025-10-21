/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';

// Mock the child components
jest.mock('@/components/molecules/PrivacyPageClient', () => {
  return function MockPrivacyPageClient({ children }) {
    return <div data-testid="privacy-page-client">{children}</div>;
  };
});

jest.mock('@/components/organisms/PrivacyContent', () => {
  return function MockPrivacyContent() {
    return <div data-testid="privacy-content">Privacy content</div>;
  };
});

describe('Privacy Policy Page', () => {
  let PrivacyPolicyPage;
  let metadata;

  beforeAll(async () => {
    // Import the page module
    const pageModule = await import('@/app/privacy/page');
    PrivacyPolicyPage = pageModule.default;
    metadata = pageModule.metadata;
  });

  describe('Metadata', () => {
    it('should have correct title including "Privacy Policy"', () => {
      expect(metadata.title).toContain('Privacy Policy');
      expect(metadata.title).toBe('Privacy Policy | Fasting Tracker');
    });

    it('should have description present', () => {
      expect(metadata.description).toBeDefined();
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.description).toContain('privacy');
    });

    it('should have robots set to "index, follow"', () => {
      expect(metadata.robots).toBe('index, follow');
    });

    it('should have OpenGraph metadata', () => {
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph.title).toContain('Privacy Policy');
      expect(metadata.openGraph.description).toBeDefined();
      expect(metadata.openGraph.type).toBe('website');
    });
  });

  describe('Page Structure', () => {
    it('should render h1 heading with "Privacy Policy"', () => {
      render(<PrivacyPolicyPage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Privacy Policy');
    });

    it('should render page description', () => {
      render(<PrivacyPolicyPage />);
      
      expect(screen.getByText(/Your privacy is important to us/i)).toBeInTheDocument();
    });

    it('should render PrivacyPageClient wrapper', () => {
      render(<PrivacyPolicyPage />);
      
      expect(screen.getByTestId('privacy-page-client')).toBeInTheDocument();
    });

    it('should render PrivacyContent component', () => {
      render(<PrivacyPolicyPage />);
      
      expect(screen.getByTestId('privacy-content')).toBeInTheDocument();
    });

    it('should have contact email in footer', () => {
      render(<PrivacyPolicyPage />);
      
      expect(screen.getByText(/privacy@fastingtracker\.app/i)).toBeInTheDocument();
    });

    it('should have proper page container structure', () => {
      const { container } = render(<PrivacyPolicyPage />);
      
      // Check for main container with proper styling
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toBeInTheDocument();
      
      // Check for content wrapper with max-width
      const contentWrapper = container.querySelector('.max-w-4xl');
      expect(contentWrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<PrivacyPolicyPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<PrivacyPolicyPage />);
      
      const header = container.querySelector('header');
      const footer = container.querySelector('footer');
      
      expect(header).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });
  });
});
