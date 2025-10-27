/**
 * FastingTimer Component
 * Main container that integrates the timer hook and display
 */

import React from 'react';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import TimerDisplay from '@/components/molecules/TimerDisplay';

/**
 * Displays active or completed fasting timer
 * @param {string} lastMealTime - Time in HH:mm format
 * @param {Date} date - Date of the entry
 * @param {boolean} isActive - Whether the fast is currently active
 */
export default function FastingTimer({ lastMealTime, date, isActive }) {
  const { formattedTime, currentMilestone } = useFastingTimer(lastMealTime, date, isActive);

  // Don't render if no data
  if (!formattedTime) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {isActive ? 'Fasting for' : 'Fast Completed'}
      </h2>
      
      <TimerDisplay 
        formattedTime={formattedTime} 
        milestone={currentMilestone}
      />
      
      {!isActive && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Great job! Your fast has ended.
        </p>
      )}
    </div>
  );
}
