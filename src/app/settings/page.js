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

      // API returns settings directly, not wrapped in data.settings
      setSettings(data);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle form success
  const handleFormSuccess = async (savedSettings) => {
    // Toast notification is shown by SettingsForm (T022)
    // Refresh settings
    await fetchSettings();
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

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <SettingsForm
            settings={settings}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>
    </main>
  );
}
