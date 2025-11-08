/**
 * Unit Tests: BackfillAchievementsButton Component
 * 
 * Tests for the admin button that triggers achievement backfill for users.
 * 
 * Test Scenarios (maps to spec.md quickstart.md):
 * - T008: Rendering - Button renders with correct text and icon
 * - T009: Rendering - Button is accessible (aria-label)
 * - T010: Rendering - Button uses correct Tailwind classes
 * - T011: Loading State - Button shows loading state during API call
 * - T012: Loading State - Button is disabled during loading
 * - T013: Success - Calls API with correct userId
 * - T014: Success - Shows success toast with statistics
 * - T015: Success - Calls onBackfillSuccess callback
 * - T016: Success - Resets loading state after success
 * - T017: Error - Shows error toast on API failure
 * - T018: Error - Resets loading state after error
 * - T019: Error - Does not call onBackfillSuccess on error
 * - T020: API Call - Makes POST request to correct endpoint
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BackfillAchievementsButton from '@/app/admin/users/components/BackfillAchievementsButton';
import { useToast } from '@/hooks/useToast';

// Mock useToast hook
jest.mock('@/hooks/useToast');

// Mock fetch
global.fetch = jest.fn();

describe('BackfillAchievementsButton', () => {
  let mockShowSuccess;
  let mockShowError;
  let mockOnBackfillSuccess;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    mockShowSuccess = jest.fn();
    mockShowError = jest.fn();
    mockOnBackfillSuccess = jest.fn();
    
    useToast.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });

    fetch.mockClear();
  });

  describe('Rendering', () => {
    // T008: Button renders with correct text and icon
    test('T008: renders button with correct text', () => {
      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Backfill');
    });

    // T009: Button is accessible (aria-label)
    test('T009: has proper accessibility attributes', () => {
      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      expect(button).toHaveAttribute('aria-label', 'Backfill achievements for Test User');
    });

    // T010: Button uses correct Tailwind classes
    test('T010: applies correct CSS classes', () => {
      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'bg-blue-600', 'text-white', 'rounded-md');
    });
  });

  describe('Loading State', () => {
    // T011: Button shows loading state during API call
    test('T011: shows loading text when processing', async () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('Processing...');
      });
    });

    // T012: Button is disabled during loading
    test('T012: disables button during loading', async () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Success Handling', () => {
    // T013: Calls API with correct userId
    test('T013: makes API call with correct userId', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entriesProcessed: 10,
          achievementsUnlocked: 3,
          pointsEarned: 150,
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/admin/users/user123/backfill-achievements',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        );
      });
    });

    // T014: Shows success toast with statistics
    test('T014: shows success toast with statistics', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entriesProcessed: 127,
          achievementsUnlocked: 8,
          pointsEarned: 450,
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowSuccess).toHaveBeenCalledWith(
          'Backfill complete: Processed 127 entries, unlocked 8 achievements, earned 450 points'
        );
      });
    });

    // T015: Calls onBackfillSuccess callback
    test('T015: calls onBackfillSuccess callback after success', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entriesProcessed: 10,
          achievementsUnlocked: 3,
          pointsEarned: 150,
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnBackfillSuccess).toHaveBeenCalledTimes(1);
      });
    });

    // T016: Resets loading state after success
    test('T016: resets loading state after success', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entriesProcessed: 10,
          achievementsUnlocked: 3,
          pointsEarned: 150,
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent('Backfill');
      });
    });
  });

  describe('Error Handling', () => {
    // T017: Shows error toast on API failure
    test('T017: shows error toast on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'User not found',
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to backfill achievements: User not found');
      });
    });

    // T018: Resets loading state after error
    test('T018: resets loading state after error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Server error',
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent('Backfill');
      });
    });

    // T019: Does not call onBackfillSuccess on error
    test('T019: does not call onBackfillSuccess on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Server error',
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="user123"
          userName="Test User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalled();
      });

      expect(mockOnBackfillSuccess).not.toHaveBeenCalled();
    });
  });

  describe('API Call Verification', () => {
    // T020: Makes POST request to correct endpoint
    test('T020: makes POST request to correct endpoint with proper headers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entriesProcessed: 0,
          achievementsUnlocked: 0,
          pointsEarned: 0,
        }),
      });

      render(
        <BackfillAchievementsButton
          userId="abc456"
          userName="Another User"
          onBackfillSuccess={mockOnBackfillSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /backfill achievements/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/admin/users/abc456/backfill-achievements',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });
    });
  });
});
