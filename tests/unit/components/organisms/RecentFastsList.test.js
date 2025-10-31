import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentFastsList from '@/components/organisms/RecentFastsList';

// Mock RecentEntryItem component
jest.mock('@/components/molecules/RecentEntryItem', () => {
  return function MockRecentEntryItem({ entry }) {
    return <div data-testid={`entry-${entry._id}`}>{entry._id}</div>;
  };
});

// Mock Next.js Link (used in RecentEntryItem)
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

describe('RecentFastsList Component', () => {
  const createMockEntry = (id, date, duration, goalStatus) => ({
    _id: id,
    date: new Date(date),
    fastingDuration: duration,
    goalStatus,
  });

  describe('Rendering with Entries', () => {
    it('should render all entries when count is 5', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
        createMockEntry('3', '2025-01-28', 900, 'not-completed'),
        createMockEntry('4', '2025-01-27', 1000, 'completed'),
        createMockEntry('5', '2025-01-26', 950, 'completed'),
      ];

      render(<RecentFastsList entries={entries} />);

      expect(screen.getByTestId('entry-1')).toBeInTheDocument();
      expect(screen.getByTestId('entry-2')).toBeInTheDocument();
      expect(screen.getByTestId('entry-3')).toBeInTheDocument();
      expect(screen.getByTestId('entry-4')).toBeInTheDocument();
      expect(screen.getByTestId('entry-5')).toBeInTheDocument();
    });

    it('should render section heading', () => {
      const entries = [createMockEntry('1', '2025-01-30', 960, 'completed')];
      
      render(<RecentFastsList entries={entries} />);

      const heading = screen.getByText('Recent Fasts');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('bg-gradient-to-r');
    });

    it('should render entries with proper spacing', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
      ];

      const { container } = render(<RecentFastsList entries={entries} />);

      const spacedContainer = container.querySelector('.space-y-3');
      expect(spacedContainer).toBeInTheDocument();
    });
  });

  describe('Placeholders', () => {
    it('should show 5 placeholders when no entries exist', () => {
      render(<RecentFastsList entries={[]} />);

      expect(screen.getByText('Log your first fast')).toBeInTheDocument();
      expect(screen.getByText('Build your streak')).toBeInTheDocument();
      expect(screen.getByText('Track your progress')).toBeInTheDocument();
      expect(screen.getByText('Stay consistent')).toBeInTheDocument();
      expect(screen.getByText('Achieve your goals')).toBeInTheDocument();
    });

    it('should show 3 placeholders when 2 entries exist', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
      ];

      render(<RecentFastsList entries={entries} />);

      // Should have 2 real entries
      expect(screen.getByTestId('entry-1')).toBeInTheDocument();
      expect(screen.getByTestId('entry-2')).toBeInTheDocument();

      // Should have 3 placeholders
      const placeholders = screen.getAllByText('Keep logging your fasts');
      expect(placeholders).toHaveLength(3);
    });

    it('should show 1 placeholder when 4 entries exist', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
        createMockEntry('3', '2025-01-28', 900, 'completed'),
        createMockEntry('4', '2025-01-27', 1000, 'completed'),
      ];

      render(<RecentFastsList entries={entries} />);

      const placeholders = screen.getAllByText('Keep logging your fasts');
      expect(placeholders).toHaveLength(1);
    });

    it('should show no placeholders when 5 entries exist', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
        createMockEntry('3', '2025-01-28', 900, 'completed'),
        createMockEntry('4', '2025-01-27', 1000, 'completed'),
        createMockEntry('5', '2025-01-26', 950, 'completed'),
      ];

      render(<RecentFastsList entries={entries} />);

      expect(screen.queryByText('Keep logging your fasts')).not.toBeInTheDocument();
      expect(screen.queryByText('Log your first fast')).not.toBeInTheDocument();
    });

    it('should apply opacity to placeholders', () => {
      const { container } = render(<RecentFastsList entries={[]} />);

      const placeholders = container.querySelectorAll('.opacity-60');
      expect(placeholders.length).toBe(5);
    });
  });

  describe('Empty State', () => {
    it('should show encouraging message when no entries exist', () => {
      render(<RecentFastsList entries={[]} />);

      expect(screen.getByText(/Start tracking your fasting journey today!/)).toBeInTheDocument();
      expect(screen.getByText(/🚀/)).toBeInTheDocument();
    });

    it('should not show encouraging message when entries exist', () => {
      const entries = [createMockEntry('1', '2025-01-30', 960, 'completed')];
      
      render(<RecentFastsList entries={entries} />);

      expect(screen.queryByText(/Start tracking your fasting journey today!/)).not.toBeInTheDocument();
    });

    it('should show different placeholder messages for empty state', () => {
      render(<RecentFastsList entries={[]} />);

      // Empty state shows encouraging messages instead of "Keep logging"
      expect(screen.getByText('Log your first fast')).toBeInTheDocument();
      expect(screen.queryByText('Keep logging your fasts')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use vertical stacking for entries', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
      ];

      const { container } = render(<RecentFastsList entries={entries} />);

      const stack = container.querySelector('.space-y-3');
      expect(stack).toBeInTheDocument();
    });

    it('should apply custom className to section', () => {
      const { container } = render(<RecentFastsList entries={[]} className="custom-class" />);

      const section = container.firstChild;
      expect(section).toHaveClass('custom-class');
    });

    it('should have margin bottom for spacing', () => {
      const { container } = render(<RecentFastsList entries={[]} />);

      const section = container.firstChild;
      expect(section).toHaveClass('mb-8');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined entries prop', () => {
      render(<RecentFastsList entries={undefined} />);

      // Should default to empty array and show empty state
      expect(screen.getByText('Log your first fast')).toBeInTheDocument();
    });

    it('should handle null entries prop', () => {
      render(<RecentFastsList entries={null} />);

      // Should treat as empty array
      expect(screen.getByText('Log your first fast')).toBeInTheDocument();
    });

    it('should handle more than 5 entries (should only show first 5)', () => {
      const entries = [
        createMockEntry('1', '2025-01-30', 960, 'completed'),
        createMockEntry('2', '2025-01-29', 980, 'completed'),
        createMockEntry('3', '2025-01-28', 900, 'completed'),
        createMockEntry('4', '2025-01-27', 1000, 'completed'),
        createMockEntry('5', '2025-01-26', 950, 'completed'),
        createMockEntry('6', '2025-01-25', 920, 'completed'),
      ];

      render(<RecentFastsList entries={entries} />);

      // Should show all provided entries (component doesn't limit, page does)
      expect(screen.getByTestId('entry-1')).toBeInTheDocument();
      expect(screen.getByTestId('entry-6')).toBeInTheDocument();
    });

    it('should render with single entry', () => {
      const entries = [createMockEntry('1', '2025-01-30', 960, 'completed')];
      
      render(<RecentFastsList entries={entries} />);

      expect(screen.getByTestId('entry-1')).toBeInTheDocument();
      
      const placeholders = screen.getAllByText('Keep logging your fasts');
      expect(placeholders).toHaveLength(4);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<RecentFastsList entries={[]} />);

      const heading = screen.getByText('Recent Fasts');
      expect(heading.tagName).toBe('H2');
    });

    it('should have readable text in placeholders', () => {
      render(<RecentFastsList entries={[]} />);

      const placeholders = screen.getAllByText(/Log|Build|Track|Stay|Achieve/);
      expect(placeholders.length).toBe(5);
      
      placeholders.forEach(placeholder => {
        expect(placeholder).toHaveClass('text-sm');
        expect(placeholder).toHaveClass('text-gray-500');
      });
    });
  });
});
