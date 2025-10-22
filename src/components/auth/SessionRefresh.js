/**
 * SessionRefresh Component
 * 
 * Polls the session to detect admin privilege changes.
 * Only polls when user is authenticated (not on every page).
 * 
 * Performance:
 * - Refetch interval: 5 seconds
 * - Only for authenticated users
 * - Uses SWR's built-in deduplication
 * 
 * Note: The "GET /api/auth/session" logs in terminal are normal - 
 * they just show the polling is working. Not an error.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * SessionRefresh component
 * 
 * Polls session to keep admin privileges up-to-date.
 * The terminal logs "GET /api/auth/session 200" are normal.
 */
export default function SessionRefresh() {
  const { status, update } = useSession({
    // Refetch session every 5 seconds for admin privilege updates
    refetchInterval: 5000,
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
  });

  // Force initial update when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      update();
    }
  }, [status, update]);

  return null;
}
