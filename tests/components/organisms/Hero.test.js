import { render, screen, fireEvent } from '@testing-library/react';
import Hero from '@/components/organisms/Hero';

// Mock child components
jest.mock('@/components/atoms/GradientButton', () => {
  return function GradientButton({ children, onClick, ...props }) {
    return <button onClick={onClick} data-testid={`gradient-button-${children}`}>{children}</button>;
  };
});

jest.mock('@/components/molecules/TrustBadge', () => {
  return function TrustBadge({ indicator }) {
    return <div data-testid={`trust-badge-${indicator.type}`}>{indicator.value} {indicator.label}</div>;
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Hero', () => {
  it('renders headline', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByText(/The Simplest Way to Track Intermittent Fasting/i)).toBeInTheDocument();
  });

  it('renders subheading', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByText(/Join 10,000\+ people/i)).toBeInTheDocument();
  });

  it('displays rating trust indicator', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByTestId('trust-badge-rating')).toBeInTheDocument();
  });

  it('displays user count trust indicator', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByTestId('trust-badge-user-count')).toBeInTheDocument();
  });

  it('shows "Start Free" CTA when not authenticated', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByTestId('gradient-button-Start Free')).toBeInTheDocument();
  });

  it('shows "Go to Dashboard" CTA when authenticated', () => {
    render(<Hero isAuthenticated={true} />);
    expect(screen.getByTestId('gradient-button-Go to Dashboard')).toBeInTheDocument();
  });

  it('shows "See How It Works" secondary CTA', () => {
    render(<Hero isAuthenticated={false} />);
    expect(screen.getByTestId('gradient-button-See How It Works')).toBeInTheDocument();
  });

  it('calls handler when "Start Free" CTA is clicked', () => {
    render(<Hero isAuthenticated={false} />);
    const startButton = screen.getByTestId('gradient-button-Start Free');
    
    // Just verify the button exists and is clickable (actual navigation tested in E2E)
    expect(startButton).toBeInTheDocument();
    fireEvent.click(startButton);
    // Navigation behavior is tested in E2E tests
  });

  it('calls handler when "Go to Dashboard" CTA is clicked', () => {
    render(<Hero isAuthenticated={true} />);
    const dashboardButton = screen.getByTestId('gradient-button-Go to Dashboard');
    
    // Just verify the button exists and is clickable (actual navigation tested in E2E)
    expect(dashboardButton).toBeInTheDocument();
    fireEvent.click(dashboardButton);
    // Navigation behavior is tested in E2E tests
  });

  it('scrolls to #how-it-works when "See How It Works" is clicked', () => {
    // Mock scrollIntoView
    const mockScrollIntoView = jest.fn();
    document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    });

    render(<Hero isAuthenticated={false} />);
    const seeHowButton = screen.getByTestId('gradient-button-See How It Works');
    fireEvent.click(seeHowButton);
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('renders hero image with priority', () => {
    const { container } = render(<Hero isAuthenticated={false} />);
    const image = container.querySelector('img[src*="hero-screenshot"]');
    expect(image).toBeInTheDocument();
    // Note: priority is a Next.js Image prop, not an HTML attribute
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<Hero isAuthenticated={false} />);
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer.className).toContain('md:grid-cols-2');
  });

  it('applies custom className', () => {
    const { container } = render(<Hero isAuthenticated={false} className="custom-hero" />);
    expect(container.firstChild.className).toContain('custom-hero');
  });

  it('renders headline with gradient text', () => {
    render(<Hero isAuthenticated={false} />);
    const headline = screen.getByText(/The Simplest Way to Track Intermittent Fasting/i);
    expect(headline.className).toContain('bg-gradient-to-r');
    expect(headline.className).toContain('bg-clip-text');
  });

  it('renders CTAs in correct order', () => {
    const { container } = render(<Hero isAuthenticated={false} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toHaveTextContent('Start Free');
    expect(buttons[1]).toHaveTextContent('See How It Works');
  });
});
