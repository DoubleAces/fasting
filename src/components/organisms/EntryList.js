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
  // T058: Add ⏱ icon for better visual recognition of fasting duration
  const formatFastingDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    const duration = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    return `⏱ ${duration}`;
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
    <div className={`overflow-x-auto -mx-6 ${className}`}>
      <table className="min-w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50/50">
            {/* Always visible: Date */}
            <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            {/* Hidden on mobile: First Meal */}
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              First Meal
            </th>
            {/* Hidden on mobile: Last Meal */}
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Meal
            </th>
            {/* Always visible: Fasting */}
            <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fasting
            </th>
            {/* Hidden on mobile: Weight */}
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Weight
            </th>
            {/* Hidden on mobile: Sleep */}
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Sleep
            </th>
            {/* Hidden on mobile: Ratings */}
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ratings
            </th>
            {/* Always visible: Actions */}
            <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr 
              key={entry._id}
              className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 transition-all group"
              data-testid="entry-row"
            >
              {/* Date - wrapped in Link - Always visible */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm md:text-base font-medium text-gray-900 hover:text-purple-600 transition-colors min-h-[44px] flex items-center"
                >
                  {format(parseISO(entry.date), 'dd/MM/yyyy')}
                </Link>
              </td>

              {/* First Meal Time - wrapped in Link - Hidden on mobile */}
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {formatTime(entry.firstMealTime)}
                </Link>
              </td>

              {/* Last Meal Time - wrapped in Link - Hidden on mobile */}
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {formatTime(entry.lastMealTime)}
                </Link>
              </td>

              {/* Fasting Duration - wrapped in Link - Always visible */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block min-h-[44px] flex items-center"
                >
                  <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatFastingDuration(entry.fastingDuration)}
                  </span>
                </Link>
              </td>

              {/* Morning Weight - wrapped in Link - Hidden on mobile */}
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {entry.morningWeight 
                    ? `${entry.morningWeight} ${weightUnit}` 
                    : '-'}
                </Link>
              </td>

              {/* Hours of Sleep - wrapped in Link - Hidden on mobile */}
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {entry.hoursOfSleep ? `${entry.hoursOfSleep}h` : '-'}
                </Link>
              </td>

              {/* Ratings - wrapped in Link - Hidden on mobile */}
              <td className="hidden md:table-cell px-6 py-4">
                <Link 
                  href={`/entries/${entry._id}`}
                  prefetch={true}
                  className="block"
                >
                  <div className="flex flex-col gap-1 text-xs text-gray-500">
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

              {/* Actions - NOT wrapped in Link to prevent navigation - Always visible */}
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                <div className="flex gap-2 justify-end">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(entry);
                      }}
                      aria-label={`Edit entry from ${format(parseISO(entry.date), 'MMM d, yyyy')}`}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md min-h-[44px]"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry._id);
                      }}
                      aria-label={`Delete entry from ${format(parseISO(entry.date), 'MMM d, yyyy')}`}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all hover:shadow-md min-h-[44px]"
                    >
                      Delete
                    </button>
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
