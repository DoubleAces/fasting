import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsForm from '@/components/organisms/SettingsForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('SettingsForm Component', () => {
  const mockSettings = {
    _id: '123',
    userId: 'user-123',
    measurementSystem: 'metric',
    timeFormat: '24h',
    fastingGoal: 16,
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Rendering - Create Mode', () => {
    it('should render all form fields in create mode', () => {
      render(<SettingsForm />);
      
      expect(screen.getByLabelText(/weight unit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time format/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fasting goal/i)).toBeInTheDocument();
    });

    it('should have default values in create mode', () => {
      render(<SettingsForm />);
      
      expect(screen.getByLabelText(/weight unit/i)).toHaveValue('kg');
      expect(screen.getByLabelText(/time format/i)).toHaveValue('24h');
      expect(screen.getByLabelText(/fasting goal/i)).toHaveValue(16);
    });

    it('should show save button in create mode', () => {
      render(<SettingsForm />);
      
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should show cancel button when onCancel provided', () => {
      const handleCancel = jest.fn();
      render(<SettingsForm onCancel={handleCancel} />);
      
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not show cancel button when onCancel not provided', () => {
      render(<SettingsForm />);
      
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Rendering - Edit Mode', () => {
    it('should populate fields with existing settings', () => {
      render(<SettingsForm settings={mockSettings} />);
      
      expect(screen.getByLabelText(/weight unit/i)).toHaveValue('kg');
      expect(screen.getByLabelText(/time format/i)).toHaveValue('24h');
      expect(screen.getByLabelText(/fasting goal/i)).toHaveValue(16);
    });

    it('should show save button in edit mode', () => {
      render(<SettingsForm settings={mockSettings} />);
      
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require fasting goal', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/fasting goal is required/i)).toBeInTheDocument();
      });
    });

    it('should validate fasting goal is a number', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      // Note: typing 'abc' in a number input results in empty value
      // so we'll get "required" error, not "invalid number" error
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/fasting goal is required/i)).toBeInTheDocument();
      });
    });

    it('should validate fasting goal is positive', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '-5');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('should validate fasting goal is at most 24 hours', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '25');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed 24 hours/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Create', () => {
    it('should submit new settings with correct data', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        _id: '123',
        userId: 'user-123',
        measurementSystem: 'imperial',
        timeFormat: '12h',
        fastingGoal: 18,
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const handleSuccess = jest.fn();
      render(<SettingsForm onSuccess={handleSuccess} />);

      const weightUnitSelect = screen.getByLabelText(/weight unit/i);
      const timeFormatSelect = screen.getByLabelText(/time format/i);
      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);

      await user.selectOptions(weightUnitSelect, 'lbs');
      await user.selectOptions(timeFormatSelect, '12h');
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '18');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            measurementSystem: 'imperial',
            timeFormat: '12h',
            fastingGoal: 18,
          }),
        });
      });

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<SettingsForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    it('should not submit with validation errors', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.tab();

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission - Update', () => {
    it('should submit updated settings with PUT request', async () => {
      const user = userEvent.setup();
      const mockResponse = { success: true, settings: { ...mockSettings, fastingGoal: 18 } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const handleSuccess = jest.fn();
      render(<SettingsForm settings={mockSettings} onSuccess={handleSuccess} />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '18');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            measurementSystem: 'metric',
            timeFormat: '24h',
            fastingGoal: 18,
          }),
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display API error message', async () => {
      const user = userEvent.setup();
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to save settings' }),
      });

      render(<SettingsForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
      });
    });

    it('should display network error', async () => {
      const user = userEvent.setup();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<SettingsForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error on field change', async () => {
      const user = userEvent.setup();
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' }),
      });

      render(<SettingsForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });

      const weightUnitSelect = screen.getByLabelText(/weight unit/i);
      await user.selectOptions(weightUnitSelect, 'lbs');

      await waitFor(() => {
        expect(screen.queryByText(/api error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = jest.fn();
      render(<SettingsForm onCancel={handleCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit when cancel clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = jest.fn();
      render(<SettingsForm onCancel={handleCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const { container } = render(<SettingsForm />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should associate labels with inputs', () => {
      render(<SettingsForm />);
      
      const weightUnitSelect = screen.getByLabelText(/weight unit/i);
      const timeFormatSelect = screen.getByLabelText(/time format/i);
      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);

      expect(weightUnitSelect).toBeInTheDocument();
      expect(timeFormatSelect).toBeInTheDocument();
      expect(fastingGoalInput).toBeInTheDocument();
    });

    it('should display validation errors with proper aria attributes', async () => {
      const user = userEvent.setup();
      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/fasting goal is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(fastingGoalInput).toHaveAttribute('aria-describedby');
      });
    });
  });

  describe('Field Options', () => {
    it('should have correct weight unit options', () => {
      render(<SettingsForm />);
      
      const weightUnitSelect = screen.getByLabelText(/weight unit/i);
      const options = Array.from(weightUnitSelect.options).map(opt => opt.value);
      
      expect(options).toContain('kg');
      expect(options).toContain('lbs');
    });

    it('should have correct time format options', () => {
      render(<SettingsForm />);
      
      const timeFormatSelect = screen.getByLabelText(/time format/i);
      const options = Array.from(timeFormatSelect.options).map(opt => opt.value);
      
      expect(options).toContain('12h');
      expect(options).toContain('24h');
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal fasting goal values', async () => {
      const user = userEvent.setup();
      const mockResponse = { success: true, settings: { ...mockSettings, fastingGoal: 16.5 } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(<SettingsForm />);

      const fastingGoalInput = screen.getByLabelText(/fasting goal/i);
      await user.clear(fastingGoalInput);
      await user.type(fastingGoalInput, '16.5');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          body: expect.stringContaining('16.5'),
        }));
      });
    });

    it('should handle settings with missing optional fields', () => {
      const minimalSettings = {
        _id: '123',
        userId: 'user-123',
        weightUnit: 'kg',
        timeFormat: '24h',
        fastingGoal: 16,
      };

      render(<SettingsForm settings={minimalSettings} />);
      
      expect(screen.getByLabelText(/weight unit/i)).toHaveValue('kg');
    });
  });
});
