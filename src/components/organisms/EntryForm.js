import React, { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import TimeInput from '@/components/molecules/TimeInput';
import RatingSelector from '@/components/molecules/RatingSelector';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * EntryForm Organism Component
 * 
 * Main form for creating and editing daily fasting entries.
 * Combines FormField, TimeInput, and RatingSelector molecules.
 * Handles client-side validation and API submission.
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.entry] - Existing entry for edit mode
 * @param {Function} [props.onSuccess] - Callback called after successful submission
 * @param {Function} [props.onCancel] - Callback for cancel button
 */
const EntryForm = ({
  entry,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = Boolean(entry);

  // Form state
  const [formData, setFormData] = useState({
    date: entry?.date || '',
    firstMealTime: entry?.firstMealTime || '',
    lastMealTime: entry?.lastMealTime || '',
    hoursOfSleep: entry?.hoursOfSleep || '',
    morningWeight: entry?.morningWeight || '',
    hungerLevel: entry?.hungerLevel || '',
    energyLevel: entry?.energyLevel || '',
    wellBeing: entry?.wellBeing || '',
    foodNotes: entry?.foodNotes || '',
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rating options
  const hungerOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const energyOptions = [
    { value: 'Low Energy', label: 'Low Energy' },
    { value: 'Medium Energy', label: 'Medium Energy' },
    { value: 'High Energy', label: 'High Energy' },
  ];

  const wellBeingOptions = [
    { value: 'Poor', label: 'Poor' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Good', label: 'Good' },
  ];

  // Handle field changes
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle field blur for validation
  const handleBlur = (field) => () => {
    // Validate numeric fields on blur
    const newErrors = { ...errors };

    if (field === 'hoursOfSleep' && formData.hoursOfSleep) {
      const sleep = parseFloat(formData.hoursOfSleep);
      if (isNaN(sleep) || sleep < 0) {
        newErrors.hoursOfSleep = 'Hours of sleep must be a positive number';
      } else if (sleep > 24) {
        newErrors.hoursOfSleep = 'Hours of sleep cannot exceed 24 hours';
      } else {
        delete newErrors.hoursOfSleep;
      }
    }

    if (field === 'morningWeight' && formData.morningWeight) {
      const weight = parseFloat(formData.morningWeight);
      if (isNaN(weight) || weight < 0) {
        newErrors.morningWeight = 'Morning weight must be a positive number';
      } else {
        delete newErrors.morningWeight;
      }
    }

    if (field === 'foodNotes' && formData.foodNotes && formData.foodNotes.length > 2000) {
      newErrors.foodNotes = 'Food notes cannot exceed 2000 characters';
    } else if (field === 'foodNotes') {
      delete newErrors.foodNotes;
    }

    setErrors(newErrors);
  };

  // Handle rating changes
  const handleRatingChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.firstMealTime) {
      newErrors.firstMealTime = 'First meal time is required';
    }
    if (!formData.lastMealTime) {
      newErrors.lastMealTime = 'Last meal time is required';
    }

    // Optional field validation
    if (formData.hoursOfSleep) {
      const sleep = parseFloat(formData.hoursOfSleep);
      if (isNaN(sleep) || sleep < 0) {
        newErrors.hoursOfSleep = 'Hours of sleep must be a positive number';
      } else if (sleep > 24) {
        newErrors.hoursOfSleep = 'Hours of sleep cannot exceed 24 hours';
      }
    }

    if (formData.morningWeight) {
      const weight = parseFloat(formData.morningWeight);
      if (isNaN(weight) || weight < 0) {
        newErrors.morningWeight = 'Morning weight must be a positive number';
      }
    }

    if (formData.foodNotes && formData.foodNotes.length > 2000) {
      newErrors.foodNotes = 'Food notes cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const payload = {
        date: formData.date,
        firstMealTime: formData.firstMealTime,
        lastMealTime: formData.lastMealTime,
      };

      // Add optional fields only if they have values
      if (formData.hoursOfSleep) {
        payload.hoursOfSleep = parseFloat(formData.hoursOfSleep);
      }
      if (formData.morningWeight) {
        payload.morningWeight = parseFloat(formData.morningWeight);
      }
      if (formData.hungerLevel) {
        payload.hungerLevel = formData.hungerLevel;
      }
      if (formData.energyLevel) {
        payload.energyLevel = formData.energyLevel;
      }
      if (formData.wellBeing) {
        payload.wellBeing = formData.wellBeing;
      }
      if (formData.foodNotes) {
        payload.foodNotes = formData.foodNotes;
      }

      // Make API request
      const url = isEditMode ? `/api/entries/${entry._id}` : '/api/entries';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save entry');
      }

      const result = await response.json();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Display */}
      {apiError && (
        <ErrorMessage id="api-error" showIcon>
          {apiError}
        </ErrorMessage>
      )}

      {/* Date Field */}
      <FormField
        id="entry-date"
        label="Date"
        type="date"
        value={formData.date}
        onChange={handleChange('date')}
        error={errors.date}
        required
      />

      {/* Meal Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeInput
          id="first-meal-time"
          label="First Meal Time"
          value={formData.firstMealTime}
          onChange={handleChange('firstMealTime')}
          error={errors.firstMealTime}
          required
        />

        <TimeInput
          id="last-meal-time"
          label="Last Meal Time"
          value={formData.lastMealTime}
          onChange={handleChange('lastMealTime')}
          error={errors.lastMealTime}
          required
        />
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="hours-of-sleep"
          label="Hours of Sleep"
          type="number"
          value={formData.hoursOfSleep}
          onChange={handleChange('hoursOfSleep')}
          onBlur={handleBlur('hoursOfSleep')}
          error={errors.hoursOfSleep}
          min={0}
          max={24}
          step={0.5}
          placeholder="e.g., 7.5"
        />

        <FormField
          id="morning-weight"
          label="Morning Weight (kg)"
          type="number"
          value={formData.morningWeight}
          onChange={handleChange('morningWeight')}
          onBlur={handleBlur('morningWeight')}
          error={errors.morningWeight}
          min={0}
          step={0.1}
          placeholder="e.g., 75.5"
        />
      </div>

      {/* Rating Selectors */}
      <RatingSelector
        id="hunger-level"
        label="Hunger Level"
        options={hungerOptions}
        value={formData.hungerLevel}
        onChange={handleRatingChange('hungerLevel')}
        error={errors.hungerLevel}
      />

      <RatingSelector
        id="energy-level"
        label="Energy Level"
        options={energyOptions}
        value={formData.energyLevel}
        onChange={handleRatingChange('energyLevel')}
        error={errors.energyLevel}
      />

      <RatingSelector
        id="well-being"
        label="Well-being"
        options={wellBeingOptions}
        value={formData.wellBeing}
        onChange={handleRatingChange('wellBeing')}
        error={errors.wellBeing}
      />

      {/* Food Notes */}
      <FormField
        id="food-notes"
        label="Food Notes"
        type="text"
        value={formData.foodNotes}
        onChange={handleChange('foodNotes')}
        onBlur={handleBlur('foodNotes')}
        error={errors.foodNotes}
        placeholder="What did you eat today?"
        helpText="Optional: Describe your meals and snacks"
      />

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
};

export default EntryForm;
