'use client';

import React from 'react';
import Link from 'next/link';

/**
 * GradientButton - Primary CTA button with gradient background and hover effects
 * Can be used as a button or link (when href is provided)
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button text or content
 * @param {Function} [props.onClick] - Click handler (button mode)
 * @param {string} [props.href] - URL to navigate to (link mode)
 * @param {'primary'|'secondary'} [props.variant='primary'] - Visual style
 * @param {'sm'|'md'|'lg'|'large'} [props.size='md'] - Size variant
 * @param {boolean} [props.fullWidth=false] - Take full width of container
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {'button'|'submit'|'reset'} [props.type='button'] - HTML button type
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {string} [props.ariaLabel] - Accessibility label if children is icon-only
 */
export default function GradientButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel,
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-transparent border-2 border-purple-600 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    large: 'px-8 py-4 text-lg', // Alias for 'lg'
  };

  const baseClasses = 'inline-block text-center rounded-xl font-semibold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105';
  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${widthClass} ${className}`.trim();

  // If href is provided, render as Link
  if (href) {
    // Check if it's an external link
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className={combinedClassName}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={combinedClassName}
      >
        {children}
      </Link>
    );
  }

  // Otherwise, render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}
