'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedDate = format(new Date(data.date), 'MMM d, yyyy');

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-purple-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-700">{formattedDate}</p>
        <p className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
          {data.weight}kg
        </p>
      </div>
    );
  }
  return null;
};

/**
 * DashboardChart Component
 * 
 * Displays a 30-day line chart showing weight trends using Recharts.
 * Requires at least 3 weight entries to display chart.
 * Shows gradient placeholder for users with fewer entries.
 * 
 * @param {Array} entries - Array of entry objects with date and morningWeight
 * @param {string} [className] - Additional CSS classes
 */
const DashboardChart = ({ entries = [], className = '' }) => {
  // Validate entries
  const validEntries = entries || [];
  
  // Transform data for Recharts - only entries with weight data
  const chartData = validEntries
    .filter(entry => entry.morningWeight !== null && entry.morningWeight !== undefined)
    .map(entry => ({
      date: entry.date,
      weight: Number(entry.morningWeight),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  const hasEnoughData = chartData.length >= 3;

  // Format X-axis labels
  const formatXAxis = (dateString) => {
    return format(new Date(dateString), 'MMM d');
  };

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
          Weight Trend
        </h2>
      </div>

      {hasEnoughData ? (
        <GlassmorphicCard className="p-6" role="img" aria-label={`Line chart showing weight trend over ${chartData.length} entries`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9333EA" /> {/* purple-600 */}
                  <stop offset="50%" stopColor="#EC4899" /> {/* pink-600 */}
                  <stop offset="100%" stopColor="#6366F1" /> {/* indigo-600 */}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                stroke="#9333EA"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#9333EA' } }}
                stroke="#9333EA"
                style={{ fontSize: '12px' }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={CustomTooltip} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: '#9333EA', r: 4 }}
                activeDot={{ r: 6, fill: '#EC4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassmorphicCard>
      ) : (
        // Empty state for users with <3 weight entries
        <GlassmorphicCard className="p-8 text-center" role="status" aria-label="Weight chart placeholder: Need 3 or more weight entries to display chart">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4" aria-hidden="true">⚖️</div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Track Your Weight
            </h3>
            <p className="text-gray-600 mb-2">
              Log your weight in 3+ entries to see your trend
            </p>
            <p className="text-sm text-gray-500">
              {chartData.length > 0 
                ? `You have ${chartData.length} weight ${chartData.length === 1 ? 'entry' : 'entries'}. Keep going! 💪`
                : "Start logging your morning weight to visualize your progress"}
            </p>
          </div>
        </GlassmorphicCard>
      )}
    </section>
  );
};

export default DashboardChart;
