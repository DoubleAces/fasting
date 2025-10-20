import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  describe('Rendering', () => {
    it('should render spinner element', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('svg');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with default aria-label', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByLabelText('Loading');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply custom aria-label', () => {
      render(<LoadingSpinner label="Loading data..." />);
      const spinner = screen.getByLabelText('Loading data...');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-spinner" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-spinner');
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-4', 'h-4');
    });

    it('should render medium size by default', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-8', 'h-8');
    });

    it('should render large size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Color Variants', () => {
    it('should render with blue color by default', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-blue-600');
    });

    it('should render with white color', () => {
      const { container } = render(<LoadingSpinner color="white" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-white');
    });

    it('should render with gray color', () => {
      const { container } = render(<LoadingSpinner color="gray" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-gray-600');
    });
  });

  describe('Animation', () => {
    it('should have animation class', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('animate-spin');
    });
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should have role="status" for screen readers', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveAttribute('role', 'status');
    });

    it('should be announced by screen readers', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveAttribute('aria-live', 'polite');
    });

    it('should have descriptive aria-label', () => {
      render(<LoadingSpinner label="Saving your data" />);
      expect(screen.getByLabelText('Saving your data')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle combination of size and color', () => {
      const { container } = render(<LoadingSpinner size="lg" color="white" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('w-12', 'h-12', 'text-white');
    });

    it('should handle invalid size gracefully', () => {
      const { container } = render(<LoadingSpinner size="invalid" />);
      const wrapper = container.firstChild;
      // Should default to medium size
      expect(wrapper).toHaveClass('w-8', 'h-8');
    });

    it('should handle invalid color gracefully', () => {
      const { container } = render(<LoadingSpinner color="invalid" />);
      const wrapper = container.firstChild;
      // Should default to blue
      expect(wrapper).toHaveClass('text-blue-600');
    });
  });

  describe('Usage Context', () => {
    it('should work inside button', () => {
      const { container } = render(
        <button>
          <LoadingSpinner size="sm" color="white" />
          <span>Loading...</span>
        </button>
      );
      expect(container.querySelector('button svg')).toBeInTheDocument();
    });

    it('should work as full-page loader', () => {
      const { container } = render(
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
