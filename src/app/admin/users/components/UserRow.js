/**
 * UserRow Component
 * 
 * Displays a single user's data in a table row:
 * - Name (with avatar placeholder)
 * - Email
 * - Registration Date (formatted dd.mm.yyyy HH:ii)
 * - Last Login (formatted dd.mm.yyyy HH:ii or "Never")
 * - Admin Status (badge)
 * - Actions (placeholder buttons for toggle/delete - implemented in Phase 4-5)
 * 
 * Features:
 * - Highlights current user's row with distinct background
 * - Uses date formatter utility for consistent formatting
 * - Accessible with semantic HTML
 * - Responsive layout (stacks on small screens)
 * 
 * Accessibility:
 * - Semantic table row structure
 * - Clear visual distinction for current user
 * - Badge has accessible styling
 */

'use client';

import { formatDateTime } from '@/lib/utils/dateFormatter';
import AdminToggle from './AdminToggle';
import DeleteUserButton from './DeleteUserButton';
import BackfillAchievementsButton from './BackfillAchievementsButton';

/**
 * UserRow component
 * 
 * @param {Object} props
 * @param {Object} props.user - User object
 * @param {string} props.user._id - User ID
 * @param {string} props.user.name - User name
 * @param {string} props.user.email - User email
 * @param {Date} props.user.registrationDate - Registration date
 * @param {Date} props.user.lastLogin - Last login date (can be null)
 * @param {boolean} props.user.isAdmin - Admin status
 * @param {boolean} props.isCurrentUser - Whether this is the logged-in user
 * @param {Function} props.onRefresh - Callback to refresh user list after toggle
 */
export default function UserRow({ user, isCurrentUser, onRefresh }) {
  // ========================================================================
  // DATA FORMATTING
  // ========================================================================

  const registrationDate = formatDateTime(user.registrationDate);
  const lastLogin = user.lastLogin ? formatDateTime(user.lastLogin) : 'Never';

  // Get initials for avatar placeholder
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <tr
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isCurrentUser ? 'bg-blue-50 hover:bg-blue-100' : ''
      }`}
    >
      {/* Name Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {/* Avatar Placeholder */}
          <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          {/* Name */}
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name || 'No name'}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-blue-600 font-semibold">
                  (You)
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Email Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>

      {/* Registration Date Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{registrationDate}</div>
      </td>

      {/* Last Login Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{lastLogin}</div>
      </td>

      {/* Admin Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        {user.isAdmin ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Admin
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            User
          </span>
        )}
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {/* Backfill Achievements Button */}
          <BackfillAchievementsButton
            userId={user._id}
            userName={user.name || user.email}
            onBackfillSuccess={onRefresh}
          />

          {/* Toggle Admin Button */}
          <AdminToggle
            userId={user._id}
            userName={user.name || user.email}
            isAdmin={user.isAdmin}
            isCurrentUser={isCurrentUser}
            onToggleSuccess={onRefresh}
          />

          {/* Delete User Button */}
          <DeleteUserButton
            userId={user._id}
            userName={user.name || user.email}
            isCurrentUser={isCurrentUser}
            onDeleteSuccess={onRefresh}
          />
        </div>
      </td>
    </tr>
  );
}
