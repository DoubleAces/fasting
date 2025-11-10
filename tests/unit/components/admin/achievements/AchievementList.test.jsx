/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AchievementList from '@/components/admin/achievements/AchievementList';

describe('AchievementList Component', () => {
  const mockAchievements = [
    {
      achievementId: 'first-fast',
      translations: {
        en: {
          name: 'First Fast',
          description: 'Complete your first fast'
        }
      },
      category: 'Milestones',
      tier: 'bronze',
      isActive: true,
      unlockCount: 150
    },
    {
      achievementId: 'week-warrior',
      translations: {
        en: {
          name: 'Week Warrior',
          description: 'Fast for 7 days'
        }
      },
      category: 'Duration',
      tier: 'silver',
      isActive: false,
      unlockCount: 45
    }
  ];

  const mockPagination = {
    currentPage: 1,
    totalPages: 5,
    totalCount: 81,
    pageSize: 20
  };

  const defaultProps = {
    achievements: mockAchievements,
    pagination: mockPagination,
    onToggleActive: jest.fn(),
    onEdit: jest.fn(),
    onPageChange: jest.fn(),
    selectedIds: [],
    onSelectionChange: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render achievement list with correct data', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText('First Fast')).toBeInTheDocument();
      expect(screen.getByText('Week Warrior')).toBeInTheDocument();
      expect(screen.getByText('Milestones')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('should display tier badges correctly', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText('Bronze')).toBeInTheDocument();
      expect(screen.getByText('Silver')).toBeInTheDocument();
    });

    it('should display unlock counts', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should show active status badge for active achievements', () => {
      render(<AchievementList {...defaultProps} />);

      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('should show inactive status badge for inactive achievements', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render loading state when loading prop is true', () => {
      render(<AchievementList {...defaultProps} loading={true} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render empty state when no achievements', () => {
      render(<AchievementList {...defaultProps} achievements={[]} />);

      expect(screen.getByText(/no achievements found/i)).toBeInTheDocument();
    });
  });

  describe('Bulk Selection', () => {
    it('should render checkboxes for each achievement', () => {
      render(<AchievementList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // +1 for "Select All" checkbox
      expect(checkboxes).toHaveLength(mockAchievements.length + 1);
    });

    it('should call onSelectionChange when checkbox is clicked', () => {
      render(<AchievementList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First achievement checkbox

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith(['first-fast']);
    });

    it('should show selected state for selected achievements', () => {
      const props = {
        ...defaultProps,
        selectedIds: ['first-fast']
      };
      render(<AchievementList {...props} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeChecked();
    });

    it('should select all when select all checkbox is clicked', () => {
      render(<AchievementList {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([
        'first-fast',
        'week-warrior'
      ]);
    });

    it('should deselect all when select all checkbox is clicked again', () => {
      const props = {
        ...defaultProps,
        selectedIds: ['first-fast', 'week-warrior']
      };
      render(<AchievementList {...props} />);

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Actions', () => {
    it('should call onToggleActive when toggle switch is clicked', () => {
      render(<AchievementList {...defaultProps} />);

      const toggleButtons = screen.getAllByRole('switch');
      fireEvent.click(toggleButtons[0]);

      expect(defaultProps.onToggleActive).toHaveBeenCalledWith('first-fast', false);
    });

    it('should call onEdit when edit button is clicked', () => {
      render(<AchievementList {...defaultProps} />);

      const editButtons = screen.getAllByText(/edit/i);
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEdit).toHaveBeenCalledWith('first-fast');
    });
  });

  describe('Pagination', () => {
    it('should display pagination information', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText(/81/)).toBeInTheDocument();
    });

    it('should call onPageChange when next button is clicked', () => {
      render(<AchievementList {...defaultProps} />);

      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when previous button is clicked', () => {
      const props = {
        ...defaultProps,
        pagination: {
          ...mockPagination,
          currentPage: 2
        }
      };
      render(<AchievementList {...props} />);

      const prevButton = screen.getByText(/previous/i);
      fireEvent.click(prevButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable previous button on first page', () => {
      render(<AchievementList {...defaultProps} />);

      const prevButton = screen.getByText(/previous/i);
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const props = {
        ...defaultProps,
        pagination: {
          ...mockPagination,
          currentPage: 5,
          totalPages: 5
        }
      };
      render(<AchievementList {...props} />);

      const nextButton = screen.getByText(/next/i);
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Sorting', () => {
    it('should render sortable column headers', () => {
      render(<AchievementList {...defaultProps} />);

      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByText(/tier/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();
    });

    it('should call onSort when column header is clicked', () => {
      const onSort = jest.fn();
      render(<AchievementList {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText(/name/i);
      fireEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for checkboxes', () => {
      render(<AchievementList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-label');
      });
    });

    it('should have proper ARIA labels for action buttons', () => {
      render(<AchievementList {...defaultProps} />);

      const editButtons = screen.getAllByText(/edit/i);
      editButtons.forEach((button) => {
        expect(button.closest('button')).toHaveAttribute('aria-label');
      });
    });

    it('should support keyboard navigation', () => {
      render(<AchievementList {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes[1].focus();
      expect(document.activeElement).toBe(checkboxes[1]);
    });
  });
});
