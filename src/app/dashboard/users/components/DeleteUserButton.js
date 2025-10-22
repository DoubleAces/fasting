/**
 * DeleteUserButton Component
 * 
 * Delete button for user management table with confirmation dialog.
 * Handles user deletion with cascade (all related data) via API.
 * 
 * Features:
 * - Trash icon button (red, danger variant)
 * - Disabled for current user (self-deletion protection)
 * - Confirmation dialog with user name
 * - Loading state during deletion
 * - Toast notifications (success/error)
 * - Error retry capability
 * - Calls onDeleteSuccess callback after successful deletion
 * 
 * Self-Protection:
 * - Disabled when isCurrentUser is true
 * - Shows gray badge instead of button
 * - Server also blocks self-deletion (403)
 * 
 * Accessibility:
 * - aria-label for screen readers
 * - Disabled state clearly indicated
 * - Focus management via dialog
 * 
 * Usage:
 * ```jsx
 * <DeleteUserButton
 *   userId="user-id"
 *   userName="John Doe"
 *   isCurrentUser={false}
 *   onDeleteSuccess={handleRefresh}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from './ConfirmDialog';

/**
 * DeleteUserButton component
 * 
 * @param {Object} props
 * @param {string} props.userId - ID of user to delete
 * @param {string} props.userName - Display name of user (for confirmation)
 * @param {boolean} props.isCurrentUser - Whether this is the logged-in user
 * @param {Function} props.onDeleteSuccess - Callback after successful deletion
 */
export default function DeleteUserButton({
  userId,
  userName,
  isCurrentUser,
  onDeleteSuccess,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Success!
      const totalDeleted =
        Object.values(result.deletedCounts).reduce((sum, count) => sum + count, 0) + 1; // +1 for user

      showSuccess(
        `User deleted successfully. Removed ${totalDeleted} records (user + ${totalDeleted - 1} related).`
      );

      // Close dialog
      setShowConfirm(false);

      // Trigger parent refresh
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      showError(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setShowConfirm(false);
  };

  // If this is the current user, show disabled badge
  if (isCurrentUser) {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
        title="You cannot delete your own account"
      >
        Cannot Delete Self
      </span>
    );
  }

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        aria-label={`Delete user ${userName}`}
      >
        <svg
          className="h-4 w-4 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete
      </button>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${userName || 'this user'}?\n\nThis will permanently delete:\n• User account\n• All fasting entries\n• User settings\n• All tokens\n\nThis action cannot be undone.`}
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleDelete}
        onCancel={handleCancel}
      />
    </>
  );
}
