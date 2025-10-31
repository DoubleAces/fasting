import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuickActions from '@/components/organisms/QuickActions';

// Mock GradientButton component
jest.mock('@/components/atoms/GradientButton', () => {
  return function MockGradientButton({ children, href, className }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('QuickActions Component', () => {
  describe('Rendering', () => {
    it('should render all three action buttons', () => {
      render(<QuickActions />);

      expect(screen.getByText('Create Entry')).toBeInTheDocument();
      expect(screen.getByText('View All Entries')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render section heading', () => {
      render(<QuickActions />);

      const heading = screen.getByText('Quick Actions');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('bg-gradient-to-r');
    });

    it('should render icons for each action', () => {
      render(<QuickActions />);

      expect(screen.getByText('➕')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('should render descriptions for each action', () => {
      render(<QuickActions />);

      expect(screen.getByText('Log a new fast')).toBeInTheDocument();
      expect(screen.getByText('See your history')).toBeInTheDocument();
      expect(screen.getByText('Manage preferences')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should link Create Entry to /entries?openForm=true', () => {
      const { container } = render(<QuickActions />);

      const createButton = container.querySelector('a[href="/entries?openForm=true"]');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveTextContent('Create Entry');
    });

    it('should link View All Entries to /entries', () => {
      const { container } = render(<QuickActions />);

      const viewButton = container.querySelector('a[href="/entries"]');
      expect(viewButton).toBeInTheDocument();
      expect(viewButton).toHaveTextContent('View All Entries');
    });

    it('should link Settings to /settings', () => {
      const { container } = render(<QuickActions />);

      const settingsButton = container.querySelector('a[href="/settings"]');
      expect(settingsButton).toBeInTheDocument();
      expect(settingsButton).toHaveTextContent('Settings');
    });
  });

  describe('Layout', () => {
    it('should use responsive grid layout', () => {
      const { container } = render(<QuickActions />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('gap-4');
    });

    it('should apply custom className to section', () => {
      const { container } = render(<QuickActions className="custom-class" />);

      const section = container.firstChild;
      expect(section).toHaveClass('custom-class');
    });

    it('should have margin bottom for spacing', () => {
      const { container } = render(<QuickActions />);

      const section = container.firstChild;
      expect(section).toHaveClass('mb-8');
    });

    it('should center content within buttons', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      buttons.forEach(button => {
        expect(button).toHaveClass('flex');
        expect(button).toHaveClass('flex-col');
        expect(button).toHaveClass('items-center');
        expect(button).toHaveClass('justify-center');
      });
    });
  });

  describe('Styling', () => {
    it('should apply hover effects to buttons', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:scale-105');
        expect(button).toHaveClass('hover:shadow-xl');
        expect(button).toHaveClass('transition-all');
      });
    });

    it('should apply minimum touch target height', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch');
      });
    });

    it('should make buttons full width', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      buttons.forEach(button => {
        expect(button).toHaveClass('w-full');
      });
    });

    it('should apply proper padding to buttons', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      buttons.forEach(button => {
        expect(button).toHaveClass('py-6');
      });
    });

    it('should style icons with correct size', () => {
      render(<QuickActions />);

      const icons = [
        screen.getByText('➕'),
        screen.getByText('📋'),
        screen.getByText('⚙️'),
      ];

      icons.forEach(icon => {
        expect(icon).toHaveClass('text-3xl');
        expect(icon).toHaveClass('mb-2');
      });
    });

    it('should style labels with correct font', () => {
      render(<QuickActions />);

      const labels = [
        screen.getByText('Create Entry'),
        screen.getByText('View All Entries'),
        screen.getByText('Settings'),
      ];

      labels.forEach(label => {
        expect(label).toHaveClass('text-lg');
        expect(label).toHaveClass('font-semibold');
      });
    });

    it('should style descriptions with opacity', () => {
      render(<QuickActions />);

      const descriptions = [
        screen.getByText('Log a new fast'),
        screen.getByText('See your history'),
        screen.getByText('Manage preferences'),
      ];

      descriptions.forEach(desc => {
        expect(desc).toHaveClass('text-sm');
        expect(desc).toHaveClass('opacity-90');
        expect(desc).toHaveClass('mt-1');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<QuickActions />);

      const heading = screen.getByText('Quick Actions');
      expect(heading.tagName).toBe('H2');
    });

    it('should have descriptive button labels', () => {
      render(<QuickActions />);

      // All buttons have clear, descriptive labels
      expect(screen.getByText('Create Entry')).toBeVisible();
      expect(screen.getByText('View All Entries')).toBeVisible();
      expect(screen.getByText('Settings')).toBeVisible();
    });

    it('should have supplementary descriptions', () => {
      render(<QuickActions />);

      // Descriptions provide additional context
      expect(screen.getByText('Log a new fast')).toBeVisible();
      expect(screen.getByText('See your history')).toBeVisible();
      expect(screen.getByText('Manage preferences')).toBeVisible();
    });

    it('should meet touch target minimum size', () => {
      const { container } = render(<QuickActions />);

      // min-h-touch class should ensure 44px minimum (defined in Tailwind config)
      const buttons = container.querySelectorAll('a');
      expect(buttons.length).toBe(3);
      buttons.forEach(button => {
        expect(button).toHaveClass('min-h-touch');
      });
    });
  });

  describe('Content', () => {
    it('should render exactly 3 action buttons', () => {
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      expect(buttons).toHaveLength(3);
    });

    it('should have unique keys for each action', () => {
      // This is tested implicitly by React not throwing warnings
      // and by the fact that all 3 buttons render correctly
      const { container } = render(<QuickActions />);

      const buttons = container.querySelectorAll('a');
      expect(buttons).toHaveLength(3);
    });
  });
});
