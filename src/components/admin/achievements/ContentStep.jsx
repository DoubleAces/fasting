'use client';

import { useFormContext } from 'react-hook-form';

/**
 * ContentStep Component
 * 
 * First step of achievement form - handles name, description, and icon
 * 
 * @returns {JSX.Element} Content step form fields
 */
export default function ContentStep() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Achievement Content</h2>
        <p className="mt-2 text-sm text-gray-600">
          Provide the achievement name, description, and icon. All fields are required.
        </p>
      </div>

      {/* Achievement Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
          Achievement Name
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: 'Achievement name is required',
            maxLength: { value: 100, message: 'Name must be 100 characters or less' }
          })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
          placeholder="e.g., First Fast Completed"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          A short, memorable name for the achievement
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
          Description
          <span className="ml-1 text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description', {
            required: 'Description is required',
            maxLength: { value: 500, message: 'Description must be 500 characters or less' }
          })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm resize-none"
          placeholder="e.g., Complete your first fasting session and begin your journey to better health"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.description.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Explain what the user needs to do to earn this achievement
        </p>
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <label htmlFor="iconUrl" className="block text-sm font-semibold text-gray-900">
          Icon Emoji or URL
          <span className="ml-1 text-red-500">*</span>
        </label>
        <input
          id="iconUrl"
          type="text"
          {...register('iconUrl', {
            required: 'Icon is required',
            maxLength: { value: 200, message: 'Icon URL must be 200 characters or less' }
          })}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 sm:text-sm"
          placeholder="🎯 or https://example.com/icon.png"
        />
        {errors.iconUrl && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.iconUrl.message}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Use an emoji (e.g., 🎯, 🏆, ⭐) or a URL to an image file
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-900">Multi-language support</h3>
            <p className="mt-1 text-sm text-purple-700">
              Translation management will be available in a future update. For now, create achievements in English.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
