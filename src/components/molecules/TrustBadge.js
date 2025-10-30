import React from 'react';
import StarRating from '@/components/atoms/StarRating';

/**
 * TrustBadge Component
 * 
 * Displays trust indicators (ratings, user counts, stats) to build credibility.
 * Supports inline (horizontal compact) and card (vertical with padding) variants.
 * 
 * @param {Object} indicator - The trust indicator data
 * @param {string} indicator.type - Type: 'rating', 'user-count', 'badge', 'stat'
 * @param {string|number} indicator.value - The value to display
 * @param {string} indicator.label - Label text
 * @param {string} [indicator.icon] - Optional emoji/icon
 * @param {string} [indicator.subtext] - Optional subtext
 * @param {string} [variant='inline'] - 'inline' or 'card'
 * @param {string} [size='md'] - Size: 'sm', 'md', 'lg'
 * @param {string} [className] - Additional CSS classes
 */
const TrustBadge = ({ 
  indicator, 
  variant = 'inline', 
  size = 'md', 
  className = '' 
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-3',
  };

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  // Variant-specific classes
  const variantClasses = {
    inline: 'flex-row items-center',
    card: 'flex-col text-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm',
  };

  const baseClasses = `flex ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className={baseClasses}>
      {/* Icon */}
      {indicator.icon && (
        <span className={`${iconSizeClasses[size]}`} aria-hidden="true">
          {indicator.icon}
        </span>
      )}

      {/* Value */}
      {indicator.type === 'rating' ? (
        <StarRating 
          rating={indicator.value} 
          size={size}
          showValue={true}
          className="inline-flex"
        />
      ) : (
        <span className={`font-bold ${valueSizeClasses[size]} text-gray-900`}>
          {indicator.value}
        </span>
      )}

      {/* Label */}
      <span className={`text-gray-600 ${variant === 'card' ? 'mt-1' : ''}`}>
        {indicator.label}
      </span>

      {/* Subtext */}
      {indicator.subtext && (
        <span className={`text-gray-500 text-sm ${variant === 'card' ? 'mt-1' : ''}`}>
          {indicator.subtext}
        </span>
      )}
    </div>
  );
};

export default TrustBadge;
