'use client';

/**
 * Dashboard Error Boundary
 * 
 * Handles errors that occur during dashboard data fetching or rendering.
 * Displays user-friendly error message with retry functionality.
 */

import { useEffect } from 'react';
import GlassmorphicCard from '@/components/atoms/GlassmorphicCard';
import GradientButton from '@/components/atoms/GradientButton';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log error for debugging (not exposed to user)
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4 overflow-hidden">
      {/* Decorative blur orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-500/30 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto mt-20">
        <GlassmorphicCard className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading your dashboard. This might be a temporary issue.
          </p>
          <div className="flex gap-4 justify-center">
            <GradientButton
              onClick={reset}
              aria-label="Try loading dashboard again"
            >
              Try Again
            </GradientButton>
            <GradientButton
              href="/entries"
              variant="secondary"
              aria-label="Go to entries page"
            >
              Go to Entries
            </GradientButton>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}
