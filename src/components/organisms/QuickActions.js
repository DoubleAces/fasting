'use client';

import React from 'react';
import GradientButton from '@/components/atoms/GradientButton';

/**
 * QuickActions Component
 * 
 * Displays three quick action buttons for efficient navigation:
 * - Create Entry: Opens /entries with form modal
 * - View All Entries: Navigates to /entries
 * - Settings: Navigates to /settings
 * 
 * Responsive: vertical stack on mobile, horizontal on desktop.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const QuickActions = ({ className = '' }) => {
  const actions = [
    {
      id: 'create-entry',
      label: 'Create Entry',
      href: '/entries?openForm=true',
      icon: '➕',
      description: 'Log a new fast',
    },
    {
      id: 'view-all',
      label: 'View All Entries',
      href: '/entries',
      icon: '📋',
      description: 'See your history',
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: '⚙️',
      description: 'Manage preferences',
    },
  ];

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent pb-2">
          Quick Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <GradientButton
            key={action.id}
            href={action.href}
            className="min-h-touch w-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
            aria-label={`${action.label}: ${action.description}`}
          >
            <div className="flex flex-col items-center justify-center py-6">
              <span className="text-3xl mb-2 block" aria-hidden="true">{action.icon}</span>
              <span className="text-lg font-semibold block">{action.label}</span>
              <span className="text-sm opacity-90 mt-1 block">{action.description}</span>
            </div>
          </GradientButton>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
