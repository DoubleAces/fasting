import React from 'react';

/**
 * StarRating - Display star rating (1-5 stars) with optional half-star support
 * 
 * @param {Object} props
 * @param {number} props.rating - Rating value (0-5, supports decimals)
 * @param {number} [props.maxRating=5] - Maximum rating
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Star size
 * @param {boolean} [props.showValue=false] - Show numeric value next to stars
 * @param {string} [props.color='text-yellow-400'] - Star color
 * @param {string} [props.emptyColor='text-gray-300'] - Empty star color
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {string} [props.ariaLabel] - Accessibility label
 */
export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  color = 'text-yellow-400',
  emptyColor = 'text-gray-300',
  className = '',
  ariaLabel,
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - Math.ceil(rating);

  const defaultAriaLabel = ariaLabel || `${rating} out of ${maxRating} stars`;

  return (
    <div className={`flex items-center gap-1 ${className}`.trim()} role="img" aria-label={defaultAriaLabel}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <svg
          key={`full-${index}`}
          className={`star star-filled ${sizes[size]} ${color}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <svg
          className={`star star-half ${sizes[size]} ${color}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="half-gradient">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-gradient)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <svg
          key={`empty-${index}`}
          className={`star star-empty ${sizes[size]} ${emptyColor}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}

      {/* Numeric value */}
      {showValue && <span className="ml-1 text-sm font-medium">{rating}</span>}
    </div>
  );
}
