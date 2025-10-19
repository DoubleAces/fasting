/**
 * Tests: Navbar Component
 * 
 * Test coverage:
 * - Component rendering and structure
 * - Desktop navigation links
 * - Desktop auth buttons
 * - Mobile menu functionality
 * - Accessibility
 * - CSS classes
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/organisms/Navbar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
  });

  describe('Rendering and Structure', () => {
    test('should render navbar element', () => {
      render(<Navbar />);
      
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
    });

    test('should have aria-label for navigation', () => {
      render(<Navbar />);
      
      const navbar = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(navbar).toBeInTheDocument();
    });

    test('should render logo', () => {
      render(<Navbar />);
      
      const logo = screen.getByRole('link', { name: /fasting tracker/i });
      expect(logo).toBeInTheDocument();
    });

    test('should have navbar class', () => {
      const { container } = render(<Navbar />);
      
      const navbar = container.querySelector('.navbar');
      expect(navbar).toBeInTheDocument();
    });
  });

  describe('Desktop Navigation Links', () => {
    test('should render all navigation links', () => {
      render(<Navbar />);
      
      // Get all links (desktop and mobile combined)
      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      const featuresLinks = screen.getAllByRole('link', { name: 'Features' });
      const faqLinks = screen.getAllByRole('link', { name: 'FAQ' });
      
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
      expect(featuresLinks.length).toBeGreaterThanOrEqual(1);
      expect(faqLinks.length).toBeGreaterThanOrEqual(1);
    });

    test('should have correct href attributes', () => {
      render(<Navbar />);
      
      const homeLink = screen.getAllByRole('link', { name: 'Home' })[0];
      const featuresLink = screen.getAllByRole('link', { name: 'Features' })[0];
      const faqLink = screen.getAllByRole('link', { name: 'FAQ' })[0];
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(featuresLink).toHaveAttribute('href', '/features');
      expect(faqLink).toHaveAttribute('href', '/faq');
    });

    test('should use exact matching for nav links', () => {
      usePathname.mockReturnValue('/');
      render(<Navbar />);
      
      // Home should be active
      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      const homeLink = homeLinks.find(link => link.getAttribute('aria-current') === 'page');
      expect(homeLink).toBeDefined();
    });
  });

  describe('Desktop Auth Buttons', () => {
    test('should render Log In button', () => {
      render(<Navbar />);
      
      const loginButtons = screen.getAllByRole('link', { name: 'Log In' });
      expect(loginButtons.length).toBeGreaterThanOrEqual(1);
    });

    test('should render Sign Up button', () => {
      render(<Navbar />);
      
      const signupButtons = screen.getAllByRole('link', { name: 'Sign Up' });
      expect(signupButtons.length).toBeGreaterThanOrEqual(1);
    });

    test('should have correct hrefs for auth buttons', () => {
      render(<Navbar />);
      
      const loginButton = screen.getAllByRole('link', { name: 'Log In' })[0];
      const signupButton = screen.getAllByRole('link', { name: 'Sign Up' })[0];
      
      expect(loginButton).toHaveAttribute('href', '/login');
      expect(signupButton).toHaveAttribute('href', '/signup');
    });
  });

  describe('Mobile Menu Button', () => {
    test('should render mobile menu button', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toBeInTheDocument();
    });

    test('should toggle aria-label when clicked', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      
      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-label', 'Close menu');
      
      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-label', 'Open menu');
    });

    test('should toggle aria-expanded when clicked', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      
      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should have aria-controls attribute', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });
  });

  describe('Mobile Menu Functionality', () => {
    test('should not show mobile menu by default', () => {
      render(<Navbar />);
      
      const mobileMenu = screen.queryByRole('dialog');
      expect(mobileMenu).not.toBeInTheDocument();
    });

    test('should show mobile menu when button clicked', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      expect(mobileMenu).toBeInTheDocument();
    });

    test('should hide mobile menu when button clicked again', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      
      fireEvent.click(menuButton);
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      
      fireEvent.click(menuButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('should have id matching aria-controls', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      expect(mobileMenu).toHaveAttribute('id', 'mobile-menu');
    });

    test('should close mobile menu when navigation link clicked', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      expect(mobileMenu).toBeInTheDocument();
      
      // Click a navigation link inside mobile menu
      const navLinks = within(mobileMenu).getAllByRole('link');
      fireEvent.click(navLinks[0]);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu Content', () => {
    test('should render navigation links in mobile menu', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      
      expect(within(mobileMenu).getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(within(mobileMenu).getByRole('link', { name: 'Features' })).toBeInTheDocument();
      expect(within(mobileMenu).getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
    });

    test('should render auth buttons in mobile menu', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      
      expect(within(mobileMenu).getByRole('link', { name: 'Log In' })).toBeInTheDocument();
      expect(within(mobileMenu).getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });

  describe('Hamburger Icon Animation', () => {
    test('should have hamburger icon with three lines', () => {
      const { container } = render(<Navbar />);
      
      const lines = container.querySelectorAll('.hamburgerLine');
      expect(lines).toHaveLength(3);
    });

    test('should change hamburger lines to open state when menu opened', () => {
      const { container } = render(<Navbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      fireEvent.click(menuButton);
      
      const openLines = container.querySelectorAll('.hamburgerLineOpen');
      expect(openLines).toHaveLength(3);
    });

    test('should revert hamburger lines when menu closed', () => {
      const { container } = render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      
      fireEvent.click(menuButton);
      let openLines = container.querySelectorAll('.hamburgerLineOpen');
      expect(openLines).toHaveLength(3);
      
      fireEvent.click(menuButton);
      const closedLines = container.querySelectorAll('.hamburgerLine');
      expect(closedLines).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    test('should have proper navigation role', () => {
      render(<Navbar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('should have accessible mobile menu button', () => {
      render(<Navbar />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Open menu');
    });

    test('should update button accessible name when toggled', () => {
      render(<Navbar />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(button).toHaveAccessibleName('Close menu');
      
      fireEvent.click(button);
      expect(button).toHaveAccessibleName('Open menu');
    });

    test('should have aria-modal on mobile menu', () => {
      render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);
      
      const mobileMenu = screen.getByRole('dialog');
      expect(mobileMenu).toHaveAttribute('aria-modal', 'false');
    });
  });

  describe('CSS Classes', () => {
    test('should have container class', () => {
      const { container } = render(<Navbar />);
      
      const navContainer = container.querySelector('.container');
      expect(navContainer).toBeInTheDocument();
    });

    test('should have navLinks class', () => {
      const { container } = render(<Navbar />);
      
      const navLinks = container.querySelector('.navLinks');
      expect(navLinks).toBeInTheDocument();
    });

    test('should have authButtons class', () => {
      const { container } = render(<Navbar />);
      
      const authButtons = container.querySelector('.authButtons');
      expect(authButtons).toBeInTheDocument();
    });

    test('should have mobileMenu class when opened', () => {
      const { container } = render(<Navbar />);
      
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);
      
      const mobileMenu = container.querySelector('.mobileMenu');
      expect(mobileMenu).toBeInTheDocument();
    });
  });
});
