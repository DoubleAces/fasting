/**
 * SettingsForm Toast Integration Tests
 * Tests for success toast notifications when updating settings
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import SettingsForm from '@/components/organisms/SettingsForm';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockSettings = {
  notifications: {
    enabled: true,
    reminderTime: '08:00',
  },
  privacy: {
    dataSharing: false,
  },
};

describe('SettingsForm Toast Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockSettings,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows success toast when settings are updated', async () => {
    render(
      <ToastProvider>
        <SettingsForm settings={mockSettings} />
      </ToastProvider>
    );

    // Find and click save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Wait for success toast to appear
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });
  });

  it('close button dismisses success toast immediately', async () => {
    render(
      <ToastProvider>
        <SettingsForm settings={mockSettings} />
      </ToastProvider>
    );

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });

    // Click dismiss button
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);

    // Toast should be removed immediately
    await waitFor(() => {
      expect(screen.queryByText(/settings saved successfully/i)).not.toBeInTheDocument();
    });
  });

  // Phase 4: Error feedback tests
  describe('Error Feedback', () => {
    it('shows error toast on validation failure', async () => {
      // Mock validation error
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ 
          error: 'Validation failed',
          errors: [{ field: 'timeFormat', message: 'Invalid format' }]
        }),
      });

      render(
        <ToastProvider>
          <SettingsForm settings={mockSettings} />
        </ToastProvider>
      );

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/validation failed|invalid/i)).toBeInTheDocument();
      });
    });

    it('error toast can be manually dismissed with close button', async () => {
      // Mock API error
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to save settings' }),
      });

      render(
        <ToastProvider>
          <SettingsForm settings={mockSettings} />
        </ToastProvider>
      );

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
      });

      // Click dismiss button
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      // Toast should be removed
      await waitFor(() => {
        expect(screen.queryByText(/failed to save/i)).not.toBeInTheDocument();
      });
    });
  });
});