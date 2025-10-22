/**
 * Toast Component
 * 
 * Individual toast notification with success/error styling and ARIA announcements.
 * Part of the custom toast notification system (no external library per FR-036).
 * 
 * Feature: 006-admin-user-management (FR-036 to FR-040)
 * 
 * Props:
 * - id: Unique identifier for the toast
 * - type: 'success' or 'error'
 * - message: Toast message text
 * - action: Optional action button (e.g., "Retry")
 * - onAction: Optional action button click handler
 * - onDismiss: Function to call when toast is dismissed
 * - autoDismiss: Auto-dismiss after 5 seconds (default: true for success, false for error)
 * 
 * Accessibility (FR-040, FR-047):
 * - Uses ARIA live regions for screen reader announcements
 * - Keyboard navigable (Tab to action/dismiss, Enter/Space to activate)
 * - Semantic HTML with role="status" for success, role="alert" for errors
 * - Clear visual contrast for color-blind users
 * 
 * Styling:
 * - Success: Green background with checkmark icon
 * - Error: Red background with X icon
 * - Slide-in animation from bottom-right
 * - Mobile-responsive (stacks on narrow screens)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ 
  id,
  type = 'success', 
  message, 
  action = null,
  onAction = null,
  onDismiss,
  autoDismiss = null 
}) {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation before removing from DOM
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  }, [id, onDismiss]);
  
  // Auto-dismiss logic (FR-037, FR-038)
  useEffect(() => {
    // Default: success toasts auto-dismiss after 5s, error toasts don't
    const shouldAutoDismiss = autoDismiss !== null ? autoDismiss : type === 'success';
    
    if (shouldAutoDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, type, handleDismiss]);
  
  const handleActionClick = () => {
    if (onAction) {
      onAction();
      handleDismiss();
    }
  };
  
  // Icon based on type
  const Icon = type === 'success' ? CheckCircle : XCircle;
  
  // ARIA role: status for success (polite), alert for errors (assertive)
  const ariaRole = type === 'success' ? 'status' : 'alert';
  
  // Styling based on type
  const bgColor = type === 'success' 
    ? 'bg-green-600' 
    : 'bg-red-600';
  
  const iconColor = 'text-white';
  
  return (
    <div
      role={ariaRole}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg
        ${bgColor} text-white
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        min-w-[320px] max-w-md
      `}
      data-testid={`toast-${type}`}
    >
      {/* Icon */}
      <Icon className={`${iconColor} flex-shrink-0 w-5 h-5 mt-0.5`} aria-hidden="true" />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">
          {message}
        </p>
        
        {/* Action button (FR-039 for retry) */}
        {action && onAction && (
          <button
            onClick={handleActionClick}
            className="
              mt-2 text-sm font-semibold underline
              hover:no-underline focus:outline-none focus:ring-2 
              focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600
              transition-all
            "
            data-testid="toast-action"
          >
            {action}
          </button>
        )}
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="
          flex-shrink-0 p-1 rounded
          hover:bg-white/20 focus:outline-none focus:ring-2 
          focus:ring-white transition-all
        "
        aria-label="Dismiss notification"
        data-testid="toast-dismiss"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
