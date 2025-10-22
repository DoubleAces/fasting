/**
 * Access Denied Page
 * 
 * Shown when non-admin users attempt to access admin area.
 * Provides clear messaging and navigation options.
 */

import Link from 'next/link';

export const metadata = {
  title: 'Access Denied | Fasting Tracker',
  description: 'You do not have permission to access this area',
};

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">🚫</div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          You do not have administrator privileges to access this area. 
          This section is restricted to users with admin access.
        </p>

        {/* Additional Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            If you believe you should have access to this area, please contact 
            your system administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Homepage
          </Link>
          
          <Link
            href="/entries"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go to Your Entries
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact support at{' '}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
