/**
 * EditButton Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T018 - Style primary action button (Edit) with purple-pink gradient
 * 
 * Primary action button with beautiful gradient styling and hover effects.
 */

'use client';

import React from 'react';
import Link from 'next/link';

/**
 * @param {Object} props
 * @param {string} props.href - Link destination
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @returns {JSX.Element}
 */
export default function EditButton({ 
  href, 
  children = 'Edit Entry',
  className = '',
  disabled = false
}) {
  const buttonClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3
    min-w-touch min-h-touch
    font-semibold text-white
    bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600
    rounded-xl
    shadow-soft-lg
    transition-all duration-200
    hover:scale-105 hover:shadow-soft-xl
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (disabled) {
    return (
      <button
        disabled
        className={buttonClasses}
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={buttonClasses}
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      {children}
    </Link>
  );
}
