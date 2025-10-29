/**
 * Toast Context
 * 
 * Provides global toast notification state management using React Context.
 * Manages toast queue, auto-dismiss timers, deduplication, and provides toast API.
 * 
 * Features: 
 * - Feature 006: Admin User Management (FR-036 to FR-040)
 * - Feature 021: Toast Notification System (FR-001 to FR-027)
 * 
 * Features:
 * - Add success/error toasts with optional action buttons
 * - Auto-dismiss success toasts after 5 seconds (FR-003, FR-037)
 * - Keep error toasts until manually dismissed (FR-004, FR-038)
 * - Support action buttons (Retry, View, Undo) with callbacks (FR-010, FR-039)
 * - Unique ID generation for toasts (FR-027)
 * - Maximum 4 toasts displayed simultaneously (FR-007)
 * - FIFO queue for overflow handling (FR-007)
 * - Deduplication within 1-second window (FR-008)
 * - Escape key to clear all toasts (FR-020)
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
 * const { showSuccess, showError, clearAll } = useToast();
 * 
 * showSuccess('User deleted successfully');
 * showError('Failed to delete user', { action: { label: 'Retry', onAction: handleRetry } });
 * ```
 */

'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';

// Create context
const ToastContext = createContext(null);

// Maximum number of toasts displayed simultaneously (FR-007)
const MAX_TOASTS = 4;

// Deduplication window in milliseconds (FR-008)
const DEDUPLICATION_WINDOW = 1000; // 1 second

/**
 * Initial state for toast context
 */
const initialState = {
  displayed: [],  // Currently visible toasts (max 4)
  queue: [],      // Toasts waiting for display slot (FIFO)
  maxToasts: MAX_TOASTS,
};

/**
 * Toast reducer - handles all state transitions
 * 
 * Actions:
 * - ADD_TOAST: Add new toast (with deduplication + FIFO queue)
 * - REMOVE_TOAST: Remove toast by ID (process queue if space available)
 * - CLEAR_ALL: Clear all toasts (displayed + queue)
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST': {
      const newToast = action.payload;

      // Deduplication: Check if identical message exists within 1 second (FR-008)
      const isDuplicate = state.displayed.some(
        (toast) =>
          toast.message === newToast.message &&
          newToast.timestamp - toast.timestamp < DEDUPLICATION_WINDOW
      );

      if (isDuplicate) {
        return state; // Skip duplicate
      }

      // If displayed is full (4 toasts), add to queue (FR-007)
      if (state.displayed.length >= state.maxToasts) {
        return {
          ...state,
          queue: [...state.queue, newToast],
        };
      }

      // Otherwise, add to displayed
      return {
        ...state,
        displayed: [...state.displayed, newToast],
      };
    }

    case 'REMOVE_TOAST': {
      const toastId = action.payload;

      // Remove from displayed
      const newDisplayed = state.displayed.filter(
        (toast) => toast.id !== toastId
      );

      // If queue has items, move first queued toast to displayed (FIFO)
      if (state.queue.length > 0) {
        const [nextToast, ...remainingQueue] = state.queue;
        return {
          ...state,
          displayed: [...newDisplayed, nextToast],
          queue: remainingQueue,
        };
      }

      return {
        ...state,
        displayed: newDisplayed,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        displayed: [],
        queue: [],
      };
    }

    default:
      return state;
  }
}


/**
 * Toast Provider Component
 * 
 * Wraps application to provide toast notification functionality.
 * Renders ToastContainer with all active toasts.
 */
export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  
  /**
   * Remove a toast by ID
   * Triggers FIFO queue processing if toasts are waiting
   */
  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);
  
  /**
   * Show success toast
   * 
   * @param {string} message - Success message
   * @param {Object} options - Optional configuration
   * @param {Object} options.action - Action button { label: string, onAction: Function }
   * @param {boolean} options.autoDismiss - Override auto-dismiss (defaults to true for success)
   * 
   * @example
   * showSuccess('Entry saved successfully!');
   * showSuccess('Item deleted', { 
   *   action: { label: 'Undo', onAction: handleUndo }
   * });
   */
  const showSuccess = useCallback((message, options = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id,
        type: 'success',
        message,
        timestamp,
        autoDismiss: options.autoDismiss !== undefined ? options.autoDismiss : true,
        action: options.action, // { label, onAction }
      },
    });
  }, []);
  
  /**
   * Show error toast
   * 
   * @param {string} message - Error message
   * @param {Object} options - Optional configuration
   * @param {Object} options.action - Action button { label: string, onAction: Function }
   * @param {boolean} options.autoDismiss - Override auto-dismiss (defaults to false for errors)
   * 
   * @example
   * showError('Failed to save entry');
   * showError('Network error', {
   *   action: { label: 'Retry', onAction: handleRetry }
   * });
   */
  const showError = useCallback((message, options = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id,
        type: 'error',
        message,
        timestamp,
        autoDismiss: options.autoDismiss !== undefined ? options.autoDismiss : false,
        action: options.action, // { label, onAction }
      },
    });
  }, []);
  
  /**
   * Clear all toasts (both displayed and queued)
   */
  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);
  
  const value = {
    state,
    dispatch,
    toasts: state.displayed, // Backward compatibility with Feature 006
    showSuccess,
    showError,
    removeToast,
    clearAll,
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * 
 * Access toast notification functions from any component.
 * 
 * @returns {Object} Toast functions and state
 * @returns {Object} returns.state - Toast state { displayed, queue, maxToasts }
 * @returns {Function} returns.dispatch - Dispatch reducer actions
 * @returns {Array} returns.toasts - Currently displayed toasts (backward compat)
 * @returns {Function} returns.showSuccess - Show success toast
 * @returns {Function} returns.showError - Show error toast
 * @returns {Function} returns.clearAll - Clear all toasts
 * @returns {Function} returns.removeToast - Remove specific toast
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
 *   action: { label: 'Retry', onAction: handleRetry }
 * });
 */
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}

/**
 * useToastContext Hook
 * 
 * Direct access to toast context state and dispatch (for advanced use cases).
 * Most components should use useToast() instead.
 * 
 * @returns {Object} Context value with state and dispatch
 * @throws {Error} If used outside ToastProvider
 * 
 * @example
 * const { state, dispatch } = useToastContext();
 * dispatch({ type: 'ADD_TOAST', payload: toast });
 */
export function useToastContext() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  
  return context;
}

export default ToastContext;
