/**
 * TermsCheckbox Component Tests
 * 
 * User Story 1B: As a new user registering, I want to be required to accept
 * the terms and conditions so that I understand my agreement.
 * 
 * FR-005: Terms acceptance checkbox must be present on registration form
 * FR-006: Registration blocked until terms accepted
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TermsCheckbox from '@/components/molecules/TermsCheckbox';

describe('TermsCheckbox Component', () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render checkbox with label', () => {
    render(<TermsCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    // Label should contain text about accepting terms
    expect(screen.getByText(/I have read and agree to the/i)).toBeInTheDocument();
  });

  it('should render link to terms page', () => {
    render(<TermsCheckbox {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Terms and Conditions/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/terms');
  });

  it('should open terms link in new tab', () => {
    render(<TermsCheckbox {...defaultProps} />);

    const link = screen.getByRole('link', { name: /Terms and Conditions/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should show checked state when checked prop is true', () => {
    render(<TermsCheckbox {...defaultProps} checked={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onChange when checkbox is clicked', () => {
    const handleChange = jest.fn();
    render(<TermsCheckbox {...defaultProps} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'You must accept the terms and conditions';
    render(<TermsCheckbox {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Error message should have error styling
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toHaveClass('text-red-600');
  });

  it('should not display error message when error prop is null', () => {
    render(<TermsCheckbox {...defaultProps} error={null} />);

    const errorMessages = screen.queryByText(/must accept/i);
    expect(errorMessages).not.toBeInTheDocument();
  });

  it('should have required attribute on checkbox', () => {
    render(<TermsCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
  });

  it('should have accessible label association', () => {
    render(<TermsCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    
    // Checkbox should be associated with label
    expect(checkbox).toHaveAccessibleName(/I have read and agree/i);
  });

  it('should apply error styling to checkbox when error exists', () => {
    render(<TermsCheckbox {...defaultProps} error="Error message" />);

    const checkbox = screen.getByRole('checkbox');
    const parentLabel = checkbox.closest('label');
    
    // Label or container should have error styling
    expect(parentLabel).toHaveClass('text-red-600');
  });

  it('should support dark mode styling', () => {
    const { container } = render(<TermsCheckbox {...defaultProps} />);

    // Should have dark mode classes
    const label = container.querySelector('label');
    expect(label?.className).toMatch(/dark:/);
  });

  it('should be keyboard accessible', () => {
    const handleChange = jest.fn();
    render(<TermsCheckbox {...defaultProps} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    
    // Focus the checkbox
    checkbox.focus();
    expect(checkbox).toHaveFocus();
    
    // Press space to toggle
    fireEvent.keyDown(checkbox, { key: ' ', code: 'Space' });
    
    // onChange should be called (browser behavior simulated by Testing Library)
  });

  it('should prevent form submission when not checked', () => {
    render(<TermsCheckbox {...defaultProps} checked={false} />);

    const checkbox = screen.getByRole('checkbox');
    
    // Required checkbox that's not checked should prevent form submission
    expect(checkbox).toBeRequired();
    expect(checkbox).not.toBeChecked();
  });
});
