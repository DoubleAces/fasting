/**
 * SkeletonCard Component Tests
 * 
 * Tests for glassmorphic skeleton loading card
 */

import { render, screen } from '@testing-library/react';
import SkeletonCard from '@/components/molecules/SkeletonCard';

describe('SkeletonCard', () => {
  it('should render skeleton with default props', () => {
    render(<SkeletonCard />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });

  it('should apply default height class', () => {
    render(<SkeletonCard />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-32');
  });

  it('should apply custom height class', () => {
    render(<SkeletonCard height="h-64" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-64');
    expect(skeleton).not.toHaveClass('h-32');
  });

  it('should apply custom className', () => {
    render(<SkeletonCard className="custom-class" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have glassmorphic styling', () => {
    render(<SkeletonCard />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('backdrop-blur-xl');
    expect(skeleton).toHaveClass('bg-white/80');
    expect(skeleton).toHaveClass('border-white/50');
  });

  it('should have rounded corners', () => {
    render(<SkeletonCard />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('rounded-2xl');
  });

  it('should have shadow', () => {
    render(<SkeletonCard />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('shadow-lg');
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<SkeletonCard />);
    
    const pulsingElement = container.querySelector('.animate-pulse');
    expect(pulsingElement).toBeInTheDocument();
  });

  it('should have shimmer animation', () => {
    const { container } = render(<SkeletonCard />);
    
    const shimmerElement = container.querySelector('.animate-\\[shimmer_2s_infinite\\]');
    expect(shimmerElement).toBeInTheDocument();
  });

  it('should have gradient placeholder content', () => {
    const { container } = render(<SkeletonCard />);
    
    const gradients = container.querySelectorAll('.bg-gradient-to-r');
    expect(gradients.length).toBeGreaterThan(0);
  });

  it('should combine custom height and className', () => {
    render(<SkeletonCard height="h-48" className="mb-4" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-48');
    expect(skeleton).toHaveClass('mb-4');
    expect(skeleton).toHaveClass('backdrop-blur-xl'); // Still has base styles
  });
});
