import React from 'react';
import EntryCard from './EntryCard';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * EntryList Component
 * 
 * Displays a list of fasting entries as cards.
 * Handles loading, error, and empty states.
 * Passes through edit and delete handlers to individual cards.
 * 
 * @param {Array} entries - Array of entry objects to display
 * @param {Function} [onEdit] - Optional callback when entry edit clicked
 * @param {Function} [onDelete] - Optional callback when entry delete clicked
 * @param {boolean} [loading] - Whether entries are currently loading
 * @param {string} [error] - Error message to display
 * @param {string} [className] - Optional additional CSS classes
 */
export default function EntryList({
  entries = [],
  onEdit,
  onDelete,
  loading = false,
  error = '',
  className = '',
}) {
  // Loading state
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`py-8 ${className}`}>
        <ErrorMessage id="entry-list-error" showIcon>
          {error}
        </ErrorMessage>
      </div>
    );
  }

  // Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500 text-lg">
          No entries found
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Start tracking your fasting journey by creating your first entry
        </p>
      </div>
    );
  }

  // Entries list
  return (
    <div className={`grid grid-cols-1 gap-4 ${className}`}>
      {entries.map((entry) => (
        <EntryCard
          key={entry._id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
