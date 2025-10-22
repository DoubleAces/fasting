/**
 * Toast Test Page
 * 
 * Manual testing page for the Toast notification system.
 * Tests success toasts, error toasts, auto-dismiss, and action buttons.
 * 
 * Access: /test/toast (development only)
 */

'use client';

import { useToast } from '@/hooks/useToast';

export default function ToastTestPage() {
  const { showSuccess, showError, clearAll } = useToast();
  
  const handleSuccessSimple = () => {
    showSuccess('Operation completed successfully!');
  };
  
  const handleSuccessWithAction = () => {
    showSuccess('File uploaded', {
      action: 'View',
      onAction: () => alert('Action clicked!')
    });
  };
  
  const handleErrorSimple = () => {
    showError('Something went wrong. Please try again.');
  };
  
  const handleErrorWithRetry = () => {
    showError('Failed to delete user', {
      action: 'Retry',
      onAction: () => {
        console.log('Retry clicked');
        showSuccess('Retry successful!');
      }
    });
  };
  
  const handleMultipleToasts = () => {
    showSuccess('First toast');
    setTimeout(() => showSuccess('Second toast'), 500);
    setTimeout(() => showError('Third toast (error)'), 1000);
    setTimeout(() => showSuccess('Fourth toast'), 1500);
  };
  
  const handleToggleAdmin = () => {
    showSuccess('Admin privileges granted to user@example.com', {
      action: 'Undo',
      onAction: () => showSuccess('Admin privileges revoked')
    });
  };
  
  const handleDeleteUser = () => {
    showSuccess('Deleted user and 47 fasting entries, 1 settings record, 2 tokens, 15 security logs');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Toast System Test</h1>
        <p className="text-gray-600 mb-8">
          Feature 006: Admin User Management - Toast notifications (FR-036 to FR-040)
        </p>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Success Toasts (FR-037 - Auto-dismiss after 5s)</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSuccessSimple}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Simple Success
              </button>
              <button
                onClick={handleSuccessWithAction}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Success with Action
              </button>
              <button
                onClick={handleToggleAdmin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Toggle Admin Success
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Delete User Success
              </button>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Error Toasts (FR-038 - Manual dismiss)</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleErrorSimple}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Simple Error
              </button>
              <button
                onClick={handleErrorWithRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Error with Retry (FR-039)
              </button>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Multiple Toasts (Max 5 stacked)</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMultipleToasts}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Show Multiple (4 toasts)
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Clear All
              </button>
            </div>
          </section>
          
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Accessibility Testing (FR-040, FR-047)</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Screen reader announcements via ARIA live regions</li>
              <li>Keyboard navigation (Tab to buttons, Enter/Space to activate)</li>
              <li>Focus indicators on dismiss/action buttons</li>
              <li>Semantic HTML (role=&quot;status&quot; for success, role=&quot;alert&quot; for errors)</li>
            </ul>
          </section>
          
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>✅ Success toasts auto-dismiss after 5 seconds</li>
              <li>✅ Error toasts require manual dismissal (X button)</li>
              <li>✅ Action buttons work and dismiss toast after action</li>
              <li>✅ Toasts stack vertically at bottom-right</li>
              <li>✅ Maximum 5 toasts displayed (oldest removed when limit reached)</li>
              <li>✅ Smooth slide-in/slide-out animations</li>
              <li>✅ Responsive on mobile (centered at bottom)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
