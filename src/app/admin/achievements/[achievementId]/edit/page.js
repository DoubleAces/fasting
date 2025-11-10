'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import AchievementsLayout from '@/components/admin/achievements/AchievementsLayout';
import AchievementForm from '@/components/admin/achievements/AchievementForm';
import AchievementPreview from '@/components/admin/achievements/AchievementPreview';
import { useToast } from '@/components/common/Toast';
import Link from 'next/link';

/**
 * Edit Achievement Page
 * 
 * Admin page for editing existing achievements
 * Fetches achievement data and pre-populates the form
 * 
 * @param {Object} params - Route parameters (Promise in Next.js 15+)
 * @param {string} params.achievementId - Achievement ID to edit
 * @returns {JSX.Element} Edit achievement page
 */
export default function EditAchievementPage({ params }) {
  const router = useRouter();
  const { error: showError } = useToast();
  const { achievementId } = use(params); // Unwrap params Promise for Next.js 15+
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`/api/admin/achievements/${achievementId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Achievement not found');
          }
          throw new Error('Failed to load achievement');
        }

        const data = await response.json();
        
        // Map achievement data to form format (flattened structure)
        const formData = {
          achievementId: data.achievement.achievementId,
          name: data.achievement.translations?.en?.name || '',
          description: data.achievement.translations?.en?.description || '',
          iconUrl: data.achievement.translations?.en?.iconUrl || '',
          criteria: {
            type: data.achievement.criteria?.type || 'duration-milestone',
            // For custom type, extract requirement; for others, extract value
            ...(data.achievement.criteria?.type === 'custom' 
              ? { requirement: data.achievement.criteria?.params?.requirement || '' }
              : { 
                  value: data.achievement.criteria?.params?.value || 1,
                  description: data.achievement.criteria?.params?.description || ''
                }
            )
          },
          category: data.achievement.category || 'getting-started',
          tier: data.achievement.tier || 'bronze',
          rarity: {
            score: data.achievement.rarity?.score || data.achievement.points || 10
          },
          order: data.achievement.order || 999,
          isActive: data.achievement.isActive !== undefined ? data.achievement.isActive : true,
          isSecret: data.achievement.isSecret !== undefined ? data.achievement.isSecret : false,
          type: data.achievement.type || 'automatic'
        };

        setInitialData(formData);
      } catch (err) {
        setError(err.message);
        showError(err.message || 'Failed to load achievement');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [achievementId, showError]);

  if (loading) {
    return (
      <AchievementsLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading achievement...</p>
          </div>
        </div>
      </AchievementsLayout>
    );
  }

  if (error) {
    return (
      <AchievementsLayout>
        <div className="space-y-6">
          {/* Error State */}
          <div className="bg-red-50 border border-red-200 rounded-md p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading achievement</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/achievements')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AchievementsLayout>
    );
  }

  return (
    <AchievementsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Achievement</h1>
            <p className="mt-1 text-sm text-gray-600">
              Modify achievement: <span className="font-medium text-gray-900">{achievementId}</span>
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
            <AchievementForm mode="edit" initialData={initialData} />
          </div>

          {/* Preview - Takes 1 column on large screens, stacks below on mobile */}
          <div className="lg:col-span-1">
            <AchievementPreview data={initialData} />
          </div>
        </div>
      </div>
    </AchievementsLayout>
  );
}
