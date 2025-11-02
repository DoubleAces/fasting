'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ShareEntryButton from '@/components/molecules/ShareEntryButton';

/**
 * Entry Actions Component
 * Provides Edit and Delete actions for entry details page
 * 
 * @param {object} entry - The entry object
 * @param {boolean} isToday - Whether this entry is for today
 * @param {function} onSuccess - Callback for successful actions
 * @param {function} onError - Callback for error handling
 */
export default function EntryActions({ 
  entry, 
  isToday = false,
  onSuccess,
  onError 
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [streakImpact, setStreakImpact] = useState(null);

  // Check if entry is valid
  const isValid = entry && entry._id;

  /**
   * Handle Edit action - navigate to edit page
   */
  const handleEdit = () => {
    if (!isValid) return;
    router.push(`/entries/${entry._id}/edit`);
  };

  /**
   * Handle Delete button click - check streak impact first
   */
  const handleDeleteClick = async () => {
    if (!isValid) return;
    
    try {
      // Check if this deletion would break a streak
      const checkResponse = await fetch(`/api/entries/${entry._id}?checkOnly=true`, {
        method: 'DELETE',
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check streak impact');
      }

      const data = await checkResponse.json();
      
      if (data.streakImpact) {
        setStreakImpact(data.streakImpact);
      }
      
      setShowDeleteModal(true);
    } catch (err) {
      setError(err.message || 'Failed to check streak impact');
      if (onError) onError(err);
    }
  };

  /**
   * Confirm and execute delete
   */
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/entries/${entry._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete entry');
      }

      // Success - redirect to entries list
      if (onSuccess) onSuccess('Entry deleted successfully');
      router.push('/entries?message=Entry deleted successfully');
      // Don't call router.refresh() here - it would try to refresh the current (now-deleted) entry page
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
      setIsDeleting(false);
      setShowDeleteModal(false);
      if (onError) onError(err);
    }
  };

  /**
   * Dismiss error message
   */
  const handleDismissError = () => {
    setError(null);
  };

  const isLoading = isDeleting;

  return (
    <>
      {/* Error Message - Displayed above buttons */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleDismissError}
              className="ml-4 text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6"
        role="group"
        aria-label="Entry actions"
        data-testid="entry-actions"
      >
        {/* Edit Button */}
        <button
          onClick={handleEdit}
          disabled={!isValid || isLoading}
          className="flex-1 min-h-[44px] min-w-[44px] px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Edit entry"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span data-testid="loading-spinner" className="animate-spin mr-2">⟳</span>
              Loading...
            </span>
          ) : (
            'Edit'
          )}
        </button>

        {/* Share Button */}
        {isValid && <ShareEntryButton entry={entry} />}

        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          disabled={!isValid || isLoading}
          className="flex-1 min-h-[44px] min-w-[44px] px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Delete entry"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        extendedFastInfo={streakImpact}
        isDeleting={isDeleting}
      />
    </>
  );
}
