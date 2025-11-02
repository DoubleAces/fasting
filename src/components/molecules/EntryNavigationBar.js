/**
 * EntryNavigationBar Component
 * 
 * Feature: 025-entry-details-enhancement
 * Task: T074 - Create EntryNavigationBar molecule
 * 
 * Navigation bar for entry details with Previous/Next buttons and position badge.
 * Positioned sticky at the top for easy navigation while scrolling.
 * 
 * Props:
 * - navigation: object (required) - { currentPosition, totalEntries, previousEntry, nextEntry, currentDate }
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function EntryNavigationBar({ navigation }) {
  const router = useRouter();
  
  if (!navigation) return null;

  const { currentPosition, totalEntries, previousEntry, nextEntry, currentDate } = navigation;

  // Keyboard navigation: Arrow Left = Previous, Arrow Right = Next
  const handleKeyDown = useCallback((event) => {
    // Only handle arrow keys when not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'ArrowLeft' && previousEntry) {
      event.preventDefault();
      router.push(`/entries/${previousEntry.id}`);
    } else if (event.key === 'ArrowRight' && nextEntry) {
      event.preventDefault();
      router.push(`/entries/${nextEntry.id}`);
    }
  }, [previousEntry, nextEntry, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Format the current date
  const formattedDate = currentDate 
    ? format(new Date(currentDate), 'MMM dd, yyyy')
    : '';

  return (
    <nav 
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6"
      aria-label="Entry navigation"
      role="navigation"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4" role="group">
        {/* Left: Previous Button */}
        <div className="flex-shrink-0">
          {previousEntry ? (
            <Link
              href={`/entries/${previousEntry.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all min-h-[44px]"
              aria-label="Previous entry"
              title="Navigate to previous entry (or press Left Arrow)"
            >
              <svg
                className="w-4 h-4"
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
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed min-h-[44px]"
              aria-label="Previous entry"
            >
              <svg
                className="w-4 h-4"
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
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
        </div>

        {/* Center: Entry Position and Date */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span 
              className="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Entry {currentPosition} of {totalEntries}
            </span>
          </div>
          {formattedDate && (
            <time 
              className="text-sm text-gray-600 font-medium"
              dateTime={currentDate ? new Date(currentDate).toISOString() : ''}
            >
              {formattedDate}
            </time>
          )}
        </div>

        {/* Right: Next Button */}
        <div className="flex-shrink-0">
          {nextEntry ? (
            <Link
              href={`/entries/${nextEntry.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all min-h-[44px]"
              aria-label="Next entry"
              title="Navigate to next entry (or press Right Arrow)"
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                className="w-4 h-4"
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
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed min-h-[44px]"
              aria-label="Next entry"
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                className="w-4 h-4"
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
          )}
        </div>
      </div>
    </nav>
  );
}
