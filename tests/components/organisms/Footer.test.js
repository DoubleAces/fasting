/**
 * Tests: Footer Component
 * 
 * Test coverage:
 * - Component rendering and structure
 * - Brand section (logo and tagline)
 * - Navigation links (Product and Legal)
 * - Copyright with dynamic year
 * - Accessibility
 * - CSS classes
 */

import { render, screen, within } from '@testing-library/react';
import Footer from '@/components/organisms/Footer';

describe('Footer Component', () => {
  describe('Rendering and Structure', () => {
    test('should render footer element', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    test('should have footer class', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('.footer');
      expect(footer).toBeInTheDocument();
    });

    test('should have container class', () => {
      const { container } = render(<Footer />);
      
      const container_div = container.querySelector('.container');
      expect(container_div).toBeInTheDocument();
    });
  });

  describe('Brand Section', () => {
    test('should render logo', () => {
      render(<Footer />);
      
      const logo = screen.getByRole('link', { name: /fasting tracker/i });
      expect(logo).toBeInTheDocument();
    });

    test('should render tagline', () => {
      render(<Footer />);
      
      const tagline = screen.getByText(/track your fasting journey/i);
      expect(tagline).toBeInTheDocument();
    });

    test('should have brandSection class', () => {
      const { container } = render(<Footer />);
      
      const brandSection = container.querySelector('.brandSection');
      expect(brandSection).toBeInTheDocument();
    });

    test('should have tagline class', () => {
      const { container } = render(<Footer />);
      
      const tagline = container.querySelector('.tagline');
      expect(tagline).toBeInTheDocument();
    });
  });

  describe('Product Links', () => {
    test('should render Product heading', () => {
      render(<Footer />);
      
      const heading = screen.getByRole('heading', { name: 'Product' });
      expect(heading).toBeInTheDocument();
    });

    test('should have Product navigation section', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Product links' });
      expect(nav).toBeInTheDocument();
    });

    test('should render Features link', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Product links' });
      const featuresLink = within(nav).getByRole('link', { name: 'Features' });
      
      expect(featuresLink).toBeInTheDocument();
      expect(featuresLink).toHaveAttribute('href', '/features');
    });

    test('should render FAQ link', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Product links' });
      const faqLink = within(nav).getByRole('link', { name: 'FAQ' });
      
      expect(faqLink).toBeInTheDocument();
      expect(faqLink).toHaveAttribute('href', '/faq');
    });
  });

  describe('Legal Links', () => {
    test('should render Legal heading', () => {
      render(<Footer />);
      
      const heading = screen.getByRole('heading', { name: 'Legal' });
      expect(heading).toBeInTheDocument();
    });

    test('should have Legal navigation section', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Legal links' });
      expect(nav).toBeInTheDocument();
    });

    test('should render Privacy Policy link', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Legal links' });
      const privacyLink = within(nav).getByRole('link', { name: 'Privacy Policy' });
      
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    test('should render Terms of Service link', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Legal links' });
      const termsLink = within(nav).getByRole('link', { name: 'Terms of Service' });
      
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');
    });
  });

  describe('Copyright Section', () => {
    test('should render copyright text', () => {
      render(<Footer />);
      
      const copyright = screen.getByText(/fasting tracker. all rights reserved/i);
      expect(copyright).toBeInTheDocument();
    });

    test('should include current year in copyright', () => {
      render(<Footer />);
      
      const currentYear = new Date().getFullYear();
      const copyright = screen.getByText(new RegExp(`© ${currentYear}`));
      
      expect(copyright).toBeInTheDocument();
    });

    test('should have copyrightSection class', () => {
      const { container } = render(<Footer />);
      
      const copyrightSection = container.querySelector('.copyrightSection');
      expect(copyrightSection).toBeInTheDocument();
    });

    test('should have copyright class', () => {
      const { container } = render(<Footer />);
      
      const copyright = container.querySelector('.copyright');
      expect(copyright).toBeInTheDocument();
    });
  });

  describe('Link Sections Structure', () => {
    test('should have linksSection class', () => {
      const { container } = render(<Footer />);
      
      const linksSection = container.querySelector('.linksSection');
      expect(linksSection).toBeInTheDocument();
    });

    test('should have linkColumn classes', () => {
      const { container } = render(<Footer />);
      
      const linkColumns = container.querySelectorAll('.linkColumn');
      expect(linkColumns).toHaveLength(2); // Product and Legal
    });

    test('should have linkHeading classes', () => {
      const { container } = render(<Footer />);
      
      const linkHeadings = container.querySelectorAll('.linkHeading');
      expect(linkHeadings).toHaveLength(2); // Product and Legal
    });

    test('should have linkList classes', () => {
      const { container } = render(<Footer />);
      
      const linkLists = container.querySelectorAll('.linkList');
      expect(linkLists).toHaveLength(2); // Product and Legal
    });
  });

  describe('Accessibility', () => {
    test('should have contentinfo role', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    test('should have aria-label on Product navigation', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Product links' });
      expect(nav).toHaveAttribute('aria-label', 'Product links');
    });

    test('should have aria-label on Legal navigation', () => {
      render(<Footer />);
      
      const nav = screen.getByRole('navigation', { name: 'Legal links' });
      expect(nav).toHaveAttribute('aria-label', 'Legal links');
    });

    test('should have accessible link text', () => {
      render(<Footer />);
      
      expect(screen.getByRole('link', { name: 'Features' })).toHaveAccessibleName('Features');
      expect(screen.getByRole('link', { name: 'FAQ' })).toHaveAccessibleName('FAQ');
      expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAccessibleName('Privacy Policy');
      expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAccessibleName('Terms of Service');
    });

    test('should have proper heading hierarchy', () => {
      render(<Footer />);
      
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2); // Product and Legal
    });
  });

  describe('Link Variants', () => {
    test('should use text variant for footer links', () => {
      const { container } = render(<Footer />);
      
      const footerLinks = container.querySelectorAll('.footerLink');
      expect(footerLinks.length).toBeGreaterThan(0);
    });

    test('should have footerLink class on all links', () => {
      const { container } = render(<Footer />);
      
      const footerLinks = container.querySelectorAll('.footerLink');
      expect(footerLinks).toHaveLength(4); // Features, FAQ, Privacy, Terms
    });
  });

  describe('Logo Configuration', () => {
    test('should render logo with link enabled', () => {
      render(<Footer />);
      
      const logoLink = screen.getByRole('link', { name: /fasting tracker/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    test('should use medium size logo', () => {
      const { container } = render(<Footer />);
      
      const logo = container.querySelector('.logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    test('should render all main sections', () => {
      const { container } = render(<Footer />);
      
      expect(container.querySelector('.brandSection')).toBeInTheDocument();
      expect(container.querySelector('.linksSection')).toBeInTheDocument();
      expect(container.querySelector('.copyrightSection')).toBeInTheDocument();
    });

    test('should render correct number of navigation links', () => {
      render(<Footer />);
      
      const allLinks = screen.getAllByRole('link');
      // Logo + Features + FAQ + Privacy + Terms = 5
      expect(allLinks).toHaveLength(5);
    });

    test('should organize links into columns', () => {
      render(<Footer />);
      
      const productNav = screen.getByRole('navigation', { name: 'Product links' });
      const legalNav = screen.getByRole('navigation', { name: 'Legal links' });
      
      expect(within(productNav).getAllByRole('link')).toHaveLength(2);
      expect(within(legalNav).getAllByRole('link')).toHaveLength(2);
    });
  });
});
