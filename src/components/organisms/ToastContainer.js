/**
 * ToastContainer Component
 * 
 * Container for displaying toast notifications at top-center of viewport.
 * Reads from ToastContext and renders Toast components for each displayed toast.
 * 
 * Feature: 021-toast-notifications (FR-012, FR-013, FR-014, FR-015)
 * 
 * Features:
 * - Fixed position at top-center
 * - Stacks toasts vertically with gap-3
 * - Escape key clears all toasts
 * - Responsive layout (full-width on mobile, max-w on desktop)
 * - High z-index (above all content)
 * 
 * Usage:
 * ```jsx
 * // In layout.js
 * import { ToastProvider } from '@/contexts/ToastContext';
 * import ToastContainer from '@/components/organisms/ToastContainer';
 * 
 * <ToastProvider>
 *   {children}
 *   <ToastContainer />
 * </ToastProvider>
 * ```
 */

'use client';

import { useEffect } from 'react';
import { useToastContext } from '@/contexts/ToastContext';
import Toast from '@/components/molecules/Toast';

export default function ToastContainer() {
  const { state, clearAll, removeToast } = useToastContext();

  // Escape key handler - clears all toasts
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        clearAll();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [clearAll]);

  return (
    <div
      className="
        fixed top-4 left-1/2 -translate-x-1/2
        w-full max-w-[500px] px-4 sm:w-auto
        flex flex-col gap-3
        pointer-events-none
        z-50
      "
      aria-live="polite"
      aria-atomic="false"
    >
      {state.displayed.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            type={toast.type}
            message={toast.message}
            action={toast.action}
            onDismiss={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
