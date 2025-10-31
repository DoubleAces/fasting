/**
 * FastingTimerCard Component
 * Card wrapper for the fasting timer with glassmorphic styling
 */

import React from 'react';
import FastingTimer from '@/components/organisms/FastingTimer';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';
import GradientButton from '@/components/atoms/GradientButton';

/**
 * Card wrapper for fasting timer with styling
 * @param {string} lastMealTime - Time in HH:mm format
 * @param {Date} date - Date of the entry
 * @param {boolean} isActive - Whether the fast is currently active
 */
export default function FastingTimerCard({ lastMealTime, date, isActive }) {
  // Show message when no active fast
  if (!isActive || !lastMealTime) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
            Timer
          </h2>
        </div>
        <GlassmorphicCard className="p-12 text-center">
          <div className="text-8xl mb-6" aria-hidden="true">⏱️</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4 pb-2">
            No Active Fast
          </h3>
          <p className="text-gray-600 mb-6 text-lg">
            Start logging a new fast to see your timer here
          </p>
          <GradientButton
            href="/entries"
            className="inline-block"
          >
            Create Entry
          </GradientButton>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
          Timer
        </h2>
      </div>
      <GlassmorphicCard className="p-6">
        <FastingTimer lastMealTime={lastMealTime} date={date} isActive={isActive} />
      </GlassmorphicCard>
    </div>
  );
}
