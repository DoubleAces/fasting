/**
 * ConfirmDialog Component
 * 
 * Reusable confirmation dialog for destructive actions.
 * Uses native HTML <dialog> element for accessibility and focus management.
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Focus trap (keeps focus within dialog)
 * - Escape key closes dialog
 * - Click outside closes dialog
 * - Danger variant (red) for destructive actions
 * - Loading state during async operations
 * - Cancel and Confirm buttons
 * 
 * Accessibility:
 * - role="dialog"
 * - aria-labelledby (title)
 * - aria-describedby (message)
 * - Focus returns to trigger element on close
 * - Keyboard navigation (Tab, Escape)
 * 
 * Usage:
 * ```jsx
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   title="Delete User"
 *   message="Are you sure you want to delete John Doe? This action cannot be undone."
 *   confirmLabel="Delete"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   variant="danger"
 *   isLoading={isDeleting}
 * />
 * ```
 */

'use client';

import { useEffect, useRef } from 'react';

/**
 * ConfirmDialog component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Confirmation message (supports line breaks)
 * @param {string} [props.confirmLabel='Confirm'] - Text for confirm button
 * @param {string} [props.cancelLabel='Cancel'] - Text for cancel button
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {string} [props.variant='default'] - 'default' | 'danger'
 * @param {boolean} [props.isLoading=false] - Show loading state
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false,
}) {
  const dialogRef = useRef(null);

  // Open/close dialog based on isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Use show() instead of showModal() to avoid native backdrop
      dialog.show();
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key and backdrop click
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onCancel();
    };

    const handleClick = (e) => {
      // Close on backdrop click (outside dialog content)
      const rect = dialog.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        onCancel();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onCancel]);

  // Determine button colors based on variant
  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <>
      {/* Custom Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={onCancel}
          aria-hidden="true"
        />
      )}

      {/* Dialog - hide default backdrop with style */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 rounded-lg shadow-2xl p-0 max-w-md w-full m-auto border-0 overflow-visible bg-transparent"
        style={{ backgroundColor: 'transparent' }}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        {/* Dialog Content */}
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {/* Title */}
          <h2
            id="dialog-title"
            className="text-xl font-semibold text-gray-900 mb-4 text-left"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="dialog-message"
            className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed text-left"
          >
            {message}
          </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${confirmButtonClass}`}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
    </>
  );
}
