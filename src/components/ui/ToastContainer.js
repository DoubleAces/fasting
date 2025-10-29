/**
 * ToastContainer Component
 * 
 * Container for displaying multiple toast notifications with Portal rendering.
 * Renders toasts in fixed position at top-center of screen (FR-001).
 * 
 * Feature: 021-toast-notifications (FR-001, FR-004, FR-005)
 * 
 * Features:
 * - Fixed position at top-center (all devices)
 * - Stacks multiple toasts vertically with gap
 * - Portal rendering to bypass z-index issues
 * - Responsive max-width (500px desktop, 90vw mobile)
 * - Zero CLS (uses fixed positioning)
 * 
 * Usage:
 * ```jsx
 * import ToastContainer from '@/components/ui/ToastContainer';
 * import Toast from '@/components/ui/Toast';
 * 
 * <ToastContainer>
 *   {toasts.map(toast => (
 *     <Toast key={toast.id} {...toast} onDismiss={removeToast} />
 *   ))}
 * </ToastContainer>
 * ```
 */

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ToastContainer({ children }) {
  const [mounted, setMounted] = useState(false);
  
  // Wait for client-side mount to avoid SSR/hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything on server or before mount
  if (!mounted) {
    return null;
  }
  
  // Render toasts in portal (appended to document.body)
  // FR-001: top-center positioning
  // T070: motion-reduce support for reduced motion
  return createPortal(
    <div
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-[9999]
        w-full max-w-md px-4
        space-y-3
        pointer-events-none
        max-h-screen overflow-y-auto
        motion-reduce:transition-none
      "
      aria-live="polite"
      aria-atomic="false"
      data-testid="toast-container"
    >
      {/* Each toast has pointer-events-auto to make it interactive */}
      <div className="pointer-events-auto space-y-3">
        {children}
      </div>
    </div>,
    document.body
  );
}
