/**
 * Admin Users Page (Server Component)
 * 
 * Route: /admin/users
 * 
 * Server-side page for admin user management.
 * Fetches initial data on the server and passes to client component.
 * 
 * Features:
 * - Server-side authentication check (Next.js middleware handles this)
 * - Initial data fetch (reduces client-side loading time)
 * - SEO friendly (server-rendered)
 * - Passes search params to client for state initialization
 * 
 * Flow:
 * 1. Middleware checks authentication and admin status
 * 2. Server component fetches initial user data
 * 3. Server renders page with initial data
 * 4. Client component hydrates with state management
 * 5. Subsequent interactions handled by client component
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPaginatedUsers } from '@/lib/services/userService';
import UserManagementPage from './UserManagementPage';

/**
 * Admin Users Page
 * 
 * @param {Object} props
 * @param {Object} props.searchParams - URL search parameters
 */
export default async function AdminUsersPage({ searchParams }) {
  // ========================================================================
  // AUTHENTICATION
  // ========================================================================

  // Get session (middleware should have already checked, but double-check)
  const session = await auth();

  // Redirect if not authenticated or not admin
  if (!session || !session.user) {
    redirect('/login?redirect=/admin/users');
  }

  if (!session.user.isAdmin) {
    redirect('/'); // Regular users go to homepage
  }

  // ========================================================================
  // PARSE SEARCH PARAMS
  // ========================================================================

  // In Next.js 15, searchParams must be awaited
  const params = await searchParams;

  const page = params.page || '1';
  const limit = params.limit || '25';
  const nameFilter = params.nameFilter || '';
  const emailFilter = params.emailFilter || '';
  const adminFilter = params.adminFilter || 'all';
  const sortBy = params.sortBy || 'registrationDate';
  const sortOrder = params.sortOrder || 'desc';

  // ========================================================================
  // FETCH INITIAL DATA
  // ========================================================================

  let initialData = {
    users: [],
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 25,
    hasNextPage: false,
    hasPrevPage: false,
  };

  try {
    const result = await getPaginatedUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      nameFilter,
      emailFilter,
      adminFilter,
      sortBy,
      sortOrder,
    });

    // Serialize MongoDB documents to plain objects
    initialData = {
      ...result,
      users: result.users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        emailVerified: user.emailVerified,
        registrationDate: user.registrationDate?.toISOString(),
        lastLogin: user.lastLogin?.toISOString(),
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        authMethod: user.authMethod,
      })),
    };
  } catch (error) {
    console.error('Error fetching initial user data:', error);
    // Continue with empty data - client component will handle error state
  }

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <UserManagementPage
      initialData={initialData}
      currentUserId={session.user.id}
    />
  );
}

/**
 * Metadata for the page
 */
export const metadata = {
  title: 'User Management | Admin Panel',
  description: 'Manage users, admin privileges, and user accounts',
};
