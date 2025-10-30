import React from 'react';
import ProcessStep from '@/components/molecules/ProcessStep';
import processSteps from '@/lib/data/processSteps';

/**
 * HowItWorksSection Component (Organism)
 * 
 * Displays the "How It Works" section with a 3-step process.
 * Shows clear, linear progression from goal-setting to habit-building.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const HowItWorksSection = ({ className = '' }) => {
  return (
    <section id="how-it-works" className={`relative py-20 px-4 md:px-8 bg-gradient-to-b from-white to-indigo-100 overflow-hidden ${className}`}>
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #9333EA 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px'
      }} />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 right-10 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400/40 to-purple-400/40 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 pb-2">
            How It Works
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Start tracking your intermittent fasting in three simple steps. No learning curve, no complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {processSteps.map((step) => (
            <ProcessStep
              key={step.id}
              step={step}
              showScreenshot={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
