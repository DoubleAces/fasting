import React, { useState } from 'react';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import { isValidTimeFormat } from '@/lib/utils/timeUtils';

/**
 * TimeInput Molecule Component
 * 
 * A time input field with label and validation for both 12-hour and 24-hour formats.
 * Combines Input, Label, and ErrorMessage atoms.
 * Follows WCAG 2.1 AA accessibility guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input element id
 * @param {string} props.label - Label text
 * @param {string} [props.value=''] - Current time value
 * @param {string} [props.format='24h'] - Time format: '12h' | '24h'
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {boolean} [props.readOnly=false] - Whether input is read-only
 * @param {string} [props.error=''] - External error message
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onChange] - Change event handler
 * @param {Function} [props.onBlur] - Blur event handler
 */
const TimeInput = ({
  id,
  label,
  value: controlledValue,
  format = '24h',
  required = false,
  disabled = false,
  readOnly = false,
  error: externalError = '',
  className = '',
  onChange,
  onBlur,
  ...props
}) => {
  const [internalError, setInternalError] = useState('');
  const [touched, setTouched] = useState(false);
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  // Use controlled value if provided, otherwise use internal value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Determine which error to display
  const errorMessage = externalError || (touched ? internalError : '');
  const hasError = Boolean(errorMessage);

  // Get placeholder based on format
  const getPlaceholder = () => {
    if (format === '12h') {
      return 'HH:mm AM/PM (e.g., 02:30 PM)';
    }
    return 'HH:mm (e.g., 14:30)';
  };

  // Validate time based on format
  const validateTime = (timeValue) => {
    // Empty is valid unless required
    if (!timeValue || timeValue.trim() === '') {
      if (required) {
        return 'Time is required';
      }
      return '';
    }

    // Validate based on format
    if (format === '24h') {
      if (!isValidTimeFormat(timeValue)) {
        return 'Invalid time format. Use HH:mm (e.g., 14:30)';
      }
    } else {
      // 12-hour format validation
      const time12hRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM|am|pm)$/;
      if (!time12hRegex.test(timeValue)) {
        return 'Invalid time format. Use HH:mm AM/PM (e.g., 02:30 PM)';
      }
    }

    return '';
  };

  // Handle blur event
  const handleBlur = (e) => {
    setTouched(true);
    const validationError = validateTime(e.target.value);
    setInternalError(validationError);

    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle change event
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Update internal value if not controlled
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    // Clear error when user starts typing after an error was shown
    if (touched && internalError) {
      const validationError = validateTime(newValue);
      setInternalError(validationError);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <Label
        htmlFor={id}
        required={required}
        error={hasError}
      >
        {label}
      </Label>
      
      <Input
        id={id}
        type="text"
        value={value}
        placeholder={getPlaceholder()}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        error={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
      
      {hasError && (
        <ErrorMessage id={errorId}>
          {errorMessage}
        </ErrorMessage>
      )}
    </div>
  );
};

export default TimeInput;
