import React from 'react';

/**
 * ErrorMessage Component
 * 
 * Displays validation error messages with proper accessibility attributes.
 * Should be associated with form inputs via aria-describedby.
 * Follows WCAG 2.1 AA accessibility guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Required id for aria-describedby association
 * @param {boolean} [props.showIcon=false] - Whether to show an error icon
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Error message content
 */
const ErrorMessage = ({
  id,
  showIcon = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'text-red-600 text-sm mt-1';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={combinedClasses}
      {...props}
    >
      {showIcon && (
        <svg
          className="inline w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="error icon"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {children}
    </div>
  );
};

export default ErrorMessage;
