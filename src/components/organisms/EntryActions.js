'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

/**
 * Entry Actions Component
 * Provides Edit, Delete, and Copy to Today actions for entry details page
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
  const [isCopying, setIsCopying] = useState(false);
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
   * Handle Copy to Today action
   */
  const handleCopyToToday = async () => {
    if (!isValid || isToday) return;
    
    setIsCopying(true);
    setError(null);

    try {
      // First, check if today's entry already exists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Format date as YYYY-MM-DD in local timezone
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayFormatted = `${year}-${month}-${day}`;
      
      const checkResponse = await fetch(
        `/api/entries?date=${todayFormatted}`
      );
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check existing entries');
      }

      const existingEntries = await checkResponse.json();
      
      if (existingEntries.entries && existingEntries.entries.length > 0) {
        setError('You already have an entry for today. Please edit or delete it first.');
        setIsCopying(false);
        return;
      }

      // Create new entry with copied meal times
      // Only include required fields and templateSource - omit optional fields
      // Send date at noon UTC to avoid timezone display issues
      // Custom validation ensures we only compare date part, not time
      const newEntry = {
        date: `${todayFormatted}T12:00:00.000Z`,
        firstMealTime: entry.firstMealTime,
        lastMealTime: entry.lastMealTime,
        templateSource: entry._id, // Track where this came from
      };

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        const data = await response.json();
        // Show detailed error message for debugging
        if (data.errors && Array.isArray(data.errors)) {
          const errorDetails = data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          throw new Error(errorDetails);
        }
        throw new Error(data.error || 'Failed to copy entry');
      }

      const data = await response.json();

      // Success - navigate to new entry
      // API returns entry directly, not wrapped in an object
      if (onSuccess) onSuccess('Entry copied to today successfully');
      router.push(`/entries/${data._id}?message=Entry copied successfully`);
      // Don't call router.refresh() - router.push will load the new page correctly
    } catch (err) {
      setError(err.message || 'Failed to copy entry');
      setIsCopying(false);
      if (onError) onError(err);
    }
  };

  /**
   * Dismiss error message
   */
  const handleDismissError = () => {
    setError(null);
  };

  const isLoading = isDeleting || isCopying;

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

        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          disabled={!isValid || isLoading}
          className="flex-1 min-h-[44px] min-w-[44px] px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Delete entry"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>

        {/* Copy to Today Button */}
        <button
          onClick={handleCopyToToday}
          disabled={!isValid || isToday || isLoading}
          className="flex-1 min-h-[44px] min-w-[44px] px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-label="Copy to today"
          aria-disabled={isToday}
          title={isToday ? 'You are already viewing today\'s entry' : 'Copy meal times to today'}
        >
          {isCopying ? 'Copying...' : 'Copy to Today'}
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
