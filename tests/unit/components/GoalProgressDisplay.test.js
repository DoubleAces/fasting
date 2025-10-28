/**
 * Tests for GoalProgressDisplay Component (Feature 020 - User Story 2)
 * 
 * Tests cover:
 * - T028: Progress calculation (28% for 4.5h/16h)
 * - T029: >100% progress handling (111% for 20h/18h, green bar)
 * - T030: Progress update on timer tick (elapsedMs change)
 * - T031: Goal change recalculation (10h progress, goal 16h→18h)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoalProgressDisplay } from '../../../src/components/molecules/GoalProgressDisplay';
import { FastingGoalProvider } from '../../../src/contexts/FastingGoalContext';

// Mock date-fns format function for predictable test output
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    // Return predictable format for testing
    if (formatString === 'MMM d, h:mm a') {
      return 'Oct 29, 12:00 PM';
    }
    return date.toString();
  }),
}));

/**
 * Helper function to render GoalProgressDisplay with FastingGoalContext
 */
const renderWithGoal = (goalMinutes, elapsedMs, lastMealTime = '20:00', date = new Date('2025-10-28')) => {
  // Mock localStorage
  const mockStorage = {
    goalMinutes,
    setAt: new Date().toISOString(),
  };
  localStorage.setItem('fasting-goal-session', JSON.stringify(mockStorage));

  return render(
    <FastingGoalProvider>
      <GoalProgressDisplay 
        elapsedMs={elapsedMs} 
        lastMealTime={lastMealTime}
        date={date}
      />
    </FastingGoalProvider>
  );
};

describe('GoalProgressDisplay', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Progress calculation (T028)', () => {
    it('should calculate 28% progress for 4.5h elapsed with 16h goal', () => {
      const elapsedMs = 4.5 * 60 * 60 * 1000; // 4.5 hours in ms
      const goalMinutes = 16 * 60; // 16 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      // Should display percentage
      expect(screen.getByText(/28%/i)).toBeInTheDocument();

      // Should display elapsed and goal time
      expect(screen.getByText(/4h 30m/i)).toBeInTheDocument();
      expect(screen.getByText(/16h 00m/i)).toBeInTheDocument();
    });

    it('should calculate 50% progress for 8h elapsed with 16h goal', () => {
      const elapsedMs = 8 * 60 * 60 * 1000; // 8 hours in ms
      const goalMinutes = 16 * 60; // 16 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      expect(screen.getByText(/50%/i)).toBeInTheDocument();
      expect(screen.getByText(/8h 00m/i)).toBeInTheDocument();
    });

    it('should calculate 75% progress for 18h elapsed with 24h goal', () => {
      const elapsedMs = 18 * 60 * 60 * 1000; // 18 hours in ms
      const goalMinutes = 24 * 60; // 24 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      expect(screen.getByText(/75%/i)).toBeInTheDocument();
      expect(screen.getByText(/18h 00m/i)).toBeInTheDocument();
      expect(screen.getByText(/24h 00m/i)).toBeInTheDocument();
    });
  });

  describe('>100% progress handling (T029)', () => {
    it('should show 111% for 20h elapsed with 18h goal', () => {
      const elapsedMs = 20 * 60 * 60 * 1000; // 20 hours in ms
      const goalMinutes = 18 * 60; // 18 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      // Should display percentage over 100%
      expect(screen.getByText(/111%/i)).toBeInTheDocument();
    });

    it('should display "Goal Exceeded!" message when progress > 100%', () => {
      const elapsedMs = 20 * 60 * 60 * 1000; // 20 hours in ms
      const goalMinutes = 18 * 60; // 18 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      expect(screen.getByText(/goal exceeded/i)).toBeInTheDocument();
    });

    it('should use green styling for progress bar when > 100%', () => {
      const elapsedMs = 20 * 60 * 60 * 1000; // 20 hours in ms
      const goalMinutes = 18 * 60; // 18 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      // Find progress bar by role
      const progressBar = screen.getByRole('progressbar');
      
      // Should have green background class
      expect(progressBar.className).toMatch(/bg-green/i);
    });

    it('should use blue styling for progress bar when < 100%', () => {
      const elapsedMs = 8 * 60 * 60 * 1000; // 8 hours in ms
      const goalMinutes = 16 * 60; // 16 hours in minutes

      renderWithGoal(goalMinutes, elapsedMs);

      const progressBar = screen.getByRole('progressbar');
      
      // Should have blue background class
      expect(progressBar.className).toMatch(/bg-blue/i);
    });
  });

  describe('Progress update on timer tick (T030)', () => {
    it('should update progress when elapsedMs changes', () => {
      const goalMinutes = 16 * 60; // 16 hours in minutes
      const initialElapsedMs = 4 * 60 * 60 * 1000; // 4 hours

      const { rerender } = renderWithGoal(goalMinutes, initialElapsedMs);

      // Initial state: 25% progress
      expect(screen.getByText(/25%/i)).toBeInTheDocument();
      expect(screen.getByText(/4h 00m/i)).toBeInTheDocument();

      // Simulate timer tick - 5 hours elapsed
      const newElapsedMs = 5 * 60 * 60 * 1000; // 5 hours
      
      rerender(
        <FastingGoalProvider>
          <GoalProgressDisplay elapsedMs={newElapsedMs} />
        </FastingGoalProvider>
      );

      // Updated state: 31% progress
      expect(screen.getByText(/31%/i)).toBeInTheDocument();
      expect(screen.getByText(/5h 00m/i)).toBeInTheDocument();
    });

    it('should update progress bar width when elapsedMs changes', () => {
      const goalMinutes = 16 * 60; // 16 hours in minutes
      const initialElapsedMs = 4 * 60 * 60 * 1000; // 4 hours (25%)

      const { rerender } = renderWithGoal(goalMinutes, initialElapsedMs);

      const progressBar = screen.getByRole('progressbar');
      const initialWidth = progressBar.style.width;

      // Simulate timer tick - 8 hours elapsed (50%)
      const newElapsedMs = 8 * 60 * 60 * 1000;
      
      rerender(
        <FastingGoalProvider>
          <GoalProgressDisplay elapsedMs={newElapsedMs} />
        </FastingGoalProvider>
      );

      const updatedProgressBar = screen.getByRole('progressbar');
      const newWidth = updatedProgressBar.style.width;

      // Width should increase
      expect(parseFloat(newWidth)).toBeGreaterThan(parseFloat(initialWidth));
    });
  });

  describe('Goal change recalculation (T031)', () => {
    it('should recalculate progress when goal changes from 16h to 18h', () => {
      const elapsedMs = 10 * 60 * 60 * 1000; // 10 hours elapsed
      const initialGoalMinutes = 16 * 60; // 16 hours goal

      const { unmount } = renderWithGoal(initialGoalMinutes, elapsedMs);

      // Initial: 10h/16h = 62.5% (rounds to 63%)
      expect(screen.getByText(/63%/i)).toBeInTheDocument();
      expect(screen.getByText(/16h 00m/i)).toBeInTheDocument();

      // Unmount and remount with new goal (simulates context re-initialization)
      unmount();

      // Change goal to 18 hours
      const newGoalMinutes = 18 * 60;
      renderWithGoal(newGoalMinutes, elapsedMs);

      // Updated: 10h/18h = 55.5% (rounds to 56%)
      expect(screen.getByText(/56%/i)).toBeInTheDocument();
      expect(screen.getByText(/18h 00m/i)).toBeInTheDocument();
    });
  });

  describe('ARIA attributes (T040)', () => {
    it('should have proper ARIA attributes on progress bar', () => {
      const elapsedMs = 8 * 60 * 60 * 1000; // 8 hours
      const goalMinutes = 16 * 60; // 16 hours

      renderWithGoal(goalMinutes, elapsedMs);

      const progressBar = screen.getByRole('progressbar');

      // Should have aria-valuenow (current percentage)
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');

      // Should have aria-valuemin
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');

      // Should have aria-valuemax
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      // Should have aria-label
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('should update aria-valuenow when progress changes', () => {
      const goalMinutes = 16 * 60;
      const initialElapsedMs = 4 * 60 * 60 * 1000; // 25%

      const { rerender } = renderWithGoal(goalMinutes, initialElapsedMs);

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '25');

      // Update to 50%
      const newElapsedMs = 8 * 60 * 60 * 1000;
      
      rerender(
        <FastingGoalProvider>
          <GoalProgressDisplay elapsedMs={newElapsedMs} />
        </FastingGoalProvider>
      );

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Edge cases', () => {
    it('should handle 0 elapsed time', () => {
      const elapsedMs = 0;
      const goalMinutes = 16 * 60;

      renderWithGoal(goalMinutes, elapsedMs);

      expect(screen.getByText(/0%/i)).toBeInTheDocument();
      expect(screen.getByText(/0h 00m/i)).toBeInTheDocument();
    });

    it('should not render when no goal is set', () => {
      const elapsedMs = 5 * 60 * 60 * 1000;

      const { container } = render(
        <FastingGoalProvider>
          <GoalProgressDisplay elapsedMs={elapsedMs} />
        </FastingGoalProvider>
      );

      // Component should return null or be empty
      expect(container.firstChild).toBeNull();
    });

    it('should handle fractional hours in progress display', () => {
      const elapsedMs = 4.5 * 60 * 60 * 1000; // 4h 30m
      const goalMinutes = 16 * 60;

      renderWithGoal(goalMinutes, elapsedMs);

      // Should show minutes
      expect(screen.getByText(/4h 30m/i)).toBeInTheDocument();
    });
  });

  describe('Completion time calculation and display (T047-T050)', () => {
    beforeEach(() => {
      // Reset date-fns mock before each test
      jest.clearAllMocks();
    });

    it('should calculate completion time accurately (T047)', () => {
      const { format } = require('date-fns');
      
      // Start fast at 8:00 PM on Oct 28
      const lastMealTime = '20:00';
      const date = new Date('2025-10-28');
      const goalMinutes = 16 * 60; // 16 hours goal
      const elapsedMs = 4 * 60 * 60 * 1000; // 4 hours elapsed

      renderWithGoal(goalMinutes, elapsedMs, lastMealTime, date);

      // Should call format with correct completion date
      // Last meal: Oct 28, 8:00 PM + 16 hours = Oct 29, 12:00 PM
      expect(format).toHaveBeenCalled();
      
      const callArgs = format.mock.calls[0];
      const completionDate = callArgs[0];
      const formatPattern = callArgs[1];

      expect(formatPattern).toBe('MMM d, h:mm a');
      
      // Verify date calculation: 2025-10-28 20:00 + 16 hours = 2025-10-29 12:00
      expect(completionDate.getFullYear()).toBe(2025);
      expect(completionDate.getMonth()).toBe(9); // October (0-indexed)
      expect(completionDate.getDate()).toBe(29);
      expect(completionDate.getHours()).toBe(12);
    });

    it('should format completion time with "MMM d, h:mm a" pattern (T048)', () => {
      const lastMealTime = '20:00';
      const date = new Date('2025-10-28');
      const goalMinutes = 16 * 60;
      const elapsedMs = 4 * 60 * 60 * 1000;

      renderWithGoal(goalMinutes, elapsedMs, lastMealTime, date);

      // Should display "Goal reached at:" with formatted time
      expect(screen.getByText(/goal reached at:/i)).toBeInTheDocument();
      expect(screen.getByText(/oct 29, 12:00 pm/i)).toBeInTheDocument();
    });

    it('should update completion time when goal changes (T049)', () => {
      const { format } = require('date-fns');
      const lastMealTime = '20:00';
      const date = new Date('2025-10-28');
      const initialGoalMinutes = 16 * 60; // 16 hours
      const elapsedMs = 4 * 60 * 60 * 1000;

      const { unmount } = renderWithGoal(initialGoalMinutes, elapsedMs, lastMealTime, date);

      // Initial: 16h goal = Oct 29, 12:00 PM
      expect(format).toHaveBeenCalled();
      const firstCallDate = format.mock.calls[0][0];
      expect(firstCallDate.getHours()).toBe(12);

      // Change goal to 18 hours
      unmount();
      jest.clearAllMocks();
      
      const newGoalMinutes = 18 * 60;
      renderWithGoal(newGoalMinutes, elapsedMs, lastMealTime, date);

      // New: 18h goal = Oct 29, 2:00 PM (2 hours later)
      expect(format).toHaveBeenCalled();
      const secondCallDate = format.mock.calls[0][0];
      expect(secondCallDate.getHours()).toBe(14); // 2:00 PM
    });

    it('should show past tense for exceeded goals with checkmark (T050)', () => {
      const lastMealTime = '20:00';
      const date = new Date('2025-10-27'); // Yesterday
      const goalMinutes = 18 * 60; // 18 hour goal
      const elapsedMs = 20 * 60 * 60 * 1000; // 20 hours elapsed (exceeded)

      renderWithGoal(goalMinutes, elapsedMs, lastMealTime, date);

      // Should show past tense "Goal reached at:"
      expect(screen.getByText(/goal reached at:/i)).toBeInTheDocument();
      
      // Should display formatted past time
      expect(screen.getByText(/oct 29, 12:00 pm/i)).toBeInTheDocument();
      
      // Should show "Goal Exceeded!" message (from >100% handling)
      expect(screen.getByText(/goal exceeded/i)).toBeInTheDocument();
    });

    it('should handle completion time across midnight boundary', () => {
      const lastMealTime = '23:00'; // 11:00 PM
      const date = new Date('2025-10-28');
      const goalMinutes = 16 * 60; // 16 hours
      const elapsedMs = 2 * 60 * 60 * 1000; // 2 hours elapsed

      renderWithGoal(goalMinutes, elapsedMs, lastMealTime, date);

      const { format } = require('date-fns');
      const completionDate = format.mock.calls[0][0];

      // 23:00 + 16 hours = next day at 15:00 (3:00 PM)
      expect(completionDate.getDate()).toBe(29); // Next day
      expect(completionDate.getHours()).toBe(15); // 3:00 PM
    });

    it('should not display completion time when no goal is set', () => {
      const elapsedMs = 5 * 60 * 60 * 1000;
      const lastMealTime = '20:00';
      const date = new Date('2025-10-28');

      const { container } = render(
        <FastingGoalProvider>
          <GoalProgressDisplay 
            elapsedMs={elapsedMs}
            lastMealTime={lastMealTime}
            date={date}
          />
        </FastingGoalProvider>
      );

      // Component should return null
      expect(container.firstChild).toBeNull();
    });
  });
});
