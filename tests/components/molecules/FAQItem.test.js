/**
 * FAQItem Component Tests
 * Tests for the expandable FAQ question/answer molecule component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FAQItem from '@/components/molecules/FAQItem';

describe('FAQItem Component', () => {
  const mockQuestion = 'What is intermittent fasting?';
  const mockAnswer = 'Intermittent fasting is an eating pattern that cycles between periods of fasting and eating.';

  describe('Rendering', () => {
    it('should render question text', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      expect(screen.getByText(mockQuestion)).toBeInTheDocument();
    });

    it('should not show answer by default (uncontrolled)', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const answer = screen.queryByText(mockAnswer);
      expect(answer).not.toBeInTheDocument();
    });

    it('should show answer when isOpen is true (controlled)', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} isOpen={true} />);
      
      const answer = screen.getByText(mockAnswer);
      expect(answer).toBeVisible();
    });

    it('should render chevron icon', () => {
      const { container } = render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const chevron = container.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should toggle answer on click (uncontrolled)', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      
      // Initially closed
      expect(screen.queryByText(mockAnswer)).not.toBeInTheDocument();
      
      // Click to open
      fireEvent.click(button);
      expect(screen.getByText(mockAnswer)).toBeInTheDocument();
      
      // Click to close
      fireEvent.click(button);
      expect(screen.queryByText(mockAnswer)).not.toBeInTheDocument();
    });

    it('should call onToggle when clicked (controlled)', () => {
      const handleToggle = jest.fn();
      render(
        <FAQItem 
          question={mockQuestion} 
          answer={mockAnswer} 
          isOpen={false}
          onToggle={handleToggle}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should toggle on Enter key', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      
      // Press Enter to open
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(screen.getByText(mockAnswer)).toBeVisible();
    });

    it('should toggle on Space key', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      
      // Press Space to open
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(screen.getByText(mockAnswer)).toBeVisible();
    });

    it('should not toggle on other keys', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      
      // Press other keys
      fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
      
      // Should still be closed
      expect(screen.queryByText(mockAnswer)).not.toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('should rotate chevron when open', () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} isOpen={true} />
      );
      
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('rotate-180');
    });

    it('should not rotate chevron when closed', () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} isOpen={false} />
      );
      
      const chevron = container.querySelector('svg');
      expect(chevron).not.toHaveClass('rotate-180');
    });

    it('should apply transition classes to answer container when open', () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} isOpen={true} />
      );
      
      const answerContainer = container.querySelector('[id^="faq-answer-"]');
      expect(answerContainer).toHaveClass('transition-all', 'duration-300');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-expanded attribute when closed', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} isOpen={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper aria-expanded attribute when open', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} isOpen={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-controls pointing to answer element', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      const ariaControls = button.getAttribute('aria-controls');
      
      expect(ariaControls).toContain('faq-answer-');
    });

    it('should have aria-hidden on chevron icon', () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );
      
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard focusable', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FAQItem 
          question={mockQuestion} 
          answer={mockAnswer} 
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have hover styles', () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:text-primary-600');
    });

    it('should have purple text color for chevron', () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );
      
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('text-primary-500');
    });
  });
});
