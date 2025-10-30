import React from 'react';
import ProblemSolutionBlock from '@/components/molecules/ProblemSolutionBlock';
import problemsSolutions from '@/lib/data/problemsSolutions';

/**
 * ProblemSolutionSection Component
 * 
 * Displays the Problem/Solution section showing user pain points and how the app addresses them.
 * Renders 3 problem/solution pairs in a responsive grid.
 * 
 * @param {string} [className] - Additional CSS classes
 */
const ProblemSolutionSection = ({ className = '' }) => {
  // Sort by order to ensure consistent display
  const sortedProblems = [...problemsSolutions].sort((a, b) => a.order - b.order);

  return (
    <section className={`relative py-20 px-4 md:px-8 bg-gradient-to-b from-white via-purple-50/50 to-purple-100 overflow-hidden ${className}`}>
      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-purple-300/50 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-[400px] h-[400px] bg-pink-300/50 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent pb-2">
            Why Fasting Tracker?
          </h2>
        </div>

        {/* Problem/Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProblems.map((problemSolution) => (
            <ProblemSolutionBlock
              key={problemSolution.id}
              problemSolution={problemSolution}
              layout="vertical"
              animateOnScroll={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
