/**
 * Tests: Home Page (Public Marketing Page)
 * 
 * Test coverage:
 * - Component rendering
 * - Hero section presence
 * - FeaturesList section presence
 * - Page structure
 */

import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Home from '@/app/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
  });

  describe('Page Rendering', () => {
    test('should render without crashing', () => {
      const { container } = render(<Home />);
      expect(container).toBeInTheDocument();
    });

    test('should render Hero component', () => {
      render(<Home />);
      
      // Hero has h1 with specific text
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/fasting journey/i);
    });

    test('should render FeaturesList component', () => {
      render(<Home />);
      
      // FeaturesList has h2 with specific text
      const heading = screen.getByRole('heading', { level: 2, name: /everything you need to succeed/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    test('should render hero headline', () => {
      render(<Home />);
      
      const headline = screen.getByText(/take control of your/i);
      expect(headline).toBeInTheDocument();
    });

    test('should render Get Started CTA', () => {
      render(<Home />);
      
      const cta = screen.getByRole('link', { name: /get started free/i });
      expect(cta).toBeInTheDocument();
      expect(cta).toHaveAttribute('href', '/signup');
    });

    test('should render Learn More CTA', () => {
      render(<Home />);
      
      const cta = screen.getByRole('link', { name: /learn more/i });
      expect(cta).toBeInTheDocument();
      expect(cta).toHaveAttribute('href', '/features');
    });
  });

  describe('Features Section', () => {
    test('should render features heading', () => {
      render(<Home />);
      
      const heading = screen.getByRole('heading', { name: /everything you need to succeed/i });
      expect(heading).toBeInTheDocument();
    });

    test('should render all feature cards', () => {
      render(<Home />);
      
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(6);
    });

    test('should render Timer Tracking feature', () => {
      render(<Home />);
      
      const feature = screen.getByRole('heading', { level: 3, name: 'Timer Tracking' });
      expect(feature).toBeInTheDocument();
    });

    test('should render Progress History feature', () => {
      render(<Home />);
      
      const feature = screen.getByRole('heading', { level: 3, name: 'Progress History' });
      expect(feature).toBeInTheDocument();
    });

    test('should render Custom Goals feature', () => {
      render(<Home />);
      
      const feature = screen.getByRole('heading', { level: 3, name: 'Custom Goals' });
      expect(feature).toBeInTheDocument();
    });
  });

  describe('Page Structure', () => {
    test('should have proper heading hierarchy', () => {
      render(<Home />);
      
      const h1 = screen.getAllByRole('heading', { level: 1 });
      const h2 = screen.getAllByRole('heading', { level: 2 });
      const h3 = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1).toHaveLength(1); // Hero headline
      expect(h2).toHaveLength(1); // Features heading
      expect(h3).toHaveLength(6); // Feature titles
    });

    test('should render sections in correct order', () => {
      const { container } = render(<Home />);
      
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(2); // Hero and Features
    });

    test('should have two main call-to-action buttons', () => {
      render(<Home />);
      
      const links = screen.getAllByRole('link');
      const ctaLinks = links.filter(link => 
        link.textContent === 'Get Started Free' || link.textContent === 'Learn More'
      );
      
      expect(ctaLinks).toHaveLength(2);
    });
  });

  describe('SEO and Accessibility', () => {
    test('should have accessible h1 heading', () => {
      render(<Home />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveAccessibleName(/take control of your fasting journey/i);
    });

    test('should have regions with proper labels', () => {
      render(<Home />);
      
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThanOrEqual(2);
    });

    test('should have accessible navigation links', () => {
      render(<Home />);
      
      const getStarted = screen.getByRole('link', { name: /get started free/i });
      const learnMore = screen.getByRole('link', { name: /learn more/i });
      
      expect(getStarted).toHaveAccessibleName('Get Started Free');
      expect(learnMore).toHaveAccessibleName('Learn More');
    });
  });

  describe('Content', () => {
    test('should display value proposition in hero', () => {
      render(<Home />);
      
      const content = screen.getByText(/track your fasting windows/i);
      expect(content).toBeInTheDocument();
    });

    test('should display features subheading', () => {
      render(<Home />);
      
      const subheading = screen.getByText(/powerful features designed to help you/i);
      expect(subheading).toBeInTheDocument();
    });

    test('should have feature descriptions', () => {
      render(<Home />);
      
      const timerDescription = screen.getByText(/start and stop your fasting timer/i);
      const historyDescription = screen.getByText(/view your complete fasting history/i);
      
      expect(timerDescription).toBeInTheDocument();
      expect(historyDescription).toBeInTheDocument();
    });
  });
});
