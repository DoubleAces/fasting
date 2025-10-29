/**
 * ToastContext Unit Tests
 * Tests for toast state management context and reducer logic
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToastContext } from '@/contexts/ToastContext';

// Test component to access context
function TestComponent({ messagePrefix = 'Test message' }) {
  const { state, dispatch } = useToastContext();
  return (
    <div>
      <div data-testid="displayed-count">{state.displayed.length}</div>
      <div data-testid="queue-count">{state.queue.length}</div>
      <button
        data-testid="add-toast"
        onClick={() =>
          dispatch({
            type: 'ADD_TOAST',
            payload: {
              id: `test-${Date.now()}-${Math.random()}`,
              type: 'success',
              message: `${messagePrefix} ${Math.random()}`,
              timestamp: Date.now(),
              autoDismiss: true,
            },
          })
        }
      >
        Add Toast
      </button>
      <button
        data-testid="add-duplicate"
        onClick={() =>
          dispatch({
            type: 'ADD_TOAST',
            payload: {
              id: `test-${Date.now()}-${Math.random()}`,
              type: 'success',
              message: 'Duplicate message',
              timestamp: Date.now(),
              autoDismiss: true,
            },
          })
        }
      >
        Add Duplicate
      </button>
      <button
        data-testid="remove-first"
        onClick={() =>
          dispatch({
            type: 'REMOVE_TOAST',
            payload: state.displayed[0]?.id,
          })
        }
      >
        Remove First
      </button>
      <button data-testid="clear-all" onClick={() => dispatch({ type: 'CLEAR_ALL' })}>
        Clear All
      </button>
    </div>
  );
}

describe('ToastContext', () => {
  it('provides initial empty state', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('0');
  });

  it('adds toast to displayed when < 4', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByTestId('add-toast').click();
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('1');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('0');
  });

  it('adds toast to queue when displayed is full (4 toasts)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add 4 toasts to fill displayed
    act(() => {
      for (let i = 0; i < 4; i++) {
        screen.getByTestId('add-toast').click();
      }
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('4');

    // Add 5th toast - should go to queue
    act(() => {
      screen.getByTestId('add-toast').click();
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('4');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('1');
  });

  it('deduplicates identical messages within 1 second', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add first toast with specific message
    act(() => {
      screen.getByTestId('add-duplicate').click();
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('1');

    // Try to add duplicate immediately (within 1 second)
    act(() => {
      screen.getByTestId('add-duplicate').click();
    });

    // Should still be 1 (deduplicated)
    expect(screen.getByTestId('displayed-count')).toHaveTextContent('1');
  });

  it('removes toast and processes queue (FIFO)', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Fill displayed (4 toasts)
    act(() => {
      for (let i = 0; i < 4; i++) {
        screen.getByTestId('add-toast').click();
      }
    });

    // Add one to queue
    act(() => {
      screen.getByTestId('add-toast').click();
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('4');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('1');

    // Remove first toast
    act(() => {
      screen.getByTestId('remove-first').click();
    });

    // Queue should move to displayed (FIFO)
    expect(screen.getByTestId('displayed-count')).toHaveTextContent('4');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('0');
  });

  it('clears all toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Add multiple toasts
    act(() => {
      for (let i = 0; i < 3; i++) {
        screen.getByTestId('add-toast').click();
      }
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('3');

    // Clear all
    act(() => {
      screen.getByTestId('clear-all').click();
    });

    expect(screen.getByTestId('displayed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('queue-count')).toHaveTextContent('0');
  });
});
