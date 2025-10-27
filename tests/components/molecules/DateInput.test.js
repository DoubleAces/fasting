/**
 * DateInput Component Tests
 * 
 * Tests for the DateInput molecule component that provides
 * separate day/month/year input fields for date entry.
 * 
 * Test Coverage:
 * - Rendering (label, three input fields, placeholders)
 * - ISO date parsing (yyyy-mm-dd to day/month/year)
 * - User input (typing in each field)
 * - ISO date conversion (day/month/year to yyyy-mm-dd)
 * - onChange callback (called with ISO date string)
 * - Input validation (numeric only, max lengths)
 * - Complete date detection (only calls onChange when complete)
 * - Empty date handling
 * - onBlur callback
 * - Error display
 * - Accessibility (labels, aria attributes)
 * - Value updates (external prop changes)
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInput from '@/components/molecules/DateInput';

describe('DateInput Component', () => {
  const defaultProps = {
    id: 'test-date',
    label: 'Date',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // OLD TESTS - Temporarily skipped during HTML5 refactor
  // These tests were for the old 3-field (day/month/year) implementation
  // They will be removed or updated after HTML5 implementation is complete
  describe.skip('Rendering', () => {
    it('should render label with correct text', () => {
      render(<DateInput {...defaultProps} label="Entry Date" />);
      
      expect(screen.getByText('Entry Date')).toBeInTheDocument();
    });

    it('should render three input fields', () => {
      render(<DateInput {...defaultProps} />);
      
      expect(screen.getByLabelText(/day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    });

    it('should have correct placeholders', () => {
      render(<DateInput {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('DD')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('YYYY')).toBeInTheDocument();
    });

    it('should render separators between fields', () => {
      const { container } = render(<DateInput {...defaultProps} />);
      
      const separators = container.querySelectorAll('span[aria-hidden="true"]');
      expect(separators).toHaveLength(2);
      expect(separators[0]).toHaveTextContent('/');
      expect(separators[1]).toHaveTextContent('/');
    });

    it('should show required indicator when required', () => {
      render(<DateInput {...defaultProps} required />);
      
      expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
    });

    it('should not show required indicator when not required', () => {
      render(<DateInput {...defaultProps} required={false} />);
      
      expect(screen.queryByLabelText(/required/i)).not.toBeInTheDocument();
    });
  });

  describe.skip('ISO Date Parsing', () => {
    it('should parse ISO date into day/month/year fields', () => {
      render(<DateInput {...defaultProps} value="2024-03-15" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('15');
      expect(screen.getByLabelText(/month/i)).toHaveValue('03');
      expect(screen.getByLabelText(/year/i)).toHaveValue('2024');
    });

    it('should handle single digit day', () => {
      render(<DateInput {...defaultProps} value="2024-12-05" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('05');
    });

    it('should handle single digit month', () => {
      render(<DateInput {...defaultProps} value="2024-01-25" />);
      
      expect(screen.getByLabelText(/month/i)).toHaveValue('01');
    });

    it('should handle empty value', () => {
      render(<DateInput {...defaultProps} value="" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('');
      expect(screen.getByLabelText(/month/i)).toHaveValue('');
      expect(screen.getByLabelText(/year/i)).toHaveValue('');
    });

    it('should handle undefined value', () => {
      render(<DateInput {...defaultProps} value={undefined} />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('');
      expect(screen.getByLabelText(/month/i)).toHaveValue('');
      expect(screen.getByLabelText(/year/i)).toHaveValue('');
    });
  });

  describe.skip('User Input - Day Field', () => {
    it('should allow typing in day field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.type(dayInput, '15');
      
      expect(dayInput).toHaveValue('15');
    });

    it('should only accept numeric characters in day field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.type(dayInput, 'abc123xyz');
      
      expect(dayInput).toHaveValue('12');
    });

    it('should limit day field to 2 characters', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.type(dayInput, '12345');
      
      expect(dayInput).toHaveValue('12');
    });

    it('should call onChange with ISO date when day completes valid date', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="2024-03-00" onChange={handleChange} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.clear(dayInput);
      await user.type(dayInput, '15');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });

    it('should not call onChange when day is incomplete', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.type(dayInput, '1');
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe.skip('User Input - Month Field', () => {
    it('should allow typing in month field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const monthInput = screen.getByLabelText(/month/i);
      await user.type(monthInput, '03');
      
      expect(monthInput).toHaveValue('03');
    });

    it('should only accept numeric characters in month field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const monthInput = screen.getByLabelText(/month/i);
      await user.type(monthInput, 'abc456xyz');
      
      expect(monthInput).toHaveValue('45');
    });

    it('should limit month field to 2 characters', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const monthInput = screen.getByLabelText(/month/i);
      await user.type(monthInput, '12345');
      
      expect(monthInput).toHaveValue('12');
    });

    it('should call onChange with ISO date when month completes valid date', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="2024-00-15" onChange={handleChange} />);
      
      const monthInput = screen.getByLabelText(/month/i);
      await user.clear(monthInput);
      await user.type(monthInput, '03');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });
  });

  describe.skip('User Input - Year Field', () => {
    it('should allow typing in year field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.type(yearInput, '2024');
      
      expect(yearInput).toHaveValue('2024');
    });

    it('should only accept numeric characters in year field', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.type(yearInput, 'abc2024xyz');
      
      expect(yearInput).toHaveValue('2024');
    });

    it('should limit year field to 4 characters', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.type(yearInput, '20241234');
      
      expect(yearInput).toHaveValue('2024');
    });

    it('should call onChange with ISO date when year completes valid date', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="0000-03-15" onChange={handleChange} />);
      
      const yearInput = screen.getByLabelText(/year/i);
      await user.clear(yearInput);
      await user.type(yearInput, '2024');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });

    it('should not call onChange when year is less than 4 digits', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      const monthInput = screen.getByLabelText(/month/i);
      const yearInput = screen.getByLabelText(/year/i);
      
      await user.type(dayInput, '15');
      await user.type(monthInput, '03');
      await user.type(yearInput, '202');
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe.skip('Complete Date Entry', () => {
    it('should call onChange with ISO date when all fields are filled', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/day/i), '15');
      await user.type(screen.getByLabelText(/month/i), '03');
      await user.type(screen.getByLabelText(/year/i), '2024');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });

    it('should pad single digit day with zero', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/day/i), '5');
      await user.type(screen.getByLabelText(/month/i), '12');
      await user.type(screen.getByLabelText(/year/i), '2024');
      
      expect(handleChange).toHaveBeenCalledWith('2024-12-05');
    });

    it('should pad single digit month with zero', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/day/i), '25');
      await user.type(screen.getByLabelText(/month/i), '1');
      await user.type(screen.getByLabelText(/year/i), '2024');
      
      expect(handleChange).toHaveBeenCalledWith('2024-01-25');
    });

    it('should handle date entry in different order', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/year/i), '2024');
      await user.type(screen.getByLabelText(/day/i), '15');
      await user.type(screen.getByLabelText(/month/i), '03');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });
  });

  describe.skip('Empty Date Handling', () => {
    it('should call onChange with empty string when all fields are cleared', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="2024-03-15" onChange={handleChange} />);
      
      await user.clear(screen.getByLabelText(/day/i));
      await user.clear(screen.getByLabelText(/month/i));
      await user.clear(screen.getByLabelText(/year/i));
      
      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('should not call onChange when partially cleared', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="2024-03-15" onChange={handleChange} />);
      
      handleChange.mockClear();
      
      await user.clear(screen.getByLabelText(/day/i));
      
      // Should not call onChange because month and year still have values
      expect(handleChange).not.toHaveBeenCalledWith('');
    });
  });

  describe.skip('onBlur Callback', () => {
    it('should call onBlur when focus leaves date input group', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(
        <>
          <DateInput {...defaultProps} onBlur={handleBlur} />
          <input data-testid="outside-input" />
        </>
      );
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.click(dayInput);
      await user.click(screen.getByTestId('outside-input'));
      
      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalled();
      });
    });

    it('should not call onBlur when moving between date fields', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onBlur={handleBlur} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      const monthInput = screen.getByLabelText(/month/i);
      
      await user.click(dayInput);
      await user.click(monthInput);
      
      // Wait a bit to ensure the timeout has passed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(handleBlur).not.toHaveBeenCalled();
    });

    it('should not call onBlur if handler not provided', async () => {
      const user = userEvent.setup();
      render(
        <>
          <DateInput {...defaultProps} />
          <input data-testid="outside-input" />
        </>
      );
      
      await user.click(screen.getByLabelText(/day/i));
      await user.click(screen.getByTestId('outside-input'));
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe.skip('Error Display', () => {
    it('should display error message when error prop is provided', () => {
      render(<DateInput {...defaultProps} error="Date is required" />);
      
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    it('should not display error message when error prop is empty', () => {
      render(<DateInput {...defaultProps} error="" />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should set aria-invalid on all fields when error exists', () => {
      render(<DateInput {...defaultProps} error="Invalid date" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/month/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/year/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby on all fields when error exists', () => {
      render(<DateInput {...defaultProps} id="entry-date" error="Invalid date" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveAttribute('aria-describedby', 'entry-date-error');
      expect(screen.getByLabelText(/month/i)).toHaveAttribute('aria-describedby', 'entry-date-error');
      expect(screen.getByLabelText(/year/i)).toHaveAttribute('aria-describedby', 'entry-date-error');
    });
  });

  describe.skip('Accessibility', () => {
    it('should have unique IDs for each input', () => {
      render(<DateInput {...defaultProps} id="entry-date" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveAttribute('id', 'entry-date-day');
      expect(screen.getByLabelText(/month/i)).toHaveAttribute('id', 'entry-date-month');
      expect(screen.getByLabelText(/year/i)).toHaveAttribute('id', 'entry-date-year');
    });

    it('should have aria-label on each input', () => {
      render(<DateInput {...defaultProps} />);
      
      expect(screen.getByLabelText(/day/i)).toHaveAttribute('aria-label', 'Day');
      expect(screen.getByLabelText(/month/i)).toHaveAttribute('aria-label', 'Month');
      expect(screen.getByLabelText(/year/i)).toHaveAttribute('aria-label', 'Year');
    });

    it('should have inputMode numeric for mobile keyboards', () => {
      render(<DateInput {...defaultProps} />);
      
      expect(screen.getByLabelText(/day/i)).toHaveAttribute('inputMode', 'numeric');
      expect(screen.getByLabelText(/month/i)).toHaveAttribute('inputMode', 'numeric');
      expect(screen.getByLabelText(/year/i)).toHaveAttribute('inputMode', 'numeric');
    });

    it('should have text-center class for centered text', () => {
      render(<DateInput {...defaultProps} />);
      
      expect(screen.getByLabelText(/day/i)).toHaveClass('text-center');
      expect(screen.getByLabelText(/month/i)).toHaveClass('text-center');
      expect(screen.getByLabelText(/year/i)).toHaveClass('text-center');
    });

    it('should hide separators from screen readers', () => {
      const { container } = render(<DateInput {...defaultProps} />);
      
      const separators = container.querySelectorAll('span[aria-hidden="true"]');
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe.skip('Value Updates', () => {
    it('should update fields when value prop changes', () => {
      const { rerender } = render(<DateInput {...defaultProps} value="2024-03-15" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('15');
      expect(screen.getByLabelText(/month/i)).toHaveValue('03');
      expect(screen.getByLabelText(/year/i)).toHaveValue('2024');
      
      rerender(<DateInput {...defaultProps} value="2024-12-25" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('25');
      expect(screen.getByLabelText(/month/i)).toHaveValue('12');
      expect(screen.getByLabelText(/year/i)).toHaveValue('2024');
    });

    it('should clear fields when value changes to empty', () => {
      const { rerender } = render(<DateInput {...defaultProps} value="2024-03-15" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('15');
      
      rerender(<DateInput {...defaultProps} value="" />);
      
      expect(screen.getByLabelText(/day/i)).toHaveValue('');
      expect(screen.getByLabelText(/month/i)).toHaveValue('');
      expect(screen.getByLabelText(/year/i)).toHaveValue('');
    });
  });

  describe.skip('Edge Cases', () => {
    it('should handle rapid input changes', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} onChange={handleChange} />);
      
      await user.type(screen.getByLabelText(/day/i), '1');
      await user.type(screen.getByLabelText(/day/i), '5');
      await user.type(screen.getByLabelText(/month/i), '0');
      await user.type(screen.getByLabelText(/month/i), '3');
      await user.type(screen.getByLabelText(/year/i), '2');
      await user.type(screen.getByLabelText(/year/i), '0');
      await user.type(screen.getByLabelText(/year/i), '2');
      await user.type(screen.getByLabelText(/year/i), '4');
      
      expect(handleChange).toHaveBeenCalledWith('2024-03-15');
    });

    it('should handle pasting numbers', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.click(dayInput);
      await user.paste('15');
      
      expect(dayInput).toHaveValue('15');
    });

    it('should handle backspace to clear individual fields', async () => {
      const user = userEvent.setup();
      render(<DateInput {...defaultProps} value="2024-03-15" />);
      
      const dayInput = screen.getByLabelText(/day/i);
      await user.clear(dayInput);
      
      expect(dayInput).toHaveValue('');
      expect(screen.getByLabelText(/month/i)).toHaveValue('03');
      expect(screen.getByLabelText(/year/i)).toHaveValue('2024');
    });
  });

  // NEW TESTS FOR HTML5 DATE INPUT REFACTOR (User Story 1)
  // These tests are written FIRST (TDD) and will FAIL until implementation
  describe('HTML5 Date Input (User Story 1)', () => {
    describe('T012 - Rendering single input type="date"', () => {
      it('should render a single input with type="date"', () => {
        render(<DateInput {...defaultProps} />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'date');
      });

      it('should not render separate day/month/year fields', () => {
        render(<DateInput {...defaultProps} />);
        
        // Old fields should not exist
        expect(screen.queryByLabelText(/day/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/month/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/year/i)).not.toBeInTheDocument();
      });
    });

    describe('T013 - Accept and display ISO date value', () => {
      it('should display ISO date value in the input', () => {
        render(<DateInput {...defaultProps} value="2024-03-15" />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveValue('2024-03-15');
      });

      it('should handle empty value', () => {
        render(<DateInput {...defaultProps} value="" />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveValue('');
      });
    });

    describe('T014 - onChange callback with ISO string', () => {
      it('should call onChange with ISO string when date selected', async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<DateInput {...defaultProps} onChange={mockOnChange} />);
        
        const input = screen.getByLabelText(/date/i);
        await user.type(input, '2024-03-15');
        
        expect(mockOnChange).toHaveBeenCalledWith('2024-03-15');
      });

      it('should call onChange with empty string when cleared', async () => {
        const user = userEvent.setup();
        const mockOnChange = jest.fn();
        render(<DateInput {...defaultProps} value="2024-03-15" onChange={mockOnChange} />);
        
        const input = screen.getByLabelText(/date/i);
        await user.clear(input);
        
        expect(mockOnChange).toHaveBeenCalledWith('');
      });
    });

    describe('T015 - Error message display', () => {
      it('should show error message when error prop provided', () => {
        render(<DateInput {...defaultProps} error="Date is required" />);
        
        expect(screen.getByText('Date is required')).toBeInTheDocument();
      });

      it('should not show error message when error prop is empty', () => {
        render(<DateInput {...defaultProps} error="" />);
        
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });

    describe('T016 - Max date attribute enforcement', () => {
      it('should set max attribute when max prop provided', () => {
        render(<DateInput {...defaultProps} max="2024-12-31" />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveAttribute('max', '2024-12-31');
      });

      it('should prevent selection of dates after max', () => {
        render(<DateInput {...defaultProps} max="2024-12-31" />);
        
        const input = screen.getByLabelText(/date/i);
        // HTML5 validation prevents invalid dates
        // Browser enforces this, we just verify the attribute is set
        expect(input).toHaveAttribute('max', '2024-12-31');
      });
    });

    describe('T017 - Required indicator', () => {
      it('should show required indicator when required=true', () => {
        render(<DateInput {...defaultProps} required />);
        
        // Use regex to match label with or without asterisk
        const input = screen.getByLabelText(/date/i);
        expect(input).toBeRequired();
      });

      it('should not show required indicator when required=false', () => {
        render(<DateInput {...defaultProps} required={false} />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).not.toBeRequired();
      });
    });

    describe('T018 - Accessibility attributes', () => {
      it('should have aria-invalid when error exists', () => {
        render(<DateInput {...defaultProps} error="Invalid date" />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });

      it('should not have aria-invalid when no error', () => {
        render(<DateInput {...defaultProps} />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveAttribute('aria-invalid', 'false');
      });

      it('should have aria-describedby pointing to error message', () => {
        render(<DateInput {...defaultProps} id="test-date" error="Invalid date" />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveAttribute('aria-describedby', 'test-date-error');
      });
    });
  });

  // ============================================================================
  // Phase 4: User Story 2 - Edit Mode Support
  // ============================================================================

  describe('US2: Edit Mode - Pre-filled Date Value', () => {
    // T030: DateInput renders with pre-filled value
    describe('T030 - Pre-filled Value Rendering', () => {
      it('should render with pre-filled date value in edit mode', () => {
        const prefilledDate = '2024-03-15';
        render(<DateInput {...defaultProps} value={prefilledDate} />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input).toHaveValue(prefilledDate);
      });

      it('should display pre-filled date value in correct ISO format', () => {
        const prefilledDate = '2023-12-31';
        render(<DateInput {...defaultProps} value={prefilledDate} />);
        
        const input = screen.getByLabelText(/date/i);
        expect(input.value).toBe(prefilledDate);
      });

      it('should allow changing pre-filled date value', () => {
        const prefilledDate = '2024-03-15';
        const newDate = '2024-03-20';
        const mockOnChange = jest.fn();
        
        render(<DateInput {...defaultProps} value={prefilledDate} onChange={mockOnChange} />);
        
        const input = screen.getByLabelText(/date/i);
        fireEvent.change(input, { target: { value: newDate } });
        
        expect(mockOnChange).toHaveBeenCalledWith(newDate);
      });
    });
  });
});
