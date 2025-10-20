import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/settings/page';

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

describe('SettingsPage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Initial Render', () => {
    it('should render page title', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<SettingsPage />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should fetch settings on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings');
      });
    });
  });

  describe('Settings Display', () => {
    const mockSettings = {
      _id: '123',
      userId: 'user-123',
      weightUnit: 'kg',
      timeFormat: '24h',
      fastingGoal: 16,
    };

    it('should display settings form with existing data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: mockSettings }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/weight unit/i)).toHaveValue('kg');
        expect(screen.getByLabelText(/time format/i)).toHaveValue('24h');
        expect(screen.getByLabelText(/fasting goal/i)).toHaveValue(16);
      });
    });

    it('should display form with default values when no settings exist', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/weight unit/i)).toHaveValue('kg');
        expect(screen.getByLabelText(/time format/i)).toHaveValue('24h');
        expect(screen.getByLabelText(/fasting goal/i)).toHaveValue(16);
      });
    });
  });

  describe('Form Submission - Create', () => {
    it('should create new settings', async () => {
      const user = userEvent.setup();
      
      // Initial fetch - no settings
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/weight unit/i)).toBeInTheDocument();
      });

      // Change some values
      const weightUnitSelect = screen.getByLabelText(/weight unit/i);
      await user.selectOptions(weightUnitSelect, 'lbs');

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '18');

      // Mock create API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: {
            _id: '123',
            userId: 'user-123',
            weightUnit: 'lbs',
            timeFormat: '24h',
            fastingGoal: 18,
          }
        }),
      });

      // Mock refresh fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: {
            _id: '123',
            userId: 'user-123',
            weightUnit: 'lbs',
            timeFormat: '24h',
            fastingGoal: 18,
          }
        }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings', expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('imperial'),
        }));
      });
    });

    it('should show success message after save', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/weight unit/i)).toBeInTheDocument();
      });

      // Mock successful save
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: {
            _id: '123',
            weightUnit: 'kg',
            timeFormat: '24h',
            fastingGoal: 16,
          }
        }),
      });

      // Mock refresh
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: {
            _id: '123',
            weightUnit: 'kg',
            timeFormat: '24h',
            fastingGoal: 16,
          }
        }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Update', () => {
    const mockSettings = {
      _id: '123',
      userId: 'user-123',
      weightUnit: 'kg',
      timeFormat: '24h',
      fastingGoal: 16,
    };

    it('should update existing settings', async () => {
      const user = userEvent.setup();
      
      // Initial fetch with existing settings
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: mockSettings }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/fasting goal/i)).toHaveValue(16);
      });

      // Change fasting goal
      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '18');

      // Mock update API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: { ...mockSettings, fastingGoal: 18 }
        }),
      });

      // Mock refresh
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          settings: { ...mockSettings, fastingGoal: 18 }
        }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings', expect.objectContaining({
          method: 'PUT',
        }));
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when initial fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display error when API returns error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database error' }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument();
      });
    });

    it('should display error when save fails', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Mock failed save
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to save' }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });
    });

    it('should clear success message on new save attempt', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // First save - success
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: { _id: '123', weightUnit: 'kg', timeFormat: '24h', fastingGoal: 16 } }),
      });
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: { _id: '123', weightUnit: 'kg', timeFormat: '24h', fastingGoal: 16 } }),
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
      });

      // Make a change
      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '18');

      // Success message should be cleared when user starts typing
      await waitFor(() => {
        expect(screen.queryByText(/settings saved successfully/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Page Layout', () => {
    it('should render main container', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      const { container } = render(<SettingsPage />);

      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });

    it('should render description text', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByText(/configure your preferences/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should not submit with invalid data', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ settings: null }),
      });

      render(<SettingsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/fasting goal/i)).toBeInTheDocument();
      });

      // Clear fasting goal (required field)
      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.tab();

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should show validation error and not call API
      await waitFor(() => {
        expect(screen.getByText(/fasting goal is required/i)).toBeInTheDocument();
      });

      // Should only have been called once (initial fetch)
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
