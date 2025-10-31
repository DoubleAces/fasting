import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardStats from '@/components/organisms/DashboardStats';

describe('DashboardStats Component', () => {
  describe('Rendering with Data', () => {
    it('should render all three stat cards with data', () => {
      const stats = {
        currentStreak: 5,
        totalFasts: 42,
        averageDuration: 990, // 16h 30m
      };

      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('Total Fasts')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();

      expect(screen.getByText('⏱️')).toBeInTheDocument();
      expect(screen.getByText('Average Duration')).toBeInTheDocument();
      expect(screen.getByText('16h 30m')).toBeInTheDocument();
    });

    it('should render section heading', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 720 };
      
      render(<DashboardStats stats={stats} />);

      const heading = screen.getByText('Your Progress');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
      expect(heading).toHaveClass('bg-gradient-to-r');
    });

    it('should display singular "day" for streak of 1', () => {
      const stats = { currentStreak: 1, totalFasts: 1, averageDuration: 720 };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('should display plural "days" for streak > 1', () => {
      const stats = { currentStreak: 7, totalFasts: 10, averageDuration: 720 };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('7 days')).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should format hours and minutes correctly', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 990 }; // 16h 30m
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('16h 30m')).toBeInTheDocument();
    });

    it('should format hours only when minutes is 0', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 720 }; // 12h
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    it('should format minutes only when hours is 0', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 45 }; // 45m
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    it('should show placeholder when averageDuration is null', () => {
      const stats = { currentStreak: 5, totalFasts: 3, averageDuration: null };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('Need 7+ entries')).toBeInTheDocument();
    });

    it('should show placeholder when averageDuration is undefined', () => {
      const stats = { currentStreak: 5, totalFasts: 3 };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('Need 7+ entries')).toBeInTheDocument();
    });

    it('should round minutes to nearest integer', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 982.7 }; // 16h 22.7m -> 16h 23m
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('16h 23m')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show encouraging messages when no data exists', () => {
      const stats = { currentStreak: 0, totalFasts: 0, averageDuration: null };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('Start today!')).toBeInTheDocument();
      expect(screen.getByText('Log your first')).toBeInTheDocument();
      expect(screen.getByText('Build consistency')).toBeInTheDocument();
    });

    it('should show encouraging messages when stats is undefined', () => {
      render(<DashboardStats stats={undefined} />);

      expect(screen.getByText('Start today!')).toBeInTheDocument();
      expect(screen.getByText('Log your first')).toBeInTheDocument();
      expect(screen.getByText('Build consistency')).toBeInTheDocument();
    });

    it('should show encouraging messages when stats is null', () => {
      render(<DashboardStats stats={null} />);

      expect(screen.getByText('Start today!')).toBeInTheDocument();
    });

    it('should still show icons in empty state', () => {
      const stats = { currentStreak: 0, totalFasts: 0, averageDuration: null };
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use responsive grid layout', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 720 };
      const { container } = render(<DashboardStats stats={stats} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('gap-6');
    });

    it('should apply custom className to section', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 720 };
      const { container } = render(<DashboardStats stats={stats} className="custom-class" />);

      const section = container.firstChild;
      expect(section).toHaveClass('custom-class');
    });

    it('should have margin bottom for spacing', () => {
      const stats = { currentStreak: 5, totalFasts: 10, averageDuration: 720 };
      const { container } = render(<DashboardStats stats={stats} />);

      const section = container.firstChild;
      expect(section).toHaveClass('mb-8');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero streak correctly', () => {
      const stats = { currentStreak: 0, totalFasts: 10, averageDuration: 720 };
      
      render(<DashboardStats stats={stats} />);

      // Should show real data, not empty state (user has entries but no streak)
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const stats = { currentStreak: 365, totalFasts: 1000, averageDuration: 1440 }; // 24h
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('365 days')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('24h')).toBeInTheDocument();
    });

    it('should handle partial stats object', () => {
      const stats = { currentStreak: 5 }; // Missing totalFasts and averageDuration
      
      render(<DashboardStats stats={stats} />);

      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Default totalFasts
      expect(screen.getByText('Need 7+ entries')).toBeInTheDocument(); // Default averageDuration
    });
  });
});
