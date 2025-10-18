/**
 * Select Component Tests
 * 
 * Tests for atomic Select (dropdown) component with accessibility
 * Requirements: WCAG 2.1 AA, keyboard navigation
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from '@/components/atoms/Select';

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('Rendering', () => {
    it('should render select element', () => {
      render(<Select id="test-select" options={options} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<Select id="test-select" options={options} />);
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });

    it('should render with placeholder option', () => {
      render(<Select id="test-select" options={options} placeholder="Select an option" />);
      expect(screen.getByRole('option', { name: 'Select an option' })).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(<Select id="test-select" options={options} value="option2" onChange={() => {}} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('option2');
    });

    it('should apply custom className', () => {
      render(<Select id="test-select" options={options} className="custom-class" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Select id="test-select" options={options} onChange={handleChange} />);
      
      await user.selectOptions(screen.getByRole('combobox'), 'option2');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<Select id="test-select" options={options} onBlur={handleBlur} />);
      
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.tab();
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      render(<Select id="test-select" options={options} onFocus={handleFocus} />);
      
      await user.click(screen.getByRole('combobox'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Select id="test-select" options={options} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should handle required state', () => {
      render(<Select id="test-select" options={options} required />);
      expect(screen.getByRole('combobox')).toBeRequired();
    });

    it('should apply error styles when error prop is true', () => {
      render(<Select id="test-select" options={options} error />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-500');
      expect(select).toHaveClass('focus:ring-red-500');
    });

    it('should not have error styles when error prop is false', () => {
      render(<Select id="test-select" options={options} error={false} />);
      const select = screen.getByRole('combobox');
      expect(select).not.toHaveClass('border-red-500');
      expect(select).toHaveClass('border-gray-300');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have accessible id attribute', () => {
      render(<Select id="accessible-select" options={options} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'accessible-select');
    });

    it('should support aria-label', () => {
      render(<Select id="test-select" options={options} aria-label="Test Select" />);
      expect(screen.getByRole('combobox', { name: /test select/i })).toBeInTheDocument();
    });

    it('should support aria-describedby for error messages', () => {
      render(<Select id="test-select" options={options} aria-describedby="error-message" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('should support aria-invalid when error is true', () => {
      render(<Select id="test-select" options={options} error />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not have aria-invalid when error is false', () => {
      render(<Select id="test-select" options={options} error={false} />);
      const select = screen.getByRole('combobox');
      const ariaInvalid = select.getAttribute('aria-invalid');
      expect(ariaInvalid).toBeNull();
    });

    it('should have visible focus indicator', () => {
      render(<Select id="test-select" options={options} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('focus:outline-none');
      expect(select).toHaveClass('focus:ring-2');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Select id="test-select" options={options} onChange={handleChange} />);
      
      const select = screen.getByRole('combobox');
      
      // Test keyboard selection using tab to focus and then select an option
      await user.tab();
      expect(select).toHaveFocus();
      
      // Use selectOptions which properly simulates keyboard selection
      await user.selectOptions(select, 'option2');
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('should support full width option', () => {
      render(<Select id="test-select" options={options} fullWidth />);
      expect(screen.getByRole('combobox')).toHaveClass('w-full');
    });

    it('should be full width by default', () => {
      render(<Select id="test-select" options={options} />);
      expect(screen.getByRole('combobox')).toHaveClass('w-full');
    });
  });

  describe('Name Attribute', () => {
    it('should support name attribute for form submission', () => {
      render(<Select id="test-select" options={options} name="fieldName" />);
      expect(screen.getByRole('combobox')).toHaveAttribute('name', 'fieldName');
    });
  });

  describe('Empty Options', () => {
    it('should render with empty options array', () => {
      render(<Select id="test-select" options={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render placeholder when options is empty', () => {
      render(<Select id="test-select" options={[]} placeholder="No options" />);
      expect(screen.getByRole('option', { name: 'No options' })).toBeInTheDocument();
    });
  });

  describe('Placeholder Option', () => {
    it('should disable placeholder option', () => {
      render(<Select id="test-select" options={options} placeholder="Select..." />);
      const placeholderOption = screen.getByRole('option', { name: 'Select...' });
      expect(placeholderOption).toBeDisabled();
    });

    it('should set placeholder value to empty string', () => {
      render(<Select id="test-select" options={options} placeholder="Select..." />);
      const placeholderOption = screen.getByRole('option', { name: 'Select...' });
      expect(placeholderOption).toHaveValue('');
    });
  });
});
