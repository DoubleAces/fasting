/**
 * FastingTimer Component
 * Main container that integrates the timer hook and display
 */

import React from 'react';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import TimerDisplay from '@/components/molecules/TimerDisplay';
import { GoalSettingPanel } from '@/components/molecules/GoalSettingPanel';
import { GoalProgressDisplay } from '@/components/molecules/GoalProgressDisplay';
import { useFastingGoal } from '@/contexts/FastingGoalContext';

/**
 * Displays active or completed fasting timer
 * @param {string} lastMealTime - Time in HH:mm format
 * @param {Date} date - Date of the entry
 * @param {boolean} isActive - Whether the fast is currently active
 */
export default function FastingTimer({ lastMealTime, date, isActive }) {
  const { formattedTime, currentMilestone, elapsedMs } = useFastingTimer(lastMealTime, date, isActive);
  const { goalMinutes } = useFastingGoal();

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

      {/* Show GoalProgressDisplay if actively fasting and goal is set (T042, T043, T044, T058) */}
      {isActive && goalMinutes && (
        <GoalProgressDisplay 
          elapsedMs={elapsedMs}
          lastMealTime={lastMealTime}
          date={date}
        />
      )}

      {/* Always show GoalSettingPanel when actively fasting to allow goal changes (T024, T025, T080) */}
      {isActive && (
        <div className="mt-6 w-full max-w-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {goalMinutes 
              ? `Current goal: ${(goalMinutes / 60).toFixed(1)} hours. Change your goal below:` 
              : 'Set a goal to track your progress'}
          </p>
          <GoalSettingPanel />
        </div>
      )}
    </div>
  );
}
