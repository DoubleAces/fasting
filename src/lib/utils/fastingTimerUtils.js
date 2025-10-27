/**
 * Fasting Timer Utility Functions
 * Provides core calculation logic for the fasting timer feature
 */

/**
 * Calculates the elapsed time in milliseconds between lastMealTime and now
 * Handles overnight fasts by checking if lastMealTime is in the future (meaning yesterday)
 * 
 * @param {string} lastMealTime - Time in HH:mm format (24-hour)
 * @param {Date} now - Current date/time
 * @returns {number} Elapsed time in milliseconds
 */
export function calculateElapsedTime(lastMealTime, now) {
  const lastMealDate = parseTime(lastMealTime);
  
  // If parsed time is in the future, it means the meal was yesterday
  if (lastMealDate > now) {
    lastMealDate.setDate(lastMealDate.getDate() - 1);
  }
  
  const elapsed = now - lastMealDate;
  return elapsed >= 0 ? elapsed : 0;
}

/**
 * Formats milliseconds into a readable time object with days, hours, and minutes
 * Rounds down partial minutes
 * 
 * @param {number} milliseconds - Elapsed time in milliseconds
 * @returns {{days: number, hours: number, minutes: number}} Formatted time object
 */
export function formatElapsedTime(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / (60 * 1000));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  
  return { days, hours, minutes };
}

/**
 * Parses a time string in HH:mm format to a Date object for today
 * Validates the time format and throws error if invalid
 * 
 * @param {string} timeString - Time in HH:mm format (24-hour)
 * @returns {Date} Date object with today's date and specified time
 * @throws {Error} If timeString is not in valid HH:mm format or values are out of range
 */
export function parseTime(timeString) {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  
  if (!timeRegex.test(timeString)) {
    throw new Error(`Invalid time format: ${timeString}. Expected HH:mm (24-hour format)`);
  }
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Additional validation for edge cases
  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hours: ${hours}. Must be 0-23`);
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Must be 0-59`);
  }
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  return date;
}

/**
 * Detects milestone achievements based on elapsed time
 * Returns milestone name or null if no milestone reached
 * 
 * @param {number} elapsedHours - Elapsed fasting time in hours
 * @returns {string|null} Milestone name or null
 */
export function detectMilestone(elapsedHours) {
  const milestones = [
    { hours: 72, name: '72-Hour Fast' },
    { hours: 48, name: '48-Hour Fast' },
    { hours: 36, name: '36-Hour Fast' },
    { hours: 24, name: '24-Hour Fast' },
    { hours: 18, name: '18-Hour Fast' },
    { hours: 16, name: '16-Hour Fast' },
    { hours: 12, name: '12-Hour Fast' }
  ];
  
  for (const milestone of milestones) {
    if (elapsedHours >= milestone.hours) {
      return milestone.name;
    }
  }
  
  return null;
}

/**
 * Determines if a fast is currently active
 * A fast is active if it has a lastMealTime but no firstMealTime
 * 
 * @param {Object} entry - Fasting entry object with lastMealTime and firstMealTime properties
 * @returns {boolean} True if fast is active, false otherwise
 */
export function isFastActive(entry) {
  // Handle null, undefined, or non-object entries
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  
  // Fast is active if lastMealTime exists but firstMealTime does not
  return Boolean(entry.lastMealTime) && !entry.firstMealTime;
}

/**
 * Gets the active or completed fast for today from entries array
 * Only returns a fast if there's an entry for today with a lastMealTime
 * Ignores yesterday's incomplete fasts
 * 
 * @param {Array} entries - Array of fasting entry objects with date, lastMealTime, firstMealTime
 * @param {string} today - Today's date in YYYY-MM-DD format
 * @returns {{lastMealTime: string, isActive: boolean}|null} Fast info or null
 */
export function getActiveFast(entries, today) {
  // Handle null, undefined, or non-array entries
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  
  // Find today's entry
  const todayEntry = entries.find(entry => entry.date === today);
  
  // Return null if no entry for today or no lastMealTime
  if (!todayEntry || !todayEntry.lastMealTime) {
    return null;
  }
  
  // Return fast info with isActive status
  return {
    lastMealTime: todayEntry.lastMealTime,
    isActive: isFastActive(todayEntry)
  };
}
