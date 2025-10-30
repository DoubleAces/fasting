'use client';

import React from 'react';
import Image from 'next/image';
import GradientButton from '@/components/atoms/GradientButton';
import TrustBadge from '@/components/molecules/TrustBadge';
import trustIndicators from '@/lib/data/trustIndicators';
import ctaConfig from '@/lib/data/ctaConfig';

/**
 * Hero Component
 * 
 * The hero section that communicates the app's value proposition,
 * displays trust indicators, and provides primary CTAs.
 * 
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {string} [className] - Additional CSS classes
 */
const Hero = ({ isAuthenticated, className = '' }) => {
  // Get appropriate CTA text based on auth status
  const primaryCTA = isAuthenticated 
    ? ctaConfig.primary.authenticated 
    : ctaConfig.primary.unauthenticated;

  // Handle primary CTA click
  const handlePrimaryCTA = () => {
    window.location.href = primaryCTA.href;
  };

  // Handle secondary CTA click (scroll to section)
  const handleSecondaryCTA = () => {
    const targetElement = document.getElementById(ctaConfig.secondary.target.replace('#', ''));
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Don't show hero section for authenticated users - they should see their dashboard
  if (isAuthenticated) {
    return null;
  }

  return (
    <section className={`py-20 px-4 md:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Headline with gradient */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                The Simplest Way to Track Intermittent Fasting
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Join 10,000+ people who are transforming their health with effortless fasting tracking. 
              No complicated features—just simple, effective progress monitoring.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 items-center">
              <TrustBadge 
                indicator={trustIndicators.rating} 
                variant="inline"
                size="md"
              />
              <TrustBadge 
                indicator={trustIndicators.userCount} 
                variant="inline"
                size="md"
              />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <GradientButton
                onClick={handlePrimaryCTA}
                variant="primary"
                size="lg"
                ariaLabel={primaryCTA.ariaLabel}
              >
                {primaryCTA.text}
              </GradientButton>

              <GradientButton
                onClick={handleSecondaryCTA}
                variant="secondary"
                size="lg"
                ariaLabel={ctaConfig.secondary.ariaLabel}
              >
                {ctaConfig.secondary.text}
              </GradientButton>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500">
              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="text-6xl mb-4">⏱️</div>
                <div className="text-2xl font-bold mb-2">Fasting Timer</div>
                <div className="text-lg opacity-90">Track your progress with ease</div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm" />
              <div className="absolute bottom-8 left-8 w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm" />
            </div>
            {/* Decorative gradient blur */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
