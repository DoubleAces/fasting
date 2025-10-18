import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeInput from '@/components/molecules/TimeInput';

describe('TimeInput Component', () => {
  describe('Rendering', () => {
    it('should render label and input', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      expect(screen.getByText('Start Time')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<TimeInput id="time-input" label="Start Time" value="14:30" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('14:30');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <TimeInput id="time-input" label="Start Time" className="custom-class" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should show required indicator when required', () => {
      render(<TimeInput id="time-input" label="Start Time" required />);
      const label = screen.getByText(/Start Time/);
      expect(label).toHaveTextContent('*');
    });
  });

  describe('24-hour Format (default)', () => {
    it('should accept valid 24-hour time', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '14:30');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should show placeholder for 24-hour format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'HH:mm (e.g., 14:30)');
    });

    it('should accept single digit hours', () => {
      render(<TimeInput id="time-input" label="Start Time" value="9:30" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('9:30');
    });

    it('should accept midnight (00:00)', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" value="00:00" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('00:00');
    });

    it('should accept end of day (23:59)', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" value="23:59" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('23:59');
    });
  });

  describe('12-hour Format', () => {
    it('should show placeholder for 12-hour format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'HH:mm AM/PM (e.g., 02:30 PM)');
    });

    it('should accept valid 12-hour time with AM', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="09:30 AM" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('09:30 AM');
    });

    it('should accept valid 12-hour time with PM', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="02:30 PM" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('02:30 PM');
    });

    it('should accept midnight (12:00 AM)', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="12:00 AM" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('12:00 AM');
    });

    it('should accept noon (12:00 PM)', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="12:00 PM" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('12:00 PM');
    });
  });

  describe('Validation', () => {
    it('should show error for invalid 24-hour time (hours > 23)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      
      const input = screen.getByRole('textbox');
      
      // Simulate typing invalid value
      fireEvent.change(input, { target: { value: '25:00' } });
      fireEvent.blur(input);
      
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });

    it('should show error for invalid minutes (> 59)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '14:60' } });
      fireEvent.blur(input);
      
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });

    it('should show error for invalid 12-hour format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '14:30 PM' } });
      fireEvent.blur(input);
      
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });

    it('should show error for missing AM/PM in 12-hour format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '02:30' } });
      fireEvent.blur(input);
      
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });

    it('should clear error when valid time is entered', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      
      const input = screen.getByRole('textbox');
      
      // Enter invalid time
      fireEvent.change(input, { target: { value: '25:00' } });
      fireEvent.blur(input);
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
      
      // Enter valid time
      fireEvent.change(input, { target: { value: '14:30' } });
      fireEvent.blur(input);
      expect(screen.queryByText(/invalid time format/i)).not.toBeInTheDocument();
    });

    it('should not show error for empty input (optional)', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" />);
      
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.tab();
      
      expect(screen.queryByText(/invalid time format/i)).not.toBeInTheDocument();
    });

    it('should show error for empty input when required', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" required />);
      
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.tab();
      
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should show custom error message when error prop provided', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Custom error message" />);
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should apply error styling to input when error exists', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('should apply error styling to label when error exists', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error" />);
      const label = screen.getByText('Start Time');
      expect(label).toHaveClass('text-red-600');
    });

    it('should link error message to input via aria-describedby', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error message" />);
      const input = screen.getByRole('textbox');
      const errorId = `${input.id}-error`;
      expect(input).toHaveAttribute('aria-describedby', errorId);
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });
  });

  describe('Interactions', () => {
    it('should call onChange when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '14:30');
      
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should validate on blur', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '25:00' } });
      
      // Error should not show until blur
      expect(screen.queryByText(/invalid time format/i)).not.toBeInTheDocument();
      
      fireEvent.blur(input);
      
      // Error should show after blur
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<TimeInput id="time-input" label="Start Time" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should handle readOnly state', () => {
      render(<TimeInput id="time-input" label="Start Time" readOnly value="14:30" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('14:30');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should associate label with input via htmlFor', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      const label = screen.getByText('Start Time');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'time-input');
      expect(input).toHaveAttribute('id', 'time-input');
    });

    it('should have aria-invalid when error exists', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have visible focus indicator', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2');
    });
  });
});
