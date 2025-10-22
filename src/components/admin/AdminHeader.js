/**
 * AdminHeader Component
 * 
 * Minimal header bar for admin area.
 * Shows page title and link to return to public site.
 * 
 * @returns {JSX.Element} Header component with dashboard title and public site link
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6" role="banner">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Navigate to public website"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>View Public Site</span>
        </Link>
      </div>
    </header>
  );
}
