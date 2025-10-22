/**
 * PaginationControls Component
 * 
 * Provides pagination navigation for the user list:
 * - Page size selector (10 / 25 / 50 / 100 items per page)
 * - First / Previous / Next / Last page buttons
 * - Current page display (e.g., "Page 3 of 10")
 * - Total records display (e.g., "150 users")
 * 
 * Features:
 * - Disables buttons appropriately (First/Prev on page 1, Next/Last on last page)
 * - Accessible with ARIA labels
 * - Responsive layout (stacks on mobile)
 * - Visual feedback on hover/disabled states
 * 
 * Accessibility:
 * - Keyboard navigable
 * - Screen reader friendly with aria-label
 * - Disabled state communicated with aria-disabled
 */

'use client';

/**
 * PaginationControls component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalUsers - Total number of users (all pages)
 * @param {number} props.pageSize - Current page size
 * @param {boolean} props.hasNextPage - Whether there's a next page
 * @param {boolean} props.hasPrevPage - Whether there's a previous page
 * @param {Function} props.onPageChange - Callback when page changes: (pageNumber) => void
 * @param {Function} props.onPageSizeChange - Callback when page size changes: (newSize) => void
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  totalUsers,
  pageSize,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onPageSizeChange,
}) {
  // ========================================================================
  // HANDLERS
  // ========================================================================

  const goToFirstPage = () => {
    if (hasPrevPage) {
      onPageChange(1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    if (hasNextPage) {
      onPageChange(totalPages);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageSizeChange(newSize);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Page Size Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            Show:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white text-sm"
            aria-label="Select page size"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>

        {/* Center: Page Info */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span className="font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">
            {totalUsers} {totalUsers === 1 ? 'user' : 'users'} total
          </span>
        </div>

        {/* Right: Navigation Buttons */}
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={goToFirstPage}
            disabled={!hasPrevPage}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            aria-label="Go to first page"
            aria-disabled={!hasPrevPage}
          >
            First
          </button>

          {/* Previous Page */}
          <button
            onClick={goToPrevPage}
            disabled={!hasPrevPage}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            aria-label="Go to previous page"
            aria-disabled={!hasPrevPage}
          >
            Previous
          </button>

          {/* Next Page */}
          <button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            aria-label="Go to next page"
            aria-disabled={!hasNextPage}
          >
            Next
          </button>

          {/* Last Page */}
          <button
            onClick={goToLastPage}
            disabled={!hasNextPage}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
            aria-label="Go to last page"
            aria-disabled={!hasNextPage}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
