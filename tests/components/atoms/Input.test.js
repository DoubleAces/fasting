/**
 * Input Component Tests
 * 
 * Tests for atomic Input component with accessibility
 * Requirements: WCAG 2.1 AA, proper labeling, error states
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/atoms/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render text input by default', () => {
      render(<Input id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with placeholder', () => {
      render(<Input id="test-input" placeholder="Enter text" />);
      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Input id="test-input" value="Test value" onChange={() => {}} />);
      expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Input id="test-input" className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('Input Types', () => {
    it('should render number input', () => {
      render(<Input id="num-input" type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render email input', () => {
      render(<Input id="email-input" type="email" />);
      const input = document.querySelector('#email-input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input id="pw-input" type="password" />);
      const input = document.querySelector('#pw-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render time input', () => {
      render(<Input id="time-input" type="time" />);
      const input = document.querySelector('#time-input');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should render date input', () => {
      render(<Input id="date-input" type="date" />);
      const input = document.querySelector('#date-input');
      expect(input).toHaveAttribute('type', 'date');
    });
  });

  describe('Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input id="test-input" onChange={handleChange} />);
      
      await user.type(screen.getByRole('textbox'), 'Hello');
      expect(handleChange).toHaveBeenCalledTimes(5); // Called for each character
    });

    it('should handle onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<Input id="test-input" onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      render(<Input id="test-input" onFocus={handleFocus} />);
      
      await user.click(screen.getByRole('textbox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Input id="test-input" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should handle readOnly state', () => {
      render(<Input id="test-input" readOnly value="Read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('Read only');
    });

    it('should handle required state', () => {
      render(<Input id="test-input" required />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should apply error styles when error prop is true', () => {
      render(<Input id="test-input" error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('focus:ring-red-500');
    });

    it('should not have error styles when error prop is false', () => {
      render(<Input id="test-input" error={false} />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-500');
      expect(input).toHaveClass('border-gray-300');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have accessible id attribute', () => {
      render(<Input id="accessible-input" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'accessible-input');
    });

    it('should support aria-label', () => {
      render(<Input id="test-input" aria-label="Test Input" />);
      expect(screen.getByRole('textbox', { name: /test input/i })).toBeInTheDocument();
    });

    it('should support aria-describedby for error messages', () => {
      render(<Input id="test-input" aria-describedby="error-message" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('should support aria-invalid when error is true', () => {
      render(<Input id="test-input" error />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is false', () => {
      render(<Input id="test-input" error={false} />);
      const input = screen.getByRole('textbox');
      const ariaInvalid = input.getAttribute('aria-invalid');
      expect(ariaInvalid).toBeNull();
    });

    it('should have visible focus indicator', () => {
      render(<Input id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none');
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  describe('Full Width', () => {
    it('should support full width option', () => {
      render(<Input id="test-input" fullWidth />);
      expect(screen.getByRole('textbox')).toHaveClass('w-full');
    });

    it('should be full width by default', () => {
      render(<Input id="test-input" />);
      expect(screen.getByRole('textbox')).toHaveClass('w-full');
    });
  });

  describe('Min/Max Attributes', () => {
    it('should support min attribute for number input', () => {
      render(<Input id="num-input" type="number" min={0} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '0');
    });

    it('should support max attribute for number input', () => {
      render(<Input id="num-input" type="number" max={100} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '100');
    });

    it('should support step attribute for number input', () => {
      render(<Input id="num-input" type="number" step={0.5} />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.5');
    });
  });

  describe('Name Attribute', () => {
    it('should support name attribute for form submission', () => {
      render(<Input id="test-input" name="fieldName" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'fieldName');
    });
  });
});
