import { render, screen } from '@testing-library/react';
import FinalCTASection from '@/components/organisms/FinalCTASection';
import { useSession } from 'next-auth/react';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock GradientButton
jest.mock('@/components/atoms/GradientButton', () => {
  return function GradientButton({ children, href, onClick, className }) {
    return (
      <a href={href} onClick={onClick} className={className} data-testid="gradient-button">
        {children}
      </a>
    );
  };
});

describe('FinalCTASection', () => {
  beforeEach(() => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('renders main heading', () => {
    render(<FinalCTASection />);
    expect(screen.getByText(/Ready to Build Your Fasting Habit/i)).toBeInTheDocument();
  });

  it('renders compelling subheading', () => {
    render(<FinalCTASection />);
    expect(screen.getByText(/Join thousands of users/i)).toBeInTheDocument();
  });

  it('renders primary CTA for unauthenticated users', () => {
    render(<FinalCTASection />);
    const primaryCTA = screen.getByText(/Start Tracking Free/i);
    expect(primaryCTA).toBeInTheDocument();
  });

  it('renders dashboard CTA for authenticated users', () => {
    useSession.mockReturnValue({ data: { user: { email: 'test@example.com' } }, status: 'authenticated' });
    render(<FinalCTASection />);
    const dashboardCTA = screen.getByText(/Go to Dashboard/i);
    expect(dashboardCTA).toBeInTheDocument();
  });

  it('renders secondary learn more CTA', () => {
    render(<FinalCTASection />);
    const secondaryCTA = screen.getByText(/Learn About Intermittent Fasting/i);
    expect(secondaryCTA).toBeInTheDocument();
  });

  it('applies gradient background', () => {
    const { container } = render(<FinalCTASection />);
    expect(container.firstChild.className).toContain('bg-gradient-to');
  });

  it('applies proper padding', () => {
    const { container } = render(<FinalCTASection />);
    expect(container.firstChild.className).toContain('py-20');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<FinalCTASection className="test-class" />);
    expect(container.firstChild.className).toContain('test-class');
  });

  it('centers content', () => {
    const { container } = render(<FinalCTASection />);
    const textContainer = container.querySelector('.text-center');
    expect(textContainer).toBeInTheDocument();
  });

  it('renders both CTAs in flex layout', () => {
    const { container } = render(<FinalCTASection />);
    const ctaContainer = container.querySelector('[class*="flex"]');
    expect(ctaContainer).toBeInTheDocument();
  });
});
