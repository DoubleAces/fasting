/**
 * DeleteButton Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T020 - Style destructive action button (Delete) with white/red styling
 * 
 * Destructive action button with clear visual indication.
 */

'use client';

import React from 'react';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @returns {JSX.Element}
 */
export default function DeleteButton({ 
  onClick, 
  children = 'Delete Entry',
  className = '',
  disabled = false
}) {
  const buttonClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3
    min-w-touch min-h-touch
    font-semibold text-red-600
    bg-white/90 backdrop-blur-sm
    border-2 border-red-300
    rounded-xl
    shadow-soft
    transition-all duration-200
    hover:bg-red-50 hover:border-red-500 hover:text-red-700 hover:scale-105
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      type="button"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      {children}
    </button>
  );
}
