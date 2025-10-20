import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingSelector from '@/components/molecules/RatingSelector';

describe('RatingSelector Component', () => {
  const hungerOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const energyOptions = [
    { value: 'Low Energy', label: 'Low Energy' },
    { value: 'Medium Energy', label: 'Medium Energy' },
    { value: 'High Energy', label: 'High Energy' },
  ];

  const wellbeingOptions = [
    { value: 'Poor', label: 'Poor' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Good', label: 'Good' },
  ];

  describe('Rendering', () => {
    it('should render all radio buttons', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      expect(screen.getByLabelText('Low')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium')).toBeInTheDocument();
      expect(screen.getByLabelText('High')).toBeInTheDocument();
    });

    it('should render label text', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      expect(screen.getByText('Hunger Level')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          value="Medium"
        />
      );

      const mediumRadio = screen.getByLabelText('Medium');
      expect(mediumRadio).toBeChecked();
    });

    it('should render without selected value', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      hungerOptions.forEach(option => {
        expect(screen.getByLabelText(option.label)).not.toBeChecked();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Different Rating Scales', () => {
    it('should render hunger level options', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      expect(screen.getByLabelText('Low')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium')).toBeInTheDocument();
      expect(screen.getByLabelText('High')).toBeInTheDocument();
    });

    it('should render energy level options', () => {
      render(
        <RatingSelector
          id="energy-rating"
          label="Energy Level"
          options={energyOptions}
        />
      );

      expect(screen.getByLabelText('Low Energy')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium Energy')).toBeInTheDocument();
      expect(screen.getByLabelText('High Energy')).toBeInTheDocument();
    });

    it('should render well-being options', () => {
      render(
        <RatingSelector
          id="wellbeing-rating"
          label="Overall Well-being"
          options={wellbeingOptions}
        />
      );

      expect(screen.getByLabelText('Poor')).toBeInTheDocument();
      expect(screen.getByLabelText('Fair')).toBeInTheDocument();
      expect(screen.getByLabelText('Good')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onChange when option is selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText('Medium'));

      expect(handleChange).toHaveBeenCalledWith('Medium');
    });

    it('should update selection when different option clicked', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          value="Low"
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText('High'));

      expect(handleChange).toHaveBeenCalledWith('High');
    });

    it('should allow deselection when clicking selected option', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          value="Medium"
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText('Medium'));

      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          disabled
        />
      );

      hungerOptions.forEach(option => {
        expect(screen.getByLabelText(option.label)).toBeDisabled();
      });
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          disabled
          onChange={handleChange}
        />
      );

      await user.click(screen.getByLabelText('Medium'));

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should show required indicator when required', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          required
        />
      );

      const label = screen.getByText(/Hunger Level/);
      expect(label).toHaveTextContent('*');
    });
  });

  describe('Error Display', () => {
    it('should show error message when error prop provided', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          error="Please select a hunger level"
        />
      );

      expect(screen.getByText('Please select a hunger level')).toBeInTheDocument();
    });

    it('should apply error styling to label when error exists', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          error="Error message"
        />
      );

      const label = screen.getByText('Hunger Level');
      expect(label).toHaveClass('text-red-600');
    });

    it('should link error message to radio group via aria-describedby', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          error="Error message"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      const errorMessage = screen.getByText('Error message');
      
      expect(radioGroup).toHaveAttribute('aria-describedby', 'hunger-rating-error');
      expect(errorMessage).toHaveAttribute('id', 'hunger-rating-error');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have role="radiogroup"', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have aria-labelledby linking to label', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveAttribute('aria-labelledby', 'hunger-rating-label');
    });

    it('should have unique name for radio group', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      hungerOptions.forEach(option => {
        const radio = screen.getByLabelText(option.label);
        expect(radio).toHaveAttribute('name', 'hunger-rating');
      });
    });

    it('should be keyboard navigable with arrow keys', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          onChange={handleChange}
        />
      );

      const firstRadio = screen.getByLabelText('Low');
      firstRadio.focus();
      
      await user.keyboard('{ArrowRight}');
      
      expect(screen.getByLabelText('Medium')).toHaveFocus();
    });

    it('should have minimum 44x44px touch target for mobile', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      hungerOptions.forEach(option => {
        const label = screen.getByText(option.label).closest('label');
        const styles = window.getComputedStyle(label);
        // Check that the label (clickable area) meets minimum size
        expect(label).toHaveClass('min-h-[44px]');
      });
    });

    it('should have visible focus indicators', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      hungerOptions.forEach(option => {
        const radio = screen.getByLabelText(option.label);
        expect(radio).toHaveClass('focus:ring-2');
      });
    });

    it('should have aria-invalid when error exists', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          error="Error message"
        />
      );

      const radioGroup = container.querySelector('[role="radiogroup"]');
      expect(radioGroup).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Layout Options', () => {
    it('should render horizontal layout by default', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
        />
      );

      const optionsContainer = container.querySelector('[role="radiogroup"] > div');
      expect(optionsContainer).toHaveClass('flex-row');
    });

    it('should render vertical layout when specified', () => {
      const { container } = render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={hungerOptions}
          layout="vertical"
        />
      );

      const optionsContainer = container.querySelector('[role="radiogroup"] > div');
      expect(optionsContainer).toHaveClass('flex-col');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={[]}
        />
      );

      expect(screen.getByText('Hunger Level')).toBeInTheDocument();
    });

    it('should handle single option', () => {
      const singleOption = [{ value: 'Low', label: 'Low' }];
      
      render(
        <RatingSelector
          id="hunger-rating"
          label="Hunger Level"
          options={singleOption}
        />
      );

      expect(screen.getByLabelText('Low')).toBeInTheDocument();
    });

    it('should handle options with special characters', () => {
      const specialOptions = [
        { value: 'Low Energy', label: 'Low Energy' },
        { value: 'Medium & High', label: 'Medium & High' },
      ];

      render(
        <RatingSelector
          id="energy-rating"
          label="Energy Level"
          options={specialOptions}
        />
      );

      expect(screen.getByLabelText('Low Energy')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium & High')).toBeInTheDocument();
    });
  });
});
