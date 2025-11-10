'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * AchievementsLayout Component
 * 
 * Navigation wrapper for achievement management pages
 * Provides tabs for List, Translations, and Analytics views
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Layout with tab navigation
 */
export default function AchievementsLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'List', href: '/admin/achievements', exact: true },
    { name: 'Translations', href: '/admin/achievements/translations' },
    { name: 'Analytics', href: '/admin/achievements/analytics' }
  ];

  const isActive = (tab) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname.startsWith(tab.href);
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Achievement tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                ${
                  isActive(tab)
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              `}
              aria-current={isActive(tab) ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
