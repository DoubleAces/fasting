import React from 'react';
import Image from 'next/image';
import StarRating from '@/components/atoms/StarRating';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

/**
 * TestimonialCard Component
 * 
 * Displays a single user testimonial with avatar, quote, name, rating, and result.
 * 
 * @param {Object} testimonial - The testimonial data
 * @param {string} testimonial.name - User's full name
 * @param {string} [testimonial.avatar] - Optional avatar image path
 * @param {string} testimonial.result - Specific achievement (e.g., "Lost 15 lbs")
 * @param {string} testimonial.quote - User's testimonial text
 * @param {number} testimonial.rating - Star rating (1-5)
 * @param {string} [testimonial.date] - Optional date of testimonial
 * @param {string} [variant='default'] - Layout variant ('default' or 'compact')
 * @param {boolean} [showDate=true] - Whether to show the date
 * @param {string} [className] - Additional CSS classes
 */
const TestimonialCard = ({ 
  testimonial, 
  variant = 'default', 
  showDate = true, 
  className = '' 
}) => {
  const { name, avatar, result, quote, rating, date } = testimonial;

  // Extract initials from name for fallback avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(name);
  
  // Variant-specific padding
  const padding = variant === 'compact' ? 'p-4' : 'p-6';

  return (
    <GlassmorphicCard
      className={`${padding} flex flex-col gap-4 hover:shadow-lg transition-all duration-300 ${className}`}
      elevation="medium"
    >
      {/* Avatar and Rating */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name}'s avatar`}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
              {initials}
            </div>
          )}
        </div>

        {/* Name and Rating */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <StarRating rating={rating} size="sm" />
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 leading-relaxed italic">
        "{quote}"
      </blockquote>

      {/* Result Badge */}
      <div className="inline-flex items-center self-start">
        <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          {result}
        </span>
      </div>

      {/* Date */}
      {showDate && date && (
        <p className="text-xs text-gray-500 mt-auto">{date}</p>
      )}
    </GlassmorphicCard>
  );
};

export default TestimonialCard;
