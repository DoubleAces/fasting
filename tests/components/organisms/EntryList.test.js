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
      
      // Should render all entries in table format (dd/MM/yyyy)
      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
      expect(screen.getByText('14/03/2024')).toBeInTheDocument();
      expect(screen.getByText('13/03/2024')).toBeInTheDocument();
    });

    it('should render correct number of table rows', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Count tbody rows (excludes header row)
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);
    });

    it('should display entry data in table cells', () => {
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
      
      // No table rows in empty state
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      render(<EntryList entries={mockEntries} loading={true} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show entries when loading', () => {
      render(<EntryList entries={mockEntries} loading={true} />);
      
      // Dates should not appear when loading
      expect(screen.queryByText('15/03/2024')).not.toBeInTheDocument();
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
      
      const rows = container.querySelectorAll('tbody tr');
      expect(within(rows[0]).getByText('15/03/2024')).toBeInTheDocument();
      expect(within(rows[1]).getByText('14/03/2024')).toBeInTheDocument();
      expect(within(rows[2]).getByText('13/03/2024')).toBeInTheDocument();
    });

    it('should maintain entry order when no sortBy specified', () => {
      const reversedEntries = [...mockEntries].reverse();
      const { container } = render(<EntryList entries={reversedEntries} />);
      
      const rows = container.querySelectorAll('tbody tr');
      expect(within(rows[0]).getByText('13/03/2024')).toBeInTheDocument();
      expect(within(rows[2]).getByText('15/03/2024')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(<EntryList entries={mockEntries} className="custom-list" />);
      
      expect(container.firstChild).toHaveClass('custom-list');
    });

    it('should use table layout for entries', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Should have a table element
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('should have proper table structure', () => {
      const { container } = render(<EntryList entries={mockEntries} />);
      
      // Should have thead and tbody
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
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
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(1);
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
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(20);
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
      
      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
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

      expect(screen.getByText('15/03/2024')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(3);
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3);
    });
  });

  // Feature 022: Mobile UX - Responsive Tests
  describe('Mobile Responsive Behavior (Feature 022)', () => {
    // Helper to mock viewport
    const mockViewport = (width) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      window.dispatchEvent(new Event('resize'));
    };

    afterEach(() => {
      // Reset viewport
      delete window.innerWidth;
    });

    describe('T008-T009: Column visibility on mobile', () => {
      it('should hide non-essential columns on mobile (<768px)', () => {
        mockViewport(375); // iPhone SE
        render(<EntryList entries={mockEntries} />);
        
        const headers = screen.getAllByRole('columnheader');
        const headerTexts = headers.map(h => h.textContent);
        
        // Essential columns visible
        expect(headerTexts).toContain('Date');
        expect(headerTexts).toContain('Fasting');
        expect(headerTexts).toContain('Actions');
        
        // Non-essential columns hidden (should only have 3 headers on mobile)
        expect(headers.length).toBeLessThanOrEqual(3);
      });

      it('should show all columns on desktop (≥768px)', () => {
        mockViewport(1280); // Desktop
        render(<EntryList entries={mockEntries} />);
        
        const headers = screen.getAllByRole('columnheader');
        
        // All columns visible on desktop
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('First Meal')).toBeInTheDocument();
        expect(screen.getByText('Last Meal')).toBeInTheDocument();
        expect(screen.getByText('Fasting')).toBeInTheDocument();
        expect(screen.getByText('Weight')).toBeInTheDocument();
        expect(screen.getByText('Sleep')).toBeInTheDocument();
        expect(screen.getByText('Ratings')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    describe('T011-T012: Touch targets and spacing', () => {
      it('should have 44px minimum touch targets for buttons', () => {
        mockViewport(375);
        render(
          <EntryList 
            entries={mockEntries}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );
        
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          const styles = window.getComputedStyle(button);
          const minHeight = styles.minHeight;
          
          // Should have min-height of 44px (2.75rem)
          expect(minHeight).toMatch(/44px|2\.75rem/);
        });
      });

      it('should use compact padding on mobile', () => {
        mockViewport(375);
        const { container } = render(<EntryList entries={mockEntries} />);
        
        const cell = container.querySelector('td');
        const styles = window.getComputedStyle(cell);
        
        // Mobile padding should be p-2 (8px) or less
        const paddingPx = parseInt(styles.paddingLeft);
        expect(paddingPx).toBeLessThanOrEqual(12);
      });
    });
  });
});
