/**
 * UserManagementPage Client Component
 * 
 * Client-side wrapper for the admin user management page.
 * Manages state for filtering, pagination, and sorting.
 * 
 * Features:
 * - Filter state management (name, email, admin status)
 * - Pagination state (page number, page size)
 * - Sort state (field, order)
 * - URL query param synchronization
 * - API calls to fetch users
 * - Loading and error states
 * - Toast notifications for errors
 * 
 * Flow:
 * 1. Initialize state from URL query params
 * 2. Render UI with current state
 * 3. User changes filters/pagination/sort
 * 4. Update URL query params
 * 5. Trigger data fetch
 * 6. Update UI with new data
 * 
 * Performance:
 * - Debounced filter inputs (300ms)
 * - URL params enable browser back/forward navigation
 * - Single API call per state change
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import ErrorBoundary from '@/components/ErrorBoundary';
import FilterBar from './components/FilterBar';
import UserTable from './components/UserTable';
import PaginationControls from './components/PaginationControls';

/**
 * UserManagementPage component
 * 
 * @param {Object} props
 * @param {Object} props.initialData - Initial user data from server
 * @param {string} props.currentUserId - ID of logged-in user
 */
export default function UserManagementPage({ initialData, currentUserId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useToast();

  // ========================================================================
  // STATE
  // ========================================================================

  // Data state
  const [users, setUsers] = useState(initialData?.users || []);
  const [totalUsers, setTotalUsers] = useState(initialData?.totalUsers || 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [hasNextPage, setHasNextPage] = useState(initialData?.hasNextPage || false);
  const [hasPrevPage, setHasPrevPage] = useState(initialData?.hasPrevPage || false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);

  // Filter state (initialize from URL params)
  const [nameFilter, setNameFilter] = useState(searchParams.get('nameFilter') || '');
  const [emailFilter, setEmailFilter] = useState(searchParams.get('emailFilter') || '');
  const [adminFilter, setAdminFilter] = useState(searchParams.get('adminFilter') || 'all');

  // Pagination state (initialize from URL params)
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page')) || 1
  );
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get('limit')) || 25
  );

  // Sort state (initialize from URL params)
  const [sortBy, setSortBy] = useState(
    searchParams.get('sortBy') || 'registrationDate'
  );
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  // ========================================================================
  // URL QUERY PARAM SYNC
  // ========================================================================

  /**
   * Build URL query string from current state
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    // Pagination
    params.set('page', currentPage.toString());
    params.set('limit', pageSize.toString());

    // Filters
    if (nameFilter) params.set('nameFilter', nameFilter);
    if (emailFilter) params.set('emailFilter', emailFilter);
    if (adminFilter && adminFilter !== 'all') params.set('adminFilter', adminFilter);

    // Sort
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    return params.toString();
  }, [currentPage, pageSize, nameFilter, emailFilter, adminFilter, sortBy, sortOrder]);

  /**
   * Update URL without page reload
   */
  const updateURL = useCallback(() => {
    const queryString = buildQueryString();
    router.push(`/dashboard/users?${queryString}`, { scroll: false });
  }, [buildQueryString, router]);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetch users from API
   */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/admin/users?${queryString}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      if (result.success) {
        setUsers(result.data.users);
        setTotalUsers(result.data.totalUsers);
        setTotalPages(result.data.totalPages);
        setCurrentPage(result.data.currentPage);
        setPageSize(result.data.pageSize);
        setHasNextPage(result.data.hasNextPage);
        setHasPrevPage(result.data.hasPrevPage);
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError(error.message || 'Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString, showError]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  /**
   * Fetch data and update URL when state changes
   */
  useEffect(() => {
    updateURL();
    fetchUsers();
  }, [nameFilter, emailFilter, adminFilter, currentPage, pageSize, sortBy, sortOrder]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((filters) => {
    setNameFilter(filters.nameFilter);
    setEmailFilter(filters.emailFilter);
    setAdminFilter(filters.adminFilter);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to page 1 when page size changes
  }, []);

  /**
   * Handle sort change (toggle between asc/desc)
   */
  const handleSortChange = useCallback(
    (field) => {
      if (sortBy === field) {
        // Toggle sort order if same field
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        // New field: default to descending
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy, sortOrder]
  );

  /**
   * Handle refresh request (e.g., after admin toggle)
   */
  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <ErrorBoundary errorMessage="Failed to load user management page. Please refresh the page or contact support.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all users in the system
          </p>
        </div>

        {/* Filter Bar */}
        <ErrorBoundary errorMessage="Filter controls encountered an error.">
          <FilterBar
            onFilterChange={handleFilterChange}
            initialFilters={{
              nameFilter,
              emailFilter,
              adminFilter,
            }}
          />
        </ErrorBoundary>

        {/* User Table */}
        <ErrorBoundary errorMessage="User table encountered an error.">
          <UserTable
            users={users}
            currentUserId={currentUserId}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </ErrorBoundary>

        {/* Pagination Controls */}
        {!isLoading && users.length > 0 && (
          <ErrorBoundary errorMessage="Pagination controls encountered an error.">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalUsers={totalUsers}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}
