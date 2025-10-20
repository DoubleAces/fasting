import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * An animated loading spinner for indicating loading states.
 * Follows WCAG 2.1 AA accessibility guidelines with proper ARIA attributes.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} [props.color='blue'] - Color variant: 'blue' | 'white' | 'gray'
 * @param {string} [props.label='Loading'] - Accessible label for screen readers
 * @param {string} [props.className=''] - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  label = 'Loading',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Color classes
  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.blue;
  
  const baseClasses = 'animate-spin';
  const combinedClasses = `${baseClasses} ${sizeClass} ${colorClass} ${className}`.trim();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={combinedClasses}
      {...props}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    </div>
  );
};

export default LoadingSpinner;
