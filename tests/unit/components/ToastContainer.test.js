/**
 * ToastContainer Component Unit Tests
 * Tests for toast stack management and positioning
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import ToastContainer from '@/components/organisms/ToastContainer';
import { useToast } from '@/hooks/useToast';

// Test component to trigger toasts with unique messages (to avoid deduplication)
function ToastTrigger() {
  const { showSuccess, showError } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess(`Success! ${Date.now()}`)}>Add Success</button>
      <button onClick={() => showError(`Error! ${Date.now()}`)}>Add Error</button>
    </div>
  );
}

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    const { container } = render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );

    // Container should exist but have no toast children
    const toasts = container.querySelectorAll('[role="status"], [role="alert"]');
    expect(toasts.length).toBe(0);
  });

  it('renders displayed toasts', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    // Add a toast
    fireEvent.click(screen.getByText('Add Success'));

    // Toast should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Success!/)).toBeInTheDocument();
  });

  it('stacks multiple toasts vertically', () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    // Add 3 toasts (messages are unique due to timestamp, avoiding deduplication)
    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));

    const toasts = screen.getAllByText(/Success!|Error!/);
    expect(toasts.length).toBe(3);

    // Check that container has flex-col class for vertical stacking and gap-3 for spacing
    const toastContainer = container.querySelector('.fixed');
    expect(toastContainer).toHaveClass('flex-col');
    expect(toastContainer).toHaveClass('gap-3'); // 12px gap (Tailwind gap-3 = 0.75rem = 12px)
  });

  it('clears all toasts when Escape key pressed', () => {
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    // Add toasts
    fireEvent.click(screen.getByText('Add Success'));
    fireEvent.click(screen.getByText('Add Error'));

    expect(screen.getAllByText(/Success!|Error!/).length).toBe(2);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Toasts should be cleared
    expect(screen.queryByText(/Success!/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error!/)).not.toBeInTheDocument();
  });

  it('positions toasts at top-center', () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    // Add a toast to make container visible
    fireEvent.click(screen.getByText('Add Success'));

    // Find the container element
    const toastContainer = container.querySelector('.fixed');
    expect(toastContainer).toHaveClass('top-4');
    expect(toastContainer).toHaveClass('left-1/2');
    expect(toastContainer).toHaveClass('-translate-x-1/2');
  });

  it('is responsive (full-width on mobile)', () => {
    const { container } = render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    // Add a toast
    fireEvent.click(screen.getByText('Add Success'));

    // Check responsive classes
    const toastContainer = container.querySelector('.fixed');
    expect(toastContainer).toHaveClass('w-full');
    expect(toastContainer).toHaveClass('max-w-[500px]');
  });
});
