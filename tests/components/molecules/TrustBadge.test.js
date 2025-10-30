import { render, screen } from '@testing-library/react';
import TrustBadge from '@/components/molecules/TrustBadge';

describe('TrustBadge', () => {
  const ratingIndicator = {
    type: 'rating',
    value: 4.8,
    label: 'stars',
    icon: '⭐',
    subtext: '(240 reviews)',
  };

  const userCountIndicator = {
    type: 'user-count',
    value: '10,000+',
    label: 'active fasters',
    icon: '🔥',
  };

  it('renders indicator data correctly', () => {
    render(<TrustBadge indicator={ratingIndicator} />);
    
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('stars')).toBeInTheDocument();
    expect(screen.getByText('(240 reviews)')).toBeInTheDocument();
  });

  it('displays icon if provided', () => {
    const { container } = render(<TrustBadge indicator={ratingIndicator} />);
    expect(container.textContent).toContain('⭐');
  });

  it('renders without icon when not provided', () => {
    const indicatorNoIcon = { ...ratingIndicator, icon: undefined };
    const { container } = render(<TrustBadge indicator={indicatorNoIcon} />);
    expect(container.textContent).not.toContain('⭐');
  });

  it('uses inline variant by default', () => {
    const { container } = render(<TrustBadge indicator={ratingIndicator} />);
    const badge = container.firstChild;
    expect(badge.className).toContain('flex-row');
  });

  it('applies inline variant with horizontal layout', () => {
    const { container } = render(<TrustBadge indicator={ratingIndicator} variant="inline" />);
    const badge = container.firstChild;
    expect(badge.className).toContain('flex-row');
    expect(badge.className).toContain('items-center');
  });

  it('applies card variant with vertical layout', () => {
    const { container } = render(<TrustBadge indicator={ratingIndicator} variant="card" />);
    const badge = container.firstChild;
    expect(badge.className).toContain('flex-col');
    expect(badge.className).toContain('text-center');
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(<TrustBadge indicator={ratingIndicator} size="sm" />);
    let badge = container.firstChild;
    expect(badge.className).toContain('text-sm');

    rerender(<TrustBadge indicator={ratingIndicator} size="md" />);
    badge = container.firstChild;
    expect(badge.className).toContain('text-base');

    rerender(<TrustBadge indicator={ratingIndicator} size="lg" />);
    badge = container.firstChild;
    expect(badge.className).toContain('text-lg');
  });

  it('renders subtext when provided', () => {
    render(<TrustBadge indicator={ratingIndicator} />);
    expect(screen.getByText('(240 reviews)')).toBeInTheDocument();
  });

  it('does not render subtext when not provided', () => {
    render(<TrustBadge indicator={userCountIndicator} />);
    expect(screen.queryByText(/reviews/i)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<TrustBadge indicator={ratingIndicator} className="custom-badge" />);
    expect(container.firstChild.className).toContain('custom-badge');
  });

  it('renders value prominently', () => {
    render(<TrustBadge indicator={userCountIndicator} />);
    const value = screen.getByText('10,000+');
    expect(value.className).toContain('font-bold');
  });

  it('renders label in muted color', () => {
    render(<TrustBadge indicator={ratingIndicator} />);
    const label = screen.getByText('stars');
    expect(label.className).toContain('text-gray');
  });

  it('handles string values', () => {
    render(<TrustBadge indicator={userCountIndicator} />);
    expect(screen.getByText('10,000+')).toBeInTheDocument();
  });

  it('handles numeric values', () => {
    render(<TrustBadge indicator={ratingIndicator} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });
});
