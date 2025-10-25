/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/atoms/Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders badge with text', () => {
      render(<Badge variant="best-day">Best Day</Badge>);
      
      expect(screen.getByText('Best Day')).toBeInTheDocument();
    });

    it('renders badge with icon and text', () => {
      render(
        <Badge variant="longest-fast" icon="🏆">
          Longest Fast This Month
        </Badge>
      );
      
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('Longest Fast This Month')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies best-day variant styles', () => {
      const { container } = render(<Badge variant="best-day">Best Day</Badge>);
      
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-100');
    });

    it('applies longest-fast variant styles', () => {
      const { container } = render(<Badge variant="longest-fast">Longest</Badge>);
      
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-blue-100');
    });

    it('applies default variant when no variant specified', () => {
      const { container } = render(<Badge>Default</Badge>);
      
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-gray-100');
    });
  });

  describe('Null State', () => {
    it('does not render when children is null', () => {
      const { container } = render(<Badge variant="best-day">{null}</Badge>);
      
      expect(container.firstChild).toBeNull();
    });

    it('does not render when children is empty string', () => {
      const { container } = render(<Badge variant="best-day">{''}</Badge>);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate role', () => {
      render(<Badge variant="best-day">Best Day</Badge>);
      
      const badge = screen.getByText('Best Day').closest('span');
      expect(badge).toHaveAttribute('role', 'status');
    });
  });
});
