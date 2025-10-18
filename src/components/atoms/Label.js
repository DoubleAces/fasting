import React from 'react';

/**
 * Label Component
 * 
 * A reusable label component for form inputs with support for required indicators
 * and error states. Follows WCAG 2.1 AA accessibility guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.htmlFor - The id of the input element this label is for
 * @param {boolean} [props.required=false] - Whether to show a required indicator (*)
 * @param {boolean} [props.error=false] - Whether to apply error styling
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Label content
 */
const Label = ({
  htmlFor,
  required = false,
  error = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'block text-sm font-medium text-gray-700';
  const errorClasses = error ? 'text-red-600' : '';
  
  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <label
      htmlFor={htmlFor}
      className={combinedClasses}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
};

export default Label;
