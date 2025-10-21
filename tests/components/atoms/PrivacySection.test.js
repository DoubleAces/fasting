/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PrivacySection from '@/components/atoms/PrivacySection';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('PrivacySection', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock window.history.pushState
    global.window.history.pushState = jest.fn();
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    
    // Mock getElementById
    document.getElementById = jest.fn((id) => ({
      scrollIntoView: jest.fn(),
    }));
  });

  describe('Rendering', () => {
    it('should render section with correct id', () => {
      const { container } = render(
        <PrivacySection id="test-section" title="Test Section">
          Test content
        </PrivacySection>
      );
      
      const heading = container.querySelector('#test-section');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('should display heading text correctly', () => {
      render(
        <PrivacySection id="test-section" title="Privacy Section Title">
          Content
        </PrivacySection>
      );
      
      expect(screen.getByText('Privacy Section Title')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          <p>This is test content</p>
        </PrivacySection>
      );
      
      expect(screen.getByText('This is test content')).toBeInTheDocument();
    });

    it('should render string content', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          String content here
        </PrivacySection>
      );
      
      expect(screen.getByText('String content here')).toBeInTheDocument();
    });
  });

  describe('Click interaction', () => {
    it('should update URL hash when heading is clicked', () => {
      render(
        <PrivacySection id="information-we-collect" title="Information We Collect">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Information We Collect');
      fireEvent.click(heading);
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        '#information-we-collect'
      );
    });

    it('should scroll to section when heading is clicked', () => {
      const mockElement = { scrollIntoView: jest.fn() };
      document.getElementById = jest.fn(() => mockElement);
      
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      fireEvent.click(heading);
      
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });

  describe('Keyboard navigation', () => {
    it('should have tabIndex={0} for keyboard accessibility', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      expect(heading).toHaveAttribute('tabIndex', '0');
    });

    it('should trigger navigation when Enter key is pressed', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      fireEvent.keyDown(heading, { key: 'Enter', code: 'Enter' });
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        '#test-section'
      );
    });

    it('should trigger navigation when Space key is pressed', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      fireEvent.keyDown(heading, { key: ' ', code: 'Space' });
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        '#test-section'
      );
    });

    it('should not trigger navigation for other keys', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      fireEvent.keyDown(heading, { key: 'Tab', code: 'Tab' });
      
      expect(window.history.pushState).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility attributes', () => {
    it('should have proper aria-label', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      expect(heading).toHaveAttribute(
        'aria-label',
        'Test Section - Click to link to this section'
      );
    });

    it('should have cursor pointer style', () => {
      render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = screen.getByText('Test Section');
      expect(heading).toHaveStyle({ cursor: 'pointer' });
    });
  });

  describe('Heading levels', () => {
    it('should default to h2 heading', () => {
      const { container } = render(
        <PrivacySection id="test-section" title="Test Section">
          Content
        </PrivacySection>
      );
      
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Section');
    });

    it('should support h3 heading when level={3}', () => {
      const { container } = render(
        <PrivacySection id="test-section" title="Test Section" level={3}>
          Content
        </PrivacySection>
      );
      
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Section');
    });
  });
});
