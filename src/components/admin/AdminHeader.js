/**
 * AdminHeader Component
 * 
 * Header bar for admin area with user info display.
 */

import Image from 'next/image';

export default function AdminHeader({ user }) {
  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your application settings and content
        </p>
      </div>

      {/* User Info */}
      {user && (
        <div className="flex items-center gap-4">
          {/* User Details */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* User Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
            {user.picture ? (
              <Image
                src={user.picture}
                alt={user.name || 'User avatar'}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {getInitials(user.name)}
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
