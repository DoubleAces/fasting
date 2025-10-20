/**
 * Tests: FeaturesList Component
 * 
 * Test coverage:
 * - Component rendering and structure
 * - Section header (heading and subheading)
 * - Features grid and cards
 * - Individual feature content
 * - Accessibility
 * - CSS classes
 */

import { render, screen, within } from '@testing-library/react';
import FeaturesList from '@/components/organisms/FeaturesList';

describe('FeaturesList Component', () => {
  describe('Rendering and Structure', () => {
    test('should render section element', () => {
      render(<FeaturesList />);
      
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    test('should have featuresSection class', () => {
      const { container } = render(<FeaturesList />);
      
      const section = container.querySelector('.featuresSection');
      expect(section).toBeInTheDocument();
    });

    test('should have container class', () => {
      const { container } = render(<FeaturesList />);
      
      const container_div = container.querySelector('.container');
      expect(container_div).toBeInTheDocument();
    });
  });

  describe('Section Header', () => {
    test('should render main heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 2, name: /everything you need to succeed/i });
      expect(heading).toBeInTheDocument();
    });

    test('should have id for aria-labelledby', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'features-heading');
    });

    test('should render subheading', () => {
      render(<FeaturesList />);
      
      const subheading = screen.getByText(/powerful features designed to help you/i);
      expect(subheading).toBeInTheDocument();
    });

    test('should have header class', () => {
      const { container } = render(<FeaturesList />);
      
      const header = container.querySelector('.header');
      expect(header).toBeInTheDocument();
    });

    test('should have heading class', () => {
      const { container } = render(<FeaturesList />);
      
      const heading = container.querySelector('.heading');
      expect(heading).toBeInTheDocument();
    });

    test('should have subheading class', () => {
      const { container } = render(<FeaturesList />);
      
      const subheading = container.querySelector('.subheading');
      expect(subheading).toBeInTheDocument();
    });
  });

  describe('Features Grid', () => {
    test('should render grid container', () => {
      const { container } = render(<FeaturesList />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    test('should render six feature cards', () => {
      render(<FeaturesList />);
      
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(6);
    });

    test('should have featureCard class on all cards', () => {
      const { container } = render(<FeaturesList />);
      
      const cards = container.querySelectorAll('.featureCard');
      expect(cards).toHaveLength(6);
    });
  });

  describe('Timer Tracking Feature', () => {
    test('should render Timer Tracking heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'Timer Tracking' });
      expect(heading).toBeInTheDocument();
    });

    test('should render Timer Tracking description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/start and stop your fasting timer/i);
      expect(description).toBeInTheDocument();
    });

    test('should have Timer Tracking icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const timerIcon = Array.from(icons).find(icon => icon.textContent === '⏱️');
      expect(timerIcon).toBeInTheDocument();
    });
  });

  describe('Progress History Feature', () => {
    test('should render Progress History heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'Progress History' });
      expect(heading).toBeInTheDocument();
    });

    test('should render Progress History description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/view your complete fasting history/i);
      expect(description).toBeInTheDocument();
    });

    test('should have Progress History icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const progressIcon = Array.from(icons).find(icon => icon.textContent === '📊');
      expect(progressIcon).toBeInTheDocument();
    });
  });

  describe('Custom Goals Feature', () => {
    test('should render Custom Goals heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'Custom Goals' });
      expect(heading).toBeInTheDocument();
    });

    test('should render Custom Goals description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/set personalized fasting goals/i);
      expect(description).toBeInTheDocument();
    });

    test('should have Custom Goals icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const goalsIcon = Array.from(icons).find(icon => icon.textContent === '🎯');
      expect(goalsIcon).toBeInTheDocument();
    });
  });

  describe('Ratings & Notes Feature', () => {
    test('should render Ratings & Notes heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'Ratings & Notes' });
      expect(heading).toBeInTheDocument();
    });

    test('should render Ratings & Notes description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/rate your fasting experience/i);
      expect(description).toBeInTheDocument();
    });

    test('should have Ratings & Notes icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const notesIcon = Array.from(icons).find(icon => icon.textContent === '📝');
      expect(notesIcon).toBeInTheDocument();
    });
  });

  describe('User Preferences Feature', () => {
    test('should render User Preferences heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'User Preferences' });
      expect(heading).toBeInTheDocument();
    });

    test('should render User Preferences description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/customize your experience/i);
      expect(description).toBeInTheDocument();
    });

    test('should have User Preferences icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const preferencesIcon = Array.from(icons).find(icon => icon.textContent === '⚙️');
      expect(preferencesIcon).toBeInTheDocument();
    });
  });

  describe('Secure & Private Feature', () => {
    test('should render Secure & Private heading', () => {
      render(<FeaturesList />);
      
      const heading = screen.getByRole('heading', { level: 3, name: 'Secure & Private' });
      expect(heading).toBeInTheDocument();
    });

    test('should render Secure & Private description', () => {
      render(<FeaturesList />);
      
      const description = screen.getByText(/your data is encrypted and secure/i);
      expect(description).toBeInTheDocument();
    });

    test('should have Secure & Private icon', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      const secureIcon = Array.from(icons).find(icon => icon.textContent === '🔒');
      expect(secureIcon).toBeInTheDocument();
    });
  });

  describe('Feature Card Structure', () => {
    test('should have iconWrapper in each card', () => {
      const { container } = render(<FeaturesList />);
      
      const iconWrappers = container.querySelectorAll('.iconWrapper');
      expect(iconWrappers).toHaveLength(6);
    });

    test('should have featureTitle class on all titles', () => {
      const { container } = render(<FeaturesList />);
      
      const titles = container.querySelectorAll('.featureTitle');
      expect(titles).toHaveLength(6);
    });

    test('should have featureDescription class on all descriptions', () => {
      const { container } = render(<FeaturesList />);
      
      const descriptions = container.querySelectorAll('.featureDescription');
      expect(descriptions).toHaveLength(6);
    });

    test('should have icon class on all icons', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      expect(icons).toHaveLength(6);
    });
  });

  describe('Accessibility', () => {
    test('should have aria-labelledby on section', () => {
      render(<FeaturesList />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'features-heading');
    });

    test('should have proper heading hierarchy', () => {
      render(<FeaturesList />);
      
      const h2 = screen.getAllByRole('heading', { level: 2 });
      const h3 = screen.getAllByRole('heading', { level: 3 });
      
      expect(h2).toHaveLength(1);
      expect(h3).toHaveLength(6);
    });

    test('should use article elements for feature cards', () => {
      render(<FeaturesList />);
      
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(6);
    });

    test('should have aria-hidden on icons', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('should have role="img" on icons', () => {
      const { container } = render(<FeaturesList />);
      
      const icons = container.querySelectorAll('.icon');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('role', 'img');
      });
    });

    test('should have accessible feature titles', () => {
      render(<FeaturesList />);
      
      expect(screen.getByRole('heading', { name: 'Timer Tracking' })).toHaveAccessibleName('Timer Tracking');
      expect(screen.getByRole('heading', { name: 'Progress History' })).toHaveAccessibleName('Progress History');
      expect(screen.getByRole('heading', { name: 'Custom Goals' })).toHaveAccessibleName('Custom Goals');
      expect(screen.getByRole('heading', { name: 'Ratings & Notes' })).toHaveAccessibleName('Ratings & Notes');
      expect(screen.getByRole('heading', { name: 'User Preferences' })).toHaveAccessibleName('User Preferences');
      expect(screen.getByRole('heading', { name: 'Secure & Private' })).toHaveAccessibleName('Secure & Private');
    });
  });

  describe('Content Organization', () => {
    test('should render all feature sections', () => {
      const { container } = render(<FeaturesList />);
      
      expect(container.querySelector('.header')).toBeInTheDocument();
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    test('should have correct number of features', () => {
      render(<FeaturesList />);
      
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(6);
    });

    test('should organize features in article elements', () => {
      const { container } = render(<FeaturesList />);
      
      const articles = screen.getAllByRole('article');
      
      articles.forEach(article => {
        const heading = within(article).getByRole('heading', { level: 3 });
        expect(heading).toBeInTheDocument();
      });
      
      // Verify icons exist
      const icons = container.querySelectorAll('.icon');
      expect(icons).toHaveLength(6);
    });
  });

  describe('CSS Classes', () => {
    test('should have all required CSS classes', () => {
      const { container } = render(<FeaturesList />);
      
      expect(container.querySelector('.featuresSection')).toBeInTheDocument();
      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.header')).toBeInTheDocument();
      expect(container.querySelector('.heading')).toBeInTheDocument();
      expect(container.querySelector('.subheading')).toBeInTheDocument();
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    test('should have feature card related classes', () => {
      const { container } = render(<FeaturesList />);
      
      expect(container.querySelectorAll('.featureCard')).toHaveLength(6);
      expect(container.querySelectorAll('.iconWrapper')).toHaveLength(6);
      expect(container.querySelectorAll('.icon')).toHaveLength(6);
      expect(container.querySelectorAll('.featureTitle')).toHaveLength(6);
      expect(container.querySelectorAll('.featureDescription')).toHaveLength(6);
    });
  });
});
