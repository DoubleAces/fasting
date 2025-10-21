/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import PrivacyPageClient from '@/components/molecules/PrivacyPageClient';

describe('PrivacyPageClient', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
    
    // Mock getElementById
    document.getElementById = jest.fn();
    
    // Reset window.location.hash
    delete window.location;
    window.location = { hash: '' };
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Scroll to hash on mount', () => {
    it('should scroll to section when hash is present in URL', () => {
      const mockElement = { scrollIntoView: jest.fn() };
      document.getElementById = jest.fn(() => mockElement);
      window.location.hash = '#information-we-collect';
      
      render(
        <PrivacyPageClient>
          <div id="information-we-collect">Section content</div>
        </PrivacyPageClient>
      );
      
      // Fast-forward timer
      jest.advanceTimersByTime(100);
      
      expect(document.getElementById).toHaveBeenCalledWith('information-we-collect');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should handle hash with # character correctly', () => {
      const mockElement = { scrollIntoView: jest.fn() };
      document.getElementById = jest.fn(() => mockElement);
      window.location.hash = '#cookies-and-tracking';
      
      render(
        <PrivacyPageClient>
          <div id="cookies-and-tracking">Cookie section</div>
        </PrivacyPageClient>
      );
      
      jest.advanceTimersByTime(100);
      
      // Should remove the # before calling getElementById
      expect(document.getElementById).toHaveBeenCalledWith('cookies-and-tracking');
    });

    it('should delay scroll by 100ms to ensure content is rendered', () => {
      const mockElement = { scrollIntoView: jest.fn() };
      document.getElementById = jest.fn(() => mockElement);
      window.location.hash = '#test-section';
      
      render(
        <PrivacyPageClient>
          <div id="test-section">Content</div>
        </PrivacyPageClient>
      );
      
      // Should not have scrolled yet
      expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
      
      // Fast-forward by 100ms
      jest.advanceTimersByTime(100);
      
      // Now it should have scrolled
      expect(mockElement.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('Handle missing hash gracefully', () => {
    it('should not error when no hash is present', () => {
      window.location.hash = '';
      
      expect(() => {
        render(
          <PrivacyPageClient>
            <div>Content without hash</div>
          </PrivacyPageClient>
        );
        jest.advanceTimersByTime(100);
      }).not.toThrow();
    });

    it('should not call getElementById when hash is empty', () => {
      window.location.hash = '';
      document.getElementById = jest.fn();
      
      render(
        <PrivacyPageClient>
          <div>Content</div>
        </PrivacyPageClient>
      );
      
      jest.advanceTimersByTime(100);
      
      expect(document.getElementById).not.toHaveBeenCalled();
    });

    it('should not error when element with hash id does not exist', () => {
      document.getElementById = jest.fn(() => null);
      window.location.hash = '#non-existent-section';
      
      expect(() => {
        render(
          <PrivacyPageClient>
            <div>Content</div>
          </PrivacyPageClient>
        );
        jest.advanceTimersByTime(100);
      }).not.toThrow();
    });
  });

  describe('Children rendering', () => {
    it('should render children content', () => {
      const { container } = render(
        <PrivacyPageClient>
          <div data-testid="test-child">Test child content</div>
        </PrivacyPageClient>
      );
      
      expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      const { container } = render(
        <PrivacyPageClient>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </PrivacyPageClient>
      );
      
      expect(container.querySelector('[data-testid="child-1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="child-2"]')).toBeInTheDocument();
    });
  });

  describe('Effect cleanup', () => {
    it('should only run effect once on mount', () => {
      const mockElement = { scrollIntoView: jest.fn() };
      document.getElementById = jest.fn(() => mockElement);
      window.location.hash = '#test-section';
      
      const { rerender } = render(
        <PrivacyPageClient>
          <div>Content</div>
        </PrivacyPageClient>
      );
      
      jest.advanceTimersByTime(100);
      expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(1);
      
      // Rerender should not trigger scroll again
      rerender(
        <PrivacyPageClient>
          <div>Updated content</div>
        </PrivacyPageClient>
      );
      
      jest.advanceTimersByTime(100);
      expect(mockElement.scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });
});
