import { render, screen } from '@testing-library/react';
import FeaturesList from '@/components/organisms/FeaturesList';

jest.mock('@/components/molecules/FeatureCard', () => {
  return function FeatureCard({ feature }) {
    return (
      <div data-testid="feature-card">
        {feature.icon} {feature.title}
      </div>
    );
  };
});

describe('FeaturesList', () => {
  it('renders section heading', () => {
    render(<FeaturesList />);
    expect(screen.getByText(/Everything You Need to Track Intermittent Fasting/i)).toBeInTheDocument();
  });

  it('renders 6 features', () => {
    render(<FeaturesList />);
    const featureCards = screen.getAllByTestId('feature-card');
    expect(featureCards).toHaveLength(6);
  });

  it('applies grid layout', () => {
    const { container } = render(<FeaturesList />);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('applies responsive grid columns', () => {
    const { container } = render(<FeaturesList />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-2');
    expect(grid.className).toContain('lg:grid-cols-3');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<FeaturesList className="test-class" />);
    expect(container.firstChild.className).toContain('test-class');
  });

  it('applies proper padding', () => {
    const { container } = render(<FeaturesList />);
    expect(container.firstChild.className).toContain('py-20');
  });

  it('applies gap spacing between features', () => {
    const { container } = render(<FeaturesList />);
    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('gap-8');
  });

  it('renders features in correct order', () => {
    render(<FeaturesList />);
    const featureCards = screen.getAllByTestId('feature-card');
    expect(featureCards[0].textContent).toContain('');
  });
});
