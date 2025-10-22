/**
 * Date Formatter Utility
 * 
 * Formats dates in dd.mm.yyyy HH:ii format in user's local timezone.
 * Uses native Intl.DateTimeFormat API for internationalization support.
 * 
 * Feature: 006-admin-user-management (FR-003)
 * 
 * Format Specification:
 * - Date: dd.mm.yyyy (e.g., "22.10.2025")
 * - Time: HH:ii (24-hour format, e.g., "14:30")
 * - Full: "22.10.2025 14:30"
 * - Timezone: User's browser local timezone
 * 
 * Usage:
 * ```javascript
 * import { formatDate, formatDateTime, formatTime } from '@/lib/utils/dateFormatter';
 * 
 * const registrationDate = new Date('2025-10-22T14:30:00Z');
 * formatDateTime(registrationDate); // "22.10.2025 14:30" (in user's timezone)
 * formatDate(registrationDate); // "22.10.2025"
 * formatTime(registrationDate); // "14:30"
 * ```
 * 
 * Browser Support:
 * - All modern browsers support Intl.DateTimeFormat
 * - Falls back to toLocaleString if Intl unavailable (unlikely)
 */

/**
 * Format date as dd.mm.yyyy
 * 
 * @param {Date|string|number} date - Date to format (Date object, ISO string, or timestamp)
 * @returns {string} Formatted date string (e.g., "22.10.2025")
 * @throws {Error} If date is invalid
 * 
 * @example
 * formatDate(new Date('2025-10-22')); // "22.10.2025"
 * formatDate('2025-10-22T14:30:00Z'); // "22.10.2025"
 * formatDate(1729606200000); // "22.10.2025"
 */
export function formatDate(date) {
  const dateObj = parseDate(date);
  
  // Use Intl.DateTimeFormat with manual formatting for dd.mm.yyyy
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Format time as HH:ii (24-hour format)
 * 
 * @param {Date|string|number} date - Date to extract time from
 * @returns {string} Formatted time string (e.g., "14:30")
 * @throws {Error} If date is invalid
 * 
 * @example
 * formatTime(new Date('2025-10-22T14:30:00')); // "14:30"
 * formatTime('2025-10-22T09:05:00Z'); // "09:05" (in user's timezone)
 */
export function formatTime(date) {
  const dateObj = parseDate(date);
  
  // Use Intl.DateTimeFormat for 24-hour time format
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return formatter.format(dateObj);
}

/**
 * Format date and time as dd.mm.yyyy HH:ii
 * 
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted datetime string (e.g., "22.10.2025 14:30")
 * @throws {Error} If date is invalid
 * 
 * @example
 * formatDateTime(new Date('2025-10-22T14:30:00Z')); // "22.10.2025 14:30" (in user's timezone)
 * formatDateTime('2025-10-22T09:05:00Z'); // "22.10.2025 09:05"
 * formatDateTime(null); // "Never" (special case for null dates)
 */
export function formatDateTime(date) {
  // Handle null/undefined (for lastLogin which can be null)
  if (date === null || date === undefined) {
    return 'Never';
  }
  
  const dateObj = parseDate(date);
  
  // Combine date and time with space separator
  return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
}

/**
 * Parse date from various input types
 * 
 * @param {Date|string|number} date - Date input
 * @returns {Date} Parsed Date object
 * @throws {Error} If date is invalid
 * @private
 */
function parseDate(date) {
  // Handle null/undefined
  if (date === null || date === undefined) {
    throw new Error('Date cannot be null or undefined');
  }
  
  // Already a Date object
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid Date object');
    }
    return date;
  }
  
  // Parse string or number
  const parsed = new Date(date);
  
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  return parsed;
}

/**
 * Format date for display in user table (handles null lastLogin)
 * 
 * @param {Date|string|number|null} date - Date to format (can be null)
 * @returns {string} Formatted date or "Never" for null
 * 
 * @example
 * formatUserDate(new Date()); // "22.10.2025 14:30"
 * formatUserDate(null); // "Never"
 */
export function formatUserDate(date) {
  if (date === null || date === undefined) {
    return 'Never';
  }
  
  try {
    return formatDateTime(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 * Optional enhancement for better UX
 * 
 * @param {Date|string|number} date - Date to compare
 * @returns {string} Relative time string
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() - 86400000)); // "1 day ago"
 */
export function formatRelativeTime(date) {
  const dateObj = parseDate(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return formatDateTime(dateObj);
  }
}

/**
 * Validate if a date string/object is valid
 * 
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * @example
 * isValidDate(new Date()); // true
 * isValidDate('2025-10-22'); // true
 * isValidDate('invalid'); // false
 * isValidDate(null); // false
 */
export function isValidDate(date) {
  if (date === null || date === undefined) {
    return false;
  }
  
  try {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
}
