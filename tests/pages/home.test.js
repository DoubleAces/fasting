import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Initial Render', () => {
    it('should render page title', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      expect(screen.getByText(/fasting tracker/i)).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<HomePage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should fetch recent entries on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries?limit=5');
      });
    });
  });

  describe('Entry Display', () => {
    const mockEntries = [
      {
        _id: '1',
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingHours: 16,
        eatingWindow: 8,
      },
      {
        _id: '2',
        date: '2024-03-14',
        firstMealTime: '13:00',
        lastMealTime: '21:00',
        fastingHours: 16,
        eatingWindow: 8,
      },
    ];

    it('should display recent entries', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/march 15, 2024/i)).toBeInTheDocument();
        expect(screen.getByText(/march 14, 2024/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no entries', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
      });
    });

    it('should display entry cards', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      const { container } = render(<HomePage />);

      await waitFor(() => {
        const articles = container.querySelectorAll('article');
        expect(articles.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Add Entry Button', () => {
    it('should show add entry button', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add.*entry/i })).toBeInTheDocument();
      });
    });

    it('should show entry form when add button clicked', async () => {
      const user = userEvent.setup();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add.*entry/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add.*entry/i });
      await user.click(addButton);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first meal time/i)).toBeInTheDocument();
    });
  });

  describe('Entry Actions', () => {
    const mockEntries = [
      {
        _id: '1',
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingHours: 16,
        eatingWindow: 8,
      },
    ];

    it('should show edit buttons on entries', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should show delete buttons on entries', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('should show entry form when edit clicked', async () => {
      const user = userEvent.setup();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Form should be populated with entry data
      await waitFor(() => {
        expect(screen.getByLabelText(/date/i)).toHaveValue('2024-03-15');
      });
    });

    it('should delete entry when delete clicked', async () => {
      const user = userEvent.setup();
      
      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });

      // Mock delete API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock refresh fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries/1', expect.objectContaining({
          method: 'DELETE',
        }));
      });
    });
  });

  describe('Form Submission', () => {
    it('should create new entry and refresh list', async () => {
      const user = userEvent.setup();
      
      // Initial fetch - empty list
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add.*entry/i })).toBeInTheDocument();
      });

      // Open form
      const addButton = screen.getByRole('button', { name: /add.*entry/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      // Mock create API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          entry: {
            _id: '1',
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            fastingHours: 16,
            eatingWindow: 8,
          }
        }),
      });

      // Mock refresh fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          entries: [{
            _id: '1',
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            fastingHours: 16,
            eatingWindow: 8,
          }]
        }),
      });

      const saveButton = screen.getByRole('button', { name: /save.*entry/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries', expect.objectContaining({
          method: 'POST',
        }));
      });

      // Form should close and list should refresh
      await waitFor(() => {
        expect(screen.queryByLabelText(/date/i)).not.toBeInTheDocument();
      });
    });

    it('should cancel form without saving', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add.*entry/i })).toBeInTheDocument();
      });

      // Open form
      const addButton = screen.getByRole('button', { name: /add.*entry/i });
      await user.click(addButton);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Form should close
      await waitFor(() => {
        expect(screen.queryByLabelText(/date/i)).not.toBeInTheDocument();
      });

      // Should not have called create API
      expect(fetch).toHaveBeenCalledTimes(1); // Only initial fetch
    });
  });

  describe('Error Handling', () => {
    it('should display error when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display error when API returns error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database connection failed' }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/database connection failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render main container', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });

      const { container } = render(<HomePage />);

      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });
  });
});
