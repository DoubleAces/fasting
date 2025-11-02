/**
 * InsightCalloutBox Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T040 - Create InsightCalloutBox molecule component
 * 
 * Gradient-styled callout box for displaying individual insights.
 * 
 * Props:
 * - title: string (required) - Insight title
 * - description: string (required) - Insight description
 * - icon: string (optional) - Emoji or icon to display
 * - variant: 'success' | 'info' | 'warning' (optional) - Styling variant
 * - className: string (optional) - Additional CSS classes
 */

import React from 'react';

export default function InsightCalloutBox({ 
  title, 
  description, 
  icon, 
  variant = 'info',
  className = '' 
}) {
  // Variant-specific gradient styles
  const variantStyles = {
    success: 'from-green-50/80 to-emerald-50/80 border-green-200/50',
    info: 'from-purple-50/80 to-indigo-50/80 border-purple-200/50',
    warning: 'from-amber-50/80 to-orange-50/80 border-amber-200/50'
  };

  const gradientClass = variantStyles[variant] || variantStyles.info;

  return (
    <article 
      className={`
        bg-gradient-to-br ${gradientClass}
        backdrop-blur-sm rounded-xl p-5 border shadow-soft
        transition-all duration-200 hover:scale-[1.02]
        ${className}
      `.trim()}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span 
            className="text-2xl flex-shrink-0 mt-0.5" 
            role="img" 
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
