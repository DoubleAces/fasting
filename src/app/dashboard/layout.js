/**
 * Admin Dashboard Layout
 * 
 * Root layout for /dashboard routes.
 * Wraps all admin pages with AdminLayout component.
 */

import { auth } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | Fasting Tracker',
  description: 'Administrative dashboard for managing the application',
};

export default async function DashboardLayout({ children }) {
  // Get session (server-side)
  const session = await auth();

  // This is a safety check - middleware should handle this
  // but we double-check here for security
  // Return 404 instead of access-denied for better security (obscurity)
  if (!session || !session.user || !session.user.isAdmin) {
    redirect('/404');
  }

  // Pass user info to client component
  const user = {
    name: session.user.name,
    email: session.user.email,
    picture: session.user.picture,
  };

  return (
    <AdminLayout user={user}>
      {children}
    </AdminLayout>
  );
}
