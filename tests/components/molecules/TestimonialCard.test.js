import { render, screen } from '@testing-library/react';
import TestimonialCard from '@/components/molecules/TestimonialCard';

// Mock StarRating component
jest.mock('@/components/atoms/StarRating', () => {
  return function StarRating({ rating }) {
    return <div data-testid="star-rating">{rating} stars</div>;
  };
});

describe('TestimonialCard', () => {
  const mockTestimonial = {
    name: 'Sarah Johnson',
    avatar: '/images/homepage/avatars/sarah.jpg',
    result: 'Lost 15 lbs in 8 weeks',
    quote: 'This app completely changed my approach to intermittent fasting. The simple tracking made it so easy to stay consistent.',
    rating: 5,
    date: 'March 2025',
  };

  const mockTestimonialNoAvatar = {
    name: 'John Doe',
    result: 'Lost 20 lbs',
    quote: 'Amazing app!',
    rating: 4,
  };

  it('renders testimonial quote', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    expect(screen.getByText(/This app completely changed my approach/i)).toBeInTheDocument();
  });

  it('renders testimonial name', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('renders star rating', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    const rating = screen.getByTestId('star-rating');
    expect(rating).toHaveTextContent('5 stars');
  });

  it('renders result badge', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    expect(screen.getByText('Lost 15 lbs in 8 weeks')).toBeInTheDocument();
  });

  it('renders avatar image when provided', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} />);
    const avatar = container.querySelector('img[alt*="Sarah Johnson"]');
    expect(avatar).toBeInTheDocument();
  });

  it('renders initials when no avatar provided', () => {
    render(<TestimonialCard testimonial={mockTestimonialNoAvatar} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders date when showDate is true', () => {
    render(<TestimonialCard testimonial={mockTestimonial} showDate={true} />);
    expect(screen.getByText('March 2025')).toBeInTheDocument();
  });

  it('does not render date when showDate is false', () => {
    render(<TestimonialCard testimonial={mockTestimonial} showDate={false} />);
    expect(screen.queryByText('March 2025')).not.toBeInTheDocument();
  });

  it('does not render date when date not provided', () => {
    render(<TestimonialCard testimonial={mockTestimonialNoAvatar} />);
    expect(screen.queryByText(/\d{4}/)).not.toBeInTheDocument();
  });

  it('applies default variant styling', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} />);
    const card = container.firstChild;
    expect(card.className).toContain('p-6');
  });

  it('applies compact variant styling', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} variant="compact" />);
    const card = container.firstChild;
    expect(card.className).toContain('p-4');
  });

  it('applies custom className', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} className="custom-card" />);
    expect(container.firstChild.className).toContain('custom-card');
  });

  it('wraps quote in quotation marks visually', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} />);
    const quote = screen.getByText(/This app completely changed my approach/i);
    expect(quote).toBeInTheDocument();
  });

  it('applies hover effect classes', () => {
    const { container } = render(<TestimonialCard testimonial={mockTestimonial} />);
    const card = container.firstChild;
    expect(card.className).toContain('hover:shadow-lg');
  });

  it('renders result as badge with distinctive styling', () => {
    render(<TestimonialCard testimonial={mockTestimonial} />);
    const result = screen.getByText('Lost 15 lbs in 8 weeks');
    expect(result.className).toContain('bg-');
  });

  it('correctly extracts initials from multi-word names', () => {
    const testimonial = { ...mockTestimonialNoAvatar, name: 'Mary Jane Watson' };
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByText('MJ')).toBeInTheDocument();
  });

  it('handles single-word names for initials', () => {
    const testimonial = { ...mockTestimonialNoAvatar, name: 'Madonna' };
    render(<TestimonialCard testimonial={testimonial} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});
