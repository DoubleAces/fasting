import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * SettingsForm Component
 * 
 * Form for managing user preferences and settings.
 * Handles weight unit, time format, and fasting goal configuration.
 * Supports both create and update modes.
 * 
 * @param {Object} [settings] - Existing settings to edit (omit for create mode)
 * @param {Function} [onSuccess] - Callback when settings saved successfully
 * @param {Function} [onCancel] - Optional callback when cancel button clicked
 */
export default function SettingsForm({ settings, onSuccess, onCancel }) {
  // Form data state
  const [formData, setFormData] = useState({
    weightUnit: settings?.weightUnit || 'kg',
    timeFormat: settings?.timeFormat || '24h',
    fastingGoal: settings?.fastingGoal || 16,
  });

  // Form state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fastingGoal' ? Number(value) || value : value,
    }));
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  // Validate individual field on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldErrors = validateField(name, value);
    
    flushSync(() => {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name],
      }));
    });
  };

  // Validate single field
  const validateField = (name, value) => {
    const fieldErrors = {};

    if (name === 'fastingGoal') {
      if (!value && value !== 0) {
        fieldErrors.fastingGoal = 'Fasting goal is required';
      } else if (isNaN(value)) {
        fieldErrors.fastingGoal = 'Fasting goal must be a valid number';
      } else if (Number(value) <= 0) {
        fieldErrors.fastingGoal = 'Fasting goal must be greater than 0';
      } else if (Number(value) > 24) {
        fieldErrors.fastingGoal = 'Fasting goal cannot exceed 24 hours';
      }
    }

    return fieldErrors;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    // Validate fasting goal
    if (!formData.fastingGoal && formData.fastingGoal !== 0) {
      newErrors.fastingGoal = 'Fasting goal is required';
    } else if (isNaN(formData.fastingGoal)) {
      newErrors.fastingGoal = 'Fasting goal must be a valid number';
    } else if (Number(formData.fastingGoal) <= 0) {
      newErrors.fastingGoal = 'Fasting goal must be greater than 0';
    } else if (Number(formData.fastingGoal) > 24) {
      newErrors.fastingGoal = 'Fasting goal cannot exceed 24 hours';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    flushSync(() => {
      setErrors(validationErrors);
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit to API
    setIsSubmitting(true);
    setApiError('');

    try {
      const method = settings ? 'PUT' : 'POST';
      const response = await fetch('/api/settings', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      // Success
      if (onSuccess) {
        onSuccess(data.settings);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Message */}
      {apiError && (
        <ErrorMessage id="settings-api-error" showIcon>
          {apiError}
        </ErrorMessage>
      )}

      {/* Weight Unit */}
      <FormField
        id="weightUnit"
        label="Weight Unit"
        name="weightUnit"
        type="select"
        value={formData.weightUnit}
        onChange={handleChange}
        error={errors.weightUnit}
        options={[
          { value: 'kg', label: 'Kilograms (kg)' },
          { value: 'lbs', label: 'Pounds (lbs)' },
        ]}
      />

      {/* Time Format */}
      <FormField
        id="timeFormat"
        label="Time Format"
        name="timeFormat"
        type="select"
        value={formData.timeFormat}
        onChange={handleChange}
        error={errors.timeFormat}
        options={[
          { value: '12h', label: '12-hour (AM/PM)' },
          { value: '24h', label: '24-hour' },
        ]}
      />

      {/* Fasting Goal */}
      <FormField
        id="fastingGoal"
        label="Fasting Goal (hours)"
        name="fastingGoal"
        type="number"
        value={formData.fastingGoal}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.fastingGoal}
        min="0"
        max="24"
        step="0.5"
        helpText="Target fasting duration in hours (e.g., 16 for 16:8 fasting)"
      />

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
