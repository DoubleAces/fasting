/**
 * AdminLayout Component
 * 
 * Wrapper layout for admin area with sidebar and header.
 * Provides consistent structure for all admin pages.
 * Completely standalone - no public site elements.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in main content area
 * @param {Object} [props.user] - User object from session (optional)
 * @returns {JSX.Element} Complete admin layout with sidebar, header, and main content
 */

'use client';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, user }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (fixed) */}
      <AdminSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="p-8" role="main" aria-label="Admin dashboard content">
          {children}
        </main>
      </div>
    </div>
  );
}
