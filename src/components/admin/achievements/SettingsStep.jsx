'use client';

import { useFormContext } from 'react-hook-form';

/**
 * SettingsStep Component
 * 
 * Fourth step of achievement form - handles activation status and visibility
 * 
 * @returns {JSX.Element} Settings step form fields
 */
export default function SettingsStep() {
  const { register, watch } = useFormContext();

  const isActive = watch('isActive');
  const isSecret = watch('isSecret');
  const achievementType = watch('type');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Achievement Settings</h2>
        <p className="mt-2 text-sm text-gray-600">
          Configure activation status and visibility options
        </p>
      </div>

      {/* Activation Status */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-5 transition-all hover:border-purple-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="isActive" className="block text-sm font-semibold text-gray-900">
              Active Status
            </label>
            <p className="text-sm text-gray-600 mt-2">
              {isActive ? (
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  Achievement is visible and can be unlocked by users
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                  Achievement is hidden from users and cannot be unlocked
                </span>
              )}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => {
                const checkbox = document.getElementById('isActive');
                checkbox.click();
              }}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isActive ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="sr-only"
            />
          </div>
        </div>
      </div>

      {/* Secret Achievement */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-5 transition-all hover:border-purple-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="isSecret" className="block text-sm font-semibold text-gray-900">
              Secret Achievement 🔒
            </label>
            <p className="text-sm text-gray-600 mt-2">
              {isSecret ? (
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Secret
                  </span>
                  Achievement details are hidden until unlocked
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Visible
                  </span>
                  Achievement is visible to all users
                </span>
              )}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={isSecret}
              onClick={() => {
                const checkbox = document.getElementById('isSecret');
                checkbox.click();
              }}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isSecret ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isSecret ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <input
              id="isSecret"
              type="checkbox"
              {...register('isSecret')}
              className="sr-only"
            />
          </div>
        </div>
      </div>

      {/* Achievement Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Achievement Type
          <span className="ml-1 text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          <label className={`
            relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
            ${achievementType === 'automatic'
              ? 'border-purple-500 bg-purple-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
            }
          `}>
            <input
              type="radio"
              value="automatic"
              {...register('type')}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <span className="block text-sm font-semibold text-gray-900">Automatic</span>
              </div>
              <span className="block text-sm text-gray-600 mt-1">
                Unlocked automatically when criteria are met (recommended for most achievements)
              </span>
            </div>
            {achievementType === 'automatic' && (
              <div className="absolute top-4 right-4">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>

          <label className={`
            relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
            ${achievementType === 'manual'
              ? 'border-purple-500 bg-purple-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
            }
          `}>
            <input
              type="radio"
              value="manual"
              {...register('type')}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="block text-sm font-semibold text-gray-900">Manual</span>
              </div>
              <span className="block text-sm text-gray-600 mt-1">
                Requires manual admin approval or special event participation (use for promotional events)
              </span>
            </div>
            {achievementType === 'manual' && (
              <div className="absolute top-4 right-4">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-900 mb-3">Settings Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-purple-900">Status:</span>
                {isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    ✗ Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-purple-900">Visibility:</span>
                {isSecret ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    🔒 Secret
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    👁️ Visible
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-purple-900">Unlock Type:</span>
                {achievementType === 'automatic' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ⚙️ Automatic
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    👤 Manual
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
