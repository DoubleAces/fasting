'use client';

import React from 'react';
import RecentEntryItem from '@/components/molecules/RecentEntryItem';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

/**
 * RecentFastsList Component
 * 
 * Displays the 5 most recent fasting entries.
 * Shows encouraging placeholders for users with fewer than 5 entries.
 * 
 * @param {Array} entries - Array of entry objects (max 5)
 * @param {string} [className] - Additional CSS classes
 */
const RecentFastsList = ({ entries = [], className = '' }) => {
  // Handle null/undefined entries
  const validEntries = entries || [];
  
  const maxEntries = 5;
  const entryCount = validEntries.length;
  const hasNoEntries = entryCount === 0;

  // Create placeholder slots for empty positions
  const placeholderCount = Math.max(0, maxEntries - entryCount);
  const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);

  // Placeholder messages for new users
  const placeholderMessages = [
    "Log your first fast",
    "Build your streak",
    "Track your progress",
    "Stay consistent",
    "Achieve your goals"
  ];

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
          Recent Fasts
        </h2>
      </div>

      <div className="space-y-3">
        {/* Show actual entries */}
        {validEntries.map((entry) => (
          <RecentEntryItem key={entry._id} entry={entry} />
        ))}

        {/* Show placeholders for empty slots */}
        {placeholders.map((index) => (
          <GlassmorphicCard
            key={`placeholder-${index}`}
            className="p-4 text-center opacity-60"
          >
            <div className="text-sm text-gray-500 italic">
              {hasNoEntries
                ? placeholderMessages[index]
                : "Keep logging your fasts"}
            </div>
          </GlassmorphicCard>
        ))}

        {/* Empty state message for users with no entries */}
        {hasNoEntries && (
          <div className="text-center py-4">
            <p className="text-gray-600">
              Start tracking your fasting journey today! 🚀
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentFastsList;
