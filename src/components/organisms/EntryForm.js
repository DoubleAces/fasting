import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import FormField from '@/components/molecules/FormField';
import DateInput from '@/components/molecules/DateInput';
import TimeInput from '@/components/molecules/TimeInput';
import RatingSelector from '@/components/molecules/RatingSelector';
import Button from '@/components/atoms/Button';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * Format an ISO date string to "DD Mon" format (e.g., "22 Oct").
 * @param {string} dateString - ISO date string (e.g., "2025-10-22" or "2025-10-22T00:00:00.000Z")
 * @returns {string} Formatted date in "DD Mon" format (e.g., "22 Oct")
 */
export const formatDateToDayMonth = (dateString) => {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short' 
  });
  // toLocaleDateString returns "Oct 22", we want "22 Oct"
  const [month, day] = formatted.split(' ');
  return `${day} ${month}`;
};

/**
 * Format 24-hour time string to user's preferred format (12h or 24h).
 * @param {string} time24h - Time in "HH:mm" format (e.g., "18:00", "09:30")
 * @param {string} format - Either "12h" or "24h" (from settings.timeFormat)
 * @returns {string} Formatted time (e.g., "6:00 PM" for 12h, "18:00" for 24h)
 */
export const formatTimeByPreference = (time24h, format) => {
  const [hours, minutes] = time24h.split(':').map(Number);
  
  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // 24h format - no leading zero on single-digit hours per clarification
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

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
    extendedFastFromPreviousConfirmed: false,
    extendedFastToNextConfirmed: false,
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Extended fast detection state
  const [gapInfo, setGapInfo] = useState(null);
  const [showExtendedFastPrompt, setShowExtendedFastPrompt] = useState(false);
  const [currentPromptType, setCurrentPromptType] = useState(null); // 'from-previous' or 'to-next'

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

  // No automatic extended fast checking - we'll do it on submit

  // Handle field changes
  const handleChange = (field) => (e) => {
    // Handle both event objects and direct values (for custom components)
    const value = typeof e === 'string' ? e : e.target.value;
    
    // T028: Reset extended fast confirmation state when time fields change
    if (field === 'firstMealTime' || field === 'lastMealTime') {
      setGapInfo(null);
      setShowExtendedFastPrompt(false);
      setCurrentPromptType(null);
      setFormData(prev => ({
        ...prev,
        [field]: value,
        extendedFastFromPreviousConfirmed: false,
        extendedFastToNextConfirmed: false,
        extendedFastDenied: false,
        extendedFastToNextDenied: false,
        extendedFastConfirmed: false,
      }));
      
      // Clear error for this field when it has a value
      if (value && errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }
    
    // For all other fields, just update normally
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

  /**
   * T021/T045: Submit form data to API
   * 
   * Extracted from handleSubmit to enable reuse by confirmation handlers.
   * Called directly by:
   * - handleSubmit (for non-extended fasts or after all confirmations)
   * - handleExtendedFastConfirmAndSave (after user confirms extended fast)
   * - handleExtendedFastDenyAndSave (after user denies extended fast)
   * 
   * @async
   * @function
   * @returns {Promise<void>} Resolves when entry is saved, rejects on error
   * @fires onSuccess - Callback with saved entry data on successful save
   * @throws {Error} Sets apiError state if save fails
   */
  const submitForm = async () => {
    setIsSubmitting(true);

    try {
      // Prepare data for API
      const payload = {
        date: formData.date,
        firstMealTime: formData.firstMealTime,
        lastMealTime: formData.lastMealTime,
        extendedFastConfirmed: formData.extendedFastFromPreviousConfirmed,
        extendedFastDenied: formData.extendedFastDenied,
        extendedFastToNextDenied: formData.extendedFastToNextDenied,
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

  /**
   * Submit form data with extended fast confirmation status
   * 
   * Core submission logic extracted to eliminate duplication between confirm/deny handlers.
   * Handles API request, error handling, and success callback.
   * 
   * @async
   * @function
   * @param {Object} updatedFormData - Entry data to submit (includes all form fields)
   * @returns {Promise<void>} Resolves when entry is saved successfully
   * @throws {Error} Sets apiError state on failure (does not reject)
   */
  const submitFormWithData = async (updatedFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare data for API
      const payload = {
        date: updatedFormData.date,
        firstMealTime: updatedFormData.firstMealTime,
        lastMealTime: updatedFormData.lastMealTime,
        extendedFastConfirmed: updatedFormData.extendedFastFromPreviousConfirmed,
        extendedFastDenied: updatedFormData.extendedFastDenied,
        extendedFastToNextDenied: updatedFormData.extendedFastToNextDenied,
      };

      // Add optional fields only if they have values
      if (updatedFormData.hoursOfSleep) {
        payload.hoursOfSleep = parseFloat(updatedFormData.hoursOfSleep);
      }
      if (updatedFormData.morningWeight) {
        payload.morningWeight = parseFloat(updatedFormData.morningWeight);
      }
      if (updatedFormData.hungerLevel) {
        payload.hungerLevel = updatedFormData.hungerLevel;
      }
      if (updatedFormData.energyLevel) {
        payload.energyLevel = updatedFormData.energyLevel;
      }
      if (updatedFormData.wellBeing) {
        payload.wellBeing = updatedFormData.wellBeing;
      }
      if (updatedFormData.foodNotes) {
        payload.foodNotes = updatedFormData.foodNotes;
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

      // Success! Now we can hide the prompt
      setShowExtendedFastPrompt(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      // Keep prompt visible on error so user can try again
      setApiError(error.message || 'Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * T025/T045: Handle "Yes" confirmation for extended fast - save immediately inline
   * 
   * User confirmed they fasted continuously during the detected gap.
   * This sets the appropriate confirmation flag and either:
   * - Shows the next confirmation inline (if sequential gap exists), OR
   * - Saves the entry immediately with confirmed extended fast flag
   * 
   * Implements one-click save: user clicks "Yes, confirm extended fast" and
   * the entry saves without needing a second "Update Entry" click.
   * 
   * @async
   * @function
   * @returns {Promise<void>} Resolves when entry is saved or next confirmation shown
   * @see handleExtendedFastDenyAndSave - Handles "No" denial
   * @see submitForm - Called to save entry after all confirmations
   */
  const handleExtendedFastConfirmAndSave = async () => {
    // Set confirmation state based on current prompt type
    let updatedFormData = { ...formData };
    
    if (currentPromptType === 'from-previous') {
      // User confirmed extended fast FROM previous entry
      updatedFormData = { 
        ...updatedFormData, 
        extendedFastFromPreviousConfirmed: true,
        extendedFastDenied: false
      };
      setFormData(updatedFormData);
      
      // Check if to-next also needs confirmation (sequential gaps)
      if (gapInfo?.isExtendedFastToNext && !formData.extendedFastToNextConfirmed && !formData.extendedFastToNextDenied) {
        // T027: Show second confirmation INLINE (no setTimeout, no page refresh)
        setCurrentPromptType('to-next');
        setShowExtendedFastPrompt(true);
        return;
      }
    } else if (currentPromptType === 'to-next') {
      // User confirmed extended fast TO next entry
      updatedFormData = { 
        ...updatedFormData, 
        extendedFastToNextConfirmed: true,
        extendedFastToNextDenied: false
      };
      setFormData(updatedFormData);
    }

    // All confirmations done - submit immediately with updated data
    // Note: Don't hide prompt yet - wait until save succeeds
    
    // T025: Call extracted submission function (inline, no second button click needed)
    await submitFormWithData(updatedFormData);
  };

  /**
   * T026/T045: Handle "No" denial for extended fast - save immediately inline
   * 
   * User indicated they DID eat during the detected gap (but didn't log it).
   * This sets the appropriate denial flag and either:
   * - Shows the next confirmation inline (if sequential gap exists), OR
   * - Saves the entry immediately with denied extended fast flag
   * 
   * Implements one-click save: user clicks "No, I ate but didn't log" and
   * the entry saves without needing a second "Update Entry" click.
   * 
   * @async
   * @function
   * @returns {Promise<void>} Resolves when entry is saved or next confirmation shown
   * @see handleExtendedFastConfirmAndSave - Handles "Yes" confirmation
   * @see submitForm - Called to save entry after all confirmations/denials
   */
  const handleExtendedFastDenyAndSave = async () => {
    // Set denial state based on current prompt type
    let updatedFormData = { ...formData };
    
    if (currentPromptType === 'from-previous') {
      // User denied extended fast FROM previous entry (they ate but didn't log)
      updatedFormData = { 
        ...updatedFormData, 
        extendedFastDenied: true,
        extendedFastFromPreviousConfirmed: false
      };
      setFormData(updatedFormData);
      
      // Check if to-next also needs confirmation (sequential gaps)
      if (gapInfo?.isExtendedFastToNext && !formData.extendedFastToNextConfirmed && !formData.extendedFastToNextDenied) {
        // T027: Show second confirmation INLINE (no setTimeout, no page refresh)
        setCurrentPromptType('to-next');
        setShowExtendedFastPrompt(true);
        return;
      }
    } else if (currentPromptType === 'to-next') {
      // User denied extended fast TO next entry (they ate but didn't log)
      updatedFormData = { 
        ...updatedFormData, 
        extendedFastToNextDenied: true,
        extendedFastToNextConfirmed: false
      };
      setFormData(updatedFormData);
    }

    // All confirmations done - submit immediately with updated data
    // Note: Don't hide prompt yet - wait until save succeeds
    
    // Call extracted submission function with updated data
    await submitFormWithData(updatedFormData);
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

    // Check for extended fasts ONLY if we haven't checked yet
    if (!gapInfo && formData.date && formData.firstMealTime && formData.lastMealTime) {
      setIsSubmitting(true);
      try {
        const params = new URLSearchParams({
          date: formData.date,
          firstMealTime: formData.firstMealTime,
          lastMealTime: formData.lastMealTime
        });
        
        const response = await fetch(`/api/entries/check-previous?${params.toString()}`);
        const data = await response.json();
        
        setGapInfo(data);
        
        // T024: If extended fast detected FROM PREVIOUS, show inline confirmation (don't submit yet)
        // Note: We only prompt for FROM-PREVIOUS extended fasts because:
        // 1. Entry model only has extendedFastConfirmed field (no to-next storage)
        // 2. Prompting about future entries on first entry is confusing UX
        // 3. Data model spec only includes backward-looking extended fast tracking
        if (data.isExtendedFastFromPrevious) {
          setCurrentPromptType('from-previous');
          setShowExtendedFastPrompt(true);
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('❌ Error checking for extended fast:', error);
        setIsSubmitting(false);
        return;
      }
    }

    // T022: If no extended fast (or already confirmed), submit immediately
    await submitForm();
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

      {/* T023: Extended Fast Confirmation Prompt REMOVED - now shown inline at bottom */}

      {/* Show confirmation when extended fast from previous is confirmed */}
      {formData.extendedFastFromPreviousConfirmed && gapInfo?.fromPreviousFasting && !showExtendedFastPrompt && gapInfo.previousEntry && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="Check">✅</span>
            <p className="text-sm text-green-800">
              Extended fast confirmed ({gapInfo.fromPreviousFasting.formatted}) - fasting duration will be calculated from{' '}
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
      {/* T029: aria-live announces button changes to screen readers */}
      <div 
        className="flex flex-col gap-3 pt-4 border-t border-gray-200"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* T024/T046: Conditional rendering - show EITHER confirmation buttons OR submit button, never both
            
            This implements the inline confirmation UX:
            1. Normal state: User sees "Update Entry" button
            2. After form submit with extended fast detected: "Update Entry" button is REPLACED
               by confirmation buttons ("Yes, confirm extended fast" / "No, I ate but didn't log")
            3. After confirmation click: Entry saves immediately (one-click save)
            
            Key insight: By replacing the button rather than adding new buttons, we avoid
            the confusing "Update Entry" + confirmation buttons showing simultaneously.
        */}
        {showExtendedFastPrompt && gapInfo && currentPromptType ? (
          // Extended fast detected: Show question text and all buttons below
          <>
            {/* Extended Fast Question Text */}
            <div className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-lg flex-shrink-0" role="img" aria-label="Question">🤔</span>
              <span className="font-medium">
                {currentPromptType === 'from-previous' && gapInfo.fromPreviousFasting && (
                  <>
                    Extended fast detected ({gapInfo.fromPreviousFasting.formatted}):<br />
                    {formatDateToDayMonth(gapInfo.previousEntry.date)} at {formatTimeByPreference(gapInfo.previousEntry.lastMealTime, timeFormat)} → {formatDateToDayMonth(formData.date)} at {formatTimeByPreference(formData.firstMealTime, timeFormat)}. Did you fast continuously?
                  </>
                )}
                {currentPromptType === 'to-next' && gapInfo.toNextFasting && gapInfo.nextEntry && (
                  <>
                    Extended fast detected ({gapInfo.toNextFasting.formatted}):<br />
                    {formatDateToDayMonth(formData.date)} at {formatTimeByPreference(formData.lastMealTime, timeFormat)} → {formatDateToDayMonth(gapInfo.nextEntry.date)} at {formatTimeByPreference(gapInfo.nextEntry.firstMealTime, timeFormat)}. Did you fast continuously?
                  </>
                )}
              </span>
            </div>
            
            {/* All buttons in one row: Cancel + Confirmation Buttons - T029: aria-live, T030: mobile responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
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
                type="button"
                variant="primary"
                size="sm"
                onClick={handleExtendedFastConfirmAndSave}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Yes, confirm extended fast'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExtendedFastDenyAndSave}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : "No, I ate but didn't log"}
              </Button>
            </div>
          </>
        ) : (
          // Normal submit button (when no extended fast confirmation needed)
          <div className="flex gap-4 justify-end">
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
        )}
      </div>
    </form>
  );
};

export default EntryForm;
