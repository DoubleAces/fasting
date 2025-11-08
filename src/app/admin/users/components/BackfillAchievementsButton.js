/**
 * BackfillAchievementsButton Component
 * 
 * Admin button to retroactively evaluate all user entries and unlock
 * qualifying achievements. Displays aggregate statistics in toast.
 * 
 * Features:
 * - Blue button with icon
 * - Loading state with spinner and "Processing..." text
 * - Success toast with statistics summary
 * - Conditional messaging for zero achievements
 * - Error handling with toast notifications
 * - Calls onBackfillSuccess callback after completion
 * 
 * Use Cases:
 * - New achievements deployed → backfill for existing users
 * - Achievement logic bugfix → recalculate for affected users
 * - Manual admin intervention for data migration
 * 
 * Performance:
 * - Target: <10s @ 95th percentile for 50-150 entries
 * - Maximum: 60s (Vercel function timeout)
 * 
 * Accessibility:
 * - aria-label with user name context
 * - Disabled state during loading
 * - Clear visual feedback
 * 
 * Usage:
 * ```jsx
 * <BackfillAchievementsButton
 *   userId="user-id"
 *   userName="John Doe"
 *   onBackfillSuccess={handleRefresh}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

/**
 * BackfillAchievementsButton component
 * 
 * @param {Object} props
 * @param {string} props.userId - ID of user to backfill achievements for
 * @param {string} props.userName - Display name of user (for aria-label)
 * @param {Function} props.onBackfillSuccess - Callback after successful backfill
 */
export default function BackfillAchievementsButton({
  userId,
  userName,
  onBackfillSuccess,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  /**
   * Handle backfill button click
   */
  const handleBackfill = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}/backfill-achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to backfill achievements');
      }

      // Success! Show statistics
      const { entriesProcessed, achievementsUnlocked, pointsEarned } = data;

      showSuccess(
        `Backfill complete: Processed ${entriesProcessed} entries, unlocked ${achievementsUnlocked} achievements, earned ${pointsEarned} points`
      );

      // Trigger parent refresh
      if (onBackfillSuccess) {
        onBackfillSuccess();
      }
    } catch (error) {
      console.error('❌ Error backfilling achievements:', error);
      const errorMessage = error.message || 'Failed to backfill achievements. Please try again.';
      
      showError(`Failed to backfill achievements: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBackfill}
      disabled={isLoading}
      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center"
      aria-label={`Backfill achievements for ${userName}`}
    >
      {isLoading ? (
        <>
          {/* Loading Spinner */}
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {/* Checkmark Icon */}
          <svg
            className="h-4 w-4 mr-1.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Backfill
        </>
      )}
    </button>
  );
}
