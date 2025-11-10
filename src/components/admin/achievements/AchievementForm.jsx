'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import ContentStep from './ContentStep';
import CriteriaStep from './CriteriaStep';
import MetadataStep from './MetadataStep';
import SettingsStep from './SettingsStep';

/**
 * AchievementForm Component
 * 
 * Multi-step form container for creating/editing achievements
 * Steps: 1. Content, 2. Criteria, 3. Metadata, 4. Settings
 * 
 * @param {Object} props - Component props
 * @param {Object} [props.initialData] - Initial form data for edit mode
 * @param {string} [props.mode='create'] - Form mode ('create' or 'edit')
 * @returns {JSX.Element} Multi-step achievement form
 */
export default function AchievementForm({ initialData = null, mode = 'create' }) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const methods = useForm({
    defaultValues: initialData || {
      // Content step  
      name: '',
      description: '',
      iconUrl: '',
      // Criteria step
      criteria: {
        type: 'duration-milestone',
        value: 1
      },
      // Metadata step
      category: 'getting-started',
      tier: 'bronze',
      rarity: { score: 10 },
      order: 999,
      // Settings step
      isActive: true,
      isSecret: false,
      type: 'automatic'
    },
    mode: 'onChange'
  });

  const steps = [
    { number: 1, name: 'Content', description: 'Name and description' },
    { number: 2, name: 'Criteria', description: 'Unlock requirements' },
    { number: 3, name: 'Metadata', description: 'Category, tier, and points' },
    { number: 4, name: 'Settings', description: 'Activation and visibility' }
  ];

  const handleNext = async () => {
    // Validate current step
    const isValid = await methods.trigger();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate achievementId from name
      const achievementId = data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const payload = {
        ...data,
        achievementId,
        // Wrap in translations object for backend compatibility
        translations: {
          en: {
            name: data.name,
            description: data.description,
            iconUrl: data.iconUrl
          }
        },
        // Format criteria properly for backend
        criteria: {
          type: data.criteria.type,
          params: data.criteria.type === 'custom' 
            ? { requirement: data.criteria.requirement }
            : { value: data.criteria.value, description: data.criteria.description || '' }
        }
      };

      // Remove the flat fields since they're now in translations
      delete payload.name;
      delete payload.description;
      delete payload.iconUrl;

      const url = mode === 'edit'
        ? `/api/admin/achievements/${initialData.achievementId}`
        : '/api/admin/achievements';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle duplicate achievementId error specifically
        if (response.status === 409 || errorData.message?.includes('already exists')) {
          throw new Error(
            `An achievement with the ID "${achievementId}" already exists. ` +
            `Please modify the achievement name to generate a unique ID.`
          );
        }
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(`Validation failed: ${errorData.errors.join(', ')}`);
        }
        
        throw new Error(errorData.message || 'Failed to save achievement');
      }

      // Success - show notification and redirect
      success(`Achievement ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      
      // Small delay to show toast before redirect
      setTimeout(() => {
        router.push('/admin/achievements');
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err.message);
      showError(err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} achievement`);
      setIsSubmitting(false);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Steps */}
        <nav aria-label="Progress" className="bg-white p-6 rounded-lg border border-gray-200">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li
                key={step.name}
                className="relative flex-1"
              >
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className="group w-full focus:outline-none"
                >
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                        currentStep > step.number
                          ? 'bg-purple-600 border-purple-600'
                          : currentStep === step.number
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-white border-gray-300 group-hover:border-purple-400'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            currentStep === step.number
                              ? 'text-white'
                              : 'text-gray-500 group-hover:text-purple-600'
                          }`}
                        >
                          {step.number}
                        </span>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === step.number
                            ? 'text-purple-600'
                            : 'text-gray-500 group-hover:text-purple-600'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                </button>

                {/* Connector Line */}
                {stepIdx < steps.length - 1 && (
                  <div
                    className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2"
                    style={{ marginLeft: '20px', width: 'calc(100% - 40px)' }}
                  >
                    <div
                      className={`h-full transition-colors ${
                        currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error saving achievement</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                {error.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setError(null);
                    }}
                    className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
                  >
                    ← Go back to Content step to modify name
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 inline-flex text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {currentStep === 1 && <ContentStep />}
          {currentStep === 2 && <CriteriaStep />}
          {currentStep === 3 && <MetadataStep />}
          {currentStep === 4 && <SettingsStep />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Achievement'}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
