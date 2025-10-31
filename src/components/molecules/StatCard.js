import React from 'react';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

/**
 * StatCard Component
 * 
 * Displays a single statistic with an icon, label, and value in a glassmorphic card.
 * Used in the DashboardStats component to show streak, total fasts, and average duration.
 * 
 * @param {string} icon - Emoji icon to display (e.g., '🔥', '📊', '⏱️')
 * @param {string} label - Label text (e.g., 'Current Streak', 'Total Fasts')
 * @param {string|number} value - Value to display (e.g., '5 days', '42', '16h 30m')
 * @param {string} [className] - Additional CSS classes
 */
const StatCard = ({ icon, label, value, className = '' }) => {
  // Create descriptive aria-label combining label and value
  const ariaLabel = `${label}: ${value}`;
  
  return (
    <GlassmorphicCard 
      className={`p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      <div className="text-4xl mb-3" aria-hidden="true">{icon}</div>
      <div className="text-sm text-gray-600 font-medium mb-2">{label}</div>
      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
        {value}
      </div>
    </GlassmorphicCard>
  );
};

export default StatCard;
