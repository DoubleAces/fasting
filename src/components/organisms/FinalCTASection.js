'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import GradientButton from '@/components/atoms/GradientButton';

/**
 * FinalCTASection Component (Organism)
 * 
 * Displays the final call-to-action section with compelling copy and dual CTAs.
 * Auth-aware: shows "Start Tracking" for guests, "Go to Dashboard" for authenticated users.
 * 
 * Design: Purple-pink gradient background, white text, centered layout.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const FinalCTASection = ({ className = '' }) => {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  // For authenticated users, show a motivational section instead of signup CTAs
  if (isAuthenticated) {
    return (
      <section className={`py-20 px-4 md:px-8 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 ${className}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Keep Up Your Fasting Streak! 💪
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Every fast brings you closer to your health goals. 
            Stay consistent and watch your progress compound over time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Go to Entries */}
            <GradientButton
              href="/entries"
              variant="primary"
              size="large"
              className="!bg-white !text-purple-600 hover:!bg-gray-50 shadow-xl !bg-gradient-to-r from-white to-white"
            >
              View Your Fasts
            </GradientButton>

            {/* Learn More */}
            <GradientButton
              href="https://www.healthline.com/nutrition/intermittent-fasting-guide"
              variant="secondary"
              size="large"
              className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white/10"
            >
              Learn More About Fasting
            </GradientButton>
          </div>

          <p className="text-sm text-white/70 mt-8">
            🔥 Consistency is key — Track every fast, celebrate every win.
          </p>
        </div>
      </section>
    );
  }

  // For unauthenticated users, show the signup CTA
  return (
    <section className={`py-20 px-4 md:px-8 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Build Your Fasting Habit?
        </h2>
        
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of users who are transforming their health with intermittent fasting. 
          Start tracking today — it's free forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA - Signup */}
          <GradientButton
            href="/register"
            variant="secondary"
            size="large"
            className="bg-white text-purple-600 hover:bg-gray-50 shadow-xl"
          >
            Start Tracking Free
          </GradientButton>

          {/* Secondary CTA - Educational resource */}
          <GradientButton
            href="https://www.healthline.com/nutrition/intermittent-fasting-guide"
            variant="outline"
            size="large"
            className="border-2 border-white text-white hover:bg-white/10"
          >
            Learn About Intermittent Fasting
          </GradientButton>
        </div>

        <p className="text-sm text-white/70 mt-8">
          No credit card required. No ads. No data selling.
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
