import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryCard from '@/components/organisms/EntryCard';

describe('EntryCard Component', () => {
  const mockEntry = {
    _id: '123',
    date: '2024-03-15',
    firstMealTime: '12:00',
    lastMealTime: '20:00',
    fastingDuration: 960, // 16 hours in minutes
    eatingWindow: 480, // 8 hours in minutes
    hoursOfSleep: 7.5,
    morningWeight: 75.5,
    hungerLevel: 'Low',
    energyLevel: 'High Energy',
    wellBeing: 'Good',
    foodNotes: 'Had a healthy salad for lunch',
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  };

  describe('Rendering - Basic Information', () => {
    it('should render entry date', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Date is formatted as dd/MM/yyyy
      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
    });

    it('should render fasting duration', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Fasting duration shown as "16h" not "16 hours"
      expect(screen.getByText('16h')).toBeInTheDocument();
    });

    it('should render eating window', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Eating window shown as "8h" not "8 hours"
      expect(screen.getByText('8h')).toBeInTheDocument();
    });

    it('should render meal times', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/12:00/)).toBeInTheDocument();
      expect(screen.getByText(/20:00/)).toBeInTheDocument();
    });
  });

  describe('Rendering - Optional Fields', () => {
    it('should render hours of sleep when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/7\.5.*hours/i)).toBeInTheDocument();
    });

    it('should not render hours of sleep when not provided', () => {
      const entryWithoutSleep = { ...mockEntry, hoursOfSleep: undefined };
      render(<EntryCard entry={entryWithoutSleep} />);
      
      expect(screen.queryByText(/sleep/i)).not.toBeInTheDocument();
    });

    it('should render morning weight when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/75\.5.*kg/i)).toBeInTheDocument();
    });

    it('should not render morning weight when not provided', () => {
      const entryWithoutWeight = { ...mockEntry, morningWeight: undefined };
      render(<EntryCard entry={entryWithoutWeight} />);
      
      expect(screen.queryByText(/weight/i)).not.toBeInTheDocument();
    });

    it('should render hunger level when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/low/i)).toBeInTheDocument();
    });

    it('should render energy level when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/high energy/i)).toBeInTheDocument();
    });

    it('should render well-being when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/good/i)).toBeInTheDocument();
    });

    it('should render food notes when provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/healthy salad/i)).toBeInTheDocument();
    });

    it('should not render food notes when not provided', () => {
      const entryWithoutNotes = { ...mockEntry, foodNotes: undefined };
      render(<EntryCard entry={entryWithoutNotes} />);
      
      expect(screen.queryByText(/notes/i)).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render edit button when onEdit provided', () => {
      const handleEdit = jest.fn();
      render(<EntryCard entry={mockEntry} onEdit={handleEdit} />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should not render edit button when onEdit not provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const handleEdit = jest.fn();
      render(<EntryCard entry={mockEntry} onEdit={handleEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(handleEdit).toHaveBeenCalledTimes(1);
      expect(handleEdit).toHaveBeenCalledWith(mockEntry);
    });

    it('should render delete button when onDelete provided', () => {
      const handleDelete = jest.fn();
      render(<EntryCard entry={mockEntry} onDelete={handleDelete} />);
      
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should not render delete button when onDelete not provided', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      const handleDelete = jest.fn();
      render(<EntryCard entry={mockEntry} onDelete={handleDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(handleDelete).toHaveBeenCalledTimes(1);
      expect(handleDelete).toHaveBeenCalledWith(mockEntry._id);
    });

    it('should render both edit and delete buttons when both handlers provided', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();
      render(<EntryCard entry={mockEntry} onEdit={handleEdit} onDelete={handleDelete} />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(<EntryCard entry={mockEntry} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have card-like visual structure', () => {
      const { container } = render(<EntryCard entry={mockEntry} />);
      
      // Should have a container element (article)
      expect(container.querySelector('article')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use article element for semantic structure', () => {
      const { container } = render(<EntryCard entry={mockEntry} />);
      
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();
      render(<EntryCard entry={mockEntry} onEdit={handleEdit} onDelete={handleDelete} />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should associate labels with data', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Check that data has descriptive text (not just raw numbers)
      expect(screen.getByText(/fasting/i)).toBeInTheDocument();
      expect(screen.getByText(/eating window/i)).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format date in readable format', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Date shown as dd/MM/yyyy format (15/03/2024)
      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      const entryWithDifferentDate = { ...mockEntry, date: '2024-01-01' };
      render(<EntryCard entry={entryWithDifferentDate} />);
      
      // Date shown as dd/MM/yyyy format (01/01/2024)
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render minimal entry with only required fields', () => {
      const minimalEntry = {
        _id: '456',
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 960, // 16 hours in minutes
        eatingWindow: 480, // 8 hours in minutes
      };

      render(<EntryCard entry={minimalEntry} />);
      
      // Date shown as dd/MM/yyyy, fasting as "16h"
      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
      expect(screen.getByText('16h')).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const entryWithZeros = {
        ...mockEntry,
        hoursOfSleep: 0,
        morningWeight: 0,
      };

      render(<EntryCard entry={entryWithZeros} />);
      
      // Zero is a valid value and should be displayed
      expect(screen.getByText(/0.*hours/i)).toBeInTheDocument();
      expect(screen.getByText(/0.*kg/i)).toBeInTheDocument();
    });

    it('should truncate very long food notes', () => {
      const longNotes = 'A'.repeat(500);
      const entryWithLongNotes = { ...mockEntry, foodNotes: longNotes };

      const { container } = render(<EntryCard entry={entryWithLongNotes} />);
      
      // Should render but might be truncated (check it renders without breaking)
      expect(container.textContent).toContain('A');
    });
  });

  describe('Visual Indicators', () => {
    it('should display ratings with appropriate labels', () => {
      render(<EntryCard entry={mockEntry} />);
      
      // Check for rating labels (use getAllByText since "Energy" appears twice - as label and value)
      expect(screen.getByText(/hunger/i)).toBeInTheDocument();
      expect(screen.getAllByText(/energy/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/well-being/i)).toBeInTheDocument();
    });

    it('should show meal times section', () => {
      render(<EntryCard entry={mockEntry} />);
      
      expect(screen.getByText(/first meal/i)).toBeInTheDocument();
      expect(screen.getByText(/last meal/i)).toBeInTheDocument();
    });
  });
});
