import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormField from '@/components/molecules/FormField';

describe('FormField Component', () => {
  describe('Rendering with Input', () => {
    it('should render label and input', () => {
      render(
        <FormField
          id="email"
          label="Email Address"
          type="text"
        />
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(
        <FormField
          id="name"
          label="Name"
          type="text"
          value="John Doe"
          onChange={() => {}}
        />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('should apply custom className to wrapper', () => {
      const { container } = render(
        <FormField
          id="test"
          label="Test"
          type="text"
          className="custom-wrapper"
        />
      );

      expect(container.firstChild).toHaveClass('custom-wrapper');
    });

    it('should render with placeholder', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />
      );

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });
  });

  describe('Rendering with Select', () => {
    const options = [
      { value: 'metric', label: 'Metric (kg)' },
      { value: 'imperial', label: 'Imperial (lbs)' }
    ];

    it('should render label and select', () => {
      render(
        <FormField
          id="measurement"
          label="Measurement System"
          type="select"
          options={options}
        />
      );

      expect(screen.getByText('Measurement System')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render select options', () => {
      render(
        <FormField
          id="measurement"
          label="Measurement System"
          type="select"
          options={options}
        />
      );

      expect(screen.getByText('Metric (kg)')).toBeInTheDocument();
      expect(screen.getByText('Imperial (lbs)')).toBeInTheDocument();
    });

    it('should render select with placeholder', () => {
      render(
        <FormField
          id="measurement"
          label="Measurement System"
          type="select"
          options={options}
          placeholder="Choose measurement system"
        />
      );

      expect(screen.getByText('Choose measurement system')).toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render text input', () => {
      render(
        <FormField
          id="name"
          label="Name"
          type="text"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render number input', () => {
      render(
        <FormField
          id="weight"
          label="Weight"
          type="number"
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render email input', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="email"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should support number input props (min, max, step)', () => {
      render(
        <FormField
          id="weight"
          label="Weight"
          type="number"
          min={0}
          max={500}
          step={0.1}
        />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '500');
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('Label Association', () => {
    it('should link label to input with htmlFor and id', () => {
      render(
        <FormField
          id="email"
          label="Email Address"
          type="text"
        />
      );

      const label = screen.getByText('Email Address');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('should link label to select with htmlFor and id', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
        />
      );

      const label = screen.getByText('Choose');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'choice');
      expect(select).toHaveAttribute('id', 'choice');
    });
  });

  describe('Required State', () => {
    it('should show required indicator on label when required', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          required
        />
      );

      const label = screen.getByText(/Email/);
      expect(label).toHaveTextContent('*');
    });

    it('should mark input as required', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          required
        />
      );

      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should mark select as required', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          required
        />
      );

      expect(screen.getByRole('combobox')).toBeRequired();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          disabled
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should disable select when disabled prop is true', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          disabled
        />
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should show error message when error prop provided', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Invalid email address"
        />
      );

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('should apply error styling to label when error exists', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Error message"
        />
      );

      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-red-600');
    });

    it('should apply error styling to input when error exists', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Error message"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('should apply error styling to select when error exists', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          error="Error message"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-500');
    });

    it('should link error message to input via aria-describedby', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Error message"
        />
      );

      const input = screen.getByRole('textbox');
      const errorId = 'email-error';
      
      expect(input).toHaveAttribute('aria-describedby', errorId);
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });

    it('should link error message to select via aria-describedby', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          error="Error message"
        />
      );

      const select = screen.getByRole('combobox');
      const errorId = 'choice-error';
      
      expect(select).toHaveAttribute('aria-describedby', errorId);
      expect(screen.getByText('Error message')).toHaveAttribute('id', errorId);
    });
  });

  describe('Help Text', () => {
    it('should render help text when helpText prop provided', () => {
      render(
        <FormField
          id="password"
          label="Password"
          type="text"
          helpText="Must be at least 8 characters"
        />
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('should link help text to input via aria-describedby', () => {
      render(
        <FormField
          id="password"
          label="Password"
          type="text"
          helpText="Must be at least 8 characters"
        />
      );

      const input = screen.getByRole('textbox');
      const helpId = 'password-help';
      
      expect(input).toHaveAttribute('aria-describedby', helpId);
      expect(screen.getByText('Must be at least 8 characters')).toHaveAttribute('id', helpId);
    });

    it('should show both help text and error message', () => {
      render(
        <FormField
          id="password"
          label="Password"
          type="text"
          helpText="Must be at least 8 characters"
          error="Password is required"
        />
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should link both help text and error to input via aria-describedby', () => {
      render(
        <FormField
          id="password"
          label="Password"
          type="text"
          helpText="Must be at least 8 characters"
          error="Password is required"
        />
      );

      const input = screen.getByRole('textbox');
      const helpId = 'password-help';
      const errorId = 'password-error';
      
      expect(input).toHaveAttribute('aria-describedby', `${helpId} ${errorId}`);
    });

    it('should style help text differently from error message', () => {
      const { container } = render(
        <FormField
          id="password"
          label="Password"
          type="text"
          helpText="Help text"
          error="Error message"
        />
      );

      const helpText = screen.getByText('Help text');
      const errorMessage = screen.getByText('Error message');

      expect(helpText).toHaveClass('text-gray-600');
      expect(errorMessage).toHaveClass('text-red-600');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when input value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onChange when select value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' }
      ];

      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          onChange={handleChange}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'a');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();

      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          onBlur={handleBlur}
        />
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for input', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Error message"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should have proper ARIA attributes for select', () => {
      const options = [{ value: 'a', label: 'Option A' }];
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={options}
          error="Error message"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAttribute('aria-describedby', 'choice-error');
    });

    it('should have error message with role="alert"', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          error="Error message"
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Error message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty select options array', () => {
      render(
        <FormField
          id="choice"
          label="Choose"
          type="select"
          options={[]}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle long label text', () => {
      const longLabel = 'This is a very long label that should wrap properly on small screens';
      render(
        <FormField
          id="test"
          label={longLabel}
          type="text"
        />
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle long error message', () => {
      const longError = 'This is a very long error message that should wrap properly and remain readable';
      render(
        <FormField
          id="test"
          label="Test"
          type="text"
          error={longError}
        />
      );

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should handle long help text', () => {
      const longHelp = 'This is a very long help text that provides detailed instructions to the user';
      render(
        <FormField
          id="test"
          label="Test"
          type="text"
          helpText={longHelp}
        />
      );

      expect(screen.getByText(longHelp)).toBeInTheDocument();
    });

    it('should work without onChange handler', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should combine required and error states', () => {
      render(
        <FormField
          id="email"
          label="Email"
          type="text"
          required
          error="Email is required"
        />
      );

      // Use getAllByText and find the label element specifically
      const labels = screen.getAllByText(/Email/);
      const label = labels.find(el => el.tagName === 'LABEL');
      expect(label).toHaveTextContent('*');
      expect(label).toHaveClass('text-red-600');
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });
});
