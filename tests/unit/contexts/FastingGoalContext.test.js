/**
 * Unit tests for FastingGoalContext (Feature 020)
 * Tests React Context provider, state management, and localStorage sync
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FastingGoalProvider, useFastingGoal } from '../../../src/contexts/FastingGoalContext.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access context
function TestComponent() {
  const { goalMinutes, setAt, setGoal, clearGoal } = useFastingGoal();

  return (
    <div>
      <div data-testid="goal-minutes">{goalMinutes !== null ? goalMinutes : 'null'}</div>
      <div data-testid="set-at">{setAt ? new Date(setAt).toISOString() : 'null'}</div>
      <button onClick={() => setGoal(960)}>Set 16h Goal</button>
      <button onClick={() => setGoal(1080)}>Set 18h Goal</button>
      <button onClick={clearGoal}>Clear Goal</button>
    </div>
  );
}

describe('FastingGoalContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Provider initialization', () => {
    it('should provide default null values when no goal is set', () => {
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      expect(screen.getByTestId('goal-minutes')).toHaveTextContent('null');
      expect(screen.getByTestId('set-at')).toHaveTextContent('null');
    });

    it('should restore goal from localStorage on mount', () => {
      const now = new Date().toISOString();
      localStorageMock.setItem(
        'fasting-goal-session',
        JSON.stringify({ goalMinutes: 960, setAt: now })
      );

      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      expect(screen.getByTestId('set-at')).toHaveTextContent(now);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.setItem('fasting-goal-session', 'invalid-json');

      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Should default to null values
      expect(screen.getByTestId('goal-minutes')).toHaveTextContent('null');
      expect(screen.getByTestId('set-at')).toHaveTextContent('null');
    });
  });

  describe('setGoal function', () => {
    it('should set goal and update localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      await user.click(screen.getByText('Set 16h Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fasting-goal-session',
        expect.stringContaining('"goalMinutes":960')
      );
    });

    it('should update setAt timestamp when goal is changed', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Set initial goal
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      const firstSetAt = screen.getByTestId('set-at').textContent;

      // Wait a bit and change goal
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await user.click(screen.getByText('Set 18h Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('1080');
      });

      const secondSetAt = screen.getByTestId('set-at').textContent;

      // Timestamps should be different
      expect(secondSetAt).not.toBe('null');
      expect(secondSetAt).not.toBe(firstSetAt);
    });

    it('should allow changing goal mid-fast', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Set initial 16h goal
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Change to 18h goal
      await user.click(screen.getByText('Set 18h Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('1080');
      });

      // Verify localStorage has the new goal
      const storedData = JSON.parse(localStorageMock.getItem('fasting-goal-session'));
      expect(storedData.goalMinutes).toBe(1080);
    });
  });

  describe('clearGoal function', () => {
    it('should clear goal state', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Set a goal first
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Clear the goal
      await user.click(screen.getByText('Clear Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('null');
        expect(screen.getByTestId('set-at')).toHaveTextContent('null');
      });
    });

    it('should remove goal from localStorage when cleared', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Set a goal
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Clear the goal
      await user.click(screen.getByText('Clear Goal'));

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('fasting-goal-session');
      });
    });
  });

  describe('localStorage sync', () => {
    it('should persist goal across component remounts', async () => {
      const user = userEvent.setup();
      
      const { unmount } = render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Set a goal
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Unmount component
      unmount();

      // Remount component (simulates browser refresh)
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Goal should be restored from localStorage
      expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
    });

    it('should handle localStorage.setItem failures gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate localStorage quota exceeded
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Should not crash when trying to set goal
      await user.click(screen.getByText('Set 16h Goal'));

      // Context state should still update (graceful degradation)
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Error should be logged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle null goalMinutes', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Initially null
      expect(screen.getByTestId('goal-minutes')).toHaveTextContent('null');

      // Set a goal
      await user.click(screen.getByText('Set 16h Goal'));
      
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });

      // Clear back to null
      await user.click(screen.getByText('Clear Goal'));

      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('null');
      });
    });

    it('should handle rapid goal changes', async () => {
      const user = userEvent.setup();
      
      render(
        <FastingGoalProvider>
          <TestComponent />
        </FastingGoalProvider>
      );

      // Rapidly change goals
      await user.click(screen.getByText('Set 16h Goal'));
      await user.click(screen.getByText('Set 18h Goal'));
      await user.click(screen.getByText('Set 16h Goal'));

      // Final state should be 16h
      await waitFor(() => {
        expect(screen.getByTestId('goal-minutes')).toHaveTextContent('960');
      });
    });
  });
});
