import React from 'react';
import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * DateInput Molecule Component
 * 
 * Modern HTML5 date input with native browser calendar picker.
 * Uses single <input type="date"> for improved UX and accessibility.
 * Maintains backward compatibility with ISO date string format.
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
  // Handle change event - extract ISO date string from input value
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Get current date for max validation if not provided
  const today = new Date().toISOString().split('T')[0];
  const maxDate = max || today;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      
      {/* HTML5 Date Input */}
      <Input
        id={id}
        type="date"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        max={maxDate}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />

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
