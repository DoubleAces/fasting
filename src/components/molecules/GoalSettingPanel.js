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
 *
 * @returns {JSX.Element}
 */
export function GoalSettingPanel() {
  const { goalMinutes, setGoal } = useFastingGoal();
  
  // T023: Toast notifications for success feedback
  const { showSuccess } = useToast();
  
  const [customHours, setCustomHours] = useState("");
  const [error, setError] = useState("");

  // Calculate current goal in hours for display
  const currentGoalHours = goalMinutes ? (goalMinutes / 60).toFixed(1) : null;

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
      
      // T023: Show success toast
      showSuccess(`Fasting goal set to ${validation.hours} hours`);
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
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
      {/* Current goal display */}
      {currentGoalHours && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current goal: {currentGoalHours} hours
        </div>
      )}

      {/* Preset buttons in 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handlePresetClick(12)}
          className="h-12 min-h-[44px] px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Set 12 hour goal"
        >
          12h
        </button>

        <button
          type="button"
          onClick={() => handlePresetClick(16)}
          className="h-12 min-h-[44px] px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Set 16 hour goal"
        >
          16h
        </button>

        <button
          type="button"
          onClick={() => handlePresetClick(18)}
          className="h-12 min-h-[44px] px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          aria-label="Set 18 hour goal"
        >
          18h
        </button>

        <button
          type="button"
          onClick={() => handlePresetClick(24)}
          className="h-12 min-h-[44px] px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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
            className="flex-1 h-12 min-h-[44px] px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? "true" : "false"}
          />

          <button
            type="button"
            onClick={handleCustomGoalSubmit}
            className="h-12 min-h-[44px] px-6 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            Set Goal
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Set a fasting goal between 1 and 168 hours (7 days). You can change your
        goal anytime during your fast.
      </p>
    </div>
  );
}
