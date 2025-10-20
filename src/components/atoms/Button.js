/**
 * Button Component
 * 
 * Atomic component for buttons with variants, sizes, and states
 * Requirements: WCAG 2.1 AA, 44x44px minimum touch target
 * 
 * @component
 * @example
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 * <Button variant="danger" disabled>Delete</Button>
 * <Button loading>Submitting...</Button>
 */

import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  // Base styles - always applied
  const baseStyles = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-colors',
    'duration-200',
    // WCAG 2.1 AA - Minimum 44x44px touch target
    'min-h-[44px]',
    'min-w-[44px]',
    // Focus styles for accessibility
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  // Variant styles
  const variantStyles = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'active:bg-blue-800',
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
      'active:bg-gray-800',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'active:bg-red-800',
    ],
    outline: [
      'bg-transparent',
      'border',
      'border-gray-300',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus:ring-gray-500',
      'active:bg-gray-100',
    ],
  };

  // Size styles
  const sizeStyles = {
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-6', 'py-3'],
  };

  // State styles
  const stateStyles = [];
  if (disabled || loading) {
    stateStyles.push('opacity-50', 'cursor-not-allowed');
  }

  // Full width
  const widthStyles = fullWidth ? ['w-full'] : [];

  // Combine all styles
  const combinedStyles = [
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...stateStyles,
    ...widthStyles,
    className,
  ].join(' ');

  // Handle click
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={combinedStyles}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
