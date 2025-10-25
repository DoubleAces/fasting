/**
 * FastingTimeline Component
 * 
 * 24-hour circular clock visualization showing fasting period.
 * Displays last meal time, first meal time, and shaded fasting arc.
 */

'use client';

import React from 'react';

const FastingTimeline = ({ firstMealTime, fastingDuration, entryDate }) => {
  // Helper function to convert time (HH:mm) to angle in degrees
  // Clock face: 12 at top (0°), 3 at right (90°), 6 at bottom (180°), 9 at left (270°)
  // We need to map 24-hour time to 12-hour clock positions
  const timeToAngle = (time) => {
    if (!time || typeof time !== 'string') return 0;
    
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    
    // Convert 24-hour to 12-hour position: use modulo 12, then multiply by 30° per hour
    // 12 hours on clock = 360°, so 30° per hour
    const hour12 = hours % 12;
    return (hour12 + minutes / 60) * 30;
  };

  // Helper function to convert angle to SVG coordinates
  // Angle 0° = top (12 o'clock position), increases clockwise
  const angleToCoords = (angle, radius) => {
    // Convert to radians, subtract 90 to make 0° point up instead of right
    const radians = ((angle - 90) * Math.PI) / 180;
    // Round to 2 decimal places to prevent hydration mismatches
    return {
      x: Math.round((150 + radius * Math.cos(radians)) * 100) / 100,
      y: Math.round((150 + radius * Math.sin(radians)) * 100) / 100,
    };
  };

  // Calculate the last meal time by counting back from first meal
  // fastingDuration is in minutes
  const calculateLastMealTime = () => {
    if (!firstMealTime || !fastingDuration) return null;
    
    const [hours, minutes] = firstMealTime.split(':').map(Number);
    const firstMealMinutes = hours * 60 + minutes;
    
    // Subtract fasting duration
    let lastMealMinutes = firstMealMinutes - fastingDuration;
    
    // Handle going back to previous day
    if (lastMealMinutes < 0) {
      lastMealMinutes += 24 * 60; // Add 24 hours
    }
    
    const lastMealHours = Math.floor(lastMealMinutes / 60);
    const lastMealMins = lastMealMinutes % 60;
    
    return `${String(lastMealHours).padStart(2, '0')}:${String(lastMealMins).padStart(2, '0')}`;
  };

  const lastMealTime = calculateLastMealTime();

  // Format date for legend (e.g., "Oct 23, 14:00")
  const formatLegendDateTime = (time, isPreviousDay) => {
    if (!time || !entryDate) return '';
    
    try {
      const date = new Date(entryDate);
      if (isPreviousDay) {
        date.setDate(date.getDate() - 1); // Previous day
      }
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      
      return `${month} ${day}, ${time}`;
    } catch (error) {
      return time;
    }
  };

  // Calculate angles
  // Last meal = when fasting STARTS (calculated from first meal - duration)
  // First meal = when fasting ENDS (from entry data)
  const startAngle = lastMealTime ? timeToAngle(lastMealTime) : 0;
  const endAngle = firstMealTime ? timeToAngle(firstMealTime) : 0;

  // Create SVG arc path for fasting period
  const createArcPath = () => {
    const radius = 100;
    const start = angleToCoords(startAngle, radius);
    const end = angleToCoords(endAngle, radius);

    // Determine if we need large arc (fasting period > 12 hours)
    let arcAngle = endAngle - startAngle;
    if (arcAngle < 0) arcAngle += 360; // Handle midnight crossing
    
    const largeArcFlag = arcAngle > 180 ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    `;
  };

  // Create pie slice path for filled fasting period (from center)
  const createPiePath = () => {
    const radius = 95; // Slightly smaller to stay within clock border
    const start = angleToCoords(startAngle, radius);
    const end = angleToCoords(endAngle, radius);

    // Determine if we need large arc (fasting period > 12 hours)
    let arcAngle = endAngle - startAngle;
    if (arcAngle < 0) arcAngle += 360; // Handle midnight crossing
    
    const largeArcFlag = arcAngle > 180 ? 1 : 0;

    // Create pie slice: start at center, line to start point, arc to end point, line back to center
    return `
      M 150 150
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
      Z
    `;
  };

  // Create meal marker positions
  const lastMealCoords = angleToCoords(startAngle, 100);
  const firstMealCoords = angleToCoords(endAngle, 100);

  // Only show fasting window if we have the required data
  const showFastingWindow = firstMealTime && fastingDuration && lastMealTime;

  return (
    <svg
      viewBox="0 0 300 340"
      className="w-full max-w-xs mx-auto"
      role="img"
      aria-label={showFastingWindow ? `Fasting window: ${lastMealTime} to ${firstMealTime}` : 'Clock face'}
    >
      {/* Clock face circle background */}
      <circle
        cx="150"
        cy="150"
        r="100"
        fill="white"
        stroke="#d1d5db"
        strokeWidth="3"
      />

      {/* All 12 hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30; // 30° per hour
        const outerCoords = angleToCoords(angle, 95);
        const innerCoords = angleToCoords(angle, 85);
        
        return (
          <line
            key={`marker-${i}`}
            x1={innerCoords.x}
            y1={innerCoords.y}
            x2={outerCoords.x}
            y2={outerCoords.y}
            stroke="#6b7280"
            strokeWidth="2"
          />
        );
      })}

      {/* All 12 numbers around the clock */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => {
        const angle = index * 30; // 30° per hour
        const coords = angleToCoords(angle, 115);
        
        return (
          <text
            key={`num-${num}`}
            x={coords.x}
            y={coords.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg fill-gray-900 font-bold"
            style={{ fontSize: '18px' }}
          >
            {num}
          </text>
        );
      })}

      {/* Fasting period arc - gradient shaded like the rainbow clock */}
      {showFastingWindow && (
        <>
          {/* Define radial gradient for the fasting arc - darker center to lighter edge */}
          <defs>
            <radialGradient id="fastingGradient">
              <stop offset="0%" stopColor="#6b7280" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9ca3af" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.6" />
            </radialGradient>
            
            {/* Clip path to create the pie slice shape */}
            <clipPath id="fastingClip">
              <path d={createPiePath()} />
            </clipPath>
          </defs>
          
          {/* Filled pie slice for fasting period */}
          <circle
            cx="150"
            cy="150"
            r="95"
            fill="url(#fastingGradient)"
            clipPath="url(#fastingClip)"
          />

          {/* Start marker (red dot) */}
          <circle
            cx={lastMealCoords.x}
            cy={lastMealCoords.y}
            r="8"
            fill="#ef4444"
            stroke="white"
            strokeWidth="2"
            aria-label={`Fasting starts at ${lastMealTime}`}
          />

          {/* End marker (green dot) */}
          <circle
            cx={firstMealCoords.x}
            cy={firstMealCoords.y}
            r="8"
            fill="#10b981"
            stroke="white"
            strokeWidth="2"
            aria-label={`Fasting ends at ${firstMealTime}`}
          />
        </>
      )}

      {/* Legend - positioned below the clock */}
      {showFastingWindow && (
        <g>
          {/* Red dot legend - Start fast */}
          <g transform="translate(85, 295)">
            <circle cx="0" cy="0" r="5" fill="#ef4444" stroke="white" strokeWidth="1.5" />
            <text x="10" y="4" className="text-xs fill-gray-700 font-medium">
              Start fast: {formatLegendDateTime(lastMealTime, true)}
            </text>
          </g>
          
          {/* Green dot legend - End fast */}
          <g transform="translate(85, 315)">
            <circle cx="0" cy="0" r="5" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <text x="10" y="4" className="text-xs fill-gray-700 font-medium">
              End fast: {formatLegendDateTime(firstMealTime, false)}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

export default FastingTimeline;
