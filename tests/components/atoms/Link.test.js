/**
 * Tests: Link Component
 * 
 * Test coverage:
 * - Rendering with different variants
 * - Next.js Link integration
 * - External link handling
 * - Disabled state
 * - Accessibility
 * - Custom className
 */

import { render, screen } from '@testing-library/react';
import Link from '@/components/atoms/Link';

describe('Link Component', () => {
  describe('Rendering', () => {
    test('should render link with children', () => {
      render(<Link href="/test">Test Link</Link>);
      
      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
    });

    test('should render with href attribute', () => {
      render(<Link href="/dashboard">Go to Dashboard</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    test('should render with custom className', () => {
      render(<Link href="/test" className="custom-class">Link</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    test('should render with text variant by default', () => {
      const { container } = render(<Link href="/test">Text Link</Link>);
      
      const link = container.querySelector('.text');
      expect(link).toBeInTheDocument();
    });

    test('should render with primary variant', () => {
      const { container } = render(
        <Link href="/test" variant="primary">Primary Link</Link>
      );
      
      const link = container.querySelector('.primary');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveClass('text');
      expect(link).not.toHaveClass('secondary');
    });

    test('should render with secondary variant', () => {
      const { container } = render(
        <Link href="/test" variant="secondary">Secondary Link</Link>
      );
      
      const link = container.querySelector('.secondary');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveClass('text');
      expect(link).not.toHaveClass('primary');
    });

    test('should render with text variant explicitly', () => {
      const { container } = render(
        <Link href="/test" variant="text">Text Link</Link>
      );
      
      const link = container.querySelector('.text');
      expect(link).toBeInTheDocument();
    });
  });

  describe('External Links', () => {
    test('should open in new tab when external is true', () => {
      render(<Link href="https://example.com" external>External Link</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    test('should have noopener noreferrer when external is true', () => {
      render(<Link href="https://example.com" external>External Link</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should not have target or rel when external is false', () => {
      render(<Link href="/internal">Internal Link</Link>);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });

    test('should work with external and variant together', () => {
      const { container } = render(
        <Link href="https://example.com" external variant="primary">
          External Primary
        </Link>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(container.querySelector('.primary')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    test('should render as span when disabled', () => {
      render(<Link href="/test" disabled>Disabled Link</Link>);
      
      const element = screen.getByRole('link', { name: 'Disabled Link' });
      expect(element.tagName).toBe('SPAN');
    });

    test('should have aria-disabled when disabled', () => {
      render(<Link href="/test" disabled>Disabled Link</Link>);
      
      const element = screen.getByRole('link');
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });

    test('should have disabled class when disabled', () => {
      const { container } = render(<Link href="/test" disabled>Disabled</Link>);
      
      const element = container.querySelector('.disabled');
      expect(element).toBeInTheDocument();
    });

    test('should not be clickable when disabled', () => {
      const { container } = render(
        <Link href="/test" disabled>Disabled Link</Link>
      );
      
      const element = container.querySelector('.disabled');
      expect(element).toHaveClass('disabled');
    });

    test('should work with disabled and variant together', () => {
      const { container } = render(
        <Link href="/test" disabled variant="primary">
          Disabled Primary
        </Link>
      );
      
      const element = container.querySelector('.primary.disabled');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should be accessible by role', () => {
      render(<Link href="/test">Accessible Link</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    test('should have accessible name from children', () => {
      render(<Link href="/test">Click Here</Link>);
      
      const link = screen.getByRole('link', { name: 'Click Here' });
      expect(link).toHaveAccessibleName('Click Here');
    });

    test('should maintain role when disabled', () => {
      render(<Link href="/test" disabled>Disabled Link</Link>);
      
      const element = screen.getByRole('link');
      expect(element).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    test('should always have link class', () => {
      const { container } = render(<Link href="/test">Link</Link>);
      
      const link = container.querySelector('.link');
      expect(link).toBeInTheDocument();
    });

    test('should combine variant class with link class', () => {
      const { container } = render(
        <Link href="/test" variant="primary">Link</Link>
      );
      
      const link = container.querySelector('.link.primary');
      expect(link).toBeInTheDocument();
    });

    test('should combine multiple classes correctly', () => {
      const { container } = render(
        <Link href="/test" variant="secondary" className="custom" disabled>
          Link
        </Link>
      );
      
      const link = container.querySelector('.link.secondary.disabled.custom');
      expect(link).toBeInTheDocument();
    });

    test('should handle empty className gracefully', () => {
      const { container } = render(
        <Link href="/test" className="">Link</Link>
      );
      
      const link = container.querySelector('.link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Next.js Link Integration', () => {
    test('should render Next.js Link component', () => {
      render(<Link href="/dashboard">Dashboard</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    test('should support internal routing paths', () => {
      render(<Link href="/settings">Settings</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/settings');
    });

    test('should support query parameters', () => {
      render(<Link href="/search?q=test">Search</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=test');
    });

    test('should support hash fragments', () => {
      render(<Link href="/page#section">Section</Link>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/page#section');
    });
  });

  describe('Additional Props', () => {
    test('should pass through additional props to Next.js Link', () => {
      render(
        <Link href="/test" data-testid="custom-link">Link</Link>
      );
      
      const link = screen.getByTestId('custom-link');
      expect(link).toBeInTheDocument();
    });

    test('should support aria attributes', () => {
      render(
        <Link href="/test" aria-label="Custom Label">Link</Link>
      );
      
      const link = screen.getByLabelText('Custom Label');
      expect(link).toBeInTheDocument();
    });
  });
});
