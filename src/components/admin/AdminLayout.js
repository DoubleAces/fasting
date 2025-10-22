/**
 * AdminLayout Component
 * 
 * Wrapper layout for admin area with sidebar and header.
 * Provides consistent structure for all admin pages.
 * Completely standalone - no public site elements.
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
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
