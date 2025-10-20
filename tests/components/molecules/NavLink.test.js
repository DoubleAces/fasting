/**
 * Tests: NavLink Component
 * 
 * Test coverage:
 * - Active state detection (exact and starts-with)
 * - Rendering and href
 * - Accessibility (aria-current)
 * - CSS classes
 * - usePathname integration
 */

import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import NavLink from '@/components/molecules/NavLink';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('NavLink Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    usePathname.mockReturnValue('/');
  });

  describe('Rendering', () => {
    test('should render link with children', () => {
      render(<NavLink href="/about">About</NavLink>);
      
      const link = screen.getByRole('link', { name: 'About' });
      expect(link).toBeInTheDocument();
    });

    test('should render with href attribute', () => {
      render(<NavLink href="/contact">Contact</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/contact');
    });

    test('should render with custom className', () => {
      render(<NavLink href="/test" className="custom-class">Link</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    test('should always have navLink class', () => {
      const { container } = render(<NavLink href="/test">Link</NavLink>);
      
      const link = container.querySelector('.navLink');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Active State Detection - Exact Match', () => {
    test('should be active when pathname exactly matches href', () => {
      usePathname.mockReturnValue('/about');
      const { container } = render(<NavLink href="/about">About</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should not be active when pathname does not match href', () => {
      usePathname.mockReturnValue('/contact');
      const { container } = render(<NavLink href="/about">About</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).not.toBeInTheDocument();
    });

    test('should be active for homepage', () => {
      usePathname.mockReturnValue('/');
      const { container } = render(<NavLink href="/">Home</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should not be active for partial match with exact=true', () => {
      usePathname.mockReturnValue('/about/team');
      const { container } = render(<NavLink href="/about" exact={true}>About</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).not.toBeInTheDocument();
    });

    test('should use exact match by default', () => {
      usePathname.mockReturnValue('/blog/post-1');
      const { container } = render(<NavLink href="/blog">Blog</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).not.toBeInTheDocument();
    });
  });

  describe('Active State Detection - Starts With', () => {
    test('should be active when pathname starts with href and exact=false', () => {
      usePathname.mockReturnValue('/blog/post-1');
      const { container } = render(<NavLink href="/blog" exact={false}>Blog</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should be active for exact match when exact=false', () => {
      usePathname.mockReturnValue('/blog');
      const { container } = render(<NavLink href="/blog" exact={false}>Blog</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should not be active when pathname does not start with href', () => {
      usePathname.mockReturnValue('/contact');
      const { container } = render(<NavLink href="/blog" exact={false}>Blog</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).not.toBeInTheDocument();
    });

    test('should work with nested routes', () => {
      usePathname.mockReturnValue('/dashboard/settings/profile');
      const { container } = render(
        <NavLink href="/dashboard" exact={false}>Dashboard</NavLink>
      );
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have aria-current="page" when active', () => {
      usePathname.mockReturnValue('/about');
      render(<NavLink href="/about">About</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    test('should not have aria-current when inactive', () => {
      usePathname.mockReturnValue('/');
      render(<NavLink href="/about">About</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
    });

    test('should be accessible by role', () => {
      render(<NavLink href="/test">Test Link</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    test('should have accessible name from children', () => {
      render(<NavLink href="/test">My Link</NavLink>);
      
      const link = screen.getByRole('link', { name: 'My Link' });
      expect(link).toHaveAccessibleName('My Link');
    });
  });

  describe('CSS Classes', () => {
    test('should combine navLink and active classes when active', () => {
      usePathname.mockReturnValue('/test');
      const { container } = render(<NavLink href="/test">Link</NavLink>);
      
      const link = container.querySelector('.navLink.active');
      expect(link).toBeInTheDocument();
    });

    test('should combine all classes including custom className', () => {
      usePathname.mockReturnValue('/test');
      const { container } = render(
        <NavLink href="/test" className="custom">Link</NavLink>
      );
      
      const link = container.querySelector('.navLink.active.custom');
      expect(link).toBeInTheDocument();
    });

    test('should only have navLink class when not active', () => {
      usePathname.mockReturnValue('/other');
      const { container } = render(<NavLink href="/test">Link</NavLink>);
      
      const link = container.querySelector('.navLink');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveClass('active');
    });

    test('should handle empty className gracefully', () => {
      const { container } = render(<NavLink href="/test" className="">Link</NavLink>);
      
      const link = container.querySelector('.navLink');
      expect(link).toBeInTheDocument();
    });
  });

  describe('usePathname Integration', () => {
    test('should call usePathname hook', () => {
      usePathname.mockReturnValue('/test');
      render(<NavLink href="/test">Link</NavLink>);
      
      expect(usePathname).toHaveBeenCalled();
    });

    test('should respond to different pathname values', () => {
      // First render - not active
      usePathname.mockReturnValue('/other');
      const { container, rerender } = render(<NavLink href="/test">Link</NavLink>);
      expect(container.querySelector('.active')).not.toBeInTheDocument();
      
      // Re-render with matching pathname - active
      usePathname.mockReturnValue('/test');
      rerender(<NavLink href="/test">Link</NavLink>);
      expect(container.querySelector('.active')).toBeInTheDocument();
    });

    test('should handle root path correctly', () => {
      usePathname.mockReturnValue('/');
      const { container } = render(<NavLink href="/">Home</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should handle paths with query strings', () => {
      usePathname.mockReturnValue('/search');
      render(<NavLink href="/search">Search</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Additional Props', () => {
    test('should pass through additional props to Link', () => {
      render(
        <NavLink href="/test" data-testid="nav-link">Link</NavLink>
      );
      
      const link = screen.getByTestId('nav-link');
      expect(link).toBeInTheDocument();
    });

    test('should support aria attributes', () => {
      render(
        <NavLink href="/test" aria-label="Custom Label">Link</NavLink>
      );
      
      const link = screen.getByLabelText('Custom Label');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle href with trailing slash', () => {
      usePathname.mockReturnValue('/about/');
      const { container } = render(<NavLink href="/about/">About</NavLink>);
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });

    test('should handle href without leading slash', () => {
      usePathname.mockReturnValue('/about');
      render(<NavLink href="/about">About</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/about');
    });

    test('should work with hash fragments', () => {
      usePathname.mockReturnValue('/about');
      render(<NavLink href="/about#section">Section</NavLink>);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/about#section');
    });

    test('should handle complex nested routes', () => {
      usePathname.mockReturnValue('/dashboard/users/123/edit');
      const { container } = render(
        <NavLink href="/dashboard/users" exact={false}>Users</NavLink>
      );
      
      const link = container.querySelector('.active');
      expect(link).toBeInTheDocument();
    });
  });
});
