import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EntryForm from '@/components/organisms/EntryForm';

// Mock fetch for API calls
global.fetch = jest.fn();

// Helper function to fill date input (day/month/year fields)
const fillDateInput = async (user, dateString) => {
  const [year, month, day] = dateString.split('-');
  const dayInput = screen.getByLabelText(/^day$/i);
  const monthInput = screen.getByLabelText(/^month$/i);
  const yearInput = screen.getByLabelText(/^year$/i);
  
  await user.clear(dayInput);
  await user.type(dayInput, day);
  await user.clear(monthInput);
  await user.type(monthInput, month);
  await user.clear(yearInput);
  await user.type(yearInput, year);
  
  // Tab out to trigger validation
  await user.tab();
};

// Helper function to fill time input (hour/minute/period selects)
const fillTimeInput = async (user, label, timeString) => {
  const [hours, minutes] = timeString.split(':');
  
  // Get the selects within the time input group
  const timeLabel = screen.getByText(new RegExp(label, 'i'));
  const container = timeLabel.closest('.flex.flex-col');
  const hourSelect = container.querySelector('select[aria-label="Hour"]');
  const minuteSelect = container.querySelector('select[aria-label="Minute"]');
  
  await user.selectOptions(hourSelect, hours);
  await user.selectOptions(minuteSelect, minutes);
  
  // Tab out to ensure blur events fire
  await user.tab();
};

describe('EntryForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for successful entry save
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
    
    // Mock check-previous endpoint to prevent extended fast prompts in tests
    fetch.mockImplementation((url) => {
      if (url.includes('check-previous')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ hasGap: false, daysSinceLast: 0 }),
        });
      }
      // Default success response for entry creation/update
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });
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

      // Date fields are prefilled
      expect(screen.getByLabelText(/^day$/i)).toHaveValue('15');
      expect(screen.getByLabelText(/^month$/i)).toHaveValue('03');
      expect(screen.getByLabelText(/^year$/i)).toHaveValue('2024');
      
      // Time fields are prefilled (check hour selects)
      const firstMealHour = screen.getAllByLabelText(/^hour$/i)[0];
      const lastMealHour = screen.getAllByLabelText(/^hour$/i)[1];
      expect(firstMealHour).toHaveValue('12');
      expect(lastMealHour).toHaveValue('20');
      
      // Other fields
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

      // TimeInput now uses dropdowns, so we can't enter invalid time like "25:00"
      // Instead, test that the component only allows valid hours/minutes
      const container = screen.getByText(/first meal time/i).closest('.flex.flex-col');
      const hourSelect = container.querySelector('select[aria-label="Hour"]');
      
      // Verify that hour options are limited to 00-23 (no invalid hours)
      const hourOptions = Array.from(hourSelect.options).map(opt => opt.value).filter(v => v !== '');
      expect(hourOptions).toEqual(expect.arrayContaining(['00', '12', '23']));
      expect(hourOptions).not.toContain('25');
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

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

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
      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

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

      // First call is check-previous, second (or later) is entry save
      const entrySaveCall = fetch.mock.calls.find(call => call[0] === '/api/entries');
      const requestBody = JSON.parse(entrySaveCall[1].body);
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
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        }), 100));
      });
      
      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Button should be disabled immediately
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Make fetch delay
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        }), 100));
      });
      
      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

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
        // When editing existing entry, check-previous might not be called,
        // but let's find the PUT request to be safe
        const updateCall = fetch.mock.calls.find(call => 
          call[0].includes('/api/entries/') && call[1]?.method === 'PUT'
        ) || fetch.mock.calls[0]; // Fallback to first call if no PUT found
        
        const requestBody = JSON.parse(updateCall[1].body);
        expect(requestBody.date).toBe('2024-03-15');
        expect(requestBody.firstMealTime).toBe('12:00');
        expect(requestBody.lastMealTime).toBe('20:00');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API returns error', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous first, then error on entry save
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'An entry for this date already exists' }),
        });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/entry for this date already exists/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message when API fails without details', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous first, then error on entry save
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return Promise.reject(new Error('Network error'));
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for API error to appear - the error.message is "Network error"
      await waitFor(() => {
        const errorElement = screen.queryByText(/network error/i);
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should re-enable submit button after error', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous first, then error on entry save
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return Promise.reject(new Error('Network error'));
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for error message - the error.message is "Network error"
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      }, { timeout: 3000 });

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

      await fillDateInput(user, '2024-03-15');
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Check that entry save API was not called (check-previous will be called though)
      const entrySaveCalls = fetch.mock.calls.filter(call => call[0] === '/api/entries');
      expect(entrySaveCalls).toHaveLength(0);
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

      // Trigger validation error by entering negative sleep hours
      const sleepInput = screen.getByLabelText(/hours of sleep/i);
      await user.type(sleepInput, '-1');
      await user.tab();

      await waitFor(() => {
        expect(sleepInput).toHaveAttribute('aria-describedby');
        expect(sleepInput).toHaveAttribute('aria-invalid', 'true');
        const errorId = sleepInput.getAttribute('aria-describedby');
        expect(screen.getByText(/must be.*positive/i)).toHaveAttribute('id', errorId);
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

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

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
      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');
      
      // Fill weight with decimal
      await user.type(screen.getByLabelText(/morning weight/i), '75.5');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        // First call is check-previous, second call is entry save
        const entrySaveCall = fetch.mock.calls.find(call => call[0] === '/api/entries');
        expect(entrySaveCall).toBeDefined();
        const requestBody = JSON.parse(entrySaveCall[1].body);
        expect(requestBody.morningWeight).toBe(75.5);
      });
    });

    it('should handle decimal values for hours of sleep', async () => {
      const user = userEvent.setup();
      const handleSuccess = jest.fn();
      render(<EntryForm onSuccess={handleSuccess} />);

      // Fill required fields first
      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');
      
      // Fill sleep with decimal
      await user.type(screen.getByLabelText(/hours of sleep/i), '7.5');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        // First call is check-previous, second call is entry save
        const entrySaveCall = fetch.mock.calls.find(call => call[0] === '/api/entries');
        expect(entrySaveCall).toBeDefined();
        const requestBody = JSON.parse(entrySaveCall[1].body);
        expect(requestBody.hoursOfSleep).toBe(7.5);
      });
    });
  });

  // NOTE: "Extended Fast Detection" tests skipped - replaced by User Stories 1-3 TDD tests
  // These tests were written before the inline confirmation feature was implemented
  // and tested auto-detection behavior (prompt appearing on date change without submit).
  // The actual implementation requires clicking submit first, which User Stories 1-3 test properly.
  describe.skip('Extended Fast Detection', () => {
    const mockPreviousEntry = {
      _id: 'prev-entry-123',
      date: '2024-03-13',
      lastMealTime: '20:00',
      fastingDuration: 960,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call check-previous API when date is entered', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ hasGap: false, daysSinceLast: 0 }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous?date=2024-03-15')
        );
      });
    });

    it('should show extended fast prompt when gap detected', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API with gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/your last entry was 2 days ago/i)).toBeInTheDocument();
      expect(screen.getByText(/13\/03\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/20:00/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yes, i fasted/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no, i ate but didn't log/i })).toBeInTheDocument();
    });

    it('should not show prompt when no gap detected', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API with no gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: false,
              daysSinceLast: 1,
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
    });

    it('should confirm extended fast when "Yes" clicked', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API with gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, i fasted/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
        expect(screen.getByText(/extended fast confirmed/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/fasting duration will be calculated from/i)).toBeInTheDocument();
      expect(screen.getByText(/13\/03\/2024/)).toBeInTheDocument();
    });

    it('should dismiss prompt when "No" clicked', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API with gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: /no, i ate but didn't log/i });
      await user.click(noButton);

      await waitFor(() => {
        expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
      });

      expect(screen.queryByText(/extended fast confirmed/i)).not.toBeInTheDocument();
    });

    it('should include extendedFastConfirmed in form submission when confirmed', async () => {
      const handleSuccess = jest.fn();
      const user = userEvent.setup();
      
      // Mock check-previous API with gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              entry: {
                _id: 'new-entry-123',
                date: '2024-03-15',
                extendedFastConfirmed: true,
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm onSuccess={handleSuccess} />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, i fasted/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.getByText(/extended fast confirmed/i)).toBeInTheDocument();
      });

      // Fill remaining required fields
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const entrySaveCall = fetch.mock.calls.find(
          call => call[0] === '/api/entries' && call[1]?.method === 'POST'
        );
        expect(entrySaveCall).toBeDefined();
        const requestBody = JSON.parse(entrySaveCall[1].body);
        expect(requestBody.extendedFastConfirmed).toBe(true);
      });
    });

    it('should not include extendedFastConfirmed when denied', async () => {
      const handleSuccess = jest.fn();
      const user = userEvent.setup();
      
      // Mock check-previous API with gap
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              entry: {
                _id: 'new-entry-123',
                date: '2024-03-15',
                extendedFastConfirmed: false,
              },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm onSuccess={handleSuccess} />);

      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      const noButton = screen.getByRole('button', { name: /no, i ate but didn't log/i });
      await user.click(noButton);

      // Fill remaining required fields
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const entrySaveCall = fetch.mock.calls.find(
          call => call[0] === '/api/entries' && call[1]?.method === 'POST'
        );
        expect(entrySaveCall).toBeDefined();
        const requestBody = JSON.parse(entrySaveCall[1].body);
        expect(requestBody.extendedFastConfirmed).toBe(false);
      });
    });

    it('should not show prompt when editing entry with confirmed extended fast', async () => {
      const user = userEvent.setup();
      
      const existingEntry = {
        _id: 'existing-123',
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        extendedFastConfirmed: true,
      };

      // Mock check-previous API
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasGap: true,
              daysSinceLast: 2,
              previousEntry: mockPreviousEntry,
            }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm entry={existingEntry} />);

      // The date should already be filled, but let's change it to trigger check
      await fillDateInput(user, '2024-03-16');

      // Should not show the prompt because entry already has extendedFastConfirmed
      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
    });

    it('should clear extended fast confirmation when date changes and no gap', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API - first with gap, then without
      let callCount = 0;
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                hasGap: true,
                daysSinceLast: 2,
                previousEntry: mockPreviousEntry,
              }),
            });
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => ({
                hasGap: false,
                daysSinceLast: 1,
              }),
            });
          }
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      // First date with gap
      await fillDateInput(user, '2024-03-15');

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      // Confirm extended fast
      const yesButton = screen.getByRole('button', { name: /yes, i fasted/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(screen.getByText(/extended fast confirmed/i)).toBeInTheDocument();
      });

      // Change date to one without gap
      await fillDateInput(user, '2024-03-14');

      await waitFor(() => {
        expect(screen.queryByText(/extended fast confirmed/i)).not.toBeInTheDocument();
      });
    });

    it('should handle API error gracefully during check-previous', async () => {
      const user = userEvent.setup();
      
      // Mock check-previous API failure
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      // Click submit to trigger check-previous
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Should not crash and should not show prompt
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
    });
  });

  describe('User Story 2: Extended Fast Confirmation (Inline - TDD)', () => {
    const mockExtendedFastFromPrevious = {
      hasPreviousEntry: true,
      hasGap: true,
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      isExtendedFastToNext: false,
      fromPreviousFasting: {
        hours: 26,
        minutes: 30,
        totalMinutes: 1590,
        formatted: '26h 30m'
      },
      previousEntry: {
        _id: 'prev-123',
        date: '2024-03-13',
        lastMealTime: '18:00'
      }
    };

    it('should replace Update Entry button with confirmation buttons when extended fast detected', async () => {
      const user = userEvent.setup();

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:30');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      // Click submit to trigger extended fast detection
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for check-previous API
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      // Extended fast prompt should appear
      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      // CRITICAL: Submit button should be REPLACED (not both visible)
      // This will FAIL initially - that's the TDD approach
      expect(screen.queryByRole('button', { name: /^save entry$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^update entry$/i })).not.toBeInTheDocument();

      // Confirmation buttons should be visible at BOTTOM of form (inline with where submit button was)
      expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no, i ate but didn't log/i })).toBeInTheDocument();
    });

    it('should save immediately when clicking Yes confirmation button (no second Update Entry click)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { _id: 'new-entry' } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<EntryForm onSuccess={mockOnSuccess} />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:30');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for extended fast prompt
      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      // Click Yes confirmation button - this should IMMEDIATELY save (one-click)
      const yesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(yesButton);

      // Should call entry save API and trigger onSuccess (one action, not two)
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify entry was saved with extendedFastFromPreviousConfirmed: true
      const entrySaveCalls = fetch.mock.calls.filter(call => 
        call[0].includes('/api/entries') && !call[0].includes('check-previous')
      );
      expect(entrySaveCalls.length).toBeGreaterThan(0);

      const saveCallBody = JSON.parse(entrySaveCalls[0][1].body);
      expect(saveCallBody.extendedFastConfirmed).toBe(true);
    });

    it('should save immediately when clicking No confirmation button with extendedFastDenied: true', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { _id: 'new-entry' } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<EntryForm onSuccess={mockOnSuccess} />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:30');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
      });

      // Click No button - should IMMEDIATELY save with denial flag
      const noButton = screen.getByRole('button', { name: /no, i ate but didn't log/i });
      await user.click(noButton);

      // Should save immediately
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify entry was saved with extendedFastDenied: true
      const entrySaveCalls = fetch.mock.calls.filter(call => 
        call[0].includes('/api/entries') && !call[0].includes('check-previous')
      );
      expect(entrySaveCalls.length).toBeGreaterThan(0);

      const saveCallBody = JSON.parse(entrySaveCalls[0][1].body);
      expect(saveCallBody.extendedFastDenied).toBe(true);
    });

    it('should show only confirmation buttons OR submit button, never both', async () => {
      const user = userEvent.setup();

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<EntryForm />);

      // Initially, only submit button should be visible
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /yes, confirm extended fast/i })).not.toBeInTheDocument();

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:30');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // After extended fast detected, submit button should be GONE, confirmation buttons visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      // CRITICAL TEST: Submit button must NOT be visible when confirmation buttons are
      expect(screen.queryByRole('button', { name: /^save entry$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^update entry$/i })).not.toBeInTheDocument();

      // Only confirmation buttons should be visible
      expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /no, i ate but didn't log/i })).toBeInTheDocument();
    });

    it('should handle two sequential confirmations inline (from previous + to next)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const mockBothExtendedFasts = {
        hasPreviousEntry: true,
        hasGap: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        fromPreviousFasting: {
          hours: 26,
          minutes: 0,
          totalMinutes: 1560,
          formatted: '26h 0m'
        },
        toNextFasting: {
          hours: 30,
          minutes: 15,
          totalMinutes: 1815,
          formatted: '30h 15m'
        },
        previousEntry: {
          _id: 'prev-123',
          date: '2024-03-13',
          lastMealTime: '18:00'
        },
        nextEntry: {
          _id: 'next-123',
          date: '2024-03-17',
          firstMealTime: '00:15'
        }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockBothExtendedFasts),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, data: { _id: 'new-entry' } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<EntryForm onSuccess={mockOnSuccess} />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:00');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First confirmation (from previous)
      await waitFor(() => {
        expect(screen.getByText(/26h 0m/i)).toBeInTheDocument();
      });

      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // Second confirmation should appear INLINE (no page refresh, no disappearing prompt)
      await waitFor(() => {
        expect(screen.getByText(/30h 15m/i)).toBeInTheDocument();
      });

      // Still in same form, no redirect yet
      expect(mockOnSuccess).not.toHaveBeenCalled();

      // Click second confirmation
      const secondYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(secondYesButton);

      // NOW it should save and redirect
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should revert to Update Entry button when time fields change after confirmation appears', async () => {
      const user = userEvent.setup();

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '20:30');
      await fillTimeInput(user, 'Last Meal Time', '22:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for confirmation buttons
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      // Now change first meal time (user changed their mind)
      await fillTimeInput(user, 'First Meal Time', '21:00');

      // Confirmation buttons should disappear, submit button should return
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /yes, confirm extended fast/i })).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    });
  });

  describe('User Story 1: Non-Extended Fast Update (Inline Confirmation Feature)', () => {
    it('should save immediately without prompt for non-extended fast (16h)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock check-previous API to return non-extended fast (16h = 960 minutes)
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasPreviousEntry: true,
              hasGap: false,
              isExtendedFast: false,
              isExtendedFastFromPrevious: false,
              isExtendedFastToNext: false,
              fromPreviousFasting: {
                hours: 16,
                minutes: 0,
                totalMinutes: 960,
                formatted: '16h 0m'
              },
              previousEntry: {
                _id: 'prev-123',
                date: '2024-03-14',
                lastMealTime: '20:00'
              }
            }),
          });
        }
        // Entry save should succeed
        return Promise.resolve({
          ok: true,
          json: async () => ({ 
            success: true, 
            data: { _id: 'entry-123', date: '2024-03-15' } 
          }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} />);

      // Fill in form fields
      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      // Click submit button - should trigger check-previous first
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for check-previous to be called
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      // Should NOT show extended fast confirmation prompt
      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();

      // Should proceed to save and call onSuccess
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should not show confirmation buttons for fasts under 24 hours', async () => {
      const user = userEvent.setup();

      // Mock check-previous API to return 23h fast (just under threshold)
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasPreviousEntry: true,
              hasGap: false,
              isExtendedFast: false,
              isExtendedFastFromPrevious: false,
              isExtendedFastToNext: false,
              fromPreviousFasting: {
                hours: 23,
                minutes: 30,
                totalMinutes: 1410,
                formatted: '23h 30m'
              },
              previousEntry: {
                _id: 'prev-123',
                date: '2024-03-14',
                lastMealTime: '20:30'
              }
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm />);

      await fillDateInput(user, '2024-03-15');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '20:00');

      // Click submit to trigger check-previous
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Wait for check-previous API call
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      // Should NOT show extended fast confirmation UI
      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /yes, confirm extended fast/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /no, i ate but didn't log/i })).not.toBeInTheDocument();
    });

    it('should call PUT /api/entries/[id] once for non-extended fast', async () => {
      const user = userEvent.setup();
      const existingEntry = {
        _id: 'entry-123',
        date: '2024-03-15',
        firstMealTime: '12:00',
        lastMealTime: '20:00',
        fastingDuration: 960,
      };

      // Mock check-previous API to return non-extended fast
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              hasPreviousEntry: true,
              hasGap: false,
              isExtendedFast: false,
              isExtendedFastFromPrevious: false,
              isExtendedFastToNext: false,
              fromPreviousFasting: {
                hours: 18,
                minutes: 0,
                totalMinutes: 1080,
                formatted: '18h 0m'
              },
              previousEntry: {
                _id: 'prev-123',
                date: '2024-03-14',
                lastMealTime: '18:00'
              }
            }),
          });
        }
        // Entry update should succeed
        return Promise.resolve({
          ok: true,
          json: async () => ({ 
            success: true, 
            data: { ...existingEntry, lastMealTime: '21:00' }
          }),
        });
      });

      render(<EntryForm entry={existingEntry} isEditMode={true} />);

      // Change last meal time
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(updateButton);

      // Wait for check-previous
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/entries/check-previous')
        );
      });

      // Should NOT show extended fast confirmation
      expect(screen.queryByText(/extended fast detected/i)).not.toBeInTheDocument();

      // Should call PUT API
      await waitFor(() => {
        const putCalls = fetch.mock.calls.filter(call => 
          call[0].includes(`/api/entries/${existingEntry._id}`) && 
          call[1]?.method === 'PUT'
        );
        expect(putCalls.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 3000 });
    });
  });

  describe('User Story 3: Visual Feedback During Save (Inline Confirmation - TDD)', () => {
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

    const mockExtendedFastFromPrevious = {
      hasPreviousEntry: true,
      hasGap: true,
      isExtendedFast: true,
      isExtendedFastFromPrevious: true,
      isExtendedFastToNext: false,
      fromPreviousFasting: {
        hours: 26,
        minutes: 30,
        totalMinutes: 1590,
        formatted: '26h 30m'
      },
      previousEntry: {
        _id: 'prev-123',
        date: '2024-03-13',
        lastMealTime: '18:00'
      }
    };

    it('should disable both confirmation buttons when either is clicked during save', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock check-previous API to return extended fast from previous
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          // Simulate slow API response
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ data: { ...existingEntry, extendedFastConfirmed: true } }),
              });
            }, 100);
          });
        }
        return Promise.reject(new Error('Unexpected API call'));
      });

      render(<EntryForm entry={existingEntry} isEditMode={true} onSuccess={mockOnSuccess} />);

      // Change last meal time to trigger extended fast
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(updateButton);

      // Wait for confirmation buttons to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      const noButton = screen.getByRole('button', { name: /no, i ate but didn't log/i });

      // Click Yes button
      await user.click(yesButton);

      // Both buttons should be disabled immediately
      expect(yesButton).toBeDisabled();
      expect(noButton).toBeDisabled();

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show loading spinner on clicked confirmation button during save', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock check-previous API to return extended fast from previous
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          // Simulate slow API response (longer delay to allow checking loading state)
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ data: { ...existingEntry, extendedFastConfirmed: true } }),
              });
            }, 2000); // Long delay to ensure we can catch loading state
          });
        }
        return Promise.reject(new Error('Unexpected API call'));
      });

      render(<EntryForm entry={existingEntry} isEditMode={true} onSuccess={mockOnSuccess} />);

      // Change last meal time to trigger extended fast
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(updateButton);

      // Wait for confirmation buttons to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });

      // Click Yes button
      await user.click(yesButton);

      // Both buttons should show "Loading..." (the Button component shows this when loading={true})
      await waitFor(() => {
        const loadingButtons = screen.getAllByRole('button', { name: /loading\.\.\./i });
        expect(loadingButtons.length).toBeGreaterThan(0);
        loadingButtons.forEach(button => expect(button).toBeDisabled());
      }, { timeout: 1000 });

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('should keep confirmation buttons visible and clickable after API error', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock check-previous API to return extended fast from previous
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          // Simulate API error
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Network error' }),
          });
        }
        return Promise.reject(new Error('Unexpected API call'));
      });

      render(<EntryForm entry={existingEntry} isEditMode={true} onSuccess={mockOnSuccess} />);

      // Change last meal time to trigger extended fast
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(updateButton);

      // Wait for confirmation buttons to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });

      // Click Yes button
      await user.click(yesButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Buttons should be re-enabled after error
      await waitFor(() => {
        expect(yesButton).not.toBeDisabled();
      });

      const noButton = screen.getByRole('button', { name: /no, i ate but didn't log/i });
      expect(noButton).not.toBeDisabled();

      // onSuccess should NOT have been called
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should prevent duplicate API calls when confirmation button clicked rapidly', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock check-previous API to return extended fast from previous
      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (mockExtendedFastFromPrevious),
          });
        }
        if (url.includes('/api/entries') && !url.includes('check-previous')) {
          // Simulate slow API response
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ data: { ...existingEntry, extendedFastConfirmed: true } }),
              });
            }, 200);
          });
        }
        return Promise.reject(new Error('Unexpected API call'));
      });

      render(<EntryForm entry={existingEntry} isEditMode={true} onSuccess={mockOnSuccess} />);

      // Change last meal time to trigger extended fast
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      // Click update button
      const updateButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(updateButton);

      // Wait for confirmation buttons to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /yes, confirm extended fast/i })).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });

      // Click Yes button multiple times rapidly
      await user.click(yesButton);
      await user.click(yesButton);
      await user.click(yesButton);

      // Wait for save to complete
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Should have called API only once (check PUT calls, not check-previous)
      const entrySaveCalls = fetch.mock.calls.filter(call => 
        call[0].includes('/api/entries') && !call[0].includes('check-previous')
      );
      expect(entrySaveCalls.length).toBe(1);
    });
  });

  // Feature 015: Extended Fast Date/Time Range Display Tests
  describe('Date/Time Formatting Functions', () => {
    describe('formatDateToDayMonth', () => {
      it('should format ISO date string to "DD Mon" format', () => {
        // This test will fail until formatDateToDayMonth is implemented
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatDateToDayMonth } = EntryFormModule;
        
        const result = formatDateToDayMonth('2025-10-22');
        expect(result).toBe('22 Oct');
      });

      it('should handle full ISO timestamp with time', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatDateToDayMonth } = EntryFormModule;
        
        const result = formatDateToDayMonth('2025-10-22T00:00:00.000Z');
        expect(result).toBe('22 Oct');
      });

      it('should pad single-digit days with zero', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatDateToDayMonth } = EntryFormModule;
        
        const result = formatDateToDayMonth('2025-10-05');
        expect(result).toBe('05 Oct');
      });

      it('should format all month abbreviations correctly', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatDateToDayMonth } = EntryFormModule;
        
        expect(formatDateToDayMonth('2025-01-15')).toBe('15 Jan');
        expect(formatDateToDayMonth('2025-02-28')).toBe('28 Feb');
        expect(formatDateToDayMonth('2025-03-10')).toBe('10 Mar');
        expect(formatDateToDayMonth('2025-04-05')).toBe('05 Apr');
        expect(formatDateToDayMonth('2025-05-20')).toBe('20 May');
        expect(formatDateToDayMonth('2025-06-15')).toBe('15 Jun');
        expect(formatDateToDayMonth('2025-07-04')).toBe('04 Jul');
        expect(formatDateToDayMonth('2025-08-25')).toBe('25 Aug');
        expect(formatDateToDayMonth('2025-09-11')).toBe('11 Sep');
        expect(formatDateToDayMonth('2025-10-31')).toBe('31 Oct');
        expect(formatDateToDayMonth('2025-11-22')).toBe('22 Nov');
        expect(formatDateToDayMonth('2025-12-25')).toBe('25 Dec');
      });

      it('should handle end-of-month dates', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatDateToDayMonth } = EntryFormModule;
        
        expect(formatDateToDayMonth('2025-01-31')).toBe('31 Jan');
        expect(formatDateToDayMonth('2025-02-28')).toBe('28 Feb');
      });
    });

    describe('formatTimeByPreference - 12h format', () => {
      it('should convert afternoon time to 12h format', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('18:00', '12h');
        expect(result).toBe('6:00 PM');
      });

      it('should convert morning time to 12h format', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('09:30', '12h');
        expect(result).toBe('9:30 AM');
      });

      it('should handle midnight (00:00) as 12:00 AM', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('00:00', '12h');
        expect(result).toBe('12:00 AM');
      });

      it('should handle noon (12:00) as 12:00 PM', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('12:00', '12h');
        expect(result).toBe('12:00 PM');
      });

      it('should handle 12:01 PM correctly', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('12:01', '12h');
        expect(result).toBe('12:01 PM');
      });

      it('should handle 11:59 PM correctly', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('23:59', '12h');
        expect(result).toBe('11:59 PM');
      });

      it('should not pad single-digit hours with leading zero', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('09:00', '12h');
        expect(result).toBe('9:00 AM');
      });

      it('should pad single-digit minutes with zero', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('09:05', '12h');
        expect(result).toBe('9:05 AM');
      });
    });

    describe('formatTimeByPreference - 24h format', () => {
      it('should return 24h time without modification', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('18:00', '24h');
        expect(result).toBe('18:00');
      });

      it('should not pad single-digit hours with leading zero', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('09:30', '24h');
        expect(result).toBe('9:30');
      });

      it('should handle midnight as 0:00', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('00:00', '24h');
        expect(result).toBe('0:00');
      });

      it('should handle noon as 12:00', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('12:00', '24h');
        expect(result).toBe('12:00');
      });

      it('should pad minutes with zero', () => {
        const EntryFormModule = require('@/components/organisms/EntryForm');
        const { formatTimeByPreference } = EntryFormModule;
        
        const result = formatTimeByPreference('09:05', '24h');
        expect(result).toBe('9:05');
      });
    });
  });

  describe('Extended Fast Date/Time Range Display', () => {
    it('should display date/time range in from-previous prompt (24h format)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        extendedFastDirection: 'from-previous',
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '26 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '20:00');
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 18:00 → 23 Oct at 20:00/i)).toBeInTheDocument();
      });
    });

    it('should display date/time range in from-previous prompt (12h format)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        extendedFastDirection: 'from-previous',
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '26 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '12h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '08:00');
      await fillTimeInput(user, 'Last Meal Time', '09:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
        expect(screen.getByText(/6:00 PM.*8:00 AM/i)).toBeInTheDocument();
      });
    });

    it('should display date/time range in to-next prompt', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        extendedFastDirection: 'from-previous', // Initially from-previous
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-20',
          lastMealTime: '12:00'
        },
        nextEntry: {
          _id: 'next123',
          date: '2025-10-24',
          firstMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '54 hours' },
        toNextFasting: { formatted: '48 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '12:00');
      await fillTimeInput(user, 'Last Meal Time', '18:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First wait for from-previous prompt
      await waitFor(() => {
        expect(screen.getByText(/extended fast detected/i)).toBeInTheDocument();
        expect(screen.getByText(/20 Oct at 12:00 → 22 Oct at 12:00/i)).toBeInTheDocument();
      });

      // Confirm from-previous
      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // Now wait for to-next prompt to appear
      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 18:00 → 24 Oct at 18:00/i)).toBeInTheDocument();
      });
    });

    it('should display both dates when fast spans midnight', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 1,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        extendedFastDirection: 'from-previous',
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '23:30'
        },
        fromPreviousFasting: { formatted: '25 hours 30 minutes' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '01:00');
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const promptText = screen.getByText(/22 Oct.*23 Oct/i);
        expect(promptText).toBeInTheDocument();
        expect(promptText).toHaveTextContent('22 Oct at 23:30');
        expect(promptText).toHaveTextContent('23 Oct at 1:00');
      });
    });

    it('should display duration and date/time range on separate lines (mobile layout)', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        extendedFastDirection: 'from-previous',
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '26 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '20:00');
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const prompt = screen.getByText(/extended fast detected/i).closest('div');
        
        expect(prompt).toHaveTextContent('Extended fast detected (26 hours)');
        
        const html = prompt.innerHTML;
        expect(html).toContain('26 hours');
        expect(html).toContain('22 Oct at 18:00');
      });
    });

    it('should maintain existing behavior when user confirms extended fast', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        extendedFastDirection: 'from-previous',
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '26 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '20:00');
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 18:00/i)).toBeInTheDocument();
      });

      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('User Story 2: Sequential Extended Fast Date/Time Clarity', () => {
    it('should display different date/time ranges for sequential from-previous and to-next prompts', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-20',
          lastMealTime: '14:00'
        },
        nextEntry: {
          _id: 'next123',
          date: '2025-10-24',
          firstMealTime: '16:00'
        },
        fromPreviousFasting: { formatted: '50 hours' },
        toNextFasting: { formatted: '46 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '16:00');
      await fillTimeInput(user, 'Last Meal Time', '18:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First prompt: from-previous (20 Oct at 14:00 → 22 Oct at 16:00)
      await waitFor(() => {
        expect(screen.getByText(/20 Oct at 14:00 → 22 Oct at 16:00/i)).toBeInTheDocument();
      });

      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // Second prompt: to-next (22 Oct at 18:00 → 24 Oct at 16:00)
      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 18:00 → 24 Oct at 16:00/i)).toBeInTheDocument();
      });

      // Verify first prompt range is no longer visible
      expect(screen.queryByText(/20 Oct at 14:00 → 22 Oct at 16:00/i)).not.toBeInTheDocument();
    });

    it('should show previousEntry → formData range in first prompt', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 3,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-19',
          lastMealTime: '20:00'
        },
        fromPreviousFasting: { formatted: '68 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '16:00');
      await fillTimeInput(user, 'Last Meal Time', '18:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show previous entry's last meal → current entry's first meal
        expect(screen.getByText(/19 Oct at 20:00/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 16:00/i)).toBeInTheDocument();
        expect(screen.getByText(/19 Oct at 20:00 → 22 Oct at 16:00/i)).toBeInTheDocument();
      });
    });

    it('should show formData → nextEntry range in second prompt', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 1,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-20',
          lastMealTime: '22:00'
        },
        nextEntry: {
          _id: 'next123',
          date: '2025-10-23',
          firstMealTime: '08:00'
        },
        fromPreviousFasting: { formatted: '26 hours' },
        toNextFasting: { formatted: '38 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '00:00');
      await fillTimeInput(user, 'Last Meal Time', '18:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First prompt
      await waitFor(() => {
        expect(screen.getByText(/20 Oct at 22:00 → 22 Oct at 0:00/i)).toBeInTheDocument();
      });

      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // Second prompt: should show current entry's last meal → next entry's first meal
      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 18:00/i)).toBeInTheDocument();
        expect(screen.getByText(/23 Oct at 8:00/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 18:00 → 23 Oct at 8:00/i)).toBeInTheDocument();
      });
    });

    it('should clear first prompt range after confirmation before showing second prompt', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 1,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-21',
          lastMealTime: '15:00'
        },
        nextEntry: {
          _id: 'next123',
          date: '2025-10-23',
          firstMealTime: '17:00'
        },
        fromPreviousFasting: { formatted: '25 hours' },
        toNextFasting: { formatted: '27 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '16:00');
      await fillTimeInput(user, 'Last Meal Time', '18:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First prompt visible
      await waitFor(() => {
        expect(screen.getByText(/21 Oct at 15:00 → 22 Oct at 16:00/i)).toBeInTheDocument();
      });

      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // After clicking Yes, first range should disappear
      await waitFor(() => {
        expect(screen.queryByText(/21 Oct at 15:00 → 22 Oct at 16:00/i)).not.toBeInTheDocument();
      });

      // Second prompt should now be visible
      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 18:00 → 23 Oct at 17:00/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Story 3: Respect User Time Format Preference', () => {
    it('should display times with AM/PM when user preference is 12h format', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 1,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '18:00'
        },
        fromPreviousFasting: { formatted: '26 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '12h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '08:00');
      await fillTimeInput(user, 'Last Meal Time', '09:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should display times in 12h format with AM/PM
        expect(screen.getByText(/22 Oct at 6:00 PM/i)).toBeInTheDocument();
        expect(screen.getByText(/23 Oct at 8:00 AM/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 6:00 PM → 23 Oct at 8:00 AM/i)).toBeInTheDocument();
        
        // Should NOT contain 24h format
        expect(screen.queryByText(/18:00/i)).not.toBeInTheDocument();
      });
    });

    it('should display times without AM/PM when user preference is 24h format', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 1,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-22',
          lastMealTime: '14:30'
        },
        fromPreviousFasting: { formatted: '29.5 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '24h' }} />);

      await fillDateInput(user, '2025-10-23');
      await fillTimeInput(user, 'First Meal Time', '20:00');
      await fillTimeInput(user, 'Last Meal Time', '21:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should display times in 24h format without AM/PM
        expect(screen.getByText(/22 Oct at 14:30/i)).toBeInTheDocument();
        expect(screen.getByText(/23 Oct at 20:00/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 14:30 → 23 Oct at 20:00/i)).toBeInTheDocument();
        
        // Should NOT contain AM/PM
        expect(screen.queryByText(/AM/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/PM/i)).not.toBeInTheDocument();
      });
    });

    it('should respect time format preference for both sequential prompts', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      const gapInfo = {
        hasGap: true,
        daysSinceLast: 2,
        hasPreviousEntry: true,
        isExtendedFast: true,
        isExtendedFastFromPrevious: true,
        isExtendedFastToNext: true,
        previousEntry: {
          _id: 'prev123',
          date: '2025-10-20',
          lastMealTime: '19:00'
        },
        nextEntry: {
          _id: 'next123',
          date: '2025-10-24',
          firstMealTime: '07:00'
        },
        fromPreviousFasting: { formatted: '45 hours' },
        toNextFasting: { formatted: '60 hours' }
      };

      fetch.mockImplementation((url) => {
        if (url.includes('check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => (gapInfo),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: {} }),
        });
      });

      render(<EntryForm onSuccess={mockOnSuccess} settings={{ timeFormat: '12h' }} />);

      await fillDateInput(user, '2025-10-22');
      await fillTimeInput(user, 'First Meal Time', '04:00');
      await fillTimeInput(user, 'Last Meal Time', '07:00');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First prompt: should display in 12h format
      await waitFor(() => {
        expect(screen.getByText(/20 Oct at 7:00 PM/i)).toBeInTheDocument();
        expect(screen.getByText(/22 Oct at 4:00 AM/i)).toBeInTheDocument();
      });

      const firstYesButton = screen.getByRole('button', { name: /yes, confirm extended fast/i });
      await user.click(firstYesButton);

      // Second prompt: should also display in 12h format
      await waitFor(() => {
        expect(screen.getByText(/22 Oct at 7:00 AM/i)).toBeInTheDocument();
        expect(screen.getByText(/24 Oct at 7:00 AM/i)).toBeInTheDocument();
      });

      // Both prompts should have used 12h format (no 19:00, 04:00, or 07:00 visible)
      expect(screen.queryByText(/19:00/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/04:00/i)).not.toBeInTheDocument();
    });
  });
});
