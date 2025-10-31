'use client';

/**
 * DashboardTimerSection - Client Component Wrapper
 * 
 * Wraps FastingTimerCard with FastingGoalProvider to enable goal functionality.
 * This is needed because FastingTimer uses useFastingGoal hook which requires the provider.
 * 
 * This component is a Client Component boundary that allows the main dashboard
 * page to remain a Server Component for optimal data fetching.
 */

import React from 'react';
import { FastingGoalProvider } from '@/contexts/FastingGoalContext';
import FastingTimerCard from '@/components/organisms/FastingTimerCard';

/**
 * @param {Object} props
 * @param {string|null} props.lastMealTime - ISO timestamp of last meal (starts fast)
 * @param {string|null} props.date - Date of the entry
 * @param {boolean} props.isActive - Whether there's an active fast
 */
export default function DashboardTimerSection({ lastMealTime, date, isActive }) {
  return (
    <FastingGoalProvider>
      <FastingTimerCard
        lastMealTime={lastMealTime}
        date={date}
        isActive={isActive}
      />
    </FastingGoalProvider>
  );
}
