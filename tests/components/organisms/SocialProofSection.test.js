import { render, screen } from '@testing-library/react';
import SocialProofSection from '@/components/organisms/SocialProofSection';

// Mock child components
jest.mock('@/components/molecules/TestimonialCard', () => {
  return function TestimonialCard({ testimonial }) {
    return (
      <div data-testid="testimonial-card">
        {testimonial.name} - {testimonial.quote}
      </div>
    );
  };
});

jest.mock('@/components/molecules/TrustBadge', () => {
  return function TrustBadge({ indicator }) {
    return (
      <div data-testid={`trust-badge-${indicator.type}`}>
        {indicator.value} {indicator.label}
      </div>
    );
  };
});

describe('SocialProofSection', () => {
  it('renders section heading', () => {
    render(<SocialProofSection />);
    expect(screen.getByText(/Trusted by thousands of fasters/i)).toBeInTheDocument();
  });

  it('displays trust indicators', () => {
    render(<SocialProofSection />);
    expect(screen.getByTestId('trust-badge-rating')).toBeInTheDocument();
    expect(screen.getByTestId('trust-badge-user-count')).toBeInTheDocument();
  });

  it('renders correct number of testimonials', () => {
    render(<SocialProofSection />);
    const testimonials = screen.getAllByTestId('testimonial-card');
    expect(testimonials).toHaveLength(6);
  });

  it('applies grid layout for testimonials', () => {
    const { container } = render(<SocialProofSection />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('applies responsive grid columns', () => {
    const { container } = render(<SocialProofSection />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-3');
  });

  it('applies custom className', () => {
    const { container } = render(<SocialProofSection className="custom-section" />);
    expect(container.firstChild.className).toContain('custom-section');
  });

  it('displays success rate trust indicator', () => {
    render(<SocialProofSection />);
    expect(screen.getByTestId('trust-badge-stat')).toBeInTheDocument();
  });

  it('renders trust indicators in a row layout', () => {
    const { container } = render(<SocialProofSection />);
    const trustBadgeContainer = container.querySelector('.flex');
    expect(trustBadgeContainer).toBeInTheDocument();
  });

  it('spaces testimonials with gap', () => {
    const { container } = render(<SocialProofSection />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('gap');
  });

  it('renders section with padding', () => {
    const { container } = render(<SocialProofSection />);
    const section = container.firstChild;
    expect(section.className).toContain('py-');
  });
});
