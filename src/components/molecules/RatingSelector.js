import React from 'react';
import Label from '@/components/atoms/Label';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * RatingSelector Molecule Component
 * 
 * A radio button group for selecting ratings (hunger, energy, well-being).
 * Combines Label and ErrorMessage atoms with radio inputs.
 * Follows WCAG 2.1 AA accessibility guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Radio group id
 * @param {string} props.label - Label text for the rating selector
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string} [props.value=''] - Currently selected value
 * @param {string} [props.layout='horizontal'] - Layout direction: 'horizontal' | 'vertical'
 * @param {boolean} [props.required=false] - Whether selection is required
 * @param {boolean} [props.disabled=false] - Whether selector is disabled
 * @param {string} [props.error=''] - Error message
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Function} [props.onChange] - Change event handler (receives value string)
 */
const RatingSelector = ({
  id,
  label,
  options = [],
  value = '',
  layout = 'horizontal',
  required = false,
  disabled = false,
  error = '',
  className = '',
  onChange,
  ...props
}) => {
  const hasError = Boolean(error);
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  // Handle radio button click
  const handleChange = (selectedValue) => {
    if (disabled) return;

    // Allow deselection by clicking the same option
    const newValue = value === selectedValue ? '' : selectedValue;
    
    if (onChange) {
      onChange(newValue);
    }
  };

  // Layout classes
  const layoutClasses = layout === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-4 flex-wrap gap-y-2';

  return (
    <div className={className}>
      <Label
        id={labelId}
        required={required}
        error={hasError}
      >
        {label}
      </Label>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={hasError ? errorId : undefined}
        aria-invalid={hasError ? 'true' : undefined}
        className="mt-2"
      >
        <div className={`flex ${layoutClasses}`}>
          {options.map((option) => {
            const radioId = `${id}-${option.value}`;
            const isChecked = value === option.value;

            return (
              <label
                key={option.value}
                htmlFor={radioId}
                onClick={(e) => {
                  // Handle deselection on label click
                  if (isChecked && !disabled) {
                    e.preventDefault();
                    handleChange(option.value);
                  }
                }}
                className={`
                  flex items-center cursor-pointer min-h-[44px] px-4 py-2 rounded-lg border-2 transition-all
                  ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
                  ${hasError && !isChecked ? 'border-red-300' : ''}
                `.trim()}
              >
                <input
                  type="radio"
                  id={radioId}
                  name={id}
                  value={option.value}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => {
                    // Only handle selection, deselection handled by label click
                    if (!isChecked) {
                      handleChange(option.value);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  {...props}
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {hasError && (
        <ErrorMessage id={errorId}>
          {error}
        </ErrorMessage>
      )}
    </div>
  );
};

export default RatingSelector;
