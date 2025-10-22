/**
 * Admin Dashboard Not Found Page
 * 
 * Custom 404 page for admin area routes.
 * Maintains admin layout for consistency.
 */

import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* 404 Icon */}
      <div className="text-6xl mb-6">🔍</div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        404 - Page Not Found
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md mb-8">
        The admin page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been created yet.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Dashboard
        </Link>
        
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
