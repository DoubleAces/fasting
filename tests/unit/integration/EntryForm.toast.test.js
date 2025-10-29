/**
 * EntryForm Toast Integration Tests
 * Tests for success toast notifications when saving entries
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { FastingGoalProvider } from '@/contexts/FastingGoalContext';
import EntryForm from '@/components/organisms/EntryForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('EntryForm Toast Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock both entry save AND check-previous API calls
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/entries/check-previous')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: null }), // No previous entry gap
        });
      }
      
      // Default: successful entry save
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            id: '123',
            date: '2025-01-01',
            firstMealTime: '08:00',
            lastMealTime: '16:00',
          },
        }),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows success toast when entry is saved', async () => {
    // Create a test entry to edit (simpler than filling new form)
    const testEntry = {
      id: '123',
      date: '2025-01-01',
      firstMealTime: '08:00',
      lastMealTime: '16:00',
    };

    render(
      <FastingGoalProvider>
        <ToastProvider>
          <EntryForm entry={testEntry} />
        </ToastProvider>
      </FastingGoalProvider>
    );

    // Submit form (in edit mode, form is already valid)
    const submitButton = screen.getByRole('button', { name: /save|update/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for success toast to appear
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/entry.*saved|updated.*successfully/i)).toBeInTheDocument();
    });
  });

  it('success toast is visible during 5 second window', async () => {
    jest.useFakeTimers();

    // Create a test entry to edit
    const testEntry = {
      id: '123',
      date: '2025-01-01',
      firstMealTime: '08:00',
      lastMealTime: '16:00',
    };

    render(
      <FastingGoalProvider>
        <ToastProvider>
          <EntryForm entry={testEntry} />
        </ToastProvider>
      </FastingGoalProvider>
    );

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save|update/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByText(/entry.*saved|updated.*successfully/i)).toBeInTheDocument();
    });

    // Toast should still be visible after 4 seconds
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.getByText(/entry.*saved|updated.*successfully/i)).toBeInTheDocument();

    // Toast should auto-dismiss after 5 seconds (+ 300ms animation)
    act(() => {
      jest.advanceTimersByTime(1300);
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/entry.*saved|updated.*successfully/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  // Phase 4: Error feedback tests
  describe('Error Feedback', () => {
    it('shows error toast on network failure', async () => {
      // Mock network error
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/entries/check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: null }),
          });
        }
        
        // Simulate network error for entry save
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Network error occurred' }),
        });
      });

      const testEntry = {
        id: '123',
        date: '2025-01-01',
        firstMealTime: '08:00',
        lastMealTime: '16:00',
      };

      render(
        <FastingGoalProvider>
          <ToastProvider>
            <EntryForm entry={testEntry} />
          </ToastProvider>
        </FastingGoalProvider>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save|update/i });
      
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for error toast to appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/network error|failed/i)).toBeInTheDocument();
      });
    });

    it('error toast persists without auto-dismiss', async () => {
      jest.useFakeTimers();

      // Mock API error
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/entries/check-previous')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: null }),
          });
        }
        
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to save entry' }),
        });
      });

      const testEntry = {
        id: '123',
        date: '2025-01-01',
        firstMealTime: '08:00',
        lastMealTime: '16:00',
      };

      render(
        <FastingGoalProvider>
          <ToastProvider>
            <EntryForm entry={testEntry} />
          </ToastProvider>
        </FastingGoalProvider>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save|update/i });
      
      await act(async () => {
        fireEvent.click(submitButton);
      });

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });

      // Error toast should still be visible after 10 seconds (no auto-dismiss)
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();

      jest.useRealTimers();
    });
  });
});