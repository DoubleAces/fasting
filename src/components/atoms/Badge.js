/**
 * Badge Component
 * 
 * Displays a colored badge with optional icon and text.
 * Used for highlighting special achievements like "Best Day" or "Longest Fast".
 */

import React from 'react';

const Badge = ({ variant = 'default', icon, children }) => {
  // Don't render if no content
  if (!children) return null;

  // Variant styles
  const variantStyles = {
    'best-day': 'bg-green-100 text-green-800 border-green-200',
    'longest-fast': 'bg-blue-100 text-blue-800 border-blue-200',
    'default': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
