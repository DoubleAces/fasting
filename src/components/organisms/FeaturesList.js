import React from 'react';
import FeatureCard from '@/components/molecules/FeatureCard';
import features from '@/lib/data/features';

/**
 * FeaturesList Component
 * 
 * Displays the Features Showcase section with 6 feature cards in a responsive grid.
 * Each card shows specific, measurable benefits with optional screenshots.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const FeaturesList = ({ className = '' }) => {
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  return (
    <section className={`relative py-20 px-4 md:px-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/40 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-gradient-to-tr from-pink-500/40 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 pb-2">
            Everything You Need to Track Intermittent Fasting
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Simple, powerful features designed for one thing: helping you build a consistent fasting habit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              showScreenshot={true}
              interactive={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesList;
