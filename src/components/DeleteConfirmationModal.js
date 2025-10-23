'use client';

import React from 'react';

/**
 * Modal for confirming entry deletion
 * Handles both simple deletion and extended fast scenarios
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close modal callback
 * @param {function} onConfirm - Confirm deletion callback
 * @param {object|null} extendedFastInfo - Extended fast information if detected
 * @param {boolean} isDeleting - Loading state during deletion
 */
export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  extendedFastInfo = null,
  isDeleting = false 
}) {
  if (!isOpen) return null;

  const hasExtendedFast = !!extendedFastInfo;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDeleteAndCreate = () => {
    onConfirm({ createExtendedFast: true });
  };

  const handleDeleteAndDontCreate = () => {
    onConfirm({ createExtendedFast: false });
  };

  const handleSimpleDelete = () => {
    onConfirm({ createExtendedFast: null });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {hasExtendedFast ? 'Extended Fast Detected' : 'Confirm Deletion'}
          </h2>
        </div>

        {/* Content */}
        <div className="mb-6">
          {hasExtendedFast ? (
            <div className="space-y-3">
              <p className="text-gray-700">
                Deleting this entry will create an extended fast period:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">From:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(extendedFastInfo.previousEntryDate)} at {extendedFastInfo.previousLastMealTime}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">To:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(extendedFastInfo.nextEntryDate)} at {extendedFastInfo.nextFirstMealTime}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-yellow-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Duration:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {extendedFastInfo.fastingDuration?.formatted || 
                       `${extendedFastInfo.fastingDuration?.hours || 0}h ${extendedFastInfo.fastingDuration?.minutes || 0}m`}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Would you like to proceed with deletion?
              </p>
            </div>
          ) : (
            <p className="text-gray-700">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasExtendedFast ? (
            <>
              <button
                onClick={handleDeleteAndCreate}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete and Create Extended Fast'}
              </button>
              
              <button
                onClick={handleDeleteAndDontCreate}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete Without Extended Fast'}
              </button>
              
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSimpleDelete}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Entry'}
              </button>
              
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
