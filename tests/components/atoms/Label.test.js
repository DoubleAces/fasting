import React from 'react';
import { render, screen } from '@testing-library/react';
import Label from '@/components/atoms/Label';

describe('Label Component', () => {
  describe('Rendering', () => {
    it('should render label element', () => {
      render(<Label htmlFor="test-input">Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
    });

    it('should render children content', () => {
      render(
        <Label htmlFor="test-input">
          <span>Complex Content</span>
        </Label>
      );
      expect(screen.getByText('Complex Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Label htmlFor="test-input" className="custom-class">
          Test Label
        </Label>
      );
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('custom-class');
    });

    it('should have default styling classes', () => {
      render(<Label htmlFor="test-input">Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('block', 'text-sm', 'font-medium');
    });
  });

  describe('htmlFor Attribute', () => {
    it('should link to input with htmlFor attribute', () => {
      render(<Label htmlFor="email-input">Email Address</Label>);
      const label = screen.getByText('Email Address');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should work without htmlFor attribute', () => {
      render(<Label>Standalone Label</Label>);
      const label = screen.getByText('Standalone Label');
      expect(label).not.toHaveAttribute('for');
    });
  });

  describe('Required Indicator', () => {
    it('should show required indicator when required is true', () => {
      render(
        <Label htmlFor="test-input" required>
          Required Field
        </Label>
      );
      const label = screen.getByText(/Required Field/);
      expect(label).toHaveTextContent('*');
    });

    it('should not show required indicator when required is false', () => {
      render(
        <Label htmlFor="test-input" required={false}>
          Optional Field
        </Label>
      );
      const label = screen.getByText('Optional Field');
      expect(label.textContent).not.toContain('*');
    });

    it('should style required indicator in red', () => {
      render(
        <Label htmlFor="test-input" required>
          Required Field
        </Label>
      );
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveClass('text-red-500');
    });
  });

  describe('Error State', () => {
    it('should apply error styling when error prop is true', () => {
      render(
        <Label htmlFor="test-input" error>
          Error Label
        </Label>
      );
      const label = screen.getByText('Error Label');
      expect(label).toHaveClass('text-red-600');
    });

    it('should not have error styling when error prop is false', () => {
      render(
        <Label htmlFor="test-input" error={false}>
          Normal Label
        </Label>
      );
      const label = screen.getByText('Normal Label');
      expect(label).not.toHaveClass('text-red-600');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should be properly associated with input via htmlFor', () => {
      const { container } = render(
        <>
          <Label htmlFor="accessible-input">Accessible Label</Label>
          <input id="accessible-input" type="text" />
        </>
      );
      const label = screen.getByText('Accessible Label');
      const input = container.querySelector('#accessible-input');
      expect(label).toHaveAttribute('for', 'accessible-input');
      expect(input).toHaveAttribute('id', 'accessible-input');
    });

    it('should maintain readable contrast ratio', () => {
      render(<Label htmlFor="test-input">High Contrast Label</Label>);
      const label = screen.getByText('High Contrast Label');
      // text-gray-700 meets WCAG AA contrast requirements
      expect(label).toHaveClass('text-gray-700');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Label htmlFor="test-input"></Label>);
      const label = document.querySelector('label[for="test-input"]');
      expect(label).toBeInTheDocument();
    });

    it('should handle long label text', () => {
      const longText = 'This is a very long label text that should wrap properly on small screens and maintain good readability';
      render(<Label htmlFor="test-input">{longText}</Label>);
      const label = screen.getByText(longText);
      expect(label).toBeInTheDocument();
    });

    it('should support combining required and error states', () => {
      render(
        <Label htmlFor="test-input" required error>
          Field Label
        </Label>
      );
      const label = screen.getByText(/Field Label/);
      expect(label).toHaveClass('text-red-600');
      expect(label).toHaveTextContent('*');
    });
  });
});
