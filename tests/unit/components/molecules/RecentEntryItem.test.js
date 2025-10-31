import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentEntryItem from '@/components/molecules/RecentEntryItem';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, className }) => {
    return <a href={href} className={className}>{children}</a>;
  };
});

describe('RecentEntryItem Component', () => {
  const mockEntry = {
    _id: '123',
    date: new Date('2025-01-30'),
    fastingDuration: 990, // 16h 30m
    goalStatus: 'completed',
  };

  describe('Rendering', () => {
    it('should render entry with all information', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      expect(screen.getByText('Jan 30, 2025')).toBeInTheDocument();
      expect(screen.getByText('16h 30m')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should render as a link to entry details', () => {
      const { container } = render(<RecentEntryItem entry={mockEntry} />);
      
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/entries/123');
    });

    it('should return null if entry is not provided', () => {
      const { container } = render(<RecentEntryItem entry={null} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      expect(screen.getByText('Jan 30, 2025')).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      const entry = { ...mockEntry, date: '2025-12-25' };
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('Dec 25, 2025')).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should format hours and minutes', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      expect(screen.getByText('16h 30m')).toBeInTheDocument();
    });

    it('should format hours only when minutes is 0', () => {
      const entry = { ...mockEntry, fastingDuration: 720 }; // 12h
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    it('should format minutes only when hours is 0', () => {
      const entry = { ...mockEntry, fastingDuration: 45 }; // 45m
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    it('should show "No duration" when duration is null', () => {
      const entry = { ...mockEntry, fastingDuration: null };
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('No duration')).toBeInTheDocument();
    });

    it('should show "No duration" when duration is undefined', () => {
      const entry = { ...mockEntry, fastingDuration: undefined };
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('No duration')).toBeInTheDocument();
    });

    it('should round minutes to nearest integer', () => {
      const entry = { ...mockEntry, fastingDuration: 982.7 }; // 16h 22.7m -> 16h 23m
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('16h 23m')).toBeInTheDocument();
    });
  });

  describe('Goal Status Icons', () => {
    it('should show green checkmark for completed goal', () => {
      const entry = { ...mockEntry, goalStatus: 'completed' };
      render(<RecentEntryItem entry={entry} />);
      
      const icon = screen.getByText('✅');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-green-600');
    });

    it('should show yellow warning for not-completed goal', () => {
      const entry = { ...mockEntry, goalStatus: 'not-completed' };
      render(<RecentEntryItem entry={entry} />);
      
      const icon = screen.getByText('⚠️');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-600');
    });
  });

  describe('Extended Fast Badge', () => {
    it('should show Extended Fast badge for durations >24 hours (>1440 minutes)', () => {
      const entry = { ...mockEntry, fastingDuration: 1500 }; // 25h
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('Extended Fast')).toBeInTheDocument();
    });

    it('should not show badge for durations <24 hours', () => {
      const entry = { ...mockEntry, fastingDuration: 960 }; // 16h
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.queryByText('Extended Fast')).not.toBeInTheDocument();
    });

    it('should not show badge for exactly 24 hours (1440 minutes)', () => {
      const entry = { ...mockEntry, fastingDuration: 1440 }; // 24h
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.queryByText('Extended Fast')).not.toBeInTheDocument();
    });

    it('should not show badge when duration is null', () => {
      const entry = { ...mockEntry, fastingDuration: null };
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.queryByText('Extended Fast')).not.toBeInTheDocument();
    });

    it('should apply gradient styling to badge', () => {
      const entry = { ...mockEntry, fastingDuration: 1500 };
      render(<RecentEntryItem entry={entry} />);
      
      const badge = screen.getByText('Extended Fast');
      expect(badge).toHaveClass('bg-gradient-to-r');
      expect(badge).toHaveClass('from-purple-500');
      expect(badge).toHaveClass('to-pink-500');
    });
  });

  describe('Styling and Interactions', () => {
    it('should apply glassmorphic card styling', () => {
      const { container } = render(<RecentEntryItem entry={mockEntry} />);
      
      const card = container.querySelector('.p-4');
      expect(card).toBeInTheDocument();
    });

    it('should apply hover effects', () => {
      const { container } = render(<RecentEntryItem entry={mockEntry} />);
      
      const card = container.querySelector('.p-4');
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('hover:shadow-xl');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should apply gradient text to duration', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      const duration = screen.getByText('16h 30m');
      expect(duration).toHaveClass('bg-gradient-to-r');
      expect(duration).toHaveClass('from-purple-600');
      expect(duration).toHaveClass('via-pink-600');
      expect(duration).toHaveClass('to-indigo-600');
    });

    it('should apply custom className to wrapper', () => {
      const { container } = render(<RecentEntryItem entry={mockEntry} className="custom-class" />);
      
      const link = container.querySelector('a');
      expect(link).toHaveClass('custom-class');
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout for horizontal arrangement', () => {
      const { container } = render(<RecentEntryItem entry={mockEntry} />);
      
      const layout = container.querySelector('.flex.items-center.justify-between');
      expect(layout).toBeInTheDocument();
    });

    it('should display date and duration on left side', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      const date = screen.getByText('Jan 30, 2025');
      const duration = screen.getByText('16h 30m');
      
      expect(date).toBeInTheDocument();
      expect(duration).toBeInTheDocument();
    });

    it('should display goal status icon on right side', () => {
      render(<RecentEntryItem entry={mockEntry} />);
      
      const icon = screen.getByText('✅');
      expect(icon).toHaveClass('text-2xl');
    });
  });

  describe('Edge Cases', () => {
    it('should handle entry with missing _id', () => {
      const entry = { ...mockEntry, _id: undefined };
      const { container } = render(<RecentEntryItem entry={entry} />);
      
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/entries/undefined');
    });

    it('should handle very large durations', () => {
      const entry = { ...mockEntry, fastingDuration: 4320 }; // 72h (3 days)
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('72h')).toBeInTheDocument();
      expect(screen.getByText('Extended Fast')).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      const entry = { ...mockEntry, fastingDuration: 0 };
      render(<RecentEntryItem entry={entry} />);
      
      expect(screen.getByText('0m')).toBeInTheDocument();
    });
  });
});
