/**
 * Fasting Timer Utility Functions
 * Provides core calculation logic for the fasting timer feature
 */

/**
 * Calculates the elapsed time in milliseconds between lastMealTime and now
 * Uses the provided date instead of assuming today
 * 
 * @param {string} lastMealTime - Time in HH:mm format (24-hour)
 * @param {Date} now - Current date/time
 * @param {Date} entryDate - The date of the entry (optional, defaults to today)
 * @returns {number} Elapsed time in milliseconds
 */
export function calculateElapsedTime(lastMealTime, now, entryDate = null) {
  const [hours, minutes] = lastMealTime.split(':').map(Number);
  
  let lastMealDate;
  if (entryDate) {
    // Parse ISO date string to get YYYY-MM-DD in UTC
    const isoString = entryDate instanceof Date ? entryDate.toISOString() : entryDate;
    const dateOnly = isoString.split('T')[0]; // Get "2025-10-24"
    const [year, month, day] = dateOnly.split('-').map(Number);
    
    // Create date in local timezone with the specified date and time
    lastMealDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  } else {
    lastMealDate = new Date();
    lastMealDate.setHours(hours, minutes, 0, 0);
  }
  
  // Calculate elapsed time accounting for wall-clock time (not actual UTC milliseconds)
  // This gives the "human perception" of elapsed time, ignoring DST changes
  const startYear = lastMealDate.getFullYear();
  const startMonth = lastMealDate.getMonth();
  const startDay = lastMealDate.getDate();
  const startHour = lastMealDate.getHours();
  const startMinute = lastMealDate.getMinutes();
  
  const endYear = now.getFullYear();
  const endMonth = now.getMonth();
  const endDay = now.getDate();
  const endHour = now.getHours();
  const endMinute = now.getMinutes();
  
  // Calculate total minutes from start
  const startTotalMinutes = startYear * 525600 + startMonth * 43200 + startDay * 1440 + startHour * 60 + startMinute;
  const endTotalMinutes = endYear * 525600 + endMonth * 43200 + endDay * 1440 + endHour * 60 + endMinute;
  
  const elapsedMinutes = endTotalMinutes - startTotalMinutes;
  const elapsed = elapsedMinutes * 60 * 1000; // Convert back to milliseconds
  
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
 * Gets the active fast from entries array
 * Simply finds the most recent entry by date and returns its lastMealTime
 * 
 * @param {Array} entries - Array of fasting entry objects with date, lastMealTime, firstMealTime
 * @param {string} today - Today's date in YYYY-MM-DD format (not used but kept for API compatibility)
 * @returns {{lastMealTime: string, date: Date, isActive: boolean}|null} Fast info or null
 */
export function getActiveFast(entries, today) {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  
  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB - dateA;
  });
  
  // Get the most recent entry
  const mostRecentEntry = sortedEntries[0];
  
  if (!mostRecentEntry || !mostRecentEntry.lastMealTime) {
    return null;
  }
  
  const entryDate = mostRecentEntry.date instanceof Date 
    ? mostRecentEntry.date 
    : new Date(mostRecentEntry.date);
  
  return {
    lastMealTime: mostRecentEntry.lastMealTime,
    date: entryDate,
    isActive: true
  };
}
