/**
 * useToast Hook
 * 
 * Convenience export for accessing toast functionality.
 * Re-exports the useToast hook from ToastContext.
 * 
 * Feature: 006-admin-user-management (FR-036)
 * 
 * Usage:
 * ```javascript
 * import { useToast } from '@/hooks/useToast';
 * 
 * function MyComponent() {
 *   const { showSuccess, showError } = useToast();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       showSuccess('Data saved successfully');
 *     } catch (error) {
 *       showError('Failed to save data', {
 *         action: 'Retry',
 *         onAction: handleSave
 *       });
 *     }
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */

export { useToast } from '../contexts/ToastContext.js';
