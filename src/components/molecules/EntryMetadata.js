/**
 * EntryMetadata Component
 * 
 * Displays entry timestamps with formatting and relative time.
 * Shows creation and last update dates.
 */

'use client';

import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

const EntryMetadata = ({ entry }) => {
  if (!entry) return <div className="text-sm text-gray-600 space-y-1" />;

  const { createdAt, updatedAt } = entry;

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return '--';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Compare dates as ISO strings to determine if they're different
  const showUpdated = updatedAt && createdAt && 
    new Date(updatedAt).getTime() !== new Date(createdAt).getTime();

  return (
    <div className="text-sm text-gray-600 space-y-1">
      {/* Created timestamp */}
      <div>
        <span className="font-medium">Created:</span>{' '}
        <time dateTime={createdAt || undefined}>
          {formatDate(createdAt)}
        </time>
        {createdAt && (
          <>
            {' '}
            <span className="text-xs text-gray-500">
              ({getRelativeTime(createdAt)})
            </span>
          </>
        )}
      </div>

      {/* Updated timestamp (only if different from created) */}
      {showUpdated && (
        <div>
          <span className="font-medium">Updated:</span>{' '}
          <time dateTime={updatedAt}>
            {formatDate(updatedAt)}
          </time>
          {' '}
          <span className="text-xs text-gray-500">
            ({getRelativeTime(updatedAt)})
          </span>
        </div>
      )}
    </div>
  );
};

export default EntryMetadata;
