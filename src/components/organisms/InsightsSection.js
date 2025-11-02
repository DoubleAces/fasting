/**
 * InsightsSection Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T046-T052 - Create InsightsSection organism
 * 
 * Orchestrates the display of personalized insights for an entry.
 * Shows gradient-styled callout boxes for each insight type.
 * 
 * Props:
 * - insights: object (required) - Enhanced insights from entryInsightsService
 */

'use client';

import React from 'react';
import InsightCalloutBox from '@/components/molecules/InsightCalloutBox';
import { formatDuration } from '@/lib/utils/formatters';

export default function InsightsSection({ insights }) {
  // Handle insufficient data
  if (!insights) {
    return (
      <section 
        className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-purple-200/50 shadow-soft"
        role="region"
        aria-label="Entry Insights"
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📊 Personalized Insights
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg mb-2">
              ℹ️ Log more entries to unlock insights
            </p>
            <p className="text-gray-600">
              You need at least 5 entries to see personalized pattern analysis. 
              Keep logging to discover your fasting trends!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Destructure insights
  const {
    historicalRanking,
    weekendVsWeekdayPattern,
    deviationFromTypical,
    streakContribution,
  } = insights;

  return (
    <section 
      className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-purple-200/50 shadow-soft space-y-6"
      role="region"
      aria-label="Entry Insights"
    >
      <h2 className="text-2xl font-semibold text-gray-900">
        📊 Personalized Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Historical Ranking Insight */}
        {historicalRanking && historicalRanking.rank && (
          <InsightCalloutBox
            icon="🏆"
            title="Historical Ranking"
            description={`This fast ranks in the top ${100 - historicalRanking.percentile}% of your ${historicalRanking.totalEntries} total fasts. You're ranked #${historicalRanking.rank}!`}
            variant="success"
          />
        )}

        {/* Weekend vs Weekday Pattern */}
        {weekendVsWeekdayPattern && (
          <InsightCalloutBox
            icon="📅"
            title="Weekend vs Weekday Pattern"
            description={
              weekendVsWeekdayPattern.difference > 30
                ? `You typically fast ${formatDuration(weekendVsWeekdayPattern.difference)} longer on weekends (avg: ${formatDuration(weekendVsWeekdayPattern.weekendAvg)}) compared to weekdays (avg: ${formatDuration(weekendVsWeekdayPattern.weekdayAvg)}).`
                : weekendVsWeekdayPattern.difference < -30
                ? `You typically fast ${formatDuration(Math.abs(weekendVsWeekdayPattern.difference))} longer on weekdays (avg: ${formatDuration(weekendVsWeekdayPattern.weekdayAvg)}) compared to weekends (avg: ${formatDuration(weekendVsWeekdayPattern.weekendAvg)}).`
                : `Your fasting duration is consistent between weekdays (${formatDuration(weekendVsWeekdayPattern.weekdayAvg)}) and weekends (${formatDuration(weekendVsWeekdayPattern.weekendAvg)}).`
            }
            variant="info"
          />
        )}

        {/* Deviation from Typical Duration */}
        {deviationFromTypical && deviationFromTypical.typicalDuration && !isNaN(deviationFromTypical.percentDeviation) && (
          <InsightCalloutBox
            icon={deviationFromTypical.deviation > 0 ? '📈' : '📉'}
            title="Compared to Your Typical Fast"
            description={
              Math.abs(deviationFromTypical.percentDeviation) < 10
                ? `This fast is right on track with your typical duration of ${formatDuration(deviationFromTypical.typicalDuration)}.`
                : deviationFromTypical.deviation > 0
                ? `This fast is ${formatDuration(Math.abs(deviationFromTypical.deviation))} (${Math.abs(deviationFromTypical.percentDeviation)}%) longer than your typical ${formatDuration(deviationFromTypical.typicalDuration)}. Great progress! 💪`
                : `This fast is ${formatDuration(Math.abs(deviationFromTypical.deviation))} (${Math.abs(deviationFromTypical.percentDeviation)}%) shorter than your typical ${formatDuration(deviationFromTypical.typicalDuration)}.`
            }
            variant={deviationFromTypical.deviation >= 0 ? 'success' : 'info'}
          />
        )}

        {/* Streak Contribution */}
        {streakContribution && (
          <InsightCalloutBox
            icon="🔥"
            title="Current Streak"
            description={
              streakContribution.currentStreak > 1
                ? `You're on a ${streakContribution.currentStreak}-day fasting streak! ${streakContribution.continuesStreak ? 'This entry continues your momentum.' : 'Keep it going!'}`
                : streakContribution.continuesStreak
                ? 'This entry continues your daily logging habit. Great consistency!'
                : 'Start building a streak by logging consecutive days!'
            }
            variant={streakContribution.currentStreak > 3 ? 'success' : 'info'}
          />
        )}
      </div>

      {/* Additional Insights Row (if needed) */}
      {insights.isLongestThisMonth && (
        <InsightCalloutBox
          icon="✨"
          title="Monthly Achievement"
          description="This is your longest fast this month! Fantastic work!"
          variant="success"
        />
      )}
    </section>
  );
}
