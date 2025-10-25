/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import EntryMetadata from '@/components/molecules/EntryMetadata';

describe('EntryMetadata Component', () => {
  const mockEntry = {
    createdAt: new Date('2025-10-20T08:15:00.000Z'),
    updatedAt: new Date('2025-10-20T10:30:00.000Z'),
  };

  describe('Timestamp Display', () => {
    it('displays created timestamp', () => {
      render(<EntryMetadata entry={mockEntry} />);
      
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });

    it('displays updated timestamp', () => {
      render(<EntryMetadata entry={mockEntry} />);
      
      expect(screen.getByText(/updated/i)).toBeInTheDocument();
    });

    it('formats timestamps correctly', () => {
      render(<EntryMetadata entry={mockEntry} />);
      
      // Should format using date-fns (two timestamps with same date)
      const formattedDates = screen.getAllByText(/Oct 20, 2025/i);
      expect(formattedDates).toHaveLength(2);
    });
  });

  describe('Same Date Handling', () => {
    it('shows only created date when not updated', () => {
      const sameEntry = {
        createdAt: new Date('2025-10-20T08:15:00.000Z'),
        updatedAt: new Date('2025-10-20T08:15:00.000Z'),
      };
      
      render(<EntryMetadata entry={sameEntry} />);
      
      expect(screen.getByText(/created/i)).toBeInTheDocument();
      expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing createdAt', () => {
      const incompleteEntry = {
        updatedAt: new Date('2025-10-20T10:30:00.000Z'),
      };
      
      const { container } = render(<EntryMetadata entry={incompleteEntry} />);
      
      // Should still render but with "--" for missing date
      expect(container.textContent).toContain('Created:');
      expect(container.textContent).toContain('--');
    });

    it('handles missing updatedAt', () => {
      const incompleteEntry = {
        createdAt: new Date('2025-10-20T08:15:00.000Z'),
      };
      
      render(<EntryMetadata entry={incompleteEntry} />);
      
      expect(screen.getByText(/created/i)).toBeInTheDocument();
    });

    it('handles null entry', () => {
      const { container } = render(<EntryMetadata entry={null} />);
      
      // Should render empty container without crashing
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('text-sm', 'text-gray-600', 'space-y-1');
    });
  });

  describe('Relative Time', () => {
    it('shows relative time for recent entries', () => {
      const recentEntry = {
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      };
      
      render(<EntryMetadata entry={recentEntry} />);
      
      // Since dates are the same, only one "ago" will appear
      const agoText = screen.getAllByText(/ago/i);
      expect(agoText.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic time elements', () => {
      const { container } = render(<EntryMetadata entry={mockEntry} />);
      
      const timeElements = container.querySelectorAll('time');
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('includes datetime attributes', () => {
      const { container } = render(<EntryMetadata entry={mockEntry} />);
      
      const timeElement = container.querySelector('time');
      expect(timeElement).toHaveAttribute('dateTime');
    });
  });
});
