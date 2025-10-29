/**
 * Input Component
 * 
 * Atomic component for text inputs with various types and states
 * Requirements: WCAG 2.1 AA, proper labeling, error states
 * 
 * @component
 * @example
 * <Input id="email" type="email" placeholder="Enter email" />
 * <Input id="age" type="number" min={0} max={120} error aria-describedby="age-error" />
 */

import React from 'react';

const Input = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  fullWidth = true,
  className = '',
  name,
  min,
  max,
  step,
  ...props
}) => {
  // Base styles - always applied
  // T050: Responsive text sizing + 44px touch targets for mobile UX
  const baseStyles = [
    'px-3',
    'py-2',
    'min-h-[44px]',
    'text-sm',
    'md:text-base',
    'text-gray-900',
    'placeholder-gray-400',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    // Focus styles for accessibility
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
  ];

  // Width styles
  const widthStyles = fullWidth ? ['w-full'] : [];

  // Border and color styles
  const colorStyles = error
    ? [
        'border-2',
        'border-red-500',
        'focus:ring-red-500',
        'focus:border-red-500',
      ]
    : [
        'border',
        'border-gray-300',
        'focus:ring-primary-500',
        'focus:border-primary-500',
      ];

  // State styles
  const stateStyles = [];
  if (disabled) {
    stateStyles.push('bg-gray-100', 'cursor-not-allowed', 'opacity-50');
  } else if (readOnly) {
    stateStyles.push('bg-gray-50', 'cursor-default');
  } else {
    stateStyles.push('bg-white');
  }

  // Combine all styles
  const combinedStyles = [
    ...baseStyles,
    ...widthStyles,
    ...colorStyles,
    ...stateStyles,
    className,
  ].join(' ');

  // Build props object
  const inputProps = {
    id,
    type,
    className: combinedStyles,
    disabled,
    readOnly,
    required,
    name,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    ...props,
  };

  // Add aria-invalid only when error is true
  if (error) {
    inputProps['aria-invalid'] = 'true';
  }

  // Add min/max/step for number and date/time inputs
  if (type === 'number' || type === 'date' || type === 'time' || type === 'datetime-local') {
    if (min !== undefined) inputProps.min = min;
    if (max !== undefined) inputProps.max = max;
    if (step !== undefined) inputProps.step = step;
  }

  return <input {...inputProps} />;
};

export default Input;
