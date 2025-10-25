/**
 * TimeDisplay Component
 * 
 * Formats and displays time based on user preferences (12h/24h format).
 */

import React from 'react';

const TimeDisplay = ({ time, format = '24h' }) => {
  // Handle null/undefined/invalid times
  if (!time || typeof time !== 'string' || !time.match(/^\d{1,2}:\d{2}$/)) {
    return <span>--:--</span>;
  }

  // Parse time
  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) {
    return <span>--:--</span>;
  }

  let displayTime;
  
  if (format === '12h') {
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    displayTime = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  } else {
    // Keep 24-hour format
    displayTime = time;
  }

  return (
    <time dateTime={time}>
      {displayTime}
    </time>
  );
};

export default TimeDisplay;
