import { render, screen } from '@testing-library/react';
import FeatureCard from '@/components/molecules/FeatureCard';

// Mock GlassmorphicCard
jest.mock('@/components/atoms/GlassmorphicCard', () => {
  return function GlassmorphicCard({ children, className }) {
    return <div className={className}>{children}</div>;
  };
});

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('FeatureCard', () => {
  const mockFeature = {
    title: 'Log in 30 Seconds',
    description: 'Quick entry form captures all your data in one tap. No endless scrolling or complicated menus.',
    icon: '⚡',
    screenshot: '/images/homepage/features/quick-logging.png',
    benefit: 'Save 5 minutes per day',
  };

  const mockFeatureNoScreenshot = {
    title: 'Forever Free',
    description: 'Core features always free. Optional premium for power users.',
    icon: '🎁',
    benefit: 'Save $60/year vs competitors',
  };

  it('renders feature title', () => {
    render(<FeatureCard feature={mockFeature} />);
    expect(screen.getByText('Log in 30 Seconds')).toBeInTheDocument();
  });

  it('renders feature description', () => {
    render(<FeatureCard feature={mockFeature} />);
    expect(screen.getByText(/Quick entry form captures all your data/i)).toBeInTheDocument();
  });

  it('renders feature icon', () => {
    const { container } = render(<FeatureCard feature={mockFeature} />);
    expect(container.textContent).toContain('⚡');
  });

  it('renders benefit text', () => {
    render(<FeatureCard feature={mockFeature} />);
    expect(screen.getByText(/Save 5 minutes per day/i)).toBeInTheDocument();
  });

  it('renders screenshot when provided and showScreenshot is true', () => {
    const { container } = render(<FeatureCard feature={mockFeature} showScreenshot={true} />);
    const screenshot = container.querySelector('img[src*="quick-logging"]');
    expect(screenshot).toBeInTheDocument();
  });

  it('does not render screenshot when showScreenshot is false', () => {
    const { container } = render(<FeatureCard feature={mockFeature} showScreenshot={false} />);
    const screenshot = container.querySelector('img[src*="quick-logging"]');
    expect(screenshot).not.toBeInTheDocument();
  });

  it('does not render screenshot when not provided', () => {
    const { container } = render(<FeatureCard feature={mockFeatureNoScreenshot} />);
    const screenshot = container.querySelector('img');
    expect(screenshot).not.toBeInTheDocument();
  });

  it('applies interactive hover effect by default', () => {
    const { container } = render(<FeatureCard feature={mockFeature} />);
    const card = container.firstChild;
    expect(card.className).toContain('hover:');
  });

  it('applies interactive hover effect when interactive is true', () => {
    const { container } = render(<FeatureCard feature={mockFeature} interactive={true} />);
    const card = container.firstChild;
    expect(card.className).toContain('hover:');
  });

  it('does not apply hover effect when interactive is false', () => {
    const { container } = render(<FeatureCard feature={mockFeature} interactive={false} />);
    const card = container.firstChild;
    expect(card.className).not.toContain('hover:scale');
  });

  it('applies custom className', () => {
    const { container } = render(<FeatureCard feature={mockFeature} className="custom-feature" />);
    expect(container.firstChild.className).toContain('custom-feature');
  });

  it('renders benefit with distinctive styling', () => {
    render(<FeatureCard feature={mockFeature} />);
    const benefit = screen.getByText(/Save 5 minutes per day/i);
    expect(benefit.className).toContain('text-purple');
  });

  it('renders icon with large size', () => {
    const { container } = render(<FeatureCard feature={mockFeature} />);
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain('text-4xl');
  });

  it('renders title with bold styling', () => {
    render(<FeatureCard feature={mockFeature} />);
    const title = screen.getByText('Log in 30 Seconds');
    expect(title.className).toContain('font-bold');
  });
});
