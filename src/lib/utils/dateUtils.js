/**
 * Date Utilities
 * 
 * Utility functions for date parsing, formatting, comparison, and manipulation.
 * Uses date-fns for consistent date handling across the application.
 * 
 * @module dateUtils
 */

import {
  format,
  parse,
  isValid,
  isToday as isTodayFns,
  isYesterday as isYesterdayFns,
  isSameDay as isSameDayFns,
  subDays,
  addDays,
  startOfDay,
  endOfDay,
  differenceInDays,
  compareAsc,
} from 'date-fns';

/**
 * Parse a date from various input formats
 * 
 * @param {Date|string|number} date - Date to parse (Date object, ISO string, or timestamp)
 * @returns {Date} Parsed Date object
 * @throws {Error} If date is invalid
 * 
 * @example
 * parseDate('2024-03-15') // Date object
 * parseDate(new Date())   // Same Date object
 * parseDate(1710460800000) // Date from timestamp
 */
export function parseDate(date) {
  if (!date && date !== 0) {
    throw new Error('Invalid date: date is required');
  }

  let parsedDate;

  if (date instanceof Date) {
    parsedDate = date;
  } else if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else if (typeof date === 'string') {
    parsedDate = new Date(date);
  } else {
    throw new Error('Invalid date: unsupported type');
  }

  if (!isValid(parsedDate)) {
    throw new Error('Invalid date: could not parse date');
  }

  return parsedDate;
}

/**
 * Format a date to a string
 * 
 * @param {Date|string|number} date - Date to format
 * @param {string} formatString - Format string (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string
 * @throws {Error} If date is invalid
 * 
 * @example
 * formatDate(new Date('2024-03-15')) // '2024-03-15'
 * formatDate(new Date('2024-03-15'), 'MM/dd/yyyy') // '03/15/2024'
 */
export function formatDate(date, formatString = 'yyyy-MM-dd') {
  const parsedDate = parseDate(date);
  return format(parsedDate, formatString);
}

/**
 * Format a date in long format (e.g., "March 15, 2024")
 * 
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDateLong(new Date('2024-03-15')) // 'March 15, 2024'
 */
export function formatDateLong(date) {
  return formatDate(date, 'MMMM d, yyyy');
}

/**
 * Format a date in short format (e.g., "Mar 15")
 * 
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDateShort(new Date('2024-03-15')) // 'Mar 15'
 */
export function formatDateShort(date) {
  return formatDate(date, 'MMM d');
}

/**
 * Check if a date is today
 * 
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 * 
 * @example
 * isToday(new Date()) // true
 * isToday(new Date('2024-01-01')) // false
 */
export function isToday(date) {
  const parsedDate = parseDate(date);
  return isTodayFns(parsedDate);
}

/**
 * Check if a date is yesterday
 * 
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is yesterday
 * 
 * @example
 * const yesterday = new Date();
 * yesterday.setDate(yesterday.getDate() - 1);
 * isYesterday(yesterday) // true
 */
export function isYesterday(date) {
  const parsedDate = parseDate(date);
  return isYesterdayFns(parsedDate);
}

/**
 * Check if two dates are the same day
 * 
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if dates are the same day
 * 
 * @example
 * isSameDay('2024-03-15T10:00', '2024-03-15T20:00') // true
 * isSameDay('2024-03-15', '2024-03-16') // false
 */
export function isSameDay(date1, date2) {
  const parsedDate1 = parseDate(date1);
  const parsedDate2 = parseDate(date2);
  return isSameDayFns(parsedDate1, parsedDate2);
}

/**
 * Get yesterday's date (start of day)
 * 
 * @returns {Date} Yesterday at 00:00:00
 * 
 * @example
 * getYesterday() // Date object for yesterday at midnight
 */
export function getYesterday() {
  return startOfDay(subDays(new Date(), 1));
}

/**
 * Get tomorrow's date (start of day)
 * 
 * @returns {Date} Tomorrow at 00:00:00
 * 
 * @example
 * getTomorrow() // Date object for tomorrow at midnight
 */
export function getTomorrow() {
  return startOfDay(addDays(new Date(), 1));
}

/**
 * Get start of day (00:00:00) for a date
 * 
 * @param {Date|string|number} date - Date to process
 * @returns {Date} Date at 00:00:00.000
 * 
 * @example
 * getStartOfDay(new Date('2024-03-15T14:30')) // 2024-03-15T00:00:00.000
 */
export function getStartOfDay(date) {
  const parsedDate = parseDate(date);
  return startOfDay(parsedDate);
}

/**
 * Get end of day (23:59:59.999) for a date
 * 
 * @param {Date|string|number} date - Date to process
 * @returns {Date} Date at 23:59:59.999
 * 
 * @example
 * getEndOfDay(new Date('2024-03-15T14:30')) // 2024-03-15T23:59:59.999
 */
export function getEndOfDay(date) {
  const parsedDate = parseDate(date);
  return endOfDay(parsedDate);
}

/**
 * Check if a date is valid
 * 
 * @param {any} date - Value to check
 * @returns {boolean} True if value is a valid date
 * 
 * @example
 * isValidDate(new Date()) // true
 * isValidDate('2024-03-15') // true
 * isValidDate('invalid') // false
 * isValidDate(null) // false
 */
export function isValidDate(date) {
  if (!date && date !== 0) {
    return false;
  }

  try {
    const parsed = parseDate(date);
    return isValid(parsed);
  } catch {
    return false;
  }
}

/**
 * Compare two dates (ignores time component)
 * 
 * @param {Date|string|number} date1 - First date
 * @param {Date|string|number} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * 
 * @example
 * compareDates('2024-03-15', '2024-03-16') // -1
 * compareDates('2024-03-15', '2024-03-15') // 0
 * compareDates('2024-03-16', '2024-03-15') // 1
 */
export function compareDates(date1, date2) {
  const parsed1 = getStartOfDay(date1);
  const parsed2 = getStartOfDay(date2);
  return compareAsc(parsed1, parsed2);
}

/**
 * Get number of days between two dates
 * 
 * @param {Date|string|number} date1 - Start date
 * @param {Date|string|number} date2 - End date
 * @returns {number} Number of days (positive if date2 is after date1)
 * 
 * @example
 * getDaysBetween('2024-03-15', '2024-03-20') // 5
 * getDaysBetween('2024-03-20', '2024-03-15') // -5
 */
export function getDaysBetween(date1, date2) {
  const parsed1 = getStartOfDay(date1);
  const parsed2 = getStartOfDay(date2);
  return differenceInDays(parsed2, parsed1);
}

/**
 * Get a date from X days ago (start of day)
 * 
 * @param {number} days - Number of days ago (positive for past, negative for future)
 * @returns {Date} Date at 00:00:00
 * 
 * @example
 * getDateFromDaysAgo(7) // Date 7 days ago at midnight
 * getDateFromDaysAgo(0) // Today at midnight
 * getDateFromDaysAgo(-7) // Date 7 days in future at midnight
 */
export function getDateFromDaysAgo(days) {
  return startOfDay(subDays(new Date(), days));
}

/**
 * Get today's date in ISO format (yyyy-mm-dd)
 * 
 * Utility function for defaulting date inputs to today's date.
 * Returns a string in ISO 8601 date format suitable for HTML5 date inputs
 * and API requests.
 * 
 * @returns {string} Today's date as ISO string (yyyy-mm-dd)
 * 
 * @example
 * getTodayISO() // '2024-03-15' (if today is March 15, 2024)
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}
