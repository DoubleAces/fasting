/**
 * Toast Context
 * 
 * Provides global toast notification state management using React Context.
 * Manages toast queue, auto-dismiss timers, and provides toast API.
 * 
 * Feature: 006-admin-user-management (FR-036 to FR-040)
 * 
 * Features:
 * - Add success/error toasts with optional action buttons
 * - Auto-dismiss success toasts after 5 seconds (FR-037)
 * - Keep error toasts until manually dismissed (FR-038)
 * - Support retry buttons for errors (FR-039)
 * - Unique ID generation for toasts
 * - Maximum 5 toasts displayed simultaneously
 * 
 * Usage:
 * ```jsx
 * import { ToastProvider, useToast } from '@/contexts/ToastContext';
 * 
 * // Wrap app with provider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // Use in components
 * const { showSuccess, showError } = useToast();
 * 
 * showSuccess('User deleted successfully');
 * showError('Failed to delete user', { action: 'Retry', onAction: handleRetry });
 * ```
 */

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ui/ToastContainer.js';
import Toast from '../components/ui/Toast.js';

// Create context
const ToastContext = createContext(null);

// Maximum number of toasts displayed simultaneously
const MAX_TOASTS = 5;

/**
 * Toast Provider Component
 * 
 * Wraps application to provide toast notification functionality.
 * Renders ToastContainer with all active toasts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  /**
   * Add a toast notification
   * 
   * @param {Object} toast - Toast configuration
   * @param {string} toast.type - 'success' or 'error'
   * @param {string} toast.message - Toast message
   * @param {string} [toast.action] - Optional action button text
   * @param {Function} [toast.onAction] - Optional action button handler
   * @param {boolean} [toast.autoDismiss] - Override auto-dismiss behavior
   */
  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts(prevToasts => {
      // Remove oldest toast if at maximum
      const updatedToasts = prevToasts.length >= MAX_TOASTS 
        ? prevToasts.slice(1)
        : prevToasts;
      
      return [...updatedToasts, { ...toast, id }];
    });
  }, []);
  
  /**
   * Remove a toast by ID
   */
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);
  
  /**
   * Show success toast
   * 
   * @param {string} message - Success message
   * @param {Object} options - Optional configuration
   * @param {string} options.action - Action button text
   * @param {Function} options.onAction - Action button handler
   */
  const showSuccess = useCallback((message, options = {}) => {
    addToast({
      type: 'success',
      message,
      action: options.action,
      onAction: options.onAction,
      autoDismiss: options.autoDismiss !== undefined ? options.autoDismiss : true,
    });
  }, [addToast]);
  
  /**
   * Show error toast
   * 
   * @param {string} message - Error message
   * @param {Object} options - Optional configuration
   * @param {string} options.action - Action button text (e.g., "Retry")
   * @param {Function} options.onAction - Action button handler
   */
  const showError = useCallback((message, options = {}) => {
    addToast({
      type: 'error',
      message,
      action: options.action,
      onAction: options.onAction,
      autoDismiss: options.autoDismiss !== undefined ? options.autoDismiss : false,
    });
  }, [addToast]);
  
  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);
  
  const value = {
    toasts,
    showSuccess,
    showError,
    removeToast,
    clearAll,
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            action={toast.action}
            onAction={toast.onAction}
            onDismiss={removeToast}
            autoDismiss={toast.autoDismiss}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * 
 * Access toast notification functions from any component.
 * 
 * @returns {Object} Toast functions
 * @returns {Function} returns.showSuccess - Show success toast
 * @returns {Function} returns.showError - Show error toast
 * @returns {Function} returns.clearAll - Clear all toasts
 * 
 * @throws {Error} If used outside ToastProvider
 * 
 * @example
 * const { showSuccess, showError } = useToast();
 * 
 * // Success with auto-dismiss
 * showSuccess('Changes saved');
 * 
 * // Error with retry button
 * showError('Failed to save', {
 *   action: 'Retry',
 *   onAction: handleRetry
 * });
 */
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

export default ToastContext;
