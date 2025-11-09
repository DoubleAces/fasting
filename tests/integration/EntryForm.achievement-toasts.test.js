/**
 * Integration Tests: EntryForm Achievement Toast Notifications
 * 
 * Tests for achievement unlock toast display integration with EntryForm component
 * Feature: 034-achievement-unlock-toasts
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EntryForm from '@/components/organisms/EntryForm';
import { ToastProvider } from '@/contexts/ToastContext';
import { FastingGoalProvider } from '@/contexts/FastingGoalContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

/**
 * Wrapper component with all required providers
 */
const TestWrapper = ({ children }) => (
  <ToastProvider>
    <FastingGoalProvider>
      {children}
    </FastingGoalProvider>
  </ToastProvider>
);

describe('EntryForm - Achievement Toast Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockPush.mockClear();
  });

  describe('T015: Single achievement unlock', () => {
    it('displays achievement toast when API returns single unlocked achievement', async () => {
      // Mock successful API response with single achievement
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            _id: 'entry123',
            date: '2025-11-08',
            firstMealTime: '12:00',
            lastMealTime: '18:00',
          },
          unlockedAchievements: [
            {
              name: 'First 12-Hour Fast',
              points: 10,
              rarity: 'Common',
            }
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Fill in form and submit
      const dateInput = screen.getByLabelText(/date/i);
      const firstMealInput = screen.getByLabelText(/first meal time/i);
      const lastMealInput = screen.getByLabelText(/last meal time/i);

      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2025-11-08');
      await userEvent.type(firstMealInput, '12:00');
      await userEvent.type(lastMealInput, '18:00');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Wait for toasts to appear
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/🏆 Achievement Unlocked! First 12-Hour Fast - 10 points \(Common\)/)).toBeInTheDocument();
      });
    });

    it('includes "View Achievements" action button in achievement toast', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [{
            name: 'First Fast',
            points: 10,
            rarity: 'Common',
          }]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Verify action button exists
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view achievements/i })).toBeInTheDocument();
      });
    });

    it('navigates to /achievements when action button is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [{
            name: 'First Fast',
            points: 10,
            rarity: 'Common',
          }]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Click "View Achievements" button
      await waitFor(async () => {
        const viewButton = screen.getByRole('button', { name: /view achievements/i });
        await userEvent.click(viewButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/achievements');
    });
  });

  describe('T016: No achievement toast when empty array', () => {
    it('does not display achievement toast when unlockedAchievements is empty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: []
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Should only see entry saved toast, not achievement toast
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/achievement unlocked/i)).not.toBeInTheDocument();
    });

    it('does not display achievement toast when unlockedAchievements is undefined', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          // unlockedAchievements field not present
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Should only see entry saved toast
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/achievement unlocked/i)).not.toBeInTheDocument();
    });
  });

  describe('T016a: Standard success toast displays alongside achievement toast (FR-013)', () => {
    it('displays both standard success toast and achievement toast', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [{
            name: 'First Fast',
            points: 10,
            rarity: 'Common',
          }]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Both toasts should be visible
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/🏆 Achievement Unlocked!/)).toBeInTheDocument();
      });
    });

    it('standard success toast appears even if achievement toast fails to format', async () => {
      // API returns malformed achievement data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [
            { name: '', points: 10 } // Invalid - missing rarity
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Standard success toast should still appear
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('does not break entry save flow if achievement toast rendering fails', async () => {
      // Mock console.error to suppress error output in tests
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: 'not an array' // Invalid type
        }),
      });

      const onSuccess = jest.fn();

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={onSuccess}
          />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      // Entry save should succeed despite achievement error
      await waitFor(() => {
        expect(screen.getByText(/entry saved successfully/i)).toBeInTheDocument();
      });

      expect(onSuccess).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('EntryForm - Multiple Achievement Unlocks (US2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    mockPush.mockClear();
  });

  describe('T025: Multiple achievement integration', () => {
    it('displays consolidated toast for 2 achievements', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [
            { name: 'First 12-Hour Fast', points: 10, rarity: 'Common' },
            { name: 'First Entry Logged', points: 5, rarity: 'Common' }
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/2 Achievements Unlocked!/)).toBeInTheDocument();
        expect(screen.getByText(/First 12-Hour Fast \(10 pts\) • First Entry Logged \(5 pts\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(\+15 pts total\)/)).toBeInTheDocument();
      });
    });

    it('displays consolidated toast for 3 achievements without truncation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [
            { name: 'First', points: 10, rarity: 'Common' },
            { name: 'Second', points: 20, rarity: 'Rare' },
            { name: 'Third', points: 30, rarity: 'Epic' }
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/3 Achievements Unlocked!/)).toBeInTheDocument();
        expect(screen.getByText(/First \(10 pts\)/)).toBeInTheDocument();
        expect(screen.getByText(/Second \(20 pts\)/)).toBeInTheDocument();
        expect(screen.getByText(/Third \(30 pts\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(\+60 pts total\)/)).toBeInTheDocument();
      });
    });

    it('truncates display for 5 achievements showing "and 2 more..."', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [
            { name: 'Achievement 1', points: 10, rarity: 'Common' },
            { name: 'Achievement 2', points: 10, rarity: 'Common' },
            { name: 'Achievement 3', points: 10, rarity: 'Common' },
            { name: 'Achievement 4', points: 10, rarity: 'Common' },
            { name: 'Achievement 5', points: 10, rarity: 'Common' }
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/5 Achievements Unlocked!/)).toBeInTheDocument();
        expect(screen.getByText(/and 2 more\.\.\./)).toBeInTheDocument();
        expect(screen.getByText(/\(\+50 pts total\)/)).toBeInTheDocument();
      });
    });
  });

  describe('T026: Navigation from consolidated toast', () => {
    it('navigates to /achievements when clicking action button on multi-achievement toast', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { _id: 'entry123' },
          unlockedAchievements: [
            { name: 'First', points: 10, rarity: 'Common' },
            { name: 'Second', points: 20, rarity: 'Rare' }
          ]
        }),
      });

      render(
        <TestWrapper>
          <EntryForm
            settings={{ measurementSystem: 'metric', timeFormat: '24h' }}
            onSuccess={jest.fn()}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(async () => {
        const viewButton = screen.getByRole('button', { name: /view achievements/i });
        await userEvent.click(viewButton);
      });

      expect(mockPush).toHaveBeenCalledWith('/achievements');
    });
  });
});
