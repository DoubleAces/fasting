/**
 * FAQItem Molecule Component
 * Expandable question/answer with smooth animation and keyboard navigation
 */

'use client';

import { useState } from 'react';

export default function FAQItem({ 
  question, 
  answer, 
  isOpen: controlledIsOpen,
  onToggle,
  className = ''
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleKeyDown = (e) => {
    // Support Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`border-b border-gray-200 last:border-0 pb-4 last:pb-0 ${className}`}>
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full text-left flex items-center justify-between py-4 text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:text-primary-600 cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.substring(0, 20)}`}
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 text-primary-500 transform transition-transform duration-200 flex-shrink-0 ml-4 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {/* Answer with smooth height animation */}
      {isOpen && (
        <div
          id={`faq-answer-${question.substring(0, 20)}`}
          className="overflow-hidden transition-all duration-300 ease-in-out animate-fade-in"
        >
          <div className="pb-4 pr-12">
            <p className="text-gray-600 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
