/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import TimerDisplay from '@/components/molecules/TimerDisplay';

describe('TimerDisplay', () => {
  it('should display hours and minutes', () => {
    const formattedTime = { days: 0, hours: 5, minutes: 23 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    // Use getByRole to query the visible timer element
    const timeElement = screen.getByRole('timer');
    expect(timeElement.textContent).toContain('5');
    expect(timeElement.textContent).toContain('23');
    expect(timeElement.textContent).toContain('hours');
    expect(timeElement.textContent).toContain('minutes');
  });

  it('should display days when fast is over 24 hours', () => {
    const formattedTime = { days: 1, hours: 2, minutes: 15 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    // Use getAllByText for multiple matches, or be more specific
    expect(screen.getByText('1')).toBeInTheDocument(); // day count
    expect(screen.getByText('day')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // hours
    expect(screen.getByText('15')).toBeInTheDocument(); // minutes
  });

  it('should handle plural days correctly', () => {
    const formattedTime = { days: 3, hours: 0, minutes: 0 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    const timeElement = screen.getByRole('timer');
    expect(timeElement.textContent).toContain('3');
    expect(timeElement.textContent).toContain('days');
  });

  it('should use semantic time element with datetime attribute', () => {
    const formattedTime = { days: 0, hours: 5, minutes: 23 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    const timeElement = screen.getByRole('timer');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement).toHaveAttribute('datetime');
  });

  it('should display milestone badge when provided', () => {
    const formattedTime = { days: 0, hours: 12, minutes: 0 };
    const milestone = '12-Hour Fast';

    const { container } = render(<TimerDisplay formattedTime={formattedTime} milestone={milestone} />);

    // Milestone includes emoji, so check container text content
    expect(container.textContent).toContain('12-Hour Fast');
  });

  it('should display 16-hour milestone badge', () => {
    const formattedTime = { days: 0, hours: 16, minutes: 30 };
    const milestone = '16-Hour Fast';

    const { container } = render(<TimerDisplay formattedTime={formattedTime} milestone={milestone} />);

    expect(container.textContent).toContain('16-Hour Fast');
  });

  it('should not display milestone badge when not provided', () => {
    const formattedTime = { days: 0, hours: 5, minutes: 23 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    // Should not have milestone badge
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should handle zero elapsed time', () => {
    const formattedTime = { days: 0, hours: 0, minutes: 0 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    // Should display "0 hours 0 minutes"
    expect(screen.getByText('hours')).toBeInTheDocument();
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });

  it('should format datetime attribute correctly for 5h 23m', () => {
    const formattedTime = { days: 0, hours: 5, minutes: 23 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    const timeElement = screen.getByRole('timer');
    expect(timeElement.getAttribute('datetime')).toMatch(/PT5H23M/i);
  });

  it('should format datetime attribute correctly for multi-day fast', () => {
    const formattedTime = { days: 1, hours: 2, minutes: 15 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    const timeElement = screen.getByRole('timer');
    // ISO 8601 duration format: P1DT2H15M
    expect(timeElement.getAttribute('datetime')).toMatch(/P1DT2H15M/i);
  });

  it('should have accessible time element', () => {
    const formattedTime = { days: 0, hours: 5, minutes: 23 };

    render(<TimerDisplay formattedTime={formattedTime} />);

    const timeElement = screen.getByRole('timer');
    expect(timeElement).toBeInTheDocument();
  });

  it('should display milestone badge with proper styling', () => {
    const formattedTime = { days: 0, hours: 24, minutes: 0 };
    const milestone = '24-Hour Fast';

    const { container } = render(
      <TimerDisplay formattedTime={formattedTime} milestone={milestone} />
    );

    expect(container.textContent).toContain('24-Hour Fast');
    // Find the badge span element
    const badgeSpan = container.querySelector('.rounded-full');
    expect(badgeSpan).toBeTruthy();
    expect(badgeSpan.className).toContain('bg-gradient');
  });
});
