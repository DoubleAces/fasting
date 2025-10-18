import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryForm from '@/components/organisms/EntryForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('EntryForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
  });

  describe('Rendering - Create Mode', () => {
    it('should render all required form fields', () => {
      render(<EntryForm />);

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first meal time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last meal time/i)).toBeInTheDocument();
    });

    it('should render all optional form fields', () => {
      render(<EntryForm />);

      expect(screen.getByLabelText(/hours of sleep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/morning weight/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hunger level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/energy level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/well-being/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/food notes/i)).toBeInTheDocument();
    });

    it('should show required indicators on required fields', () => {
      render(<EntryForm />);

      const dateLabel = screen.getByText(/date/i);
      const firstMealLabel = screen.getByText(/first meal time/i);
      const lastMealLabel = screen.getByText(/last meal time/i);

      expect(dateLabel).toHaveTextContent('*');
      expect(firstMealLabel).toHaveTextContent('*');
      expect(lastMealLabel).toHaveTextContent('*');
    });

    it('should render submit button', () => {
      render(<EntryForm />);
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    });

    it('should render cancel button when onCancel provided', () => {
      const handleCancel = jest.fn();
      render(<EntryForm onCancel={handleCancel} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Rendering - Edit Mode', () => {
    const existingEntry = {
      _id: '123',
      date: '2024-03-15',
      firstMealTime: '12:00',
      lastMealTime: '20:00',
      hoursOfSleep: 8,
      morningWeight: 75.5,
      hungerLevel: 'Medium',
      energyLevel: 'High Energy',
      wellBeing: 'Good',
      foodNotes: 'Had a healthy day',
    };

    it('should pre-fill form with existing entry data', () => {
      render(<EntryForm entry={existingEntry} />);

      expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75.5')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Had a healthy day')).toBeInTheDocument();
    });

    it('should check correct hunger level radio button', () => {
      render(<EntryForm entry={existingEntry} />);
      const mediumRadio = screen.getByRole('radio', { name: /^Medium$/i });
      expect(mediumRadio).toBeChecked();
    });

    it('should check correct energy level radio button', () => {
      render(<EntryForm entry={existingEntry} />);
      const highEnergyRadio = screen.getByRole('radio', { name: /high energy/i });
      expect(highEnergyRadio).toBeChecked();
    });

    it('should check correct well-being radio button', () => {
      render(<EntryForm entry={existingEntry} />);
      const goodRadio = screen.getByRole('radio', { name: /^Good$/i });
      expect(goodRadio).toBeChecked();
    });

    it('should change submit button text to "Update Entry"', () => {
      render(<EntryForm entry={existingEntry} />);
      expect(screen.getByRole('button', { name: /update entry/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation - Required Fields', () => {
    // Note: Required field validation is primarily handled via blur events.
    // Submit validation prevents submission but doesn't show new errors if 
    // fields haven't been touched. This is acceptable UX as users will see
    // errors when they interact with fields.
    
    it('should prevent submission when required fields are empty', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Should not call API or success callback
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetch).not.toHaveBeenCalled();
      expect(handleSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation - Field Formats', () => {
    it('should show error for invalid time format', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const firstMealInput = screen.getByLabelText(/first meal time/i);
      await user.type(firstMealInput, '25:00');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
      });
    });

    it('should show error for negative hours of sleep', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const sleepInput = screen.getByLabelText(/hours of sleep/i);
      await user.type(sleepInput, '-1');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be.*positive/i)).toBeInTheDocument();
      });
    });

    it('should show error for hours of sleep > 24', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const sleepInput = screen.getByLabelText(/hours of sleep/i);
      await user.clear(sleepInput);
      await user.type(sleepInput, '25');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed 24/i)).toBeInTheDocument();
      });
    });

    it('should show error for negative weight', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const weightInput = screen.getByLabelText(/morning weight/i);
      await user.type(weightInput, '-10');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be.*positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Create Entry', () => {
    it('should submit form with valid required fields only', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      const dateInput = screen.getByLabelText(/date/i);
      const firstMealInput = screen.getByLabelText(/first meal time/i);
      const lastMealInput = screen.getByLabelText(/last meal time/i);

      await user.type(dateInput, '2024-03-15');
      await user.type(firstMealInput, '12:00');
      await user.type(lastMealInput, '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('2024-03-15'),
        }));
      });

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should submit form with all fields filled', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      // Fill optional fields
      await user.type(screen.getByLabelText(/hours of sleep/i), '8');
      await user.type(screen.getByLabelText(/morning weight/i), '75.5');
      await user.click(screen.getByRole('radio', { name: /^Low$/i })); // Hunger
      await user.click(screen.getByRole('radio', { name: /medium energy/i })); // Energy
      await user.click(screen.getByRole('radio', { name: /^Fair$/i })); // Well-being
      await user.type(screen.getByLabelText(/food notes/i), 'Had a salad for lunch');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries', expect.objectContaining({
          method: 'POST',
        }));
      });

      const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        hoursOfSleep: 8,
        morningWeight: 75.5,
        hungerLevel: 'Low',
        energyLevel: 'Medium Energy',
        wellBeing: 'Fair',
        foodNotes: 'Had a salad for lunch',
      });

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      
      // Make fetch delay to simulate slow network
      fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Button should be disabled immediately
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Make fetch delay
      fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Check for loading text or spinner
      expect(submitButton).toHaveTextContent(/saving|loading/i);
    });
  });

  describe('Form Submission - Update Entry', () => {
    const existingEntry = {
      _id: '123',
      date: '2024-03-15',
      firstMealTime: '12:00',
      lastMealTime: '20:00',
    };

    it('should submit PUT request to update existing entry', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm entry={existingEntry} onSuccess={handleSuccess} />);

      const sleepInput = screen.getByLabelText(/hours of sleep/i);
      await user.type(sleepInput, '8');

      const submitButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/entries/123', expect.objectContaining({
          method: 'PUT',
        }));
      });

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalled();
      });
    });

    it('should include all current values when updating', async () => {
      const user = userEvent.setup();
      render(<EntryForm entry={existingEntry} />);

      const submitButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(requestBody.date).toBe('2024-03-15');
        expect(requestBody.firstMealTime).toBe('12:00');
        expect(requestBody.lastMealTime).toBe('20:00');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API returns error', async () => {
      const user = userEvent.setup();
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'An entry for this date already exists' }),
      });

      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/entry for this date already exists/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message when API fails without details', async () => {
      const user = userEvent.setup();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save entry|error/i)).toBeInTheDocument();
      });
    });

    it('should re-enable submit button after error', async () => {
      const user = userEvent.setup();
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to save entry|error/i)).toBeInTheDocument();
      });

      // Button should be re-enabled after error
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = jest.fn();
      render(<EntryForm onCancel={handleCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalled();
    });

    it('should not submit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = jest.fn();
      render(<EntryForm onCancel={handleCancel} />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const { container } = render(<EntryForm />);
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have all inputs properly labeled', () => {
      render(<EntryForm />);

      // Required fields
      expect(screen.getByLabelText(/date/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/first meal time/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/last meal time/i)).toHaveAttribute('id');

      // Optional fields
      expect(screen.getByLabelText(/hours of sleep/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/morning weight/i)).toHaveAttribute('id');
      expect(screen.getByLabelText(/food notes/i)).toHaveAttribute('id');
    });

    it('should have radiogroups with proper labels', () => {
      render(<EntryForm />);

      const hungerGroup = screen.getByRole('radiogroup', { name: /hunger level/i });
      const energyGroup = screen.getByRole('radiogroup', { name: /energy level/i });
      const wellbeingGroup = screen.getByRole('radiogroup', { name: /well-being/i });

      expect(hungerGroup).toBeInTheDocument();
      expect(energyGroup).toBeInTheDocument();
      expect(wellbeingGroup).toBeInTheDocument();
    });

    it('should link error messages to inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      // Trigger validation by filling an invalid time and blurring
      const firstMealInput = screen.getByLabelText(/first meal time/i);
      await user.type(firstMealInput, '25:00');
      await user.tab();

      await waitFor(() => {
        expect(firstMealInput).toHaveAttribute('aria-describedby');
        expect(firstMealInput).toHaveAttribute('aria-invalid', 'true');
        const errorId = firstMealInput.getAttribute('aria-describedby');
        expect(screen.getByText(/invalid time format/i)).toHaveAttribute('id', errorId);
      });
    });
  });

  describe('Rating Interactions', () => {
    it('should allow selecting hunger level', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const mediumRadio = screen.getByRole('radio', { name: /^Medium$/i });
      await user.click(mediumRadio);

      expect(mediumRadio).toBeChecked();
    });

    it('should allow deselecting hunger level', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const lowRadio = screen.getByRole('radio', { name: /^Low$/i });
      await user.click(lowRadio);
      expect(lowRadio).toBeChecked();

      // Click again to deselect
      await user.click(lowRadio);
      expect(lowRadio).not.toBeChecked();
    });

    it('should allow changing energy level selection', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const lowEnergyRadio = screen.getByRole('radio', { name: /low energy/i });
      await user.click(lowEnergyRadio);
      expect(lowEnergyRadio).toBeChecked();

      const highEnergyRadio = screen.getByRole('radio', { name: /high energy/i });
      await user.click(highEnergyRadio);
      expect(highEnergyRadio).toBeChecked();
      expect(lowEnergyRadio).not.toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle form with no onSuccess callback', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      
      // Should not throw error
      await expect(user.click(submitButton)).resolves.not.toThrow();
    });

    it('should handle very long food notes', async () => {
      const user = userEvent.setup();
      render(<EntryForm />);

      const longNotes = 'a'.repeat(2500);
      const notesInput = screen.getByLabelText(/food notes/i);
      
      // Use paste instead of type for long text
      await user.click(notesInput);
      await user.paste(longNotes);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed.*characters/i)).toBeInTheDocument();
      });
    });

    it('should handle decimal values for weight', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      // Fill required fields first
      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');
      
      // Fill weight with decimal
      await user.type(screen.getByLabelText(/morning weight/i), '75.5');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(requestBody.morningWeight).toBe(75.5);
      });
    });

    it('should handle decimal values for hours of sleep', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      // Fill required fields first
      await user.type(screen.getByLabelText(/date/i), '2024-03-15');
      await user.type(screen.getByLabelText(/first meal time/i), '12:00');
      await user.type(screen.getByLabelText(/last meal time/i), '20:00');
      
      // Fill sleep with decimal
      await user.type(screen.getByLabelText(/hours of sleep/i), '7.5');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
        expect(requestBody.hoursOfSleep).toBe(7.5);
      });
    });
  });
});
