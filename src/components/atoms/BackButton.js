/**
 * BackButton Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T019 - Style secondary action button (Back) with white/gray styling
 * 
 * Secondary action button for navigation with subtle styling.
 */

'use client';

import React from 'react';
import Link from 'next/link';

/**
 * @param {Object} props
 * @param {string} props.href - Link destination
 * @param {React.ReactNode} [props.children] - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function BackButton({ 
  href, 
  children = 'Back',
  className = ''
}) {
  const buttonClasses = `
    inline-flex items-center justify-center gap-2
    px-6 py-3
    min-w-touch min-h-touch
    font-medium text-gray-700
    bg-white/90 backdrop-blur-sm
    border border-gray-300
    rounded-xl
    shadow-soft
    transition-all duration-200
    hover:bg-gray-50 hover:border-gray-400 hover:scale-105
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
    ${className}
  `.trim().replace(/\s+/g, ' ');

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
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {children}
    </Link>
  );
}
