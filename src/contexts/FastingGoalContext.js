"use client";

/**
 * FastingGoalContext - Session State Management for Fasting Goals
 * Feature 020: Fasting Goal Timer
 *
 * Provides React Context for managing fasting goal state across the application.
 * State persists in localStorage to survive browser refreshes during active fast.
 *
 * @module FastingGoalContext
 *
 * **State Shape:**
 * ```javascript
 * {
 *   goalMinutes: number | null,  // Goal duration in minutes (1-10080), null if no goal
 *   setAt: string | null,        // ISO timestamp when goal was set, null if no goal
 *   setGoal: (minutes: number) => void,    // Set a new goal
 *   clearGoal: () => void         // Clear the current goal (called after fast ends)
 * }
 * ```
 *
 * **localStorage Key:** 'fasting-goal-session'
 *
 * **Lifecycle:**
 * 1. User sets goal → stored in state + localStorage
 * 2. Browser refresh → goal restored from localStorage
 * 3. Fast ends, entry saved → clearGoal() removes from both state and localStorage
 *
 * **Error Handling:**
 * - localStorage failures are caught and logged
 * - Graceful degradation: state persists in memory even if localStorage fails
 * - Context throws error if hook used outside provider
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const FastingGoalContext = createContext(null);

const STORAGE_KEY = "fasting-goal-session";

/**
 * FastingGoalProvider Component
 * Wraps components that need access to fasting goal state
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function FastingGoalProvider({ children }) {
  const [goalMinutes, setGoalMinutes] = useState(null);
  const [setAt, setSetAt] = useState(null);

  // Restore goal from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGoalMinutes(data.goalMinutes);
        setSetAt(data.setAt);
      }
    } catch (error) {
      console.error("Failed to restore goal from localStorage:", error);
      // Graceful degradation - continue with null state
    }
  }, []);

  // Sync to localStorage whenever goal changes
  useEffect(() => {
    if (goalMinutes !== null && setAt !== null) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ goalMinutes, setAt }),
        );
      } catch (error) {
        console.error("Failed to save goal to localStorage:", error);
        // Graceful degradation - state still updated in memory
        // TODO: Show toast notification to user (T011b)
      }
    }
  }, [goalMinutes, setAt]);

  /**
   * Set a new fasting goal
   *
   * Updates both in-memory state and localStorage. If localStorage fails,
   * state is still updated (graceful degradation).
   *
   * @param {number} minutes - Goal duration in minutes (1-10080)
   * @throws {Error} May log error if localStorage fails, but does not throw
   *
   * @example
   * setGoal(960);  // Set 16-hour goal
   * setGoal(1080); // Set 18-hour goal
   */
  const setGoal = (minutes) => {
    setGoalMinutes(minutes);
    setSetAt(new Date().toISOString());
  };

  /**
   * Clear the current goal
   *
   * Removes goal from both state and localStorage.
   * Typically called after fast ends and entry is saved to database.
   *
   * @throws {Error} May log error if localStorage fails, but does not throw
   *
   * @example
   * // After user ends fast and entry is persisted
   * clearGoal();
   */
  const clearGoal = () => {
    setGoalMinutes(null);
    setSetAt(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear goal from localStorage:", error);
    }
  };

  const value = {
    goalMinutes,
    setAt,
    setGoal,
    clearGoal,
  };

  return (
    <FastingGoalContext.Provider value={value}>
      {children}
    </FastingGoalContext.Provider>
  );
}

/**
 * Hook to access fasting goal context
 * Must be used within FastingGoalProvider
 *
 * @returns {Object} Goal state and methods
 * @returns {number|null} goalMinutes - Goal duration in minutes, null if no goal set
 * @returns {string|null} setAt - ISO timestamp when goal was set, null if no goal
 * @returns {Function} setGoal - Function to set a new goal
 * @returns {Function} clearGoal - Function to clear the current goal
 *
 * @throws {Error} If used outside FastingGoalProvider
 *
 * @example
 * const { goalMinutes, setGoal, clearGoal } = useFastingGoal();
 *
 * // Set 16 hour goal
 * setGoal(960);
 *
 * // Clear goal after fast ends
 * clearGoal();
 */
export function useFastingGoal() {
  const context = useContext(FastingGoalContext);

  if (context === null) {
    throw new Error("useFastingGoal must be used within a FastingGoalProvider");
  }

  return context;
}
