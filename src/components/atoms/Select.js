/**
 * Select Component
 * 
 * Atomic component for dropdown/select inputs with accessibility
 * Requirements: WCAG 2.1 AA, keyboard navigation
 * 
 * @component
 * @example
 * const options = [
 *   { value: 'metric', label: 'Metric (kg)' },
 *   { value: 'imperial', label: 'Imperial (lbs)' }
 * ];
 * <Select id="measurement" options={options} placeholder="Choose..." />
 */

import React from 'react';

const Select = ({
  id,
  options = [],
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error = false,
  fullWidth = true,
  className = '',
  name,
  ...props
}) => {
  // Base styles - always applied
  const baseStyles = [
    'px-3',
    'py-2',
    'text-base',
    'text-gray-900',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    'cursor-pointer',
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
        'focus:ring-blue-500',
        'focus:border-blue-500',
      ];

  // State styles
  const stateStyles = [];
  if (disabled) {
    stateStyles.push('bg-gray-100', 'cursor-not-allowed', 'opacity-50');
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
  const selectProps = {
    id,
    className: combinedStyles,
    disabled,
    required,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    ...props,
  };

  // Add aria-invalid only when error is true
  if (error) {
    selectProps['aria-invalid'] = 'true';
  }

  return (
    <select {...selectProps}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
