/**
 * Tests: Hero Component
 * 
 * Test coverage:
 * - Component rendering and structure
 * - Headline and subheadline content
 * - CTA buttons (primary and secondary)
 * - Feature highlights
 * - Accessibility
 * - CSS classes
 */

import { render, screen } from '@testing-library/react';
import Hero from '@/components/organisms/Hero';

describe('Hero Component', () => {
  describe('Rendering and Structure', () => {
    test('should render section element', () => {
      render(<Hero />);
      
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    test('should have hero class', () => {
      const { container } = render(<Hero />);
      
      const hero = container.querySelector('.hero');
      expect(hero).toBeInTheDocument();
    });

    test('should have container class', () => {
      const { container } = render(<Hero />);
      
      const container_div = container.querySelector('.container');
      expect(container_div).toBeInTheDocument();
    });

    test('should have content class', () => {
      const { container } = render(<Hero />);
      
      const content = container.querySelector('.content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Headline', () => {
    test('should render main headline', () => {
      render(<Hero />);
      
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toBeInTheDocument();
    });

    test('should have correct headline text', () => {
      render(<Hero />);
      
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toHaveTextContent(/take control of your/i);
      expect(headline).toHaveTextContent(/fasting journey/i);
    });

    test('should have id for aria-labelledby', () => {
      render(<Hero />);
      
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toHaveAttribute('id', 'hero-heading');
    });

    test('should have headline class', () => {
      const { container } = render(<Hero />);
      
      const headline = container.querySelector('.headline');
      expect(headline).toBeInTheDocument();
    });

    test('should have emphasized text with special styling', () => {
      const { container } = render(<Hero />);
      
      const emphasis = container.querySelector('.headlineEmphasis');
      expect(emphasis).toBeInTheDocument();
      expect(emphasis).toHaveTextContent('Fasting Journey');
    });
  });

  describe('Subheadline', () => {
    test('should render subheadline text', () => {
      render(<Hero />);
      
      const subheadline = screen.getByText(/track your fasting windows/i);
      expect(subheadline).toBeInTheDocument();
    });

    test('should have complete subheadline content', () => {
      render(<Hero />);
      
      const subheadline = screen.getByText(/track your fasting windows/i);
      expect(subheadline).toHaveTextContent(/monitor your progress/i);
      expect(subheadline).toHaveTextContent(/achieve your health goals/i);
      expect(subheadline).toHaveTextContent(/start your transformation today/i);
    });

    test('should have subheadline class', () => {
      const { container } = render(<Hero />);
      
      const subheadline = container.querySelector('.subheadline');
      expect(subheadline).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    test('should render Get Started button', () => {
      render(<Hero />);
      
      const button = screen.getByRole('link', { name: /get started free/i });
      expect(button).toBeInTheDocument();
    });

    test('should render Learn More button', () => {
      render(<Hero />);
      
      const button = screen.getByRole('link', { name: /learn more/i });
      expect(button).toBeInTheDocument();
    });

    test('should have correct href for Get Started', () => {
      render(<Hero />);
      
      const button = screen.getByRole('link', { name: /get started free/i });
      expect(button).toHaveAttribute('href', '/signup');
    });

    test('should have correct href for Learn More', () => {
      render(<Hero />);
      
      const button = screen.getByRole('link', { name: /learn more/i });
      expect(button).toHaveAttribute('href', '/features');
    });

    test('should have ctaButtons container', () => {
      const { container } = render(<Hero />);
      
      const ctaButtons = container.querySelector('.ctaButtons');
      expect(ctaButtons).toBeInTheDocument();
    });

    test('should have primaryCta class on Get Started button', () => {
      const { container } = render(<Hero />);
      
      const primaryCta = container.querySelector('.primaryCta');
      expect(primaryCta).toBeInTheDocument();
      expect(primaryCta).toHaveTextContent('Get Started Free');
    });

    test('should have secondaryCta class on Learn More button', () => {
      const { container } = render(<Hero />);
      
      const secondaryCta = container.querySelector('.secondaryCta');
      expect(secondaryCta).toBeInTheDocument();
      expect(secondaryCta).toHaveTextContent('Learn More');
    });
  });

  describe('Feature Highlights', () => {
    test('should render highlights container', () => {
      const { container } = render(<Hero />);
      
      const highlights = container.querySelector('.highlights');
      expect(highlights).toBeInTheDocument();
    });

    test('should render three highlight items', () => {
      const { container } = render(<Hero />);
      
      const highlights = container.querySelectorAll('.highlight');
      expect(highlights).toHaveLength(3);
    });

    test('should render Easy Tracking highlight', () => {
      render(<Hero />);
      
      const highlight = screen.getByText('Easy Tracking');
      expect(highlight).toBeInTheDocument();
    });

    test('should render Progress Insights highlight', () => {
      render(<Hero />);
      
      const highlight = screen.getByText('Progress Insights');
      expect(highlight).toBeInTheDocument();
    });

    test('should render Goal Setting highlight', () => {
      render(<Hero />);
      
      const highlight = screen.getByText('Goal Setting');
      expect(highlight).toBeInTheDocument();
    });

    test('should have highlight icons', () => {
      const { container } = render(<Hero />);
      
      const icons = container.querySelectorAll('.highlightIcon');
      expect(icons).toHaveLength(3);
      expect(icons[0]).toHaveTextContent('⏱️');
      expect(icons[1]).toHaveTextContent('📊');
      expect(icons[2]).toHaveTextContent('🎯');
    });

    test('should have highlightText classes', () => {
      const { container } = render(<Hero />);
      
      const texts = container.querySelectorAll('.highlightText');
      expect(texts).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    test('should have aria-labelledby on section', () => {
      render(<Hero />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-heading');
    });

    test('should have accessible heading', () => {
      render(<Hero />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAccessibleName(/take control of your fasting journey/i);
    });

    test('should have accessible CTA buttons', () => {
      render(<Hero />);
      
      const getStarted = screen.getByRole('link', { name: /get started free/i });
      const learnMore = screen.getByRole('link', { name: /learn more/i });
      
      expect(getStarted).toHaveAccessibleName('Get Started Free');
      expect(learnMore).toHaveAccessibleName('Learn More');
    });

    test('should have proper heading hierarchy', () => {
      render(<Hero />);
      
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
    });
  });

  describe('Content Organization', () => {
    test('should render all main content sections', () => {
      const { container } = render(<Hero />);
      
      expect(container.querySelector('.headline')).toBeInTheDocument();
      expect(container.querySelector('.subheadline')).toBeInTheDocument();
      expect(container.querySelector('.ctaButtons')).toBeInTheDocument();
      expect(container.querySelector('.highlights')).toBeInTheDocument();
    });

    test('should have two CTA buttons', () => {
      render(<Hero />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
    });

    test('should organize highlights with icons and text', () => {
      const { container } = render(<Hero />);
      
      const highlights = container.querySelectorAll('.highlight');
      
      highlights.forEach((highlight) => {
        const icon = highlight.querySelector('.highlightIcon');
        const text = highlight.querySelector('.highlightText');
        
        expect(icon).toBeInTheDocument();
        expect(text).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    test('should have all required CSS classes', () => {
      const { container } = render(<Hero />);
      
      expect(container.querySelector('.hero')).toBeInTheDocument();
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.content')).toBeInTheDocument();
      expect(container.querySelector('.headline')).toBeInTheDocument();
      expect(container.querySelector('.headlineEmphasis')).toBeInTheDocument();
      expect(container.querySelector('.subheadline')).toBeInTheDocument();
      expect(container.querySelector('.ctaButtons')).toBeInTheDocument();
      expect(container.querySelector('.highlights')).toBeInTheDocument();
    });

    test('should have highlight-related classes', () => {
      const { container } = render(<Hero />);
      
      expect(container.querySelectorAll('.highlight')).toHaveLength(3);
      expect(container.querySelectorAll('.highlightIcon')).toHaveLength(3);
      expect(container.querySelectorAll('.highlightText')).toHaveLength(3);
    });
  });
});
