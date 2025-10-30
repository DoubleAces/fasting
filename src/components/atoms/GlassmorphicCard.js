import React from 'react';

/**
 * GlassmorphicCard - Card with frosted glass (glassmorphism) effect
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md'] - Internal padding
 * @param {'sm'|'md'|'lg'} [props.blur='md'] - Backdrop blur intensity
 * @param {'low'|'medium'|'high'} [props.elevation='medium'] - Shadow depth
 * @param {Function} [props.onClick] - Optional click handler
 * @param {'div'|'article'|'section'} [props.as='div'] - HTML element type
 */
export default function GlassmorphicCard({
  children,
  className = '',
  padding = 'md',
  blur = 'md',
  elevation = 'medium',
  onClick,
  as: Component = 'div',
}) {
  const blurLevels = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  const elevations = {
    low: 'shadow-md',
    medium: 'shadow-lg',
    high: 'shadow-2xl',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = 'bg-white/60 backdrop-saturate-150 border border-white/30 rounded-2xl';
  const hoverClasses = onClick ? 'cursor-pointer hover:shadow-xl hover:bg-white/70 transition-all duration-300' : 'transition-shadow duration-300';
  const fallbackClasses = 'supports-[not(backdrop-filter)]:bg-white/95';

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${blurLevels[blur]} ${elevations[elevation]} ${paddings[padding]} ${hoverClasses} ${fallbackClasses} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
