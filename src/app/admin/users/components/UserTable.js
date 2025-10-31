/**
 * UserTable Component
 * 
 * Displays users in a sortable table with the following columns:
 * - Name (sortable)
 * - Email (sortable)
 * - Registration Date (sortable)
 * - Last Login (sortable)
 * - Admin Status (sortable)
 * - Actions (not sortable)
 * 
 * Features:
 * - Sortable column headers (click to toggle asc/desc)
 * - Visual sort indicators (↑ ↓ arrows)
 * - Empty state when no users found
 * - Loading state during data fetch
 * - Responsive table (horizontal scroll on mobile)
 * - Uses UserRow component for each row
 * 
 * Accessibility:
 * - Semantic table structure
 * - ARIA sort attributes on headers
 * - Keyboard navigable sort buttons
 */

'use client';

import UserRow from './UserRow';

/**
 * UserTable component
 * 
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {string} props.currentUserId - ID of the logged-in user (for highlighting)
 * @param {string} props.sortBy - Current sort field
 * @param {string} props.sortOrder - Current sort order ('asc' | 'desc')
 * @param {Function} props.onSortChange - Callback when sort changes: (field) => void
 * @param {Function} props.onRefresh - Callback to refresh user list
 * @param {boolean} props.isLoading - Whether data is loading
 */
export default function UserTable({
  users,
  currentUserId,
  sortBy,
  sortOrder,
  onSortChange,
  onRefresh,
  isLoading = false,
}) {
  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle column header click (toggle sort)
   */
  const handleSort = (field) => {
    onSortChange(field);
  };

  /**
   * Get sort indicator for a column
   */
  const getSortIndicator = (field) => {
    if (sortBy !== field) {
      // Not currently sorted by this field
      return (
        <span className="text-gray-400 ml-1" aria-hidden="true">
          ⇅
        </span>
      );
    }

    // Currently sorted by this field
    return (
      <span className="text-blue-600 ml-1" aria-hidden="true">
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  /**
   * Get ARIA sort attribute for column header
   */
  const getAriaSortAttribute = (field) => {
    if (sortBy !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!users || users.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your filters to see more results.
          </p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER TABLE
  // ========================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {/* Name Column Header */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
                aria-sort={getAriaSortAttribute('name')}
              >
                <div className="flex items-center">
                  <span>Name</span>
                  {getSortIndicator('name')}
                </div>
              </th>

              {/* Email Column Header */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('email')}
                aria-sort={getAriaSortAttribute('email')}
              >
                <div className="flex items-center">
                  <span>Email</span>
                  {getSortIndicator('email')}
                </div>
              </th>

              {/* Registration Date Column Header */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('registrationDate')}
                aria-sort={getAriaSortAttribute('registrationDate')}
              >
                <div className="flex items-center">
                  <span>Registered</span>
                  {getSortIndicator('registrationDate')}
                </div>
              </th>

              {/* Last Login Column Header */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('lastLogin')}
                aria-sort={getAriaSortAttribute('lastLogin')}
              >
                <div className="flex items-center">
                  <span>Last Login</span>
                  {getSortIndicator('lastLogin')}
                </div>
              </th>

              {/* Admin Status Column Header */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('isAdmin')}
                aria-sort={getAriaSortAttribute('isAdmin')}
              >
                <div className="flex items-center">
                  <span>Admin Status</span>
                  {getSortIndicator('isAdmin')}
                </div>
              </th>

              {/* Actions Column Header (not sortable) */}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                isCurrentUser={user._id === currentUserId}
                onRefresh={onRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Count */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{users.length}</span> user
          {users.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
