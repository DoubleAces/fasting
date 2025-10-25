'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Button from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * EntryList Component
 * 
 * Displays a list of fasting entries in table format.
 * Handles loading, error, and empty states.
 * Shows key metrics in columns with edit/delete actions.
 * 
 * @param {Array} entries - Array of entry objects to display
 * @param {Object} [settings] - User settings for display preferences
 * @param {Function} [onEdit] - Optional callback when entry edit clicked
 * @param {Function} [onDelete] - Optional callback when entry delete clicked
 * @param {boolean} [loading] - Whether entries are currently loading
 * @param {string} [error] - Error message to display
 * @param {string} [className] - Optional additional CSS classes
 */
export default function EntryList({
  entries = [],
  settings,
  onEdit,
  onDelete,
  loading = false,
  error = '',
  className = '',
}) {
  const router = useRouter();

  // Get display preferences from settings
  const weightUnit = settings?.measurementSystem === 'imperial' ? 'lbs' : 'kg';
  const timeFormat = settings?.timeFormat || '24h';

  // Handle row click to navigate to entry details
  const handleRowClick = (entryId, event) => {
    // Don't navigate if clicking on action buttons
    if (event.target.closest('button')) {
      return;
    }
    router.push(`/entries/${entryId}`);
  };

  // Format time based on user settings
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    
    if (timeFormat === '12h') {
      const [hour, minute] = timeStr.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    }
    
    return timeStr; // 24h format
  };

  // Calculate fasting hours from minutes
  const formatFastingDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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

  // Table view
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              First Meal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Meal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fasting
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Weight
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Sleep
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ratings
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr 
              key={entry._id} 
              onClick={(e) => handleRowClick(entry._id, e)}
              className="hover:bg-gray-50 transition-colors group cursor-pointer"
              data-testid="entry-row"
            >
              {/* Date */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {format(parseISO(entry.date), 'dd/MM/yyyy')}
                </span>
              </td>

              {/* First Meal Time */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {formatTime(entry.firstMealTime)}
                </span>
              </td>

              {/* Last Meal Time */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {formatTime(entry.lastMealTime)}
                </span>
              </td>

              {/* Fasting Duration */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm font-semibold text-green-600">
                  {formatFastingDuration(entry.fastingDuration)}
                </span>
              </td>

              {/* Morning Weight */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {entry.morningWeight 
                    ? `${entry.morningWeight} ${weightUnit}` 
                    : '-'}
                </span>
              </td>

              {/* Hours of Sleep */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {entry.hoursOfSleep ? `${entry.hoursOfSleep}h` : '-'}
                </span>
              </td>

              {/* Ratings */}
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1 text-xs text-gray-600">
                  {entry.hungerLevel && (
                    <span>H: {entry.hungerLevel}</span>
                  )}
                  {entry.energyLevel && (
                    <span>E: {entry.energyLevel}</span>
                  )}
                  {entry.wellBeing && (
                    <span>W: {entry.wellBeing}</span>
                  )}
                  {!entry.hungerLevel && !entry.energyLevel && !entry.wellBeing && (
                    <span>-</span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex gap-2 justify-end">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      aria-label={`Edit entry from ${format(parseISO(entry.date), 'MMM d, yyyy')}`}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(entry._id)}
                      aria-label={`Delete entry from ${format(parseISO(entry.date), 'MMM d, yyyy')}`}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
