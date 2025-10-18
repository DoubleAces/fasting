import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '@/components/atoms/ErrorMessage';

describe('ErrorMessage Component', () => {
  describe('Rendering', () => {
    it('should render error message text', () => {
      render(<ErrorMessage id="error-1">This is an error message</ErrorMessage>);
      expect(screen.getByText('This is an error message')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<ErrorMessage id="error-1">Error</ErrorMessage>);
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ErrorMessage id="error-1" className="custom-error">
          Error
        </ErrorMessage>
      );
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toHaveClass('custom-error');
    });

    it('should have default error styling classes', () => {
      const { container } = render(<ErrorMessage id="error-1">Error</ErrorMessage>);
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toHaveClass('text-red-600', 'text-sm', 'mt-1');
    });
  });

  describe('ID Attribute', () => {
    it('should have required id attribute', () => {
      const { container } = render(<ErrorMessage id="error-123">Error</ErrorMessage>);
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toHaveAttribute('id', 'error-123');
    });

    it('should use id for aria-describedby association', () => {
      const { container } = render(
        <>
          <input aria-describedby="field-error" />
          <ErrorMessage id="field-error">Invalid input</ErrorMessage>
        </>
      );
      const input = container.querySelector('input');
      const errorDiv = container.querySelector('#field-error');
      expect(input).toHaveAttribute('aria-describedby', 'field-error');
      expect(errorDiv).toHaveAttribute('id', 'field-error');
    });
  });

  describe('Icon Support', () => {
    it('should render with icon when showIcon is true', () => {
      render(
        <ErrorMessage id="error-1" showIcon>
          Error message
        </ErrorMessage>
      );
      const icon = screen.getByLabelText('error icon');
      expect(icon).toBeInTheDocument();
    });

    it('should not render icon when showIcon is false', () => {
      render(
        <ErrorMessage id="error-1" showIcon={false}>
          Error message
        </ErrorMessage>
      );
      const icon = screen.queryByLabelText('error icon');
      expect(icon).not.toBeInTheDocument();
    });

    it('should not render icon by default', () => {
      render(<ErrorMessage id="error-1">Error message</ErrorMessage>);
      const icon = screen.queryByLabelText('error icon');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have role="alert" for screen readers', () => {
      const { container } = render(<ErrorMessage id="error-1">Error</ErrorMessage>);
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toHaveAttribute('role', 'alert');
    });

    it('should be announced by screen readers immediately', () => {
      const { container } = render(
        <ErrorMessage id="error-1">Critical error occurred</ErrorMessage>
      );
      const errorDiv = container.querySelector('div');
      expect(errorDiv).toHaveAttribute('role', 'alert');
      expect(errorDiv).toHaveAttribute('aria-live', 'polite');
    });

    it('should maintain readable contrast with red text', () => {
      const { container } = render(<ErrorMessage id="error-1">Error</ErrorMessage>);
      const errorDiv = container.querySelector('div');
      // text-red-600 meets WCAG AA contrast requirements
      expect(errorDiv).toHaveClass('text-red-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message gracefully', () => {
      const { container } = render(<ErrorMessage id="error-1"></ErrorMessage>);
      const errorDiv = container.querySelector('#error-1');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that should wrap properly on small screens and remain readable throughout the entire message without causing layout issues';
      render(<ErrorMessage id="error-1">{longMessage}</ErrorMessage>);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should support multiple error messages on same form', () => {
      const { container } = render(
        <>
          <ErrorMessage id="error-1">First error</ErrorMessage>
          <ErrorMessage id="error-2">Second error</ErrorMessage>
        </>
      );
      expect(container.querySelector('#error-1')).toBeInTheDocument();
      expect(container.querySelector('#error-2')).toBeInTheDocument();
      expect(screen.getByText('First error')).toBeInTheDocument();
      expect(screen.getByText('Second error')).toBeInTheDocument();
    });
  });
});
