/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFastingTimer } from '@/hooks/useFastingTimer';

describe('useFastingTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should return initial elapsed time when active', () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T12:00:00'); // 2 hours after meal
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    expect(result.current.elapsedMs).toBe(2 * 60 * 60 * 1000); // 2 hours in ms
    expect(result.current.isActive).toBe(true);
  });

  it('should update elapsed time every 60 seconds', async () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T12:00:00');
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    const initialElapsed = result.current.elapsedMs;

    // Advance time by 60 seconds
    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    await waitFor(() => {
      expect(result.current.elapsedMs).toBe(initialElapsed + 60 * 1000);
    });
  });

  it('should not update when isActive is false', () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T12:00:00');
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, false));

    const initialElapsed = result.current.elapsedMs;
    expect(result.current.isActive).toBe(false);

    // Advance time
    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    // Should remain the same
    expect(result.current.elapsedMs).toBe(initialElapsed);
  });

  it('should return null when lastMealTime is not provided', () => {
    const { result } = renderHook(() => useFastingTimer(null, true));

    expect(result.current.elapsedMs).toBeNull();
    expect(result.current.formattedTime).toBeNull();
    expect(result.current.currentMilestone).toBeNull();
  });

  it('should detect 12-hour milestone', async () => {
    const lastMealTime = '00:00';
    const now = new Date('2025-10-27T12:00:00'); // Exactly 12 hours
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    await waitFor(() => {
      expect(result.current.currentMilestone).toBe('12-Hour Fast');
    });
  });

  it('should detect 16-hour milestone', async () => {
    const lastMealTime = '00:00';
    const now = new Date('2025-10-27T16:00:00'); // Exactly 16 hours
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    await waitFor(() => {
      expect(result.current.currentMilestone).toBe('16-Hour Fast');
    });
  });

  it('should return formatted time object', () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T15:30:00'); // 5.5 hours = 5h 30m
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    expect(result.current.formattedTime).toEqual({
      days: 0,
      hours: 5,
      minutes: 30
    });
  });

  it('should handle overnight fasts correctly', () => {
    const lastMealTime = '22:00'; // 10 PM yesterday
    const now = new Date('2025-10-27T08:00:00'); // 8 AM today = 10 hours elapsed
    jest.setSystemTime(now);

    const { result } = renderHook(() => useFastingTimer(lastMealTime, true));

    expect(result.current.formattedTime).toEqual({
      days: 0,
      hours: 10,
      minutes: 0
    });
  });

  it('should clean up interval on unmount', () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T12:00:00');
    jest.setSystemTime(now);

    const { unmount } = renderHook(() => useFastingTimer(lastMealTime, true));

    unmount();

    expect(global.clearInterval).toHaveBeenCalled();
  });

  it('should restart interval when isActive changes from false to true', () => {
    const lastMealTime = '10:00';
    const now = new Date('2025-10-27T12:00:00');
    jest.setSystemTime(now);

    const { result, rerender } = renderHook(
      ({ isActive }) => useFastingTimer(lastMealTime, isActive),
      { initialProps: { isActive: false } }
    );

    const inactiveElapsed = result.current.elapsedMs;

    // Change to active
    rerender({ isActive: true });

    // Advance time
    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    // Should now be updating
    expect(result.current.elapsedMs).toBeGreaterThan(inactiveElapsed);
  });
});
