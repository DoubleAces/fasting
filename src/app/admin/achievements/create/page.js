'use client';

import AchievementsLayout from '@/components/admin/achievements/AchievementsLayout';
import AchievementForm from '@/components/admin/achievements/AchievementForm';
import AchievementPreview from '@/components/admin/achievements/AchievementPreview';
import Link from 'next/link';

/**
 * Create Achievement Page
 * 
 * Admin page for creating new achievements using multi-step form
 * 
 * @returns {JSX.Element} Create achievement page
 */
export default function CreateAchievementPage() {
  return (
    <AchievementsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Achievement</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add a new achievement to the system
            </p>
          </div>
          <Link
            href="/admin/achievements"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>

        {/* Form + Preview Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <AchievementForm mode="create" />
          </div>

          {/* Preview - Takes 1 column on large screens, stacks below on mobile */}
          <div className="lg:col-span-1">
            <AchievementPreview />
          </div>
        </div>
      </div>
    </AchievementsLayout>
  );
}
