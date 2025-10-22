/**
 * FilterBar Component
 * 
 * Provides filtering controls for the user list:
 * - Name search (debounced text input)
 * - Email search (debounced text input)
 * - Admin status filter (dropdown: All / Admin / Non-Admin)
 * - Clear all filters button
 * 
 * Features:
 * - 300ms debounce on text inputs to reduce API calls
 * - Accessible form controls with labels
 * - Responsive layout (stacks on mobile)
 * - Clear button shows when any filter is active
 * 
 * Performance:
 * - useDebounce prevents excessive re-renders and API calls
 * - Only triggers onChange after user stops typing
 */

'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * FilterBar component
 * 
 * @param {Object} props
 * @param {Function} props.onFilterChange - Callback when filters change: (filters) => void
 *   Filters object: { nameFilter: string, emailFilter: string, adminFilter: string }
 * @param {Object} props.initialFilters - Initial filter values
 * @param {string} props.initialFilters.nameFilter - Initial name filter
 * @param {string} props.initialFilters.emailFilter - Initial email filter
 * @param {string} props.initialFilters.adminFilter - Initial admin filter ('all' | 'admin' | 'non-admin')
 */
export default function FilterBar({ onFilterChange, initialFilters = {} }) {
  // ========================================================================
  // STATE
  // ========================================================================

  // Input state (immediate, not debounced)
  const [nameInput, setNameInput] = useState(initialFilters.nameFilter || '');
  const [emailInput, setEmailInput] = useState(initialFilters.emailFilter || '');
  const [adminFilter, setAdminFilter] = useState(initialFilters.adminFilter || 'all');

  // Debounced values (delayed 300ms)
  const debouncedName = useDebounce(nameInput, 300);
  const debouncedEmail = useDebounce(emailInput, 300);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Trigger callback when debounced values or admin filter changes
  useEffect(() => {
    onFilterChange({
      nameFilter: debouncedName,
      emailFilter: debouncedEmail,
      adminFilter,
    });
  }, [debouncedName, debouncedEmail, adminFilter, onFilterChange]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Clear all filters
   */
  const handleClear = () => {
    setNameInput('');
    setEmailInput('');
    setAdminFilter('all');
  };

  /**
   * Check if any filter is active
   */
  const hasActiveFilters = nameInput || emailInput || adminFilter !== 'all';

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Filter */}
        <div>
          <label
            htmlFor="filter-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="filter-name"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            aria-label="Filter users by name"
          />
        </div>

        {/* Email Filter */}
        <div>
          <label
            htmlFor="filter-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="filter-email"
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            aria-label="Filter users by email"
          />
        </div>

        {/* Admin Status Filter */}
        <div>
          <label
            htmlFor="filter-admin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admin Status
          </label>
          <select
            id="filter-admin"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            aria-label="Filter users by admin status"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="non-admin">Non-Admins Only</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {hasActiveFilters && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Active filters:</span>{' '}
          {[
            nameInput && `Name: "${nameInput}"`,
            emailInput && `Email: "${emailInput}"`,
            adminFilter !== 'all' && `Admin: ${adminFilter === 'admin' ? 'Admins Only' : 'Non-Admins Only'}`,
          ]
            .filter(Boolean)
            .join(', ')}
        </div>
      )}
    </div>
  );
}
