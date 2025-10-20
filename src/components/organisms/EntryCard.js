import React from 'react';
import { format, parseISO } from 'date-fns';
import Button from '@/components/atoms/Button';

/**
 * EntryCard Component
 * 
 * Displays a single fasting entry with all details in a card format.
 * Shows date, fasting metrics, meal times, and optional health data.
 * Provides edit and delete actions when handlers are provided.
 * 
 * @param {Object} entry - The fasting entry to display
 * @param {Object} [settings] - User settings for display preferences
 * @param {Function} [onEdit] - Optional callback when edit button clicked
 * @param {Function} [onDelete] - Optional callback when delete button clicked
 * @param {string} [className] - Optional additional CSS classes
 */
export default function EntryCard({ entry, settings, onEdit, onDelete, className = '' }) {
  // Format the date to dd/mm/yyyy
  const formattedDate = format(parseISO(entry.date), 'dd/MM/yyyy');

  // Get weight unit from settings
  const weightUnit = settings?.measurementSystem === 'imperial' ? 'lbs' : 'kg';

  // Get time format from settings
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

  // Calculate fasting hours from fastingDuration (stored in MINUTES)
  const fastingHours = entry.fastingDuration 
    ? (() => {
        const hours = Math.floor(entry.fastingDuration / 60);
        const minutes = Math.round(entry.fastingDuration % 60);
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      })()
    : 'N/A';

  // Calculate eating window from meal times
  const calculateEatingWindow = () => {
    if (!entry.firstMealTime || !entry.lastMealTime) return 'N/A';
    
    const [firstHour, firstMin] = entry.firstMealTime.split(':').map(Number);
    const [lastHour, lastMin] = entry.lastMealTime.split(':').map(Number);
    
    const firstMinutes = firstHour * 60 + firstMin;
    const lastMinutes = lastHour * 60 + lastMin;
    
    let diffMinutes = lastMinutes - firstMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const eatingWindow = calculateEatingWindow();

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry._id);
    }
  };

  return (
    <article 
      className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
    >
      {/* Header: Date and Actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {formattedDate}
        </h3>
        
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                aria-label="Edit entry"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                aria-label="Delete entry"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Metrics: Fasting Hours and Eating Window */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">Fasting Duration</p>
          <p className="text-2xl font-bold text-indigo-600">
            {fastingHours}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Eating Window</p>
          <p className="text-2xl font-bold text-green-600">
            {eatingWindow}
          </p>
        </div>
      </div>

      {/* Meal Times */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">First Meal</p>
          <p className="text-lg font-medium text-gray-900">
            {formatTime(entry.firstMealTime)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Last Meal</p>
          <p className="text-lg font-medium text-gray-900">
            {formatTime(entry.lastMealTime)}
          </p>
        </div>
      </div>

      {/* Optional Health Metrics */}
      {(entry.hoursOfSleep !== undefined || entry.morningWeight !== undefined) && (
        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
          {entry.hoursOfSleep !== undefined && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Sleep</p>
              <p className="text-lg font-medium text-gray-900">
                {entry.hoursOfSleep} hours
              </p>
            </div>
          )}
          {entry.morningWeight !== undefined && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Weight</p>
              <p className="text-lg font-medium text-gray-900">
                {entry.morningWeight} {weightUnit}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Optional Ratings */}
      {(entry.hungerLevel || entry.energyLevel || entry.wellBeing) && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Daily Ratings</h4>
          <div className="grid grid-cols-3 gap-3">
            {entry.hungerLevel && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Hunger</p>
                <p className="text-sm font-medium text-gray-900">
                  {entry.hungerLevel}
                </p>
              </div>
            )}
            {entry.energyLevel && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Energy</p>
                <p className="text-sm font-medium text-gray-900">
                  {entry.energyLevel}
                </p>
              </div>
            )}
            {entry.wellBeing && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Well-being</p>
                <p className="text-sm font-medium text-gray-900">
                  {entry.wellBeing}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional Food Notes */}
      {entry.foodNotes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
            {entry.foodNotes}
          </p>
        </div>
      )}
    </article>
  );
}
