import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeInput from '@/components/molecules/TimeInput';

describe('TimeInput Component', () => {
  describe('Rendering', () => {
    it('should render label, hour and minute selects', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      expect(screen.getByText('Start Time')).toBeInTheDocument();
      expect(screen.getByLabelText('Hour')).toBeInTheDocument();
      expect(screen.getByLabelText('Minute')).toBeInTheDocument();
    });

    it('should render with value in 24h format', () => {
      render(<TimeInput id="time-input" label="Start Time" value="14:30" format="24h" />);
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      expect(hourSelect).toHaveValue('14');
      expect(minuteSelect).toHaveValue('30');
    });

    it('should render AM/PM selector for 12h format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      expect(screen.getByLabelText('AM/PM')).toBeInTheDocument();
    });

    it('should not render AM/PM selector for 24h format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      expect(screen.queryByLabelText('AM/PM')).not.toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(<TimeInput id="time-input" label="Start Time" required />);
      const label = screen.getByText(/Start Time/);
      expect(label).toHaveTextContent('*');
    });
  });

  describe('24-hour Format (default)', () => {
    it('should call onChange with 24h format when time selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      
      await user.selectOptions(hourSelect, '14');
      await user.selectOptions(minuteSelect, '30');
      
      expect(handleChange).toHaveBeenCalledWith('14:30');
    });

    it('should have 24 hour options (00-23)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      const hourSelect = screen.getByLabelText('Hour');
      const options = Array.from(hourSelect.querySelectorAll('option')).map(opt => opt.value).filter(v => v);
      
      expect(options).toHaveLength(24);
      expect(options[0]).toBe('00');
      expect(options[23]).toBe('23');
    });

    it('should have 60 minute options (00-59)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="24h" />);
      const minuteSelect = screen.getByLabelText('Minute');
      const options = Array.from(minuteSelect.querySelectorAll('option')).map(opt => opt.value).filter(v => v);
      
      expect(options).toHaveLength(60);
      expect(options[0]).toBe('00');
      expect(options[59]).toBe('59');
    });

    it('should display midnight (00:00)', () => {
      render(<TimeInput id="time-input" label="Start Time" value="00:00" format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      expect(hourSelect).toHaveValue('00');
      expect(minuteSelect).toHaveValue('00');
    });

    it('should display end of day (23:59)', () => {
      render(<TimeInput id="time-input" label="Start Time" value="23:59" format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      expect(hourSelect).toHaveValue('23');
      expect(minuteSelect).toHaveValue('59');
    });
  });

  describe('12-hour Format', () => {
    it('should have 12 hour options (01-12) for 12h format', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      const hourSelect = screen.getByLabelText('Hour');
      const options = Array.from(hourSelect.querySelectorAll('option')).map(opt => opt.value).filter(v => v);
      
      expect(options).toHaveLength(12);
      expect(options[0]).toBe('01');
      expect(options[11]).toBe('12');
    });

    it('should convert 09:30 (24h) to 9:30 AM (12h display)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="09:30" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      expect(hourSelect).toHaveValue('09');
      expect(minuteSelect).toHaveValue('30');
      expect(periodSelect).toHaveValue('AM');
    });

    it('should convert 14:30 (24h) to 2:30 PM (12h display)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="14:30" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      expect(hourSelect).toHaveValue('02');
      expect(minuteSelect).toHaveValue('30');
      expect(periodSelect).toHaveValue('PM');
    });

    it('should convert midnight 00:00 (24h) to 12:00 AM (12h)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="00:00" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      expect(hourSelect).toHaveValue('12');
      expect(periodSelect).toHaveValue('AM');
    });

    it('should convert noon 12:00 (24h) to 12:00 PM (12h)', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" value="12:00" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      expect(hourSelect).toHaveValue('12');
      expect(periodSelect).toHaveValue('PM');
    });

    it('should call onChange with 24h format when 12h time selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="12h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      await user.selectOptions(hourSelect, '02');
      await user.selectOptions(minuteSelect, '30');
      await user.selectOptions(periodSelect, 'PM');
      
      // Should return 14:30 (24h format)
      expect(handleChange).toHaveBeenCalledWith('14:30');
    });
  });

  describe('Validation', () => {
    it('should not call onChange when only hour is selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      await user.selectOptions(hourSelect, '14');
      
      // Should not call onChange until both hour and minute are selected
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not call onChange when only minute is selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="24h" />);
      
      const minuteSelect = screen.getByLabelText('Minute');
      await user.selectOptions(minuteSelect, '30');
      
      // Should not call onChange until both hour and minute are selected
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not call onChange when hour is cleared but minute still has value', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="24h" value="14:30" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      
      // Clear hour - minute still has "30"
      await user.selectOptions(hourSelect, '');
      
      // Component should NOT call onChange because we don't have both values
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should show error for empty inputs when required and blurred', async () => {
      const user = userEvent.setup();
      render(<TimeInput id="time-input" label="Start Time" required error="Time is required" />);
      
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should show custom error message when error prop provided', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Custom error message" />);
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should link error message to selects via aria-describedby', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error message" />);
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      const errorId = 'time-input-error';
      
      expect(hourSelect).toHaveAttribute('aria-describedby', errorId);
      expect(minuteSelect).toHaveAttribute('aria-describedby', errorId);
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });
  });

  describe('Interactions', () => {
    it('should call onChange when both hour and minute are selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      
      await user.selectOptions(hourSelect, '14');
      await user.selectOptions(minuteSelect, '30');
      
      expect(handleChange).toHaveBeenCalledWith('14:30');
    });

    it('should call onBlur only when focus leaves all time selects', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<TimeInput id="time-input" label="Start Time" onBlur={handleBlur} format="24h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      
      // Click hour select
      await user.click(hourSelect);
      
      // Tab to minute select - should NOT trigger onBlur yet
      await user.tab();
      await waitFor(() => {
        expect(document.activeElement).toBe(minuteSelect);
      });
      
      // onBlur should not be called yet (still within time input group)
      expect(handleBlur).not.toHaveBeenCalled();
      
      // Tab away from time input group
      await user.tab();
      
      // Now onBlur should be called
      await waitFor(() => {
        expect(handleBlur).toHaveBeenCalled();
      });
    });

    it('should update displayed value when value prop changes', () => {
      const { rerender } = render(
        <TimeInput id="time-input" label="Start Time" value="10:00" format="24h" />
      );
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      
      expect(hourSelect).toHaveValue('10');
      expect(minuteSelect).toHaveValue('00');
      
      // Update value prop
      rerender(<TimeInput id="time-input" label="Start Time" value="15:45" format="24h" />);
      
      expect(hourSelect).toHaveValue('15');
      expect(minuteSelect).toHaveValue('45');
    });
  });

  describe('Format Conversion', () => {
    it('should always return 24h format regardless of display format', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      // 12h format display
      render(<TimeInput id="time-input" label="Start Time" onChange={handleChange} format="12h" />);
      
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      // Select 2:30 PM
      await user.selectOptions(hourSelect, '02');
      await user.selectOptions(minuteSelect, '30');
      await user.selectOptions(periodSelect, 'PM');
      
      // Should return in 24h format (14:30)
      expect(handleChange).toHaveBeenCalledWith('14:30');
    });

    it('should handle format change from 24h to 12h', () => {
      const { rerender } = render(
        <TimeInput id="time-input" label="Start Time" value="14:30" format="24h" />
      );
      
      let hourSelect = screen.getByLabelText('Hour');
      expect(hourSelect).toHaveValue('14');
      expect(screen.queryByLabelText('AM/PM')).not.toBeInTheDocument();
      
      // Change to 12h format
      rerender(<TimeInput id="time-input" label="Start Time" value="14:30" format="12h" />);
      
      hourSelect = screen.getByLabelText('Hour');
      const periodSelect = screen.getByLabelText('AM/PM');
      
      expect(hourSelect).toHaveValue('02');
      expect(periodSelect).toHaveValue('PM');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should associate label with first select via htmlFor', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      const label = screen.getByText('Start Time');
      const hourSelect = screen.getByLabelText('Hour');
      expect(label).toHaveAttribute('for', 'time-input-hour');
      expect(hourSelect).toHaveAttribute('id', 'time-input-hour');
    });

    it('should have proper aria-labels for all selects', () => {
      render(<TimeInput id="time-input" label="Start Time" format="12h" />);
      
      expect(screen.getByLabelText('Hour')).toBeInTheDocument();
      expect(screen.getByLabelText('Minute')).toBeInTheDocument();
      expect(screen.getByLabelText('AM/PM')).toBeInTheDocument();
    });

    it('should have aria-invalid when error exists', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error" />);
      const hourSelect = screen.getByLabelText('Hour');
      const minuteSelect = screen.getByLabelText('Minute');
      
      expect(hourSelect).toHaveAttribute('aria-invalid', 'true');
      expect(minuteSelect).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-describedby linking to error message', () => {
      render(<TimeInput id="time-input" label="Start Time" error="Error message" />);
      const hourSelect = screen.getByLabelText('Hour');
      const errorMessage = screen.getByText('Error message');
      
      expect(hourSelect).toHaveAttribute('aria-describedby', 'time-input-error');
      expect(errorMessage).toHaveAttribute('id', 'time-input-error');
    });

    it('should have visible focus indicator', () => {
      render(<TimeInput id="time-input" label="Start Time" />);
      const hourSelect = screen.getByLabelText('Hour');
      expect(hourSelect).toHaveClass('focus:ring-2');
    });
  });
});
