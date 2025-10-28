/**
 * GoalProgressDisplay Component
 * Feature 020: Fasting Goal Timer - User Story 2 & 3
 *
 * Displays real-time progress toward fasting goal with visual feedback.
 * Updates automatically when timer ticks (every 60 seconds).
 *
 * @module components/molecules/GoalProgressDisplay
 *
 * **Features:**
 * - Progress bar visualization (fills proportionally to goal)
 * - Text display: "Xh Ym / Xh Ym (Z%)" format
 * - Completion time: "Goal reached at: MMM d, h:mm a"
 * - Exceeded goals: Green bar + "Goal Exceeded!" message + CheckCircle icon
 * - Accessibility: ARIA progressbar with valuenow/valuemin/valuemax
 *
 * **Progress Calculation:**
 * - percentage = (elapsedMs / goalMs) * 100
 * - Bar width capped at 100% even if percentage > 100%
 * - Updates every time elapsedMs prop changes (timer tick)
 *
 * **Completion Time Calculation:**
 * - Takes lastMealTime (HH:mm) + date
 * - Adds goalMinutes to create completion timestamp
 * - Formats with date-fns: "MMM d, h:mm a" (e.g., "Oct 29, 12:00 PM")
 * - Static display (doesn't countdown)
 *
 * **Visual States:**
 * - <100%: Blue progress bar (bg-blue-500)
 * - ≥100%: Green progress bar (bg-green-500), "Goal Exceeded!" text, CheckCircle icon
 *
 * **Props:**
 * @param {Object} props
 * @param {number} props.elapsedMs - Elapsed time in milliseconds (from useFastingTimer)
 * @param {string} props.lastMealTime - Last meal time in "HH:mm" format (e.g., "20:00")
 * @param {Date} props.date - Entry date (for completion time calculation)
 *
 * **Returns:**
 * @returns {JSX.Element|null} Progress display component, or null if no goal is set
 *
 * **Example:**
 * ```jsx
 * <GoalProgressDisplay
 *   elapsedMs={14400000}  // 4 hours
 *   lastMealTime="20:00"
 *   date={new Date('2025-10-28')}
 * />
 * // Displays: "4h 00m / 16h 00m (25%)" with 25% filled blue bar
 * ```
 *
 * **Dependencies:**
 * - useFastingGoal hook (gets goalMinutes from context)
 * - date-fns (format completion time)
 * - lucide-react (CheckCircle icon for exceeded goals)
 */

"use client";

import React, { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useFastingGoal } from "@/contexts/FastingGoalContext";

/**
 * Formats milliseconds into "Xh Ym" display format
 * @param {number} ms - Milliseconds to format
 * @returns {string} Formatted time string (e.g., "4h 30m")
 */
function formatTimeDisplay(ms) {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

/**
 * Displays progress toward fasting goal with visual progress bar
 *
 * @param {Object} props
 * @param {number} props.elapsedMs - Elapsed time in milliseconds
 * @param {string} props.lastMealTime - Time in HH:mm format (for completion time calculation)
 * @param {Date} props.date - Date of the entry (for completion time calculation)
 * @returns {JSX.Element|null} Progress display or null if no goal set
 */
export function GoalProgressDisplay({ elapsedMs, lastMealTime, date }) {
  const { goalMinutes } = useFastingGoal();

  // Calculate progress percentage (T034)
  const progressData = useMemo(() => {
    if (!goalMinutes || elapsedMs === null || elapsedMs === undefined) {
      return null;
    }

    const goalMs = goalMinutes * 60 * 1000;
    const percentage = Math.round((elapsedMs / goalMs) * 100);
    const exceeded = percentage > 100;

    return {
      percentage,
      exceeded,
      elapsedDisplay: formatTimeDisplay(elapsedMs),
      goalDisplay: formatTimeDisplay(goalMs),
      // Cap progress bar at 100% width
      barWidth: Math.min(percentage, 100),
    };
  }, [elapsedMs, goalMinutes]);

  // Calculate goal completion time (T052, T053)
  const completionTime = useMemo(() => {
    if (!goalMinutes || !lastMealTime || !date) {
      return null;
    }

    try {
      // Parse lastMealTime (HH:mm format)
      const [hours, minutes] = lastMealTime.split(":").map(Number);

      // Create completion date by adding goal minutes to last meal time
      const completionDate = new Date(date);
      completionDate.setHours(hours, minutes, 0, 0);
      completionDate.setMinutes(completionDate.getMinutes() + goalMinutes);

      // Format as "MMM d, h:mm a" (e.g., "Oct 29, 12:00 PM")
      return format(completionDate, "MMM d, h:mm a");
    } catch (error) {
      console.error("Failed to calculate completion time:", error);
      return null;
    }
  }, [goalMinutes, lastMealTime, date]);

  // Don't render if no goal is set
  if (!progressData) {
    return null;
  }

  const { percentage, exceeded, elapsedDisplay, goalDisplay, barWidth } =
    progressData;

  return (
    <div className="w-full max-w-md mt-6">
      {/* Progress text with percentage (T035, T037) */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {elapsedDisplay} / {goalDisplay}
        </div>
        <div
          className={`text-sm font-semibold ${exceeded ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}
        >
          {percentage}%
        </div>
      </div>

      {/* Progress bar container (T036) */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        {/* Progress bar fill with ARIA attributes (T040) */}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Fasting progress: ${percentage}% complete`}
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            exceeded
              ? "bg-green-500 dark:bg-green-600"
              : "bg-blue-500 dark:bg-blue-600"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Goal exceeded message with icon (T038, T039) */}
      {exceeded && (
        <div className="flex items-center justify-center mt-3 text-green-600 dark:text-green-400">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-semibold">Goal Exceeded!</span>
        </div>
      )}

      {/* Completion time display (T054, T055, T056) */}
      {completionTime && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Goal reached at:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {completionTime}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
