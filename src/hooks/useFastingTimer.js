'use client';

/**
 * Custom hook for managing fasting timer state
 * Updates every 60 seconds when active
 */

import { useState, useEffect, useMemo } from 'react';
import { calculateElapsedTime, formatElapsedTime, detectMilestone } from '@/lib/utils/fastingTimerUtils';

/**
 * Hook for managing fasting timer with automatic updates
 * @param {string} lastMealTime - Time in HH:mm format
 * @param {Date} date - Date of the entry
 * @param {boolean} isActive - Whether the fast is currently active
 * @returns {Object} Timer state with elapsed time, formatted time, and milestone
 */
export function useFastingTimer(lastMealTime, date, isActive) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Calculate elapsed time
  const elapsedMs = useMemo(() => {
    if (!lastMealTime) return null;
    return calculateElapsedTime(lastMealTime, currentTime, date);
  }, [lastMealTime, date, currentTime]);

  // Format elapsed time
  const formattedTime = useMemo(() => {
    if (elapsedMs === null) return null;
    return formatElapsedTime(elapsedMs);
  }, [elapsedMs]);

  // Detect current milestone
  const currentMilestone = useMemo(() => {
    if (elapsedMs === null) return null;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    return detectMilestone(elapsedHours);
  }, [elapsedMs]);

  // Set up 60-second interval when active
  useEffect(() => {
    if (!isActive || !lastMealTime) {
      return;
    }

    // Update immediately on mount or when isActive changes
    setCurrentTime(new Date());

    // Set up interval to update every 60 seconds
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    // Cleanup on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [lastMealTime, date, isActive]);

  return {
    elapsedMs,
    formattedTime,
    currentMilestone,
    isActive
  };
}
