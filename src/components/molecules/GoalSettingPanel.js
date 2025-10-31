"use client";

/**
 * GoalSettingPanel Component
 * Feature 020: Fasting Goal Timer
 *
 * Provides UI for setting fasting goals via preset buttons or custom input.
 * Follows mobile-first design with 44px+ touch targets and inline layout.
 *
 * @module components/molecules/GoalSettingPanel
 *
 * **Features:**
 * - 4 preset buttons (12h, 16h, 18h, 24h) in 2x2 grid layout
 * - Custom hours input with decimal support (e.g., 14.5)
 * - Real-time validation (1-168 hours range)
 * - Mobile-optimized: 44px minimum touch targets, inputMode="decimal"
 * - Accessible: ARIA labels, error associations, keyboard navigation
 * - Collapsible when goal is active (show/hide with "Change Goal" button)
 *
 * **Validation Rules:**
 * - Minimum: 1 hour
 * - Maximum: 168 hours (7 days)
 * - Format: Decimal hours (e.g., 14.5 = 14 hours 30 minutes)
 * - Stored as: Minutes (rounded to nearest minute)
 *
 * **Usage:**
 * ```jsx
 * import { FastingGoalProvider } from '@/contexts/FastingGoalContext';
 * import { GoalSettingPanel } from '@/components/molecules/GoalSettingPanel';
 *
 * function FastingTimer() {
 *   return (
 *     <FastingGoalProvider>
 *       <GoalSettingPanel />
 *     </FastingGoalProvider>
 *   );
 * }
 * ```
 *
 * **Styling:**
 * - Tailwind CSS utility classes
 * - Dark mode support via dark: variants
 * - Responsive grid (grid-cols-2 for presets)
 * - Blue primary buttons, gray secondary inputs
 */

import React, { useState, useEffect } from "react";
import { useFastingGoal } from "../../contexts/FastingGoalContext.js";
import { useToast } from "@/contexts/ToastContext";

/**
 * GoalSettingPanel - Molecule component for goal selection
 *
 * Features:
 * - 4 preset buttons (12h, 16h, 18h, 24h) in 2x2 grid
 * - Custom hours input with decimal support
 * - Input validation (1-168 hours range)
 * - Mobile-first: 44px+ touch targets, inputMode="decimal"
 * - Error display with ARIA associations
 * - Collapsible interface when goal is active
 *
 * @returns {JSX.Element}
 */
export function GoalSettingPanel() {
  const { goalMinutes, setGoal } = useFastingGoal();
  
  // T023: Toast notifications for success feedback
  const { showSuccess } = useToast();
  
  const [customHours, setCustomHours] = useState("");
  const [error, setError] = useState("");
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);

  // Calculate current goal in hours for display
  const currentGoalHours = goalMinutes ? (goalMinutes / 60).toFixed(1) : null;

  // Determine if panel should be expanded
  // - Always expanded if no goal exists
  // - Collapsed if goal exists, unless user manually expanded it
  // - Respect manual collapse/expand actions
  const isExpanded = manuallyExpanded || (!goalMinutes && !manuallyCollapsed);

  /**
   * Validate goal hours input
   * @param {string} hoursString - Hours as string
   * @returns {Object} { valid: boolean, errorMessage: string, minutes: number }
   */
  const validateGoal = (hoursString) => {
    // Check if input is numeric
    const hours = parseFloat(hoursString);

    if (isNaN(hours)) {
      return {
        valid: false,
        errorMessage: "Goal must be a valid number",
        minutes: null,
      };
    }

    // Check range (1-168 hours)
    if (hours < 1 || hours > 168) {
      return {
        valid: false,
        errorMessage: "Goal must be between 1 and 168 hours",
        minutes: null,
      };
    }

    return {
      valid: true,
      errorMessage: "",
      minutes: Math.round(hours * 60), // Convert to minutes
    };
  };

  /**
   * Handle preset button click
   * @param {number} hours - Preset goal in hours
   */
  const handlePresetClick = (hours) => {
    const minutes = hours * 60;
    setGoal(minutes);
    setError(""); // Clear any errors
    setCustomHours(""); // Clear custom input
    setManuallyExpanded(false); // Collapse after setting goal
    setManuallyCollapsed(false);
    
    // T023: Show success toast
    showSuccess(`Fasting goal set to ${hours} hours`);
  };

  /**
   * Handle custom goal submission
   */
  const handleCustomGoalSubmit = () => {
    const validation = validateGoal(customHours);

    if (validation.valid) {
      setGoal(validation.minutes);
      setError("");
      setCustomHours(""); // Clear input after successful submission
      setManuallyExpanded(false); // Collapse after setting goal
      setManuallyCollapsed(false);
      
      // T023: Show success toast
      const hours = (validation.minutes / 60).toFixed(1);
      showSuccess(`Fasting goal set to ${hours} hours`);
    } else {
      setError(validation.errorMessage);
    }
  };

  /**
   * Handle Enter key in custom input
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCustomGoalSubmit();
    }
  };

  // Error message ID for ARIA association
  const errorId = "goal-input-error";

  return (
    <div className="space-y-4">
      {/* Show "Change Goal" button when goal is active and collapsed */}
      {goalMinutes && !isExpanded && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setManuallyExpanded(true);
              setManuallyCollapsed(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 shadow-md"
          >
            Change Goal
          </button>
        </div>
      )}

      {/* Show goal setting options when expanded or no goal set */}
      {isExpanded && (
        <>
          {/* Preset buttons in 2x2 grid */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handlePresetClick(12)}
              className="h-12 min-h-[44px] px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 shadow-md"
              aria-label="Set 12 hour goal"
            >
              12h
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick(16)}
              className="h-12 min-h-[44px] px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 shadow-md"
              aria-label="Set 16 hour goal"
            >
              16h
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick(18)}
              className="h-12 min-h-[44px] px-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-md"
              aria-label="Set 18 hour goal"
            >
              18h
            </button>

            <button
              type="button"
              onClick={() => handlePresetClick(24)}
              className="h-12 min-h-[44px] px-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-md"
              aria-label="Set 24 hour goal"
            >
              24h
            </button>
          </div>

          {/* Custom input section */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Custom hours"
                value={customHours}
                onChange={(e) => {
                  setCustomHours(e.target.value);
                  if (error) setError(""); // Clear error on change
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 h-12 min-h-[44px] px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white placeholder-gray-400 transition-all"
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? "true" : "false"}
              />

              <button
                type="button"
                onClick={handleCustomGoalSubmit}
                className="h-12 min-h-[44px] px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 shadow-md"
              >
                Set Goal
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div
                id={errorId}
                className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                role="alert"
              >
                {error}
              </div>
            )}
          </div>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center">
            Set a fasting goal between 1 and 168 hours (7 days)
          </p>

          {/* Cancel button when goal is active */}
          {goalMinutes && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setManuallyExpanded(false);
                  setManuallyCollapsed(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
