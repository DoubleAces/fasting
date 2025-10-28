'use client';

import React from 'react';
import Link from 'next/link';
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
 * Performance: Uses Next.js Link with prefetch for instant navigation (Feature 019)
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
  // Get display preferences from settings
  const weightUnit = settings?.measurementSystem === 'imperial' ? 'lbs' : 'kg';
  const timeFormat = settings?.timeFormat || '24h';

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
              className="hover:bg-gray-50 transition-colors group"
              data-testid="entry-row"
            >
              {/* Date - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  {format(parseISO(entry.date), 'dd/MM/yyyy')}
                </Link>
              </td>

              {/* First Meal Time - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-900"
                >
                  {formatTime(entry.firstMealTime)}
                </Link>
              </td>

              {/* Last Meal Time - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-900"
                >
                  {formatTime(entry.lastMealTime)}
                </Link>
              </td>

              {/* Fasting Duration - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm font-semibold text-green-600"
                >
                  {formatFastingDuration(entry.fastingDuration)}
                </Link>
              </td>

              {/* Morning Weight - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-900"
                >
                  {entry.morningWeight 
                    ? `${entry.morningWeight} ${weightUnit}` 
                    : '-'}
                </Link>
              </td>

              {/* Hours of Sleep - wrapped in Link */}
              <td className="px-4 py-3 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-900"
                >
                  {entry.hoursOfSleep ? `${entry.hoursOfSleep}h` : '-'}
                </Link>
              </td>

              {/* Ratings - wrapped in Link */}
              <td className="px-4 py-3">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block"
                >
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
                </Link>
              </td>

              {/* Actions - NOT wrapped in Link to prevent navigation */}
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex gap-2 justify-end">
                  {onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(entry);
                      }}
                      aria-label={`Edit entry from ${format(parseISO(entry.date), 'MMM d, yyyy')}`}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry._id);
                      }}
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
