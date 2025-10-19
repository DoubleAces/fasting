/**
 * Tests: Logo Component
 * 
 * Test coverage:
 * - Rendering with different sizes
 * - Link functionality
 * - No-link variant
 * - Accessibility
 * - Custom className
 */

import { render, screen } from '@testing-library/react';
import Logo from '@/components/atoms/Logo';

describe('Logo Component', () => {
  describe('Rendering', () => {
    test('should render logo with default medium size', () => {
      render(<Logo />);
      
      const logo = screen.getByText('Fasting Tracker');
      expect(logo).toBeInTheDocument();
    });

    test('should render logo icon', () => {
      const { container } = render(<Logo />);
      
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🍽️');
    });

    test('should render with small size', () => {
      const { container } = render(<Logo size="small" />);
      
      const logo = container.querySelector('.small');
      expect(logo).toBeInTheDocument();
    });

    test('should render with medium size', () => {
      const { container } = render(<Logo size="medium" />);
      
      const logo = container.querySelector('.medium');
      expect(logo).toBeInTheDocument();
    });

    test('should render with large size', () => {
      const { container } = render(<Logo size="large" />);
      
      const logo = container.querySelector('.large');
      expect(logo).toBeInTheDocument();
    });

    test('should apply custom className', () => {
      const { container } = render(<Logo className="custom-class" />);
      
      const logo = container.querySelector('.custom-class');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Link Functionality', () => {
    test('should render as link by default', () => {
      render(<Logo />);
      
      const link = screen.getByLabelText('Fasting Tracker - Go to homepage');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    test('should have proper aria-label on link', () => {
      render(<Logo />);
      
      const link = screen.getByLabelText('Fasting Tracker - Go to homepage');
      expect(link).toHaveAccessibleName('Fasting Tracker - Go to homepage');
    });

    test('should render without link when noLink is true', () => {
      render(<Logo noLink />);
      
      const text = screen.getByText('Fasting Tracker');
      expect(text).toBeInTheDocument();
      
      const link = screen.queryByRole('link');
      expect(link).not.toBeInTheDocument();
    });

    test('should link to homepage', () => {
      render(<Logo />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    test('should hide icon from screen readers', () => {
      const { container } = render(<Logo />);
      
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('should have accessible text', () => {
      render(<Logo />);
      
      const text = screen.getByText('Fasting Tracker');
      expect(text).toBeVisible();
    });

    test('should have accessible link when rendered with link', () => {
      render(<Logo />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName('Fasting Tracker - Go to homepage');
    });

    test('should not have link role when noLink is true', () => {
      render(<Logo noLink />);
      
      const link = screen.queryByRole('link');
      expect(link).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('should default to medium size when size prop is omitted', () => {
      const { container } = render(<Logo />);
      
      const logo = container.querySelector('.medium');
      expect(logo).toBeInTheDocument();
    });

    test('should accept small size variant', () => {
      const { container } = render(<Logo size="small" />);
      
      const logo = container.querySelector('.small');
      expect(logo).toBeInTheDocument();
      expect(logo).not.toHaveClass('medium');
      expect(logo).not.toHaveClass('large');
    });

    test('should accept medium size variant', () => {
      const { container } = render(<Logo size="medium" />);
      
      const logo = container.querySelector('.medium');
      expect(logo).toBeInTheDocument();
      expect(logo).not.toHaveClass('small');
      expect(logo).not.toHaveClass('large');
    });

    test('should accept large size variant', () => {
      const { container } = render(<Logo size="large" />);
      
      const logo = container.querySelector('.large');
      expect(logo).toBeInTheDocument();
      expect(logo).not.toHaveClass('small');
      expect(logo).not.toHaveClass('medium');
    });
  });

  describe('CSS Classes', () => {
    test('should always have logo class', () => {
      const { container } = render(<Logo />);
      
      const logo = container.querySelector('.logo');
      expect(logo).toBeInTheDocument();
    });

    test('should combine size class with logo class', () => {
      const { container } = render(<Logo size="large" />);
      
      const logo = container.querySelector('.logo.large');
      expect(logo).toBeInTheDocument();
    });

    test('should combine custom className with existing classes', () => {
      const { container } = render(<Logo className="custom" size="small" />);
      
      const logo = container.querySelector('.logo.small.custom');
      expect(logo).toBeInTheDocument();
    });

    test('should handle empty className gracefully', () => {
      const { container } = render(<Logo className="" />);
      
      const logo = container.querySelector('.logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    test('should display "Fasting Tracker" text', () => {
      render(<Logo />);
      
      expect(screen.getByText('Fasting Tracker')).toBeInTheDocument();
    });

    test('should display icon and text together', () => {
      const { container } = render(<Logo />);
      
      const icon = container.querySelector('[aria-hidden="true"]');
      const text = screen.getByText('Fasting Tracker');
      
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });
  });
});
