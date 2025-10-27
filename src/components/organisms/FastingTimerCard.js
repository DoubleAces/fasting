/**
 * FastingTimerCard Component
 * Card wrapper for the fasting timer with Tailwind styling
 */

import React from 'react';
import FastingTimer from '@/components/organisms/FastingTimer';

/**
 * Card wrapper for fasting timer with styling
 * @param {string} lastMealTime - Time in HH:mm format
 * @param {boolean} isActive - Whether the fast is currently active
 */
export default function FastingTimerCard({ lastMealTime, isActive }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <FastingTimer lastMealTime={lastMealTime} isActive={isActive} />
    </div>
  );
}
