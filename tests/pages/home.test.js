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

// Mock settings response
const mockSettings = {
  measurementSystem: 'metric',
  timeFormat: '24h',
  fastingGoal: 16
};

// Helper to fill DateInput component
const fillDateInput = async (user, dateString) => {
  const [year, month, day] = dateString.split('-');
  await user.type(screen.getByLabelText(/^day$/i), day);
  await user.type(screen.getByLabelText(/^month$/i), month);
  await user.type(screen.getByLabelText(/^year$/i), year);
  await user.tab(); // Trigger validation
};

// Helper to fill TimeInput component
const fillTimeInput = async (user, label, timeString) => {
  const [hours, minutes] = timeString.split(':');
  const timeLabel = screen.getByText(new RegExp(label, 'i'));
  const container = timeLabel.closest('.flex.flex-col');
  const hourSelect = container.querySelector('select[aria-label="Hour"]');
  const minuteSelect = container.querySelector('select[aria-label="Minute"]');
  await user.selectOptions(hourSelect, hours);
  await user.selectOptions(minuteSelect, minutes);
  await user.tab();
};

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
        fastingDuration: 960, // 16 hours in minutes
        eatingWindow: 480,    // 8 hours in minutes
      },
      {
        _id: '2',
        date: '2024-03-14',
        firstMealTime: '13:00',
        lastMealTime: '21:00',
        fastingDuration: 960, // 16 hours in minutes
        eatingWindow: 480,    // 8 hours in minutes
      },
    ];

    it('should display recent entries', async () => {
      // Mock entries fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });
      // Mock settings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          measurementSystem: 'metric',
          timeFormat: '24h',
          fastingGoal: 16
        }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('15/03/2024')).toBeInTheDocument();
        expect(screen.getByText('14/03/2024')).toBeInTheDocument();
      });
    });

    it('should show empty state when no entries', async () => {
      // Mock entries fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });
      // Mock settings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          measurementSystem: 'metric',
          timeFormat: '24h',
          fastingGoal: 16
        }),
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/no entries found/i)).toBeInTheDocument();
      });
    });

    it('should display entry cards', async () => {
      // Mock entries fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });
      // Mock settings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          measurementSystem: 'metric',
          timeFormat: '24h',
          fastingGoal: 16
        }),
      });

      const { container } = render(<HomePage />);

      await waitFor(() => {
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Add Entry Button', () => {
    it('should show add entry button', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
        fastingDuration: 960, // 16 hours in minutes
        eatingWindow: 480,    // 8 hours in minutes
      },
    ];

    it('should show edit buttons on entries', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Form should be populated with entry data
      await waitFor(() => {
        expect(screen.getByLabelText(/^day$/i)).toHaveValue('15');
        expect(screen.getByLabelText(/^month$/i)).toHaveValue('03');
        expect(screen.getByLabelText(/^year$/i)).toHaveValue('2024');
      });
    });

    it('should delete entry when delete clicked', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm
      global.confirm = jest.fn(() => true);
      
      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: mockEntries }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add.*entry/i })).toBeInTheDocument();
      });

      // Open form
      const addButton = screen.getByRole('button', { name: /add.*entry/i });
      await user.click(addButton);

      // Fill form
      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      // Mock create API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          entry: {
            _id: '1',
            date: '2024-03-15',
            firstMealTime: '12:00',
            lastMealTime: '20:00',
            fastingDuration: 960,
            eatingWindow: 480,
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
            fastingDuration: 960,
            eatingWindow: 480,
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
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
      expect(fetch).toHaveBeenCalledTimes(2); // Initial entries fetch + settings fetch
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
      // Mock entries fetch failure
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database connection failed' }),
      });
      // Mock settings fetch (will also fail or succeed - doesn't matter since entries failed first)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
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
