import React, { useState } from 'react';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * TimeInput Molecule Component
 * 
 * Custom time input with dropdown selectors for hour and minute.
 * Supports both 12-hour (with AM/PM) and 24-hour formats based on format prop.
 * Always returns time in 24-hour HH:mm format regardless of display format.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input element id
 * @param {string} props.label - Label text
 * @param {string} [props.value=''] - Current time value in HH:mm format (24-hour)
 * @param {string} [props.format='24h'] - Display format: '12h' | '24h'
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {string} [props.error=''] - External error message
 * @param {Function} [props.onChange] - Change handler, receives HH:mm string
 * @param {Function} [props.onBlur] - Blur event handler
 */
const TimeInput = ({
  id,
  label,
  value,
  format = '24h',
  required = false,
  error: externalError = '',
  onChange,
  onBlur,
}) => {
  // Parse HH:mm into components
  const parseTime = (timeString) => {
    if (!timeString) return { hour: '', minute: '', period: 'AM' };
    
    const [hourStr, minuteStr] = timeString.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = minuteStr || '';
    
    if (format === '12h') {
      // Convert 24h to 12h
      const period = hour24 >= 12 ? 'PM' : 'AM';
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      // Pad hour to match select options
      return { hour: hour12.toString().padStart(2, '0'), minute, period };
    } else {
      // 24h format
      return { hour: hourStr || '', minute, period: 'AM' };
    }
  };

  // Convert components to HH:mm (always 24h format for storage)
  const toTimeString = (hour, minute, period) => {
    if (!hour || !minute) return '';
    
    let hour24 = parseInt(hour, 10);
    
    if (format === '12h') {
      // Convert 12h to 24h
      if (period === 'AM') {
        if (hour24 === 12) hour24 = 0;
      } else {
        if (hour24 !== 12) hour24 += 12;
      }
    }
    
    const paddedHour = hour24.toString().padStart(2, '0');
    const paddedMinute = typeof minute === 'string' ? minute : minute.toString().padStart(2, '0');
    
    return `${paddedHour}:${paddedMinute}`;
  };

  const timeComponents = parseTime(value);
  const [hour, setHour] = useState(timeComponents.hour);
  const [minute, setMinute] = useState(timeComponents.minute);
  const [period, setPeriod] = useState(timeComponents.period);

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      const parsed = parseTime(value);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [value, format]);

  // Generate hour options based on format
  const getHourOptions = () => {
    const hours = format === '12h' 
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(h => ({
      value: h.toString().padStart(2, '0'),
      label: h.toString().padStart(2, '0'),
    }));
  };

  // Generate minute options (00-59)
  const getMinuteOptions = () => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: i.toString().padStart(2, '0'),
      label: i.toString().padStart(2, '0'),
    }));
  };

  // Handle changes
  const handleHourChange = (e) => {
    const newHour = e.target.value;
    setHour(newHour);
    // Always update if we have both hour and minute
    if (newHour && minute) {
      const timeStr = toTimeString(newHour, minute, period);
      if (onChange) onChange(timeStr);
    } else if (!newHour && !minute) {
      // Clear the time if both are empty
      if (onChange) onChange('');
    }
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    // Always update if we have both hour and minute
    if (hour && newMinute) {
      const timeStr = toTimeString(hour, newMinute, period);
      if (onChange) onChange(timeStr);
    } else if (!hour && !newMinute) {
      // Clear the time if both are empty
      if (onChange) onChange('');
    }
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    // Always update if we have both hour and minute
    if (hour && minute) {
      const timeStr = toTimeString(hour, minute, newPeriod);
      if (onChange) onChange(timeStr);
    }
  };

  const handleBlur = () => {
    // Only trigger onBlur if the focus is leaving the entire time input group
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillInTimeInput = 
        activeElement?.id === `${id}-hour` ||
        activeElement?.id === `${id}-minute` ||
        activeElement?.id === `${id}-period`;
      
      if (!isStillInTimeInput && onBlur) {
        onBlur();
      }
    }, 0);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${id}-hour`} required={required}>
        {label}
      </Label>
      
      <div className="flex gap-2 items-start">
        {/* Hour Select */}
        <div className="flex-1">
          <Select
            id={`${id}-hour`}
            value={hour}
            onChange={handleHourChange}
            onBlur={handleBlur}
            options={getHourOptions()}
            placeholder="HH"
            aria-label="Hour"
            aria-invalid={Boolean(externalError)}
            aria-describedby={externalError ? `${id}-error` : undefined}
          />
        </div>

        <span className="text-gray-500 self-center text-xl leading-none pt-2" aria-hidden="true">:</span>

        {/* Minute Select */}
        <div className="flex-1">
          <Select
            id={`${id}-minute`}
            value={minute}
            onChange={handleMinuteChange}
            onBlur={handleBlur}
            options={getMinuteOptions()}
            placeholder="MM"
            aria-label="Minute"
            aria-invalid={Boolean(externalError)}
            aria-describedby={externalError ? `${id}-error` : undefined}
          />
        </div>

        {/* AM/PM Select (only for 12h format) */}
        {format === '12h' && (
          <>
            <span className="text-gray-500 self-center text-sm leading-none pt-3 px-1" aria-hidden="true">•</span>
            <div className="flex-1">
              <Select
                id={`${id}-period`}
                value={period}
                onChange={handlePeriodChange}
                onBlur={handleBlur}
                options={[
                  { value: 'AM', label: 'AM' },
                  { value: 'PM', label: 'PM' },
                ]}
                aria-label="AM/PM"
                aria-invalid={Boolean(externalError)}
                aria-describedby={externalError ? `${id}-error` : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {externalError && (
        <ErrorMessage id={`${id}-error`}>
          {externalError}
        </ErrorMessage>
      )}
    </div>
  );
};

export default TimeInput;
