/**
 * GradientText Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T017 - Gradient text component for duration display
 * 
 * Displays text with a beautiful purple-pink-indigo gradient.
 * Used for emphasizing important values like fasting duration.
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Text content to display
 * @param {string} [props.className] - Additional CSS classes
 * @param {('sm'|'base'|'lg'|'xl'|'2xl'|'3xl'|'4xl')} [props.size='2xl'] - Text size
 * @returns {JSX.Element}
 */
export default function GradientText({ 
  children, 
  className = '',
  size = '2xl'
}) {
  const sizeClasses = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  return (
    <span 
      className={`
        font-bold
        bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 
        bg-clip-text text-transparent
        ${sizeClasses[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
}
