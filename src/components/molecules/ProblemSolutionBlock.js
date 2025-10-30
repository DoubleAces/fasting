import React from 'react';

/**
 * ProblemSolutionBlock Component
 * 
 * Displays a single problem/solution pair with icon.
 * Used in the Problem/Solution section to communicate how the app addresses user pain points.
 * 
 * @param {Object} problemSolution - The problem/solution data
 * @param {string} problemSolution.problem - User pain point (question format)
 * @param {string} problemSolution.solution - How the app solves it
 * @param {string} problemSolution.icon - Visual representation (emoji)
 * @param {string} [layout='vertical'] - Layout direction ('vertical' or 'horizontal')
 * @param {boolean} [animateOnScroll=true] - Animate when scrolled into view
 * @param {string} [className] - Additional CSS classes
 */
const ProblemSolutionBlock = ({ 
  problemSolution, 
  layout = 'vertical', 
  animateOnScroll = true,
  className = '' 
}) => {
  const { problem, solution, icon } = problemSolution;

  // Layout-specific classes
  const layoutClasses = layout === 'horizontal' 
    ? 'flex-row items-center text-left'
    : 'flex-col items-center text-center';

  return (
    <div 
      className={`flex ${layoutClasses} gap-4 p-6 ${className}`}
    >
      {/* Icon */}
      <div 
        className="text-4xl mb-2" 
        aria-hidden="true"
        role="img"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {/* Problem - Bold, larger text, question format */}
        <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
          {problem}
        </p>

        {/* Solution - Regular text, answer format */}
        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
          {solution}
        </p>
      </div>
    </div>
  );
};

export default ProblemSolutionBlock;
