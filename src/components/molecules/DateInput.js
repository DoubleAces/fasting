import React from 'react';
import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * DateInput Molecule Component
 * 
 * Custom date input with dd/mm/yyyy format support.
 * Uses three separate input fields for day, month, and year.
 * Converts to/from ISO date string (yyyy-mm-dd) for API compatibility.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID for accessibility
 * @param {string} props.label - Label text
 * @param {string} props.value - ISO date string (yyyy-mm-dd)
 * @param {Function} props.onChange - Change handler, receives ISO date string
 * @param {Function} [props.onBlur] - Blur handler
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.max] - Maximum date in ISO format (yyyy-mm-dd)
 */
const DateInput = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  max,
}) => {
  // Parse ISO date string (yyyy-mm-dd) into day/month/year
  const parseISODate = (isoDate) => {
    if (!isoDate) return { day: '', month: '', year: '' };
    
    const [year, month, day] = isoDate.split('-');
    return {
      day: day || '',
      month: month || '',
      year: year || '',
    };
  };

  // Convert day/month/year to ISO date string (yyyy-mm-dd)
  const toISODate = (day, month, year) => {
    if (!day || !month || !year) return '';
    
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    
    return `${year}-${paddedMonth}-${paddedDay}`;
  };

  const dateComponents = parseISODate(value);
  const [day, setDay] = React.useState(dateComponents.day);
  const [month, setMonth] = React.useState(dateComponents.month);
  const [year, setYear] = React.useState(dateComponents.year);

  // Update local state when value prop changes (e.g., on form reset)
  React.useEffect(() => {
    const parsed = parseISODate(value);
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [value]);

  // Handle change for each component
  const handleDayChange = (e) => {
    const newDay = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(newDay);
    
    // Only call onChange when we have a complete date or all fields are empty
    if (newDay && month && year.length === 4) {
      const isoDate = toISODate(newDay, month, year);
      onChange(isoDate);
    } else if (!newDay && !month && !year) {
      onChange('');
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(newMonth);
    
    // Only call onChange when we have a complete date or all fields are empty
    if (day && newMonth && year.length === 4) {
      const isoDate = toISODate(day, newMonth, year);
      onChange(isoDate);
    } else if (!day && !newMonth && !year) {
      onChange('');
    }
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(newYear);
    
    // Only call onChange when we have a complete date (year must be 4 digits)
    if (day && month && newYear.length === 4) {
      const isoDate = toISODate(day, month, newYear);
      onChange(isoDate);
    } else if (!day && !month && !newYear) {
      onChange('');
    }
  };

  const handleBlur = (e) => {
    // Only trigger onBlur if the focus is leaving the entire date input group
    // Check if the new focused element is NOT one of our date input fields
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isStillInDateInput = 
        activeElement?.id === `${id}-day` ||
        activeElement?.id === `${id}-month` ||
        activeElement?.id === `${id}-year`;
      
      if (!isStillInDateInput && onBlur) {
        onBlur();
      }
    }, 0);
  };

  // Get current date for max validation
  const today = new Date().toISOString().split('T')[0];
  const maxDate = max || today;
  const [maxYear, maxMonth, maxDay] = maxDate.split('-');

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${id}-day`} required={required}>
        {label}
      </Label>
      
      <div className="flex gap-2 items-start">
        {/* Day Input */}
        <div className="flex-1">
          <Input
            id={`${id}-day`}
            type="text"
            inputMode="numeric"
            value={day}
            onChange={handleDayChange}
            onBlur={handleBlur}
            placeholder="DD"
            maxLength={2}
            aria-label="Day"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="text-center"
          />
        </div>

        <span className="text-gray-500 self-center text-xl leading-none" aria-hidden="true">/</span>

        {/* Month Input */}
        <div className="flex-1">
          <Input
            id={`${id}-month`}
            type="text"
            inputMode="numeric"
            value={month}
            onChange={handleMonthChange}
            onBlur={handleBlur}
            placeholder="MM"
            maxLength={2}
            aria-label="Month"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="text-center"
          />
        </div>

        <span className="text-gray-500 self-center text-xl leading-none" aria-hidden="true">/</span>

        {/* Year Input */}
        <div className="flex-[1.5]">
          <Input
            id={`${id}-year`}
            type="text"
            inputMode="numeric"
            value={year}
            onChange={handleYearChange}
            onBlur={handleBlur}
            placeholder="YYYY"
            maxLength={4}
            aria-label="Year"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="text-center"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage id={`${id}-error`}>
          {error}
        </ErrorMessage>
      )}
    </div>
  );
};

export default DateInput;
