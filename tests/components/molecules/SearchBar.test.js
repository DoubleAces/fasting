/**
 * SearchBar Component Tests
 * Tests for the FAQ search input molecule component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchBar from '@/components/molecules/SearchBar';

describe('SearchBar Component', () => {
  describe('Rendering', () => {
    it('should render with default placeholder', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      expect(input).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<SearchBar placeholder="Custom placeholder" />);
      
      const input = screen.getByPlaceholderText('Custom placeholder');
      expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
      const { container } = render(<SearchBar />);
      
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should have proper ARIA label', () => {
      render(<SearchBar />);
      
      const input = screen.getByLabelText('Search FAQ questions');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input Interaction', () => {
    it('should update value when typing', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(input, { target: { value: 'fasting' } });
      
      expect(input.value).toBe('fasting');
    });

    it('should call onChange callback when typing', () => {
      const handleChange = jest.fn();
      render(<SearchBar onChange={handleChange} />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(input, { target: { value: 'test query' } });
      
      expect(handleChange).toHaveBeenCalledWith('test query');
    });

    it('should accept controlled value prop', () => {
      render(<SearchBar value="preset value" />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      expect(input.value).toBe('preset value');
    });
  });

  describe('Clear Button', () => {
    it('should not show clear button when input is empty', () => {
      const { container } = render(<SearchBar />);
      
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should show clear button when input has value', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      const handleChange = jest.fn();
      render(<SearchBar onChange={handleChange} />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(input.value).toBe('');
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<SearchBar className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have purple focus ring classes', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      expect(input).toHaveClass('focus:ring-primary-500', 'focus:border-primary-500');
    });
  });

  describe('Accessibility', () => {
    it('should have proper input type', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should be keyboard navigable', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      input.focus();
      
      expect(document.activeElement).toBe(input);
    });

    it('should have accessible clear button', () => {
      render(<SearchBar />);
      
      const input = screen.getByPlaceholderText('Search questions...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveAttribute('type', 'button');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });
  });
});
