import React from 'react';
import Image from 'next/image';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';

/**
 * FeatureCard Component
 * 
 * Displays a single app feature with icon, title, description, benefit, and optional screenshot.
 * Used in the Features Showcase section.
 * 
 * @param {Object} feature - The feature data
 * @param {string} feature.title - Feature name
 * @param {string} feature.description - Specific benefit explanation
 * @param {string} feature.icon - Icon emoji
 * @param {string} [feature.screenshot] - Optional screenshot path
 * @param {string} feature.benefit - Measurable benefit
 * @param {boolean} [showScreenshot=true] - Show screenshot if available
 * @param {boolean} [interactive=true] - Enable hover effects
 * @param {string} [className] - Additional CSS classes
 */
const FeatureCard = ({ 
  feature, 
  showScreenshot = true, 
  interactive = true,
  className = '' 
}) => {
  const { title, description, icon, screenshot, benefit } = feature;

  const hoverClasses = interactive 
    ? 'hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer' 
    : '';

  return (
    <GlassmorphicCard
      className={`p-6 flex flex-col gap-4 ${hoverClasses} ${className}`}
      elevation="medium"
    >
      {/* Screenshot */}
      {showScreenshot && screenshot && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400">
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-5xl mb-2">{icon}</div>
            <div className="text-sm font-semibold opacity-90">Feature Preview</div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm" />
          <div className="absolute bottom-4 left-4 w-20 h-20 rounded-lg bg-white/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Icon */}
      <div 
        className="text-4xl" 
        aria-hidden="true"
        role="img"
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed flex-grow">
        {description}
      </p>

      {/* Benefit */}
      <div className="flex items-center gap-2">
        <span className="text-purple-600 font-semibold text-sm">
          ✓ {benefit}
        </span>
      </div>
    </GlassmorphicCard>
  );
};

export default FeatureCard;
