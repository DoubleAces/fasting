import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '@/components/molecules/StatCard';

describe('StatCard Component', () => {
  describe('Rendering', () => {
    it('should render icon, label, and value', () => {
      render(<StatCard icon="🔥" label="Current Streak" value="5 days" />);
      
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('should render with numeric value', () => {
      render(<StatCard icon="📊" label="Total Fasts" value={42} />);
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(<StatCard icon="⏱️" label="Average Duration" value="16h 30m" />);
      
      expect(screen.getByText('16h 30m')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatCard icon="🔥" label="Test" value="10" className="custom-class" />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Styling', () => {
    it('should apply glassmorphic card styling', () => {
      const { container } = render(
        <StatCard icon="🔥" label="Streak" value="5" />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
      expect(card).toHaveClass('text-center');
    });

    it('should apply hover effects', () => {
      const { container } = render(
        <StatCard icon="🔥" label="Streak" value="5" />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('hover:scale-105');
      expect(card).toHaveClass('hover:shadow-2xl');
      expect(card).toHaveClass('transition-all');
    });

    it('should apply gradient text to value', () => {
      render(<StatCard icon="🔥" label="Streak" value="5 days" />);
      
      const value = screen.getByText('5 days');
      expect(value).toHaveClass('bg-gradient-to-r');
      expect(value).toHaveClass('from-purple-600');
      expect(value).toHaveClass('via-pink-600');
      expect(value).toHaveClass('to-indigo-600');
      expect(value).toHaveClass('bg-clip-text');
      expect(value).toHaveClass('text-transparent');
    });

    it('should display icon with correct size', () => {
      render(<StatCard icon="🔥" label="Streak" value="5" />);
      
      const icon = screen.getByText('🔥');
      expect(icon).toHaveClass('text-4xl');
    });

    it('should display label with correct styling', () => {
      render(<StatCard icon="🔥" label="Current Streak" value="5" />);
      
      const label = screen.getByText('Current Streak');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('text-gray-600');
      expect(label).toHaveClass('font-medium');
    });
  });

  describe('Edge Cases', () => {
    it('should render with zero value', () => {
      render(<StatCard icon="📊" label="Total" value={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render with empty string value', () => {
      render(<StatCard icon="⏱️" label="Average" value="" />);
      
      const value = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'div' && element.textContent === '';
      });
      expect(value).toBeInTheDocument();
    });

    it('should render with placeholder text for missing data', () => {
      render(<StatCard icon="⏱️" label="Average" value="Need 7+ entries" />);
      
      expect(screen.getByText('Need 7+ entries')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as a card with appropriate text hierarchy', () => {
      render(<StatCard icon="🔥" label="Current Streak" value="5 days" />);
      
      // Label should be visible and readable
      const label = screen.getByText('Current Streak');
      expect(label).toBeVisible();
      
      // Value should be prominently displayed
      const value = screen.getByText('5 days');
      expect(value).toBeVisible();
      expect(value).toHaveClass('text-2xl');
    });
  });
});
