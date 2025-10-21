/**
 * TermsContent Organism Component Tests
 * 
 * Tests for full terms and conditions content with all sections
 * Following TDD approach: Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsContent from '../../../src/components/organisms/TermsContent';

describe('TermsContent Component', () => {
  it('should render all 10 required sections', () => {
    render(<TermsContent />);

    // Verify all 10 section headings are present
    expect(screen.getByRole('heading', { name: /introduction/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /account terms/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /user responsibilities/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /health disclaimer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /privacy notice/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /service usage/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /termination/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /liability limitations/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /dispute resolution/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contact information/i })).toBeInTheDocument();
  });

  it('should display effective date prominently', () => {
    render(<TermsContent />);

    // Check for effective date display
    expect(screen.getByText(/effective date/i)).toBeInTheDocument();
    
    // Should show a date (format: Month DD, YYYY)
    const datePattern = /\w+ \d{1,2}, \d{4}/;
    const dateElements = screen.getAllByText(datePattern);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should have correct section IDs for anchor links', () => {
    const { container } = render(<TermsContent />);

    // Verify section IDs match expected format (kebab-case)
    const expectedIds = [
      'introduction',
      'account-terms',
      'user-responsibilities',
      'health-disclaimer',
      'privacy-notice',
      'service-usage',
      'termination',
      'liability-limitations',
      'dispute-resolution',
      'contact-information',
    ];

    expectedIds.forEach((id) => {
      const heading = container.querySelector(`#${id}`);
      expect(heading).toBeInTheDocument();
    });
  });

  it('should highlight health disclaimer section', () => {
    const { container } = render(<TermsContent />);

    // Find the health disclaimer section
    const healthHeading = screen.getByRole('heading', { name: /health disclaimer/i });
    const healthSection = healthHeading.closest('section');

    // Should have highlight styling
    expect(healthSection).toHaveClass('bg-yellow-50');
    expect(healthSection).toHaveClass('dark:bg-yellow-900/20');
    expect(healthSection).toHaveClass('border-l-4');
    expect(healthSection).toHaveClass('border-yellow-500');
  });

  it('should include health-specific disclaimers for fasting', () => {
    render(<TermsContent />);

    // Check for general medical disclaimer
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    expect(screen.getAllByText(/healthcare provider/i).length).toBeGreaterThan(0);

    // Check for fasting-specific warnings
    expect(screen.getByText(/pregnant/i)).toBeInTheDocument();
    expect(screen.getByText(/diabetes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/medical conditions/i).length).toBeGreaterThan(0);
  });

  it('should include support email in contact information section', () => {
    render(<TermsContent />);

    // Should display the support email
    expect(screen.getByText(/support@fastingtracker\.app/i)).toBeInTheDocument();
  });

  it('should render sections in correct order', () => {
    const { container } = render(<TermsContent />);

    const headings = container.querySelectorAll('h2');
    const headingTexts = Array.from(headings).map(h => h.textContent);

    const expectedOrder = [
      'Introduction',
      'Account Terms',
      'User Responsibilities',
      'Health Disclaimer',
      'Privacy Notice',
      'Service Usage',
      'Termination',
      'Liability Limitations',
      'Dispute Resolution',
      'Contact Information',
    ];

    expect(headingTexts).toEqual(expectedOrder);
  });

  it('should be wrapped in a container with proper styling', () => {
    const { container } = render(<TermsContent />);

    const mainContainer = container.firstChild;
    
    // Should have max-width for readability
    expect(mainContainer).toHaveClass('max-w-4xl');
    expect(mainContainer).toHaveClass('mx-auto');
    expect(mainContainer).toHaveClass('px-4');
  });

  it('should include last updated date', () => {
    render(<TermsContent />);

    expect(screen.getAllByText(/last updated/i).length).toBeGreaterThan(0);
  });

  it('should use semantic HTML structure', () => {
    const { container } = render(<TermsContent />);

    // Should have proper article structure
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();

    // All sections should be inside article
    const sections = article.querySelectorAll('section');
    expect(sections.length).toBe(10);
  });

  it('should be mobile responsive', () => {
    const { container } = render(<TermsContent />);

    const mainContainer = container.firstChild;
    
    // Should have responsive padding
    expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });
});
