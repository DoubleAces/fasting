/**
 * FAQList Organism Component
 * Search bar, filtered list, category sections, no results message
 */

'use client';

import { useState, useMemo } from 'react';
import SearchBar from '../molecules/SearchBar';
import FAQItem from '../molecules/FAQItem';

export default function FAQList({ faqs = [], className = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  // Filter FAQs based on search query
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqs;
    }

    const query = searchQuery.toLowerCase();
    
    return faqs
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.questions.length > 0);
  }, [faqs, searchQuery]);

  const totalQuestions = useMemo(() => {
    return filteredFaqs.reduce((sum, section) => sum + section.questions.length, 0);
  }, [filteredFaqs]);

  const handleToggle = (sectionIndex, questionIndex) => {
    const index = `${sectionIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar
          placeholder="Search questions..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        {searchQuery && (
          <p className="mt-3 text-sm text-gray-600">
            Found {totalQuestions} {totalQuestions === 1 ? 'question' : 'questions'}
          </p>
        )}
      </div>

      {/* No Results Message - Only show when actively searching */}
      {searchQuery && totalQuestions === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-soft text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any questions matching "{searchQuery}". Try different keywords or browse all categories.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-600 rounded-xl hover:scale-105 transition-transform duration-200"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* FAQ Sections */}
      {totalQuestions > 0 && (
        <div className="space-y-8">
          {filteredFaqs.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((faq, questionIndex) => {
                  const globalIndex = `${sectionIndex}-${questionIndex}`;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <FAQItem
                      key={questionIndex}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={isOpen}
                      onToggle={() => handleToggle(sectionIndex, questionIndex)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
