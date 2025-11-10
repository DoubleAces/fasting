'use client';

/**
 * PaginationControls Component
 * 
 * Reusable pagination controls with page info and navigation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pagination - Pagination metadata
 * @param {number} props.pagination.page - Current page number
 * @param {number} props.pagination.limit - Items per page
 * @param {number} props.pagination.total - Total items
 * @param {number} props.pagination.totalPages - Total pages
 * @param {Function} props.onPageChange - Page change callback
 * @param {boolean} props.disabled - Disable navigation buttons
 * @returns {JSX.Element} Pagination controls
 */
export default function PaginationControls({ pagination, onPageChange, disabled = false }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, limit, total, totalPages } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePrevious = () => {
    if (page > 1 && !disabled) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages && !disabled) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    if (pageNum !== page && !disabled) {
      onPageChange(pageNum);
    }
  };

  // Generate page numbers to show (max 7: first, prev, current-1, current, current+1, next, last)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart subset
      if (page <= 3) {
        // Near start: show 1-5, ..., last
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Near end: show 1, ..., last-4 to last
        pages.push(1);
        pages.push('ellipsis-start');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push(1);
        pages.push('ellipsis-start');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('ellipsis-end');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results info */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>

        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={page === 1 || disabled}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="hidden sm:flex items-center space-x-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-sm text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  disabled={disabled}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pageNum === page
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={pageNum === page ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={page >= totalPages || disabled}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
