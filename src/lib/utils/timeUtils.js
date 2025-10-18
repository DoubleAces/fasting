/**
 * Time Utilities
 * 
 * Utility functions for time parsing, formatting, validation, and conversion.
 * Handles 12-hour and 24-hour time formats.
 * 
 * @module timeUtils
 */

/**
 * Time object structure
 * @typedef {Object} TimeObject
 * @property {number} hours - Hours (0-23)
 * @property {number} minutes - Minutes (0-59)
 */

/**
 * Parse a time string (HH:mm format) into hours and minutes
 * 
 * @param {string} timeString - Time in HH:mm or H:mm format (24-hour)
 * @returns {TimeObject} Object with hours and minutes
 * @throws {Error} If time format is invalid
 * 
 * @example
 * parseTime('14:30') // { hours: 14, minutes: 30 }
 * parseTime('9:15') // { hours: 9, minutes: 15 }
 */
export function parseTime(timeString) {
  if (typeof timeString !== 'string') {
    throw new Error('Invalid time format: must be a string');
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeString.match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format: expected HH:mm or H:mm (24-hour)');
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  return { hours, minutes };
}

/**
 * Format a time object to HH:mm string
 * 
 * @param {TimeObject} timeObject - Time object with hours and minutes
 * @returns {string} Formatted time string (HH:mm)
 * 
 * @example
 * formatTime({ hours: 14, minutes: 30 }) // '14:30'
 * formatTime({ hours: 9, minutes: 5 }) // '09:05'
 */
export function formatTime(timeObject) {
  const hours = String(timeObject.hours).padStart(2, '0');
  const minutes = String(timeObject.minutes).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Validate time string format (HH:mm or H:mm, 24-hour)
 * 
 * @param {any} timeString - Value to validate
 * @returns {boolean} True if valid time format
 * 
 * @example
 * isValidTimeFormat('14:30') // true
 * isValidTimeFormat('9:30') // true
 * isValidTimeFormat('25:00') // false
 * isValidTimeFormat('14:60') // false
 */
export function isValidTimeFormat(timeString) {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
}

/**
 * Convert 12-hour time (with AM/PM) to 24-hour format
 * 
 * @param {string} time12h - Time in 12-hour format (e.g., '02:30 PM')
 * @returns {string} Time in 24-hour format (HH:mm)
 * @throws {Error} If format is invalid
 * 
 * @example
 * convertTo24Hour('02:30 PM') // '14:30'
 * convertTo24Hour('09:30 AM') // '09:30'
 * convertTo24Hour('12:00 AM') // '00:00'
 * convertTo24Hour('12:00 PM') // '12:00'
 */
export function convertTo24Hour(time12h) {
  if (!time12h || typeof time12h !== 'string') {
    throw new Error('Invalid time format: must be a string');
  }

  const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM|am|pm)$/;
  const match = time12h.match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format: expected HH:mm AM/PM');
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'AM') {
    if (hours === 12) {
      hours = 0; // Midnight
    }
  } else {
    // PM
    if (hours !== 12) {
      hours += 12;
    }
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Convert 24-hour time to 12-hour format (with AM/PM)
 * 
 * @param {string} time24h - Time in 24-hour format (HH:mm)
 * @returns {string} Time in 12-hour format (HH:mm AM/PM)
 * @throws {Error} If format is invalid
 * 
 * @example
 * convertTo12Hour('14:30') // '02:30 PM'
 * convertTo12Hour('09:30') // '09:30 AM'
 * convertTo12Hour('00:00') // '12:00 AM'
 * convertTo12Hour('12:00') // '12:00 PM'
 */
export function convertTo12Hour(time24h) {
  const { hours, minutes } = parseTime(time24h);

  let hours12 = hours;
  let period = 'AM';

  if (hours === 0) {
    hours12 = 12; // Midnight
  } else if (hours === 12) {
    period = 'PM'; // Noon
  } else if (hours > 12) {
    hours12 = hours - 12;
    period = 'PM';
  }

  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Calculate time difference in minutes between two times
 * Handles times across midnight (e.g., 22:00 to 02:00)
 * 
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {number} Difference in minutes (always positive)
 * 
 * @example
 * getTimeDifferenceMinutes('09:00', '17:00') // 480 (8 hours)
 * getTimeDifferenceMinutes('22:00', '02:00') // 240 (4 hours across midnight)
 */
export function getTimeDifferenceMinutes(startTime, endTime) {
  const start = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);

  let diff = end - start;

  // Handle negative difference (across midnight)
  if (diff < 0) {
    diff += 1440; // Add 24 hours in minutes
  }

  return diff;
}

/**
 * Add minutes to a time string
 * 
 * @param {string} timeString - Time in HH:mm format
 * @param {number} minutesToAdd - Minutes to add (can be negative)
 * @returns {string} New time in HH:mm format
 * 
 * @example
 * addMinutesToTime('14:30', 30) // '15:00'
 * addMinutesToTime('23:45', 30) // '00:15'
 * addMinutesToTime('14:30', -30) // '14:00'
 */
export function addMinutesToTime(timeString, minutesToAdd) {
  const totalMinutes = timeStringToMinutes(timeString);
  const newTotalMinutes = totalMinutes + minutesToAdd;
  return minutesToTimeString(newTotalMinutes);
}

/**
 * Compare two time strings
 * 
 * @param {string} time1 - First time (HH:mm)
 * @param {string} time2 - Second time (HH:mm)
 * @returns {number} -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 * 
 * @example
 * compareTimeStrings('14:30', '15:30') // -1
 * compareTimeStrings('14:30', '14:30') // 0
 * compareTimeStrings('15:30', '14:30') // 1
 */
export function compareTimeStrings(time1, time2) {
  const minutes1 = timeStringToMinutes(time1);
  const minutes2 = timeStringToMinutes(time2);

  if (minutes1 < minutes2) return -1;
  if (minutes1 > minutes2) return 1;
  return 0;
}

/**
 * Convert time string to total minutes since midnight
 * 
 * @param {string} timeString - Time in HH:mm format
 * @returns {number} Minutes since midnight
 * 
 * @example
 * timeStringToMinutes('00:00') // 0
 * timeStringToMinutes('14:30') // 870
 * timeStringToMinutes('23:59') // 1439
 */
export function timeStringToMinutes(timeString) {
  const { hours, minutes } = parseTime(timeString);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * Handles values outside 0-1439 range (wraps around)
 * 
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:mm format
 * 
 * @example
 * minutesToTimeString(0) // '00:00'
 * minutesToTimeString(870) // '14:30'
 * minutesToTimeString(1440) // '00:00' (wraps to next day)
 * minutesToTimeString(-60) // '23:00' (wraps to previous day)
 */
export function minutesToTimeString(minutes) {
  // Handle negative and overflow values
  let totalMinutes = minutes % 1440;
  if (totalMinutes < 0) {
    totalMinutes += 1440;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return formatTime({ hours, minutes: mins });
}
