'use client';

import { useState } from 'react';
import Link from 'next/link';
import PaginationControls from './PaginationControls';

/**
 * AchievementList Component
 * 
 * Displays paginated table of achievements with status, category, tier, unlock count
 * Supports inline actions (edit, delete, toggle active)
 * 
 * @param {Object} props - Component props
 * @param {Array} props.achievements - Array of achievement objects
 * @param {Object} props.pagination - Pagination metadata
 * @param {Function} props.onSearch - Search callback
 * @param {Function} props.onFilter - Filter callback
 * @param {Function} props.onSort - Sort callback
 * @param {Function} props.onPageChange - Page change callback
 * @param {Function} props.onToggleActive - Toggle active status callback
 * @param {Function} props.onDelete - Delete achievement callback
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Achievement list table
 */
export default function AchievementList({
  achievements,
  pagination,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  onToggleActive,
  onDelete,
  loading = false
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(achievements.map(a => a.achievementId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (achievementId) => {
    setSelectedIds(prev =>
      prev.includes(achievementId)
        ? prev.filter(id => id !== achievementId)
        : [...prev, achievementId]
    );
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedIds.length} selected
            </span>
            <div className="space-x-3">
              <button
                onClick={() => onToggleActive(selectedIds, true)}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                Activate All
              </button>
              <button
                onClick={() => onToggleActive(selectedIds, false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Deactivate All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === achievements.length && achievements.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  aria-label="Select all achievements"
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tier
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('points')}
              >
                Points {getSortIcon('points')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unlocks
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : achievements.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No achievements found
                </td>
              </tr>
            ) : (
              achievements.map((achievement) => (
                <tr key={achievement.achievementId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(achievement.achievementId)}
                      onChange={() => handleSelectOne(achievement.achievementId)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      aria-label={`Select ${achievement.translations?.en?.name || achievement.name || 'achievement'}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{achievement.translations?.en?.iconUrl || achievement.iconUrl || '🏆'}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {achievement.translations?.en?.name || achievement.name || 'Untitled'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {achievement.translations?.en?.description || achievement.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive([achievement.achievementId], !achievement.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        achievement.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      aria-label={`Toggle ${achievement.translations?.en?.name || achievement.name || 'achievement'} status`}
                    >
                      {achievement.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{achievement.category.replace('-', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        achievement.tier === 'bronze'
                          ? 'bg-orange-100 text-orange-800'
                          : achievement.tier === 'silver'
                          ? 'bg-gray-100 text-gray-800'
                          : achievement.tier === 'gold'
                          ? 'bg-yellow-100 text-yellow-800'
                          : achievement.tier === 'platinum'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {achievement.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {achievement.rarity?.score || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {achievement.unlockCount || 0} users
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/achievements/${achievement.achievementId}/edit`}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(achievement.achievementId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls
        pagination={pagination}
        onPageChange={onPageChange}
        disabled={loading}
      />
    </div>
  );
}
