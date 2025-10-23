import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import FormField from '@/components/molecules/FormField';
import DateInput from '@/components/molecules/DateInput';
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
 * @param {Object} [props.settings] - User settings for display preferences
 * @param {Function} [props.onSuccess] - Callback called after successful submission
 * @param {Function} [props.onCancel] - Callback for cancel button
 */
const EntryForm = ({
  entry,
  settings,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = Boolean(entry);
  
  // Get weight unit from settings
  const weightUnit = settings?.measurementSystem === 'imperial' ? 'lbs' : 'kg';
  const timeFormat = settings?.timeFormat || '24h';

  // Helper to format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    date: formatDateForInput(entry?.date) || '',
    firstMealTime: entry?.firstMealTime || '',
    lastMealTime: entry?.lastMealTime || '',
    hoursOfSleep: entry?.hoursOfSleep || '',
    morningWeight: entry?.morningWeight || '',
    hungerLevel: entry?.hungerLevel || '',
    energyLevel: entry?.energyLevel || '',
    wellBeing: entry?.wellBeing || '',
    foodNotes: entry?.foodNotes || '',
    extendedFastConfirmed: entry?.extendedFastConfirmed || false,
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Extended fast detection state
  const [gapInfo, setGapInfo] = useState(null);
  const [showExtendedFastPrompt, setShowExtendedFastPrompt] = useState(false);
  const [checkingGap, setCheckingGap] = useState(false);

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

  // Check for extended fast when date or first meal time changes
  React.useEffect(() => {
    const checkForGap = async () => {
      if (!formData.date || !formData.firstMealTime) {
        setGapInfo(null);
        setShowExtendedFastPrompt(false);
        return;
      }

      // Don't check if we're editing and already confirmed
      if (isEditMode && entry?.extendedFastConfirmed) {
        return;
      }

      setCheckingGap(true);
      try {
        const response = await fetch(
          `/api/entries/check-previous?date=${formData.date}&firstMealTime=${formData.firstMealTime}`
        );
        const data = await response.json();

        // Show prompt only if fasting duration is more than 24 hours
        if (data.isExtendedFast && data.fastingDuration) {
          setGapInfo(data);
          // Only show prompt if user hasn't already confirmed for this session
          if (!formData.extendedFastConfirmed) {
            setShowExtendedFastPrompt(true);
          }
        } else {
          setGapInfo(null);
          setShowExtendedFastPrompt(false);
          // Clear extended fast confirmation if extended fast no longer detected
          if (formData.extendedFastConfirmed) {
            setFormData(prev => ({ ...prev, extendedFastConfirmed: false }));
          }
        }
      } catch (error) {
        console.error('Error checking for extended fast:', error);
      } finally {
        setCheckingGap(false);
      }
    };

    checkForGap();
  }, [formData.date, formData.firstMealTime, isEditMode, entry?.extendedFastConfirmed]);

  // Handle field changes
  const handleChange = (field) => (e) => {
    // Handle both event objects and direct values (for custom components)
    const value = typeof e === 'string' ? e : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when it has a value
    if (value && errors[field]) {
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

    if (field === 'date') {
      // Validate date when leaving the entire date component
      if (!formData.date) {
        newErrors.date = 'Date is required';
      } else {
        // Date is filled, clear any error
        delete newErrors.date;
      }
      setErrors(newErrors);
      return;
    }

    if (field === 'firstMealTime') {
      if (!formData.firstMealTime) {
        newErrors.firstMealTime = 'First meal time is required';
      } else {
        delete newErrors.firstMealTime;
      }
      setErrors(newErrors);
      return;
    }

    if (field === 'lastMealTime') {
      if (!formData.lastMealTime) {
        newErrors.lastMealTime = 'Last meal time is required';
      } else {
        delete newErrors.lastMealTime;
      }
      setErrors(newErrors);
      return;
    }

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

  // Handle extended fast confirmation
  const handleExtendedFastConfirm = () => {
    setFormData(prev => ({ ...prev, extendedFastConfirmed: true }));
    setShowExtendedFastPrompt(false);
  };

  const handleExtendedFastDeny = () => {
    setFormData(prev => ({ ...prev, extendedFastConfirmed: false }));
    setShowExtendedFastPrompt(false);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Check if date is in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }
    if (!formData.firstMealTime) {
      newErrors.firstMealTime = 'First meal time is required';
    }
    if (!formData.lastMealTime) {
      newErrors.lastMealTime = 'Last meal time is required';
    }

    // Validate that last meal is after first meal (same day eating)
    if (formData.firstMealTime && formData.lastMealTime) {
      const [firstHour, firstMin] = formData.firstMealTime.split(':').map(Number);
      const [lastHour, lastMin] = formData.lastMealTime.split(':').map(Number);
      
      const firstMinutes = firstHour * 60 + firstMin;
      const lastMinutes = lastHour * 60 + lastMin;
      
      if (lastMinutes <= firstMinutes) {
        newErrors.lastMealTime = 'Last meal time must be after first meal time';
      }
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

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    const validationErrors = validateForm();
    
    // Use flushSync to ensure errors are set synchronously before checking
    flushSync(() => {
      setErrors(validationErrors);
    });
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const payload = {
        date: formData.date,
        firstMealTime: formData.firstMealTime,
        lastMealTime: formData.lastMealTime,
        extendedFastConfirmed: formData.extendedFastConfirmed, // Always send this
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
        
        // If we have detailed validation errors, display them
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('; ');
          throw new Error(errorMessages);
        }
        
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
      <DateInput
        id="entry-date"
        label="Date"
        value={formData.date}
        onChange={handleChange('date')}
        onBlur={handleBlur('date')}
        error={errors.date}
        required
        max={new Date().toISOString().split('T')[0]}
      />

      {/* Extended Fast Confirmation Prompt */}
      {showExtendedFastPrompt && gapInfo && gapInfo.fastingDuration && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl" role="img" aria-label="Question">🤔</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">
                Extended Fast Detected ({gapInfo.fastingDuration.formatted})
              </h4>
              <div className="text-sm text-purple-800 mb-3 space-y-1">
                <p className="font-medium">
                  Fasting duration would be: <span className="text-purple-900 font-bold">{gapInfo.fastingDuration.formatted}</span>
                </p>
                <p className="text-xs">
                  From: {new Date(gapInfo.previousEntry.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })} at {gapInfo.previousEntry.lastMealTime} (last meal)
                </p>
                <p className="text-xs">
                  To: {new Date(formData.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })} at {formData.firstMealTime} (first meal)
                </p>
                <p className="mt-2">
                  Did you fast continuously for this entire period?
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleExtendedFastConfirm}
                >
                  Yes, confirm extended fast
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleExtendedFastDeny}
                >
                  No, I ate but didn't log
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show confirmation when extended fast is confirmed */}
      {formData.extendedFastConfirmed && gapInfo && !showExtendedFastPrompt && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Check">✅</span>
            <p className="text-sm text-green-800">
              Extended fast confirmed ({gapInfo.fastingDuration?.formatted || 'calculating...'}) - fasting duration will be calculated from{' '}
              {new Date(gapInfo.previousEntry.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}{' '}
              at {gapInfo.previousEntry.lastMealTime}
            </p>
          </div>
        </div>
      )}

      {/* Meal Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeInput
          id="first-meal-time"
          label="First Meal Time"
          value={formData.firstMealTime}
          onChange={handleChange('firstMealTime')}
          onBlur={handleBlur('firstMealTime')}
          error={errors.firstMealTime}
          format={timeFormat}
          required
        />

        <TimeInput
          id="last-meal-time"
          label="Last Meal Time"
          value={formData.lastMealTime}
          onChange={handleChange('lastMealTime')}
          onBlur={handleBlur('lastMealTime')}
          error={errors.lastMealTime}
          format={timeFormat}
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
          label={`Morning Weight (${weightUnit})`}
          type="number"
          value={formData.morningWeight}
          onChange={handleChange('morningWeight')}
          onBlur={handleBlur('morningWeight')}
          error={errors.morningWeight}
          min={0}
          step={0.1}
          placeholder={weightUnit === 'lbs' ? 'e.g., 165.5' : 'e.g., 75.5'}
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
