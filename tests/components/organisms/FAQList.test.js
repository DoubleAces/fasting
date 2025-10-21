/**
 * FAQList Component Tests
 * Tests for the FAQ list organism with search and filtering
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import FAQList from '@/components/organisms/FAQList';

describe('FAQList Component', () => {
  const mockFaqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'What is intermittent fasting?',
          answer: 'Intermittent fasting is an eating pattern.',
        },
        {
          question: 'How do I get started?',
          answer: 'Simply sign up for a free account.',
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Yes! We take your privacy seriously.',
        },
      ],
    },
  ];

  describe('Rendering', () => {
    it('should render search bar', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
    });

    it('should render all categories', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Account & Security')).toBeInTheDocument();
    });

    it('should render all questions', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      expect(screen.getByText('What is intermittent fasting?')).toBeInTheDocument();
      expect(screen.getByText('How do I get started?')).toBeInTheDocument();
      expect(screen.getByText('Is my data secure?')).toBeInTheDocument();
    });

    it('should render with empty faqs array', () => {
      render(<FAQList faqs={[]} />);
      
      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
      expect(screen.getByText('No questions found')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter questions based on search query', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'secure' } });
      
      // Should show matching question
      expect(screen.getByText('Is my data secure?')).toBeInTheDocument();
      
      // Should not show non-matching questions
      expect(screen.queryByText('What is intermittent fasting?')).not.toBeInTheDocument();
      expect(screen.queryByText('How do I get started?')).not.toBeInTheDocument();
    });

    it('should search in question text', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'intermittent' } });
      
      expect(screen.getByText('What is intermittent fasting?')).toBeInTheDocument();
    });

    it('should search in answer text', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'privacy' } });
      
      expect(screen.getByText('Is my data secure?')).toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'FASTING' } });
      
      expect(screen.getByText('What is intermittent fasting?')).toBeInTheDocument();
    });

    it('should show result count when searching', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'secure' } });
      
      expect(screen.getByText('Found 1 question')).toBeInTheDocument();
    });

    it('should show plural result count', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'is' } }); // Matches "What IS fasting" and "IS my data secure"
      
      expect(screen.getByText(/Found 2 questions/)).toBeInTheDocument();
    });

    it('should clear search and show all questions', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      
      // Search for something specific
      fireEvent.change(searchInput, { target: { value: 'secure' } });
      expect(screen.queryByText('What is intermittent fasting?')).not.toBeInTheDocument();
      
      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // All questions should be visible again
      expect(screen.getByText('What is intermittent fasting?')).toBeInTheDocument();
      expect(screen.getByText('How do I get started?')).toBeInTheDocument();
      expect(screen.getByText('Is my data secure?')).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('should show no results message when search has no matches', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent query xyz' } });
      
      expect(screen.getByText('No questions found')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find any questions matching/)).toBeInTheDocument();
    });

    it('should show search query in no results message', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });
      
      expect(screen.getByText(/"xyz123"/)).toBeInTheDocument();
    });

    it('should have clear search button in no results state', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      const clearButton = screen.getByText('Clear Search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button clicked', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      const clearButton = screen.getByText('Clear Search');
      fireEvent.click(clearButton);
      
      // Should show all questions again
      expect(screen.getByText('What is intermittent fasting?')).toBeInTheDocument();
      expect(screen.queryByText('No questions found')).not.toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should only show categories with matching questions', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'secure' } });
      
      // Should show matching category
      expect(screen.getByText('Account & Security')).toBeInTheDocument();
      
      // Should not show non-matching category
      expect(screen.queryByText('Getting Started')).not.toBeInTheDocument();
    });

    it('should filter entire sections when no questions match', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(searchInput, { target: { value: 'intermittent' } });
      
      // Only Getting Started section should be visible
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.queryByText('Account & Security')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand and collapse FAQ items', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const questionButton = screen.getByText('What is intermittent fasting?');
      
      // Click to expand
      fireEvent.click(questionButton);
      expect(screen.getByText('Intermittent fasting is an eating pattern.')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(questionButton);
      expect(screen.queryByText('Intermittent fasting is an eating pattern.')).not.toBeInTheDocument();
    });

    it('should only have one FAQ open at a time', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const question1 = screen.getByText('What is intermittent fasting?');
      const question2 = screen.getByText('How do I get started?');
      
      // Open first question
      fireEvent.click(question1);
      expect(screen.getByText('Intermittent fasting is an eating pattern.')).toBeInTheDocument();
      
      // Open second question
      fireEvent.click(question2);
      expect(screen.getByText('Simply sign up for a free account.')).toBeInTheDocument();
      
      // First should be closed
      expect(screen.queryByText('Intermittent fasting is an eating pattern.')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<FAQList faqs={mockFaqs} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have shadow and rounded corners on FAQ sections', () => {
      const { container } = render(<FAQList faqs={mockFaqs} />);
      
      const sections = container.querySelectorAll('.shadow-soft');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have searchable input with proper label', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByLabelText('Search FAQ questions');
      expect(searchInput).toBeInTheDocument();
    });

    it('should maintain focus management', () => {
      render(<FAQList faqs={mockFaqs} />);
      
      const searchInput = screen.getByPlaceholderText('Search questions...');
      searchInput.focus();
      
      expect(document.activeElement).toBe(searchInput);
    });
  });
});
