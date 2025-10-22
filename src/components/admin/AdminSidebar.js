/**
 * AdminSidebar Component
 * 
 * Fixed sidebar navigation for admin area.
 * Displays admin branding and navigation links.
 */

import Link from 'next/link';
import { LayoutDashboard, Users, Settings, FileText } from 'lucide-react';

export default function AdminSidebar() {
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
      aria-label="Admin Sidebar"
    >
      {/* Admin Branding */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-blue-400">Admin Area</h1>
        <p className="text-sm text-gray-400 mt-1">Dashboard Management</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
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
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.comingSoon && (
                  <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm">Back to Site</span>
        </Link>
      </div>
    </nav>
  );
}
