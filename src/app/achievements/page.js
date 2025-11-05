/**
 * Achievements Page
 * 
 * Displays user's achievement progress and browseable achievement catalog.
 * Features:
 * - Personal progress summary
 * - Category filtering
 * - Unlocked/locked achievement display
 * - Achievement details on click
 */

'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch achievements
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAchievements();
    }
  }, [status, selectedCategory, selectedStatus]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      params.append('sort', 'dateUnlocked');
      
      const response = await fetch(`/api/user/achievements?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data.achievements || []);
      setSummary(data.summary || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'duration', label: 'Duration' },
    { value: 'streak', label: 'Streak' },
    { value: 'goal', label: 'Goals' },
    { value: 'consistency', label: 'Consistency' },
    { value: 'special', label: 'Special' }
  ];

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Achievements</h1>
          <p className="text-gray-600">Track your fasting milestones and unlock badges</p>
        </div>

        {/* Progress Summary */}
        {summary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{summary.unlockedCount}</div>
                <div className="text-sm text-green-600">Unlocked</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-700">{summary.lockedCount}</div>
                <div className="text-sm text-gray-600">Locked</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{summary.totalPoints}</div>
                <div className="text-sm text-blue-600">Total Points</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round((summary.unlockedCount / summary.totalAchievements) * 100)}%
                </div>
                <div className="text-sm text-purple-600">Completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Achievements</option>
                <option value="unlocked">Unlocked Only</option>
                <option value="locked">Locked Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Achievements Grid */}
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.achievementId}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all hover:shadow-md ${
                  achievement.userProgress.isUnlocked
                    ? 'border-green-300'
                    : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Achievement Icon/Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-4xl p-3 rounded-full"
                    style={{ backgroundColor: achievement.iconColor + '20' }}
                  >
                    {achievement.icon}
                  </div>
                  {achievement.userProgress.isUnlocked && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Unlocked
                    </span>
                  )}
                </div>

                {/* Achievement Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.name}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`px-2 py-1 rounded-full border font-medium ${
                      rarityColors[achievement.rarity]
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                  <span className="font-bold text-gray-700">{achievement.points} pts</span>
                </div>

                {/* Unlock Date */}
                {achievement.userProgress.isUnlocked && achievement.userProgress.unlockedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Unlocked: {new Date(achievement.userProgress.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Locked Message */}
                {!achievement.userProgress.isUnlocked && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 italic">🔒 Keep fasting to unlock!</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">Start logging your fasting entries to unlock achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
}
