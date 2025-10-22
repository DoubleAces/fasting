/**
 * AdminToggle Component
 * 
 * Toggle button for granting/revoking admin privileges.
 * Displays current admin status and handles toggle with confirmation.
 * 
 * Features:
 * - Visual state: "Grant Admin" (gray) vs "Revoke Admin" (red)
 * - Loading state during API call (disabled with spinner)
 * - Disabled state for current user (self-protection)
 * - Toast notifications for success/error
 * - Optimistic UI update (immediate visual feedback)
 * 
 * Props:
 * - userId: Target user ID
 * - userName: Target user name (for display)
 * - isAdmin: Current admin status
 * - isCurrentUser: Whether this is the logged-in user
 * - onToggleSuccess: Callback after successful toggle (refresh data)
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

/**
 * AdminToggle component
 * 
 * @param {Object} props
 * @param {string} props.userId - Target user ID
 * @param {string} props.userName - Target user name
 * @param {boolean} props.isAdmin - Current admin status
 * @param {boolean} props.isCurrentUser - Whether this is the logged-in user
 * @param {Function} props.onToggleSuccess - Callback after successful toggle
 */
export default function AdminToggle({
  userId,
  userName,
  isAdmin,
  isCurrentUser,
  onToggleSuccess,
}) {
  // ========================================================================
  // STATE
  // ========================================================================

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle toggle admin status
   */
  const handleToggle = async () => {
    // Confirm action
    const action = isAdmin ? 'revoke admin privileges from' : 'grant admin privileges to';
    const confirmMessage = `Are you sure you want to ${action} ${userName}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('/api/admin/users/toggle-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      // Handle response
      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle admin status');
      }

      // Show success toast
      showSuccess(result.message || 'Admin status updated successfully');

      // Trigger callback to refresh data
      if (onToggleSuccess) {
        onToggleSuccess();
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      showError(error.message || 'Failed to toggle admin status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  // Current user cannot modify their own status
  if (isCurrentUser) {
    return (
      <button
        disabled
        className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded cursor-not-allowed"
        title="You cannot modify your own admin status"
      >
        {isAdmin ? 'Admin' : 'User'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
        isAdmin
          ? 'text-red-700 bg-red-50 hover:bg-red-100 disabled:bg-red-50'
          : 'text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isAdmin ? 'Revoke admin privileges' : 'Grant admin privileges'}
      aria-label={`${isAdmin ? 'Revoke admin from' : 'Grant admin to'} ${userName}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <svg
            className="animate-spin h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span>{isAdmin ? 'Revoke Admin' : 'Grant Admin'}</span>
      )}
    </button>
  );
}
