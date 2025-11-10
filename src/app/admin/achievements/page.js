'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AchievementsLayout from '@/components/admin/achievements/AchievementsLayout';
import AchievementList from '@/components/admin/achievements/AchievementList';
import SearchInput from '@/components/admin/achievements/SearchInput';
import FilterBar from '@/components/admin/achievements/FilterBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';

/**
 * Admin Achievements List Page
 * 
 * Main page for viewing and managing all achievements
 * Features: search, filter, sort, pagination, bulk operations
 */
export default function AchievementsPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  
  const [achievements, setAchievements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: '', tier: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    loading: false,
  });

  // Fetch achievements
  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      });

      if (search) params.append('search', search);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.tier) params.append('tier', filters.tier);

      const response = await fetch(`/api/admin/achievements?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements);
      setPagination(data.pagination);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
      showError(err.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh when filters change
  useEffect(() => {
    fetchAchievements();
  }, [pagination.page, search, filters, sortBy, sortOrder]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [search, filters]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleToggleActive = async (achievementIds, isActive) => {
    const isBulk = achievementIds.length > 1;
    const actionName = isActive ? 'activate' : 'deactivate';
    
    setConfirmDialog({
      isOpen: true,
      title: `${actionName === 'activate' ? 'Activate' : 'Deactivate'} Achievement${isBulk ? 's' : ''}`,
      message: `Are you sure you want to ${actionName} ${isBulk ? `${achievementIds.length} achievements` : 'this achievement'}?`,
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          // Handle single toggle vs bulk operation
          if (achievementIds.length === 1) {
            // Single toggle - use PATCH endpoint
            const response = await fetch(`/api/admin/achievements/${achievementIds[0]}`, {
              method: 'PATCH'
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to toggle achievement');
            }
          } else {
            // Bulk operation - use bulk endpoint
            const endpoint = isActive 
              ? '/api/admin/achievements/bulk/activate'
              : '/api/admin/achievements/bulk/deactivate';

            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ achievementIds })
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to update achievements');
            }
          }

          // Success
          success(`Successfully ${actionName}d ${isBulk ? `${achievementIds.length} achievements` : 'achievement'}`);
          
          // Close dialog and refresh
          setConfirmDialog({ isOpen: false, title: '', message: '', action: null, loading: false });
          await fetchAchievements();
        } catch (err) {
          showError(err.message || `Failed to ${actionName} achievement${isBulk ? 's' : ''}`);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      },
    });
  };

  const handleDelete = async (achievementId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Achievement',
      message: 'Are you sure you want to delete this achievement? This action cannot be undone.',
      variant: 'danger',
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
          // TODO: Implement delete API call when endpoint is ready
          const response = await fetch(`/api/admin/achievements/${achievementId}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete achievement');
          }

          success('Achievement deleted successfully');
          setConfirmDialog({ isOpen: false, title: '', message: '', action: null, loading: false });
          await fetchAchievements();
        } catch (err) {
          showError(err.message || 'Failed to delete achievement');
          setConfirmDialog(prev => ({ ...prev, loading: false }));
        }
      },
    });
  };

  return (
    <AchievementsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage achievement definitions and metadata
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/achievements/create')}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Create Achievement
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or description..."
          />
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>

        {/* Error State with Retry */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={fetchAchievements}
                className="ml-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Achievement List */}
        <AchievementList
          achievements={achievements}
          pagination={pagination}
          onSearch={handleSearch}
          onFilter={handleFilterChange}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', action: null, loading: false })}
        loading={confirmDialog.loading}
      />
    </AchievementsLayout>
  );
}
