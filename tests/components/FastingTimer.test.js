/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import FastingTimer from '@/components/organisms/FastingTimer';

// Mock the custom hook
jest.mock('@/hooks/useFastingTimer');
import { useFastingTimer } from '@/hooks/useFastingTimer';

describe('FastingTimer', () => {
  it('should render timer with elapsed time when active', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 5 * 60 * 60 * 1000 + 23 * 60 * 1000, // 5h 23m
      formattedTime: { days: 0, hours: 5, minutes: 23 },
      currentMilestone: null,
      isActive: true
    });

    render(<FastingTimer lastMealTime="10:00" isActive={true} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/23/)).toBeInTheDocument();
  });

  it('should display "Fasting for" label when active', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 2 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 2, minutes: 0 },
      currentMilestone: null,
      isActive: true
    });

    render(<FastingTimer lastMealTime="10:00" isActive={true} />);

    expect(screen.getByText(/fasting for/i)).toBeInTheDocument();
  });

  it('should display milestone badge when milestone reached', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 12 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 12, minutes: 0 },
      currentMilestone: '12-Hour Fast',
      isActive: true
    });

    render(<FastingTimer lastMealTime="10:00" isActive={true} />);

    expect(screen.getByText('12-Hour Fast')).toBeInTheDocument();
  });

  it('should not render when lastMealTime is null', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: null,
      formattedTime: null,
      currentMilestone: null,
      isActive: false
    });

    const { container } = render(<FastingTimer lastMealTime={null} isActive={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should display "Fast Completed" when isActive is false', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 18 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 18, minutes: 0 },
      currentMilestone: '18-Hour Fast',
      isActive: false
    });

    render(<FastingTimer lastMealTime="10:00" isActive={false} />);

    expect(screen.getByText(/fast completed/i)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it('should pass formattedTime to TimerDisplay', () => {
    const formattedTime = { days: 1, hours: 2, minutes: 15 };
    useFastingTimer.mockReturnValue({
      elapsedMs: 26 * 60 * 60 * 1000,
      formattedTime,
      currentMilestone: '24-Hour Fast',
      isActive: true
    });

    render(<FastingTimer lastMealTime="22:00" isActive={true} />);

    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(screen.getByText(/day/i)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('should update when lastMealTime prop changes', () => {
    const { rerender } = render(<FastingTimer lastMealTime="10:00" isActive={true} />);

    useFastingTimer.mockReturnValue({
      elapsedMs: 3 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 3, minutes: 0 },
      currentMilestone: null,
      isActive: true
    });

    rerender(<FastingTimer lastMealTime="09:00" isActive={true} />);

    expect(useFastingTimer).toHaveBeenCalledWith('09:00', true);
  });

  it('should handle transition from active to completed', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 16 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 16, minutes: 0 },
      currentMilestone: '16-Hour Fast',
      isActive: false
    });

    render(<FastingTimer lastMealTime="10:00" isActive={false} />);

    expect(screen.getByText(/fast completed/i)).toBeInTheDocument();
    expect(screen.queryByText(/fasting for/i)).not.toBeInTheDocument();
  });

  it('should render TimerDisplay component', () => {
    useFastingTimer.mockReturnValue({
      elapsedMs: 5 * 60 * 60 * 1000,
      formattedTime: { days: 0, hours: 5, minutes: 0 },
      currentMilestone: null,
      isActive: true
    });

    render(<FastingTimer lastMealTime="10:00" isActive={true} />);

    // TimerDisplay should render time element
    const timeElement = screen.queryByRole('time');
    expect(timeElement).toBeInTheDocument();
  });
});
