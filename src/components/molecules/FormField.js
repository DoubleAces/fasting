import React from 'react';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Label from '@/components/atoms/Label';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * FormField Molecule Component
 * 
 * A complete form field combining Label, Input/Select, ErrorMessage, and optional help text.
 * Automatically handles accessibility attributes and error states.
 * Follows WCAG 2.1 AA accessibility guidelines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Field id (used for label-input association)
 * @param {string} props.label - Label text
 * @param {string} [props.type='text'] - Field type: 'text'|'number'|'email'|'password'|'select'
 * @param {string} [props.value=''] - Current field value
 * @param {Array} [props.options=[]] - Options for select field [{value, label}]
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {boolean} [props.readOnly=false] - Whether field is read-only
 * @param {string} [props.error=''] - Error message
 * @param {string} [props.helpText=''] - Help text (shown below input)
 * @param {string} [props.className=''] - Additional CSS classes for wrapper
 * @param {number} [props.min] - Min value (for number inputs)
 * @param {number} [props.max] - Max value (for number inputs)
 * @param {number} [props.step] - Step value (for number inputs)
 * @param {Function} [props.onChange] - Change event handler
 * @param {Function} [props.onBlur] - Blur event handler
 * @param {Function} [props.onFocus] - Focus event handler
 */
const FormField = ({
  id,
  label,
  type = 'text',
  value,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error = '',
  helpText = '',
  className = '',
  min,
  max,
  step,
  onChange,
  onBlur,
  onFocus,
  ...props
}) => {
  const hasError = Boolean(error);
  const hasHelpText = Boolean(helpText);
  
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  // Build aria-describedby attribute
  let ariaDescribedby = '';
  if (hasHelpText) {
    ariaDescribedby += helpId;
  }
  if (hasError) {
    ariaDescribedby += (ariaDescribedby ? ' ' : '') + errorId;
  }

  // Common props for both Input and Select
  const fieldProps = {
    id,
    value,
    placeholder,
    required,
    disabled,
    readOnly,
    error: hasError,
    onChange,
    onBlur,
    onFocus,
    'aria-describedby': ariaDescribedby || undefined,
    ...props,
  };

  return (
    <div className={className}>
      <Label
        htmlFor={id}
        required={required}
        error={hasError}
      >
        {label}
      </Label>

      {type === 'select' ? (
        <Select
          {...fieldProps}
          options={options}
        />
      ) : (
        <Input
          {...fieldProps}
          type={type}
          min={min}
          max={max}
          step={step}
        />
      )}

      {hasHelpText && (
        <div
          id={helpId}
          className="text-gray-600 text-sm mt-1"
        >
          {helpText}
        </div>
      )}

      {hasError && (
        <ErrorMessage id={errorId}>
          {error}
        </ErrorMessage>
      )}
    </div>
  );
};

export default FormField;
