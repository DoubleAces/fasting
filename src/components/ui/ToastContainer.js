/**
 * ToastContainer Component
 * 
 * Container for displaying multiple toast notifications with Portal rendering.
 * Renders toasts in fixed position at bottom-right of screen.
 * 
 * Feature: 006-admin-user-management (FR-036)
 * 
 * Features:
 * - Fixed position at bottom-right (desktop) or bottom-center (mobile)
 * - Stacks multiple toasts vertically with gap
 * - Portal rendering to bypass z-index issues
 * - Responsive positioning
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
  return createPortal(
    <div
      className="
        fixed bottom-0 right-0 z-[9999]
        p-4 space-y-3
        pointer-events-none
        max-h-screen overflow-y-auto
        md:max-w-md
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
