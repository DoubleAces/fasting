/**
 * AdminLayout Component
 * 
 * Wrapper layout for admin area with sidebar and header.
 * Provides consistent structure for all admin pages.
 */

'use client';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, user }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (fixed) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <AdminHeader user={user} />

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
