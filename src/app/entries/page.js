/**
 * Entries Page
 * 
 * Main dashboard for logged-in users to view and manage their fasting entries.
 * This is the default landing page after successful authentication.
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render until we have a session
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name || session.user.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Track your fasting journey and monitor your progress.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {session.user.picture ? (
                <img 
                  src={session.user.picture} 
                  alt={session.user.name || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="w-16 h-16 rounded-full bg-green-500 items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-sm text-gray-600">{session.user.email}</p>
                {session.user.authMethod && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auth Method: {session.user.authMethod}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for future entries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Fasting Entries</h2>
          <div className="text-center py-12 text-gray-500">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium">No entries yet</h3>
            <p className="mt-1 text-sm">
              Get started by creating your first fasting entry.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
