/**
 * ShareEntryButton Component Tests
 * 
 * Feature: 025-entry-details-enhancement
 * Task: Share Entry functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareEntryButton from '@/components/molecules/ShareEntryButton';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('ShareEntryButton - Molecule Component', () => {
  const mockEntry = {
    _id: '123456789',
    date: '2025-10-31T00:00:00.000Z',
    startTime: '2025-10-30T18:00:00.000Z',
    endTime: '2025-10-31T12:00:00.000Z',
    duration: 64800000, // 18 hours
    type: '16:8',
    weight: 75.5,
    waist: 85.2,
    mood: 'Energized',
    notes: 'Felt great today!',
    mealsBeforeFast: ['Dinner - Salmon and vegetables'],
    mealsAfterFast: ['Breakfast - Eggs and avocado'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render share button', () => {
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();
  });

  it('should have share icon', () => {
    const { container } = render(<ShareEntryButton entry={mockEntry} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should show share menu on desktop when clicked', async () => {
    // Mock as desktop (no native share)
    delete navigator.share;
    
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/copy to clipboard/i)).toBeInTheDocument();
      expect(screen.getByText(/share on facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/share on twitter/i)).toBeInTheDocument();
    });
  });

  it('should copy entry data to clipboard from menu', async () => {
    delete navigator.share;
    
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    await waitFor(() => {
      const copyButton = screen.getByText(/copy to clipboard/i);
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Fasting Entry');
    expect(copiedText).toContain('18h'); // Duration
    expect(copiedText).toContain('16:8'); // Type
    expect(copiedText).toContain('75.5'); // Weight
  });

  it('should show success message after copy', async () => {
    delete navigator.share;
    
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    await waitFor(() => {
      const copyButton = screen.getByText(/copy to clipboard/i);
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('should reset success message after timeout', async () => {
    jest.useFakeTimers();
    
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    // Click "Copy to Clipboard" from menu
    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('should handle clipboard error gracefully', async () => {
    // Mock clipboard error
    navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Clipboard failed')));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    // Click "Copy to Clipboard" from menu
    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should have proper styling', () => {
    const { container } = render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button.className).toMatch(/bg-white/);
    expect(button.className).toMatch(/border/);
    expect(button.className).toMatch(/rounded-lg/);
  });

  it('should have hover effects', () => {
    const { container } = render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button.className).toMatch(/hover:/);
  });

  it('should format entry data correctly', async () => {
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    // Click "Copy to Clipboard" from menu
    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    
    // Check format
    expect(copiedText).toContain('📅 Date:');
    expect(copiedText).toContain('⏱️ Duration:');
    expect(copiedText).toContain('🎯 Type:');
    expect(copiedText).toContain('⚖️ Weight:');
  });

  it('should include notes if present', async () => {
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    // Click "Copy to Clipboard" from menu
    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Felt great today!');
  });

  it('should handle entry without optional fields', async () => {
    const minimalEntry = {
      _id: '123',
      date: '2025-10-31T00:00:00.000Z',
      startTime: '2025-10-30T18:00:00.000Z',
      endTime: '2025-10-31T12:00:00.000Z',
      duration: 64800000,
      type: '16:8',
    };

    render(<ShareEntryButton entry={minimalEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);

    // Click "Copy to Clipboard" from menu
    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('18h'); // Duration
    expect(copiedText).not.toContain('Weight:'); // Optional field
  });

  it('should have accessible button', () => {
    render(<ShareEntryButton entry={mockEntry} />);
    
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toHaveAttribute('aria-label');
  });
});
