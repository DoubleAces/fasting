import { render, screen } from '@testing-library/react';
import StarRating from '@/components/atoms/StarRating';

describe('StarRating', () => {
  it('renders correct number of filled stars', () => {
    const { container } = render(<StarRating rating={4} />);
    const filledStars = container.querySelectorAll('.star-filled');
    expect(filledStars).toHaveLength(4);
  });

  it('renders half star for decimal ratings', () => {
    const { container } = render(<StarRating rating={4.5} />);
    const filledStars = container.querySelectorAll('.star-filled');
    const halfStar = container.querySelector('.star-half');
    
    expect(filledStars).toHaveLength(4);
    expect(halfStar).toBeInTheDocument();
  });

  it('renders correct number of empty stars', () => {
    const { container } = render(<StarRating rating={3} />);
    const emptyStars = container.querySelectorAll('.star-empty');
    expect(emptyStars).toHaveLength(2);
  });

  it('shows numeric value when showValue is true', () => {
    render(<StarRating rating={4.8} showValue />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('does not show numeric value by default', () => {
    const { container } = render(<StarRating rating={4.8} />);
    expect(container.textContent).not.toContain('4.8');
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(<StarRating rating={5} size="sm" />);
    let stars = container.querySelectorAll('.star');
    stars.forEach(star => {
      expect(star).toHaveClass('w-4', 'h-4');
    });
    
    rerender(<StarRating rating={5} size="md" />);
    stars = container.querySelectorAll('.star');
    stars.forEach(star => {
      expect(star).toHaveClass('w-5', 'h-5');
    });
    
    rerender(<StarRating rating={5} size="lg" />);
    stars = container.querySelectorAll('.star');
    stars.forEach(star => {
      expect(star).toHaveClass('w-6', 'h-6');
    });
  });

  it('applies correct color to filled stars', () => {
    const { container } = render(<StarRating rating={3} color="text-yellow-400" />);
    const filledStars = container.querySelectorAll('.star-filled');
    filledStars.forEach(star => {
      expect(star).toHaveClass('text-yellow-400');
    });
  });

  it('applies correct color to empty stars', () => {
    const { container } = render(<StarRating rating={3} emptyColor="text-gray-300" />);
    const emptyStars = container.querySelectorAll('.star-empty');
    emptyStars.forEach(star => {
      expect(star).toHaveClass('text-gray-300');
    });
  });

  it('has proper ARIA label for screen readers', () => {
    render(<StarRating rating={4.8} />);
    const ratingElement = screen.getByRole('img', { name: /4\.8 out of 5 stars/i });
    expect(ratingElement).toBeInTheDocument();
  });

  it('uses custom aria label when provided', () => {
    render(<StarRating rating={4.8} ariaLabel="Excellent rating" />);
    const ratingElement = screen.getByRole('img', { name: /excellent rating/i });
    expect(ratingElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<StarRating rating={5} className="custom-rating" />);
    expect(container.firstChild).toHaveClass('custom-rating');
  });

  it('respects maxRating prop', () => {
    const { container } = render(<StarRating rating={8} maxRating={10} />);
    const allStars = container.querySelectorAll('.star');
    expect(allStars).toHaveLength(10);
  });

  it('handles zero rating correctly', () => {
    const { container } = render(<StarRating rating={0} />);
    const emptyStars = container.querySelectorAll('.star-empty');
    expect(emptyStars).toHaveLength(5);
  });

  it('handles maximum rating correctly', () => {
    const { container } = render(<StarRating rating={5} />);
    const filledStars = container.querySelectorAll('.star-filled');
    expect(filledStars).toHaveLength(5);
  });

  it('renders half star only when decimal >= 0.5', () => {
    const { container: container1 } = render(<StarRating rating={4.3} />);
    expect(container1.querySelector('.star-half')).not.toBeInTheDocument();
    
    const { container: container2 } = render(<StarRating rating={4.5} />);
    expect(container2.querySelector('.star-half')).toBeInTheDocument();
    
    const { container: container3 } = render(<StarRating rating={4.7} />);
    expect(container3.querySelector('.star-half')).toBeInTheDocument();
  });
});
