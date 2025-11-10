'use client';

/**
 * FilterBar Component
 * 
 * Provides dropdown filters for status, category, and tier
 * 
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onChange - Callback when filters change
 * @returns {JSX.Element} Filter dropdowns
 */
export default function FilterBar({ filters = {}, onChange }) {
  const handleFilterChange = (filterType, value) => {
    onChange({
      ...filters,
      [filterType]: value
    });
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'duration', label: 'Duration' },
    { value: 'streak', label: 'Streak' },
    { value: 'goal', label: 'Goal' },
    { value: 'weight', label: 'Weight' },
    { value: 'consistency', label: 'Consistency' },
    { value: 'special', label: 'Special' },
    { value: 'knowledge', label: 'Knowledge' }
  ];

  const tiers = [
    { value: '', label: 'All Tiers' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {/* Status Filter */}
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label htmlFor="category-filter" className="sr-only">
          Filter by category
        </label>
        <select
          id="category-filter"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tier Filter */}
      <div>
        <label htmlFor="tier-filter" className="sr-only">
          Filter by tier
        </label>
        <select
          id="tier-filter"
          value={filters.tier || ''}
          onChange={(e) => handleFilterChange('tier', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
        >
          {tiers.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {(filters.status !== 'all' || filters.category || filters.tier) && (
        <button
          onClick={() => onChange({ status: 'all', category: '', tier: '' })}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
