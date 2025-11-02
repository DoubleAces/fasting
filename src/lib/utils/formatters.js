/**
 * Formatters Utility
 * 
 * Centralized formatting utilities for the Entry Details Page Enhancement (Feature 025).
 * Consolidates duration, date, and time formatting functions used across components.
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T006, T007
 * 
 * Usage:
 * ```javascript
 * import { formatDuration, formatDate, formatTime, formatRelativeTime } from '@/lib/utils/formatters';
 * 
 * formatDuration(960); // "16h 0m"
 * formatDate(new Date()); // "01.11.2025"
 * formatTime(new Date()); // "14:30"
 * formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
 * ```
 */

/**
 * Format fasting duration in minutes to readable format
 * 
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "16h 30m", "2h 0m")
 * 
 * @example
 * formatDuration(960) // "16h 0m"
 * formatDuration(990) // "16h 30m"
 * formatDuration(45) // "0h 45m"
 * formatDuration(0) // "0h 0m"
 */
export function formatDuration(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes < 0) {
    return '0h 0m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  return `${hours}h ${mins}m`;
}

// Re-export date formatting functions from dateFormatter
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime
} from './dateFormatter';

// Re-export time utilities from timeUtils
export {
  parseTime,
  isValidTimeFormat,
  convertTo24Hour,
  convertTo12Hour
} from './timeUtils';
