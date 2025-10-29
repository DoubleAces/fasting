/**
 * Toast Component Unit Tests
 * Tests for individual toast notification rendering and behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Toast from '@/components/molecules/Toast';

describe('Toast Component', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders success toast with green background', () => {
    render(
      <Toast
        id="test-1"
        type="success"
        message="Success message"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-green-500');
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders error toast with red background', () => {
    render(
      <Toast
        id="test-2"
        type="error"
        message="Error message"
        onDismiss={mockOnDismiss}
        autoDismiss={false}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-red-500');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('displays message text', () => {
    render(
      <Toast
        id="test-3"
        type="success"
        message="Test message content"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('shows close button (X)', () => {
    render(
      <Toast
        id="test-4"
        type="success"
        message="Message"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    const closeButton = screen.getByRole('button', { name: /dismiss/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', () => {
    render(
      <Toast
        id="test-5"
        type="success"
        message="Message"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close|dismiss/i });
    fireEvent.click(closeButton);

    // Wait for animation delay (300ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDismiss).toHaveBeenCalledWith('test-5');
  });

  it('auto-dismisses success toast after 5 seconds', async () => {
    render(
      <Toast
        id="test-6"
        type="success"
        message="Auto dismiss message"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('test-6');
    });
  });

  it('does NOT auto-dismiss error toast', () => {
    render(
      <Toast
        id="test-7"
        type="error"
        message="Error message"
        onDismiss={mockOnDismiss}
        autoDismiss={false}
      />
    );

    // Fast-forward 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    const mockAction = jest.fn();

    render(
      <Toast
        id="test-8"
        type="error"
        message="Error with action"
        onDismiss={mockOnDismiss}
        autoDismiss={false}
        action={{
          label: 'Retry',
          onAction: mockAction,
        }}
      />
    );

    const actionButton = screen.getByRole('button', { name: /retry/i });
    expect(actionButton).toBeInTheDocument();
  });

  it('calls action.onAction and dismisses when action clicked', () => {
    const mockAction = jest.fn();

    render(
      <Toast
        id="test-9"
        type="error"
        message="Error with action"
        onDismiss={mockOnDismiss}
        autoDismiss={false}
        action={{
          label: 'Retry',
          onAction: mockAction,
        }}
      />
    );

    const actionButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(actionButton);

    expect(mockAction).toHaveBeenCalled();
    
    // Wait for animation delay (300ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledWith('test-9');
  });

  it('has correct ARIA attributes', () => {
    const { rerender } = render(
      <Toast
        id="test-10"
        type="success"
        message="Success"
        onDismiss={mockOnDismiss}
        autoDismiss={true}
      />
    );

    let toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');

    rerender(
      <Toast
        id="test-11"
        type="error"
        message="Error"
        onDismiss={mockOnDismiss}
        autoDismiss={false}
      />
    );

    toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });
});
