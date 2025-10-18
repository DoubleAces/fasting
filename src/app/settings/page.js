'use client';

import { useState, useEffect } from 'react';
import SettingsForm from '@/components/organisms/SettingsForm';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * SettingsPage - User Preferences
 * 
 * Allows users to configure their preferences:
 * - Weight unit (kg/lbs)
 * - Time format (12h/24h)
 * - Fasting goal (hours)
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch user settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load settings');
      }

      setSettings(data.settings);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle form success
  const handleFormSuccess = async (savedSettings) => {
    setSuccessMessage('Settings saved successfully!');
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    // Refresh settings
    await fetchSettings();
  };

  // Clear success message when form changes
  const handleFormChange = () => {
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
          </div>
          <ErrorMessage id="settings-page-error" showIcon>
            {error}
          </ErrorMessage>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Configure your preferences and fasting goals
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-800 font-medium">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div onChange={handleFormChange}>
            <SettingsForm
              settings={settings}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
