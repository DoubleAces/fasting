'use client';

import Link from 'next/link';

/**
 * TermsCheckbox Molecule Component
 * 
 * Checkbox for accepting Terms and Conditions and Privacy Policy with links to full pages.
 * Required for user registration.
 * 
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {function} onChange - Callback when checkbox state changes
 * @param {string|null} error - Error message to display
 */
export default function TermsCheckbox({ checked, onChange, error }) {
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <label
        className={`flex items-start gap-3 cursor-pointer ${
          hasError
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        <input
          type="checkbox"
          required
          checked={checked}
          onChange={onChange}
          className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900 ${
            hasError
              ? 'border-red-500 dark:border-red-400'
              : ''
          }`}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'terms-error' : undefined}
        />
        <span className="text-sm leading-5">
          I have read and agree to the{' '}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Terms and Conditions
          </Link>
          {' '}and{' '}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Privacy Policy
          </Link>
        </span>
      </label>

      {hasError && (
        <p
          id="terms-error"
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
