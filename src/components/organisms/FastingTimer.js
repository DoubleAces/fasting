'use client';

/**
 * FastingTimer Component
 * Main container that integrates the timer hook and display
 * Redesigned for dashboard with glassmorphic theme
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
    <div className="space-y-6">
      {/* Timer Display Section */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-3">
          {isActive ? 'Fasting for' : 'Fast Completed'}
        </p>
        
        <TimerDisplay 
          formattedTime={formattedTime} 
          milestone={currentMilestone}
        />
        
        {!isActive && (
          <p className="mt-4 text-sm text-gray-500">
            Great job! Your fast has ended.
          </p>
        )}
      </div>

      {/* Goal Progress Section */}
      {isActive && goalMinutes && (
        <div className="pt-4 border-t border-gray-100">
          <GoalProgressDisplay 
            elapsedMs={elapsedMs}
            lastMealTime={lastMealTime}
            date={date}
          />
        </div>
      )}

      {/* Goal Setting Section */}
      {isActive && (
        <div className="pt-4 border-t border-gray-100">
          {!goalMinutes && (
            <p className="text-center text-sm text-gray-600 mb-4">
              Set a goal to track your progress
            </p>
          )}
          <GoalSettingPanel />
        </div>
      )}
    </div>
  );
}
