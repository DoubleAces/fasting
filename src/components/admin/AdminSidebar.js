/**
 * AdminSidebar Component
 * 
 * Fixed sidebar navigation for admin area.
 * Displays user info and navigation links.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object from session
 * @param {string} props.user.name - User's display name
 * @param {string} props.user.email - User's email address
 * @param {string} [props.user.picture] - User's profile picture URL (optional)
 * @returns {JSX.Element} Sidebar navigation component
 */

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Settings, FileText } from 'lucide-react';

export default function AdminSidebar({ user }) {
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      comingSoon: true,
    },
    {
      name: 'Content',
      href: '/dashboard/content',
      icon: FileText,
      comingSoon: true,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      comingSoon: true,
    },
  ];

  return (
    <nav
      className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col"
      aria-label="Admin navigation"
    >
      {/* User Info */}
      <div className="p-6 border-b border-gray-800" aria-label="Admin user information">
        <div className="flex items-center gap-3">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2" role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.comingSoon
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={(e) => item.comingSoon && e.preventDefault()}
                aria-label={item.comingSoon ? `${item.name} (coming soon)` : item.name}
                aria-disabled={item.comingSoon ? 'true' : undefined}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">{item.name}</span>
                {item.comingSoon && (
                  <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded" aria-hidden="true">
                    Soon
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Return to public website"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm">Back to Site</span>
        </Link>
      </div>
    </nav>
  );
}
