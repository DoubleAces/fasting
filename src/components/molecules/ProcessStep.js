import React from 'react';
import Image from 'next/image';

/**
 * ProcessStep Component (Molecule)
 * 
 * Displays a single step in the "How It Works" process.
 * Shows step number, title, description, and optional screenshot.
 * 
 * @param {Object} step - The step data
 * @param {number} step.number - Step number (1, 2, 3)
 * @param {string} step.title - Step title
 * @param {string} step.description - Step description
 * @param {string} [step.screenshot] - Optional screenshot path
 * @param {boolean} [showScreenshot=true] - Whether to display screenshot
 * @param {string} [className] - Additional CSS classes
 */
const ProcessStep = ({ 
  step, 
  showScreenshot = true, 
  className = '' 
}) => {
  const { number, title, description, screenshot } = step;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Screenshot (conditional) */}
      {screenshot && showScreenshot && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          {/* Placeholder content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-6xl font-bold mb-3">{number}</div>
            <div className="text-xl font-semibold">{title}</div>
            <div className="text-sm opacity-90 mt-2">Step Preview</div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm" />
          <div className="absolute bottom-6 left-6 w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Step Number */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <span className="text-2xl font-bold">{number}</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ProcessStep;
