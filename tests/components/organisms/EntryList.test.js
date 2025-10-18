import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryList from '@/components/organisms/EntryList';

describe('EntryList Component', () => {
  const mockEntries = [
    {
      _id: '1',
      date: '2024-03-15',
      firstMealTime: '12:00',
      lastMealTime: '20:00',
      fastingHours: 16,
      eatingWindow: 8,
      hoursOfSleep: 7.5,
      morningWeight: 75.5,
      hungerLevel: 'Low',
      energyLevel: 'High Energy',
      wellBeing: 'Good',
      foodNotes: 'Healthy lunch',
    },
    {
      _id: '2',
      date: '2024-03-14',
      firstMealTime: '13:00',
      lastMealTime: '21:00',
      fastingHours: 16,
      eatingWindow: 8,
      hoursOfSleep: 8,
      morningWeight: 76,
    },
    {
      _id: '3',
      date: '2024-03-13',
      firstMealTime: '11:00',
      lastMealTime: '19:00',
      fastingHours: 16,
      eatingWindow: 8,
    },
  ];

  describe('Rendering - Basic', () => {
    it('should render list of entries', () => {
      render(<EntryList entries={mockEntries} />);
      
      // Should render all entries
      expect(screen.getByText(/march 15, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/march 14, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/march 13, 2024/i)).toBeInTheDocument();
    });

    it('should render correct number of entry cards', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      const articles = container.querySelectorAll('article');
      expect(articles).toHaveLength(3);
    });

    it('should pass entry data to EntryCard components', () => {
      render(<EntryList entries={mockEntries} />);
      
      // Check specific data from different entries
      expect(screen.getByText(/12:00/)).toBeInTheDocument();
      expect(screen.getByText(/13:00/)).toBeInTheDocument();
      expect(screen.getByText(/11:00/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no entries provided', () => {
      render(<EntryList entries={[]} />);
      
      expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
    });

    it('should show empty state message when entries is undefined', () => {
      render(<EntryList />);
      
      expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
    });

    it('should not render any entry cards in empty state', () => {
      const { container } = render(<EntryList entries={[]} />);
      
      const articles = container.querySelectorAll('article');
      expect(articles).toHaveLength(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<EntryList entries={mockEntries} loading={true} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show entries when loading', () => {
      render(<EntryList entries={mockEntries} loading={true} />);
      
      expect(screen.queryByText(/march 15, 2024/i)).not.toBeInTheDocument();
    });

    it('should not show loading spinner when loading is false', () => {
      render(<EntryList entries={mockEntries} loading={false} />);
      
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should pass onEdit to EntryCard components when provided', () => {
      const handleEdit = jest.fn();
      render(<EntryList entries={mockEntries} onEdit={handleEdit} />);
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(3);
    });

    it('should not show edit buttons when onEdit not provided', () => {
      render(<EntryList entries={mockEntries} />);
      
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should call onEdit with correct entry when edit clicked', async () => {
      const user = userEvent.setup();
      const handleEdit = jest.fn();
      render(<EntryList entries={mockEntries} onEdit={handleEdit} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]); // Click first entry's edit

      expect(handleEdit).toHaveBeenCalledTimes(1);
      expect(handleEdit).toHaveBeenCalledWith(mockEntries[0]);
    });

    it('should pass onDelete to EntryCard components when provided', () => {
      const handleDelete = jest.fn();
      render(<EntryList entries={mockEntries} onDelete={handleDelete} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(3);
    });

    it('should not show delete buttons when onDelete not provided', () => {
      render(<EntryList entries={mockEntries} />);
      
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should call onDelete with correct entry ID when delete clicked', async () => {
      const user = userEvent.setup();
      const handleDelete = jest.fn();
      render(<EntryList entries={mockEntries} onDelete={handleDelete} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[1]); // Click second entry's delete

      expect(handleDelete).toHaveBeenCalledTimes(1);
      expect(handleDelete).toHaveBeenCalledWith(mockEntries[1]._id);
    });
  });

  describe('Sorting', () => {
    it('should display entries in order provided by default', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      const articles = container.querySelectorAll('article');
      expect(within(articles[0]).getByText(/march 15/i)).toBeInTheDocument();
      expect(within(articles[1]).getByText(/march 14/i)).toBeInTheDocument();
      expect(within(articles[2]).getByText(/march 13/i)).toBeInTheDocument();
    });

    it('should maintain entry order when no sortBy specified', () => {
      const reversedEntries = [...mockEntries].reverse();
      const { container } = render(<EntryList entries={reversedEntries} />);
      
      const articles = container.querySelectorAll('article');
      expect(within(articles[0]).getByText(/march 13/i)).toBeInTheDocument();
      expect(within(articles[2]).getByText(/march 15/i)).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(<EntryList entries={mockEntries} className="custom-list" />);
      
      expect(container.firstChild).toHaveClass('custom-list');
    });

    it('should use grid layout for entries', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Should have a container with grid classes
      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should space entries appropriately', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Should have gap classes for spacing
      const gridContainer = container.querySelector('[class*="gap"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic list structure', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Should be wrapped in a section or main element
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have accessible empty state message', () => {
      render(<EntryList entries={[]} />);
      
      const emptyMessage = screen.getByText(/no entries found/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should have accessible loading state', () => {
      render(<EntryList entries={[]} loading={true} />);
      
      const loadingSpinner = screen.getByRole('status');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single entry', () => {
      const singleEntry = [mockEntries[0]];
      const { container } = render(<EntryList entries={singleEntry} />);
      
      const articles = container.querySelectorAll('article');
      expect(articles).toHaveLength(1);
    });

    it('should handle many entries', () => {
      const manyEntries = Array.from({ length: 20 }, (_, i) => ({
        _id: String(i),
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingHours: 16,
        eatingWindow: 8,
      }));

      const { container } = render(<EntryList entries={manyEntries} />);
      
      const articles = container.querySelectorAll('article');
      expect(articles).toHaveLength(20);
    });

    it('should handle entries with minimal data', () => {
      const minimalEntries = [
        {
          _id: '1',
          date: '2024-03-15',
          firstMealTime: '12:00',
          lastMealTime: '20:00',
          fastingHours: 16,
          eatingWindow: 8,
        },
      ];

      render(<EntryList entries={minimalEntries} />);
      
      expect(screen.getByText(/march 15/i)).toBeInTheDocument();
    });

    it('should not break with null entries', () => {
      render(<EntryList entries={null} />);
      
      expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop provided', () => {
      const errorMessage = 'Failed to load entries';
      render(<EntryList entries={[]} error={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show error state instead of empty state', () => {
      render(<EntryList entries={[]} error="Error occurred" />);
      
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      expect(screen.queryByText(/no entries found/i)).not.toBeInTheDocument();
    });

    it('should not show entries when error present', () => {
      render(<EntryList entries={mockEntries} error="Error occurred" />);
      
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      expect(screen.queryByText(/march 15/i)).not.toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle both edit and delete actions together', async () => {
      const user = userEvent.setup();
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(<EntryList entries={mockEntries} onEdit={handleEdit} onDelete={handleDelete} />);

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      await user.click(editButtons[0]);
      await user.click(deleteButtons[1]);

      expect(handleEdit).toHaveBeenCalledWith(mockEntries[0]);
      expect(handleDelete).toHaveBeenCalledWith(mockEntries[1]._id);
    });

    it('should render correctly with all props provided', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <EntryList
          entries={mockEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={false}
          error=""
          className="test-class"
        />
      );

      expect(screen.getByText(/march 15/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(3);
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3);
    });
  });
});
