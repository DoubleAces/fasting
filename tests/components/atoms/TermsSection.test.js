/**
 * TermsSection Atom Component Tests
 * 
 * Tests for individual terms section with ID anchor
 * Following TDD approach: Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsSection from '../../../src/components/atoms/TermsSection';

describe('TermsSection Component', () => {
  const defaultProps = {
    id: 'test-section',
    title: 'Test Section Title',
    content: 'This is test content for the section.',
  };

  it('should render the section with heading and content', () => {
    render(<TermsSection {...defaultProps} />);

    // Check heading is rendered
    const heading = screen.getByRole('heading', { level: 2, name: /test section title/i });
    expect(heading).toBeInTheDocument();

    // Check content is rendered
    expect(screen.getByText(/this is test content/i)).toBeInTheDocument();
  });

  it('should have id attribute on heading for anchor links', () => {
    render(<TermsSection {...defaultProps} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', 'test-section');
  });

  it('should apply correct default styling classes', () => {
    const { container } = render(<TermsSection {...defaultProps} />);

    const section = container.firstChild;
    expect(section).toHaveClass('mb-8');

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4');
  });

  it('should render highlighted section with special styling', () => {
    render(<TermsSection {...defaultProps} highlighted={true} />);

    const { container } = render(<TermsSection {...defaultProps} highlighted={true} />);
    const section = container.firstChild;
    
    // Check for highlight styling (background, border, padding)
    expect(section).toHaveClass('bg-yellow-50');
    expect(section).toHaveClass('border-l-4');
    expect(section).toHaveClass('border-yellow-500');
  });

  it('should render non-highlighted section without highlight styling', () => {
    const { container } = render(<TermsSection {...defaultProps} highlighted={false} />);
    const section = container.firstChild;
    
    // Should not have highlight styling
    expect(section).not.toHaveClass('bg-yellow-50');
    expect(section).not.toHaveClass('border-yellow-500');
  });

  it('should support dark mode styling', () => {
    render(<TermsSection {...defaultProps} />);

    const content = screen.getByText(/this is test content/i);
    
    // Should have dark mode text color class
    expect(content).toHaveClass('text-gray-700', 'dark:text-gray-300');
  });

  it('should render with multiple paragraphs of content', () => {
    const multiParagraphContent = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
    
    render(<TermsSection {...defaultProps} content={multiParagraphContent} />);

    expect(screen.getByText(/first paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/second paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/third paragraph/i)).toBeInTheDocument();
  });

  it('should render with HTML content for rich text formatting', () => {
    const htmlContent = 'This has <strong>bold text</strong> and <em>italic text</em>.';
    
    render(<TermsSection {...defaultProps} content={htmlContent} />);

    // Should render HTML tags
    const strong = screen.getByText(/bold text/i);
    expect(strong.tagName).toBe('STRONG');

    const em = screen.getByText(/italic text/i);
    expect(em.tagName).toBe('EM');
  });

  it('should be accessible with semantic HTML', () => {
    const { container } = render(<TermsSection {...defaultProps} />);

    // Should use semantic section element
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Heading should be h2 for proper document outline
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('should render all 10 terms sections with unique IDs', () => {
    const sections = [
      { id: 'introduction', title: 'Introduction', content: 'Intro content' },
      { id: 'account-terms', title: 'Account Terms', content: 'Account content' },
      { id: 'user-responsibilities', title: 'User Responsibilities', content: 'Responsibilities content' },
      { id: 'health-disclaimer', title: 'Health Disclaimer', content: 'Health content', highlighted: true },
      { id: 'privacy-notice', title: 'Privacy Notice', content: 'Privacy content' },
      { id: 'service-usage', title: 'Service Usage', content: 'Usage content' },
      { id: 'termination', title: 'Termination', content: 'Termination content' },
      { id: 'liability-limitations', title: 'Liability Limitations', content: 'Liability content' },
      { id: 'dispute-resolution', title: 'Dispute Resolution', content: 'Dispute content' },
      { id: 'contact-information', title: 'Contact Information', content: 'Contact content' },
    ];

    const { rerender } = render(<TermsSection {...sections[0]} />);

    sections.forEach((section) => {
      rerender(<TermsSection {...section} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', section.id);
      expect(heading).toHaveTextContent(section.title);
    });
  });
});
