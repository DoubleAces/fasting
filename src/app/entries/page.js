/**
 * Entries Page
 * 
 * Main dashboard for logged-in users to view and manage their fasting entries.
 * This is the default landing page after successful authentication.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/atoms/LogoutButton';

export const metadata = {
  title: 'My Entries - Fasting Tracker',
  description: 'View and manage your fasting entries',
};

export default async function EntriesPage() {
  // Get the current session
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user.name || session.user.email}!
            </h1>
            <p className="mt-2 text-gray-600">
              Track your fasting journey and monitor your progress.
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {session.user.picture && (
                <img 
                  src={session.user.picture} 
                  alt={session.user.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-sm text-gray-600">{session.user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Auth Method: {session.user.authMethod || 'email'}
                </p>
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
