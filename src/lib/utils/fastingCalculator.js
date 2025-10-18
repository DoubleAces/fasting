/**
 * Fasting Duration Calculator
 * 
 * Utility functions for calculating fasting duration between meals.
 * Handles same-day fasting, overnight fasting, and multi-day fasting.
 * 
 * @module fastingCalculator
 */

import { parseDate, getStartOfDay, getDaysBetween } from './dateUtils';
import { parseTime, isValidTimeFormat, timeStringToMinutes } from './timeUtils';

/**
 * Fasting duration result
 * @typedef {Object} FastingDuration
 * @property {number} hours - Hours of fasting
 * @property {number} minutes - Minutes of fasting (0-59)
 * @property {number} totalMinutes - Total minutes of fasting
 * @property {string} formattedDuration - Formatted string (e.g., "16h 30m")
 */

/**
 * Calculate fasting duration between last meal and first meal
 * 
 * Handles:
 * - Same day meals (e.g., breakfast to lunch)
 * - Overnight fasting (e.g., dinner to breakfast)
 * - Multi-day fasting (24+ hours)
 * 
 * @param {string} lastMealTime - Time of last meal (HH:mm format)
 * @param {string} firstMealTime - Time of first meal (HH:mm format)
 * @param {Date|string} lastMealDate - Date of last meal
 * @param {Date|string} firstMealDate - Date of first meal
 * @returns {FastingDuration} Fasting duration breakdown
 * @throws {Error} If times are invalid or first meal is before last meal
 * 
 * @example
 * // 16-hour fast (8 PM to noon next day)
 * calculateFastingDuration('20:00', '12:00', '2024-03-15', '2024-03-16')
 * // Returns: { hours: 16, minutes: 0, totalMinutes: 960, formattedDuration: '16h 0m' }
 * 
 * @example
 * // Same day meals
 * calculateFastingDuration('08:00', '12:00', '2024-03-15', '2024-03-15')
 * // Returns: { hours: 4, minutes: 0, totalMinutes: 240, formattedDuration: '4h 0m' }
 * 
 * @example
 * // Multi-day fast (48 hours)
 * calculateFastingDuration('18:00', '18:00', '2024-03-15', '2024-03-17')
 * // Returns: { hours: 48, minutes: 0, totalMinutes: 2880, formattedDuration: '48h 0m' }
 */
export function calculateFastingDuration(
  lastMealTime,
  firstMealTime,
  lastMealDate,
  firstMealDate
) {
  // Validate time formats
  if (!isValidTimeFormat(lastMealTime)) {
    throw new Error('Invalid time format: lastMealTime must be in HH:mm format');
  }
  if (!isValidTimeFormat(firstMealTime)) {
    throw new Error('Invalid time format: firstMealTime must be in HH:mm format');
  }

  // Parse dates
  let parsedLastDate;
  let parsedFirstDate;
  
  try {
    parsedLastDate = parseDate(lastMealDate);
    parsedFirstDate = parseDate(firstMealDate);
  } catch (error) {
    throw new Error('Invalid date: ' + error.message);
  }

  // Normalize dates to start of day for comparison
  const lastDateStart = getStartOfDay(parsedLastDate);
  const firstDateStart = getStartOfDay(parsedFirstDate);

  // Calculate day difference
  const daysDifference = getDaysBetween(lastDateStart, firstDateStart);

  // Check that first meal is not before last meal
  if (daysDifference < 0) {
    throw new Error('First meal cannot be before last meal');
  }

  // Parse times to minutes
  const lastMealMinutes = timeStringToMinutes(lastMealTime);
  const firstMealMinutes = timeStringToMinutes(firstMealTime);

  // Calculate total minutes
  let totalMinutes;

  if (daysDifference === 0) {
    // Same day
    totalMinutes = firstMealMinutes - lastMealMinutes;
    
    if (totalMinutes <= 0) {
      throw new Error('Fasting duration must be greater than 0');
    }
  } else {
    // Different days
    // Minutes from last meal to end of day
    const minutesToEndOfDay = 1440 - lastMealMinutes; // 1440 = 24 hours
    
    // Minutes from start of day to first meal
    const minutesFromStartOfDay = firstMealMinutes;
    
    // Minutes for complete days in between
    const completeDaysMinutes = (daysDifference - 1) * 1440;
    
    // Total
    totalMinutes = minutesToEndOfDay + minutesFromStartOfDay + completeDaysMinutes;
  }

  // Validate fasting duration
  if (totalMinutes <= 0) {
    throw new Error('Fasting duration must be greater than 0');
  }

  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Format duration
  const formattedDuration = formatFastingDuration(hours, minutes);

  return {
    hours,
    minutes,
    totalMinutes,
    formattedDuration,
  };
}

/**
 * Format fasting duration to readable string
 * 
 * @param {number} hoursOrMinutes - Hours (if minutes param provided) or total minutes
 * @param {number} [minutes] - Minutes (0-59), optional
 * @returns {string} Formatted duration (e.g., "16h 30m")
 * 
 * @example
 * formatFastingDuration(16, 30) // '16h 30m'
 * formatFastingDuration(960)    // '16h 0m' (from total minutes)
 * formatFastingDuration(0, 45)  // '0h 45m'
 */
export function formatFastingDuration(hoursOrMinutes, minutes) {
  let hours, mins;

  if (minutes !== undefined) {
    // Called with hours and minutes
    hours = hoursOrMinutes;
    mins = minutes;
  } else {
    // Called with total minutes only
    const totalMinutes = hoursOrMinutes;
    hours = Math.floor(totalMinutes / 60);
    mins = totalMinutes % 60;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Validate that a fasting period is within acceptable range
 * 
 * Valid range: 1 minute to 7 days (10,080 minutes)
 * 
 * @param {number} totalMinutes - Total fasting minutes
 * @returns {boolean} True if valid fasting period
 * 
 * @example
 * isValidFastingPeriod(960)   // true (16 hours)
 * isValidFastingPeriod(0)     // false (no fasting)
 * isValidFastingPeriod(10081) // false (>7 days)
 */
export function isValidFastingPeriod(totalMinutes) {
  if (typeof totalMinutes !== 'number' || isNaN(totalMinutes)) {
    return false;
  }

  // Minimum: 1 minute
  // Maximum: 7 days (10,080 minutes)
  const MIN_MINUTES = 1;
  const MAX_MINUTES = 7 * 24 * 60; // 10,080 minutes

  return totalMinutes >= MIN_MINUTES && totalMinutes <= MAX_MINUTES;
}
